/* 場景③：橫橋循環與 Ca²⁺ 調控（Ch12 Fig 12.10–12.14） */
(function () {
  const YT = 2.6, RISE = 1.1, PITCH = 15.4, STROKE = 1.1; // 細肌絲軸高、每股單體間距、螺旋週期、每次衝程位移（≈ 6 nm）
  const TIPY = YT - 1.08, P = V(0, -3.5, 0), HD = V(0.33, -0.94, 0).normalize();
  let S = null;

  const STEPS = [
    '<b>1</b> 靜止：肌凝蛋白頭部已被 ATP 水解「扳起」（帶 ADP＋Pi），但尚未與肌動蛋白結合',
    '<b>2</b> 頭部與肌動蛋白結合，形成<b>橫橋</b>',
    '<b>3</b> <b>Pi 釋出</b>，引起肌凝蛋白構形改變',
    '<b>4</b> <b>動力衝程</b>：頭部擺動，把細肌絲拉向 M 線（約 6 nm）；接著 ADP 釋出',
    '<b>5</b> 新的 <b>ATP 結合</b>頭部 → 頭部與肌動蛋白分離',
    '<b>6</b> ATP 被水解為 ADP＋Pi（兩者仍留在頭部上），頭部重新「扳起」回原方向，準備下一次循環'
  ];
  const DUR = [1.0, 0.7, 0.6, 1.0, 0.8, 1.0];

  function strandPts(s, delta, r) {
    const pts = [];
    for (let x = -31; x <= 31; x += 0.25) { const a = 2 * Math.PI * x / PITCH + s * Math.PI + delta; pts.push(V(x, r * Math.cos(a), r * Math.sin(a))); }
    return pts;
  }
  function setTM(delta) {
    S.tm.forEach((m, s) => {
      m.geometry.dispose();
      m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strandPts(s, delta, 0.98)), 400, 0.15, 6);
    });
    // 肌鈣蛋白：每條肌旋蛋白（≈7 個肌動蛋白長）上一個複合體
    const o = new THREE.Object3D(); let k = 0;
    S.tnPos.forEach(([s, x]) => {
      const a = 2 * Math.PI * x / PITCH + s * Math.PI + delta, n = V(0, Math.cos(a), Math.sin(a));
      const put = (m, dx, r, sc) => { o.position.set(x + dx, 0, 0).addScaledVector(n, r); o.scale.set(...sc); o.quaternion.identity(); o.updateMatrix(); m.setMatrixAt(k, o.matrix); };
      put(S.tnT, 0, 1.22, [0.75, 0.2, 0.2]); put(S.tnI, 0.42, 1.5, [0.26, 0.26, 0.26]); put(S.tnC, -0.38, 1.52, [0.3, 0.3, 0.3]);
      put(S.caB, -0.38, 1.98, [0.16, 0.16, 0.16]);
      k++;
    });
    [S.tnT, S.tnI, S.tnC, S.caB].forEach(m => m.instanceMatrix.needsUpdate = true);
    S.delta = delta;
  }

  // 由狀態算頭部位置：att 0=分離 1=結合；sk 0=衝程前（扳起） 1=衝程後
  function pose(att, sk) {
    const T = V(0.55 - STROKE * sk, TIPY - 0.95 * (1 - att), 0);
    const J = T.clone().addScaledVector(HD, 2.4);
    const a = (-50 + 100 * sk) * Math.PI / 180, L = J.clone().add(V(1.7 * Math.sin(a), -1.7 * Math.cos(a), 0));
    return { T, J, L };
  }
  function placeMyosin(att, sk) {
    const { T, J, L } = pose(att, sk);
    S.heads.forEach((h, i) => {
      const z = i ? -0.45 : 0.45, t = T.clone().setZ(z), j = J.clone().setZ(z), l = L.clone().setZ(z * 0.6);
      h.head.position.copy(t).add(j).multiplyScalar(0.5);
      h.head.quaternion.setFromUnitVectors(V(1, 0, 0), t.clone().sub(j).normalize());
      setCyl(h.lever, j, l, 0.2); setCyl(h.s2, l, P.clone().setZ(z * 0.3), 0.15);
    });
    S.pHead.anchor.copy(T).add(J).multiplyScalar(0.5).setZ(0.45);
    S.pLever.anchor.copy(J).add(L).multiplyScalar(0.5).setZ(0.3);
    S.nucBase = T.clone().add(J).multiplyScalar(0.5).add(V(-0.25, -0.1, 0.95));
  }

  SCENES.push({
    name: '③ 橫橋循環',
    title: '橫橋循環與 Ca²⁺ 的開關作用',
    camera: { pos: [2, 2, 22], target: [0, 0, 0] },
    controls: [
      { label: '🔍 橫橋', fn() { flyTo([2, 0, 13], [0, -0.5, 0]); } },
      { label: '🔍 細肌絲', fn() { flyTo([0, 7, 16], [0, 2.6, 0]); } },
      { label: '🔍 全部', fn() { flyTo([2, 2, 22], [0, 0, 0]); } }
    ],
    desc: `
  <p><b>細肌絲</b>（F-actin）：300–400 個球狀 <b>G-actin</b> 排成雙列、扭成螺旋。<b>肌旋蛋白</b>（tropomyosin）躺在雙列之間的溝中，每條約跨 7 個肌動蛋白；<b>肌鈣蛋白</b>（troponin）附著於肌旋蛋白上（不直接接在肌動蛋白），由三個次單元組成：</p>
  <table>
  <tr><td><b>TnI</b></td><td>抑制橫橋與肌動蛋白結合</td></tr>
  <tr><td><b>TnT</b></td><td>與肌旋蛋白結合</td></tr>
  <tr><td><b>TnC</b></td><td>與 Ca²⁺ 結合</td></tr>
  </table>
  <p><b>Ca²⁺ 開關</b>：放鬆時肌質 Ca²⁺ 很低，肌旋蛋白蓋住肌動蛋白上的結合位；肌質 Ca²⁺ 升高（&gt; 10⁻⁶ M）時 Ca²⁺ 結合 TnC，肌鈣蛋白-肌旋蛋白複合體移位、露出結合位，橫橋才能結合。</p>
  <p><b>ATP 的雙重角色</b>：ATP 水解才能「扳起」頭部；新的 ATP 結合才能讓頭部<b>離開</b>肌動蛋白。沒有 ATP 時頭部卡在結合狀態＝<b>僵直複合體</b>（rigor complex），死後的<b>屍僵</b>即此原因。</p>
  <p>各橫橋的動力衝程<b>不同步</b>（像拔河而非划船），所以總有一些橫橋抓住細肌絲。</p>
  <p class="hint">此處只動畫一個肌凝蛋白分子（兩個頭部）；紅點＝肌動蛋白上的肌凝蛋白結合位。</p>`,
    build() {
      S = { off: 0, step: 0, t: 0, ca: 1, caV: 1, atp: true, speed: 1, delta: 0.75 };
      const gF = new THREE.Group(); gF.position.y = YT; CUR.root.add(gF); S.gF = gF;
      // G-actin（兩股）與結合位
      const beads = [[], []], sites = [];
      for (let s = 0; s < 2; s++) for (let i = -28; i <= 28; i++) {
        const x = i * RISE + s * RISE / 2, a = 2 * Math.PI * x / PITCH + s * Math.PI, n = V(0, Math.cos(a), Math.sin(a));
        beads[s].push(V(x, 0, 0).addScaledVector(n, 0.5)); sites.push(V(x, 0, 0).addScaledVector(n, 1.0));
      }
      const pA = reg('細肌絲', 'G-肌動蛋白', 'G-actin', '球狀肌動蛋白單體；300–400 個排成雙列並扭成螺旋，構成 F-actin（細肌絲的主幹）。', [dots(beads[0], 0.55, 0x4fb3e8, 1, 14), dots(beads[1], 0.55, 0x3d8fd0, 1, 14)], { anchor: [-6, YT + 0.5, 0.4] });
      const pS = reg('細肌絲', '肌凝蛋白結合位', 'Myosin-binding sites', '肌動蛋白上供肌凝蛋白頭部結合的位置。放鬆時被肌旋蛋白遮住。', dots(sites, 0.17, 0xff3040), { anchor: [-3, YT + 1, 0.3] });
      S.tm = [0, 1].map(() => new THREE.Mesh(new THREE.BufferGeometry(), mat(0x7be07b)));
      const pTM = reg('細肌絲', '肌旋蛋白', 'Tropomyosin', '位於兩列 G-actin 之間溝槽中的細長蛋白，每條約跨 7 個肌動蛋白（每條細肌絲 40–60 條）。放鬆時<b>擋住結合位</b>。', S.tm, { anchor: [4, YT + 1, 0.3] });
      S.tnPos = [];
      for (let s = 0; s < 2; s++) for (let k = -4; k <= 3; k++) S.tnPos.push([s, k * 7.7 + s * 3.85 + 2]);
      const sg = new THREE.SphereGeometry(1, 12, 8), mk = c => inst(sg, S.tnPos.map(() => M4()), c);
      S.tnT = mk(0xb070ff); S.tnI = mk(0xff7ad0); S.tnC = mk(0xffd23f); S.caB = mk(0x30ff90);
      const pT = reg('肌鈣蛋白', '肌鈣蛋白 T（TnT）', 'Troponin T', '與<b>肌旋蛋白</b>結合，把肌鈣蛋白複合體固定在肌旋蛋白上。', S.tnT, { anchor: [2, YT, 1.2] });
      const pI = reg('肌鈣蛋白', '肌鈣蛋白 I（TnI）', 'Troponin I', '<b>抑制</b>橫橋與肌動蛋白結合。', S.tnI, { anchor: [2.4, YT, 1.5] });
      const pC = reg('肌鈣蛋白', '肌鈣蛋白 C（TnC）', 'Troponin C', '與 <b>Ca²⁺</b> 結合的次單元；結合 Ca²⁺ 後引起複合體構形改變，使肌旋蛋白移開。', S.tnC, { anchor: [1.6, YT, 1.5] });
      S.pCa = reg('肌鈣蛋白', 'Ca²⁺', 'Calcium ions', '動作電位使肌質網釋出 Ca²⁺；肌質 Ca²⁺ 濃度超過約 10⁻⁶ M 時，Ca²⁺ 與 TnC 結合而啟動收縮。', S.caB, { anchor: [1.6, YT, 2] });
      [pA, pS, pTM, pT, pI, pC, S.pCa].forEach(p => attachPart(p, gF));
      setTM(S.delta);

      // 粗肌絲主幹與其他（靜止的）頭部
      reg('粗肌絲', '粗肌絲（肌凝蛋白尾部）', 'Thick filament (myosin tails)', '許多肌凝蛋白的纖維狀尾部束成粗肌絲；頭部經鉸鏈段伸向細肌絲。', cyl([-32, -4.4, 0], [32, -4.4, 0], 0.9, 0xe0603a), { anchor: [-8, -4.4, 0.9] });
      const others = [];
      [-8.8, -4.4, 4.4, 8.8, -13.2, 13.2].forEach((x, k) => {
        const sk = k % 2 ? 0 : 1, { T, J, L } = pose(0, sk), dx = x;
        [0.45, -0.45].forEach(z => {
          const t = T.clone().add(V(dx, 0, z)), j = J.clone().add(V(dx, 0, z)), l = L.clone().add(V(dx, 0, z * 0.6));
          const h = ell([0, 0, 0], [1.35, 0.55, 0.5], 0xffb08a, 0.75); h.position.copy(t).add(j).multiplyScalar(0.5);
          h.quaternion.setFromUnitVectors(V(1, 0, 0), t.clone().sub(j).normalize()); others.push(h);
          const lv = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 10), mat(0xffb08a, 0.75)); setCyl(lv, j, l, 0.2); others.push(lv);
          const s2 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8), mat(0xe07a50, 0.75)); setCyl(s2, l, V(dx, -3.5, z * 0.3), 0.15); others.push(s2);
        });
      });
      reg('粗肌絲', '其他肌凝蛋白頭部', 'Other myosin heads', '每個頭部各自循環、<b>不同步</b>：任一時刻只有部分橫橋結合，因此細肌絲不會滑回去。', others, { anchor: [8.8, -1, 0.5] });

      // 正在動畫的肌凝蛋白分子（兩個頭部）
      const hm = mat(0xff8a4c), lm = mat(0xffa070), sm = mat(0xe07a50), ug = new THREE.CylinderGeometry(1, 1, 1, 12); ug.userData.shared = true;
      S.heads = [0, 1].map(() => ({ head: new THREE.Mesh(_sph, hm), lever: new THREE.Mesh(ug, lm), s2: new THREE.Mesh(ug, sm) }));
      S.heads.forEach(h => h.head.scale.set(1.35, 0.55, 0.5));
      S.pHead = reg('肌凝蛋白', '肌凝蛋白頭部', 'Myosin head', '每個肌凝蛋白分子有<b>兩個球狀頭部</b>；頭部有<b>肌動蛋白結合位</b>與 <b>ATP 結合位</b>（本身就是 ATPase，可水解 ATP）。', S.heads.map(h => h.head), { anchor: [0, 0, 0] });
      S.pLever = reg('肌凝蛋白', '鉸鏈段', 'Hinge segment', '連接頭部與尾部、可彎曲的部分；動力衝程時頭部以此為支點擺動。', S.heads.flatMap(h => [h.lever, h.s2]), { anchor: [0, 0, 0] });
      // 核苷酸圖示
      const nm = (c, r) => { const m = new THREE.Mesh(_sph, mat(c)); m.scale.setScalar(r); CUR.root.add(m); return m; };
      S.nATP = nm(0x50e060, 0.3); S.nADP = nm(0xffa040, 0.27); S.nPi = nm(0xffe040, 0.17);
      S.tATP = textSprite('ATP', [0, 0, 0], 0.55, '#7dff8a'); S.tADP = textSprite('ADP', [0, 0, 0], 0.5, '#ffb060'); S.tPi = textSprite('Pi', [0, 0, 0], 0.5, '#ffe060');
      textSprite('← 細肌絲被拉向 M 線（肌節中央）', [-6, 6.2, 0], 0.75, '#ffd479');
      textSprite('Z 盤方向 →', [10, 6.2, 0], 0.7, '#a0d8ff');
      S.rig = textSprite('⚠ 僵直複合體（無 ATP，頭部無法分離）', [0, -6.6, 0], 0.75, '#ff8080'); S.rig.visible = false;
      S.blk = textSprite('Ca²⁺ 低：肌旋蛋白擋住結合位，橫橋無法形成', [0, -6.6, 0], 0.75, '#ff8080'); S.blk.visible = false;
      placeMyosin(0, 0);

      const dt = dtClock(), fly = V(0, -1.6, 2.6);
      const show = (m, t, on, p) => { m.visible = t.visible = on; if (on) { m.position.copy(p); t.position.copy(p).add(V(0, 0.55, 0.2)); } };
      CUR.tick = () => {
        const d = dt() * S.speed;
        // Ca²⁺ 與肌旋蛋白位置
        S.caV += (S.ca - S.caV) * Math.min(1, d * 3);
        const del = 0.75 * S.caV; if (Math.abs(del - S.delta) > 0.004) setTM(del);
        S.caB.visible = S.caV > 0.5;
        // 狀態機
        let st = S.step, hold = false;
        if (st === 0 && S.caV < 0.6) hold = true;
        if (st === 3 && S.t >= 1 && !S.atp) hold = true;
        if (!hold) S.t += d / DUR[st];
        if (S.t >= 1 && !hold) {
          if (st === 3) S.off -= STROKE;
          S.step = (st + 1) % 6; S.t = 0; st = S.step;
          if (S.off <= -PITCH) S.off += PITCH;
          if (st === 0 && S.ca > 0.5) S.t = 0.7;
        }
        const t = clamp01(S.t);
        let att = 0, sk = 0, slide = 0;
        if (st === 0) { att = 0; sk = 0; }
        else if (st === 1) { att = ease(t); }
        else if (st === 2) { att = 1; }
        else if (st === 3) { att = 1; sk = ease(t); slide = sk; }
        else if (st === 4) { att = 1 - ease((t - 0.45) / 0.55); sk = 1; }
        else if (st === 5) { att = 0; sk = 1 - ease(t); }
        gF.position.x = S.off - STROKE * slide;
        placeMyosin(att, sk); updateAnchors();
        const B = S.nucBase, pi = B.clone().add(V(0.4, 0, 0)), ad = B.clone().add(V(-0.15, 0, 0));
        let sATP = false, sADP = false, sPi = false, pATP = B, pADP = ad, pPi = pi;
        if (st <= 1) { sADP = sPi = true; }
        else if (st === 2) { sADP = sPi = true; pPi = pi.clone().addScaledVector(fly, ease(t)); sPi = t < 0.95; }
        else if (st === 3) { sADP = true; if (t > 0.7) pADP = ad.clone().addScaledVector(fly, ease((t - 0.7) / 0.3)); sADP = t < 0.99; }
        else if (st === 4) { sATP = true; pATP = B.clone().addScaledVector(fly, 1 - ease(t / 0.45)); }
        else if (st === 5) { if (t < 0.45) sATP = true; else sADP = sPi = true; }
        show(S.nATP, S.tATP, sATP, pATP); show(S.nADP, S.tADP, sADP, pADP); show(S.nPi, S.tPi, sPi, pPi);
        S.rig.visible = st === 3 && S.t >= 1 && !S.atp;
        S.blk.visible = st === 0 && S.caV < 0.6;
        if (S.setStep && S.shown !== st) { S.shown = st; S.setStep(st); }
      };
    },
    panel(box) {
      checkbox(box, '肌質 Ca²⁺ 升高（受刺激）', true, v => S.ca = v ? 1 : 0);
      checkbox(box, '有 ATP（取消＝僵直）', true, v => S.atp = v);
      slider(box, '速度', 0.2, 2, 1, 0.1, v => S.speed = v);
      S.setStep = stepList(box, STEPS); S.shown = -1;
      note(box, '綠＝ATP　橘＝ADP　黃＝Pi（無機磷酸）');
    }
  });
})();
