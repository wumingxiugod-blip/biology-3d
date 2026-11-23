/* 共用工具：材質、幾何輔助函式、構造註冊 */
const SCENES = [];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const PV = arr => arr.map(p => new THREE.Vector3(p[0], p[1], p[2] || 0));
const CUR = { parts: [], root: null };

function mat(c, o = 1, extra = {}) {
  return new THREE.MeshStandardMaterial(Object.assign({
    color: c, roughness: 0.55, metalness: 0.0, transparent: o < 1, opacity: o,
    depthWrite: o >= 0.9, side: THREE.DoubleSide
  }, extra));
}
const _sph = new THREE.SphereGeometry(1, 32, 22);
// 橢球
function ell(pos, sc, col, o = 1) {
  const m = new THREE.Mesh(_sph, mat(col, o));
  m.position.set(pos[0], pos[1], pos[2] || 0);
  m.scale.set(sc[0], sc[1], sc[2]);
  return m;
}
// 沿點列的管子（Catmull-Rom）
function tube(pts, r, col, o = 1, segMul = 10) {
  const p = (pts[0] && pts[0].isVector3) ? pts : PV(pts);
  const curve = new THREE.CatmullRomCurve3(p, false, 'centripetal');
  const g = new THREE.TubeGeometry(curve, Math.max(12, p.length * segMul), r, 10, false);
  const m = new THREE.Mesh(g, mat(col, o));
  m.userData.curve = curve;
  return m;
}
// 沿曲線外圍的螺旋點列（用於動脈纏繞、附睪迂曲等）
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
function ring(pos, tangent, R, r, col, o = 1) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(R, r, 12, 32), mat(col, o));
  m.position.copy(pos);
  m.quaternion.setFromUnitVectors(V(0, 0, 1), tangent.clone().normalize());
  return m;
}
// 圓環柱（沿 +z 擠出）
function annulus(ro, ri, len, col, o = 1, z0 = 0) {
  const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, Math.PI * 2, false);
  if (ri > 0) { const h = new THREE.Path(); h.absarc(0, 0, ri, 0, Math.PI * 2, true); s.holes.push(h); }
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false, curveSegments: 48 });
  const m = new THREE.Mesh(g, mat(col, o)); m.position.z = z0; return m;
}
// 實心圓柱（沿 +z）
function disc(r, len, col, o = 1, x = 0, y = 0, z0 = 0) {
  const m = annulus(r, 0, len, col, o, z0); m.position.x = x; m.position.y = y; return m;
}
// 兩點間圓柱
function cyl(a, b, r, col, o = 1) {
  const A = V(...a), B = V(...b), d = B.clone().sub(A);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 16), mat(col, o));
  m.position.copy(A.clone().add(B).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return m;
}
function cone(a, b, r, col, o = 1) { // 底在 a、尖在 b
  const A = V(...a), B = V(...b), d = B.clone().sub(A);
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, d.length(), 16), mat(col, o));
  m.position.copy(A.clone().add(B).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return m;
}
// 部分球殼（開窗剖面用）
function shell(r, sc, col, o, phiStart, phiLen, thStart = 0, thLen = Math.PI) {
  const g = new THREE.SphereGeometry(r, 48, 32, phiStart, phiLen, thStart, thLen);
  const m = new THREE.Mesh(g, mat(col, o)); m.scale.set(sc[0], sc[1], sc[2]); return m;
}
function rnd(seed) { // 可重現亂數
  let s = seed || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/**
 * 註冊一個解剖構造
 * @param grp 分組名稱  zh 中文名  en 英文名  info 功能說明(HTML)
 * @param meshes Mesh 或陣列  opt {anchor:[x,y,z], hidden, nolabel}
 */
function reg(grp, zh, en, info, meshes, opt = {}) {
  meshes = [].concat(meshes);
  const part = { grp, zh, en, info, meshes, visible: !opt.hidden, label: !opt.nolabel, anchor: null };
  meshes.forEach(m => { m.userData.part = part; CUR.root.add(m); });
  if (opt.anchor) part.anchor = V(...opt.anchor);
  else {
    const b = new THREE.Box3().setFromObject(meshes[0]);
    part.anchor = b.getCenter(new THREE.Vector3());
  }
  CUR.parts.push(part);
  return part;
}
