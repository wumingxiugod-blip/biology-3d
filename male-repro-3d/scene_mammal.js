/* 場景①：哺乳類雄性生殖系統整體（以公牛／彈性纖維型陰莖為代表，含勃起伸直、提睪肌溫控與射精路徑動畫） */
SCENES.push({
  name: '① 哺乳類整體',
  title: '哺乳類雄性生殖系統（側面解剖示意，以公牛為代表）',
  camera: { pos: [-0.4, 0.55, 8.2], target: [0.15, 0.45, 0] },
  desc: `
  <p>模型左側為<b>尾側</b>、右側為<b>頭側</b>，上為背側；左右成對構造皆已繪出。可用右方按鈕體驗<b>勃起伸直</b>、<b>提睪肌溫控</b>與<b>射精路徑</b>互動動畫。</p>
  <p><b>雄性生殖系統功能</b>：①產生精子（睪丸）②運輸、保護精子（管道系統與輔性腺）③將精子遞送入雌性體內（交接器官）④分泌雄性素維持生殖機能。</p>
  <details open><summary>物種差異重點</summary>
  <table>
  <tr><th>陰莖型式</th><td>彈性纖維型：反芻獸、豬（具S形屈曲，勃起靠伸直而非大幅脹大）<br>肌肉海綿型：人、馬、肉食獸（勃起時明顯變長變粗）</td></tr>
  <tr><th>輔性腺</th><td>犬、貓：無囊腺，攝護腺發達<br>公牛、公豬：囊腺大，攝護腺小<br>公豬：無輸精管壺；豬、貓無壺腺<br>尿道球腺：豬極發達、犬缺乏</td></tr>
  <tr><th>睪丸位置</th><td>體內：海牛、鯨、象｜陰囊：有袋類、有蹄類、肉食、靈長類</td></tr>
  <tr><th>陰莖頭</th><td>牛：龜頭帽｜豬：螺旋狀無陰莖頭｜馬、羊：尿道突｜犬：延長部＋陰莖頭球＋陰莖骨</td></tr>
  </table></details>`,
  controls: [
    { label: '🔥 勃起伸直動畫', fn() { window._maleState && (window._maleState.erect = !window._maleState.erect); } },
    { label: '❄️ 提睪肌冷縮／熱鬆', fn() { window._maleState && (window._maleState.cold = !window._maleState.cold); } },
    { label: '⚡ 射精路徑演示', fn() { window._maleState && (window._maleState.ejac = !window._maleState.ejac); } },
    { label: '🔍 聚焦睪丸與精索', fn() { flyTo([-1.5, -0.4, 3.6], [-1.5, -0.5, 0]); } }
  ],
  build() {
    const SIDES = [1, -1];
    const ST = window._maleState = { erect: false, erectT: 0, cold: false, coldT: 0, ejac: false, ejacPhase: 0 };

    // 陰莖路徑（未勃起 S 狀屈曲 vs 勃起伸直）
    const PP_REST = [
      [0.50, 1.40, 0], [0.25, 1.18, 0], [-0.15, 0.97, 0], [-0.55, 0.78, 0], [-0.95, 0.50, 0], [-1.05, 0.05, 0],
      [-0.95, -0.35, 0], [-0.65, -0.55, 0], [-0.40, -0.28, 0], [-0.15, -0.55, 0], [0.45, -0.66, 0], [1.55, -0.70, 0], [2.72, -0.70, 0]
    ];
    const PP_ERECT = [
      [0.50, 1.40, 0], [0.25, 1.18, 0], [-0.15, 0.97, 0], [-0.55, 0.78, 0], [-0.95, 0.50, 0], [-1.02, 0.05, 0],
      [-0.85, -0.38, 0], [-0.50, -0.58, 0], [-0.08, -0.64, 0], [0.42, -0.67, 0], [1.15, -0.69, 0], [2.25, -0.70, 0], [3.55, -0.70, 0]
    ];

    const makeCurve = t => {
      const pts = PP_REST.map((p, i) => V(
        p[0] + (PP_ERECT[i][0] - p[0]) * t,
        p[1] + (PP_ERECT[i][1] - p[1]) * t,
        0
      ));
      return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    };

    const curve = makeCurve(0);
    const N = 600, sp = curve.getSpacedPoints(N);
    const near = (x, y) => { let b = 0, bd = 1e9; sp.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; b = i; } }); return b; };
    const seg = (a, b, off) => { const pts = []; for (let i = a; i < b; i += 4) pts.push(sp[i].clone()); pts.push(sp[b].clone()); if (off) pts.forEach(p => p.add(V(...off))); return pts; };
    const i1 = near(0.05, 1.08), i2 = near(-0.30, 0.88), i3 = near(-0.85, 0.62), i4 = near(-1.04, 0.20);
    const iPre = near(1.2, -0.7), iFree = N;
    const tg = i => sp[Math.min(N, i + 3)].clone().sub(sp[Math.max(0, i - 3)]);

    // ===== 1. 梨形膀胱與尿道 =====
    const bladderMesh = latheBody([
      [0.001, -0.45], [0.16, -0.38], [0.36, -0.18], [0.48, 0.08], [0.45, 0.34], [0.28, 0.52], [0.001, 0.58]
    ], 0xe8c27a, 0.72, 32, { tex: 'fiber' });
    bladderMesh.position.set(0.68, 1.82, 0);
    bladderMesh.rotation.z = 0.52;
    reg('尿道與膀胱', '膀胱', 'Urinary bladder', '梨形平滑肌囊袋儲存尿液。膀胱頸向後接尿道，雄性尿道是<b>尿液與精液最後的共同通道</b>。', bladderMesh, { wall: true, wallO: 0.78 });

    reg('尿道與膀胱', '內尿道括約肌', 'Internal urethral sphincter', '位於膀胱頸／攝護腺前尿道外圍，屬<b>平滑肌</b>。射精時收縮以<b>阻止精液逆流入膀胱</b>。',
      ring(sp[near(0.40, 1.31)], tg(near(0.40, 1.31)), 0.075, 0.025, 0xd96a6a), { anchor: [0.4, 1.31, 0.08] });

    reg('尿道與膀胱', '攝護腺前尿道', 'Pre-prostatic urethra', '膀胱頸至攝護腺的短段尿道；內襯<b>變移上皮</b>，外圍含內尿道括約肌。', tube(seg(0, i1), 0.04, 0xffe36e));
    reg('尿道與膀胱', '攝護腺尿道', 'Prostatic urethra', '穿過攝護腺段，變移上皮；中段背壁隆起為<b>精阜</b>，射精管與攝護腺導管開口於此。', tube(seg(i1, i2), 0.04, 0xffb347));
    reg('尿道與膀胱', '膜性尿道', 'Membranous urethra', '起自攝護腺尖端至陰莖球部，內襯<b>偽複層柱狀上皮</b>，外圍包覆<b>外尿道括約肌</b>。', tube(seg(i2, i3), 0.04, 0xffe36e));
    reg('尿道與膀胱', '球部尿道', 'Bulbar urethra', '尿道繞行<b>坐骨弓</b>的彎曲段，<b>尿道球腺</b>導管注入此處。', tube(seg(i3, i4), 0.042, 0xff9a3c));

    // 動態可伸直陰莖段群組
    const penileUrethraMesh = tube(seg(i4, iFree), 0.035, 0xffe36e);
    reg('尿道與膀胱', '陰莖尿道（海綿體部）', 'Penile / spongy urethra', '外包尿道海綿體；近端偽複層上皮、遠端<b>複層鱗狀上皮</b>，全程分佈<b>尿道腺（Littre氏腺）</b>分泌潤滑黏液。', penileUrethraMesh, { anchor: [0.9, -0.7, 0] });
    reg('尿道與膀胱', '外尿道括約肌', 'External urethral sphincter', '圍繞膜性尿道的<b>橫紋肌</b>，受意志控制排尿。',
      ring(sp[near(-0.62, 0.74)], tg(near(-0.62, 0.74)), 0.075, 0.028, 0xc0392b), { anchor: [-0.62, 0.74, 0.08] });

    // ===== 2. 輔性腺（有機分葉塑形） =====
    const prosPos = sp[near(-0.15, 0.97)];
    reg('輔性腺', '攝護腺（本體）', 'Prostate gland (corpus prostatae)', '圍繞尿道、觸感堅實的<b>複管泡腺</b>，分泌檸檬酸、蛋白水解酶與 PSA。牛、豬本體小；犬極發達。',
      blob([prosPos.x, prosPos.y, 0], [0.21, 0.15, 0.18], 0xe07b6a, 0.72, { amp: 0.08, seed: 3 }), { wall: true, wallO: 0.85 });
    reg('輔性腺', '攝護腺分部', 'Pars disseminata prostatae', '散佈於骨盆部尿道壁內的瀰散腺體，經眾多小管開口於尿道。',
      tube(seg(i2, near(-0.72, 0.70)), 0.072, 0xf0a090, 0.45), { anchor: [-0.5, 0.82, 0.07] });
    const colPos = sp[near(-0.10, 1.0)];
    reg('輔性腺', '精阜', 'Colliculus seminalis', '攝護腺尿道背壁隆起，<b>射精管</b>於兩側開口入尿道。',
      blob([colPos.x, colPos.y + 0.03, 0], [0.045, 0.032, 0.045], 0xfff0a0, 1, { amp: 0.04 }), { anchor: [colPos.x, colPos.y + 0.05, 0] });

    const A = [], VG = [], EJ = [], BG = [], BGD = [];
    SIDES.forEach(s => {
      A.push(vTube([[0.32, 1.32, s * 0.16], [0.16, 1.20, s * 0.11], [0.05, 1.10, s * 0.08]], t => 0.042 + 0.022 * Math.sin(t * Math.PI), 0x9fd18b, 1, 8, 12));
      EJ.push(tube([[0.05, 1.10, s * 0.08], [-0.10, 1.00, 0]], 0.022, 0xd9d97a));
      // 分葉叢集狀囊腺（緊密有機腺葉群）
      const lobuleOffsets = [[0, 0.04, 0], [0.08, 0.08, 0.04], [-0.07, 0.09, 0.03], [0.09, -0.02, -0.03], [-0.06, -0.04, 0.05], [0.02, 0.13, -0.02], [-0.01, -0.06, -0.04]];
      lobuleOffsets.forEach(([ox, oy, oz], idx) => {
        VG.push(blob([0.04 + ox, 1.20 + oy, s * (0.31 + oz)], [0.078, 0.072, 0.068], 0xd9a05b, 1, { amp: 0.09, seed: 10 + idx }));
      });
      VG.push(tube([[0.02, 1.16, s * 0.27], [0.05, 1.10, s * 0.09]], 0.020, 0xd9a05b));
      BG.push(blob([-0.72, 0.84, s * 0.17], [0.095, 0.09, 0.085], 0x7fb8d9, 1, { amp: 0.07, seed: 22 + s }));
      BGD.push(tube([[-0.72, 0.80, s * 0.15], [-0.88, 0.62, 0.0]], 0.015, 0x7fb8d9));
    });
    reg('輔性腺', '輸精管壺', 'Ampulla ductus deferentis', '輸精管末端腺體增厚形成壺部；馬、牛、羊發達，<b>豬與貓缺乏</b>。', A);
    reg('輔性腺', '囊腺（精囊腺）', 'Vesicular gland', '分葉狀複管泡腺，分泌<b>果糖與檸檬酸</b>構成精漿主要成分。牛、豬發達；<b>犬、貓無</b>。', VG, { anchor: [0.04, 1.28, 0.34] });
    reg('輔性腺', '射精管', 'Ejaculatory duct', '輸精管壺與囊腺導管會合穿過攝護腺，開口於精阜。', EJ, { anchor: [-0.02, 1.07, 0.05] });
    reg('輔性腺', '尿道球腺（Cowper氏腺）', 'Bulbourethral gland', '開口於球部尿道，分泌清澈黏液<b>沖洗中和尿道</b>；豬最發達，犬缺乏。', BG, { anchor: [-0.72, 0.9, 0.17] });
    BGD.forEach(m => { m.userData.part = null; CUR.root.add(m); });

    // ===== 3. 骨盆坐骨弓與陰莖結構 =====
    reg('陰莖與包皮', '坐骨弓', 'Ischial arch', '骨盆後下緣骨弓，供左右<b>陰莖腳</b>牢靠附著。',
      tube([[-0.88, 0.56, -0.40], [-0.94, 0.49, -0.20], [-0.96, 0.47, 0], [-0.94, 0.49, 0.20], [-0.88, 0.56, 0.40]], 0.048, 0xe9e2cf, 1, 8, { tex: 'none' }),
      { anchor: [-0.92, 0.5, 0.38] });

    const CR = [], CRM = [];
    SIDES.forEach(s => {
      const pts = [[-1.04, 0.12, s * 0.04], [-0.99, 0.35, s * 0.17], [-0.92, 0.5, s * 0.3]];
      CR.push(tube(pts, 0.055, 0xc23b4d)); CRM.push(tube(pts, 0.085, 0xb04040, 0.42, 8, { tex: 'fiber' }));
    });
    reg('陰莖與包皮', '陰莖腳', 'Crus penis', '陰莖海綿體基部分叉附著於坐骨弓，穩固固定陰莖。', CR, { anchor: [-0.99, 0.35, 0.17] });
    reg('肌肉', '坐骨海綿肌', 'Ischiocavernosus muscle', '覆蓋陰莖腳之橫紋肌，收縮迫使血液進入海綿體以維持勃起。', CRM, { anchor: [-0.95, 0.43, 0.24] });

    const ib = near(-1.02, 0.30);
    reg('陰莖與包皮', '陰莖球', 'Bulb of penis', '尿道海綿體近端膨大，包圍球部尿道。', blob([sp[ib].x, sp[ib].y, 0], [0.115, 0.175, 0.115], 0x8e5a9e, 1, { amp: 0.05 }));
    const ib2 = near(-1.04, 0.14);
    reg('肌肉', '球海綿肌', 'Bulbospongiosus muscle', '橫紋肌，覆蓋陰莖球與陰莖腹側，協助排空尿道並增壓維持勃起。',
      blob([sp[ib2].x - 0.01, sp[ib2].y, 0], [0.17, 0.30, 0.17], 0xc0504d, 0.42, { amp: 0.05, tex: 'fiber' }), { anchor: [-1.2, 0.14, 0.1] });

    // 可動態伸直的陰莖體、海綿體與圓潤龜頭帽
    const penileBodyMesh = tube(seg(i4, iFree - 12), 0.105, 0xf2c9b8, 0.28);
    const corpusCavMesh = tube(seg(i4, iFree - 40, [0, 0.036, 0]), 0.056, 0xd9534f, 0.95);
    const corpusSpgMesh = tube(seg(i4, iFree - 8, [0, -0.032, 0]), 0.050, 0x8e5a9e, 0.95);
    reg('陰莖與包皮', '陰莖體（白膜與筋膜）', 'Penile body (tunica albuginea / fasciae)', '彈性纖維型陰莖結締組織比例高，未勃起時靠 <b>S 形屈曲</b>折疊縮短；點擊右方「勃起伸直動畫」可觀察屈曲拉直過程。', penileBodyMesh, { anchor: [0.9, -0.55, 0], wall: true, wallO: 0.55 });
    reg('陰莖與包皮', '陰莖海綿體', 'Corpus cavernosum penis', '背側成對勃起組織；性興奮時充血加壓。', corpusCavMesh, { anchor: [0.4, -0.6, 0] });
    reg('陰莖與包皮', '尿道海綿體', 'Corpus spongiosum', '腹側圍繞尿道，勃起時保持尿道通暢，遠端覆蓋形成陰莖頭。', corpusSpgMesh, { anchor: [1.3, -0.74, 0] });

    const sigMarker = blob([-0.62, -0.50, 0], [0.055, 0.055, 0.055], 0xffee00, 0.95, { amp: 0.03, tex: 'none' });
    reg('陰莖與包皮', 'S狀屈曲', 'Sigmoid flexure', '反芻獸與豬特有之 <b>S 形屈曲</b>；勃起時後拉肌鬆弛、屈曲伸直，使陰莖游離端前伸突出包皮。', sigMarker, { anchor: [-0.65, -0.55, 0.12] });

    // 圓潤雕塑牛龜頭帽 (Galea glandis) 取代原本的尖錐
    const tip = sp[iFree];
    const glansMesh = latheBody([
      [0.04, -0.18], [0.072, -0.14], [0.088, -0.06], [0.092, 0.02], [0.078, 0.10], [0.050, 0.16], [0.018, 0.19], [0.001, 0.195]
    ], 0xe58fa0, 1, 32);
    glansMesh.rotation.z = -Math.PI / 2;
    glansMesh.position.set(tip.x, tip.y, 0);
    reg('陰莖與包皮', '陰莖頭（龜頭帽）', 'Glans penis (galea glandis)', '陰莖游離端末端：公牛、綿羊呈圓潤盔帽狀<b>龜頭帽</b>；公豬呈螺旋狀無陰莖頭；馬有尿道突；犬具陰莖頭球。', glansMesh, { anchor: [tip.x, tip.y + 0.1, 0] });

    reg('陰莖與包皮', '包皮', 'Prepuce', '環繞陰莖游離端之雙層皮膚皺褶；勃起時陰莖頭由此突出。',
      [tube(seg(iPre, iFree), 0.17, 0xe9b090, 0.22), ring(V(tip.x + 0.1, tip.y, 0), V(1, 0, 0), 0.17, 0.03, 0xd49a7c)],
      { anchor: [2.2, -0.52, 0], wall: true, wallO: 0.45 });

    // 陰莖後拉肌（隨勃起伸直同步拉長／鬆弛）
    const RT = [];
    const buildRetractorPts = (s, t) => {
      const stpX = -0.20 + 0.62 * t, stpY = -0.56 - 0.10 * t;
      return [[-1.0, 2.35, s * 0.1], [-1.35, 1.8, s * 0.14], [-1.4, 1.0, s * 0.14], [-1.25, 0.1, s * 0.14], [-0.85, -0.68, s * 0.1], [stpX, stpY - 0.08, s * 0.06]];
    };
    SIDES.forEach(s => RT.push(tube(buildRetractorPts(s, 0), 0.032, 0xe8d8c8, 1, 8, { tex: 'fiber' })));
    reg('肌肉', '陰莖後拉肌', 'Retractor penis muscle', '成對平滑肌，起自第 1–2 尾椎附於 S 形屈曲遠端。勃起時<b>鬆弛</b>讓陰莖伸長，射精後收縮拉回。', RT, { anchor: [-1.4, 1.2, 0.16] });

    reg('參考構造', '直腸與肛門', 'Rectum & anus', '僅供解剖方位定位參考。',
      [tube([[1.6, 2.55, 0], [0.5, 2.5, 0], [-0.7, 2.2, 0], [-1.5, 1.72, 0]], 0.12, 0x9c7a5b, 0.30), ring(V(-1.55, 1.68, 0), V(0.6, 0.5, 0), 0.1, 0.03, 0x7a5a3b)], { anchor: [0.2, 2.5, 0] });

    // ===== 4. 睪丸、附睪、精索與提睪肌溫控群組 =====
    const testisRig = new THREE.Group();
    CUR.root.add(testisRig);
    const T = [], EH = [], EB = [], ET = [], VAS = [], CORD = [], ART = [], PAM = [], VEIN = [], CREM = [];
    const vasCurves = [];
    SIDES.forEach(s => {
      const c = [-1.7, -0.85, s * 0.3];
      // 具微血管紋理之有機雕塑睪丸
      const tm = blob(c, [0.27, 0.50, 0.24], 0xf4e4c1, 1, { amp: 0.035, tex: 'vnet', seed: 30 + s });
      T.push(tm);
      // 附睪頭、體、尾（圓滑連續包覆睪丸尾緣）
      EH.push(blob([c[0] + 0.02, c[1] + 0.49, c[2]], [0.14, 0.11, 0.12], 0xd8a47f, 1, { amp: 0.07, seed: 40 + s }));
      EB.push(vTube([[c[0] - 0.02, c[1] + 0.46, c[2]], [c[0] - 0.20, c[1] + 0.28, c[2]], [c[0] - 0.29, c[1], c[2]], [c[0] - 0.25, c[1] - 0.34, c[2]], [c[0] - 0.08, c[1] - 0.52, c[2]]],
        t => 0.062 - 0.015 * Math.sin(t * Math.PI), 0xd8a47f, 1, 8, 12));
      ET.push(blob([c[0] - 0.04, c[1] - 0.55, c[2]], [0.115, 0.095, 0.11], 0xc98d68, 1, { amp: 0.07, seed: 50 + s }));

      const R = [-0.95, 0.2, s * 0.3], T0 = [c[0] - 0.1, c[1] + 0.62, c[2]];
      const axis = new THREE.LineCurve3(V(...T0), V(...R));
      const ax = t => axis.getPoint(t).toArray();
      const vasPts = [[c[0] - 0.05, c[1] - 0.55, c[2]], [c[0] - 0.33, c[1] - 0.38, c[2]], [c[0] - 0.38, c[1] + 0.05, c[2]], [c[0] - 0.28, c[1] + 0.5, c[2]], ax(0.04), ax(0.5), ax(1), [-0.75, 0.75, s * 0.28], [-0.35, 1.15, s * 0.22], [0.3, 1.3, s * 0.15]];
      const vm = tube(vasPts, 0.022, 0xffffff);
      VAS.push(vm);
      vasCurves.push(vm.userData.curve);
      CORD.push(tube([T0, R], 0.10, 0xf0e6d8, 0.30));
      CREM.push(tube([ax(0.02), ax(0.95)], 0.125, 0xc0504d, 0.24, 8, { tex: 'fiber' }));
      ART.push(tube(helixAlong(axis, 0.03, 9, 0, 160), 0.013, 0xe02020));
      ART.push(tube([R, [-1.0, 0.9, s * 0.38], [-0.6, 1.7, s * 0.38], [-0.2, 2.15, s * 0.38]], 0.015, 0xe02020));
      PAM.push(tube(helixAlong(axis, 0.066, 7, 1.0, 160), 0.015, 0x3b6fe0), tube(helixAlong(axis, 0.066, 7, 4.1, 160), 0.015, 0x3b6fe0));
      VEIN.push(tube([R, [-1.1, 0.9, s * 0.45], [-0.7, 1.7, s * 0.45], [-0.3, 2.15, s * 0.45]], 0.020, 0x3b6fe0));
    });

    reg('睪丸與附睪', '睪丸', 'Testis', '產生精子並分泌雄性素，外覆具微血管網之白膜。點擊右方「提睪肌冷縮／熱鬆」可觀察陰囊溫度調節升降！', T, { anchor: [-1.7, -0.7, 0.3] });
    reg('睪丸與附睪', '附睪頭', 'Caput epididymidis', '扁平杯狀位於睪丸近極，接收睪丸輸出小管。', EH, { anchor: [-1.68, -0.28, 0.3] });
    reg('睪丸與附睪', '附睪體', 'Corpus epididymidis', '沿睪丸尾緣下行，負責<b>精子成熟與運輸</b>。', EB, { anchor: [-1.98, -0.85, 0.3] });
    reg('睪丸與附睪', '附睪尾', 'Cauda epididymidis', '位於睪丸遠極，為<b>精子貯存</b>主要部位，射精時強烈收縮將精子推入輸精管。', ET, { anchor: [-1.75, -1.4, 0.3] });
    reg('睪丸與附睪', '輸精管', 'Vas (ductus) deferens', '管壁平滑肌厚實，靠蠕動輸送精子；點擊「射精路徑演示」可觀看精子行進路線。', VAS, { anchor: [-0.55, 0.98, 0.3] });
    reg('精索與血管', '精索', 'Spermatic cord', '含輸精管、睪丸動脈、蔓狀靜脈叢、提睪肌與神經。', CORD, { anchor: [-1.4, -0.05, 0.3], wall: true, wallO: 0.45 });
    reg('精索與血管', '提睪肌', 'Cremaster muscle', '橫紋肌，冷時收縮將睪丸拉近腹壁保暖，熱時鬆弛遠離散熱。', CREM, { anchor: [-1.55, -0.1, 0.4], wall: true, wallO: 0.40 });
    reg('精索與血管', '睪丸動脈', 'Testicular artery', '高度迂曲行於精索內，與蔓狀靜脈叢構成<b>逆流熱交換器</b>。', ART, { anchor: [-1.25, 0.12, 0.3] });
    reg('精索與血管', '蔓狀靜脈叢', 'Pampiniform venous plexus', '低溫靜脈血網密包動脈，冷卻進入睪丸的動脈血。', PAM, { anchor: [-1.5, -0.1, 0.22] });
    reg('精索與血管', '睪丸靜脈', 'Testicular vein', '由蔓狀靜脈叢匯集向上排流。', VEIN, { anchor: [-0.7, 1.7, 0.45] });

    // 雕塑懸垂梨形陰囊
    const scrotumMesh = latheBody([
      [0.001, -0.92], [0.35, -0.86], [0.58, -0.62], [0.64, -0.22], [0.56, 0.28], [0.46, 0.68], [0.52, 0.86]
    ], 0xe8b9a0, 0.22, 36);
    scrotumMesh.position.set(-1.75, -0.78, 0);
    scrotumMesh.scale.set(1.0, 1.0, 1.15);
    reg('陰囊', '陰囊', 'Scrotum', '懸吊於陰莖基部，皮膚薄、富汗腺與溫度感受器，維持低於體溫 1–8℉ 的生精環境。', scrotumMesh, { anchor: [-2.3, -1.0, 0.5], wall: true, wallO: 0.45 });
    reg('陰囊', '陰囊中隔', 'Scrotal septum', '由肉膜在正中形成，分隔左右睪丸室。',
      (() => { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 40), mat(0xc0504d, 0.30)); m.position.set(-1.75, -0.8, 0); m.scale.set(0.58, 0.82, 1); return m; })(), { anchor: [-1.75, -1.55, 0] });

    // 射精路徑動態粒子（隱藏至啟動時顯示）
    const ejacBalls = [];
    const eGeo = new THREE.SphereGeometry(0.055, 14, 10);
    const eMat = new THREE.MeshBasicMaterial({ color: 0x38f8ff });
    for (let k = 0; k < 10; k++) {
      const m = new THREE.Mesh(eGeo, eMat);
      m.visible = false;
      CUR.root.add(m);
      ejacBalls.push(m);
    }

    // 供溫控動畫移動的下半部睪丸／附睪／陰囊清單
    const moveTargets = [...T, ...EH, ...EB, ...ET, scrotumMesh];
    moveTargets.forEach(m => m.userData._y0 = m.position.y);

    // 動態更新函式：勃起伸直 + 提睪肌溫控 + 射精路徑流
    let lastErectT = 0;
    CUR.tick = () => {
      // 1. 勃起伸直過渡 (erectT: 0 -> 1)
      const targetE = ST.erect ? 1 : 0;
      if (Math.abs(ST.erectT - targetE) > 0.002) {
        ST.erectT += (targetE - ST.erectT) * 0.07;
        const cNow = makeCurve(ST.erectT);
        const ptsNow = cNow.getSpacedPoints(120);
        const subSeg = (f0, f1, dy = 0) => {
          const a = Math.floor(f0 * 120), b = Math.min(120, Math.floor(f1 * 120));
          const out = [];
          for (let j = a; j <= b; j++) out.push(ptsNow[j].clone().add(V(0, dy, 0)));
          return new THREE.CatmullRomCurve3(out, false, 'centripetal');
        };
        const updTube = (mesh, cv, r) => {
          mesh.geometry.dispose();
          mesh.geometry = new THREE.TubeGeometry(cv, 64, r, 12, false);
        };
        updTube(penileUrethraMesh, subSeg(0.32, 1.0, 0), 0.035);
        updTube(penileBodyMesh, subSeg(0.32, 0.96, 0), 0.105 + 0.012 * ST.erectT);
        updTube(corpusCavMesh, subSeg(0.32, 0.90, 0.036), 0.056 + 0.014 * ST.erectT);
        updTube(corpusSpgMesh, subSeg(0.32, 0.98, -0.032), 0.050 + 0.008 * ST.erectT);
        const tipNow = ptsNow[120];
        glansMesh.position.set(tipNow.x, tipNow.y, 0);
        sigMarker.position.set(-0.62 + 0.35 * ST.erectT, -0.50 - 0.12 * ST.erectT, 0);
        SIDES.forEach((s, idx) => {
          const rCv = new THREE.CatmullRomCurve3(PV(buildRetractorPts(s, ST.erectT)), false, 'centripetal');
          RT[idx].geometry.dispose();
          RT[idx].geometry = new THREE.TubeGeometry(rCv, 40, 0.032 - 0.006 * ST.erectT, 10, false);
        });
        lastErectT = ST.erectT;
      }

      // 2. 提睪肌冷縮／熱鬆動畫 (coldT: 0 -> 1 向上收縮靠近腹壁)
      const targetC = ST.cold ? 1 : 0;
      if (Math.abs(ST.coldT - targetC) > 0.002) {
        ST.coldT += (targetC - ST.coldT) * 0.08;
        const dy = ST.coldT * 0.34;
        moveTargets.forEach(m => { m.position.y = m.userData._y0 + dy; });
        scrotumMesh.scale.y = 1.0 - 0.16 * ST.coldT;
      }

      // 3. 射精路徑演示動畫（附睪尾 -> 輸精管 -> 射精管 -> 全程尿道 -> 陰莖頭）
      if (ST.ejac) {
        ST.ejacPhase = (ST.ejacPhase + 0.0045) % 1;
        const cUre = makeCurve(lastErectT);
        ejacBalls.forEach((b, k) => {
          b.visible = true;
          const u = (ST.ejacPhase + k / ejacBalls.length) % 1;
          if (u < 0.45) {
            const sideIdx = k % 2;
            b.position.copy(vasCurves[sideIdx].getPointAt(u / 0.45));
          } else {
            const uu = (u - 0.45) / 0.55;
            b.position.copy(cUre.getPointAt(0.12 + uu * 0.88));
          }
        });
      } else {
        ejacBalls.forEach(b => { b.visible = false; });
      }
    };
  }
});
