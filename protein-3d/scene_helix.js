/* 場景③：α 螺旋（Ch4 4-3、Fig 2-25） */
const HLX = { pro: false };
// 將一段主鏈旋轉成「軸＝+y、中心＝原點」
function alignHelix(res) {
  const n = res.length, ax = new THREE.Vector3(), c = new THREE.Vector3();
  const b = [];
  for (let i = 1; i < n - 1; i++) b.push(res[i - 1].CA.clone().sub(res[i].CA).add(res[i + 1].CA.clone().sub(res[i].CA)));
  for (let i = 0; i < b.length - 1; i++) ax.add(b[i].clone().cross(b[i + 1]).normalize());
  ax.normalize();
  if (ax.dot(res[n - 1].CA.clone().sub(res[0].CA)) < 0) ax.negate();
  res.forEach(r => c.add(r.CA)); c.multiplyScalar(1 / n);
  const q = new THREE.Quaternion().setFromUnitVectors(ax, V(0, 1, 0));
  const m4 = new THREE.Matrix4().makeRotationFromQuaternion(q).multiply(new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z));
  return xformRes(res, m4);
}
SCENES.push({
  name: '③ α 螺旋',
  title: '二級結構：α 螺旋（α-helix）',
  camera: { pos: [0, 2, 42], target: [0, 0, 0] },
  controls: [
    { label: '👁 側視', fn() { HLX.ends.forEach(t => t.visible = true); flyTo([0, 2, 42], [0, 0, 0]); } },
    { label: '👁 沿軸俯視（看 3.6 殘基／圈）', fn() { HLX.ends.forEach(t => t.visible = false); flyTo([0, 36, 0.01], [0, 0, 0]); } },
    { label: '🎀 顯示／隱藏 卡通螺旋', fn() { togglePart('卡通螺旋（緞帶）'); } },
    { label: '🔁 第 8 個殘基換成脯胺酸 Pro', fn() { HLX.pro = !HLX.pro; reloadKeep(); } }
  ],
  desc: `
  <p><b>α 螺旋</b>是由<b>鏈內氫鍵</b>穩定的棒狀捲曲結構。</p>
  <table>
  <tr><td>旋向</td><td><b>右手螺旋</b>（順時針）</td></tr>
  <tr><td>每圈</td><td><b>3.6</b> 個胺基酸</td></tr>
  <tr><td>螺距</td><td><b>5.4 Å</b>（每殘基上升 1.5 Å）</td></tr>
  <tr><td>氫鍵</td><td>第 i 個殘基的 <b>C=O</b> 與第 <b>i+4</b> 個的 <b>N–H</b></td></tr>
  <tr><td>氫鍵方向</td><td>與<b>螺旋軸平行</b></td></tr>
  <tr><td>側鏈</td><td>所有 R 基<b>朝外</b></td></tr>
  </table>
  <p><b>破壞 α 螺旋的因素</b>：</p>
  <ul>
  <li><b>脯胺酸</b>：環狀結構限制旋轉，且 α-胺基<b>沒有 N–H</b> 可形成氫鍵 → 造成彎折（按右側按鈕試試）。</li>
  <li>多個<b>同電荷</b>側鏈靠近時的靜電排斥（Lys 與 Arg；Glu 與 Asp）。</li>
  <li>龐大側鏈擁擠（Val、Ile、Thr）。</li>
  </ul>`,
  build() {
    const n = 15, P = 7;
    const ang = Array.from({ length: n }, (_, i) => [-57, -47]);
    if (HLX.pro) { ang[P - 1] = [-57, -30]; ang[P] = [-60, -30]; }
    const res = alignHelix(backbone(ang, HLX.pro ? new Set([P]) : new Set()));
    const parts = drawBackbone(res, { G: 'α 螺旋', R: 'R', skipR: HLX.pro ? new Set([P]) : undefined,
      Rinfo: '所有側鏈 R 基都<b>朝向螺旋外側</b>，不會干擾內部主鏈的氫鍵；因此側鏈的性質（大小、電荷）決定螺旋的穩定性與它在蛋白質中的位置。' });
    parts.H.info = '主鏈 N–H 指向 N 端方向，與第 i−4 個殘基的 C=O 形成氫鍵。';
    const hb = findHB(res, res);
    drawHB(hb, '氫鍵', '氫鍵 C=O(i) … H–N(i+4)', 'Intrachain H-bond (i → i+4)',
      '每個肽鍵的 <b>C=O</b> 與往後第 <b>4</b> 個胺基酸的 <b>N–H</b> 形成氫鍵；這些 C=O…H–N 氫鍵<b>與螺旋軸平行</b>。共 ' + hb.length + ' 條（不計兩端）。');
    // 螺旋軸
    const y0 = res[0].CA.y - 1.5, y1 = res[n - 1].CA.y + 1.5;
    reg('幾何', '螺旋軸', 'Helix axis', '螺旋為<b>棒狀</b>（rod-like）結構；主鏈緊密纏繞在軸的周圍，側鏈向外。',
      cyl([0, y0, 0], [0, y1, 0], 0.08, 0xffffff, 0.5), { anchor: [0, y1, 0] });
    // 螺距標尺：從某個 CA 往上 5.4 Å
    const k0 = 2, ya = res[k0].CA.y, yb = ya + 5.4, R = 7.2;
    const tick = (y) => cyl([R - 0.5, y, 0], [R + 0.5, y, 0], 0.06, 0xffd479);
    reg('幾何', '螺距 5.4 Å（＝3.6 殘基）', 'Pitch 5.4 Å = 3.6 residues', '沿軸方向轉一整圈的距離（repeat distance）＝ <b>5.4 Å</b>，含 <b>3.6</b> 個胺基酸 → 每個殘基上升 1.5 Å、旋轉 100°。',
      [cyl([R, ya, 0], [R, yb, 0], 0.06, 0xffd479), tick(ya), tick(yb)], { anchor: [R, (ya + yb) / 2, 0] });
    // 殘基編號
    res.forEach((r, i) => textSprite(String(i + 1), r.CA.clone().add(V(r.CA.x, 0, r.CA.z).normalize().multiplyScalar(1.1)).toArray(), 0.55, HLX.pro && i === P ? '#ff8080' : '#ffd479'));
    HLX.ends = [textSprite('N 端', [0, y0 - 1.2, 0], 0.8, '#8fd0ff'), textSprite('C 端', [0, y1 + 1.2, 0], 0.8, '#8fd0ff')];
    // 卡通
    const ca = res.map(r => r.CA);
    reg('幾何', '卡通螺旋（緞帶）', 'Cartoon ribbon', '教科書常把 α 螺旋畫成螺旋緞帶或圓柱；緞帶即沿 Cα 走的路徑。', ttube(ca, 0.9, 0xff70a0, 0.35, { seg: 200 }), { hidden: true, anchor: ca[4].toArray() });
    if (HLX.pro) {
      const r = res[P], m = smat(0xff8060), bd = smat(0xff8060);
      const CG = r.CB.clone().lerp(r.N, 0.5).addScaledVector(r.Rdir, 0.9), atoms = [r.CB, CG];
      const CD = CG.clone().lerp(r.N, 0.55).addScaledVector(r.Rdir, 0.4);
      reg('脯胺酸', '脯胺酸 Pro（環狀側鏈）', 'Proline', '側鏈與主鏈 N 共價相連成<b>環</b>（亞胺酸 imino acid）：①限制 N–Cα 旋轉 ②<b>N 上沒有 H</b> → 無法提供氫鍵 → 螺旋在此<b>彎折</b>。',
        [atomM(r.CB, 'C', m), atomM(CG, 'C', m), atomM(CD, 'C', m), stickM(r.CA, r.CB, 0.14, bd), stickM(r.CB, CG, 0.14, bd), stickM(CG, CD, 0.14, bd), stickM(CD, r.N, 0.14, bd)], { anchor: CG.toArray() });
      const miss = res[P - 4];
      reg('脯胺酸', '缺少的氫鍵', 'Missing H-bond', '第 ' + (P - 3) + ' 個殘基的 C=O 找不到 N–H 配對（Pro 的 N 沒有 H）。',
        dashM(miss.O, r.N, 0.07, smat(0xff3030), 0.15, 0.25), { anchor: miss.O.clone().lerp(r.N, 0.5).toArray() });
    }
  }
});
