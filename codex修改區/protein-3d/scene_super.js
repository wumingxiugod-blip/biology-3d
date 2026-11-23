/* 場景⑤：超二級結構（Ch4 4-3 Supersecondary structures、Fig 4.9） */
SCENES.push({
  name: '⑤ 超二級結構',
  title: '超二級結構與模體（motif）',
  camera: { pos: [0, 6, 92], target: [0, 0, 0] },
  controls: [
    { label: '🔍 全部', fn() { flyTo([0, 6, 92], [0, 0, 0]); } },
    { label: '🔍 βαβ', fn() { flyTo([-40, 4, 30], [-40, 0, -2]); } },
    { label: '🔍 αα', fn() { flyTo([-20, 4, 30], [-20, 0, 0]); } },
    { label: '🔍 β-曲折', fn() { flyTo([0, 4, 30], [0, 0, 0]); } },
    { label: '🔍 希臘鑰匙', fn() { flyTo([20, 6, 30], [20, 1, 0]); } },
    { label: '🔍 β-桶', fn() { flyTo([40, 18, 26], [40, 0, 0]); } }
  ],
  desc: `
  <p><b>超二級結構</b>（supersecondary structure）：α 螺旋與 β 摺板的特定組合。重複出現的超二級結構稱為<b>模體</b>（motif）。</p>
  <table>
  <tr><td><b>βαβ</b></td><td>兩條<b>平行</b> β 股以一段 α 螺旋相連</td></tr>
  <tr><td><b>αα</b></td><td>兩條<b>反平行</b>的 α 螺旋</td></tr>
  <tr><td><b>β-曲折</b><br>β-meander</td><td>一連串<b>緊密反轉角</b>連接的反平行摺板</td></tr>
  <tr><td><b>希臘鑰匙</b><br>Greek key</td><td>反平行摺板<b>折回自身</b>形成的重複結構</td></tr>
  <tr><td><b>β-桶</b><br>β-barrel</td><td>β 摺板夠大時<b>捲回自身</b>形成桶狀</td></tr>
  </table>
  <p><b>結構域</b>（domain）：多肽鏈中摺成緊密球狀單位的區域；功能相同者常有相似序列（構形）。有些多肽可摺成兩個以上的結構域。</p>
  <p class="hint">黃色寬箭頭＝β 股（指向 C 端）；紅色螺旋＝α 螺旋；粉紅管＝連接的環／轉角。</p>`,
  build() {
    const SC = 0xffc830, HC = 0xff5a6a, LC = 0xff9ad0;
    const st = (a, b, n = [0, 0, 1]) => arrowM(V(...a), V(...b), V(...n), SC, 1.5);
    const hx = (a, b, nRes) => { const p = helixTrace(a, b, nRes); return [ttube(p, 0.55, HC, 1, { seg: nRes * 8 }), cyl(a, b, 2.4, HC, 0.18)]; };
    const lp = (a, b, bulge, n = 8) => ttube(loopPts(a, b, bulge, n), 0.35, LC);
    const num = (t, p) => textSprite(t, p, 1.3, '#ffffff');
    const title = (x, t, s) => textSprite(t, [x, 13, 0], 2.2, '#ffd479', s);

    // βαβ（兩平行股＋背後螺旋）
    let X = -40;
    title(X, 'βαβ 單元', 'β-α-β unit');
    reg('βαβ', 'βαβ 單元', 'β-α-β unit', '兩條<b>平行</b>的 β 股，由一段 <b>α 螺旋</b>連接（螺旋位於摺板的一側並反向行進，形成交叉連接）。是平行 β 摺板中最常見的連接方式。',
      [st([X - 2.6, -8, 0], [X - 2.6, 8, 0]), st([X + 2.6, -8, 0], [X + 2.6, 8, 0]), ...hx([X, 7, -7], [X, -7, -7], 10),
        lp([X - 2.6, 8, 0], [X, 7, -7], [0, 2.5, 0]), lp([X, -7, -7], [X + 2.6, -8, 0], [0, -2.5, 0])], { anchor: [X - 3, 2, 0] });
    num('β1', [X - 2.6, -10, 0]); num('α', [X, -9.5, -7]); num('β2', [X + 2.6, -10, 0]);

    // αα
    X = -20;
    title(X, 'αα 單元', 'α-α unit');
    reg('αα', 'αα 單元', 'α-α unit', '兩條<b>反平行</b>的 α 螺旋以短環相連，彼此並排堆疊。',
      [...hx([X - 3, -8, 0], [X - 3, 8, 0], 11), ...hx([X + 3, 8, 0], [X + 3, -8, 0], 11), lp([X - 3, 8, 0], [X + 3, 8, 0], [0, 3, 0])], { anchor: [X - 3, 0, 2] });

    // β-曲折
    X = 0;
    title(X, 'β-曲折', 'β-meander');
    const mx = [-4.5, -1.5, 1.5, 4.5], ms = [];
    mx.forEach((dx, i) => { const up = i % 2 === 0; ms.push(st([X + dx, up ? -8 : 8, 0], [X + dx, up ? 8 : -8, 0])); num(String(i + 1), [X + dx, up ? -10 : 10, 0]); });
    for (let i = 0; i < 3; i++) { const top = i % 2 === 0, y = top ? 8 : -8; ms.push(lp([X + mx[i], y, 0], [X + mx[i + 1], y, 0], [0, top ? 1.6 : -1.6, 0], 6)); }
    reg('β-曲折', 'β-曲折（β-meander）', 'β-meander', '反平行 β 摺板，相鄰的股依序以<b>緊密的反轉角</b>（髮夾）相連：1-2-3-4 在空間上也是依序排列。', ms, { anchor: [X, 0, 1] });

    // 希臘鑰匙：空間順序 4-1-2-3
    X = 20;
    title(X, '希臘鑰匙', 'Greek key');
    const gx = { 4: -4.5, 1: -1.5, 2: 1.5, 3: 4.5 }, gs = [];
    [1, 2, 3, 4].forEach(k => { const up = k % 2 === 1; gs.push(st([X + gx[k], up ? -8 : 8, 0], [X + gx[k], up ? 8 : -8, 0])); num(String(k), [X + gx[k], up ? -10 : 10, 0]); });
    gs.push(lp([X + gx[1], 8, 0], [X + gx[2], 8, 0], [0, 1.6, 0], 6), lp([X + gx[2], -8, 0], [X + gx[3], -8, 0], [0, -1.6, 0], 6));
    gs.push(ttube([[X + gx[3], 8, 0], [X + gx[3], 10.5, 1.5], [X + 1.5, 11.5, 4], [X - 1.5, 11.5, 4], [X + gx[4], 10.5, 1.5], [X + gx[4], 8, 0]], 0.35, LC));
    reg('希臘鑰匙', '希臘鑰匙（Greek key）', 'Greek key', '反平行摺板<b>折回自身</b>：1→2→3 以髮夾依序排列，第 3 股之後的鏈<b>跨過頂端</b>回到第 1 股旁邊成為第 4 股（空間順序 4-1-2-3），形似希臘陶器上的回紋。',
      gs, { anchor: [X, 11.5, 4] });

    // β-桶：8 條反平行股繞成圓桶並傾斜
    X = 40;
    title(X, 'β-桶', 'β-barrel');
    const N = 8, Rb = 6, tilt = 0.32, bs = [], ends = [];
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2, up = i % 2 === 0;
      const p0 = V(X + Rb * Math.cos(a - tilt), -7, Rb * Math.sin(a - tilt)), p1 = V(X + Rb * Math.cos(a + tilt), 7, Rb * Math.sin(a + tilt));
      const nr = V(Math.cos(a), 0, Math.sin(a));
      bs.push(up ? arrowM(p0, p1, nr, SC, 1.3) : arrowM(p1, p0, nr, SC, 1.3));
      ends.push(up ? [p0, p1] : [p1, p0]);
    }
    for (let i = 0; i < N - 1; i++) {
      const a = ends[i][1], b = ends[i + 1][0], out = a.clone().add(b).multiplyScalar(0.5).sub(V(X, a.y, 0)).normalize();
      bs.push(lp(a, b, out.multiplyScalar(1.2).add(V(0, Math.sign(a.y) * 1.4, 0)), 6));
    }
    reg('β-桶', 'β-桶（β-barrel）', 'β-barrel', 'β 摺板足夠寬大時<b>捲回自身</b>，第一股與最後一股以氫鍵相接，形成封閉的<b>桶狀</b>結構（Fig 4.9）。此例為 8 條反平行股以髮夾相連的「上下型」β-桶。膜上的孔蛋白（porin）也是 β-桶。', bs, { anchor: [X + Rb, 0, 0] });
  }
});
