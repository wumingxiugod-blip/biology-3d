/* 場景③：卵巢構造與濾泡發育（切面）、格蕾斐濾泡放大、物種卵巢外形 */
SCENES.push({
  name: '③ 卵巢濾泡',
  title: '卵巢切面：濾泡發育 → 排卵 → 黃體 → 白體',
  camera: { pos: [1.0, -0.2, 12.5], target: [1.0, -0.4, 0] },
  controls: [
    { label: '🔍 卵巢切面', fn() { flyTo([-1.2, 0.3, 7.5], [-1.2, 0.3, 0]); } },
    { label: '🔍 格蕾斐濾泡放大', fn() { flyTo([4.3, 0.3, 6], [4.3, 0.3, 0]); } },
    { label: '🔍 物種卵巢外形', fn() { flyTo([-0.6, -1.0, 6.5], [-0.6, -2.7, 0]); } }
  ],
  desc: `
  <p>左：卵巢縱切面（前方剖開），濾泡依<b>①→⑩</b>的順序沿皮質排列；右：成熟（格蕾斐）濾泡放大剖面；下方：各物種卵巢外形。</p>
  <table>
  <tr><th>階段</th><th>重點</th></tr>
  <tr><td>①原始濾泡</td><td>初級卵母細胞（停在第一次減數分裂前期）＋一層<b>扁平</b>濾泡細胞</td></tr>
  <tr><td>②初級濾泡</td><td>單層<b>方形</b>濾泡細胞；出現<b>透明帶</b>與 FSH 受體（生長仍不依賴性腺素）</td></tr>
  <tr><td>③次級濾泡</td><td><b>多層粒性細胞</b>；濾泡膜分化為內膜、外膜，之間出現微血管網</td></tr>
  <tr><td>④三級濾泡</td><td>出現<b>濾泡腔</b>與濾泡液；內膜表現 <b>LH 受體</b>；依賴 FSH</td></tr>
  <tr><td>⑤格蕾斐濾泡</td><td>成熟，凸出卵巢表面像水泡；卵丘、放射冠</td></tr>
  <tr><td>⑦血體→⑧黃體→⑨白體</td><td>排卵後血液充滿濾泡腔 → 黃體細胞充滿 → 退化成白色結締組織結節</td></tr>
  <tr><td>⑩閉鎖濾泡</td><td>可發生在任何階段，家畜以<b>三級濾泡</b>最常見</td></tr>
  </table>
  <details><summary>格蕾斐濾泡直徑與數目</summary>
  <table><tr><td>母牛</td><td>12–19 mm，1–2 個</td></tr><tr><td>母綿羊</td><td>5–10 mm，1–4 個</td></tr><tr><td>母豬</td><td>8–12 mm，10–25 個</td></tr><tr><td>母馬</td><td>25–70 mm，1–2 個</td></tr></table></details>
  <p>濾泡數：初生犢牛約 <b>75,000</b> 個，12–14 歲母牛只剩約 <b>2,500</b> 個。<br>只有<b>有袋類與真獸類</b>具黃體；<b>單孔類與鳥類不具黃體</b>。</p>`,
  build() {
    const CX = -1.2, CY = 0.3, SX = 2.3, SY = 1.5, SZ = 1.15;
    const E = (deg, f) => { const a = deg * Math.PI / 180; return [CX + SX * f * Math.cos(a), CY + SY * f * Math.sin(a), 0]; };
    const flat = (m, sx, sy) => { m.scale.set(sx, sy, 1); m.position.set(CX, CY, -0.015); return m; };
    const back = (r, col, o, c) => { const m = shell(r, [1, 1, 1], col, o, Math.PI, Math.PI); m.position.set(...c); return m; };
    const G1 = '卵巢一般構造', G2 = '濾泡發育', G3 = '排卵後的變化', G4 = '格蕾斐濾泡放大', G5 = '物種卵巢外形';
    const OOC = 0xfbefb0, ZP = 0xffffff, FC = 0xf0a070, GR = 0xf2c36b, TI = 0xe0956a, TE = 0xc77a6a, ANT = 0x9fd6ff;

    // ===== 一般構造 =====
    const ovShell = shell(1, [SX, SY, SZ], 0xf2e2c8, 0.35, Math.PI, Math.PI); ovShell.position.set(CX, CY, 0);
    reg(G1, '生殖上皮', 'Germinal epithelium', '覆蓋在白膜外面的一層<b>單層鱗狀中皮</b>（simple squamous mesothelium）。卵巢的生殖上皮位於<b>卵巢表面</b>，而不是像睪丸一樣存在於生精細管中。',
      [ovShell, flat(annulus(1, 0.985, 0.03, 0xfff4dc), SX, SY)], { anchor: E(140, 1.0) });
    reg(G1, '白膜', 'Tunica albuginea', '卵巢表面一層<b>厚的結締組織被膜</b>；皮質結締組織細胞在靠近表面處較緻密、約與表面平行排列而形成。',
      flat(annulus(0.985, 0.94, 0.025, 0xfafafa), SX, SY), { anchor: E(165, 0.96) });
    reg(G1, '皮質', 'Cortex', '含許多<b>發育階段不同的濾泡</b>，是<b>卵與內泌素產生</b>的處所。結締組織含很多纖維母細胞、少許膠原與網狀纖維、血管、淋巴管、神經與平滑肌纖維。（馬例外：皮質在內、髓質在外）',
      flat(annulus(0.94, 0.55, 0.02, 0xead2bc), SX, SY), { anchor: E(-170, 0.7) });
    reg(G1, '髓質', 'Medulla', '由不規則排列的<b>彈性纖維結締組織、神經及血管</b>構成。',
      flat(disc(0.55, 0.02, 0xd9a596), SX, SY), { anchor: [CX - 0.4, CY + 0.1, 0] });
    const VS = [];
    [[-0.5, 0xd03030], [-0.2, 0x4a6fd8], [0.15, 0xd03030], [0.45, 0x4a6fd8]].forEach(([dx, c], k) => {
      const base = new THREE.CatmullRomCurve3(PV([[CX + dx * 0.4, CY - SY - 0.5, 0.06], [CX + dx * 0.5, CY - SY + 0.3, 0.06], [CX + dx * 1.6, CY - 0.1, 0.06], [CX + dx * 2.6, CY + 0.35, 0.05]]));
      VS.push(tube(helixAlong(base, 0.05, 6, k, 160), 0.022, c, 1, 2));
    });
    reg(G1, '髓質血管', 'Medullary vessels', '經卵巢門進入的動靜脈，在髓質中高度<b>迂曲</b>，再分枝到皮質濾泡周圍。', VS, { anchor: [CX + 0.6, CY - 0.4, 0.06] });
    reg(G1, '卵巢門', 'Hilus ovarii', '卵巢附著於<b>卵巢系膜</b>的部分，<b>血管與神經就經此進出卵巢</b>。',
      [ell([CX, CY - SY + 0.02, 0], [0.35, 0.12, 0.2], 0xc9a0a0, 0.8), ribbon([[CX - 0.35, CY - SY, 0], [CX + 0.35, CY - SY, 0]], [[CX - 0.5, CY - SY - 0.6, -0.05], [CX + 0.5, CY - SY - 0.6, -0.05]], 0x9be0b0, 0.35)],
      { anchor: [CX, CY - SY - 0.05, 0.1] });

    // ===== 濾泡發育 =====
    const PR = [];
    [[178, 0.9], [188, 0.89], [198, 0.88], [170, 0.87], [207, 0.87], [183, 0.84]].forEach(([d, f]) => {
      const c = E(d, f); PR.push(ell(c, [0.05, 0.05, 0.05], OOC), back(0.075, FC, 0.8, c));
    });
    reg(G2, '① 原始濾泡', 'Primordial follicle', '出生即存在、<b>最小、最不成熟</b>的濾泡。內含一個停頓在<b>第一次減數分裂前期</b>的初級卵母細胞，外圍一層<b>扁平</b>濾泡細胞及基底膜。發身後一批一批開始發育成初級濾泡。', PR, { anchor: E(188, 0.88) });
    let c = E(152, 0.8);
    reg(G2, '② 初級濾泡', 'Primary follicle', '初級卵母細胞＋外圍<b>單一層方形濾泡細胞</b>及基底膜。卵母細胞外開始出現薄薄的<b>透明帶</b>（濾泡細胞分泌）。濾泡出現 <b>FSH 受體</b>，但生長仍不依賴性腺素。各初級濾泡在白膜下聚集成緻密的濾泡層。',
      [ell(c, [0.075, 0.075, 0.075], OOC), back(0.09, ZP, 0.6, c), back(0.13, FC, 0.85, c)], { anchor: c });
    c = E(124, 0.74);
    reg(G2, '③ 次級濾泡', 'Secondary follicle', '仍為初級卵母細胞（具卵黃膜）。濾泡細胞增生成<b>多層粒性細胞</b>；基底膜外的濾泡膜細胞分化為<b>濾泡內膜</b>與<b>濾泡外膜</b>，兩者間出現微血管網。透明帶增厚，濾泡向皮質中心移動。',
      [ell(c, [0.09, 0.09, 0.09], OOC), back(0.11, ZP, 0.6, c), back(0.21, GR, 0.9, c), back(0.25, TI, 0.7, c)], { anchor: c });
    c = E(93, 0.66);
    const TA = [ell(c, [0.09, 0.09, 0.09], OOC), back(0.11, ZP, 0.6, c), back(0.3, GR, 0.9, c), back(0.35, TI, 0.7, c)];
    [[0.15, 0.08], [-0.13, 0.12], [0.05, -0.17], [-0.16, -0.08]].forEach(([dx, dy]) => TA.push(ell([c[0] + dx, c[1] + dy, 0.02], [0.06, 0.05, 0.03], ANT, 0.7)));
    reg(G2, '④ 三級濾泡', 'Tertiary (antral) follicle', '粒性細胞層中形成多個空腔＝<b>濾泡腔</b>，充滿富含玻尿酸與蛋白醣的<b>濾泡液</b>（liquor folliculi）。卵母細胞此時已達成熟體積。濾泡內膜開始表現 <b>LH 受體</b>；發育有賴 <b>FSH</b>。（腔前濾泡 vs. 腔狀濾泡）', TA, { anchor: c });
    c = E(52, 0.86);
    reg(G2, '⑤ 格蕾斐濾泡', 'Graafian (mature) follicle', '已成熟的濾泡，<b>凸出於卵巢表面</b>像一個水泡，在排卵前達到最大體積。大小與數目隨物種而異（牛 12–19 mm）。（右側有放大剖面）',
      [back(0.5, TE, 0.6, c), back(0.46, TI, 0.75, c), back(0.42, GR, 0.95, c), ell(c, [0.36, 0.36, 0.2], ANT, 0.3), ell([c[0] - 0.18, c[1] - 0.2, 0], [0.16, 0.12, 0.12], GR), ell([c[0] - 0.12, c[1] - 0.12, 0.07], [0.07, 0.07, 0.07], OOC)], { anchor: [c[0] + 0.3, c[1] + 0.35, 0] });
    // ===== 排卵後 =====
    c = E(12, 0.93);
    const ovum = [c[0] + 0.62, c[1] + 0.25, 0.25];
    const OVL = [back(0.38, TE, 0.6, c), back(0.34, GR, 0.9, c), ell(ovum, [0.08, 0.08, 0.08], OOC), shell(0.1, [1, 1, 1], ZP, 0.5, 0, Math.PI * 2)];
    OVL[3].position.set(...ovum);
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; OVL.push(ell([ovum[0] + Math.cos(a) * 0.14, ovum[1] + Math.sin(a) * 0.14, ovum[2]], [0.03, 0.03, 0.03], GR)); }
    reg(G3, '⑥ 排卵（濾泡破裂）', 'Ovulation', '成熟濾泡在 <b>LH 高峰</b>後破裂，釋出卵。釋入輸卵管時，卵包含<b>卵母細胞、透明帶與放射冠</b>。破裂處＝排卵點。', OVL, { anchor: ovum });
    c = E(-22, 0.8);
    reg(G3, '⑦ 血體', 'Corpus hemorrhagicum', '排卵後濾泡腔內充滿<b>血液與淋巴</b>，中央含有血塊。<b>豬的血體較牛與綿羊者為大</b>。粒性細胞層皺疊，肥大的粒性細胞聚集成索，由周緣輻射狀向中心會合。',
      [back(0.3, GR, 0.9, c), ell(c, [0.24, 0.24, 0.12], 0x8a1020)], { anchor: c });
    c = E(-52, 0.82);
    const CL = [ell(c, [0.42, 0.42, 0.25], 0xf2a51a)];
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; CL.push(tube([[c[0], c[1], 0.26], [c[0] + Math.cos(a) * 0.38, c[1] + Math.sin(a) * 0.38, 0.1]], 0.012, 0xc0503a)); }
    reg(G3, '⑧ 黃體', 'Corpus luteum', '內膜細胞及血管透入、血塊被吸收，<b>黃體細胞充滿空腔</b>。大型黃體細胞來自<b>粒性細胞</b>（較大、淡染），小型來自<b>濾泡內膜細胞</b>（較小、深染）。分泌<b>助孕酮</b>維持早期懷孕；某些動物亦分泌<b>鬆弛素</b>（軟化恥骨縫合，助分娩）。牛、馬含葉黃素呈黃色；綿羊、豬呈肉色。懷孕時＝<b>真黃體</b>（較大），動情週期中＝<b>偽黃體</b>。', CL, { anchor: [c[0] + 0.3, c[1] - 0.25, 0.2] });
    c = E(-122, 0.78);
    const caG = new THREE.SphereGeometry(0.2, 24, 16); const pa = caG.attributes.position, rq = rnd(3);
    for (let i = 0; i < pa.count; i++) { const k = 0.8 + rq() * 0.35; pa.setXYZ(i, pa.getX(i) * k, pa.getY(i) * k, pa.getZ(i) * k * 0.6); }
    caG.computeVertexNormals(); const ca = new THREE.Mesh(caG, mat(0xf2f0ea)); ca.position.set(...c);
    reg(G3, '⑨ 白體', 'Corpus albicans', '黃體功能結束後，結締組織、脂肪與透明物質出現，黃體變小並由紅棕色<b>漸變白色或灰棕色</b>，有時只在卵巢表面留下痂。纖維母細胞與巨噬細胞侵入，形成<b>緻密結締組織的節結</b>。', ca, { anchor: c });
    c = E(-152, 0.72);
    const atG = new THREE.SphereGeometry(0.2, 32, 20); const pb = atG.attributes.position;
    for (let i = 0; i < pb.count; i++) { const x = pb.getX(i), y = pb.getY(i), z = pb.getZ(i), k = 1 + 0.15 * Math.sin(x * 40) * Math.cos(y * 40); pb.setXYZ(i, x * k, y * k, z * k); }
    atG.computeVertexNormals(); const at = new THREE.Mesh(atG, mat(0xe8e0b8, 0.6)); at.position.set(...c);
    reg(G2, '⑩ 閉鎖濾泡', 'Atretic follicle', '正在或已退化的濾泡。卵母細胞自體溶解，<b>透明帶皺褶</b>；粒性細胞凋亡並被纖維結締組織取代；濾泡內膜可暫時成為分泌動情素的腺體；基底膜增厚成<b>玻璃狀膜</b>（glassy membrane）；最後由巨噬細胞清除。懷孕與泌乳期間閉鎖較多。',
      [at, ell(c, [0.07, 0.06, 0.06], 0xb8a060)], { anchor: c });
    reg(G2, '無卵濾泡／黃體化濾泡', 'Anovular / luteinizing follicle', '<b>無卵濾泡</b>：不含卵的濾泡，常不能發育到形成濾泡腔。<b>黃體化濾泡</b>：尚未破裂排卵就已黃體化。（鳥類濾泡無濾泡腔）',
      [back(0.14, GR, 0.9, E(-178, 0.76)), ell(E(-178, 0.76), [0.1, 0.1, 0.05], 0xf5c060, 0.8)], { anchor: E(-178, 0.76) });

    // ===== 格蕾斐濾泡放大 =====
    const D = [4.3, 0.3, 0], dz = (x, y, z) => [D[0] + x, D[1] + y, D[2] + z];
    const flatR = (ro, ri, col) => { const m = annulus(ro, ri, 0.02, col); m.position.set(D[0], D[1], -0.01); return m; };
    reg(G4, '濾泡外膜', 'Theca externa', '最外層，由<b>結締組織</b>構成，支持濾泡。',
      [back(1.6, TE, 0.55, D), flatR(1.6, 1.46, TE)], { anchor: dz(-1.25, 1.0, 0) });
    const CAP = []; const rc = rnd(11);
    for (let k = 0; k < 9; k++) {
      const th = 0.4 + rc() * 2.3, ph0 = Math.PI + rc() * 0.3, pts = [];
      for (let i = 0; i <= 20; i++) { const ph = ph0 + i / 20 * (Math.PI - 0.6); pts.push(dz(1.47 * Math.sin(th) * Math.cos(ph), 1.47 * Math.cos(th), 1.47 * Math.sin(th) * Math.sin(ph))); }
      CAP.push(tube(pts, 0.012, 0xd02828));
    }
    reg(G4, '微血管網', 'Capillary network', '位於濾泡內、外膜之間，供濾泡血液循環（次級濾泡起出現）。', CAP, { anchor: dz(0.9, 1.15, -0.4) });
    reg(G4, '濾泡內膜', 'Theca interna', '富含血管的<b>分泌性</b>細胞層；三級濾泡起表現 <b>LH 受體</b>，在 LH 作用下產生雄性素前驅物，供粒性細胞轉成<b>動情素</b>。排卵後參與形成<b>小型黃體細胞</b>。',
      [back(1.46, TI, 0.75, D), flatR(1.46, 1.37, TI)], { anchor: dz(1.3, 0.6, 0) });
    reg(G4, '基底膜', 'Basement membrane', '分隔粒性細胞與濾泡內膜；閉鎖時增厚成玻璃狀膜。',
      [back(1.37, 0xffffff, 0.5, D), flatR(1.37, 1.34, 0xffffff)], { anchor: dz(1.25, -0.55, 0) });
    reg(G4, '粒性細胞層', 'Membrana granulosa (granulosa cells)', '多層粒性細胞，具 <b>FSH 受體</b>，將雄性素轉換成<b>動情素</b>。排卵後形成<b>大型黃體細胞</b>。',
      [back(1.34, GR, 0.95, D), flatR(1.34, 1.12, GR)], { anchor: dz(-1.1, -0.65, 0) });
    reg(G4, '濾泡腔（濾泡液）', 'Antrum (liquor folliculi)', '粒性細胞層中的大空腔，充滿富含<b>玻尿酸與蛋白醣</b>的澄清濾泡液（含動情素）。',
      ell(D, [1.1, 1.1, 0.6], ANT, 0.18), { anchor: dz(0.35, 0.45, 0) });
    reg(G4, '卵丘', 'Cumulus oophorus', '由一群粒性細胞組成、向腔內突出的丘狀構造，卵母細胞埋於其中。',
      ell(dz(-0.6, -0.65, -0.2), [0.6, 0.45, 0.4], 0xf5cd7a), { anchor: dz(-0.75, -0.8, 0.1) });
    const COR = [];
    for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2; COR.push(ell(dz(-0.45 + Math.cos(a) * 0.34, -0.38 + Math.sin(a) * 0.34, 0.12), [0.06, 0.05, 0.05], 0xf7b84a)); }
    reg(G4, '放射冠', 'Corona radiata', '緊貼透明帶、呈<b>放射狀排列</b>的一層粒性細胞，排卵時隨卵一起釋出。', COR, { anchor: dz(-0.45, -0.02, 0.12) });
    reg(G4, '透明帶', 'Zona pellucida', '卵母細胞外的醣蛋白層，由濾泡細胞分泌，初級濾泡起出現。',
      ell(dz(-0.45, -0.38, 0.12), [0.27, 0.27, 0.27], ZP, 0.45), { anchor: dz(-0.2, -0.38, 0.3) });
    reg(G4, '卵母細胞', 'Oocyte', '講義：次級卵母細胞外圍繞放射冠，整個埋於卵丘之內。卵母細胞在濾泡腔開始形成時即達成熟體積。',
      ell(dz(-0.45, -0.38, 0.12), [0.2, 0.2, 0.2], OOC), { anchor: dz(-0.45, -0.38, 0.32) });
    textSprite('格蕾斐濾泡（剖面放大）', dz(0, 2.0, 0), 0.38);

    // ===== 物種卵巢外形 =====
    const Y = -2.75;
    reg(G5, '牛、綿羊：杏仁形', 'Cow / ewe: almond-shaped', '牛與綿羊的卵巢<b>形狀像杏仁</b>；濾泡與黃體在游離面突出（牛黃體常呈「冠」狀突出）。',
      [ell([-2.9, Y, 0], [0.55, 0.32, 0.3], 0xf2e2c8), ell([-2.6, Y + 0.25, 0.08], [0.2, 0.2, 0.18], 0xf2a51a), ell([-3.15, Y + 0.12, 0.18], [0.14, 0.14, 0.14], ANT, 0.7)], { anchor: [-2.9, Y - 0.3, 0.2] });
    reg(G5, '馬：豆形（排卵窩）', 'Mare: bean-shaped (ovulation fossa)', '馬的卵巢附著於卵巢系膜邊緣有一凹痕＝<b>排卵窩</b>，故形狀<b>像大豆</b>；初生小馬卵巢腹緣下凹，生殖上皮沉入而形成排卵窩。馬的黃體<b>埋置於基質中</b>、呈梨狀。',
      [ell([-0.6, Y, 0], [0.75, 0.45, 0.38], 0xf2e2c8), ell([-0.6, Y - 0.38, 0.05], [0.22, 0.12, 0.25], 0x6a4040)], { anchor: [-0.6, Y - 0.45, 0.2] });
    const SOW = []; const rs = rnd(21);
    for (let k = 0; k < 16; k++) SOW.push(ell([1.8 + (rs() - 0.5) * 0.9, Y + (rs() - 0.5) * 0.6, (rs() - 0.5) * 0.5], [0.15, 0.15, 0.15], k % 3 === 0 ? 0xe89a9a : 0xcfe6f5, 0.95));
    reg(G5, '豬：葡萄串狀', 'Sow: cluster of grapes', '豬的卵巢<b>像一簇葡萄</b>，濾泡（8–12 mm，每次10–25個）與黃體顯著突出，致使卵巢其他組織被遮蓋。', SOW, { anchor: [1.8, Y - 0.35, 0.2] });
  }
});
