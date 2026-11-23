/* 場景④：β 摺板（反平行／平行）與 β 轉角（Ch4 Fig 2-30～2-37） */
// 將一條 β 股轉到標準座標：股軸＝+y、片層內垂直方向＝+x、側鏈上下＝±z
function strandFrame(res) {
  const ax = chainAxis(res), u = ax.u, w = new THREE.Vector3();
  res.forEach((r, i) => w.addScaledVector(r.O.clone().sub(r.C), i % 2 ? -1 : 1));
  w.addScaledVector(u, -w.dot(u)).normalize();
  const nrm = u.clone().cross(w);
  const m = new THREE.Matrix4().makeBasis(w, u, nrm).transpose().multiply(new THREE.Matrix4().makeTranslation(-ax.c.x, -ax.c.y, -ax.c.z));
  return xformRes(res, m);
}
const cloneRes = res => res.map(r => { const o = Object.assign({}, r); ['N', 'CA', 'C', 'O', 'H', 'CB', 'Rdir'].forEach(k => r[k] && (o[k] = r[k].clone())); return o; });
// 在 x、y 方向搜尋位移，使 prev 與 cand 之間的主鏈氫鍵最好
function dock(prev, cand, xr) {
  let best = null;
  for (let dx = xr[0]; dx <= xr[1]; dx += 0.05) for (let dy = -3.6; dy <= 3.6; dy += 0.05) {
    const t = V(dx, dy, 0);
    let sc = 0, cnt = 0;
    prev.forEach(a => cand.forEach(b => {
      if (b.H) { const d = a.O.distanceTo(b.H.clone().add(t)); if (d < 2.6) { sc += 2.6 - Math.abs(d - 1.95); cnt++; } }
      if (a.H) { const d = a.H.distanceTo(b.O.clone().add(t)); if (d < 2.6) { sc += 2.6 - Math.abs(d - 1.95); cnt++; } }
      const dd = a.CA.distanceTo(b.CA.clone().add(t)); if (dd < 3.9) sc -= 5;
    }));
    if (!best || sc > best.sc) best = { sc, t, cnt };
  }
  return xformRes(cand, new THREE.Matrix4().makeTranslation(best.t.x, best.t.y, 0));
}
function buildSheet(kind, X0) {
  const n = 7, ang = kind === 'anti' ? [-139, 135] : [-119, 113];
  const base = strandFrame(backbone(Array.from({ length: n }, () => ang)));
  const flip = new THREE.Matrix4().makeRotationZ(Math.PI);
  const s = [cloneRes(base)];
  for (let k = 1; k < 3; k++) {
    let c = cloneRes(base);
    if (kind === 'anti' && k % 2) xformRes(c, flip);
    xformRes(c, new THREE.Matrix4().makeTranslation(s[k - 1][0].CA.x - base[0].CA.x, 0, 0));
    s.push(dock(s[k - 1], c, [4.2, 5.8]));
  }
  // 整體置中於 X0
  const cx = (s[0][3].CA.x + s[2][3].CA.x) / 2, cy = s[1][3].CA.y;
  s.forEach(st => xformRes(st, new THREE.Matrix4().makeTranslation(X0 - cx, -cy, 0)));
  return s;
}
SCENES.push({
  name: '④ β 摺板',
  title: '二級結構：β 摺板（β-pleated sheet）',
  camera: { pos: [0, -16, 44], target: [0, 0, 0] },
  controls: [
    { label: '👁 正面', fn() { flyTo([0, -16, 44], [0, 0, 0]); } },
    { label: '👁 側看摺痕（pleat）', fn() { flyTo([62, 2, 8], [0, 0, 0]); } },
    { label: '🔍 反平行', fn() { flyTo([-12, -8, 26], [-12, 0, 0]); } },
    { label: '🔍 平行', fn() { flyTo([12, -8, 26], [12, 0, 0]); } },
    { label: '🎀 顯示／隱藏 卡通箭頭', fn() { CUR.parts.filter(p => p.zh.startsWith('卡通箭頭')).forEach(p => p.visible = !p.visible); rebuildList(); refresh(); } }
  ],
  desc: `
  <p><b>β 摺板</b>由<b>不同多肽股（strand）之間</b>的氫鍵穩定。</p>
  <ul>
  <li>β 股<b>幾乎完全伸展</b>：相鄰胺基酸相距 <b>3.5 Å</b>（α 螺旋只有 1.5 Å）。</li>
  <li>相鄰殘基的側鏈<b>方向相反</b>（一上一下），主鏈形成摺扇般的<b>摺痕</b>。</li>
  <li><b>反平行</b>（Fig 2-31）：相鄰兩股方向相反（N→C 對 C→N），氫鍵較直。</li>
  <li><b>平行</b>（Fig 2-32）：各股方向相同，氫鍵較斜。</li>
  <li>兩種可混合成<b>混合 β 摺板</b>（Fig 2-33）；摺板通常略為<b>扭轉</b>（Fig 2-34）。</li>
  <li><b>反轉角／髮夾</b>（Fig 2-36）：多肽鏈靠<b>β 轉角</b>與<b>環</b>改變方向；轉角與環位於蛋白質<b>表面</b>，常參與與其他分子的交互作用。</li>
  </ul>`,
  build() {
    const groups = [['anti', -12, '反平行 β 摺板'], ['par', 12, '平行 β 摺板']];
    groups.forEach(([kind, X0, G]) => {
      const S = buildSheet(kind, X0);
      const all = [].concat(...S);
      const pr = drawBackbone(all, { G, R: 'CB', tag: kind === 'anti' ? '' : ' ', Rinfo: '相鄰殘基的側鏈<b>交替指向片層的上方與下方</b>（opposite directions）。' });
      // drawBackbone 會把相鄰兩股間也連上肽鍵 → 移除跨股的那幾根
      pr.P.meshes.forEach((m, i) => { if ((i + 1) % 7 === 0) { CUR.root.remove(m); m.userData.skip = true; } });
      pr.P.meshes = pr.P.meshes.filter(m => !m.userData.skip);
      const hb = [];
      for (let k = 0; k < 2; k++) hb.push(...findHB(S[k], S[k + 1], 2.6, false), ...findHB(S[k + 1], S[k], 2.6, false));
      drawHB(hb, G, kind === 'anti' ? '股間氫鍵（反平行）' : '股間氫鍵（平行）', 'Inter-strand H-bonds',
        (kind === 'anti' ? '反平行：氫鍵近乎<b>垂直於股</b>、成對出現（窄對與寬對交替）。' : '平行：氫鍵<b>斜向</b>連接，每個殘基分別與鄰股的前後兩個殘基作用。') + '<br>氫鍵位於<b>不同股之間</b>（α 螺旋則是同一股之內）。共 ' + hb.length + ' 條。');
      // 摺板面
      const sheets = [];
      for (let k = 0; k < 2; k++) {
        const A = S[k].map(r => r.CA), B = A.map(p => S[k + 1].reduce((b, r) => r.CA.distanceTo(p) < b.distanceTo(p) ? r.CA : b, S[k + 1][0].CA));
        sheets.push(ribbon(A, B, 0x5fd6ff, 0.18, 4));
      }
      reg(G, kind === 'anti' ? '摺板面' : '摺板面 ', 'Pleated surface', 'Cα 依序上下起伏，使片層像<b>摺扇</b>一樣有摺痕（pleat）。從側面看最明顯。', sheets, { anchor: S[0][1].CA.clone().lerp(S[1][1].CA, 0.5).toArray() });
      // 方向
      S.forEach((st, k) => {
        const a = st[0].CA, b = st[st.length - 1].CA, up = b.y > a.y;
        textSprite('N', a.clone().add(V(0, up ? -1.6 : 1.6, 0)).toArray(), 0.7, '#8fd0ff');
        textSprite('C', b.clone().add(V(0, up ? 1.6 : -1.6, 0)).toArray(), 0.7, '#ffb070');
      });
      const ar = S.map(st => arrowM(st[0].CA.clone().add(V(0, 0, 0.1)), st[st.length - 1].CA.clone().add(V(0, 0, 0.1)), V(0, 0, 1), kind === 'anti' ? 0xffd040 : 0x60e0a0, 1.4, 0.75));
      reg(G, kind === 'anti' ? '卡通箭頭（反平行）' : '卡通箭頭（平行）', 'Cartoon arrows (N → C)', '教科書以<b>寬箭頭</b>表示 β 股，箭頭指向 <b>C 端</b>。', ar, { hidden: true });
      textSprite(kind === 'anti' ? '反平行 antiparallel' : '平行 parallel', [X0, 15.5, 0], 1.4, '#ffd479', kind === 'anti' ? '↑↓↑' : '↑↑↑');
      if (kind === 'anti') {
        // 髮夾轉角
        const t1 = loopPts(S[0][6].CA, S[1][0].CA, V(-0.3, 2.6, 0.8), 8), t2 = loopPts(S[1][6].CA, S[2][0].CA, V(0.3, -2.6, 0.8), 8);
        reg(G, 'β 轉角（髮夾）', 'β-turn / hairpin', '多肽鏈以<b>反轉角</b>（reverse turn）回頭，形成反平行的相鄰股。典型 β 轉角由 4 個殘基組成：第 1 個的 C=O 與第 4 個的 N–H 形成氫鍵。第 3 個殘基的側鏈需轉 180°，<b>只有甘胺酸放得下</b>。轉角位於蛋白質<b>表面</b>。',
          [ttube(t1, 0.35, 0xff70a0), ttube(t2, 0.35, 0xff70a0)], { anchor: t1[4].toArray() });
        // 3.5 Å 標尺
        const p = S[0][2].CA, q = S[0][3].CA, off = V(-3.6, 0, 0);
        reg(G, '相鄰殘基距離 3.5 Å', 'Rise per residue 3.5 Å', 'β 股幾乎<b>完全伸展</b>：相鄰胺基酸沿股軸相距約 <b>3.5 Å</b>。',
          [cyl(V(p.x, p.y, 0).add(off).toArray(), V(p.x, q.y, 0).add(off).toArray(), 0.07, 0xffd479), cyl(p.toArray(), V(p.x, p.y, 0).add(off).toArray(), 0.03, 0xffd479), cyl(q.toArray(), V(p.x, q.y, 0).add(off).toArray(), 0.03, 0xffd479)],
          { anchor: V(p.x, (p.y + q.y) / 2, 0).add(off).toArray() });
      }
    });
  }
});
