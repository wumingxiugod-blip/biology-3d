/* 場景⑧：血紅蛋白——四級結構、協同結合、T↔R、2,3-BPG（Ch4 4-5、Fig 2-49、7.6～7.20） */
const HB = { p: 20, noBPG: false, bpgUp: false, lowPH: false, fetal: false, CO: false, s: 0 };
const hill = (p, P50, n) => p <= 0 ? 0 : Math.pow(p, n) / (Math.pow(P50, n) + Math.pow(p, n));
function hbCurve(p) {
  if (HB.CO) return 0.5 * hill(p, 6, 1.3);           // 兩個位置被 CO 佔據；其餘位置被鎖在 R 態（高親和力、無協同）
  let P50 = HB.noBPG ? 1 : 26;                // Campbell：去除 BPG 的「純化」Hb 約 1 torr 即 50% 飽和，微血管中幾乎不釋氧
  if (!HB.noBPG && HB.fetal) P50 *= 0.73;
  if (!HB.noBPG && HB.bpgUp) P50 *= 1.2;
  if (HB.lowPH) P50 *= 1.3;
  return hill(p, P50, 2.8);
}
const mbCurve = p => hill(p, 2, 1);
function drawO2(cv) {
  const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, L = 30, T = 8, R = 8, B = 26, w = W - L - R, h = H - T - B;
  const X = p => L + p / 100 * w, Y = y => T + (1 - y) * h;
  ctx.fillStyle = '#0a1420'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#3b5a78'; ctx.strokeRect(L, T, w, h);
  ctx.fillStyle = '#9fb6c8'; ctx.font = '11px sans-serif';
  ctx.fillText('pO₂ (torr)', L + w / 2 - 25, H - 4); ctx.fillText('0', L - 4, H - 12); ctx.fillText('100', L + w - 16, H - 12);
  ctx.fillText('1', 18, T + 8); ctx.fillText('0', 18, T + h); ctx.save(); ctx.translate(11, T + h / 2 + 28); ctx.rotate(-Math.PI / 2); ctx.fillText('飽和分率 Y', 0, 0); ctx.restore();
  [[20, '組織'], [100, '肺']].forEach(([p, t]) => { ctx.strokeStyle = '#557'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(p), T); ctx.lineTo(X(p), T + h); ctx.stroke(); ctx.setLineDash([]); ctx.fillText(t, X(p) - (p === 100 ? 16 : 10), T + 12); });
  const line = (f, col, wd, dash) => { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash || []); ctx.beginPath(); for (let p = 0; p <= 100; p += 0.5) { const fn = p ? 'lineTo' : 'moveTo'; ctx[fn](X(p), Y(f(p))); } ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; };
  line(mbCurve, '#9a9a9a', 1.5, [4, 3]);
  line(p => hill(p, 26, 2.8), '#ffffff55', 1);
  line(hbCurve, '#ff5050', 2.5);
  ctx.fillStyle = '#bbb'; ctx.fillText('Mb 雙曲線', X(8), Y(0.97) + 12);
  ctx.fillStyle = '#ff7070'; ctx.fillText('Hb S 形', X(40), Y(hbCurve(40)) + 16);
  const y = hbCurve(HB.p); ctx.beginPath(); ctx.arc(X(HB.p), Y(y), 5, 0, 7); ctx.fillStyle = '#ffd479'; ctx.fill();
  if (!HB.CO && !HB.noBPG && !HB.lowPH && !HB.bpgUp && !HB.fetal) { ctx.fillStyle = '#ffd479'; ctx.fillText('P50 = 26', X(27), Y(0.5) + 4); }
}
SCENES.push({
  name: '⑧ 血紅蛋白',
  title: '四級結構：血紅蛋白 α₂β₂ 與協同結合',
  camera: { pos: [0, 10, 140], target: [0, -2, 0] },
  controls: [
    { label: '🔍 全貌', fn() { flyTo([0, 10, 140], [0, -2, 0]); } },
    { label: '👁 沿二重軸由下往上看（BPG 口袋）', fn() { flyTo([0, -95, 8], [0, -6, 0]); } },
    { label: '▶ 肺 → 組織 → 肺（自動播放）', fn() { HB.play = performance.now(); } }
  ],
  panel(box) {
    HB.sl = slider(box, 'pO₂（torr）', 0, 100, HB.p, 1, v => { HB.p = v; HB.play = null; HB.update(); });
    checkbox(box, '移除 2,3-BPG（純化的 Hb）', HB.noBPG, v => { HB.noBPG = v; HB.update(); });
    checkbox(box, '2,3-BPG 增加（高海拔適應）', HB.bpgUp, v => { HB.bpgUp = v; HB.update(); });
    checkbox(box, 'pH 降低／CO₂ 增加（Bohr 效應）', HB.lowPH, v => { HB.lowPH = v; HB.update(); });
    checkbox(box, '胎兒血紅蛋白 α₂γ₂', HB.fetal, v => { HB.fetal = v; reloadKeep(); });
    checkbox(box, '一氧化碳 CO 佔據 2 個位置', HB.CO, v => { HB.CO = v; HB.update(); });
    const cv = document.createElement('canvas'); cv.width = 290; cv.height = 190; box.appendChild(cv); HB.cv = cv;
    HB.msg = note(box, '');
    HB.update();
  },
  desc: `
  <p><b>血紅蛋白</b>（紅血球中，運送 O₂）＝ 4 條多肽鏈：<b>2 條 α + 2 條 β</b>（α₂β₂，Hb A），每條各帶<b>一個血基質</b>，可結合 4 個 O₂。</p>
  <ul>
  <li>每條次單元都是與肌紅蛋白相似的<b>球蛋白摺疊</b>（globin fold）；胺基酸序列與肌紅蛋白僅約 25%（α）、24%（β）相同，但立體結構幾乎一樣（同源 homologous）。</li>
  <li>可視為兩個相同的 <b>αβ 二聚體</b>（α₁β₁ 與 α₂β₂）。</li>
  <li><b>協同結合</b>：結合一個 O₂ 後，下一個更容易結合 → 氧合曲線呈 <b>S 形</b>（sigmoid）；肌紅蛋白為雙曲線。Hb 的 <b>P50 = 26 torr</b>。</li>
  <li><b>T 態</b>（tense，受次單元間作用拘束、親和力低） → <b>R 態</b>（relaxed，親和力高）：α₁β₁ 與 α₂β₂ 相對轉動約 15°。</li>
  <li>肺（pO₂ ≈ 100 torr）Hb 約 98% 飽和；組織（≈ 20 torr）降到約 32% → 釋出大量 O₂。肌紅蛋白在組織仍有 91%，不利運送。</li>
  <li><b>2,3-BPG</b>：高度帶負電，結合在四聚體<b>中央空腔</b>（只結合 <b>T 態</b>），使 Hb 釋氧；轉成 R 態時口袋塌陷、BPG 被釋出 → <b>異位效應物</b>（allosteric effector）。</li>
  <li><b>Bohr 效應</b>：pH 下降（H⁺、CO₂ 增加）→ 形成鹽橋穩定 T 態 → 親和力下降、更易釋氧。</li>
  <li><b>胎兒 Hb</b>（α₂γ₂）：γ 鏈第 143 位為 Ser（β 鏈為 His143）→ 與 2,3-BPG 結合較弱 → 親和力<b>高於</b>母體 Hb，O₂ 可由母親傳給胎兒。</li>
  <li><b>CO</b>：與 O₂ 結合同一位置、緊密約 <b>200 倍</b>，並把四聚體鎖在 R 態 → 其餘位置在組織中也不易釋氧。治療：高壓氧。</li>
  </ul>
  <p class="hint">拖動 pO₂ 滑桿：O₂ 依飽和分率逐一結合；本模型以<b>協同模式</b>（MWC）呈現——多數位置結合後整個四聚體一起由 T 轉為 R。次單元為示意摺疊，非晶體座標。</p>`,
  build() {
    const F = globinFold(), c0 = F.cen.clone();
    const g = HB.fetal ? 'γ' : 'β';
    const subs = [
      { id: 'α1', col: 0xe85a5a, pos: [-15, 10, 9], rot: [0, 0, 0], d: 0 },
      { id: g + '1', col: HB.fetal ? 0x50c878 : 0x4a8ae0, pos: [-15, -10, -9], rot: [Math.PI, 0, 0], d: 0 },
      { id: 'α2', col: 0xf09a9a, pos: [15, 10, -9], rot: [0, Math.PI, 0], d: 1 },
      { id: g + '2', col: HB.fetal ? 0x9ae0b0 : 0x8ab8f0, pos: [15, -10, 9], rot: [0, 0, Math.PI], d: 1 }
    ];
    const dim = [new THREE.Group(), new THREE.Group()]; dim.forEach(d => CUR.root.add(d));
    const hemeM = { C: smat(0x9a6a50), N: smat(EL.N[0]), O: smat(EL.O[0]), ring: smat(0xb07a5a) }, mFe = smat(0xe07a30);
    const mO2 = smat(EL.O[0]), mCO = smat(0x303030);
    HB.sites = [];
    const allCA = [];
    subs.forEach((s, k) => {
      const gr = new THREE.Group(); gr.position.set(...s.pos); gr.rotation.set(...s.rot); dim[s.d].add(gr); s.grp = gr; s.base = gr.position.clone();
      const loc = p => p.clone().sub(c0);
      const ms = [];
      F.segs.forEach(sg => {
        const pts = sg.pts.map(loc);
        ms.push(ttube(pts, sg.kind === 'helix' ? 0.5 : 0.4, sg.kind === 'helix' ? s.col : 0xd0d0d0, 1, { seg: pts.length * 8 }));
        if (sg.kind === 'helix') ms.push(cyl(loc(sg.a).toArray(), loc(sg.b).toArray(), 2.6, s.col, 0.22));
      });
      const isA = s.id[0] === 'α';
      const info = isA ? '<b>α 鏈</b>（141 個殘基）。與肌紅蛋白相同的球蛋白摺疊，含一個血基質。α₁ 與 β₁（或 γ₁）緊密結合成 αβ 二聚體。人類 α 鏈基因位於第 16 號染色體（每條 2 個，共 4 個基因）。' :
        HB.fetal ? '<b>γ 鏈</b>（胎兒）。與 β 鏈有 72% 胺基酸相同；第 143 位是 <b>Ser</b>（β 鏈為 His143）→ 2,3-BPG 結合變弱 → O₂ 親和力較高。' :
          '<b>β 鏈</b>（146 個殘基）。與肌紅蛋白相同的球蛋白摺疊；兩條 β 鏈之間的中央空腔是 2,3-BPG 的結合處。人類 β 鏈基因位於第 11 號染色體。';
      const p = reg('次單元（' + (s.d ? 'α₂' + g + '₂' : 'α₁' + g + '₁') + ' 二聚體）', s.id + ' 次單元', (isA ? 'α' : HB.fetal ? 'γ' : 'β') + ' subunit', info, ms, { anchor: [0, 14, 8] });
      attachPart(p, gr);
      F.segs.forEach(sg => sg.pts.forEach(q => allCA.push({ k, p: loc(q) })));
      // 血基質＋Fe＋O₂
      const hm = hemeMeshes(hemeM), fe = atomM(V(0, 0, 0), 'Fe', mFe);
      [...hm.meshes, fe].forEach(m => m.position.sub(c0));
      const ph = reg('血基質（4 個）', '血基質 ' + s.id, 'Heme', '每條次單元各有一個血基質，Fe²⁺ 結合一個 O₂ → 一個四聚體最多結合 <b>4 個 O₂</b>。O₂ 結合使 Fe 移入血基質平面，拉動近端 His 與 F 螺旋，這個位移傳到 α₁β₁／α₂β₂ 界面，觸發 T → R。', [...hm.meshes, fe], { anchor: loc(V(0, 3, 0)).toArray(), nolabel: k > 0 });
      attachPart(ph, gr);
      const O1 = loc(V(1.8, 0, 0)), O2b = loc(V(1.8 + 0.6, 1.05, 0));
      const lig = [atomM(O1, 'O', mO2, 1.3), atomM(O2b, 'O', mO2, 1.3), stickM(O1, O2b, 0.16, mO2)];
      const C1 = loc(V(1.85, 0, 0)), Oc = loc(V(3.0, 0, 0)), co = [atomM(C1, 'C', mCO, 1.3), atomM(Oc, 'O', mO2, 1.3), stickM(C1, Oc, 0.16, mCO)];
      HB.sites.push({ lig, co, grp: gr });
    });
    const pO2 = reg('配體', 'O₂（結合數隨 pO₂）', 'Bound O₂', '依目前 pO₂ 下的<b>飽和分率</b>顯示結合的 O₂ 數（0–4）。', [].concat(...HB.sites.map(s => s.lig)), { nolabel: true });
    const pCO = reg('配體', 'CO（一氧化碳）', 'Carbon monoxide', 'CO 佔據與 O₂ 相同的位置，結合強度約 O₂ 的 200 倍，並把四聚體鎖在 <b>R 態</b>。', [].concat(...HB.sites.map(s => s.co)), { nolabel: true });
    HB.sites.forEach(s => [...s.lig, ...s.co].forEach(m => { const p0 = m.position.clone(), q = m.quaternion.clone(), sc = m.scale.clone(); s.grp.add(m); m.position.copy(p0); m.quaternion.copy(q); m.scale.copy(sc); m.userData.s0 = sc; }));
    // 2,3-BPG 與 β 鏈上的正電殘基
    const site = V(0, -13, 0);
    const bp = [], mP = smat(0xff9a30), mBC = smat(0x9a9a9a), mBO = smat(EL.O[0]);
    const C = [V(-1.3, 0, 0), V(0, 0.6, 0), V(1.3, 0, 0)], Pp = [V(-2.6, -1.0, 0), V(1.0, 2.2, 0)];
    C.forEach(c => bp.push(atomM(c, 'C', mBC, 1.1)));
    bp.push(stickM(C[0], C[1], 0.15, mBC), stickM(C[1], C[2], 0.15, mBC));
    const C3O = [V(2.4, -0.6, 0.8), V(2.0, 0.8, -0.8)]; C3O.forEach(o => bp.push(atomM(o, 'O', mBO), stickM(C[2], o, 0.13, mBO)));
    Pp.forEach((p, i) => {
      bp.push(atomM(p, 'S', mP, 1.15), stickM(C[i === 0 ? 0 : 1], p, 0.15, mP));
      [V(0.9, 0.6, 0.6), V(-0.8, 0.7, -0.5), V(0, -0.6, 1.1)].forEach(d => { const o = p.clone().add(d.multiplyScalar(1.3)); bp.push(atomM(o, 'O', mBO, 0.9), stickM(p, o, 0.1, mBO)); });
    });
    const gB = new THREE.Group(); gB.position.copy(site); CUR.root.add(gB);
    const pB = reg('2,3-BPG', '2,3-雙磷酸甘油酸（2,3-BPG）', '2,3-Bisphosphoglycerate', '高度帶<b>負電</b>（兩個磷酸基），在紅血球中濃度與血紅蛋白相同（約 2 mM）。結合在四聚體<b>中央空腔</b>，與 β 鏈的<b>正電殘基</b>（His143 等）作用，<b>只結合 T 態</b>、穩定 T 態 → 降低 O₂ 親和力。<br>沒有 2,3-BPG，Hb 會是效率極差的 O₂ 運輸者（結合太緊、在組織不釋放）。', bp, { anchor: [0, 2.5, 0] });
    attachPart(pB, gB);
    const pos = [], mK = smat(0x3c64ff);
    if (!HB.fetal) {
      [1, 3].forEach(k => {
        const s = subs[k]; s.grp.updateMatrixWorld(true);
        const cand = allCA.filter(c => c.k === k).map(c => ({ c, w: c.p.clone().applyMatrix4(s.grp.matrixWorld) })).sort((a, b) => a.w.distanceTo(site) - b.w.distanceTo(site)).slice(0, 3);
        cand.forEach(({ c }) => { const tip = c.p.clone().add(s.grp.worldToLocal(site.clone()).sub(c.p).normalize().multiplyScalar(2)); pos.push({ k, ms: [atomM(tip, 'N', mK, 1.4), stickM(c.p, tip, 0.18, mK)] }); });
      });
      const pp = reg('2,3-BPG', 'β 鏈正電殘基（His143 等）', 'Positive residues of β chains', 'β 鏈中央空腔周圍的<b>帶正電</b>殘基（His143、Lys82、His2 等）與 2,3-BPG 的負電基團形成離子作用。胎兒 γ 鏈的第 143 位是 Ser → 少了正電，BPG 結合變弱。', [].concat(...pos.map(o => o.ms)));
      pos.forEach(o => o.ms.forEach(m => subs[o.k].grp.add(m)));
      pp._grp = subs[1].grp; pp._loc = pp.meshes[0].position.clone();
    }
    textSprite('α₁', [-24, 22, 9], 2.6, '#ff8a8a'); textSprite(g + '₁', [-24, -22, -9], 2.6, HB.fetal ? '#80e0a0' : '#8ab8ff');
    textSprite('α₂', [24, 22, -9], 2.6, '#ffb0b0'); textSprite(g + '₂', [24, -22, 9], 2.6, HB.fetal ? '#b0f0c8' : '#b0d0ff');
    HB.stateSpr = textSprite('T 態', [0, 30, 0], 3.2, '#ffd479', 'tense・低親和力');

    HB.update = () => {
      const y = hbCurve(HB.p), nb = HB.CO ? 2 + Math.round(y * 4) : Math.round(y * 4);
      HB.n = Math.min(4, nb); HB.R = HB.CO || y >= 0.5;
      const order = [0, 2, 1, 3];
      HB.sites.forEach((s, i) => {
        const r = order.indexOf(i), isCO = HB.CO && r >= 2, isO2 = !isCO && r < (HB.CO ? HB.n - 2 : HB.n);
        s.lig.forEach(m => m.scale.copy(isO2 ? m.userData.s0 : V(1e-4, 1e-4, 1e-4)));
        s.co.forEach(m => m.scale.copy(isCO ? m.userData.s0 : V(1e-4, 1e-4, 1e-4)));
      });
      pCO.visible = HB.CO; pB.visible = !HB.noBPG;
      if (HB.cv) {
        drawO2(HB.cv);
        const y100 = hbCurve(100), y20 = hbCurve(20);
        HB.msg.innerHTML = `pO₂ = <b>${HB.p}</b> torr → 飽和 <b>${Math.round(y * 100)}%</b>（約 ${HB.CO ? HB.n - 2 : HB.n} 個 O₂${HB.CO ? '＋2 個 CO' : ''}）<br>
          四級結構：<b>${HB.R ? 'R 態（relaxed）' : 'T 態（tense）'}</b><br>
          肺 100 torr：${Math.round(y100 * 100)}%｜組織 20 torr：${Math.round(y20 * 100)}% → 釋出 <b>${Math.round((y100 - y20) * 100)}%</b><br>
          <span style="color:#aaa">（肌紅蛋白：${Math.round(mbCurve(100) * 100)}% → ${Math.round(mbCurve(20) * 100)}%，只釋出 ${Math.round((mbCurve(100) - mbCurve(20)) * 100)}%）</span>`;
        if (HB.sl) { HB.sl.value = HB.p; HB.sl.previousSibling.textContent = HB.p; }
      }
      rebuildList(); refresh();
    };
    HB.s = HB.R ? 1 : 0;
    CUR.tick = () => {
      if (HB.play) {
        const t = ((performance.now() - HB.play) / 1000) % 12, f = t < 6 ? t / 6 : 2 - t / 6;
        const p = Math.round(100 - 85 * (0.5 - 0.5 * Math.cos(f * Math.PI)));
        if (p !== HB.p) { HB.p = p; HB.update(); }
      }
      HB.s += ((HB.R ? 1 : 0) - HB.s) * 0.05;
      const k = 1 - HB.s, a = 7.5 * DEG * k;
      dim[0].quaternion.setFromAxisAngle(V(1, 0, 0), -a); dim[1].quaternion.setFromAxisAngle(V(1, 0, 0), a);
      subs[1].grp.position.copy(subs[1].base).add(V(-2.2 * k, 0, 0)); subs[3].grp.position.copy(subs[3].base).add(V(2.2 * k, 0, 0));
      // BPG：T 態在空腔內；R 態被擠出
      const bound = !HB.noBPG && !HB.fetal ? 1 - HB.s : (1 - HB.s) * (HB.fetal ? 0.35 : 0);
      gB.position.set(0, -13 - 14 * (1 - bound), 0); gB.scale.setScalar(0.5 + 0.5 * bound);
      updateAnchors();
      if (HB._R !== HB.R) { HB._R = HB.R; CUR.root.remove(HB.stateSpr); HB.stateSpr = textSprite(HB.R ? 'R 態' : 'T 態', [0, 30, 0], 3.2, HB.R ? '#ff9a9a' : '#ffd479', HB.R ? 'relaxed・高親和力' : 'tense・低親和力'); }
    };
  }
});
