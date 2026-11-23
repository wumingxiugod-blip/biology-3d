/* 場景③：骨的發育與生長（講義 p.3–4：骨化、周邊生長、縱向生長、改建） */
(function () {
  let STG = 0, S = null, G = 0.3;
  const X0 = -15, L = 7;
  const rO = y => { const a = Math.abs(y); if (a <= 3.6) return 1.05; if (a <= 6) return 1.05 + 0.9 * ease((a - 3.6) / 2.4); return 1.95 * Math.sqrt(Math.max(0, 1 - ((a - 6) / 1.05) ** 2)); };
  const samp = (y0, y1, f, n = 50) => { const o = []; for (let i = 0; i <= n; i++) { const y = y0 + (y1 - y0) * i / n; o.push([f(y), y]); } return o; };
  const STAGES = [
    ['(a) 軟骨模型', '胚胎期（人類約 6–7 週）先以<b>透明軟骨</b>形成骨的雛形，外包軟骨膜。'],
    ['(b) 骨領與鈣化軟骨', '骨幹中段的軟骨細胞肥大、基質<b>鈣化</b>；軟骨膜轉為<b>骨外膜</b>，在骨幹外圍形成一圈薄骨（骨領）。'],
    ['(c) 初級骨化中心', '<b>血管</b>穿入骨幹中央，帶入成骨細胞，在鈣化軟骨上沉積骨質＝<b>初級骨化中心</b>。'],
    ['(d) 骨髓腔與次級骨化中心', '骨幹中央的骨被吸收形成<b>骨髓腔</b>；骨骺中出現<b>次級骨化中心</b>（血管進入骨骺）。'],
    ['(e) 骺板', '骨骺與骨幹之間留下一層軟骨＝<b>骺板</b>（epiphyseal disk）；軟骨在此持續增生並被骨取代 → 骨<b>變長</b>。關節面保留<b>關節軟骨</b>。'],
    ['(f) 成人', '生長結束（人類顱骨約 2 歲完成；其他骨約 ♀18、♂20 歲）時骺板關閉，被緻密骨取代，只留<b>骺線</b>。']
  ];

  function layer(meshes, z) { meshes.forEach(m => m.position.z = z); return meshes; }
  function region(y0, y1, fo, fi, col, tex) {
    const o = samp(y0, y1, fo), i = fi ? samp(y0, y1, fi) : null;
    return cutFace(o, i, col, 1, tex);
  }

  function rebuildRing() {
    const ro = 2 + 1.2 * G, ri = 0.9 + 1.0 * G, C = S.ringC;
    const sh = new THREE.Shape(); sh.absarc(0, 0, ro, 0, Math.PI * 2, false);
    const h = new THREE.Path(); h.absarc(0, 0, ri, 0, Math.PI * 2, true); sh.holes.push(h);
    S.ring.geometry.dispose(); S.ring.geometry = new THREE.ExtrudeGeometry(sh, { depth: 1.2, bevelEnabled: false, curveSegments: 48 }); S.ring.geometry.translate(0, 0, -0.6);
    S.marrow.scale.set(ri, ri, 1); S.peri.geometry.dispose(); S.peri.geometry = new THREE.TorusGeometry(ro + 0.12, 0.09, 8, 60);
    S.obl.forEach((m, k) => { const a = k / S.obl.length * Math.PI * 2; m.position.set(C.x + Math.cos(a) * (ro + 0.05), C.y + Math.sin(a) * (ro + 0.05), 0.5); m.rotation.z = a; });
    S.ocl.forEach((g, k) => { const a = k / S.ocl.length * Math.PI * 2 + 0.3; g.position.set(C.x + Math.cos(a) * (ri - 0.28), C.y + Math.sin(a) * (ri - 0.28), 0.5); g.rotation.z = a + Math.PI / 2; });
    S.pObl.anchor.set(C.x + ro + 0.2, C.y + 0.6, 0.6); S.pOcl.anchor.copy(S.ocl[0].position); S.pRing.anchor.set(C.x, C.y + (ro + ri) / 2, 0.6);
    if (S.rd) S.rd.innerHTML = `外徑 <b>${(2 * ro).toFixed(1)}</b>　骨髓腔直徑 <b>${(2 * ri).toFixed(1)}</b>（任意單位）`;
  }

  SCENES.push({
    name: '③ 骨的發育與生長',
    title: '骨的發育：軟骨內骨化、骺板與周邊生長',
    camera: { pos: [3, 2, 40], target: [3, 0, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([3, 2, 40], [3, 0, 0]); } },
      { label: '🔍 骨化階段', fn() { flyTo([-12, 1, 18], [-15, 0, 0]); } },
      { label: '🔍 骺板分區', fn() { flyTo([5, 0, 15], [3, 0, 0]); } },
      { label: '🔍 周邊生長', fn() { flyTo([20, 0, 12], [19, 0, 0]); } }
    ],
    desc: `
  <p><b>鈣化</b>（calcification）：鈣鹽沉積；結果可使組織損傷或死亡（如軟骨鈣化後軟骨細胞死亡）。<b>骨化</b>（ossification）：<b>成骨細胞</b>造骨的生長作用，分為：</p>
  <table>
  <tr><td><b>膜內骨化</b><br>intramembranous</td><td>直接在<b>纖維膜</b>中造骨：顱頂、下頜骨、鎖骨</td></tr>
  <tr><td><b>軟骨內骨化</b><br>endochondral</td><td>先形成<b>透明軟骨</b>模型再被骨取代：顱骨基部、體內諸骨（長骨）</td></tr>
  </table>
  <p><b>周邊生長</b>（circumferential growth，使骨幹<b>增粗</b>）：骨外膜的成骨細胞在外圍造新骨；同時骨內膜的<b>蝕骨細胞</b>吸收舊骨、擴大骨髓腔。</p>
  <p><b>縱向生長</b>（longitudinal growth，使骨幹<b>加長</b>）：經軟骨內骨化在<b>骺板</b>進行；生長激素經 IGF-1 刺激骺板軟骨細胞分裂。青春期後骺板關閉（被緻密骨取代），身高停止增加。</p>
  <p><b>骨的改建</b>（remodeling）：不論生長是否完成，骨都持續被成骨細胞沉積、被蝕骨細胞吸收（講義：周轉率約 18%/年）；成熟緻密骨依機械應力及血鈣濃度改建。課本：前 20 年造骨快於吸收；骨量約 30 多歲達高峰，50–60 歲後吸收常超過沉積。</p>`,
    build() {
      S = { t: 0, play: true };
      // ── 左：軟骨內骨化各階段（半剖面）
      const g = new THREE.Group(); g.position.x = X0; CUR.root.add(g);
      const add = (zh, en, info, meshes, anchor) => { const p = reg('骨化階段', zh, en, info, meshes, { anchor }); attachPart(p, g); return p; };
      const full = samp(-L - 0.1, L + 0.1, rO, 120), st = STG;
      const sTex = spongyTex(8), sTexY = spongyTex(9, 'rgba(240,200,90,0.6)');
      const collarH = [0, 2.6, 4.2, 5.4, 6.2, 6.4][st], collarT = [0, 0.12, 0.2, 0.28, 0.34, 0.42][st];
      add(st < 2 ? '透明軟骨' : '透明軟骨（尚未骨化處）', 'Hyaline cartilage', '軟骨細胞埋在半固態基質中；胎兒時期許多骨的前身，成人只留在關節面（關節軟骨）。',
        [halfLathe(full, st < 2 ? CART : BONE, 1, false, 40), region(-L - 0.1, L + 0.1, rO, null, CART)], [1.4, -L + 1.5, 0.05]);
      if (st === 0) add('軟骨膜', 'Perichondrium', '包住軟骨的結締組織膜；之後轉變為骨外膜。', halfLathe(full.map(p => [p[0] + 0.1, p[1]]), 0xf6f2ea, 0.35, false, 40), [1.2, 2, -0.3]);
      if (st >= 1) {
        add('骨領（緻密骨）', 'Bone collar / compact bone', '骨外膜的成骨細胞在骨幹外圍造出的骨（膜內方式）；之後增厚成骨幹的緻密骨。',
          [halfLathe(samp(-collarH, collarH, y => rO(y) + 0.02), BONE, 1, false, 40), ...layer([region(-collarH, collarH, y => rO(y) + 0.02, y => rO(y) - collarT, BONE)], 0.02)], [1.15, 0.5, 0.05]);
        add('骨外膜', 'Periosteum', '由軟骨膜轉變而來；內層含成骨細胞，使骨增粗。', halfLathe(samp(-collarH, collarH, y => rO(y) + 0.14), 0xf6f2ea, 0.35, false, 40), [-1.3, -2, -0.4]);
      }
      if (st === 1) add('鈣化軟骨', 'Calcified cartilage', '骨幹中段的軟骨細胞肥大，基質鈣化，軟骨細胞隨後死亡。', layer([region(-2.2, 2.2, y => rO(y) - 0.13, null, 0x7f9fb8)], 0.012), [0, 0, 0.05]);
      if (st >= 2) {
        const cav = [0, 0, 0, 2.4, 3.4, 4.6][st], sp = [0, 0, 2.6, 4.6, 4.5, 5.0][st];
        add('初級骨化中心（海綿骨）', 'Primary ossification center', '血管帶入的成骨細胞在鈣化軟骨殘骸上沉積骨質，形成海綿骨。',
          layer([region(-sp, sp, y => rO(y) - collarT + 0.01, null, 0xffffff, sTex)], 0.015), [0.4, cav ? cav + 0.6 : 0.8, 0.05]);
        add('血管', 'Blood vessels', '營養動脈穿過骨領進入骨幹中央，帶入成骨細胞與蝕骨細胞的前驅細胞。',
          [ttube([[2.5, 0.8, -0.4], [1.2, 0.4, -0.3], [0.2, 0, -0.1], [0, -2, -0.1]], 0.1, 0xd02030), ...(st >= 3 ? [ttube([[2.6, L - 2, -0.4], [1.6, L - 1.2, -0.3], [0.3, L - 0.9, -0.1]], 0.08, 0xd02030)] : []), ...(st >= 4 ? [ttube([[2.6, -L + 2, -0.4], [1.6, -L + 1.2, -0.3], [0.3, -L + 0.9, -0.1]], 0.08, 0xd02030)] : [])], [2.2, 0.8, -0.3]);
        if (cav) add('骨髓腔', 'Medullary cavity', '骨幹中央的骨被蝕骨細胞吸收而成；內含骨髓。', layer([region(-cav, cav, y => Math.min(rO(y) - collarT - 0.05, 0.72 * (1 - (Math.abs(y) / cav) ** 6) + 0.01), null, st >= 5 ? MARY : MARR)], 0.02), [0, 0, 0.05]);
      }
      if (st >= 3) {
        const big = st >= 4;
        [1, -1].forEach(s => {
          if (!big && s < 0) return;
          add(big ? (s > 0 ? '骨骺海綿骨（近端）' : '骨骺海綿骨（遠端）') : '次級骨化中心', 'Secondary ossification center', '骨骺內的骨化中心：血管進入骨骺，軟骨被海綿骨取代（遠端較晚出現）。',
            layer([big ? region(s > 0 ? 4.9 : -L + 0.3, s > 0 ? L - 0.3 : -4.9, y => Math.max(0.02, rO(y) - 0.3), null, 0xffffff, sTex) : cutFace(samp(L - 2.2, L - 0.9, y => 0.9 * Math.sqrt(Math.max(0, 1 - ((y - (L - 1.55)) / 0.65) ** 2))), null, 0xffffff, 1, sTex)], 0.03), [s * 0.5, s * (L - 1.4), 0.05]);
        });
      }
      if (st === 4) add('骺板（軟骨）', 'Epiphyseal plate', '骨骺與骨幹之間保留的透明軟骨層，軟骨細胞持續增生、鈣化、被骨取代，使骨加長（右側為放大）。',
        [1, -1].map(s => layer([region(s > 0 ? 4.5 : -4.9, s > 0 ? 4.9 : -4.5, y => rO(y) - 0.02, null, CART)], 0.04)[0]), [1.6, 4.7, 0.05]);
      if (st === 5) add('骺線', 'Epiphyseal line', '骺板關閉後留下的痕跡。', [1, -1].map(s => layer([region(s * 4.7 - 0.04, s * 4.7 + 0.04, y => rO(y) - 0.02, null, 0xffffff)], 0.045)[0]), [1.6, 4.7, 0.05]);
      if (st >= 4) add('關節軟骨', 'Articular cartilage', '骨骺關節面保留的透明軟骨。', [1, -1].map(s => { const ln = samp(L - 0.75, L + 0.1, rO, 16), arc = ln.concat(ln.slice(0, -1).reverse().map(p => [-p[0], p[1]])); return extrudePoly(bandPts(arc.map(p => [p[0], s * p[1]]), 0.36), 0.02, CART, 1, 0.06); }), [0.9, L + 0.1, 0.1]);
      textSprite(STAGES[st][0], [X0, L + 1.6, 0], 0.8, '#ffd479');

      // ── 中：骺板分區（放大）
      const PX = 3, ZT = [[6, 4.5, '骨骺的骨組織'], [4.5, 3, '① 靜止區'], [3, 0.6, '② 增生區'], [0.6, -1.4, '③ 肥大區'], [-1.4, -3, '④ 鈣化區'], [-3, -6, '⑤ 骨化區']];
      reg('骺板放大', '軟骨基質', 'Cartilage matrix', '骺板的透明軟骨基質。', box([PX, 0.8, -0.5], [6, 7.6, 1.6], CART, 0.35), { anchor: [PX - 3, 2, 0.3] });
      reg('骺板放大', '骨骺的骨組織', 'Bone tissue of epiphysis', '骺板上方（骨骺側）的海綿骨。', cutFace([[3, 4.6], [3, 6]], null, 0xffffff, 1, sTex), { anchor: [PX + 2.6, 5.6, 0.1] });
      partBy('骨骺的骨組織').meshes[0].position.set(PX, 0, 0.32);
      reg('骺板放大', '鈣化的細胞間質', 'Calcified intercellular substance', '肥大的軟骨細胞使周圍基質鈣化，養分無法擴散，軟骨細胞死亡。', box([PX, -2.2, -0.5], [6, 1.6, 1.62], 0x7f9fb8, 0.55), { anchor: [PX + 3, -2.2, 0.4] });
      const sp = [], cap = [];
      for (let i = 0; i < 6; i++) { const x = PX - 2.5 + i; sp.push([new THREE.BoxGeometry(0.22, 3.1, 1.2), mtx([x, -4.45, -0.5])]); }
      reg('骺板放大', '新骨（骨小樑）', 'New bone on cartilage remnants', '成骨細胞在鈣化軟骨的殘骸表面沉積骨質，形成骨幹端的海綿骨。', new THREE.Mesh(mergeGeo(sp), mat(BONE)), { anchor: [PX - 2.5, -5.4, 0.2] });
      for (let i = 0; i < 5; i++) cap.push(ttube([[PX - 2 + i, -6, 0], [PX - 2 + i + 0.1, -4.6, 0.05], [PX - 2 + i, -3.2, 0]], 0.08, 0xd02030));
      reg('骺板放大', '微血管', 'Capillaries', '自骨幹端伸入，帶來成骨細胞並移除死亡的軟骨細胞。', cap, { anchor: [PX - 1.5, -4.2, 0.2] });
      const ob = []; for (let i = 0; i < 6; i++) for (let k = 0; k < 4; k++) ob.push([new THREE.BoxGeometry(0.16, 0.22, 0.2), mtx([PX - 2.5 + i + 0.19, -5.6 + k * 0.75, 0.15])]);
      reg('骺板放大', '成骨細胞', 'Osteoblasts', '沉積骨組織（分泌膠原基質，再以羥磷灰石鈣化）。', new THREE.Mesh(mergeGeo(ob), mat(0x9a4ab8)), { anchor: [PX + 2.7, -4.8, 0.3] });
      const rest = []; const r2 = rnd(4); for (let i = 0; i < 16; i++) rest.push(V(PX - 2.6 + r2() * 5.2, 3.2 + r2() * 1.1, -0.1 + r2() * 0.3));
      reg('骺板放大', '靜止軟骨細胞', 'Resting cells', '①靠骨骺側的小型軟骨細胞，散在不分裂（幹細胞庫）。', dots(rest, 0.16, 0x6080c0), { anchor: [PX - 2.4, 3.8, 0.3] });
      S.cols = [];
      for (let c = 0; c < 5; c++) for (let k = 0; k < 18; k++) S.cols.push({ x: PX - 2 + c, k });
      S.cm = dots(S.cols.map(() => V()), 0.2, 0x6080c0);
      reg('骺板放大', '軟骨細胞柱', 'Chondrocyte columns', '②增生區：軟骨細胞進行<b>有絲分裂</b>，扁平細胞疊成柱狀；③肥大區：較老的細胞<b>變大</b>並使基質<b>鈣化</b>；④細胞死亡、留下鈣化間質。細胞不斷往骨幹方向「推進」，所以骨變長。', S.cm, { anchor: [PX + 0.5, 1.6, 0.4] });
      ZT.forEach(([a, b, t]) => textSprite(t, [PX - 4.6, (a + b) / 2, 0], 0.5, '#cfe3f5'));
      textSprite('骺板分區（縱切放大）', [PX, 7.1, 0], 0.7, '#ffd479');
      dash([X0 + 1.6, 4.7, 0], [PX - 3, 3, 0]);

      // ── 右：周邊生長（骨幹橫切）
      S.ringC = V(19.5, 0, 0);
      S.ring = new THREE.Mesh(new THREE.BufferGeometry(), mat(BONE)); S.ring.position.copy(S.ringC);
      S.pRing = reg('周邊生長', '骨幹橫切（緻密骨）', 'Diaphysis cross section', '骨幹的環狀緻密骨。拖動滑桿可看到外徑與骨髓腔一起變大。', S.ring, { anchor: [0, 0, 0] });
      S.marrow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), mat(MARY)); S.marrow.position.copy(S.ringC).setZ(0.55);
      reg('周邊生長', '骨髓腔', 'Medullary cavity', '被蝕骨細胞擴大。', S.marrow, { anchor: [S.ringC.x, S.ringC.y, 0.6] });
      S.peri = new THREE.Mesh(new THREE.BufferGeometry(), mat(0xf6f2ea, 0.6)); S.peri.position.copy(S.ringC).setZ(0.2);
      reg('周邊生長', '骨外膜', 'Periosteum', '內層含成骨細胞。', S.peri, { anchor: [S.ringC.x - 3.3, S.ringC.y + 1.6, 0.4] });
      S.obl = []; for (let i = 0; i < 28; i++) S.obl.push(box([0, 0, 0], [0.22, 0.3, 0.3], 0x9a4ab8));
      S.pObl = reg('周邊生長', '成骨細胞（外表面）', 'Osteoblasts', '骨外膜生骨層的成骨細胞在<b>外表面</b>製造新骨 → 骨幹<b>增粗</b>。', S.obl, { anchor: [0, 0, 0] });
      S.ocl = []; const om = [];
      for (let i = 0; i < 6; i++) { const gg = new THREE.Group(); CUR.root.add(gg); const b = ell([0, 0, 0], [0.55, 0.26, 0.3], 0xd07040); const n = [-0.25, 0, 0.25].map(x => ell([x, 0.04, 0.2], [0.09, 0.09, 0.09], 0x403070)); gg.add(b, ...n); S.ocl.push(gg); om.push(b, ...n); }
      S.pOcl = reg('周邊生長', '蝕骨細胞（內表面）', 'Osteoclasts', '骨內膜上<b>多核</b>的大型細胞（類巨噬細胞）：以皺褶膜分泌 H⁺（溶解磷酸鈣）與 cathepsin K（分解膠原）→ <b>吸收</b>舊骨、擴大骨髓腔。', om, { anchor: [0, 0, 0] });
      S.ocl.forEach((gg, i) => [0, 1, 2, 3].forEach(k => gg.add(om[i * 4 + k])));
      textSprite('周邊生長（骨幹橫切）', [S.ringC.x, 4.6, 0], 0.7, '#ffd479');
      rebuildRing(); updateAnchors();

      const dt = dtClock(), sp2 = 0.25, top = 3.0, bot = -3.0, span = 18 * sp2 + 1.5;
      CUR.tick = () => {
        const d = dt(); if (S.play) S.t += d;
        S.cols.forEach((c, i) => {
          let y = top - ((c.k * (span / 18) + S.t * 0.35) % span);
          let s = [0.27, 0.1, 0.26], col;
          if (y > 0.6) { s = [0.3, 0.1, 0.28]; }
          else if (y > -1.4) { const k = (0.6 - y) / 2; s = [0.3 + 0.12 * k, 0.12 + 0.24 * k, 0.3 + 0.1 * k]; }
          else if (y > bot) { const k = (-1.4 - y) / 1.6; s = [0.4 - 0.2 * k, 0.34 - 0.2 * k, 0.38 - 0.2 * k]; }
          else s = [0.001, 0.001, 0.001];
          const o = new THREE.Object3D(); o.position.set(c.x, y, 0.1); o.scale.set(...s); o.updateMatrix(); S.cm.setMatrixAt(i, o.matrix);
        });
        S.cm.instanceMatrix.needsUpdate = true;
      };
    },
    panel(box) {
      const sl = slider(box, '骨化階段', 1, 6, STG + 1, 1, v => { STG = v - 1; reloadKeep(); });
      note(box, '<b>' + STAGES[STG][0] + '</b>：' + STAGES[STG][1]);
      checkbox(box, '播放骺板軟骨細胞的增生與推進', true, v => S.play = v);
      slider(box, '周邊生長（年齡）', 0, 1, G, 0.05, v => { G = v; rebuildRing(); });
      S.rd = note(box, '', 'rd'); rebuildRing();
      void sl;
    }
  });
})();
