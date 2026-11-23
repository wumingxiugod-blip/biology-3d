/* 場景⑥：肌梭、高基氏肌腱器與牽張反射（Ch12 12.5、Fig 12.27–12.30） */
(function () {
  let S = null;
  const C = V(-24, 5, 0), SP = V(2, 9.6, 0), KNEE = V(12, 0, 0);
  const off = (p, dz) => p.clone().add(V(0, 0, dz));

  function butterfly() {
    const sh = new THREE.Shape();
    for (let i = 0; i <= 120; i++) {
      const a = i / 120 * Math.PI * 2, s2 = Math.abs(Math.sin(2 * a));
      const r = (0.85 + 1.75 * Math.pow(s2, 1.6)) * (Math.sin(a) < 0 ? 1.12 : 0.92);
      const p = [r * Math.cos(a) * 1.05, r * Math.sin(a) * 0.95];
      i ? sh.lineTo(...p) : sh.moveTo(...p);
    }
    return sh;
  }
  function helixX(cx, cy, cz, x0, x1, r, turns) {
    const pts = []; for (let i = 0; i <= 200; i++) { const t = i / 200, a = t * turns * Math.PI * 2; pts.push(V(cx + x0 + (x1 - x0) * t, cy + r * Math.cos(a), cz + r * Math.sin(a))); }
    return pts;
  }

  SCENES.push({
    name: '⑥ 肌梭與反射',
    title: '肌梭、高基氏肌腱器與牽張反射（膝跳反射）',
    camera: { pos: [-4, 4, 52], target: [-4, 3, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([-4, 4, 52], [-4, 3, 0]); } },
      { label: '🔍 肌梭放大', fn() { flyTo([2, 10, 17], [2, 9.4, 0]); } },
      { label: '🔍 脊髓', fn() { flyTo([-20, 5, 17], [-21, 5, 2]); } },
      { label: '🔍 膝', fn() { flyTo([12, -2, 20], [11, -2, 0]); } }
    ],
    desc: `
  <p>控制骨骼肌需要持續的感覺回饋：<b>肌梭</b>（muscle spindle apparatus）偵測肌肉<b>長度</b>，<b>高基氏肌腱器</b>（Golgi tendon organ）偵測<b>張力</b>。</p>
  <p><b>肌梭</b>：結締組織囊內有幾條特化的細肌細胞＝<b>梭內纖維</b>（intrafusal fibers），與一般的<b>梭外纖維</b>（extrafusal）<b>並聯</b>，兩端同樣接到肌腱。梭內纖維中央沒有收縮構造、只有細胞核：</p>
  <table>
  <tr><td><b>核袋纖維</b></td><td>核聚集成一團（袋狀）</td></tr>
  <tr><td><b>核鏈纖維</b></td><td>核排成一列</td></tr>
  <tr><td><b>初級（環螺旋）末梢</b></td><td>纏繞兩種纖維中央；對<b>拉長的開始</b>（速度）反應最強</td></tr>
  <tr><td><b>次級（花枝狀）末梢</b></td><td>一般位於核鏈纖維的收縮端（人類也分布到核袋纖維）；對<b>持續拉長</b>反應</td></tr>
  </table>
  <p><b>α 運動神經元</b>（傳導快）支配梭外纖維 → 肌肉收縮；<b>γ 運動神經元</b>（較慢）支配梭內纖維兩端，使其收縮「收緊」肌梭，提高對被動拉長的敏感度。上運動神經元通常同時刺激兩者＝<b>α-γ 共同活化</b>；γ 活動維持正常<b>肌張力</b>。</p>
  <p><b>單突觸牽張反射</b>：敲<b>髕韌帶</b> → 股四頭肌與肌梭被拉長 → 環螺旋感覺神經元興奮 → 在脊髓直接與 α 運動神經元形成突觸（只有 1 個突觸）→ 梭外纖維收縮 → <b>膝跳反射</b>。</p>
  <p><b>高基氏肌腱器反射</b>：肌腱張力過大 → 感覺軸突與<b>抑制性中間神經元</b>形成突觸 → 抑制運動神經元（<b>雙突觸</b>反射）→ 防止過度收縮或被動過度拉長。</p>`,
    build() {
      S = { t: -1, mode: 0 };
      // ── 脊髓
      reg('脊髓', '脊髓（白質）', 'Spinal cord', '反射中樞所在。', cylM(C.clone().add(V(0, 0, -2.5)), C.clone().add(V(0, 0, 2.5)), 4, mat(0xf2eee2, 0.3), 48), { anchor: [C.x - 3.2, C.y + 2.4, 2.5] });
      const gm = new THREE.Mesh(new THREE.ExtrudeGeometry(butterfly(), { depth: 5.2, bevelEnabled: false }), mat(0xa89aa8, 0.85)); gm.position.set(C.x, C.y, -2.6);
      reg('脊髓', '灰質', 'Gray matter', '背角接收感覺輸入；前角含 α、γ 運動神經元的細胞本體。', gm, { anchor: [C.x - 1.6, C.y - 2.2, 2.6] });
      const D = C.clone().add(V(7, 3.4, 1.0));
      reg('脊髓', '背根神經節', 'Dorsal root ganglion', '感覺神經元（偽單極）細胞本體所在處。', ell([D.x, D.y, D.z], [1.0, 0.7, 0.7], 0xe8d070, 0.8), { anchor: [D.x, D.y + 0.7, D.z] });
      const aS = C.clone().add(V(2.1, -2.3, 2.75)), gS = C.clone().add(V(1.1, -1.7, 2.75)), iS = C.clone().add(V(0.7, 0.3, 2.75));
      const entry = C.clone().add(V(1.5, 2.4, 2.75)), vex = C.clone().add(V(3.4, -3.2, 2.2)), J = C.clone().add(V(9.5, -0.5, 1.0));
      const N1 = V(-10, 1.6, 1.2), N2 = V(-4, 3.6, 1.2);
      const SPs = V(1, 1.9, 1.0), G = V(10.1, 1.4, 0.8);
      const dRoot = [D, C.clone().add(V(3.8, 3.1, 1.8)), entry];
      const iaP = [SPs, V(0, 3.3, 1.2), N2, N1, J, D, ...dRoot.slice(1), C.clone().add(V(1.8, 0, 2.75)), aS];
      const aP = [aS, vex, off(J, 0.3), off(N1, 0.3), off(N2, 0.3), V(1.6, 3.1, 1.3), V(1.5, 2.9, 0.9)];
      const gP = [gS, vex.clone().add(V(-0.2, 0.1, 0)), off(J, -0.3), off(N1, -0.3), off(N2, -0.3), V(0.8, 3.0, 1.0), SPs.clone().add(V(-0.6, 0.15, 0))];
      const ibP = [G, V(8, 3.3, 1.4), off(N2, 0.55), off(N1, 0.55), off(J, 0.55), D.clone().add(V(0, 0, 0.3)), C.clone().add(V(3.8, 3.1, 2.1)), entry.clone().add(V(0.3, 0, 0)), iS];
      const iaA = [iS, aS.clone().add(V(-0.25, 0.3, 0))];
      const nrn = (p, r, col) => { const m = [ell([p.x, p.y, p.z], [r, r, r * 0.7], col)]; for (let k = 0; k < 4; k++) { const a = k * 1.6 + 0.3; m.push(ttube([[p.x, p.y, p.z], [p.x + Math.cos(a) * r * 2, p.y + Math.sin(a) * r * 2, p.z], [p.x + Math.cos(a + 0.4) * r * 3.2, p.y + Math.sin(a + 0.4) * r * 3.2, p.z]], [0.1, 0.03], col)); } return m; };
      S.aSoma = nrn(aS, 0.42, 0xffa040);
      S.pIa = reg('神經路徑', 'Ia 感覺神經元（環螺旋末梢）', 'Ia afferent (primary / annulospiral)', '自肌梭的<b>初級末梢</b>出發，細胞本體在背根神經節；進入脊髓後<b>直接</b>與 α 運動神經元形成突觸（單突觸）。', [ttube(iaP, 0.11, 0x4aa8ff)], { anchor: [-7, 2.9, 1.2] });
      S.pA = reg('神經路徑', 'α 運動神經元', 'Alpha motor neuron', '傳導快，支配<b>梭外纖維</b>，使肌肉收縮。細胞本體在前角，軸突經前根離開。', [...S.aSoma, ttube(aP, 0.13, 0xffa040)], { anchor: [aS.x, aS.y - 0.5, aS.z] });
      reg('神經路徑', 'γ 運動神經元', 'Gamma motor neuron', '傳導較慢，支配<b>梭內纖維</b>兩端；使梭內纖維收縮、收緊肌梭，提高其對拉長的敏感度（維持肌張力）。', [...nrn(gS, 0.28, 0xff70c0), ttube(gP, 0.08, 0xff70c0)], { anchor: [gS.x - 0.6, gS.y + 0.3, gS.z] });
      S.iSoma = nrn(iS, 0.3, 0xff4050);
      reg('神經路徑', '抑制性中間神經元', 'Inhibitory interneuron', '高基氏肌腱器反射中位於感覺與運動神經元之間的神經元，對 α 運動神經元產生<b>抑制性</b>突觸（雙突觸反射）。', [...S.iSoma, ttube(iaA, 0.08, 0xff4050)], { anchor: [iS.x - 0.8, iS.y + 0.3, iS.z] });
      reg('神經路徑', 'Ib 感覺神經元（腱器）', 'Golgi tendon organ afferent', '自高基氏肌腱器出發，在脊髓中與抑制性中間神經元形成突觸。', ttube(ibP, 0.09, 0x40e0c0), { anchor: [6, 3.0, 1.4] });
      textSprite('背根', [C.x + 4.3, C.y + 4.1, 1.8], 0.55, '#cfe3f5'); textSprite('前根', [vex.x + 0.6, vex.y - 0.7, vex.z], 0.55, '#cfe3f5');

      // ── 大腿與小腿
      reg('大腿與膝', '股骨', 'Femur', '大腿骨。', cyl([-8, 0, 0], [KNEE.x, 0, 0], 0.7, 0xe6d8b8), { anchor: [-6, -0.6, 0.5] });
      const qp = []; for (let h = 0; h <= 16.5; h += 0.5) qp.push([0.35 + 1.4 * Math.sin(Math.PI * Math.min(1, h / 16.5)) ** 0.7, h]);
      S.quad = lathe(qp, 0xc4554e, 0.5, [-6.5, 1.6, 0], [1, 0, 0], 32);
      S.pQ = reg('大腿與膝', '股四頭肌（梭外纖維）', 'Quadriceps femoris (extrafusal fibers)', '伸膝的肌肉。內含許多肌梭；其<b>梭外纖維</b>受 α 運動神經元支配。', S.quad, { anchor: [-3, 3.0, 0.4] });
      reg('大腿與膝', '股四頭肌腱', 'Quadriceps tendon', '連接股四頭肌與髕骨。', ttube([[9.8, 1.6, 0], [11.3, 1.4, 0], [12.5, 1.1, 0]], [0.45, 0.32], 0xf4f1ea), { anchor: [11, 1.9, 0.3] });
      reg('大腿與膝', '髕骨', 'Patella', '膝蓋骨，包在肌腱中。', ell([12.75, 0.6, 0], [0.45, 0.75, 0.6], 0xe6d8b8), { anchor: [13.2, 0.8, 0.4] });
      S.lig = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 12), mat(0xf4f1ea));
      S.pLig = reg('大腿與膝', '髕韌帶', 'Patellar ligament', '敲擊此處會<b>被動拉長</b>股四頭肌與其中的肌梭，引發膝跳反射。', S.lig, { anchor: [13.3, -1.2, 0.3] });
      S.leg = new THREE.Group(); S.leg.position.copy(KNEE); CUR.root.add(S.leg);
      const tib = [cyl([0, -0.3, 0], [0, -12.5, 0], 0.6, 0xe6d8b8), box([0.9, -13, 0], [2.6, 0.7, 1.2], 0xe6d8b8), ell([0.25, -0.5, 0], [0.9, 0.7, 0.8], 0xe6d8b8)];
      S.pLeg = reg('大腿與膝', '脛骨（小腿）', 'Tibia (leg)', '股四頭肌收縮時以膝為軸向前踢起（伸膝）。', tib, { anchor: [0.6, -8, 0.6] });
      attachPart(S.pLeg, S.leg);
      S.tub = V(0.75, -2.4, 0);
      const hm = new THREE.Group(); hm.position.set(15.0, -1.5, 0); CUR.root.add(hm); S.ham = hm;
      const hp = reg('大腿與膝', '叩診槌', 'Reflex hammer', '輕敲髕韌帶。', [cyl([0, 0, 0], [3.2, -1.6, 0], 0.15, 0x8899aa), cylM([-0.7, 0, 0], [0.7, 0, 0], 0.45, mat(0xd04050), 16)], { anchor: [15.6, -1.9, 0.5] });
      hp.meshes[1].position.set(-0.75, 0.1, 0); hp.meshes[1].quaternion.setFromUnitVectors(V(0, 1, 0), V(0.45, 0.9, 0).normalize());
      attachPart(hp, hm);
      S.smallSp = ell([SPs.x, SPs.y, SPs.z], [1.2, 0.22, 0.22], 0x80e0ff);
      reg('大腿與膝', '肌梭（位置）', 'Muscle spindle (in situ)', '散布在肌肉中、與梭外纖維並聯的牽張感受器；上方為其放大。', S.smallSp, { anchor: [SPs.x, SPs.y, SPs.z + 0.3] });
      reg('大腿與膝', '高基氏肌腱器', 'Golgi tendon organ', '位於肌肉與肌腱交界處，感覺神經末梢纏在肌腱膠原纖維之間，偵測肌腱<b>張力</b>。', ttube(helixX(G.x, G.y, G.z, -0.6, 0.6, 0.25, 4), 0.06, 0x40e0c0), { anchor: [G.x, G.y + 0.4, G.z] });
      dash([SPs.x, SPs.y + 0.25, SPs.z], [SP.x - 4, SP.y - 1.7, 0]); dash([SPs.x, SPs.y + 0.25, SPs.z], [SP.x + 4, SP.y - 1.7, 0]);

      // ── 肌梭放大（以 SP 為中心、沿 x）
      const g = new THREE.Group(); g.position.copy(SP); CUR.root.add(g); S.spG = g;
      const capP = []; for (let h = 0; h <= 15; h += 0.25) capP.push([0.18 + 1.35 * Math.sin(Math.PI * h / 15) ** 0.8, h]);
      const parts = [];
      parts.push(reg('肌梭放大', '肌梭囊', 'Spindle capsule', '包住梭內纖維的結締組織囊（中央較膨大）。', lathe(capP, 0xf4f1ea, 0.2, [-7.5, 0, 0], [1, 0, 0], 32), { anchor: [-3, 1.2, 0.5] }));
      const tb = stripeTex(10);
      parts.push(reg('肌梭放大', '核袋纖維', 'Nuclear bag fiber', '梭內纖維之一；中央無收縮構造，<b>細胞核聚集成袋狀</b>。兩端（有橫紋）可收縮，受 γ 運動神經元支配。',
        [cylM([-7.2, 0.35, 0], [-1.2, 0.35, 0], 0.2, tmat(tb), 10), cylM([1.2, 0.35, 0], [7.2, 0.35, 0], 0.2, tmat(tb), 10), ell([0, 0.35, 0], [1.4, 0.42, 0.42], 0xf0c0b8, 0.6)], { anchor: [-5, 0.6, 0] }));
      const rr = rnd(3), bagN = []; for (let i = 0; i < 22; i++) bagN.push(V((rr() - 0.5) * 1.8, 0.35 + (rr() - 0.5) * 0.45, (rr() - 0.5) * 0.45));
      const chainN = []; [-0.35, 0.35].forEach(z => { for (let i = -6; i <= 6; i++) chainN.push(V(i * 0.17, -0.32, z)); });
      parts.push(reg('肌梭放大', '核鏈纖維', 'Nuclear chain fibers', '較細短的梭內纖維；中央的<b>細胞核排成一列</b>。', [-0.35, 0.35].flatMap(z => [cylM([-5.4, -0.32, z], [-1.1, -0.32, z], 0.14, tmat(tb), 8), cylM([1.1, -0.32, z], [5.4, -0.32, z], 0.14, tmat(tb), 8), cylM([-1.1, -0.32, z], [1.1, -0.32, z], 0.14, mat(0xf0c0b8, 0.7), 8)]), { anchor: [4, -0.55, 0.4] }));
      parts.push(reg('肌梭放大', '梭內纖維的細胞核', 'Nuclei of intrafusal fibers', '梭內纖維中央區只有細胞核、沒有肌原纖維，因此中央不會收縮。', [dots(bagN, 0.11, 0x5060c8), dots(chainN, 0.1, 0x5060c8)], { anchor: [0, 0.75, 0.3] }));
      parts.push(reg('肌梭放大', '初級（環螺旋）末梢', 'Primary (annulospiral) ending', 'Ia 感覺神經元的末梢，<b>纏繞</b>核袋與核鏈纖維的中央部；對肌肉<b>開始被拉長</b>時反應最強。',
        [ttube(helixX(0, 0, 0, -1.3, 1.3, 0.72, 6), 0.06, 0x4aa8ff), ttube([[0, 0.72, 0], [0, 1.6, 0.3], [-0.6, 3.2, 0.4]], 0.1, 0x4aa8ff)], { anchor: [0.3, 0.75, 0.6] }));
      const spray = []; [-1, 1].forEach(s => [-0.35, 0.35].forEach(z => { for (let k = 0; k < 4; k++) spray.push(ttube([[s * 2.6, 0.4, z * 1.5], [s * (2.4 + k * 0.15), 0, z], [s * (2.3 + k * 0.25), -0.32 + (k % 2 ? 0.12 : -0.12), z]], 0.035, 0x7fe0ff)); }));
      spray.push(ttube([[2.6, 0.4, 0.5], [2.6, 1.8, 0.6], [2.9, 3.2, 0.6]], 0.07, 0x7fe0ff), ttube([[-2.6, 0.4, -0.5], [-1.8, 1.8, 0.2], [-0.8, 3.2, 0.4]], 0.06, 0x7fe0ff));
      parts.push(reg('肌梭放大', '次級（花枝狀）末梢', 'Secondary (flower-spray) ending', '一般位於<b>核鏈纖維</b>可收縮的兩端上（課本：人類的次級末梢似乎也分布到核袋纖維）；對<b>持續拉長</b>反應。', spray, { anchor: [2.8, -0.1, 0.6] }));
      const gEnd = []; [-4.6, 4.6].forEach(x => [0.35, -0.32].forEach((y, k) => gEnd.push(ell([x, y, k ? 0.35 : 0], [0.28, 0.08, 0.22], 0xff70c0))));
      gEnd.push(ttube([[-4.6, 0.45, 0], [-4.3, 1.8, 0.2], [-3.4, 3.2, 0.3]], 0.06, 0xff70c0), ttube([[4.6, 0.45, 0], [4.3, 1.8, 0.2], [3.4, 3.2, 0.3]], 0.06, 0xff70c0));
      S.gEnd = gEnd;
      parts.push(reg('肌梭放大', 'γ 運動末梢', 'Gamma motor endings', '位於梭內纖維<b>兩端</b>可收縮的部分。γ 運動神經元興奮 → 兩端收縮、把中央拉緊（主動牽張）。', gEnd, { anchor: [-4.6, 0.6, 0.3] }));
      const ex = [-1, 1].map(s => cylM([-7.5, s * 2.5, 0], [7.5, s * 2.5, 0], 0.85, tmat(stripeTex(14, { I: '#d29a92' })), 20));
      parts.push(reg('肌梭放大', '梭外纖維', 'Extrafusal fibers', '一般的骨骼肌纖維，與肌梭<b>並聯</b>；受 α 運動神經元支配。', ex, { anchor: [-6, -2.5, 0.85] }));
      parts.push(reg('肌梭放大', 'α 運動終板', 'Alpha motor end plates', 'α 運動神經元在梭外纖維上的神經肌肉接合處。', [ell([0.5, 3.35, 0], [0.5, 0.1, 0.4], 0xffa040), ell([-0.5, -1.65, 0], [0.5, 0.1, 0.4], 0xffa040), ttube([[0.5, 3.4, 0], [1.2, 4.2, 0.2], [2.2, 4.8, 0.2]], 0.1, 0xffa040), ttube([[-0.5, -1.6, 0], [-0.1, -0.9, 1.2], [1.4, 1.4, 1.6], [2.2, 4.8, 0.3]], 0.1, 0xffa040)], { anchor: [0.5, 3.5, 0.3] }));
      parts.forEach(p => attachPart(p, g));
      textSprite('肌梭放大', [SP.x, SP.y + 4.2, 0], 0.9, '#ffd479', 'Muscle spindle apparatus');

      // 脈衝
      S.pl = dots([V(0, -99, 0)], 0.33, 0xffffff); S.pl.material.emissive.setHex(0xffff60); CUR.root.add(S.pl);
      S.paths = { ia: iaP, a: aP, g: gP, ib: ibP };
      S.setLig = kick => {
        const tw = S.tub.clone().applyAxisAngle(V(0, 0, 1), kick).add(KNEE);
        setCyl(S.lig, V(12.95, 0, 0), tw, 0.22); S.pLig.anchor.copy(V(12.95, 0, 0)).lerp(tw, 0.5).add(V(0.3, 0, 0));
      };
      S.setLig(0);
      const dt = dtClock();
      const pulse = (path, k) => { S.pl.setP(0, k <= 0 || k >= 1 ? V(0, -99, 0) : alongPath(path, k)); S.pl.instanceMatrix.needsUpdate = true; };
      CUR.tick = () => {
        const d = dt(); if (S.t < 0) return;
        S.t += d; const t = S.t;
        let ham = 0, stretch = 0, kick = 0, cont = 0, step = -1, aGlow = false, iGlow = false, gPole = 0;
        if (S.mode === 0) { // 膝跳反射
          ham = t < 0.35 ? -Math.sin(Math.PI * t / 0.35) * 0.55 : 0;
          stretch = t > 0.25 && t < 1.2 ? Math.sin(Math.PI * clamp01((t - 0.25) / 0.95)) : 0;
          if (t < 0.4) step = 0; else if (t < 1.8) { step = 1; pulse(S.paths.ia, (t - 0.4) / 1.4); } else if (t < 2.0) { step = 2; aGlow = true; pulse(S.paths.ia, 2); }
          else if (t < 3.0) { step = 3; aGlow = true; pulse(S.paths.a, (t - 2.0) / 1.0); }
          else { step = 4; pulse(S.paths.a, 2); }
          cont = t > 2.9 ? Math.sin(Math.PI * clamp01((t - 2.9) / 1.4)) : 0; kick = 0.65 * cont;
          if (t > 4.6) S.t = -1;
        } else if (S.mode === 1) { // 高基氏肌腱器
          cont = t < 3.4 ? clamp01(t / 0.5) * (t > 2.6 ? 1 - (t - 2.6) / 0.8 : 1) : 0; kick = 0.5 * cont;
          if (t < 0.6) step = 0; else if (t < 1.9) { step = 1; pulse(S.paths.ib, (t - 0.6) / 1.3); } else if (t < 2.6) { step = 2; iGlow = true; pulse(S.paths.ib, 2); } else { step = 3; }
          if (t > 3.8) S.t = -1;
        } else { // α-γ 共同活化
          cont = t < 2.6 ? Math.sin(Math.PI * clamp01(t / 2.6)) : 0; kick = 0.4 * cont; gPole = cont;
          step = t < 0.8 ? 0 : 1; pulse(S.paths.g, t < 0.8 ? t / 0.8 : 2);
          if (t > 2.8) S.t = -1;
        }
        S.ham.rotation.z = ham;
        const sx = 1 + 0.1 * stretch - 0.06 * cont;
        S.quad.scale.set(1 - 0.06 * cont + 0.04 * stretch, 1, 1);
        S.spG.scale.x = 1 + 0.12 * stretch - 0.05 * gPole; S.smallSp.scale.x = 1.2 * sx;
        S.gEnd.forEach(m => m.material.emissive.setHex(gPole > 0.1 ? 0x802060 : 0));
        S.leg.rotation.z = kick; S.setLig(kick); updateAnchors();
        S.aSoma[0].material.emissive.setHex(aGlow ? 0x806000 : S.mode === 1 && step >= 2 ? 0x000000 : 0);
        S.aSoma[0].material.color.setHex(S.mode === 1 && step >= 2 ? 0x705040 : 0xffa040);
        S.iSoma[0].material.emissive.setHex(iGlow ? 0x800010 : 0);
        S.pQ.meshes[0].material.emissive.setHex(cont > 0.2 ? 0x401000 : 0);
        if (S.setStep) S.setStep(S.t < 0 ? -1 : step);
        if (S.t < 0) { pulse(null, 2); S.aSoma[0].material.color.setHex(0xffa040); }
      };
    },
    panel(box) {
      const lists = [
        ['① 叩診槌敲擊髕韌帶', '② 股四頭肌與肌梭被<b>被動拉長</b> → 環螺旋末梢興奮，訊號經 Ia 感覺神經元傳入脊髓', '③ 在脊髓中<b>直接</b>與 α 運動神經元形成突觸（單突觸）', '④ α 運動神經元把衝動傳到梭外纖維', '⑤ 股四頭肌收縮 → 小腿前踢（膝跳反射）'],
        ['① 股四頭肌強力收縮，肌腱張力升高', '② 高基氏肌腱器興奮，訊號傳入脊髓', '③ 與<b>抑制性中間神經元</b>形成突觸 → 抑制 α 運動神經元（雙突觸反射）', '④ 肌肉放鬆，避免張力過大'],
        ['① 上運動神經元同時刺激 α 與 γ 運動神經元', '② α → 梭外纖維收縮；γ → 梭內纖維兩端收縮，收緊肌梭鬆弛的部分，使肌梭在肌肉縮短時仍保持敏感']
      ];
      const holder = document.createElement('div');
      const go = m => { holder.innerHTML = ''; S.setStep = stepList(holder, lists[m]); S.mode = m; S.t = 0; };
      btnRow(box, [['🔨 膝跳反射', () => go(0)], ['腱器反射', () => go(1)], ['α-γ 共同活化', () => go(2)]]);
      box.appendChild(holder); S.setStep = stepList(holder, lists[0]);
    }
  });
})();
