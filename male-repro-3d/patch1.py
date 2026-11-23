import re
s = open('scene_detail.js', encoding='utf-8').read()
a = s.index('    defs.forEach((d, k) => {')
b = s.index('    const sp = V(0, 0, 0);')
new = '''    defs.forEach((d, k) => {
      const e = k * 0.3;
      const m = shell(d[2], SC, d[3], k === 0 ? 0.55 : (k >= 5 ? 0.6 : 0.95), P - e, Math.min(2 * P, P + 2 * e));
      const th = 0.7 + 0.25 * k; // 標籤錨點放在各層被剝開的邊緣
      reg('陰囊被膜（由外而內）', d[0], d[1], d[5], m, { anchor: [d[2] * Math.cos(e) * Math.sin(th) * SC[0], d[2] * Math.cos(th) * SC[1], d[2] * Math.sin(e) * Math.sin(th) * SC[2]] });
    });
'''
s = s[:a] + new + s[b:]
rep = [
 ('tm.scale.set(0.5, 0.62, 0.5)', 'tm.scale.set(0.45, 0.58, 0.45)'),
 ('[[0.2, 0.62, 0.05], [-0.2, 0.55, -0.1], [-0.52, 0.2, -0.1], [-0.55, -0.2, -0.1], [-0.4, -0.55, -0.02]]', '[[0.15, 0.6, 0.05], [-0.15, 0.52, -0.1], [-0.42, 0.2, -0.1], [-0.46, -0.2, -0.1], [-0.33, -0.52, -0.02]]'),
 ('[[-0.4, -0.55, -0.02], [-0.6, -0.2, -0.1], [-0.4, 0.5, -0.12]', '[[-0.33, -0.52, -0.02], [-0.5, -0.2, -0.1], [-0.35, 0.5, -0.12]'),
 ('shell(1, A, 0xf8f4e6, 0.35, 0.75 * P, 1.5 * P)', 'shell(1, A, 0xf8f4e6, 0.35, 0.9 * P, 1.2 * P)'),
 ('shell(0.96, A, 0xd9605a, 0.18, 0.75 * P, 1.5 * P)', 'shell(0.96, A, 0xd9605a, 0.18, 0.9 * P, 1.2 * P)'),
 ('InstancedMesh(_sph, mat(col, 1), cnt * 2)', 'InstancedMesh(_sph, mat(col, 1), cnt * NS)'),
]
for x, y in rep:
    assert x in s, x
    s = s.replace(x, y)
for k in ['0.1', '0.15', '0.2']:
    pass
s = s.replace("進入近腔區間。', 0.1);", "進入近腔區間。', 0.314);")
s = s.replace("第一次減數分裂。', 0.15);", "第一次減數分裂。', 0.314);")
s = s.replace("開始進行精子形成。', 0.2);", "開始進行精子形成。', 0.314);")
s = re.sub(r"    const shape = [^\n]*\n    const mk = [^\n]*\n", '', s)
open('scene_detail.js', 'w', encoding='utf-8').write(s)
m = open('scene_mammal.js', encoding='utf-8').read()
x = 'ell([-0.62, -0.5, 0], [0.04, 0.04, 0.04], 0xffffff, 0.0001)'
assert x in m
m = m.replace(x, 'ell([-0.62, -0.5, 0.0], [0.05, 0.05, 0.05], 0xffee00, 1)')
open('scene_mammal.js', 'w', encoding='utf-8').write(m)
print('ok')
