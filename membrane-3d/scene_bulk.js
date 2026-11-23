/* 場景⑤：大分子運輸—胞吞與胞吐（Ch6 Fig 6.23；Ch3 3.1） */
(function () {
  let S = null;
  const EX = -6, XX = 6, HOLE = 1.6, RC = 1.6;

  function capGeo(theta, r) { return new THREE.SphereGeometry(r, 36, 18, Math.PI / 2, Math.PI, Math.PI - Math.max(0.01, theta), Math.max(0.01, theta)); }
  // 依進度設定凹陷／小泡；dir=1 向下凹（胞吞），dir=-1 向上開口（胞吐）
  function setPit(o, th, yOff, dir) {
    o.outer.geometry.dispose(); o.outer.geometry = capGeo(th, RC);
    o.inner.geometry.dispose(); o.inner.geometry = capGeo(th, RC - 0.55);
    const rimY = dir > 0 ? 1.05 : -1.05, cy = rimY + RC * Math.cos(th);
    [o.outer, o.inner].forEach(m => { m.position.set(o.x, cy + yOff, 0); m.rotation.x = 0; });
    const rim = RC * Math.sin(Math.min(th, Math.PI / 2));
    o.ring.visible = th < Math.PI / 2; o.ring.geometry.dispose(); o.ring.geometry = new THREE.RingGeometry(Math.max(0.01, rim), HOLE, 32, 1, 0, Math.PI); o.ring.position.set(o.x, rimY, 0); o.ring.rotation.x = -Math.PI / 2;
    return { cy: cy + yOff };
  }

  SCENES.push({
    name: '⑤ 胞吞與胞吐',
    title: '大分子運輸（bulk transport）：受體媒介的胞吞與胞吐',
    camera: { pos: [0, 2, 26], target: [0, -1, -1] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([0, 2, 26], [0, -1, -1]); } },
      { label: '🔍 胞吞', fn() { flyTo([-6, 0.5, 9], [-6, -1.2, -1]); } },
      { label: '🔍 胞吐', fn() { flyTo([6, 0.5, 9], [6, -1.2, -1]); } }
    ],
    desc: `
  <p>蛋白質、激素、神經傳遞物質等大分子無法經載體通過細胞膜，需靠膜本身包裹運送（皆需消耗能量）。</p>
  <p><b>胞吐</b>（exocytosis）：細胞內的<b>分泌小泡</b>與細胞膜<b>融合</b>，把內容物釋出到細胞外；需 ATP。例：分泌蛋白質類激素、神經元釋放神經傳遞物質。</p>
  <p><b>胞吞</b>（endocytosis）：細胞膜內陷包住細胞外物質形成小泡帶入細胞。<b>受體媒介的胞吞</b>：特定分子（如攜帶<b>膽固醇</b>的 LDL）先與細胞膜上的<b>受體</b>結合，受體聚集處內陷成<b>被覆凹陷</b>，再脫離成小泡進入細胞。</p>
  <p class="hint">課本：通常是運送蛋白與細胞膜上的蛋白交互作用而觸發胞吞（例：膽固醇隨 LDL 進入細胞）。</p>`,
    build() {
      S = { t: 0, play: true };
      const bl = bilayer(26, 6, [{ x: EX, z: 0, r: HOLE }, { x: XX, z: 0, r: HOLE }].map(h => Object.assign(h, { z: 3 })), 0, 0.62, { seed: 9 });
      [bl.heads, bl.tails].forEach(m => m.position.z = -3); // 前緣切在 z=0，露出凹陷的剖面
      reg('細胞膜', '細胞膜（磷脂雙層）', 'Plasma membrane', '胞吞與胞吐時，膜可以彎曲、斷開並重新融合。', [bl.heads, bl.tails], { anchor: [-11.5, 1.2, 4.8] });
      const mk = x => ({ x, outer: new THREE.Mesh(new THREE.BufferGeometry(), mat(C_HEAD)), inner: new THREE.Mesh(new THREE.BufferGeometry(), mat(C_TAIL)), ring: new THREE.Mesh(new THREE.BufferGeometry(), mat(C_HEAD)) });
      S.en = mk(EX); S.ex = mk(XX);
      reg('胞吞', '被覆凹陷 → 小泡', 'Coated pit → vesicle', '受體聚集處的細胞膜<b>內陷</b>，最後斷開成小泡進入細胞質。', [S.en.outer, S.en.inner, S.en.ring], { anchor: [EX + 1.8, -1, 0.6] });
      reg('胞吐', '分泌小泡', 'Secretory vesicle', '由高基氏體送出、內含分泌物的小泡；與細胞膜融合後打開。', [S.ex.outer, S.ex.inner, S.ex.ring], { anchor: [XX + 1.8, -1.2, 0.6] });
      S.coat = dots(new Array(60).fill(0).map(() => V(0, -999, 0)), 0.16, 0x50c8ff);
      reg('胞吞', '網格蛋白被覆（clathrin）', 'Clathrin coat', '在細胞質側組裝於凹陷外圍的蛋白籠，幫助膜內陷；小泡形成後脫落。', S.coat, { anchor: [EX - 1.8, -2, 0.6] });
      S.ldl = dots(new Array(6).fill(0).map(() => V(0, -999, 0)), 0.42, 0xffc040); S.rec = dots(new Array(6).fill(0).map(() => V(0, -999, 0)), 0.18, 0x40e080);
      reg('胞吞', 'LDL（攜帶膽固醇）', 'LDL – cholesterol', '血中運送膽固醇的低密度脂蛋白，與細胞膜上的 LDL 受體結合後被吞入。', S.ldl, { anchor: [EX - 2.2, 3.4, 0.5] });
      reg('胞吞', 'LDL 受體', 'LDL receptor', '細胞膜上專一結合 LDL 的受體蛋白。', S.rec, { anchor: [EX + 2.2, 1.6, 0.5] });
      S.cargo = dots(new Array(24).fill(0).map(() => V(0, -999, 0)), 0.14, 0xff70d0);
      reg('胞吐', '分泌物（激素、神經傳遞物質）', 'Secreted molecules', '胞吐釋出的蛋白質類激素或神經傳遞物質。', S.cargo, { anchor: [XX + 2, 3.2, 0.5] });
      textSprite('受體媒介的胞吞', [EX, 5.5, 0], 0.7, '#ffd479', 'Receptor-mediated endocytosis'); textSprite('胞吐', [XX, 5.5, 0], 0.7, '#ffd479', 'Exocytosis');
      textSprite('細胞外液', [-11.5, 3.6, -4.5], 0.7, '#9fd8ff'); textSprite('細胞質', [-11.5, -4, -4.5], 0.7, '#ffc080');
      const rr = rnd(4), ldlA = new Array(6).fill(0).map((_, i) => V(EX + (rr() - 0.5) * 7, 5 + rr() * 2, -rr() * 4));
      const cargoD = new Array(24).fill(0).map(() => [V((rr() - 0.5) * 1.4, (rr() - 0.5) * 1.4, -rr() * 0.7).clampLength(0, 0.85), V((rr() - 0.5) * 7, 2 + rr() * 4, -rr() * 4)]);
      const dt = dtClock();
      CUR.tick = () => {
        const d = dt(); if (S.play) S.t += d; const t = S.t % 7;
        // 胞吞：0–1.2 LDL 結合；1.2–3.4 內陷；3.4–4.2 斷開；4.2–6.5 小泡下沉
        const inv = ease((t - 1.2) / 2.2), pinch = ease((t - 3.4) / 0.8), sink = ease((t - 4.2) / 2.3);
        const th = 0.02 + (Math.PI * 0.62) * inv + (Math.PI * 0.37) * pinch;
        const { cy } = setPit(S.en, th, -4.5 * sink, 1);
        for (let i = 0; i < 6; i++) {
          const a = Math.PI * (1.1 + i * 0.16), flat = V(EX + Math.cos(a) * 1.1, 1.35, Math.sin(a) * 1.1);
          const phi = Math.PI - th * 0.55, onCap = V(EX + Math.cos(a) * Math.sin(phi) * (RC - 0.75), cy + Math.cos(phi) * (RC - 0.75), Math.sin(a) * Math.sin(phi) * (RC - 0.75));
          const pos = t < 1.2 ? flat : onCap;
          S.rec.setP(i, pos);
          const l = t < 1.2 ? ldlA[i].clone().lerp(flat.clone().add(V(0, 0.45, 0)), ease(t / 1.2)) : onCap.clone().lerp(V(EX, cy, 0), 0.35);
          S.ldl.setP(i, l);
        }
        let k = 0;
        for (let j = 0; j < 60; j++) {
          const a = Math.PI * (1.02 + (j % 10) * 0.106), f = Math.floor(j / 10) / 5;
          const phi = Math.PI - th * (0.15 + 0.85 * f), r = RC + 0.2, show = t > 1.4 && t < 5.2 && phi > Math.PI - th;
          S.coat.setP(k++, show ? V(EX + Math.cos(a) * Math.sin(phi) * r, cy + Math.cos(phi) * r - (t > 4.6 ? (t - 4.6) * 1.5 : 0), Math.sin(a) * Math.sin(phi) * r) : V(0, -999, 0));
        }
        // 胞吐：0–2 小泡上升；2–3 停靠；3–4.5 融合打開；4.5–6.5 內容物擴散
        const rise = ease(t / 2), open = ease((t - 3) / 1.5);
        const th2 = Math.PI * 0.99 - (Math.PI * 0.97) * open;
        const { cy: cy2 } = setPit(S.ex, th2, t < 3 ? -4 * (1 - rise) : 0, -1);
        cargoD.forEach(([lo, out], i) => {
          const rel = ease((t - 4.0 - (i % 5) * 0.08) / 1.8);
          S.cargo.setP(i, V(XX, cy2, 0).add(lo).lerp(V(XX, 0, 0).add(out), rel));
        });
        [S.rec, S.ldl, S.coat, S.cargo].forEach(m => m.instanceMatrix.needsUpdate = true);
        if (S.setStep) S.setStep(t < 1.2 ? 0 : t < 3.4 ? 1 : t < 4.2 ? 2 : 3);
      };
    },
    panel(box) {
      checkbox(box, '播放', true, v => S.play = v);
      note(box, '<b>受體媒介的胞吞</b>');
      S.setStep = stepList(box, ['① LDL 與細胞膜上的受體結合', '② 受體聚集處內陷成<b>被覆凹陷</b>', '③ 凹陷頸部斷開形成小泡', '④ 小泡進入細胞質，被覆脫落；同時右側分泌小泡與膜融合、<b>胞吐</b>內容物']);
    }
  });
})();
