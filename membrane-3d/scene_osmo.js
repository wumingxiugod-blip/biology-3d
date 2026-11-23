/* 場景④：滲透、滲透壓與張力（Ch6 6.2、Fig 6.8–6.13） */
(function () {
  let S = null, OSM = 300, PERM = false, MODE = 'NaCl';
  const R = 1.6, C = [0.207, 2.003, -1.123];
  // 紅血球形狀：s=0 雙凹圓盤、s→1 膨脹成球、s<0 皺縮（棘狀）
  function rbcGeo(s) {
    const g = new THREE.SphereGeometry(1, 64, 40), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.min(1, Math.hypot(x, z)), sg = Math.sign(y) || 1;
      const hb = 0.5 * Math.sqrt(Math.max(0, 1 - r * r)) * (C[0] + C[1] * r * r + C[2] * r ** 4);
      let X = x * R, Y = sg * hb * R, Z = z * R;
      if (s > 0) { const k = Math.min(1, s), Rs = R * (0.86 + 0.14 * k); X = X * (1 - k) + x * Rs * k; Z = Z * (1 - k) + z * Rs * k; Y = Y * (1 - k) + y * Rs * k; }
      if (s < 0) {
        const k = Math.min(1, -s), sh = 1 - 0.28 * k, th = Math.atan2(z, x), ph = Math.acos(Math.max(-1, Math.min(1, y)));
        const sp = Math.pow(Math.max(0, Math.sin(th * 9) * Math.sin(ph * 8)), 6) * 0.35 * k + Math.pow(Math.max(0, Math.cos(th * 7 + 1) * Math.sin(ph * 6 + 0.5)), 6) * 0.3 * k;
        X *= sh * (1 + sp); Z *= sh * (1 + sp); Y = Y * sh * (1 + sp * 2.5) + sg * 0.05 * k;
      }
      p.setXYZ(i, X, Y, Z);
    }
    g.computeVertexNormals(); return g;
  }
  const eff = () => MODE === 'urea' ? 0 : OSM;                // 尿素可穿透細胞膜，不具滲透活性
  const shapeOf = o => o < 300 ? Math.min(1.25, (300 - o) / 150) : -Math.min(1, (o - 300) / 300);

  function update() {
    if (!S) return;
    const s = shapeOf(eff());
    S.rbc.geometry.dispose(); S.rbc.geometry = rbcGeo(Math.min(1, s));
    const lysed = s > 1.0;
    if (S.pR.visible === lysed || S.pG.visible !== lysed) { S.pR.visible = !lysed; S.pG.visible = lysed; rebuildList(); refresh(); }
    S.arrows.forEach((a, i) => { const inward = s > 0.02, out = s < -0.02; a.visible = inward || out; a.rotation.z = inward ? Math.PI : 0; });
    S.arrG.rotation.y = 0;
    const tone = eff() < 290 ? '低張（hypotonic）' : eff() > 310 ? '高張（hypertonic）' : '等張（isotonic）';
    if (S.rd) S.rd.innerHTML = `外液滲透濃度 <b>${OSM}</b> mOsm（血漿約 300）<br>對紅血球：<b>${tone}</b>${MODE === 'urea' ? '<br><span class="warn">尿素可穿過細胞膜 → 雖等滲卻是低張</span>' : ''}<br>${lysed ? '<span class="warn">吸水過多而破裂＝溶血（hemolysis）</span>' : s > 0.02 ? '水滲入 → 細胞膨脹' : s < -0.02 ? '水滲出 → 細胞皺縮（crenation）' : '水的淨移動為零，形狀不變'}`;
    // U 形管
    const dh = PERM ? 0 : 1.6;
    S.uL.scale.y = (4 - dh / 2) / 4; S.uL.position.y = S.uy0 + (4 - dh / 2) / 2;
    S.uR.scale.y = (4 + dh / 2) / 4; S.uR.position.y = S.uy0 + (4 + dh / 2) / 2;
    S.piston.position.y = S.uy0 + 4 + dh / 2 + 0.25;
  }

  SCENES.push({
    name: '④ 滲透與張力',
    title: '滲透、滲透壓與溶液的張力',
    camera: { pos: [3, 3, 34], target: [2.5, 0.5, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([3, 3, 34], [2.5, 0.5, 0]); } },
      { label: '🔍 U 形管', fn() { flyTo([-9, 2, 12], [-9, 0.5, 0]); } },
      { label: '🔍 紅血球', fn() { flyTo([1, 2, 8], [1, 0, 0]); } }
    ],
    desc: `
  <p><b>滲透</b>（osmosis）＝水（溶劑）通過膜的淨擴散。條件：① 膜兩側溶質濃度不同、膜可讓水通過；② 膜對溶質<b>不通透</b>（否則濃度差會消失）。不能通過膜、因而能造成滲透的溶質稱<b>具滲透活性</b>。</p>
  <p><b>滲透壓</b>：為了<b>阻止</b>滲透所需施加的力；溶質濃度越高，滲透壓越大。</p>
  <p><b>莫耳</b>：1 mole ＝ 6.02×10²³ 個分子。<b>重量莫耳濃度</b>（molality, m）：1 mole 溶質溶於 1 kg 水；<b>滲透莫耳濃度</b>（osmolality）＝所有溶質粒子的總濃度：</p>
  <ul><li>2 m 葡萄糖 ＝ 1 m 葡萄糖＋1 m 果糖 ＝ <b>2 Osm</b></li><li>1 m NaCl 解離成 Na⁺ 與 Cl⁻ → <b>2 Osm</b></li></ul>
  <p>血漿 ≈ 0.3 m 葡萄糖（5% dextrose）≈ 0.15 m NaCl（生理食鹽水 0.9%）＝ <b>300 mOsm</b> → <b>等滲</b>。</p>
  <p><b>張力</b>（tonicity）：溶液對細胞滲透（水移動）的效應。低張 → 細胞吸水，紅血球<b>溶血</b>；高張 → 失水<b>皺縮</b>。0.3 m 尿素雖與血漿<b>等滲</b>，但尿素能進入細胞，所以是<b>低張</b>。</p>
  <p><b>血液滲透濃度的調節</b>：脫水使血漿滲透濃度升高 → 下視丘<b>滲透壓受器</b>受刺激 → 口渴、後葉釋放 <b>ADH</b> 使尿量減少；反之則排出較多水。</p>`,
    build() {
      S = {};
      // ── U 形管
      const ux = -9, uy0 = -2.5; S.uy0 = uy0;
      reg('U 形管', '玻璃管', 'U-tube', '左右兩管底部相通，中間以半透膜隔開。', [cylM([ux - 2, uy0 - 0.3, 0], [ux - 2, uy0 + 6.5, 0], 0.95, mat(0xddeeff, 0.18), 24, true), cylM([ux + 2, uy0 - 0.3, 0], [ux + 2, uy0 + 6.5, 0], 0.95, mat(0xddeeff, 0.18), 24, true), cylM([ux - 2, uy0 - 0.6, 0], [ux + 2, uy0 - 0.6, 0], 0.7, mat(0xddeeff, 0.18), 24, true)], { anchor: [ux - 3, uy0 + 6, 0] });
      S.uL = cylM([ux - 2, 0, 0], [ux - 2, 4, 0], 0.9, mat(0x60a8ff, 0.55), 24); S.uR = cylM([ux + 2, 0, 0], [ux + 2, 4, 0], 0.9, mat(0x60a8ff, 0.55), 24);
      reg('U 形管', '純水（左）', 'Pure water', '水分子由水濃度高（溶質濃度低）的一側往另一側淨移動。', [S.uL, cylM([ux - 2, uy0 - 0.6, 0], [ux - 0.05, uy0 - 0.6, 0], 0.62, mat(0x60a8ff, 0.55), 16)], { anchor: [ux - 2.8, uy0 + 2, 0.8] });
      reg('U 形管', '溶液（右）', 'Solution', '含不能通過膜的溶質：水滲入使液面升高，直到液柱的壓力抵銷滲透。', [S.uR, cylM([ux + 0.05, uy0 - 0.6, 0], [ux + 2, uy0 - 0.6, 0], 0.62, mat(0x60a8ff, 0.55), 16)], { anchor: [ux + 2.9, uy0 + 3, 0.8] });
      reg('U 形管', '半透膜', 'Semipermeable membrane', '讓水通過、不讓溶質通過的膜。若膜對溶質也通透，溶質會擴散到兩側，濃度差消失，就不會有滲透。', cylM([ux - 0.05, uy0 - 0.6, 0], [ux + 0.05, uy0 - 0.6, 0], 0.74, mat(0xffd23f, 0.9), 20), { anchor: [ux, uy0 + 0.3, 0.3] });
      const rr = rnd(3), sol = []; for (let i = 0; i < 26; i++) sol.push(V(ux + 2 + (rr() - 0.5) * 1.4, uy0 + rr() * 3.8, (rr() - 0.5) * 1.3));
      reg('U 形管', '溶質', 'Solute', '具滲透活性的溶質（不能通過膜）。', dots(sol, 0.16, 0xff9a40), { anchor: [ux + 2.5, uy0 + 1.2, 0.6] });
      S.piston = box([ux + 2, uy0 + 6, 0], [1.7, 0.3, 1.7], 0xb0b8c0, 0.5);
      reg('U 形管', '滲透壓（示意）', 'Osmotic pressure', '若要讓右側液面不升高，必須在右側施加的壓力＝<b>滲透壓</b>。', S.piston, { anchor: [ux + 2.9, uy0 + 6.5, 0] });
      textSprite('U 形管', [ux, uy0 + 8, 0], 0.7, '#ffd479');
      // ── 中：可調整的紅血球
      S.rbc = new THREE.Mesh(rbcGeo(0), mat(0xd03040)); S.rbc.position.set(1, 0, 0); S.rbc.rotation.x = 1.1;
      const gh = []; for (let i = 0; i < 6; i++) { const a = i * 1.05; gh.push(ell([1 + Math.cos(a) * 1.6, Math.sin(a) * 1.4, (i % 2) * 0.6], [0.6, 0.12, 0.4], 0xe0a0a8, 0.5)); }
      S.pR = reg('紅血球', '紅血球', 'Red blood cell', '正常為<b>雙凹圓盤</b>。細胞內溶質不能隨意出入，所以外液的張力決定水往哪個方向移動。', S.rbc, { anchor: [1 + R, 0.6, 0.5] });
      S.pG = reg('紅血球', '溶血後的細胞膜（血影）', 'Ruptured RBC (ghost)', '低張溶液中紅血球吸水過多而破裂＝<b>溶血</b>，血紅素流出，只剩細胞膜碎片。', gh, { anchor: [2.6, 1.4, 0.6], hidden: true });
      reg('紅血球', '燒杯（外液）', 'Bathing solution', '改變右側滑桿，即改變外液的滲透濃度。', cylM([1, -3.2, 0], [1, 3.8, 0], 3.4, mat(0x9fd8ff, 0.1), 32, true), { anchor: [-2, 3, 0] });
      S.arrG = new THREE.Group(); S.arrG.position.set(1, 0, 0); CUR.root.add(S.arrG); S.arrows = [];
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2, g = new THREE.Group(); g.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.2, 0.8); g.rotation.set(0, 0, 0);
        const holder = new THREE.Group(); holder.rotation.z = a + Math.PI / 2; holder.position.copy(g.position);
        const ar = new THREE.Group(); ar.add(cylM([0, 0.35, 0], [0, -0.25, 0], 0.06, mat(0x9fe8ff), 6), cone([0, -0.25, 0], [0, -0.6, 0], 0.16, 0x9fe8ff)); holder.add(ar);
        S.arrG.add(holder); S.arrows.push(ar);
      }
      textSprite('水的移動方向（箭頭）', [1, 4.6, 0], 0.55, '#9fe8ff');
      // ── 右：三種溶液對照
      [['低張', 0.9, 7.8], ['等張', 0, 11], ['高張', -0.8, 14.2]].forEach(([t, s, x]) => {
        const m = new THREE.Mesh(rbcGeo(s), mat(0xd03040)); m.position.set(x, 0, 0); m.rotation.x = 1.1; m.scale.setScalar(0.62);
        reg('三種溶液', t + '溶液中的紅血球', 'RBC in ' + (t === '低張' ? 'hypotonic' : t === '等張' ? 'isotonic' : 'hypertonic') + ' solution', t === '低張' ? '外液溶質濃度較低：水滲入細胞 → 膨脹，甚至<b>溶血</b>。例：蒸餾水。' : t === '等張' ? '與細胞內等滲透濃度、溶質不進出：無淨水移動。例：0.9% 生理食鹽水、5% 葡萄糖。' : '外液溶質濃度較高：水滲出 → <b>皺縮</b>（表面呈扇貝狀）。例：海水。', m, { anchor: [x, 1.4, 0.3] });
        textSprite(t, [x, -1.9, 0], 0.6, '#cfe3f5');
      });
      update();
    },
    panel(box) {
      const sl = slider(box, '外液滲透濃度 (mOsm)', 0, 900, OSM, 10, v => { OSM = v; MODE = 'NaCl'; update(); });
      const set = (o, m) => { OSM = o; MODE = m; sl.value = o; sl.previousSibling.textContent = o; update(); };
      btnRow(box, [['蒸餾水', () => set(0, 'NaCl')], ['0.9% NaCl', () => set(300, 'NaCl')], ['5% 葡萄糖', () => set(300, 'glc')]]);
      btnRow(box, [['0.3 m 尿素', () => set(300, 'urea')], ['海水（高張）', () => set(900, 'NaCl')]]);
      S.rd = note(box, '', 'rd');
      checkbox(box, 'U 形管：膜對溶質也通透', false, v => { PERM = v; update(); });
      update();
    }
  });
})();
