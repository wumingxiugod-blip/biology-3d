/* 主程式：場景管理、互動、標籤、介面 */
let renderer, scene3, camera, controls, curIdx = -1, selected = null, labelEls = [];
const $ = id => document.getElementById(id);
const cvBox = $('cv');

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  cvBox.insertBefore(renderer.domElement, cvBox.firstChild);
  scene3 = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, 0.1, 2000);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.1; controls.autoRotateSpeed = 1.2;
  scene3.add(new THREE.HemisphereLight(0xffffff, 0x445566, 0.85));
  const d1 = new THREE.DirectionalLight(0xffffff, 0.85); d1.position.set(4, 6, 5); scene3.add(d1);
  const d2 = new THREE.DirectionalLight(0x99bbff, 0.45); d2.position.set(-5, 2, -4); scene3.add(d2);
  if (window.realismSetup) realismSetup(renderer, scene3);
  addEventListener('resize', resize); resize();

  const tabs = $('tabs');
  SCENES.forEach((s, i) => {
    const b = document.createElement('div'); b.className = 'tab'; b.textContent = s.name;
    b.onclick = () => { // 先顯示提示再建模（部分頁面第一次需數秒建立骨骼模型）
      const busy = $('busy'); busy.style.display = 'block';
      setTimeout(() => { loadScene(i); busy.style.display = 'none'; }, 40);
    }; tabs.appendChild(b);
  });
  $('lm').onchange = refresh; $('iso').onchange = refresh;
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
    const solid = hits.find(h => h.object.material.userData.baseO >= 0.5);
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
  // 附著在可動 Group 的標籤錨點需先由局部座標轉成世界座標，
  // 否則場景載入後、動畫開始前會指向錯誤位置。
  updateAnchors();
  // 記錄原始透明度，供孤立顯示使用
  CUR.parts.forEach(p => p.meshes.forEach(m => {
    m.material.userData.baseO = m.material.opacity;
    m.material.userData.baseC = m.material.emissive.getHex();
  }));
  [...$('tabs').children].forEach((t, k) => t.classList.toggle('on', k === i));
  $('desc').innerHTML = '<h2>' + sc.title + '</h2>' + sc.desc;
  if (sc.controls) sc.controls.forEach(c => {
    const b = document.createElement('button'); b.textContent = c.label; b.onclick = c.fn; $('extra').appendChild(b);
  });
  if (sc.panel) sc.panel($('extra'));
  if (window.realismScene) realismScene(CUR.root);
  $('info').innerHTML = '<div class="hint">👆 點擊 3D 模型或標籤／清單，即可查看結構名稱與說明。</div>';
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
    sw.style.background = '#' + p.meshes[0].material.color.getHexString();
    const n = document.createElement('span'); n.className = 'n'; n.textContent = p.zh;
    r.append(cb, sw, n); r.onclick = () => select(p); box.appendChild(r);
  });
}

function select(p) {
  selected = p;
  if (p) {
    $('info').innerHTML = '<h3>' + p.zh + '</h3><div class="en">' + p.en + '</div><span class="g">' + p.grp + '</span><div class="t">' + p.info + '</div>';
    if (!p.visible) { p.visible = true; rebuildList(); }
  }
  refresh();
}

// 套用顯示／高亮／孤立狀態
function refresh() {
  const iso = $('iso').checked;
  CUR.parts.forEach(p => {
    p.meshes.forEach(m => {
      m.visible = p.visible;
      const base = m.material.userData.baseO, isSel = p === selected;
      m.material.emissive.setHex(isSel ? 0x7a4a00 : m.material.userData.baseC);
      if (iso && selected && !isSel) { m.material.transparent = true; m.material.opacity = Math.min(base, 0.1); m.material.depthWrite = false; }
      else { m.material.opacity = base; m.material.transparent = base < 1; m.material.depthWrite = base >= 0.9; }
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
    let show = p.visible && p.label && (mode === 'all' || (mode === 'sel' && p === selected));
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
  const GAP = Math.min(30, (h - 12) / Math.max(1, cols.L.length, cols.R.length));
  ['L', 'R'].forEach(side => {
    const col = cols[side].sort((a, b) => a.s.y - b.s.y);
    let prev = -1e9;
    col.forEach(L => { L.y = Math.max(5, L.s.y - 14, prev + GAP); prev = L.y; });
    let next = h - 5;
    for (let i = col.length - 1; i >= 0; i--) { col[i].y = Math.min(col[i].y, next - GAP); next = col[i].y; }
    col.forEach(L => {
      const lw = L.d.offsetWidth || 90;
      const x = side === 'L' ? 6 : w - lw - 6;
      L.d.style.left = x + 'px'; L.d.style.top = L.y + 'px';
      L.ln.setAttribute('x1', L.s.x); L.ln.setAttribute('y1', L.s.y);
      L.ln.setAttribute('x2', side === 'L' ? x + lw : x); L.ln.setAttribute('y2', L.y + 14);
    });
  });
}

try { init(); } catch (e) { $('err').textContent = '初始化失敗：' + e.message; console.error(e); }

