/* 場景⑥：纖維蛋白——膠原蛋白三股螺旋、α-角蛋白捲曲螺旋（Ch4 Fig 2-38～2-42） */
const FIB = { t: [] };
const fibTitles = on => FIB.t.forEach(s => s.visible = on);
SCENES.push({
  name: '⑥ 纖維蛋白',
  title: '纖維蛋白：膠原蛋白與 α-角蛋白',
  camera: { pos: [0, 0, 128], target: [0, 0, 0] },
  controls: [
    { label: '🔍 全部', fn() { fibTitles(true); flyTo([0, 0, 128], [0, 0, 0]); } },
    { label: '🔍 膠原蛋白三股螺旋', fn() { fibTitles(true); flyTo([-14, 0, 60], [-14, 0, 0]); } },
    { label: '👁 膠原蛋白：沿軸看（Gly 在中心）', fn() { fibTitles(false); flyTo([-14, 52, 0.01], [-14, 0, 0]); } },
    { label: '🔍 α-角蛋白捲曲螺旋', fn() { fibTitles(true); flyTo([16, 0, 52], [16, 0, 0]); } },
    { label: '👁 捲曲螺旋：沿軸看（Leu 介面）', fn() { fibTitles(false); flyTo([16, 52, 0.01], [16, 0, 0]); } }
  ],
  desc: `
  <p><b>纖維蛋白</b>：多肽鏈大致沿同一軸平行排列成長纖維或片層，機械強度高、不溶於水，擔任結構支持的角色。</p>
  <p><b>膠原蛋白</b>（collagen）——哺乳類最多的蛋白質，皮膚、骨、肌腱、軟骨、牙齒的主要纖維成分。</p>
  <ul>
  <li><b>原膠原蛋白</b>（tropocollagen）：3 條多肽鏈（各約 800 個殘基）纏成<b>右手三股螺旋</b>；約 3000 Å 長、15 Å 粗。</li>
  <li>每條單鏈是<b>左手螺旋</b>（不是 α 螺旋）。</li>
  <li><b>每第三個殘基都是甘胺酸</b>：重複序列 <b>Gly-X-Pro</b> 或 <b>Gly-X-Hyp</b>；只有 Gly 放得進三股螺旋的<b>中心</b>。</li>
  <li>Pro／Hyp 的吡咯啶環彼此的立體排斥使螺旋穩定；三股之間以氫鍵相連（涉及 Hyp、Hyl）。</li>
  <li>Lys 與 His 之間形成<b>共價交聯</b>，<b>隨年齡增加</b>。</li>
  <li>Pro 羥化成 Hyp 需要<b>維生素 C</b>；未羥化的膠原蛋白較不穩定（壞血病）。</li>
  </ul>
  <p><b>α-角蛋白</b>（羊毛、頭髮、皮膚）：兩條<b>右手 α 螺旋</b>互相纏繞成<b>左手超螺旋</b>＝<b>α 螺旋捲曲螺旋</b>（coiled coil），長度 &gt;1000 Å。</p>
  <ul>
  <li><b>七胺基酸重複</b>（heptad repeat）：每圈 3.5 個殘基；<b>每第七個殘基是白胺酸</b>，兩條螺旋靠此介面以凡得瓦力、離子作用相連。</li>
  <li>還有<b>雙硫鍵</b>交聯：交聯少 → 柔軟（頭髮、羊毛）；交聯多 → 堅硬（角、爪、蹄）。</li>
  <li>其他捲曲螺旋蛋白：中間絲、肌凝蛋白、原肌凝蛋白。</li>
  </ul>`,
  build() {
    FIB.t = [];
    /* ===== 膠原蛋白 ===== */
    const CX = -14, n = 24, h = 2.86, Rs = 2.9, rm = 1.5, Ps = 86, G = '膠原蛋白（三股螺旋）';
    const chainCol = [0xff6a6a, 0x6ad06a, 0x6aa0ff];
    const z0 = -(n + 1) * h / 2;
    const ch = [0, 1, 2].map(c => {
      const pts = [], kind = [];
      for (let k = 0; k < n; k++) {
        const z = z0 + (k + c) * h, th = c * 2 * Math.PI / 3 - 2 * Math.PI * z / Ps;  // 超螺旋：右手（沿 +y，θ 隨高度減少）
        const rad = V(Math.cos(th), 0, Math.sin(th)), tan = V(-Math.sin(th), 0, Math.cos(th));
        const a = -k * 2 * Math.PI / 3;                                                // 單鏈：左手（相對超螺旋座標每殘基轉 120°，淨約 108°）
        const ax = V(CX, z, 0).addScaledVector(rad, Rs);
        pts.push(ax.clone().addScaledVector(rad, -Math.cos(a) * rm).addScaledVector(tan, Math.sin(a) * rm));
        kind.push(k % 3 === 0 ? 'G' : (k % 3 === 2 ? (k % 6 === 2 ? 'O' : 'P') : (k % 9 === 1 ? 'P' : 'X')));
      }
      return { pts, kind, axis: (z => { const th = c * 2 * Math.PI / 3 - 2 * Math.PI * z / Ps; return V(CX + Rs * Math.cos(th), z, Rs * Math.sin(th)); }) };
    });
    ch.forEach((c, i) => reg(G, ['α1 鏈', 'α1′ 鏈', 'α2 鏈'][i], 'Collagen chain ' + (i + 1), '膠原蛋白單鏈：<b>左手</b>螺旋（約每圈 3 個殘基），<b>不是 α 螺旋</b>。三條鏈互相錯開一個殘基，纏成右手超螺旋。',
      ttube(c.pts, 0.45, chainCol[i], 1, { seg: n * 10 }), { anchor: c.pts[Math.floor(n * 0.75)].toArray() }));
    const axC = [new THREE.Vector3(CX, 0, 0)];
    const gm = [], pm = [], om = [], xm = [];
    const mG = smat(0xffffff), mP = smat(0xffa040), mO = smat(0xff3a3a), mX = smat(0x9a9a9a);
    ch.forEach(c => c.pts.forEach((p, k) => {
      const out = V(p.x - CX, 0, p.z).normalize();
      if (c.kind[k] === 'G') { gm.push(atomM(p, 'C', mG, 1.6)); return; }
      const tip = p.clone().addScaledVector(out, 1.7), list = c.kind[k] === 'P' ? pm : c.kind[k] === 'O' ? om : xm;
      const m = c.kind[k] === 'P' ? mP : c.kind[k] === 'O' ? mO : mX;
      list.push(atomM(tip, 'R', m, 1.1), stickM(p, tip, 0.14, m));
    }));
    reg(G, '甘胺酸 Gly（每第 3 個）', 'Glycine — every third residue', '<b>每第三個殘基都是 Gly</b>。三股螺旋的中心非常擁擠，<b>只有側鏈只是 H 的甘胺酸放得下</b>。沿軸俯視可看到所有白球都位在中心。', gm, { anchor: ch[0].pts[9].toArray() });
    reg(G, '脯胺酸 Pro', 'Proline (X position)', '重複序列 Gly-X-Y 中常見於 X 位。吡咯啶環彼此的<b>立體排斥</b>使三股螺旋穩定。', pm, { anchor: ch[1].pts[13].clone().add(V(2, 0, 0)).toArray() });
    reg(G, '羥脯胺酸 Hyp', 'Hydroxyproline (Y position)', '<b>轉譯後修飾</b>產生：Pro 羥化成 Hyp 需<b>維生素 C</b>（抗壞血酸）。Hyp 參與鏈間<b>氫鍵</b>；未羥化的膠原蛋白較不穩定。', om, { anchor: ch[2].pts[17].clone().add(V(2, 0, 0)).toArray() });
    reg(G, '其他胺基酸 X', 'Other residues', 'X 可以是任何胺基酸（Gly-X-Pro / Gly-X-Hyp）。', xm, { nolabel: true });
    // 鏈間氫鍵（示意）：Gly(鏈 c) ↔ 下一鏈最近的非 Gly 殘基
    const hb = [], mH = smat(0xffe066);
    ch.forEach((c, i) => c.pts.forEach((p, k) => {
      if (c.kind[k] !== 'G') return;
      const o = ch[(i + 1) % 3]; let best = null;
      o.pts.forEach((q, j) => { if (o.kind[j] !== 'G' && (!best || q.distanceTo(p) < best.distanceTo(p))) best = q; });
      if (best && best.distanceTo(p) < 5.5) hb.push(...dashM(p, best, 0.07, mH, 0.25, 0.2));
    }));
    reg(G, '鏈間氫鍵（示意）', 'Interchain H-bonds', '三條鏈以<b>氫鍵</b>互相固定：Gly 的 N–H 與鄰鏈的 C=O 形成氫鍵，Hyp 與 Hyl 也參與。', hb, { anchor: ch[0].pts[6].toArray() });
    reg(G, '超螺旋（右手）', 'Right-handed superhelix', '三條左手螺旋鏈再纏成<b>右手超螺旋纜索</b>（superhelical cable）＝原膠原蛋白，分子量約 300,000。', [0, 1, 2].map(i => ttube(Array.from({ length: 30 }, (_, s) => ch[i].axis(z0 + s * (n + 2) * h / 29)), 0.12, 0xffffff, 0.35)), { hidden: true, anchor: [CX + 4, z0, 0] });
    FIB.t.push(textSprite('膠原蛋白', [CX, -z0 + 7, 0], 3, '#ffd479', 'Gly-X-Pro / Gly-X-Hyp'));

    /* ===== α-角蛋白捲曲螺旋 ===== */
    const KX = 16, nr = 28, R0 = 4.9, Pk = 150, G2 = 'α-角蛋白（捲曲螺旋）', rise = 1.5;
    const hcol = [0x40c8ff, 0xff70d0];
    const letters = 'abcdefg';
    const hel = [0, 1].map(hn => {
      const pts = [], pos = [];
      for (let k = 0; k < nr; k++) {
        const z = (k - nr / 2) * rise, th = hn * Math.PI + 2 * Math.PI * z / Pk;   // 超螺旋：左手（θ 隨高度增加）
        const rad = V(Math.cos(th), 0, Math.sin(th)), tan = V(-Math.sin(th), 0, Math.cos(th));
        const a = -25.7 * DEG - k * 2 * Math.PI / 3.5;                 // α 螺旋：每圈 3.5 殘基；a、d 位對稱朝內
        const axp = V(KX, z, 0).addScaledVector(rad, R0);
        pts.push(axp.clone().addScaledVector(rad, -Math.cos(a) * 2.3).addScaledVector(tan, -Math.sin(a) * 2.3));
        pos.push(letters[k % 7]);
      }
      return { pts, pos, axis: z => { const th = hn * Math.PI + 2 * Math.PI * z / Pk; return V(KX + R0 * Math.cos(th), z, R0 * Math.sin(th)); } };
    });
    hel.forEach((hh, i) => reg(G2, i ? 'α 螺旋 2（右手）' : 'α 螺旋 1（右手）', 'Right-handed α-helix', '捲曲螺旋中的每條鏈都是<b>右手 α 螺旋</b>，但每圈約 <b>3.5</b> 個殘基（一般 α 螺旋為 3.6）。',
      ttube(hh.pts, 0.45, hcol[i], 1, { seg: nr * 10 }), { anchor: hh.pts[nr - 4].toArray() }));
    const leu = [], aPos = [], oth = [], mL = smat(0xffe030), mA = smat(0xffb060), mOt = smat(0x8a8a8a);
    hel.forEach(hh => hh.pts.forEach((p, k) => {
      const ap = hh.axis(p.y), out = p.clone().sub(ap).normalize(), tip = p.clone().addScaledVector(out, 1.8);
      const L = hh.pos[k] === 'd', A = hh.pos[k] === 'a', m = L ? mL : A ? mA : mOt;
      (L ? leu : A ? aPos : oth).push(atomM(tip, 'R', m, L ? 1.25 : 0.9), stickM(p, tip, 0.13, m));
    }));
    reg(G2, '白胺酸 Leu（每第 7 個，d 位）', 'Leucine at every 7th residue', '<b>七胺基酸重複</b>（heptad repeat, abcdefg）：<b>每第七個殘基是白胺酸</b>（d 位）。兩條螺旋的 Leu 排在同一側並互相嵌合，以<b>凡得瓦力</b>結合。沿軸俯視可見黃球都朝向兩螺旋之間的介面。', leu, { anchor: hel[0].pts[10].toArray() });
    reg(G2, 'a 位疏水殘基', 'Hydrophobic residue at a', 'heptad 的 a 位也多為疏水胺基酸，與 d 位一起組成兩條螺旋之間的疏水介面。', aPos, { nolabel: true });
    reg(G2, '其他殘基', 'Other residues (b, c, e, f, g)', '朝外的殘基；e、g 位常帶電，形成鏈間<b>離子作用</b>。', oth, { nolabel: true });
    reg(G2, '超螺旋軸（左手）', 'Left-handed superhelix', '兩條右手 α 螺旋互相纏繞成<b>左手超螺旋</b>。這種結構非常穩定，長度可超過 1000 Å。', [0, 1].map(i => ttube(Array.from({ length: 30 }, (_, s) => hel[i].axis((s / 29 - 0.5) * nr * rise)), 0.18, 0xffffff, 0.4)), { anchor: hel[1].axis(-12).toArray() });
    FIB.t.push(textSprite('α-角蛋白', [KX, nr * rise / 2 + 6, 0], 3, '#ffd479', '捲曲螺旋 coiled coil'));
  }
});
