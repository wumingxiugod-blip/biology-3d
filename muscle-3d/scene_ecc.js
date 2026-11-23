/* 場景⑤：刺激-收縮耦合：橫小管、肌質網與三聯體（Ch12 Fig 12.15–12.17） */
(function () {
  let S = null;
  const SL = 8, X0 = -10, X1 = 10, ZS = [-2.9, 0, 2.9], R = 1.2, YS = 2.3, Q = V(21, 0, 0);
  const ZL = [-10, -2, 6], AI = [];
  ZL.forEach(z => [z + 0.18 * SL, z + 0.82 * SL].forEach(x => { if (x > X0 && x < X1) AI.push(x); }));
  const torusAt = (x, z, Rr, r) => [new THREE.TorusGeometry(Rr, r, 8, 36), M4().makeTranslation(x, 0, z).multiply(M4().makeRotationY(Math.PI / 2))];

  const STEPS = [
    '① 運動神經元釋放 ACh，結合肌膜上的菸鹼型受體 → Na⁺ 內流、去極化',
    '② 肌膜產生<b>動作電位</b>並沿肌膜傳導',
    '③ 動作電位沿<b>橫小管</b>深入纖維內部，打開其上的電壓閘控 Ca²⁺ 通道（DHP 受體）',
    '④ DHP 受體與肌質網上的 <b>Ca²⁺ 釋放通道</b>（ryanodine 受體）機械性相連 → 通道打開，Ca²⁺ 自<b>終池</b>擴散入肌質',
    '⑤ Ca²⁺ 結合肌鈣蛋白 → 橫橋循環 → <b>收縮</b>',
    '⑥ 動作電位停止：釋放通道關閉，<b>Ca²⁺-ATPase 幫浦</b>把 Ca²⁺ 主動送回肌質網 → <b>舒張</b>（舒張也需要 ATP）'
  ];

  SCENES.push({
    name: '⑤ 刺激-收縮耦合',
    title: '刺激-收縮耦合（excitation-contraction coupling）',
    camera: { pos: [6, 12, 34], target: [5, 0, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([6, 12, 34], [5, 0, 0]); } },
      { label: '🔍 橫小管與肌質網', fn() { flyTo([-3, 7, 13], [-3, 0.5, 0]); } },
      { label: '🔍 三聯體分子放大', fn() { flyTo([Q.x, 2, 13], [Q.x, 0.5, 0]); } }
    ],
    desc: `
  <p><b>肌質網</b>（sarcoplasmic reticulum, SR）＝特化的平滑內質網，像網一樣包住每條肌原纖維，<b>儲存 Ca²⁺</b>；大部分 Ca²⁺ 存在膨大的<b>終池</b>（terminal cisternae）。</p>
  <p><b>橫小管</b>（transverse tubules, T 小管）＝肌膜向內凹陷形成的細管，開口於細胞表面，能把動作電位<b>傳到纖維深處</b>。每條 T 小管兩側各夾一個終池，合稱<b>三聯體</b>（triad）。</p>
  <p><b>電機械性釋放</b>（electromechanical release）：骨骼肌中，T 小管上的電壓閘控 Ca²⁺ 通道（<b>DHP 受體</b>）與 SR 上的 <b>Ca²⁺ 釋放通道</b>（<b>ryanodine 受體</b>）<b>直接機械相連</b>；去極化使前者改變構形，直接拉開後者。SR 上另有對肌質 Ca²⁺ 升高起反應的釋放通道（Ca²⁺ 誘發 Ca²⁺ 釋放），可放大訊號。</p>
  <p>肌質 Ca²⁺ 超過約 10⁻⁶ M 即啟動收縮；動作電位持續、釋放通道就保持開啟。</p>
  <p><b>心肌不同</b>：T 小管的 Ca²⁺ 通道與 SR 釋放通道<b>不直接接觸</b>，靠流入的 Ca²⁺ 去打開 SR 通道（<b>Ca²⁺ 誘發 Ca²⁺ 釋放</b>），所以耦合比骨骼肌慢。</p>
  <p class="hint">左：一段肌纖維內部（3 條肌原纖維，三聯體位於 A 帶與 I 帶交界）；右：三聯體分子放大。</p>`,
    build() {
      S = { t: -1, speed: 1 };
      const tex = stripeTex((X1 - X0) / SL);
      const mf = ZS.map(z => cylM([X0, 0, z], [X1, 0, z], R, tmat(tex), 32));
      S.mf = mf;
      reg('肌纖維內部', '肌原纖維', 'Myofibrils', '收縮單位；Ca²⁺ 結合其細肌絲上的肌鈣蛋白後開始收縮。', mf, { anchor: [X1 - 0.5, -0.9, ZS[2]] });
      reg('肌纖維內部', '肌膜', 'Sarcolemma', '肌纖維的細胞膜；可興奮，能傳導動作電位。在各三聯體處向內凹陷形成 T 小管。', box([0, YS, 0], [X1 - X0 + 1, 0.1, 9.8], 0xe8a0a0, 0.3), { anchor: [-6, YS, 4.6] });
      // T 小管：每個 A-I 交界一個（可個別發光）
      S.tt = AI.map(x => {
        const it = [];
        ZS.forEach(z => it.push(torusAt(x, z, R + 0.2, 0.1)));
        [-1.45, 1.45].forEach(z => it.push([new THREE.CylinderGeometry(0.1, 0.1, YS, 8), mtx([x, YS / 2, z])]));
        it.push([new THREE.TorusGeometry(0.16, 0.05, 6, 16), mtx([x, YS + 0.06, -1.45], [0, 0, 1])]);
        it.push([new THREE.TorusGeometry(0.16, 0.05, 6, 16), mtx([x, YS + 0.06, 1.45], [0, 0, 1])]);
        return new THREE.Mesh(mergeGeo(it), mat(0xc070ff));
      });
      reg('肌纖維內部', '橫小管（T 小管）', 'Transverse tubules', '由肌膜向內延伸、與肌膜連續的管道，開口通到細胞外。把動作電位迅速傳到每條肌原纖維旁；位於 A 帶與 I 帶交界處，環繞肌原纖維。', S.tt, { anchor: [AI[1], YS - 0.6, -1.45] });
      // 終池
      S.tc = AI.map(x => { const it = []; ZS.forEach(z => { it.push(torusAt(x - 0.45, z, R + 0.2, 0.25)); it.push(torusAt(x + 0.45, z, R + 0.2, 0.25)); }); return new THREE.Mesh(mergeGeo(it), mat(0x40c070, 0.9)); });
      reg('肌纖維內部', '終池', 'Terminal cisternae', '肌質網靠近 T 小管的膨大部分，<b>儲存大部分 Ca²⁺</b>。兩個終池夾一條 T 小管＝三聯體。', S.tc, { anchor: [AI[2] + 0.45, 1.45, ZS[2]] });
      // 縱走肌質網
      const sr = [];
      ZS.forEach(z => {
        for (let i = 0; i < AI.length - 1; i++) {
          const a = AI[i] + 0.7, b = AI[i + 1] - 0.7;
          for (let k = 0; k < 7; k++) {
            const an = k / 7 * Math.PI * 2 + i * 0.3, pts = [];
            for (let s = 0; s <= 12; s++) { const x = a + (b - a) * s / 12, w = an + 0.18 * Math.sin(s * 1.3 + k); pts.push(V(x, Math.cos(w) * (R + 0.18), z + Math.sin(w) * (R + 0.18))); }
            sr.push([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.07, 5), null]);
          }
          sr.push(torusAt((a + b) / 2, z, R + 0.18, 0.08));
        }
      });
      reg('肌纖維內部', '肌質網（縱走部分）', 'Sarcoplasmic reticulum', '像網一樣包住每條肌原纖維的特化內質網；膜上有 <b>Ca²⁺-ATPase 幫浦</b>，不斷把 Ca²⁺ 送回 SR，使肌質 Ca²⁺ 保持很低。', new THREE.Mesh(mergeGeo(sr), mat(0x60d890, 0.55)), { anchor: [(AI[0] + AI[1]) / 2, R + 0.25, ZS[0]] });
      const mi = [];
      ZL.forEach(x => { if (x > X0 && x < X1) [-1.45, 1.45].forEach(z => mi.push(ell([x, 0.9, z], [0.75, 0.25, 0.25], 0xf0a030))); });
      reg('肌纖維內部', '粒線體', 'Mitochondria', '供應 ATP：收縮（橫橋循環）與舒張（Ca²⁺ 幫浦）都需要 ATP。', mi, { anchor: [-2, 0.9, 1.45] });
      reg('肌纖維內部', '運動神經元終端', 'Motor nerve terminal', '釋放 ACh 引發肌膜去極化（見④）。', [ell([X0 + 0.6, YS + 0.45, 0], [1.1, 0.35, 0.8], 0xffa040), ttube([[X0 + 0.6, YS + 0.5, 0], [X0 - 0.5, YS + 2, 0], [X0 - 2.5, YS + 3, 0]], 0.22, 0xffa040)], { anchor: [X0 - 0.8, YS + 2, 0] });
      // 動作電位波前
      S.wave = box([X0, YS + 0.08, 0], [0.9, 0.16, 9.8], 0xffff60, 0.7); S.wave.material.emissive.setHex(0x808000); CUR.root.add(S.wave); S.wave.visible = false;
      // Ca²⁺ 粒子
      const rr = rnd(5), N = 360; S.ca = [];
      for (let i = 0; i < N; i++) {
        const j = i % AI.length, x = AI[j] + (rr() < 0.5 ? -0.45 : 0.45), z = ZS[Math.floor(rr() * 3)], a = rr() * Math.PI * 2;
        const home = V(x, Math.cos(a) * (R + 0.2), z + Math.sin(a) * (R + 0.2));
        const a2 = rr() * Math.PI * 2, rad = R + 0.05 + rr() * 0.35;
        const out = V(Math.max(X0 + 0.3, Math.min(X1 - 0.3, x + (rr() - 0.5) * 5)), Math.cos(a2) * rad, z + Math.sin(a2) * rad);
        S.ca.push({ home, out, j, d: rr() * 0.4 });
      }
      S.caM = dots(S.ca.map(c => c.home), 0.09, 0x30ff90); S.caM.material.emissive.setHex(0x0a5020);
      reg('肌纖維內部', 'Ca²⁺', 'Calcium ions', '安靜時集中在肌質網（尤其終池）內；受刺激時釋入肌質，結合肌鈣蛋白。', S.caM, { anchor: [AI[0] - 0.45, -1.4, ZS[1]] });

      // ── 右：三聯體分子放大
      reg('三聯體放大', 'T 小管膜', 'T-tubule membrane', '橫小管的膜（與肌膜連續），管腔內為細胞外液。', cylM([Q.x, 0, -3.6], [Q.x, 0, 3.6], 0.95, mat(0xc070ff, 0.45), 24), { anchor: [Q.x, 0.95, 3.6] });
      S.cis = [-1, 1].map(s => ell([Q.x + s * 2.9, 0, 0], [1.5, 2.1, 3.6], 0x40c070, 0.45));
      reg('三聯體放大', '終池（SR）', 'Terminal cisterna', 'T 小管兩側的肌質網膨大部分，內含高濃度 Ca²⁺。', S.cis, { anchor: [Q.x + 2.9, 1.9, 1.5] });
      S.dhp = [], S.ryr = [];
      [-1, 1].forEach(s => [-2.4, -0.8, 0.8, 2.4].forEach(z => {
        S.dhp.push(box([Q.x + s * 0.98, 0, z], [0.32, 0.55, 0.55], 0xff70b0));
        S.ryr.push(box([Q.x + s * 1.42, 0, z], [0.55, 0.95, 0.95], 0x4070ff));
      }));
      reg('三聯體放大', 'DHP 受體（電壓閘控 Ca²⁺ 通道）', 'Dihydropyridine receptor', 'T 小管膜上的<b>電壓閘控 Ca²⁺ 通道</b>（因可被 dihydropyridine 類藥物阻斷而得名）。T 小管去極化時改變構形；在骨骼肌中它主要作為<b>電壓感測器</b>。', S.dhp, { anchor: [Q.x - 0.98, 0.3, 2.4] });
      reg('三聯體放大', 'Ca²⁺ 釋放通道（ryanodine 受體）', 'Ca²⁺ release channel (ryanodine receptor)', '終池膜上的大型通道，與 DHP 受體<b>機械性相連</b>；被拉開後 Ca²⁺ 順濃度梯度自 SR 擴散入肌質。（心肌中則靠 Ca²⁺ 誘發開啟）', S.ryr, { anchor: [Q.x + 1.42, 0.5, 2.4] });
      const up = [-1, 1].map(s => cylM([Q.x + s * 2.9, 1.6, 0], [Q.x + s * 2.9, 5.2, 0], 0.55, mat(0x60d890, 0.45), 16));
      reg('三聯體放大', '縱走肌質網', 'Longitudinal SR', '終池延伸出的肌質網小管。', up, { anchor: [Q.x - 2.9, 4.6, 0.5] });
      const serca = [];
      [-1, 1].forEach(s => [2.6, 3.6, 4.6].forEach((y, k) => serca.push(box([Q.x + s * (2.9 - 0.55), y, k % 2 ? 0.3 : -0.3], [0.3, 0.42, 0.42], 0xffd23f))));
      reg('三聯體放大', 'Ca²⁺-ATPase 幫浦（SERCA）', 'Ca²⁺-ATPase pump', '肌質網膜上的<b>主動運輸</b>幫浦，消耗 ATP 把 Ca²⁺ 送回 SR 內 → 肌質 Ca²⁺ 下降 → 舒張。', serca, { anchor: [Q.x + 2.35, 3.6, 0.3] });
      textSprite('三聯體放大', [Q.x, 6.4, 0], 0.9, '#ffd479', 'Triad: T tubule + 2 terminal cisternae');
      textSprite('肌質', [Q.x, -3.0, 2.6], 0.6, '#cfe3f5');
      // 放大圖中的 Ca²⁺
      S.qca = [];
      for (let i = 0; i < 70; i++) {
        const s = i % 2 ? 1 : -1, home = V(Q.x + s * (2.9 + (rr() - 0.3) * 0.9), (rr() - 0.5) * 2.4, (rr() - 0.5) * 4.6);
        const gate = S.ryr[(s > 0 ? 4 : 0) + Math.floor(rr() * 4)].position.clone();
        const out = V(Q.x + s * (0.6 + rr() * 1.6), -1.8 - rr() * 1.6, gate.z + (rr() - 0.5) * 1.5);
        S.qca.push({ home, gate, out, back: V(Q.x + s * 2.35, 2.6 + rr() * 2, (rr() - 0.5) * 0.6), d: rr() * 0.4 });
      }
      S.qcaM = dots(S.qca.map(c => c.home), 0.12, 0x30ff90); S.qcaM.material.emissive.setHex(0x0a5020); CUR.root.add(S.qcaM);
      dash([AI[2], R + 0.3, ZS[2]], [Q.x - 3, 0, 0]);

      const dt = dtClock();
      const T = { ach: 0.6, ap: 1.2, rel: 0.6, con: 1.4, relax: 1.4 };
      CUR.tick = () => {
        const d = dt() * S.speed;
        if (S.t < 0) return;
        S.t += d; const t = S.t;
        const tAP0 = T.ach, tAP1 = T.ach + T.ap, tCon = tAP1 + T.rel, tRel = tCon + T.con, tEnd = tRel + T.relax;
        partBy('運動神經元終端').meshes[0].material.emissive.setHex(t < tAP0 ? 0x805000 : 0);
        const xw = X0 + (X1 - X0) * (t - tAP0) / T.ap;
        S.wave.visible = t > tAP0 && t < tAP1; S.wave.position.x = xw;
        const caLevels = AI.map(x => {
          const tOn = tAP0 + (x - X0) / (X1 - X0) * T.ap;
          return t < tRel ? ease((t - tOn) / T.rel) : 1 - ease((t - tRel) / T.relax);
        });
        S.tt.forEach((m, i) => m.material.emissive.setHex(t > tAP0 + (AI[i] - X0) / (X1 - X0) * T.ap && t < tRel ? 0x703090 : 0));
        S.ca.forEach((c, i) => { const k = clamp01(caLevels[c.j] * 1.25 - c.d * (1 - caLevels[c.j])); S.caM.setP(i, c.home.clone().lerp(c.out, ease(k))); });
        S.caM.instanceMatrix.needsUpdate = true;
        const tot = caLevels.reduce((a, b) => a + b, 0) / AI.length;
        S.mf.forEach(m => m.material.emissive.setHex(tot > 0.5 ? 0x401000 : 0));
        // 放大圖
        const qOn = tAP0 + 0.5 * T.ap, open = t > qOn && t < tRel;
        S.dhp.forEach(b => b.material.emissive.setHex(open ? 0x803050 : 0));
        S.ryr.forEach(b => { b.material.emissive.setHex(open ? 0x2040a0 : 0); b.scale.y = open ? 1.25 : 1; });
        S.qca.forEach((c, i) => {
          let p;
          if (t < qOn) p = c.home;
          else if (t < tRel) { const k = clamp01((t - qOn - c.d) / 0.9); p = k < 0.4 ? c.home.clone().lerp(c.gate, k / 0.4) : c.gate.clone().lerp(c.out, (k - 0.4) / 0.6); }
          else { const k = clamp01((t - tRel - c.d) / T.relax); p = k < 0.5 ? c.out.clone().lerp(c.back, k / 0.5) : c.back.clone().lerp(c.home, (k - 0.5) / 0.5); }
          S.qcaM.setP(i, p);
        });
        S.qcaM.instanceMatrix.needsUpdate = true;
        const st = t < tAP0 ? 0 : t < tAP0 + T.ap * 0.45 ? 1 : t < tAP1 ? 2 : t < tCon ? 3 : t < tRel ? 4 : 5;
        if (S.setStep) S.setStep(t < tEnd ? st : -1);
        if (t > tEnd + 0.3) S.t = -1;
      };
    },
    panel(box) {
      btn(box, '▶ 刺激肌纖維（一個動作電位）', () => S.t = 0);
      slider(box, '速度', 0.2, 1.5, 1, 0.1, v => S.speed = v);
      S.setStep = stepList(box, STEPS);
    }
  });
})();
