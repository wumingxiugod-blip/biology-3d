/* 場景④：可動關節—膝關節（3D，沿內側髁的矢狀剖面；講義 p.6、Fig 8.8） */
(function () {
  let S = null, ANG = 0;
  const B = BONES, F = SDF, XC = -0.6;                // 剖面：x = XC，保留外側（x > XC）
  const AX = [0, -13.85, -0.4];                       // 屈膝的轉軸（通過股骨髁中心、沿 x）
  const cut = (d, x) => Math.max(d, XC - x);
  // 軟組織的 SDF
  const femK = (x, y, z) => Math.max(B.femur(x, y, z), y + 6);
  const tibK = (x, y, z) => Math.max(B.tibia(x, y, z), -26 - y);
  const fibK = (x, y, z) => Math.max(B.fibula(x, y, z), -26 - y);
  function meniscus(x, y, z, cx, cz, rx, rz, open) {
    const s = Math.hypot((x - cx) / rx, (z - cz) / rz), rad = (s - 1) * Math.min(rx, rz), dy = y + 15.62;
    let d = Math.hypot(rad / 0.42, dy / 0.3) * 0.3 - 0.3;
    if (d > 0.4) return d;
    d = F.smax(d, -(B.femur(x, y, z) - 0.17), 0.06);
    d = F.smax(d, -(B.tibia(x, y, z) - 0.17), 0.06);
    const o = Math.max(open * (cx - x) + 0.5, Math.abs(z - cz) - 0.42);
    return F.smax(d, -o, 0.12);
  }
  const menis = (x, y, z) => Math.min(meniscus(x, y, z, -1.2, -0.35, 1.08, 1.35, -1), meniscus(x, y, z, 1.25, -0.45, 0.98, 1.15, 1));
  function capsule(x, y, z) {
    if (y < -18.6 || y > -6.5) return 1;
    let c = F.smin(B.femur(x, y, z) - 0.36, B.tibia(x, y, z) - 0.36, 0.7);
    c = F.smax(c, y + 9.2, 0.6);
    c = F.smin(c, F.ell(x, y, z, [0.05, -9.4, 1.7], [1.5, 2.1, 0.5]), 0.6);   // 髕上滑囊（與關節腔相通）
    c = F.smax(c, -17.7 - y, 0.4);
    return F.smax(c, z - 2.3, 0.3);
  }
  const pouch = (x, y, z) => F.ell(x, y, z, [0.05, -9.4, 1.7], [1.5, 2.1, 0.5]);
  const fat = (x, y, z) => F.smax(F.smax(F.ell(x, y, z, [0.1, -15.9, 1.6], [1.15, 0.9, 0.42]), -(B.femur(x, y, z) - 0.2), 0.1), -(B.tibia(x, y, z) - 0.2), 0.1);
  const prePB = (x, y, z) => F.ell(x, y, z, [0.05, -12.2, 3.33], [1.0, 1.3, 0.13]);
  const infPB = (x, y, z) => F.ell(x, y, z, [0.2, -17.45, 1.8], [0.5, 0.3, 0.2]);
  const C = { fib: F.rgb(0xf1ece0), syn: F.rgb(0xee7f9a), cav: F.rgb(0x8fcaf2), men: F.rgb(0xdfe9ee), fat: F.rgb(0xf0cf5c), bur: F.rgb(0x6fb4f0) };
  function boneCls(x, y, z, d, cav, cartOK) {
    const tc = 0.12 + (cav !== null ? 0.25 : 0);
    return B.boneRegion(x, y, z, d, cav, tc, null, true, cartOK, [1.5, 1.15, 1.5]);
  }

  function build3D() {
    return B.once('kneeGeo', () => {
      const h = 0.085, g = {};
      g.fem = F.mesh((x, y, z) => cut(femK(x, y, z), x), [XC - 0.1, -15.6, -2.7], [3.0, -5.8, 2.0], h);
      g.tib = F.mesh((x, y, z) => cut(tibK(x, y, z), x), [XC - 0.1, -26.1, -2.4], [3.2, -15.7, 2.2], h);
      g.fibu = F.mesh(fibK, [1.2, -26.1, -1.9], [2.9, -16.6, 0.1], 0.07);
      g.pat = F.mesh((x, y, z) => cut(B.patella(x, y, z), x), [XC - 0.1, -14.6, 1.5], [1.6, -10.2, 3.4], 0.06);
      g.men = F.mesh((x, y, z) => cut(menis(x, y, z), x), [XC - 0.1, -16.4, -2.0], [2.6, -15.0, 1.4], 0.045);
      g.cap = F.mesh((x, y, z) => cut(capsule(x, y, z), x), [XC - 0.1, -18.4, -3.0], [3.7, -6.8, 2.6], 0.11);
      g.fat = F.mesh((x, y, z) => cut(fat(x, y, z), x), [XC - 0.1, -17.0, 0.9], [1.4, -14.8, 2.2], 0.05);
      g.pre = F.mesh(prePB, [-1.1, -13.6, 3.1], [1.2, -10.8, 3.55], 0.04);
      g.inf = F.mesh(infPB, [-0.4, -17.85, 1.5], [0.8, -17.05, 2.1], 0.04);
      const keepCut = (x, y, z, nx) => nx > -0.8 || x > XC + 0.12;
      g.femC = F.skin(g.fem, 0.16, (x, y, z, nx, ny, nz) => keepCut(x, y, z, nx) && (y < -12.6 || (y < -11.3 && z > 0.95 && Math.abs(x) < 1.6)));
      g.tibC = F.skin(g.tib, 0.16, (x, y, z, nx, ny, nz) => keepCut(x, y, z, nx) && y > -16.4 && ny > 0.45);
      g.patC = F.skin(g.pat, 0.15, (x, y, z, nx, ny, nz) => keepCut(x, y, z, nx) && nz < -0.35 && z < 2.4);
      Object.values(g).forEach(v => v.userData.shared = true);
      // 剖面（三組：固定、髕骨、脛骨）
      const plane = (y0, y1, z0, z1) => ({ o: [XC, y0, z0], u: [0, 0, 1], v: [0, 1, 0], w: z1 - z0, h: y1 - y0 });
      g.sFix = F.slices(plane(-17.8, -6.4, -3.0, 3.0), 40, (x, y, z) => {
        const df = femK(x, y, z);
        if (df < 0.17) { const r = boneCls(x, y, z, df, y > -9 ? B.femCav(x, y, z) : null, y < -12.6 || (y < -11.3 && z > 0.95)); if (r) return r; }
        const c = capsule(x, y, z); if (c >= 0) return null;
        if (B.tibia(x, y, z) < 0.17 || B.patella(x, y, z) < 0.16 || menis(x, y, z) < 0 || fat(x, y, z) < 0) return null;
        if (c > -0.1) return ['關節囊（纖維層）', C.fib];
        if (c > -0.18) return ['滑膜', C.syn];
        return pouch(x, y, z) < 0 && y > -11.2 ? ['髕上滑囊', C.bur] : ['關節腔（滑液）', C.cav];
      }, 0.004);
      g.sPat = F.slices(plane(-14.7, -10.1, 1.4, 3.6), 70, (x, y, z) => {
        const d = B.patella(x, y, z);
        if (d < 0.16) { const r = boneCls(x, y, z, d, null, d > 0 && z < 2.45); if (r) return r[0] === '關節軟骨' ? ['髕骨關節軟骨', r[1]] : r; }
        return prePB(x, y, z) < 0 ? ['髕前滑囊', C.bur] : null;
      }, 0.012);
      g.sTib = F.slices(plane(-26, -15.0, -2.6, 2.4), 40, (x, y, z) => {
        if (menis(x, y, z) < 0) return ['半月板', C.men];
        const d = tibK(x, y, z);
        if (d < 0.17) { const r = boneCls(x, y, z, d, y < -20.5 ? B.tibCav(x, y, z) : null, y > -16.5); if (r) return r[0] === '關節軟骨' ? ['脛骨關節軟骨', r[1]] : r; }
        if (fat(x, y, z) < 0) return ['髕下脂肪墊', C.fat];
        if (infPB(x, y, z) < 0) return ['髕下滑囊', C.bur];
        return null;
      }, 0.016);
      return g;
    });
  }

  function tendon(pts, r) { return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 12); }
  function setAngle(deg) {
    ANG = deg; if (!S) return;
    const a = deg * Math.PI / 180;
    S.tib.rotation.x = a; S.pat.rotation.x = a * 0.42; // 屈膝：脛骨繞 x 軸向後轉
    [S.tib, S.pat].forEach(g => g.updateMatrixWorld(true));
    const w = (grp, p) => V(...p).applyMatrix4(grp.matrixWorld);
    const pb = w(S.patIn, [0.05, -13.55, 2.5]), pt = w(S.patIn, [0.05, -10.55, 2.85]), tt = w(S.tibIn, [0.25, -18.3, 1.62]);
    S.lig.geometry.dispose(); S.lig.geometry = tendon([pb, pb.clone().lerp(tt, 0.5).add(V(0, 0, 0.25)), tt], 0.42);
    S.qt.geometry.dispose(); S.qt.geometry = tendon([V(0.05, -4.5, 1.55), V(0.05, -7.5, 2.15), pt.clone().lerp(V(0.05, -7.5, 2.15), 0.35), pt], 0.55);
    S.pLig.anchor.copy(pb).lerp(tt, 0.5).add(V(0, 0, 0.5)); S.pQt.anchor.set(0.05, -7.2, 2.7);
    const flexed = deg > 12;
    S.fixSoft.forEach(p => p.visible = !flexed && p._want !== false);
    if (S.note) S.note.style.display = flexed ? 'block' : 'none';
    updateAnchors(); if (S.ready) { rebuildList(); refresh(); }
  }

  SCENES.push({
    name: '④ 膝關節',
    title: '可動關節（滑液關節）：膝關節',
    camera: { pos: [-26, -9, 9], target: [0, -14.2, 0.2] },
    controls: [
      { label: '🔍 剖面', fn() { flyTo([-26, -9, 9], [0, -14.2, 0.2]); } },
      { label: '🔍 關節腔與半月板', fn() { flyTo([-12, -14.5, 3], [-1.25, -15.6, 0]); } },
      { label: '🔍 髕骨與滑囊', fn() { flyTo([-11, -10.5, 7], [-1.25, -12.5, 2.4]); } },
      { label: '🔍 外側立體', fn() { flyTo([22, -8, 16], [0.5, -15, 0]); } },
      { label: '🔍 後面', fn() { flyTo([4, -10, -26], [0.5, -15, 0]); } }
    ],
    desc: `
  <p><b>可動關節</b>（synovial joint，滑液關節）：位於長骨端，兩骨之間有<b>關節腔</b>。</p>
  <ul>
  <li>兩骨相對的關節面覆蓋<b>關節軟骨</b>。</li>
  <li>外包<b>關節囊</b>（纖維層），內襯<b>滑膜</b>；滑膜分泌<b>滑液</b>，可擴散並具<b>潤滑</b>作用（也提供關節軟骨養分）。</li>
  </ul>
  <table>
  <tr><td><b>滑囊</b> bursa</td><td>充滿滑液的小囊，<b>減少摩擦、吸震</b>（髕上、髕前、髕下滑囊）</td></tr>
  <tr><td><b>脂肪墊</b> fat pad</td><td><b>保護</b>軟骨、填補空隙（髕下脂肪墊）</td></tr>
  <tr><td><b>半月板</b> meniscus</td><td>股骨與脛骨之間 C 形的纖維軟骨墊；<b>導引滑液流動</b>、使關節面更吻合並分散壓力</td></tr>
  </table>
  <p class="hint">右膝，沿<b>內側髁</b>外緣縱切（矢狀面）後從內側觀看：右方為前、左方為後。類風濕性關節炎即滑膜與滑液發炎，使關節軟骨受損。</p>`,
    build() {
      S = {};
      const G = build3D();
      const add = (grp, zh, en, info, meshes, anchor, opt = {}) => { meshes = [].concat(meshes); return meshes.length ? reg(grp, zh, en, info, meshes, Object.assign({ anchor }, opt)) : null; };
      const sl = (set, k) => set[k] ? [set[k]] : [];
      const boneSl = set => ['緻密骨', '骨小樑', '紅骨髓', '黃骨髓', '骨內膜'].flatMap(k => sl(set, k));
      // 固定部分（股骨、關節囊）
      add('骨', '股骨（遠端）', 'Femur', '大腿骨的遠端；兩個<b>股骨髁</b>與脛骨形成關節，前方的滑車面（髕骨面）與髕骨形成關節。剖面可見外圍的緻密骨與內部的海綿骨（骨小樑＋紅骨髓）。', [new THREE.Mesh(G.fem, mat(BONE)), ...boneSl(G.sFix)], [XC, -9.5, -0.4]);
      add('軟骨', '股骨關節軟骨', 'Femoral articular cartilage', '覆蓋股骨髁與髕骨面的透明軟骨，表面光滑以減少摩擦。', [new THREE.Mesh(G.femC, mat(CART)), ...sl(G.sFix, '關節軟骨')], [XC, -15.2, -1.2]);
      S.fixSoft = [
        add('關節腔', '關節腔（滑液）', 'Joint cavity with synovial fluid', '兩骨之間的空腔，充滿<b>滑液</b>：潤滑關節、減少摩擦並供應關節軟骨養分。向上延伸為髕上滑囊。', sl(G.sFix, '關節腔（滑液）'), [XC, -14.6, -2.3]),
        add('關節腔', '滑膜', 'Synovial membrane', '襯在關節囊內面的薄膜，分泌滑液。', sl(G.sFix, '滑膜'), [XC, -16.8, -2.55]),
        add('關節腔', '關節囊（纖維層）', 'Fibrous capsule', '包住整個關節的緻密結締組織，與韌帶共同穩定關節。', [new THREE.Mesh(G.cap, mat(0xf2efe6, 0.22)), ...sl(G.sFix, '關節囊（纖維層）')], [XC, -12.0, -2.85]),
        add('滑囊與脂肪墊', '髕上滑囊', 'Suprapatellar bursa', '位於股四頭肌腱與股骨之間、與關節腔相通的大型滑囊。', sl(G.sFix, '髕上滑囊'), [XC, -8.8, 1.7])
      ].filter(Boolean);
      // 髕骨組
      S.pat = new THREE.Group(); S.pat.position.set(...AX); CUR.root.add(S.pat); S.patIn = new THREE.Group(); S.patIn.position.set(-AX[0], -AX[1], -AX[2]); S.pat.add(S.patIn);
      [add('骨', '髕骨', 'Patella', '膝蓋骨：包在股四頭肌腱中的種子骨，後面與股骨髕骨面形成關節，增加股四頭肌的力臂。', [new THREE.Mesh(G.pat, mat(BONE)), ...boneSl(G.sPat)], [0.05, -11.0, 3.3]),
        add('軟骨', '髕骨關節軟骨', 'Patellar cartilage', '髕骨後面的關節軟骨（人體最厚的關節軟骨之一）。', [new THREE.Mesh(G.patC, mat(CART)), ...sl(G.sPat, '髕骨關節軟骨')], [XC, -12.4, 1.85]),
        add('滑囊與脂肪墊', '髕前滑囊', 'Prepatellar bursa', '位於髕骨前方與皮膚之間的滑囊（長期跪姿易發炎）。', [new THREE.Mesh(G.pre, mat(0x6fb4f0, 0.6)), ...sl(G.sPat, '髕前滑囊')], [0.05, -13.2, 3.55])
      ].filter(Boolean).forEach(p => attachPart(p, S.patIn));
      // 脛骨組
      S.tib = new THREE.Group(); S.tib.position.set(...AX); CUR.root.add(S.tib); S.tibIn = new THREE.Group(); S.tibIn.position.set(-AX[0], -AX[1], -AX[2]); S.tib.add(S.tibIn);
      [add('骨', '脛骨（近端）', 'Tibia', '小腿內側的主要骨；上端的<b>脛骨平台</b>（內、外側髁）與股骨髁形成關節。前方隆起為<b>脛骨粗隆</b>（髕韌帶附著）。', [new THREE.Mesh(G.tib, mat(BONE)), ...boneSl(G.sTib)], [XC, -21, -0.4]),
        add('骨', '腓骨（頭）', 'Fibula', '小腿外側的細骨，上端（腓骨頭）與脛骨外側髁下方形成關節，不參與膝關節本身。', new THREE.Mesh(G.fibu, mat(BONE)), [2.6, -18.2, -1.2]),
        add('軟骨', '脛骨關節軟骨', 'Tibial cartilage', '脛骨平台上的關節軟骨。', [new THREE.Mesh(G.tibC, mat(CART)), ...sl(G.sTib, '脛骨關節軟骨')], [XC, -16.0, -1.9]),
        add('軟骨', '半月板', 'Menisci', '位於股骨髁與脛骨平台之間、呈 <b>C 形</b>的<b>纖維軟骨</b>（剖面為三角形：前角與後角）。內側半月板較大、呈 C 形；外側較圓。加深關節窩、分散壓力並<b>導引滑液流動</b>。', [new THREE.Mesh(G.men, mat(0xdfe9ee)), ...sl(G.sTib, '半月板')], [XC, -15.6, 1.1]),
        add('滑囊與脂肪墊', '髕下脂肪墊', 'Infrapatellar fat pad', '位於髕韌帶後方、關節腔前方的脂肪組織，保護並緩衝。', [new THREE.Mesh(G.fat, mat(0xf0cf5c)), ...sl(G.sTib, '髕下脂肪墊')], [XC, -16.3, 1.95]),
        add('滑囊與脂肪墊', '髕下滑囊（深）', 'Infrapatellar bursa', '位於髕韌帶與脛骨之間的滑囊，減少摩擦。', [new THREE.Mesh(G.inf, mat(0x6fb4f0, 0.6)), ...sl(G.sTib, '髕下滑囊')], [0.2, -17.6, 2.2])
      ].filter(Boolean).forEach(p => attachPart(p, S.tibIn));
      // 肌腱與韌帶（隨角度重建）
      S.qt = new THREE.Mesh(new THREE.BufferGeometry(), mat(0xf4f1ea)); S.pQt = add('肌腱與韌帶', '股四頭肌腱', 'Quadriceps tendon', '股四頭肌的肌腱，包住髕骨。', S.qt, [0, 0, 0]);
      S.lig = new THREE.Mesh(new THREE.BufferGeometry(), mat(0xf4f1ea)); S.pLig = add('肌腱與韌帶', '髕韌帶', 'Patellar ligament', '由髕骨下緣連到脛骨粗隆（股四頭肌腱的延續）；膝跳反射敲擊處。', S.lig, [0, 0, 0]);
      textSprite('前 Anterior →', [XC - 0.2, -7.0, 2.6], 0.55, '#cfe3f5'); textSprite('← 後 Posterior', [XC - 0.2, -7.0, -2.4], 0.55, '#cfe3f5');
      setAngle(ANG);
    },
    panel(box) {
      slider(box, '屈膝角度（°）', 0, 110, ANG, 1, v => setAngle(v));
      S.ready = true;
      S.note = note(box, '屈膝時暫時隱藏關節囊與滑液的剖面（它們會隨動作變形）。');
      note(box, '膝關節主要做<b>屈曲／伸展</b>（屈戌關節的一種；屈膝時尚有少量旋轉）。屈膝時髕骨沿股骨髕骨面下滑。第一次開啟需數秒建立模型。');
      setAngle(ANG);
    }
  });
})();
