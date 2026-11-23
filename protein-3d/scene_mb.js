/* 場景⑦：肌紅蛋白——三級結構與血基質口袋（Ch4 4-4、Fig 2-43、2-44、4.16、7.1、7.2、7.5） */
/* ---- 球蛋白摺疊（globin fold）示意：Fe 在原點，血基質平面＝yz 平面，近端 His F8 在 −x、遠端 His E7 在 +x ---- */
const GLOBIN = {
  helices: [ // 名稱、起點、終點、殘基數（抹香鯨肌紅蛋白）
    ['A', [-14, 12, -6], [6, 16, -12], 16], ['B', [14, 6, -8], [-2, -8, -14], 16], ['C', [-6, -9, -12], [-10, -14, -6], 7],
    ['D', [-4, -18, 2], [4, -16, 6], 7], ['E', [8, -14, 6], [10, 14, 0], 20], ['F', [-8, 6, 0], [-9, -6, 2], 9],
    ['G', [-16, -10, 6], [-6, 12, 14], 19], ['H', [4, 18, 12], [-4, -14, 16], 26]
  ],
  loops: [2, 1, 0, 8, 0, 8, 5, 5, 4], // N 端、AB、BC、CD、DE、EF、FG、GH、C 端
  col: { A: 0xff5a5a, B: 0xff9a40, C: 0xffd840, D: 0x9ae040, E: 0x40d090, F: 0x40c0ff, G: 0x7a80ff, H: 0xd070ff }
};
function globinFold() {
  const segs = [], cen = new THREE.Vector3();
  GLOBIN.helices.forEach(h => cen.add(V(...h[1]).add(V(...h[2])).multiplyScalar(0.5)));
  cen.multiplyScalar(1 / GLOBIN.helices.length);
  const hel = GLOBIN.helices.map(([nm, a, b, n], i) => ({ nm, a: V(...a), b: V(...b), n, pts: helixTrace(a, b, n, i * 1.3) }));
  const out = p => p.clone().sub(cen).normalize();
  const lp = (a, b, n) => n <= 0 ? [a, b] : loopPts(a, b, out(a.clone().lerp(b, 0.5)).multiplyScalar(Math.max(1.5, n * 0.7)), n + 1);
  // N 端
  const h0 = hel[0].pts[0];
  segs.push({ kind: 'loop', pts: [h0.clone().add(out(h0).multiplyScalar(4)), h0] });
  hel.forEach((h, i) => {
    segs.push({ kind: 'helix', nm: h.nm, pts: h.pts, a: h.a, b: h.b });
    const next = hel[i + 1];
    if (next) segs.push({ kind: 'loop', nm: h.nm + next.nm, pts: lp(h.pts[h.n - 1], next.pts[0], GLOBIN.loops[i + 1]) });
  });
  const hl = hel[hel.length - 1].pts[hel[hel.length - 1].n - 1];
  segs.push({ kind: 'loop', pts: [hl, hl.clone().add(out(hl).multiplyScalar(5))] });
  // 近端 His F8／遠端 His E7：取最靠近血基質兩側的 Cα
  const near = (nm, tgt) => hel.find(h => h.nm === nm).pts.reduce((b, p) => p.distanceTo(tgt) < b.distanceTo(tgt) ? p : b);
  return { segs, hel, cen, proxCA: near('F', V(-4, 0, 0)), distCA: near('E', V(5, 1, 0)) };
}
// 血基質：回傳 {meshes, fe, N:[4], ringC} ；平面為 yz（法向 x）
function hemeMeshes(mats) {
  const H = hemeAtoms(), rot = new THREE.Matrix4().makeRotationY(Math.PI / 2);
  const P = H.at.map(a => a.p.clone().applyMatrix4(rot));
  const ms = [];
  H.at.forEach((a, i) => { if (a.el !== 'Fe') ms.push(atomM(P[i], a.el, mats[a.el] || mats.C, a.el === 'C' ? 0.8 : 0.85)); });
  H.bd.forEach(([a, b]) => ms.push(stickM(P[a], P[b], 0.12, mats.ring)));
  return { meshes: ms, N: H.pyrN.map(i => P[i]), P, H };
}
// 咪唑環（His 側鏈）：環中心 c、環平面含 dir 與 up；回傳原子座標（NE2 朝 dir）
function imidazole(c, dir, up) {
  const d = dir.clone().normalize(), u = up.clone().addScaledVector(d, -up.dot(d)).normalize(), R = 1.12, pts = [];
  for (let j = 0; j < 5; j++) { const a = j * 2 * Math.PI / 5; pts.push(c.clone().addScaledVector(d, Math.cos(a) * R).addScaledVector(u, Math.sin(a) * R)); }
  return pts; // pts[0]＝NE2（朝 dir）、pts[2]＝與 CB 相接的 CG 附近
}
function drawHis(CA, ringC, dir, up, m, mN, bd) {
  const r = imidazole(ringC, dir, up), CB = CA.clone().lerp(r[2], 0.5).addScaledVector(up, 0.4);
  const ms = r.map((p, j) => atomM(p, j === 0 || j === 3 ? 'N' : 'C', j === 0 || j === 3 ? mN : m, 0.85));
  for (let j = 0; j < 5; j++) ms.push(stickM(r[j], r[(j + 1) % 5], 0.13, m));
  ms.push(stickM(CA, CB, 0.14, m), stickM(CB, r[2], 0.14, m), atomM(CB, 'C', m, 0.8));
  return { ms, NE2: r[0], ring: r };
}

const MB = { lig: 'O2', off: 0, amp: 1, ghost: false };
SCENES.push({
  name: '⑦ 肌紅蛋白',
  title: '三級結構：肌紅蛋白（myoglobin）',
  camera: { pos: [10, 8, 78], target: [-1, 1, 1] },
  controls: [
    { label: '🔍 全貌', fn() { flyTo([10, 8, 78], [-1, 1, 1]); } },
    { label: '🔍 血基質口袋（Fig 7.2 視角）', fn() { MB.setGhost(true); flyTo([0, 4, 22], [0, 0, 0]); } },
    { label: '◐ 多肽鏈：半透明 ⇄ 實心', fn() { MB.setGhost(!MB.ghost); } },
    { label: '🎨 胺基酸分布（Fig 2-44）', fn() { const p = togglePart('胺基酸分布（黃／藍／白）'); if (p.visible) select(p); } },
    { label: '⚪ 去氧肌紅蛋白（無配體）', fn() { MB.setLig('none'); } },
    { label: '🔴 結合 O₂（氧合肌紅蛋白）', fn() { MB.setLig('O2'); } },
    { label: '⚫ 結合 CO', fn() { MB.setLig('CO'); } }
  ],
  panel(box) { checkbox(box, 'Fe 位移放大 ×5（實際約 0.4 Å）', MB.amp > 1, v => { MB.amp = v ? 5 : 1; }); MB.msg = note(box, ''); MB.setLig(MB.lig); },
  desc: `
  <p><b>肌紅蛋白</b>：肌肉中的<b>氧氣儲存</b>蛋白。水溶性蛋白摺成<b>緊密球狀、內部為非極性核心</b>。</p>
  <ul>
  <li>單一多肽鏈，<b>153</b> 個胺基酸；含一個<b>血基質</b>（heme，輔基 prosthetic group）位於<b>疏水口袋</b>中。</li>
  <li><b>8 段 α 螺旋</b>（A–H，約 75%），<b>沒有 β 摺板</b>；螺旋間以轉角相連。</li>
  <li>多數<b>極性側鏈在表面</b>、<b>非極性側鏈摺在內部</b>；內部唯一的極性殘基是兩個 <b>His</b>。</li>
  <li><b>Fe(II)</b> 有 <b>6 個配位</b>：4 個與血基質的 N、1 個與<b>近端 His（F8）</b>、1 個與 <b>O₂</b>（或空著）。</li>
  <li><b>遠端 His（E7）</b>不與鐵或血基質鍵結，是 O₂ 的「<b>閘門</b>」，並以氫鍵<b>穩定結合的 O₂</b>。</li>
  <li>O₂ 結合時 Fe 由平面外（偏向近端 His）<b>移入血基質平面</b>，並拉動 F 螺旋（Fig 7.2）。</li>
  <li><b>脫輔基蛋白</b>（apoprotein）：沒有血基質的多肽鏈；血基質的存在會影響多肽鏈的構形。</li>
  </ul>
  <p class="hint">此為依教科書描述建立的示意模型（螺旋長度採實際殘基數），非晶體座標。</p>`,
  build() {
    MB.ghost = false;
    const F = globinFold();
    const ghostables = [];
    const gF = new THREE.Group(); CUR.root.add(gF); // 隨 Fe 移動的 F 螺旋＋近端 His
    const helInfo = {
      A: '第 1 段螺旋（16 個殘基）。', B: '第 2 段螺旋（16 個殘基）。', C: '短螺旋（7 個殘基）。', D: '短螺旋（7 個殘基）。',
      E: '<b>E 螺旋</b>（20 個殘基）位於血基質的<b>遠端</b>側；第 7 個殘基為<b>遠端 His E7</b>。',
      F: '<b>F 螺旋</b>（9 個殘基）位於血基質的<b>近端</b>側；第 8 個殘基為<b>近端 His F8</b>，與 Fe 直接鍵結。O₂ 結合使 Fe 移動時 F 螺旋隨之移動。',
      G: 'G 螺旋（19 個殘基）。', H: '最長的 H 螺旋（26 個殘基），C 端。'
    };
    F.segs.forEach(s => {
      if (s.kind !== 'helix') return;
      const col = GLOBIN.col[s.nm];
      const ms = [ttube(s.pts, 0.5, col, 1, { seg: s.pts.length * 8 }), cyl(s.a.toArray(), s.b.toArray(), 2.6, col, 0.2)];
      const p = reg('8 段 α 螺旋（A–H）', s.nm + ' 螺旋', 'Helix ' + s.nm, helInfo[s.nm] + '<br>肌紅蛋白約 75% 的殘基位於這 8 段 α 螺旋中。', ms, { anchor: s.b.toArray() });
      ghostables.push(p); if (s.nm === 'F') ms.forEach(m => gF.add(m));
    });
    const lm = F.segs.filter(s => s.kind === 'loop').map(s => ttube(s.pts, 0.4, 0xc8c8c8));
    ghostables.push(reg('8 段 α 螺旋（A–H）', '轉角與環', 'Turns & loops', '螺旋之間以<b>轉角</b>與<b>環</b>相連（AB、CD、EF、FG、GH…），位於分子表面。', lm, { nolabel: true }));
    const mats = { C: smat(0x9a6a50), N: smat(EL.N[0]), O: smat(EL.O[0]), ring: smat(0xb07a5a) };
    const hm = hemeMeshes(mats);
    reg('血基質口袋', '血基質（原紫質 IX）', 'Heme (Fe-protoporphyrin IX)', '<b>原紫質</b>由 4 個五元的<b>吡咯環</b>以<b>次甲基橋</b>（–CH=）相連；環上有 <b>4 個甲基、2 個乙烯基、2 個丙酸基</b>。位於 E、F 螺旋之間的<b>疏水口袋</b>。<br>游離血基質與 CO 的親和力是 O₂ 的 <b>25,000 倍</b>；蛋白質環境（遠端 His）降低了這種差距。若 Fe 氧化成 <b>Fe³⁺</b>（變性肌紅蛋白 metmyoglobin）就無法結合 O₂。',
      hm.meshes, { anchor: hm.P[hm.H.side[4].atom].toArray() });
    const mFe = smat(0xe07a30, 1, { metalness: 0.3 }), fe = atomM(V(0, 0, 0), 'Fe', mFe);
    reg('血基質口袋', 'Fe²⁺（亞鐵離子）', 'Ferrous iron Fe(II)', '<b>Fe²⁺</b> 才能結合氧。共 <b>6 個配位</b>：4 個血基質 N、1 個近端 His F8、1 個 O₂。<br><b>去氧</b>時 Fe 位於平面外約 0.4 Å（偏向 His F8）；<b>結合 O₂</b> 後移入平面。', fe, { anchor: [0, 1.2, 0] });
    const mH = smat(0x40c0ff), mHN = smat(EL.N[0]), bd = smat(0xdddddd);
    const prox = drawHis(F.proxCA, V(-3.2, 0, 0), V(1, 0, 0), V(0, 1, 0.3), mH, mHN, bd);
    reg('血基質口袋', '近端組胺酸 His F8', 'Proximal histidine (F8)', 'F 螺旋第 8 個殘基。其<b>咪唑環</b>的 N 與 Fe 形成<b>第 5 個配位鍵</b>。O₂ 結合使 Fe 移入平面時，His F8 與整段 F 螺旋被拉動 → 在血紅蛋白中這個位移會傳到次單元界面。', prox.ms, { anchor: prox.ring[1].toArray() });
    prox.ms.forEach(m => gF.add(m));
    const mE = smat(0x40d090);
    const dist = drawHis(F.distCA, V(4.6, 1.9, 0.4), V(-0.7, -1, 0), V(0, 0, 1), mE, mHN, bd);
    reg('血基質口袋', '遠端組胺酸 His E7', 'Distal histidine (E7)', 'E 螺旋第 7 個殘基。<b>不與鐵或血基質鍵結</b>，是 O₂ 進出的<b>閘門</b>。它以<b>氫鍵穩定</b>結合的 O₂（Fig 7.5），使 O₂ 以 O₂ 形式釋出，而不是有害的<b>超氧離子 O₂⁻</b>。', dist.ms, { anchor: dist.ring[3].toArray() });
    // 配位鍵
    const mC = smat(0xffd479), coordN = hm.N.map(p => stickM(V(0, 0, 0), p, 0.09, mC)), coordH = stickM(V(0, 0, 0), prox.NE2, 0.09, mC), coordL = stickM(V(0, 0, 0), V(1.8, 0, 0), 0.09, mC);
    reg('血基質口袋', '配位鍵（6 個）', 'Coordination bonds', 'Fe 的 6 個配位：<b>4 個</b>朝向原紫質吡咯環的 N（平面內）、<b>第 5 個</b>朝近端 His F8、<b>第 6 個</b>給 O₂（去氧時空著）。', [...coordN, coordH, coordL], { nolabel: true });
    // 配體
    const mO = smat(EL.O[0]), mCo = smat(0x505050);
    const O1 = V(1.8, 0, 0), O2b = O1.clone().add(V(Math.cos(60 * DEG), Math.sin(60 * DEG), 0).multiplyScalar(1.21));
    const pO2 = reg('配體', '氧分子 O₂', 'Bound O₂ (bent)', 'O₂ 以<b>彎曲</b>方式與 Fe 結合（共振結構，Fig 7.4）。遠端 His E7 以氫鍵穩定第二個 O 原子。肌紅蛋白對 O₂ 的親和力高 → 氧合曲線呈<b>雙曲線</b>。', [atomM(O1, 'O', mO, 1.2), atomM(O2b, 'O', mO, 1.2), stickM(O1, O2b, 0.16, mO)], { anchor: O2b.toArray() });
    const pHB = reg('配體', '氫鍵 His E7 … O₂', 'H-bond stabilizing O₂', '遠端 His 的 N–H 與結合的 O₂ 形成氫鍵 → <b>穩定結合的氧</b>，並防止釋出<b>超氧離子</b>（O₂⁻，會傷害生物分子）。', dashM(dist.NE2, O2b, 0.06, smat(0xffe066), 0.2, 0.15), { nolabel: true });
    const C1 = V(1.85, 0, 0), Oc = V(3.0, 0, 0);
    const pCO = reg('配體', '一氧化碳 CO', 'Carbon monoxide', 'CO 與 O₂ 結合在<b>同一個位置</b>。游離血基質對 CO 的親和力是 O₂ 的 25,000 倍；在血紅蛋白中 CO 仍比 O₂ 緊密約 200 倍 → CO 中毒。', [atomM(C1, 'C', mCo, 1.2), atomM(Oc, 'O', mO, 1.2), stickM(C1, Oc, 0.16, mCo)], { anchor: Oc.toArray() });
    // 胺基酸分布（Fig 2-44）
    const rq = rnd(7), mY = smat(0xffe040), mB = smat(0x4080ff), mW = smat(0xf0f0f0), dm = [];
    F.segs.forEach(s => {
      const ax = s.kind === 'helix' ? (p => { const u = s.b.clone().sub(s.a).normalize(); return s.a.clone().addScaledVector(u, p.clone().sub(s.a).dot(u)); }) : (p => F.cen);
      s.pts.forEach(p => {
        const o = p.clone().sub(ax(p)).normalize(), inward = o.dot(F.cen.clone().sub(p).normalize()) > 0.25 || p.distanceTo(F.cen) < 9;
        const r = rq(), m = inward ? mY : (r < 0.55 ? mB : r < 0.85 ? mW : mY);
        dm.push(atomM(p.clone().addScaledVector(o, 1.6), 'R', m, 1.25));
      });
    });
    reg('血基質口袋', '胺基酸分布（黃／藍／白）', 'Distribution of amino acids', '<b>黃</b>＝疏水胺基酸（集中在<b>內部</b>）；<b>藍</b>＝帶電胺基酸（位於<b>表面</b>）；<b>白</b>＝其他。<br>外側同時有極性與非極性殘基，但內部幾乎全是非極性——唯二的極性殘基是兩個 His。', dm, { hidden: true, nolabel: true });

    MB.setGhost = on => {
      MB.ghost = on;
      ghostables.forEach(p => p.meshes.forEach(m => { const o = m.material.userData.o0 = m.material.userData.o0 ?? m.material.opacity; m.material.userData.baseO = on ? Math.min(o, 0.15) : o; }));
      refresh();
    };
    MB.setLig = lig => {
      MB.lig = lig;
      pO2.visible = lig === 'O2'; pHB.visible = lig === 'O2'; pCO.visible = lig === 'CO';
      coordL.scale.x = coordL.scale.z = lig === 'none' ? 0.0001 : 0.09;
      if (MB.msg) MB.msg.innerHTML = lig === 'none' ? '<b>去氧肌紅蛋白</b>：第 6 配位空著，Fe 偏離平面約 0.4 Å（朝 His F8）。' :
        lig === 'O2' ? '<b>氧合肌紅蛋白</b>：O₂ 彎曲結合在第 6 配位，Fe 移入血基質平面並拉動 His F8／F 螺旋。' :
        '<b>CO 結合</b>：佔據與 O₂ 相同的位置，O₂ 無法結合。';
      rebuildList(); refresh();
    };
    MB.off = MB.lig === 'none' ? -0.4 : 0;
    CUR.tick = () => {
      const tgt = (MB.lig === 'none' ? -0.4 : 0) * MB.amp;
      MB.off += (tgt - MB.off) * 0.06;
      fe.position.x = MB.off; gF.position.x = MB.off;
      coordN.forEach((m, i) => setStick(m, fe.position, hm.N[i], 0.09));
      setStick(coordH, fe.position, prox.NE2.clone().add(gF.position), 0.09);
      if (MB.lig !== 'none') setStick(coordL, fe.position, V(1.8, 0, 0), 0.09);
    };
  }
});
