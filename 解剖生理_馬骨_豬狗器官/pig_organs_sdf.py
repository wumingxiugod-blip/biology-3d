"""Porcine (Sus scrofa domesticus) visceral organ 3D mesh generator.

Anatomical coordinate convention (matching dog_model_data.js and index.html):
  +X = cranial (head/snout), -X = caudal (tail/pelvis)
  +Y = dorsal (spine),       -Y = ventral (belly)
  +Z = left (camera side),   -Z = right

Anatomical references:
  - UMN Dissection Lab Guide: Part 5 Porcine Abdominal Viscera
  - IMAIOS vet-Anatomy: Porcine thorax & abdomen
  - Key species features accurately modeled:
      1. Os rostri (pyramidal rostral bone) + rostral cartilage disk
      2. Tracheal bronchus branching from right wall cranial to carina -> R cranial lobe
      3. Lobed lungs (Right: cranial, middle, caudal, accessory; Left: cranial, caudal)
      4. Heart with right-sided vena cava & proportional aortic arch below dorsal lung border
      5. Deeply lobed liver (L/R lateral & medial, quadrate, caudate) + right-medial gallbladder
      6. Stomach with cranial esophagus, caudodorsal gastric diverticulum & torus pyloricus
      7. Narrow strap-like spleen along left greater curvature
      8. Three-lobed pancreas forming portal ring
      9. Convoluted small intestine (duodenum, jejunum, ileum) on right/ventral abdomen
     10. Left-sided cylindrical sacculated cecum pointing caudoventrally
     11. Left-sided conical spiral colon: BROAD BASE DORSAL, APEX VENTRAL
         (outer sacculated centripetal coils + inner smooth centrifugal coils -> descending colon)
     12. Symmetrical dorsoventrally flattened smooth kidneys + ureters -> urinary bladder
"""
from __future__ import annotations

import math
from dataclasses import dataclass
import numpy as np


# ---------------------------------------------------------------------------
# Smooth analytical mesh & SDF utilities
# ---------------------------------------------------------------------------
def _norm(v):
    v = np.asarray(v, dtype=np.float64)
    return np.linalg.norm(v, axis=-1)


def _unit(v):
    v = np.asarray(v, dtype=np.float64)
    n = float(np.linalg.norm(v))
    return v / max(n, 1e-12)


def smin(a, b, k=0.0):
    if k <= 0:
        return np.minimum(a, b)
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1.0 - h) + a * h - k * h * (1.0 - h)


def smax(a, b, k=0.0):
    return -smin(-a, -b, k)


def union(*fields, k=0.0):
    out = fields[0]
    for f in fields[1:]:
        out = smin(out, f, k)
    return out


def rot_matrix(rx=0.0, ry=0.0, rz=0.0):
    cx, sx = math.cos(rx), math.sin(rx)
    cy, sy = math.cos(ry), math.sin(ry)
    cz, sz = math.cos(rz), math.sin(rz)
    Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]], dtype=np.float64)
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], dtype=np.float64)
    Rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]], dtype=np.float64)
    return Rz @ Ry @ Rx


def ellipsoid(p, center, radii, rot=None):
    q = p - np.asarray(center, dtype=np.float64)
    if rot is not None:
        q = q @ rot
    r = np.asarray(radii, dtype=np.float64)
    qr = q / r
    k0 = _norm(qr)
    k1 = _norm(qr / r)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)


def capsule(p, a, b, r):
    a = np.asarray(a, dtype=np.float64)
    b = np.asarray(b, dtype=np.float64)
    pa = p - a
    ba = b - a
    h = np.clip(np.dot(pa, ba) / max(float(np.dot(ba, ba)), 1e-12), 0.0, 1.0)
    return _norm(pa - np.outer(h, ba)) - r


def torus_x(p, center, major, minor):
    q = p - np.asarray(center, dtype=np.float64)
    radial = np.sqrt(q[:, 1] ** 2 + q[:, 2] ** 2)
    return np.sqrt((radial - major) ** 2 + q[:, 0] ** 2) - minor


def _frame(direction, up=(0.0, 1.0, 0.0)):
    t = _unit(direction)
    up = np.asarray(up, dtype=np.float64)
    if abs(float(np.dot(t, up))) > 0.92:
        up = np.array((0.0, 0.0, 1.0))
    n = _unit(np.cross(t, up))
    b = _unit(np.cross(t, n))
    return t, n, b


def catmull_rom(control, step=0.22):
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
            pt = 0.5 * ((2 * p1) + (-p0 + p2) * t
                        + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
                        + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
            out.append(pt)
            param.append(i - 1 + t)
    out.append(pts[-1])
    param.append(float(len(pts) - 1))
    return np.asarray(out), np.asarray(param)


def sweep(p, control, ra, rb=None, step=0.22, blend=0.05):
    ctrl = np.asarray(control, dtype=np.float64)
    points, param = catmull_rom(ctrl, step)
    if np.isscalar(ra):
        ra_vals = np.full(len(points), float(ra))
    else:
        ra_vals = np.interp(param, np.arange(len(ctrl)), np.asarray(ra, dtype=np.float64))
    if rb is None:
        rb_vals = ra_vals.copy()
    elif np.isscalar(rb):
        rb_vals = np.full(len(points), float(rb))
    else:
        rb_vals = np.interp(param, np.arange(len(ctrl)), np.asarray(rb, dtype=np.float64))

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
        ra_i = ra_vals[i] + u * (ra_vals[i + 1] - ra_vals[i])
        rb_i = rb_vals[i] + u * (rb_vals[i + 1] - rb_vals[i])
        across = off @ n
        depth = off @ w
        cap = 0.5 * length + np.minimum(ra_i, rb_i)
        k0 = np.sqrt((across / ra_i) ** 2 + (depth / rb_i) ** 2 + (axial / cap) ** 2)
        d = (k0 - 1.0) * np.minimum(ra_i, rb_i)
        result = d if i == 0 else smin(result, d, blend)
    return result


# ---------------------------------------------------------------------------
# Parametric smooth tube mesh builder (ideal for crisp spiral colon & intestines)
# ---------------------------------------------------------------------------
def build_tube_mesh(points, radii_a, radii_b=None, radial_segs=18, haustra_amp=0.0, haustra_freq=0.0, cap_ends=True):
    pts = np.asarray(points, dtype=np.float64)
    n_pts = len(pts)
    ra = np.full(n_pts, float(radii_a)) if np.isscalar(radii_a) else np.asarray(radii_a, dtype=np.float64)
    rb = ra.copy() if radii_b is None else (np.full(n_pts, float(radii_b)) if np.isscalar(radii_b) else np.asarray(radii_b, dtype=np.float64))

    # Parallel transport frame for twist-free smooth tubes
    tangents = np.zeros_like(pts)
    tangents[0] = _unit(pts[1] - pts[0])
    tangents[-1] = _unit(pts[-1] - pts[-2])
    for i in range(1, n_pts - 1):
        tangents[i] = _unit(pts[i + 1] - pts[i - 1])

    normals = np.zeros_like(pts)
    binormals = np.zeros_like(pts)
    _, n0, b0 = _frame(tangents[0])
    normals[0], binormals[0] = n0, b0
    for i in range(1, n_pts):
        t_prev, t_cur = tangents[i - 1], tangents[i]
        axis = np.cross(t_prev, t_cur)
        sin_a = float(np.linalg.norm(axis))
        cos_a = float(np.clip(np.dot(t_prev, t_cur), -1.0, 1.0))
        if sin_a < 1e-8:
            normals[i] = normals[i - 1]
        else:
            axis /= sin_a
            ang = math.atan2(sin_a, cos_a)
            # Rodrigues rotation
            v = normals[i - 1]
            normals[i] = v * math.cos(ang) + np.cross(axis, v) * math.sin(ang) + axis * np.dot(axis, v) * (1 - math.cos(ang))
        normals[i] = _unit(normals[i] - np.dot(normals[i], t_cur) * t_cur)
        binormals[i] = _unit(np.cross(t_cur, normals[i]))

    # Arc length for haustra modulation
    segs = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    arc = np.concatenate(([0.0], np.cumsum(segs)))

    verts = []
    vnorms = []
    angles = np.linspace(0, 2 * math.pi, radial_segs, endpoint=False)
    for i in range(n_pts):
        h_mod = 1.0
        if haustra_amp > 0.0 and haustra_freq > 0.0:
            # Smooth scalloped haustra pouches with two longitudinal taeniae grooves
            h_mod = 1.0 + haustra_amp * math.sin(arc[i] * haustra_freq)
        for j, ang in enumerate(angles):
            ca, sa = math.cos(ang), math.sin(ang)
            # Subtle taeniae flattening at top/bottom if haustra enabled
            taenia = 1.0 - (0.09 * (abs(sa) ** 4) if haustra_amp > 0.0 else 0.0)
            r_a = ra[i] * h_mod * taenia
            r_b = rb[i] * h_mod * taenia
            offset = normals[i] * (r_a * ca) + binormals[i] * (r_b * sa)
            verts.append(pts[i] + offset)
            nrm = _unit(normals[i] * (ca / max(r_a, 1e-5)) + binormals[i] * (sa / max(r_b, 1e-5)))
            vnorms.append(nrm)

    tris = []
    for i in range(n_pts - 1):
        row0 = i * radial_segs
        row1 = (i + 1) * radial_segs
        for j in range(radial_segs):
            jn = (j + 1) % radial_segs
            tris.append([row0 + j, row1 + j, row1 + jn])
            tris.append([row0 + j, row1 + jn, row0 + jn])

    if cap_ends:
        # Start dome cap
        c0_idx = len(verts)
        verts.append(pts[0] - tangents[0] * (0.45 * min(ra[0], rb[0])))
        vnorms.append(-tangents[0])
        for j in range(radial_segs):
            jn = (j + 1) % radial_segs
            tris.append([c0_idx, jn, j])
        # End dome cap
        c1_idx = len(verts)
        last_row = (n_pts - 1) * radial_segs
        verts.append(pts[-1] + tangents[-1] * (0.45 * min(ra[-1], rb[-1])))
        vnorms.append(tangents[-1])
        for j in range(radial_segs):
            jn = (j + 1) % radial_segs
            tris.append([c1_idx, last_row + j, last_row + jn])

    return np.asarray(verts, dtype=np.float64), np.asarray(vnorms, dtype=np.float64), np.asarray(tris, dtype=np.int64)


def merge_meshes(mesh_list):
    all_v, all_n, all_t = [], [], []
    offset = 0
    for v, n, t in mesh_list:
        all_v.append(v)
        all_n.append(n)
        all_t.append(t + offset)
        offset += len(v)
    return np.vstack(all_v), np.vstack(all_n), np.vstack(all_t)


# ---------------------------------------------------------------------------
# Porcine organ SDF definitions (clean, anatomically accurate proportions)
# ---------------------------------------------------------------------------
def pig_os_rostri_sdf(p):
    # Pyramidal wedge-shaped rostral bone + oval nasal disk / rostral cartilage
    # Positioned at cranial snout landmark (x ~ 8.8..10.1, y ~ 1.05, z = 0)
    bone_core = ellipsoid(p, (9.18, 1.02, 0.0), (0.68, 0.44, 0.42), rot_matrix(rz=0.14))
    bone_tip = ellipsoid(p, (9.58, 1.12, 0.0), (0.38, 0.30, 0.34))
    disk = ellipsoid(p, (9.88, 1.05, 0.0), (0.20, 0.68, 0.80))
    rim = torus_x(p, (9.90, 1.05, 0.0), 0.64, 0.14)
    # Two subtle nostril indentations on the cranial face of the snout disk
    nostril_l = ellipsoid(p, (10.08, 1.05, 0.34), (0.22, 0.22, 0.20))
    nostril_r = ellipsoid(p, (10.08, 1.05, -0.34), (0.22, 0.22, 0.20))
    snout = union(bone_core, bone_tip, disk, rim, k=0.14)
    snout = smax(snout, -nostril_l, 0.06)
    snout = smax(snout, -nostril_r, 0.06)
    return snout


def pig_trachea_sdf(p):
    # Realistic neck length: larynx at x=6.75 -> carina at x=2.35
    larynx = ellipsoid(p, (6.85, 0.95, 0.0), (0.55, 0.44, 0.40))
    main = sweep(p, [(6.70, 0.94, 0.0), (5.20, 0.78, 0.0), (3.70, 0.58, 0.0), (2.35, 0.42, 0.0)],
                 0.30, 0.28, step=0.18, blend=0.05)
    # Left & right principal bronchi from carina
    left_br = sweep(p, [(2.40, 0.42, 0.0), (1.70, 0.24, 0.65), (1.05, 0.08, 1.20)],
                    [0.26, 0.22, 0.17], [0.24, 0.20, 0.16], step=0.16, blend=0.04)
    right_br = sweep(p, [(2.40, 0.42, 0.0), (1.70, 0.24, -0.65), (1.05, 0.08, -1.20)],
                     [0.26, 0.22, 0.17], [0.24, 0.20, 0.16], step=0.16, blend=0.04)
    # Signature porcine TRACHEAL BRONCHUS (Bronchus trachealis):
    # branches off RIGHT lateral wall (-Z) cranial to carina (at x=3.65) -> right cranial lung lobe!
    tracheal_br = sweep(p, [(3.65, 0.58, -0.10), (3.45, 0.66, -0.68), (3.25, 0.68, -1.28)],
                        [0.20, 0.17, 0.14], [0.19, 0.16, 0.13], step=0.14, blend=0.04)
    airway = union(larynx, main, left_br, right_br, tracheal_br, k=0.12)
    # Crisp C-shaped tracheal cartilage rings
    for i in range(22):
        t = i / 21.0
        x = 6.40 - 3.90 * t
        y = 0.90 - 0.46 * t
        ring = torus_x(p, (x, y, 0.0), 0.315, 0.036)
        airway = smin(airway, ring, 0.025)
    return airway


def pig_heart_sdf(p):
    # Oblique conical heart in ventral thorax, apex pointing caudoventrally & slightly left (+Z)
    rot = rot_matrix(rx=0.12, ry=0.08, rz=-0.32)
    lv = ellipsoid(p, (2.25, -0.68, 0.28), (0.95, 1.25, 0.72), rot)
    rv = ellipsoid(p, (2.55, -0.48, -0.28), (0.88, 1.08, 0.68), rot)
    apex = ellipsoid(p, (1.92, -1.35, 0.22), (0.55, 0.62, 0.48), rot)
    la = ellipsoid(p, (2.45, 0.36, 0.36), (0.62, 0.52, 0.56))
    ra = ellipsoid(p, (2.78, 0.42, -0.34), (0.64, 0.54, 0.58))
    heart = union(lv, rv, apex, la, ra, k=0.40)

    # Subtle interventricular sulcus
    sulcus = sweep(p, [(2.68, 0.05, 0.65), (2.42, -0.58, 0.72), (2.05, -1.18, 0.48)], 0.06, step=0.15)
    heart = smax(heart, -sulcus, 0.05)

    # Proportional aortic arch (stays cleanly INSIDE thoracic dorsal contour y <= 1.48)
    aorta = sweep(p, [(2.42, 0.50, 0.05), (2.68, 1.15, 0.12), (2.05, 1.45, 0.16),
                      (1.05, 1.42, 0.14), (0.10, 1.32, 0.12)],
                  [0.32, 0.30, 0.26, 0.24, 0.22], step=0.16, blend=0.05)
    # Pulmonary trunk curving left-dorsally
    pulm = sweep(p, [(2.72, 0.35, -0.10), (2.58, 0.88, 0.22), (2.08, 1.02, 0.48)],
                 [0.25, 0.22, 0.18], step=0.15, blend=0.04)
    # Cranial & Caudal Vena Cava on the RIGHT side (-Z!) entering right atrium
    cr_vc = sweep(p, [(2.85, 0.48, -0.44), (3.45, 0.68, -0.52), (4.15, 0.78, -0.48)],
                  [0.24, 0.22, 0.20], step=0.16, blend=0.04)
    cd_vc = sweep(p, [(2.48, 0.12, -0.45), (1.65, -0.12, -0.48), (0.80, -0.22, -0.42)],
                  [0.24, 0.23, 0.22], step=0.16, blend=0.04)
    return union(heart, aorta, pulm, cr_vc, cd_vc, k=0.14)


def pig_lungs_sdf(p):
    # Smooth, contoured pleural lung lobes hugging the heart with concave diaphragmatic base
    # LEFT LUNG (+Z): 2 lobes (Cranial lobe w/ cranial & caudal parts + Caudal lobe)
    l_cr_a = ellipsoid(p, (3.45, 0.45, 1.28), (1.05, 0.82, 0.66), rot_matrix(rz=-0.18))
    l_cr_b = ellipsoid(p, (2.45, -0.15, 1.38), (0.92, 0.92, 0.68), rot_matrix(rz=0.10))
    l_caud = ellipsoid(p, (1.15, 0.55, 1.48), (1.42, 1.22, 0.82), rot_matrix(rz=0.22))
    left_lung = union(l_cr_a, l_cr_b, l_caud, k=0.26)
    # Interlobar fissure on left lung (separating cranial & caudal lobes)
    l_fiss = sweep(p, [(2.25, 1.42, 1.72), (1.98, 0.42, 2.08), (1.72, -0.62, 1.88)], 0.085, step=0.16, blend=0.02)
    left_lung = smax(left_lung, -l_fiss, 0.04)

    # RIGHT LUNG (-Z): 4 lobes (Cranial, Middle, Caudal, Accessory)
    r_cr = ellipsoid(p, (3.55, 0.52, -1.26), (1.12, 0.86, 0.68), rot_matrix(rz=-0.16))
    r_mid = ellipsoid(p, (2.32, -0.18, -1.36), (0.92, 0.94, 0.68), rot_matrix(rz=0.10))
    r_caud = ellipsoid(p, (0.98, 0.58, -1.48), (1.48, 1.24, 0.84), rot_matrix(rz=0.22))
    r_acc = ellipsoid(p, (1.10, -0.62, -0.45), (0.78, 0.56, 0.46), rot_matrix(rz=0.15))
    right_lung = union(r_cr, r_mid, r_caud, r_acc, k=0.24)
    # Interlobar fissures on right lung (cranial/middle & middle/caudal)
    r_fiss1 = sweep(p, [(2.95, 1.28, -1.62), (2.78, 0.35, -1.98), (2.55, -0.58, -1.78)], 0.08, step=0.16, blend=0.02)
    r_fiss2 = sweep(p, [(1.98, 1.42, -1.72), (1.72, 0.38, -2.10), (1.48, -0.68, -1.90)], 0.085, step=0.16, blend=0.02)
    right_lung = smax(right_lung, -r_fiss1, 0.04)
    right_lung = smax(right_lung, -r_fiss2, 0.04)

    lungs = np.minimum(left_lung, right_lung)
    # Carve clean cardiac impression so heart sits snugly without clipping
    cardiac_cut = ellipsoid(p, (2.40, -0.55, 0.05), (1.28, 1.35, 0.92))
    lungs = smax(lungs, -cardiac_cut, 0.14)
    # Carve concave diaphragmatic surface at caudal face so liver nestles behind lungs
    diaph_cut = ellipsoid(p, (-0.75, -0.25, 0.0), (1.25, 1.75, 2.35))
    lungs = smax(lungs, -diaph_cut, 0.18)
    return lungs


def pig_liver_sdf(p):
    # Dome-shaped deeply lobed porcine liver immediately caudal to diaphragm (x ~ -1.5..+0.35)
    # Extends slightly more to right (-Z); concave caudally to cradle stomach
    ll = ellipsoid(p, (-0.75, 0.22, 1.42), (0.72, 1.18, 0.68), rot_matrix(rx=0.15, ry=0.22))
    lm = ellipsoid(p, (-0.42, -0.18, 0.62), (0.68, 1.12, 0.56), rot_matrix(ry=0.10))
    rm = ellipsoid(p, (-0.40, -0.18, -0.64), (0.70, 1.14, 0.58), rot_matrix(ry=-0.10))
    rl = ellipsoid(p, (-0.78, 0.28, -1.52), (0.76, 1.24, 0.72), rot_matrix(rx=-0.15, ry=-0.22))
    quad = ellipsoid(p, (-0.28, -0.78, -0.05), (0.48, 0.62, 0.42))
    caud = ellipsoid(p, (-1.22, 0.72, -1.18), (0.58, 0.62, 0.56))
    liver = union(ll, lm, rm, rl, quad, caud, k=0.20)

    # Clean interlobar fissures on ventral/cranial margins
    cleft_mid = sweep(p, [(-0.15, 0.65, 0.0), (-0.05, -0.35, 0.0), (-0.25, -1.25, 0.0)], 0.065, step=0.16)
    cleft_l = sweep(p, [(-0.45, 0.55, 1.05), (-0.30, -0.45, 0.98), (-0.52, -1.25, 0.88)], 0.065, step=0.16)
    cleft_r = sweep(p, [(-0.45, 0.55, -1.08), (-0.30, -0.45, -1.02), (-0.52, -1.25, -0.92)], 0.065, step=0.16)
    for cl in (cleft_mid, cleft_l, cleft_r):
        liver = smax(liver, -cl, 0.03)
    # Subtle visceral concavity on caudal-left side for the stomach
    stom_imp = ellipsoid(p, (-2.35, 0.05, 0.75), (1.15, 1.15, 1.20))
    liver = smax(liver, -stom_imp, 0.16)
    return liver


def pig_gallbladder_sdf(p):
    # Pear-shaped sac nestled on caudal-ventral visceral surface between right medial & quadrate lobes
    sac = ellipsoid(p, (-0.78, -0.92, -0.62), (0.34, 0.54, 0.30), rot_matrix(rz=-0.20))
    duct = sweep(p, [(-0.82, -0.48, -0.60), (-1.05, -0.18, -0.45), (-1.45, -0.22, -0.42)],
                 [0.12, 0.09, 0.07], step=0.12, blend=0.02)
    return union(sac, duct, k=0.08)


def pig_stomach_sdf(p):
    # Simple C/J-shaped stomach in LEFT cranial abdomen (+Z), caudal to liver
    # Esophagus enters from CRANIAL (+X) dorsal aspect through diaphragm!
    fundus = ellipsoid(p, (-2.65, 0.45, 0.95), (0.98, 0.95, 0.88))
    body = ellipsoid(p, (-2.18, -0.25, 0.32), (1.12, 0.86, 0.82), rot_matrix(ry=-0.20))
    pyloric_antrum = ellipsoid(p, (-1.62, -0.65, -0.45), (0.72, 0.56, 0.56))
    stomach = union(fundus, body, pyloric_antrum, k=0.38)

    # Signature porcine GASTRIC DIVERTICULUM: conical blind pouch projecting caudodorsally from fundus
    divert = sweep(p, [(-2.95, 0.88, 1.12), (-3.32, 1.24, 1.32), (-3.62, 1.48, 1.46)],
                   [0.52, 0.38, 0.20], step=0.12, blend=0.04)
    stomach = union(stomach, divert, k=0.18)

    # Esophagus coming from CRANIAL (+X) dorsal thorax into cardia!
    esoph = sweep(p, [(-2.22, 0.98, 0.52), (-1.35, 1.15, 0.25), (-0.25, 1.12, 0.12), (1.05, 1.02, 0.08)],
                  [0.24, 0.20, 0.19, 0.19], step=0.18, blend=0.04)

    # Signature porcine TORUS PYLORICUS (muscular prominence at pyloric exit) + cranial duodenum
    torus_pyl = ellipsoid(p, (-1.32, -0.66, -0.78), (0.28, 0.30, 0.32))
    duod = sweep(p, [(-1.32, -0.66, -0.82), (-1.45, -0.52, -1.28), (-2.15, -0.35, -1.42), (-2.95, -0.45, -1.35)],
                 [0.22, 0.20, 0.19, 0.18], step=0.16, blend=0.04)
    return union(stomach, esoph, torus_pyl, duod, k=0.12)


def pig_spleen_sdf(p):
    # Signature porcine STRAP-LIKE SPLEEN: long, narrow, flat strap along LEFT (+Z) greater curvature
    path = [(-2.55, 1.28, 1.82), (-2.92, 0.62, 1.98), (-3.32, -0.10, 2.04),
            (-3.68, -0.82, 1.96), (-4.02, -1.48, 1.76)]
    ra = [0.24, 0.34, 0.36, 0.33, 0.22]   # cranial-caudal strap width
    rb = [0.10, 0.12, 0.12, 0.11, 0.09]   # medial-lateral flatness
    return sweep(p, path, ra, rb, step=0.16, blend=0.06)


def pig_pancreas_sdf(p):
    # Three-lobed porcine pancreas forming a ring around the portal vein region
    # Nestled dorsal-caudal to stomach and along proximal duodenum
    left_lobe = sweep(p, [(-3.45, 0.38, 1.15), (-3.00, 0.42, 0.65), (-2.55, 0.44, 0.18)],
                      [0.28, 0.34, 0.32], [0.20, 0.24, 0.22], step=0.15, blend=0.05)
    # Portal ring (body + connecting lobe looping around portal vein)
    ring_top = sweep(p, [(-2.55, 0.44, 0.18), (-2.15, 0.56, -0.15), (-2.38, 0.32, -0.58)],
                     [0.30, 0.28, 0.26], [0.20, 0.20, 0.18], step=0.14, blend=0.05)
    ring_bot = sweep(p, [(-2.55, 0.44, 0.18), (-2.68, 0.08, -0.18), (-2.38, 0.32, -0.58)],
                     [0.26, 0.24, 0.26], [0.18, 0.18, 0.18], step=0.14, blend=0.05)
    right_lobe = sweep(p, [(-2.38, 0.32, -0.58), (-2.42, -0.05, -0.96), (-2.88, -0.32, -1.12)],
                       [0.28, 0.30, 0.24], [0.20, 0.22, 0.18], step=0.15, blend=0.05)
    return union(left_lobe, ring_top, ring_bot, right_lobe, k=0.16)


def pig_kidneys_sdf(p):
    # Signature porcine SYMMETRICAL dorsoventrally flattened smooth kidneys (retroperitoneal, dorsal roof)
    def _bean(center, side):
        rot = rot_matrix(rx=0.14 * side)
        body = ellipsoid(p, center, (0.95, 0.42, 0.62), rot)
        hilum = ellipsoid(p, (center[0] + 0.05, center[1] - 0.04, center[2] - side * 0.50), (0.45, 0.22, 0.34), rot)
        return smax(body, -hilum, 0.06)

    # Nearly identical craniocaudal position (x = -5.15 vs -5.35) — classic pig feature!
    right_k = _bean((-5.15, 1.58, -1.18), -1.0)
    left_k = _bean((-5.35, 1.58, 1.18), 1.0)
    # Ureters coursing caudally along dorsal wall into dorsal bladder neck
    u_r = sweep(p, [(-5.15, 1.32, -0.95), (-6.10, 0.82, -0.72), (-7.25, 0.18, -0.40), (-8.35, -0.42, -0.16)],
                [0.10, 0.09, 0.085, 0.08], step=0.18, blend=0.02)
    u_l = sweep(p, [(-5.35, 1.32, 0.95), (-6.22, 0.80, 0.72), (-7.30, 0.16, 0.40), (-8.35, -0.42, 0.16)],
                [0.10, 0.09, 0.085, 0.08], step=0.18, blend=0.02)
    return union(right_k, left_k, u_r, u_l, k=0.06)


def pig_bladder_sdf(p):
    # Pear-shaped urinary bladder at caudal pelvic inlet (x ~ -8.0..-9.8) + pelvic urethra
    body = ellipsoid(p, (-8.75, -0.68, 0.0), (1.05, 0.76, 0.72), rot_matrix(rz=-0.10))
    apex = ellipsoid(p, (-8.05, -0.52, 0.0), (0.58, 0.52, 0.48))
    urethra = sweep(p, [(-9.65, -0.82, 0.0), (-10.35, -0.88, 0.0), (-10.95, -0.82, 0.0)],
                    [0.24, 0.18, 0.14], step=0.15, blend=0.03)
    return union(body, apex, urethra, k=0.14)


# ---------------------------------------------------------------------------
# Direct high-precision parametric builders for Intestines, Cecum & Spiral Colon
# ---------------------------------------------------------------------------
def build_pig_spiral_colon_mesh():
    """Conical spiral colon in LEFT abdomen (+Z):
    BROAD BASE DORSAL (y = +0.75), BLUNT APEX VENTRAL (y = -2.25).
    Outer centripetal coils (sacculated/haustrated) spiral DOWN to ventral apex;
    Inner centrifugal coils (narrower, smooth) spiral BACK UP to dorsal base -> descending colon.
    """
    cx, cz = -5.65, 0.82
    y_top, y_bot = 0.78, -2.22

    # 1. Outer Centripetal Coils (3.25 turns spiraling downward from base to apex)
    n_out = 160
    outer_pts, outer_r = [], []
    turns = 3.25
    for i in range(n_out):
        t = i / (n_out - 1)
        ang = 2.0 * math.pi * turns * t
        r = 1.62 * (1.0 - t) ** 0.78 + 0.34
        y = y_top + (y_bot - y_top) * t
        outer_pts.append((cx + r * math.cos(ang), y, cz + 0.85 * r * math.sin(ang)))
        outer_r.append(0.32 - 0.05 * t)
    m_outer = build_tube_mesh(outer_pts, outer_r, np.asarray(outer_r) * 0.90,
                              radial_segs=18, haustra_amp=0.14, haustra_freq=5.2, cap_ends=False)

    # 2. Ventral Central Flexure (U-turn at the ventral apex)
    p_end = np.asarray(outer_pts[-1])
    inner_start = np.array([cx + 0.24 * math.cos(2.0 * math.pi * turns), y_bot - 0.08,
                            cz + 0.85 * 0.24 * math.sin(2.0 * math.pi * turns)])
    apex_pts, _ = catmull_rom([p_end, np.array([cx, y_bot - 0.24, cz]), inner_start], step=0.10)
    m_apex = build_tube_mesh(apex_pts, 0.25, 0.23, radial_segs=16, haustra_amp=0.0, cap_ends=False)

    # 3. Inner Centrifugal Coils (3.0 turns spiraling UPWARD inside the cone, narrower & smooth!)
    n_in = 140
    inner_pts, inner_r = [], []
    for i in range(n_in):
        t = i / (n_in - 1)
        ang = 2.0 * math.pi * turns - 2.0 * math.pi * 3.0 * t
        r = 0.24 + 0.85 * (t ** 0.85)
        y = (y_bot - 0.08) + (y_top + 0.12 - (y_bot - 0.08)) * t
        inner_pts.append((cx + r * math.cos(ang), y, cz + 0.85 * r * math.sin(ang)))
        inner_r.append(0.22)
    m_inner = build_tube_mesh(inner_pts, inner_r, radial_segs=16, haustra_amp=0.0, cap_ends=False)

    # 4. Distal loop -> Transverse & Descending Colon running caudodorsally to rectum
    desc_ctrl = [
        inner_pts[-1],
        (-5.25, 1.05, 0.35),
        (-6.35, 1.08, 0.12),
        (-7.85, 0.82, 0.05),
        (-9.45, 0.42, 0.02),
        (-10.65, 0.25, 0.0),
    ]
    desc_pts, _ = catmull_rom(desc_ctrl, step=0.16)
    m_desc = build_tube_mesh(desc_pts, 0.24, 0.22, radial_segs=16, haustra_amp=0.0, cap_ends=True)

    return merge_meshes([m_outer, m_apex, m_inner, m_desc])


def build_pig_cecum_mesh():
    """Cylindrical sacculated cecum in LEFT caudodorsal abdomen (+Z),
    base continuous with spiral colon dorsally, blunt apex pointing caudoventrally.
    """
    ctrl = [
        (-5.10, 0.65, 1.95),   # Base near spiral colon origin (left dorsal)
        (-5.85, 0.30, 2.20),
        (-6.68, -0.18, 2.18),
        (-7.42, -0.72, 1.92),
        (-7.92, -1.18, 1.55),  # Blunt caudoventral apex
    ]
    pts, param = catmull_rom(ctrl, step=0.12)
    radii = np.interp(param, np.arange(len(ctrl)), [0.46, 0.56, 0.54, 0.46, 0.32])
    return build_tube_mesh(pts, radii, radii * 0.88, radial_segs=20,
                           haustra_amp=0.13, haustra_freq=4.5, cap_ends=True)


def build_pig_small_intestine_mesh():
    """Convoluted jejunum & ileum coils on RIGHT & VENTRAL abdomen (-Z),
    connecting duodenum to the left-sided ileocecal junction.
    """
    # Smooth meandering intestinal loops in the right/ventral abdominal space
    ctrl = [
        (-2.95, -0.45, -1.35),  # Continues from descending duodenum
        (-3.65, -0.88, -1.78),
        (-4.45, -1.35, -1.45),
        (-3.85, -1.68, -0.78),
        (-4.85, -1.85, -0.95),
        (-5.65, -1.52, -1.75),
        (-5.25, -0.75, -1.88),
        (-6.25, -0.82, -1.55),
        (-6.78, -1.48, -1.15),
        (-6.05, -1.92, -0.58),
        (-7.15, -1.72, -0.42),
        (-7.45, -1.02, -0.68),
        (-6.65, -0.45, -0.35),
        (-6.00, 0.05, 0.45),    # Terminal ileum crossing to left side
        (-5.45, 0.42, 1.55),    # Enters ileocecal / cecocolic junction
    ]
    pts, _ = catmull_rom(ctrl, step=0.12)
    return build_tube_mesh(pts, 0.21, 0.20, radial_segs=14, haustra_amp=0.0, cap_ends=True)


# ---------------------------------------------------------------------------
# Surface Nets isosurface extractor (higher resolution & Laplacian smoothing)
# ---------------------------------------------------------------------------
@dataclass
class OrganSpec:
    name: str
    field: object
    lo: tuple[float, float, float]
    hi: tuple[float, float, float]
    cell: float


SDF_ORGANS = [
    OrganSpec("pig_os_rostri", pig_os_rostri_sdf, (8.2, 0.0, -1.2), (10.5, 2.1, 1.2), 0.095),
    OrganSpec("pig_trachea_and_bronchus", pig_trachea_sdf, (0.6, -0.3, -1.7), (7.6, 1.6, 1.6), 0.11),
    OrganSpec("pig_heart", pig_heart_sdf, (-0.3, -2.2, -1.4), (4.5, 1.85, 1.4), 0.12),
    OrganSpec("pig_lungs", pig_lungs_sdf, (-1.1, -1.5, -2.7), (4.9, 2.1, 2.7), 0.145),
    OrganSpec("pig_liver_lobules", pig_liver_sdf, (-2.2, -1.75, -2.5), (0.6, 1.75, 2.4), 0.13),
    OrganSpec("pig_gallbladder", pig_gallbladder_sdf, (-1.75, -1.65, -1.15), (-0.25, 0.05, -0.15), 0.085),
    OrganSpec("pig_stomach_diverticulum", pig_stomach_sdf, (-4.1, -1.5, -1.8), (1.3, 1.95, 2.1), 0.135),
    OrganSpec("pig_spleen", pig_spleen_sdf, (-4.6, -2.0, 1.3), (-2.0, 1.75, 2.5), 0.11),
    OrganSpec("pig_pancreas", pig_pancreas_sdf, (-3.95, -0.8, -1.55), (-1.7, 0.95, 1.6), 0.11),
    OrganSpec("pig_kidneys", pig_kidneys_sdf, (-8.7, -0.75, -2.1), (-4.0, 2.25, 2.1), 0.125),
    OrganSpec("pig_urinary_bladder", pig_bladder_sdf, (-11.3, -1.7, -1.1), (-7.2, 0.35, 1.1), 0.115),
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
        if len(idx) == 0:
            continue
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

    # Project vertices onto exact zero-level isosurface for silk-smooth medical shading
    for _ in range(3):
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
    for spec in SDF_ORGANS:
        lo = np.asarray(spec.lo, dtype=np.float64)
        hi = np.asarray(spec.hi, dtype=np.float64)
        v, n, t = surface_nets(spec.field, lo, hi, spec.cell)
        meshes[spec.name] = (v, n, t)
        if verbose:
            print(f"{spec.name:28s} {len(v):7,d} vertices  {len(t):7,d} triangles", flush=True)

    # Parametric tubular organs (crisp spiral colon, sacculated cecum, convoluted small intestine)
    for name, fn in [
        ("pig_small_intestine", build_pig_small_intestine_mesh),
        ("pig_cecum", build_pig_cecum_mesh),
        ("pig_spiral_colon", build_pig_spiral_colon_mesh),
    ]:
        v, n, t = fn()
        meshes[name] = (v, n, t)
        if verbose:
            print(f"{name:28s} {len(v):7,d} vertices  {len(t):7,d} triangles", flush=True)

    return meshes
