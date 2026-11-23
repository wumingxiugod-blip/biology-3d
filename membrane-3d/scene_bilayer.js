/* 場景①：細胞膜構造與跨膜運輸的種類（Ch6 6.1–6.3、Fig 6.2、6.6） */
(function () {
  let S = null;
  const CH = V(-6, 0, 0), AQ = V(-1.5, 0, 2), GL = V(4, 0, -0.5), GP = V(9, 0, -3);

  SCENES.push({
    name: '① 細胞膜與運輸',
    title: '細胞膜（流體鑲嵌模型）與跨膜運輸的種類',
    camera: { pos: [4, 10, 28], target: [1, 0, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([4, 10, 28], [1, 0, 0]); } },
      { label: '🔍 簡單擴散', fn() { flyTo([-10, 3, 9], [-10, 0, 0]); } },
      { label: '🔍 通道', fn() { flyTo([-4, 3, 9], [-4, 0, 1]); } },
      { label: '🔍 載體（GLUT）', fn() { flyTo([5, 3, 8], [4, 0, -0.5]); } }
    ],
    desc: `
  <p>細胞膜具<b>選擇通透性</b>：一般不讓蛋白質、核酸等大分子通過；離子、養分、廢物則可經特定方式通過。</p>
  <table>
  <tr><th colspan="2">非載體媒介（被動）</th></tr>
  <tr><td>脂溶性分子的簡單擴散</td><td>O₂、CO₂、類固醇激素直接穿過磷脂層</td></tr>
  <tr><td>離子經通道的簡單擴散</td><td>經<b>通道蛋白</b>（有些常開、有些有閘門）</td></tr>
  <tr><td>水的簡單擴散＝<b>滲透</b></td><td>主要經<b>水通道蛋白</b>（aquaporin）</td></tr>
  <tr><th colspan="2">載體媒介</th></tr>
  <tr><td><b>促進性擴散</b>（被動）</td><td>載體改變構形運送；順濃度梯度、不耗 ATP。例：<b>GLUT</b> 葡萄糖轉運子</td></tr>
  <tr><td><b>主動運輸</b></td><td>逆濃度梯度、需 ATP（幫浦），見②</td></tr>
  </table>
  <p><b>擴散速率</b>取決於：濃度差大小、膜對該分子的通透性、溶液溫度、膜表面積（微絨毛可增加）。</p>
  <p><b>載體媒介運輸</b>的特性：<b>專一性</b>、<b>競爭</b>、<b>飽和</b>（所有載體都被佔滿時達最大運輸速率 Tm）。</p>
  <p class="hint">上方＝細胞外液，下方＝細胞質。</p>`,
    build() {
      S = { t: 0, play: true };
      const holes = [{ x: CH.x, z: CH.z, r: 1.4 }, { x: AQ.x, z: AQ.z, r: 1.3 }, { x: GL.x, z: GL.z, r: 1.8 }, { x: GP.x, z: GP.z, r: 0.8 }];
      const bl = bilayer(24, 12, holes);
      reg('磷脂雙層', '親水性頭部', 'Hydrophilic heads', '磷脂的極性（含磷酸）頭部，朝向膜兩側的水溶液（細胞外液與細胞質）。', bl.heads, { anchor: [-9, 1.3, 5.8] });
      reg('磷脂雙層', '疏水性尾部', 'Hydrophobic tails', '脂肪酸尾部朝向膜內部，形成疏水的障壁：脂溶性分子可通過，離子與大的極性分子不易通過。', bl.tails, { anchor: [-11, 0, 6] });
      const rr = rnd(5), chol = [];
      for (let i = 0; i < 40; i++) { const x = -11 + rr() * 22, z = -5.5 + rr() * 11; if (holes.some(h => Math.hypot(x - h.x, z - h.z) < h.r + 0.3)) continue; chol.push(new THREE.Matrix4().compose(V(x, (rr() < 0.5 ? 1 : -1) * 0.55, z), new THREE.Quaternion(), V(0.14, 0.45, 0.14))); }
      reg('磷脂雙層', '膽固醇', 'Cholesterol', '嵌在磷脂尾部之間的類固醇，調節膜的流動性。', inst(_sph, chol, 0xfff070), { anchor: [chol.length ? new THREE.Vector3().setFromMatrixPosition(chol[0]).x : 0, 0.5, 6] });
      // 通道
      reg('膜蛋白', '離子通道', 'Ion channel', '跨膜蛋白圍成的<b>選擇性</b>孔道，讓特定離子順濃度梯度擴散。有些常開，有些具<b>閘門</b>，受電壓或化學物質控制開關。', helixBundle(CH.toArray(), 5, 0.78, 0x30c0a0), { anchor: [CH.x - 1, 1.8, CH.z + 0.6] });
      reg('膜蛋白', '水通道蛋白（aquaporin）', 'Aquaporin', '讓水分子快速通過的通道；有些細胞常駐，有些（如腎臟）受調節才插入細胞膜。', helixBundle(AQ.toArray(), 6, 0.7, 0x4a8cff), { anchor: [AQ.x, 1.8, AQ.z + 0.8] });
      // GLUT 載體（兩半交替開合）
      S.gA = new THREE.Group(); S.gB = new THREE.Group(); [S.gA, S.gB].forEach((g, i) => { g.position.set(GL.x + (i ? 0.55 : -0.55), 0, GL.z); CUR.root.add(g); });
      const hA = helixBundle([0, 0, 0], 3, 0.45, 0xd070ff), hB = helixBundle([0, 0, 0], 3, 0.45, 0xd070ff);
      const pG = reg('膜蛋白', '載體蛋白（GLUT）', 'Carrier protein (GLUT)', '與葡萄糖專一結合後<b>改變構形</b>，把它釋放到膜的另一側＝<b>促進性擴散</b>：順濃度梯度、不耗 ATP。肌肉的 GLUT4 平時在細胞內小泡中，運動與胰島素使其插入細胞膜。', [hA, hB], { anchor: [GL.x + 1.4, 1.8, GL.z] });
      S.gA.add(hA); S.gB.add(hB); S.pG = pG; pG.anchor.set(GL.x + 1.4, 1.8, GL.z);
      // 醣蛋白、周邊蛋白
      const chain = [V(GP.x, 1.7, GP.z)]; for (let i = 1; i < 7; i++) chain.push(chain[i - 1].clone().add(V(Math.sin(i) * 0.35, 0.42, Math.cos(i * 1.3) * 0.3)));
      reg('膜蛋白', '醣蛋白（含醣鏈）', 'Glycoprotein', '帶有醣鏈的膜蛋白，醣鏈朝細胞外，參與細胞辨識與黏附（如 integrin）。', [cyl([GP.x, -1.6, GP.z], [GP.x, 1.6, GP.z], 0.42, 0xff8080), dots(chain, 0.22, 0x80e080)], { anchor: [GP.x + 0.5, 3.4, GP.z] });
      reg('膜蛋白', '周邊蛋白', 'Peripheral protein', '附著在膜內面（不穿過膜）的蛋白，常與細胞骨架相連。', ell([7.5, -1.85, 2.5], [1.1, 0.5, 0.8], 0xff9a50), { anchor: [7.5, -2.4, 3] });
      textSprite('細胞外液', [-11, 3.6, -5], 0.8, '#9fd8ff'); textSprite('細胞質', [-11, -3.4, -5], 0.8, '#ffc080');
      // 粒子
      S.o2 = particles(12, 0.2, 0xff4040); S.co2 = particles(10, 0.22, 0x9a9a9a); S.na = particles(8, 0.2, 0x4060ff, 0x101040); S.w = particles(14, 0.13, 0xbfe8ff); S.glc = particles(1, 0.34, 0xffd23f, 0x403000);
      reg('運輸的分子', 'O₂（簡單擴散）', 'O₂ – simple diffusion', '非極性、脂溶性的小分子，<b>直接穿過磷脂雙層</b>。組織中 O₂ 淨擴散進入細胞（肺中方向相反）。', S.o2, { anchor: [-10, 2.6, -1] });
      reg('運輸的分子', 'CO₂（簡單擴散）', 'CO₂ – simple diffusion', '代謝產生的 CO₂ 順濃度梯度擴散<b>出</b>細胞。', S.co2, { anchor: [-9, -2.6, 2] });
      reg('運輸的分子', 'Na⁺（經通道）', 'Na⁺ through channel', '帶電離子不能穿過脂質，須經離子通道；Na⁺ 在細胞外濃度較高，順梯度流入。', S.na, { anchor: [CH.x + 0.8, 3, CH.z] });
      reg('運輸的分子', '水（滲透）', 'Water – osmosis', '水分子經水通道蛋白（及少量直接穿過雙層）的淨擴散＝<b>滲透</b>。', S.w, { anchor: [AQ.x + 0.8, 3, AQ.z] });
      reg('運輸的分子', '葡萄糖（促進性擴散）', 'Glucose – facilitated diffusion', '大而極性的分子，必須靠載體。', S.glc, { anchor: [GL.x, 3, GL.z] });
      const mk = (n, f) => new Array(n).fill(0).map((_, i) => f(i));
      S.o2P = mk(12, i => { const x = -11 + (i % 4) * 1.3 + rr() * 0.5, z = -4 + Math.floor(i / 4) * 3 + rr(); return { a: V(x, 5, z), b: V(x + 0.5, -5, z + 0.4), d: rr() }; });
      S.co2P = mk(10, i => { const x = -10.5 + (i % 3) * 1.5, z = -3.5 + Math.floor(i / 3) * 2.6 + rr(); return { a: V(x, -5, z), b: V(x - 0.4, 5, z), d: rr() }; });
      S.naP = mk(8, i => ({ d: i / 8 }));
      S.wP = mk(14, i => ({ d: i / 14 }));
      const dt = dtClock();
      CUR.tick = () => {
        const d = dt(); if (S.play) S.t += d; const t = S.t;
        S.o2P.forEach((p, i) => { const k = ((t / 4 + p.d) % 1); S.o2.setP(i, p.a.clone().lerp(p.b, k)); }); S.o2.instanceMatrix.needsUpdate = true;
        S.co2P.forEach((p, i) => { const k = ((t / 4.5 + p.d) % 1); S.co2.setP(i, p.a.clone().lerp(p.b, k)); }); S.co2.instanceMatrix.needsUpdate = true;
        S.naP.forEach((p, i) => { const k = (t / 3 + p.d) % 1; const pts = [V(CH.x + Math.sin(i * 2) * 2.5, 5, CH.z + Math.cos(i * 2) * 2), V(CH.x, 2, CH.z), V(CH.x, -2, CH.z), V(CH.x + Math.cos(i) * 2.5, -5, CH.z + Math.sin(i) * 2)]; S.na.setP(i, alongPath(pts, k)); }); S.na.instanceMatrix.needsUpdate = true;
        S.wP.forEach((p, i) => { const k = (t / 2.5 + p.d) % 1; const pts = [V(AQ.x + Math.sin(i * 3) * 2.2, 5, AQ.z + Math.cos(i * 3) * 2), V(AQ.x, 1.8, AQ.z), V(AQ.x, -1.8, AQ.z), V(AQ.x + Math.cos(i * 2) * 2.2, -5, AQ.z + Math.sin(i * 2) * 1.6)]; S.w.setP(i, alongPath(pts, k)); }); S.w.instanceMatrix.needsUpdate = true;
        // GLUT 循環
        const ph = (t / 4) % 1;
        let open; // 1=向外開、-1=向內開
        if (ph < 0.3) open = 1; else if (ph < 0.45) open = 1 - 2 * ease((ph - 0.3) / 0.15); else if (ph < 0.8) open = -1; else open = -1 + 2 * ease((ph - 0.8) / 0.2);
        S.gA.rotation.z = -0.28 * open; S.gB.rotation.z = 0.28 * open;
        let gp;
        if (ph < 0.25) gp = V(GL.x + 1.5, 5, GL.z).lerp(V(GL.x, 0.9, GL.z), ease(ph / 0.25));
        else if (ph < 0.45) gp = V(GL.x, 0.9, GL.z).lerp(V(GL.x, -0.9, GL.z), ease((ph - 0.25) / 0.2));
        else if (ph < 0.75) gp = V(GL.x, -0.9, GL.z).lerp(V(GL.x - 1.6, -5, GL.z + 1), ease((ph - 0.45) / 0.3));
        else gp = V(0, -999, 0);
        S.glc.setP(0, gp); S.glc.instanceMatrix.needsUpdate = true;
      };
    },
    panel(box) {
      checkbox(box, '播放分子運動', true, v => S.play = v);
      note(box, '紅＝O₂　灰＝CO₂　藍＝Na⁺　淺藍＝水　黃＝葡萄糖');
    }
  });
})();
