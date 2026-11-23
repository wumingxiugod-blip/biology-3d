/* 場景⑤：可動關節的六種類型（講義 p.6、Fig 8.9） */
(function () {
  let S = null;
  const POS = { hinge: [-12, 5], pivot: [0, 5], glide: [12, 5], cond: [-12, -6], saddle: [0, -6], ball: [12, -6] };
  const FIX = 0xd9c49a, MOV = 0xf2e6c8;

  function saddleGeo(k, flip) {
    const g = new THREE.PlaneGeometry(2.4, 2.4, 28, 28); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, (flip ? -1 : 1) * k * (x * x - z * z)); }
    g.computeVertexNormals(); return g;
  }
  function axis(c, dir, col, len = 2.6) {
    const d = V(...dir).normalize(), a = V(...c).addScaledVector(d, -len / 2), b = V(...c).addScaledVector(d, len / 2);
    return [cylM(a, b, 0.05, mat(col), 8), cone(b.toArray(), b.clone().addScaledVector(d, 0.35).toArray(), 0.14, col), cone(a.toArray(), a.clone().addScaledVector(d, -0.35).toArray(), 0.14, col)];
  }

  SCENES.push({
    name: '⑤ 可動關節六型',
    title: '可動關節（滑液關節）的六種類型',
    camera: { pos: [0, 2, 34], target: [0, -0.5, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([0, 2, 34], [0, -0.5, 0]); } },
      ...Object.entries({ hinge: '屈戌', pivot: '車軸', glide: '滑動', cond: '橢圓', saddle: '鞍', ball: '杵臼' }).map(([k, n]) => ({ label: '🔍 ' + n, fn() { const [x, y] = POS[k]; flyTo([x + 3, y + 2.5, 10], [x, y, 0]); } }))
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
  <p class="hint">以簡化的機械模型表示關節面形狀；深色＝固定骨、淺色＝活動骨，彩色箭頭＝運動軸。</p>`,
    build() {
      S = { t: 0, play: true, g: {} };
      const grp = (k) => { const g = new THREE.Group(); const [x, y] = POS[k]; g.position.set(x, y, 0); CUR.root.add(g); return g; };
      const mk = (k, zh, en, info, fixed, moving, axes, ex) => {
        const base = grp(k), mv = new THREE.Group(); base.add(mv); S.g[k] = mv;
        const p1 = reg(zh, zh + '—固定骨', en, info, fixed, { anchor: [0, -2.2, 0.8] }); attachPart(p1, base);
        const p2 = reg(zh, zh + '—活動骨', en, info, moving, { anchor: [0, 2.2, 0.8], nolabel: true }); attachPart(p2, mv);
        const p3 = reg(zh, zh + '—運動軸', 'Axes of movement', info, axes, { nolabel: true }); attachPart(p3, base);
        textSprite(zh, [POS[k][0], POS[k][1] + 4.3, 0], 0.8, '#ffd479', ex);
        return mv;
      };
      // 屈戌
      const hm = mk('hinge', '屈戌關節', 'Hinge joint', '一骨的圓柱狀滑車嵌入另一骨的凹槽，只能繞<b>一個軸</b>屈伸（如門的鉸鏈）。例：肘關節（肱骨滑車—尺骨）、膝、指間關節。',
        [cyl([0, 0, 0], [0, 3.6, 0], 0.5, FIX), cylM([0, 0, -0.9], [0, 0, 0.9], 0.7, mat(FIX), 24)],
        [(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.7, 32, 1, true, Math.PI * 0.55, Math.PI * 1.1), mat(MOV)); m.rotation.x = Math.PI / 2; return m; })(), cyl([0, -0.9, 0], [0, -3.6, 0], 0.45, MOV)],
        axis([0, 0, 0], [0, 0, 1], 0xff6060, 3.2), '屈戌 Hinge（肘、指間）');
      // 車軸
      const atl = (() => { const s = new THREE.Shape(); s.absellipse(0, 0, 1.6, 0.9, 0, Math.PI * 2); const h = new THREE.Path(); h.absarc(0.25, 0, 0.5, 0, Math.PI * 2, true); s.holes.push(h); const g = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false, curveSegments: 32 }); g.rotateX(-Math.PI / 2); g.translate(0, 0.6, 0); return new THREE.Mesh(g, mat(MOV)); })();
      const pv = mk('pivot', '車軸關節', 'Pivot joint', '一骨的柱狀突起在另一骨（與韌帶）構成的環中<b>繞長軸旋轉</b>。例：寰樞關節—樞椎的<b>齒突</b>在寰椎環中轉動（搖頭說「不」）；近端橈尺關節。',
        [box([0, -0.9, 0], [2.4, 1.5, 1.6], FIX), cyl([0.25, -0.2, 0], [0.25, 1.6, 0], 0.42, FIX)], [atl], axis([0.25, 0.5, 0], [0, 1, 0], 0xff6060, 3.6), '車軸 Pivot（寰樞）');
      // 滑動
      const gl = mk('glide', '滑動關節', 'Gliding (plane) joint', '兩骨的關節面<b>平坦</b>，只能做小幅的平面滑動。例：腕骨之間、跗骨之間。',
        [box([0, -0.7, 0], [3, 1.2, 2.2], FIX)], [box([0, 0.5, 0], [2.4, 1.1, 1.8], MOV)], [...axis([0, 1.5, 1.6], [1, 0, 0], 0x60c0ff, 2.4), ...axis([1.9, 1.5, 0], [0, 0, 1], 0x60ff90, 2.0)], '滑動 Gliding（腕骨間）');
      // 橢圓
      const cup = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(FIX)); cup.scale.set(1.7, 0.75, 1.1);
      const cd = mk('cond', '橢圓關節', 'Condyloid (ellipsoidal) joint', '<b>橢圓形</b>的凸面嵌入橢圓形凹面，可沿<b>兩個軸</b>運動（屈伸、內收外展），但不能繞長軸旋轉。例：掌指關節、橈腕關節。',
        [cup, cyl([0, -0.7, 0], [0, -3.4, 0], 0.6, FIX)], [ell([0, 0.05, 0], [1.5, 0.62, 0.95], MOV), cyl([0, 0.4, 0], [0, 3.4, 0], 0.5, MOV)], [...axis([0, 0, 0], [0, 0, 1], 0xff6060, 3), ...axis([0, 0, 0], [1, 0, 0], 0x60c0ff, 4)], '橢圓 Condyloid（掌指）');
      // 鞍
      const lo = new THREE.Mesh(saddleGeo(0.28, false), mat(FIX)), up = new THREE.Mesh(saddleGeo(0.28, false), mat(MOV));
      up.rotation.y = Math.PI / 2; up.position.y = 0.06;
      const sd = mk('saddle', '鞍狀關節', 'Saddle joint', '兩骨的關節面都呈<b>馬鞍形</b>（一方向凸、垂直方向凹），互相交錯嵌合，可沿<b>兩個軸</b>運動。例：拇指的腕掌關節（大多角骨—第一掌骨），使拇指能對掌。',
        [lo, box([0, -1.4, 0], [2.4, 2.2, 2.4], FIX)], [up, box([0, 1.5, 0], [2.4, 2.4, 2.4], MOV)], [...axis([0, 0, 0], [1, 0, 0], 0xff6060, 3.4), ...axis([0, 0, 0], [0, 0, 1], 0x60c0ff, 3.4)], '鞍 Saddle（拇指腕掌）');
      partBy('鞍狀關節—固定骨').meshes[1].position.y = -1.6; partBy('鞍狀關節—活動骨').meshes[1].position.y = 1.75;
      // 杵臼
      const sock = new THREE.Mesh(new THREE.SphereGeometry(1.2, 36, 18, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58), mat(FIX));
      const bl = mk('ball', '杵臼關節', 'Ball-and-socket joint', '球形的骨頭嵌入杯狀的窩，可沿<b>多個軸</b>運動：屈伸、內收外展與旋轉，活動度最大。例：肩關節、髖關節（股骨頭—髖臼）。',
        [sock, box([0, -1.6, 0], [3.2, 1.2, 2.6], FIX)], [ell([0, 0, 0], [1.05, 1.05, 1.05], MOV), cyl([0, 0, 0], [0, 3.6, 0], 0.5, MOV)], [...axis([0, 0, 0], [1, 0, 0], 0xff6060, 3.2), ...axis([0, 0, 0], [0, 0, 1], 0x60c0ff, 3.2), ...axis([0, 0, 0], [0, 1, 0], 0x60ff90, 4.4)], '杵臼 Ball & socket（髖、肩）');

      const dt = dtClock();
      CUR.tick = () => {
        if (S.play) S.t += dt(); else dt();
        const t = S.t, s1 = Math.sin(t * 1.4), s2 = Math.sin(t * 0.9 + 1);
        hm.rotation.z = 0.9 * (s1 * 0.5 + 0.5) * -1.6 + 0.3;
        pv.rotation.y = 0.9 * s1;
        gl.position.set(0.35 * s1, 0, 0.3 * s2);
        cd.rotation.set(0.25 * s2, 0, 0.35 * s1);
        sd.rotation.set(0.25 * s2, 0, 0.25 * s1);
        bl.rotation.set(0.5 * s2, 0.8 * Math.sin(t * 0.6), 0.6 * s1);
        updateAnchors();
      };
    },
    panel(box) {
      checkbox(box, '播放運動', true, v => S.play = v);
      checkbox(box, '顯示運動軸', true, v => { CUR.parts.forEach(p => { if (p.zh.endsWith('運動軸')) p.visible = v; }); rebuildList(); refresh(); });
    }
  });
})();
