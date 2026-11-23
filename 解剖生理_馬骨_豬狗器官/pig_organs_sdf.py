"""Pig-only visceral organ meshes: signed-distance sculpting + surface nets.

Coordinate convention: +x cranial, +y dorsal, +z left.  This module is isolated
from the canine model builder and only produces porcine organ groups.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np


def _norm(v):
    v = np.asarray(v, dtype=np.float64)
    return np.linalg.norm(v, axis=-1)


def _unit(v):
    v = np.asarray(v, dtype=np.float64)
    n = np.linalg.norm(v)
    return v / max(n, 1e-12)


def smin(a, b, k=0.0):
    if k <= 0:
        return np.minimum(a, b)
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1 - h) + a * h - k * h * (1 - h)


def union(*fields, k=0.0):
    out = fields[0]
    for field in fields[1:]:
        out = smin(out, field, k)
    return out


def cut(field, cutter, k=0.0):
    return -smin(-field, cutter, k)


def ellipsoid(p, center, radii, axes=None):
    q = p - np.asarray(center, dtype=np.float64)
    if axes is not None:
        q = q @ axes
    r = np.asarray(radii, dtype=np.float64)
    q = q / r
    k0 = _norm(q)
    k1 = _norm(q / r)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)


def _frame(direction, up=(0.0, 1.0, 0.0)):
    t = _unit(direction)
    up = np.asarray(up, dtype=np.float64)
    if abs(float(np.dot(t, up))) > 0.92:
        up = np.array((0.0, 0.0, 1.0))
    n = _unit(np.cross(t, up))
    b = _unit(np.cross(t, n))
    return t, n, b


def catmull_rom(control, step=0.25):
    pts = np.asarray(control, dtype=np.float64)
    if len(pts) < 2:
        return pts.copy(), np.zeros(len(pts), dtype=np.float64)
    padded = np.vstack((2 * pts[0] - pts[1], pts, 2 * pts[-1] - pts[-2]))
    out, param = [], []
    for i in range(1, len(padded) - 2):
        p0, p1, p2, p3 = padded[i - 1:i + 3]
        count = max(2, int(math.ceil(np.linalg.norm(p2 - p1) / step)))
        for j in range(count):
            t = j / count
            t2, t3 = t * t, t * t * t
            point = 0.5 * ((2 * p1) + (-p0 + p2) * t
                           + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
                           + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
            out.append(point)
            param.append(i - 1 + t)
    out.append(pts[-1])
    param.append(float(len(pts) - 1))
    return np.asarray(out), np.asarray(param)


def sweep(p, control, ra, rb=None, step=0.25, blend=0.05):
    """Approximate a smooth elliptical tube as overlapping rounded segments."""
    ctrl = np.asarray(control, dtype=np.float64)
    points, param = catmull_rom(ctrl, step)
    if np.isscalar(ra):
        ra_values = np.full(len(points), float(ra))
    else:
        ra_values = np.interp(param, np.arange(len(ctrl)), np.asarray(ra, dtype=np.float64))
    if rb is None:
        rb_values = ra_values.copy()
    elif np.isscalar(rb):
        rb_values = np.full(len(points), float(rb))
    else:
        rb_values = np.interp(param, np.arange(len(ctrl)), np.asarray(rb, dtype=np.float64))

    result = np.full(len(p), 1e6, dtype=np.float64)
    for i in range(len(points) - 1):
        a, b = points[i], points[i + 1]
        delta = b - a
        length = float(np.linalg.norm(delta))
        if length < 1e-8:
            continue
        t, n, w = _frame(delta)
        mid = 0.5 * (a + b)
        off = p - mid
        axial = off @ t
        u = np.clip((axial + 0.5 * length) / length, 0.0, 1.0)
        ra_i = ra_values[i] + u * (ra_values[i + 1] - ra_values[i])
        rb_i = rb_values[i] + u * (rb_values[i + 1] - rb_values[i])
        across = off @ n
        depth = off @ w
        cap = 0.5 * length + np.minimum(ra_i, rb_i)
        k0 = np.sqrt((across / ra_i) ** 2 + (depth / rb_i) ** 2 + (axial / cap) ** 2)
        d = (k0 - 1.0) * np.minimum(ra_i, rb_i)
        if i == 0:
            result = d
        else:
            result = smin(result, d, blend)
    return result


def torus_x(p, center, major, minor):
    q = p - np.asarray(center, dtype=np.float64)
    radial = np.sqrt(q[:, 1] ** 2 + q[:, 2] ** 2)
    return np.sqrt((radial - major) ** 2 + q[:, 0] ** 2) - minor


def _lobulated_ellipsoid(p, center, radii, frequency=7.0, amplitude=0.035):
    d = ellipsoid(p, center, radii)
    q = p - np.asarray(center, dtype=np.float64)
    ripple = (np.sin(q[:, 0] * frequency) * np.sin(q[:, 1] * frequency * 0.83)
              * np.sin(q[:, 2] * frequency * 0.91))
    return d + amplitude * ripple * np.exp(-np.abs(d) / 0.24)


# ---------------------------------------------------------------------------
# Porcine organ signed-distance fields
# ---------------------------------------------------------------------------
def pig_rostral_bone(p):
    bone = ellipsoid(p, (13.25, 1.55, 0.0), (1.15, 0.75, 0.78))
    cart = torus_x(p, (14.15, 1.55, 0.0), 0.83, 0.16)
    return smin(bone, cart, 0.10)


def pig_trachea(p):
    main = sweep(p, [(12.8, 1.35, 0.0), (10.2, 1.05, 0.0), (7.0, 0.72, 0.0),
                    (4.2, 0.48, 0.0), (1.8, 0.30, 0.0)], 0.34, 0.32, step=0.22, blend=0.06)
    left = sweep(p, [(1.9, 0.28, 0.0), (0.8, 0.02, 0.82), (-0.2, -0.18, 1.55)],
                 [0.34, 0.28, 0.22], [0.31, 0.26, 0.21], step=0.22, blend=0.05)
    right = sweep(p, [(1.9, 0.28, 0.0), (0.8, 0.02, -0.82), (-0.2, -0.18, -1.55)],
                  [0.34, 0.28, 0.22], [0.31, 0.26, 0.21], step=0.22, blend=0.05)
    # The swine tracheal bronchus leaves the right wall before the carina.
    cranial = sweep(p, [(5.2, 0.65, -0.1), (4.3, 0.92, -0.72), (3.2, 1.05, -1.55)],
                    [0.25, 0.22, 0.18], [0.24, 0.20, 0.17], step=0.18, blend=0.04)
    airway = union(main, left, right, cranial, k=0.16)
    # Approximate the visible C-shaped cartilage rings (about 32–35 per trachea).
    for i in range(31):
        t = i / 30.0
        x = 12.65 - 10.65 * t
        y = 1.32 - 1.02 * t
        ring = torus_x(p, (x, y, 0.0), 0.355, 0.048)
        airway = smin(airway, ring, 0.035)
    return airway


def pig_heart(p):
    axes = np.array([[0.97, -0.25, 0.04], [0.24, 0.95, 0.22], [-0.09, -0.20, 0.98]])
    left_vent = ellipsoid(p, (0.65, -0.85, 0.52), (1.25, 1.62, 0.90), axes)
    right_vent = ellipsoid(p, (0.55, -0.62, -0.52), (1.08, 1.46, 0.82), axes)
    atria = ellipsoid(p, (1.55, 0.42, 0.0), (0.92, 0.78, 0.98))
    heart = union(left_vent, right_vent, atria, k=0.58)
    aorta = sweep(p, [(1.35, 0.65, 0.05), (1.52, 1.45, 0.14), (0.98, 2.12, 0.22),
                      (0.02, 2.18, 0.25)], [0.46, 0.44, 0.36, 0.30], step=0.18)
    pulmonary = sweep(p, [(1.38, 0.60, -0.18), (1.76, 1.20, -0.55), (1.35, 1.64, -0.82)],
                      [0.34, 0.29, 0.23], step=0.18)
    cava = sweep(p, [(1.74, 0.34, 0.78), (2.25, 1.05, 0.94), (2.45, 1.70, 0.98)],
                 [0.34, 0.29, 0.24], step=0.18)
    return union(heart, aorta, pulmonary, cava, k=0.20)


def pig_lungs(p):
    # +z is the left side.  The left lung has cranial and caudal lobes;
    # the right lung has cranial, middle, caudal and accessory lobes.
    lobes = [
        _lobulated_ellipsoid(p, (1.50, 0.45, 1.95), (1.55, 1.04, 0.90), 5.4, 0.03),
        _lobulated_ellipsoid(p, (-0.95, 0.20, 2.05), (2.10, 1.30, 1.08), 5.4, 0.03),
        _lobulated_ellipsoid(p, (2.10, 0.62, -1.86), (1.30, 0.95, 0.78), 5.6, 0.03),
        _lobulated_ellipsoid(p, (0.35, 0.34, -1.95), (1.40, 1.04, 0.80), 5.6, 0.03),
        _lobulated_ellipsoid(p, (-1.55, 0.18, -2.12), (2.05, 1.28, 1.12), 5.3, 0.03),
        _lobulated_ellipsoid(p, (-0.70, -0.70, -0.68), (1.20, 0.80, 0.72), 5.4, 0.03),
    ]
    lungs = union(*lobes, k=0.34)
    # Shallow interlobar clefts keep the lobes readable as one lung organ group.
    fissures = [
        sweep(p, [(0.20, 1.25, 2.38), (0.10, 0.10, 2.72), (-0.10, -0.92, 2.50)], 0.12, step=0.22, blend=0.02),
        sweep(p, [(1.35, 1.12, -2.25), (1.12, 0.10, -2.56), (0.82, -0.70, -2.35)], 0.105, step=0.20, blend=0.02),
        sweep(p, [(-0.62, 1.18, -2.35), (-0.75, 0.05, -2.67), (-0.92, -0.80, -2.45)], 0.105, step=0.20, blend=0.02),
    ]
    for fissure in fissures:
        lungs = np.maximum(lungs, -fissure)
    return lungs


def pig_stomach(p):
    fundus = ellipsoid(p, (-4.25, 0.52, 0.92), (1.38, 1.32, 1.18))
    corpus = ellipsoid(p, (-3.35, -0.18, 0.32), (1.68, 1.14, 1.05))
    antrum = ellipsoid(p, (-2.25, -0.72, -0.18), (1.00, 0.76, 0.68))
    stomach = union(fundus, corpus, antrum, k=0.52)
    # Blind, conical fundic diverticulum on the greater curvature near cardia.
    diverticulum = ellipsoid(p, (-5.15, 1.55, 1.18), (0.82, 0.88, 0.75))
    neck = sweep(p, [(-4.75, 1.12, 1.0), (-5.02, 1.38, 1.10), (-5.24, 1.88, 1.24)],
                 [0.52, 0.37, 0.18], step=0.16, blend=0.03)
    stomach = union(stomach, diverticulum, neck, k=0.26)
    # Esophagus, duodenum, and torus pyloricus at the lesser-curvature exit.
    esophagus = sweep(p, [(-5.32, 1.32, 1.02), (-5.82, 1.72, 0.95), (-6.32, 1.92, 0.86)],
                      [0.36, 0.31, 0.28], step=0.18)
    torus = ellipsoid(p, (-1.73, -0.82, -0.12), (0.40, 0.42, 0.46))
    duodenum = sweep(p, [(-1.75, -0.82, -0.14), (-1.48, -1.35, -0.42),
                         (-2.18, -1.72, -0.78), (-3.25, -1.62, -0.82)],
                     [0.30, 0.28, 0.25, 0.23], step=0.20)
    return union(stomach, esophagus, torus, duodenum, k=0.16)


def pig_liver(p):
    lobes = [
        _lobulated_ellipsoid(p, (-2.45, 0.38, 2.20), (1.42, 1.62, 1.08), 7.0, 0.032),  # left lateral
        _lobulated_ellipsoid(p, (-1.88, -0.10, 0.95), (1.20, 1.48, 0.80), 7.2, 0.032), # left medial
        _lobulated_ellipsoid(p, (-1.82, -0.12, -0.87), (1.22, 1.46, 0.82), 7.2, 0.032),# right medial
        _lobulated_ellipsoid(p, (-2.40, 0.34, -2.18), (1.42, 1.62, 1.08), 7.0, 0.032),# right lateral
        _lobulated_ellipsoid(p, (-0.85, -0.85, 0.05), (0.80, 1.12, 0.62), 6.8, 0.028), # quadrate
        _lobulated_ellipsoid(p, (-3.72, 0.54, -0.86), (0.82, 1.04, 0.72), 6.8, 0.028), # caudate
    ]
    liver = union(*lobes, k=0.24)
    # Deep interlobar clefts, softened at the ends so the lobes remain connected.
    grooves = [
        sweep(p, [(-3.14, 1.62, 0.0), (-2.08, 0.78, 0.0), (-1.02, -0.28, 0.0)],
              [0.14, 0.18, 0.10], step=0.24, blend=0.02),
        sweep(p, [(-3.16, -0.08, 1.30), (-2.14, -0.84, 0.98), (-1.25, -1.52, 0.54)],
              [0.12, 0.16, 0.10], step=0.22, blend=0.02),
        sweep(p, [(-3.22, -0.10, -1.35), (-2.18, -0.82, -1.02), (-1.30, -1.50, -0.56)],
              [0.12, 0.16, 0.10], step=0.22, blend=0.02),
    ]
    for groove in grooves:
        liver = np.maximum(liver, -groove)
    return liver


def pig_gallbladder(p):
    sac = ellipsoid(p, (-1.08, -1.08, -0.82), (0.55, 0.86, 0.48))
    neck = sweep(p, [(-1.08, -0.45, -0.82), (-1.32, -0.05, -0.62),
                     (-1.80, 0.08, -0.35), (-2.28, -0.24, -0.32)],
                 [0.20, 0.16, 0.12, 0.10], step=0.15, blend=0.02)
    return union(sac, neck, k=0.12)


def pig_spleen(p):
    path = [(-3.75, 1.18, 2.04), (-4.15, 0.54, 2.20), (-4.75, -0.30, 2.28),
            (-5.38, -1.22, 2.24), (-6.02, -2.15, 2.12), (-6.68, -3.02, 1.92)]
    ra = [0.42, 0.55, 0.58, 0.55, 0.47, 0.30]
    rb = [0.18, 0.21, 0.22, 0.21, 0.19, 0.14]
    body = sweep(p, path, ra, rb, step=0.22, blend=0.10)
    # Slight broadening at the cranial end and a taper at the ventral tip.
    return union(body, ellipsoid(p, (-4.10, 0.62, 2.18), (0.48, 0.42, 0.28)), k=0.10)


def pig_pancreas(p):
    splenic = sweep(p, [(-5.00, 0.04, 1.72), (-4.38, 0.18, 1.30), (-3.55, 0.28, 0.72),
                        (-2.88, 0.34, 0.30)], [0.40, 0.48, 0.48, 0.38],
                    [0.30, 0.34, 0.32, 0.28], step=0.20, blend=0.06)
    connecting = sweep(p, [(-2.92, 0.30, 0.32), (-2.32, 0.48, 0.52), (-1.85, 0.40, 0.02),
                           (-2.22, 0.18, -0.52), (-3.00, 0.00, -0.38)],
                       [0.42, 0.47, 0.48, 0.42, 0.34], [0.30, 0.32, 0.32, 0.30, 0.26],
                       step=0.18, blend=0.06)
    duodenal = sweep(p, [(-3.02, 0.00, -0.38), (-3.58, -0.46, -0.70), (-4.00, -1.02, -0.74),
                         (-3.52, -1.42, -0.52), (-2.75, -1.22, -0.24)],
                     [0.42, 0.48, 0.46, 0.39, 0.30], [0.28, 0.31, 0.31, 0.28, 0.22],
                     step=0.18, blend=0.06)
    gland = union(splenic, connecting, duodenal, k=0.30)
    # Small surface nodules suggest the normal lobulated glandular surface.
    nodules = [ellipsoid(p, c, (0.26, 0.20, 0.23)) for c in [
        (-4.55, 0.48, 1.35), (-3.90, 0.62, 0.88), (-2.55, 0.68, 0.34),
        (-2.05, 0.47, -0.38), (-3.72, -0.72, -0.82), (-3.28, -1.20, -0.42)
    ]]
    return union(gland, *nodules, k=0.13)


def _spiral_path(center_x, center_z, turns, r0, r1, y0, y1, direction=1.0, samples=90):
    points, radii = [], []
    for i in range(samples):
        t = i / (samples - 1)
        ang = direction * (2 * math.pi * turns * t)
        r = (r0 - r1) * (1.0 - t) ** 0.78 + r1
        points.append((center_x + r * math.cos(ang), y0 + (y1 - y0) * t,
                       center_z + 0.86 * r * math.sin(ang)))
        # Gentle haustral swelling along the outer centripetal turns.
        radii.append(0.38 * (1.0 + 0.12 * math.cos(2 * math.pi * 8 * t)))
    return points, radii


def pig_spiral_colon(p):
    cx, cz = -8.15, 0.05
    outer, outer_r = _spiral_path(cx, cz, 3.25, 2.55, 0.50, -3.0, 1.08, 1.0, 96)
    inner, inner_r = _spiral_path(cx, cz, 3.25, 0.50, 1.60, 1.06, -2.72, -1.0, 88)
    centripetal = sweep(p, outer, outer_r, np.asarray(outer_r) * 0.88, step=0.26, blend=0.06)
    centrifugal = sweep(p, inner, np.asarray(inner_r) * 0.88, np.asarray(inner_r) * 0.82, step=0.27, blend=0.05)
    apex = sweep(p, [outer[-1], (-8.10, 1.38, 0.08), inner[0]], [0.40, 0.34, 0.34],
                 [0.36, 0.30, 0.30], step=0.18, blend=0.05)
    distal = sweep(p, [inner[-1], (-6.28, -2.75, 0.10), (-5.25, -2.25, 0.04)],
                   [0.31, 0.30, 0.25], [0.28, 0.27, 0.22], step=0.20, blend=0.05)
    colon = union(centripetal, centrifugal, apex, distal, k=0.14)
    # Two longitudinal taeniae are represented as narrow ridges along the outer turns.
    # Their shallow height keeps the colon silhouette continuous.
    return colon


def pig_cecum(p):
    body = sweep(p, [(-6.25, -0.92, 1.60), (-7.08, -1.35, 1.86),
                     (-7.90, -1.92, 1.84), (-8.62, -2.62, 1.54)],
                 [0.74, 0.78, 0.68, 0.48], [0.62, 0.62, 0.54, 0.40], step=0.20, blend=0.08)
    cap = ellipsoid(p, (-8.58, -2.58, 1.54), (0.52, 0.48, 0.46))
    cecum = union(body, cap, k=0.18)
    # Three soft longitudinal bands and shallow sacculations.
    return cecum


def _kidney(p, center, side):
    axes = np.array([[1.0, 0.0, 0.0], [0.0, 0.97, -0.22 * side], [0.0, 0.22 * side, 0.97]])
    bean = ellipsoid(p, center, (1.28, 0.62, 0.78), axes)
    cleft = ellipsoid(p, (center[0] + 0.10, center[1] - 0.02, center[2] - side * 0.66),
                      (0.62, 0.30, 0.46), axes)
    bean = np.maximum(bean, -cleft)
    return bean


def pig_kidneys(p):
    right = _kidney(p, (-5.80, 1.10, -1.45), -1.0)
    left = _kidney(p, (-6.46, 1.08, 1.45), 1.0)
    ureter_r = sweep(p, [(-5.72, 0.76, -1.42), (-6.72, 0.10, -0.98),
                         (-8.30, -0.68, -0.48), (-11.40, -1.34, -0.18)],
                     [0.14, 0.13, 0.11, 0.10], step=0.22, blend=0.03)
    ureter_l = sweep(p, [(-6.40, 0.75, 1.42), (-7.10, 0.00, 0.94),
                         (-8.42, -0.76, 0.46), (-11.38, -1.33, 0.16)],
                     [0.14, 0.13, 0.11, 0.10], step=0.22, blend=0.03)
    return union(right, left, ureter_r, ureter_l, k=0.08)


def pig_bladder(p):
    sac = ellipsoid(p, (-12.35, -1.20, 0.0), (1.52, 1.12, 1.05))
    apex = ellipsoid(p, (-11.35, -0.95, 0.0), (0.86, 0.78, 0.70))
    urethra = sweep(p, [(-13.55, -1.38, 0.0), (-14.40, -1.42, 0.0),
                        (-15.10, -1.32, 0.0)], [0.32, 0.25, 0.18], step=0.18, blend=0.04)
    return union(sac, apex, urethra, k=0.20)


@dataclass
class OrganSpec:
    name: str
    field: object
    lo: tuple[float, float, float]
    hi: tuple[float, float, float]
    cell: float


ORGANS = [
    OrganSpec("pig_os_rostri", pig_rostral_bone, (11.6, 0.2, -1.2), (15.2, 2.8, 1.2), 0.14),
    OrganSpec("pig_trachea_and_bronchus", pig_trachea, (-0.8, -0.5, -2.2), (13.2, 2.0, 2.2), 0.17),
    OrganSpec("pig_heart", pig_heart, (-1.6, -2.8, -2.4), (3.4, 3.0, 2.4), 0.16),
    OrganSpec("pig_lungs", pig_lungs, (-4.3, -2.0, -4.0), (3.8, 2.4, 4.0), 0.20),
    OrganSpec("pig_stomach_diverticulum", pig_stomach, (-6.6, -2.2, -2.0), (-1.2, 2.4, 2.2), 0.19),
    OrganSpec("pig_liver_lobules", pig_liver, (-5.0, -2.4, -4.0), (0.3, 2.3, 4.0), 0.18),
    OrganSpec("pig_gallbladder", pig_gallbladder, (-2.6, -2.0, -1.5), (-0.3, 0.5, 0.2), 0.13),
    OrganSpec("pig_spleen", pig_spleen, (-7.2, -3.5, 1.2), (-3.2, 1.8, 2.9), 0.16),
    OrganSpec("pig_pancreas", pig_pancreas, (-5.6, -2.0, -1.6), (-1.4, 1.3, 2.0), 0.17),
    OrganSpec("pig_spiral_colon", pig_spiral_colon, (-11.2, -3.6, -3.5), (-4.8, 1.8, 3.5), 0.19),
    OrganSpec("pig_cecum", pig_cecum, (-9.3, -3.2, 0.8), (-5.6, -0.4, 2.6), 0.17),
    OrganSpec("pig_kidneys", pig_kidneys, (-11.8, -1.8, -2.0), (-4.7, 1.9, 2.0), 0.17),
    OrganSpec("pig_urinary_bladder", pig_bladder, (-15.5, -2.8, -1.5), (-10.4, 0.4, 1.5), 0.16),
]


def _eval(fn, points, chunk=200_000):
    out = np.empty(len(points), dtype=np.float64)
    for i in range(0, len(points), chunk):
        out[i:i + chunk] = fn(points[i:i + chunk])
    return out


def _grid(lo, hi, h):
    axes = [np.arange(lo[i], hi[i] + 0.5 * h, h, dtype=np.float64) for i in range(3)]
    coords = np.meshgrid(*axes, indexing="ij")
    return np.stack(coords, axis=-1)


def _gradient(fn, vertices, eps):
    grad = np.empty_like(vertices)
    for axis in range(3):
        d = np.zeros(3, dtype=np.float64)
        d[axis] = eps
        grad[:, axis] = (_eval(fn, vertices + d) - _eval(fn, vertices - d)) / (2 * eps)
    return grad


def surface_nets(fn, lo, hi, h):
    grid = _grid(lo, hi, h)
    shape = grid.shape[:3]
    values = _eval(fn, grid.reshape(-1, 3)).reshape(shape)
    values[values == 0] = 1e-9
    cells_shape = tuple(s - 1 for s in shape)
    accum = np.zeros(cells_shape + (3,), dtype=np.float64)
    counts = np.zeros(cells_shape, dtype=np.float64)
    quads = []
    for axis in range(3):
        s0 = [slice(None)] * 3
        s1 = [slice(None)] * 3
        s0[axis], s1[axis] = slice(0, -1), slice(1, None)
        f0, f1 = values[tuple(s0)], values[tuple(s1)]
        crossing = (f0 < 0) != (f1 < 0)
        idx = np.argwhere(crossing)
        t = f0[crossing] / (f0[crossing] - f1[crossing])
        pos = np.asarray(lo, dtype=np.float64) + idx * h
        pos[:, axis] += t * h
        o1, o2 = [a for a in range(3) if a != axis]
        cell_corners, valid = [], np.ones(len(idx), dtype=bool)
        for d1, d2 in ((0, 0), (1, 0), (1, 1), (0, 1)):
            c = idx.copy()
            c[:, o1] -= d1
            c[:, o2] -= d2
            ok = ((c >= 0).all(1) & (c[:, 0] < cells_shape[0])
                  & (c[:, 1] < cells_shape[1]) & (c[:, 2] < cells_shape[2]))
            ci = tuple(c[ok].T)
            np.add.at(accum, ci, pos[ok])
            np.add.at(counts, ci, 1)
            cell_corners.append(c)
            valid &= ok
        quads.append(np.stack([c[valid] for c in cell_corners], axis=1))
    vertex_map = -np.ones(cells_shape, dtype=np.int64)
    active = counts > 0
    vertex_map[active] = np.arange(active.sum())
    vertices = accum[active] / counts[active][:, None]
    q = np.concatenate(quads, axis=0)
    qi = vertex_map[q[:, :, 0], q[:, :, 1], q[:, :, 2]]
    triangles = np.concatenate((qi[:, [0, 1, 2]], qi[:, [0, 2, 3]]), axis=0)

    for _ in range(2):
        value = _eval(fn, vertices)
        grad = _gradient(fn, vertices, h * 0.22)
        grad2 = np.maximum(np.einsum("ij,ij->i", grad, grad), 1e-8)
        step = (value / grad2)[:, None] * grad
        length = np.linalg.norm(step, axis=1)
        step *= np.minimum(1.0, (0.42 * h) / np.maximum(length, 1e-9))[:, None]
        vertices -= step
    normals = _gradient(fn, vertices, h * 0.22)
    normals /= np.maximum(np.linalg.norm(normals, axis=1), 1e-9)[:, None]
    a, b, c = vertices[triangles[:, 0]], vertices[triangles[:, 1]], vertices[triangles[:, 2]]
    face_normal = np.cross(b - a, c - a)
    flip = np.einsum("ij,ij->i", face_normal,
                     normals[triangles[:, 0]] + normals[triangles[:, 1]] + normals[triangles[:, 2]]) < 0
    triangles[flip] = triangles[flip][:, [0, 2, 1]]
    area2 = np.linalg.norm(np.cross(vertices[triangles[:, 1]] - vertices[triangles[:, 0]],
                                    vertices[triangles[:, 2]] - vertices[triangles[:, 0]]), axis=1)
    triangles = triangles[area2 > 1e-8]
    return vertices, normals, triangles


def build_pig_meshes(verbose=True):
    meshes = {}
    for spec in ORGANS:
        lo = np.asarray(spec.lo, dtype=np.float64)
        hi = np.asarray(spec.hi, dtype=np.float64)
        vertices, normals, triangles = surface_nets(spec.field, lo, hi, spec.cell)
        meshes[spec.name] = (vertices, normals, triangles)
        if verbose:
            print(f"{spec.name:28s} {len(vertices):7,d} vertices  {len(triangles):7,d} triangles", flush=True)
    return meshes
