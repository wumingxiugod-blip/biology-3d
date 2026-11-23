/* 骨骼的 SDF 模型（右側股骨、脛骨、腓骨、髕骨）；座標：+y 上、+x 外側、+z 前方；1 單位 ≈ 1.5 cm */
const BONES = (function () {
  const S = SDF;
  const HEAD = [-2.15, 13.75, 0.25], HEAD_R = 1.45, NECK0 = [0.3, 12.1, 0.1];
  const NECK_DIR = (() => { const d = [HEAD[0] - NECK0[0], HEAD[1] - NECK0[1], HEAD[2] - NECK0[2]], L = Math.hypot(...d); return d.map(v => v / L); })();
  function femur(x, y, z) {
    let d = S.chain(x, y, z, [[0.6, 11.6, -0.05], [0.35, 4, 0.05], [0.15, -4, 0.1], [0.05, -9.5, 0.0]], [1.08, 0.88, 0.9, 1.25]);
    if (y > 8) {
      d = S.smin(d, S.cap(x, y, z, NECK0, [-1.7, 13.45, 0.25], 0.82, 0.74), 0.7);
      d = S.smin(d, S.sph(x, y, z, HEAD, HEAD_R), 0.35);
      d = S.smin(d, S.ell(x, y, z, [1.35, 12.7, -0.25], [0.85, 1.25, 0.95]), 0.7);
      d = S.smin(d, S.ell(x, y, z, [-0.45, 10.6, -0.55], [0.5, 0.55, 0.45]), 0.5);
      d = S.smin(d, S.cap(x, y, z, [1.2, 12.3, -0.65], [-0.35, 10.7, -0.62], 0.3, 0.28), 0.5);
      d = S.smax(d, -S.sph(x, y, z, [-3.4, 14.3, 0.3], 0.28), 0.15); // 股骨頭凹
    }
    if (y > -9 && y < 9) d = S.smin(d, S.cap(x, y, z, [0.35, 8, -0.85], [0.1, -7, -0.8], 0.17, 0.17), 0.35); // 股骨粗線
    if (y < -7) {
      d = S.smin(d, S.ell(x, y, z, [0.0, -11.6, -0.15], [1.75, 1.9, 1.45]), 1.0);
      d = S.smin(d, S.ell(x, y, z, [-1.3, -13.85, -0.4], [1.2, 1.45, 1.85]), 0.5);
      d = S.smin(d, S.ell(x, y, z, [1.3, -13.75, -0.35], [1.15, 1.4, 1.8]), 0.5);
      d = S.smax(d, -S.cap(x, y, z, [0, -14.9, -2.4], [0, -14.35, 0.0], 0.55, 0.45), 0.25); // 髁間窩
      d = S.smax(d, -S.cap(x, y, z, [0, -11.9, 1.75], [0, -14.3, 1.5], 0.38, 0.42), 0.35);  // 髕骨面（滑車溝）
    }
    return d;
  }
  const femCav = (x, y, z) => S.chain(x, y, z, [[0.45, 8.5, 0], [0.3, 3, 0.05], [0.12, -3, 0.08], [0.06, -8.5, 0.02]], [0.33, 0.5, 0.5, 0.38]);
  // 關節軟骨分布：股骨頭（股骨頭凹除外）、股骨髁下後方與前方髕骨面
  function femCartMask(x, y, z) {
    if (Math.hypot(x - HEAD[0], y - HEAD[1], z - HEAD[2]) < HEAD_R + 0.4) {
      const s = (x - HEAD[0]) * NECK_DIR[0] + (y - HEAD[1]) * NECK_DIR[1] + (z - HEAD[2]) * NECK_DIR[2];
      return s > -0.55 && Math.hypot(x + 3.4, y - 14.3, z - 0.3) > 0.45;
    }
    if (y < -12.4) return z < 1.9 || y < -13.2;
    if (y < -11.3 && z > 0.95 && Math.abs(x) < 1.6) return true;
    return false;
  }
  // 骺板（兒童）／骺線（成人）的位置
  function femPlate(x, y, z) {
    const s = (x - HEAD[0]) * NECK_DIR[0] + (y - HEAD[1]) * NECK_DIR[1] + (z - HEAD[2]) * NECK_DIR[2];
    const head = Math.abs(s + 0.85) * (Math.hypot(x - HEAD[0], y - HEAD[1], z - HEAD[2]) < HEAD_R + 0.3 ? 1 : 9);
    const dist = Math.abs(y + 12.2 - 0.12 * Math.cos(x * 1.6));
    return Math.min(head, dist);
  }

  // 脛骨（右）：上端平台在 y≈-16.4（緊接股骨髁），x 內側為負
  function tibia(x, y, z) {
    y -= 0.45;
    let d = S.chain(x, y, z, [[0.05, -18.2, -0.2], [0.1, -24, 0.1], [0.15, -36, 0.0], [0.05, -41.5, 0.0]], [1.35, 0.88, 0.82, 1.05]);
    if (y > -21) {
      d = S.smin(d, S.ell(x, y, z, [-1.2, -16.9, -0.35], [1.4, 0.75, 1.7]), 0.6); // 內髁
      d = S.smin(d, S.ell(x, y, z, [1.25, -16.95, -0.45], [1.3, 0.72, 1.55]), 0.6); // 外髁
      d = S.smin(d, S.ell(x, y, z, [0.25, -18.6, 1.15], [0.55, 0.75, 0.45]), 0.6); // 脛骨粗隆
      d = S.smax(d, -S.ell(x, y, z, [-1.25, -15.85, -0.3], [1.05, 0.42, 1.25]), 0.2);  // 內側關節面（淺凹）
      d = S.smax(d, -S.ell(x, y, z, [1.25, -15.9, -0.4], [0.95, 0.4, 1.1]), 0.2);
    }
    if (y < -39) d = S.smin(d, S.ell(x, y, z, [-0.9, -41.6, 0.1], [0.45, 1.0, 0.6]), 0.5); // 內踝
    return d;
  }
  const tibCav = (x, y, z) => (y -= 0.45, S.chain(x, y, z, [[0.08, -21.5, -0.05], [0.12, -28, 0.05], [0.12, -38, 0.0]], [0.3, 0.42, 0.35]));
  function fibula(x, y, z) {
    y -= 0.45;
    let d = S.chain(x, y, z, [[2.05, -17.9, -0.9], [2.0, -22, -0.75], [1.9, -34, -0.55], [1.9, -40.8, -0.35]], [0.5, 0.34, 0.32, 0.45]);
    d = S.smin(d, S.ell(x, y, z, [2.1, -17.8, -0.95], [0.6, 0.55, 0.55]), 0.35);
    d = S.smin(d, S.ell(x, y, z, [2.0, -41.5, -0.3], [0.45, 0.95, 0.5]), 0.4); // 外踝
    return d;
  }
  // 髕骨：位於滑車溝前方
  const PAT_C = [0.05, -12.0, 2.55];
  function patella(x, y, z) {
    let d = S.ell(x, y, z, PAT_C, [1.25, 1.55, 0.65]);
    d = S.smin(d, S.ell(x, y, z, [0.05, -13.1, 2.35], [0.75, 0.8, 0.45]), 0.5);
    return d;
  }

  // 細胞雜訊（Worley）：回傳 F2−F1，靠近細胞邊界時趨近 0 → 用來畫骨小樑
  function hh(i, j, k, s) { const h = Math.sin(i * 127.1 + j * 311.7 + k * 74.7 + s * 19.3) * 43758.5453; return h - Math.floor(h); }
  function worley(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z); let f1 = 9, f2 = 9;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) {
      const cx = xi + i, cy = yi + j, cz = zi + k;
      const d = Math.hypot(cx + hh(cx, cy, cz, 1) - x, cy + hh(cx, cy, cz, 2) - y, cz + hh(cx, cy, cz, 3) - z);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
    }
    return f2 - f1;
  }
  // 一般骨剖面分類：d 為骨 SDF、cav 為骨髓腔、tc 為緻密骨厚度、plate 為骺板距離
  const C = { compact: S.rgb(0xe9dbb8), spongyB: S.rgb(0xeadcbc), marrowR: S.rgb(0xb53c37), marrowY: S.rgb(0xefcc5e), endo: S.rgb(0xe98a3c), cart: S.rgb(0xbfe3f0), plateC: S.rgb(0x86c6ef), plateA: S.rgb(0xfaf6ec) };
  function boneRegion(x, y, z, d, cav, tc, plate, adult, cart, an) {
    if (d > 0) { if (cart && d < 0.17) return ['關節軟骨', C.cart]; return null; }
    const dep = -d, n = noise3(x * 3.1, y * 3.1, z * 3.1);
    if (plate !== null && plate < (adult ? 0.045 : 0.16)) return adult ? ['骺線', C.plateA] : ['骺板', C.plateC];
    if (dep < tc) { const l = 0.93 + 0.07 * Math.sin(dep * 40 + n * 4); return ['緻密骨', C.compact.map((v, i) => i < 3 ? v * l : v)]; }
    if (cav !== null && cav < 0) { if (cav > -0.06) return ['骨內膜', C.endo]; const k = 0.9 + 0.2 * n; return ['黃骨髓', C.marrowY.map((v, i) => i < 3 ? Math.min(255, v * k) : v)]; }
    const m2 = noise3(x * 7.3 + 3, y * 7.3, z * 7.3), sx = (an && an[0]) || 1, sy = (an && an[1]) || 1;
    const w = worley(x * 3.4 * sx + 0.3 * n, y * 3.4 * sy, z * 3.4 * ((an && an[2]) || 1)), th = 0.1 + 0.06 * m2 + 0.12 * SDF.clamp(1 - (dep - tc) / 0.6, 0, 1);
    if (w < th) return ['骨小樑', C.spongyB.map((v, i) => i < 3 ? v * (0.94 + 0.08 * m2) : v)];
    const k = 0.72 + 0.45 * m2 + 0.15 * SDF.clamp(w * 2, 0, 1); return ['紅骨髓', C.marrowR.map((v, i) => i < 3 ? Math.min(255, v * k) : v)];
  }
  const cache = {};
  function once(key, f) { return cache[key] || (cache[key] = f()); }
  return { worley, femur, femCav, femCartMask, femPlate, tibia, tibCav, fibula, patella, PAT_C, HEAD, HEAD_R, boneRegion, once, C };
})();
