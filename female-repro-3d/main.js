/* 主程式：場景管理、互動、標籤、介面 */
let renderer, scene3, camera, controls, curIdx = -1, selected = null, labelEls = [], keyLight, XRAY = false;
const $ = id => document.getElementById(id);
const cvBox = $('cv');

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  // 寫實渲染：sRGB 輸出、電影色調映射、柔和陰影
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  cvBox.insertBefore(renderer.domElement, cvBox.firstChild);
  scene3 = new THREE.Scene();
  scene3.environment = studioEnv();
  [TEX.color, TEX.bump, TEX.vnet, TEX.fiber, TEX.fiberV].forEach(t => t.anisotropy = renderer.capabilities.getMaxAnisotropy());
  camera = new THREE.PerspectiveCamera(40, 1, 0.05, 200);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.1; controls.autoRotateSpeed = 1.2;
  scene3.add(new THREE.HemisphereLight(0xfff4ec, 0x3a3038, 0.35));
  keyLight = new THREE.DirectionalLight(0xfff1e6, 1.5); keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048); keyLight.shadow.bias = -0.0004; keyLight.shadow.normalBias = 0.02;
  scene3.add(keyLight, keyLight.target);
  const rim = new THREE.DirectionalLight(0xb8ccff, 0.55); rim.position.set(-5, 3, -6); scene3.add(rim);
  addEventListener('resize', resize); resize();

  const tabs = $('tabs');
  SCENES.forEach((s, i) => {
    const b = document.createElement('div'); b.className = 'tab'; b.textContent = s.name;
    b.onclick = () => loadScene(i); tabs.appendChild(b);
  });
  $('lm').onchange = refresh; $('iso').onchange = refresh;
  $('xray').onchange = () => { XRAY = $('xray').checked; refresh(); };
  $('rot').onchange = () => controls.autoRotate = $('rot').checked;
  $('reset').onclick = resetCam;
  $('wbtn').onclick = () => { document.body.classList.toggle('wide'); resize(); };
  if (/wide/.test(location.search)) { document.body.classList.add('wide'); resize(); }
  $('showall').onclick = () => { CUR.parts.forEach(p => p.visible = true); rebuildList(); refresh(); };

  // 點選與滑鼠移過
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  let down = null, lastMove = 0;
  const el = renderer.domElement;
  function pick(ev) {
    const r = el.getBoundingClientRect();
    mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(CUR.root.children, true)
      .filter(h => h.object.userData.part && h.object.userData.part.visible && h.object.visible);
    if (!hits.length) return null;
    const solid = hits.find(h => h.object.material.userData.effO >= 0.5);
    return (solid || hits[0]).object.userData.part;
  }
  el.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
  el.addEventListener('pointerup', e => {
    if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 5) select(pick(e));
    down = null;
  });
  el.addEventListener('pointermove', e => {
    if (e.buttons) { $('tip').style.display = 'none'; return; }
    const now = performance.now(); if (now - lastMove < 60) return; lastMove = now;
    const p = pick(e), t = $('tip');
    if (p) { t.textContent = p.zh; t.style.display = 'block'; t.style.left = e.clientX + 12 + 'px'; t.style.top = e.clientY + 12 + 'px'; el.style.cursor = 'pointer'; }
    else { t.style.display = 'none'; el.style.cursor = 'default'; }
  });
  loadScene(Math.min(SCENES.length - 1, Math.max(0, parseInt(location.hash.slice(1) || '0', 10) || 0)));
  (function loop() { requestAnimationFrame(loop); stepFly(); controls.update(); if (CUR.tick) CUR.tick(); renderer.render(scene3, camera); updateLabels(); })();
}

// 攝影棚式環境光（柔光箱反射），供濕潤組織的高光與反射
function studioEnv() {
  const pm = new THREE.PMREMGenerator(renderer), s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), new THREE.MeshBasicMaterial({ color: 0x4a4d55, side: THREE.BackSide })));
  const panel = (w, h, pos, k, col) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
  };
  panel(6, 4, [0, 5.9, 0.5], 7, 0xffffff);     // 頂光
  panel(3, 3, [5.9, 2, 3], 5, 0xffe8d8);       // 主光（暖）
  panel(3, 2.5, [-5.9, 1, 1], 2.5, 0xd8e4ff);  // 補光（冷）
  panel(5, 1.2, [0, 0.5, 5.9], 2, 0xffffff);   // 正面條燈
  panel(4, 1.5, [0, -5.9, 0], 0.6, 0xffd8d0);  // 地面反光
  const env = pm.fromScene(s, 0.03).texture; pm.dispose(); return env;
}

// 依場景大小放置主光與陰影接收地面
function fitLighting() {
  const bb = new THREE.Box3();
  CUR.root.traverse(o => { if (o.isMesh && o.userData.part) bb.expandByObject(o); });
  if (bb.isEmpty()) return;
  const c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3()), R = Math.max(sz.x, sz.y, sz.z) * 0.75 + 0.5;
  keyLight.position.copy(c).add(V(R * 0.35, R * 1.6, R * 0.9)); keyLight.target.position.copy(c);
  const sc = keyLight.shadow.camera; sc.left = sc.bottom = -R; sc.right = sc.top = R; sc.near = 0.1; sc.far = R * 5; sc.updateProjectionMatrix();
  const g = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.28 }));
  g.rotation.x = -Math.PI / 2; g.scale.set(sz.x * 2 + 3, sz.z * 2 + 3, 1); g.position.set(c.x, bb.min.y - 0.04, c.z);
  g.receiveShadow = true; CUR.root.add(g);
}

function resize() {
  const w = cvBox.clientWidth, h = cvBox.clientHeight;
  renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
}

function loadScene(i) {
  if (CUR.root) { scene3.remove(CUR.root); CUR.root.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); }); }
  curIdx = i; selected = null; CUR.parts = []; CUR.tick = null; fly = null;
  CUR.root = new THREE.Group(); scene3.add(CUR.root);
  const sc = SCENES[i];
  $('extra').innerHTML = '';
  sc.build();
  // 記錄原始透明度，供孤立顯示使用
  CUR.parts.forEach(p => p.meshes.forEach(m => {
    m.material.userData.baseO = m.material.opacity;
    m.material.userData.baseC = m.material.emissive.getHex();
  }));
  fitLighting();
  XRAY = !!sc.xray; $('xray').checked = XRAY;
  [...$('tabs').children].forEach((t, k) => t.classList.toggle('on', k === i));
  $('desc').innerHTML = '<h2>' + sc.title + '</h2>' + sc.desc;
  if (sc.controls) sc.controls.forEach(c => {
    const b = document.createElement('button'); b.textContent = c.label; b.onclick = c.fn; $('extra').appendChild(b);
  });
  $('info').innerHTML = '<div class="hint">👆 點擊 3D 模型或標籤／清單，即可查看解剖名稱與功能。</div>';
  // 標籤
  $('labels').innerHTML = ''; $('svg').innerHTML = ''; labelEls = [];
  CUR.parts.forEach(p => {
    const d = document.createElement('div'); d.className = 'lab';
    d.innerHTML = p.zh + '<small>' + p.en + '</small>';
    d.onclick = () => select(p);
    $('labels').appendChild(d);
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('stroke', '#7fb6e8'); ln.setAttribute('stroke-width', '1'); ln.setAttribute('stroke-opacity', '.75');
    $('svg').appendChild(ln);
    labelEls.push({ p, d, ln });
  });
  rebuildList(); resetCam(); refresh();
}

// 鏡頭平滑移動
let fly = null;
function flyTo(pos, target, ms = 700) {
  fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1: V(...pos), t1: V(...target), s: performance.now(), ms };
}
function stepFly() {
  if (!fly) return;
  let k = Math.min(1, (performance.now() - fly.s) / fly.ms); k = k * k * (3 - 2 * k);
  camera.position.lerpVectors(fly.p0, fly.p1, k); controls.target.lerpVectors(fly.t0, fly.t1, k);
  if (k >= 1) fly = null;
}

function resetCam() {
  fly = null;
  const c = SCENES[curIdx].camera;
  camera.position.set(...c.pos); controls.target.set(...c.target); controls.update();
}

function rebuildList() {
  const box = $('plist'); box.innerHTML = '';
  let lastG = null;
  CUR.parts.forEach(p => {
    if (p.grp !== lastG) { const g = document.createElement('div'); g.className = 'grp'; g.textContent = p.grp; box.appendChild(g); lastG = p.grp; }
    const r = document.createElement('div'); r.className = 'row'; p.row = r;
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = p.visible;
    cb.onclick = e => { e.stopPropagation(); p.visible = cb.checked; refresh(); };
    const sw = document.createElement('div'); sw.className = 'sw';
    const hx = p.meshes[0].material.userData.hex;
    sw.style.background = hx !== undefined ? '#' + hx.toString(16).padStart(6, '0') : '#' + p.meshes[0].material.color.getHexString();
    const n = document.createElement('span'); n.className = 'n'; n.textContent = p.zh;
    r.append(cb, sw, n); r.onclick = () => select(p); box.appendChild(r);
  });
}

function select(p) {
  selected = p;
  if (p) {
    $('info').innerHTML = '<h3>' + p.zh + '</h3><div class="en">' + p.en + '</div><span class="g">' + p.grp + '</span><div class="t">' + p.info + '</div>';
    if (!p.visible) { p.visible = true; rebuildList(); }
    if (p.inner && !XRAY) { XRAY = true; $('xray').checked = true; } // 內部構造 → 自動切換透視
  }
  refresh();
}

// 套用顯示／高亮／孤立狀態
function refresh() {
  const iso = $('iso').checked;
  CUR.parts.forEach(p => {
    p.meshes.forEach(m => {
      m.visible = p.visible;
      // 寫實模式：外壁不透明；透視模式：使用原始半透明度
      const base = (!XRAY && p.wall) ? p.wallO : m.material.userData.baseO, isSel = p === selected;
      m.material.emissive.setHex(isSel ? 0x4a2600 : m.material.userData.baseC);
      if (iso && selected && !isSel) { m.material.transparent = true; m.material.opacity = Math.min(base, 0.1); m.material.depthWrite = false; }
      else { m.material.opacity = base; m.material.transparent = base < 1; m.material.depthWrite = base >= 0.9; }
      m.material.userData.effO = m.material.opacity;
      m.castShadow = m.material.opacity >= 0.6; m.receiveShadow = m.material.opacity >= 0.6;
    });
    if (p.row) { p.row.classList.toggle('sel', p === selected); p.row.firstChild.checked = p.visible; }
  });
}

const _v = new THREE.Vector3();
function updateLabels() {
  const w = cvBox.clientWidth, h = cvBox.clientHeight, mode = $('lm').value;
  const items = [];
  labelEls.forEach(L => {
    const p = L.p;
    let show = p.visible && p.label && (mode === 'all' || (mode === 'sel' && p === selected)) && (XRAY || !p.inner || p === selected);
    if (show) {
      _v.copy(p.anchor).project(camera);
      if (_v.z > 1) show = false;
      else L.s = { x: (_v.x * 0.5 + 0.5) * w, y: (-_v.y * 0.5 + 0.5) * h };
    }
    L.show = show;
    L.d.style.display = show ? 'block' : 'none';
    L.ln.style.display = show ? 'block' : 'none';
    L.d.classList.toggle('sel', p === selected);
    if (show) items.push(L);
  });
  // 標籤分左右兩欄排列（依高度排序、避免重疊），以引線連到構造；兩欄數量盡量平衡
  const cols = { L: items.filter(L => L.s.x < w / 2), R: items.filter(L => L.s.x >= w / 2) };
  while (cols.L.length - cols.R.length > 2) { cols.L.sort((a, b) => a.s.x - b.s.x); cols.R.push(cols.L.pop()); }
  while (cols.R.length - cols.L.length > 2) { cols.R.sort((a, b) => a.s.x - b.s.x); cols.L.push(cols.R.shift()); }
  const useCompact = items.length > 14 || h < 680;
  items.forEach(L => L.d.classList.toggle('compact', useCompact));
  ['L', 'R'].forEach(side => {
    const col = cols[side].sort((a, b) => a.s.y - b.s.y);
    if (!col.length) return;
    const heights = col.map(L => (L.d.offsetHeight || (useCompact ? 20 : 32)) + 3);
    const totalH = heights.reduce((a, b) => a + b, 0);
    const availH = Math.max(40, h - 14);
    const scaleStep = totalH > availH ? (availH / totalH) : 1;
    let prevBottom = 6;
    col.forEach((L, idx) => {
      const stepH = heights[idx] * scaleStep;
      L.y = Math.max(prevBottom, L.s.y - stepH * 0.5);
      prevBottom = L.y + stepH;
    });
    let nextTop = h - 6;
    for (let i = col.length - 1; i >= 0; i--) {
      const stepH = heights[i] * scaleStep;
      col[i].y = Math.max(5, Math.min(col[i].y, nextTop - stepH));
      nextTop = col[i].y;
    }
    col.forEach(L => {
      const lw = L.d.offsetWidth || 100, lh = L.d.offsetHeight || 20;
      const x = side === 'L' ? 6 : w - lw - 6;
      L.d.style.left = x + 'px'; L.d.style.top = L.y + 'px';
      L.ln.setAttribute('x1', L.s.x); L.ln.setAttribute('y1', L.s.y);
      L.ln.setAttribute('x2', side === 'L' ? x + lw : x); L.ln.setAttribute('y2', L.y + lh * 0.5);
    });
  });
}

try { init(); } catch (e) { $('err').textContent = '初始化失敗：' + e.message; console.error(e); }



// Responsive mobile drawer & panel toggle wiring
(function(){
  const bd = document.getElementById('drawer-backdrop');
  const ml = document.getElementById('mleft');
  const mr = document.getElementById('mright');
  const wb = document.getElementById('wbtn');
  function closeDrawers(){
    document.body.classList.remove('open-left','open-right');
    if(ml) ml.classList.remove('on');
    if(mr) mr.classList.remove('on');
  }
  if(ml) ml.addEventListener('click', ()=>{
    const on = !document.body.classList.contains('open-left');
    closeDrawers();
    if(on){ document.body.classList.add('open-left'); ml.classList.add('on'); }
  });
  if(mr) mr.addEventListener('click', ()=>{
    const on = !document.body.classList.contains('open-right');
    closeDrawers();
    if(on){ document.body.classList.add('open-right'); mr.classList.add('on'); }
  });
  if(bd) bd.addEventListener('click', closeDrawers);
  if(wb && !wb.onclick){
    wb.onclick = ()=>{ document.body.classList.toggle('wide'); if(typeof resize==='function') resize(); };
  }
})();
