import collections
import json
import os

obj_path = r"C:\Users\user\.gemini\antigravity\scratch\vet_anatomy_quiz\models\horse_skeleton.obj"

vertices = []
faces = []
with open(obj_path, 'r', errors='ignore') as f:
    for line in f:
        if line.startswith('v '):
            vertices.append([float(x) for x in line.strip().split()[1:4]])
        elif line.startswith('f '):
            idx = [int(p.split('/')[0]) - 1 for p in line.strip().split()[1:]]
            faces.append(idx)

v_to_f = collections.defaultdict(list)
for fi, f in enumerate(faces):
    for vi in f:
        v_to_f[vi].append(fi)

visited = [False] * len(faces)
components = []

for fi in range(len(faces)):
    if visited[fi]:
        continue
    comp = []
    queue = [fi]
    visited[fi] = True
    while queue:
        curr = queue.pop()
        comp.append(curr)
        for vi in faces[curr]:
            for nxt in v_to_f[vi]:
                if not visited[nxt]:
                    visited[nxt] = True
                    queue.append(nxt)
    components.append(comp)

# Compute stats for each component
comp_stats = []
for i, c in enumerate(components):
    comp_v = set()
    for fi in c:
        for vi in faces[fi]:
            comp_v.add(vi)
    xs = [vertices[vi][0] for vi in comp_v]
    ys = [vertices[vi][1] for vi in comp_v]
    zs = [vertices[vi][2] for vi in comp_v]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)
    cx = (min_x + max_x) / 2
    cy = (min_y + max_y) / 2
    cz = (min_z + max_z) / 2
    comp_stats.append({
        'id': i,
        'faces': c,
        'face_count': len(c),
        'cx': cx, 'cy': cy, 'cz': cz,
        'min_x': min_x, 'max_x': max_x,
        'min_y': min_y, 'max_y': max_y,
        'min_z': min_z, 'max_z': max_z,
    })

print(f"Total components: {len(comp_stats)}")
# Output top 40 components by face count
comp_stats.sort(key=lambda x: x['face_count'], reverse=True)
for s in comp_stats[:40]:
    print(f"ID {s['id']:3d} | Faces {s['face_count']:4d} | Center ({s['cx']:5.1f}, {s['cy']:5.1f}, {s['cz']:5.1f}) | Y: [{s['min_y']:5.1f}, {s['max_y']:5.1f}] | Z: [{s['min_z']:5.1f}, {s['max_z']:5.1f}]")
