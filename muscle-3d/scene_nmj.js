/* 場景④：運動單元與神經肌肉接合（Ch12 Fig 12.3、12.4；Ch7 7.4） */
(function () {
  let S = null;
  const C = V(-22, 6, 0), N = V(36, 0, 0);
  const UNIT_A = [0, 5, 7, 10], UNIT_B = [1, 2, 3, 4, 6, 8, 9, 11];

  // 灰質（蝴蝶形）輪廓
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
  // 運動終板的肌膜（含接合摺）剖面，沿 z 擠出
  function foldSlab() {
    const sh = new THREE.Shape(); sh.moveTo(-7, -4.5); sh.lineTo(7, -4.5); sh.lineTo(7, -1.2);
    for (let x = 7; x >= -7; x -= 0.04) {
      let y = -1.2;
      if (Math.abs(x) < 3.3) { const k = Math.abs(Math.sin(Math.PI * x / 0.9)); y -= 1.1 * Math.max(0, 1 - k * 1.7); }
      sh.lineTo(x, y);
    }
    const g = new THREE.ExtrudeGeometry(sh, { depth: 5, bevelEnabled: false, curveSegments: 4 });
    g.translate(N.x, N.y, -2.5); return g;
  }

  SCENES.push({
    name: '④ 運動單元與 NMJ',
    title: '運動單元（motor unit）與神經肌肉接合（NMJ）',
    camera: { pos: [6, 4, 70], target: [6, -1, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([6, 4, 70], [6, -1, 0]); } },
      { label: '🔍 脊髓前角', fn() { flyTo([-20, 5, 18], [-21, 4, 2]); } },
      { label: '🔍 運動單元', fn() { flyTo([6, 2, 30], [6, -5, 0]); } },
      { label: '🔍 NMJ 放大', fn() { flyTo([37, 2, 17], [36, -0.5, 0]); } }
    ],
    desc: `
  <p><b>體運動神經元</b>的細胞本體位於脊髓灰質<b>前角</b>，軸突經<b>前根</b>離開脊髓，到肌肉中分支，每條肌纖維只接受<b>一個</b>終端小球（terminal bouton）。</p>
  <p><b>運動單元</b>＝一個運動神經元＋它支配的所有肌纖維。神經元興奮時，其所有肌纖維一起收縮（全有或全無）。</p>
  <p><b>支配比</b>（innervation ratio，神經元：肌纖維）：眼外肌平均約 <b>1:23</b>，控制精細；腓腸肌平均約 <b>1:1000</b>（範圍 1:100 – 1:2000）。小運動單元的神經元較小、較易興奮，先被徵召。</p>
  <p><b>增補作用</b>（recruitment）：要更大力時，腦部徵召更多、更大的運動單元，加上提高放電頻率，使收縮平滑且強度分級。</p>
  <p><b>NMJ 傳遞</b>：動作電位到達終端 → 突觸小泡胞吐釋出 <b>ACh</b> → ACh 結合運動終板上的<b>菸鹼型 ACh 受體</b>（配體閘控通道）→ Na⁺ 內流為主 → <b>終板電位</b> → 引發肌膜動作電位。ACh 隨即被<b>乙醯膽鹼酯酶</b>（AChE）分解。</p>
  <p class="hint">臨床：肉毒桿菌毒素切斷 SNARE 蛋白（SNAP-25），使 ACh 無法釋放 → 肌肉麻痺（Botox 除皺的原理）。</p>`,
    build() {
      S = { anim: [], na: 0 };
      // ── 脊髓
      reg('脊髓', '脊髓白質', 'Spinal cord white matter', '由有髓鞘軸突組成的傳導束。', cylM(C.clone().add(V(0, 0, -2.5)), C.clone().add(V(0, 0, 2.5)), 4, mat(0xf2eee2, 0.3), 48), { anchor: [C.x - 3.2, C.y + 2.4, 2.5] });
      const gm = new THREE.Mesh(new THREE.ExtrudeGeometry(butterfly(), { depth: 5.2, bevelEnabled: false }), mat(0xa89aa8, 0.85));
      gm.position.set(C.x, C.y, -2.6);
      reg('脊髓', '灰質（前角）', 'Gray matter – ventral horn', '灰質的腹側部分；<b>下運動神經元</b>（體運動神經元）的細胞本體位於此，是運動指令的「最後共同路徑」。', gm, { anchor: [C.x + 1.6, C.y - 2, 2.6] });
      const somaA = C.clone().add(V(1.1, -1.5, 2.75)), somaB = C.clone().add(V(2.0, -2.3, 2.75));
      const soma = (p, col) => { const m = [ell([p.x, p.y, p.z], [0.45, 0.45, 0.3], col)]; for (let k = 0; k < 5; k++) { const a = k * 1.25 + 0.4; m.push(ttube([[p.x, p.y, p.z], [p.x + Math.cos(a) * 0.9, p.y + Math.sin(a) * 0.9, p.z], [p.x + Math.cos(a + 0.3) * 1.5, p.y + Math.sin(a + 0.3) * 1.5, p.z]], [0.12, 0.03], col)); } return m; };
      const root = C.clone().add(V(3.4, -3.6, 2.2));
      const pathA = [somaA, root, V(-12, 1, 1.4), V(0, -0.6, 0.5), V(6.5, -1.6, 0.2)];
      const pathB = [somaB, root.clone().add(V(0.25, 0, 0)), V(-12, 0.6, 1.0), V(0, -0.9, 0.2), V(9.5, -1.6, -0.2)];
      // ── 肌肉（12 條肌纖維）
      const fib = [], fpos = [];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) fpos.push(V(8, -4.2 - r * 1.35, (c - 1.5) * 1.35));
      const tex = stripeTex(34, { I: '#d29a92', H: '#a84a44' });
      fpos.forEach(p => fib.push(cylM([-6, p.y, p.z], [22, p.y, p.z], 0.55, tmat(tex), 16)));
      const branch = (base, idx, col) => idx.map(i => {
        const p = fpos[i], ep = V(base.x + (i % 3 - 1) * 0.8, p.y + 0.55, p.z);
        return { tube: ttube([base, V(base.x, -2.6, base.z * 0.5 + p.z * 0.5), V(ep.x, ep.y + 0.9, ep.z), ep], 0.07, col), ep, pts: [base, V(base.x, -2.6, base.z * 0.5 + p.z * 0.5), V(ep.x, ep.y + 0.9, ep.z), ep] };
      });
      const brA = branch(pathA[4], UNIT_A, 0x4aa8ff), brB = branch(pathB[4], UNIT_B, 0xffa040);
      S.fibA = UNIT_A.map(i => fib[i]); S.fibB = UNIT_B.map(i => fib[i]);
      reg('運動單元', '運動單元 A 的肌纖維', 'Motor unit A – muscle fibers', '小運動單元：4 條肌纖維（支配比 1:4，示意）。同一運動單元的纖維<b>分散</b>在肌肉中，並不聚在一起。', S.fibA, { anchor: [-5, fpos[0].y, fpos[0].z] });
      reg('運動單元', '運動單元 B 的肌纖維', 'Motor unit B – muscle fibers', '較大的運動單元：8 條肌纖維（示意）。較大的運動神經元較晚被徵召，產生較大力量。', S.fibB, { anchor: [21, fpos[1].y, fpos[1].z] });
      reg('運動單元', '運動神經元 A', 'Somatic motor neuron A', '細胞本體在脊髓前角，軸突經前根到肌肉並分支，支配運動單元 A 的所有肌纖維。',
        [...soma(somaA, 0x4aa8ff), ttube(pathA, 0.11, 0x4aa8ff), ...brA.map(b => b.tube)], { anchor: [-12, 1.1, 1.4] });
      reg('運動單元', '運動神經元 B', 'Somatic motor neuron B', '較大的運動神經元，支配較多肌纖維（運動單元 B）。',
        [...soma(somaB, 0xffa040), ttube(pathB, 0.13, 0xffa040), ...brB.map(b => b.tube)], { anchor: [0, -1.3, 0.2] });
      reg('運動單元', '運動終板（每條纖維一個）', 'Motor end plates', '每條肌纖維只有一個神經肌肉接合處；右側為其放大。',
        [...brA, ...brB].map(b => ell([b.ep.x, b.ep.y, b.ep.z], [0.3, 0.08, 0.3], 0xffe070)), { anchor: [brB[0].ep.x, brB[0].ep.y, brB[0].ep.z] });
      textSprite('前根 ventral root', [root.x + 2.5, root.y - 0.6, root.z], 0.6, '#cfe3f5');
      S.pathA = [...pathA]; S.pathB = [...pathB]; S.brA = brA; S.brB = brB;
      S.pulse = [dots([V(0, 0, 0)], 0.32, 0xffffff), dots([V(0, 0, 0)], 0.32, 0xffffff)];
      S.pulse.forEach(m => { m.visible = false; CUR.root.add(m); m.material.emissive.setHex(0xffff80); });
      S.bdots = [dots(brA.map(() => V()), 0.22, 0xffffff), dots(brB.map(() => V()), 0.22, 0xffffff)];
      S.bdots.forEach(m => { m.visible = false; CUR.root.add(m); m.material.emissive.setHex(0xffff80); });
      dash([brA[0].ep.x, brA[0].ep.y, brA[0].ep.z], [N.x - 6, 3, 0]);

      // ── NMJ 放大
      const slab = new THREE.Mesh(foldSlab(), mat(0xe8a0a0));
      S.endP = reg('NMJ', '運動終板（接合摺）', 'Motor end plate (junctional folds)', '肌膜在終端小球下方特化的部分，摺成許多<b>接合摺</b>以增加表面積；頂部密布菸鹼型 ACh 受體；摺的凹處富含<b>電壓閘控 Na⁺ 通道</b>，終板電位擴散到此即引發動作電位。', slab, { anchor: [N.x + 4.5, -1.3, 2.5] });
      const ax = [V(N.x - 7, 7, 0), V(N.x - 4, 5.5, 0), V(N.x - 1.8, 2.4, 0), V(N.x, 1.6, 0)];
      reg('NMJ', '體運動神經元軸突', 'Somatic motor axon', '傳導動作電位到軸突終端。', ttube(ax, 0.45, 0xffa040), { anchor: [N.x - 4, 5.5, 0.5] });
      reg('NMJ', '髓鞘', 'Myelin sheath', '包住軸突以加速傳導；在接近終端處終止。', ttube(ax.slice(0, 3).map((p, i) => i === 2 ? p.clone().lerp(ax[1], 0.4) : p), 0.72, 0xf4f4f4, 0.55), { anchor: [N.x - 5.5, 6.3, 0.8] });
      reg('NMJ', '軸突終端（終端小球）', 'Terminal bouton', '軸突末端膨大處，內含大量含 ACh 的突觸小泡與粒線體。', ell([N.x, 0.65, 0], [3.5, 1.2, 2.1], 0xffc070, 0.35), { anchor: [N.x - 3.2, 0.6, 0.8] });
      const rr = rnd(11), ves = [];
      for (let i = 0; i < 46; i++) { const a = rr() * Math.PI * 2, r = Math.sqrt(rr()); ves.push(V(N.x + Math.cos(a) * r * 2.8, -0.05 + rr() * 1.2, Math.sin(a) * r * 1.6)); }
      S.ves = dots(ves, 0.2, 0x9be8ff, 1, 10); S.ves0 = ves;
      reg('NMJ', '突觸小泡', 'Synaptic vesicles', '內含神經傳遞物質 <b>乙醯膽鹼（ACh）</b>；動作電位使 Ca²⁺ 進入終端，觸發小泡與細胞膜融合（胞吐）。', S.ves, { anchor: [N.x + 1.5, -0.2, 1.4] });
      reg('NMJ', '粒線體', 'Mitochondria', '供應 ACh 合成與小泡循環所需能量。', [ell([N.x - 1.5, 1.25, -0.6], [0.8, 0.28, 0.28], 0xf0a030), ell([N.x + 1.6, 1.2, 0.5], [0.7, 0.26, 0.26], 0xf0a030)], { anchor: [N.x - 1.5, 0.9, -0.6] });
      const rec = [];
      for (let x = -3; x <= 3.01; x += 0.9) [-1.2, -0.4, 0.4, 1.2].forEach(z => { const xx = x + 0.45; if (Math.abs(xx) < 3.1) rec.push(V(N.x + xx, -1.13, z)); });
      S.rec = rec;
      reg('NMJ', '菸鹼型 ACh 受體', 'Nicotinic ACh receptors', '位於接合摺頂部的<b>配體閘控</b>離子通道；ACh 結合後打開，Na⁺ 內流（同時少量 K⁺ 外流），產生<b>終板電位</b>。', inst(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 10), rec.map(p => mtx([p.x, p.y, p.z])), 0x30d0c0), { anchor: [N.x + 2.25, -1.1, 1.2] });
      const ache = []; for (let i = 0; i < 22; i++) ache.push(V(N.x + (rr() - 0.5) * 6.2, -1.25 - rr() * 0.7, (rr() - 0.5) * 3.6));
      reg('NMJ', '乙醯膽鹼酯酶（AChE）', 'Acetylcholinesterase', '位於突觸間隙（基底膜上）的酵素，迅速分解 ACh，使訊號短暫、精準。', dots(ache, 0.11, 0xc080ff), { anchor: [N.x - 2.5, -1.6, 1.8] });
      reg('NMJ', '突觸間隙', 'Synaptic cleft', '終端小球與運動終板之間狹窄的間隙；ACh 擴散通過此處。', box([N.x, -0.8, 0], [7, 0.5, 4.2], 0x8fd0ff, 0.1), { anchor: [N.x + 3.3, -0.8, -1.8] });
      textSprite('NMJ 放大', [N.x, 4.2, 0], 1.0, '#ffd479', 'Neuromuscular junction');
      // ACh 與 Na⁺ 粒子
      S.ach = dots(new Array(140).fill(0).map(() => V(0, -99, 0)), 0.1, 0xffff60); S.ach.material.emissive.setHex(0x606000); CUR.root.add(S.ach);
      S.achP = S.ach.count; S.achD = new Array(S.achP).fill(0).map(() => ({ a: V(N.x + (rr() - 0.5) * 5.6, -0.5, (rr() - 0.5) * 3), b: rec[Math.floor(rr() * rec.length)].clone().add(V((rr() - 0.5) * 0.3, 0.12, (rr() - 0.5) * 0.3)), d: rr() * 0.35 }));
      S.naM = dots(new Array(60).fill(0).map(() => V(0, -99, 0)), 0.13, 0x6080ff); CUR.root.add(S.naM);
      S.naD = new Array(60).fill(0).map(() => ({ r: rec[Math.floor(rr() * rec.length)], d: rr() * 0.4 }));
      S.slab = slab;

      const dt = dtClock();
      CUR.tick = () => {
        const d = dt();
        // 運動單元刺激
        S.anim = S.anim.filter(a => {
          a.t += d;
          const path = a.u ? S.pathB : S.pathA, br = a.u ? S.brB : S.brA, P = S.pulse[a.u], B = S.bdots[a.u], F = a.u ? S.fibB : S.fibA;
          if (a.t < 1.2) { P.visible = true; P.setP(0, alongPath(path, a.t / 1.2)); P.instanceMatrix.needsUpdate = true; }
          else if (a.t < 1.6) { P.visible = false; B.visible = true; br.forEach((b, i) => B.setP(i, alongPath(b.pts, (a.t - 1.2) / 0.4))); B.instanceMatrix.needsUpdate = true; }
          else B.visible = false;
          const c = a.t > 1.6 ? Math.sin(Math.PI * clamp01((a.t - 1.6) / 0.9)) : 0;
          F.forEach(f => { f.scale.y = 1 - 0.1 * c; f.material.emissive.setHex(c > 0.05 ? 0x602000 : 0x000000); });
          return a.t < 2.6;
        });
        // NMJ 釋放
        if (S.na > 0) {
          S.na += d; const t = S.na;
          const glow = t < 0.6 ? 0x806000 : 0x000000; partBy('軸突終端（終端小球）').meshes[0].material.emissive.setHex(glow);
          const fuse = ease((t - 0.3) / 0.5);
          S.ves0.forEach((p, i) => { const docked = p.y < 0.45 && i % 2 === 0; const q = docked ? p.clone().lerp(V(p.x, -0.45, p.z), fuse) : p; S.ves.setP(i, q, docked && fuse > 0.95 ? 0.001 : 0.2); });
          S.ves.instanceMatrix.needsUpdate = true;
          S.achD.forEach((o, i) => {
            const k = clamp01((t - 0.75 - o.d) / 0.6), fade = t > 2.6 + o.d;
            S.ach.setP(i, k <= 0 || fade ? V(0, -99, 0) : o.a.clone().lerp(o.b, ease(k)).add(V(0, Math.sin(k * 9 + i) * 0.08, 0)));
          });
          S.ach.instanceMatrix.needsUpdate = true;
          S.naD.forEach((o, i) => {
            const k = clamp01((t - 1.5 - o.d) / 0.8);
            S.naM.setP(i, k <= 0 || k >= 1 ? V(0, -99, 0) : V(o.r.x + Math.sin(i) * 0.1, -0.6 - 1.9 * k, o.r.z));
          });
          S.naM.instanceMatrix.needsUpdate = true;
          S.slab.material.emissive.setHex(t > 1.9 && t < 2.9 ? 0x402060 : 0x000000);
          if (S.setStep) S.setStep(t < 0.75 ? 0 : t < 1.5 ? 1 : t < 1.9 ? 2 : t < 2.9 ? 3 : 4);
          if (t > 3.6) { S.na = 0; S.ves0.forEach((p, i) => S.ves.setP(i, p)); S.ves.instanceMatrix.needsUpdate = true; S.setStep && S.setStep(-1); }
        }
      };
    },
    panel(box) {
      note(box, '<b>運動單元與增補作用</b>');
      btnRow(box, [['刺激 A（小）', () => S.anim.push({ u: 0, t: 0 })], ['刺激 B（大）', () => S.anim.push({ u: 1, t: 0 })],
        ['A＋B', () => { S.anim.push({ u: 0, t: 0 }); S.anim.push({ u: 1, t: 0 }); }]]);
      note(box, '只刺激 A：4/12 條纖維收縮；加上 B：12/12 → 力量分級（增補）。');
      note(box, '<b>神經肌肉接合處的傳遞</b>');
      btn(box, '▶ 動作電位到達終端，釋放 ACh', () => { S.na = 0.001; flyTo([37, 2, 17], [36, -0.5, 0]); });
      S.setStep = stepList(box, ['① 動作電位到達軸突終端', '② 突觸小泡胞吐，ACh 釋入突觸間隙', '③ ACh 結合菸鹼型受體 → 通道打開', '④ Na⁺ 內流 → 終板電位 → 肌膜動作電位', '⑤ AChE 分解 ACh，訊號結束']);
    }
  });
})();
