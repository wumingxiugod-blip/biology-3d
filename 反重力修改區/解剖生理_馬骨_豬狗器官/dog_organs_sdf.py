"""
犬內臟器官 3D 模型 (SDF 雕塑 + Surface Nets 網格化)

座標系 (單位 cm，約 25 kg 中型犬)：
  +x = 頭側 (cranial)   -x = 尾側 (caudal)
  +y = 背側 (dorsal)    -y = 腹側 (ventral)
  +z = 左側 (left)      -z = 右側 (right)

每個器官都寫成一個帶符號距離函數 (signed distance field)，器官之間互相
挖出壓跡 (例如肝臟的胃壓跡、右腎窩、膽囊窩)，再用 surface nets 轉成平滑網格，
並以 SDF 梯度輸出頂點法線。只依賴 numpy。
"""
import math
import numpy as np


# =============================================================
# 基本向量工具
# =============================================================
def v3(*a):
    return np.array(a, dtype=float)


def normalize(v):
    v = np.asarray(v, dtype=float)
    return v / np.linalg.norm(v)


def frame(x_dir, up=(0.0, 1.0, 0.0)):
    """回傳 3x3 矩陣，欄向量 = 局部 x / y / z 軸 (x 對齊 x_dir)。"""
    x = normalize(x_dir)
    z = np.cross(x, up)
    if np.linalg.norm(z) < 1e-6:
        z = np.cross(x, (1.0, 0.0, 0.0))
    z = normalize(z)
    y = np.cross(z, x)
    return np.stack([x, y, z], axis=1)


def _len(a):
    return np.sqrt(np.einsum('...i,...i->...', a, a))


# =============================================================
# SDF 運算子
# =============================================================
def smin(a, b, k=0.0):
    if k <= 0:
        return np.minimum(a, b)
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1 - h) + a * h - k * h * (1 - h)


def smax(a, b, k=0.0):
    return -smin(-a, -b, k)


def union(*ds, k=0.0):
    d = ds[0]
    for e in ds[1:]:
        d = smin(d, e, k)
    return d


def carve(d, cut, k=0.0):
    """從 d 挖掉 cut。"""
    return smax(d, -cut, k)


def ellipsoid(p, c, r, axes=None):
    q = p - c
    if axes is not None:
        q = q @ axes
    q = q / r
    k0 = _len(q)
    k1 = _len(q / r)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)


def sphere(p, c, r):
    return _len(p - c) - r


def plane_slab(p, p0, n, half_w):
    return np.abs((p - p0) @ normalize(n)) - half_w


# =============================================================
# 掃掠管 (Catmull-Rom 中心線 + 可變橢圓截面)
# =============================================================
def catmull_rom(ctrl, step):
    P = np.asarray(ctrl, dtype=float)
    P = np.vstack([2 * P[0] - P[1], P, 2 * P[-1] - P[-2]])
    pts, us = [], []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        n = max(2, int(math.ceil(np.linalg.norm(p2 - p1) / step)))
        for j in range(n):
            t = j / n
            t2, t3 = t * t, t * t * t
            pts.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
                              + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
            us.append(i - 1 + t)
    pts.append(P[-2])
    us.append(len(ctrl) - 1)
    return np.array(pts), np.array(us)


class Sweep:
    """沿平滑曲線掃掠的管/帶。ra = 寬向半徑，rb = 法向 (normal) 半徑。"""
    BAND = 3.0      # 超過此距離的點只需要正確符號
    CELL = 3.0

    def __init__(self, ctrl, ra, rb=None, normal=None, step=0.35, ring=None):
        pts, us = catmull_rom(ctrl, step)
        idx = np.arange(len(ctrl), dtype=float)

        def interp(r):
            if np.isscalar(r):
                return np.full(len(pts), float(r))
            return np.interp(us, idx, np.asarray(r, dtype=float))

        ra_ = interp(ra)
        rb_ = ra_.copy() if rb is None else interp(rb)
        if ring is not None:  # 軟骨環等沿弧長的半徑調變
            seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
            s = np.concatenate([[0.0], np.cumsum(seg)])
            m = ring(s)
            ra_, rb_ = ra_ * m, rb_ * m

        a, b = pts[:-1], pts[1:]
        ab = b - a
        L = np.maximum(np.linalg.norm(ab, axis=1), 1e-9)
        T = ab / L[:, None]
        if normal is None:
            N = np.cross(T, (0.0, 1.0, 0.0))
            bad = np.linalg.norm(N, axis=1) < 1e-3
            N[bad] = np.cross(T[bad], (1.0, 0.0, 0.0))
        else:
            mid = 0.5 * (a + b)
            N = np.asarray(normal(mid), dtype=float)
            if N.ndim == 1:
                N = np.tile(N, (len(mid), 1))
        N = N - (N * T).sum(1)[:, None] * T
        N /= np.maximum(np.linalg.norm(N, axis=1), 1e-9)[:, None]
        W = np.cross(T, N)

        self.a, self.ab, self.L2 = a, ab, L * L
        self.T, self.N, self.W = T, N, W
        self.ra0, self.ra1 = ra_[:-1], ra_[1:]
        self.rb0, self.rb1 = rb_[:-1], rb_[1:]
        self.mid = 0.5 * (a + b)
        self.reach = 0.5 * L + np.maximum(np.maximum(self.ra0, self.ra1), np.maximum(self.rb0, self.rb1))
        self.pts = pts

    def _eval(self, p, sel):
        a = self.a[sel]
        ab = self.ab[sel]
        ap = p[:, None, :] - a[None]
        t = np.clip((ap * ab[None]).sum(-1) / self.L2[sel][None], 0.0, 1.0)
        off = ap - t[..., None] * ab[None]
        w = (off * self.W[sel][None]).sum(-1)
        n = (off * self.N[sel][None]).sum(-1)
        s = (off * self.T[sel][None]).sum(-1)
        A = self.ra0[sel][None] + t * (self.ra1[sel] - self.ra0[sel])[None]
        B = self.rb0[sel][None] + t * (self.rb1[sel] - self.rb0[sel])[None]
        m = np.minimum(A, B)
        q = np.sqrt((w / A) ** 2 + (n / B) ** 2 + (s / m) ** 2)
        return ((q - 1.0) * m).min(axis=1)

    def __call__(self, p):
        out = np.full(len(p), self.BAND)
        rmax = self.reach.max()
        near = np.nonzero(((p > self.pts.min(0) - rmax - self.BAND)
                           & (p < self.pts.max(0) + rmax + self.BAND)).all(1))[0]
        if len(near) == 0:
            return out
        k = np.floor(p[near] / self.CELL).astype(np.int64) + 1024
        key = (k[:, 0] * 2048 + k[:, 1]) * 2048 + k[:, 2]
        order = np.argsort(key, kind='stable')
        ks = key[order]
        starts = np.concatenate([[0], np.flatnonzero(np.diff(ks)) + 1, [len(ks)]])
        rc = self.CELL * 0.5 * math.sqrt(3.0)
        for s, e in zip(starts[:-1], starts[1:]):
            ids = near[order[s:e]]
            cc = (k[order[s]] - 1024 + 0.5) * self.CELL
            sel = np.nonzero(_len(self.mid - cc) < self.reach + rc + self.BAND)[0]
            if len(sel) == 0:
                continue
            pp = p[ids]
            for s0 in range(0, len(sel), 64):
                d = self._eval(pp, sel[s0:s0 + 64])
                out[ids] = np.minimum(out[ids], d)
        return out


# =============================================================
# 共用解剖邊界：橫膈、胸腔、腹腔
# =============================================================
def diaph_x(y, z):
    """橫膈膜頭側凸頂的 x 位置 (頂點約在第 7 肋間腹中線)。"""
    return 6.0 - 0.022 * (y + 16.0) ** 2 - 0.05 * z ** 2 - 0.6 * np.maximum(0.0, y + 12.0)


def thorax(p):
    x, y, z = p.T
    u = np.clip((x - 5.0) / 23.0, 0.0, None)
    s = np.sqrt(np.clip(1.0 - u ** 2, 0.05, 1.0))
    yc = -11.0 + 4.5 * np.clip((x - 8.0) / 19.5, 0.0, 1.0) ** 2
    hy, hz = 13.0 * s, 10.5 * s
    e = (np.sqrt(((y - yc) / hy) ** 2 + (z / hz) ** 2) - 1.0) * np.minimum(hy, hz)
    return np.maximum.reduce([e, diaph_x(y, z) + 0.35 - x, x - 28.0])


def spine_block(p):
    x, y, z = p.T
    return np.maximum(np.abs(z) - 2.4, -(y + 0.6))


# =============================================================
# 1. 腦
# =============================================================
_BRAIN_AX = frame((1.0, -0.12, 0.0))
_BRAINSTEM = Sweep([(54.0, 6.3, 0.0), (51.6, 5.7, 0.0), (49.0, 5.2, 0.0), (46.4, 4.6, 0.0)],
                   ra=[1.05, 1.1, 0.85, 0.6], rb=[0.8, 0.9, 0.75, 0.55], step=0.25)


def dog_brain(p):
    x, y, z = p.T
    hl = ellipsoid(p, v3(55.6, 8.0, 1.5), v3(3.7, 2.6, 2.0), _BRAIN_AX)
    hr = ellipsoid(p, v3(55.6, 8.0, -1.5), v3(3.7, 2.6, 2.0), _BRAIN_AX)
    cer = smin(hl, hr, 0.7)
    # 大腦縱裂
    fis = np.maximum(np.abs(z) - 0.13, 6.6 - y)
    cer = smax(cer, -fis, 0.15)
    # 腦回與腦溝 (蜿蜒溝槽)
    s = (np.sin(1.9 * x + 1.4 * np.sin(1.7 * y + 0.7))
         + np.sin(1.8 * y + 1.2 * np.sin(1.9 * np.abs(z) + 1.3))
         + np.sin(2.0 * np.abs(z) + 1.3 * np.sin(1.5 * x)))
    cer = cer + 0.2 * np.exp(-(s / 0.55) ** 2)
    # 嗅球
    olf = np.minimum(ellipsoid(p, v3(59.3, 6.8, 0.65), v3(0.95, 0.7, 0.55)),
                     ellipsoid(p, v3(59.3, 6.8, -0.65), v3(0.95, 0.7, 0.55)))
    cer = smin(cer, olf, 0.35)
    # 小腦 (蚓部與小腦葉片)
    cb = ellipsoid(p, v3(50.9, 7.0, 0.0), v3(1.6, 2.0, 2.4))
    ang = np.arctan2(y - 7.0, x - 50.9)
    cb = cb + 0.07 * np.exp(-(np.sin(8.0 * ang) / 0.35) ** 2)
    # 腦幹與腦橋
    stem = smin(_BRAINSTEM(p), ellipsoid(p, v3(52.3, 5.0, 0.0), v3(1.0, 0.8, 1.1)), 0.4)
    return union(cer, cb, stem, k=0.25)


# =============================================================
# 2. 喉、氣管與支氣管樹
# =============================================================
_TRACHEA = Sweep([(43.2, -0.6, 0.0), (37.0, -3.4, 0.0), (30.0, -6.4, 0.0), (24.0, -7.6, 0.0),
                  (20.0, -7.0, 0.0), (16.6, -4.9, 0.0)],
                 ra=[1.0, 1.0, 1.0, 0.98, 0.95, 0.9], rb=[0.82, 0.82, 0.82, 0.8, 0.78, 0.75],
                 normal=lambda m: np.tile((0.0, 1.0, 0.0), (len(m), 1)), step=0.12,
                 ring=lambda s: 1.0 + 0.07 * np.cos(2 * math.pi * s / 0.7))
_BRONCHI = [
    Sweep([(16.6, -4.9, 0.0), (15.4, -5.2, 1.6), (14.6, -5.5, 2.8)], 0.68, step=0.2),
    Sweep([(14.6, -5.5, 2.8), (16.2, -7.6, 4.4), (19.5, -9.5, 5.2), (22.0, -10.5, 5.0)], [0.5, 0.42, 0.35, 0.28], step=0.25),
    Sweep([(14.6, -5.5, 2.8), (11.0, -5.0, 4.3), (6.0, -4.2, 5.6), (1.0, -3.5, 6.2)], [0.55, 0.45, 0.36, 0.28], step=0.25),
    Sweep([(16.6, -4.9, 0.0), (15.5, -5.2, -1.6), (14.8, -5.4, -2.8)], 0.7, step=0.2),
    Sweep([(14.8, -5.4, -2.8), (17.5, -7.0, -4.4), (21.0, -8.5, -5.0)], [0.5, 0.4, 0.3], step=0.25),
    Sweep([(14.6, -5.8, -3.2), (14.2, -9.5, -5.0), (13.6, -14.0, -5.4)], [0.45, 0.36, 0.28], step=0.25),
    Sweep([(14.8, -5.4, -2.8), (11.0, -5.0, -4.4), (6.0, -4.2, -5.6), (1.0, -3.5, -6.2)], [0.55, 0.45, 0.36, 0.28], step=0.25),
    Sweep([(14.4, -6.0, -2.2), (11.0, -7.2, -0.8), (7.5, -10.0, -0.2)], [0.4, 0.32, 0.25], step=0.25),
]


def trachea_main(p):
    return _TRACHEA(p)


def dog_trachea(p):
    larynx = smin(ellipsoid(p, v3(45.0, -0.2, 0.0), v3(2.0, 1.5, 1.35)),
                  ellipsoid(p, v3(46.6, 0.6, 0.0), v3(0.9, 0.5, 0.8)), 0.5)
    d = smin(larynx, _TRACHEA(p), 0.5)
    for br in _BRONCHI:
        d = smin(d, br(p), 0.2)
    return d


# =============================================================
# 3. 心臟與大血管
# =============================================================
HB = v3(16.0, -8.5, 0.3)          # 心底
HA = v3(9.5, -18.5, 2.2)          # 心尖 (偏左、尾腹側)
HDIR = normalize(HA - HB)
_HAX = frame(HDIR)
_VENT = Sweep([HB + 1.0 * HDIR, HB + 3.5 * HDIR, HB + 7.0 * HDIR, HB + 10.0 * HDIR, HA],
              ra=[3.3, 4.2, 3.9, 2.8, 0.9], rb=[3.0, 3.8, 3.5, 2.5, 0.8],
              normal=lambda m: np.tile((0.0, 0.0, 1.0), (len(m), 1)), step=0.4)


def _groove_line(side_dir):
    g = normalize(side_dir)
    g = normalize(g - (g @ HDIR) * HDIR)
    ss = [1.6, 3.5, 5.5, 7.5, 9.5, 11.2]
    rr = [3.3, 4.05, 3.95, 3.5, 2.4, 1.2]
    return Sweep([HB + s * HDIR + r * g for s, r in zip(ss, rr)], 0.22, step=0.3)


_PARACONAL = _groove_line((0.35, 0.15, 0.92))      # 左側錐旁室間溝
_SUBSINUOSAL = _groove_line((-0.45, 0.1, -0.88))   # 右側竇下室間溝
_AORTA = Sweep([(15.4, -9.0, 0.9), (16.4, -7.0, 1.6), (16.2, -3.9, 2.4), (14.3, -1.9, 2.1),
                (10.5, -1.4, 1.3), (5.0, -1.6, 1.0), (-1.0, -1.9, 0.8)],
               [1.05, 1.05, 1.0, 0.95, 0.9, 0.85, 0.85], step=0.35)
_BCT = Sweep([(16.0, -3.3, 2.1), (19.0, -4.0, 1.8), (22.0, -4.6, 1.0), (26.0, -5.0, 0.2)], [0.6, 0.55, 0.5, 0.5])
_LSUB = Sweep([(15.2, -2.4, 2.2), (18.0, -2.8, 3.0), (22.0, -3.6, 3.6), (26.0, -4.2, 3.4)], 0.45)
_PTRUNK = Sweep([(17.2, -11.6, 2.0), (17.0, -9.0, 2.8), (15.6, -7.4, 2.7)], [1.0, 0.95, 0.85])
_LPA = Sweep([(15.6, -7.4, 2.7), (14.4, -6.9, 3.6), (13.2, -6.6, 4.6)], 0.6)
_RPA = Sweep([(15.6, -7.4, 2.7), (15.4, -7.6, 0.6), (14.6, -7.3, -1.8), (13.6, -7.0, -3.6)], 0.6)
_PVEIN_L = Sweep([(13.6, -7.6, 2.4), (12.5, -6.9, 4.4)], 0.38)
_PVEIN_R = Sweep([(13.8, -7.9, 0.4), (13.2, -7.2, -3.2)], 0.38)
_CRVC = Sweep([(17.8, -8.4, -2.9), (21.0, -9.6, -2.5), (26.0, -9.9, -1.9)], 0.8)
_CVC = Sweep([(15.0, -8.8, -2.4), (10.0, -8.8, -2.3), (5.0, -9.0, -2.4), (0.0, -8.8, -2.4), (-3.5, -8.0, -2.3)], 0.75)


def cvc(p):
    return _CVC(p)


def dog_heart(p):
    vent = _VENT(p)
    rv = ellipsoid(p, HB + 5.2 * HDIR + 1.7 * normalize((0.7, 0.3, -0.65)), v3(4.4, 2.7, 2.7), _HAX)
    d = smin(vent, rv, 0.7)
    d = smax(d, -_PARACONAL(p), 0.2)
    d = smax(d, -_SUBSINUOSAL(p), 0.2)
    ra = ellipsoid(p, v3(16.9, -8.4, -2.7), v3(2.3, 1.8, 1.8))
    rau = ellipsoid(p, v3(19.0, -9.4, -2.6), v3(1.8, 1.2, 1.2), frame((1.0, -0.3, -0.2)))
    la = ellipsoid(p, v3(14.0, -8.6, 1.6), v3(2.2, 1.6, 2.0))
    lau = ellipsoid(p, v3(15.8, -11.2, 3.9), v3(1.7, 1.0, 1.1), frame((0.4, -1.0, 0.3)))
    atria = union(ra, rau, la, lau, k=0.5)
    d = smin(d, atria, 0.3)   # 小的 k 值形成冠狀溝
    vessels = union(_AORTA(p), _BCT(p), _LSUB(p), _PTRUNK(p), _LPA(p), _RPA(p),
                    _PVEIN_L(p), _PVEIN_R(p), _CRVC(p), _CVC(p), k=0.25)
    return smin(d, vessels, 0.3)


# =============================================================
# 4–5. 肺 (左 2 葉、右 4 葉)
# =============================================================
def accessory_region(p, heart_d=None):
    if heart_d is None:
        heart_d = dog_heart(p)
    d = ellipsoid(p, v3(6.6, -11.5, -0.6), v3(3.3, 3.6, 3.0))
    d = smax(d, thorax(p) + 0.25, 0.3)
    d = smax(d, -(heart_d - 0.55), 0.3)
    return d


def _lung_base(p, side, heart_d):
    x, y, z = p.T
    d = thorax(p) + 0.25
    d = smax(d, -(heart_d - 0.55), 0.4)
    d = smax(d, -(trachea_main(p) - 0.35), 0.2)
    d = smax(d, -(dog_stomach(p) - 0.8), 0.4)   # 橫膈厚度
    d = smax(d, -spine_block(p), 0.6)
    d = smax(d, (0.5 - z) if side > 0 else (z + 0.5), 0.2)
    # 心切跡
    if side > 0:
        notch = np.maximum(heart_d - 1.0, y + 15.0)
    else:
        notch = np.maximum(heart_d - 1.6, y + 13.0)
    d = smax(d, -notch, 0.5)
    return d


def _fissure(p, p0, n, hilum, cond=None, w=0.3):
    s = plane_slab(p, v3(*p0), v3(*n), w)
    s = np.maximum(s, 2.5 - _len(p - hilum))
    if cond is not None:
        s = np.maximum(s, cond)
    return s


_OBLIQUE_N = (22.0, -6.0, 0.0)  # 斜裂：背側 (13,0) → 腹側 (7,-22)


def dog_lung_left(p):
    heart_d = dog_heart(p)
    d = _lung_base(p, +1, heart_d)
    d = smax(d, -(accessory_region(p, heart_d) - 0.3), 0.2)
    hil = v3(14.0, -6.0, 2.5)
    y = p[:, 1]
    d = smax(d, -_fissure(p, (13.0, 0.0, 0.0), _OBLIQUE_N, hil), 0.15)
    # 左前葉之前部/後部 (不完全裂)
    d = smax(d, -_fissure(p, (17.5, -12.0, 0.0), (1.0, -0.08, 0.0), hil, cond=y + 11.0), 0.15)
    return d


def dog_lung_right(p):
    heart_d = dog_heart(p)
    main = _lung_base(p, -1, heart_d)
    acc = accessory_region(p, heart_d)
    main = smax(main, -(acc - 0.3), 0.2)
    hil = v3(14.5, -6.0, -2.5)
    y = p[:, 1]
    main = smax(main, -_fissure(p, (13.0, 0.0, 0.0), _OBLIQUE_N, hil), 0.15)
    main = smax(main, -_fissure(p, (16.6, -8.0, 0.0), (1.0, -0.1, 0.0), hil, cond=y + 7.0), 0.15)
    return np.minimum(main, acc)


# =============================================================
# 胃 / 十二指腸 / 胰 / 腎 等腹腔器官 (肝臟需要先知道鄰居)
# =============================================================
_STOMACH = Sweep([(-0.8, -5.3, 1.2), (-2.4, -5.8, 1.6), (-5.0, -6.4, 3.4), (-7.0, -8.2, 5.6), (-8.2, -12.5, 5.6),
                  (-9.3, -17.0, 3.8), (-9.5, -19.5, 0.3), (-8.5, -17.8, -3.4), (-6.8, -14.5, -5.0), (-5.6, -12.0, -5.6)],
                 [0.75, 0.9, 2.2, 3.3, 3.4, 3.1, 2.6, 2.2, 1.5, 0.95], step=0.4)


def dog_stomach(p):
    fundus = ellipsoid(p, v3(-6.8, -5.6, 4.6), v3(2.9, 2.9, 3.0))
    d = smin(_STOMACH(p), fundus, 1.2)
    # 幽門括約肌環
    d = smin(d, sphere(p, v3(-5.75, -12.3, -5.55), 1.15), 0.3)
    return d


# ---- 小腸：十二指腸 → 空腸 (三層蛇行) → 迴腸 ----
def _jejunum_ctrl():
    rng = np.random.default_rng(7)
    pts = []

    def strand(a, b, axis):
        a, b = np.array(a, float), np.array(b, float)
        a[axis] += rng.uniform(-1.0, 0.6) * np.sign(a[axis] - b[axis])
        b[axis] += rng.uniform(-1.0, 0.6) * np.sign(b[axis] - a[axis])
        pts.append(a)
        for f in (0.2, 0.4, 0.6, 0.8):
            q = a + (b - a) * f
            jitter = rng.uniform(-1.0, 1.0, 3) * np.array([0.7, 0.45, 0.7])
            jitter[axis] = 0.0
            pts.append(q + jitter)
        pts.append(b)

    def turn(a, b, bulge):
        a, b = np.array(a, float), np.array(b, float)
        pts.append(0.5 * (a + b) + np.array(bulge, float))

    # 第 1 層 (y=-15)：沿左右方向蛇行
    xs1 = [-20.5, -23.1, -25.7, -28.3, -30.9]
    zA, zB = 4.0, -5.0
    for i, x in enumerate(xs1):
        z0, z1 = (zA, zB) if i % 2 == 0 else (zB, zA)
        strand((x, -15.0, z0), (x, -15.0, z1), 2)
        if i < len(xs1) - 1:
            turn((x, -15.0, z1), (xs1[i + 1], -15.0, z1), (0.0, 0.0, 1.2 * np.sign(z1)))
    # 下降到第 2 層 (y=-17.6)：沿頭尾方向蛇行
    zs2 = [-3.8, -1.2, 1.4, 4.0]
    xA, xB = -30.8, -20.5
    for i, z in enumerate(zs2):
        x0, x1 = (xA, xB) if i % 2 == 0 else (xB, xA)
        strand((x0, -17.6, z), (x1, -17.6, z), 0)
        if i < len(zs2) - 1:
            turn((x1, -17.6, z), (x1, -17.6, zs2[i + 1]), (1.0 * np.sign(x1 + 25.0), 0.0, 0.0))
    # 第 3 層 (y=-20.2)
    xs3 = [-31.0, -28.4, -25.8, -23.2, -20.6]
    for i, x in enumerate(xs3):
        z0, z1 = (zA, zB) if i % 2 == 0 else (zB, zA)
        strand((x, -20.2, z0), (x, -20.2, z1), 2)
        if i < len(xs3) - 1:
            turn((x, -20.2, z1), (xs3[i + 1], -20.2, z1), (0.0, 0.0, 1.2 * np.sign(z1)))
    return pts


_DUODENUM_CTRL = [(-5.4, -11.3, -6.0), (-5.0, -9.6, -7.4), (-8.0, -7.6, -8.6), (-14.0, -7.6, -8.9),
                  (-22.0, -7.9, -8.8), (-28.0, -8.4, -8.2), (-32.0, -9.0, -5.6), (-33.0, -9.6, -2.0),
                  (-30.0, -9.8, 0.4), (-25.0, -10.6, 1.8), (-21.5, -11.6, 2.4)]
_ILEUM_CTRL = [(-22.2, -19.6, -7.0), (-24.2, -16.5, -7.5), (-25.8, -13.2, -6.6), (-26.8, -12.0, -4.2),
               (-25.8, -10.8, -3.0), (-24.7, -9.9, -3.3)]
_SI_CTRL = _DUODENUM_CTRL + _jejunum_ctrl() + _ILEUM_CTRL
_SI_R = np.concatenate([np.full(len(_DUODENUM_CTRL), 1.05),
                        np.linspace(0.98, 0.92, len(_SI_CTRL) - len(_DUODENUM_CTRL) - len(_ILEUM_CTRL)),
                        np.linspace(0.9, 0.8, len(_ILEUM_CTRL))])
_SI = Sweep(_SI_CTRL, _SI_R, step=0.35)
_DUODENUM = Sweep(_DUODENUM_CTRL, 1.05, step=0.4)


def dog_small_intestine(p):
    return _SI(p)


# ---- 盲腸：犬特有的螺旋/逗號形盲囊 ----
def _cecum_ctrl():
    base = v3(-25.0, -9.4, -4.0)
    ax = normalize((-1.0, 0.15, 0.05))
    e1 = normalize(np.cross(ax, (0.0, 1.0, 0.0)))
    e2 = np.cross(e1, ax)
    out = []
    for i in range(29):
        t = i / 28.0
        r = 0.15 + 0.85 * min(1.0, t * 2.5)
        ang = 2 * math.pi * 2.0 * t
        out.append(base + ax * 4.6 * t + r * (math.cos(ang) * e1 + math.sin(ang) * e2))
    return out


_CECUM = Sweep(_cecum_ctrl(), np.linspace(0.85, 0.55, 29), step=0.2)


def dog_cecum(p):
    return _CECUM(p)


# ---- 結腸 (問號形：升→橫→降) 與直腸 ----
_COLON = Sweep([(-24.5, -9.6, -3.4), (-21.0, -8.6, -3.8), (-17.6, -8.0, -3.0), (-16.8, -8.2, 0.2),
                (-18.0, -8.6, 3.6), (-23.0, -8.8, 4.9), (-30.0, -8.2, 4.0), (-36.0, -6.8, 1.8),
                (-42.0, -5.4, 0.3), (-48.0, -5.0, 0.0), (-54.0, -5.4, 0.0), (-58.5, -6.2, 0.0)],
               [1.3, 1.35, 1.35, 1.35, 1.4, 1.5, 1.5, 1.5, 1.55, 1.75, 1.5, 0.9], step=0.4)


def dog_colon(p):
    return _COLON(p)


# ---- 腎與輸尿管 ----
RK_C = v3(-14.0, -3.0, -4.6)   # 右腎較前 (T13–L1)，嵌入肝尾狀突腎窩
LK_C = v3(-19.5, -3.2, 4.6)    # 左腎較後
_URETER_R = Sweep([RK_C + v3(0, -0.1, 1.2), (-20.0, -3.4, -2.4), (-30.0, -3.6, -2.8), (-37.0, -4.2, -3.6),
                   (-41.5, -9.0, -3.0), (-43.5, -13.5, -1.4), (-43.2, -15.0, -0.9)],
                  [0.45, 0.24, 0.22, 0.22, 0.22, 0.22, 0.22], step=0.3)
_URETER_L = Sweep([LK_C + v3(0, -0.1, -1.2), (-25.0, -3.5, 3.0), (-30.0, -3.6, 3.2), (-37.0, -4.2, 3.8),
                   (-41.5, -9.0, 3.2), (-43.5, -13.5, 1.4), (-43.2, -15.0, 0.9)],
                  [0.45, 0.24, 0.22, 0.22, 0.22, 0.22, 0.22], step=0.3)


def _kidney(p, c, side):
    ax = frame((1.0, 0.0, 0.12 * side))
    body = ellipsoid(p, c, v3(3.1, 1.55, 2.0), ax)
    hilus = ellipsoid(p, c + v3(0.0, 0.0, -side * 2.05), v3(1.3, 0.75, 1.0))
    return smax(body, -hilus, 0.5)


def kidney_right_body(p):
    return _kidney(p, RK_C, -1)


def dog_kidney_right(p):
    return smin(kidney_right_body(p), _URETER_R(p), 0.3)


def dog_kidney_left(p):
    return smin(_kidney(p, LK_C, +1), _URETER_L(p), 0.3)


# ---- 膀胱與尿道 ----
_BL_NECK = Sweep([(-41.5, -16.4, 0.0), (-44.8, -15.4, 0.0)], [2.2, 0.9], step=0.25)
_URETHRA = Sweep([(-44.8, -15.4, 0.0), (-50.0, -13.8, 0.0), (-56.0, -12.4, 0.0)], 0.5, step=0.3)


def dog_urinary_bladder(p):
    body = ellipsoid(p, v3(-38.5, -17.0, 0.0), v3(4.6, 3.5, 3.4))
    return smin(smin(body, _BL_NECK(p), 1.0), _URETHRA(p), 0.3)


# ---- 脾：舌狀扁平，沿胃大彎垂掛於左側 ----
_SPLEEN = Sweep([(-9.5, -4.6, 8.4), (-12.0, -8.5, 9.6), (-14.0, -13.5, 9.2), (-15.2, -18.5, 7.2), (-15.6, -21.5, 4.6)],
                ra=[1.4, 1.9, 2.1, 2.4, 2.0], rb=[0.5, 0.6, 0.65, 0.7, 0.6],
                normal=lambda m: np.stack([np.zeros(len(m)), m[:, 1] + 11.0, m[:, 2]], axis=1), step=0.3)


def dog_spleen(p):
    return _SPLEEN(p)


# ---- 胰：V 形，右葉沿降十二指腸、左葉沿胃大彎 ----
_PAN_N = lambda m: np.tile((0.0, 1.0, 0.0), (len(m), 1))
_PAN_R = Sweep([(-5.8, -10.6, -3.6), (-8.6, -8.2, -6.0), (-14.0, -8.1, -6.4), (-22.0, -8.7, -6.4)],
               ra=[1.1, 1.0, 1.0, 0.7], rb=0.5, normal=_PAN_N, step=0.3)
_PAN_L = Sweep([(-5.8, -10.6, -3.6), (-8.4, -9.6, -1.0), (-10.8, -7.8, 2.0), (-12.4, -6.8, 5.0), (-13.2, -6.2, 7.4)],
               ra=[1.1, 1.0, 0.95, 0.85, 0.7], rb=0.5, normal=_PAN_N, step=0.3)


def dog_pancreas(p):
    x, y, z = p.T
    d = smin(_PAN_R(p), _PAN_L(p), 0.3)
    return d + 0.07 * np.sin(4.0 * x) * np.sin(4.3 * y + 1.0) * np.sin(3.9 * z + 2.0)


# ---- 膽囊 (梨形) 與膽囊管、總膽管 ----
_GB_BODY = Sweep([(0.4, -12.0, -1.3), (-0.3, -14.6, -1.6), (-0.9, -17.0, -1.8)], [0.55, 1.25, 1.5], step=0.25)
_BILE = Sweep([(0.4, -12.0, -1.3), (-1.0, -10.6, -1.2), (-2.5, -10.0, -1.0), (-4.4, -9.6, -3.4), (-5.6, -8.8, -6.8)],
              0.25, step=0.25)


def dog_gallbladder(p):
    return smin(_GB_BODY(p), _BILE(p), 0.3)


# =============================================================
# 6. 肝臟 (六葉：左外/左內/方葉/右內/右外/尾狀葉)
# =============================================================
LH = v3(-2.5, -10.0, -1.0)   # 肝門
_CAUD_AX = frame((1.0, 0.15, -0.1))
_LIVER_FISSURES = [84, 34, -7, -42, -104, 166]   # 由腹側往左為正 (度)


def dog_liver(p):
    x, y, z = p.T
    xd = diaph_x(y, z) - 0.45
    T = 2.6 + 4.6 * np.exp(-((y + 10.0) / 8.0) ** 2 - (z / 9.5) ** 2)
    d = np.maximum(x - xd, (xd - T) - x)
    cav = (np.sqrt(((y + 11.5) / 12.0) ** 2 + (z / 11.0) ** 2) - 1.0) * 11.0
    d = smax(d, cav, 0.8)
    d = smax(d, y + 2.4, 0.8)
    # 尾狀葉：尾狀突 (伸向右腎) 與乳頭突
    caud = ellipsoid(p, v3(-9.5, -4.4, -4.6), v3(4.0, 2.0, 2.6), _CAUD_AX)
    pap = ellipsoid(p, v3(-5.8, -7.4, 0.6), v3(1.8, 1.3, 1.3))
    d = smin(d, caud, 1.0)
    d = smin(d, pap, 0.6)
    # 葉間裂
    q = p - LH
    radial = np.sqrt(q[:, 1] ** 2 + q[:, 2] ** 2)
    for deg in _LIVER_FISSURES:
        th = math.radians(deg)
        u = np.array([0.0, -math.cos(th), math.sin(th)])
        n = np.array([0.0, math.sin(th), math.cos(th)])
        slab = np.maximum.reduce([np.abs(q @ n) - 0.28, -(q @ u), 2.6 - radial])
        d = smax(d, -slab, 0.55)
    # 臟面壓跡：胃、十二指腸、胰、右腎 (腎窩)、膽囊窩、後腔靜脈溝
    d = smax(d, -(dog_stomach(p) - 0.35), 0.4)
    d = smax(d, -(_DUODENUM(p) - 0.3), 0.3)
    d = smax(d, -(dog_spleen(p) - 0.3), 0.3)
    d = smax(d, -(dog_pancreas(p) - 0.2), 0.3)
    d = smax(d, -(kidney_right_body(p) - 0.3), 0.4)
    d = smax(d, -(_GB_BODY(p) - 0.12), 0.2)
    d = smax(d, -(cvc(p) - 0.05), 0.2)
    return d


# =============================================================
# 網格化：Surface Nets + 牛頓投影 + 梯度法線
# =============================================================
BODY_LO = v3(-62.0, -27.0, -14.0)
BODY_HI = v3(62.0, 13.0, 14.0)


def _eval(fn, P, chunk=250000):
    out = np.empty(len(P))
    for i in range(0, len(P), chunk):
        out[i:i + chunk] = fn(P[i:i + chunk])
    return out


def _grid(lo, hi, h):
    axes = [np.arange(lo[i], hi[i] + 0.5 * h, h) for i in range(3)]
    X, Y, Z = np.meshgrid(*axes, indexing='ij')
    return np.stack([X, Y, Z], -1), axes


def find_bounds(fn, h=1.0):
    G, _ = _grid(BODY_LO, BODY_HI, h)
    F = _eval(fn, G.reshape(-1, 3)).reshape(G.shape[:3])
    idx = np.argwhere(F < h)
    if len(idx) == 0:
        raise ValueError("empty SDF")
    lo = BODY_LO + idx.min(0) * h - 1.5
    hi = BODY_LO + idx.max(0) * h + 1.5
    return lo, hi


def _gradient(fn, V, e):
    g = np.empty_like(V)
    for i in range(3):
        d = np.zeros(3)
        d[i] = e
        g[:, i] = (_eval(fn, V + d) - _eval(fn, V - d)) / (2 * e)
    return g


def surface_nets(fn, lo, hi, h):
    G, _ = _grid(lo, hi, h)
    shape = G.shape[:3]
    F = _eval(fn, G.reshape(-1, 3)).reshape(shape)
    F[F == 0] = 1e-9
    nc = tuple(s - 1 for s in shape)
    acc = np.zeros(nc + (3,))
    cnt = np.zeros(nc)
    quads, flips = [], []
    for axis in range(3):
        s0 = [slice(None)] * 3
        s1 = [slice(None)] * 3
        s0[axis], s1[axis] = slice(0, -1), slice(1, None)
        f0, f1 = F[tuple(s0)], F[tuple(s1)]
        cross = (f0 < 0) != (f1 < 0)
        idx = np.argwhere(cross)
        t = f0[cross] / (f0[cross] - f1[cross])
        pos = lo + idx * h
        pos[:, axis] += t * h
        o1, o2 = [a for a in range(3) if a != axis]
        cells, valid = [], np.ones(len(idx), bool)
        for d1, d2 in ((0, 0), (1, 0), (1, 1), (0, 1)):
            c = idx.copy()
            c[:, o1] -= d1
            c[:, o2] -= d2
            ok = (c >= 0).all(1) & (c[:, 0] < nc[0]) & (c[:, 1] < nc[1]) & (c[:, 2] < nc[2])
            ci = tuple(c[ok].T)
            np.add.at(acc, ci, pos[ok])
            np.add.at(cnt, ci, 1)
            cells.append(c)
            valid &= ok
        quads.append(np.stack([c[valid] for c in cells], axis=1))
        flips.append((f0[cross] < 0)[valid])
    vid = -np.ones(nc, dtype=np.int64)
    active = cnt > 0
    vid[active] = np.arange(active.sum())
    V = acc[active] / cnt[active][:, None]
    Q = np.concatenate(quads)
    Qi = vid[Q[:, :, 0], Q[:, :, 1], Q[:, :, 2]]
    tris = np.concatenate([Qi[:, [0, 1, 2]], Qi[:, [0, 2, 3]]])
    # 牛頓投影到真實等值面
    for _ in range(3):
        f = _eval(fn, V)
        g = _gradient(fn, V, h * 0.25)
        gg = np.maximum((g * g).sum(1), 1e-6)
        step = (f / gg)[:, None] * g
        sl = np.linalg.norm(step, axis=1)
        step *= np.minimum(1.0, (0.5 * h) / np.maximum(sl, 1e-9))[:, None]
        V = V - step
    Nrm = _gradient(fn, V, h * 0.25)
    Nrm /= np.maximum(np.linalg.norm(Nrm, axis=1), 1e-9)[:, None]
    # 依梯度統一面方向 (逆時針朝外)
    a, b, c = V[tris[:, 0]], V[tris[:, 1]], V[tris[:, 2]]
    fn_ = np.cross(b - a, c - a)
    flip = (fn_ * (Nrm[tris[:, 0]] + Nrm[tris[:, 1]] + Nrm[tris[:, 2]])).sum(1) < 0
    tris[flip] = tris[flip][:, [0, 2, 1]]
    # 去除退化三角形
    keep = (tris[:, 0] != tris[:, 1]) & (tris[:, 1] != tris[:, 2]) & (tris[:, 0] != tris[:, 2])
    return V, Nrm, tris[keep]


# 器官清單：(物件名稱, SDF, 體素大小 cm)
ORGANS = [
    ("dog_brain", dog_brain, 0.27),
    ("dog_trachea", dog_trachea, 0.28),
    ("dog_heart", dog_heart, 0.4),
    ("dog_lung_left", dog_lung_left, 0.58),
    ("dog_lung_right", dog_lung_right, 0.58),
    ("dog_liver", dog_liver, 0.5),
    ("dog_gallbladder", dog_gallbladder, 0.24),
    ("dog_stomach", dog_stomach, 0.46),
    ("dog_spleen", dog_spleen, 0.32),
    ("dog_pancreas", dog_pancreas, 0.3),
    ("dog_small_intestine", dog_small_intestine, 0.45),
    ("dog_cecum", dog_cecum, 0.26),
    ("dog_colon", dog_colon, 0.46),
    ("dog_kidney_left", dog_kidney_left, 0.3),
    ("dog_kidney_right", dog_kidney_right, 0.3),
    ("dog_urinary_bladder", dog_urinary_bladder, 0.4),
]


class DogMeshBuilder:
    """與 OBJBuilder 相容的介面 (vertices / objects / to_obj_string)，另含法線。"""

    def __init__(self, organs=ORGANS, verbose=True):
        self.meshes = {}
        self.vertices = []
        self.objects = {}
        for name, fn, h in organs:
            lo, hi = find_bounds(fn)
            V, N, Tr = surface_nets(fn, lo, hi, h)
            self.meshes[name] = (V, N, Tr)
            self.objects[name] = Tr
            self.vertices.extend(V)
            if verbose:
                print(f"  {name:22s} {len(V):6d} verts {len(Tr):7d} tris")

    def to_obj_string(self):
        lines = ["# Canine visceral anatomy (SDF sculpt, cm; +x cranial, +y dorsal, +z left)\n"]
        base = 1
        for name, (V, N, Tr) in self.meshes.items():
            lines.append(f"o {name}\n")
            lines.extend(f"v {x:.2f} {y:.2f} {z:.2f}\n" for x, y, z in V)
            lines.extend(f"vn {x:.2f} {y:.2f} {z:.2f}\n" for x, y, z in N)
            lines.append("s 1\n")
            T = Tr + base
            lines.extend(f"f {a}//{a} {b}//{b} {c}//{c}\n" for a, b, c in T)
            base += len(V)
        return "".join(lines)


def check_overlaps(builder, organs=ORGANS, tol=0.12):
    """回報 A 器官頂點落在 B 器官內部 (深度 > tol) 的數量。"""
    fns = {n: f for n, f, _ in organs}
    report = []
    for a, (V, _, _) in builder.meshes.items():
        for b, fb in fns.items():
            if a == b:
                continue
            inside = (_eval(fb, V) < -tol).sum()
            if inside:
                report.append((a, b, int(inside)))
    return report


if __name__ == "__main__":
    import sys
    import time
    names = sys.argv[1:]
    sel = [o for o in ORGANS if not names or o[0] in names]
    t0 = time.time()
    b = DogMeshBuilder(sel)
    print(f"built in {time.time() - t0:.1f}s, total tris {sum(len(t) for t in b.objects.values())}")
    if len(sel) == len(ORGANS):
        for a, o, n in check_overlaps(b):
            print(f"  overlap: {a} inside {o}: {n} verts")
        import pickle
        with open("_dog_mesh_cache.pkl", "wb") as f:
            pickle.dump(b.meshes, f)
