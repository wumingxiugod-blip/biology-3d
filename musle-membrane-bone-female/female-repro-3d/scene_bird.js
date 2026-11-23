/* 場景⑦：鳥類（母雞）雌性生殖系統——左側卵巢與輸卵管；右側退化 */
SCENES.push({
  name: '⑦ 鳥類(母雞)',
  title: '鳥類雌性生殖系統（產蛋母雞，左側觀）',
  camera: { pos: [-0.6, 1.2, 9.5], target: [-0.6, 0.0, 0] },
  controls: [
    { label: '▶ 蛋的形成動畫（排卵→產蛋）', fn() { window._eggPlay && window._eggPlay(); } },
    { label: '🦅 切換：奇異鳥／鷹類（兩側卵巢有功能）', fn() { window._bothOv && window._bothOv(); } },
    { label: '🔍 卵巢濾泡階層', fn() { flyTo([1.8, 0.5, 4.2], [1.8, 0.3, 0.3]); } },
    { label: '🔍 殼腺～泄殖腔', fn() { flyTo([-2.8, 0.2, 4], [-2.8, -0.1, 0.2]); } },
    { label: '🔍 背側觀（看右側退化）', fn() { flyTo([-0.6, 8.5, 1.5], [-0.6, 0, 0]); } }
  ],
  desc: `
  <p>左為<b>尾側</b>（泄殖腔），右為<b>頭側</b>；面向觀者為雞的<b>左側</b>。</p>
  <p><b>大部分鳥類只有左側卵巢與左側輸卵管</b>，右側在胚胎期即<b>退化</b>。少數鳥類（奇異鳥 kiwi、沼澤鵟、沼澤鷹、紅尾鵟）具<b>兩個有功能的卵巢</b>，但多半只有左側輸卵管有功能 → 右卵巢排出的卵掉入腹腔被吸收。近親配種可產生一卵巢二輸卵管的雞品系。</p>
  <p>雌鳥<b>沒有顯露在外的外生殖器</b>，只有輸尿管、結腸與生殖道共同的<b>泄殖腔</b>及其出口。</p>
  <table>
  <tr><th>輸卵管分區</th><th>長度</th><th>功能</th></tr>
  <tr><td>漏斗部</td><td>—</td><td>接卵、<b>受精部位</b>、分泌濃稠蛋白（繫帶層）</td></tr>
  <tr><td>蛋白分泌部</td><td>32–34 cm</td><td>分泌 <b>80% 以上卵白</b></td></tr>
  <tr><td>峽部</td><td>約 10 cm</td><td>分泌<b>蛋殼膜</b></td></tr>
  <tr><td>殼腺（子宮）</td><td>約 11 cm</td><td>加水（約15 g）、<b>鈣化蛋殼</b>、色素</td></tr>
  <tr><td>陰道</td><td>約 10 cm</td><td>S形，肌肉收縮排出蛋</td></tr>
  </table>
  <p>鳥類濾泡<b>無濾泡腔</b>、排卵後<b>不形成黃體</b>（雞的排卵後濾泡很少超過5日即退化）。</p>`,
  build() {
    const G1 = '卵巢（左側）', G2 = '輸卵管（左側）', G3 = '退化的右側', G4 = '泄殖腔與鄰近器官';
    const YK = 0xf5c400, OV = [1.7, 0.6, 0.15];
    const OVa = V(...OV);

    // ===== 卵巢 =====
    reg(G1, '卵巢基質', 'Ovarian stroma', '卵巢藉<b>卵巢系膜</b>附著到體壁，具有許多<b>嵌入結締組織基質</b>的濾泡。',
      [ell(OV, [0.38, 0.26, 0.24], 0xf0dcc0), ribbon([[OV[0] - 0.3, OV[1] + 0.2, OV[2] - 0.1], [OV[0] + 0.3, OV[1] + 0.2, OV[2] - 0.1]], [[OV[0] - 0.4, OV[1] + 0.55, -0.05], [OV[0] + 0.4, OV[1] + 0.55, -0.05]], 0x9be0b0, 0.35)],
      { anchor: [OV[0], OV[1] + 0.3, OV[2] + 0.1] });
    const HF = [['F1', 0.36, [0.45, -1, 0.65]], ['F2', 0.31, [-0.7, -1, 0.55]], ['F3', 0.27, [1, 0.15, 0.8]], ['F4', 0.23, [-1, 0.35, 0.75]], ['F5', 0.19, [0.25, 0.9, 0.9]], ['F6', 0.16, [-0.25, -0.2, 1]]];
    const FP = {};
    HF.forEach(([n, r, d]) => {
      const dir = V(...d).normalize(), c = OVa.clone().addScaledVector(dir, 0.22 + r + 0.06);
      FP[n] = { c, r };
      const ms = [ell(c.toArray(), [r, r, r], YK), cyl(OVa.clone().addScaledVector(dir, 0.2).toArray(), c.clone().addScaledVector(dir, -r * 0.9).toArray(), 0.035, 0xf0c8a0)];
      // 濾泡表面血管
      const rr = rnd(n.charCodeAt(1));
      for (let k = 0; k < 4; k++) {
        const pts = [], ax = V(rr() - 0.5, rr() - 0.5, rr() - 0.5).normalize(), b = V(0, 1, 0).cross(ax).normalize();
        for (let i = 0; i <= 14; i++) { const a = i / 14 * 2.2 + k; pts.push(c.clone().addScaledVector(ax, Math.cos(a) * r * 1.01).addScaledVector(b, Math.sin(a) * r * 1.01)); }
        ms.push(tube(pts, 0.006, 0xc03020));
      }
      const info = n === 'F1' ? '最大、<b>下一個被排卵</b>的濾泡。F1 排卵後，F2 就變成 F1，並在次日排卵，以此類推。' : '黃卵黃濾泡的階層之一（由大而小 F1～F6）。';
      reg(G1, '高階濾泡 ' + n, 'Hierarchical yellow follicle ' + n, '產蛋雞卵巢含 <b>5–7 個</b>一系列高階（hierarchy）黃卵黃濾泡，與幾千個較小濾泡。' + info + ' 濾泡內<b>充滿黃色卵黃、沒有濾泡腔</b>；卵黃先質由<b>肝臟</b>經濾泡膜血管運入。', ms, { anchor: c.clone().addScaledVector(dir, r * 0.5).toArray() });
    });
    // 泡裂徑
    const f1 = FP.F1, sg = new THREE.TorusGeometry(f1.r * 1.01, 0.022, 8, 24, 1.6); sg.rotateZ(-0.8);
    const stig = new THREE.Mesh(sg, mat(0xfff6c8)); stig.position.copy(f1.c); stig.rotation.y = -Math.PI / 2 + 0.5;
    reg(G1, '泡裂徑', 'Stigma', '大濾泡壁上佈滿血管，但有一條<b>顏色較淺、沒有血管分布</b>的條帶＝泡裂徑，是<b>濾泡破裂釋出卵的位置</b>。', stig, { anchor: f1.c.clone().add(V(0.2, 0.2, f1.r)).toArray() });
    const SY = [], LW = [], SW = [], rs = rnd(91);
    const onOv = (r, k) => { const d = V(rs() - 0.5, rs() - 0.5, rs() * 0.8 + 0.1).normalize(); return OVa.clone().add(V(d.x * 0.38, d.y * 0.26, d.z * 0.24)).addScaledVector(d, r * 0.5).toArray(); };
    for (let k = 0; k < 7; k++) SY.push(ell(onOv(0.07), [0.07, 0.07, 0.07], 0xf7d84a));
    for (let k = 0; k < 12; k++) LW.push(ell(onOv(0.035), [0.035, 0.035, 0.035], 0xf8f4ea));
    for (let k = 0; k < 26; k++) SW.push(ell(onOv(0.015), [0.016, 0.016, 0.016], 0xffffff));
    reg(G1, '小黃濾泡（5–10 mm）', 'Small yellow follicles', '小濾泡依直徑與卵黃顏色分類之一；陸續<b>補充高階濾泡</b>。', SY, { anchor: SY[0].position.toArray() });
    reg(G1, '大白濾泡（2–4 mm）', 'Large white follicles', '含白色卵黃的較小濾泡。', LW, { anchor: LW[0].position.toArray() });
    reg(G1, '小白濾泡（＜1 mm）', 'Small white follicles', '最小的濾泡，數以千計。<b>濾泡閉鎖通常發生在小濾泡</b>。', SW, { anchor: SW[0].position.toArray() });
    const pof = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16, 0, Math.PI * 2, 0.9, Math.PI - 0.9), mat(0xe8a0a0, 0.9));
    pof.position.set(OV[0] - 0.3, OV[1] + 0.35, OV[2] + 0.35); pof.rotation.x = -0.6;
    reg(G1, '排卵後濾泡', 'Postovulatory follicle', '排卵後殘留的濾泡組織（粒性細胞與濾泡膜細胞），只產生少量類固醇內泌素，<b>排卵後不久即退化</b>（雞很少超過5日），經<b>凋亡</b>被吸收。<b>鳥類濾泡不形成黃體</b>。', pof, { anchor: [OV[0] - 0.3, OV[1] + 0.45, OV[2] + 0.4] });
    const atG = new THREE.SphereGeometry(0.08, 20, 14), pa = atG.attributes.position;
    for (let i = 0; i < pa.count; i++) { const k = 1 + 0.2 * Math.sin(pa.getX(i) * 90) * Math.cos(pa.getY(i) * 90); pa.setXYZ(i, pa.getX(i) * k, pa.getY(i) * k, pa.getZ(i) * k); }
    atG.computeVertexNormals(); const atr = new THREE.Mesh(atG, mat(0xd8c890)); atr.position.set(OV[0] + 0.35, OV[1] + 0.3, OV[2] + 0.25);
    reg(G1, '閉鎖濾泡', 'Atretic follicle', '閉鎖多見於小濾泡；高階層濾泡閉鎖只在因疾病或逆境<b>突然停止產蛋</b>時發生。', atr);
    reg(G1, '濾泡壁層次（說明）', 'Follicle wall layers', '由內而外：①<b>卵黃周層</b>（perivitelline layer，結構性纖維網，支持大量卵黃）②<b>粒性細胞</b>（小濾泡多層；排卵前成單層方形，細胞間空隙形成<b>卵黃運輸通道</b>）③基底膜 ④<b>濾泡內膜</b>（產類固醇的濾泡膜細胞）⑤濾泡外膜與結締組織（血管化良好）。',
      (() => { const g = []; const c = FP.F2.c, r = FP.F2.r; [[1.0, 0xfff3b0], [1.04, 0xf2c36b], [1.08, 0xe0956a], [1.12, 0xc77a6a]].forEach(([k, col]) => { const m = shell(r * k, [1, 1, 1], col, 0.9, Math.PI * 0.35, Math.PI * 0.3, 0.6, 0.9); m.position.copy(c); g.push(m); }); return g; })(),
      { anchor: FP.F2.c.clone().add(V(0, -0.2, FP.F2.r)).toArray() });

    // ===== 輸卵管 =====
    const inf = V(1.25, -0.55, 0.55), infDir = f1.c.clone().sub(inf).normalize();
    const FIM = [], q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), infDir);
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * Math.PI * 2, rim = V(Math.cos(a) * 0.3, 0.3, Math.sin(a) * 0.3).applyQuaternion(q).add(inf);
      const tip = V(Math.cos(a) * 0.4, 0.42, Math.sin(a) * 0.4).applyQuaternion(q).add(inf);
      FIM.push(tube([rim, tip], 0.02, 0xf4b0a0));
    }
    reg(G2, '漏斗部：繖部', 'Infundibulum – fimbriated part', '漏斗部位於卵巢後方，收集排出的卵，並且是<b>鳥類受精作用發生的位置</b>。繖部（音同傘）膜壁很薄，內襯具纖毛的非分泌細胞；排卵時肌肉收縮增強，像<b>嘴唇一樣吞噬</b>排出的卵。',
      [lathe([[0.07, 0], [0.12, 0.1], [0.22, 0.22], [0.3, 0.3]], 0xf7c8b0, 0.6, inf.toArray(), infDir.toArray()), ...FIM], { anchor: inf.clone().addScaledVector(infDir, 0.3).add(V(0, 0, 0.3)).toArray() });
    const neck = [inf.toArray(), [1.15, -0.8, 0.55], [1.0, -0.9, 0.55]];
    reg(G2, '漏斗部：管狀部', 'Infundibulum – tubular part (chalaziferous region)', '管壁較厚、黏膜皺褶較多、分泌細胞較多；含<b>管狀腺</b>，分泌<b>濃稠蛋白</b>圍繞卵黃（形成卵黃膜外圍蛋白／繫帶）。肌肉為內環外縱。', tube(neck, 0.09, 0xf5d8c0), { anchor: [1.12, -0.85, 0.65] });
    const mBase = new THREE.CatmullRomCurve3(PV([[1.0, -0.9, 0.55], [0.3, -1.0, 0.6], [-0.4, -0.95, 0.6], [-0.95, -0.7, 0.55]]));
    const magPts = helixAlong(mBase, 0.2, 5, 0, 360);
    magPts[0] = V(1.0, -0.9, 0.55); magPts[magPts.length - 1] = V(-0.95, -0.7, 0.55);
    reg(G2, '蛋白分泌部', 'Magnum (albumen-secreting region)', '成年雞長 <b>32–34 cm</b>，白色、<b>高度捲曲</b>，管壁很厚：15–22 條縱行一級黏膜皺摺與少數螺旋二級皺褶；內襯纖毛細胞與杯狀細胞，<b>管狀腺為數最多</b>。分泌卵白蛋白、溶菌酶、卵輸鐵蛋白、伴卵白蛋白、類卵黏液蛋白 → <b>80% 以上卵白的來源</b>。', tube(magPts, 0.13, 0xf6f4ee, 1, 1), { anchor: [0.1, -1.15, 0.9] });
    reg(G2, '峽部透明區', 'Translucent zone', '以一個<b>不含管狀腺的狹窄透明區</b>與蛋白分泌部相隔。', ring(V(-0.97, -0.69, 0.55), V(-1, 0.35, 0), 0.13, 0.04, 0xd8f0ff, 0.8), { anchor: [-0.97, -0.55, 0.65] });
    const isth = [[-0.98, -0.68, 0.55], [-1.3, -0.5, 0.5], [-1.62, -0.38, 0.45]];
    reg(G2, '峽部', 'Isthmus', '成年雞約 <b>10 cm</b>，具厚的環狀肌肉層，腺體較蛋白分泌部不發達。管狀腺分泌細胞分泌<b>蛋殼膜的纖維核心</b>，上皮分泌細胞分泌纖維核心的塗層（內、外殼膜）。<b>蛋殼的形成在峽部遠端就已開始</b>。', ttube(isth, 0.11, 0xe8c8a8), { anchor: [-1.3, -0.35, 0.55] });
    const SGc = [-2.15, -0.38, 0.42];
    reg(G2, '殼腺（子宮）', 'Shell gland (uterus)', '成雞長約 <b>11 cm</b>，<b>很厚的肌肉壁</b>、顯著縱行肌層，內襯管狀腺與杯狀細胞。鈣化之前蛋從管狀腺攝取約 <b>15 g 液體</b>（含碳酸酐酶、酸性磷酸酶、酯酶、重碳酸鹽與離子）進入卵白；之後<b>鈣化形成蛋殼</b>；色素在產蛋前不久由無纖毛細胞沉積。蛋停留約20小時。', ell(SGc, [0.58, 0.44, 0.42], 0xd88a8a, 0.4), { anchor: [-2.15, 0.08, 0.42] });
    const eggStatic = [ell(SGc, [0.4, 0.29, 0.29], 0xd9a066)];
    const eggP = reg(G2, '蛋（殼腺內）', 'Egg in shell gland', '在殼腺中完成鈣化的蛋：卵黃 → 卵白 → 殼膜 → 蛋殼。', eggStatic, { anchor: [SGc[0] - 0.2, SGc[1] - 0.15, SGc[2] + 0.3] });
    const UVJ = V(-2.74, -0.28, 0.38);
    const SST = [ring(UVJ, V(1, 0.1, 0), 0.11, 0.045, 0xb04060)];
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; SST.push(tube([UVJ.clone().add(V(0, Math.cos(a) * 0.08, Math.sin(a) * 0.08)), UVJ.clone().add(V(-0.02, Math.cos(a) * 0.17, Math.sin(a) * 0.17))], 0.012, 0x70b8ff)); }
    reg(G2, '子宮陰道括約肌', 'Uterovaginal sphincter', '分隔殼腺與陰道的括約肌。', SST[0], { anchor: [UVJ.x, UVJ.y - 0.18, UVJ.z + 0.1] });
    reg(G2, '精子儲存細管', 'Sperm storage tubules (sperm host glands)', '位於殼腺後方與陰道前方之間約 <b>2–5 mm 的窄帶</b>（宮陰交接處），黏膜排成三個環狀皺褶，管狀腺<b>接受並庇護精子</b>。母雞約有 <b>25,000 個</b>，每個含數個至數百個精子 → 配種或人工授精後 <b>2–4 週</b>仍可產受精蛋。', SST.slice(1), { anchor: [UVJ.x, UVJ.y + 0.2, UVJ.z + 0.1] });
    const vagP = [UVJ.toArray(), [-2.92, -0.05, 0.33], [-3.1, -0.28, 0.25], [-3.28, -0.02, 0.15], [-3.45, 0.02, 0.06]];
    reg(G2, '陰道', 'Vagina', '短而呈 <b>S 形</b>，成雞約 <b>10 cm</b>，終止於泄殖腔。縱行肌與發育良好的環行肌收縮<b>促進蛋排出</b>。黏膜皺褶低而窄，內襯纖毛與無纖毛細胞（分泌酸性黏多醣），固有層<b>無腺體</b>。', tube(vagP, 0.08, 0xe0a0b0), { anchor: [-3.1, -0.4, 0.3] });

    // ===== 退化的右側 =====
    const rOv = reg(G3, '右卵巢（退化）', 'Right ovary (regressed)', '大部分鳥類右卵巢在胚胎期<b>退化</b>，只殘留痕跡。', ell([1.7, 0.6, -0.32], [0.16, 0.05, 0.06], 0xbdb5a8), { anchor: [1.7, 0.66, -0.35] });
    reg(G3, '右輸卵管殘跡', 'Vestigial right oviduct', '右側輸卵管退化，常只在泄殖腔附近留下小囊狀殘跡。',
      [tube([[-3.45, 0.05, -0.15], [-3.15, 0.1, -0.3], [-2.9, 0.12, -0.35]], 0.04, 0xc8a8b0), ell([-2.85, 0.12, -0.36], [0.08, 0.06, 0.06], 0xc8a8b0, 0.8)], { anchor: [-3.0, 0.15, -0.35] });
    const ROF = [];
    [[0.24, [0.3, -1, -0.6]], [0.2, [-0.6, -0.6, -0.8]], [0.15, [0.6, 0.4, -0.9]], [0.11, [-0.4, 0.5, -1]]].forEach(([r, d]) => {
      const dir = V(...d).normalize(), c = V(1.7, 0.6, -0.4).addScaledVector(dir, 0.2 + r); ROF.push(ell(c.toArray(), [r, r, r], YK));
    });
    ROF.push(ell([1.7, 0.6, -0.4], [0.3, 0.2, 0.18], 0xf0dcc0));
    const rFun = reg(G3, '右卵巢（具功能：奇異鳥、鷹類）', 'Functional right ovary (kiwi, hawks)', '奇異鳥、沼澤鵟、沼澤鷹、紅尾鵟等具<b>兩個有功能的卵巢</b>；但大多只有<b>左側輸卵管</b>有功能。', ROF, { anchor: [1.7, 0.2, -0.8], hidden: true });
    const dropEgg = ell([1.7, -0.1, -0.7], [0.12, 0.12, 0.12], YK, 0.9);
    const rDrop = reg(G3, '右側排出的卵（落入腹腔）', 'Ovum from right ovary', '右側無功能輸卵管 → 右卵巢排出的卵<b>掉到腹腔，最後被吸收</b>。', dropEgg, { anchor: [1.7, -0.3, -0.7], hidden: true });

    // ===== 泄殖腔與鄰近器官 =====
    reg(G4, '泄殖腔', 'Cloaca', '輸尿管、結腸（直腸）與生殖道（陰道）的<b>共同腔室</b>。雌鳥沒有顯露在外的外生殖器。', ell([-3.62, 0.05, 0], [0.36, 0.3, 0.3], 0xb98aa8, 0.4), { anchor: [-3.62, 0.38, 0.1] });
    reg(G4, '泄殖腔口', 'Vent', '泄殖腔的出口；產蛋時陰道外翻經此排出蛋，使蛋不接觸糞便。', ring(V(-3.98, 0.02, 0), V(1, 0, 0), 0.1, 0.035, 0x6a3a50));
    reg(G4, '結腸／直腸', 'Colon / rectum', '開口於泄殖腔。', ttube([[1.2, 0.05, -0.15], [0, 0.15, -0.15], [-2.0, 0.25, -0.1], [-3.4, 0.12, -0.02]], 0.12, 0x7a8a5a, 0.35), { anchor: [-1.0, 0.3, -0.1] });
    reg(G4, '腎臟', 'Kidneys', '位於背側（雞的腎臟分三葉），卵巢位於左腎頭端腹側。', [1, -1].map(s => ell([0.2, 0.95, s * 0.28], [1.2, 0.16, 0.16], 0x8a4a3a, 0.55)), { anchor: [0.2, 1.1, 0.28] });
    reg(G4, '輸尿管', 'Ureters', '由腎臟走向泄殖腔。', [1, -1].map(s => tube([[-0.9, 0.9, s * 0.28], [-2.5, 0.6, s * 0.2], [-3.45, 0.15, s * 0.05]], 0.016, 0xf3e6a0)), { anchor: [-2.3, 0.62, 0.22] });

    // ===== 切換：雙側卵巢 =====
    let both = false, dropT = 0;
    window._bothOv = () => {
      both = !both; rOv.visible = !both; rFun.visible = both; rDrop.visible = both; dropT = 0;
      rebuildList(); refresh(); select(both ? rFun : rOv);
    };

    // ===== 蛋的形成動畫 =====
    const eggG = new THREE.Group(); CUR.root.add(eggG); eggG.visible = false;
    const yolk = ell([0, 0, 0], [0.14, 0.14, 0.14], YK), alb = ell([0, 0, 0], [1, 1, 1], 0xffffff, 0.35), memb = ell([0, 0, 0], [1, 1, 1], 0xf5f0e0, 0.55), shl = ell([0, 0, 0], [1, 1, 1], 0xd9a066, 1);
    eggG.add(yolk, alb, memb, shl);
    const seg = [
      { n: '排卵', c: new THREE.CatmullRomCurve3([f1.c.clone(), f1.c.clone().lerp(inf, 0.5), inf.clone()]), w: 0.06, t: 'F1 沿<b>泡裂徑</b>破裂，卵被<b>繖部</b>吞入。' },
      { n: '漏斗部', c: new THREE.CatmullRomCurve3(PV(neck)), w: 0.07, t: '漏斗部（約15–30分鐘）：<b>受精</b>發生於此；管狀部分泌濃稠蛋白（繫帶）。' },
      { n: '蛋白分泌部', c: new THREE.CatmullRomCurve3(magPts), w: 0.3, t: '蛋白分泌部（約3小時）：管狀腺分泌<b>卵白</b>（80%以上）。' },
      { n: '峽部', c: new THREE.CatmullRomCurve3(PV(isth)), w: 0.12, t: '峽部（約1–1.5小時）：形成<b>內、外蛋殼膜</b>。' },
      { n: '殼腺', c: new THREE.CatmullRomCurve3([V(...isth[2]), V(...SGc), V(...SGc).add(V(-0.25, 0.02, 0)), UVJ.clone()]), w: 0.35, t: '殼腺（約20小時）：吸入約15 g 液體（「膨脹」），然後<b>鈣化成蛋殼</b>並沉積色素。' },
      { n: '陰道', c: new THREE.CatmullRomCurve3(PV([...vagP, [-3.95, 0.02, 0.0], [-4.4, -0.1, 0.0]])), w: 0.1, t: '陰道（數分鐘）：肌肉收縮，經<b>泄殖腔</b>產出。' }
    ];
    let playing = false, t0 = 0, lastSeg = -1; const DUR = 22000;
    window._eggPlay = () => { playing = true; t0 = performance.now(); lastSeg = -1; eggG.visible = true; eggP.visible = false; rebuildList(); refresh(); };
    CUR.tick = () => {
      if (both && rDrop.visible) { dropT = (dropT + 0.006) % 1; dropEgg.position.y = -0.1 - dropT * 1.3; dropEgg.material.opacity = 0.9 * (1 - dropT); dropEgg.scale.setScalar(0.12 * (1 - dropT * 0.6)); }
      if (!playing) return;
      let u = (performance.now() - t0) / DUR;
      if (u >= 1) { playing = false; eggG.visible = false; eggP.visible = true; rebuildList(); refresh(); $('info').insertAdjacentHTML('afterbegin', '<div class="g" style="background:#2f7f3f">✅ 產蛋完成（全程約 24–26 小時）</div>'); return; }
      let acc = 0, i = 0; while (i < seg.length - 1 && u > acc + seg[i].w) { acc += seg[i].w; i++; }
      const k = Math.min(1, (u - acc) / seg[i].w), S = seg[i];
      eggG.position.copy(S.c.getPointAt(k));
      const albK = i < 2 ? 0 : i === 2 ? k : 1, memK = i < 3 ? 0 : i === 3 ? k : 1, shK = i < 4 ? 0 : i === 4 ? Math.max(0, (k - 0.3) / 0.6) : 1;
      alb.visible = albK > 0; alb.scale.set(0.14 + 0.24 * albK, 0.14 + 0.15 * albK, 0.14 + 0.15 * albK);
      memb.visible = memK > 0; memb.scale.set(0.39, 0.3, 0.3); memb.material.opacity = 0.55 * memK;
      shl.visible = shK > 0; shl.scale.set(0.41, 0.31, 0.31); shl.material.opacity = Math.min(1, shK); shl.material.transparent = shK < 1;
      if (i !== lastSeg) { lastSeg = i; $('info').innerHTML = `<h3>🥚 ${S.n}</h3><div class="en">Egg formation ${i + 1}/${seg.length}</div><div class="t">${S.t}</div>`; }
    };
  }
});
