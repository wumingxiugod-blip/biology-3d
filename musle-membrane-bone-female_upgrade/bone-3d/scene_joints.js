/* 場景⑤：可動關節的六種類型——以真實骨形呈現（講義 p.6、Fig 8.9） */
(function () {
  let S = null;
  const POS = { hinge: [-12, 5], pivot: [0, 5], glide: [12, 5], cond: [-12, -6], saddle: [0, -6], ball: [12, -6] };
  const F = SDF;
  const rbox = (x, y, z, c, h, r) => { const qx = Math.abs(x - c[0]) - h[0] + r, qy = Math.abs(y - c[1]) - h[1] + r, qz = Math.abs(z - c[2]) - h[2] + r; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r; };
  const lump = (x, y, z, d, a) => d + (noise3(x * 1.6, y * 1.6, z * 1.6) - 0.5) * a * 0.6;   // 骨表面的細微起伏

  // ── 各關節的 SDF（局部座標，關節中心在原點）
  // 肘：前方 +x、內外側 z；屈伸軸 = z 軸
  function humerus(x, y, z) {
    let d = F.cap(x, y, z, [0.05, 3.7, 0], [0, 0.9, 0], 0.4, 0.55);
    d = F.smin(d, F.ell(x, y, z, [0, 0.5, 0], [0.55, 0.55, 1.15]), 0.4);
    d = F.smin(d, F.cap(x, y, z, [0, 0, -0.6], [0, 0, 0.3], 0.5, 0.48), 0.25);                 // 滑車
    d = F.smax(d, -F.cap(x, y, z, [0, 0, -0.18], [0, 0, -0.02], 0.62, 0.62) + 0.12, 0.1);       // 滑車中央的溝
    d = F.smin(d, F.sph(x, y, z, [0.05, 0.02, 0.7], 0.42), 0.2);                                  // 肱骨小頭
    d = F.smin(d, F.sph(x, y, z, [-0.05, 0.55, -1.12], 0.3), 0.3);                                // 內上髁
    d = F.smax(d, -F.ell(x, y, z, [-0.5, 0.85, -0.1], [0.3, 0.38, 0.42]), 0.12);                 // 鷹嘴窩
    return lump(x, y, z, d, 0.04);
  }
  function ulnaRadius(x, y, z) {
    let u = F.cap(x, y, z, [0.15, -0.8, -0.15], [0.3, -3.8, -0.2], 0.45, 0.28);
    u = F.smin(u, F.ell(x, y, z, [-0.55, 0.1, -0.15], [0.38, 0.72, 0.42]), 0.3);                 // 鷹嘴
    u = F.smin(u, F.ell(x, y, z, [0.48, -0.45, -0.15], [0.36, 0.3, 0.38]), 0.25);                // 冠狀突
    u = F.smax(u, -F.cap(x, y, z, [0, 0, -0.75], [0, 0, 0.45], 0.58, 0.58), 0.06);               // 滑車切跡
    let r = F.cap(x, y, z, [0.15, -0.65, 0.72], [0.12, -0.95, 0.72], 0.4, 0.4);                  // 橈骨頭
    r = F.smin(r, F.cap(x, y, z, [0.15, -0.95, 0.72], [0.35, -3.8, 0.55], 0.25, 0.36), 0.2);
    r = F.smax(r, -F.sph(x, y, z, [0.05, 0.02, 0.7], 0.5), 0.05);                                 // 頭頂的淺凹（對肱骨小頭）
    return lump(x, y, z, Math.min(u, r), 0.04);
  }
  // 寰樞關節：上下 y；繞 y 軸旋轉（軸通過齒突 z=0.15）
  function axisC2(x, y, z) {
    let d = F.ell(x, y, z, [0, -1.15, 0.15], [0.85, 0.55, 0.75]);
    d = F.smin(d, F.cap(x, y, z, [0, -0.7, 0.15], [0, 0.85, 0.15], 0.34, 0.26), 0.2);             // 齒突
    d = F.smin(d, F.cap(x, y, z, [0, -1.25, -0.5], [0, -1.6, -1.7], 0.28, 0.18), 0.3);            // 棘突
    d = F.smin(d, F.cap(x, y, z, [-0.6, -1.0, -0.4], [0.6, -1.0, -0.4], 0.32, 0.32), 0.3);        // 椎弓
    [-1, 1].forEach(s => { d = F.smin(d, F.ell(x, y, z, [s * 0.75, -0.75, 0], [0.35, 0.2, 0.4]), 0.2); d = F.smin(d, F.cap(x, y, z, [s * 0.8, -1.0, 0], [s * 1.35, -1.05, -0.1], 0.2, 0.14), 0.15); });
    d = F.smax(d, -F.ell(x, y, z, [0, -1.0, -0.6], [0.45, 0.4, 0.4]), 0.1);                      // 椎孔
    return lump(x, y, z, d, 0.035);
  }
  function atlasC1(x, y, z) { // 局部座標以齒突軸為原點
    const ry = y - 0.35, ring = Math.hypot((Math.hypot(x / 1.05, (z + 0.35) / 1.25) - 1) * 1.05, ry) - 0.2;
    let d = ring;
    [-1, 1].forEach(s => { d = F.smin(d, F.ell(x, y, z, [s * 0.88, 0.35, -0.05], [0.38, 0.3, 0.48]), 0.25); d = F.smin(d, F.cap(x, y, z, [s * 1.0, 0.35, -0.1], [s * 1.65, 0.4, -0.2], 0.24, 0.18), 0.2); });
    d = F.smin(d, F.ell(x, y, z, [0, 0.35, 0.9], [0.32, 0.26, 0.22]), 0.2);                       // 前結節
    d = F.smax(d, -F.cap(x, y, z, [0, -0.2, 0], [0, 1.2, 0], 0.37, 0.37), 0.05);                 // 齒突的關節面
    return lump(x, y, z, d, 0.03);
  }
  // 腕骨間（滑動）
  const carpA = (x, y, z) => lump(x, y, z, F.smin(rbox(x, y, z, [0, -0.75, 0], [1.0, 0.68, 0.8], 0.32), F.ell(x, y, z, [-0.6, -1.2, 0.2], [0.5, 0.5, 0.5]), 0.3), 0.09);
  const carpB = (x, y, z) => lump(x + 3, y, z, F.smin(rbox(x, y, z, [0, 0.72, 0], [0.92, 0.66, 0.74], 0.32), F.ell(x, y, z, [0.5, 1.1, -0.2], [0.45, 0.5, 0.45]), 0.3), 0.09);
  // 掌指關節（橢圓）
  const metacarpal = (x, y, z) => lump(x, y, z, F.smin(F.cap(x, y, z, [0, -3.6, 0], [0, -0.6, 0], 0.4, 0.38), F.ell(x, y, z, [0, -0.08, 0], [0.62, 0.58, 0.5]), 0.25), 0.03);
  function phalanx(x, y, z) {
    let d = F.smin(F.ell(x, y, z, [0, 0.82, 0], [0.62, 0.42, 0.52]), F.cap(x, y, z, [0, 1.0, 0], [0, 3.5, 0], 0.4, 0.28), 0.3);
    d = F.smin(d, F.ell(x, y, z, [0, 3.45, 0], [0.38, 0.28, 0.32]), 0.2);
    d = F.smax(d, -F.ell(x, y, z, [0, -0.08, 0], [0.7, 0.66, 0.58]), 0.06);                       // 基部的橢圓凹面
    return lump(x, y, z, d, 0.03);
  }
  // 拇指腕掌關節（鞍狀）：上下兩面都是 y = k(x² − z²)
  const K = 0.3;
  const trapezium = (x, y, z) => lump(x, y, z, F.smax(rbox(x, y, z, [0, -0.85, 0], [0.95, 0.85, 0.85], 0.3), y - K * (x * x - z * z), 0.08), 0.06);
  function metacarpal1(x, y, z) {
    let d = F.smax(rbox(x, y, z, [0, 0.75, 0], [0.82, 0.68, 0.72], 0.3), K * (x * x - z * z) + 0.07 - y, 0.08);
    d = F.smin(d, F.cap(x, y, z, [0, 1.3, 0], [0.1, 3.5, 0], 0.42, 0.34), 0.35);
    d = F.smin(d, F.ell(x, y, z, [0.1, 3.6, 0], [0.5, 0.42, 0.45]), 0.25);
    return lump(x, y, z, d, 0.03);
  }
  // 髖關節：股骨近端（取自股骨模型，縮放）＋骨盆的髖臼（前方切開）
  const HS = 0.62, H = BONES.HEAD;
  const femurProx = (x, y, z) => Math.max(BONES.femur(x / HS + H[0], y / HS + H[1], z / HS + H[2]) * HS, -(y - (8.6 - H[1]) * HS));
  function pelvis(x, y, z) {
    let d = F.ell(x, y, z, [-0.35, 0.15, -0.35], [1.35, 1.45, 0.95]);
    d = F.smin(d, F.ell(x, y, z, [-0.55, 2.0, -0.55], [1.75, 1.25, 0.42]), 0.6);   // 髂骨
    d = F.smin(d, F.ell(x, y, z, [-0.2, -1.4, -0.35], [0.7, 1.0, 0.6]), 0.5);       // 坐骨
    d = F.smin(d, F.ell(x, y, z, [-1.3, -0.7, 0.1], [1.0, 0.42, 0.42]), 0.5);       // 恥骨
    d = F.smax(d, -F.sph(x, y, z, [0, 0, 0], HS * BONES.HEAD_R + 0.1), 0.05);      // 髖臼
    d = F.smax(d, -F.sph(x, y, z, [1.4, 0, 0], 1.0), 0.3);                          // 髖臼向外開口
    return Math.max(lump(x, y, z, d, 0.05), z - 0.12);
  }

  function geos() {
    return BONES.once('jointGeo', () => {
      const m = (f, a, b, h = 0.06) => { const g = F.mesh(f, a, b, h); g.userData.shared = true; return g; };
      return {
        hum: m(humerus, [-1.1, -0.7, -1.6], [1.0, 3.9, 1.3]), ur: m(ulnaRadius, [-1.1, -4.1, -0.9], [1.0, 0.9, 1.3]),
        c2: m(axisC2, [-1.6, -2.0, -2.0], [1.6, 1.2, 1.1]), c1: m(atlasC1, [-2.0, -0.1, -1.8], [2.0, 0.8, 1.3], 0.05),
        ca: m(carpA, [-1.4, -1.9, -1.1], [1.2, 0.05, 1.1]), cb: m(carpB, [-1.1, 0.0, -1.1], [1.2, 1.7, 1.1]),
        mc: m(metacarpal, [-0.8, -3.8, -0.7], [0.8, 0.6, 0.7]), ph: m(phalanx, [-0.8, 0.3, -0.7], [0.8, 3.9, 0.7], 0.05),
        tz: m(trapezium, [-1.4, -1.9, -1.3], [1.4, 0.7, 1.3]), m1: m(metacarpal1, [-1.2, -0.3, -1.1], [1.2, 4.2, 1.1]),
        fem: m(femurProx, [-1.1, -4.0, -1.0], [3.6, 1.1, 1.2], 0.07), pel: m(pelvis, [-2.8, -2.7, -1.6], [1.2, 3.4, 0.25], 0.07)
      };
    });
  }
  function axis(c, dir, col, len = 2.6) {
    const d = V(...dir).normalize(), a = V(...c).addScaledVector(d, -len / 2), b = V(...c).addScaledVector(d, len / 2);
    return [cylM(a, b, 0.05, mat(col), 8), cone(b.toArray(), b.clone().addScaledVector(d, 0.35).toArray(), 0.14, col), cone(a.toArray(), a.clone().addScaledVector(d, -0.35).toArray(), 0.14, col)];
  }

  SCENES.push({
    name: '⑤ 可動關節六型',
    title: '可動關節（滑液關節）的六種類型',
    camera: { pos: [0, 2, 36], target: [0, -0.5, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([0, 2, 36], [0, -0.5, 0]); } },
      ...Object.entries({ hinge: '屈戌', pivot: '車軸', glide: '滑動', cond: '橢圓', saddle: '鞍', ball: '杵臼' }).map(([k, n]) => ({ label: '🔍 ' + n, fn() { const [x, y] = POS[k]; flyTo([x + 4, y + 3, 10], [x, y, 0]); } }))
    ],
    desc: `
  <table>
  <tr><th>類型</th><th>運動軸</th><th>例子（Fig 8.9）</th></tr>
  <tr><td><b>屈戌關節</b> hinge</td><td>單軸：屈／伸</td><td>肘（肱尺）、膝、指間</td></tr>
  <tr><td><b>車軸關節</b> pivot</td><td>單軸：繞骨長軸旋轉</td><td>寰樞關節（齒突在寰椎環中）、近端橈尺</td></tr>
  <tr><td><b>滑動關節</b> gliding</td><td>平面滑動（非軸性）</td><td>腕骨間、跗骨間</td></tr>
  <tr><td><b>橢圓關節</b> condyloid</td><td>雙軸：屈伸＋內收外展</td><td>掌指關節、橈腕</td></tr>
  <tr><td><b>鞍狀關節</b> saddle</td><td>雙軸（兩面都呈馬鞍形）</td><td>拇指的腕掌關節</td></tr>
  <tr><td><b>杵臼關節</b> ball &amp; socket</td><td>多軸：屈伸、內收外展、旋轉</td><td>肩、髖</td></tr>
  </table>
  <p class="hint">深色＝固定的骨、淺色＝活動的骨，彩色箭頭＝運動軸。髖關節的骨盆已把前半切開，以便看見股骨頭在髖臼中。第一次開啟需數秒建立模型。</p>`,
    build() {
      S = { t: 0, play: true, g: {} };
      const G = geos(), FIX = 0xd9c49a, MOV = 0xeadcbc;
      const mk = (k, zh, en, info, fixed, moving, axes, ex, pivot = [0, 0, 0]) => {
        const base = new THREE.Group(); base.position.set(POS[k][0], POS[k][1], 0); CUR.root.add(base);
        const pv = new THREE.Group(); pv.position.set(...pivot); base.add(pv); const mv = new THREE.Group(); mv.position.set(-pivot[0], -pivot[1], -pivot[2]); pv.add(mv); S.g[k] = pv;
        attachPart(reg(zh, zh + '—' + fixed[0], en, info, new THREE.Mesh(fixed[1], mat(FIX)), { anchor: fixed[2] }), base);
        attachPart(reg(zh, zh + '—' + moving[0], en, info, new THREE.Mesh(moving[1], mat(MOV)), { anchor: moving[2] }), mv);
        attachPart(reg(zh, zh + '—運動軸', 'Axes of movement', info, axes, { nolabel: true }), base);
        textSprite(zh, [POS[k][0], POS[k][1] + 4.6, 0], 0.8, '#ffd479', ex);
      };
      mk('hinge', '屈戌關節', 'Hinge joint', '肱骨<b>滑車</b>（像線軸）嵌入尺骨的<b>滑車切跡</b>，只能繞<b>一個軸</b>屈伸（如門的鉸鏈）。旁邊的橈骨頭則與肱骨小頭相接。例：肘關節、膝、指間關節。',
        ['肱骨', G.hum, [0.6, 2.5, 0.6]], ['尺骨與橈骨', G.ur, [0.6, -2.6, 0.6]], axis([0, 0, 0], [0, 0, 1], 0xff6060, 3.6), '屈戌 Hinge（肘：肱骨－尺骨）');
      mk('pivot', '車軸關節', 'Pivot joint', '樞椎（第 2 頸椎）向上伸出的<b>齒突</b>，套在寰椎（第 1 頸椎）的環中，寰椎繞齒突<b>旋轉</b>（搖頭說「不」）。例：寰樞關節、近端橈尺關節。',
        ['樞椎（C2）', G.c2, [0.9, -1.4, 0.8]], ['寰椎（C1）', G.c1, [1.5, 0.6, 0.6]], axis([0, 0.3, 0.15], [0, 1, 0], 0xff6060, 3.6), '車軸 Pivot（寰椎－樞椎）', [0, 0, 0.15]);
      mk('glide', '滑動關節', 'Gliding (plane) joint', '兩塊腕骨相對的關節面<b>近乎平坦</b>，只能做小幅的平面滑動。例：腕骨之間、跗骨之間。',
        ['腕骨', G.ca, [1.0, -1.1, 0.8]], ['相鄰腕骨', G.cb, [1.0, 1.1, 0.8]], [...axis([0, 1.7, 1.2], [1, 0, 0], 0x60c0ff, 2.4), ...axis([1.6, 1.7, 0], [0, 0, 1], 0x60ff90, 2.0)], '滑動 Gliding（腕骨間）');
      mk('cond', '橢圓關節', 'Condyloid (ellipsoidal) joint', '掌骨的<b>橢圓形</b>頭嵌入近節指骨基部的橢圓形凹面，可沿<b>兩個軸</b>運動（屈伸、內收外展），但不能繞長軸旋轉。例：掌指關節、橈腕關節。',
        ['掌骨', G.mc, [0.6, -2.4, 0.5]], ['近節指骨', G.ph, [0.6, 2.4, 0.5]], [...axis([0, -0.08, 0], [0, 0, 1], 0xff6060, 3), ...axis([0, -0.08, 0], [1, 0, 0], 0x60c0ff, 3.4)], '橢圓 Condyloid（掌指）', [0, -0.08, 0]);
      mk('saddle', '鞍狀關節', 'Saddle joint', '大多角骨與第一掌骨的關節面都呈<b>馬鞍形</b>（一方向凸、垂直方向凹），互相交錯嵌合，可沿<b>兩個軸</b>運動，使拇指能對掌。例：拇指的腕掌關節。',
        ['大多角骨', G.tz, [1.1, -1.2, 0.8]], ['第一掌骨', G.m1, [0.6, 2.6, 0.5]], [...axis([0, 0, 0], [1, 0, 0], 0xff6060, 3.4), ...axis([0, 0, 0], [0, 0, 1], 0x60c0ff, 3.4)], '鞍 Saddle（拇指腕掌）');
      mk('ball', '杵臼關節', 'Ball-and-socket joint', '股骨頭（球）嵌入骨盆的<b>髖臼</b>（杯），可沿<b>多個軸</b>運動：屈伸、內收外展與旋轉，活動度最大。例：髖關節、肩關節。',
        ['骨盆（髖臼，前半切開）', G.pel, [-2.0, 2.2, 0.2]], ['股骨（近端）', G.fem, [2.4, -2.5, 0.6]], [...axis([0, 0, 0], [1, 0, 0], 0xff6060, 3.2), ...axis([0, 0, 0], [0, 0, 1], 0x60c0ff, 3.2), ...axis([0, 0, 0], [0, 1, 0], 0x60ff90, 4.0)], '杵臼 Ball & socket（髖關節）');
      updateAnchors();

      const dt = dtClock();
      CUR.tick = () => {
        if (S.play) S.t += dt(); else dt();
        const t = S.t, s1 = Math.sin(t * 1.3), s2 = Math.sin(t * 0.9 + 1);
        S.g.hinge.rotation.z = 0.95 * (s1 * 0.5 + 0.5);                 // 屈肘
        S.g.pivot.rotation.y = 0.7 * s1;
        S.g.glide.position.set(0.18 * s1, 0, 0.15 * s2);
        S.g.cond.rotation.set(0.28 * s2, 0, 0.5 * (s1 * 0.5 + 0.5) * -1 + 0.1);
        S.g.saddle.rotation.set(0.22 * s2, 0, 0.22 * s1);
        S.g.ball.rotation.set(0.35 * s2, 0.5 * Math.sin(t * 0.6), 0.35 * s1);
        updateAnchors();
      };
    },
    panel(box) {
      checkbox(box, '播放運動', true, v => S.play = v);
      checkbox(box, '顯示運動軸', true, v => { CUR.parts.forEach(p => { if (p.zh.endsWith('運動軸')) p.visible = v; }); rebuildList(); refresh(); });
    }
  });
})();
