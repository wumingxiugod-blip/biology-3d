/* 場景①：L／D 對掌異構物（Ch3 3-1、Fig 2.4、2-5） */
const CHI = { gly: false, anim: null };
SCENES.push({
  name: '① L/D 對掌性',
  title: '胺基酸的立體異構：L 型與 D 型',
  camera: { pos: [0, 1.2, 15], target: [0, 0, 0] },
  controls: [
    { label: '▶ 疊合測試：把 D 型移到 L 型上', fn() { CHI.qA = null; CHI.anim = { t0: performance.now() }; } },
    { label: '👁 從 H 對側看 L 型（S 構型）', fn() { flyTo([-3.2 - 0.816 * 12, 0.6, -0.577 * 12], [-3.2, 0, 0]); } },
    { label: '👁 Fischer 投影正面（胺基在左＝L）', fn() { flyTo([0, 0.5, 15], [0, 0, 0]); } },
    { label: '🔁 切換：丙胺酸 Ala ⇄ 甘胺酸 Gly', fn() { CHI.gly = !CHI.gly; CHI.anim = null; CHI.qA = null; reloadKeep(); } }
  ],
  desc: `
  <p><b>α-胺基酸</b>：中央的 <b>α 碳</b>同時接上 <b>胺基</b>、<b>羧基</b>、<b>H</b> 與<b>側鏈 R</b>。四個基團不同時 α 碳為<b>對掌中心</b>（chiral），有兩種互為<b>鏡像</b>、無法重疊的立體異構物：<b>L 型</b>與 <b>D 型</b>。</p>
  <ul>
  <li><b>蛋白質中只有 L 型胺基酸</b>（Fig 2-5）。</li>
  <li>由 H 的對側觀看，依優先序 <b>NH₃⁺ → COO⁻ → R</b> 的箭頭為<b>逆時針</b> → <b>S 構型</b>（L 型）。</li>
  <li>Fischer 投影：COO⁻ 在上、R 在下時，<b>胺基在左＝L</b>。</li>
  <li><b>甘胺酸</b>的 α 碳接兩個 H → <b>非對掌性</b>（achiral），L、D 可完全重疊。</li>
  <li>中性 pH 下胺基酸以<b>兩性離子</b>（zwitterion，–NH₃⁺／–COO⁻）存在，總電荷為 0。</li>
  </ul>
  <p class="hint">左：L 型｜中間：鏡面｜右：D 型。範例側鏈為丙胺酸的 –CH₃。</p>`,
  panel(box) { CHI.msg = note(box, '按「疊合測試」：D 型平移到 L 型上，再繞 C–H 軸轉三次，看能否重疊。'); },
  build() {
    const k = Math.SQRT1_2, n = v => V(...v).normalize();
    // Fischer 方位：COO⁻ 上後、R 下後、NH₃⁺ 左前、H 右前（此即 L 型）
    const dirL = { COO: n([0, 1, -k]), R: n([0, -1, -k]), N: n([-1, 0, k]), H: n([1, 0, k]) };
    const len = { COO: 1.53, R: 1.53, N: 1.47, H: 1.09 };
    const mats = {
      CA: smat(0x6e6e6e), N: smat(EL.N[0]), O: smat(EL.O[0]), C: smat(EL.C[0]), H: smat(EL.H[0]),
      R: smat(0xb070e0), bd: smat(0xcfcfcf), mir: smat(0x88c8ff, 0.16), arL: smat(0x3ad07a), arD: smat(0xff9a3a)
    };
    const all = { L: {}, D: {} };
    function molecule(side) {
      const sx = side === 'L' ? 1 : -1, X = side === 'L' ? -3.2 : 3.2, G = side === 'L' ? 'L 型（左）' : 'D 型（右，鏡像）';
      const c = V(X, 0, 0), d = {};
      Object.keys(dirL).forEach(key => { d[key] = dirL[key].clone(); d[key].x *= sx; });
      const P = key => c.clone().addScaledVector(d[key], len[key]);
      const grp = new THREE.Group(); grp.position.copy(c); CUR.root.add(grp);
      const loc = p => p.clone().sub(c);
      const sub = (key, list) => {               // 取代基上的末端原子（3 個 H 或 2 個 O）
        const base = P(key), out = [], ax = d[key];
        const t = Math.abs(ax.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0), e1 = t.clone().cross(ax).normalize(), e2 = ax.clone().cross(e1);
        list.forEach((el, i) => {
          const a = i * 2 * Math.PI / list.length + 0.6;
          const q = base.clone().addScaledVector(ax, el === 'O' ? 0.45 : 0.36).addScaledVector(e1, Math.cos(a) * (el === 'O' ? 1.08 : 0.97)).addScaledVector(e2, Math.sin(a) * (el === 'O' ? 1.08 : 0.97));
          out.push(atomM(loc(q), el, mats[el]), stickM(loc(base), loc(q), 0.12, mats.bd));
        });
        return out;
      };
      const cen = [atomM(V(0, 0, 0), 'C', mats.CA, 1.3)];
      const parts = [];
      parts.push(reg(G, 'α 碳（對掌中心）', 'α-carbon (chiral center)', '接上四個<b>不同</b>基團的碳原子即為<b>對掌中心</b>；α 碳的四個鍵呈<b>正四面體</b>排列。', cen, { anchor: c.toArray() }));
      parts.push(reg(G, '胺基 –NH₃⁺', 'Amino group (protonated)', '中性 pH 下胺基帶一個質子而呈 <b>–NH₃⁺</b>。優先序第 1。', [atomM(loc(P('N')), 'N', mats.N), stickM(V(0, 0, 0), loc(P('N')), 0.14, mats.bd), ...sub('N', ['H', 'H', 'H'])], { anchor: P('N').toArray() }));
      parts.push(reg(G, '羧基 –COO⁻', 'Carboxylate group', '中性 pH 下羧基失去質子而呈 <b>–COO⁻</b>。與 –NH₃⁺ 合稱<b>兩性離子</b>（總電荷 0）。優先序第 2。', [atomM(loc(P('COO')), 'C', mats.C), stickM(V(0, 0, 0), loc(P('COO')), 0.14, mats.bd), ...sub('COO', ['O', 'O'])], { anchor: P('COO').toArray() }));
      if (CHI.gly) parts.push(reg(G, '第二個 H（甘胺酸）', 'Hydrogen (Gly side chain)', '<b>甘胺酸</b>的側鏈就是 H：α 碳接<b>兩個氫原子</b> → <b>非對掌性</b>，鏡像可完全重疊。', [atomM(loc(P('R')), 'H', mats.H, 1.3), stickM(V(0, 0, 0), loc(P('R')), 0.12, mats.bd)], { anchor: P('R').toArray() }));
      else parts.push(reg(G, '側鏈 R（–CH₃，丙胺酸）', 'Side chain R (Ala: –CH₃)', '側鏈決定胺基酸的種類。以<b>丙胺酸</b>為例：R = –CH₃。優先序第 3。', [atomM(loc(P('R')), 'R', mats.R, 0.9), stickM(V(0, 0, 0), loc(P('R')), 0.14, mats.bd), ...sub('R', ['H', 'H', 'H'])], { anchor: P('R').toArray() }));
      parts.push(reg(G, 'α-H', 'α-hydrogen', '優先序最低的基團。判斷 R/S 時要<b>從 H 的對側</b>觀看。', [atomM(loc(P('H')), 'H', mats.H, 1.3), stickM(V(0, 0, 0), loc(P('H')), 0.12, mats.bd)], { anchor: P('H').toArray() }));
      // 優先序箭頭：NH₃⁺ → COO⁻ → R，繞 H 軸
      if (!CHI.gly) {
        const h = d.H, e1 = d.N.clone().addScaledVector(h, -d.N.dot(h)).normalize(), e2 = h.clone().cross(e1);
        const ang = v => Math.atan2(v.dot(e2), v.dot(e1));
        let aC = ang(d.COO); const s = Math.sign(aC) || 1;
        const pts = [], rr = 1.75, off = h.clone().multiplyScalar(-0.75);
        for (let i = 0; i <= 40; i++) { const a = s * i / 40 * (240 * DEG); pts.push(off.clone().addScaledVector(e1, Math.cos(a) * rr).addScaledVector(e2, Math.sin(a) * rr)); }
        const m = side === 'L' ? mats.arL : mats.arD;
        const tb = tube(pts, 0.07, 0); tb.material = m;
        const tip = pts[40], dir = pts[40].clone().sub(pts[38]).normalize();
        const cn = cone(tip.toArray(), tip.clone().addScaledVector(dir, 0.5).toArray(), 0.2, 0); cn.material = m;
        parts.push(reg(G, side === 'L' ? '優先序箭頭：逆時針＝S' : '優先序箭頭：順時針＝R', side === 'L' ? 'Counterclockwise → S (L)' : 'Clockwise → R (D)',
          side === 'L' ? '從 H 的對側看，NH₃⁺ → COO⁻ → R 為<b>逆時針</b> → <b>S 構型</b>，即 <b>L 型</b>。蛋白質只含 L 型胺基酸。（半胱胺酸因含 S 為例外的 R 構型，但仍屬 L 型。）' : '鏡像的 D 型：同樣從 H 對側看，箭頭變成<b>順時針</b> → R 構型。',
          [tb, cn], { anchor: c.clone().add(pts[20]).toArray() }));
      }
      parts.forEach(p => p.meshes.forEach(m => grp.add(m)));
      all[side].d = d;
      all[side] = Object.assign(all[side] || {}, { grp, parts, c });
    }
    molecule('L'); molecule('D');
    textSprite(CHI.gly ? 'Gly（甘胺酸）' : 'L-Ala', [-3.2, 3.1, 0], 0.7, '#7dffb0', CHI.gly ? '非對掌性 achiral' : 'S 構型・蛋白質使用');
    textSprite(CHI.gly ? 'Gly（鏡像）' : 'D-Ala', [3.2, 3.1, 0], 0.7, '#ffb070', CHI.gly ? '與左邊完全相同' : 'R 構型');
    reg('鏡面', '鏡面', 'Mirror plane', 'L 型與 D 型互為<b>鏡像</b>（對掌性，像左右手）。鏡像的兩個分子無論怎麼旋轉都<b>無法重疊</b>（甘胺酸除外）。',
      box([0, 0, 0], [0.05, 6, 6], 0), { anchor: [0, 2.6, 2.6] }).meshes[0].material = mats.mir;
    const D = all.D;
    CUR.tick = () => {
      // 讓 D 型標籤跟著移動
      D.parts.forEach(p => { if (!p._a0) p._a0 = p.anchor.clone().sub(D.c); p.anchor.copy(p._a0).applyQuaternion(D.grp.quaternion).add(D.grp.position); });
      if (!CHI.anim) return;
      const t = (performance.now() - CHI.anim.t0) / 1000;
      // 對齊：Ala 繞 z 轉 180°（使 NH₃⁺、H 對齊）；Gly 繞 COO⁻ 軸轉 ±120°
      if (!CHI.qA) {
        if (!CHI.gly) CHI.qA = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), Math.PI);
        else {
          const ax = D.d.COO, tgt = all.L.d.N;
          CHI.qA = [1, -1].map(s => new THREE.Quaternion().setFromAxisAngle(ax, s * 120 * DEG))
            .sort((a, b) => D.d.N.clone().applyQuaternion(b).distanceTo(tgt) - D.d.N.clone().applyQuaternion(a).distanceTo(tgt)).pop();
        }
      }
      const I = new THREE.Quaternion(), hAx = all.L.d.H;
      if (t < 1.8) {
        const k = t / 1.8, e = k * k * (3 - 2 * k);
        D.grp.position.set(3.2 - 6.4 * e, 0, 0); D.grp.quaternion.copy(I).slerp(CHI.qA, e);
        CHI.msg.innerHTML = '平移並轉動 D 型，先讓 NH₃⁺ 與 H 和 L 型對齊…';
      } else if (t < 6.3 && !CHI.gly) {
        const step = Math.min(3, Math.floor((t - 1.8) / 1.5)), f = Math.min(1, ((t - 1.8) % 1.5) / 1.0);
        const a = (step + (step < 3 ? f : 0)) * 120 * DEG;
        D.grp.position.set(-3.2, 0, 0); D.grp.quaternion.setFromAxisAngle(hAx, a).multiply(CHI.qA);
        CHI.msg.innerHTML = step === 0 && f < 1 ? 'NH₃⁺ 與 H 對齊了，但 <b>COO⁻ 和 R 位置對調</b>。再繞 C–H 軸轉轉看…' :
          '繞 C–H 軸旋轉 ' + Math.round(a / DEG) + '°：永遠有兩個基團對不上 → <span class="warn">L 與 D 無法重疊</span>（互為鏡像）';
      } else if (t < 6.3) {
        D.grp.position.set(-3.2, 0, 0); D.grp.quaternion.copy(CHI.qA);
        CHI.msg.innerHTML = '甘胺酸：<b>完全重疊</b>！α 碳接兩個 H，不是對掌中心（achiral）。';
      } else if (t < 8) {
        const k = (t - 6.3) / 1.7, e = k * k * (3 - 2 * k);
        D.grp.position.set(-3.2 + 6.4 * e, 0, 0); D.grp.quaternion.copy(D.grp.quaternion).slerp(I, e);
      } else { CHI.anim = null; D.grp.position.set(3.2, 0, 0); D.grp.quaternion.identity(); CHI.msg.innerHTML += '<br>（已回到原位）'; }
    };
  }
});
