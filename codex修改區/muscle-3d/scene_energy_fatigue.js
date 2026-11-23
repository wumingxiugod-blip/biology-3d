/* 場景⑬：骨骼肌 ATP 供能途徑與疲勞（Ch12） */
(function () {
  let S = null;

  function sharesAt(seconds, intensity) {
    const t = Math.max(0, seconds), effort = intensity / 100;
    const pcr = Math.exp(-t / 9);
    const glycolysis = (1 - Math.exp(-t / 5)) * Math.exp(-t / 110) * (0.65 + 1.45 * effort);
    const oxidative = (1 - Math.exp(-t / 28)) * (1.15 - 0.25 * effort);
    const sum = pcr + glycolysis + oxidative || 1;
    return { pcr: pcr / sum, glycolysis: glycolysis / sum, oxidative: oxidative / sum };
  }

  function fatigueAt(seconds, intensity) {
    const effort = intensity / 100;
    return clamp01(0.44 * Math.pow(effort, 1.7) * ease((seconds - 10) / 90) + 0.18 * ease((seconds - 65) / 55));
  }

  function drawGraph() {
    if (!S || !S.cv) return;
    const c = S.cv.getContext('2d'), W = S.cv.width, H = S.cv.height;
    const L = 30, R = 8, T = 12, B = 25, PW = W - L - R, PH = H - T - B;
    c.clearRect(0, 0, W, H); c.fillStyle = '#0a1420'; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#35516d'; c.lineWidth = 1; c.beginPath();
    c.moveTo(L, T); c.lineTo(L, T + PH); c.lineTo(L + PW, T + PH);
    [0.25, 0.5, 0.75, 1].forEach(v => { const y = T + PH * (1 - v); c.moveTo(L, y); c.lineTo(L + PW, y); }); c.stroke();
    c.fillStyle = '#9fb6c8'; c.font = '10px sans-serif'; c.fillText('相對比例（示意）', 2, T + 8); c.fillText('運動進程', W - 56, H - 4);
    const xAt = t => L + (t / 120) * PW, yAt = v => T + (1 - v) * PH;
    const drawLine = (fn, color, width = 1.8) => {
      c.strokeStyle = color; c.lineWidth = width; c.beginPath();
      for (let t = 0; t <= 120; t += 2) { const x = xAt(t), y = yAt(clamp01(fn(t))); t ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
    };
    drawLine(t => sharesAt(t, S.intensity).pcr, '#48d9ff');
    drawLine(t => sharesAt(t, S.intensity).glycolysis, '#ffae56');
    drawLine(t => sharesAt(t, S.intensity).oxidative, '#69dda1');
    drawLine(t => 1 - fatigueAt(t, S.intensity), '#f0e7ca', 2.4);
    const x = xAt(S.time); c.strokeStyle = '#ff7575'; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x, T); c.lineTo(x, T + PH); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#48d9ff'; c.fillText('PCr', L + 2, H - 11); c.fillStyle = '#ffae56'; c.fillText('醣解', L + 38, H - 11);
    c.fillStyle = '#69dda1'; c.fillText('氧化', L + 76, H - 11); c.fillStyle = '#f0e7ca'; c.fillText('可用張力', L + 114, H - 11);
  }

  function makeParticle(color) {
    const m = ell([0, -99, 0], [0.14, 0.14, 0.14], color);
    m.material.emissive.setHex(color).multiplyScalar(0.45);
    CUR.root.add(m);
    return m;
  }

  SCENES.push({
    name: '⑬ 肌肉供能與疲勞',
    title: '肌肉如何補充 ATP，以及持續用力時為何疲勞',
    camera: { pos: [-1, 2, 42], target: [-1, 0, 0] },
    controls: [
      { label: '🔍 肌纖維與微血管', fn() { flyTo([0, -0.5, 35], [0, -0.5, 0]); } },
      { label: '🔍 PCr、ATP 與肌節', fn() { flyTo([3.5, 1.1, 18], [3.8, 0.55, 0.55]); } },
      { label: '🔍 粒線體與氧供應', fn() { flyTo([0, -3.2, 15], [0, -3.1, 0.5]); } },
      { label: '🔍 疲勞與橫小管', fn() { flyTo([3.4, 2.4, 13], [3.0, 1.85, 0.82]); } }
    ],
    desc: `
  <p>肌凝蛋白頭每次循環都要水解 ATP，而肌纖維內 ATP 儲量很小。<b>磷酸肌酸（PCr）</b>濃度高於 ATP 三倍以上，可由肌酸激酶快速把磷酸轉給 ADP；休息時反向反應補回 PCr。<b>醣解</b>可利用肌肝醣與血糖快速供能；<b>氧化磷酸化</b>則在粒線體使用氧，持續產生 ATP。</p>
  <p>三種途徑從活動開始便<b>同時運作</b>，相對貢獻隨強度與時間改變。肌肉還會利用脂肪酸；收縮也促使 GLUT4 移至肌膜與橫小管，增加血糖攝取。圖中微血管、粒線體、糖原顆粒與肌原纖維的位置彼此相鄰，呈現供能底物如何送到 ATP 使用處。</p>
  <p>疲勞是運動造成肌肉產力能力可逆下降。高強度收縮時，橫小管外側的 K⁺ 累積可降低興奮性；PCr 分解產生的 Pi、ADP 上升、肝醣耗竭及 SR 釋放 Ca²⁺ 能力下降也可能參與。<b>乳酸不是疲勞的唯一原因</b>。下方曲線僅示意相對供能與可用張力，並非特定肌肉的實測時間曲線。</p>`,
    build() {
      S = { time: 0, intensity: 80, running: false, anim: 0, flowPhase: 0, cv: null, intensityInput: null, timeInput: null, flows: [], oxygenFlow: [], fatigueParticles: [] };

      const fiberBody = ell([0, 0, 0], [9.2, 3.55, 1.55], 0xd9797a, 0.13);
      const sarcolemmaPath = Array.from({ length: 32 }, (_, i) => {
        const a = (i / 32) * Math.PI * 2;
        return V(9.05 * Math.cos(a), 3.36 * Math.sin(a), 1.08);
      });
      const sarcolemma = ttube(sarcolemmaPath, 0.075, 0xd87985, 0.82, { closed: true, seg: 128, radial: 8 });
      const nuclei = [
        ell([-5.8, 2.58, 0.98], [0.82, 0.2, 0.14], 0x755779, 0.9),
        ell([5.8, -2.58, 0.98], [0.82, 0.2, 0.14], 0x755779, 0.9)
      ];
      reg('骨骼肌纖維', '肌纖維、肌膜與周邊細胞核', 'Muscle fiber, sarcolemma and peripheral nuclei', '長形骨骼肌纖維是多核細胞；半透明切面顯示肌膜內側的肌原纖維、粒線體與代謝物。', [fiberBody, sarcolemma, ...nuclei], { anchor: [-7.7, 3.0, 1.3] });

      const pcrMolecules = Array.from({ length: 8 }, (_, i) => ell([-7.8 + (i % 4) * 0.42, 2.1 + Math.floor(i / 4) * 0.42, 0.72], [0.15, 0.15, 0.15], 0x53cdec));
      const creatineKinase = [-3.6, 2.85].map(x => ell([x, 1.25, 0.78], [0.25, 0.2, 0.18], 0x9bdfaa, 0.92));
      const pcrPath = [V(-7.2, 2.3, 0.65), V(-5.0, 1.9, 0.65), V(-2.3, 1.3, 0.68), V(0.6, 1.0, 0.72), V(3.1, 0.9, 0.78), V(4.25, 0.95, 0.85)];
      const pcrLine = ttube(pcrPath, 0.09, 0x4fc8ed, 0.72);
      S.pPCr = reg('ATP 快速緩衝', '磷酸肌酸（PCr）與肌酸激酶', 'Phosphocreatine and creatine kinase', 'PCr 儲量大於 ATP，肌酸激酶可在肌原纖維附近快速將磷酸轉給 ADP，再生 ATP。PCr 在高功率活動時下降，休息時由 ATP 反向補回。', [...pcrMolecules, ...creatineKinase, pcrLine], { anchor: [-6.7, 2.95, 0.95] });
      S.pcrMolecules = pcrMolecules;

      const glycogen = [];
      for (let i = 0; i < 12; i++) glycogen.push(ell([-7.6 + (i % 4) * 0.38, -0.7 + Math.floor(i / 4) * 0.38, 0.55], [0.12, 0.12, 0.12], 0xffb05f));
      const glucose = [-6.85, -6.35, -5.85].map(x => ell([x, 3.05, 0.98], [0.12, 0.12, 0.12], 0xf7df78));
      const tTubulePath = [V(-6.4, 2.58, 0.96), V(-6.4, 2.2, 0.96), V(-6.4, 1.82, 0.96), V(-6.4, 1.48, 0.96)];
      const uptakeTubule = ttube(tTubulePath, 0.17, 0x55c8ef, 0.34);
      const glut4 = [1.85, 2.2].map(y => cylM([-6.55, y, 1.0], [-6.25, y, 1.0], 0.075, mat(0xf0d274), 8));
      const glucosePaths = glucose.map((_, i) => [V(-6.85 + i * 0.5, 3.05, 0.98), V(-6.5, 2.65, 1.0), V(-6.4, 2.2, 1.0), V(-6.25, 1.65, 0.85)]);
      const glyPath = [V(-7.2, 0.1, 0.48), V(-5.6, 0.25, 0.48), V(-4.2, 0.7, 0.55), V(-1.3, 0.9, 0.65), V(2.1, 0.85, 0.78), V(4.25, 0.95, 0.85)];
      const glycolysisLine = ttube(glyPath, 0.09, 0xffa551, 0.72);
      const glycolyticEnzymes = [-4.8, -2.5, -0.2, 2.0].map(x => ell([x, 0.72, 0.82], [0.17, 0.12, 0.1], 0xf5bd70, 0.92));
      S.pGly = reg('醣解供能', '血糖、肌肝醣、GLUT4 與醣解', 'Blood glucose, muscle glycogen, GLUT4 and glycolysis', '肌肝醣在肌漿內分解；血糖則可透過運動時移至肌膜與橫小管的 GLUT4 進入。醣解酵素位於肌漿，可快速供應 ATP，但總產量和持續能力有限。', [...glycogen, ...glucose, uptakeTubule, ...glut4, glycolysisLine, ...glycolyticEnzymes], { anchor: [-6.4, 1.0, 0.95] });
      S.glucoseFlow = glucose.map((mesh, i) => ({ mesh, path: glucosePaths[i] }));
      S.glycogenMolecules = glycogen;

      const mitoCenters = [[-5.2, -2.08], [0, -2.08], [5.2, -2.08]];
      const mitochondria = [], cristae = [];
      mitoCenters.forEach(([x, y], index) => {
        const z = 0.24 + index * 0.03;
        mitochondria.push(ell([x, y, z], [1.12, 0.52, 0.38], 0x53b881, 0.96));
        [-0.2, 0, 0.2].forEach(offset => cristae.push(ttube([
          V(x - 0.88, y + offset, z + 0.31), V(x - 0.48, y + offset - 0.16, z + 0.37),
          V(x - 0.05, y + offset + 0.14, z + 0.39), V(x + 0.4, y + offset - 0.15, z + 0.37),
          V(x + 0.88, y + offset, z + 0.31)
        ], 0.038, 0xa5edaf, 0.96)));
      });
      const fattyAcids = [[-7.15, -1.62], [-6.78, -1.48], [-6.42, -1.68], [-6.78, -1.86]].map(([x, y]) => ell([x, y, 0.78], [0.16, 0.16, 0.14], 0xf2d06d));
      const fattyAcidPath = [V(-6.75, -1.62, 0.78), V(-6.15, -1.72, 0.76), V(-5.58, -1.93, 0.68), V(-5.2, -2.08, 0.62)];
      const fattyAcidLine = ttube(fattyAcidPath, 0.065, 0xf2d06d, 0.72);
      const fattyAcidFlow = Array.from({ length: 3 }, () => {
        const dot = ell([0, -99, 0], [0.1, 0.1, 0.1], 0xf2d06d);
        dot.visible = false;
        return dot;
      });
      const capillary = cylM([-10.2, -4.12, 0.25], [10.2, -4.12, 0.25], 0.3, mat(0x8c5262, 0.82), 16);
      const redCells = [-7.4, -2.5, 2.5, 7.4].map(x => ell([x, -4.12, 0.48], [0.46, 0.16, 0.12], 0xd76b74, 0.96));
      const oxygenDots = mitoCenters.map(() => {
        const dot = ell([0, -99, 0], [0.11, 0.11, 0.11], 0x8bd7ff);
        dot.material.emissive.setHex(0x8bd7ff).multiplyScalar(0.45);
        dot.visible = false;
        return dot;
      });
      const oxidativePath = [V(0, -1.72, 0.62), V(0.8, -0.8, 0.68), V(2.5, 0.15, 0.75), V(4.25, 0.95, 0.85)];
      const oxidativeLine = ttube(oxidativePath, 0.1, 0x68d79c, 0.76);
      S.pOx = reg('氧化供能', '粒線體、毛細血管與氧化磷酸化', 'Mitochondria, capillary and oxidative phosphorylation', '粒線體位於肌纖維內並緊鄰肌原纖維；毛細血管沿肌纖維供應氧與底物。圖中脂滴代表肌內三酸甘油酯；脂肪酸與碳水化合物都可進入粒線體氧化並再生 ATP。', [...mitochondria, ...cristae, ...fattyAcids, fattyAcidLine, ...fattyAcidFlow, capillary, ...redCells, ...oxygenDots, oxidativeLine], { anchor: [-4.2, -1.45, 1.0] });
      const oxygenPaths = mitoCenters.map(([x, y]) => [V(x, -4.0, 0.48), V(x, -3.35, 0.58), V(x, -2.7, 0.62), V(x, y, 0.62)]);
      S.oxygenFlow = oxygenDots.map((mesh, i) => ({ mesh, path: oxygenPaths[i] }));
      S.fattyAcidFlow = fattyAcidFlow.map((mesh, i) => ({ mesh, path: [V(-6.75 + (i - 1) * 0.18, -1.62 + (i % 2) * 0.18, 0.78), ...fattyAcidPath.slice(1)] }));

      const atp = [[4.0, 1.05, 0.86], [4.3, 1.25, 1.02], [4.58, 0.98, 0.9], [4.28, 0.82, 1.08]].map(p => {
        const m = ell(p, [0.2, 0.2, 0.16], 0xffe36f);
        m.material.emissive.setHex(0x725a12);
        return m;
      });
      const atpUsePath = [V(4.25, 0.95, 0.88), V(4.35, 0.64, 0.78), V(4.35, 0.3, 0.66)];
      const atpUseLine = ttube(atpUsePath, 0.055, 0xffe36f, 0.72);
      const pATP = reg('ATP 使用', 'ATP 供應與肌凝蛋白 ATPase', 'ATP supply and myosin ATPase', '肌纖維的 ATP 儲量很小。供能途徑持續補充 ATP，ATP 再送到肌凝蛋白頭水解，形成 ADP 與 Pi 並驅動橫橋循環。', [...atp, atpUseLine], { anchor: [4.25, 1.7, 1.28] });
      S.atpMolecules = atp;
      S.atpUsePath = atpUsePath;
      S.atpUseDots = Array.from({ length: 2 }, () => makeParticle(0xffe36f));
      S.atpUseDots.forEach(m => { m.userData.part = pATP; pATP.meshes.push(m); });

      const actinL = [], actinR = [], myosin = [], heads = [], zDiscs = [], mLines = [], troponin = [];
      for (let row = 0; row < 5; row++) {
        const y = -1.0 + row * 0.5, z = 0.28 + row * 0.12;
        const l = cylM([0.3, y, z], [3.0, y, z], 0.095, mat(0x77d8a8), 12);
        const r = cylM([5.8, y, z], [8.5, y, z], 0.095, mat(0x77d8a8), 12);
        actinL.push({ mesh: l, rest: l.position.x }); actinR.push({ mesh: r, rest: r.position.x });
        myosin.push(cylM([3.1, y, z], [5.7, y, z], 0.17, mat(0xf4ad61), 14));
        [3.55, 4.35, 5.15].forEach(x => {
          heads.push(cylM([x, y, z], [x, y + 0.2, z + 0.08], 0.055, mat(0xffd27e), 8));
          heads.push(ell([x, y + 0.24, z + 0.1], [0.12, 0.12, 0.12], 0xffd27e));
        });
        troponin.push(ell([2.72, y, z + 0.12], [0.1, 0.1, 0.1], 0xffe277), ell([6.08, y, z + 0.12], [0.1, 0.1, 0.1], 0xffe277));
        zDiscs.push(cylM([0, y - 0.34, z + 0.14], [0, y + 0.34, z + 0.14], 0.04, mat(0xe4d5bb), 8));
        zDiscs.push(cylM([8.8, y - 0.34, z + 0.14], [8.8, y + 0.34, z + 0.14], 0.04, mat(0xe4d5bb), 8));
        mLines.push(cylM([4.4, y - 0.18, z + 0.14], [4.4, y + 0.18, z + 0.14], 0.03, mat(0x91a2b4), 8));
      }
      const sarcomere = reg('ATP 使用', '肌節、肌動蛋白與肌凝蛋白橫橋', 'Sarcomere and actin-myosin cross-bridges', '放大的肌節由兩端 Z 盤界定，中央 M 線固定粗肌絲。肌凝蛋白頭水解 ATP 後形成橫橋，拉動帶有肌鈣蛋白的細肌絲向中央滑動。', [...actinL.map(a => a.mesh), ...actinR.map(a => a.mesh), ...myosin, ...heads, ...zDiscs, ...mLines, ...troponin], { anchor: [7.2, 1.4, 0.9] });
      S.actinL = actinL; S.actinR = actinR; S.heads = heads; S.pSarcomere = sarcomere; S.pATP = pATP;

      const fatigueTubulePath = [V(3.0, 3.35, 1.02), V(3.0, 2.75, 1.02), V(3.0, 2.05, 1.02), V(3.0, 1.45, 1.02)];
      const fatigueTubule = ttube(fatigueTubulePath, 0.17, 0x55c8ef, 0.38);
      const fatigueLumen = ttube(fatigueTubulePath.map(p => V(p.x, p.y, p.z + 0.025)), 0.075, 0x164a64, 0.88);
      const triadSR = [2.48, 3.52].map(x => ell([x, 1.58, 0.68], [0.3, 0.23, 0.22], 0xb28aff, 0.86));
      const kIons = [1.68, 1.94, 2.2, 2.46, 2.72].map(y => ell([3.0, y, 1.08], [0.085, 0.085, 0.085], 0xff8c68));
      const piDots = [[5.95, 0.5, 0.95], [5.55, 0.82, 1.0], [6.35, 0.7, 0.92], [4.95, -0.12, 0.98]].map(p => ell(p, [0.09, 0.09, 0.09], 0xa993ff));
      const adpDots = [[4.75, 0.3, 0.95], [5.25, 0.05, 1.0], [5.75, -0.16, 0.95]].map(p => ell(p, [0.09, 0.09, 0.09], 0xffc25c));
      const srCaDots = [
        ell([3.32, 1.6, 0.95], [0.09, 0.09, 0.09], 0x48d9ff),
        ell([2.72, 1.82, 0.95], [0.09, 0.09, 0.09], 0x48d9ff),
        ell([3.28, 1.34, 0.95], [0.09, 0.09, 0.09], 0x48d9ff)
      ];
      const fatigueParticles = [...kIons, ...piDots, ...adpDots];
      fatigueParticles.forEach(m => { m.visible = false; });
      const pFatigue = reg('疲勞相關變化', '橫小管 K⁺、Pi／ADP 與 SR 鈣釋放', 'T-tubule K⁺, Pi/ADP and SR calcium release', '高強度收縮可使 K⁺ 在橫小管狹窄腔內累積，降低肌膜興奮性；PCr 分解伴隨 Pi 增加，ADP 上升會減慢縮短速度。肝醣耗竭與 SR 釋放 Ca²⁺ 能力下降也可能參與。因素比例依運動型態而異，乳酸不是單一疲勞原因。', [fatigueTubule, fatigueLumen, ...triadSR, ...fatigueParticles, ...srCaDots], { anchor: [3.0, 3.05, 1.3] });
      S.fatigueParticles = fatigueParticles;
      S.kIons = kIons;
      S.srCaDots = srCaDots;

      const makeFlow = (path, color, count = 3) => {
        const dots = Array.from({ length: count }, () => makeParticle(color));
        return { path, color, dots };
      };
      S.flows = [
        makeFlow(pcrPath, 0x48d9ff),
        makeFlow(glyPath, 0xffae56),
        makeFlow(oxidativePath, 0x69dda1)
      ];
      S.pathParts = [S.pPCr, S.pGly, S.pOx]; S.fatigueParts = pFatigue;
      S.flows.forEach((flow, i) => flow.dots.forEach(m => {
        m.userData.part = S.pathParts[i];
        S.pathParts[i].meshes.push(m);
      }));
      S.glucoseFlow.forEach(flow => { flow.mesh.userData.part = S.pGly; });
      S.oxygenFlow.forEach(flow => { flow.mesh.userData.part = S.pOx; });
      S.fattyAcidFlow.forEach(flow => { flow.mesh.userData.part = S.pOx; });
      S.time = 0;
      const dt = dtClock();
      CUR.tick = () => {
        const d = dt();
        if (S.running) {
          S.time = Math.min(120, S.time + d * 12);
          S.flowPhase += d * 1.4;
          if (S.time >= 120) S.running = false;
          if (S.timeInput) {
            S.timeInput.value = S.time;
            const readout = S.timeInput.parentElement.querySelector('b');
            if (readout) readout.textContent = Math.round(S.time);
          }
        }
        const share = sharesAt(S.time, S.intensity), fatigue = fatigueAt(S.time, S.intensity);
        const weights = [share.pcr, share.glycolysis, share.oxidative];
        S.pathParts.forEach((p, i) => p.meshes.forEach(m => {
          if (m.material.emissive) m.material.emissiveIntensity = 0.18 + 1.55 * weights[i];
        }));
        S.flows.forEach((flow, i) => flow.dots.forEach((m, j) => {
          const weight = weights[i], u = (S.flowPhase * (0.45 + weight) + j * 0.32) % 1;
          m.visible = S.running && weight > 0.045 && flow.dots[j].userData.part.visible;
          if (m.visible) m.position.copy(alongPath(flow.path, u));
          m.material.emissiveIntensity = 0.2 + 2.0 * weight;
        }));
        S.glucoseFlow.forEach((flow, i) => {
          const u = (S.flowPhase * (0.35 + share.glycolysis) + i * 0.34) % 1;
          flow.mesh.visible = S.running && share.glycolysis > 0.05 && flow.mesh.userData.part.visible;
          if (flow.mesh.visible) flow.mesh.position.copy(alongPath(flow.path, u));
        });
        S.oxygenFlow.forEach((flow, i) => {
          const u = (S.flowPhase * (0.25 + share.oxidative) + i * 0.37) % 1;
          flow.mesh.visible = S.running && share.oxidative > 0.05 && flow.mesh.userData.part.visible;
          if (flow.mesh.visible) flow.mesh.position.copy(alongPath(flow.path, u));
        });
        const fatUse = (1 - S.intensity / 100) * share.oxidative;
        S.fattyAcidFlow.forEach((flow, i) => {
          const u = (S.flowPhase * (0.25 + fatUse) + i * 0.29) % 1;
          flow.mesh.visible = S.running && fatUse > 0.04 && flow.mesh.userData.part.visible;
          if (flow.mesh.visible) flow.mesh.position.copy(alongPath(flow.path, u));
        });
        S.pcrMolecules.forEach((m, i) => { m.visible = S.pPCr.visible && i < Math.ceil(8 * (0.35 + 0.65 * share.pcr)); });
        S.glycogenMolecules.forEach((m, i) => { m.visible = S.pGly.visible && i < Math.ceil(12 * (1 - 0.45 * fatigue)); });
        const available = 1 - fatigue, demand = S.intensity / 100;
        const contraction = S.running ? Math.max(0, Math.sin(S.flowPhase * 6)) * 0.48 * demand * available : 0;
        S.actinL.forEach(a => { a.mesh.position.x = a.rest + contraction; });
        S.actinR.forEach(a => { a.mesh.position.x = a.rest - contraction; });
        S.heads.forEach(m => m.material.emissive.setHex(contraction > 0.08 ? 0x80551c : 0));
        S.atpMolecules.forEach(m => { m.material.emissiveIntensity = 0.45 + 1.1 * demand * available; });
        S.atpUseDots.forEach((m, i) => {
          const u = (S.flowPhase * 0.8 + i * 0.5) % 1;
          m.visible = S.running && contraction > 0.08 && m.userData.part.visible;
          if (m.visible) m.position.copy(alongPath(S.atpUsePath, u));
        });
        S.fatigueParticles.forEach((m, i) => {
          const threshold = i < 5 ? 0.1 + i * 0.065 : i < 9 ? 0.19 + (i - 5) * 0.07 : 0.3 + (i - 9) * 0.08;
          m.visible = fatigue > threshold && S.fatigueParts.visible;
          m.material.emissiveIntensity = 0.25 + fatigue * 1.5;
        });
        S.srCaDots.forEach((m, i) => { m.visible = i < Math.ceil(3 * (1 - fatigue * 0.9)) && S.fatigueParts.visible; });
        if (S.timeInput && document.activeElement !== S.timeInput) {
          S.timeInput.value = S.time;
          const readout = S.timeInput.parentElement.querySelector('b');
          if (readout) readout.textContent = Math.round(S.time);
        }
        drawGraph();
      };
    },
    panel(box) {
      note(box, '<b>供能途徑同時運作，改變強度與運動進程觀察相對貢獻</b>');
      S.intensityInput = slider(box, '需求強度（%）', 20, 100, S.intensity, 1, v => { S.intensity = v; drawGraph(); });
      S.timeInput = slider(box, '運動進程（示意秒）', 0, 120, S.time, 1, v => { S.time = v; drawGraph(); });
      btnRow(box, [
        ['▶ 開始／暫停', () => { S.running = !S.running; }],
        ['⟲ 重設進程', () => { S.running = false; S.time = 0; S.flowPhase = 0; S.timeInput.value = 0; drawGraph(); }]
      ]);
      btnRow(box, [
        ['短時爆發', () => { S.intensity = 95; S.intensityInput.value = 95; S.intensityInput.dispatchEvent(new Event('input')); S.time = 0; S.timeInput.value = 0; S.running = true; }],
        ['持續活動', () => { S.intensity = 40; S.intensityInput.value = 40; S.intensityInput.dispatchEvent(new Event('input')); S.time = 0; S.timeInput.value = 0; S.running = true; }]
      ]);
      const cv = document.createElement('canvas'); cv.width = 280; cv.height = 138; box.appendChild(cv); S.cv = cv;
      note(box, '青＝PCr；橘＝醣解與葡萄糖攝取；綠＝氧化供能；白線＝相對可用張力。疲勞時可觀察 PCr／肝醣儲備變化、Pi／ADP 累積、橫小管 K⁺ 增加與 SR 鈣釋放減少。');
      drawGraph();
    }
  });
})();
