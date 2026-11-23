/* 場景⑥：細胞訊息傳遞—受體、G 蛋白與第二傳訊者 cAMP（Ch6 6.5、Fig 6.30、6.31） */
(function () {
  let S = null;
  const RX = -6, AX = 2.5, SX = 9.5;
  const STEPS = [
    '① 極性訊息分子（如腎上腺素）與細胞膜上的<b>受體</b>結合（訊息分子本身不進入細胞）',
    '② α 次單元釋出 <b>GDP</b>、結合 <b>GTP</b>，與 βγ 分離',
    '③ α 次單元在膜上移動，與<b>效應蛋白</b>（腺苷酸環化酶）結合並活化之',
    '④ 酵素把 <b>ATP 轉成 cAMP</b>（第二傳訊者），cAMP 濃度上升',
    '⑤ cAMP 活化原本不活化的酵素（蛋白激酶），改變細胞活性',
    '⑥ α 把 GTP 水解成 GDP + Pi，回到 βγ 重組，訊號關閉'
  ];

  SCENES.push({
    name: '⑥ 訊息傳遞',
    title: '細胞訊息傳遞：G 蛋白與第二傳訊者 cAMP',
    camera: { pos: [2, 4, 31], target: [1.5, -1.8, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([2, 4, 31], [1.5, -1.8, 0]); } },
      { label: '🔍 受體與 G 蛋白', fn() { flyTo([-5, 1, 10], [-4.5, -1, 0]); } },
      { label: '🔍 腺苷酸環化酶', fn() { flyTo([3, -1, 10], [2.5, -2, 0]); } },
      { label: '🔍 類固醇激素', fn() { flyTo([10, 0, 11], [9.5, -2.5, 0]); } }
    ],
    desc: `
  <p>細胞以化學訊號溝通：</p>
  <table>
  <tr><td><b>隙型連結</b></td><td>相鄰細胞之間的通道，離子與調節分子直接通過</td></tr>
  <tr><td><b>旁分泌</b></td><td>器官內細胞分泌分子、經細胞外液擴散到鄰近細胞（局部傳訊）</td></tr>
  <tr><td><b>突觸傳訊</b></td><td>神經元在突觸釋放神經傳遞物質到標的細胞</td></tr>
  <tr><td><b>內分泌</b></td><td>腺體分泌激素入血，可到達多處標的細胞</td></tr>
  </table>
  <p>標的細胞因具有專一的<b>受體蛋白</b>而能接收訊號：<b>非極性</b>分子（如類固醇激素）穿過細胞膜，與細胞內受體結合，於細胞核中影響基因表現；<b>極性或大型</b>分子則與細胞膜表面的受體結合，再由<b>第二傳訊者</b>把訊息帶入細胞。</p>
  <p><b>G 蛋白</b>由 α、β、γ 三個次單元組成，在受體與效應蛋白（酵素或離子通道）之間<b>穿梭</b>傳遞訊息。人體約有 400–500 種 G 蛋白偶聯受體（另有數百種負責嗅覺與味覺）。</p>`,
    build() {
      S = { t: 0, play: true };
      const bl = bilayer(24, 10, [{ x: RX, z: 0, r: 1.7 }, { x: AX, z: 0, r: 2.1 }], 0, 0.62, { seed: 12 });
      reg('細胞膜', '細胞膜', 'Plasma membrane', '', [bl.heads, bl.tails], { anchor: [-11.5, 1.2, 4.8] });
      S.rec = helixBundle([RX, 0, 0], 7, 0.95, 0x4a8cff, 3.2, 0.36);
      reg('膜蛋白', 'G 蛋白偶聯受體', 'G-protein-coupled receptor', '穿膜七次的受體蛋白；訊息分子在細胞外與它結合後改變構形，活化細胞內側的 G 蛋白。', S.rec, { anchor: [RX - 1.4, 1.8, 0.8] });
      S.ac = [helixBundle([AX, 0, 0], 10, 1.35, 0xd070ff, 3.2, 0.32), ell([AX - 0.7, -2.4, 0], [0.9, 0.7, 0.9], 0xd070ff), ell([AX + 0.8, -2.4, 0], [0.9, 0.7, 0.9], 0xb050e0)];
      reg('膜蛋白', '腺苷酸環化酶（效應蛋白）', 'Adenylate cyclase', '膜上的酵素：被 G 蛋白 α 次單元活化後，把 ATP 轉成<b>環腺苷酸 cAMP</b>。', S.ac, { anchor: [AX + 2, -2.4, 0.6] });
      S.lig = dots([V(0, -999, 0)], 0.42, 0xff4060, 12); S.lig.material.emissive.setHex(0x400010);
      reg('訊息分子', '激素（極性訊息分子）', 'Polar regulatory molecule', '如腎上腺素：不能穿過細胞膜，結合在膜表面受體上；其效應實際上由細胞內的 cAMP 產生。', S.lig, { anchor: [RX + 1.2, 3.4, 0] });
      S.a = ell([0, 0, 0], [0.75, 0.6, 0.6], 0xffd23f); S.b = ell([0, 0, 0], [0.7, 0.55, 0.55], 0x40c0a0); S.g = ell([0, 0, 0], [0.4, 0.35, 0.35], 0x60e0ff);
      S.pa = reg('G 蛋白', 'G 蛋白 α 次單元', 'G-protein α subunit', '結合 GDP 時與 βγ 在一起（不活化）；換成 GTP 後與 βγ 分離，去活化效應蛋白；把 GTP 水解成 GDP 後回到 βγ。', S.a, { anchor: [0, 0, 0] });
      S.pbg = reg('G 蛋白', 'G 蛋白 β、γ 次單元', 'G-protein βγ subunits', 'β 與 γ 始終連在一起，錨定在膜內側。', [S.b, S.g], { anchor: [0, 0, 0] });
      S.gtp = textSprite('GDP', [0, -99, 0], 0.45, '#ffe060');
      S.atp = particles(10, 0.2, 0x50e060); S.camp = particles(16, 0.2, 0xb060ff, 0x300060); CUR.root.add(S.atp);
      reg('第二傳訊者', 'cAMP', 'Cyclic AMP', '由 ATP 產生的<b>第二傳訊者</b>，在細胞質中擴散並活化蛋白激酶。', S.camp, { anchor: [AX, -4.6, 1] });
      S.pk = [ell([AX - 0.6, -6.2, 0], [0.7, 0.55, 0.55], 0x8a6a5a), ell([AX + 0.6, -6.2, 0], [0.7, 0.55, 0.55], 0xff8a50)];
      reg('第二傳訊者', '蛋白激酶（被 cAMP 活化）', 'Protein kinase', '原本不活化的酵素；cAMP 結合其調節次單元後，催化次單元被釋放而活化，進而磷酸化其他蛋白、改變細胞活性。', S.pk, { anchor: [AX + 1.4, -6.2, 0.4] });
      // 類固醇路徑
      const nuc = new THREE.Mesh(new THREE.SphereGeometry(2.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x5060c8, 0.35)); nuc.position.set(SX, -7.2, 0);
      reg('類固醇激素', '細胞核', 'Nucleus', '激素-受體複合物進入核內，結合 DNA，刺激特定 mRNA 合成 → 影響基因表現。', nuc, { anchor: [SX + 2, -5.4, 0.5] });
      S.st = dots([V(0, -999, 0)], 0.32, 0xffa040, 12); S.sr = ell([SX - 0.6, -3.4, 0], [0.55, 0.4, 0.4], 0x30c0a0);
      reg('類固醇激素', '類固醇激素（非極性）', 'Steroid hormone', '脂溶性，可直接穿過細胞膜。', S.st, { anchor: [SX + 1, 3.2, 0] });
      reg('類固醇激素', '細胞內受體', 'Intracellular receptor', '位於細胞質或核內的受體蛋白。', S.sr, { anchor: [SX - 1.5, -3.2, 0.4] });
      textSprite('細胞外液', [-11.5, 3.6, -4.5], 0.7, '#9fd8ff'); textSprite('細胞質', [-11.5, -4, -4.5], 0.7, '#ffc080');
      const rr = rnd(8), campD = new Array(16).fill(0).map(() => V(AX + (rr() - 0.5) * 5, -3.2 - rr() * 3, (rr() - 0.5) * 4));
      const dt = dtClock();
      CUR.tick = () => {
        const d = dt(); if (S.play) S.t += d; const t = S.t % 8.5;
        const st = t < 1 ? 0 : t < 1.8 ? 1 : t < 3 ? 2 : t < 5 ? 3 : t < 6.6 ? 4 : 5;
        // 訊息分子
        const bound = V(RX, 1.85, 0), lp = t < 1 ? V(RX - 3, 5, 1).lerp(bound, ease(t)) : t < 7.2 ? bound : bound.clone().lerp(V(RX + 3, 5.5, -1), ease((t - 7.2) / 1.2));
        S.lig.setP(0, lp); S.lig.instanceMatrix.needsUpdate = true;
        S.rec.material.emissive.setHex(t > 0.9 && t < 7.2 ? 0x102050 : 0);
        // G 蛋白
        const dock = V(RX + 0.6, -2.1, 0), atAC = V(AX - 1.9, -1.9, 0);
        let ap = dock; if (t >= 1.8 && t < 3) ap = dock.clone().lerp(atAC, ease((t - 1.8) / 1.2)); else if (t >= 3 && t < 6.6) ap = atAC; else if (t >= 6.6 && t < 8) ap = atAC.clone().lerp(dock, ease((t - 6.6) / 1.4));
        S.a.position.copy(ap); S.b.position.set(RX - 0.6, -2.1, 0.2); S.g.position.set(RX - 0.9, -1.6, 0.6);
        S.pa.anchor.copy(ap).add(V(0, -0.6, 0.6)); S.pbg.anchor.set(RX - 1.2, -2.6, 0.6);
        const isGTP = t >= 1.3 && t < 6.6;
        S.a.material.emissive.setHex(isGTP ? 0x604000 : 0);
        S.gtp.position.copy(ap).add(V(0, 0.9, 0.5));
        if (S._g !== isGTP) { S._g = isGTP; const p = S.gtp.position.clone(); CUR.root.remove(S.gtp); S.gtp = textSprite(isGTP ? 'GTP' : 'GDP', p.toArray(), 0.45, isGTP ? '#7dff8a' : '#ffe060'); }
        // 腺苷酸環化酶與 cAMP
        const act = t >= 3 && t < 6.6; S.ac.forEach(m => m.material.emissive.setHex(act ? 0x401060 : 0));
        for (let i = 0; i < 10; i++) { const k = ((t - 3) / 1.0 + i / 10) % 1; S.atp.setP(i, act && t < 5.6 ? V(AX + (i - 5) * 0.5, -6, (i % 3 - 1)).lerp(V(AX, -2.4, 0), k) : V(0, -999, 0)); }
        campD.forEach((p, i) => { const k = clamp01((t - 3.2 - i * 0.12) / 1.0); S.camp.setP(i, t > 3.2 + i * 0.12 && t < 7.6 ? V(AX, -2.6, 0).lerp(p, ease(k)) : V(0, -999, 0)); });
        S.atp.instanceMatrix.needsUpdate = true; S.camp.instanceMatrix.needsUpdate = true;
        const kin = t >= 5 && t < 7.6; S.pk[1].position.set(AX + 0.6 + (kin ? 1.2 : 0), -6.2 - (kin ? 0.5 : 0), 0); S.pk[1].material.emissive.setHex(kin ? 0x603000 : 0);
        // 類固醇
        const sp = [V(SX + 1.5, 5, 0), V(SX, 1.4, 0), V(SX - 0.3, -1.4, 0), V(SX - 0.6, -3.0, 0)], k2 = (S.t % 8.5) / 8.5;
        const sPos = k2 < 0.5 ? alongPath(sp, k2 / 0.5) : V(SX - 0.6, -3.0, 0).lerp(V(SX, -5.2, 0), ease((k2 - 0.5) / 0.3));
        S.st.setP(0, sPos); S.st.instanceMatrix.needsUpdate = true; S.sr.position.copy(k2 < 0.5 ? V(SX - 0.6, -3.4, 0) : sPos.clone().add(V(0, -0.45, 0)));
        if (S.setStep && S.shown !== st) { S.shown = st; S.setStep(st); }
      };
    },
    panel(box) {
      checkbox(box, '播放', true, v => S.play = v);
      S.setStep = stepList(box, STEPS); S.shown = -1;
      note(box, '綠＝ATP　紫＝cAMP　右側：類固醇激素直接進入細胞');
    }
  });
})();
