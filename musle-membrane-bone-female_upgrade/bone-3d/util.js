function reloadKeep() {
  const p = camera.position.clone(), t = controls.target.clone();
  loadScene(curIdx); camera.position.copy(p); controls.target.copy(t); controls.update();
}
// 在 extra 面板加入滑桿：回傳 input
function slider(box, label, min, max, val, step, on) {
  const w = document.createElement('label'); w.className = 'sl';
  const b = document.createElement('b'); const inp = document.createElement('input');
  Object.assign(inp, { type: 'range', min, max, value: val, step });
  w.append(label + '：', b, inp); box.appendChild(w);
  const f = () => { b.textContent = inp.value; on(+inp.value); };
  inp.oninput = f; b.textContent = val;
  return inp;
}
function checkbox(box, label, val, on) {
  const w = document.createElement('label'); const c = document.createElement('input');
  c.type = 'checkbox'; c.checked = val; c.onchange = () => on(c.checked);
  w.append(c, ' ' + label); box.appendChild(w); return c;
}
function note(box, html, cls = 'note') { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; box.appendChild(d); return d; }
function partBy(zh) { return CUR.parts.find(p => p.zh === zh); }
function togglePart(zh, on) { const p = partBy(zh); if (!p) return; p.visible = on === undefined ? !p.visible : on; rebuildList(); refresh(); return p; }
// 讓構造跟著某個 Group 移動：meshes 已用 grp 的區域座標建立，anchor 也是區域座標
function attachPart(p, grp) { p._grp = grp; p._loc = p.anchor.clone(); p.meshes.forEach(m => grp.add(m)); return p; }
function updateAnchors() { CUR.parts.forEach(p => { if (p._grp) { p._grp.updateMatrixWorld(); p.anchor.copy(p._loc).applyMatrix4(p._grp.matrixWorld); } }); }

/* ===== 肌肉模型額外工具 ===== */
(function () {
  const st = document.createElement('style');
  st.textContent = '#extra .steps{display:flex;flex-direction:column;gap:3px;font-size:12px;line-height:1.4}' +
    '#extra .steps div{padding:3px 6px;border-radius:4px;background:#14263a;border:1px solid #2c4560;color:#b8c8d8}' +
    '#extra .steps div.on{background:#5a430c;border-color:#ffd479;color:#fff}' +
    '#extra .rd{font-size:12.5px;line-height:1.6;background:#0a1420;border:1px solid #2c4560;border-radius:6px;padding:4px 8px}' +
    '#extra .rd b{color:#ffd479}#extra .row2{display:flex;gap:4px;flex-wrap:wrap}#extra .row2 button{flex:1}';
  document.head.appendChild(st);
})();

// 肌節橫紋貼圖：一個肌節（Z→Z）畫在畫布垂直方向；沿圓柱長軸重複
function stripeTex(rep, pal) {
  pal = Object.assign({ I: '#f2d2cc', A: '#8e3330', H: '#b65650', Z: '#2a0c0c' }, pal || {});
  const cv = document.createElement('canvas'); cv.width = 4; cv.height = 256;
  const c = cv.getContext('2d'), H = 256, f = (a, b, col) => { c.fillStyle = col; c.fillRect(0, a * H, 4, (b - a) * H); };
  f(0, 1, pal.I); f(0.18, 0.82, pal.A); f(0.42, 0.58, pal.H); f(0.493, 0.507, pal.Z);
  f(0, 0.014, pal.Z); f(0.986, 1, pal.Z);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, rep); t.magFilter = THREE.LinearFilter;
  t.anisotropy = 4;
  return t;
}
// 帶貼圖材質
function tmat(tex, o = 1, extra = {}) { return mat(0xffffff, o, Object.assign({ map: tex }, extra)); }
// 兩點間圓柱（可指定材質）；回傳 mesh
function cylM(a, b, r, m, seg = 16, open = false) {
  const A = a.isVector3 ? a : V(...a), B = b.isVector3 ? b : V(...b), d = B.clone().sub(A);
  const ms = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg, 1, open), m);
  ms.position.copy(A.clone().add(B).multiplyScalar(0.5));
  ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return ms;
}
// 把單位圓柱（高 1、沿 y）擺到 a→b
const _Y = new THREE.Vector3(0, 1, 0);
function setCyl(m, a, b, r) {
  const d = b.clone().sub(a), L = d.length();
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(_Y, d.multiplyScalar(1 / (L || 1)));
  m.scale.set(r, L, r);
}
// 合併多個幾何（各自帶變換矩陣）成一個 BufferGeometry
function mergeGeo(items) {
  const pos = [], nor = [];
  items.forEach(([g, m]) => {
    const gg = (g.index ? g.toNonIndexed() : g.clone()); if (m) gg.applyMatrix4(m);
    pos.push(...gg.attributes.position.array); nor.push(...gg.attributes.normal.array); gg.dispose();
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return g;
}
const M4 = () => new THREE.Matrix4();
// 由「位置、朝向（把 +y 轉到 dir）、縮放」得到矩陣
function mtx(p, dir, s) {
  const q = new THREE.Quaternion();
  if (dir) q.setFromUnitVectors(_Y, V(...dir).normalize());
  return M4().compose(V(...p), q, s ? V(...s) : V(1, 1, 1));
}
// 虛線（非構造，僅示意放大關係）
function dash(a, b, col = 0x8fb8dd) {
  const g = new THREE.BufferGeometry().setFromPoints([V(...a), V(...b)]);
  const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color: col, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0.7 }));
  l.computeLineDistances(); CUR.root.add(l); return l;
}
// 大量小球（InstancedMesh）；pts 為 Vector3 陣列；回傳 mesh（可再更新 setP）
function dots(pts, r, col, o = 1, seg = 10) {
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 3));
  const m = new THREE.InstancedMesh(g, mat(col, o), Math.max(1, pts.length));
  const d = new THREE.Object3D();
  m.setP = (i, p, s = r) => { d.position.copy(p); d.scale.setScalar(s); d.updateMatrix(); m.setMatrixAt(i, d.matrix); };
  pts.forEach((p, i) => m.setP(i, p));
  m.count = pts.length; m.instanceMatrix.needsUpdate = true;
  return m;
}
// 實例化網格（任意幾何、矩陣陣列）
function inst(g, mats, col, o = 1) {
  const m = new THREE.InstancedMesh(g, mat(col, o), Math.max(1, mats.length));
  mats.forEach((x, i) => m.setMatrixAt(i, x)); m.count = mats.length; m.instanceMatrix.needsUpdate = true;
  return m;
}
// 步驟清單面板：回傳 set(i) 以高亮
function stepList(box, arr) {
  const d = document.createElement('div'); d.className = 'steps'; box.appendChild(d);
  const els = arr.map(t => { const e = document.createElement('div'); e.innerHTML = t; d.appendChild(e); return e; });
  return i => els.forEach((e, k) => e.classList.toggle('on', k === i));
}
function btn(box, label, fn) { const b = document.createElement('button'); b.textContent = label; b.onclick = fn; box.appendChild(b); return b; }
function btnRow(box, list) { const r = document.createElement('div'); r.className = 'row2'; box.appendChild(r); return list.map(([l, f]) => btn(r, l, f)); }
const clamp01 = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
// 每幀時間差（秒）
function dtClock() { let last = performance.now(); return () => { const n = performance.now(), d = Math.min(0.05, (n - last) / 1000); last = n; return d; }; }
// 沿折線（Vector3 陣列）依弧長比例取點
function alongPath(pts, t) {
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { tot += pts[i].distanceTo(pts[i - 1]); L.push(tot); }
  let s = clamp01(t) * tot;
  for (let i = 1; i < pts.length; i++) {
    if (s <= L[i - 1] || i === pts.length - 1) { const a = i > 1 ? L[i - 2] : 0, k = (s - a) / ((L[i - 1] - a) || 1); return pts[i - 1].clone().lerp(pts[i], clamp01(k)); }
  }
  return pts[pts.length - 1].clone();
}

/* ===== 骨骼模型額外工具 ===== */
const BONE = 0xeadcbc, CART = 0xbfe3f0, MARY = 0xf2d060, MARR = 0xc23a3a;
// 半個旋轉體（保留 z<0 的後半，剖面朝向 +z）；prof: [[r,y]...]
function halfLathe(prof, col, o = 1, front = false, seg = 40) {
  const g = new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(Math.max(0.0001, p[0]), p[1])), seg, front ? -Math.PI / 2 : Math.PI / 2, Math.PI);
  return new THREE.Mesh(g, mat(col, o));
}
// 由外/內輪廓產生剖面（z=0 平面）；outer、inner 為 [[r,y]...]（y 遞增），inner 可省略
function cutFace(outer, inner, col, o = 1, tex) {
  const sh = new THREE.Shape();
  outer.forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1]));
  for (let i = outer.length - 1; i >= 0; i--) sh.lineTo(-outer[i][0], outer[i][1]);
  if (inner && inner.length) {
    const h = new THREE.Path();
    inner.forEach((p, i) => i ? h.lineTo(p[0], p[1]) : h.moveTo(p[0], p[1]));
    for (let i = inner.length - 1; i >= 0; i--) h.lineTo(-inner[i][0], inner[i][1]);
    sh.holes.push(h);
  }
  const g = new THREE.ShapeGeometry(sh);
  if (tex) { // 以 x、y 當 UV
    const uv = [], p = g.attributes.position;
    for (let i = 0; i < p.count; i++) uv.push(p.getX(i) * 0.25, p.getY(i) * 0.25);
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  }
  return new THREE.Mesh(g, tex ? mat(0xffffff, o, { map: tex, transparent: true, alphaTest: 0.05 }) : mat(col, o));
}
// 一般多邊形（[[x,y]...]）擠出：沿 -z 方向厚 depth，前面在 z=z0
function extrudePoly(pts, depth, col, o = 1, z0 = 0, bevel = 0) {
  const sh = new THREE.Shape(); pts.forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1]));
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 8 });
  g.translate(0, 0, z0 - depth);
  return new THREE.Mesh(g, mat(col, o));
}
// 沿折線兩側偏移形成帶狀多邊形（膜、韌帶的剖面）
function bandPts(line, th) {
  const L = line.map(p => new THREE.Vector2(p[0], p[1])), a = [], b = [];
  for (let i = 0; i < L.length; i++) {
    const p0 = L[Math.max(0, i - 1)], p1 = L[Math.min(L.length - 1, i + 1)], d = p1.clone().sub(p0).normalize(), n = new THREE.Vector2(-d.y, d.x);
    a.push([L[i].x + n.x * th / 2, L[i].y + n.y * th / 2]); b.unshift([L[i].x - n.x * th / 2, L[i].y - n.y * th / 2]);
  }
  return a.concat(b);
}
// 海綿骨貼圖：骨小樑網（不透明）＋骨髓（半透明紅）
function spongyTex(seed = 3, marrow = 'rgba(190,50,50,0.55)') {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'), r = rnd(seed);
  c.fillStyle = marrow; c.fillRect(0, 0, 256, 256);
  const pts = []; for (let i = 0; i < 46; i++) pts.push([r() * 256, r() * 256]);
  c.strokeStyle = '#ecdcbc'; c.lineCap = 'round';
  pts.forEach((p, i) => {
    pts.map((q, j) => [j, Math.hypot(q[0] - p[0], q[1] - p[1])]).filter(x => x[0] !== i).sort((x, y) => x[1] - y[1]).slice(0, 3).forEach(([j]) => {
      for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) { c.lineWidth = 5 + r() * 5; c.beginPath(); c.moveTo(p[0] + dx, p[1] + dy); c.lineTo(pts[j][0] + dx, pts[j][1] + dy); c.stroke(); }
    });
  });
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
