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
      S = { sm: 0, smT: 0, smStep: -1, smStepTime: 0, smSequence: false, smReleaseTime: 0, hw: -1 };
      // ── 骨骼肌
      const kt = stripeTex(40, { I: '#d9a29b' }), kf = [], kn = [], rr = rnd(9);
      [[-1.2, -1.2], [-1.2, 1.2], [1.2, -1.2], [1.2, 1.2]].forEach(([y, z]) => {
        kf.push(cylM([XK - 7, y, z], [XK + 7, y, z], 1.1, tmat(kt), 28));
        for (let k = 0; k < 9; k++) { const a = rr() * Math.PI * 2, x = XK - 6.3 + k * 1.55 + rr() * 0.4; const e = ell([x, y + Math.cos(a) * 1.07, z + Math.sin(a) * 1.07], [0.5, 0.17, 0.17], 0x5060c8); kn.push(e); }
      });
      reg('骨骼肌', '骨骼肌纖維', 'Skeletal muscle fibers', '長圓柱形、<b>有橫紋</b>、彼此在結構與功能上<b>分開</b>；受體運動神經元控制（<b>隨意肌</b>）。舌、食道上段、括約肌、橫膈也是骨骼肌。', kf, { anchor: [XK + 7, 1.2, 1.2] });
      reg('骨骼肌', '多個周邊細胞核', 'Peripheral nuclei (multinucleate)', '由許多肌母細胞融合而成，所以<b>多核</b>，核位於肌膜下方周邊。', kn, { anchor: [XK - 3, -2.3, 1.2] });
      textSprite('骨骼肌', [XK, 4.2, 0], 1.3, '#ffd479', 'Skeletal muscle');

      // ── 心肌：四列大致平行的心肌細胞首尾相接，列與列之間以斜向分支連成網；接點畫成階梯狀間盤
      const ct = stripeTex(1, { I: '#e4b4aa', A: '#91464a', H: '#c67b73', Z: '#552c38' });
      const cells = [], discs = [], cn = [], mito = [];
      const R = 0.56, RB = 0.38;
      const ROWS = [3, 1, -1, -3];
      const CUTS = [[-2.6, 2.4], [-4.2, 0.6, 4.6], [-1.4, 3.4], [-4.6, -0.2, 4.0]]; // 各列間盤的 x 位置（相鄰列錯開）
      const BRIDGES = [[0, 1, 0.2, 1.8], [0, 1, 4.8, 6.4], [1, 2, -3.6, -2.0], [2, 3, 1.0, 2.6], [2, 3, -6.6, -5.2]]; // [上列, 下列, 上列 x, 下列 x]
      const addFiberSegment = (a, b, r) => {
        const len = a.distanceTo(b), tex = ct.clone(); tex.needsUpdate = true; tex.repeat.set(1, len / 0.42);
        const m = cylM(a, b, r, tmat(tex, 0.96), 24);
        m.userData.waveFrom = Math.min(a.x, b.x) - (XC - 7);
        m.userData.waveTo = Math.max(a.x, b.x) - (XC - 7);
        cells.push(m);
      };
      // 階梯狀間盤（局部座標沿 +x）：三段橫向薄片前後錯開，再以縱向薄片連接，在細胞表面露出一圈階梯狀暗線
      const stepDisc = (Rr, offs) => {
        const t = 0.1, b = [-Rr, -Rr / 3, Rr / 3, Rr], items = [];
        for (let i = 0; i < 3; i++) {
          const sh = new THREE.Shape(), n = 10, u = v => Math.sqrt(Math.max(0, Rr * Rr - v * v));
          for (let k = 0; k <= n; k++) { const v = b[i] + (b[i + 1] - b[i]) * k / n; k ? sh.lineTo(u(v), v) : sh.moveTo(u(v), v); }
          for (let k = n; k >= 0; k--) { const v = b[i] + (b[i + 1] - b[i]) * k / n; sh.lineTo(-u(v), v); }
          const g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }); g.translate(0, 0, -t / 2);
          items.push([g, M4().makeTranslation(offs[i], 0, 0).multiply(M4().makeRotationY(Math.PI / 2))]);
        }
        [1, 2].forEach(i => {
          const v = b[i], x0 = Math.min(offs[i - 1], offs[i]), x1 = Math.max(offs[i - 1], offs[i]);
          items.push([new THREE.BoxGeometry(x1 - x0 + t, 0.08, 2 * Math.sqrt(Rr * Rr - v * v)), M4().makeTranslation((x0 + x1) / 2, v, 0)]);
        });
        return mergeGeo(items);
      };
      const addDisc = (p, dir, Rr, offs) => {
        const m = new THREE.Mesh(stepDisc(Rr, offs), mat(0x1c0a14));
        m.position.copy(p); m.quaternion.setFromUnitVectors(V(1, 0, 0), dir);
        m.userData.wave = p.x - (XC - 7); discs.push(m);
      };
      const rr2 = rnd(21);
      ROWS.forEach((y, r) => {
        const xs = [XC - 7, ...CUTS[r].map(x => XC + x), XC + 7];
        for (let i = 0; i < xs.length - 1; i++) {
          const a = V(xs[i], y, 0), b = V(xs[i + 1], y, 0);
          addFiberSegment(a, b, R);
          const mid = a.clone().lerp(b, 0.42 + rr2() * 0.16);
          cn.push(ell([mid.x, mid.y + 0.05, 0.12], [0.5, 0.27, 0.25], 0x5060c8));
          [0.2, 0.38, 0.66, 0.84].forEach((t, k) => {
            const p = a.clone().lerp(b, t);
            mito.push(ell([p.x, y + (k % 2 ? 0.3 : -0.3), 0.3], [0.3, 0.11, 0.1], 0xe4a646));
          });
        }
        CUTS[r].forEach((x, i) => addDisc(V(XC + x, y, 0), V(1, 0, 0), R + 0.05, i % 2 ? [0.16, -0.14, 0.06] : [-0.16, 0.12, -0.06]));
      });
      BRIDGES.forEach(([ra, rb, xa, xb]) => {
        const A = V(XC + xa, ROWS[ra], 0), B = V(XC + xb, ROWS[rb], 0), M = A.clone().lerp(B, 0.5);
        addFiberSegment(A, M, RB); addFiberSegment(M, B, RB);
        addDisc(M, B.clone().sub(A).normalize(), RB + 0.04, [-0.1, 0.08, -0.04]);
      });
      S.cells = cells;
      S.discs = discs;
      reg('心肌', '心肌細胞', 'Myocardial cells', '短、<b>分支</b>、有橫紋，大致平行排列；細胞首尾以間盤相接，斜向的分支把相鄰的細胞列連成網。每個細胞多為單一居中細胞核，富含粒線體；不隨意，節律點產生的動作電位經細胞網傳導。', cells, { anchor: [XC - 5.5, ROWS[1] + R, 0.3] });
      const discAnchor = discs.find(m => Math.abs(m.position.x - (XC + 0.6)) < 0.01 && Math.abs(m.position.y - ROWS[1]) < 0.01) || discs[0];
      reg('心肌', '間盤', 'Intercalated discs', '相鄰心肌細胞末端的連接處，染色後呈<b>階梯狀暗線</b>。橫向部分以胞橋小體等構造把細胞牢牢接在一起；縱向部分富含<b>隙型連結</b>，讓離子電流與動作電位傳到相鄰細胞。', discs, { anchor: [discAnchor.position.x, discAnchor.position.y + R, 0.2] });
      reg('心肌', '細胞核（居中）', 'Central nuclei', '心肌細胞多為單核（偶有雙核），位於細胞中央。', cn, { anchor: [cn[1].position.x, cn[1].position.y, cn[1].position.z] });
      reg('心肌', '粒線體', 'Mitochondria', '心肌持續收縮、主要依靠有氧代謝，細胞內含大量粒線體。', mito, { anchor: [mito[2].position.x, mito[2].position.y, mito[2].position.z] });
      textSprite('心肌', [XC, 5.2, 0], 1.3, '#ffd479', 'Cardiac muscle');

      // ── 平滑肌層
      const sp = []; for (let h = 0; h <= 8; h += 0.25) sp.push([0.06 + 0.62 * Math.sin(Math.PI * h / 8) ** 1.1, h]);
      const sc = [], sn = [];
      for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) for (let L = 0; L < 2; L++) {
        const x0 = XS - 9 + k * 6.2 + (r % 2) * 3.1 - 1, y = -3.3 + r * 1.0, z = L ? 0.6 : -0.6;
        if (x0 + 8 > XS + 10) continue;
        const cell = lathe(sp, 0xd88a80, 0.75, [x0, y, z], [1, 0, 0], 20);
        cell.userData.restX = x0; sc.push(cell);
        const nucleus = ell([x0 + 4, y, z], [1.0, 0.16, 0.16], 0x5060c8);
        nucleus.userData.restScale = nucleus.scale.clone(); sn.push(nucleus);
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
      parts.push(reg('平滑肌放大', '平滑肌細胞（放大）', 'Smooth muscle cell (enlarged)', '動畫依序呈現 Ca²⁺ 進入、結合攜鈣素、活化 MLCK；肌凝蛋白磷酸化後，細胞才開始縮短變粗。', lathe(big, 0xf0b0a8, 0.18, [-8, 0, 0], [1, 0, 0], 36), { anchor: [-6, 1.2, 0.6] }));
      const db = [], dbm = [];
      for (let i = 0; i < 26; i++) { const x = -6 + rr() * 12, rmax = 1.9 * Math.sin(Math.PI * (x + 8) / 16) * 0.75; db.push(V(x, (rr() - 0.5) * 2 * rmax, (rr() - 0.5) * 2 * rmax * 0.6)); }
      for (let i = 0; i < 18; i++) { const x = -6.5 + i * 0.75, rm = 1.9 * Math.sin(Math.PI * (x + 8) / 16) ** 1.1 + 0.08, a = i * 2.1; dbm.push(V(x, Math.cos(a) * rm, Math.sin(a) * rm)); }
      parts.push(reg('平滑肌放大', '緻密體', 'Dense bodies', '細肌絲的錨定點，功能相當於橫紋肌的 <b>Z 盤</b>；散在胞質中，也附著於細胞膜上。', [dots(db, 0.17, 0x402060), dots(dbm, 0.15, 0x402060)], { anchor: [db[0].x, db[0].y, db[0].z] }));
      const all = db.concat(dbm), th = [], tk = [], pTargets = [];
      for (let i = 0; i < all.length; i++) {
        const a = all[i], cand = all.map((b, j) => [j, b.distanceTo(a), b.x - a.x]).filter(([j, d, dx]) => j !== i && dx > 0.8 && d < 3.6).sort((p, q) => p[1] - q[1]).slice(0, 2);
        cand.forEach(([j]) => {
          const b = all[j]; th.push([new THREE.CylinderGeometry(0.035, 0.035, a.distanceTo(b), 5), mtx([(a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2], [b.x - a.x, b.y - a.y, b.z - a.z])]);
          if ((i + j) % 3 === 0) {
            const m = a.clone().lerp(b, 0.5).add(V(0, 0.12, 0.05));
            tk.push([new THREE.CylinderGeometry(0.09, 0.09, Math.min(1.1, a.distanceTo(b) * 0.4), 6), mtx([m.x, m.y, m.z], [b.x - a.x, b.y - a.y, b.z - a.z])]);
            if (pTargets.length < 3) pTargets.push(m.clone().add(V(0, 0, 0.18)));
          }
        });
      }
      parts.push(reg('平滑肌放大', '細肌絲（肌動蛋白）', 'Thin filaments', '很長、數量多（細:粗 ≈ 16:1），一端固定在緻密體或細胞膜；排列不規則，所以沒有橫紋。', new THREE.Mesh(mergeGeo(th), mat(0x4fb3e8)), { anchor: [2, 0.6, 0.9] }));
      parts.push(reg('平滑肌放大', '粗肌絲（肌凝蛋白）', 'Thick filaments', '散在細肌絲之間；需<b>肌凝蛋白輕鏈被磷酸化</b>（MLCK）後才能形成橫橋。', new THREE.Mesh(mergeGeo(tk), mat(0xe0603a)), { anchor: [-2, -0.6, 0.8] }));
      parts.push(reg('平滑肌放大', '細胞核', 'Nucleus', '單一、居中。', ell([0, 0, 0], [2.4, 0.45, 0.45], 0x5060c8, 0.8), { anchor: [0.5, -0.5, 0.4] }));

      // 平滑肌活化路徑：Ca²⁺ 進入 → 結合攜鈣素 → 活化 MLCK → 磷酸化肌凝蛋白。
      const smoothRadius = x => 0.1 + 1.9 * Math.sin(Math.PI * (x + 8) / 16) ** 1.1;
      const ionXs = [-4, 0, 4], channelMat = mat(0x42d8f2, 0.95, { emissive: 0x123c48 });
      const channelMeshes = [];
      S.caIons = []; S.calmodulins = []; S.pMarkers = [];
      ionXs.forEach((x, i) => {
        const radius = smoothRadius(x), membrane = V(x, 0, radius);
        channelMeshes.push(cylM(membrane.clone().add(V(0, 0, -0.22)), membrane.clone().add(V(0, 0, 0.22)), 0.13, channelMat, 12));
        const start = membrane.clone().add(V(0, 0, 0.88));
        const inside = membrane.clone().add(V(0, 0, -0.2));
        const rest = V(x + 0.35, [-0.3, 0.15, -0.1][i], radius - 0.66);
        const kinaseTarget = [V(2.45, -0.15, 0.55), V(3.15, 0.25, 0.72), V(3.85, -0.15, 0.55)][i];
        const ion = ell([start.x, start.y, start.z], [0.18, 0.18, 0.18], 0x35d9ff);
        ion.material.emissive.setHex(0x14566a); ion.material.emissiveIntensity = 0.7;
        const cam = ell([rest.x, rest.y, rest.z], [0.3, 0.17, 0.17], 0x55d49b);
        cam.material.emissive.setHex(0x15513a); cam.material.emissiveIntensity = 0;
        S.caIons.push({ mesh: ion, start, inside, rest, offset: V(0, 0, 0.2), kinaseTarget });
        S.calmodulins.push({ mesh: cam, rest, target: kinaseTarget, inactiveColor: cam.material.color.clone(), activeColor: new THREE.Color(0x9affc8) });
      });
      const kinasePos = V(3.15, -0.55, 0.28);
      S.mlck = ell([kinasePos.x, kinasePos.y, kinasePos.z], [0.48, 0.32, 0.28], 0x8e79dc);
      S.mlck.material.emissive.setHex(0xb58b27); S.mlck.material.emissiveIntensity = 0;
      S.mlckInactiveColor = S.mlck.material.color.clone(); S.mlckActiveColor = new THREE.Color(0xffc84c);
      const firstRadius = smoothRadius(ionXs[0]);
      pTargets.forEach((target, i) => {
        const marker = ell([target.x, target.y, target.z], [0.15, 0.15, 0.15], 0x727d8d);
        marker.material.emissive.setHex(0x382c16); marker.material.emissiveIntensity = 0.35;
        S.pMarkers.push({ mesh: marker, target, inactiveColor: marker.material.color.clone(), activeColor: new THREE.Color(0xffd45e) });
      });
      S.pChannels = reg('平滑肌放大', 'Ca²⁺ 膜通道', 'Ca²⁺ channels', '細胞膜上的通道讓 Ca²⁺ 進入胞質；標籤引線指向膜上的通道模型。', channelMeshes, { anchor: [ionXs[0], 0, firstRadius] }); parts.push(S.pChannels);
      S.pCalcium = reg('平滑肌放大', 'Ca²⁺ 離子', 'Calcium ions', '藍色球體表示 Ca²⁺：收縮訊號開始時穿過膜通道進入，之後與攜鈣素結合。', S.caIons.map(x => x.mesh), { anchor: [ionXs[1], 0, smoothRadius(ionXs[1]) + 0.88] }); parts.push(S.pCalcium);
      S.pCalmodulin = reg('平滑肌放大', '攜鈣素（calmodulin）', 'Calmodulin', '胞質中的 Ca²⁺ 感受蛋白；結合 Ca²⁺ 後移向並活化 MLCK。', S.calmodulins.map(x => x.mesh), { anchor: [S.calmodulins[1].rest.x, S.calmodulins[1].rest.y, S.calmodulins[1].rest.z] }); parts.push(S.pCalmodulin);
      S.pMLCK = reg('平滑肌放大', '肌凝蛋白輕鏈激酶（MLCK）', 'Myosin light-chain kinase', '由 Ca²⁺－攜鈣素複合體活化；接著磷酸化肌凝蛋白輕鏈，讓橫橋得以形成。', S.mlck, { anchor: [kinasePos.x, kinasePos.y, kinasePos.z] }); parts.push(S.pMLCK);
      S.pPhospho = reg('平滑肌放大', '肌凝蛋白輕鏈磷酸化位點', 'Myosin light-chain phosphorylation sites', '標記肌凝蛋白上的作用位置；④步驟中由 MLCK 磷酸化後亮起，細胞隨後開始收縮。', S.pMarkers.map(x => x.mesh), { anchor: [pTargets[1].x, pTargets[1].y, pTargets[1].z] }); parts.push(S.pPhospho);
      parts.forEach(p => attachPart(p, g));
      textSprite('平滑肌', [XS, 9.8, 0], 1.3, '#ffd479', 'Smooth muscle');

      const dt = dtClock();
      CUR.tick = () => {
        const d = dt();
        const stepDuration = 0.8, latchAt = 4.9;
        S.sm += (S.smT - S.sm) * Math.min(1, d * 1.6);
        if (S.smSequence && S.smStep < 4) {
          S.smStepTime += d;
          const t = S.smStepTime;
          const step = t < stepDuration ? 0 : t < 2 * stepDuration ? 1 : t < 3 * stepDuration ? 2 : t < latchAt ? 3 : 4;
          if (step !== S.smStep) { S.smStep = step; S.setStep(step); }
        }
        const ease01 = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
        const t = S.smStepTime;
        const entry = ease01(t / stepDuration), binding = ease01((t - stepDuration) / stepDuration);
        const activation = ease01((t - 2 * stepDuration) / stepDuration);
        const phosphorylation = ease01((t - 3 * stepDuration) / 0.5);
        if (S.smSequence) {
          S.calmodulins.forEach(c => {
            c.mesh.position.copy(c.rest).lerp(c.target, activation);
            c.mesh.material.emissiveIntensity = t >= stepDuration ? 0.65 : 0;
          });
          S.caIons.forEach((ion, i) => {
            const c = S.calmodulins[i];
            if (t < stepDuration) ion.mesh.position.copy(ion.start).lerp(ion.inside, entry);
            else if (t < 2 * stepDuration) ion.mesh.position.copy(ion.inside).lerp(c.rest.clone().add(ion.offset), binding);
            else ion.mesh.position.copy(c.mesh.position).add(ion.offset);
          });
          S.mlck.material.emissiveIntensity = ease01((t - 2 * stepDuration) / 0.32) * 1.2;
          S.mlck.material.color.copy(S.mlckInactiveColor).lerp(S.mlckActiveColor, activation);
          S.pMarkers.forEach(p => {
            p.mesh.position.copy(p.target);
            p.mesh.material.color.copy(p.inactiveColor).lerp(p.activeColor, phosphorylation);
          });
          // 磷酸化位點完成亮起後，才啟動細胞縮短與增粗。
          S.smT = phosphorylation >= 1 ? 1 : 0;
        } else {
          S.smReleaseTime = Math.min(0.55, S.smReleaseTime + d);
          const release = ease01(S.smReleaseTime / 0.55);
          S.calmodulins.forEach(c => {
            c.mesh.position.copy(c.releaseStart || c.rest).lerp(c.rest, release);
            c.mesh.material.emissiveIntensity = 0;
            c.mesh.material.color.copy(c.inactiveColor);
          });
          S.caIons.forEach(ion => {
            ion.mesh.position.copy(ion.releaseStart || ion.start).lerp(ion.start, release);
          });
          S.mlck.material.emissiveIntensity = 0;
          S.mlck.material.color.copy(S.mlckActiveColor).lerp(S.mlckInactiveColor, release);
          S.pMarkers.forEach(p => {
            p.mesh.material.color.copy(p.activeColor).lerp(p.inactiveColor, release);
          });
        }
        S.smG.scale.set(1 - 0.32 * S.sm, 1 + 0.2 * S.sm, 1 + 0.2 * S.sm); S.smG.rotation.x = 0.5 * S.sm;
        const axial = 1 - 0.18 * S.sm, radial = 1 + 0.15 * S.sm;
        sc.forEach(m => {
          m.scale.set(radial, axial, radial);
          // Lathe profiles run from local y=0 to 8 along world x; compensate half the lost length to shorten about the cell center.
          m.position.x = m.userData.restX + 4 * (1 - axial);
        });
        sn.forEach(m => m.scale.copy(m.userData.restScale).multiply(V(axial, radial, radial)));
        S.pCalcium._loc.copy(S.caIons[1].mesh.position);
        S.pCalmodulin._loc.copy(S.calmodulins[1].mesh.position);
        updateAnchors();
        if (S.hw >= 0) S.hw += d * 5;
        S.cells.forEach(m => {
          const active = S.hw >= 0 && S.hw >= m.userData.waveFrom - 0.2 && S.hw <= m.userData.waveTo + 0.2;
          m.material.emissive.setHex(active ? 0x804000 : 0);
        });
        S.discs.forEach(m => {
          const active = S.hw >= 0 && Math.abs(S.hw - m.userData.wave) < 0.65;
          m.material.emissive.setHex(active ? 0x805020 : 0);
        });
        if (S.hw > 14.8) S.hw = -1;
      };
    },
    panel(box) {
      btn(box, '⚡ 心肌：動作電位經間盤擴散', () => S.hw = 0);
      checkbox(box, '平滑肌收縮（Ca²⁺ 升高）', false, v => {
        if (v) {
          S.smSequence = true; S.smT = 0; S.smStep = 0; S.smStepTime = 0; S.smReleaseTime = 0; S.setStep(0);
        } else {
          S.smSequence = false; S.smT = 0; S.smStep = 5; S.smReleaseTime = 0; S.setStep(5);
          S.caIons.forEach(c => { c.releaseStart = c.mesh.position.clone(); });
          S.calmodulins.forEach(c => { c.releaseStart = c.mesh.position.clone(); });
        }
      });
      S.setStep = stepList(box, ['① Ca²⁺ 經細胞膜電壓閘控通道進入（SR 少）', '② Ca²⁺ 與<b>攜鈣素</b>結合', '③ Ca²⁺-攜鈣素活化 <b>MLCK</b>', '④ MLCK 使肌凝蛋白輕鏈<b>磷酸化</b> → 形成橫橋、收縮', '⑤ 可進入<b>門閂狀態</b>，低耗能維持張力', '⑥ Ca²⁺ 下降 → 肌凝蛋白磷酸酶去磷酸化 → 舒張']);
    }
  });
})();
