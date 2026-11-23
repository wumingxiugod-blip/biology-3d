/* 場景②：主動運輸—Na⁺/K⁺ 幫浦與二次主動運輸（Ch6 6.3、Fig 6.18–6.20） */
(function () {
  let S = null;
  const NK = V(-7, 0, 0), SG = V(1.5, 0, 0), NX = V(8, 0, 0);
  const STEPS = [
    '① 細胞質中的 <b>3 個 Na⁺</b> 進入幫浦並與結合位結合',
    '② 活化 ATPase：<b>ATP → ADP + Pi</b>，Pi 結合幫浦（磷酸化），兩側出口暫時關閉',
    '③ ADP 釋出 → 幫浦<b>構形改變</b>、向外開啟 → 3 Na⁺ 釋出到細胞外',
    '④ 細胞外的 <b>2 個 K⁺</b> 與幫浦結合',
    '⑤ <b>Pi 釋出</b> → 幫浦回到原構形（向內開）→ 2 K⁺ 釋入細胞質'
  ];
  const DUR = [1.2, 1.0, 1.3, 1.1, 1.4];

  function carrier(c, col, R = 0.6) {
    const gA = new THREE.Group(), gB = new THREE.Group();
    [gA, gB].forEach((g, i) => { g.position.set(c.x + (i ? R : -R), 0, c.z); CUR.root.add(g); });
    const a = helixBundle([0, 0, 0], 4, 0.5, col, 3.4, 0.45), b = helixBundle([0, 0, 0], 4, 0.5, col, 3.4, 0.45);
    return { gA, gB, a, b, set(open) { gA.rotation.z = -0.3 * open; gB.rotation.z = 0.3 * open; } };
  }

  SCENES.push({
    name: '② 幫浦與協同運輸',
    title: '主動運輸：Na⁺/K⁺ 幫浦與二次主動運輸',
    camera: { pos: [0, 7, 30], target: [0, 0, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([0, 7, 30], [0, 0, 0]); } },
      { label: '🔍 Na⁺/K⁺ 幫浦', fn() { flyTo([-7, 2, 10], [-7, 0, 0]); } },
      { label: '🔍 協同運輸 SGLT', fn() { flyTo([1.5, 2, 10], [1.5, 0, 0]); } },
      { label: '🔍 反向運輸', fn() { flyTo([8, 2, 10], [8, 0, 0]); } }
    ],
    desc: `
  <p><b>主動運輸</b>：由低濃度往高濃度（逆濃度梯度）運送，需消耗 ATP；這類載體常稱為<b>幫浦</b>，以 ATP 的 Pi 使其<b>磷酸化</b>而活化。</p>
  <p><b>Na⁺/K⁺ 幫浦</b>（Na⁺/K⁺-ATPase）：存在於<b>所有</b>體細胞，每次把 <b>3 Na⁺ 送出、2 K⁺ 送入</b>，兩者都是逆梯度。功能：① 建立 Na⁺ 梯度，供其他分子的<b>協同運輸</b>使用 ② 神經與肌肉細胞產生電化學衝動 ③ 維持滲透濃度（細胞體積）。</p>
  <p><b>Ca²⁺ 幫浦</b>：位於所有細胞的細胞膜及肌細胞的內質網膜，把 Ca²⁺ 移出細胞質，使細胞內 Ca²⁺ 比細胞外低 1,000–10,000 倍。</p>
  <p><b>二次主動運輸</b>（協同運輸 coupled transport）：利用 Na⁺ 順梯度流<b>入</b>的能量，帶動另一分子逆梯度移動；因 Na⁺ 梯度靠 Na⁺/K⁺ 幫浦（耗 ATP）維持，所以也算主動運輸。</p>
  <ul><li><b>同向運輸</b>（cotransport）：與 Na⁺ 同方向，如 Na⁺-葡萄糖（SGLT；小腸 SGLT1 為 2 Na⁺:1 葡萄糖，腎臟 SGLT2 為 1:1）。</li>
  <li><b>反向運輸</b>（countertransport）：與 Na⁺ 反方向，如 Na⁺ 流入換 Ca²⁺ 送出。</li></ul>
  <p class="hint">背景小球：藍＝Na⁺（細胞外多）、紫＝K⁺（細胞內多）。</p>`,
    build() {
      S = { step: 0, t: 0, speed: 1, ph2: 0 };
      const bl = bilayer(24, 10, [{ x: NK.x, z: 0, r: 1.9 }, { x: SG.x, z: 0, r: 1.8 }, { x: NX.x, z: 0, r: 1.8 }], 0, 0.62, { seed: 3 });
      reg('細胞膜', '磷脂雙層', 'Phospholipid bilayer', '離子與葡萄糖都無法直接穿過，必須靠膜蛋白。', [bl.heads, bl.tails], { anchor: [-11, 1.2, 4.8] });
      S.nk = carrier(NK, 0xff9a40, 0.7);
      S.pNK = reg('膜蛋白', 'Na⁺/K⁺ 幫浦（ATPase）', 'Na⁺/K⁺ pump', '本身就是 ATPase 酵素：水解 ATP、以 Pi 磷酸化自己而改變構形，3 Na⁺ 出、2 K⁺ 入（皆逆梯度）。紅血球約 200 個、白血球約 35,000 個、某些腎小管細胞數百萬個。', [S.nk.a, S.nk.b], { anchor: [NK.x - 1.6, 1.9, 0.5] });
      S.nk.gA.add(S.nk.a); S.nk.gB.add(S.nk.b);
      S.sg = carrier(SG, 0xd070ff, 0.6);
      reg('膜蛋白', 'Na⁺-葡萄糖同向運輸蛋白（SGLT）', 'Na⁺-glucose cotransporter', 'Na⁺ 先與載體結合，提高葡萄糖的親和力；載體改變構形，把 Na⁺（順梯度）與葡萄糖（<b>逆</b>梯度）一起送入細胞。', [S.sg.a, S.sg.b], { anchor: [SG.x + 1.4, 1.9, 0.5] });
      S.sg.gA.add(S.sg.a); S.sg.gB.add(S.sg.b);
      S.nx = carrier(NX, 0x40c0a0, 0.6);
      reg('膜蛋白', 'Na⁺/Ca²⁺ 反向運輸蛋白', 'Na⁺/Ca²⁺ exchanger', 'Na⁺ 順梯度流入的能量，把 Ca²⁺ 逆梯度送<b>出</b>細胞（反向運輸）。不直接使用 ATP，但需持續耗能維持 Na⁺ 梯度。', [S.nx.a, S.nx.b], { anchor: [NX.x + 1.4, 1.9, 0.5] });
      S.nx.gA.add(S.nx.a); S.nx.gB.add(S.nx.b);
      // 背景離子
      S.bg = [brownian(36, 0.16, 0x4060ff, [-12, 12, 1.9, 5.5, -5, 5], 1), brownian(5, 0.16, 0x4060ff, [-12, 12, -5.5, -1.9, -5, 5], 2), brownian(5, 0.17, 0xa050ff, [-12, 12, 1.9, 5.5, -5, 5], 3), brownian(30, 0.17, 0xa050ff, [-12, 12, -5.5, -1.9, -5, 5], 4)];
      reg('離子濃度', 'Na⁺（細胞外高）', 'Na⁺ gradient', '細胞外 Na⁺ 濃度高、細胞內低——由 Na⁺/K⁺ 幫浦維持。', [S.bg[0], S.bg[1]], { anchor: [10, 4.6, -4] });
      reg('離子濃度', 'K⁺（細胞內高）', 'K⁺ gradient', '細胞內 K⁺ 濃度高、細胞外低。', [S.bg[2], S.bg[3]], { anchor: [10, -4.6, -4] });
      // 幫浦運送的離子與 ATP
      S.naI = particles(3, 0.26, 0x4060ff, 0x101060); S.kI = particles(2, 0.28, 0xa050ff, 0x300050);
      S.atp = particles(1, 0.32, 0x50e060); S.adp = particles(1, 0.29, 0xffa040); S.pi = particles(1, 0.2, 0xffe040, 0x404000);
      [S.naI, S.kI, S.atp, S.adp, S.pi].forEach(m => CUR.root.add(m));
      S.tATP = textSprite('ATP', [0, -99, 0], 0.45, '#7dff8a'); S.tPi = textSprite('Pi', [0, -99, 0], 0.45, '#ffe060'); S.tADP = textSprite('ADP', [0, -99, 0], 0.45, '#ffb060');
      // 協同運輸粒子
      S.sNa = particles(2, 0.24, 0x4060ff, 0x101060); S.sGl = particles(1, 0.34, 0xffd23f, 0x403000); S.xNa = particles(3, 0.24, 0x4060ff, 0x101060); S.xCa = particles(1, 0.26, 0x30ff90, 0x0a5020);
      [S.sNa, S.sGl, S.xNa, S.xCa].forEach(m => CUR.root.add(m));
      textSprite('細胞外液', [-11.5, 6, -4.5], 0.7, '#9fd8ff'); textSprite('細胞質', [-11.5, -6, -4.5], 0.7, '#ffc080');
      textSprite('葡萄糖 逆梯度 ↓', [SG.x, 6.4, 0], 0.55, '#ffd23f'); textSprite('Ca²⁺ 逆梯度 ↑', [NX.x, -6.4, 0], 0.55, '#30ff90');

      const dt = dtClock(), H = (p, dx, dy) => p.clone().add(V(dx, dy, 0));
      CUR.tick = () => {
        const d = dt() * S.speed;
        S.bg.forEach(b => b.step(d));
        S.t += d / DUR[S.step]; if (S.t >= 1) { S.t = 0; S.step = (S.step + 1) % 5; }
        const st = S.step, t = ease(S.t);
        // 幫浦構形：-1 向內開、0 封閉、1 向外開
        let open = [-1, -1 + t, 0 + t, 1, 1 - 2 * t][st]; S.nk.set(open);
        const site = k => H(NK, (k - 1) * 0.42, 0.15), ksite = k => H(NK, (k - 0.5) * 0.5, -0.1);
        for (let k = 0; k < 3; k++) {
          const inP = H(NK, (k - 1) * 1.5 + 0.3, -4.2 - k * 0.3), outP = H(NK, (k - 1) * 1.7, 4.6 + k * 0.3);
          let p = [inP.clone().lerp(site(k), t), site(k), site(k).clone().lerp(outP, t), V(0, -999, 0), V(0, -999, 0)][st];
          S.naI.setP(k, p);
        }
        for (let k = 0; k < 2; k++) {
          const outP = H(NK, (k - 0.5) * 2, 4.4), inP = H(NK, (k - 0.5) * 2 + 0.5, -4.6);
          let p = [V(0, -999, 0), V(0, -999, 0), V(0, -999, 0), outP.clone().lerp(ksite(k), t), ksite(k).clone().lerp(inP, t)][st];
          S.kI.setP(k, p);
        }
        const atpIn = H(NK, 1.8, -4.5), atpS = H(NK, 1.2, -1.9);
        const show = (m, sp, p, on) => { m.setP(0, on ? p : V(0, -999, 0)); m.instanceMatrix.needsUpdate = true; sp.position.copy(on ? p.clone().add(V(0, 0.5, 0.3)) : V(0, -99, 0)); };
        show(S.atp, S.tATP, st === 0 ? atpIn.clone().lerp(atpS, t) : atpS, st === 0 || (st === 1 && S.t < 0.4));
        show(S.pi, S.tPi, st === 4 ? atpS.clone().add(V(-0.4, 0, 0)).lerp(H(NK, -0.5, -4.8), t) : atpS.clone().add(V(-0.4, 0, 0)), (st === 1 && S.t >= 0.4) || st === 2 || st === 3 || st === 4);
        show(S.adp, S.tADP, st === 2 ? atpS.clone().lerp(H(NK, 2.6, -4.8), t) : atpS.clone().add(V(0.3, 0, 0)), (st === 1 && S.t >= 0.4) || st === 2);
        S.naI.instanceMatrix.needsUpdate = true; S.kI.instanceMatrix.needsUpdate = true;
        S.pNK.meshes.forEach(m => m.material.emissive.setHex(st >= 1 && st <= 3 && !(st === 1 && S.t < 0.4) ? 0x402000 : 0));
        // SGLT 與反向運輸（連續循環）
        S.ph2 = (S.ph2 + d / 3.2) % 1; const q = S.ph2;
        const o2 = q < 0.35 ? 1 : q < 0.5 ? 1 - 2 * ease((q - 0.35) / 0.15) : q < 0.8 ? -1 : -1 + 2 * ease((q - 0.8) / 0.2);
        S.sg.set(o2); S.nx.set(o2);
        const mv = (a, b, c, e) => q < 0.3 ? a.clone().lerp(b, ease(q / 0.3)) : q < 0.5 ? b.clone().lerp(c, ease((q - 0.3) / 0.2)) : q < 0.75 ? c.clone().lerp(e, ease((q - 0.5) / 0.25)) : V(0, -999, 0);
        [-0.35, 0.35].forEach((dx, k) => S.sNa.setP(k, mv(H(SG, dx * 4, 4.5), H(SG, dx, 0.8), H(SG, dx, -0.8), H(SG, dx * 5, -4.5))));
        S.sGl.setP(0, mv(H(SG, 1.6, 4.8), H(SG, 0, 0.6), H(SG, 0, -0.9), H(SG, -1.4, -4.6)));
        [-0.4, 0, 0.4].forEach((dx, k) => S.xNa.setP(k, mv(H(NX, dx * 4, 4.5), H(NX, dx, 0.8), H(NX, dx, -0.8), H(NX, dx * 5, -4.5))));
        S.xCa.setP(0, q < 0.25 ? H(NX, 0, 0.8).lerp(H(NX, 1.6, 4.6), ease(q / 0.25)) : q < 0.5 ? V(0, -999, 0) : q < 0.75 ? H(NX, 1.5, -4.5).lerp(H(NX, 0, -0.8), ease((q - 0.5) / 0.25)) : q < 0.8 ? H(NX, 0, -0.8) : H(NX, 0, -0.8).lerp(H(NX, 0, 0.8), ease((q - 0.8) / 0.2)));
        [S.sNa, S.sGl, S.xNa, S.xCa].forEach(m => m.instanceMatrix.needsUpdate = true);
        if (S.setStep && S.shown !== st) { S.shown = st; S.setStep(st); }
      };
    },
    panel(box) {
      slider(box, '速度', 0.2, 2, 1, 0.1, v => S.speed = v);
      note(box, '<b>Na⁺/K⁺ 幫浦循環</b>');
      S.setStep = stepList(box, STEPS); S.shown = -1;
    }
  });
})();
