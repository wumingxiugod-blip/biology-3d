/* 場景⑤：子宮壁構造——分層、反芻獸肉阜／胎盤瘤、靈長類內膜 */
SCENES.push({
  name: '⑤ 子宮壁',
  title: '子宮壁：外膜／肌膜／內膜；肉阜與胎盤瘤；靈長類內膜',
  camera: { pos: [0.6, 3.2, 10.5], target: [0.6, 0.7, 0] },
  controls: [
    { label: '🔁 家畜內膜：發情期 ⇄ 動情間期後期', fn() { window._uState && window._uState(); } },
    { label: '🔁 絨毛葉：結合 ⇄ 分開', fn() { window._cotToggle && window._cotToggle(); } },
    { label: '🔁 靈長類：月經（功能層脫落）⇄ 增生', fn() { window._mensToggle && window._mensToggle(); } },
    { label: '🔍 子宮壁分層', fn() { flyTo([-3.0, 2.0, 5.2], [-3.0, 1.0, 0]); } },
    { label: '🔍 肉阜／胎盤瘤', fn() { flyTo([0.6, 2.2, 4.8], [0.6, 0.9, 0]); } },
    { label: '🔍 靈長類內膜', fn() { flyTo([4.3, 2.0, 5.0], [4.3, 1.0, 0]); } }
  ],
  desc: `
  <p>子宮壁由外而內：<b>子宮外膜</b>（漿膜）→ <b>子宮肌膜</b>（外縱行肌、血管層、內環狀肌）→ <b>子宮內膜</b>（上皮、固有層、黏膜下層、子宮腺）。</p>
  <table>
  <tr><th>層</th><th>重點</th></tr>
  <tr><td>外膜</td><td>腹膜：疏鬆結締組織、淋巴管、動靜脈＋一層中皮</td></tr>
  <tr><td>肌膜</td><td>懷孕時平滑肌<b>數量與大小增加</b>；分娩時對內泌素反應<b>強烈收縮</b></td></tr>
  <tr><td>內膜</td><td>厚度隨動情／月經週期變化；子宮腺＝<b>單分枝管腺</b></td></tr>
  </table>
  <p><b>母牛</b>：動情間期後期黃體萎縮 → 內膜萎縮、腺體變短；發情前期開始增厚、水腫充血，發情期末達高峰；發情時固有層微量出血（<b>metrorrhagia</b>）；發情後期與動情間期腺體分泌達最高點。</p>
  <p><b>母狗</b>：一年發情2次（間期約180天），發情期4–9天；動情前期內膜水腫充血甚至出血；發情後第6日黃體有功能、子宮腺與基質開始增殖；未懷孕則內膜腺體與基質於發情後20–30日開始退化。</p>
  <p>反芻獸：<b>肉阜</b>（非腺體）＋胎兒<b>絨毛葉</b>＝<b>胎盤瘤</b>；馬與豬無肉阜。</p>`,
  build() {
    const SE = 0xf6eedc, ML = 0xe0a080, MC = 0xc46a50, VL = 0xe9a0a8, SM = 0xe8b0b8, LP = 0xf6c6cc, EP = 0xfff2a8, GL = 0xb070c0;
    const G1 = '子宮壁分層（家畜）', G2 = '反芻獸肉阜與胎盤瘤', G3 = '靈長類子宮內膜';
    const W = 2.6, Dp = 1.4;

    // ===== A. 子宮壁分層 =====
    const AX = -3.0, Lb = (y0, y1, col, o = 1) => box([AX, (y0 + y1) / 2, 0], [W, y1 - y0, Dp], col, o);
    reg(G1, '子宮外膜', 'Perimetrium', '子宮壁最外層，屬<b>漿膜</b>（腹膜）：疏鬆結締組織、淋巴管、動脈及靜脈，上被覆一層<b>中皮</b>。', Lb(0, 0.06, SE), { anchor: [AX + 1.3, 0.03, 0.7] });
    reg(G1, '縱行肌層（外層）', 'Longitudinal muscle layer', '子宮肌膜的外層，平滑肌縱行排列。', Lb(0.06, 0.4, ML), { anchor: [AX + 1.3, 0.23, 0.7] });
    const VES = [Lb(0.4, 0.62, VL)];
    [-0.9, -0.3, 0.3, 0.9].forEach((x, k) => VES.push(cyl([AX + x, 0.51, -0.72], [AX + x, 0.51, 0.72], 0.07, k % 2 ? 0x4a6fd8 : 0xd03030)));
    reg(G1, '血管層', 'Stratum vasculare', '介於內外肌層之間，含<b>供應子宮血液最重要的血管</b>（子宮動靜脈分枝）。', VES, { anchor: [AX + 1.3, 0.51, 0.7] });
    reg(G1, '環狀肌層（內層）', 'Circular muscle layer', '子宮肌膜的內層。懷孕時平滑肌細胞<b>數量與大小增加</b>；分娩時對內泌素（催產素等）反應而<b>強烈收縮</b>。', Lb(0.62, 1.0, MC), { anchor: [AX + 1.3, 0.81, 0.7] });
    // 內膜（可縮放）
    const ENDO = [];
    const sub = Lb(1.0, 1.2, SM), lp = Lb(1.2, 1.95, LP, 0.45), ep = Lb(1.95, 2.0, EP);
    ENDO.push(lp, ep);
    reg(G1, '黏膜下層', 'Submucosa (stratum basale)', '固有層之下，屬<b>緻密不規則排列結締組織</b>；子宮腺遠端可深入此層，深度隨週期變化。', sub, { anchor: [AX + 1.3, 1.1, 0.7] });
    reg(G1, '固有層', 'Lamina propria', '上皮之下的<b>疏鬆結締組織</b>，含子宮腺。發情前期起水腫、充血而增厚；發情時可見<b>微量出血</b>（子宮出血 metrorrhagia）。', lp, { anchor: [AX + 1.3, 1.55, 0.7] });
    reg(G1, '子宮內膜上皮', 'Endometrial epithelium', '面向子宮腔的上皮細胞層（柱狀，具纖毛與分泌細胞）。', ep, { anchor: [AX + 1.3, 1.98, 0.7] });
    const GLS = [], rg = rnd(31);
    for (let k = 0; k < 9; k++) {
      const x0 = AX - 1.1 + k * 0.27, z0 = (rg() - 0.5) * 0.9, pts = [];
      for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push([x0 + 0.05 * Math.sin(t * 14 + k), 1.98 - t * 0.88, z0 + 0.05 * Math.cos(t * 14 + k)]); }
      const g = tube(pts, 0.03, GL); GLS.push(g);
      const e = pts[16];
      GLS.push(tube([[e[0], e[1] + 0.12, e[2]], [e[0] + 0.1, e[1] - 0.02, e[2] + 0.04], [e[0] + 0.13, e[1] - 0.1, e[2]]], 0.025, GL));
      GLS.push(tube([[e[0], e[1] + 0.2, e[2]], [e[0] - 0.1, e[1] + 0.05, e[2] - 0.03], [e[0] - 0.12, e[1] - 0.04, e[2]]], 0.025, GL));
    }
    ENDO.push(...GLS);
    reg(G1, '子宮腺', 'Uterine glands', '子宮內膜中<b>最重要的組織</b>：上皮的管狀凹陷，周壁由柱狀有纖毛及分泌細胞圍繞，屬<b>單分枝管腺</b>（simple branched tubular gland）。分泌「子宮乳」營養早期胚。遠端彎曲程度與穿入深度隨物種及<b>動情／月經週期</b>而變。', GLS, { anchor: [AX - 1.0, 1.5, 0.5] });
    const HEM = []; const rh = rnd(41);
    for (let k = 0; k < 14; k++) HEM.push(ell([AX + (rh() - 0.5) * 2.3, 1.3 + rh() * 0.6, (rh() - 0.5) * 1.2], [0.035, 0.035, 0.035], 0xc01020));
    const hemP = reg(G1, '固有層出血（發情時）', 'Metrorrhagia', '母牛發情時，內膜固有層的<b>微量出血</b>現象，並非月經（功能層並未脫落）。', HEM, { anchor: [AX + 0.6, 1.6, 0.6] });
    ENDO.push(...HEM);
    textSprite('子宮腔', [AX, 2.45, 0], 0.26, '#8fd0ff');
    textSprite('家畜子宮壁分層', [AX, 2.85, 0], 0.32);
    ENDO.forEach(m => m.userData.y0 = m.position.y);
    let estrus = true;
    window._uState = () => {
      estrus = !estrus; const k = estrus ? 1 : 0.55;
      ENDO.forEach(m => { m.position.y = 1.2 + (m.userData.y0 - 1.2) * k; m.scale.y = k; });
      ep.position.y = 1.2 + (ep.userData.y0 - 1.2) * k; ep.scale.y = 1;
      hemP.visible = estrus; rebuildList(); refresh();
      select(hemP.visible ? hemP : CUR.parts.find(p => p.zh === '子宮腺'));
      $('info').insertAdjacentHTML('afterbegin', `<div class="g" style="background:#7a5a10">目前：${estrus ? '發情期（內膜增厚、水腫充血、微量出血）' : '動情間期後期（黃體萎縮 → 內膜萎縮、腺體變短、停止分泌）'}</div>`);
    };

    // ===== B. 肉阜與胎盤瘤 =====
    const BX = 0.6;
    reg(G2, '肉阜間區內膜', 'Intercaruncular endometrium', '肉阜之間的內膜，<b>含子宮腺</b>（肉阜本身無腺體）。',
      [box([BX, 0.3, 0], [W, 0.6, Dp], LP, 0.6), ...[-1.0, -0.75, 0.75, 1.0].map(x => tube([[BX + x, 0.58, 0.2], [BX + x + 0.04, 0.35, 0.15], [BX + x, 0.12, 0.2]], 0.03, GL))], { anchor: [BX - 1.1, 0.3, 0.7] });
    const car = lathe([[0, 0.55], [0.3, 0.55], [0.3, 0.75], [0.62, 0.88], [0.7, 1.05], [0.6, 1.18], [0, 1.22]], 0xc0405a, 1, [BX, 0, 0]);
    const CRY = [];
    for (let k = 0; k < 18; k++) { const a = k * 2.4, r = 0.12 + (k % 6) * 0.08; CRY.push(ell([BX + Math.cos(a) * r, 1.2 - r * 0.25, Math.sin(a) * r], [0.035, 0.03, 0.035], 0x4a1020)); }
    reg(G2, '肉阜', 'Caruncle', '反芻獸子宮內側面貌似<b>洋菇</b>的<b>非腺體性突起</b>。由類似卵巢皮質的結締組織組成；固有層含纖維母細胞、<b>高度血管化，但無腺體</b>。', car, { anchor: [BX + 0.6, 0.85, 0.3] });
    reg(G2, '肉阜隱窩', 'Caruncular crypts', '肉阜表面很多<b>隱窩</b>可以容納胎盤絨毛膜的絨毛，故外貌呈<b>海綿狀</b>。', CRY, { anchor: [BX - 0.3, 1.2, 0.3] });
    const COT = [], rcz = rnd(51);
    const chor = box([BX, 1.55, 0], [W, 0.06, Dp], 0x9a7ac8, 0.85);
    const cap = lathe([[0, 1.5], [0.75, 1.5], [0.72, 1.35], [0.6, 1.25], [0, 1.22]], 0x8a5ab8, 0.5, [BX, 0, 0]);
    COT.push(cap);
    for (let k = 0; k < 16; k++) {
      const a = k * 2.4, r = 0.1 + (k % 5) * 0.11, x = BX + Math.cos(a) * r, z = Math.sin(a) * r;
      COT.push(tube([[x, 1.5, z], [x + (rcz() - 0.5) * 0.06, 1.3, z], [x, 1.1 - (0.3 - r * 0.3), z]], 0.022, 0x6a3a98));
    }
    reg(G2, '絨毛膜', 'Chorion', '胎兒胎膜的最外層，在肉阜對應處發育成絨毛葉。', chor, { anchor: [BX - 1.1, 1.55, 0.7] });
    reg(G2, '絨毛葉', 'Cotyledon', '絨毛膜的絨毛發育成<b>絨毛葉</b>，<b>侵入肉阜</b>的隱窩中。', COT, { anchor: [BX + 0.75, 1.45, 0.2] });
    const plac = ell([BX, 1.05, 0], [0.95, 0.65, 0.95], 0xffd479, 0.1);
    reg(G2, '胎盤瘤', 'Placentome', '<b>絨毛葉（胎兒）＋肉阜（母體）</b>＝胎盤瘤，是反芻獸子葉型胎盤的物質交換單位（牛約70–120個）。<b>馬與豬的子宮中無肉阜</b>。', plac, { anchor: [BX - 0.9, 1.05, 0.3] });
    textSprite('反芻獸：肉阜＋絨毛葉＝胎盤瘤', [BX, 2.45, 0], 0.3);
    let apart = false;
    window._cotToggle = () => {
      apart = !apart; const dy = apart ? 0.75 : 0;
      [chor, ...COT].forEach(m => { if (m.userData.b === undefined) m.userData.b = m.position.y; m.position.y = m.userData.b + dy; });
    };

    // ===== C. 靈長類內膜 =====
    const CX = 4.3, Lc = (y0, y1, col, o = 1) => box([CX, (y0 + y1) / 2, 0], [W, y1 - y0, Dp], col, o);
    reg(G3, '子宮肌層', 'Myometrium', '內膜下方的平滑肌層。', Lc(0, 0.4, MC), { anchor: [CX + 1.3, 0.2, 0.7] });
    reg(G3, '基底層', 'Stratum basalis', '內膜的下層（靠近肌層）。<b>行經期間不會脫落</b>；行經後其細胞增生以<b>補充失去的功能層</b>。', Lc(0.4, 0.72, 0xe0909a), { anchor: [CX + 1.3, 0.56, 0.7] });
    const spong = Lc(0.72, 1.55, 0xf2b0bc, 0.5), comp = Lc(1.55, 1.95, 0xf8c8d0, 0.75), epc = Lc(1.95, 2.0, EP);
    const PG = [], SA = [], rp = rnd(61);
    for (let k = 0; k < 7; k++) {
      const x0 = CX - 1.05 + k * 0.35, z0 = (rp() - 0.5) * 0.8, pts = [];
      for (let i = 0; i <= 20; i++) { const t = i / 20, y = 1.98 - t * 1.4, amp = y < 1.55 ? 0.08 : 0.01; pts.push([x0 + amp * Math.sin(t * 30), y, z0 + amp * Math.cos(t * 30)]); }
      PG.push(tube(pts, 0.03, GL));
    }
    for (let k = 0; k < 4; k++) {
      const x0 = CX - 0.9 + k * 0.6;
      SA.push(tube(helixAlong(new THREE.LineCurve3(V(x0 + 0.15, 0.4, 0.3), V(x0 + 0.15, 1.85, 0.3)), 0.06, 7, k, 160), 0.02, 0xd02828, 1, 2));
    }
    reg(G3, '功能層：緊密層', 'Stratum functionalis – compactum', '功能層（面對子宮腔）的<b>上層</b>，基質緻密，腺體較直。', comp, { anchor: [CX + 1.3, 1.75, 0.7] });
    reg(G3, '功能層：海綿層', 'Stratum functionalis – spongiosum', '功能層的<b>下層</b>，腺體<b>高度彎曲</b>、擴張，故呈海綿狀。', spong, { anchor: [CX + 1.3, 1.15, 0.7] });
    reg(G3, '上皮', 'Epithelium', '單層柱狀上皮。', epc, { anchor: [CX + 1.3, 1.98, 0.7] });
    reg(G3, '子宮腺（靈長類）', 'Uterine glands', '緊密層較直，海綿層彎曲；分泌期最為發達。', PG, { anchor: [CX - 1.05, 1.2, 0.3] });
    reg(G3, '螺旋動脈', 'Spiral arteries', '由基底層伸入功能層的螺旋狀小動脈；黃體退化、助孕酮下降時收縮 → 功能層缺血壞死而<b>脫落成為經血</b>。', SA, { anchor: [CX + 0.35, 1.5, 0.35] });
    const BLD = []; const rb = rnd(71);
    for (let k = 0; k < 16; k++) BLD.push(ell([CX + (rb() - 0.5) * 2.3, 0.78 + rb() * 0.12, (rb() - 0.5) * 1.2], [0.08, 0.05, 0.08], 0x9a0a1a));
    const bloodP = reg(G3, '經血（脫落的功能層）', 'Menstrual flow', '行經期間<b>功能層脫落排出</b>成為經血的一部分；基底層保留。', BLD, { anchor: [CX + 0.8, 0.85, 0.6], hidden: true });
    textSprite('靈長類內膜：功能層＋基底層', [CX, 2.45, 0], 0.3);
    let mens = false;
    window._mensToggle = () => {
      mens = !mens;
      const f = p => ['功能層：緊密層', '功能層：海綿層', '上皮', '子宮腺（靈長類）', '螺旋動脈'].includes(p.zh);
      CUR.parts.forEach(p => { if (f(p)) p.visible = !mens; });
      bloodP.visible = mens; rebuildList(); refresh(); select(mens ? bloodP : CUR.parts.find(p => p.zh === '基底層'));
    };
  }
});
