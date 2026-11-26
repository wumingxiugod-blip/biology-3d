/* 場景⑨：肌肉力學、負荷與串聯彈性元件（Ch12 §12.3、Fig. 12.20–12.21） */
(function () {
  let S = null;
  const velocity = load => {
    const f = load / 100;
    return f <= 1 ? (1 - f) / (1 + 2 * f) : -0.42 * (f - 1) / (0.3 + f - 1);
  };

  function springMesh(color, turns = 12, radius = 0.38) {
    const pts = [];
    for (let i = 0; i <= turns * 18; i++) {
      const t = i / (turns * 18), a = t * turns * Math.PI * 2;
      pts.push(V(t - 0.5, Math.cos(a) * radius, Math.sin(a) * radius));
    }
    return ttube(pts, 0.075, color, 1, { seg: turns * 36, radial: 8 });
  }

  function drawCurve() {
    if (!S || !S.cv) return;
    const c = S.cv.getContext('2d'), W = S.cv.width, H = S.cv.height;
    const L = 36, R = 10, T = 10, B = 23, PW = W - L - R, PH = H - T - B;
    c.clearRect(0, 0, W, H); c.fillStyle = '#0a1420'; c.fillRect(0, 0, W, H);
    const y = v => T + (1 - (v + 0.5) / 1.5) * PH;
    const x = load => L + load / 150 * PW;
    c.strokeStyle = '#35516d'; c.lineWidth = 1; c.beginPath(); c.moveTo(L, T); c.lineTo(L, T + PH); c.lineTo(L + PW, T + PH); c.moveTo(L, y(0)); c.lineTo(L + PW, y(0));
    [0, 50, 100, 150].forEach(v => { c.moveTo(x(v), T); c.lineTo(x(v), T + PH); }); c.stroke();
    c.fillStyle = '#9fb6c8'; c.font = '10px sans-serif'; c.fillText('縮短速度', 2, T + 8); c.fillText('負荷／肌力（%）', W - 100, H - 4);
    c.fillStyle = '#8fd0ff'; c.fillText('向心縮短', L + 3, T + 12); c.fillText('等長', x(100) - 11, y(0) - 4); c.fillText('離心延長', x(105), y(-0.35));
    c.strokeStyle = '#72d6a0'; c.lineWidth = 2.2; c.beginPath();
    for (let load = 0; load <= 150; load += 2) {
      const vel = velocity(load);
      const px = x(load), py = y(vel); load ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.stroke();
    const load = S.load, vel = velocity(load);
    c.fillStyle = '#ffd479'; c.beginPath(); c.arc(x(load), y(vel), 4, 0, Math.PI * 2); c.fill();
  }

  SCENES.push({
    name: '⑨ 負荷與肌肉力學',
    title: '肌肉負荷、串聯彈性與收縮型態',
    camera: { pos: [0, 7, 34], target: [-3, 0, 0] },
    controls: [
      { label: '🔍 肌腹與肌腱', fn() { flyTo([-4.5, 2, 23], [-4.7, 0, 0]); } },
      { label: '🔍 肌節中的肌聯蛋白', fn() { flyTo([-5.6, 5.2, 14], [-5.7, 4.2, 0.8]); } },
      { label: '🔍 負荷與測力端', fn() { flyTo([1.5, 2, 22], [0, 0, 0]); } }
    ],
    desc: `
  <p>肌肉要縮短，產生的力量必須大於阻止肌肉移動的負荷。負荷低於肌肉所能產生的力量時，可發生<b>向心（縮短）收縮</b>；負荷等於最大等長肌力時，肌肉產生張力但整體長度不變，稱<b>等長收縮</b>；負荷超過肌肉當下的力量時，肌肉仍在活化、卻被外力拉長，稱<b>離心（延長）收縮</b>。</p>
  <p>負荷越大，向心收縮的縮短速度越低；到最大等長肌力時速度為零。肌腱膠原與肌內結締組織伸展；肌聯蛋白則位於每個肌節內、連接 Z 盤與粗肌絲。它們共同提供彈性。本模型把這些變形放大，並在肌節放大圖標出肌聯蛋白的實際位置。</p>
  <p>等長時整個肌肉－肌腱單元端點固定，但肌節內主動收縮元件縮短，肌聯蛋白與肌腱等彈性結構伸長；向心時單元整體縮短，離心時外力使活化中的單元延長。下方力－速度曲線呈現定性關係，非特定肌肉的測量資料。</p>`,
    build() {
      S = { load: 50, mode: 'rest', progress: 0, cv: null };
      const x0 = -10, ce0 = 5, ti0 = 1.4, se0 = 4.6, xCE = x0, xTI = x0 + ce0, xSE = xTI + ti0, xEnd0 = xSE + se0;
      const wall = box([x0 - 0.325, 0, 0], [0.65, 5.6, 5.0], 0x8999a8);
      const rail = cylM([x0 - 0.35, -2.4, 0], [7.2, -2.4, 0], 0.08, mat(0x647e96), 10);
      reg('肌肉力學裝置', '固定端與測力軌道', 'Fixed anchor and force track', '體外肌肉力學實驗將肌肉一端固定，另一端連接負荷或測力裝置；此處以導軌和端點表示。', [wall, rail], { anchor: [x0 - 0.6, 2.1, 0.8] });

      const muscleEnvelope = ell([(x0 + xSE) / 2, 0, 0], [(ce0 + ti0) / 2, 1.35, 0.98], 0xb65352, 0.16);
      const stripe = stripeTex(8, { I: '#eab0a6', H: '#a65049' }), fibers = [];
      for (let i = 0; i < 6; i++) {
        const y = (i % 3 - 1) * 0.5, z = (Math.floor(i / 3) - 0.5) * 0.75;
        fibers.push(cylM([xCE, y, z], [xTI, y, z], 0.26, tmat(stripe), 14));
      }
      S.fibers = fibers; S.x0 = x0; S.ce0 = ce0; S.ti0 = ti0; S.se0 = se0; S.xEnd0 = xEnd0;
      S.muscleEnvelope = muscleEnvelope;
      S.pCE = reg('肌肉力學裝置', '肌腹、肌束與主動收縮元件', 'Muscle belly, fascicles and contractile element', '半透明肌腹包住平行肌纖維；紅色橫紋代表肌原纖維中的主動收縮元件。啟動時肌節縮短，串聯彈性結構承受部分伸展。', [muscleEnvelope, ...fibers], { anchor: [(xCE + xTI) / 2, 1.1, 0.2] });
      S.titin = springMesh(0x69e58e, 10, 0.35);
      const insetFrame = box([-5.6, 4.35, 0.18], [5.2, 1.65, 0.18], 0x203348, 0.38);
      const insetZL = cylM([-8.0, 3.78, 0.7], [-8.0, 4.92, 0.7], 0.085, mat(0xe6d5b8), 10);
      const insetZR = cylM([-3.2, 3.78, 0.7], [-3.2, 4.92, 0.7], 0.085, mat(0xe6d5b8), 10);
      const insetMyosin = cylM([-7.0, 4.22, 0.58], [-4.2, 4.22, 0.58], 0.13, mat(0xf4ad61), 12);
      const insetActin = [
        cylM([-7.95, 4.03, 0.82], [-5.0, 4.03, 0.82], 0.055, mat(0x77d8a8), 8),
        cylM([-6.15, 4.03, 0.84], [-3.25, 4.03, 0.84], 0.055, mat(0x77d8a8), 8)
      ];
      const insetHeads = [-6.55, -5.6, -4.65].map(x => ell([x, 4.42, 0.76], [0.1, 0.1, 0.1], 0xffd27e));
      const titinZoomL = springMesh(0x69e58e, 6, 0.11), titinZoomR = springMesh(0x69e58e, 6, 0.11);
      titinZoomL.position.set(-7.5, 4.62, 0.92); titinZoomL.scale.x = 1.0;
      titinZoomR.position.set(-3.7, 4.62, 0.92); titinZoomR.scale.x = 1.0;
      S.titinZooms = [titinZoomL, titinZoomR];
      textSprite('肌節放大：Z 盤、粗細肌絲與肌聯蛋白', [-5.6, 5.28, 0.8], 0.48, '#c8f3d2');
      S.pTitin = reg('肌肉力學裝置', '肌聯蛋白與肌節內彈性', 'Titin and elasticity within a sarcomere', '主模型中的綠色線圈代表串聯彈性模型裡肌聯蛋白的等效伸展。放大圖顯示其實際位置：肌聯蛋白在每個肌節內，從 Z 盤連到粗肌絲；它不是肌肉與肌腱之間的一段獨立組織。', [S.titin, insetFrame, insetZL, insetZR, insetMyosin, ...insetActin, ...insetHeads, titinZoomL, titinZoomR], { anchor: [-5.6, 5.0, 1.0] });
      S.tendon = springMesh(0xe8d9b5, 14, 0.26);
      const tendonBody = ell([(xSE + xEnd0) / 2, 0, 0], [se0 / 2, 0.58, 0.44], 0xd9c9a6, 0.28);
      const collagenStrands = [-0.3, -0.15, 0, 0.15, 0.3].map((y, i) => {
        const z = i % 2 ? 0.15 : -0.15;
        return cylM([xSE, y, z], [xEnd0, y, z], 0.045, mat(0xf1e4c6), 8);
      });
      S.tendonBody = tendonBody;
      S.collagenStrands = collagenStrands;
      S.pTendon = reg('肌肉力學裝置', '肌腱膠原束與串聯彈性', 'Tendon collagen bundles and series elasticity', '淺色纖維呈現肌腱內平行排列的膠原束，外層為半透明肌腱輪廓；線圈是彈性變形的示意。肌腱與肌內結締組織沿肌肉傳力方向伸展。', [tendonBody, ...collagenStrands, S.tendon], { anchor: [(xSE + xEnd0) / 2, 0.8, 0] });

      const loadBlock = box([xEnd0 + 0.55, 0, 0], [1.15, 1.8, 1.8], 0x7894ad);
      const loadMass = cylM([xEnd0 + 0.55, -1.05, 0], [xEnd0 + 0.55, -2.0, 0], 0.6, mat(0xffbd61), 20);
      const loadHanger = cylM([xEnd0 + 0.55, -0.9, 0], [xEnd0 + 0.55, -1.05, 0], 0.075, mat(0xd6d9db), 10);
      const forceShaft = cylM([xEnd0 + 1.22, 2.0, 0], [xEnd0 + 2.1, 2.0, 0], 0.055, mat(0xffd479), 10);
      const forceHead = cone([xEnd0 + 2.1, 2.0, 0], [xEnd0 + 2.55, 2.0, 0], 0.17, 0xffd479);
      S.loadMeshes = [loadBlock, loadMass, loadHanger, forceShaft, forceHead];
      S.loadMeshes.forEach(m => { m.userData.restX = m.position.x; });
      S.pLoad = reg('肌肉力學裝置', '測力端、外加負荷與力方向', 'Force transducer, external load and force direction', '負荷塊代表測力端，懸掛圓柱表示外加負荷；箭頭標出負荷沿肌腱向外牽拉的方向。負荷與肌肉當下肌力的比較決定單元縮短、等長或延長。', S.loadMeshes, { anchor: [xEnd0 + 0.55, 0.5, 0.5] });
      S.stop = box([xEnd0 + 1.2, 0, -1.2], [0.3, 3.0, 0.3], 0xffd479, 0.85); S.stop.visible = false; CUR.root.add(S.stop);
      textSprite('固定端', [x0 - 0.8, 4.2, 0], 0.7, '#cfe3f5');
      textSprite('主動收縮', [xCE + 1.8, 2.25, 0], 0.7, '#ffb0a0');
      textSprite('彈性元件', [xSE + 1.5, 2.25, 0], 0.7, '#cfe3f5');
      textSprite('負荷方向', [xEnd0 + 1.75, 2.62, 0], 0.46, '#ffd479');

      const dt = dtClock();
      const updateParts = (p, ceL, tiL, seL) => {
        const ceEnd = x0 + ceL, tiEnd = ceEnd + tiL, seEnd = tiEnd + seL;
        fibers.forEach(f => { f.position.x = (x0 + ceEnd) / 2; f.scale.y = ceL / ce0; });
        S.muscleEnvelope.position.x = (x0 + tiEnd) / 2;
        S.muscleEnvelope.scale.x = (ceL + tiL) / 2;
        S.titin.position.set((ceEnd + tiEnd) / 2, 0, 0); S.titin.scale.set(tiL, 1, 1);
        S.tendon.position.set((tiEnd + seEnd) / 2, 0, 0); S.tendon.scale.set(seL, 1, 1);
        S.tendonBody.position.x = (tiEnd + seEnd) / 2;
        S.tendonBody.scale.x = seL / 2;
        S.collagenStrands.forEach(m => { m.position.x = (tiEnd + seEnd) / 2; m.scale.y = seL / se0; });
        S.loadMeshes.forEach(m => { m.position.x = m.userData.restX + seEnd - xEnd0; });
        S.stop.position.x = xEnd0 + 1.2;
        const titinRatio = tiL / ti0;
        S.titinZooms[0].scale.x = titinRatio; S.titinZooms[0].position.x = -8.0 + 0.5 * titinRatio;
        S.titinZooms[1].scale.x = titinRatio; S.titinZooms[1].position.x = -3.2 - 0.5 * titinRatio;
        S.metrics = { ceL, tiL, seL, total: ceL + tiL + seL };
        S.pCE.anchor.set((x0 + ceEnd) / 2, 1.1, 0.2); S.pTitin.anchor.set(-5.6, 5.0, 1.0);
        S.pTendon.anchor.set((tiEnd + seEnd) / 2, 0.9, 0); S.pLoad.anchor.set(seEnd + 0.55, 0.8, 0.5);
        S.pCE.meshes.forEach(m => m.material.emissive.setHex(S.mode === 'rest' ? 0 : 0x401008));
        S.stop.visible = S.mode === 'isometric';
      };
      S.apply = (eased, mode) => {
        let ceL = ce0, tiL = ti0, seL = se0;
        if (mode === 'isometric') {
          const d = 0.9 * eased; ceL -= d; tiL += 0.3 * eased; seL += 0.6 * eased;
        } else if (mode === 'concentric') {
          const d = 0.9 * Math.max(0.05, 1 - S.load / 100) * eased; ceL -= d; tiL += 0.12 * d; seL += 0.18 * d;
        } else if (mode === 'eccentric') {
          const d = 0.9 * Math.max(0.12, (S.load - 100) / 50) * eased; ceL += d; tiL += 0.18 * d; seL += 0.3 * d;
        }
        updateParts(eased, ceL, tiL, seL);
      };
      S.apply(0, 'rest');
      CUR.tick = () => {
        const d = dt();
        if (S.mode !== 'rest' && S.progress < 1) {
          const speed = S.mode === 'concentric' ? Math.max(0.25, 1.45 - S.load / 100) : S.mode === 'eccentric' ? 0.65 + (S.load - 100) / 120 : 0.75;
          S.progress = Math.min(1, S.progress + d * speed);
          S.apply(ease(S.progress), S.mode);
        }
        if (S.status) {
          const mode = S.mode === 'isometric' ? '等長：整體長度固定' : S.mode === 'concentric' ? '向心：肌肉縮短' : S.mode === 'eccentric' ? '離心：活化中被拉長' : '靜止';
          const vel = velocity(S.load);
          const m = S.metrics || { ceL: S.ce0, tiL: S.ti0, seL: S.se0, total: S.ce0 + S.ti0 + S.se0 };
          const elasticDelta = (m.tiL + m.seL) - (S.ti0 + S.se0), totalDelta = m.total - (S.ce0 + S.ti0 + S.se0);
          S.status.innerHTML = `<b>${mode}</b><br>負荷 ${S.load}% 最大等長肌力；相對縮短速度 ${vel > 0 ? '+' : ''}${vel.toFixed(2)}（示意）<br>收縮元件 ${m.ceL.toFixed(2)}；彈性段變化 ${elasticDelta >= 0 ? '+' : ''}${elasticDelta.toFixed(2)}；全長變化 ${totalDelta >= 0 ? '+' : ''}${totalDelta.toFixed(2)}`;
        }
        drawCurve();
      };
    },
    panel(box) {
      note(box, '<b>負荷控制：以最大等長肌力為 100%</b>');
      S.loadSlider = slider(box, '負荷（%）', 0, 150, S.load, 1, v => { S.load = v; drawCurve(); });
      btnRow(box, [
        ['等長收縮', () => start('isometric', 100)],
        ['向心縮短', () => start('concentric', Math.min(99, S.load))],
        ['離心延長', () => start('eccentric', Math.max(101, S.load))]
      ]);
      btnRow(box, [['↺ 回到靜止', () => { S.mode = 'rest'; S.progress = 0; S.apply(0, 'rest'); if (S.status) S.status.innerHTML = '靜止狀態'; }]]);
      S.status = note(box, '靜止狀態', 'rd');
      const cv = document.createElement('canvas'); cv.width = 280; cv.height = 142; box.appendChild(cv); S.cv = cv;
      note(box, '綠線為定性力－速度關係；向心負荷越大，縮短速度越慢；100% 時等長，超過 100% 時可出現離心延長。');
      const start = (mode, load) => {
        S.load = load; S.loadSlider.value = load; S.loadSlider.dispatchEvent(new Event('input'));
        S.mode = mode; S.progress = 0; S.apply(0, mode);
      };
      drawCurve();
    }
  });
})();
