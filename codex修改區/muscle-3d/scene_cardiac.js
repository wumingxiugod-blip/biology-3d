/* 場景⑪：心肌興奮－收縮耦合：Ca²⁺ 誘發 Ca²⁺ 釋放（Ch12） */
(function () {
  let S = null;

  function particle(color, radius = 0.13) {
    const m = ell([0, -99, 0], [radius, radius, radius], color);
    m.material.emissive.setHex(color).multiplyScalar(0.5);
    CUR.root.add(m);
    return m;
  }

  function moveAlong(m, path, t) {
    if (t < 0 || t > 1 || (m.userData.part && !m.userData.part.visible)) { m.visible = false; return; }
    m.visible = true;
    m.position.copy(alongPath(path, t));
  }

  function bindParticle(part, m) {
    m.userData.part = part;
    part.meshes.push(m);
  }

  SCENES.push({
    name: '⑪ 心肌 Ca²⁺ 耦合',
    title: '心肌興奮－收縮耦合：細胞外 Ca²⁺ 觸發肌漿網釋放',
    camera: { pos: [0, 2, 40], target: [0, 0, 0] },
    controls: [
      { label: '🔍 心肌細胞與肌節', fn() { flyTo([0, 2, 34], [0, 0, 0]); } },
      { label: '🔍 橫小管－SR 接點', fn() { flyTo([0.55, 1.9, 11], [0.3, 1.25, 0.8]); } },
      { label: '🔍 肌原纖維', fn() { flyTo([2, 0.5, 17], [1.2, 0, 0.45]); } }
    ],
    desc: `
  <p>心肌動作電位沿肌膜與<b>橫小管（T-tubule）</b>傳入細胞。去極化開啟 L 型 Ca²⁺ 通道，少量<b>細胞外 Ca²⁺ 先進入</b>肌漿；這股 Ca²⁺ 開啟肌漿網（SR）的雷諾定受體（RyR），再誘發更多 Ca²⁺ 釋出，稱為<b>鈣誘發鈣釋放</b>（calcium-induced calcium release, CICR）。</p>
  <p>釋出的 Ca²⁺ 結合<b>肌鈣蛋白 C</b>，移開原肌球蛋白對肌動蛋白的遮蔽，讓橫橋循環與肌節縮短。舒張時，SERCA 將 Ca²⁺ 泵回 SR，Na⁺/Ca²⁺ 交換器（NCX）等路徑也把 Ca²⁺ 移出細胞，胞質 Ca²⁺ 下降後心肌舒張。</p>
  <p class="hint">這裡把電活動、少量跨膜 Ca²⁺ 內流、SR 大量釋鈣、肌節收縮與回收舒張依序顯示。粒子數量和時間是教學示意，並非實測比例或單一固定時間常數。</p>`,
    build() {
      S = { t: -1, setStep: null, actin: [], release: [], returns: [] };

      const cell = ell([0, 0, 0], [8.05, 2.65, 1.62], 0xe77773, 0.12);
      const branchUpperL = ttube([V(-6.2, 1.15, 0), V(-7.05, 1.65, 0), V(-7.75, 2.05, 0), V(-8.25, 2.2, 0)], t => 0.06 + 0.72 * Math.pow(Math.sin(Math.PI * t), 0.7), 0xe77773, 0.2);
      const branchLowerL = ttube([V(-6.1, -1.0, 0), V(-7.0, -1.55, 0), V(-7.75, -2.05, 0), V(-8.25, -2.15, 0)], t => 0.06 + 0.68 * Math.pow(Math.sin(Math.PI * t), 0.7), 0xe77773, 0.2);
      const branchUpperR = ttube([V(6.15, 0.9, 0), V(7.0, 1.35, 0), V(7.75, 1.95, 0), V(8.25, 2.1, 0)], t => 0.06 + 0.66 * Math.pow(Math.sin(Math.PI * t), 0.7), 0xe77773, 0.2);
      const branchLowerR = ttube([V(6.15, -0.9, 0), V(7.0, -1.35, 0), V(7.75, -1.95, 0), V(8.25, -2.1, 0)], t => 0.06 + 0.66 * Math.pow(Math.sin(Math.PI * t), 0.7), 0xe77773, 0.2);
      const pCell = reg('心肌細胞', '分支心肌細胞與肌膜', 'Branched cardiomyocyte and sarcolemma', '心肌細胞短而分支；半透明切面顯示細胞內肌原纖維、橫小管與肌漿網的相對位置。', [cell, branchUpperL, branchLowerL, branchUpperR, branchLowerR], { anchor: [-6.8, 2.2, 1.0] });

      const discPath = x => [V(x, -2.0, 0.92), V(x + 0.22, -1.45, 0.92), V(x - 0.18, -0.75, 0.92), V(x + 0.2, -0.05, 0.92), V(x - 0.18, 0.7, 0.92), V(x + 0.2, 1.4, 0.92), V(x, 2.0, 0.92)];
      const discL = ttube(discPath(-7.55), 0.12, 0x9e5262, 0.95);
      const discR = ttube(discPath(7.55), 0.12, 0x9e5262, 0.95);
      const discButtons = [-7.55, 7.55].flatMap(x => [-1.15, 0, 1.15].map(y => ell([x, y, 1.05], [0.16, 0.15, 0.11], 0xffc77a)));
      reg('心肌細胞', '閏盤與細胞間連結', 'Intercalated discs and cell junctions', '閏盤以階梯狀界面連接心肌細胞；黏著連結與橋粒傳遞力量，隙型連結讓電活動傳到相鄰細胞。', [discL, discR, ...discButtons], { anchor: [7.25, 2.25, 1.25] });
      const nucleus = ell([0, -1.7, 1.02], [0.78, 0.34, 0.22], 0x654c72, 0.92);
      const nucleolus = ell([0.18, -1.68, 1.23], [0.16, 0.12, 0.08], 0xc794bf, 0.95);
      reg('心肌細胞', '中央細胞核', 'Central nucleus', '心肌細胞通常有一個位於細胞中央的細胞核；切面將細胞核放在肌原纖維之間，呈現其被肌原纖維包圍的位置。', [nucleus, nucleolus], { anchor: [0, -1.12, 1.36] });

      const thick = [], actin = [], zDiscs = [], troponin = [];
      const mLines = [];
      const myofibrilRows = [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0], sarcomereStart = -6.0, sarcomereLength = 2.0, sarcomereCount = 6;
      myofibrilRows.forEach((y, row) => {
        const z = 0.32 + row * 0.055;
        for (let k = 0; k < sarcomereCount; k++) {
          const x0 = sarcomereStart + k * sarcomereLength, x1 = x0 + sarcomereLength, mid = (x0 + x1) / 2;
          thick.push(cylM([mid - 0.58, y, z], [mid + 0.58, y, z], 0.09, mat(0xffbd63), 12));
          const left = cylM([x0 + 0.08, y, z + 0.12], [mid - 0.22, y, z + 0.12], 0.048, mat(0x74d7aa), 10);
          const right = cylM([mid + 0.22, y, z + 0.12], [x1 - 0.08, y, z + 0.12], 0.048, mat(0x74d7aa), 10);
          actin.push({ mesh: left, dir: 1, restX: left.position.x }, { mesh: right, dir: -1, restX: right.position.x });
          troponin.push(ell([mid - 0.3, y, z + 0.21], [0.085, 0.08, 0.075], 0xffe277));
          troponin.push(ell([mid + 0.3, y, z + 0.21], [0.085, 0.08, 0.075], 0xffe277));
          mLines.push(cylM([mid, y - 0.16, z + 0.15], [mid, y + 0.16, z + 0.15], 0.025, mat(0x879bb0), 8));
          const zDisc = cylM([x0, y - 0.3, z + 0.15], [x0, y + 0.3, z + 0.15], 0.035, mat(0xe6d8b8), 8);
          zDiscs.push(zDisc);
          if (k === sarcomereCount - 1) zDiscs.push(cylM([x1, y - 0.3, z + 0.15], [x1, y + 0.3, z + 0.15], 0.035, mat(0xe6d8b8), 8));
        }
      });
      S.actin = actin;
      const pMyofilaments = reg('心肌細胞', '肌原纖維、肌節與肌鈣蛋白', 'Myofibrils, sarcomeres and troponin', '切面呈現多束平行肌原纖維；每束由連續肌節構成，Z 盤界定肌節，粗肌絲、細肌絲與中央 M 線規則排列。Ca²⁺ 結合肌鈣蛋白 C 後，細肌絲向肌節中央滑動。', [...thick, ...actin.map(a => a.mesh), ...zDiscs, ...troponin, ...mLines], { anchor: [4.6, -0.15, 0.95] });
      S.pMyofilaments = pMyofilaments;

      const mitochondria = [], cristae = [];
      [-5.0, -2.6, 2.6, 5.0].forEach(x => [-1, 1].forEach(side => {
        const y = side * 1.62, z = 0.82;
        mitochondria.push(ell([x, y, z], [0.72, 0.23, 0.18], 0xd29a58, 0.94));
        [-0.1, 0.1].forEach(offset => cristae.push(ttube([
          V(x - 0.49, y + offset, z + 0.14), V(x - 0.25, y + offset - 0.07, z + 0.18),
          V(x, y + offset + 0.06, z + 0.19), V(x + 0.24, y + offset - 0.06, z + 0.18), V(x + 0.49, y + offset, z + 0.14)
        ], 0.022, 0x69556d, 0.95)));
      }));
      reg('心肌細胞', '粒線體與嵴', 'Mitochondria and cristae', '心肌細胞需要持續供能，粒線體大量分布在肌原纖維之間；內膜形成嵴以增加氧化磷酸化的表面積。', [...mitochondria, ...cristae], { anchor: [-3.8, 1.98, 1.18] });

      const tubulePath = [V(0, 2.58, 0.93), V(0, 2.08, 0.93), V(0, 1.58, 0.93), V(0, 1.23, 0.93)];
      const tubuleWall = ttube(tubulePath, 0.2, 0x55c8ef, 0.48);
      const tubuleLumen = ttube(tubulePath.map(p => V(p.x, p.y, p.z + 0.035)), 0.085, 0x174e68, 0.92);
      const membrane = box([0, 2.6, 0.93], [0.76, 0.14, 0.62], 0x9be8ff, 0.62);
      const ltcc = cylM([0.1, 1.27, 0.99], [0.28, 1.27, 0.99], 0.035, mat(0x58c8e4), 10);
      const pTubule = reg('心肌興奮－收縮耦合', 'Z 盤處橫小管與 L 型 Ca²⁺ 通道', 'Z-line T-tubule and L-type Ca²⁺ channel', '橫小管是肌膜向心肌細胞內的管狀內陷，並在 Z 盤附近靠近接合型肌漿網。L 型 Ca²⁺ 通道位於橫小管膜；少量細胞外 Ca²⁺ 經此進入接合間隙。', [tubuleWall, tubuleLumen, membrane, ltcc], { anchor: [0, 2.13, 1.42] });

      const srUpper = ttube([V(-6.2, 0.77, 0.63), V(-4.0, 0.74, 0.63), V(-2.0, 0.78, 0.63), V(-0.9, 0.76, 0.63), V(1.3, 0.75, 0.63), V(3.8, 0.73, 0.63), V(6.2, 0.77, 0.63)], 0.14, 0xb28aff, 0.78);
      const srLower = ttube([V(-6.2, -0.9, 0.63), V(-3.8, -0.88, 0.63), V(-1.0, -0.92, 0.63), V(1.0, -0.89, 0.63), V(3.8, -0.91, 0.63), V(6.2, -0.9, 0.63)], 0.14, 0xb28aff, 0.78);
      const terminalSR = ell([0.74, 1.25, 0.93], [0.32, 0.34, 0.3], 0xc8aaff, 0.9);
      const srConnector = ttube([V(0.78, 0.98, 0.86), V(0.9, 0.86, 0.76), V(1.0, 0.77, 0.63)], 0.12, 0xc8aaff, 0.84);
      const ryr = [0.99, 1.23, 1.47].map(y => cylM([0.4, y, 0.96], [0.64, y, 0.96], 0.07, mat(0xffc55e), 8));
      const pSR = reg('心肌興奮－收縮耦合', '肌漿網與接合型 SR 終池（RyR）', 'Sarcoplasmic reticulum and junctional SR cisterna (RyR)', '心肌的 dyad 由一段橫小管與一個接合型 SR 終池緊鄰形成；這裡特意只畫單側終池，避免誤畫成骨骼肌的三聯體。L 型通道進入的 Ca²⁺ 在狹窄接合間隙開啟 RyR，誘發 SR 釋鈣；兩者不是直接機械耦合。', [srUpper, srLower, terminalSR, srConnector, ...ryr], { anchor: [3.8, 1.0, 0.85] });

      const serca = [4.25, 4.72].map(x => cylM([x, 0.55, 0.72], [x, 0.92, 0.72], 0.12, mat(0x5bd5a2), 10));
      const ncx = cylM([-5.4, 2.35, 0.9], [-5.4, 2.8, 0.9], 0.16, mat(0x71aaff), 10);
      const pTransport = reg('Ca²⁺ 回收與舒張', 'SERCA 與 Na⁺/Ca²⁺ 交換器', 'SERCA and Na⁺/Ca²⁺ exchanger', 'SERCA 將 Ca²⁺ 主動泵回肌漿網；NCX 等膜運輸路徑把 Ca²⁺ 移出細胞。胞質 Ca²⁺ 降低後，肌節舒張。', [...serca, ncx], { anchor: [4.65, 1.7, 1.2] });
      const glow = {
        tubule: [tubuleWall, tubuleLumen, membrane, ltcc],
        sr: [srUpper, srLower, terminalSR, srConnector, ...ryr],
        transport: [...serca, ncx]
      };

      const apPath = [V(0, 3.0, 1.0), V(0, 2.3, 1.0), V(0, 1.7, 1.0), V(0, 1.2, 1.0)];
      const influxPath = [V(0, 2.45, 1.0), V(0, 1.95, 1.0), V(0, 1.5, 1.0), V(0.24, 1.25, 1.0)];
      const releaseTargets = [V(-0.8, 0.42, 0.82), V(0.4, 0.28, 0.82), V(1.1, -0.2, 0.82), V(1.8, 0.62, 0.82), V(0.8, -0.62, 0.82)];
      S.apulse = particle(0xffef77, 0.2);
      S.caIn = [particle(0x48d9ff), particle(0x48d9ff)];
      S.caRelease = releaseTargets.map((target, i) => ({ mesh: particle(0x43d9f2), path: [V(0.58, 1.0 + i * 0.11, 0.98), V(-0.15 + i * 0.12, 0.72 - i * 0.17, 0.9), target] }));
      S.caReturn = [
        { mesh: particle(0x43d9f2), path: [V(3.5, 0.05, 0.9), V(4.25, 0.55, 0.9), V(4.25, 0.78, 0.78)] },
        { mesh: particle(0x43d9f2), path: [V(-4.7, 0.35, 0.9), V(-5.4, 1.25, 0.9), V(-5.4, 2.55, 0.9)] }
      ];
      S.apulse.userData.part = pTubule; pTubule.meshes.push(S.apulse);
      S.caIn.forEach(m => bindParticle(pTubule, m));
      S.caRelease.forEach(ion => bindParticle(pSR, ion.mesh));
      S.caReturn.forEach(ion => bindParticle(pTransport, ion.mesh));
      S.apPath = apPath; S.influxPath = influxPath; S.releaseTargets = releaseTargets;

      const dt = dtClock();
      CUR.tick = () => {
        if (S.t < 0) return;
        const d = dt(); S.t += d;
        const t = S.t;
        const stage = t < 0.8 ? 0 : t < 1.8 ? 1 : t < 3.05 ? 2 : t < 4.35 ? 3 : t < 6 ? 4 : -1;
        if (S.setStep) S.setStep(stage);
        glow.tubule.forEach(m => m.material.emissive.setHex(stage <= 1 ? 0x0b3442 : 0));
        glow.sr.forEach(m => m.material.emissive.setHex(stage === 2 ? 0x33204f : 0));
        glow.transport.forEach(m => m.material.emissive.setHex(stage === 4 ? 0x164833 : 0));
        moveAlong(S.apulse, apPath, (t >= 0.05 && t < 0.8) ? (t - 0.05) / 0.75 : -1);
        S.caIn.forEach((m, i) => moveAlong(m, influxPath, (t >= 0.8 && t < 1.8) ? (t - 0.8) / 1.0 - i * 0.28 : -1));
        S.caRelease.forEach((ion, i) => moveAlong(ion.mesh, ion.path, (t >= 1.8 && t < 3.05) ? (t - 1.8) / 1.25 - i * 0.12 : -1));
        S.caReturn.forEach((ion, i) => moveAlong(ion.mesh, ion.path, (t >= 4.35 && t < 5.8) ? (t - 4.35) / 1.45 - i * 0.25 : -1));
        const active = t >= 2.85 && t < 5.0 ? ease((t - 2.85) / 0.45) * (1 - ease((t - 4.45) / 0.55)) : 0;
        S.actin.forEach(a => { a.mesh.position.x = a.restX + a.dir * 0.45 * active; });
        S.pMyofilaments.meshes.forEach(m => m.material.emissive.setHex(active > 0.1 ? 0x4d300a : 0));
        if (t >= 6) {
          S.t = -1; S.setStep(-1);
          S.caIn.forEach(m => { m.visible = false; });
          S.caRelease.forEach(ion => { ion.mesh.visible = false; });
          S.caReturn.forEach(ion => { ion.mesh.visible = false; });
          S.apulse.visible = false;
          S.actin.forEach(a => { a.mesh.position.x = a.restX; });
          S.pMyofilaments.meshes.forEach(m => m.material.emissive.setHex(0));
        }
      };
    },
    panel(box) {
      note(box, '<b>依序看 Ca²⁺ 如何把電活動接到收縮</b>');
      btn(box, '▶ 播放一次興奮－收縮耦合', () => { S.t = 0; });
      S.setStep = stepList(box, [
        '① 動作電位沿肌膜進入橫小管',
        '② L 型通道開啟，少量細胞外 Ca²⁺ 內流',
        '③ Ca²⁺ 開啟 RyR，肌漿網大量釋鈣（CICR）',
        '④ Ca²⁺ 結合肌鈣蛋白 C，肌節形成橫橋並縮短',
        '⑤ SERCA 回收 Ca²⁺、NCX 外排，心肌舒張'
      ]);
      note(box, '青色粒子＝Ca²⁺；黃色脈衝＝沿橫小管傳遞的電活動。心肌 dyad 是一段橫小管貼近一個 SR 終池，不是骨骼肌的三聯體。細胞與通道尺寸經放大，動畫完成後按播放可重看。');
    }
  });
})();
