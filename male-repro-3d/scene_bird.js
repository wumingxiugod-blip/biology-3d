/* 場景⑥–⑦：鳥類（雄禽）生殖系統與交接器官（升級有機外形＋性活動期變大變白動畫＋淋巴勃起外翻動畫） */

/* ---------- ⑥ 雄禽生殖系統整體 ---------- */
SCENES.push({
  name: '⑥ 鳥類整體',
  title: '雄禽生殖系統（背面觀示意）',
  camera: { pos: [-0.3, 6.0, 4.8], target: [-0.3, -0.05, 0] },
  desc: `<p>雄禽生殖器官：成對<b>睪丸、附睪、輸精管</b>與一個<b>交接器</b>，全部位於<b>體內</b>，<b>無輔性腺</b>。睪丸位於腎臟前葉腹前端，左側略大於右側。</p>
  <p>點擊右上方按鈕可觀察<b>性活動期／非活動期</b>的睪丸體積劇烈脹縮（繁殖季可膨大數十至數百倍）與色澤由淡棕轉白！</p>`,
  controls: [
    { label: '🔄 切換：性活動期／非活動期', fn() { window._birdActive = !window._birdActive; } },
    { label: '⚡ 精子路徑演示', fn() { window._birdFlow = !window._birdFlow; } }
  ],
  build() {
    const S = [1, -1];
    window._birdActive = false;
    window._birdFlow = false;
    let actT = 0, flowPhase = 0;

    // 有機分葉禽類三葉腎臟（前、中、後葉平滑連接）
    const KID = [];
    S.forEach(s => {
      KID.push(
        blob([0.78, -0.04, s * 0.50], [0.46, 0.14, 0.23], 0x9a4a3a, 0.88, { amp: 0.08, seed: 11 + s }),
        blob([-0.04, -0.05, s * 0.49], [0.42, 0.13, 0.21], 0x8f4334, 0.88, { amp: 0.08, seed: 21 + s }),
        blob([-0.86, -0.04, s * 0.50], [0.46, 0.14, 0.22], 0x9a4a3a, 0.88, { amp: 0.08, seed: 31 + s })
      );
    });
    reg('參考構造', '腎臟（前、中、後葉）', 'Kidney', '禽類腎臟深嵌於綜合薦骨窩，分前、中、後三葉；睪丸緊鄰腎臟前葉腹前端。', KID, { anchor: [-0.05, 0.1, 0.5] });
    reg('參考構造', '主動脈', 'Aorta', '睪丸內側緊鄰主動脈與後腔靜脈。', tube([[1.6, 0.14, 0], [-1.7, 0.14, 0]], 0.04, 0xe03030), { anchor: [0.2, 0.18, 0] });
    reg('參考構造', '後腔靜脈', 'Caudal vena cava', '與主動脈並行，睪丸內側緊鄰。', tube([[1.6, 0.04, 0], [-1.7, 0.04, 0]], 0.055, 0x3b6fe0), { anchor: [-0.7, 0.04, 0] });
    reg('參考構造', '直腸／結腸', 'Rectum / colon', '消化道末端，開口於泄殖腔糞道。', tube([[1.2, -0.3, 0], [0.2, -0.28, 0], [-0.9, -0.25, 0], [-1.5, -0.12, 0]], 0.055, 0x9c7a5b, 0.55), { anchor: [-0.4, -0.27, 0] });

    const TE = [], EP = [], DD = [], UR = [], RC = [], PA = [], PV = [];
    const ddCurves = [];
    S.forEach(s => {
      // 豆狀雕塑禽類睪丸（左大於右）
      const baseSc = s > 0 ? [0.34, 0.17, 0.17] : [0.28, 0.14, 0.14];
      const tm = blob([1.08, -0.15, s * 0.34], baseSc, 0xd2a86a, 1, { amp: 0.04, tex: 'vnet', seed: 41 + s });
      tm.userData._baseSc = baseSc;
      TE.push(tm);
      EP.push(blob([0.98, -0.06, s * 0.21], [0.12, 0.055, 0.055], 0xc98d68, 1, { amp: 0.07 }));
      const pts = []; const n = 32;
      for (let i = 0; i <= n; i++) {
        const u = i / n, x = 0.92 - u * 2.62, sg = i % 2 ? 1 : -1;
        pts.push([x, -0.06 + sg * 0.018, s * (0.21 - 0.09 * u + sg * 0.032)]);
      }
      const dm = tube(pts, 0.015, 0xffffff, 1, 6);
      DD.push(dm);
      ddCurves.push(dm.userData.curve);
      UR.push(tube([[0.6, -0.1, s * 0.4], [-0.5, -0.1, s * 0.31], [-1.3, -0.09, s * 0.2], [-1.78, -0.05, s * 0.09]], 0.022, 0xe6d88a, 0.8));
      RC.push(blob([-1.68, -0.03, s * 0.115], [0.105, 0.045, 0.045], 0xb7d9a8, 1, { amp: 0.05 }));
      PA.push(cone([-1.74, -0.02, s * 0.1], [-1.80, 0.0, s * 0.055], 0.026, 0xb7d9a8));
      PV.push(blob([-1.66, -0.1, s * 0.24], [0.105, 0.062, 0.062], 0xe06a8a, 1, { amp: 0.06 }));
    });
    reg('睪丸與管道', '睪丸', 'Testis', '成對豆狀（左略大於右），位於腹腔內，<b>無縱隔與小葉</b>；性活動期大幅膨大並呈乳白色。', TE, { anchor: [1.2, -0.15, 0.4] });
    reg('睪丸與管道', '附睪', 'Epididymis', '鳥類附睪極小，位於睪丸背內側。', EP, { anchor: [0.98, -0.02, 0.25] });
    reg('睪丸與管道', '輸精管', 'Ductus deferens', '極為迂曲呈鋸齒狀，為鳥類<b>精子成熟</b>與貯存的重要管道。', DD, { anchor: [-0.3, -0.02, 0.18] });
    reg('參考構造', '輸尿管', 'Ureter', '與輸精管並行開口於泄殖腔尿殖室。', UR, { anchor: [-0.6, -0.1, 0.33] });
    reg('睪丸與管道', '貯精器', 'Receptaculum ductus deferentis', '輸精管末端變寬變直之貯精構造。', RC, { anchor: [-1.68, 0.02, 0.15] });
    reg('睪丸與管道', '輸精管乳頭', 'Papilla of ductus deferens', '貯精器末端突入尿殖室的乳頭開口。', PA, { anchor: [-1.78, 0.02, 0.07] });

    reg('泄殖腔與輔助生殖器', '糞道', 'Coprodeum', '泄殖腔最前腔室，承接直腸。', blob([-1.55, 0, 0], [0.22, 0.17, 0.17], 0xd9a08a, 0.55, { amp: 0.05 }), { anchor: [-1.5, 0.15, 0.0] });
    reg('泄殖腔與輔助生殖器', '尿殖室', 'Urodeum', '泄殖腔中腔室，輸精管與輸尿管開口於此。', blob([-1.82, 0, 0], [0.20, 0.17, 0.17], 0xe3b09a, 0.55, { amp: 0.05 }), { anchor: [-1.82, 0.16, 0.0] });
    reg('泄殖腔與輔助生殖器', '肛室', 'Proctodeum', '泄殖腔最後腔室，通向泄殖腔口。', [blob([-2.07, 0, 0], [0.18, 0.15, 0.15], 0xeab9a4, 0.55, { amp: 0.05 }), ring(V(-2.26, 0, 0), V(1, 0, 0), 0.12, 0.03, 0xd0707a)], { anchor: [-2.15, 0.15, 0.0] });
    reg('泄殖腔與輔助生殖器', '泄殖腔旁血管體', 'Paracloacal vascular body', '性興奮時超過濾動脈血產生<b>淋巴液</b>，促使淋巴皺褶腫脹與陰莖勃起。', PV, { anchor: [-1.66, -0.12, 0.28] });
    const LF = []; S.forEach(s => LF.push(blob([-2.07, -0.13, s * 0.07], [0.13, 0.042, 0.052], 0xbfd8f0, 0.9, { amp: 0.05 })));
    reg('泄殖腔與輔助生殖器', '淋巴皺褶', 'Lymphatic fold', '充入淋巴液後腫脹推動交接器外翻或勃起。', LF, { anchor: [-2.07, -0.17, 0.12] });
    reg('泄殖腔與輔助生殖器', '背肛室腺', 'Dorsal proctodeal gland', '分泌黏液與泡沫樣精漿成分。', blob([-2.07, 0.16, 0], [0.12, 0.05, 0.1], 0x8fbf6a, 1, { amp: 0.06 }), { anchor: [-2.07, 0.22, 0] });

    // 精子行進動態粒子
    const flowBalls = [];
    const fg = new THREE.SphereGeometry(0.036, 10, 8), fm = new THREE.MeshBasicMaterial({ color: 0x38f8ff });
    for (let k = 0; k < 8; k++) { const b = new THREE.Mesh(fg, fm); b.visible = false; CUR.root.add(b); flowBalls.push(b); }

    const colRest = new THREE.Color(0xd2a86a).convertSRGBToLinear();
    const colAct = new THREE.Color(0xfaf6ea).convertSRGBToLinear();

    CUR.tick = () => {
      const tgt = window._birdActive ? 1 : 0;
      if (Math.abs(actT - tgt) > 0.002) {
        actT += (tgt - actT) * 0.07;
        const grow = 1.0 + 0.55 * actT;
        TE.forEach(m => {
          const [sx, sy, sz] = m.userData._baseSc;
          m.scale.set(sx * grow, sy * grow, sz * grow);
          m.material.color.lerpColors(colRest, colAct, actT);
        });
      }
      if (window._birdFlow) {
        flowPhase = (flowPhase + 0.005) % 1;
        flowBalls.forEach((b, k) => {
          b.visible = true;
          const u = (flowPhase + k / flowBalls.length) % 1;
          b.position.copy(ddCurves[k % 2].getPointAt(u));
        });
      } else {
        flowBalls.forEach(b => { b.visible = false; });
      }
    };
  }
});

/* ---------- ⑦ 雄禽交接器官三型（含淋巴液勃起／外翻動態模擬） ---------- */
SCENES.push({
  name: '⑦ 鳥類交接器官',
  title: '雄禽交接器官的三種類型（泄殖腔後方觀示意）',
  camera: { pos: [0, 2.8, 10.6], target: [0.0, 0.35, 0.45] },
  desc: `<p>97% 鳥類沒有插入型陰莖，僅 3%（鴨、鵝、鴕鳥等）具有；禽類交接器由<b>淋巴液</b>而非血液充脹勃起，且<b>不兼排尿</b>。</p>
  <p>點擊右方按鈕可即時演示三種類型在性興奮時的<b>外翻與螺旋勃起</b>動態差異！</p>`,
  controls: [
    { label: '💧 淋巴勃起／外翻動態', fn() { window._birdErect = !window._birdErect; } }
  ],
  build() {
    const XA = -2.9, XB = 0, XC = 2.9;
    window._birdErect = true;
    let eT = 1.0;

    const vent = x => ring(V(x, 0, 0), V(0, 0, 1), 0.5, 0.09, 0xd4707a);

    // ---- (一) 缺乏陰莖：泄殖腔接吻 ----
    const G1 = '(一) 缺乏陰莖：泄殖腔接吻';
    const evert1 = blob([XA, 0, 0.14], [0.40, 0.40, 0.24], 0xe88a92, 0.85, { amp: 0.05 });
    reg(G1, '外翻泄殖腔（泄殖腔口）', 'Everted cloaca (cloacal kiss)', '交配時雄禽外翻泄殖腔與雌禽緊貼，直接傳遞精液，稱<b>泄殖腔接吻 (Cloacal kiss)</b>。', [vent(XA), evert1], { anchor: [XA + 0.4, 0.35, 0.2] });
    const pap1 = [cone([XA - 0.15, 0.02, 0.2], [XA - 0.15, 0.02, 0.45], 0.06, 0xf2f0d0), cone([XA + 0.15, 0.02, 0.2], [XA + 0.15, 0.02, 0.45], 0.06, 0xf2f0d0)];
    reg(G1, '輸精管乳頭（開口）', 'Papillae of ductus deferens', '外翻時直接露出並排出精液。', pap1, { anchor: [XA, 0.02, 0.45] });

    // ---- (二) 非插入型陰莖：雞／火雞／鵪鶉 ----
    const G2 = '(二) 非插入型陰莖：雞／火雞／鵪鶉';
    reg(G2, '泄殖腔口', 'Vent (cloacal opening)', '泄殖腔腹唇具非插入型陰莖。', [vent(XB), blob([XB, 0.05, 0.1], [0.38, 0.36, 0.2], 0xe88a92, 0.72, { amp: 0.05 })], { anchor: [XB + 0.45, 0.3, 0.1] });
    reg(G2, '輸精管乳頭', 'Papillae of ductus deferens', '精液由此流出，順陰莖正中溝滴入雌禽輸卵管。', [cone([XB - 0.15, 0.1, 0.2], [XB - 0.15, 0.1, 0.4], 0.05, 0xf2f0d0), cone([XB + 0.15, 0.1, 0.2], [XB + 0.15, 0.1, 0.4], 0.05, 0xf2f0d0)], { anchor: [XB + 0.15, 0.2, 0.4] });
    const LP = [blob([XB - 0.14, -0.44, 0.22], [0.11, 0.105, 0.15], 0xf8f0e0, 1, { amp: 0.05 }), blob([XB + 0.14, -0.44, 0.22], [0.11, 0.105, 0.15], 0xf8f0e0, 1, { amp: 0.05 })];
    reg(G2, '側陰莖體', 'Lateral phallic bodies', '兩個短圓隆起，淋巴液充脹時腫大靠攏形成正中溝。', LP, { anchor: [XB + 0.3, -0.5, 0.25] });
    reg(G2, '陰莖正中溝', 'Median groove', '勃起時導引精液流向雌性泄殖腔。', cyl([XB, -0.4, 0.14], [XB, -0.45, 0.32], 0.022, 0x4a2a2a), { anchor: [XB, -0.62, 0.3] });
    const lf2 = blob([XB, -0.3, 0.05], [0.28, 0.13, 0.12], 0xbfd8f0, 0.50, { amp: 0.05 });
    reg(G2, '腫脹的淋巴皺褶', 'Lymphatic fold (engorged)', '充入淋巴液後膨脹，推動側陰莖體勃起。', lf2, { anchor: [XB - 0.45, -0.3, 0.05] });

    // ---- (三) 插入型陰莖：鵝／鴨／平胸鳥類 ----
    const G3 = '(三) 插入型陰莖：鵝／鴨／平胸鳥類';
    const phallusGrp = new THREE.Group();
    phallusGrp.position.set(XC, -0.2, 0.15);
    CUR.root.add(phallusGrp);

    const relAxis = lineCurve([0, 0, 0], [0, 1.7, 1.35]), turns = 2.5, R = 0.28;
    reg(G3, '泄殖腔口', 'Vent', '陰莖由腹側陰莖袋經淋巴液加壓翻出伸長。', vent(XC), { anchor: [XC + 0.55, -0.1, 0.0] });

    const cutSac = tube(helixAlong(relAxis, R, turns, 0, 220), 0.105, 0xe8b88a, 1, 2);
    const glSac = tube(helixAlong(relAxis, R, turns, Math.PI, 220), 0.06, 0x6fa0d8, 1, 2);
    const groove = tube(helixAlong(relAxis, R, turns, Math.PI / 2, 220), 0.03, 0x3a2418, 1, 2);
    const apexBall = blob([0, 1.7, 1.35], [0.105, 0.105, 0.105], 0xe0a0a0, 1, { amp: 0.04 });
    const apexRing = ring(V(0, 1.7, 1.35), V(0, 0.6, 0.8), 0.06, 0.02, 0x4a2a2a);
    const RD = [];
    for (let i = 1; i < 14; i++) {
      const t = i / 14, p = relAxis.getPointAt(t), a = Math.PI * 2 * t * turns;
      const fr = relAxis.computeFrenetFrames(2, false), N = fr.normals[0], B = fr.binormals[0];
      const rad = V(0, 0, 0).addScaledVector(N, Math.cos(a)).addScaledVector(B, Math.sin(a));
      const pt = p.clone().addScaledVector(rad, R + 0.10), Tt = relAxis.getTangentAt(t);
      RD.push(cone(pt.clone().toArray(), pt.clone().addScaledVector(Tt, -0.14).addScaledVector(rad, 0.03).toArray(), 0.032, 0xf2ead8));
    }

    // 註冊至 CUR.parts 後再掛到 phallusGrp 以便統一縮放／旋出動畫
    const attachPhallus = (zh, en, info, meshes, anchor) => {
      reg(G3, zh, en, info, meshes, { anchor });
      [].concat(meshes).forEach(m => phallusGrp.add(m));
    };
    attachPhallus('皮下囊（粗囊）', 'Cutaneous sac', '構成螺旋陰莖之粗囊，呈逆時針約 2.5 圈螺旋。', cutSac, [XC + 0.45, 0.7, 0.9]);
    attachPhallus('腺體囊（細囊）', 'Glandular sac', '與皮下囊紐絞之細囊，尖端開口排精漿。', glSac, [XC - 0.4, 0.9, 1.1]);
    attachPhallus('螺旋溝／陰莖摺縫', 'Phallic flexure (spiral groove)', '兩囊間之螺旋縱溝，導引精液射入。', groove, [XC, 0.5, 0.75]);
    attachPhallus('陰莖脊', 'Phallic ridges', '朝向基部之小脊，插入交配時具倒鉤固定作用。', RD, [XC + 0.45, 0.2, 0.55]);
    attachPhallus('尖端（腺囊開口）', 'Apex (opening of glandular sac)', '螺旋陰莖尖端之精漿排出口。', [apexBall, apexRing], [XC + 0.15, 1.6, 1.55]);

    reg(G3, '軟骨體', 'Cartilaginous body', '陰莖基部的軟骨支撐結構。', blob([XC, -0.22, 0.12], [0.28, 0.18, 0.20], 0xf5f5f0, 1, { amp: 0.04 }), { anchor: [XC - 0.3, -0.3, 0.1] });
    reg(G3, '陰莖懸韌帶', 'Suspensorium phalli', '固定陰莖基部於泄殖腔壁的韌帶。', [cyl([XC - 0.2, -0.3, 0.05], [XC - 0.65, -0.1, -0.1], 0.03, 0xe0d3b0), cyl([XC + 0.2, -0.3, 0.05], [XC + 0.65, -0.1, -0.1], 0.03, 0xe0d3b0)], { anchor: [XC - 0.65, -0.15, -0.1] });
    reg(G3, '陰莖袋', 'Phallic pouch', '未勃起時收藏螺旋陰莖之腹膜囊袋。', (() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.0, 28, 1, true), mat(0x9fc5e8, 0.16)); m.position.set(XC, 0.15, 0.4); m.quaternion.setFromUnitVectors(V(0, 1, 0), V(0, 0.6, 0.8)); return m; })(), { anchor: [XC + 0.55, 0.0, 0.5] });

    CUR.tick = () => {
      const tgt = window._birdErect ? 1.0 : 0.22;
      if (Math.abs(eT - tgt) > 0.002) {
        eT += (tgt - eT) * 0.07;
        // Type I: 泄殖腔外翻突出
        evert1.position.z = 0.04 + 0.14 * eT;
        evert1.scale.set(0.32 + 0.10 * eT, 0.32 + 0.10 * eT, 0.12 + 0.14 * eT);
        pap1.forEach(p => { p.position.z = 0.15 + 0.18 * eT; });
        // Type II: 側陰莖體與淋巴皺褶充脹腫大
        LP.forEach(m => m.scale.set(0.08 + 0.04 * eT, 0.075 + 0.04 * eT, 0.09 + 0.07 * eT));
        lf2.scale.set(0.22 + 0.08 * eT, 0.09 + 0.05 * eT, 0.08 + 0.05 * eT);
        // Type III: 螺旋陰莖自陰莖袋旋出伸長
        phallusGrp.scale.set(0.65 + 0.35 * eT, eT, eT);
        phallusGrp.rotation.y = (1 - eT) * 1.4;
      }
    };
  }
});
