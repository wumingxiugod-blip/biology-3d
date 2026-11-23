import math
import json
def normalize(v):
    l = math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
    if l == 0: return (0, 1, 0)
    return (v[0]/l, v[1]/l, v[2]/l)

def add_vec(a, b):
    return (a[0]+b[0], a[1]+b[1], a[2]+b[2])

def mul_vec(a, s):
    return (a[0]*s, a[1]*s, a[2]*s)

def sub_vec(a, b):
    return (a[0]-b[0], a[1]-b[1], a[2]-b[2])

def cross(a, b):
    return (
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    )

class OBJBuilder:
    def __init__(self):
        self.vertices = []
        self.objects = {}
        self.current_obj = None

    def start_object(self, name):
        self.current_obj = name
        if name not in self.objects:
            self.objects[name] = []

    def add_vertex(self, x, y, z):
        self.vertices.append((x, y, z))
        return len(self.vertices)

    def add_face(self, v1, v2, v3):
        self.objects[self.current_obj].append((v1, v2, v3))

    def add_quad(self, v1, v2, v3, v4):
        self.add_face(v1, v2, v3)
        self.add_face(v1, v3, v4)

    def add_sculpted_sphere(self, center, radii, u_steps=24, v_steps=18, deform_fn=None):
        cx, cy, cz = center
        rx, ry, rz = radii
        grid = []
        for i in range(v_steps + 1):
            row = []
            theta = math.pi * i / v_steps
            sin_t = math.sin(theta)
            cos_t = math.cos(theta)
            for j in range(u_steps):
                phi = 2 * math.pi * j / u_steps
                sin_p = math.sin(phi)
                cos_p = math.cos(phi)
                vx = rx * sin_t * cos_p
                vy = ry * cos_t
                vz = rz * sin_t * sin_p
                if deform_fn:
                    vx, vy, vz = deform_fn(vx, vy, vz, theta, phi)
                v_idx = self.add_vertex(cx + vx, cy + vy, cz + vz)
                row.append(v_idx)
            grid.append(row)

        for i in range(v_steps):
            for j in range(u_steps):
                j_next = (j + 1) % u_steps
                v00 = grid[i][j]
                v01 = grid[i][j_next]
                v10 = grid[i+1][j]
                v11 = grid[i+1][j_next]
                if i == 0:
                    self.add_face(v00, v10, v11)
                elif i == v_steps - 1:
                    self.add_face(v00, v10, v01)
                else:
                    self.add_quad(v00, v10, v11, v01)

    def add_spline_tube(self, points, radius_profile, radial_steps=16, deform_fn=None):
        if len(points) < 2: return
        rings = []
        num_points = len(points)
        for idx, pt in enumerate(points):
            t = idx / (num_points - 1)
            if idx == 0:
                tangent = sub_vec(points[1], points[0])
            elif idx == num_points - 1:
                tangent = sub_vec(points[-1], points[-2])
            else:
                tangent = sub_vec(points[idx+1], points[idx-1])
            tangent = normalize(tangent)
            up = (0, 1, 0) if abs(tangent[1]) < 0.9 else (1, 0, 0)
            norm = normalize(cross(tangent, up))
            binorm = normalize(cross(tangent, norm))
            
            if callable(radius_profile):
                r = radius_profile(t)
            elif isinstance(radius_profile, (list, tuple)):
                r = radius_profile[min(idx, len(radius_profile)-1)]
            else:
                r = radius_profile
                
            ring = []
            for j in range(radial_steps):
                angle = 2 * math.pi * j / radial_steps
                ca = math.cos(angle)
                sa = math.sin(angle)
                offset = add_vec(mul_vec(norm, ca * r), mul_vec(binorm, sa * r))
                if deform_fn:
                    offset = deform_fn(offset, t, angle)
                v_idx = self.add_vertex(pt[0] + offset[0], pt[1] + offset[1], pt[2] + offset[2])
                ring.append(v_idx)
            rings.append(ring)

        for i in range(num_points - 1):
            r1 = rings[i]
            r2 = rings[i+1]
            for j in range(radial_steps):
                j_next = (j + 1) % radial_steps
                self.add_quad(r1[j], r2[j], r2[j_next], r1[j_next])

        c_start = self.add_vertex(points[0][0], points[0][1], points[0][2])
        for j in range(radial_steps):
            j_next = (j + 1) % radial_steps
            self.add_face(c_start, rings[0][j_next], rings[0][j])
        c_end = self.add_vertex(points[-1][0], points[-1][1], points[-1][2])
        for j in range(radial_steps):
            j_next = (j + 1) % radial_steps
            self.add_face(c_end, rings[-1][j], rings[-1][j_next])

    def to_obj_string(self):
        lines = ["# Realistic Veterinary 3D Visceral Anatomy Model\n"]
        for v in self.vertices:
            lines.append(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        for name, faces in self.objects.items():
            lines.append(f"o {name}\n")
            lines.append("s 1\n")
            for f in faces:
                lines.append(f"f {f[0]} {f[1]} {f[2]}\n")
        return "".join(lines)

def build_dog_anatomy():
    b = OBJBuilder()
    
    # 1. dog_brain (大腦與小腦)
    b.start_object("dog_brain")
    # Left hemisphere
    b.add_sculpted_sphere((11.6, 4.3, 0.48), (1.15, 0.85, 0.65), 20, 16,
        lambda x, y, z, th, ph: (
            x * (1.0 + 0.08 * math.sin(ph * 5) * math.sin(th * 4)),
            y * (1.0 + 0.06 * math.cos(ph * 4)),
            z * 0.95
        )
    )
    # Right hemisphere
    b.add_sculpted_sphere((11.6, 4.3, -0.48), (1.15, 0.85, 0.65), 20, 16,
        lambda x, y, z, th, ph: (
            x * (1.0 + 0.08 * math.sin(ph * 5) * math.sin(th * 4)),
            y * (1.0 + 0.06 * math.cos(ph * 4)),
            z * 0.95
        )
    )
    # Cerebellum
    b.add_sculpted_sphere((10.4, 4.0, 0.0), (0.75, 0.65, 0.85), 18, 14,
        lambda x, y, z, th, ph: (x, y * (1.0 + 0.1 * math.sin(y * 8)), z)
    )
    # Brainstem
    b.add_spline_tube([
        (10.6, 3.6, 0.0),
        (9.8, 3.2, 0.0),
        (9.2, 2.9, 0.0)
    ], 0.35, 12)

    # 2. dog_trachea (氣管與軟骨環)
    b.start_object("dog_trachea")
    trachea_pts = []
    for i in range(25):
        t = i / 24.0
        x = 9.2 * (1 - t) + 1.2 * t
        y = 2.9 * (1 - t)**1.2 + 0.2 * t
        z = 0.0
        trachea_pts.append((x, y, z))
    b.add_spline_tube(trachea_pts, 0.45, 16, 
        lambda off, t, ang: mul_vec(off, 1.0 + 0.15 * math.cos(t * 38 * math.pi)) # 38 氣管軟骨環凹凸感
    )
    # Bronchial bifurcation
    b.add_spline_tube([(1.2, 0.2, 0.0), (0.4, -0.1, 0.7), (-0.2, -0.3, 1.2)], 0.32, 12)
    b.add_spline_tube([(1.2, 0.2, 0.0), (0.4, -0.1, -0.7), (-0.2, -0.3, -1.2)], 0.32, 12)

    # 3. dog_heart (犬心臟與主動脈弓)
    b.start_object("dog_heart")
    # Ventricular cone (left & right ventricles)
    b.add_sculpted_sphere((0.8, -0.8, 0.2), (1.55, 1.95, 1.45), 24, 20,
        lambda x, y, z, th, ph: (
            x * (1.0 - 0.22 * (y / 1.95)), # 錐形心尖
            y,
            z * (1.0 - 0.18 * (y / 1.95) + 0.08 * math.sin(ph * 2)) # 冠狀溝與心室間溝
        )
    )
    # Atria & Auricles (心房與心耳)
    b.add_sculpted_sphere((0.9, 0.8, 0.7), (0.85, 0.65, 0.65), 16, 12)
    b.add_sculpted_sphere((1.1, 0.7, -0.5), (0.85, 0.65, 0.65), 16, 12)
    # Aortic Arch (主動脈弓)
    b.add_spline_tube([
        (0.8, 0.9, 0.1),
        (0.7, 1.9, 0.0),
        (0.0, 2.2, -0.1),
        (-1.2, 1.9, -0.2),
        (-2.5, 1.6, -0.25)
    ], 0.42, 14)
    # Pulmonary trunk (肺動脈幹)
    b.add_spline_tube([
        (1.2, 0.6, 0.3),
        (0.8, 1.5, 0.4),
        (0.2, 1.6, 0.6)
    ], 0.36, 12)

    # 4. dog_lung_left (左肺：前葉・後葉・心切跡)
    b.start_object("dog_lung_left")
    # Cranial lobe (cranial & caudal parts)
    b.add_sculpted_sphere((1.4, 0.5, 1.65), (1.65, 1.25, 0.95), 20, 16,
        lambda x, y, z, th, ph: (x, y * 0.9, z * (1.0 - 0.2 * math.sin(th))) # 心切跡壓跡
    )
    # Caudal lobe (大葉)
    b.add_sculpted_sphere((-0.8, 0.2, 1.85), (2.25, 1.45, 1.15), 22, 18,
        lambda x, y, z, th, ph: (x * 1.1, y * 0.95, z)
    )

    # 5. dog_lung_right (右肺：前・中・後・副葉 4葉)
    b.start_object("dog_lung_right")
    # Cranial lobe
    b.add_sculpted_sphere((1.6, 0.6, -1.65), (1.55, 1.25, 0.95), 20, 16)
    # Middle lobe
    b.add_sculpted_sphere((0.5, -0.2, -1.85), (1.35, 1.15, 0.90), 18, 14)
    # Caudal lobe (巨大)
    b.add_sculpted_sphere((-1.0, 0.3, -1.95), (2.45, 1.55, 1.25), 22, 18)
    # Accessory lobe (中膈面副葉，包繞後腔靜脈)
    b.add_sculpted_sphere((-0.4, -0.8, -0.5), (1.35, 0.85, 0.95), 18, 14)

    # 6. dog_liver (六葉多裂肝臟)
    b.start_object("dog_liver")
    # Left lateral lobe (左外側葉 - 巨大圓厚)
    b.add_sculpted_sphere((-2.4, 0.2, 1.6), (1.35, 1.75, 1.15), 20, 16,
        lambda x, y, z, th, ph: (x * 0.85, y, z * (1.0 + 0.15 * math.cos(th)))
    )
    # Left medial lobe (左內側葉)
    b.add_sculpted_sphere((-2.2, -0.3, 0.8), (1.15, 1.55, 0.85), 18, 14)
    # Quadrate lobe (方葉)
    b.add_sculpted_sphere((-2.0, -0.6, 0.0), (0.95, 1.35, 0.75), 16, 12)
    # Right medial lobe (右內側葉，具膽囊切跡)
    b.add_sculpted_sphere((-2.1, -0.4, -0.8), (1.15, 1.55, 0.85), 18, 14,
        lambda x, y, z, th, ph: (x, y, z * (1.0 - 0.2 * max(0, math.sin(ph))))
    )
    # Right lateral lobe (右外側葉)
    b.add_sculpted_sphere((-2.5, 0.3, -1.6), (1.35, 1.65, 1.15), 20, 16)
    # Caudate process with Renal Fossa (尾狀突與腎窩 - 嵌合右腎)
    b.add_sculpted_sphere((-3.2, 0.8, -1.5), (1.15, 0.95, 0.95), 18, 14,
        lambda x, y, z, th, ph: (x * (1.0 - 0.3 * max(0, -x)), y, z) # 凹陷腎窩
    )

    # 7. dog_gallbladder (膽囊)
    b.start_object("dog_gallbladder")
    b.add_sculpted_sphere((-1.9, -1.3, -0.6), (0.65, 1.15, 0.65), 16, 14,
        lambda x, y, z, th, ph: (x * (0.8 + 0.4 * (y/1.15)), y, z * (0.8 + 0.4 * (y/1.15))) # 梨形
    )
    # Cystic duct
    b.add_spline_tube([(-1.9, -0.3, -0.6), (-2.2, 0.1, -0.4), (-2.4, 0.2, -0.2)], 0.12, 10)

    # 8. dog_stomach (犬 J 形單胃)
    b.start_object("dog_stomach")
    stomach_curve = [
        (-2.6, 1.1, 0.2),   # Cardia (賁門)
        (-3.8, 1.6, 0.9),   # Fundus (胃底)
        (-5.2, 1.2, 1.4),   # Body cranial (胃體大彎)
        (-6.2, -0.2, 1.2),  # Greater curvature
        (-6.0, -1.4, 0.4),  # Lower curvature
        (-4.8, -1.8, -0.4), # Angular incisure to antrum
        (-3.6, -1.2, -0.7), # Pyloric antrum (幽門竇)
        (-3.2, -0.6, -0.8)  # Pylorus (幽門)
    ]
    stomach_radii = [0.65, 1.35, 1.65, 1.55, 1.35, 1.15, 0.75, 0.55]
    b.add_spline_tube(stomach_curve, stomach_radii, 20,
        lambda off, t, ang: mul_vec(off, 1.0 + 0.1 * math.sin(ang * 2) + 0.05 * math.cos(t * 8 * math.pi))
    )

    # 9. dog_spleen (舌狀脾臟)
    b.start_object("dog_spleen")
    spleen_pts = [
        (-4.6, 1.5, 2.3),   # Dorsal extremity
        (-5.5, 0.8, 2.5),
        (-6.4, -0.2, 2.6),
        (-7.0, -1.2, 2.4),
        (-7.4, -2.1, 2.0)   # Ventral extremity (寬闊)
    ]
    spleen_radii = [0.45, 0.65, 0.75, 0.85, 0.75]
    b.add_spline_tube(spleen_pts, spleen_radii, 16,
        lambda off, t, ang: (off[0] * 1.4, off[1] * 0.35, off[2] * 1.2) # 扁平舌狀
    )

    # 10. dog_pancreas (V形胰臟)
    b.start_object("dog_pancreas")
    # Right lobe (沿十二指腸降部)
    b.add_spline_tube([
        (-3.4, -0.5, -0.8),
        (-4.2, -0.6, -1.4),
        (-5.5, -0.8, -1.6),
        (-6.8, -1.0, -1.5)
    ], 0.35, 12, lambda off, t, ang: mul_vec(off, 1.0 + 0.25 * math.sin(ang * 4)))
    # Left lobe (伸向脾臟)
    b.add_spline_tube([
        (-3.4, -0.5, -0.8),
        (-4.0, 0.2, -0.2),
        (-4.6, 0.5, 0.5),
        (-5.0, 0.6, 1.2)
    ], 0.32, 12, lambda off, t, ang: mul_vec(off, 1.0 + 0.25 * math.sin(ang * 4)))

    # 11. dog_small_intestine (小腸曲折群)
    b.start_object("dog_small_intestine")
    # Duodenum
    duod_pts = [
        (-3.2, -0.6, -0.8),
        (-3.8, -0.8, -1.5),
        (-5.8, -1.1, -1.7),
        (-7.6, -1.4, -1.5),
        (-7.8, -1.8, -0.6),
        (-7.2, -2.0, 0.2)
    ]
    b.add_spline_tube(duod_pts, 0.42, 12)
    # Intestinal convoluted loops (空腸迴腸密集盤旋)
    jejunum_pts = []
    num_jejunum = 90
    for i in range(num_jejunum):
        t = i / float(num_jejunum - 1)
        angle = t * math.pi * 14.0
        r = 1.35 + 0.45 * math.cos(t * math.pi * 6)
        x = -6.2 - t * 3.5 + 0.4 * math.sin(angle * 1.5)
        y = -1.6 - 0.75 * math.sin(t * math.pi) + 0.35 * math.cos(angle * 2.2)
        z = 0.1 + r * math.sin(angle)
        jejunum_pts.append((x, y, z))
    b.add_spline_tube(jejunum_pts, 0.38, 12)

    # 12. dog_cecum (犬特徵 S 形螺旋盲腸)
    b.start_object("dog_cecum")
    cecum_pts = [
        (-7.8, 0.2, -1.1),
        (-8.3, -0.3, -1.5),
        (-8.8, 0.1, -1.7),
        (-9.2, -0.5, -1.3),
        (-9.6, -0.8, -1.6)
    ]
    b.add_spline_tube(cecum_pts, 0.42, 14,
        lambda off, t, ang: mul_vec(off, 1.0 + 0.15 * math.cos(t * 12 * math.pi)) # 袋狀盲囊感
    )

    # 13. dog_colon (犬結腸與直腸)
    b.start_object("dog_colon")
    colon_pts = [
        (-7.8, 0.2, -1.1),   # Ascending colon (升結腸)
        (-7.0, 0.9, -0.8),   # Right colic flexure
        (-7.2, 1.2, 0.2),    # Transverse colon (橫結腸)
        (-8.2, 1.1, 0.8),    # Left colic flexure
        (-9.8, 0.9, 0.7),    # Descending colon (降結腸)
        (-11.8, 0.8, 0.4),
        (-13.6, 0.6, 0.1),   # Rectum (直腸)
        (-14.8, 0.4, 0.0)
    ]
    b.add_spline_tube(colon_pts, 0.58, 14)

    # 14. dog_kidney_left (左腎)
    b.start_object("dog_kidney_left")
    b.add_sculpted_sphere((-8.2, 1.1, 1.3), (1.45, 0.95, 0.85), 20, 16,
        lambda x, y, z, th, ph: (x * 1.1, y, z * (1.0 - 0.28 * max(0, -z))) # 內側腎門凹陷
    )
    # Left ureter (左輸尿管)
    b.add_spline_tube([(-8.2, 1.0, 1.1), (-10.0, 0.4, 0.8), (-12.2, -0.2, 0.4)], 0.12, 10)

    # 15. dog_kidney_right (右腎)
    b.start_object("dog_kidney_right")
    b.add_sculpted_sphere((-6.2, 1.2, -1.25), (1.45, 0.95, 0.85), 20, 16,
        lambda x, y, z, th, ph: (x * 1.1, y, z * (1.0 - 0.28 * max(0, z))) # 內側腎門凹陷
    )
    # Right ureter (右輸尿管)
    b.add_spline_tube([(-6.2, 1.1, -1.1), (-9.0, 0.5, -0.8), (-12.2, -0.2, -0.4)], 0.12, 10)

    # 16. dog_urinary_bladder (膀胱)
    b.start_object("dog_urinary_bladder")
    b.add_sculpted_sphere((-12.8, -0.6, 0.0), (1.75, 1.25, 1.25), 22, 18,
        lambda x, y, z, th, ph: (x * (1.0 + 0.15 * (x / 1.75)), y, z) # 梨形膀胱頂與頸
    )
    # Urethra (尿道)
    b.add_spline_tube([(-14.2, -0.7, 0.0), (-15.2, -0.8, 0.0)], 0.22, 10)

    return b

def build_pig_anatomy():
    b = OBJBuilder()

    # 1. pig_os_rostri (拱土吻骨與吻軟骨)
    b.start_object("pig_os_rostri")
    # Rostral ossicle (三稜錐形吻骨)
    b.add_sculpted_sphere((13.6, 1.6, 0.0), (1.15, 0.85, 0.95), 20, 16,
        lambda x, y, z, th, ph: (x * (1.0 + 0.25 * math.cos(th)), y * 0.8, z)
    )
    # Snout disc cartilage ring (鼻鏡周邊拱土軟骨圈)
    snout_pts = []
    for i in range(25):
        ang = 2 * math.pi * i / 24.0
        y = 1.6 + 0.85 * math.sin(ang)
        z = 0.95 * math.cos(ang)
        snout_pts.append((14.4, y, z))
    b.add_spline_tube(snout_pts, 0.22, 12)

    # 2. pig_trachea_and_bronchus (氣管與特徵氣管支氣管)
    b.start_object("pig_trachea_and_bronchus")
    # Main trachea
    trachea_pts = []
    for i in range(24):
        t = i / 23.0
        x = 12.5 * (1 - t) + 1.2 * t
        y = 1.6 * (1 - t)**1.2 + 0.1 * t
        z = 0.0
        trachea_pts.append((x, y, z))
    b.add_spline_tube(trachea_pts, 0.52, 16,
        lambda off, t, ang: mul_vec(off, 1.0 + 0.12 * math.cos(t * 36 * math.pi))
    )
    # *** 豬著名標記：氣管支氣管 (Bronchus trachealis) ***
    # 位於隆凸前 3-5cm 直接發出伸向右肺尖葉！
    b.add_spline_tube([
        (3.8, 0.35, 0.0),
        (3.0, 0.9, -1.1),
        (2.4, 1.3, -1.8)
    ], 0.35, 12)
    # Carina bifurcation into mainstem bronchi
    b.add_spline_tube([(1.2, 0.1, 0.0), (0.4, -0.2, 0.8), (-0.2, -0.4, 1.3)], 0.35, 12)
    b.add_spline_tube([(1.2, 0.1, 0.0), (0.4, -0.2, -0.8), (-0.2, -0.4, -1.3)], 0.35, 12)

    # 3. pig_heart (豬心臟 - 圓卵形與冠狀溝脂肪)
    b.start_object("pig_heart")
    b.add_sculpted_sphere((1.0, -0.8, 0.15), (1.65, 1.85, 1.55), 24, 20,
        lambda x, y, z, th, ph: (
            x * (1.0 - 0.15 * (y / 1.85)), # 鈍圓心尖
            y,
            z * (1.0 + 0.12 * math.sin(ph * 2)) # 冠狀溝脂肪堆積隆起
        )
    )
    # Aorta and cranial vessels
    b.add_spline_tube([
        (0.9, 0.8, 0.1),
        (0.8, 1.8, -0.1),
        (0.0, 2.1, -0.2),
        (-1.4, 1.8, -0.25)
    ], 0.44, 14)

    # 4. pig_lungs (豬分葉肺臟)
    b.start_object("pig_lungs")
    # Left Lung (左肺：尖葉與心膈葉)
    b.add_sculpted_sphere((1.1, 0.4, 1.75), (1.75, 1.25, 0.95), 20, 16)
    b.add_sculpted_sphere((-1.0, 0.1, 1.95), (2.35, 1.45, 1.25), 22, 18)
    # Right Lung: Apical lobe (專門接氣管支氣管)
    b.add_sculpted_sphere((2.4, 1.2, -1.75), (1.35, 1.05, 0.85), 18, 14)
    # Right Lung: Middle, Caudal, and Accessory lobes
    b.add_sculpted_sphere((0.8, 0.2, -1.85), (1.55, 1.25, 0.95), 20, 16)
    b.add_sculpted_sphere((-1.1, 0.1, -2.05), (2.45, 1.55, 1.35), 22, 18)
    b.add_sculpted_sphere((-0.5, -0.8, -0.6), (1.45, 0.95, 0.95), 18, 14)

    # 5. pig_stomach_diverticulum (豬胃與特徵【胃憩室】盲囊)
    b.start_object("pig_stomach_diverticulum")
    # Main stomach
    stomach_pts = [
        (-2.2, 0.9, 0.2),
        (-3.4, 1.4, 0.8),
        (-4.8, 1.1, 1.3),
        (-5.8, -0.1, 1.1),
        (-5.5, -1.3, 0.3),
        (-4.2, -1.6, -0.5),
        (-3.0, -1.0, -0.7)
    ]
    b.add_spline_tube(stomach_pts, [0.7, 1.4, 1.7, 1.6, 1.4, 1.1, 0.65], 22,
        lambda off, t, ang: mul_vec(off, 1.0 + 0.12 * math.sin(ang * 3))
    )
    # *** 豬獨有解剖標誌：胃憩室 (Diverticulum ventriculi) ***
    # 位於胃底背側之圓錐形盲囊！
    b.add_sculpted_sphere((-4.4, 2.4, 0.8), (0.95, 1.25, 0.85), 18, 14,
        lambda x, y, z, th, ph: (x * (1.0 - 0.35 * (y / 1.25)), y, z * (1.0 - 0.35 * (y / 1.25))) # 錐形突出
    )
    # Torus pyloricus (幽門枕黏膜隆起)
    b.add_sculpted_sphere((-2.9, -0.9, -0.7), (0.45, 0.45, 0.45), 14, 12)

    # 6. pig_liver_lobules (龜甲網紋分葉肝臟)
    b.start_object("pig_liver_lobules")
    # Left lateral lobe
    b.add_sculpted_sphere((-2.0, 0.1, 1.5), (1.25, 1.85, 1.15), 22, 18,
        lambda x, y, z, th, ph: (x * 0.85, y, z * (1.0 + 0.05 * math.sin(ph * 8) * math.sin(th * 8))) # 龜甲網紋小葉感
    )
    # Left medial lobe
    b.add_sculpted_sphere((-1.8, -0.4, 0.7), (1.05, 1.65, 0.85), 20, 16)
    # Right medial lobe
    b.add_sculpted_sphere((-1.7, -0.5, -0.6), (1.05, 1.65, 0.85), 20, 16)
    # Right lateral lobe
    b.add_sculpted_sphere((-2.1, 0.2, -1.5), (1.25, 1.75, 1.15), 22, 18)
    # Caudate lobe
    b.add_sculpted_sphere((-2.6, 0.7, -0.9), (0.95, 1.05, 0.85), 18, 14)

    # 7. pig_gallbladder (膽囊)
    b.start_object("pig_gallbladder")
    b.add_sculpted_sphere((-1.5, -1.4, -0.7), (0.65, 1.15, 0.65), 16, 14)
    b.add_spline_tube([(-1.5, -0.4, -0.7), (-1.8, 0.0, -0.4), (-2.1, 0.1, -0.2)], 0.12, 10)

    # 8. pig_spleen (豬皮帶狀長脾臟 Strap-like spleen)
    b.start_object("pig_spleen")
    spleen_pts = [
        (-4.0, 1.8, 2.2),
        (-4.7, 0.9, 2.3),
        (-5.3, -0.1, 2.3),
        (-5.9, -1.1, 2.2),
        (-6.4, -2.1, 2.0),
        (-6.8, -3.0, 1.8)   # 長度均勻，筆直垂懸
    ]
    b.add_spline_tube(spleen_pts, 0.45, 16,
        lambda off, t, ang: (off[0] * 1.5, off[1] * 0.28, off[2] * 1.1) # 扁平皮帶狀 (Strap-like)
    )

    # 9. pig_pancreas (環狀胰臟)
    b.start_object("pig_pancreas")
    # Annular body encircling portal vein
    pancreas_ring = []
    for i in range(21):
        ang = 2 * math.pi * i / 20.0
        x = -3.2 + 0.65 * math.cos(ang)
        z = -0.4 + 0.65 * math.sin(ang)
        y = 0.5
        pancreas_ring.append((x, y, z))
    b.add_spline_tube(pancreas_ring, 0.32, 12)

    # 10. pig_spiral_colon (【圓錐螺旋結腸盤】Ansa spiralis coli / Colonic Cone)
    # *** 豬解剖最壯觀標誌性器官！***
    b.start_object("pig_spiral_colon")
    # (A) 外層向心迴旋 (Centripetal gyri - 具兩條肌帶與袋狀隆起)
    centripetal_pts = []
    num_centripetal = 110
    turns = 3.8
    for i in range(num_centripetal):
        t = i / float(num_centripetal - 1)
        ang = t * 2 * math.pi * turns
        # 圓錐半徑由大漸小
        r = 2.6 * (1.0 - t * 0.72)
        x = -7.8 + r * math.cos(ang)
        z = 0.2 + r * math.sin(ang)
        y = -1.8 + t * 2.8 # 螺旋向上朝向圓錐頂點
        centripetal_pts.append((x, y, z))
    b.add_spline_tube(centripetal_pts, 0.52, 14,
        lambda off, t, ang: mul_vec(off, 1.0 + 0.18 * math.sin(ang * 2)) # 肌帶隆起
    )

    # (B) 中央曲折返 (Central flexure)
    apex_pts = [
        (-7.8 + 0.7 * math.cos(2*math.pi*turns), 1.0, 0.2 + 0.7 * math.sin(2*math.pi*turns)),
        (-7.8, 1.25, 0.2),
        (-7.8 - 0.5 * math.cos(2*math.pi*turns), 0.9, 0.2 - 0.5 * math.sin(2*math.pi*turns))
    ]
    b.add_spline_tube(apex_pts, 0.38, 12)

    # (C) 內層離心迴旋 (Centrifugal gyri - 較平滑，從中心內部向下旋出)
    centrifugal_pts = []
    num_centrifugal = 95
    for i in range(num_centrifugal):
        t = i / float(num_centrifugal - 1)
        ang = 2 * math.pi * turns - t * 2 * math.pi * turns
        r = 0.6 + t * 1.3
        x = -7.8 + r * math.cos(ang)
        z = 0.2 + r * math.sin(ang)
        y = 0.9 - t * 2.5 # 從頂端內部向下旋出
        centrifugal_pts.append((x, y, z))
    b.add_spline_tube(centrifugal_pts, 0.36, 12)

    # 11. pig_cecum (圓筒狀粗盲腸)
    b.start_object("pig_cecum")
    cecum_pts = [
        (-6.8, -1.2, 1.8),
        (-7.6, -1.8, 2.0),
        (-8.5, -2.2, 1.9),
        (-9.2, -2.6, 1.6)
    ]
    b.add_spline_tube(cecum_pts, 0.85, 16,
        lambda off, t, ang: mul_vec(off, 1.0 + 0.15 * math.sin(ang * 3)) # 3條肌帶與3排盲囊
    )

    # 12. pig_kidneys (平滑多腎盞腎臟)
    b.start_object("pig_kidneys")
    # Left kidney (扁橢圓)
    b.add_sculpted_sphere((-6.8, 1.3, 1.35), (1.65, 0.75, 1.05), 20, 16)
    b.add_spline_tube([(-6.8, 1.2, 1.0), (-9.2, 0.5, 0.7), (-11.8, -0.2, 0.3)], 0.14, 10)
    # Right kidney (對稱排列)
    b.add_sculpted_sphere((-6.6, 1.3, -1.35), (1.65, 0.75, 1.05), 20, 16)
    b.add_spline_tube([(-6.6, 1.2, -1.0), (-9.2, 0.5, -0.7), (-11.8, -0.2, -0.3)], 0.14, 10)

    # 13. pig_urinary_bladder (膀胱)
    b.start_object("pig_urinary_bladder")
    b.add_sculpted_sphere((-12.5, -0.6, 0.0), (1.95, 1.35, 1.35), 22, 18,
        lambda x, y, z, th, ph: (x * (1.0 + 0.12 * (x / 1.95)), y, z)
    )
    b.add_spline_tube([(-14.0, -0.7, 0.0), (-15.2, -0.8, 0.0)], 0.25, 10)

    return b

def export_models():
    print("Generating High-Fidelity 3D Canine Visceral Anatomy Model...")
    dog_builder = build_dog_anatomy()
    dog_obj = dog_builder.to_obj_string()
    print(f"Dog OBJ generated: {len(dog_builder.vertices)} vertices, {sum(len(f) for f in dog_builder.objects.values())} faces across {len(dog_builder.objects)} organs.")

    print("Generating High-Fidelity 3D Porcine Visceral Anatomy Model...")
    pig_builder = build_pig_anatomy()
    pig_obj = pig_builder.to_obj_string()
    print(f"Pig OBJ generated: {len(pig_builder.vertices)} vertices, {sum(len(f) for f in pig_builder.objects.values())} faces across {len(pig_builder.objects)} organs.")

    # Read existing metadata from current files to keep perfect sync
    with open('models/dog_model_data.js', 'r', encoding='utf-8') as f:
        dog_text = f.read()
    with open('models/pig_model_data.js', 'r', encoding='utf-8') as f:
        pig_text = f.read()

    import re
    m_dog_meta = re.search(r'window\.DOG_METADATA\s*=\s*(\{.*?\});', dog_text, re.DOTALL)
    m_pig_meta = re.search(r'window\.PIG_METADATA\s*=\s*(\{.*?\});', pig_text, re.DOTALL)

    dog_meta = json.loads(m_dog_meta.group(1)) if m_dog_meta else {}
    pig_meta = json.loads(m_pig_meta.group(1)) if m_pig_meta else {}

    # Update face counts
    for obj_name, faces in dog_builder.objects.items():
        if obj_name in dog_meta:
            dog_meta[obj_name]["faceCount"] = len(faces)
        else:
            dog_meta[obj_name] = {"faceCount": len(faces)}
            
    for obj_name, faces in pig_builder.objects.items():
        if obj_name in pig_meta:
            pig_meta[obj_name]["faceCount"] = len(faces)
        else:
            pig_meta[obj_name] = {"faceCount": len(faces)}

    # Ensure kidney entries for dog match both left and right
    dog_meta["dog_kidney_left"] = {
        "nameZh": "左腎 (游離可觸診)",
        "nameEn": "Canine Left Kidney",
        "latin": "Ren sinister",
        "desc": "平滑單乳頭腎，外形呈扁蠶豆狀，位置較右腎靠後且懸垂游離，犬腹部觸診容易觸及。",
        "faceCount": len(dog_builder.objects.get("dog_kidney_left", []))
    }
    dog_meta["dog_kidney_right"] = {
        "nameZh": "右腎 (嵌於肝尾狀突窩)",
        "nameEn": "Canine Right Kidney",
        "latin": "Ren dexter",
        "desc": "位置較左腎靠前約半個腎長度，牢固嵌合於肝臟尾狀葉之腎窩（Renal fossa）內。",
        "faceCount": len(dog_builder.objects.get("dog_kidney_right", []))
    }

    # Write out dog_model_data.js
    with open('models/dog_model_data.js', 'w', encoding='utf-8') as f:
        f.write("// 3D DOG Visceral Organs Embedded Data (High-Fidelity Organic Sculpt, Zero CORS, 100% Offline)\n")
        f.write("window.DOG_METADATA = " + json.dumps(dog_meta, ensure_ascii=False) + ";\n\n")
        f.write("window.DOG_OBJ_DATA = `" + dog_obj + "`;\n")
    print("Saved models/dog_model_data.js")

    # Write out pig_model_data.js
    with open('models/pig_model_data.js', 'w', encoding='utf-8') as f:
        f.write("// 3D PIG Visceral Organs Embedded Data (High-Fidelity Organic Sculpt, Zero CORS, 100% Offline)\n")
        f.write("window.PIG_METADATA = " + json.dumps(pig_meta, ensure_ascii=False) + ";\n\n")
        f.write("window.PIG_OBJ_DATA = `" + pig_obj + "`;\n")
    print("Saved models/pig_model_data.js")

if __name__ == "__main__":
    export_models()
