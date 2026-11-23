/* 場景⑧：刺激頻率與骨骼肌張力（Ch12 §12.3、Fig. 12.18–12.19） */
(function () {
  let S = null;
  const twitch = age => {
    // 示意單收縮曲線：先有潛伏期，張力上升後再舒張；單位為正規化張力。
    if (age < 0.012 || age > 0.24) return 0;
    const u = (age - 0.012) / 0.05;
    return u * u * Math.exp(2 * (1 - u));
  };

  function drawTrace() {
    if (!S || !S.cv) return;
    const c = S.cv.getContext('2d'), W = S.cv.width, H = S.cv.height;
    const L = 34, R = 8, T = 10, B = 22, PW = W - L - R, PH = H - T - B, span = 1.2;
    c.clearRect(0, 0, W, H); c.fillStyle = '#0a1420'; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#35516d'; c.lineWidth = 1; c.beginPath();
    c.moveTo(L, T); c.lineTo(L, T + PH); c.lineTo(L + PW, T + PH);
    [0.25, 0.5, 0.75, 1].forEach(v => { const y = T + PH * (1 - v); c.moveTo(L, y); c.lineTo(L + PW, y); }); c.stroke();
    c.fillStyle = '#9fb6c8'; c.font = '10px sans-serif'; c.fillText('張力', 3, T + 7); c.fillText('時間（示意）', W - 68, H - 4);
    c.fillStyle = '#ffc66d'; c.fillText('張力', L + 4, T + 11); c.fillStyle = '#48d7f2'; c.fillText('Ca²⁺', L + 42, T + 11);
    const now = S.time, start = now - span;
    const trace = (key, color, dash = []) => {
      c.save(); c.strokeStyle = color; c.lineWidth = 2; c.setLineDash(dash); c.beginPath();
      let begun = false;
      S.history.forEach(q => {
        if (q.t < start) return;
        const x = L + ((q.t - start) / span) * PW, y = T + PH * (1 - Math.max(0, Math.min(1, q[key])));
        if (!begun) { c.moveTo(x, y); begun = true; } else c.lineTo(x, y);
      });
      c.stroke(); c.restore();
    };
    trace('ca', '#48d7f2', [4, 3]); trace('force', '#ffc66d');
    if (S.running) {
      const x = L + PW;
      c.strokeStyle = '#ff7979'; c.beginPath(); c.moveTo(x, T); c.lineTo(x, T + PH); c.stroke();
    }
  }

  SCENES.push({
    name: '⑧ 刺激頻率與張力',
    title: '骨骼肌：單收縮、總和與強直',
    camera: { pos: [0, 5, 38], target: [0, 0, 0] },
    controls: [{ label: '🔍 肌纖維', fn() { flyTo([0, 3, 26], [0, 0, 0]); } }],
    desc: `
  <p>同一條肌纖維收到一次有效刺激，會產生一次<b>單收縮</b>；第二次刺激若在前一次舒張完成前到達，兩次張力會<b>總和</b>。提高刺激頻率，舒張間隔縮短，可由單收縮進入<b>不完全強直</b>，再進入平滑、持續的<b>完全強直</b>。</p>
  <p>頻率總和與<b>運動單元增補</b>是不同機制：本模型固定同一個運動單元，改變其刺激頻率；增補則是啟動更多運動單元。連續刺激時，胞質 Ca²⁺ 尚未完全下降，較多 Ca²⁺ 仍可維持與肌鈣蛋白的結合，讓後續張力疊加。</p>
  <p class="hint">按 5、10、60 Hz 比較刺激與張力曲線。曲線是以骨骼肌抽動時間尺度繪製的正規化示意，不代表特定肌肉的絕對張力或精確時間常數。</p>`,
    build() {
      S = { time: 0, freq: 10, running: false, trainMode: 'frequency', trainAcc: 0, trainElapsed: 0, fatigue: 1, treppeAcc: 0, treppeN: 0, events: [], history: [], force: 0, ca: 0 };
      const soma = ell([-15, 3.5, 0], [1.0, 0.75, 0.7], 0xffa040);
      const axonPath = [V(-14.2, 3.5, 0), V(-11, 3.5, 0), V(-8.5, 2.4, 0), V(-7.2, 0.2, 0)];
      const fibers = [], endings = [], positions = [];
      for (let r = 0; r < 4; r++) for (let q = 0; q < 2; q++) positions.push(V(-1.5, 2.0 - r * 1.2, q ? 0.72 : -0.72));
      const tex = stripeTex(24, { I: '#e5b0a8', H: '#a34c46' });
      positions.forEach((p, i) => {
        const f = cylM([-6.5, p.y, p.z], [9.5, p.y, p.z], 0.36, tmat(tex), 18); fibers.push(f);
        endings.push(ell([-6.1, p.y, p.z], [0.24, 0.12, 0.24], 0xffd479));
      });
      const branches = positions.map((p, i) => ttube([
        [-7.2, 0.2, 0], [-6.8, 0.4 + p.y * 0.25, p.z * 0.35], [-6.4, p.y + 0.5, p.z], [-6.1, p.y, p.z]
      ], 0.045, 0xffa040));
      const belly = ell([1.5, 0, 0], [9.4, 2.7, 1.45], 0xe87d73, 0.12); S.belly = belly;
      reg('刺激頻率模型', '運動神經元與軸突分支', 'Motor neuron and axon branches', '一次運動神經元放電會沿軸突傳到其分支，刺激這個運動單元內的肌纖維。', [soma, ttube(axonPath, 0.16, 0xffa040), ...branches], { anchor: [-10.6, 3.4, 0.2] });
      S.pFibers = reg('刺激頻率模型', '一個運動單元的肌纖維', 'Muscle fibers of one motor unit', '同一運動神經元所支配的肌纖維共同產生張力。反覆刺激時，本模型維持同一運動單元不變，只改變放電頻率。', [...fibers, ...endings, belly], { anchor: [1.4, 2.1, 0.9] });
      const leftTendon = positions.map(p => ttube([V(-9.2, 0, 0), V(-8.0, p.y * 0.4, p.z * 0.4), V(-6.5, p.y, p.z)], [0.13, 0.075], 0xf4f1ea));
      const leftPlate = box([-6.5, 0, 0], [0.22, 4.8, 1.9], 0xf4f1ea, 0.5);
      reg('刺激頻率模型', '固定端肌腱與腱膜', 'Fixed-end tendon and aponeurosis', '肌纖維末端經腱膜連到固定肌腱；反覆刺激時右端張力傳至傳感器。', [...leftTendon, leftPlate], { anchor: [-7.9, 0.6, 0.4] });
      const springPts = []; for (let i = 0; i <= 180; i++) { const t = i / 180, a = t * 12 * Math.PI * 2; springPts.push(V(t - 0.5, Math.cos(a) * 0.3, Math.sin(a) * 0.3)); }
      S.tendon = ttube(springPts, 0.055, 0xe8d9b5, 1, { seg: 240, radial: 8 });
      S.pTendon = reg('刺激頻率模型', '肌腱彈性段', 'Elastic tendon segment', '抽動張力經串聯彈性組織傳至固定的張力傳感器；張力升高時此段示意性伸長。', S.tendon, { anchor: [11.3, 0.6, 0.3] });
      S.tendon.position.x = 11.35;
      S.rightPlate = box([9.5, 0, 0], [0.22, 4.8, 1.9], 0xf4f1ea, 0.5);
      S.pRightPlate = reg('刺激頻率模型', '肌纖維末端腱膜', 'Distal muscle aponeurosis', '整束肌纖維的末端連到腱膜，再把張力傳入肌腱彈性段。', S.rightPlate, { anchor: [9.5, 0.6, 0.4] });
      const sensor = box([14.2, 0, 0], [1.8, 2.5, 2.2], 0x627c92);
      reg('刺激頻率模型', '張力傳感器', 'Force transducer', '固定端量測肌肉傳來的張力；右側曲線顯示單收縮與重複刺激造成的張力變化。', sensor, { anchor: [14.2, 1.1, 0.2] });

      const caPts = [];
      for (let i = 0; i < 8; i++) caPts.push(V(-1 + (i % 4) * 1.25, -0.28 + Math.floor(i / 4) * 0.4, 0.95));
      S.ionPositions = caPts;
      S.ions = dots(caPts, 0.15, 0x43d9f2); S.ions.material.emissive.setHex(0x135766);
      reg('刺激頻率模型', '胞質 Ca²⁺ 示意', 'Cytosolic Ca²⁺ (schematic)', '每次刺激引發 Ca²⁺ 訊號。刺激頻率提高時，兩次刺激間 Ca²⁺ 有較少時間回到低值，張力因而總和。', S.ions, { anchor: [0.9, 0.1, 1.2] });
      S.ap = dots(new Array(16).fill(0).map(() => V(0, -99, 0)), 0.18, 0xffffff);
      S.ap.material.emissive.setHex(0xffff80); CUR.root.add(S.ap); S.apPath = axonPath;

      const dt = dtClock();
      const fire = (amp = 1) => { S.events.push({ t: S.time, amp }); };
      S.fire = fire;
      CUR.tick = () => {
        const d = dt(); S.time += d;
        if (S.running) {
          if (S.trainMode === 'treppe') {
            S.treppeAcc += d;
            while (S.treppeAcc >= 0.62) { S.treppeAcc -= 0.62; fire(Math.min(1, 0.42 + 0.14 * S.treppeN)); S.treppeN++; }
          } else {
            S.trainAcc += d; const interval = 1 / S.freq;
            while (S.trainAcc >= interval) { S.trainAcc -= interval; fire(); }
            S.trainElapsed += d;
          }
        } else {
          S.trainElapsed = Math.max(0, S.trainElapsed - d * 0.12);
          S.fatigue = Math.min(1, S.fatigue + d * 0.035);
        }
        if (S.running && S.trainMode === 'frequency' && S.freq >= 30) S.fatigue = 1 - 0.48 * ease((S.trainElapsed - 3) / 7);
        S.events = S.events.filter(e => S.time - e.t < 0.32);
        let rawCa = 0, force = 0;
        S.events.forEach(e => { const age = S.time - e.t; rawCa += e.amp * Math.exp(-age / 0.085); force += e.amp * twitch(age); });
        S.ca = Math.min(1, rawCa / 4.6); S.force = Math.min(1, force) * S.fatigue;
        const shorten = 1 - 0.03 * S.force, rightEnd = -6.5 + 16 * shorten;
        fibers.forEach((f, i) => {
          f.scale.y = shorten; f.position.x = -6.5 + 8 * shorten;
          f.material.emissive.setHex(S.force > 0.05 ? 0x401008 : 0);
        });
        S.belly.scale.x = 9.4 * shorten; S.belly.position.x = -6.5 + 8 * shorten;
        const elasticLength = 13.2 - rightEnd;
        S.rightPlate.position.x = rightEnd; S.pRightPlate.anchor.x = rightEnd;
        S.tendon.position.x = (rightEnd + 13.2) / 2; S.tendon.scale.x = elasticLength / 3.7;
        S.pFibers.anchor.set(-6.5 + 8 * shorten, 2.1, 0.9); S.pTendon.anchor.set((rightEnd + 13.2) / 2, 0.65, 0.35);
        updateAnchors();
        const caActive = S.ca > 0.05;
        S.ions.material.emissiveIntensity = caActive ? 0.3 + 1.2 * S.ca : 0.15;
        for (let i = 0; i < S.ions.count; i++) {
          S.ions.setP(i, S.ionPositions[i], 0.15 * (0.75 + 0.35 * S.ca));
        }
        S.ions.instanceMatrix.needsUpdate = true;
        for (let i = 0; i < S.ap.count; i++) {
          const e = S.events[S.events.length - 1 - i], age = e ? S.time - e.t : 1;
          S.ap.setP(i, age >= 0 && age < 0.09 ? alongPath(S.apPath, age / 0.09) : V(0, -99, 0), 0.18);
        }
        S.ap.instanceMatrix.needsUpdate = true;
        S.history.push({ t: S.time, force: S.force, ca: S.ca });
        S.history = S.history.filter(q => S.time - q.t <= 1.24);
        drawTrace();
      };
    },
    panel(box) {
      note(box, '<b>固定一個運動單元，改變刺激頻率</b>');
      S.freqSlider = slider(box, '刺激頻率（Hz）', 1, 60, S.freq, 1, v => { S.freq = v; });
      const resetTrial = () => { S.events = []; S.history = []; S.time = 0; S.force = S.ca = 0; S.fatigue = 1; S.trainElapsed = 0; };
      btnRow(box, [
        ['單次刺激', () => { resetTrial(); S.running = false; S.trainMode = 'frequency'; S.fire(); }],
        ['▶ 連續刺激', () => startAt(S.freq)],
        ['■ 停止', () => { S.running = false; }]
      ]);
      btnRow(box, [['5 Hz', () => start(5)], ['10 Hz', () => start(10)], ['60 Hz', () => start(60)]]);
      const startAt = hz => { resetTrial(); S.trainMode = 'frequency'; S.freq = hz; S.freqSlider.value = hz; S.freqSlider.dispatchEvent(new Event('input')); S.running = true; S.trainAcc = 0; S.fire(); };
      const start = hz => startAt(hz);
      btnRow(box, [
        ['階梯效應（Treppe）', () => { resetTrial(); S.running = true; S.trainMode = 'treppe'; S.treppeAcc = 0; S.treppeN = 1; S.fire(0.42); }],
        ['清除曲線', () => { S.running = false; resetTrial(); }]
      ]);
      const cv = document.createElement('canvas'); cv.width = 280; cv.height = 138; box.appendChild(cv); S.cv = cv;
      note(box, '橘線＝張力；藍虛線＝胞質 Ca²⁺ 示意。5 Hz 可見分開抽動，10 Hz 張力疊加，60 Hz 趨近融合強直；持續高頻刺激會出現示意性疲勞衰減。階梯效應按鍵使用完全舒張間隔，逐次提高抽動峰值。');
      drawTrace();
    }
  });
})();
