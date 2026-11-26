/* 場景⑫：平滑肌組織尺度：單一單位型與多單位型 */
(function () {
  let S = null;

  function makeCell(center, groupName, kind, index, opt = {}) {
    const [x, y, z] = center, orientation = opt.orientation || 'long', length = opt.length || 2.1;
    let path, tangent = null;
    if (orientation === 'ring') {
      const radius = opt.radius, theta = opt.theta, span = opt.span || 0.58;
      path = [];
      for (let i = 0; i <= 6; i++) {
        const a = theta + (i / 6 - 0.5) * span;
        path.push(V(0, radius * Math.cos(a) - y, radius * Math.sin(a) - z));
      }
      tangent = V(0, -Math.sin(theta), Math.cos(theta)).normalize();
    } else {
      path = [V(-length / 2, 0, 0), V(-length * 0.3, 0, 0), V(0, 0, 0), V(length * 0.3, 0, 0), V(length / 2, 0, 0)];
    }
    const color = opt.color || (kind === 'single' ? 0xc587c4 : 0xb879b4);
    const body = ttube(path, t => 0.025 + 0.27 * Math.pow(Math.sin(Math.PI * t), 0.82), color, 0.84, { seg: 48, radial: 10 });
    body.position.set(x, y, z);
    const nucleus = ell([x, y, z + 0.16], [length * 0.18, 0.105, 0.12], 0x573b69, 0.86);
    if (tangent) nucleus.quaternion.setFromUnitVectors(V(1, 0, 0), tangent);
    let part = null;
    if (opt.noRegister) CUR.root.add(body, nucleus);
    else part = reg(groupName, kind === 'single' ? '單一單位型平滑肌細胞' : '多單位型平滑肌細胞', kind === 'single' ? 'Single-unit smooth muscle cell' : 'Multi-unit smooth muscle cell', kind === 'single'
      ? '腸壁平滑肌細胞呈長梭形，彼此錯列重疊；細胞間隙型連結讓局部電活動可傳播。'
      : '多單位型平滑肌細胞聚成小束，接受局部自主神經末梢調控，彼此沒有廣泛的電性耦合。', [body, nucleus], { anchor: [x, y + 0.38, z + 0.38] });
    return { body, nucleus, part, x, y, z, orientation, center: V(x, y, z), waveStart: opt.waveStart || 0, rest: body.scale.clone(), nucleusRest: nucleus.scale.clone(), index };
  }

  function activate(cell, amount) {
    if (cell.orientation === 'ring') {
      const radial = 1 - 0.035 * amount;
      cell.body.position.set(cell.center.x, cell.center.y * radial, cell.center.z * radial);
      cell.nucleus.position.set(cell.center.x, cell.center.y * radial, cell.center.z * radial + 0.16);
      cell.body.scale.set(1 + 0.08 * amount, 1 - 0.035 * amount, 1 - 0.035 * amount);
    } else {
      cell.body.position.set(cell.x, cell.y, cell.z);
      cell.body.scale.set(1 - 0.18 * amount, 1 + 0.12 * amount, 1 + 0.12 * amount);
      cell.nucleus.position.set(cell.x, cell.y, cell.z + 0.16);
    }
    cell.nucleus.scale.x = cell.nucleusRest.x * (1 - 0.08 * amount);
    cell.body.material.emissive.setHex(amount > 0.08 ? 0x49204d : 0);
  }

  SCENES.push({
    name: '⑫ 平滑肌組織尺度',
    title: '平滑肌：單一單位型協調波與多單位型局部控制',
    camera: { pos: [0, 2.2, 49], target: [0, 0, 0] },
    controls: [{ label: '🔍 兩種組織排列', fn() { flyTo([0, 2.2, 44], [0, 0, 0]); } }],
    desc: `
  <p>平滑肌細胞本身沒有肌節與橫紋，但在器官壁中會排列成層。<b>單一單位型（內臟型）</b>平滑肌細胞間有較多隙型連結，局部電活動可向鄰近細胞傳播，讓一大片組織形成協調收縮；腸道蠕動是典型例子。</p>
  <p><b>多單位型</b>平滑肌的細胞或小群體受到較獨立的自主神經調節，神經末梢沿軸突的<b>曲張體</b>釋放傳遞物質。細胞間沒有廣泛的電性耦合，因此可局部、精細地改變張力；虹膜與睫狀肌常作為例子。</p>
  <p class="hint">左側是縱切的腸壁肌層：外縱肌與內環肌交錯包圍腸腔，沿腸段傳播收縮波；右側是成束、由不同曲張體分區調控的多單位型肌細胞。結構與細胞數量為示意。</p>`,
    build() {
      S = { t: -1, mode: 'idle', cluster: -1, setStep: null, singleCells: [], longitudinalCells: [], circularCells: [], gapLinks: [], constrictions: [], multiCells: [[], [], []], nerveParts: [], varicosities: [[], [], []] };

      const gutX = -8.5, gutLength = 8, gutStart = gutX - gutLength / 2, gutEnd = gutX + gutLength / 2;
      textSprite('單一單位型｜腸壁平滑肌', [gutX, 5.0, 0], 0.9, '#ffd479', 'longitudinal + circular layers');
      textSprite('多單位型｜分區神經支配肌束', [8.5, 5.0, 0], 0.9, '#ffd479', 'separate autonomic inputs');

      const axialShell = (radius, color, opacity) => {
        const g = new THREE.CylinderGeometry(radius, radius, gutLength, 72, 1, true);
        g.rotateZ(Math.PI / 2);
        const m = new THREE.Mesh(g, mat(color, opacity)); m.position.x = gutX; return m;
      };
      const outerWall = axialShell(3.55, 0xc78fb9, 0.09), lumenWall = axialShell(2.34, 0xe5c4db, 0.07);
      const cutRims = [gutStart, gutEnd].map(x => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(3.55, 0.08, 10, 64), mat(0xe8c9df, 0.72));
        m.rotation.y = Math.PI / 2; m.position.set(x, 0, 0); return m;
      });
      reg('單一單位型組織', '腸壁肌層與腸腔剖面', 'Intestinal muscle layers and lumen', '腸壁平滑肌分成外縱肌與內環肌兩層；半透明腸段讓兩種纖維方向與中央腸腔同時可見。', [outerWall, lumenWall, ...cutRims], { anchor: [gutX, 3.9, 0.8] });
      const constrictions = [-11.5, -9.5, -7.5, -5.5].map(x => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(2.34, 0.055, 8, 56), mat(0xf0b6bd, 0.68));
        m.rotation.y = Math.PI / 2; m.position.set(x, 0, 0); return { mesh: m, x };
      });
      reg('單一單位型組織', '腸腔局部縮窄（蠕動示意）', 'Local lumen constriction (peristalsis)', '環肌收縮使腸腔局部變窄；沿腸段傳播的收縮區是蠕動推進的組織尺度示意。', constrictions.map(item => item.mesh), { anchor: [-8.5, 0.2, 2.7] });
      S.constrictions = constrictions;

      const pacemaker = ell([gutStart - 0.45, 0, 3.1], [0.32, 0.32, 0.26], 0x55d7ef);
      const pPacemaker = reg('單一單位型組織', '起始電活動區', 'Initiating electrical activity', '單一單位型腸道平滑肌可受節律性電活動啟動；訊號沿細胞間隙型連結傳播。', pacemaker, { anchor: [gutStart, 4.2, 3.4] });
      S.wavePulse = ell([gutStart, 0, 3.25], [0.19, 0.19, 0.19], 0x8af4ff);
      S.wavePulse.material.emissive.setHex(0x54bdcc); S.wavePulse.visible = false;
      S.wavePulse.userData.part = pPacemaker; pPacemaker.meshes.push(S.wavePulse);

      const longXs = [-11.15, -9.45, -7.75, -6.05], angles = [0.48, 1.27, 1.87, 2.66];
      longXs.forEach(x => angles.forEach(theta => {
        const radius = 3.18, y = radius * Math.cos(theta), z = radius * Math.sin(theta);
        const cell = makeCell([x, y, z], '單一單位型組織', 'single', S.singleCells.length, { noRegister: true, orientation: 'long', length: 2.25, waveStart: ((x - gutStart) / gutLength) * 1.85, color: 0xc583bd });
        S.longitudinalCells.push(cell); S.singleCells.push(cell);
      }));
      const ringXs = [-10.45, -8.5, -6.55], ringAngles = [0.56, 1.25, 1.89, 2.58];
      ringXs.forEach(x => ringAngles.forEach(theta => {
        const radius = 2.72, y = radius * Math.cos(theta), z = radius * Math.sin(theta);
        const cell = makeCell([x, y, z], '單一單位型組織', 'single', S.singleCells.length, { noRegister: true, orientation: 'ring', radius, theta, span: 0.58, waveStart: ((x - gutStart) / gutLength) * 1.85, color: 0xe29cae });
        S.circularCells.push(cell); S.singleCells.push(cell);
      }));
      const pLongitudinal = reg('單一單位型組織', '外縱肌細胞層', 'Outer longitudinal muscle layer', '縱肌細胞沿腸管長軸排列；收縮使腸段縮短，與環肌共同推進腸內容物。', S.longitudinalCells.flatMap(cell => [cell.body, cell.nucleus]), { anchor: [-8.2, 3.7, 3.1] });
      const pCircular = reg('單一單位型組織', '內環肌細胞層', 'Inner circular muscle layer', '環肌細胞繞腸腔排列；收縮使腸腔變窄。組織波中的相鄰腸段依序改變張力。', S.circularCells.flatMap(cell => [cell.body, cell.nucleus]), { anchor: [-8.5, 2.7, 2.6] });
      S.longitudinalCells.forEach(cell => { cell.part = pLongitudinal; });
      S.circularCells.forEach(cell => { cell.part = pCircular; });

      const gapLinks = [];
      const addGap = (x, y, z, waveX, scale = [0.13, 0.13, 0.12]) => {
        const m = ell([x, y, z], scale, 0x55c9dc);
        m.userData.waveX = waveX; gapLinks.push(m);
      };
      longXs.slice(0, -1).forEach((x, i) => angles.forEach(theta => {
        const r = 3.18, xm = (x + longXs[i + 1]) / 2;
        addGap(xm, r * Math.cos(theta), r * Math.sin(theta) + 0.08, xm, [0.15, 0.12, 0.12]);
      }));
      longXs.forEach(x => angles.slice(0, -1).forEach((theta, i) => {
        const a = (theta + angles[i + 1]) / 2, r = 3.18;
        addGap(x, r * Math.cos(a), r * Math.sin(a) + 0.08, x, [0.12, 0.12, 0.12]);
      }));
      ringXs.forEach(x => ringAngles.slice(0, -1).forEach((theta, i) => {
        const a = (theta + ringAngles[i + 1]) / 2, r = 2.72;
        addGap(x, r * Math.cos(a), r * Math.sin(a) + 0.08, x, [0.11, 0.11, 0.11]);
      }));
      const pGap = reg('單一單位型組織', '肌層內的隙型連結', 'Gap junctions within smooth muscle layers', '隙型連結主要使同一肌層內鄰近平滑肌細胞電性耦合。縱肌與環肌的協同活動也受節律活動與腸神經系統等因素調節。', gapLinks, { anchor: [-8.4, 3.6, 3.0] });
      S.gapLinks = gapLinks;

      const clusterXs = [3.8, 8.4, 13.0];
      const localOffsets = [[-0.82, -0.6, -0.15], [-0.08, -0.18, 0.25], [0.82, 0.28, 0.02], [-0.52, 0.62, 0.28], [0.42, 0.95, -0.18]];
      clusterXs.forEach((cx, cluster) => {
        const cells = [];
        const sheath = ell([cx, 0.1, 0], [1.9, 1.45, 0.62], 0xd4bad4, 0.055);
        reg('多單位型組織', `第 ${cluster + 1} 區小肌束外基質`, `Local fascicle matrix, region ${cluster + 1}`, '半透明外基質標出一束細胞的大致範圍；相鄰肌束由不同自主神經末梢調節。', sheath, { anchor: [cx, -1.25, 0.3], nolabel: true });
        localOffsets.forEach(([ox, oy, oz], k) => {
          const cell = makeCell([cx + ox, oy, oz], '多單位型組織', 'multi', cluster * localOffsets.length + k, { noRegister: true, orientation: 'long', length: k % 2 ? 2.2 : 2.0, color: [0xc987bd, 0xd28ab9, 0xc17db5][cluster] });
          cells.push(cell);
        });
        const pBundle = reg('多單位型組織', `第 ${cluster + 1} 區小肌束細胞`, `Smooth muscle fascicle, region ${cluster + 1}`, '多單位型細胞以小束排列；不同小束可由相鄰但分開的自主神經末梢各自調節。', cells.flatMap(cell => [cell.body, cell.nucleus]), { anchor: [cx, -0.6, 0.95] });
        cells.forEach(cell => { cell.part = pBundle; });
        S.multiCells[cluster] = cells;

        const axon = ttube([V(cx - 0.85, 4.35, 0.45), V(cx - 0.35, 3.7, 0.45), V(cx + 0.38, 3.05, 0.45), V(cx + 0.1, 2.35, 0.45)], 0.07, 0xffad57, 0.92);
        const beads = [ell([cx - 0.18, 2.7, 0.8], [0.16, 0.16, 0.15], 0xffad57), ell([cx + 0.25, 2.95, 0.58], [0.16, 0.16, 0.15], 0xffad57), ell([cx + 0.35, 2.4, 0.82], [0.16, 0.16, 0.15], 0xffad57)];
        const varicosityPart = reg('多單位型組織', `第 ${cluster + 1} 區自主神經軸突與曲張體`, `Autonomic axon and varicosities, region ${cluster + 1}`, '神經軸突沿途的曲張體向附近細胞釋放傳遞物質；此處三個肌束由不同末梢分區控制，不以細胞間電波彼此同步。', [axon, ...beads], { anchor: [cx, 3.65, 0.95] });
        S.nerveParts.push(varicosityPart); S.varicosities[cluster] = beads;
      });

      textSprite('外縱肌', [-8.5, -4.05, 3.0], 0.58, '#e6a2d2', 'cells run along the intestine');
      textSprite('內環肌', [-8.5, 2.95, 2.3], 0.58, '#ffc0bd', 'cells wrap around the lumen');
      textSprite('曲張體將訊號送到局部肌束', [8.5, -2.25, 0], 0.55, '#ffbc6d');
      const dt = dtClock();
      CUR.tick = () => {
        const d = dt();
        if (S.mode === 'idle' || S.t < 0) { S.wavePulse.visible = false; return; }
        S.t += d;
        if (S.mode === 'single') {
          S.singleCells.forEach(cell => {
            const start = cell.waveStart;
            const a = ease((S.t - start) / 0.3) * (1 - ease((S.t - start - 0.72) / 0.44));
            activate(cell, a);
          });
          S.constrictions.forEach(item => {
            const start = ((item.x - gutStart) / gutLength) * 1.85;
            const active = ease((S.t - start) / 0.3) * (1 - ease((S.t - start - 0.72) / 0.44));
            const radius = 1 - 0.18 * active;
            item.mesh.scale.set(radius, radius, 1);
            item.mesh.material.emissive.setHex(active > 0.1 ? 0x531a29 : 0);
          });
          const waveX = gutStart + gutLength * Math.max(0, Math.min(1, (S.t - 0.15) / 2.3));
          S.wavePulse.position.x = waveX; S.wavePulse.visible = S.t < 2.55 && pPacemaker.visible;
          S.gapLinks.forEach(m => {
            m.material.emissive.setHex(Math.abs(m.userData.waveX - waveX) < 0.9 && S.t < 2.7 ? 0x1b8995 : 0);
          });
          if (S.setStep) S.setStep(S.t < 0.55 ? 0 : S.t < 1.2 ? 1 : S.t < 2.8 ? 2 : S.t < 3.5 ? 3 : -1);
          if (S.t > 4.2) {
            S.mode = 'idle'; S.t = -1; S.wavePulse.visible = false;
            S.gapLinks.forEach(m => m.material.emissive.setHex(0));
            S.constrictions.forEach(item => { item.mesh.scale.set(1, 1, 1); item.mesh.material.emissive.setHex(0); });
          }
        } else {
          S.multiCells.forEach((cells, i) => cells.forEach(cell => {
            const active = i === S.cluster ? ease(S.t / 0.3) * (1 - ease((S.t - 0.95) / 0.45)) : 0;
            activate(cell, active);
          }));
          S.varicosities.forEach((beads, i) => beads.forEach(m => m.material.emissive.setHex(i === S.cluster && S.t < 1.5 ? 0x995211 : 0)));
          if (S.setStep) S.setStep(S.t < 0.45 ? 0 : S.t < 1.0 ? 1 : 2);
          if (S.t > 2.8) {
            if (S.setStep) S.setStep(-1);
            S.mode = 'idle'; S.t = -1; S.cluster = -1;
            S.varicosities.forEach(beads => beads.forEach(m => m.material.emissive.setHex(0)));
          }
        }
      };
    },
    panel(box) {
      note(box, '<b>選一種組織尺度反應</b>');
      const singleSteps = document.createElement('div'); box.appendChild(singleSteps);
      const setSingleStep = stepList(singleSteps, [
        '① 起搏區啟動局部電活動',
        '② 隙型連結把訊號傳到鄰近細胞',
        '③ 細胞依序活化，形成協調收縮波',
        '④ 組織層的張力呈現協調變化'
      ]);
      const multiSteps = document.createElement('div'); box.appendChild(multiSteps);
      multiSteps.style.display = 'none';
      const setMultiStep = stepList(multiSteps, [
        '① 自主神經軸突到達局部細胞群',
        '② 曲張體釋放神經傳遞物質',
        '③ 局部受支配細胞群改變張力'
      ]);
      S.setStep = i => (S.mode === 'multi' ? setMultiStep(i) : setSingleStep(i));
      S.showSteps = mode => { singleSteps.style.display = mode === 'single' ? 'block' : 'none'; multiSteps.style.display = mode === 'multi' ? 'block' : 'none'; };
      const resetTissue = () => {
        S.singleCells.forEach(cell => activate(cell, 0));
        S.multiCells.forEach(cells => cells.forEach(cell => activate(cell, 0)));
        S.gapLinks.forEach(m => m.material.emissive.setHex(0));
        S.constrictions.forEach(item => { item.mesh.scale.set(1, 1, 1); item.mesh.material.emissive.setHex(0); });
        S.varicosities.forEach(beads => beads.forEach(m => m.material.emissive.setHex(0)));
        S.wavePulse.visible = false;
      };
      btn(box, '▶ 單一單位型：傳播協調收縮波', () => { resetTissue(); S.mode = 'single'; S.cluster = -1; S.t = 0; S.showSteps('single'); S.setStep(0); });
      btnRow(box, [
        ['多單位：刺激 A 區', () => { resetTissue(); S.mode = 'multi'; S.cluster = 0; S.t = 0; S.showSteps('multi'); S.setStep(0); }],
        ['刺激 B 區', () => { resetTissue(); S.mode = 'multi'; S.cluster = 1; S.t = 0; S.showSteps('multi'); S.setStep(0); }],
        ['刺激 C 區', () => { resetTissue(); S.mode = 'multi'; S.cluster = 2; S.t = 0; S.showSteps('multi'); S.setStep(0); }]
      ]);
      S.showSteps('single');
      note(box, '左側是組織中的細胞間協調；右側按 A、B、C 可比較不同區域的獨立神經控制。');
    }
  });
})();
