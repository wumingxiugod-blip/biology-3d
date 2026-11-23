/* 場景③：跨上皮運輸與連接複合體（Ch6 Fig 6.21、6.22） */
(function () {
  let S = null;
  const CX = [-4.2, 0, 4.2], HW = 1.95, TOP = 3.5, BOT = -3.5, DZ = 2;

  SCENES.push({
    name: '③ 跨上皮運輸',
    title: '跨上皮運輸：小腸上皮吸收葡萄糖',
    camera: { pos: [9, 4, 31], target: [0, -0.5, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([9, 4, 31], [0, -0.5, 0]); } },
      { label: '🔍 連接複合體', fn() { flyTo([4, 4, 7], [2.1, 2.4, 1.5]); } },
      { label: '🔍 頂端膜（SGLT）', fn() { flyTo([2, 6, 8], [0, 3.5, 0]); } },
      { label: '🔍 基底側膜', fn() { flyTo([3, -4, 9], [0, -3, 0]); } }
    ],
    desc: `
  <p>小腸與腎小管的上皮細胞把葡萄糖由管腔（濃度低）運到血液（濃度高）：</p>
  <ol>
  <li><b>基底側膜</b>的 <b>Na⁺/K⁺ 幫浦</b>（初級主動運輸，耗 ATP）維持細胞內低 Na⁺。</li>
  <li><b>頂端膜</b>的 <b>SGLT</b> 利用 Na⁺ 順梯度流入，把葡萄糖逆梯度帶入細胞（二次主動運輸）。</li>
  <li>細胞內葡萄糖濃度升高，經基底側膜的 <b>GLUT</b> 以<b>促進性擴散</b>出細胞，進入微血管。</li>
  </ol>
  <p>穿過細胞質的路徑＝<b>經細胞運輸</b>（transcellular）；經細胞之間微小間隙＝<b>細胞旁運輸</b>（paracellular），受<b>連接複合體</b>限制：</p>
  <table>
  <tr><td><b>緊密連接</b><br>zonula occludens</td><td>環繞細胞頂端一圈，相鄰細胞膜間隙被封住；有些較「漏」、可選擇性讓離子通過</td></tr>
  <tr><td><b>帶狀胞橋小體</b><br>zonula adherens</td><td>環狀，以穿膜蛋白連結兩細胞的細胞骨架</td></tr>
  <tr><td><b>胞橋小體</b><br>macula adherens</td><td>點狀「鈕扣」般扣住兩細胞</td></tr>
  </table>
  <p class="hint">腦部微血管內皮以緊密連接防止過濾＝血腦障壁的一部分。</p>`,
    build() {
      S = { t: 0, play: true };
      // 細胞
      const cells = [], nuc = [];
      CX.forEach(x => { cells.push(box([x, 0, 0], [2 * HW, TOP - BOT, 2 * DZ], 0xf0c0a8, 0.22)); nuc.push(ell([x, -1.6, 0], [0.9, 1.2, 0.9], 0x5060c8, 0.85)); });
      reg('上皮細胞', '柱狀上皮細胞', 'Columnar epithelial cells', '單層柱狀上皮：細胞極性明顯，頂端與基底側膜上的運輸蛋白不同。', cells, { anchor: [CX[0] - HW, 1, DZ] });
      reg('上皮細胞', '細胞核', 'Nucleus', '', nuc, { anchor: [CX[2] + 0.9, -1.6, 0.5] });
      const mv = [], rr = rnd(6);
      CX.forEach(x => { for (let i = 0; i < 6; i++) for (let k = 0; k < 6; k++) mv.push(mtx([x - HW + 0.32 + i * 0.67, TOP + 0.55, -DZ + 0.33 + k * 0.67])); });
      reg('上皮細胞', '微絨毛（刷狀緣）', 'Microvilli', '頂端膜的指狀突起，大幅增加吸收的<b>表面積</b>（提高擴散速率）。', inst(new THREE.CylinderGeometry(0.13, 0.13, 1.1, 8), mv, 0xf0c0a8), { anchor: [CX[0], TOP + 1.2, DZ] });
      reg('膜區', '頂端膜', 'Apical membrane', '面向管腔的細胞膜，含 SGLT。', CX.map(x => box([x, TOP, 0], [2 * HW, 0.06, 2 * DZ], 0xff9070, 0.6)), { anchor: [CX[2] + 1.5, TOP, DZ] });
      reg('膜區', '基底側膜', 'Basolateral membrane', '面向組織液與血管的細胞膜，含 Na⁺/K⁺ 幫浦與 GLUT。', CX.map(x => box([x, BOT, 0], [2 * HW, 0.06, 2 * DZ], 0x70a0ff, 0.6)), { anchor: [CX[2] + 1.5, BOT, DZ] });
      reg('膜區', '基底膜', 'Basement membrane', '上皮與其下結締組織之間的薄層，上皮靠下方結締組織的血管提供養分。', box([0, BOT - 0.25, 0], [13, 0.3, 2 * DZ + 0.4], 0xd8d0b0, 0.6), { anchor: [-5.8, BOT - 0.3, DZ] });
      reg('膜區', '微血管', 'Capillary', '吸收的葡萄糖最後進入血液。', cylM([-7, -6.5, 0], [7, -6.5, 0], 1.0, mat(0xd03040, 0.45), 24), { anchor: [-5.5, -6.5, 1] });
      // 連接複合體（在相鄰細胞之間的兩條間隙）
      const tj = [], aj = [], ds = [];
      [-2.1, 2.1].forEach(x => {
        tj.push(box([x, TOP - 0.25, 0], [0.24, 0.4, 2 * DZ], 0xff4060));
        aj.push(box([x, TOP - 0.95, 0], [0.24, 0.5, 2 * DZ], 0x40c0a0, 0.85));
        [-1, 0.6].forEach(z => [0.8, -0.8].forEach(y => ds.push(cylM([x - 0.35, y, z], [x + 0.35, y, z], 0.28, mat(0xffd23f), 14))));
      });
      reg('連接複合體', '緊密連接', 'Tight junction (zonula occludens)', '在細胞頂端環繞一圈，相鄰細胞膜緊密貼合、以蛋白質股封住間隙，限制<b>細胞旁運輸</b>。', tj, { anchor: [2.1, TOP - 0.2, DZ] });
      reg('連接複合體', '帶狀胞橋小體', 'Belt desmosome (zonula adherens)', '緊密連接下方的環狀連接，穿膜蛋白連到兩側細胞的細胞骨架。', aj, { anchor: [2.1, TOP - 1, DZ] });
      reg('連接複合體', '胞橋小體', 'Desmosome (macula adherens)', '點狀的連接，像鈕扣把兩細胞扣在一起。', ds, { anchor: [2.1, 0.8, 0.8] });
      // 運輸蛋白（中間細胞）
      const sg = [], gl = [], nk = [];
      [-1.3, 0, 1.3].forEach(z => sg.push(cyl([CX[1] + (z === 0 ? -0.9 : 0.8), TOP - 0.25, z], [CX[1] + (z === 0 ? -0.9 : 0.8), TOP + 0.25, z], 0.3, 0xd070ff)));
      [-1, 1].forEach(z => gl.push(cyl([CX[1] + 0.9, BOT - 0.25, z], [CX[1] + 0.9, BOT + 0.25, z], 0.3, 0xff60c0)));
      [-1.2, 0.4].forEach(z => nk.push(cyl([CX[1] - 0.9, BOT - 0.28, z], [CX[1] - 0.9, BOT + 0.28, z], 0.38, 0xff9a40)));
      reg('運輸蛋白', 'SGLT（頂端膜）', 'Na⁺-glucose cotransporter', 'Na⁺ 順梯度進入的能量帶動葡萄糖<b>逆梯度</b>進入細胞（二次主動運輸）。小腸為 SGLT1（2 Na⁺:1 葡萄糖）。', sg, { anchor: [CX[1] - 0.9, TOP + 0.4, 0.4] });
      reg('運輸蛋白', 'GLUT（基底側膜）', 'GLUT (facilitated diffusion)', '細胞內葡萄糖濃度高，經 GLUT 順梯度<b>促進性擴散</b>出細胞到組織液、再進入血液。', gl, { anchor: [CX[1] + 0.9, BOT - 0.5, 1] });
      reg('運輸蛋白', 'Na⁺/K⁺ 幫浦（基底側膜）', 'Na⁺/K⁺ pump', '把進入細胞的 Na⁺ 送到組織液，維持細胞內低 Na⁺（初級主動運輸）。', nk, { anchor: [CX[1] - 0.9, BOT - 0.5, 0.4] });
      // 路徑示意
      const trans = [V(0.8, 6, 1.3), V(0.8, TOP, 1.3), V(0.2, 0, 1.3), V(0.9, BOT, 1), V(0.9, -5.4, 0.8), V(1.4, -6.3, 0.5)];
      reg('路徑', '經細胞運輸路徑', 'Transcellular route', '經過細胞質：頂端膜 → 細胞質 → 基底側膜。', ttube(trans, 0.05, 0xffffff, 0.55), { anchor: [0.2, 0.5, 1.4] });
      const para = [V(2.1, 6, -1.5), V(2.1, TOP + 0.2, -1.5), V(2.1, BOT, -1.5), V(2.1, -5.4, -1.2)];
      reg('路徑', '細胞旁路徑', 'Paracellular route', '經相鄰細胞之間的間隙，受緊密連接限制。', ttube(para, 0.05, 0x9fd8ff, 0.55), { anchor: [2.1, -1.5, -1.5] });
      textSprite('管腔（小腸）', [-6.6, 6.2, 0], 0.7, '#9fd8ff'); textSprite('組織液／血液', [-6.6, -5, 0], 0.7, '#ffc080');
      // 粒子
      S.g = particles(4, 0.26, 0xffd23f, 0x403000); S.n = particles(8, 0.19, 0x4060ff, 0x101040); S.k = particles(4, 0.19, 0xa050ff); S.p = particles(5, 0.15, 0x9fd8ff);
      [S.g, S.n, S.k, S.p].forEach(m => CUR.root.add(m));
      const dt = dtClock();
      CUR.tick = () => {
        const d = dt(); if (S.play) S.t += d; const t = S.t;
        for (let i = 0; i < 4; i++) S.g.setP(i, alongPath(trans.map((p, j) => p.clone().add(V(0, 0, (i - 1.5) * 0.25 * (j > 0 && j < 4 ? 1 : 0)))), ((t / 6) + i / 4) % 1));
        const nIn = [V(-0.6, 6, 0), V(-0.9, TOP, 0), V(-0.6, 0, 0), V(-0.9, BOT, -1.2), V(-1.6, -5.2, -1.2)];
        for (let i = 0; i < 8; i++) S.n.setP(i, alongPath(nIn.map(p => p.clone().add(V(0, 0, (i % 3 - 1) * 0.3))), ((t / 5) + i / 8) % 1));
        const kIn = [V(-1.4, -5.2, 0.6), V(-0.9, BOT, 0.4), V(-0.4, -1.2, 0.6)];
        for (let i = 0; i < 4; i++) S.k.setP(i, alongPath(kIn, ((t / 4) + i / 4) % 1));
        for (let i = 0; i < 5; i++) { const k = ((t / 9) + i / 5) % 1; S.p.setP(i, alongPath(para.map(p => p.clone().add(V(0, 0, i * 0.5))), S.leak ? k : k * 0.18)); }
        [S.g, S.n, S.k, S.p].forEach(m => m.instanceMatrix.needsUpdate = true);
      };
    },
    panel(box) {
      checkbox(box, '播放', true, v => S.play = v);
      checkbox(box, '緊密連接較「漏」（允許細胞旁運輸）', false, v => S.leak = v);
      note(box, '黃＝葡萄糖　藍＝Na⁺　紫＝K⁺　淺藍＝細胞旁移動的離子／水');
    }
  });
})();
