/* 場景②：子宮型式比較（頭側朝上，腹側觀；外壁半透明，內部深色為子宮腔） */
const TYPE_VIEWS = [
  { pos: [0, 0.0, 18.5], target: [0, -0.6, 0] },
  { pos: [-7.2, 0.2, 6.8], target: [-7.2, -0.4, 0] },
  { pos: [-3.6, 0.2, 6.8], target: [-3.6, -0.4, 0] },
  { pos: [0, 0.2, 6.8], target: [0, -0.4, 0] },
  { pos: [3.6, 0.2, 6.8], target: [3.6, -0.4, 0] },
  { pos: [7.2, 0.2, 6.8], target: [7.2, -0.4, 0] }
];
function typeFocus(k) {
  // k=0 全部並列：只顯示型式總標；k>0：只顯示該模型標籤
  CUR.parts.forEach(p => p.label = k === 0 ? !!p.isTitle : (p.model === k));
  flyTo(TYPE_VIEWS[k].pos, TYPE_VIEWS[k].target);
}
SCENES.push({
  name: '② 子宮型式',
  title: '哺乳類子宮的四種型式',
  camera: TYPE_VIEWS[0],
  controls: [
    { label: '🔍 全部並列（只標型式）', fn() { typeFocus(0); } },
    { label: '1 雙子宮（兔、鼠）', fn() { typeFocus(1); } },
    { label: '2a 雙分子宮角型（豬）', fn() { typeFocus(2); } },
    { label: '2b 雙分子宮角型（牛、羊）', fn() { typeFocus(3); } },
    { label: '3 雙分子宮型（馬）', fn() { typeFocus(4); } },
    { label: '4 單式子宮（人、靈長類）', fn() { typeFocus(5); } }
  ],
  desc: `
  <p>子宮由<b>一個子宮體與二個子宮角</b>組成；子宮體與子宮角的比例、子宮角的形狀與排列，視種別而有很大變異。由左到右，<b>左右兩半癒合程度逐漸增加</b>：</p>
  <table>
  <tr><th>型式</th><th>特徵</th><th>動物</th></tr>
  <tr><td><b>雙子宮</b><br>uterus duplex</td><td><b>無子宮體</b>，二子宮角完全分離，各自具有子宮頸管（2個子宮頸）</td><td>小鼠、鼠、兔、豚鼠等齧齒類</td></tr>
  <tr><td><b>雙分子宮角型</b><br>uterus bicornis</td><td>子宮體小，兩子宮角發達，<b>單個子宮頸</b></td><td>豬、狗、貓、反芻獸</td></tr>
  <tr><td><b>雙分子宮型</b><br>uterus bipartitus</td><td>子宮體很顯著，左右子宮角由<b>中隔</b>分離（不如雙角型），子宮角較短</td><td>馬</td></tr>
  <tr><td><b>單式子宮</b><br>uterus simplex</td><td>子宮體呈<b>梨形，無子宮角</b></td><td>人與其他靈長類</td></tr>
  </table>
  <p>豬：子宮體很短，子宮角長而<b>摺疊屈曲</b>。牛羊：子宮角近子宮體處癒合 → 外貌子宮體較實際大；子宮角有像<b>綿羊角的彎曲</b>。</p>
  <p style="color:#9bb">按右側按鈕可放大個別型式並顯示其解剖標籤。</p>`,
  build() {
    const W = 0xe88aa0, LUM = 0x7a1838, CX = 0xc98aa0, VG = 0xf0b0b8, OV = 0xf2e2c8, TB = 0xf5d77e;
    const X = [0, -7.2, -3.6, 0, 3.6, 7.2];
    const off = (k, p) => [p[0] + X[k], p[1], p[2] || 0];
    const offs = (k, arr) => arr.map(p => off(k, p));
    const R = (k, grp, zh, en, info, meshes, opt = {}) => { const p = reg(grp, zh, en, info, meshes, opt); p.model = k; p.label = false; return p; };
    const title = (k, grp, zh, en, info, anchor) => {
      const p = reg(grp, zh, en, info, ell(off(k, anchor), [0.09, 0.09, 0.09], 0xffd479), { anchor: off(k, anchor) });
      p.model = k; p.isTitle = true; p.label = true; return p;
    };
    const vagina = (k, y1 = -1.45, y0 = -2.35) => ttube(offs(k, [[0, y0, 0], [0, y1, 0]]), 0.3, VG, 0.3);
    const ovTube = (k, s, from, ov) => {
      const c = new THREE.CatmullRomCurve3(PV(offs(k, [from, [(from[0] + ov[0]) / 2 + s * 0.12, (from[1] + ov[1]) / 2 + 0.15, 0.05], [ov[0] - s * 0.05, ov[1] + 0.2, 0.1]])));
      return tube(helixAlong(c, 0.04, 5, 0, 140), 0.02, TB, 1, 2);
    };
    const SIDES = [1, -1];

    // ===== 1 雙子宮（兔） =====
    let G = '1 雙子宮 uterus duplex（兔）';
    title(1, G, '雙子宮（兔、鼠）', 'Uterus duplex', '<b>無子宮體</b>，二子宮角完全分離，<b>各自具有其子宮頸管</b>，分別開口入陰道。齧齒類（小鼠、鼠、兔、豚鼠）。', [0, -2.75, 0]);
    textSprite('雙子宮', off(1, [0, -3.35, 0]), 0.75, '#ffd479', 'uterus duplex｜兔、鼠');
    const dU = [], dL = [], dC = [], dO = [], dT = [], dV = [];
    SIDES.forEach(s => {
      const P = [[s * 0.15, -1.0, 0], [s * 0.35, -0.3, 0], [s * 0.62, 0.4, 0], [s * 0.82, 0.95, 0]];
      dU.push(ttube(offs(1, P), [0.15, 0.1], W, 0.4));
      dL.push(ttube(offs(1, P), [0.06, 0.04], LUM, 1));
      dC.push(ttube(offs(1, [[s * 0.14, -1.6, 0], [s * 0.15, -1.0, 0]]), 0.1, CX, 0.6), ttube(offs(1, [[s * 0.14, -1.62, 0], [s * 0.15, -0.98, 0]]), 0.025, LUM));
      dV.push(ring(V(...off(1, [s * 0.14, -1.62, 0])), V(0, 1, 0), 0.05, 0.018, 0x6a2040));
      dO.push(ell(off(1, [s * 1.05, 1.3, 0]), [0.14, 0.09, 0.09], OV));
      dT.push(ovTube(1, s, [s * 0.82, 0.98, 0], [s * 1.05, 1.3, 0]));
    });
    R(1, G, '子宮角（左右完全分離）', 'Cornua uteri (separate)', '左右兩子宮完全分離，<b>沒有子宮體</b>；每側各自是一個完整的子宮。', dU, { anchor: off(1, [0.62, 0.4, 0]) });
    R(1, G, '子宮腔（兩個獨立）', 'Uterine lumen ×2', '兩個子宮腔互不相通。', dL, { anchor: off(1, [-0.35, -0.3, 0]) });
    R(1, G, '子宮頸 ×2', 'Two cervices', '雙子宮的特徵：<b>每個子宮角各自有子宮頸管</b>，共有兩個子宮頸。', dC, { anchor: off(1, [0.15, -1.3, 0]) });
    R(1, G, '子宮頸外口 ×2', 'Two external os', '兩個子宮頸分別開口入同一個陰道。', dV, { anchor: off(1, [-0.14, -1.62, 0]) });
    R(1, G, '陰道（單一）', 'Vagina', '陰道不成對，只有一條。', vagina(1, -1.55), { anchor: off(1, [0.25, -2.0, 0]) });
    R(1, G, '輸卵管', 'Oviduct', '成對，連接子宮角尖端與卵巢。', dT, { anchor: off(1, [0.95, 1.2, 0]) });
    R(1, G, '卵巢', 'Ovary', '成對。小鼠、鼠的卵巢被<b>卵巢囊</b>完全包圍（僅一小孔）。', dO, { anchor: off(1, [-1.05, 1.3, 0]) });

    // ===== 2a 雙分子宮角型（豬） =====
    G = '2a 雙分子宮角型 uterus bicornis（豬）';
    title(2, G, '雙分子宮角型（豬）', 'Uterus bicornis (sow)', '子宮體<b>很短</b>，子宮角<b>極長且摺疊屈曲</b>如腸管，以容納多胎（一胎10頭以上）。單個子宮頸，長且具螺旋圓環。', [0, -2.75, 0]);
    textSprite('雙分子宮角型（豬）', off(2, [0, -3.35, 0]), 0.75, '#ffd479', 'uterus bicornis｜豬、狗、貓');
    R(2, G, '子宮體（很短）', 'Corpus uteri (short)', '豬的子宮體<b>很短</b>（約5 cm），胚胎主要在子宮角內發育。', [ttube(offs(2, [[0, -0.95, 0], [0, -0.68, 0]]), 0.2, W, 0.4), ttube(offs(2, [[0, -0.97, 0], [0, -0.66, 0]]), 0.08, LUM)], { anchor: off(2, [0, -0.8, 0]) });
    const pH = [], pL = [], pO = [], pT = [];
    SIDES.forEach(s => {
      const P = [];
      for (let i = 0; i <= 40; i++) { const t = i / 40; P.push([s * (0.18 + 0.55 * t + 0.28 * Math.sin(t * 14)), -0.68 + 1.75 * t, 0.35 * Math.cos(t * 14)]); }
      pH.push(ttube(offs(2, P), [0.12, 0.09], W, 0.45, { seg: 400 }));
      pL.push(ttube(offs(2, P), 0.04, LUM, 1, { seg: 400 }));
      const tip = P[P.length - 1];
      for (let j = 0; j < 9; j++) pO.push(ell(off(2, [tip[0] + s * 0.3 + Math.cos(j * 2.1) * 0.1, tip[1] + 0.32 + Math.sin(j * 1.7) * 0.1, Math.sin(j * 2.9) * 0.08]), [0.06, 0.06, 0.06], j % 3 ? 0xd9eaf5 : 0xf2a0a0));
      pT.push(ovTube(2, s, tip, [tip[0] + s * 0.3, tip[1] + 0.3, 0]));
    });
    R(2, G, '子宮角（長而摺疊屈曲）', 'Cornua uteri (long, convoluted)', '豬的子宮角<b>長而摺疊屈曲</b>（可達1–1.5 m），像小腸般盤繞。', pH, { anchor: off(2, [0.6, 0.3, 0.3]) });
    R(2, G, '子宮腔', 'Uterine lumen', '兩子宮角腔在短小的子宮體匯合後，通入單一子宮頸。', pL, { anchor: off(2, [-0.5, 0.0, 0]) });
    R(2, G, '子宮頸（單一、長）', 'Cervix (single, long)', '母豬的子宮頸<b>很長</b>，圓環呈<b>螺旋狀</b>排列，與公豬螺旋狀陰莖相配合；對精子運輸<b>無障礙</b>功能。', [ttube(offs(2, [[0, -1.75, 0], [0, -0.95, 0]]), 0.15, CX, 0.55), tube(helixAlong(new THREE.LineCurve3(V(...off(2, [0, -1.72, 0])), V(...off(2, [0, -0.98, 0]))), 0.07, 5, 0, 200), 0.025, 0x9a4468, 1, 2)], { anchor: off(2, [0, -1.35, 0]) });
    R(2, G, '陰道', 'Vagina', '單一陰道。', vagina(2, -1.75, -2.4), { anchor: off(2, [0.25, -2.1, 0]) });
    R(2, G, '卵巢（葡萄串狀）', 'Ovary (grape-like)', '豬的卵巢<b>像一簇葡萄</b>，濾泡與黃體顯著突出，遮蓋其他組織；卵巢囊發達。', pO, { anchor: off(2, [-1.3, 1.45, 0]) });
    R(2, G, '輸卵管', 'Oviduct', '豬的宮管接合有指狀黏膜突出，收縮可防止多精入卵。', pT, { anchor: off(2, [1.1, 1.2, 0]) });

    // ===== 2b 雙分子宮角型（牛） =====
    G = '2b 雙分子宮角型 uterus bicornis（牛、羊）';
    title(3, G, '雙分子宮角型（牛、羊）', 'Uterus bicornis (cow, ewe)', '子宮體小，兩子宮角在近子宮體處<b>癒合</b>（外觀子宮體較實際大），子宮角捲曲如<b>綿羊角</b>，單個子宮頸，具4個圓環。', [0, -2.75, 0]);
    textSprite('雙分子宮角型（牛）', off(3, [0, -3.35, 0]), 0.75, '#ffd479', 'uterus bicornis｜反芻獸');
    R(3, G, '子宮體（實際很小）', 'Corpus uteri (true body)', '真正的子宮體只是子宮頸前方很短的一段。', [ttube(offs(3, [[0, -0.95, 0], [0, -0.75, 0]]), 0.24, W, 0.4), ttube(offs(3, [[0, -0.97, 0], [0, -0.74, 0]]), 0.09, LUM)], { anchor: off(3, [0.0, -0.85, 0]) });
    const cH = [], cL = [], cO = [], cT = [];
    SIDES.forEach(s => {
      const P = [[s * 0.07, -0.78, 0], [s * 0.1, -0.35, 0], [s * 0.22, 0.05, 0], [s * 0.5, 0.35, -0.08], [s * 0.85, 0.3, -0.28], [s * 1.0, 0.0, -0.45], [s * 0.88, -0.3, -0.52], [s * 0.66, -0.25, -0.46]];
      cH.push(ttube(offs(3, P), [0.14, 0.07], W, 0.45));
      cL.push(ttube(offs(3, P), [0.05, 0.03], LUM));
      cO.push(ell(off(3, [s * 0.75, 0.2, -0.75]), [0.15, 0.09, 0.09], OV));
      cT.push(ovTube(3, s, [s * 0.66, -0.25, -0.46], [s * 0.75, 0.05, -0.75]));
    });
    R(3, G, '子宮角（羊角狀捲曲）', 'Cornua uteri (ram-horn curl)', '子宮角相對較豬、狗、貓為小，具有<b>像綿羊角的彎曲</b>；處女牛每角一整圈螺旋，經產牛只有半圈。', cH, { anchor: off(3, [0.95, 0.1, -0.4]) });
    R(3, G, '癒合部（假子宮體）＋中隔', 'Fused horns + velum uteri', '兩子宮角在近子宮體處癒合，外覆共同漿膜，內部仍以<b>中隔</b>分開 → 外觀子宮體較實際者為大。',
      [ell(off(3, [0, -0.42, 0]), [0.27, 0.42, 0.18], W, 0.25), ribbon(offs(3, [[0, -0.75, -0.12], [0, -0.05, -0.1]]), offs(3, [[0, -0.75, 0.12], [0, -0.05, 0.1]]), 0xf6c8d6, 0.7)], { anchor: off(3, [-0.25, -0.4, 0]) });
    R(3, G, '角間韌帶', 'Intercornual ligament', '連接兩子宮角分歧處的韌帶。', cyl(off(3, [-0.2, 0.07, 0.05]), off(3, [0.2, 0.07, 0.05]), 0.03, 0xc58cb0), { anchor: off(3, [0, 0.1, 0.08]) });
    R(3, G, '子宮腔', 'Uterine lumen', '兩子宮角腔一直到真正子宮體才合而為一。', cL, { anchor: off(3, [-0.5, 0.35, -0.08]) });
    R(3, G, '子宮頸（4個圓環）', 'Cervix with annular rings', '厚壁、僵硬，<b>常為四個環</b>互相嵌合 → 精子運輸的障礙；懷孕時形成子宮頸栓。', [ttube(offs(3, [[0, -1.55, 0], [0, -0.95, 0]]), 0.17, CX, 0.5), ...[-1.45, -1.3, -1.15, -1.02].map(y => ring(V(...off(3, [0, y, 0])), V(0, 1, 0), 0.08, 0.04, 0x9a4468))], { anchor: off(3, [0, -1.25, 0]) });
    R(3, G, '陰道', 'Vagina', '單一陰道。', vagina(3, -1.55), { anchor: off(3, [0.25, -2.0, 0]) });
    R(3, G, '卵巢（杏仁狀）', 'Ovary (almond-shaped)', '牛與綿羊的卵巢形狀<b>像杏仁</b>。', cO, { anchor: off(3, [-0.75, 0.2, -0.75]) });
    R(3, G, '輸卵管', 'Oviduct', '母牛宮管接合形成「扭結」。', cT, { anchor: off(3, [0.75, -0.2, -0.65]) });

    // ===== 3 雙分子宮（馬） =====
    G = '3 雙分子宮 uterus bipartitus（馬）';
    title(4, G, '雙分子宮型（馬）', 'Uterus bipartitus (mare)', '<b>子宮體很顯著</b>，左右子宮角由一個中隔分離，但分離程度不如雙分子宮角型，子宮角也較短 → 外觀呈 <b>T／Y 字形</b>。', [0, -2.75, 0]);
    textSprite('雙分子宮型（馬）', off(4, [0, -3.35, 0]), 0.75, '#ffd479', 'uterus bipartitus｜馬');
    R(4, G, '子宮體（大而顯著）', 'Corpus uteri (large)', '馬的子宮體大而顯著，約占子宮的一半，胚胎可在子宮體內遷移。', [ttube(offs(4, [[0, -1.0, 0], [0, -0.4, 0], [0, 0.12, 0]]), 0.34, W, 0.4), ttube(offs(4, [[0, -1.02, 0], [0, 0.0, 0]]), 0.17, LUM)], { anchor: off(4, [0.3, -0.5, 0]) });
    R(4, G, '中隔（短）', 'Short septum', '只在子宮體頭端有一小段中隔分開兩角，<b>分離程度不如雙角型</b>。', ribbon(offs(4, [[0, 0.0, -0.13], [0, 0.22, -0.1]]), offs(4, [[0, 0.0, 0.13], [0, 0.22, 0.1]]), 0xf6c8d6, 0.85), { anchor: off(4, [0, 0.12, 0]) });
    const mH = [], mL = [], mO = [], mT = [];
    SIDES.forEach(s => {
      const P = [[s * 0.1, 0.05, 0], [s * 0.45, 0.25, 0], [s * 0.85, 0.35, 0], [s * 1.15, 0.5, 0]];
      mH.push(ttube(offs(4, P), [0.2, 0.11], W, 0.45));
      mL.push(ttube(offs(4, P), [0.08, 0.04], LUM));
      mO.push(ell(off(4, [s * 1.35, 0.95, 0]), [0.22, 0.14, 0.13], OV), ell(off(4, [s * 1.35, 0.83, 0.1]), [0.06, 0.03, 0.04], 0x5a3a3a));
      mT.push(ovTube(4, s, [s * 1.15, 0.52, 0], [s * 1.33, 0.82, 0]));
    });
    R(4, G, '子宮角（較短，向兩側）', 'Cornua uteri (short)', '馬的子宮角較短，由子宮體向兩側伸出。', mH, { anchor: off(4, [0.85, 0.35, 0]) });
    R(4, G, '子宮腔', 'Uterine lumen', '子宮體腔大，兩角腔在中隔後方即合併。', mL, { anchor: off(4, [-0.6, 0.25, 0]) });
    R(4, G, '子宮頸（短、縱褶突入陰道）', 'Cervix (short, longitudinal folds)', '母馬的子宮頸<b>短</b>，<b>縱行黏膜皺摺極為顯著</b>，突入陰道很深；對精子運輸無障礙。',
      [ttube(offs(4, [[0, -1.4, 0], [0, -1.0, 0]]), 0.17, CX, 0.5), ...[0, 1, 2, 3, 4, 5].map(j => { const a = j / 6 * Math.PI * 2; return tube(offs(4, [[Math.cos(a) * 0.09, -1.75, Math.sin(a) * 0.09], [Math.cos(a) * 0.09, -1.4, Math.sin(a) * 0.09], [Math.cos(a) * 0.08, -1.02, Math.sin(a) * 0.08]]), 0.028, 0x9a4468); })], { anchor: off(4, [0, -1.25, 0]) });
    R(4, G, '陰道', 'Vagina', '單一陰道。', vagina(4, -1.4), { anchor: off(4, [0.25, -2.0, 0]) });
    R(4, G, '卵巢（豆形）＋排卵窩', 'Ovary (bean) + ovulation fossa', '馬的卵巢附著於卵巢系膜的邊緣有一凹痕＝<b>排卵窩</b>，形狀<b>像大豆</b>；排卵只發生在排卵窩。', mO, { anchor: off(4, [1.35, 1.05, 0]) });
    R(4, G, '輸卵管', 'Oviduct', '馬的卵巢囊狹窄，只包圍排卵窩。', mT, { anchor: off(4, [-1.25, 0.7, 0]) });

    // ===== 4 單式子宮（人） =====
    G = '4 單式子宮 uterus simplex（人）';
    title(5, G, '單式子宮（人、靈長類）', 'Uterus simplex', '子宮體呈<b>梨形</b>，<b>無子宮角</b>；輸卵管直接由子宮底兩側伸出。人與其他靈長類。', [0, -2.75, 0]);
    textSprite('單式子宮', off(5, [0, -3.35, 0]), 0.75, '#ffd479', 'uterus simplex｜人、靈長類');
    R(5, G, '子宮體（梨形）', 'Corpus uteri (pear-shaped)', '梨形單一腔室；內膜分功能層與基底層，月經時功能層脫落（見⑤）。',
      lathe([[0.0, -1.0], [0.2, -1.0], [0.28, -0.7], [0.42, -0.2], [0.5, 0.15], [0.45, 0.4], [0.25, 0.55], [0.0, 0.58]], W, 0.4, off(5, [0, 0, 0])), { anchor: off(5, [0.45, -0.3, 0]) });
    R(5, G, '子宮腔（倒三角形）', 'Uterine cavity', '單一子宮腔，冠狀切面呈倒三角形。',
      (() => { const m = lathe([[0, -0.95], [0.05, -0.95], [0.12, -0.5], [0.3, 0.2], [0.32, 0.36], [0, 0.4]], LUM, 1, off(5, [0, 0, 0])); m.scale.z = 0.25; return m; })(), { anchor: off(5, [0, -0.2, 0]) });
    R(5, G, '子宮底', 'Fundus uteri', '輸卵管開口連線以上、圓頂狀的部分。', ell(off(5, [0, 0.52, 0]), [0.3, 0.08, 0.25], 0xd8708e, 0.8), { anchor: off(5, [0, 0.6, 0]) });
    const hT = [], hO = [], hF = [];
    SIDES.forEach(s => {
      hT.push(tube(offs(5, [[s * 0.42, 0.35, 0], [s * 0.75, 0.42, 0], [s * 1.05, 0.38, 0.05], [s * 1.25, 0.15, 0.1]]), 0.04, TB));
      for (let j = 0; j < 7; j++) hF.push(tube(offs(5, [[s * 1.25, 0.15, 0.1], [s * (1.3 + 0.08 * Math.cos(j)), 0.0 - j * 0.02, 0.1 + 0.1 * Math.sin(j * 1.3)]]), 0.012, 0xf4a87c));
      hO.push(ell(off(5, [s * 0.95, -0.05, -0.05]), [0.2, 0.11, 0.1], OV), cyl(off(5, [s * 0.45, 0.15, -0.03]), off(5, [s * 0.78, -0.02, -0.05]), 0.02, 0xc58cb0));
    });
    R(5, G, '輸卵管', 'Uterine (Fallopian) tube', '無子宮角，輸卵管直接由子宮底兩側（子宮角部位）伸出。', hT, { anchor: off(5, [0.8, 0.45, 0]) });
    R(5, G, '輸卵管繖', 'Fimbriae', '指狀皺褶，接住排出的卵。', hF, { anchor: off(5, [-1.32, 0.0, 0.1]) });
    R(5, G, '卵巢（＋卵巢固有韌帶）', 'Ovary + ovarian ligament', '人類卵巢呈扁卵圓形，以卵巢固有韌帶連於子宮。', hO, { anchor: off(5, [0.95, -0.15, 0]) });
    R(5, G, '子宮頸（內／外子宮頸）', 'Cervix (endo-/ectocervix)', '人類子宮頸分<b>內子宮頸</b>（單層高柱狀黏液細胞、子宮頸腺）與<b>外子宮頸</b>（複層鱗狀上皮）。（見⑥）', ttube(offs(5, [[0, -1.5, 0], [0, -0.98, 0]]), 0.17, CX, 0.5), { anchor: off(5, [0, -1.25, 0]) });
    R(5, G, '陰道', 'Vagina', '人類陰道上皮為複層鱗狀上皮。', vagina(5, -1.5), { anchor: off(5, [0.25, -2.0, 0]) });
  }
});
