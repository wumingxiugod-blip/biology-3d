/* 場景④：可動關節—膝關節矢狀剖面（講義 p.6、Fig 8.8） */
(function () {
  let S = null, ANG = 0;
  const KC = [-0.2, 0.4], R = 2.3, DEP = 3.6;
  const arc = (a0, a1, r, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; o.push([KC[0] + r * Math.cos(a), KC[1] + r * Math.sin(a)]); } return o; };
  const ellPts = (cx, cy, rx, ry, n = 40, rot = 0) => { const o = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, x = rx * Math.cos(a), y = ry * Math.sin(a); o.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return o; };
  const FEMUR = [[-1.7, 13], [-1.75, 3.2], ...arc(160, 380, R), [1.75, 3.2], [1.5, 5], [1.5, 13]];
  const TIBIA = [[-2.6, -2.3], [2.3, -2.3], [2.3, -3.2], [2.1, -4.0], [2.05, -4.7], [1.6, -5.6], [1.3, -7], [1.3, -14], [-1.4, -14], [-1.4, -7], [-2.4, -4], [-2.6, -2.3]];
  const PAT = ellPts(3.05, 2.6, 0.9, 1.6, 40, 0.08);
  const rotP = (p, a) => { const c = Math.cos(a), s = Math.sin(a), x = p[0] - KC[0], y = p[1] - KC[1]; return [KC[0] + x * c - y * s, KC[1] + x * s + y * c]; };

  function bone(poly, col, z = 0) { return extrudePoly(poly, DEP, col, 1, z); }
  function face(poly, col, z, o = 1, tex) {
    const sh = new THREE.Shape(); poly.forEach((p, i) => i ? sh.lineTo(...p) : sh.moveTo(...p));
    const g = new THREE.ShapeGeometry(sh);
    if (tex) { const uv = [], P = g.attributes.position; for (let i = 0; i < P.count; i++) uv.push(P.getX(i) * 0.35, P.getY(i) * 0.35); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); }
    const m = new THREE.Mesh(g, tex ? mat(0xffffff, o, { map: tex }) : mat(col, o)); m.position.z = z; return m;
  }
  const band = (line, th, col, z, d = 0.02, o = 1) => extrudePoly(bandPts(line, th), d, col, o, z);

  function setAngle(deg) {
    ANG = deg; if (!S) return;
    const a = -deg * Math.PI / 180, ap = a * 0.42;
    S.tib.rotation.z = a; S.pat.rotation.z = ap;
    [S.tib, S.pat].forEach(g => { g.position.set(KC[0], KC[1], 0); });
    S.tibIn.position.set(-KC[0], -KC[1], 0); S.patIn.position.set(-KC[0], -KC[1], 0);
    const pb = rotP([3.0, 1.05], ap), pt = rotP([3.15, 4.15], ap), tt = rotP([2.15, -4.6], a);
    const lig = [pb, [(pb[0] + tt[0]) / 2 + 0.25, (pb[1] + tt[1]) / 2], tt];
    S.lig.geometry.dispose(); S.lig.geometry = extrudePoly(bandPts(lig, 0.55), 2.2, 0xf4f1ea, 1, 0.05).geometry;
    const qt = [[2.75, 13], [2.85, 8], [(2.9 + pt[0]) / 2, (6 + pt[1]) / 2 + 1], pt];
    S.qt.geometry.dispose(); S.qt.geometry = extrudePoly(bandPts(qt, 0.75), 2.4, 0xf4f1ea, 1, 0.05).geometry;
    S.pLig.anchor.set((pb[0] + tt[0]) / 2 + 0.6, (pb[1] + tt[1]) / 2, 0.1);
    S.tib.updateMatrixWorld(true); S.pat.updateMatrixWorld(true); updateAnchors();
  }

  SCENES.push({
    name: '④ 膝關節',
    title: '可動關節（滑液關節）：膝關節矢狀剖面',
    camera: { pos: [3, 1, 30], target: [0.5, 0, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([3, 1, 30], [0.5, 0, 0]); } },
      { label: '🔍 關節腔', fn() { flyTo([1.5, 0, 12], [0.5, -0.5, 0]); } },
      { label: '🔍 髕骨與滑囊', fn() { flyTo([5, 2, 11], [3, 1.5, 0]); } },
      { label: '🔍 立體', fn() { flyTo([14, 6, 14], [0, 0, -1.5]); } }
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
  <tr><td><b>半月板</b> meniscus</td><td>股骨與脛骨之間的纖維軟骨墊；<b>導引滑液流動</b>、使關節面更吻合並分散壓力</td></tr>
  </table>
  <p class="hint">類風濕性關節炎即滑膜與滑液發炎，使關節軟骨受損。拖動右側滑桿可屈膝；左下切開面為矢狀剖面（前方＝右）。</p>`,
    build() {
      S = {};
      const sT = spongyTex(12);
      reg('骨', '股骨', 'Femur', '大腿骨的遠端；兩個<b>股骨髁</b>與脛骨形成關節，前方的滑車面與髕骨形成關節。',
        [bone(FEMUR, BONE), face(FEMUR, 0, 0.01, 1, sT), band(FEMUR.concat([FEMUR[0]]), 0.32, 0xe2cfa6, 0.02), face([[-1.2, 6.5], [1.05, 6.5], [1.05, 13], [-1.2, 13]], MARY, 0.025)], { anchor: [-1.2, 8, 0.1] });
      reg('軟骨', '關節軟骨', 'Articular cartilage', '覆蓋股骨髁、股骨滑車、脛骨平台與髕骨後面的透明軟骨，表面光滑以減少摩擦。',
        [band(arc(178, 382, R + 0.12), 0.32, CART, 0.04), band([[1.95, 1.3], [1.85, 2.6], [1.62, 4.2]], 0.3, CART, 0.04)], { anchor: [-1.5, -1.6, 0.1] });
      reg('骨', '軟骨下骨板', 'Subchondral plate', '緊貼關節軟骨下方的緻密骨薄板，支撐軟骨。', band(arc(200, 340, R - 0.2), 0.14, 0xb8a070, 0.045), { anchor: [0.8, -1.5, 0.1] });

      // 脛骨（可旋轉）
      S.tib = new THREE.Group(); CUR.root.add(S.tib); S.tibIn = new THREE.Group(); S.tib.add(S.tibIn);
      const tP = [];
      tP.push(reg('骨', '脛骨', 'Tibia', '小腿內側的主要骨；上端平坦的<b>脛骨平台</b>與股骨髁形成關節。前方隆起為<b>脛骨粗隆</b>（髕韌帶附著）。',
        [bone(TIBIA, BONE), face(TIBIA, 0, 0.01, 1, sT), band(TIBIA, 0.32, 0xe2cfa6, 0.02), face([[-1.0, -14], [0.95, -14], [0.95, -7.5], [-1.0, -7.5]], MARY, 0.025)], { anchor: [-1.4, -8, 0.1] }));
      tP.push(reg('軟骨', '脛骨平台的關節軟骨', 'Tibial articular cartilage', '脛骨上端的關節軟骨。', band([[-2.5, -2.15], [-0.2, -2.1], [2.2, -2.15]], 0.3, CART, 0.04), { anchor: [-0.3, -2.1, 0.1] }));
      tP.push(reg('軟骨', '半月板', 'Menisci', '位於股骨髁與脛骨平台之間、呈 C 形的<b>纖維軟骨</b>（剖面為三角形，前後各一）。加深關節窩、分散壓力並<b>導引滑液流動</b>。',
        [extrudePoly([[-2.6, -1.98], [-1.25, -1.98], [-2.6, -1.05]], DEP, 0xe8f0f4, 1, 0.03), extrudePoly([[2.3, -1.98], [1.15, -1.98], [2.3, -1.15]], DEP, 0xe8f0f4, 1, 0.03)], { anchor: [-2.2, -1.5, 0.1] }));
      tP.push(reg('滑囊與脂肪墊', '髕下滑囊（深）', 'Infrapatellar bursa', '位於髕韌帶與脛骨之間的滑囊，減少摩擦。', face(ellPts(2.55, -3.9, 0.22, 0.55), 0x7fc8ff, 0.05, 0.85), { anchor: [2.7, -3.9, 0.1] }));
      tP.forEach(p => attachPart(p, S.tibIn));
      // 髕骨（隨屈膝下滑）
      S.pat = new THREE.Group(); CUR.root.add(S.pat); S.patIn = new THREE.Group(); S.pat.add(S.patIn);
      const pP = [];
      pP.push(reg('骨', '髕骨', 'Patella', '膝蓋骨：包在股四頭肌腱中的種子骨，後面與股骨滑車形成關節，增加股四頭肌的力臂。',
        [extrudePoly(PAT, 2.2, BONE, 1, 0), face(PAT, 0, 0.01, 1, sT), band(PAT.concat([PAT[0]]), 0.22, 0xe2cfa6, 0.02)], { anchor: [3.6, 3.3, 0.1] }));
      pP.push(reg('軟骨', '髕骨關節軟骨', 'Patellar cartilage', '髕骨後面的關節軟骨（人體最厚的關節軟骨之一）。', band(ellPts(3.05, 2.6, 0.98, 1.68, 40, 0.08).slice(13, 28), 0.26, CART, 0.04), { anchor: [2.2, 2.4, 0.1] }));
      pP.push(reg('滑囊與脂肪墊', '髕前滑囊', 'Prepatellar bursa', '位於髕骨前方與皮膚之間的滑囊（長期跪姿易發炎）。', face(ellPts(4.2, 2.6, 0.22, 1.25), 0x7fc8ff, 0.05, 0.85), { anchor: [4.4, 3.5, 0.1] }));
      pP.forEach(p => attachPart(p, S.patIn));
      // 關節腔、滑膜、關節囊
      const cav = [[1.6, 7.6], [2.55, 7.6], [2.75, 5], [2.3, 3.9], [2.15, 2.6], [2.25, 0.9], [2.4, -0.4], [2.55, -1.45], [2.2, -2.0], [-2.5, -2.0], [-2.85, -1.0], [-2.75, 0.9], [-2.2, 2.3], [-1.85, 3.3], [-2.15, 3.6]];
      reg('關節腔', '關節腔（滑液）', 'Joint cavity with synovial fluid', '兩骨之間的空腔，充滿<b>滑液</b>：潤滑關節、減少摩擦並供應關節軟骨養分。（藍色，向上延伸為髕上滑囊）', face(cav, 0x7fc8ff, 0.004, 0.55), { anchor: [-2.7, 0, 0.1] });
      reg('關節腔', '滑膜', 'Synovial membrane', '襯在關節囊內面的薄膜，分泌滑液。', band(cav, 0.12, 0xff80a0, 0.035), { anchor: [-2.85, -1.2, 0.1] });
      reg('關節腔', '關節囊（纖維層）', 'Fibrous capsule', '包住整個關節的緻密結締組織，與韌帶共同穩定關節。', band([[-1.95, 4.2], [-3.2, 1.0], [-3.15, -1.4], [-2.75, -2.8]], 0.3, 0xf4f1ea, 0.03), { anchor: [-3.3, 0.5, 0.1] });
      reg('滑囊與脂肪墊', '髕上滑囊', 'Suprapatellar bursa', '位於股四頭肌腱與股骨之間，與關節腔相通的大型滑囊。', face([[1.62, 4.6], [2.55, 4.6], [2.55, 7.5], [1.62, 7.5]], 0x6fb8ff, 0.006, 0.6), { anchor: [2.2, 6.6, 0.1] });
      reg('滑囊與脂肪墊', '髕下脂肪墊', 'Infrapatellar fat pad', '位於髕韌帶後方、關節腔前方的脂肪組織，保護並緩衝。', face([[2.45, 0.9], [3.05, 0.75], [2.85, -1.6], [2.65, -2.4], [2.45, -1.4]], 0xf2d060, 0.05), { anchor: [2.95, -0.6, 0.1] });
      // 肌腱與韌帶（隨角度重建）
      S.qt = new THREE.Mesh(new THREE.BufferGeometry(), mat(0xf4f1ea));
      reg('肌腱與韌帶', '股四頭肌腱', 'Quadriceps tendon', '股四頭肌的肌腱，包住髕骨。', S.qt, { anchor: [3.3, 7, 0.1] });
      S.lig = new THREE.Mesh(new THREE.BufferGeometry(), mat(0xf4f1ea));
      S.pLig = reg('肌腱與韌帶', '髕韌帶', 'Patellar ligament', '由髕骨下緣連到脛骨粗隆（股四頭肌腱的延續）；膝跳反射敲擊處。', S.lig, { anchor: [0, 0, 0] });
      setAngle(ANG);
    },
    panel(box) {
      slider(box, '屈膝角度（°）', 0, 110, ANG, 1, v => setAngle(v));
      note(box, '膝關節主要做<b>屈曲／伸展</b>（屈戌關節的一種；屈膝時尚有少量旋轉）。屈膝時髕骨沿股骨滑車下滑。');
    }
  });
})();
