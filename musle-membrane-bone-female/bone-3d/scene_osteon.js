/* 場景②：緻密骨與骨元（講義 p.2；課本 Ch1 Fig 1.20） */
(function () {
  const TOP = 5, BOT = -6;
  // 骨元橫切面貼圖：同心骨板、中央管、骨陷窩與骨小管
  function osteonTex(seed) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'), r = rnd(seed), C = 128;
    c.fillStyle = '#e4d2ab'; c.fillRect(0, 0, 256, 256);
    for (let k = 6; k >= 1; k--) { c.beginPath(); c.arc(C, C, 22 + k * 17, 0, 7); c.fillStyle = k % 2 ? '#ead9b4' : '#dcc79c'; c.fill(); }
    c.strokeStyle = 'rgba(120,90,50,0.55)'; c.lineWidth = 1;
    for (let k = 1; k <= 6; k++) for (let i = 0; i < 7 + k * 2; i++) {
      const a = r() * 6.283, rad = 22 + k * 17 - 8, x = C + Math.cos(a) * rad, y = C + Math.sin(a) * rad;
      for (let j = 0; j < 4; j++) { const b = a + (j < 2 ? 0 : Math.PI) + (r() - 0.5) * 0.6, L = 6 + r() * 7; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(b) * L, y + Math.sin(b) * L); c.stroke(); }
      c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); c.fillStyle = '#7a5a8a'; c.beginPath(); c.ellipse(0, 0, 4.2, 1.9, 0, 0, 7); c.fill(); c.restore();
    }
    c.fillStyle = '#3a1a10'; c.beginPath(); c.arc(C, C, 20, 0, 7); c.fill();
    c.fillStyle = '#d02030'; c.beginPath(); c.arc(C - 6, C - 3, 6, 0, 7); c.fill();
    c.fillStyle = '#3060d0'; c.beginPath(); c.arc(C + 6, C + 1, 6, 0, 7); c.fill();
    c.fillStyle = '#f0d040'; c.beginPath(); c.arc(C, C + 9, 3.5, 0, 7); c.fill();
    return new THREE.CanvasTexture(cv);
  }

  SCENES.push({
    name: '② 緻密骨與骨元',
    title: '緻密骨的微細構造：骨元（哈氏系統）',
    camera: { pos: [16, 14, 22], target: [0, 1, -3] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([16, 14, 22], [0, 1, -3]); } },
      { label: '🔍 剖開的骨元', fn() { flyTo([10, 8, 9], [5, 4, -1.4]); } },
      { label: '🔍 骨細胞放大', fn() { flyTo([17, 2, 9], [17, 1, 0]); } },
      { label: '🔍 海綿骨', fn() { flyTo([4, -2, -16], [0, 0, -8]); } }
    ],
    desc: `
  <p><b>骨元</b>（osteon，又稱哈氏系統）是緻密骨的結構單位：</p>
  <ol>
  <li><b>哈氏管</b>（Haversian canal，中央管）：骨內的血管通道，內有動脈、靜脈與神經；與骨髓、骨膜的血管形成網路。</li>
  <li>哈氏管貫穿骨的<b>縱軸</b>，周圍由<b>骨板</b>（lamellae）以同心圓環繞。</li>
  <li>骨板之間形成<b>骨陷窩</b>（lacunae），是<b>骨細胞</b>（osteocyte）的居所。</li>
  <li>骨陷窩周圍由<b>骨小管</b>（canaliculi）形成輻射狀網路，負責擴散以提供<b>養分</b>、交換<b>廢物</b>。</li>
  <li>緻密骨是承受應力的主要部位。</li>
  </ol>
  <p>課本：成骨細胞被自己分泌、鈣化的基質包住後困在骨陷窩中，即成為骨細胞；骨細胞靠伸入骨小管的細胞質突起與血管相連而存活。</p>
  <p><b>穿通管</b>（perforating / Volkmann's canal）橫向穿過骨，連接骨外膜、各哈氏管與骨髓腔的血管。</p>
  <p class="hint">右前方的骨元已縱向剖開並讓骨板呈階梯狀伸出，以便看見各層。</p>`,
    build() {
      const rr = rnd(21);
      // 骨元位置（x-z 平面上的六角排列）
      const P = [];
      for (let i = -3; i <= 3; i++) for (let j = 0; j < 3; j++) { const x = i * 2.55 + (j % 2) * 1.27, z = -1.55 - j * 2.2; if (Math.abs(x) < 7.6) P.push([x, z]); }
      const feat = P.reduce((a, b) => (b[0] - b[1] * 0.5 > a[0] - a[1] * 0.5 ? b : a)); // 最右前方者
      // 骨基質（骨元之間的骨板）
      reg('緻密骨', '間骨板（骨元之間）', 'Interstitial lamellae', '骨元之間殘留的舊骨板（骨不斷改建所留下）。', box([0, (TOP + BOT) / 2, -3.1], [16.4, TOP - BOT, 6.2], 0xcdb48a, 0.6), { anchor: [-7.2, TOP, -0.6] });
      reg('緻密骨', '外環骨板', 'Circumferential lamellae', '緊貼骨外膜下方、環繞整根骨的數層骨板。', [0, 1, 2].map(k => box([0, (TOP + BOT) / 2, -0.12 - k * 0.2], [16.42, TOP - BOT + 0.02, 0.12], k % 2 ? 0xe4d2ab : 0xeedfbe, 0.6)), { anchor: [-4, -3, 0.05] });
      // 一般骨元：頂端伸出、上蓋貼圖
      const oM = [], capM = [];
      P.forEach(([x, z], k) => {
        if (x === feat[0] && z === feat[1]) return;
        const h = TOP + 0.4 + rr() * 1.6;
        oM.push(cylM([x, BOT + 0.01, z], [x, h, z], 1.15, mat(0xe6d4ae), 32));
        const cap = new THREE.Mesh(new THREE.CircleGeometry(1.15, 40), mat(0xffffff, 1, { map: osteonTex(k + 3) }));
        cap.position.set(x, h + 0.01, z); cap.rotation.x = -Math.PI / 2; capM.push(cap);
      });
      reg('骨元', '骨元（哈氏系統）', 'Osteon (Haversian system)', '緻密骨的結構單位：以哈氏管為中心、同心圓排列的骨板，沿骨的<b>縱軸</b>排列。', oM.concat(capM), { anchor: [P[2][0], TOP + 1.2, P[2][1] + 1.1] });

      // 剖開的骨元（階梯狀骨板）
      const [fx, fz] = feat, lam = [], cells = [], canal = [];
      const radii = [0.42, 0.62, 0.82, 1.0, 1.15];
      radii.slice(1).forEach((R, i) => {
        const top = TOP + 4.4 - i * 0.9;
        const g = new THREE.CylinderGeometry(R, R, top - BOT, 36, 1, true, Math.PI / 2, 1.5 * Math.PI);
        const m = new THREE.Mesh(g, mat(i % 2 ? 0xdcc79c : 0xecdcb8, 1)); m.position.set(fx, (top + BOT) / 2, fz); lam.push(m);
        const ring = new THREE.Mesh(new THREE.RingGeometry(radii[i], R, 36, 1, Math.PI / 2, 1.5 * Math.PI), mat(i % 2 ? 0xdcc79c : 0xecdcb8));
        ring.position.set(fx, top, fz); ring.rotation.x = -Math.PI / 2; lam.push(ring);
        // 剖面（兩個平面）
        [0, Math.PI / 2].forEach(a => { const f = box([0, 0, 0], [R - radii[i], top - BOT, 0.02], i % 2 ? 0xcdb68a : 0xe0cda6); f.position.set(fx + Math.sin(a) * (R + radii[i]) / 2, (top + BOT) / 2, fz + Math.cos(a) * (R + radii[i]) / 2); f.rotation.y = a + Math.PI / 2; lam.push(f); });
        // 骨陷窩中的骨細胞與骨小管
        for (let k = 0; k < 7; k++) {
          const y = BOT + 1 + k * (top - BOT - 2) / 6, a = Math.PI / 2 + 0.3 + rr() * 1.3 * Math.PI, rm = (R + radii[i]) / 2;
          const p = V(fx + Math.sin(a) * rm, y, fz + Math.cos(a) * rm);
          const e = ell([p.x, p.y, p.z], [0.09, 0.2, 0.09], 0x7a4a9a); cells.push(e);
          for (let j = 0; j < 4; j++) { const b = a + (j % 2 ? 0.35 : -0.35), dr = j < 2 ? 0.16 : -0.16; canal.push([new THREE.CylinderGeometry(0.012, 0.012, 0.24, 4), mtx([p.x + Math.sin(b) * dr, p.y + (j - 1.5) * 0.06, p.z + Math.cos(b) * dr], [Math.sin(a), 0.2, Math.cos(a)])]); }
        }
      });
      reg('骨元', '同心骨板', 'Concentric lamellae', '一層層環繞哈氏管的骨板（此骨元呈階梯狀伸出）。相鄰骨板的膠原纖維方向不同，增加強度。', lam, { anchor: [fx + 0.9, TOP + 2.2, fz + 0.6] });
      reg('骨元', '骨細胞（在骨陷窩中）', 'Osteocytes in lacunae', '骨板之間的小腔＝<b>骨陷窩</b>，住著骨細胞（由被基質包埋的成骨細胞轉變而來）。', cells, { anchor: [fx + 0.55, TOP + 2.5, fz + 0.55] });
      reg('骨元', '骨小管', 'Canaliculi', '自骨陷窩向四周輻射的細小管道，骨細胞的突起伸入其中，相鄰骨細胞彼此相連，並通到哈氏管 → 擴散提供<b>養分</b>、交換<b>廢物</b>。', new THREE.Mesh(mergeGeo(canal), mat(0x9a6ab8)), { anchor: [fx + 0.2, TOP + 3.3, fz + 0.75] });
      reg('骨元', '哈氏管（中央管）', 'Haversian (central) canal', '貫穿骨元中央、沿骨縱軸的管道，內有血管與神經。', cylM([fx, BOT, fz], [fx, TOP + 5, fz], radii[0], mat(0x4a2a20, 0.45), 20, true), { anchor: [fx - 0.45, TOP + 4.6, fz] });
      // 血管與神經
      const art = [], vein = [], nerve = [];
      const vy = -0.8, pv = 0.55;
      P.forEach(([x, z], k) => {
        const top = (x === fx && z === fz) ? TOP + 5.1 : TOP + 0.3;
        art.push(ttube([[x - 0.16, BOT, z - 0.05], [x - 0.16, top, z - 0.05]], 0.1, 0xd02030));
        vein.push(ttube([[x + 0.16, BOT, z + 0.02], [x + 0.16, top, z + 0.02]], 0.11, 0x3060d0));
        if (x === fx && z === fz) nerve.push(ttube([[x, BOT, z + 0.2], [x, top, z + 0.2]], 0.05, 0xf0d040));
      });
      // 穿通管：自骨外膜橫向穿入，連到各哈氏管
      const perf = [];
      [[fx, fz], [P[1][0], P[1][1]]].forEach(([x, z]) => {
        art.push(ttube([[x - 0.16, vy, pv], [x - 0.16, vy, z]], 0.09, 0xd02030)); vein.push(ttube([[x + 0.16, vy + 0.25, pv], [x + 0.16, vy + 0.25, z]], 0.1, 0x3060d0));
        perf.push(cylM([x, vy + 0.1, 0.1], [x, vy + 0.1, z], 0.3, mat(0x4a2a20, 0.3), 12, true));
      });
      art.push(ttube([[-8, vy, pv], [8, vy, pv]], 0.13, 0xd02030)); vein.push(ttube([[-8, vy + 0.25, pv], [8, vy + 0.25, pv]], 0.14, 0x3060d0));
      nerve.push(ttube([[-8, vy + 0.6, pv], [fx, vy + 0.6, pv], [fx, vy + 0.6, fz + 0.2]], 0.06, 0xf0d040));
      reg('血管與神經', '動脈', 'Artery', '經穿通管、哈氏管分布到骨內部的血管。', art, { anchor: [-6, vy, pv] });
      reg('血管與神經', '靜脈', 'Vein', '', vein, { anchor: [-3, vy + 0.25, pv] });
      reg('血管與神經', '神經', 'Nerve', '伴隨血管走在哈氏管中。', nerve, { anchor: [fx, TOP + 4.0, fz + 0.3] });
      reg('血管與神經', '穿通管（福克曼管）', "Perforating (Volkmann's) canal", '<b>橫向</b>穿過骨的管道，連接骨外膜、各哈氏管與骨髓腔的血管。', perf, { anchor: [fx, vy + 0.4, 0.2] });
      reg('骨膜', '骨外膜', 'Periosteum', '包在骨表面的結締組織膜（外纖維層＋內生骨層含成骨細胞），其中的血管經穿通管進入骨內。', box([0, (TOP + BOT) / 2, 0.45], [16.4, TOP - BOT, 0.5], 0xf6f2ea, 0.22), { anchor: [6, 3.5, 0.7] });
      // 海綿骨（內側）
      const tr = [], pts = [];
      for (let i = 0; i < 70; i++) pts.push(V(-7.6 + rr() * 15.2, BOT + 0.4 + rr() * (TOP - BOT - 0.8), -6.5 - rr() * 3.5));
      pts.forEach((p, i) => pts.map((q, j) => [j, q.distanceTo(p)]).filter(x => x[0] > i).sort((a, b) => a[1] - b[1]).slice(0, 2).forEach(([j]) => {
        const q = pts[j], d = q.clone().sub(p); tr.push([new THREE.CylinderGeometry(0.22, 0.28, d.length(), 7), mtx([(p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2], [d.x, d.y, d.z])]);
      }));
      pts.forEach(p => tr.push([new THREE.SphereGeometry(0.3, 8, 6), mtx([p.x, p.y, p.z])]));
      reg('海綿骨', '骨小樑', 'Trabeculae', '海綿骨由骨小樑交織成格子網；<b>不含骨元</b>，骨小樑內的骨細胞靠鄰近骨髓的血管擴散供應。', new THREE.Mesh(mergeGeo(tr), mat(0xe6d4ae)), { anchor: [-5, 3, -7] });
      reg('海綿骨', '紅骨髓', 'Red marrow', '填在骨小樑之間，造血組織。', box([0, (TOP + BOT) / 2, -8.3], [16.2, TOP - BOT - 0.4, 3.9], MARR, 0.28), { anchor: [3, -4, -8] });
      reg('海綿骨', '骨內膜', 'Endosteum', '襯在骨髓腔面與骨小樑表面的薄膜，含蝕骨細胞。', box([0, (TOP + BOT) / 2, -6.25], [16.3, TOP - BOT, 0.06], 0xff9040, 0.45), { anchor: [-2, -5, -6.25] });

      // 骨細胞放大
      const O = V(17, 1, 0), proc = [];
      reg('骨細胞放大', '骨陷窩', 'Lacuna', '骨細胞所在的小腔。', ell([O.x, O.y, O.z], [1.9, 0.9, 1.1], 0xe8d8b8, 0.3), { anchor: [O.x - 1.6, O.y + 0.7, 0.5] });
      reg('骨細胞放大', '骨細胞', 'Osteocyte', '困在骨陷窩中的成熟骨細胞，維持骨基質；以細長突起經骨小管與鄰近骨細胞及血管相連。', [ell([O.x, O.y, O.z], [1.5, 0.65, 0.8], 0x9a6ab8), ell([O.x, O.y, O.z + 0.3], [0.55, 0.35, 0.4], 0x5040a0)], { anchor: [O.x + 1.2, O.y + 0.5, 0.6] });
      for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, b = (rr() - 0.5) * 0.8; const d = V(Math.cos(a), Math.sin(a) * 0.8, b).normalize(); proc.push(ttube([O.clone().addScaledVector(d, 0.6), O.clone().addScaledVector(d, 2).add(V(0, 0.2 * Math.sin(k), 0)), O.clone().addScaledVector(d, 3.6)], 0.06, 0x9a6ab8)); }
      reg('骨細胞放大', '細胞突起（在骨小管內）', 'Cell processes in canaliculi', '骨細胞的細胞質突起伸入骨小管，相鄰骨細胞的突起相接（隙型連結），物質得以在細胞間傳遞。', proc, { anchor: [O.x + 2.6, O.y + 1.6, 0.3] });
      textSprite('骨細胞放大', [O.x, O.y + 3.6, 0], 0.8, '#ffd479', 'Osteocyte in lacuna');
    }
  });
})();
