/* 場景②：肽鍵平面與 φ/ψ 旋轉、拉式構像圖（Ch3 3-4、Fig 2-18～2-23） */
const PEP = { phi: -57, psi: -47, cis: false };
// 硬球最小距離（Ramachandran 正常限／外限，Å）
const CLASH = { CC: [3.2, 3.0], CO: [2.8, 2.7], CN: [2.9, 2.8], NO: [2.7, 2.6], OO: [2.7, 2.6], NN: [2.7, 2.6], HH: [2.0, 1.9], HO: [2.4, 2.2], HN: [2.4, 2.2], CH: [2.4, 2.2] };
function pepModel(phi, psi, cis) {
  const res = backbone([[-120, 130, cis ? 0 : 180], [phi, psi], [-120, 130]]);
  const at = [], bonds = [];
  const add = (p, el, k) => { at.push({ p, el, k }); return at.length - 1; };
  const idx = res.map((r, i) => {
    const o = { N: add(r.N, 'N', 'N'), CA: add(r.CA, 'C', 'CA'), C: add(r.C, 'C', 'C'), O: add(r.O, 'O', 'O'), CB: add(r.CB, 'C', 'CB') };
    const u = r.N.clone().sub(r.CA).normalize().add(r.C.clone().sub(r.CA).normalize()).add(r.CB.clone().sub(r.CA).normalize()).normalize();
    o.HA = add(r.CA.clone().addScaledVector(u, -1.09), 'H', 'HA');
    if (r.H) o.H = add(r.H, 'H', 'H');
    bonds.push([o.N, o.CA], [o.CA, o.C], [o.C, o.O], [o.CA, o.CB], [o.CA, o.HA]);
    if (o.H != null) bonds.push([o.N, o.H]);
    return o;
  });
  for (let i = 0; i < 2; i++) bonds.push([idx[i].C, idx[i + 1].N]);
  // 剛體分組：A＝φ 鍵之前、B＝Cα1 上（φ 與 ψ 之間）、C＝ψ 鍵之後
  const grp = at.map((a, i) => {
    const r = idx.findIndex(o => Object.values(o).includes(i));
    if (r === 0 || (r === 1 && (a.k === 'N' || a.k === 'H'))) return 0;
    if (r === 1 && (a.k === 'CA' || a.k === 'HA' || a.k === 'CB')) return 1;
    return 2;
  });
  return { res, at, bonds, idx, grp };
}
// 找出隔 ≥3 個鍵（1–4 以上）且距離小於限值的原子對
function pepClashes(M, lim = 0) {
  const n = M.at.length, adj = Array.from({ length: n }, () => []);
  M.bonds.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  if (!M.sep) {
    M.sep = [];
    for (let s = 0; s < n; s++) {
      const d = Array(n).fill(99); d[s] = 0; const q = [s];
      while (q.length) { const x = q.shift(); adj[x].forEach(y => { if (d[y] > d[x] + 1) { d[y] = d[x] + 1; q.push(y); } }); }
      M.sep.push(d);
    }
  }
  const out = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
    if (M.sep[a][b] < 4 || M.grp[a] === M.grp[b]) continue; // 同一剛體內的距離與 φ/ψ 無關
    const key = [M.at[a].el, M.at[b].el].sort((x, y) => x.localeCompare(y)).join('').replace('HC', 'CH');
    const L = CLASH[key] || CLASH[key.split('').reverse().join('')]; if (!L) continue;
    if (M.at[a].p.distanceTo(M.at[b].p) < L[lim]) out.push([a, b]);
  }
  return out;
}
let _ramaCache = null;
function ramaMap() {
  if (_ramaCache) return _ramaCache;
  const N = 72, g = []; let sep = null;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const phi = -180 + (i + 0.5) * 360 / N, psi = -180 + (j + 0.5) * 360 / N;
    const M = pepModel(phi, psi, false); if (sep) M.sep = sep;
    const c0 = pepClashes(M, 0).length; sep = M.sep;
    g.push(c0 === 0 ? 2 : (pepClashes(M, 1).length === 0 ? 1 : 0));
  }
  return (_ramaCache = { N, g });
}
function drawRama(cv) {
  const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, P = 26, S = W - P - 6;
  const { N, g } = ramaMap(), c = S / N;
  ctx.fillStyle = '#0a1420'; ctx.fillRect(0, 0, W, H);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const v = g[j * N + i]; if (!v) continue;
    ctx.fillStyle = v === 2 ? '#2f8f5a' : '#1f5040';
    ctx.fillRect(P + i * c, 6 + (N - 1 - j) * c, c + 0.5, c + 0.5);
  }
  ctx.strokeStyle = '#3b5a78'; ctx.lineWidth = 1; ctx.strokeRect(P, 6, S, S);
  ctx.beginPath(); ctx.moveTo(P + S / 2, 6); ctx.lineTo(P + S / 2, 6 + S); ctx.moveTo(P, 6 + S / 2); ctx.lineTo(P + S, 6 + S / 2); ctx.stroke();
  ctx.fillStyle = '#9fb6c8'; ctx.font = '11px sans-serif';
  ctx.fillText('φ', P + S / 2 + 4, 6 + S + 14); ctx.fillText('ψ', 4, 6 + S / 2 - 4);
  ctx.fillText('-180', P - 4, 6 + S + 14); ctx.fillText('180', P + S - 18, 6 + S + 14); ctx.fillText('180', 2, 16); ctx.fillText('-180', 0, 6 + S);
  const xy = (f, p) => [P + (f + 180) / 360 * S, 6 + (180 - p) / 360 * S];
  [['α', -57, -47, '#ffd479'], ['β↑↓', -139, 135, '#8fd0ff'], ['β↑↑', -119, 113, '#8fd0ff'], ['αL', 57, 47, '#ffd479']].forEach(([t, f, p, col]) => {
    const [x, y] = xy(f, p); ctx.fillStyle = col; ctx.fillRect(x - 1.5, y - 1.5, 3, 3); ctx.fillText(t, x + 4, y + 4);
  });
  const [x, y] = xy(PEP.phi, PEP.psi);
  ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fillStyle = PEP.bad ? '#ff4040' : '#ffffff'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.stroke();
}
SCENES.push({
  name: '② 肽鍵 φ/ψ',
  title: '肽鍵平面與主鏈旋轉（φ、ψ）',
  camera: { pos: [3.5, 0.5, 15], target: [3.5, -1.6, 0.5] },
  controls: [
    { label: '預設：α 螺旋（φ −57°, ψ −47°）', fn() { PEP.set(-57, -47); } },
    { label: '預設：反平行 β（φ −139°, ψ 135°）', fn() { PEP.set(-139, 135); } },
    { label: '預設：平行 β（φ −119°, ψ 113°）', fn() { PEP.set(-119, 113); } },
    { label: '示範：空間衝突（φ 0°, ψ 0°）', fn() { PEP.set(0, 0); } },
    { label: '🔁 第一個肽鍵：trans ⇄ cis', fn() { PEP.cis = !PEP.cis; PEP.update(); } }
  ],
  desc: `
  <p><b>肽鍵</b>（醯胺鍵）：一個胺基酸的 α-羧基與下一個的 α-胺基脫水縮合而成；書寫由 <b>N 端 → C 端</b>。</p>
  <ul>
  <li>C–N 鍵具<b>部分雙鍵性質</b>（共振）→ 不能旋轉，<b>Cα、C、O、N、H、Cα 六原子共平面</b>（Fig 2-18）。</li>
  <li>幾乎所有肽鍵都是 <b>trans</b>；cis 時兩個 Cα 同側、空間衝突，最常見的 cis 為 <b>X–Pro</b>（Fig 2-20、2-21）。</li>
  <li><b>N–Cα</b>（φ）與 <b>Cα–C</b>（ψ）是<b>純單鍵</b>，可旋轉；扭轉角介於 ±180°（Fig 2-22）。</li>
  <li>這兩個鍵的自由旋轉讓蛋白質能以多種方式摺疊；但許多 φ/ψ 組合會造成原子<b>空間衝突</b> → <b>拉式構像圖</b>（Ramachandran diagram，Fig 2-23）。</li>
  </ul>
  <p class="hint">右側拉式圖：深綠＝無衝突、淺綠＝外限允許、黑＝衝突。是以本模型（Ala 三肽，硬球）即時計算出來的。拖動滑桿或點圖面改變中央殘基的 φ、ψ。</p>`,
  panel(box) {
    PEP.sPhi = slider(box, 'φ（N–Cα）', -180, 180, PEP.phi, 1, v => { PEP.phi = v; PEP.update(); });
    PEP.sPsi = slider(box, 'ψ（Cα–C）', -180, 180, PEP.psi, 1, v => { PEP.psi = v; PEP.update(); });
    const cv = document.createElement('canvas'); cv.width = 280; cv.height = 290; box.appendChild(cv); PEP.cv = cv;
    cv.style.cursor = 'crosshair';
    cv.onclick = e => {
      const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height;
      const S = cv.width - 32; PEP.set(Math.round((x - 26) / S * 360 - 180), Math.round(180 - (y - 6) / S * 360));
    };
    PEP.msg = note(box, '');
    PEP.update();
  },
  build() {
    const mats = { N: smat(EL.N[0]), C: smat(EL.C[0]), O: smat(EL.O[0]), H: smat(EL.H[0]), CA: smat(0x6e6e6e), CB: smat(0xb070e0),
      bd: smat(0xcfcfcf), pep: smat(0x34d0c0), phi: smat(0xff9a3a), psi: smat(0x3ad07a), pl1: smat(0x5fd6ff, 0.28), pl2: smat(0x5fd6ff, 0.28), bad: smat(0xff2020, 0.45) };
    let M = pepModel(PEP.phi, PEP.psi, PEP.cis);
    const am = M.at.map(a => {
      const key = a.k === 'CA' ? 'CA' : a.k === 'CB' ? 'CB' : a.el;
      return atomM(a.p, a.el === 'C' && a.k === 'CB' ? 'R' : a.el, mats[key], a.k === 'CA' ? 1.15 : a.k === 'CB' ? 0.7 : 1);
    });
    const bm = M.bonds.map(([a, b]) => {
      const pa = M.at[a], pb = M.at[b];
      const isPep = pa.k === 'C' && pb.k === 'N', isPhi = pa.k === 'N' && pb.k === 'CA' && b === M.idx[1].CA, isPsi = pa.k === 'CA' && pb.k === 'C' && a === M.idx[1].CA;
      const m = stickM(pa.p, pb.p, isPep || isPhi || isPsi ? 0.17 : 0.13, isPep ? mats.pep : isPhi ? mats.phi : isPsi ? mats.psi : mats.bd);
      m.userData.ab = [a, b, isPep, isPhi, isPsi]; return m;
    });
    const plane = mt => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(8 * 9), 3)); return new THREE.Mesh(g, mt); };
    const pls = [plane(mats.pl1), plane(mats.pl2)];
    const rings = [new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 8, 40), mats.phi), new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 8, 40), mats.psi)];
    const badS = Array.from({ length: 12 }, () => new THREE.Mesh(_sph, mats.bad));
    const sel = k => am.filter((m, i) => M.at[i].k === k);
    const I1 = M.idx[1];
    const G1 = '原子（Ala–Ala–Ala 三肽）';
    const pCA = reg(G1, 'α 碳 Cα', 'α-carbon', '每個殘基的 Cα 是兩個肽平面的<b>交接點</b>（樞紐）；φ 和 ψ 決定前後兩個平面的相對方向。', sel('CA'));
    reg(G1, '主鏈 N', 'Amide nitrogen', '醯胺氮。C–N 間的電子共振使肽鍵帶部分雙鍵性質。', sel('N'), { nolabel: true });
    reg(G1, '羰基 C', 'Carbonyl carbon', '羰基碳。', sel('C'), { nolabel: true });
    const pO = reg(G1, '羰基 O', 'Carbonyl O (H-bond acceptor)', '主鏈 C=O，<b>氫鍵受體</b>。trans 肽鍵中 O 與 H 位於相反方向。', sel('O'));
    const pH = reg(G1, '醯胺 H', 'Amide H (H-bond donor)', '主鏈 N–H，<b>氫鍵供體</b>。', sel('H'));
    const pCB = reg(G1, '側鏈 –CH₃（Ala）', 'Side chain (Cβ)', '側鏈從 Cα 伸出；旋轉 φ/ψ 時側鏈常與主鏈原子碰撞，這是很多區域「不允許」的原因（Gly 沒有側鏈，所以可接受的範圍大很多）。', sel('CB'));
    reg(G1, 'α-H', 'α-hydrogen', 'α 碳上的氫。', sel('HA'), { nolabel: true });
    const G2 = '鍵與平面';
    const pPep = reg(G2, '肽鍵 C–N（1.33 Å）', 'Peptide bond: partial double bond', '<b>部分雙鍵性質</b>：鍵長 1.33 Å，介於 C–N 單鍵（1.49 Å）與 C=N 雙鍵（1.27 Å）之間 → <b>不能自由旋轉</b>（ω 固定在 180° trans 或 0° cis）。', bm.filter(m => m.userData.ab[2]));
    reg(G2, '其他共價鍵', 'Other bonds', '', bm.filter(m => !m.userData.ab[2] && !m.userData.ab[3] && !m.userData.ab[4]), { nolabel: true });
    const pPhi = reg(G2, 'φ 鍵：N–Cα（可轉）', 'phi (φ): rotation about N–Cα', '<b>純單鍵</b>（1.46 Å），可旋轉。扭轉角 φ = C(i−1)–N–Cα–C，範圍 ±180°。', [bm.find(m => m.userData.ab[3]), rings[0]]);
    const pPsi = reg(G2, 'ψ 鍵：Cα–C（可轉）', 'psi (ψ): rotation about Cα–C', '<b>純單鍵</b>（1.52 Å），可旋轉。扭轉角 ψ = N–Cα–C–N(i+1)，範圍 ±180°。', [bm.find(m => m.userData.ab[4]), rings[1]]);
    const pPl1 = reg(G2, '肽平面 1', 'Amide plane 1', 'Cα、C、O、N、H、Cα <b>六個原子位於同一平面</b>（剛性）。整條主鏈可看成一串以 Cα 相連的平板。', pls[0]);
    const pPl2 = reg(G2, '肽平面 2', 'Amide plane 2', '同上。轉動 φ、ψ 時，兩塊平面繞 Cα 相對轉動。', pls[1]);
    const pBad = reg('空間衝突', '空間衝突（紅色）', 'Steric clash', '兩個原子距離小於凡得瓦接觸距離 → 此 φ/ψ 組合<b>不允許</b>。拉式圖上的空白區域就是這樣來的。', badS, { nolabel: true });
    const nC = textSprite('N 端', M.at[M.idx[0].N].p.clone().add(V(-0.6, 0.5, 0)).toArray(), 0.45, '#8fd0ff');
    const cC = textSprite('C 端', M.at[M.idx[2].C].p.clone().add(V(0.6, 0.5, 0)).toArray(), 0.45, '#8fd0ff');
    const fS = textSprite('φ', [0, 0, 0], 0.55, '#ff9a3a'), sS = textSprite('ψ', [0, 0, 0], 0.55, '#3ad07a');

    function setPlane(mesh, ids) {
      const pts = ids.map(i => M.at[i].p), c = new THREE.Vector3(); pts.forEach(p => c.add(p)); c.multiplyScalar(1 / pts.length);
      const n = pts[1].clone().sub(pts[0]).cross(pts[2].clone().sub(pts[0])).normalize();
      const e1 = pts[0].clone().sub(c).normalize(), e2 = n.clone().cross(e1);
      const ord = pts.map(p => ({ p: p.clone().sub(c), a: 0 })).map(o => (o.a = Math.atan2(o.p.dot(e2), o.p.dot(e1)), o)).sort((a, b) => a.a - b.a);
      const arr = mesh.geometry.attributes.position.array; let k = 0;
      for (let i = 0; i < ord.length; i++) {
        const a = ord[i].p.clone().multiplyScalar(1.25).add(c), b = ord[(i + 1) % ord.length].p.clone().multiplyScalar(1.25).add(c);
        [c, a, b].forEach(v => { arr[k++] = v.x; arr[k++] = v.y; arr[k++] = v.z; });
      }
      while (k < arr.length) arr[k++] = c.x;
      mesh.geometry.attributes.position.needsUpdate = true; mesh.geometry.computeVertexNormals(); mesh.geometry.computeBoundingSphere();
    }
    function ringOn(r, a, b, spr, off) {
      r.position.copy(a.clone().lerp(b, 0.5)); r.quaternion.setFromUnitVectors(V(0, 0, 1), b.clone().sub(a).normalize());
      spr.position.copy(r.position).add(off);
    }
    PEP.set = (f, p) => { PEP.phi = f; PEP.psi = p; if (PEP.sPhi) { PEP.sPhi.value = f; PEP.sPsi.value = p; PEP.sPhi.previousSibling.textContent = f; PEP.sPsi.previousSibling.textContent = p; } PEP.update(); };
    PEP.update = () => {
      const old = M; M = pepModel(PEP.phi, PEP.psi, PEP.cis); M.sep = old.sep;
      // 以第一殘基對齊（保持 N 端不動）：backbone 起點固定，故座標可直接沿用
      M.at.forEach((a, i) => am[i].position.copy(a.p));
      bm.forEach(m => { const [a, b] = m.userData.ab; setStick(m, M.at[a].p, M.at[b].p, m.scale.x); });
      const I0 = M.idx[0], I2 = M.idx[2];
      setPlane(pls[0], [I0.CA, I0.C, I0.O, I1.N, I1.H, I1.CA]);
      setPlane(pls[1], [I1.CA, I1.C, I1.O, I2.N, I2.H, I2.CA]);
      ringOn(rings[0], M.at[I1.N].p, M.at[I1.CA].p, fS, V(0, 0.9, 0.3));
      ringOn(rings[1], M.at[I1.CA].p, M.at[I1.C].p, sS, V(0, 0.9, 0.3));
      cC.position.copy(M.at[I2.C].p).add(V(0.6, 0.6, 0));
      const cl = pepClashes(M, 0), ids = [...new Set(cl.flat())];
      badS.forEach((s, k) => { if (k < ids.length) { s.position.copy(M.at[ids[k]].p); s.scale.setScalar(0.62); } else s.scale.setScalar(0.0001); });
      PEP.bad = cl.length > 0;
      [[pCA, I1.CA], [pO, I1.O], [pH, I1.H], [pCB, I1.CB], [pPep, null], [pBad, ids[0]]].forEach(([p, i]) => { if (i != null) p.anchor.copy(M.at[i].p); });
      pPep.anchor.copy(M.at[I0.C].p).lerp(M.at[I1.N].p, 0.5);
      pPhi.anchor.copy(rings[0].position); pPsi.anchor.copy(rings[1].position);
      pPl1.anchor.copy(M.at[I0.C].p).lerp(M.at[I1.N].p, 0.5).add(V(0, -0.6, 0)); pPl2.anchor.copy(M.at[I1.C].p).lerp(M.at[I2.N].p, 0.5).add(V(0, -0.6, 0));
      if (PEP.cv) {
        drawRama(PEP.cv);
        const names = ids.map(i => ({ N: 'N', CA: 'Cα', C: 'C', O: 'O', CB: 'Cβ', HA: 'Hα', H: 'H' })[M.at[i].k] + M.res.findIndex((r, ri) => Object.values(M.idx[ri]).includes(i)));
        PEP.msg.innerHTML = (PEP.cis ? '第一個肽鍵：<b>cis</b>（兩個 Cα 同側）<br>' : '') +
          (PEP.bad ? '<span class="warn">⚠ 空間衝突：' + [...new Set(names)].join('、') + '</span> → 此構形不允許' : '✓ 無空間衝突：此 φ/ψ 組合允許');
      }
    };
    PEP.update();
    pBad.anchor = V(0, 0, 0);
  }
});
