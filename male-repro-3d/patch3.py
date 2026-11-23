m = open('main.js', encoding='utf-8').read()
a = m.index('  // 標籤分左右兩欄排列')
b = m.index('try { init(); }')
new = '''  // 標籤分左右兩欄排列（依高度排序、避免重疊），以引線連到構造；兩欄數量盡量平衡
  const cols = { L: items.filter(L => L.s.x < w / 2), R: items.filter(L => L.s.x >= w / 2) };
  while (cols.L.length - cols.R.length > 2) { cols.L.sort((a, b) => a.s.x - b.s.x); cols.R.push(cols.L.pop()); }
  while (cols.R.length - cols.L.length > 2) { cols.R.sort((a, b) => a.s.x - b.s.x); cols.L.push(cols.R.shift()); }
  const GAP = Math.min(30, (h - 12) / Math.max(1, cols.L.length, cols.R.length));
  ['L', 'R'].forEach(side => {
    const col = cols[side].sort((a, b) => a.s.y - b.s.y);
    let prev = -1e9;
    col.forEach(L => { L.y = Math.max(5, L.s.y - 14, prev + GAP); prev = L.y; });
    let next = h - 5;
    for (let i = col.length - 1; i >= 0; i--) { col[i].y = Math.min(col[i].y, next - GAP); next = col[i].y; }
    col.forEach(L => {
      const lw = L.d.offsetWidth || 90;
      const x = side === 'L' ? 6 : w - lw - 6;
      L.d.style.left = x + 'px'; L.d.style.top = L.y + 'px';
      L.ln.setAttribute('x1', L.s.x); L.ln.setAttribute('y1', L.s.y);
      L.ln.setAttribute('x2', side === 'L' ? x + lw : x); L.ln.setAttribute('y2', L.y + 14);
    });
  });
}

'''
m = m[:a] + new + m[b:]
open('main.js', 'w', encoding='utf-8').write(m)
b = open('scene_bird.js', encoding='utf-8').read()
b = b.replace("pos: [0, 2.6, 9.5]", "pos: [0, 3.0, 13.5]").replace("const XA = -3.0, XB = 0, XC = 3.0;", "const XA = -2.9, XB = 0, XC = 2.9;")
open('scene_bird.js', 'w', encoding='utf-8').write(b)
print('ok')
