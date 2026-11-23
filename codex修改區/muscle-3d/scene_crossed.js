/* 場景⑩：交叉伸肌反射與互惠抑制（Ch12 §12.5、Fig. 12.30–12.31） */
(function () {
  let S = null;

  function cordShape() {
    const sh = new THREE.Shape();
    for (let i = 0; i <= 120; i++) {
      const a = i / 120 * Math.PI * 2, s = Math.abs(Math.sin(2 * a));
      const r = 0.72 + 1.2 * Math.pow(s, 1.6);
      const p = [r * Math.cos(a) * 1.08, r * Math.sin(a) * 0.9];
      i ? sh.lineTo(...p) : sh.moveTo(...p);
    }
    sh.closePath(); return sh;
  }

  function light(part, color, strength) {
    part.meshes.forEach(m => m.material.emissive.setHex(strength ? color : 0));
  }

  function spindle(center, length, radius, color, opacity = 0.9) {
    const path = [V(0, length / 2, 0), V(0, length * 0.32, 0), V(0, 0, 0), V(0, -length * 0.32, 0), V(0, -length / 2, 0)];
    const m = ttube(path, t => 0.035 + radius * Math.pow(Math.sin(Math.PI * t), 0.82), color, opacity, { seg: 44, radial: 12 });
    m.position.set(...center); return m;
  }

  SCENES.push({
    name: '⑩ 交叉伸肌反射',
    title: '交叉伸肌反射：撤離受傷側、支撐對側',
    camera: { pos: [0, 4, 40], target: [0, 3, 0] },
    controls: [{ label: '🔍 脊髓與雙腿', fn() { flyTo([0, 4, 34], [0, 3, 0]); } }],
    desc: `
  <p>踩到尖物時，受刺激側的足部縮回：屈肌受到興奮、伸肌受到抑制。為維持站立，另一側肢體同時以伸肌收縮支撐身體，屈肌受到抑制。感覺輸入在脊髓內分支，透過多個中間神經元同時形成同側與對側反應，稱為<b>交叉伸肌反射</b>；教材將這種雙側、成對的興奮與抑制稱為<b>雙重互惠神經支配</b>。</p>
  <p>本動畫以左側為受刺激側。橘黃路徑表示興奮性輸出，紅色路徑表示抑制性路徑；四組肌肉分別標出同側／對側屈肌與伸肌。這是多突觸、跨脊髓中線的反射，不是膝跳反射的單突觸弧。</p>
  <p class="hint">路徑為教學示意，省略實際涉及的多個脊髓節段與全部中間神經元。</p>`,
    build() {
      S = { t: -1, setStep: null };
      // 脊髓橫切面與骨盆作為雙側反射的解剖定位。
      const cord = ell([0, 9.2, -0.2], [2.3, 1.75, 0.75], 0xf1eee5, 0.34);
      const gray = new THREE.Mesh(new THREE.ExtrudeGeometry(cordShape(), { depth: 1.1, bevelEnabled: false }), mat(0xa79aaa, 0.9));
      gray.position.set(0, 9.2, 0.35);
      const spinalShaft = ttube([V(0, 4.8, -0.15), V(-0.04, 6.2, -0.15), V(0.03, 7.7, -0.15), V(0, 9.1, -0.15)], [0.3, 0.38], 0xd9e2e7, 0.65);
      reg('脊髓解剖', '脊髓與灰質橫切面', 'Spinal cord and gray matter cross-section', '脊髓中的多個中間神經元整合傷害性感覺輸入，並分別調整兩側屈肌與伸肌的運動輸出。', [spinalShaft, cord, gray], { anchor: [0, 9.3, 1.0] });
      const midline = cylM([0, 7.2, 1.8], [0, 11.2, 1.8], 0.035, mat(0xc9d4df, 0.8), 8);
      reg('脊髓路徑', '脊髓中線', 'Spinal midline', '跨側中間神經元越過脊髓中線，將受刺激側的感覺輸入傳至對側運動迴路。', midline, { anchor: [0, 9.2, 2.0] });

      S.lowerBody = new THREE.Group(); CUR.root.add(S.lowerBody);
      const torso = ell([0, 6.45, -0.55], [2.5, 2.35, 1.15], 0x9cb2c1, 0.13);
      const abdomen = ell([0, 5.25, -0.5], [2.0, 1.45, 1.0], 0xb8a3a1, 0.11);
      const pTorso = reg('雙側反射解剖', '軀幹切面與腰薦部', 'Trunk and lumbosacral region', '半透明軀幹提供雙腿與脊髓反射迴路的身體定位；受刺激側撤離時，另一側維持支撐。', [torso, abdomen], { anchor: [0, 6.6, 0.65] });
      attachPart(pTorso, S.lowerBody);

      const iliumL = ell([-1.22, 4.25, 0], [1.0, 0.72, 0.42], 0xdac9aa);
      const iliumR = ell([1.22, 4.25, 0], [1.0, 0.72, 0.42], 0xdac9aa);
      const sacrum = ell([0, 4.0, -0.02], [0.52, 0.72, 0.43], 0xcbb99f);
      const pubis = ttube([V(-0.95, 3.95, 0.25), V(-0.62, 3.65, 0.3), V(0, 3.55, 0.3), V(0.62, 3.65, 0.3), V(0.95, 3.95, 0.25)], t => 0.14 + 0.03 * Math.sin(Math.PI * t), 0xdac9aa);
      const pPelvis = reg('雙側反射解剖', '骨盆帶與薦骨', 'Pelvic girdle and sacrum', '骨盆把軀幹重量傳到兩側髖關節；支撐側伸肌活化時，骨盆與軀幹重量移向該側。', [iliumL, iliumR, sacrum, pubis], { anchor: [0, 4.65, 0.45] });
      attachPart(pPelvis, S.lowerBody);

      const boneRadius = t => 0.19 + 0.11 * ease((0.18 - t) / 0.18) + 0.13 * ease((t - 0.82) / 0.18);
      const leg = (x, sideZh, sideEn, color, side) => {
        const hip = new THREE.Group(); hip.position.set(x, 4.0, 0); S.lowerBody.add(hip);
        const femurShaft = ttube([V(0, 0, 0), V(0, -0.4, 0), V(0.03, -1.7, 0), V(-0.02, -3.25, 0), V(0, -3.9, 0)], boneRadius, 0xe6d8b8);
        const femoralHead = ell([0, 0.03, 0], [0.43, 0.43, 0.4], 0xe6d8b8);
        const condyles = ell([0, -3.77, 0.03], [0.44, 0.34, 0.39], 0xe6d8b8);
        const pFemur = reg('雙側反射解剖', `${sideZh}側股骨`, `${sideEn} femur`, '股骨連接骨盆與膝關節；股四頭肌的肌腱跨過膝前方，經髕骨傳力。', [femurShaft, femoralHead, condyles], { anchor: [0, -1.8, 0.45] });
        attachPart(pFemur, hip);

        const quadMuscles = [
          spindle([-0.43, -1.72, 0.68], 3.2, 0.34, color, 0.9),
          spindle([0.0, -1.62, 0.91], 3.45, 0.37, color, 0.94),
          spindle([0.43, -1.72, 0.68], 3.2, 0.34, color, 0.9)
        ];
        const quadTendon = ttube([V(0, -2.92, 0.85), V(0, -3.28, 0.82), V(0, -3.62, 0.72)], [0.18, 0.11], 0xf4f1ea);
        const pExt = reg('雙側反射解剖', `${sideZh}側股四頭肌與伸膝肌腱`, `${sideEn} quadriceps and knee extensor tendon`, '股四頭肌是主要伸膝肌。交叉伸肌反射中，支撐側股四頭肌收縮；受刺激側伸肌運動輸出受到抑制。', [...quadMuscles, quadTendon], { anchor: [0.0, -1.25, 1.35] });
        attachPart(pExt, hip);
        const patella = ell([0, -3.77, 0.47], [0.33, 0.42, 0.24], 0xe6d8b8);
        const pPatella = reg('雙側反射解剖', `${sideZh}側髕骨`, `${sideEn} patella`, '髕骨位於膝前方，包在股四頭肌腱內，改變伸膝肌腱的力臂。', patella, { anchor: [0, -3.65, 0.82] });
        attachPart(pPatella, hip);

        const hamstrings = [
          spindle([-0.48, -1.9, 0.94], 2.85, 0.28, 0x4fa8d8, 0.76),
          spindle([0.48, -1.9, 0.94], 2.85, 0.28, 0x4fa8d8, 0.76)
        ];
        const pFlex = reg('雙側反射解剖', `${sideZh}側膕繩肌群（屈膝肌）`, `${sideEn} hamstrings (knee flexors)`, '膕繩肌群屈曲膝關節。受刺激側屈肌獲得興奮性輸出；支撐側屈肌受到互惠抑制。', hamstrings, { anchor: [0.55, -1.75, 1.36] });
        attachPart(pFlex, hip);

        const knee = new THREE.Group(); knee.position.set(0, -3.9, 0); hip.add(knee);
        const tibia = ttube([V(0, 0, 0), V(0, -0.35, 0), V(-0.02, -1.6, 0), V(0.03, -3.0, 0), V(0, -3.8, 0)], t => 0.17 + 0.1 * ease((0.18 - t) / 0.18) + 0.08 * ease((t - 0.85) / 0.15), 0xe6d8b8);
        const fibula = ttube([V(side * 0.39, -0.12, -0.03), V(side * 0.4, -0.45, 0), V(side * 0.42, -1.9, 0), V(side * 0.38, -3.45, 0)], t => 0.075 + 0.035 * ease((0.18 - t) / 0.18), 0xd5c3a5);
        const tibialPlateau = ell([0, -0.08, 0], [0.35, 0.2, 0.34], 0xe6d8b8);
        const ankle = ell([side * 0.18, -3.63, 0], [0.26, 0.3, 0.28], 0xe6d8b8);
        const pLowerBones = reg('雙側反射解剖', `${sideZh}側脛骨、腓骨與踝部`, `${sideEn} tibia, fibula and ankle`, '脛骨承受主要體重；較細的腓骨位於小腿外側，兩骨共同連到踝部。', [tibia, fibula, tibialPlateau, ankle], { anchor: [side * 0.28, -1.7, 0.45] });
        attachPart(pLowerBones, knee);
        const patellarLigament = ttube([V(0, 0.06, 0.52), V(0, -0.18, 0.49), V(0, -0.42, 0.34)], [0.1, 0.075], 0xf4f1ea);
        const pPatellarLigament = reg('雙側反射解剖', `${sideZh}側髕韌帶`, `${sideEn} patellar ligament`, '髕韌帶把髕骨下端連到脛骨粗隆，將股四頭肌的拉力傳到小腿。', patellarLigament, { anchor: [0, -0.22, 0.72], nolabel: true });
        attachPart(pPatellarLigament, knee);

        const footSole = ell([0, -3.77, 0.52], [0.78, 0.28, 0.82], 0xe6d8b8);
        const heel = ell([0, -3.67, -0.08], [0.38, 0.3, 0.36], 0xe6d8b8);
        const metatarsals = [], toes = [];
        for (let i = 0; i < 5; i++) {
          const offset = (i - 2) * 0.24, length = 0.78 - Math.abs(i - 2) * 0.08;
          metatarsals.push(cylM([offset * 0.25, -3.72, 0.22], [offset, -3.8, 0.22 + length], 0.07, mat(0xe6d8b8), 10));
          toes.push(ell([offset, -3.8, 0.23 + length], [0.105, 0.12, 0.18], 0xe6d8b8));
        }
        const pFoot = reg('雙側反射解剖', `${sideZh}側足骨`, `${sideEn} foot bones`, '跟骨、跗骨與五列蹠骨構成足部支架；縮足反射時足部隨小腿抬離刺激物。', [footSole, heel, ...metatarsals, ...toes], { anchor: [0, -3.5, 1.2] });
        attachPart(pFoot, knee);
        return { hip, knee, pExt, pFlex, x, patella: pPatella };
      };
      S.left = leg(-1.65, '受刺激', 'Stimulated', 0xe77b68, -1);
      S.right = leg(1.65, '支撐', 'Supporting', 0x6eab83, 1);
      S.right.knee.rotation.x = -0.10;
      S.lowerBody.position.x = 0;
      const ground = cylM([-5.5, -4.0, 0], [5.5, -4.0, 0], 0.07, mat(0x8296a6), 8);
      reg('雙側反射解剖', '地面與承重面', 'Ground and weight-bearing surface', '對側伸肌活化使支撐側足部留在地面，承接軀幹重量。', ground, { anchor: [3.5, -3.95, 0.2] });

      const pain = ell([0, -3.78, 1.28], [0.22, 0.22, 0.22], 0xff5555);
      const pin = cone([0, -3.97, 1.28], [0, -4.17, 1.28], 0.17, 0xd9dce0);
      const pPain = reg('反射路徑', '足底傷害受器與尖物刺激', 'Plantar nociceptor and sharp stimulus', '尖物刺激足底傷害受器，啟動傳入感覺訊號。受刺激側屈膝後，足部抬離尖物。', [pain, pin], { anchor: [0, -3.55, 1.65] });
      attachPart(pPain, S.left.knee);

      const sensPts = [V(-1.65, -3.7, 1.48), V(-2.0, -2.7, 1.48), V(-2.15, -0.8, 1.48), V(-2.05, 1.6, 1.48), V(-1.9, 4.2, 1.48), V(-1.85, 6.6, 1.48), V(-1.45, 8.75, 1.48)];
      const ipsiExcPts = [V(-1.45, 8.75, 1.58), V(-1.05, 8.35, 1.58), V(-0.72, 7.65, 1.58), V(-0.95, 6.9, 1.58), V(-1.05, 6.2, 1.58)];
      const ipsiInhPts = [V(-1.45, 8.75, 1.5), V(-0.72, 8.35, 1.5), V(-0.28, 7.65, 1.5), V(-0.9, 6.65, 1.5), V(-1.75, 5.75, 1.5)];
      const crossExcPts = [V(-1.45, 8.72, 1.7), V(-0.9, 8.45, 1.7), V(-0.25, 8.0, 1.7), V(0.35, 7.55, 1.7), V(0.85, 6.85, 1.7), V(1.05, 6.2, 1.7)];
      const crossInhPts = [V(-1.45, 8.72, 1.78), V(-0.85, 8.4, 1.78), V(-0.2, 7.95, 1.78), V(0.55, 7.5, 1.78), V(1.25, 6.65, 1.78), V(1.85, 5.75, 1.78)];
      const sensoryLine = ttube(sensPts, 0.13, 0x48b8f4);
      const ipsiExc = ttube(ipsiExcPts, 0.105, 0xffbb50);
      const ipsiInh = ttube(ipsiInhPts, 0.085, 0xff5b65);
      const crossExc = ttube(crossExcPts, 0.105, 0xffbb50);
      const crossInh = ttube(crossInhPts, 0.085, 0xff5b65);
      const drg = ell([-1.9, 8.4, 1.48], [0.38, 0.4, 0.34], 0xe4a646);
      const nodes = [
        ell([-0.72, 7.65, 1.58], [0.3, 0.3, 0.24], 0xffbb50),
        ell([-0.28, 7.65, 1.5], [0.3, 0.28, 0.22], 0xff5b65),
        ell([0.85, 6.85, 1.7], [0.3, 0.3, 0.24], 0xffbb50),
        ell([1.25, 6.65, 1.78], [0.3, 0.28, 0.22], 0xff5b65)
      ];
      S.pSens = reg('反射路徑', '足底傷害性感覺傳入與背根神經節', 'Plantar nociceptive afferent and dorsal root ganglion', '足底傷害性感覺訊號沿周邊神經上行，經背根神經節進入脊髓背側，再分支聯絡多個中間神經元。', [sensoryLine, drg], { anchor: [-2.1, 6.3, 1.8] });
      S.pIpsi = reg('反射路徑', '同側屈肌興奮與伸肌抑制', 'Ipsilateral flexor excitation and extensor inhibition', '同側興奮路徑促進屈肌運動輸出；另一支抑制路徑降低同側伸肌運動神經元活動。', [ipsiExc, ipsiInh, nodes[0], nodes[1]], { anchor: [-0.9, 7.2, 2.0] });
      S.pCross = reg('反射路徑', '跨中線中間神經元路徑', 'Commissural interneuron pathways', '跨側路徑越過脊髓中線：興奮對側伸肌、抑制對側屈肌，形成支撐側反應。', [crossExc, crossInh, nodes[2], nodes[3]], { anchor: [0.95, 7.3, 2.0] });
      const motoneurons = [
        ell([-1.05, 6.2, 1.8], [0.32, 0.32, 0.25], 0xff5b65), ell([-1.8, 5.75, 1.8], [0.32, 0.32, 0.25], 0xffa040),
        ell([1.05, 6.2, 1.8], [0.32, 0.32, 0.25], 0xffa040), ell([1.8, 5.75, 1.8], [0.32, 0.32, 0.25], 0xff5b65)
      ];
      const motorOut = [
        ttube([V(-1.05, 6.2, 1.8), V(-1.4, 4.9, 1.8), V(-1.55, 3.4, 1.8), V(-1.65, 2.05, 1.55)], 0.075, 0xff5b65),
        ttube([V(-1.8, 5.75, 1.8), V(-1.35, 4.5, 1.8), V(-0.9, 3.2, 1.8), V(-1.05, 2.05, 1.55)], 0.07, 0xffa040),
        ttube([V(1.05, 6.2, 1.8), V(1.4, 4.9, 1.8), V(1.55, 3.4, 1.8), V(1.65, 2.05, 1.55)], 0.075, 0xffa040),
        ttube([V(1.8, 5.75, 1.8), V(1.35, 4.5, 1.8), V(0.9, 3.2, 1.8), V(1.05, 2.05, 1.55)], 0.07, 0xff5b65)
      ];
      S.pMotor = reg('反射路徑', '四組 α 運動神經元輸出', 'Four alpha motor outputs', '同側屈肌與對側伸肌得到興奮性輸出；同側伸肌與對側屈肌受到抑制性輸入。', [...motoneurons, ...motorOut], { anchor: [1.8, 5.3, 2.1] });
      S.pathMeshes = { sensoryLine, ipsiExc, ipsiInh, crossExc, crossInh, motorOut };
      S.routes = { sensPts, ipsiExcPts, crossExcPts };
      S.pulseSens = dots([V(0, -99, 0)], 0.25, 0xffffff); S.pulseSens.material.emissive.setHex(0x48b8f4); CUR.root.add(S.pulseSens);
      S.pulseIpsi = dots([V(0, -99, 0)], 0.23, 0xffffff); S.pulseIpsi.material.emissive.setHex(0xffc45e); CUR.root.add(S.pulseIpsi);
      S.pulseCross = dots([V(0, -99, 0)], 0.23, 0xffffff); S.pulseCross.material.emissive.setHex(0xffc45e); CUR.root.add(S.pulseCross);

      const dt = dtClock();
      const pulse = (m, pts, k) => { m.setP(0, k < 0 || k > 1 ? V(0, -99, 0) : alongPath(pts, k)); m.instanceMatrix.needsUpdate = true; };
      const resetMuscles = () => {
        S.lowerBody.position.x = 0;
        S.left.hip.rotation.x = 0; S.left.knee.rotation.x = 0;
        S.right.hip.rotation.x = 0; S.right.knee.rotation.x = -0.10;
        light(S.left.pFlex, 0xffa040, false); light(S.left.pExt, 0x4d6070, false);
        light(S.right.pExt, 0xffa040, false); light(S.right.pFlex, 0x4d6070, false);
      };
      resetMuscles();
      CUR.tick = () => {
        const d = dt(); if (S.t < 0) return;
        S.t += d; const t = S.t;
        const at = (a, b) => clamp01((t - a) / (b - a));
        if (t < 0.75) S.setStep(0); else if (t < 1.55) S.setStep(1); else if (t < 2.45) S.setStep(2); else if (t < 3.35) S.setStep(3); else S.setStep(4);
        pulse(S.pulseSens, S.routes.sensPts, t >= 0.12 && t < 0.92 ? (t - 0.12) / 0.8 : -1);
        pulse(S.pulseIpsi, S.routes.ipsiExcPts, t >= 1.55 && t < 2.35 ? (t - 1.55) / 0.8 : -1);
        pulse(S.pulseCross, S.routes.crossExcPts, t >= 2.45 && t < 3.25 ? (t - 2.45) / 0.8 : -1);
        const withdraw = ease(at(3.1, 3.9)) * (1 - ease(at(4.45, 5.15)));
        const support = ease(at(3.0, 3.8)) * (1 - ease(at(4.45, 5.15)));
        S.left.hip.rotation.x = 0.16 * withdraw;
        S.left.knee.rotation.x = 1.12 * withdraw;
        S.right.knee.rotation.x = -0.10 * (1 - support);
        S.lowerBody.position.x = 0.18 * support;
        light(S.left.pFlex, 0xffa040, t > 1.55 && t < 4.6);
        light(S.left.pExt, 0xff5b65, t > 1.55 && t < 4.6);
        light(S.right.pExt, 0xffa040, t > 2.45 && t < 4.6);
        light(S.right.pFlex, 0xff5b65, t > 2.45 && t < 4.6);
        S.pathMeshes.sensoryLine.material.emissive.setHex(t > 0.12 && t < 1.55 ? 0x103f60 : 0);
        S.pathMeshes.ipsiExc.material.emissive.setHex(t > 1.55 && t < 2.45 ? 0x725016 : 0);
        S.pathMeshes.ipsiInh.material.emissive.setHex(t > 1.55 && t < 2.45 ? 0x701820 : 0);
        S.pathMeshes.crossExc.material.emissive.setHex(t > 2.45 && t < 3.35 ? 0x725016 : 0);
        S.pathMeshes.crossInh.material.emissive.setHex(t > 2.45 && t < 3.35 ? 0x701820 : 0);
        S.pathMeshes.motorOut.forEach((m, i) => m.material.emissive.setHex(t > (i < 2 ? 1.55 : 2.45) && t < 4.6 ? (i === 0 || i === 3 ? 0x701820 : 0x725016) : 0));
        updateAnchors();
        if (t > 5.4) {
          S.t = -1; resetMuscles();
          updateAnchors();
          pulse(S.pulseSens, S.routes.sensPts, -1); pulse(S.pulseIpsi, S.routes.ipsiExcPts, -1); pulse(S.pulseCross, S.routes.crossExcPts, -1);
          S.setStep(-1);
        }
      };
    },
    panel(box) {
      note(box, '<b>反射流程</b>');
      btn(box, '▶ 足底踩到尖物', () => { S.t = 0; });
      const holder = document.createElement('div'); box.appendChild(holder);
      S.setStep = stepList(holder, [
        '① 足底傷害受器活化，感覺訊號進入脊髓',
        '② 傳入訊號到達脊髓並分支至多個中間神經元',
        '③ 興奮同側屈肌、抑制同側伸肌',
        '④ 跨中線路徑興奮對側伸肌、抑制對側屈肌',
        '⑤ 同側屈膝撤離；對側伸展承重'
      ]);
      note(box, '黃橘＝興奮輸出；紅＝抑制輸入。刺激結束後，雙腿回到起始姿勢。');
    }
  });
})();
