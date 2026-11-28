/* 共用工具：醫學插畫風格程序化材質、有機幾何雕塑輔助函式、構造註冊 */
const SCENES = [];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const PV = arr => arr.map(p => new THREE.Vector3(p[0], p[1], p[2] || 0));
const CUR = { parts: [], root: null, tick: null };

function rnd(seed) { // 可重現亂數
  let s = seed || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/* ===== 3D / 2D 雜訊（有機外形與柔霧組織紋理） ===== */
const _P = new Uint8Array(512);
(() => {
  const r = rnd(2026), p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) _P[i] = p[i & 255];
})();
const _h = (x, y, z) => _P[_P[_P[x & 255] + (y & 255)] + (z & 255)] / 255;
const _sm = t => t * t * (3 - 2 * t), _lp = (a, b, t) => a + (b - a) * t;

function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const u = _sm(x - xi), v = _sm(y - yi), w = _sm(z - zi);
  const c = (a, b, d) => _h(xi + a, yi + b, zi + d);
  return _lp(
    _lp(_lp(c(0, 0, 0), c(1, 0, 0), u), _lp(c(0, 1, 0), c(1, 1, 0), u), v),
    _lp(_lp(c(0, 0, 1), c(1, 0, 1), u), _lp(c(0, 1, 1), c(1, 1, 1), u), v),
    w
  ) * 2 - 1;
}
function fbm3(x, y, z, oct = 3) {
  let a = 0.5, f = 1, s = 0;
  for (let i = 0; i < oct; i++) { s += a * noise3(x * f, y * f, z * f); a *= 0.5; f *= 2.02; }
  return s;
}
function noise2p(x, y, P, layer) {
  const xi = Math.floor(x), yi = Math.floor(y), u = _sm(x - xi), v = _sm(y - yi);
  const c = (a, b) => _h(((xi + a) % P + P) % P, ((yi + b) % P + P) % P, layer);
  return _lp(_lp(c(0, 0), c(1, 0), u), _lp(c(0, 1), c(1, 1), u), v);
}

/* ===== 程序化醫學插畫紋理（柔霧細膩組織、微血管網、肌纖維束） ===== */
const TEX = {};
(function makeTextures() {
  if (typeof document === 'undefined') return;
  const N = 256, mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return c; };
  const cCol = mk(), cBump = mk(), cNet = mk(), cFib = mk();
  const xc = cCol.getContext('2d'), xb = cBump.getContext('2d'), xn = cNet.getContext('2d'), xf = cFib.getContext('2d');
  const dc = xc.createImageData(N, N), db = xb.createImageData(N, N), dn = xn.createImageData(N, N), df = xf.createImageData(N, N);

  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N, v = y / N, i = (y * N + x) * 4;
    const h = 0.55 * noise2p(u * 8, v * 8, 8, 1) + 0.30 * noise2p(u * 16, v * 16, 16, 2) + 0.15 * noise2p(u * 32, v * 32, 32, 3);
    const m = noise2p(u * 6, v * 6, 6, 4);
    const b = Math.max(0, Math.min(255, 128 + (h - 0.5) * 140));
    db.data[i] = db.data[i + 1] = db.data[i + 2] = b; db.data[i + 3] = 255;

    const k = 0.94 - 0.08 * m + 0.05 * (h - 0.5);
    dc.data[i] = 255 * k; dc.data[i + 1] = 252 * k; dc.data[i + 2] = 248 * k; dc.data[i + 3] = 255;

    const kn = 0.96 - 0.05 * m;
    dn.data[i] = 255 * kn; dn.data[i + 1] = 250 * kn; dn.data[i + 2] = 245 * kn; dn.data[i + 3] = 255;

    const fib = 0.65 * noise2p(u * 4, v * 48, 48, 5) + 0.35 * noise2p(u * 8, v * 96, 96, 6);
    const kf = 0.78 + 0.22 * fib;
    df.data[i] = 255 * kf; df.data[i + 1] = 246 * kf; df.data[i + 2] = 242 * kf; df.data[i + 3] = 255;
  }
  xc.putImageData(dc, 0, 0); xb.putImageData(db, 0, 0); xn.putImageData(dn, 0, 0); xf.putImageData(df, 0, 0);

  // 細緻表層微血管網（睪丸白膜、膀胱壁等）
  const r = rnd(42);
  const drawBranch = (ctx, x, y, ang, w, steps, depth, style) => {
    const pts = [[x, y]];
    for (let s = 0; s < steps; s++) {
      ang += (r() - 0.5) * 0.6; x += Math.cos(ang) * 4.5; y += Math.sin(ang) * 4.5; pts.push([x, y]);
      if (depth < 2 && r() < 0.09) drawBranch(ctx, x, y, ang + (r() < 0.5 ? 1 : -1) * (0.45 + r() * 0.6), w * 0.65, (steps * 0.55) | 0, depth + 1, style);
    }
    ctx.strokeStyle = style; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = w;
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
      ctx.beginPath();
      pts.forEach(([px, py], j) => j ? ctx.lineTo(px + ox * N, py + oy * N) : ctx.moveTo(px + ox * N, py + oy * N));
      ctx.stroke();
    }
  };
  for (let k = 0; k < 10; k++) drawBranch(xn, r() * N, r() * N, r() * 6.28, 1.8, 36, 0, 'rgba(170,35,45,0.42)');
  for (let k = 0; k < 6; k++) drawBranch(xn, r() * N, r() * N, r() * 6.28, 1.4, 30, 0, 'rgba(70,95,170,0.28)');

  const mkTex = (c, srgb) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (srgb && THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
    return t;
  };
  TEX.color = mkTex(cCol, true);
  TEX.bump = mkTex(cBump, false);
  TEX.vnet = mkTex(cNet, true);
  TEX.fiber = mkTex(cFib, true);
})();

function scaleUV(g, sx, sy) {
  const uv = g.attributes.uv;
  if (!uv) return g;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * sx, uv.getY(i) * sy);
  uv.needsUpdate = true;
  return g;
}

/**
 * 醫學插畫風格柔霧組織材質（低油光、柔和次表面層次）
 * extra 可指定 tex:'color'|'vnet'|'fiber'|'none'、bump 強度
 */
function mat(c, o = 1, extra = {}) {
  const e = Object.assign({}, extra);
  const texKey = e.tex !== undefined ? e.tex : 'color';
  const bump = e.bump !== undefined ? e.bump : 0.75;
  delete e.tex; delete e.bump;
  const m = new THREE.MeshPhysicalMaterial(Object.assign({
    color: c,
    roughness: 0.62,
    metalness: 0.0,
    clearcoat: 0.14,
    clearcoatRoughness: 0.55,
    transparent: o < 1,
    opacity: o,
    depthWrite: o >= 0.9,
    side: THREE.DoubleSide,
    map: (texKey === 'none' || !TEX[texKey]) ? null : TEX[texKey],
    bumpMap: (bump && TEX.bump) ? (texKey === 'fiber' ? TEX.fiber : TEX.bump) : null,
    bumpScale: 0.004 * bump
  }, e));
  if (m.color && m.color.convertSRGBToLinear) m.color.convertSRGBToLinear();
  m.userData.hex = c;
  return m;
}

const _sph = new THREE.SphereGeometry(1, 36, 26);
_sph.userData.shared = true;
scaleUV(_sph, 2, 2);

// 基礎橢球
function ell(pos, sc, col, o = 1, extra = {}) {
  const m = new THREE.Mesh(_sph, mat(col, o, extra));
  m.position.set(pos[0], pos[1], pos[2] || 0);
  m.scale.set(sc[0], sc[1], sc[2]);
  return m;
}

// 有機雕塑橢球（柔順 fBm 表面起伏，避免塑膠球感）
function blob(pos, sc, col, o = 1, opt = {}) {
  const g = new THREE.SphereGeometry(1, 48, 34);
  const p = g.attributes.position;
  const amp = opt.amp !== undefined ? opt.amp : 0.055;
  const f = opt.freq || 2.1;
  const sd = opt.seed || 1.3;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const d = 1 + amp * fbm3(x * f + sd, y * f, z * f - sd, 3);
    p.setXYZ(i, x * d, y * d, z * d);
  }
  g.computeVertexNormals();
  scaleUV(g, 2, 2);
  const m = new THREE.Mesh(g, mat(col, o, Object.assign({ tex: opt.tex || 'color' }, opt.extra || {})));
  m.position.set(pos[0], pos[1], pos[2] || 0);
  m.scale.set(sc[0], sc[1], sc[2]);
  return m;
}

// 圓潤解剖旋轉體（如陰莖頭龜頭帽、膀胱梨形體、輸精管乳頭）
function latheBody(profilePts, col, o = 1, segs = 32, extra = {}) {
  const pts = profilePts.map(([r, y]) => new THREE.Vector2(Math.max(0.0005, r), y));
  const g = new THREE.LatheGeometry(pts, segs);
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat(col, o, extra));
}

// 可變管徑平滑管（沿點列依 rFn(t) 變化粗細，用於附睪、輸精管、陰莖等）
function vTube(pts, rFn, col, o = 1, segMul = 10, radialSegs = 14, extra = {}) {
  const p = (pts[0] && pts[0].isVector3) ? pts : PV(pts);
  const curve = new THREE.CatmullRomCurve3(p, false, 'centripetal');
  const steps = Math.max(16, Math.round(p.length * segMul));
  const frames = curve.computeFrenetFrames(steps, false);
  const pos = [], uvs = [], idx = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const c = curve.getPointAt(t);
    const r = typeof rFn === 'function' ? rFn(t) : rFn;
    const N = frames.normals[i], B = frames.binormals[i];
    for (let j = 0; j <= radialSegs; j++) {
      const u = j / radialSegs, a = u * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      pos.push(
        c.x + (N.x * ca + B.x * sa) * r,
        c.y + (N.y * ca + B.y * sa) * r,
        c.z + (N.z * ca + B.z * sa) * r
      );
      uvs.push(t * 4, u * 2);
    }
  }
  const stride = radialSegs + 1;
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * stride + j, b = (i + 1) * stride + j;
      idx.push(a, b, b + 1, a, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat(col, o, extra));
  m.userData.curve = curve;
  return m;
}

// 沿點列的管子（Catmull-Rom）
function tube(pts, r, col, o = 1, segMul = 10, extra = {}) {
  const p = (pts[0] && pts[0].isVector3) ? pts : PV(pts);
  const curve = new THREE.CatmullRomCurve3(p, false, 'centripetal');
  const g = new THREE.TubeGeometry(curve, Math.max(14, p.length * segMul), r, 12, false);
  scaleUV(g, Math.max(1, curve.getLength() * 1.5), 1);
  const m = new THREE.Mesh(g, mat(col, o, extra));
  m.userData.curve = curve;
  return m;
}

// 沿曲線外圍的螺旋點列
function helixAlong(curve, rad, turns, phase = 0, n = 300) {
  const frames = curve.computeFrenetFrames(n, false);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = curve.getPointAt(t);
    const a = phase + t * turns * Math.PI * 2;
    pts.push(p.clone().addScaledVector(frames.normals[i], Math.cos(a) * rad)
      .addScaledVector(frames.binormals[i], Math.sin(a) * rad));
  }
  return pts;
}
function lineCurve(a, b) { return new THREE.LineCurve3(V(...a), V(...b)); }

// 環形（括約肌）
function ring(pos, tangent, R, r, col, o = 1, extra = {}) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(R, r, 16, 36), mat(col, o, Object.assign({ tex: 'fiber' }, extra)));
  m.position.copy(pos);
  m.quaternion.setFromUnitVectors(V(0, 0, 1), tangent.clone().normalize());
  return m;
}

// 圓環柱（沿 +z 擠出，具微倒角質感）
function annulus(ro, ri, len, col, o = 1, z0 = 0, extra = {}) {
  const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, Math.PI * 2, false);
  if (ri > 0) { const h = new THREE.Path(); h.absarc(0, 0, ri, 0, Math.PI * 2, true); s.holes.push(h); }
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.008, bevelSegments: 2, curveSegments: 48 });
  const m = new THREE.Mesh(g, mat(col, o, extra)); m.position.z = z0; return m;
}
// 實心圓柱（沿 +z）
function disc(r, len, col, o = 1, x = 0, y = 0, z0 = 0, extra = {}) {
  const m = annulus(r, 0, len, col, o, z0, extra); m.position.x = x; m.position.y = y; return m;
}
// 兩點間圓柱
function cyl(a, b, r, col, o = 1, extra = {}) {
  const A = V(...a), B = V(...b), d = B.clone().sub(A);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 20), mat(col, o, extra));
  m.position.copy(A.clone().add(B).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return m;
}
// 圓潤錐體（取代生硬幾何錐）
function cone(a, b, r, col, o = 1, extra = {}) {
  const A = V(...a), B = V(...b), d = B.clone().sub(A), L = d.length();
  const prof = [
    [0.001, -L * 0.5], [r * 0.85, -L * 0.46], [r, -L * 0.30],
    [r * 0.78, L * 0.05], [r * 0.42, L * 0.36], [r * 0.14, L * 0.48], [0.001, L * 0.5]
  ];
  const m = latheBody(prof, col, o, 24, extra);
  m.position.copy(A.clone().add(B).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return m;
}
// 部分球殼（開窗剖面用）
function shell(r, sc, col, o, phiStart, phiLen, thStart = 0, thLen = Math.PI, extra = {}) {
  const g = new THREE.SphereGeometry(r, 56, 36, phiStart, phiLen, thStart, thLen);
  scaleUV(g, 2, 2);
  const m = new THREE.Mesh(g, mat(col, o, extra)); m.scale.set(sc[0], sc[1], sc[2]); return m;
}

/**
 * 註冊一個解剖構造
 * @param grp 分組名稱  zh 中文名  en 英文名  info 功能說明(HTML)
 * @param meshes Mesh 或陣列  opt {anchor:[x,y,z], hidden, nolabel, wall, wallO}
 */
function reg(grp, zh, en, info, meshes, opt = {}) {
  meshes = [].concat(meshes);
  const part = {
    grp, zh, en, info, meshes,
    visible: !opt.hidden,
    label: !opt.nolabel,
    wall: !!opt.wall,
    wallO: opt.wallO || 0.82,
    anchor: null
  };
  meshes.forEach(m => { m.userData.part = part; CUR.root.add(m); });
  if (opt.anchor) part.anchor = V(...opt.anchor);
  else {
    const b = new THREE.Box3().setFromObject(meshes[0]);
    part.anchor = b.getCenter(new THREE.Vector3());
  }
  CUR.parts.push(part);
  return part;
}
