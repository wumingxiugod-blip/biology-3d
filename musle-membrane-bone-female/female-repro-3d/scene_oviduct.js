/* 場景④：輸卵管——分段、橫切面、上皮細胞、卵巢囊型式 */
SCENES.push({
  name: '④ 輸卵管',
  title: '輸卵管：漏斗→壺部→峽部→宮管接合',
  camera: { pos: [-0.2, -0.3, 13], target: [-0.2, -0.4, 0] },
  controls: [
    { label: '🔍 輸卵管分段＋橫切面', fn() { flyTo([-2.4, 0.5, 7], [-2.4, 0.5, 0]); } },
    { label: '🔍 上皮細胞', fn() { flyTo([-3.0, -2.4, 4.2], [-3.0, -2.6, 0]); } },
    { label: '🔍 卵巢囊型式', fn() { flyTo([3.4, 0.4, 6], [3.4, 0.3, 0]); } }
  ],
  desc: `
  <p>輸卵管（oviduct）左右成對、非常彎曲（此處拉直示意），依外觀分為<b>漏斗（繖部）、壺部、峽部</b>三部分，經<b>宮管接合</b>接子宮角。</p>
  <table>
  <tr><th></th><th>壺部</th><th>峽部</th></tr>
  <tr><td>長度</td><td>約全長一半</td><td>較短</td></tr>
  <tr><td>管徑／管壁</td><td>粗、壁薄</td><td>細、<b>壁厚</b></td></tr>
  <tr><td>黏膜皺褶</td><td><b>最突出、多分枝</b></td><td>較少</td></tr>
  <tr><td>功能</td><td><b>受精部位</b></td><td>精子貯存、調控</td></tr>
  </table>
  <p>管壁：<b>黏膜</b>（上皮＋基底膜＋固有層）、<b>肌膜</b>（外縱、內環／螺旋，厚度自卵巢端向子宮端<b>漸增</b>）、<b>漿膜</b>（單層方形中皮＋薄結締組織）。</p>
  <p>上皮：纖毛細胞、分泌性細胞、插入細胞；<b>無其他腺體、無杯狀細胞</b>。濾泡期細胞高、纖毛細胞多；黃體期細胞低、分泌細胞多。</p>
  <p>合子進入子宮前需在輸卵管駐留<b>一兩日</b>；只有<b>兔卵</b>通過時會獲得一層多醣分泌層。</p>`,
  build() {
    const Y = 1.4, TB = 0xf5d77e, MU = 0xd98a6a, MC = 0xc46a50, ML = 0xe0a080, SE = 0xf6eedc, EP = 0xfff2a8;
    const G1 = '輸卵管分段', G2 = '管壁橫切面', G3 = '上皮細胞', G4 = '卵巢囊型式';
    // 黏膜皺褶柱（沿 x 擠出的星形）
    const foldRod = (x0, x1, rIn, n, depth, branch, col) => {
      const s = new THREE.Shape(), N = 240;
      for (let i = 0; i <= N; i++) {
        const t = i / N * Math.PI * 2;
        const f = Math.pow(Math.max(0, Math.cos(n * t)), 2) + branch * Math.pow(Math.max(0, Math.cos(n * 3 * t + 0.6)), 4);
        const r = rIn * (1 - depth) + rIn * depth * Math.min(1, f);
        const p = [Math.cos(t) * r, Math.sin(t) * r];
        i ? s.lineTo(...p) : s.moveTo(...p);
      }
      const g = new THREE.ExtrudeGeometry(s, { depth: x1 - x0, bevelEnabled: false, curveSegments: 4 });
      const m = new THREE.Mesh(g, mat(col, 0.95)); m.rotation.y = Math.PI / 2; m.position.set(x0, Y, 0); return m;
    };

    // ===== 分段 =====
    const fc = V(-4.65, Y, 0), dir = V(-1, 0, 0);
    const FIM = [], q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir);
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2, rim = V(Math.cos(a) * 0.55, 0.45, Math.sin(a) * 0.55).applyQuaternion(q).add(fc);
      const tip = V(Math.cos(a + 0.15) * 0.78, 0.7, Math.sin(a + 0.15) * 0.78).applyQuaternion(q).add(fc);
      FIM.push(tube([rim, rim.clone().lerp(tip, 0.5).add(V(0, 0.03 * Math.sin(k * 3), 0)), tip], 0.035, 0xf4a87c));
    }
    reg(G1, '漏斗（輸卵管漏斗）', 'Infundibulum', '輸卵管近端外展成漏斗，<b>管壁薄</b>。排卵時運動增加，可「撿取」卵（甚至對側卵巢排出的卵）。漏斗只在卵巢頂極有附著，其餘部分不附著於卵巢。',
      lathe([[0.13, 0], [0.2, 0.12], [0.38, 0.32], [0.55, 0.45]], 0xf7c890, 0.6, fc.toArray(), dir.toArray()), { anchor: [-4.8, Y + 0.45, 0] });
    reg(G1, '輸卵管繖', 'Fimbriae tubae uterinae', '漏斗邊緣不規則的<b>指狀皺褶</b>。', FIM, { anchor: [-5.3, Y - 0.6, 0] });
    reg(G1, '輸卵管腹口', 'Ostium abdominale', '漏斗中央的出口，通入輸卵管管腔。', ring(V(-4.66, Y, 0), dir, 0.13, 0.025, 0x6a3a2a), { anchor: [-4.66, Y, 0.15] });
    reg(G1, '輸卵管壺部', 'Ampulla tubae uterinae', '約占全長<b>一半</b>；卵通過需時頗久，<b>受精作用發生在壺部</b>。黏膜皺褶<b>最突出且分枝</b>，分泌性細胞最豐富（約50%）。',
      [ttube([[-4.6, Y, 0], [-3.4, Y + 0.04, 0], [-2.2, Y, 0]], 0.3, TB, 0.3), foldRod(-4.55, -2.25, 0.25, 6, 0.75, 0.8, 0xf2a8a0)], { anchor: [-3.4, Y + 0.32, 0] });
    reg(G1, '輸卵管峽部', 'Isthmus tubae uterinae', '壺部向後自然延續（無明顯界線），<b>較短、管壁較厚</b>、縱行黏膜皺摺較少。',
      [ttube([[-2.2, Y, 0], [-1.4, Y, 0], [-0.62, Y, 0]], t => 0.3 - 0.12 * Math.min(1, t * 4), 0xe9b860, 0.55), foldRod(-2.15, -0.65, 0.1, 4, 0.6, 0, 0xf2a8a0)], { anchor: [-1.4, Y + 0.22, 0] });
    reg(G1, '宮管接合', 'Uterotubal junction', '峽部與子宮角相接處。無明顯括約肌（母豬有指狀黏膜突出）。<b>豬</b>：收縮阻礙精子 → 防止<b>多精入卵</b>；<b>牛、綿羊</b>：極顯著的彎曲／「扭結」，阻止胚移動，動情素下降時拉直。',
      ring(V(-0.5, Y, 0), V(1, 0, 0), 0.17, 0.06, 0xd4708a), { anchor: [-0.5, Y + 0.25, 0] });
    reg(G1, '子宮角（尖端）', 'Uterine horn (tip)', '輸卵管峽部直接連接子宮角。',
      ttube([[-0.42, Y, 0], [0.2, Y, 0], [0.75, Y, 0]], [0.18, 0.38], 0xe88aa0, 0.5), { anchor: [0.3, Y + 0.35, 0] });
    reg(G1, '合子（受精卵）', 'Zygote', '受精後新形成的合子，在進入子宮前必須<b>駐留在輸卵管內一兩日</b>；由平滑肌蠕動與纖毛擺動向子宮移動。',
      [ell([-3.2, Y, 0.0], [0.1, 0.1, 0.1], 0xfbefb0), shell(0.13, [1, 1, 1], 0xffffff, 0.45, 0, Math.PI * 2)], { anchor: [-3.2, Y - 0.1, 0.12] });
    CUR.parts[CUR.parts.length - 1].meshes[1].position.set(-3.2, Y, 0);
    textSprite('卵巢端 →→→→→ 子宮端', [-2.3, Y + 0.85, 0], 0.26, '#8fd0ff');

    // ===== 橫切面 =====
    const section = (cx, cy, R, mT, n, depth, branch, name) => {
      const rm = R - 0.05 - mT, m = [];
      const at = (mesh) => { mesh.position.set(cx, cy, 0); return mesh; };
      m.serosa = at(annulus(R, R - 0.05, 0.05, SE));
      m.lon = at(annulus(R - 0.05, R - 0.05 - mT * 0.4, 0.06, ML));
      m.cir = at(annulus(R - 0.05 - mT * 0.4, rm, 0.06, MC));
      const s = new THREE.Shape(); s.absarc(0, 0, rm, 0, Math.PI * 2, false);
      const pts = [], N = 300;
      for (let i = 0; i < N; i++) {
        const t = i / N * Math.PI * 2;
        const f = Math.pow(Math.max(0, Math.cos(n * t)), 2) + branch * Math.pow(Math.max(0, Math.cos(n * 3 * t + 0.6)), 4);
        const r = rm * (0.93 - depth * Math.min(1, f));
        pts.push(new THREE.Vector2(Math.cos(t) * r, Math.sin(t) * r));
      }
      s.holes.push(new THREE.Path(pts));
      m.muc = at(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: false, curveSegments: 48 }), mat(0xf2a8a0)));
      m.epi = ttube(pts.map(p => [cx + p.x, cy + p.y, 0.075]), 0.012, EP, 1, { closed: true, cap: false, radial: 6, seg: 400 });
      textSprite(name, [cx, cy - R - 0.25, 0], 0.24);
      return m;
    };
    const S1 = section(-4.6, -0.35, 0.55, 0.06, 5, 0.45, 0, '漏斗部切面');
    const S2 = section(-3.2, -0.35, 0.75, 0.1, 7, 0.75, 1.0, '壺部切面');
    const S3 = section(-1.5, -0.35, 0.55, 0.22, 5, 0.5, 0, '峽部切面');
    const S = [S1, S2, S3];
    reg(G2, '漿膜', 'Serosa', '最外層：<b>單層方形上皮（中皮）</b>覆蓋在一薄層結締組織上。', S.map(s => s.serosa), { anchor: [-3.2, -0.35 + 0.75, 0.05] });
    reg(G2, '縱行肌層（外）', 'Longitudinal muscle (outer)', '肌膜外層的縱行平滑肌。', S.map(s => s.lon), { anchor: [-1.5 + 0.5, -0.35 - 0.15, 0.06] });
    reg(G2, '環行／螺旋肌層（內）', 'Circular / spiral muscle (inner)', '肌膜內層的環行或螺旋狀平滑肌。肌層厚度<b>自卵巢端向子宮角端逐漸增加</b>（比較壺部與峽部）。平滑肌<b>蠕動或波浪狀收縮</b>，將卵或受精卵向子宮移動。', S.map(s => s.cir), { anchor: [-1.5 - 0.35, -0.35 + 0.25, 0.06] });
    reg(G2, '黏膜皺褶（固有層）', 'Mucosal folds (lamina propria)', '輸卵管腔由<b>多重皺褶的黏膜</b>圍繞而成；皺褶在<b>壺部最突出、分枝最多</b>，越靠近子宮越小。黏膜＝上皮＋基底膜＋固有層。', S.map(s => s.muc), { anchor: [-3.2 + 0.3, -0.35 + 0.3, 0.07] });
    reg(G2, '黏膜上皮', 'Epithelium', '單層柱狀上皮，含纖毛細胞、分泌性細胞與插入細胞（見下方細胞模型）。', S.map(s => s.epi), { anchor: [-4.6 + 0.2, -0.35, 0.08] });

    // ===== 上皮細胞 =====
    const Y0 = -2.75, cells = 'CSCPCCSCSPCSC';
    const CIL = [], SEC = [], PEG = [], CIN = [], SGR = [];
    let x = -4.9;
    for (const t of cells) {
      if (t === 'C') {
        const w = 0.26, h = 0.78; CIL.push(box([x + w / 2, Y0 + h / 2, 0], [w * 0.96, h, 0.3], 0xbfe0f0));
        CIN.push(ell([x + w / 2, Y0 + h * 0.5, 0.1], [0.08, 0.1, 0.08], 0xd8ccf0));
        for (let k = 0; k < 6; k++) CIL.push(cyl([x + 0.03 + k * 0.04, Y0 + h, 0.05 - (k % 2) * 0.1], [x + 0.03 + k * 0.04 + 0.02 * Math.sin(k), Y0 + h + 0.22, 0.05 - (k % 2) * 0.1], 0.006, 0xffffff));
        x += w;
      } else if (t === 'S') {
        const w = 0.17, h = 0.82; SEC.push(box([x + w / 2, Y0 + h / 2, 0], [w * 0.96, h, 0.3], 0xf0d0a0));
        SEC.push(ell([x + w / 2, Y0 + h * 0.35, 0.1], [0.06, 0.09, 0.06], 0x7a4fa0));
        for (let k = 0; k < 5; k++) SGR.push(ell([x + 0.04 + (k % 3) * 0.045, Y0 + h - 0.06 - Math.floor(k / 3) * 0.06, 0.12], [0.022, 0.022, 0.022], 0xc0508a));
        x += w;
      } else {
        const w = 0.07, h = 0.76; PEG.push(box([x + w / 2, Y0 + h / 2, 0], [w * 0.96, h, 0.3], 0x8a6aa8));
        PEG.push(ell([x + w / 2, Y0 + h * 0.45, 0.1], [0.03, 0.12, 0.05], 0x40285a));
        x += w;
      }
    }
    const xm = (-4.9 + x) / 2, ww = x + 4.9;
    reg(G3, '纖毛細胞', 'Ciliated cell', '特徵：<b>淡染的細胞核</b>與突入管腔的長而細的纖毛；纖毛運動<b>將液體掃向子宮</b>。比例由<b>喇叭口端向子宮端逐漸降低</b>。濾泡期較多。', [...CIL, ...CIN], { anchor: [-4.77, Y0 + 0.95, 0] });
    reg(G3, '分泌性細胞', 'Secretory (non-ciliated) cell', '高度與纖毛細胞相似但<b>較狹窄</b>，頂部含<b>分泌顆粒</b>。分佈整個輸卵管、<b>壺部最多（約50%）</b>。分泌黏液形成薄膜，<b>提供營養</b>給卵或受精卵、維持精子功能並促進<b>精子獲能</b>。黃體期居多。', [...SEC, ...SGR], { anchor: [-4.55, Y0 + 0.82, 0] });
    reg(G3, '插入細胞', 'Peg (intercalary) cell', '罕見、<b>細胞質極少</b>的小型細胞，見於纖毛細胞與分泌性細胞之間；被認為是<b>無功能的分泌性細胞</b>、分泌性細胞的先驅細胞。', PEG, { anchor: [-4.1, Y0 + 0.5, 0.16] });
    reg(G3, '基底膜', 'Basement membrane', '上皮與固有層之間。', box([xm, Y0 - 0.02, 0], [ww, 0.04, 0.32], 0xffffff), { anchor: [xm + 1.0, Y0 - 0.02, 0.16] });
    reg(G3, '固有層', 'Lamina propria', '上皮下的結締組織，含血管；<b>輸卵管無其他腺體、也無杯狀細胞</b>。', box([xm, Y0 - 0.3, 0], [ww, 0.52, 0.32], 0xf2b8b0, 0.9), { anchor: [xm, Y0 - 0.35, 0.16] });
    textSprite('↑ 管腔（纖毛將液體掃向子宮）', [x + 1.5, Y0 + 0.9, 0], 0.22, '#8fd0ff');

    // ===== 卵巢囊型式 =====
    const OVC = 0xf2e2c8, BU = 0x8fc7e0;
    const mini = (cx, cy, name, en, info, bursa) => {
      const ov = ell([cx, cy, 0], [0.32, 0.22, 0.22], OVC);
      const tubeM = tube([[cx - 0.5, cy + 0.45, 0], [cx - 0.1, cy + 0.6, 0.1], [cx + 0.5, cy + 0.55, 0.0], [cx + 0.7, cy + 0.1, 0]], 0.05, TB);
      reg(G4, name, en, info, [ov, tubeM, ...bursa], { anchor: [cx, cy - 0.45, 0] });
      textSprite(name, [cx, cy - 0.85, 0], 0.22);
    };
    mini(2.5, 1.2, '牛、兔、綿羊：不包圍', 'No ovarian bursa covering', '漏斗只與同側卵巢極為接近，<b>不覆蓋卵巢</b>（卵巢囊淺而開放）。',
      [lathe([[0.06, 0], [0.12, 0.08], [0.24, 0.18]], 0xf7c890, 0.8, [cx2(2.5), 1.2 + 0.3, 0], [0.4, -1, 0])]);
    function cx2(v) { return v - 0.42; }
    const bShell = (cx, cy, ts, tl, ps, pl, o = 0.35) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 20, ps, pl, ts, tl), mat(BU, o)); m.position.set(cx, cy, 0); m.scale.set(1, 0.85, 0.85); return m; };
    mini(4.4, 1.2, '豬：發達、開放', 'Sow: well-developed open bursa', '豬的卵巢囊<b>很發達</b>，雖然開放，但仍包圍卵巢的大部分。',
      [bShell(4.4, 1.2, 0.9, Math.PI - 0.9, 0, Math.PI * 2)]);
    mini(2.5, -0.85, '犬、狐、水貂：有裂隙', 'Dog / fox / mink: slit', '卵巢囊壁上有一<b>裂隙</b>，大小剛好可以容許卵巢通過。',
      [bShell(2.5, -0.85, 0, Math.PI, 0.35, Math.PI * 2 - 0.7)]);
    mini(4.4, -0.85, '小鼠、鼠：幾乎封閉', 'Mouse / rat: closed bursa', '由輸卵管系膜形成的卵巢囊<b>封閉極為完全</b>，只有一個小孔。（馬的卵巢囊狹窄如裂片，只包圍排卵窩）',
      [bShell(4.4, -0.85, 0.22, Math.PI - 0.22, 0, Math.PI * 2, 0.45)]);
  }
});
