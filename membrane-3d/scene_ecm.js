/* 場景⑦：細胞外基質、膠原蛋白的組裝、彈力蛋白與組織工程（Ch6 6.1；補充：膠原蛋白的秘密、組織工程） */
(function () {
  let S = null, STRETCH = 0;
  const helix3 = (a, b, r, turns, n = 160) => [0, 1, 2].map(k => { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n, ang = t * turns * Math.PI * 2 + k * 2.094; pts.push(V(a[0] + (b[0] - a[0]) * t, a[1] + r * Math.cos(ang), a[2] + r * Math.sin(ang))); } return pts; });

  function elastin() {
    const k = STRETCH, items = [];
    S.el.forEach(({ a, b, ph }) => {
      const A = a.clone().multiply(V(1 + 0.6 * k, 1, 1)), B = b.clone().multiply(V(1 + 0.6 * k, 1, 1)), pts = [];
      for (let i = 0; i <= 30; i++) { const t = i / 30, base = A.clone().lerp(B, t), amp = 0.55 * (1 - k) * Math.sin(Math.PI * t); pts.push(base.add(V(0, amp * Math.sin(t * 14 + ph), amp * Math.cos(t * 11 + ph)))); }
      items.push([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.08, 5), null]);
    });
    S.elM.geometry.dispose(); S.elM.geometry = mergeGeo(items);
    S.xl0.forEach((p, i) => S.xlM.setP(i, p.clone().multiply(V(1 + 0.6 * k, 1, 1))));
    S.xlM.instanceMatrix.needsUpdate = true;
  }

  SCENES.push({
    name: '⑦ 細胞外基質',
    title: '細胞外基質（ECM）、膠原蛋白與組織工程',
    camera: { pos: [11, 6, 47], target: [10, 0, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([11, 6, 47], [10, 0, 0]); } },
      { label: '🔍 細胞外基質', fn() { flyTo([-8, 3, 13], [-9, 0, 0]); } },
      { label: '🔍 膠原蛋白組裝', fn() { flyTo([6, 2, 14], [6, 0.5, 0]); } },
      { label: '🔍 彈力蛋白', fn() { flyTo([19, 2, 9], [19, 0, 0]); } },
      { label: '🔍 組織工程支架', fn() { flyTo([29, 3, 10], [29, 0, 0]); } }
    ],
    desc: `
  <p><b>體液</b>：約 67% 在細胞內，33% 在細胞外；細胞外液中約 20% 是血漿、80% 是<b>組織液</b>（間質液）。</p>
  <p><b>細胞外基質</b>（ECM）＝蛋白質纖維＋膠狀<b>基質</b>：</p>
  <ul><li><b>膠原蛋白</b>纖維（像鋼筋，提供強度）與<b>彈力蛋白</b>纖維（提供彈性）。</li>
  <li>膠狀基質含<b>醣蛋白</b>（蛋白質＋醣）與<b>蛋白聚醣</b>（以多醣為主），親水、保有水分並耐壓。</li>
  <li><b>整合素</b>（integrin）：自細胞骨架穿過細胞膜、結合 ECM 的醣蛋白，作為黏附分子並在細胞內外<b>傳遞訊號</b>，影響細胞極性、移動與增生。</li></ul>
  <p><b>膠原蛋白的組裝</b>（補充）：① 三條多胜肽鏈纏成三股螺旋的<b>膠原蛋白分子</b> → ② 多個分子平行錯位排成<b>微纖維</b> → ③ 微纖維聚成<b>細纖維</b> → ④ 細纖維束成<b>膠原纖維</b>。第一型膠原蛋白約佔全身膠原蛋白的 90%。</p>
  <p><b>彈力蛋白</b>：多胜肽鏈以共價鍵<b>交聯</b>成網，可拉伸與回縮。</p>
  <p><b>組織工程三要素</b>（補充）：<b>人工細胞外基質（支架）</b>：可分解的多孔性高分子材料，模擬 ECM 讓細胞附著生長；<b>細胞</b>：自體、同種、異種、幹細胞或基因改造細胞；<b>生長訊號</b>：生長因子等。</p>`,
    build() {
      S = {};
      const rr = rnd(15);
      // ── 左：細胞外基質
      const E = V(-9, 0, 0);
      reg('細胞外基質', '基質（膠狀）', 'Ground substance', '含醣蛋白與蛋白聚醣的親水膠體，填在纖維與細胞之間。', box([E.x, E.y - 0.4, 0], [10, 6, 5], 0x9fd8ff, 0.1), { anchor: [E.x - 4.6, E.y + 2.4, 2.5] });
      const col = [];
      for (let i = 0; i < 5; i++) { const y = -2.6 + i * 0.9, z = -1.6 + (i % 3) * 1.3, pts = []; for (let x = -5; x <= 5; x += 0.5) pts.push(V(E.x + x, y + 0.25 * Math.sin(x * 0.8 + i), z + 0.3 * Math.cos(x * 0.6 + i))); col.push(ttube(pts, 0.3, 0xf4efe2)); }
      reg('細胞外基質', '膠原纖維', 'Collagen fibers', '最多的 ECM 蛋白，具高<b>抗張強度</b>（像鋼筋）；由膠原細纖維束成（見中間）。', col, { anchor: [E.x + 4.6, -0.8, 1.6] });
      const ela = [];
      for (let i = 0; i < 4; i++) { const pts = []; for (let x = -5; x <= 5; x += 0.5) pts.push(V(E.x + x, -2 + i * 1.2 + 0.4 * Math.sin(x * 1.4 + i * 2), 1.4 - i * 0.9 + 0.4 * Math.cos(x * 1.1 + i))); ela.push(ttube(pts, 0.1, 0xf2d060)); }
      reg('細胞外基質', '彈性纖維', 'Elastic fibers', '由彈力蛋白構成、可拉長並回彈的細纖維。', ela, { anchor: [E.x - 4.8, 1.0, 1.4] });
      const pg = [];
      for (let i = 0; i < 6; i++) { const c = V(E.x - 3.5 + i * 1.4, -1.5 + (i % 2) * 2.2, 1.9 - (i % 3) * 1.6); pg.push(cylM(c.clone().add(V(-0.6, 0, 0)), c.clone().add(V(0.6, 0, 0)), 0.05, mat(0x80e080), 5)); for (let k = 0; k < 7; k++) { const x = -0.5 + k * 0.17, a = k * 1.3; pg.push(cylM(c.clone().add(V(x, 0, 0)), c.clone().add(V(x, Math.cos(a) * 0.45, Math.sin(a) * 0.45)), 0.025, mat(0x80e080), 4)); } }
      reg('細胞外基質', '蛋白聚醣', 'Proteoglycans', '核心蛋白上接許多多醣（醣胺聚醣）側鏈，像試管刷；吸水，使基質耐壓。', pg, { anchor: [E.x - 3.5, -1.0, 1.9] });
      // 纖維母細胞＋整合素
      const cellC = V(E.x, 3.2, 0);
      reg('細胞', '纖維母細胞', 'Fibroblast', '分泌膠原蛋白、彈力蛋白與基質成分的細胞。', [ell([cellC.x, cellC.y, 0], [3.2, 0.9, 1.6], 0xf0b0a0, 0.75), ell([cellC.x, cellC.y + 0.1, 0], [0.9, 0.45, 0.6], 0x5060c8)], { anchor: [cellC.x - 2.8, cellC.y + 0.6, 0.8] });
      const ig = [], fnn = [], ck = [];
      [-2, -0.7, 0.7, 2].forEach((dx, i) => {
        const top = V(cellC.x + dx, cellC.y - 0.55, (i % 2 ? 0.5 : -0.4)), bot = top.clone().add(V(0, -0.9, 0));
        ig.push(cylM(top, bot, 0.09, mat(0xff60c0), 6), cylM(top.clone().add(V(0.15, 0, 0)), bot.clone().add(V(0.15, 0, 0)), 0.09, mat(0xff60c0), 6));
        fnn.push(ttube([bot, bot.clone().add(V(0.4, -0.6, 0.2)), bot.clone().add(V(0.1, -1.3, 0.1))], 0.07, 0xffa040));
        ck.push(ttube([top.clone().add(V(0.07, 0.15, 0)), top.clone().add(V(0.5, 0.45, 0.1)), V(cellC.x + dx * 0.2, cellC.y + 0.2, 0)], 0.04, 0xff4040));
      });
      reg('細胞', '整合素', 'Integrins', '<b>穿膜醣蛋白</b>：細胞內連細胞骨架、細胞外結合 ECM 成分，作為黏附分子並把訊號在細胞內外之間傳遞（integrate）。', ig, { anchor: [cellC.x - 2, cellC.y - 1.1, -0.4] });
      reg('細胞', '醣蛋白（如纖連蛋白）', 'Glycoproteins (e.g., fibronectin)', 'ECM 中的醣蛋白，連接整合素與膠原纖維；也能結合生長因子並遞送到細胞表面受體。', fnn, { anchor: [cellC.x + 0.8, cellC.y - 2.1, 0.5] });
      reg('細胞', '細胞骨架（肌動蛋白絲）', 'Cytoskeleton', '細胞內的蛋白纖維；經整合素與細胞外基質相連。', ck, { anchor: [cellC.x + 0.5, cellC.y + 0.4, 0.6] });
      textSprite('細胞外基質', [E.x, 5.4, 0], 0.8, '#ffd479', 'Extracellular matrix');

      // ── 中：膠原蛋白四步組裝
      const M = 1.5;
      const tri = helix3([M - 2, 0, 0], [M + 2, 0, 0], 0.22, 4).map((p, k) => ttube(p, 0.09, [0xff6060, 0x60c0ff, 0x60e080][k]));
      reg('膠原蛋白組裝', '① 膠原蛋白分子（三股螺旋）', 'Collagen molecule (triple helix)', '三條多胜肽鏈（α 鏈）互相纏繞成穩定的<b>三股螺旋</b>（分子在細胞外切除兩端非螺旋部分後形成）。補充資料：分子量約 28 萬、長約 280 nm、直徑約 1.5 nm。', tri, { anchor: [M - 1.5, 0.4, 0.3] });
      textSprite('①', [M, 1.3, 0], 0.6, '#ffd479');
      const mf = []; for (let r = 0; r < 5; r++) for (let s = 0; s < 2; s++) { const y = -0.6 + r * 0.3, x0 = M + 3.5 + s * 2.3 + (r % 5) * 0.46; mf.push(cylM([x0, y, 0], [x0 + 2, y, 0], 0.11, mat(0xffb0a0), 8)); }
      reg('膠原蛋白組裝', '② 膠原蛋白微纖維', 'Microfibril', '多個膠原蛋白分子<b>平行、彼此錯開</b>排列並交聯（錯位排列造成細纖維上的橫紋）。', mf, { anchor: [M + 5, 0.9, 0.3] });
      textSprite('②', [M + 5.3, 1.3, 0], 0.6, '#ffd479');
      const fbT = stripeTex(8, { I: '#f4e8dc', A: '#d8c4b0', H: '#e8d8c8', Z: '#c8b098' });
      reg('膠原蛋白組裝', '③ 膠原蛋白細纖維', 'Fibril', '微纖維聚集成的細纖維，電子顯微鏡下有規則的<b>橫紋</b>。', cylM([M + 9.2, 0, 0], [M + 13, 0, 0], 0.55, tmat(fbT), 24), { anchor: [M + 11, 0.8, 0.4] });
      textSprite('③', [M + 11, 1.3, 0], 0.6, '#ffd479');
      const fb = []; for (let i = 0; i < 7; i++) { const a = i / 6 * Math.PI * 2, rr2 = i ? 0.5 : 0; fb.push(cylM([M + 14.2, Math.cos(a) * rr2, Math.sin(a) * rr2], [M + 17.2, Math.cos(a) * rr2, Math.sin(a) * rr2], 0.26, tmat(fbT), 16)); }
      reg('膠原蛋白組裝', '④ 膠原纖維', 'Collagen fiber', '許多細纖維束成肉眼可見的膠原纖維；具向性的膠原纖維抗拉強度很高。', fb, { anchor: [M + 15.7, 1.0, 0.4] });
      textSprite('④', [M + 15.7, 1.5, 0], 0.6, '#ffd479');
      textSprite('膠原蛋白的形成', [M + 7.5, 3.2, 0], 0.75, '#ffd479', 'Collagen assembly');
      dash([M + 2, 0, 0], [M + 3.4, 0, 0]); dash([M + 8.3, 0, 0], [M + 9.1, 0, 0]); dash([M + 13.1, 0, 0], [M + 14.1, 0, 0]);

      // ── 右：彈力蛋白網
      const L = V(19.5, -3.8, 0);
      S.el = []; const nodes = [];
      for (let i = 0; i < 9; i++) nodes.push(V((rr() - 0.5) * 4, L.y + (rr() - 0.5) * 2.4, (rr() - 0.5) * 2));
      for (let i = 0; i < nodes.length; i++) nodes.map((q, j) => [j, q.distanceTo(nodes[i])]).filter(x => x[0] > i).sort((a, b) => a[1] - b[1]).slice(0, 2).forEach(([j]) => S.el.push({ a: nodes[i], b: nodes[j], ph: rr() * 6 }));
      S.elM = new THREE.Mesh(new THREE.BufferGeometry(), mat(0xf2d060)); S.elM.position.x = L.x;
      reg('彈力蛋白', '彈力蛋白分子', 'Elastin molecules', '捲曲的多胜肽鏈；被拉伸時伸直，放開後回縮。', S.elM, { anchor: [L.x - 1.8, L.y + 1.4, 0.5] });
      S.xl0 = nodes.map(n => n.clone());
      S.xlM = dots(S.xl0, 0.18, 0xff6040); S.xlM.position.x = L.x;
      reg('彈力蛋白', '交聯', 'Cross-links', '彈力蛋白分子之間的共價交聯，使網路在拉伸後能回到原狀。', S.xlM, { anchor: [L.x + S.xl0[0].x, S.xl0[0].y, S.xl0[0].z + 0.3] });
      textSprite('彈力蛋白', [L.x, L.y + 2.4, 0], 0.65, '#ffd479', '拉伸 ⇄ 舒張');
      elastin();

      // ── 最右：組織工程支架
      const T = V(29, 0, 0), st = [];
      for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
        st.push([new THREE.CylinderGeometry(0.12, 0.12, 4.4, 6), mtx([T.x + i * 1.0, T.y, j * 1.0])]);
        st.push([new THREE.CylinderGeometry(0.12, 0.12, 4.4, 6), mtx([T.x, T.y + i * 1.0, j * 1.0], [1, 0, 0])]);
        st.push([new THREE.CylinderGeometry(0.12, 0.12, 4.4, 6), mtx([T.x + i * 1.0, T.y + j * 1.0, 0], [0, 0, 1])]);
      }
      reg('組織工程', '人工細胞外基質（多孔支架）', 'Scaffold', '以可分解的天然或合成高分子製成、具<b>多孔性</b>的支架，模擬體內 ECM，讓細胞附著、遷入並增生；之後被酵素或水分解，組織逐漸再生。', new THREE.Mesh(mergeGeo(st), mat(0xd8d8e8, 0.8)), { anchor: [T.x + 2.3, T.y + 2.3, 0.4] });
      const cs = []; for (let i = 0; i < 26; i++) cs.push(V(T.x + Math.round((rr() - 0.5) * 4) + 0.5 * Math.sign(rr() - 0.5) * 0.9, T.y + Math.round((rr() - 0.5) * 4), Math.round((rr() - 0.5) * 4) * 1.0 + 0.45));
      reg('組織工程', '植入的細胞', 'Seeded cells', '細胞來源：自體、同種、異種細胞、幹細胞或基因改造細胞。', dots(cs, 0.32, 0xff8a70, 12), { anchor: [cs[0].x, cs[0].y, cs[0].z] });
      const gf = []; for (let i = 0; i < 40; i++) gf.push(V(T.x + (rr() - 0.5) * 4.4, T.y + (rr() - 0.5) * 4.4, (rr() - 0.5) * 4.4));
      reg('組織工程', '生長因子（生長訊號）', 'Growth factors', '促進細胞分裂、遷移與分化的訊號分子，可接在支架材料上釋放。', dots(gf, 0.1, 0x60ff90), { anchor: [T.x - 2.4, T.y - 2.2, 1] });
      textSprite('組織工程三要素', [T.x, 3.4, 0], 0.7, '#ffd479', '支架＋細胞＋生長訊號');
    },
    panel(box) {
      slider(box, '拉伸彈力蛋白', 0, 1, STRETCH, 0.02, v => { STRETCH = v; elastin(); });
    }
  });
})();
