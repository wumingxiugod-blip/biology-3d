import re
h = open('index.html', encoding='utf-8').read()
h = re.sub(r'#ctrl\{[^\n]*\n', '#right{position:absolute;right:0;top:46px;bottom:0;width:320px;background:rgba(16,32,48,.94);border-left:1px solid #2c4560;z-index:10;display:flex;flex-direction:column;padding:10px;gap:10px;overflow:hidden}\n#ctrl{border:1px solid #2c4560;border-radius:8px;padding:8px 10px;display:flex;flex-direction:column;gap:6px;font-size:12.5px;flex:none}\n#extra{display:flex;flex-direction:column;gap:6px}\n', h, count=1)
h = re.sub(r'#info\{[^\n]*\n', '#info{flex:1;overflow-y:auto;background:rgba(10,20,32,.7);border:1px solid #d9a628;border-radius:10px;padding:12px 14px;line-height:1.65}\n', h, count=1)
h = h.replace('#cv{position:absolute;left:290px;right:0;', '#cv{position:absolute;left:290px;right:320px;')
h = h.replace('#ctrl label{', '#ctrl label,#extra button{')
h = h.replace('<div id="ctrl">', '<div id="right"><div id="ctrl">')
h = h.replace('</div>\n<div id="tip">', '</div></div>\n<div id="tip">')
open('index.html', 'w', encoding='utf-8').write(h)

m = open('main.js', encoding='utf-8').read()
a = m.index('  // 標籤往兩側推開並避開重疊')
b = m.index('try { init(); }')
new = '''  // 標籤分左右兩欄排列（依高度排序、避免重疊），以引線連到構造
  const GAP = Math.min(30, (h - 10) / Math.max(1, items.length / 2 + 1));
  ['L', 'R'].forEach(side => {
    const col = items.filter(L => (L.s.x < w / 2) === (side === 'L')).sort((a, b) => a.s.y - b.s.y);
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

d = open('scene_detail.js', encoding='utf-8').read()
d = d.replace("camera: { pos: [0, 0.3, 4.4], target: [0, 0, 0] }", "camera: { pos: [1.0, 0.5, 6.2], target: [0, 0.45, 0] }")
d = d.replace("camera: { pos: [0, 0.2, 5.2], target: [0, 0, 0] }", "camera: { pos: [0, 0.2, 6.6], target: [0, 0, 0] }")
d = d.replace("V(0.13, 0.13, 0.13)); ly.setMatrixAt", "V(0.085, 0.085, 0.085)); ly.setMatrixAt")
d = d.replace("[0, 0.6, 0], [0, 1.8, 0]], 0.13", "[0, 0.6, 0], [0, 1.6, 0]], 0.13").replace("lineCurve([0, 0.6, 0], [0, 1.8, 0])", "lineCurve([0, 0.6, 0], [0, 1.6, 0])").replace("[0, 0.7, 0], [0, 1.8, 0]], 0.025", "[0, 0.7, 0], [0, 1.6, 0]], 0.025")
d = d.replace("[[0.15, 0.6, 0.05], [-0.15, 0.52, -0.1], [-0.42, 0.2, -0.1], [-0.46, -0.2, -0.1], [-0.33, -0.52, -0.02]]", "[[0.15, 0.6, 0.15], [-0.15, 0.52, 0.12], [-0.42, 0.2, 0.12], [-0.46, -0.2, 0.12], [-0.33, -0.52, 0.12]]")
open('scene_detail.js', 'w', encoding='utf-8').write(d)
b = open('scene_bird.js', encoding='utf-8').read()
b = b.replace("camera: { pos: [-0.3, 4.4, 3.8], target: [-0.3, -0.05, 0] }", "camera: { pos: [-0.3, 3.7, 3.0], target: [-0.3, -0.05, 0] }")
b = b.replace("camera: { pos: [0, 2.2, 7.2], target: [0.0, 0.35, 0.5] }", "camera: { pos: [0, 2.6, 9.5], target: [0.0, 0.3, 0.5] }")
b = b.replace("const XA = -3.6, XB = 0, XC = 3.6;", "const XA = -3.0, XB = 0, XC = 3.0;")
open('scene_bird.js', 'w', encoding='utf-8').write(b)
print('done')
