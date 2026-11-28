/* 場景②–⑤：細部構造（陰莖橫切、陰囊層次、睪丸內部、生精細管） */

/* ---------- ② 陰莖橫切（逐層剝開） ---------- */
SCENES.push({
  name: '② 陰莖橫切',
  title: '陰莖橫切面（逐層剝開）',
  camera: { pos: [2.6, 2.2, 4.2], target: [0, 0, 0] },
  controls: [{ label: '💥 逐層展開／復原', fn() { window._penisExp = !window._penisExp; } }],
  desc: `<p>自外而內逐層剝開：<b>皮膚→淺筋膜→疏鬆結締組織→深筋膜→白膜</b>，白膜之下有三條平行的勃起組織：背側成對的<b>陰莖海綿體</b>、腹側中央圍繞尿道的<b>尿道海綿體</b>。</p>
  <p>勃起機制：與陰道交接前，進入陰莖的血量多於離開者，血液容積增加使陰莖膨大變硬。肌肉海綿型（馬）勃起時變長變粗；彈性纖維型（牛、豬）結締組織多、脹大少，主要靠S形屈曲伸直。</p>
  <p>另提醒：模型為簡化示意，實際上陰莖海綿體由白膜包圍並在中間形成中隔，尿道海綿體外面亦被白膜與深筋膜包圍。</p>`,
  build() {
    const L = 1.0; // 基準長度
    const layers = [
      ['皮膚', 'Skin', 1.0, 0.94, 0xe3b79a, 0.0, '最外層皮膚（游離部外面另被包皮覆蓋）。'],
      ['淺陰莖筋膜（Colles筋膜）', 'Superficial fascia (Colles\' fascia)', 0.93, 0.87, 0xd9a0a0, 0.25, '皮膚下方的第一層筋膜。'],
      ['疏鬆結締組織', 'Loose connective tissue', 0.86, 0.80, 0xf1e6c8, 0.5, '位於淺、深筋膜之間的疏鬆結締組織，使各層可滑動。'],
      ['深陰莖筋膜（Buck筋膜）', 'Deep fascia (Buck\'s fascia)', 0.79, 0.73, 0xc9d6e8, 0.75, '緊貼白膜外面、包圍勃起組織的堅韌筋膜。'],
      ['白膜', 'Tunica albuginea', 0.72, 0.67, 0xfafafa, 1.0, '緻密白色纖維膜，包被勃起組織，勃起時限制血液空間過度膨脹，使陰莖堅硬。']
    ];
    layers.forEach(l => {
      reg('包被層次（由外而內）', l[0], l[1], l[6], annulus(l[2], l[3], 1.6 + l[5] * 0.0 - 1.2 + l[5] * 1.0, l[4], 1, -1.0), { anchor: [l[2] * 0.7, l[2] * 0.7, l[5] * 1.0 - 0.9 + 0.0 - 0.2 + 0.4] });
    });
    // 內部填充（白膜內側的結締組織底）
    const base = disc(0.67, 2.2, 0xe8d3c5, 1, 0, 0, -1.0);
    reg('勃起組織', '中隔／海綿體間結締組織', 'Septum / trabecular tissue', '兩條陰莖海綿體在中間由白膜形成<b>中隔</b>分成左右；海綿體內含許多相通的血液空間（海綿窩）與小樑。', base, { anchor: [0, 0.05, 1.1] });
    const Z0 = -1.0, LEN = 2.3;
    const cc = [], dots = [];
    [-1, 1].forEach(s => {
      cc.push(disc(0.31, LEN, 0xc8404a, 1, s * 0.32, 0.2, Z0 + 0.0));
    });
    reg('勃起組織', '陰莖海綿體（左右各一）', 'Corpus cavernosum penis', '位於<b>背側成對</b>，平行排列，兩條各起自同側陰莖腳；性興奮時血液充盈海綿窩而使陰莖勃起。在食肉動物遠端轉成陰莖骨。', cc, { anchor: [-0.32, 0.2, 1.3] });
    // 海綿窩（小血液空間）
    const rr = rnd(11), dg = new THREE.CircleGeometry(1, 12);
    const dm = mat(0x7a1520, 1), inst = new THREE.InstancedMesh(dg, dm, 80), mtx = new THREE.Matrix4();
    for (let i = 0; i < 80; i++) {
      const s = i < 40 ? -1 : 1, a = rr() * 6.28, rd = Math.sqrt(rr()) * 0.26, r = 0.03 + rr() * 0.03;
      mtx.compose(V(s * 0.32 + Math.cos(a) * rd, 0.2 + Math.sin(a) * rd, Z0 + LEN + 0.002), new THREE.Quaternion(), V(r, r, 1));
      inst.setMatrixAt(i, mtx);
    }
    reg('勃起組織', '海綿窩（血液空間）', 'Cavernous spaces (sinusoids)', '勃起組織中的血液空間，勃起時大量充血；肌肉海綿型陰莖血液空間大、彈性纖維型較小。', inst, { anchor: [0.32, 0.2, Z0 + LEN + 0.02] });
    const sp = disc(0.27, LEN, 0x8e5a9e, 1, 0, -0.42, Z0);
    reg('勃起組織', '尿道海綿體', 'Corpus spongiosum (corpus cavernosum urethrae)', '位於<b>腹側中央</b>，圍繞尿道；近端為陰莖球，遠端膨大成陰莖頭。勃起時仍保持尿道通暢以利射精。', sp, { anchor: [0, -0.5, 1.3] });
    reg('勃起組織', '尿道', 'Urethra', '雄性尿道為尿液與精液的共同通道；陰莖部（海綿體部）近端偽複層上皮、遠端複層鱗狀上皮，外有尿道腺分泌黏液。',
      annulus(0.1, 0.055, LEN + 0.05, 0xffd35c, 1, Z0), { anchor: [0.1, -0.42, 1.4] });
    CUR.root.children[CUR.root.children.length - 1].position.y = -0.42;
    const hole = disc(0.055, LEN + 0.02, 0x3a2a10, 1, 0, -0.42, Z0);
    reg('勃起組織', '尿道腔', 'Urethral lumen', '尿液與精液流經的管腔。', hole, { anchor: [0, -0.42, Z0 + LEN + 0.05], nolabel: true });
    window._penisExp = false;
    let expT = 0;
    const layerParts = CUR.parts.slice(0, 5);
    layerParts.forEach((p, idx) => p.meshes.forEach(m => { m.userData._z0 = m.position.z; m.userData._dz = -idx * 0.28; }));
    CUR.tick = () => {
      const tgt = window._penisExp ? 1 : 0;
      if (Math.abs(expT - tgt) > 0.002) {
        expT += (tgt - expT) * 0.08;
        layerParts.forEach(p => p.meshes.forEach(m => { m.position.z = m.userData._z0 + m.userData._dz * expT; }));
      }
    };
  }
});

/* ---------- ③ 陰囊與睪丸被膜層次 ---------- */
SCENES.push({
  name: '③ 陰囊與被膜',
  title: '陰囊、精索筋膜與鞘膜（逐層剝開）',
  camera: { pos: [1.0, 0.5, 6.2], target: [0, 0.45, 0] },
  desc: `<p>陰囊由外而內四層：<b>皮膚→肉膜→精索筋膜（外精索筋膜、提睪筋膜、內精索筋膜）→鞘膜層</b>（壁層、鞘膜腔、臟層），再內為睪丸白膜。</p>
  <p><b>睪丸溫度調節</b>：①皮膚薄、無皮下脂肪、毛髮稀疏、富汗腺與溫度感受器（牛、羊汗腺不發達則以喘息代償）②肉膜熱時鬆弛、冷時收縮③提睪肌熱時放鬆、冷時收縮④蔓狀靜脈叢與睪丸動脈組成<b>逆流熱交換器</b>。</p>`,
  build() {
    const P = Math.PI, SC = [0.78, 1.0, 0.78];
    const defs = [
      ['陰囊皮膚', 'Scrotal skin', 1.0, 0xe5b79d, 0.22 * 0, '很薄、無皮下脂肪，毛髮稀疏（貓與部分綿羊較緻密）；布滿溫度感受器，有皮脂腺與受交感神經支配的汗腺，協助溫度調節。'],
      ['肉膜', 'Tunica dartos', 0.94, 0xb8574f, 0.2, '位於皮膚下方，由篩狀平滑肌纖維與彈性結締組織組成，並在正中形成陰囊中隔。冷時收縮（陰囊皺褶、睪丸貼近體壁），熱時鬆弛（增加散熱表面積）；收縮能力依賴雄性素。'],
      ['外精索筋膜', 'External spermatic fascia', 0.88, 0xf2ece0, 0.4, '衍生自外腹斜肌的筋膜，三層精索筋膜中最明顯。'],
      ['提睪筋膜／提睪肌', 'Cremasteric fascia & muscle', 0.82, 0xc9605a, 0.6, '衍生自內腹斜肌及其筋膜，含橫紋肌（提睪肌），不受意志控制；冷時收縮將睪丸拉近體壁，熱時鬆弛。'],
      ['內精索筋膜', 'Internal spermatic fascia', 0.76, 0xe7e1cf, 0.8, '與橫腹筋膜連續的最內層精索筋膜。'],
      ['鞘膜壁層', 'Parietal vaginal lamina', 0.70, 0x9fd0ff, 1.0, '衍生自腹膜鞘狀突，出生前封閉成囊。壁層外層疏鬆附著於陰囊內表面。'],
      ['鞘膜臟層', 'Visceral vaginal lamina', 0.63, 0x7fb4ee, 1.2, '覆蓋在睪丸白膜外面（除與附睪接觸處），與壁層相連續；兩層間的空腔為<b>鞘膜腔(cavum vaginale)</b>，含少量漿液潤滑。']
    ];
    defs.forEach((d, k) => {
      const e = k * 0.3;
      const m = shell(d[2], SC, d[3], k === 0 ? 0.55 : (k >= 5 ? 0.6 : 0.95), P - e, Math.min(2 * P, P + 2 * e));
      const th = 0.7 + 0.25 * k; // 標籤錨點放在各層被剝開的邊緣
      reg('陰囊被膜（由外而內）', d[0], d[1], d[5], m, { anchor: [d[2] * Math.cos(e) * Math.sin(th) * SC[0], d[2] * Math.cos(th) * SC[1], d[2] * Math.sin(e) * Math.sin(th) * SC[2]] });
    });
    const sp = V(0, 0, 0);
    reg('睪丸與附睪', '睪丸白膜', 'Tunica albuginea of testis', '包被睪丸的緻密白色纖維結締組織，含平滑肌；其節律性收縮／鬆弛具<b>幫浦作用</b>，協助精子輸送進入睪丸網及輸出管。內面緊貼薄血管層（tunica vasculosa）。',
      new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), mat(0xf8f4e6, 1)), { anchor: [0.25, 0.1, 0.5] });
    const tm = CUR.root.children[CUR.root.children.length - 1]; tm.scale.set(0.45, 0.58, 0.45);
    const ep = (() => { const pts = [[0.15, 0.6, 0.15], [-0.15, 0.52, 0.12], [-0.42, 0.2, 0.12], [-0.46, -0.2, 0.12], [-0.33, -0.52, 0.12]]; return tube(pts, 0.07, 0xd8a47f); })();
    reg('睪丸與附睪', '附睪', 'Epididymis', '緊貼睪丸的長形構造，含迂曲的附睪管；分頭、體、尾，負責精子成熟、運輸、貯存與保護。外覆鞘膜臟層。', ep, { anchor: [-0.55, -0.1, -0.1] });
    const cordc = lineCurve([0, 0.6, 0], [0, 1.6, 0]);
    reg('精索與血管', '精索（含輸精管與血管）', 'Spermatic cord', '含輸精管、睪丸動脈、蔓狀靜脈叢、提睪肌動靜脈、神經與淋巴管，由深腹股溝環下行至睪丸。',
      tube([[0, 0.6, 0], [0, 1.6, 0]], 0.13, 0xf0e6d8, 0.45), { anchor: [0.1, 1.3, 0] });
    reg('精索與血管', '睪丸動脈', 'Testicular artery', '主要供應睪丸與附睪的動脈，十分迂曲，被蔓狀靜脈叢包圍。', tube(helixAlong(cordc, 0.03, 8, 0, 120), 0.015, 0xe02020), { anchor: [-0.03, 1.55, 0] });
    reg('精索與血管', '蔓狀靜脈叢', 'Pampiniform plexus', '緊密圍繞睪丸動脈的靜脈網，與動脈形成<b>逆流熱交換器</b>：低溫靜脈血帶走動脈血的熱，使進入睪丸的血液降溫。',
      [tube(helixAlong(cordc, 0.07, 6, 0.5, 120), 0.016, 0x3b6fe0), tube(helixAlong(cordc, 0.07, 6, 3.6, 120), 0.016, 0x3b6fe0)], { anchor: [0.08, 1.1, 0.04] });
    reg('精索與血管', '輸精管', 'Vas deferens', '位於精索中，將精子由附睪尾送往尿道。', tube([[-0.33, -0.52, -0.02], [-0.5, -0.2, -0.1], [-0.35, 0.5, -0.12], [0, 0.7, 0], [0, 1.6, 0]], 0.025, 0xffffff), { anchor: [-0.05, 1.7, 0] });
  }
});

/* ---------- ④ 睪丸內部、輸出管道 ---------- */
SCENES.push({
  name: '④ 睪丸內部與附睪',
  title: '睪丸剖面：縱隔、小葉、生精細管、睪丸網與附睪',
  camera: { pos: [0.3, 0.3, 3.8], target: [-0.1, 0.05, 0] },
  controls: [{ label: '🧬 精子輸出路徑動畫', fn() { window._spermPath = !window._spermPath; } }],
  desc: `<p><b>精子輸出路徑</b>：生精細管（曲管部→直管部）→睪丸網→睪丸輸出小管→附睪管（頭→體→尾）→輸精管→射精管→尿道。</p>
  <p>白膜向內發出<b>睪丸中隔</b>，連到中央的<b>睪丸縱隔</b>（豬、牛、山羊、犬明顯），把睪丸分成許多<b>睪丸小葉</b>（功能單位）。小葉內為屈曲的生精細管，管間為含來狄吉細胞的間隙組織。</p>`,
  build() {
    const P = Math.PI, A = [0.5, 0.72, 0.5];
    reg('睪丸被膜', '睪丸白膜（剖開）', 'Tunica albuginea', '緻密白色纖維膜，含平滑肌，收縮具幫浦作用；向內發出睪丸中隔。', shell(1, A, 0xf8f4e6, 0.35, 0.9 * P, 1.2 * P), { anchor: [-0.4, 0.45, -0.3] });
    reg('睪丸被膜', '血管層', 'Tunica vasculosa', '緊貼白膜內面的薄血管層。', shell(0.96, A, 0xd9605a, 0.18, 0.9 * P, 1.2 * P), { anchor: [0.35, -0.45, -0.35], nolabel: true });
    reg('縱隔與小葉', '睪丸縱隔', 'Mediastinum testis', '睪丸中央的結締組織索（近極至遠極），橫切面呈放射狀，內含<b>睪丸網</b>。', cyl([0, -0.66, 0], [0, 0.66, 0], 0.05, 0xffffff, 0.75), { anchor: [0.0, -0.3, 0.05] });
    const SP = [];
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * 2 * P, m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.0), mat(0xe7efe0, 0.22));
      m.scale.set(1, 1, 1); m.geometry.translate(0.26, 0, 0); m.rotation.y = -a; SP.push(m);
    }
    reg('縱隔與小葉', '睪丸中隔（小葉間隔）', 'Septula testis', '由縱隔放射狀發出的結締組織間隔，連到白膜，把睪丸分隔為許多小葉。', SP, { anchor: [0.3, -0.5, 0.2] });
    // 生精細管
    const rr = rnd(5), ST = [];
    for (let row = 0; row < 3; row++) for (let k = 0; k < 12; k++) {
      const a0 = k / 12 * 2 * P, y0 = (row - 1) * 0.38, pts = [];
      const n = 70, ph = rr() * 6, am = 0.08 + rr() * 0.05;
      const f = (t, side) => { // 由縱隔向外盤繞再返回
        const r = 0.08 + 0.34 * Math.sin(Math.min(1, t * 1.15) * P * 0.5 + 0.0) * 0.999 + Math.sin(t * 17 + ph) * 0.03;
        const a = a0 + (0.12 + side * 0.15 * Math.sin(t * P)) + Math.sin(t * 23 + ph) * 0.05;
        const y = y0 + side * (t - 0.5) * 0.08 + Math.sin(t * 29 + ph) * am * 0.5;
        return V(Math.cos(a) * r, y, Math.sin(a) * r);
      };
      for (let i = 0; i <= n; i++) pts.push(f(i / n, 1));
      for (let i = n; i >= 0; i--) { const q = f(i / n, -1); q.y += 0.07; pts.push(q); }
      ST.push(tube(pts, 0.014, 0xf0d890, 1, 3));
    }
    reg('縱隔與小葉', '生精細管', 'Seminiferous tubules', '產生精子的處所，高度屈曲的圈環，兩端接睪丸網；<b>曲管部</b>進行生精作用，<b>直管部</b>與睪丸網相連。管外有類肌細胞，內襯生精上皮（生殖細胞＋賽透力氏細胞）。', ST, { anchor: [0.35, 0.3, 0.2] });
    const ley = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), mat(0xffc400, 1), 160), M = new THREE.Matrix4();
    for (let i = 0; i < 160; i++) {
      const a = rr() * 6.28, r = 0.1 + rr() * 0.36, y = (rr() - 0.5) * 1.1;
      M.compose(V(Math.cos(a) * r, y, Math.sin(a) * r), new THREE.Quaternion(), V(0.017, 0.017, 0.017)); ley.setMatrixAt(i, M);
    }
    reg('縱隔與小葉', '間隙組織／來狄吉細胞', 'Interstitial tissue / Leydig cells', '生精細管之間的結締組織，含血管、淋巴管、神經與成群的多角形<b>來狄吉細胞</b>（核大而圓），為<b>分泌雄性素</b>的處所。', ley, { anchor: [-0.3, 0.45, 0.3] });
    // 睪丸網
    const RT = [];
    for (let i = 0; i < 18; i++) {
      const a = rr() * 6.28, b = rr() * 6.28;
      RT.push(tube([[Math.cos(a) * 0.06, 0.2 + rr() * 0.4, Math.sin(a) * 0.06], [Math.cos(b) * 0.08, 0.2 + rr() * 0.4, Math.sin(b) * 0.08], [Math.cos(a + 2) * 0.06, 0.2 + rr() * 0.4, Math.sin(a + 2) * 0.06]], 0.012, 0x4aa3df, 1, 6));
    }
    reg('輸出管道', '睪丸網', 'Rete testis', '縱隔內互相吻合的複雜小管網，襯以具少數微絨毛與單一鞭毛的方形／扁平細胞，是精子輸往<b>睪丸輸出小管</b>的通道。', RT, { anchor: [0.08, 0.5, 0.06] });
    // 輸出小管
    const EF = [];
    for (let i = 0; i < 6; i++) {
      const o = (i - 2.5) * 0.04;
      EF.push(tube([[0, 0.5, o], [0, 0.7, o], [-0.12, 0.84 + i * 0.012, o * 2], [-0.3, 0.86, o * 2]], 0.014, 0x3f7fc0, 1, 8));
    }
    reg('輸出管道', '睪丸輸出小管', 'Ductuli efferentes testis', '連接睪丸網與附睪頭。內襯偽複層柱狀上皮：<b>無纖毛細胞</b>（刷狀緣）重吸收睪丸液以濃縮精子，<b>纖毛細胞</b>與外圍平滑肌將精子推向附睪。多管連接（人、大型哺乳類）佔附睪頭約1/3；齧齒類先匯成總輸出小管；禽類分近端、遠端。', EF, { anchor: [-0.1, 0.9, 0] });
    // 附睪
    const hc = new THREE.CatmullRomCurve3(PV([[-0.3, 0.9, 0], [-0.5, 0.78, 0], [-0.62, 0.35, 0], [-0.64, -0.1, 0], [-0.58, -0.55, 0], [-0.4, -0.8, 0]]));
    const part = (a, b) => { const sub = []; for (let i = a; i <= b + 1e-6; i += 0.01) sub.push(hc.getPointAt(Math.min(i, 1))); return new THREE.CatmullRomCurve3(sub); };
    const hs = [[0, 0.22, 0.1, 0xdca880], [0.22, 0.75, 0.07, 0xd09068], [0.75, 1, 0.095, 0xc07c58]];
    const names = [
      ['附睪頭', 'Caput epididymidis', '扁平杯狀、覆蓋睪丸近極，輸出小管由此進入。主細胞約占80%（初始段至頭部），靜纖毛最長。'],
      ['附睪體', 'Corpus epididymidis', '沿睪丸背緣下行，狹長，為附睪管迂曲處；主細胞約69%，澄清細胞出現（胞飲管腔蛋白）。'],
      ['附睪尾', 'Cauda epididymidis', '位於睪丸遠極，精子貯存主要處所；管周平滑肌最厚，主細胞約65%，上皮細胞直徑由頭部約140μm降至約60μm、管徑隨之變大。']
    ];
    hs.forEach((h, i) => {
      const cv = part(h[0], h[1]);
      const cap = new THREE.Mesh(new THREE.TubeGeometry(cv, 30, h[2], 12, false), mat(h[3], 0.45));
      const coil = tube(helixAlong(cv, h[2] * 0.55, 22 + i * 4, 0, 400), 0.014, 0xffe3c9, 1, 2);
      reg('輸出管道', names[i][0], names[i][1], names[i][2] + '<br>附睪管為偽複層柱狀上皮，含主細胞、基底細胞、澄清細胞、光暈細胞（上皮內淋巴球／巨噬細胞）。主細胞吸收睪丸液並分泌有助精子成熟的蛋白。細胞間緊密接合構成<b>血－附睪障壁</b>。',
        [cap, coil], { anchor: [cv.getPointAt(0.5).x - 0.05, cv.getPointAt(0.5).y, 0.08] });
    });
    reg('輸出管道', '輸精管起始', 'Vas deferens (start)', '附睪尾接近陰囊韌帶處管徑變粗，環繞睪丸韌帶後向上延續為輸精管，肌肉層厚（內縱、中斜、外縱），蠕動收縮輸送精子。',
      tube([[-0.4, -0.8, 0], [-0.55, -0.7, -0.05], [-0.78, -0.2, -0.05], [-0.8, 0.5, -0.02], [-0.7, 1.1, 0]], 0.03, 0xffffff), { anchor: [-0.8, 0.5, -0.02] });
    reg('輸出管道', '陰囊韌帶／睪丸韌帶', 'Scrotal ligament', '在睪丸遠端，陰囊韌帶把鞘膜層牢固附著於陰囊。', cyl([-0.05, -0.74, 0], [-0.05, -1.1, 0], 0.04, 0xe3d6b4), { anchor: [-0.05, -1.0, 0] });
    window._spermPath = true;
    const pathCurve = new THREE.CatmullRomCurve3(PV([
      [0.26, -0.15, 0.12], [0.04, 0.15, 0.02], [0.0, 0.55, 0], [-0.12, 0.85, 0], [-0.32, 0.88, 0],
      [-0.52, 0.72, 0], [-0.63, 0.28, 0], [-0.64, -0.18, 0], [-0.56, -0.60, 0], [-0.40, -0.80, 0],
      [-0.58, -0.68, -0.05], [-0.78, -0.15, -0.05], [-0.80, 0.50, -0.02], [-0.70, 1.10, 0]
    ]), false, 'centripetal');
    const sBalls = [];
    const sg = new THREE.SphereGeometry(0.036, 12, 8), sm = new THREE.MeshBasicMaterial({ color: 0x38f8ff });
    for (let k = 0; k < 8; k++) { const b = new THREE.Mesh(sg, sm); CUR.root.add(b); sBalls.push(b); }
    let ph = 0;
    CUR.tick = () => {
      if (window._spermPath) {
        ph = (ph + 0.004) % 1;
        sBalls.forEach((b, k) => { b.visible = true; b.position.copy(pathCurve.getPointAt((ph + k / sBalls.length) % 1)); });
      } else {
        sBalls.forEach(b => { b.visible = false; });
      }
    };
  }
});

/* ---------- ⑤ 生精細管橫切與血睪障壁 ---------- */
SCENES.push({
  name: '⑤ 生精細管・血睪障壁',
  title: '生精細管橫切（放大示意）與血睪障壁',
  camera: { pos: [0, 0.2, 6.6], target: [0, 0, 0] },
  desc: `<p>生精細管由<b>基底膜</b>與<b>生精上皮</b>構成，外圍有收縮性的<b>管周類肌細胞</b>。生精上皮含：①向中心成層排列的各階段<b>生殖細胞</b>；②長柱狀的<b>賽透力氏細胞</b>。</p>
  <p>相鄰賽透力氏細胞的<b>緊密接合</b>位於細胞側底部，將管腔分成<b>基底區間</b>與<b>近腔區間</b>，構成<b>血睪障壁（賽透力氏細胞障壁）</b>：維持管腔液特殊成分（少蛋白與葡萄糖，富雄性素、動情素、鉀、肌醇等），並隔離精子抗原免受自體免疫攻擊（睪丸另有免疫豁免機制）。</p>
  <p>精原細胞更新分化至前細絲期精母細胞在基底區間；減數分裂Ⅰ/Ⅱ、精子形成、精子釋放在近腔區間。</p>`,
  build() {
    const P = Math.PI, TH = 0.6, RB = 1.3, NS = 10, rr = rnd(21);
    const rad = (r, a) => V(Math.cos(a) * r, Math.sin(a) * r, 0);
    // 基底膜
    reg('管壁與間質', '基底膜', 'Basement membrane', '生精細管最外的薄膜，賽透力氏細胞扁平的基部垂直附著其上。',
      (() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(RB, RB, TH, 64, 1, true), mat(0x6fa0e0, 0.55)); m.rotation.x = P / 2; return m; })(), { anchor: [RB * 0.7, RB * 0.7, 0.3] });
    // 管周類肌細胞
    const my = new THREE.InstancedMesh(_sph, mat(0xe08a6a, 1), 30), M = new THREE.Matrix4(), Q = new THREE.Quaternion();
    for (let i = 0; i < 30; i++) {
      const a = i / 30 * 2 * P; Q.setFromAxisAngle(V(0, 0, 1), a + P / 2);
      M.compose(rad(RB + 0.06, a), Q, V(0.17, 0.03, 0.28)); my.setMatrixAt(i, M);
    }
    reg('管壁與間質', '管周類肌細胞', 'Peritubular myoid cells', '環繞生精細管、具收縮性的扁平細胞（齧齒類為完整一層半通透障壁，大型哺乳類無此現象），收縮幫助精子移動。', my, { anchor: [-RB - 0.1, 0.1, 0.3] });
    // 間質：來狄吉細胞與微血管
    const ly = new THREE.InstancedMesh(_sph, mat(0xffc400, 1), 14);
    for (let i = 0; i < 14; i++) {
      const a = 0.3 + i * 0.07 + (i > 6 ? 3.0 : 0); M.compose(rad(RB + 0.3 + rr() * 0.25, a + (i % 7) * 0.05), new THREE.Quaternion(), V(0.085, 0.085, 0.085)); ly.setMatrixAt(i, M);
    }
    reg('管壁與間質', '來狄吉細胞（間質）', 'Leydig cells', '位於管間間隙組織，細胞核大而圓；<b>分泌雄性素</b>（睪固酮），維持生精作用與副性徵。', ly, { anchor: [RB + 0.5, 0.45, 0] });
    reg('管壁與間質', '間質微血管', 'Interstitial capillary', '間隙組織中的血管，供應營養並運送雄性素；血液成分被血睪障壁阻擋，不能直接進入管腔。',
      (() => { const m = cyl([RB + 0.55, -0.9, -0.5], [RB + 0.55, -0.9, 0.5], 0.08, 0xe03030, 0.9); return m; })(), { anchor: [RB + 0.55, -0.9, 0.5] });
    // 賽透力氏細胞
    const SE = [];
    for (let k = 0; k < NS; k++) {
      const a = k / NS * 2 * P, len = 0.95;
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.2, len, 14), mat(0xe8d0b0, 0.95));
      m.position.copy(rad(RB - 0.02 - len / 2 + 0.0, a)); m.rotation.z = a + P / 2; m.scale.z = 1.4; SE.push(m);
      const nuc = new THREE.Mesh(_sph, mat(0x7a5a8a, 1)); nuc.position.copy(rad(RB - 0.22, a)); nuc.scale.set(0.09, 0.15, 0.1); nuc.rotation.z = a + P / 2; SE.push(nuc);
    }
    reg('生精上皮', '賽透力氏細胞', 'Sertoli cell', '長柱狀細胞，扁平基部附著基底膜、頂部朝向管腔；圍繞增殖與分化中的生殖細胞形成小袋，<b>提供營養、胞噬精細胞多餘細胞質</b>，並分泌<b>抑制素(inhibin)</b>。', SE, { anchor: [rad(0.95, 0.6).x, rad(0.95, 0.6).y, 0.35] });
    // 緊密接合
    const TJ = [];
    TJ.push(new THREE.Mesh(new THREE.TorusGeometry(RB - 0.3, 0.025, 8, 80), mat(0xff3fa0, 0.9)));
    TJ[0].scale.z = 1;
    for (let k = 0; k < NS; k++) { const a = (k + 0.5) / NS * 2 * P; const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.45), mat(0xff3fa0, 1)); b.position.copy(rad(RB - 0.3, a)); b.rotation.z = a; TJ.push(b); }
    reg('生精上皮', '緊密接合（血睪障壁）', 'Tight junctions (blood-testis barrier / Sertoli cell barrier)', '相鄰賽透力氏細胞<b>側底部</b>的連續緊密接合（一般上皮的緊密接合在細胞側頂部），限制大分子進出，把管腔分成基底與近腔區間；與附睪上皮的緊密接合（血－附睪障壁，位於側頂部）相似。頂膜與底側膜的特異運輸蛋白進一步調控管腔微環境。', TJ, { anchor: [rad(RB - 0.3, 2.2).x, rad(RB - 0.3, 2.2).y, 0.25] });
    // 區間
    reg('區間', '基底區間', 'Basal compartment', '障壁外側（靠基底膜）；<b>精原細胞更新、分化</b>及至前細絲期精母細胞之前的細胞週期在此進行，可接觸血液與淋巴來源的物質。', annulus(RB - 0.01, RB - 0.3, TH - 0.1, 0x5fd08a, 0.2, -(TH - 0.1) / 2), { anchor: [rad(RB - 0.15, -2.2).x, rad(RB - 0.15, -2.2).y, 0.2] });
    reg('區間', '近腔區間', 'Adluminal compartment', '障壁內側（靠管腔）；<b>第一、二次減數分裂、精子形成(spermiogenesis)與精子釋放(spermiation)</b>在此進行，受障壁保護。', annulus(RB - 0.31, 0.45, TH - 0.1, 0xb9a0ff, 0.12, -(TH - 0.1) / 2), { anchor: [rad(0.75, -0.8).x, rad(0.75, -0.8).y, 0.2] });
    // 生殖細胞（各階段，向中心排列）
    const stage = (name, en, col, r, sc, cnt, desc, ang0, hold) => {
      const im = new THREE.InstancedMesh(_sph, mat(col, 1), cnt * NS);
      for (let k = 0; k < NS; k++) for (let j = 0; j < cnt; j++) {
        const a = (k + 0.5) / NS * 2 * P + (j - (cnt - 1) / 2) * 0.05, z = (j % 2 ? 0.1 : -0.1);
        const rrad = r + (rr() - 0.5) * 0.04;
        M.compose(V(Math.cos(a) * rrad, Math.sin(a) * rrad, z), new THREE.Quaternion(), V(sc, sc, sc)); im.setMatrixAt(k * cnt + j, M);
      }
      reg('生殖細胞（由基底向管腔）', name, en, desc, im, { anchor: [Math.cos(ang0) * r, Math.sin(ang0) * r, 0.3] });
    };
    stage('精原細胞', 'Spermatogonium', 0x2fbf6f, RB - 0.14, 0.085, 1, '位於基底區間，有絲分裂更新並分化；一部分成為前細絲期精母細胞，穿越障壁進入近腔區間。', 0.314);
    stage('初級精母細胞', 'Primary spermatocyte', 0x9a5fd0, RB - 0.5, 0.12, 2, '進入近腔區間後進行第一次減數分裂。', 0.314);
    stage('圓形精細胞', 'Round spermatid', 0xf09a4a, RB - 0.78, 0.07, 2, '減數分裂完成後的單套染色體細胞，開始進行精子形成。', 0.314);
    // 精子（長形精細胞＋管腔中精子）
    const SPm = [];
    for (let k = 0; k < NS; k++) for (let j = 0; j < 2; j++) {
      const a = (k + 0.5) / NS * 2 * P + (j - 0.5) * 0.12, r = RB - 0.95;
      const h = new THREE.Mesh(_sph, mat(0xf2e24a, 1)); h.position.copy(rad(r, a)); h.position.z = j ? 0.12 : -0.12; h.scale.set(0.045, 0.026, 0.026); h.rotation.z = a; SPm.push(h);
      const tl = cyl([Math.cos(a) * (r - 0.04), Math.sin(a) * (r - 0.04), h.position.z], [Math.cos(a) * 0.12, Math.sin(a) * 0.12, h.position.z * 0.5], 0.007, 0xf2e24a, 1); SPm.push(tl);
    }
    reg('生殖細胞（由基底向管腔）', '長形精細胞／精子', 'Elongating spermatid / spermatozoa', '精子形成後期的細胞，尾部朝向管腔，最後在<b>精子釋放</b>時脫離賽透力氏細胞進入管腔，隨管腔液流向睪丸網。', SPm, { anchor: [rad(RB - 0.95, -0.4).x, rad(RB - 0.95, -0.4).y, 0.25] });
    reg('管壁與間質', '管腔', 'Lumen', '含睪丸液與游離精子，精子隨管腔液及類肌細胞收縮被輸往睪丸網。', (() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.45, 32), mat(0x6fc8ff, 0.25)); m.rotation.x = P / 2; return m; })(), { anchor: [0, 0, 0.3] });
  }
});
