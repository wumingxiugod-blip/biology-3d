/* 場景⑥–⑦：鳥類（雄禽）生殖系統與交接器官（背面觀，左為尾側） */

/* ---------- ⑥ 雄禽生殖系統整體 ---------- */
SCENES.push({
  name: '⑥ 鳥類整體',
  title: '雄禽生殖系統（背面觀示意）',
  camera: { pos: [-0.3, 6.0, 4.8], target: [-0.3, -0.05, 0] },
  desc: `<p>雄禽生殖器官：成對<b>睪丸、附睪、輸精管</b>與一個<b>交接器</b>，全部位於<b>體內</b>。<b>無輔性腺</b>（囊腺、攝護腺、尿道球腺），故精液體積小；泄殖腔旁有輔助生殖器官（泄殖腔旁血管體、淋巴皺褶、背肛室腺）對精漿也有貢獻。</p>
  <p>睪丸位於<b>腎臟前葉腹前端</b>，內側靠近主動脈與後腔靜脈，左側略大於右側；性成熟前或無性活動時呈<b>淡棕／黃色</b>，性活動時變<b>白色</b>。無縱隔與小葉。</p>
  <p>可用右上方按鈕切換睪丸狀態。交接器官請看下一頁「⑦ 鳥類交接器官」。</p>`,
  controls: [{ label: '🔄 切換睪丸：性活動期／非活動期', fn() { window._active = !window._active; window._applyTestis && window._applyTestis(); } }],
  build() {
    const S = [1, -1];
    const act = () => window._active ? 0xfaf6ea : 0xd2a86a;
    window._active = false;
    // 腎臟
    const KID = [];
    S.forEach(s => [[0.75, 0.45, 0.22], [-0.05, 0.4, 0.2], [-0.85, 0.45, 0.2]].forEach((k, i) => KID.push(ell([k[0], -0.04, s * 0.5], [k[1], 0.13, k[2]], 0x9a4a3a, 0.85))));
    reg('參考構造', '腎臟（前、中、後葉）', 'Kidney', '睪丸位於腎臟前葉的腹前端；輸精管沿輸尿管行進至泄殖腔。', KID, { anchor: [-0.05, 0.1, 0.5] });
    reg('參考構造', '主動脈', 'Aorta', '睪丸內側緊鄰主動脈與後腔靜脈。', tube([[1.6, 0.14, 0], [-1.7, 0.14, 0]], 0.04, 0xe03030), { anchor: [0.2, 0.18, 0] });
    reg('參考構造', '後腔靜脈', 'Caudal vena cava', '與主動脈並行，睪丸內側緊鄰。', tube([[1.6, 0.04, 0], [-1.7, 0.04, 0]], 0.055, 0x3b6fe0), { anchor: [-0.7, 0.04, 0] });
    reg('參考構造', '直腸／結腸', 'Rectum / colon', '消化道末端，開口於泄殖腔的糞道（僅供定位）。', tube([[1.2, -0.3, 0], [0.2, -0.28, 0], [-0.9, -0.25, 0], [-1.5, -0.12, 0]], 0.055, 0x9c7a5b, 0.55), { anchor: [-0.4, -0.27, 0] });
    // 睪丸、附睪
    const TE = [], EP = [], DD = [], UR = [], RC = [], PA = [], PV = [];
    S.forEach(s => {
      TE.push(ell([1.08, -0.15, s * 0.34], s > 0 ? [0.36, 0.18, 0.18] : [0.3, 0.15, 0.15], act()));
      EP.push(ell([0.98, -0.06, s * 0.21], [0.11, 0.05, 0.05], 0xc98d68));
      const pts = []; const n = 28;
      for (let i = 0; i <= n; i++) { const u = i / n, x = 0.92 - u * 2.62, sg = i % 2 ? 1 : -1; pts.push([x, -0.06 + sg * 0.018, s * (0.21 - 0.09 * u + sg * 0.03)]); }
      DD.push(tube(pts, 0.014, 0xffffff, 1, 6));
      UR.push(tube([[0.6, -0.1, s * 0.4], [-0.5, -0.1, s * 0.31], [-1.3, -0.09, s * 0.2], [-1.78, -0.05, s * 0.09]], 0.022, 0xe6d88a, 0.8));
      RC.push(ell([-1.68, -0.03, s * 0.115], [0.1, 0.04, 0.04], 0xb7d9a8));
      PA.push(cone([-1.74, -0.02, s * 0.1], [-1.8, 0.0, s * 0.055], 0.025, 0xb7d9a8));
      PV.push(ell([-1.66, -0.1, s * 0.24], [0.1, 0.06, 0.06], 0xe06a8a));
    });
    reg('睪丸與管道', '睪丸', 'Testis', '成對（左略大於右）豆狀／卵圓形，外覆白膜與腹膜臟層，以<b>睪丸系膜</b>連至背側體壁；<b>無縱隔、未分小葉</b>。內部由互相吻合的迂曲<b>生精細管</b>（含賽透力氏細胞與各階段生殖細胞；細胞間緊密接合構成血睪障壁）與<b>間隙組織</b>（來狄吉細胞分泌雄性素）構成。', TE, { anchor: [1.2, -0.15, 0.4] });
    window._applyTestis = () => TE.forEach(m => m.material.color.setHex(act()));
    reg('睪丸與管道', '附睪', 'Epididymis', '鳥類附睪很小，位於睪丸背內側。生精細管→睪丸網→睪丸輸出小管→附睪→輸精管（輸出小管明顯分近端寬而多皺褶、遠端窄而平直兩區）。', EP, { anchor: [0.98, -0.02, 0.25] });
    reg('睪丸與管道', '輸精管', 'Ductus deferens', '極為迂曲呈鋸齒狀，沿輸尿管行進；是鳥類<b>精子成熟的處所</b>。伴行血管<b>不形成蔓狀叢</b>。進入泄殖腔尿殖室(urodeum)的背壁。', DD, { anchor: [-0.3, -0.02, 0.18] });
    reg('參考構造', '輸尿管', 'Ureter', '輸精管沿輸尿管行進，兩者皆開口於泄殖腔的尿殖室。', UR, { anchor: [-0.6, -0.1, 0.33] });
    reg('睪丸與管道', '貯精器', 'Receptaculum ductus deferentis', '進入泄殖腔前，輸精管變寬、變直形成貯精器，以乳頭狀突起伸入尿殖室。', RC, { anchor: [-1.68, 0.02, 0.15] });
    reg('睪丸與管道', '輸精管乳頭', 'Papilla of ductus deferens', '貯精器末端突入尿殖室的乳頭；射精時精液由此流入尿殖室，再流入肛室。', PA, { anchor: [-1.78, 0.02, 0.07] });
    // 泄殖腔
    reg('泄殖腔與輔助生殖器', '糞道', 'Coprodeum', '泄殖腔最前方的腔室，接收來自直腸的糞便。', ell([-1.55, 0, 0], [0.22, 0.17, 0.17], 0xd9a08a, 0.55), { anchor: [-1.5, 0.15, 0.0] });
    reg('泄殖腔與輔助生殖器', '尿殖室', 'Urodeum', '泄殖腔中間腔室；輸精管（與輸尿管）開口於其背壁。射精時精液先流入此處。', ell([-1.82, 0, 0], [0.2, 0.17, 0.17], 0xe3b09a, 0.55), { anchor: [-1.82, 0.16, 0.0] });
    reg('泄殖腔與輔助生殖器', '肛室', 'Proctodeum', '泄殖腔最後方腔室，通向泄殖腔口（肛門）。精液由尿殖室流入此處再排出。', [ell([-2.07, 0, 0], [0.18, 0.15, 0.15], 0xeab9a4, 0.55), ring(V(-2.26, 0, 0), V(1, 0, 0), 0.12, 0.03, 0xd0707a)], { anchor: [-2.15, 0.15, 0.0] });
    reg('泄殖腔與輔助生殖器', '泄殖腔旁血管體', 'Paracloacal vascular body', '位於輸精管貯精器旁，性興奮時把動脈血<b>超過濾而產生淋巴液</b>；淋巴液使淋巴皺褶腫脹，造成非插入型陰莖外翻或插入型陰莖勃起，也貢獻精漿。', PV, { anchor: [-1.66, -0.12, 0.28] });
    const LF = []; S.forEach(s => LF.push(ell([-2.07, -0.13, s * 0.07], [0.13, 0.04, 0.05], 0xbfd8f0, 0.9)));
    reg('泄殖腔與輔助生殖器', '淋巴皺褶', 'Lymphatic fold', '位於肛室腹側內，性興奮時被血管體來的淋巴液充脹腫脹，使非插入型陰莖外翻、插入型陰莖勃起。', LF, { anchor: [-2.07, -0.17, 0.12] });
    reg('泄殖腔與輔助生殖器', '背肛室腺', 'Dorsal proctodeal gland', '位於肛室背壁的腺體，分泌物與血管體淋巴同為鳥類精漿成分來源（因無輔性腺）。', ell([-2.07, 0.16, 0], [0.12, 0.05, 0.1], 0x8fbf6a), { anchor: [-2.07, 0.22, 0] });
  }
});

/* ---------- ⑦ 雄禽交接器官三型 ---------- */
SCENES.push({
  name: '⑦ 鳥類交接器官',
  title: '雄禽交接器官的三種類型（泄殖腔後方觀示意）',
  camera: { pos: [0, 3.0, 11.0], target: [0.0, 0.3, 0.5] },
  desc: `<p>97% 的鳥類<b>沒有插入型陰莖</b>，僅 3% 有。禽類交接器僅供生殖、<b>不兼排尿</b>；勃起是由<b>淋巴液</b>流入（不是血液）。</p>
  <p><b>(一) 缺乏陰莖</b>（鸚鵡、燕雀、鴿、猛禽等）：藉外翻的泄殖腔直接把精液送入雌性輸卵管，稱<b>泄殖腔接吻</b>。<br>
  <b>(二) 非插入型陰莖</b>（雞、火雞、鵪鶉、珠雞等鶉雞目）：泄殖腔腹唇上有發育不全、不能突出的陰莖。<br>
  <b>(三) 插入型陰莖</b>（平胸鳥類、雁鴨類）：長而可插入雌性泄殖腔的螺旋狀（偽）陰莖，未勃起時藏於陰莖袋。</p>`,
  build() {
    const XA = -2.9, XB = 0, XC = 2.9;
    const vent = x => ring(V(x, 0, 0), V(0, 0, 1), 0.5, 0.09, 0xd4707a);
    // ---- (一) ----
    const G1 = '(一) 缺乏陰莖：泄殖腔接吻';
    reg(G1, '外翻泄殖腔（泄殖腔口）', 'Everted cloaca (cloacal kiss)', '交配時雄禽將<b>泄殖腔外翻</b>，與雌禽泄殖腔緊貼，直接把精液轉移到雌性輸卵管開口處，稱為<b>泄殖腔接吻(cloacal kiss)</b>。', [vent(XA), ell([XA, 0, 0.12], [0.4, 0.4, 0.22], 0xe88a92, 0.8)], { anchor: [XA + 0.4, 0.35, 0.2] });
    reg(G1, '輸精管乳頭（開口）', 'Papillae of ductus deferens', '左右輸精管貯精器末端的乳頭，外翻泄殖腔時精液由此排出。', [cone([XA - 0.15, 0.02, 0.2], [XA - 0.15, 0.02, 0.45], 0.06, 0xf2f0d0), cone([XA + 0.15, 0.02, 0.2], [XA + 0.15, 0.02, 0.45], 0.06, 0xf2f0d0)], { anchor: [XA, 0.02, 0.45] });
    // ---- (二) ----
    const G2 = '(二) 非插入型陰莖：雞／火雞／鵪鶉';
    reg(G2, '泄殖腔口', 'Vent (cloacal opening)', '泄殖腔出口，其腹唇上有非插入型陰莖。', [vent(XB), ell([XB, 0.05, 0.1], [0.38, 0.36, 0.2], 0xe88a92, 0.7)], { anchor: [XB + 0.45, 0.3, 0.1] });
    reg(G2, '輸精管乳頭', 'Papillae of ductus deferens', '精液自輸精管乳頭排出，沿陰莖正中溝向下流入雌性輸卵管。', [cone([XB - 0.15, 0.1, 0.2], [XB - 0.15, 0.1, 0.4], 0.05, 0xf2f0d0), cone([XB + 0.15, 0.1, 0.2], [XB + 0.15, 0.1, 0.4], 0.05, 0xf2f0d0)], { anchor: [XB + 0.15, 0.2, 0.4] });
    const LP = [ell([XB - 0.14, -0.44, 0.2], [0.1, 0.1, 0.14], 0xf8f0e0), ell([XB + 0.14, -0.44, 0.2], [0.1, 0.1, 0.14], 0xf8f0e0)];
    reg(G2, '側陰莖體', 'Lateral phallic bodies', '位於泄殖腔腹唇上的<b>兩個短而圓的構造</b>；性興奮時因淋巴液流入而腫脹勃起（發育不完全，不能突出）。', LP, { anchor: [XB + 0.3, -0.5, 0.25] });
    reg(G2, '陰莖正中溝', 'Median groove', '兩側陰莖體之間的溝，勃起時<b>允許精液向下流入</b>雌性輸卵管。', cyl([XB, -0.4, 0.14], [XB, -0.45, 0.32], 0.02, 0x4a2a2a), { anchor: [XB, -0.62, 0.3] });
    reg(G2, '腫脹的淋巴皺褶', 'Lymphatic fold (engorged)', '性興奮時被血管體淋巴液充脹，推動兩個側陰莖體勃起。', ell([XB, -0.3, 0.05], [0.28, 0.13, 0.12], 0xbfd8f0, 0.45), { anchor: [XB - 0.45, -0.3, 0.05] });
    // ---- (三) ----
    const G3 = '(三) 插入型陰莖：鵝／鴨／平胸鳥類';
    const base = [XC, -0.2, 0.15], apex = [XC, 1.5, 1.5];
    const axis = lineCurve(base, apex), turns = 2.5, R = 0.3;
    reg(G3, '泄殖腔口', 'Vent', '陰莖由泄殖腔腹側的陰莖袋勃起伸出。', vent(XC), { anchor: [XC + 0.55, -0.1, 0.0] });
    reg(G3, '皮下囊（粗囊）', 'Cutaneous sac (sacci cutanei phalli)', '構成螺旋狀陰莖的<b>粗大囊</b>，與細小的腺體囊紐絞而成。以鵝為例，螺旋逆時針約2.5圈，排成雙U形管。', tube(helixAlong(axis, R, turns, 0, 260), 0.105, 0xe8b88a, 1, 2), { anchor: [XC + 0.45, 0.7, 0.9] });
    reg(G3, '腺體囊（細囊）', 'Glandular sac (sacci glandularis phalli)', '與皮下囊紐絞的<b>細小囊</b>，尖端有腺囊開口，可排出精漿。', tube(helixAlong(axis, R, turns, Math.PI, 260), 0.06, 0x6fa0d8, 1, 2), { anchor: [XC - 0.4, 0.9, 1.1] });
    reg(G3, '螺旋溝／陰莖摺縫', 'Phallic flexure (spiral groove)', '兩管之間的螺旋縱溝（陰莖摺縫 Flexura phalli）；射精時精液沿此溝流入雌性泄殖腔。', tube(helixAlong(axis, R, turns, Math.PI / 2, 260), 0.03, 0x3a2418, 1, 2), { anchor: [XC, 0.5, 0.75] });
    reg(G3, '軟骨體', 'Cartilaginous body', '陰莖<b>基部(base)</b>的支持構造（勃起時全長約8–10 cm，分基部、體部、尖端）。', ell([XC, -0.22, 0.12], [0.28, 0.18, 0.2], 0xf5f5f0), { anchor: [XC - 0.3, -0.3, 0.1] });
    reg(G3, '陰莖懸韌帶', 'Suspensorium phalli', '把陰莖基部固定在泄殖腔壁的韌帶。', [cyl([XC - 0.2, -0.3, 0.05], [XC - 0.65, -0.1, -0.1], 0.03, 0xe0d3b0), cyl([XC + 0.2, -0.3, 0.05], [XC + 0.65, -0.1, -0.1], 0.03, 0xe0d3b0)], { anchor: [XC - 0.65, -0.15, -0.1] });
    reg(G3, '陰莖袋', 'Phallic pouch', '未勃起時陰莖外面被覆的<b>雙層腹膜</b>構成的袋，把陰莖收藏在泄殖腔內。', (() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.0, 24, 1, true), mat(0x9fc5e8, 0.14)); m.position.set(XC, 0.15, 0.4); m.quaternion.setFromUnitVectors(V(0, 1, 0), V(0, 0.6, 0.8)); return m; })(), { anchor: [XC + 0.55, 0.0, 0.5] });
    const RD = [];
    for (let i = 1; i < 14; i++) {
      const t = i / 14, p = axis.getPointAt(t), a = Math.PI * 2 * t * turns, rad = V(0, 0, 0);
      const fr = axis.computeFrenetFrames(2, false), N = fr.normals[0], B = fr.binormals[0];
      rad.addScaledVector(N, Math.cos(a)).addScaledVector(B, Math.sin(a));
      const pt = p.clone().addScaledVector(rad, R + 0.1), Tt = axis.getTangentAt(t);
      RD.push(cone(pt.clone().toArray(), pt.clone().addScaledVector(Tt, -0.14).addScaledVector(rad, 0.03).toArray(), 0.03, 0xf2ead8));
      RD[RD.length - 1].quaternion.setFromUnitVectors(V(0, 1, 0), Tt.clone().multiplyScalar(-1).addScaledVector(rad, 0.2).normalize());
    }
    reg(G3, '陰莖脊', 'Phallic ridges', '體部表面佈滿<b>朝向基部</b>的小脊，勃起插入後有助固定於雌性泄殖腔。', RD, { anchor: [XC + 0.45, 0.2, 0.55] });
    reg(G3, '尖端（腺囊開口）', 'Apex (opening of glandular sac)', '陰莖末端，具有一個腺囊的開口，可排出<b>精漿</b>。', [ell(apex, [0.1, 0.1, 0.1], 0xe0a0a0), ring(V(...apex), V(0, 0.6, 0.8), 0.06, 0.02, 0x4a2a2a)], { anchor: [XC + 0.15, 1.6, 1.55] });
  }
});
