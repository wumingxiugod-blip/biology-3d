/* 場景⑦：骨骼肌、心肌、平滑肌的比較（Ch12 12.6、Fig 12.32–12.36；Ch1 肌肉組織） */
(function () {
  let S = null;
  const XK = -24, XC = 0, XS = 24;

  SCENES.push({
    name: '⑦ 三種肌肉',
    title: '骨骼肌、心肌與平滑肌',
    camera: { pos: [0, 7, 44], target: [0, 1.5, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([0, 7, 44], [0, 1.5, 0]); } },
      { label: '🔍 骨骼肌', fn() { flyTo([XK, 3, 20], [XK, 0, 0]); } },
      { label: '🔍 心肌', fn() { flyTo([XC, 3, 20], [XC, 0, 0]); } },
      { label: '🔍 平滑肌', fn() { flyTo([XS, 4, 24], [XS, 2.5, 0]); } }
    ],
    desc: `
  <table>
  <tr><th></th><th>骨骼肌</th><th>心肌</th><th>平滑肌</th></tr>
  <tr><td>橫紋</td><td>有</td><td>有</td><td><b>無</b>（無肌節）</td></tr>
  <tr><td>細胞</td><td>長圓柱、<b>多核</b>（周邊）</td><td>短、<b>分支</b>，核居中</td><td><b>紡錘形</b>，單核居中</td></tr>
  <tr><td>連結</td><td>彼此分開</td><td><b>間盤</b>（含隙型連結）</td><td>單一單位型有隙型連結</td></tr>
  <tr><td>控制</td><td>隨意（體運動神經）</td><td>不隨意，<b>節律點</b>自發</td><td>不隨意（自主神經、激素）</td></tr>
  <tr><td>Ca²⁺ 開關</td><td>肌鈣蛋白</td><td>肌鈣蛋白</td><td><b>攜鈣素</b>＋MLCK</td></tr>
  </table>
  <p><b>心肌</b>：心肌細胞以<b>間盤</b>（intercalated discs）相接，其中的<b>隙型連結</b>讓動作電位在細胞間傳遞，使整個心肌層像<b>一個功能單位</b>收縮。</p>
  <p><b>平滑肌</b>：細肌絲:粗肌絲約 <b>16:1</b>（橫紋肌約 2:1）；細肌絲很長，固定於細胞膜或胞質中的<b>緻密體</b>（dense bodies，相當於 Z 盤）。Ca²⁺ 主要由細胞膜的電壓閘控通道進入 → 與<b>攜鈣素</b>（calmodulin）結合 → 活化<b>肌凝蛋白輕鏈激酶</b>（MLCK）→ 肌凝蛋白磷酸化後才能形成橫橋。Ca²⁺ 下降時肌凝蛋白磷酸酶去磷酸化 → 舒張。可進入<b>門閂狀態</b>（latch state），以很少能量維持張力。</p>
  <p><b>單一單位型</b>平滑肌（如腸道）：自發活動（肌原性），有節律細胞，以隙型連結傳播電活動；<b>多單位型</b>需自主神經刺激，神經沿途的<b>曲張體</b>（varicosities）釋放傳遞物質＝途中突觸（synapses en passant）。</p>
  <details><summary>骨骼肌纖維類型</summary><table>
  <tr><td><b>第 I 型</b>（慢肌）<br>slow oxidative</td><td>紅色：肌紅素多、微血管與粒線體多，有氧代謝、不易疲勞；運動單元小（例：比目魚肌）</td></tr>
  <tr><td><b>第 IIA 型</b><br>fast oxidative-glycolytic</td><td>快縮、氧化能力高（課本歸為<b>紅</b>肌），介於 I 與 IIX 之間</td></tr>
  <tr><td><b>第 IIX 型</b><br>fast glycolytic</td><td>白色：肝醣多、粒線體與肌紅素少，無氧代謝、易疲勞；運動單元大</td></tr>
  </table></details>`,
    build() {
      S = { sm: 0, smT: 0, hw: -1 };
      // ── 骨骼肌
      const kt = stripeTex(40, { I: '#d9a29b' }), kf = [], kn = [], rr = rnd(9);
      [[-1.2, -1.2], [-1.2, 1.2], [1.2, -1.2], [1.2, 1.2]].forEach(([y, z]) => {
        kf.push(cylM([XK - 7, y, z], [XK + 7, y, z], 1.1, tmat(kt), 28));
        for (let k = 0; k < 9; k++) { const a = rr() * Math.PI * 2, x = XK - 6.3 + k * 1.55 + rr() * 0.4; const e = ell([x, y + Math.cos(a) * 1.07, z + Math.sin(a) * 1.07], [0.5, 0.17, 0.17], 0x5060c8); kn.push(e); }
      });
      reg('骨骼肌', '骨骼肌纖維', 'Skeletal muscle fibers', '長圓柱形、<b>有橫紋</b>、彼此在結構與功能上<b>分開</b>；受體運動神經元控制（<b>隨意肌</b>）。舌、食道上段、括約肌、橫膈也是骨骼肌。', kf, { anchor: [XK + 7, 1.2, 1.2] });
      reg('骨骼肌', '多個周邊細胞核', 'Peripheral nuclei (multinucleate)', '由許多肌母細胞融合而成，所以<b>多核</b>，核位於肌膜下方周邊。', kn, { anchor: [XK - 3, -2.3, 1.2] });
      textSprite('骨骼肌', [XK, 4.2, 0], 1.3, '#ffd479', 'Skeletal muscle');

      // ── 心肌：三列細胞，以分支相連，接合處為間盤
      const ct = stripeTex(1, { I: '#d9a29b' }), cells = [], discs = [], cn = [];
      const rows = [-3, 0, 3], seg = 4.4, R = 0.75;
      const addCell = (a, b, idx) => {
        const len = a.distanceTo(b), t = ct.clone(); t.needsUpdate = true; t.repeat.set(1, len / 1.4);
        const m = cylM(a, b, R, tmat(t, 0.8), 20); m.userData.ord = idx; cells.push(m);
        const mid = a.clone().lerp(b, 0.5); cn.push(ell([mid.x, mid.y, mid.z], [0.55, 0.3, 0.3], 0x5060c8));
        cn[cn.length - 1].quaternion.setFromUnitVectors(V(1, 0, 0), b.clone().sub(a).normalize());
      };
      const disc = p => discs.push(cylM(p.clone().add(V(-0.09, 0, 0)), p.clone().add(V(0.09, 0, 0)), R + 0.06, mat(0x402060), 20));
      rows.forEach((y, r) => {
        const sh = r % 2 ? seg / 2 : 0;
        for (let k = 0; k < 3; k++) {
          const a = V(XC - 7 + sh + k * seg, y, 0), b = V(XC - 7 + sh + (k + 1) * seg - 0.2, y, 0);
          if (b.x > XC + 7.4) b.x = XC + 7.4;
          addCell(a, b, a.x); if (k) disc(a);
        }
      });
      // 分支
      [[0, XC - 4.6], [0, XC + 3.4], [1, XC - 1.6], [1, XC + 5.2]].forEach(([r, x]) => {
        const a = V(x, rows[r] + R * 0.6, 0), b = V(x + 1.6, rows[r + 1] - R * 0.6, 0);
        addCell(a, b, x + 0.8); disc(b.clone().add(V(0, 0.15, 0)));
      });
      S.cells = cells.sort((p, q) => p.userData.ord - q.userData.ord);
      reg('心肌', '心肌細胞', 'Myocardial cells', '短、<b>分支</b>、有橫紋，彼此相連成網；不隨意。能自發產生動作電位（起源於<b>節律點</b>），速率受自主神經調節。', cells, { anchor: [XC - 6, 3.6, 0.5] });
      reg('心肌', '間盤', 'Intercalated discs', '相鄰心肌細胞的連接處（染色後為暗線）。含<b>隙型連結</b>（電性突觸，由 connexin 組成）與特殊的胞橋小體；隙型連結集中在細胞兩端，使衝動沿細胞長軸傳遞。', discs, { anchor: [discs[0].position.x, discs[0].position.y + 0.9, 0.3] });
      reg('心肌', '細胞核（居中）', 'Central nuclei', '心肌細胞多為單核（偶有雙核），位於細胞中央。', cn, { anchor: [cn[1].position.x, cn[1].position.y - 0.6, 0.5] });
      textSprite('心肌', [XC, 5.2, 0], 1.3, '#ffd479', 'Cardiac muscle');

      // ── 平滑肌層
      const sp = []; for (let h = 0; h <= 8; h += 0.25) sp.push([0.06 + 0.62 * Math.sin(Math.PI * h / 8) ** 1.1, h]);
      const sc = [], sn = [];
      for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) for (let L = 0; L < 2; L++) {
        const x0 = XS - 9 + k * 6.2 + (r % 2) * 3.1 - 1, y = -3.3 + r * 1.0, z = L ? 0.6 : -0.6;
        if (x0 + 8 > XS + 10) continue;
        sc.push(lathe(sp, 0xd88a80, 0.75, [x0, y, z], [1, 0, 0], 20)); sn.push(ell([x0 + 4, y, z], [1.0, 0.16, 0.16], 0x5060c8));
      }
      reg('平滑肌', '平滑肌細胞', 'Smooth muscle cells', '<b>紡錘形</b>、單核、<b>無橫紋</b>（沒有肌節）；位於消化道、血管、支氣管、泌尿與生殖管道壁。環行與縱行肌層交替收縮產生<b>蠕動</b>。', sc, { anchor: [XS + 6, -3.3, 0.8] });
      reg('平滑肌', '細胞核（單一、居中）', 'Central nucleus', '每個平滑肌細胞一個細長的核，位於最寬的中央部。', sn, { anchor: [XS - 1, -1.3, 0.8] });
      const vb = []; for (let x = XS - 9; x <= XS + 9; x += 0.25) vb.push(V(x, -3.3 + 4.0 + 0.2 * Math.sin(x * 0.7), 1.2));
      const vars = []; for (let x = XS - 7.5; x <= XS + 8; x += 2.5) vars.push(V(x, -3.3 + 4.0 + 0.2 * Math.sin(x * 0.7), 1.2));
      reg('平滑肌', '自主神經軸突與曲張體', 'Autonomic axon with varicosities', '多單位型平滑肌需神經刺激：自主神經軸突沿途的膨大處（<b>曲張體</b>）釋放神經傳遞物質＝<b>途中突觸</b>（synapses en passant）。', [ttube(vb, 0.07, 0xffa040), dots(vars, 0.2, 0xffa040)], { anchor: [XS - 5, 1.0, 1.2] });

      // ── 放大的單一平滑肌細胞（含緻密體與肌絲）
      const g = new THREE.Group(); g.position.set(XS, 6.2, 0); CUR.root.add(g); S.smG = g;
      const big = []; for (let h = 0; h <= 16; h += 0.25) big.push([0.1 + 1.9 * Math.sin(Math.PI * h / 16) ** 1.1, h]);
      const pts = [];
      const parts = [];
      parts.push(reg('平滑肌放大', '平滑肌細胞（放大）', 'Smooth muscle cell (enlarged)', '肌絲斜向交錯成網，收縮時細胞變短變粗（扭轉狀）。', lathe(big, 0xf0b0a8, 0.18, [-8, 0, 0], [1, 0, 0], 36), { anchor: [-6, 1.2, 0.6] }));
      const db = [], dbm = [];
      for (let i = 0; i < 26; i++) { const x = -6 + rr() * 12, rmax = 1.9 * Math.sin(Math.PI * (x + 8) / 16) * 0.75; db.push(V(x, (rr() - 0.5) * 2 * rmax, (rr() - 0.5) * 2 * rmax * 0.6)); }
      for (let i = 0; i < 18; i++) { const x = -6.5 + i * 0.75, rm = 1.9 * Math.sin(Math.PI * (x + 8) / 16) ** 1.1 + 0.08, a = i * 2.1; dbm.push(V(x, Math.cos(a) * rm, Math.sin(a) * rm)); }
      parts.push(reg('平滑肌放大', '緻密體', 'Dense bodies', '細肌絲的錨定點，功能相當於橫紋肌的 <b>Z 盤</b>；散在胞質中，也附著於細胞膜上。', [dots(db, 0.17, 0x402060), dots(dbm, 0.15, 0x402060)], { anchor: [db[0].x, db[0].y, db[0].z] }));
      const all = db.concat(dbm), th = [], tk = [];
      for (let i = 0; i < all.length; i++) {
        const a = all[i], cand = all.map((b, j) => [j, b.distanceTo(a), b.x - a.x]).filter(([j, d, dx]) => j !== i && dx > 0.8 && d < 3.6).sort((p, q) => p[1] - q[1]).slice(0, 2);
        cand.forEach(([j]) => {
          const b = all[j]; th.push([new THREE.CylinderGeometry(0.035, 0.035, a.distanceTo(b), 5), mtx([(a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2], [b.x - a.x, b.y - a.y, b.z - a.z])]);
          if ((i + j) % 3 === 0) { const m = a.clone().lerp(b, 0.5).add(V(0, 0.12, 0.05)); tk.push([new THREE.CylinderGeometry(0.09, 0.09, Math.min(1.1, a.distanceTo(b) * 0.4), 6), mtx([m.x, m.y, m.z], [b.x - a.x, b.y - a.y, b.z - a.z])]); }
        });
      }
      parts.push(reg('平滑肌放大', '細肌絲（肌動蛋白）', 'Thin filaments', '很長、數量多（細:粗 ≈ 16:1），一端固定在緻密體或細胞膜；排列不規則，所以沒有橫紋。', new THREE.Mesh(mergeGeo(th), mat(0x4fb3e8)), { anchor: [2, 0.6, 0.9] }));
      parts.push(reg('平滑肌放大', '粗肌絲（肌凝蛋白）', 'Thick filaments', '散在細肌絲之間；需<b>肌凝蛋白輕鏈被磷酸化</b>（MLCK）後才能形成橫橋。', new THREE.Mesh(mergeGeo(tk), mat(0xe0603a)), { anchor: [-2, -0.6, 0.8] }));
      parts.push(reg('平滑肌放大', '細胞核', 'Nucleus', '單一、居中。', ell([0, 0, 0], [2.4, 0.45, 0.45], 0x5060c8, 0.8), { anchor: [0.5, -0.5, 0.4] }));
      parts.forEach(p => attachPart(p, g));
      textSprite('平滑肌', [XS, 9.8, 0], 1.3, '#ffd479', 'Smooth muscle');

      const dt = dtClock();
      CUR.tick = () => {
        const d = dt();
        S.sm += (S.smT - S.sm) * Math.min(1, d * 1.6);
        S.smG.scale.set(1 - 0.32 * S.sm, 1 + 0.2 * S.sm, 1 + 0.2 * S.sm); S.smG.rotation.x = 0.5 * S.sm;
        sc.forEach(m => m.scale.set(1 + 0.15 * S.sm, 1 - 0.18 * S.sm, 1 + 0.15 * S.sm));
        updateAnchors();
        if (S.hw >= 0) {
          S.hw += d * 6;
          S.cells.forEach(m => { const x = m.userData.ord - (XC - 7); m.material.emissive.setHex(S.hw > x && S.hw < x + 3 ? 0x804000 : 0); });
          if (S.hw > 20) { S.hw = -1; S.cells.forEach(m => m.material.emissive.setHex(0)); }
        }
      };
    },
    panel(box) {
      btn(box, '⚡ 心肌：動作電位經間盤擴散', () => S.hw = 0);
      checkbox(box, '平滑肌收縮（Ca²⁺ 升高）', false, v => { S.smT = v ? 1 : 0; S.setStep(v ? 3 : 5); });
      S.setStep = stepList(box, ['① Ca²⁺ 經細胞膜電壓閘控通道進入（SR 少）', '② Ca²⁺ 與<b>攜鈣素</b>結合', '③ Ca²⁺-攜鈣素活化 <b>MLCK</b>', '④ MLCK 使肌凝蛋白輕鏈<b>磷酸化</b> → 形成橫橋、收縮', '⑤ 可進入<b>門閂狀態</b>，低耗能維持張力', '⑥ Ca²⁺ 下降 → 肌凝蛋白磷酸酶去磷酸化 → 舒張']);
    }
  });
})();
