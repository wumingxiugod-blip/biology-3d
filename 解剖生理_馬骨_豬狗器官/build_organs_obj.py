import math
import json
import os

out_dir = r"C:\Users\user\.gemini\antigravity\scratch\vet_anatomy_quiz\models"
os.makedirs(out_dir, exist_ok=True)

# -------------------------------------------------------------
# 幾何生成工具
# -------------------------------------------------------------
def create_sphere(radius, u_steps=18, v_steps=14, scale=(1.0, 1.0, 1.0), offset=(0.0, 0.0, 0.0), rot=(0.0, 0.0, 0.0)):
    verts = []
    faces = []
    rx, ry, rz = rot
    cx, sx = math.cos(rx), math.sin(rx)
    cy, sy = math.cos(ry), math.sin(ry)
    cz, sz = math.cos(rz), math.sin(rz)
    
    def transform(x, y, z):
        x *= scale[0]; y *= scale[1]; z *= scale[2]
        y1 = y * cx - z * sx; z1 = y * sx + z * cx
        x2 = x * cy + z1 * sy; z2 = -x * sy + z1 * cy
        x3 = x2 * cz - y1 * sz; y3 = x2 * sz + y1 * cz
        return (round(x3 + offset[0], 4), round(y3 + offset[1], 4), round(z2 + offset[2], 4))

    for v in range(v_steps + 1):
        th = v * math.pi / v_steps
        sth, cth = math.sin(th), math.cos(th)
        for u in range(u_steps + 1):
            phi = u * 2 * math.pi / u_steps
            x = radius * sth * math.cos(phi)
            y = radius * cth
            z = radius * sth * math.sin(phi)
            verts.append(transform(x, y, z))

    for v in range(v_steps):
        for u in range(u_steps):
            p1 = v * (u_steps + 1) + u
            p2 = p1 + u_steps + 1
            faces.append([p1, p2, p2 + 1, p1 + 1])
    return verts, faces

def create_tube(curve_pts, radius, radial_segs=10):
    verts = []
    faces = []
    for i, pt in enumerate(curve_pts):
        if i == 0:
            tg = [curve_pts[1][k] - curve_pts[0][k] for k in range(3)]
        elif i == len(curve_pts) - 1:
            tg = [curve_pts[-1][k] - curve_pts[-2][k] for k in range(3)]
        else:
            tg = [curve_pts[i+1][k] - curve_pts[i-1][k] for k in range(3)]
        
        t_len = math.sqrt(sum(t*t for t in tg)) or 1.0
        tg = [t / t_len for t in tg]
        up = [0, 1, 0] if abs(tg[1]) < 0.9 else [1, 0, 0]
        norm = [tg[1]*up[2] - tg[2]*up[1], tg[2]*up[0] - tg[0]*up[2], tg[0]*up[1] - tg[1]*up[0]]
        n_len = math.sqrt(sum(n*n for n in norm)) or 1.0
        norm = [n / n_len for n in norm]
        binorm = [tg[1]*norm[2] - tg[2]*norm[1], tg[2]*norm[0] - tg[0]*norm[2], tg[0]*norm[1] - tg[1]*norm[0]]

        r = radius if isinstance(radius, (int, float)) else radius(i / (len(curve_pts) - 1))
        for s in range(radial_segs):
            ang = s * 2 * math.pi / radial_segs
            ca = math.cos(ang) * r
            sa = math.sin(ang) * r
            x = pt[0] + norm[0]*ca + binorm[0]*sa
            y = pt[1] + norm[1]*ca + binorm[1]*sa
            z = pt[2] + norm[2]*ca + binorm[2]*sa
            verts.append((round(x, 4), round(y, 4), round(z, 4)))

    for i in range(len(curve_pts) - 1):
        for s in range(radial_segs):
            ns = (s + 1) % radial_segs
            p1 = i * radial_segs + s
            p2 = (i + 1) * radial_segs + s
            p3 = (i + 1) * radial_segs + ns
            p4 = i * radial_segs + ns
            faces.append([p1, p2, p3, p4])
    return verts, faces

def merge_mesh_list(meshes):
    all_v = []
    all_f = []
    off = 0
    for v, f in meshes:
        all_v.extend(v)
        for face in f:
            all_f.append([idx + off for idx in face])
        off += len(v)
    return all_v, all_f

def spline_interpolate(control_pts, num_pts=25):
    # Catmull-rom or simple cubic interpolation
    pts = []
    for step in range(num_pts):
        t = step / (num_pts - 1)
        # piece-wise linear/cubic
        idx = t * (len(control_pts) - 1)
        i0 = int(idx)
        i1 = min(i0 + 1, len(control_pts) - 1)
        frac = idx - i0
        # Smooth interpolation
        s = frac * frac * (3 - 2 * frac)
        p = [control_pts[i0][k] * (1 - s) + control_pts[i1][k] * s for k in range(3)]
        pts.append(p)
    return pts

# -------------------------------------------------------------
# 1. 🐕 狗內臟器官 3D 模型生成 (Canine Visceral Organs)
# -------------------------------------------------------------
dog_parts = {}

# (A) 大腦與小腦 (Brain: Cerebral Hemispheres & Cerebellum)
b_left = create_sphere(1.2, 16, 12, scale=(1.3, 0.9, 0.75), offset=(11.5, 4.4, 0.75))
b_right = create_sphere(1.2, 16, 12, scale=(1.3, 0.9, 0.75), offset=(11.5, 4.4, -0.75))
b_cereb = create_sphere(0.9, 14, 10, scale=(0.95, 1.1, 1.1), offset=(9.8, 3.8, 0))
b_olf = create_sphere(0.45, 10, 8, scale=(1.8, 0.6, 0.6), offset=(13.2, 3.9, 0.45))
b_orf = create_sphere(0.45, 10, 8, scale=(1.8, 0.6, 0.6), offset=(13.2, 3.9, -0.45))
dog_parts["dog_brain"] = {
    "nameZh": "大腦與小腦 (腦部總成)",
    "nameEn": "Canine Brain (Cerebrum & Cerebellum)",
    "latin": "Encephalon",
    "desc": "犬腦具發達之大腦雙半球（大腦皮質具十字溝與外側溝）與嗅球，後方為具蚓部之小腦。",
    "mesh": merge_mesh_list([b_left, b_right, b_cereb, b_olf, b_orf])
}

# (B) 氣管 (Trachea)
t_pts = spline_interpolate([[10.2, 3.2, 0], [7.5, 1.8, 0], [4.2, 0.9, 0], [1.5, 0.4, 0]], 30)
dog_parts["dog_trachea"] = {
    "nameZh": "氣管 (軟骨環氣道)",
    "nameEn": "Canine Trachea",
    "latin": "Trachea",
    "desc": "由 35-45 個透明軟骨 C 形環構成，背側由氣管肌封閉，向下延伸至心底部氣管分叉處。",
    "mesh": create_tube(t_pts, 0.48, 12)
}

# (C) 心臟與大動脈弓 (Heart & Great Vessels)
h_vent = create_sphere(2.2, 18, 14, scale=(0.95, 1.25, 0.85), offset=(0.6, -0.8, 0.2), rot=(0, 0, 0.35))
h_atria_l = create_sphere(0.9, 12, 10, scale=(1, 1, 0.8), offset=(1.2, 0.6, 0.8))
h_atria_r = create_sphere(0.9, 12, 10, scale=(1, 1, 0.8), offset=(1.3, 0.5, -0.5))
aorta_pts = spline_interpolate([[1.0, 0.8, 0.2], [1.2, 2.0, 0.1], [0.4, 2.4, -0.1], [-1.2, 1.8, -0.2]], 18)
h_aorta = create_tube(aorta_pts, 0.36, 10)
dog_parts["dog_heart"] = {
    "nameZh": "心臟 (心室、心房與主動脈弓)",
    "nameEn": "Canine Heart & Aortic Arch",
    "latin": "Cor",
    "desc": "斜置於第3至第6肋間，具左右心室、心房與冠狀溝，背側發出強大之主動脈弓。",
    "mesh": merge_mesh_list([h_vent, h_atria_l, h_atria_r, h_aorta])
}

# (D) 左肺 (Left Lung: 前葉與後葉)
l_cranial = create_sphere(1.6, 16, 12, scale=(1.2, 0.8, 0.9), offset=(1.8, 0.8, 1.6), rot=(0.2, 0.3, -0.4))
l_caudal = create_sphere(2.2, 18, 14, scale=(1.6, 0.95, 0.9), offset=(-0.8, 0.4, 2.0), rot=(0.1, 0.1, -0.2))
dog_parts["dog_lung_left"] = {
    "nameZh": "左肺 (左前葉・左後葉)",
    "nameEn": "Left Lung (Cranial & Caudal lobes)",
    "latin": "Pulmo sinister",
    "desc": "左肺分為深裂分隔之左前葉（再分顱部與尾部）與較大之左後葉，腹側形成心切跡。",
    "mesh": merge_mesh_list([l_cranial, l_caudal])
}

# (E) 右肺 (Right Lung: 4葉)
r_cranial = create_sphere(1.5, 14, 10, scale=(1.1, 0.85, 0.85), offset=(2.2, 0.9, -1.5), rot=(-0.2, -0.2, -0.4))
r_middle = create_sphere(1.4, 14, 10, scale=(1.0, 0.9, 0.8), offset=(1.0, 0.2, -2.1), rot=(-0.1, 0, -0.3))
r_caudal = create_sphere(2.4, 18, 14, scale=(1.7, 0.95, 0.9), offset=(-1.0, 0.3, -2.0), rot=(-0.1, -0.1, -0.2))
r_access = create_sphere(1.2, 14, 10, scale=(1.2, 0.9, 0.8), offset=(-0.4, -0.8, -0.4), rot=(0.1, 0.4, 0))
dog_parts["dog_lung_right"] = {
    "nameZh": "右肺 (前葉・中葉・後葉・副葉 4葉)",
    "nameEn": "Right Lung (4 Lobes)",
    "latin": "Pulmo dexter",
    "desc": "犬右肺體積大於左肺，由前葉、中葉、後葉與包繞後腔靜脈之副葉（Accessory lobe）構成。",
    "mesh": merge_mesh_list([r_cranial, r_middle, r_caudal, r_access])
}

# (F) 六葉巨積肝臟 (Canine Multi-lobed Liver)
liv_ll = create_sphere(1.8, 16, 12, scale=(1.1, 1.4, 0.6), offset=(-2.6, -0.2, 2.2), rot=(0.3, 0.2, -0.2))
liv_lm = create_sphere(1.6, 16, 12, scale=(0.9, 1.3, 0.6), offset=(-2.8, -0.1, 1.1), rot=(0.1, 0.1, -0.1))
liv_q  = create_sphere(1.4, 14, 10, scale=(0.8, 1.2, 0.6), offset=(-3.1, -0.4, 0.1))
liv_rm = create_sphere(1.7, 16, 12, scale=(0.9, 1.3, 0.6), offset=(-2.9, -0.1, -1.0), rot=(-0.1, -0.1, -0.1))
liv_rl = create_sphere(1.9, 16, 12, scale=(1.1, 1.4, 0.6), offset=(-2.5, -0.2, -2.1), rot=(-0.3, -0.2, -0.2))
liv_cp = create_sphere(1.3, 14, 10, scale=(0.9, 1.1, 0.7), offset=(-3.8, 0.6, -1.4), rot=(0, -0.3, 0.2))
dog_parts["dog_liver"] = {
    "nameZh": "六葉多裂肝臟 (左外側・左內側・方葉・右內側・右外側・尾狀葉)",
    "nameEn": "Canine Multi-lobed Liver (6 Lobes)",
    "latin": "Hepar",
    "desc": "犬體內最大實質消化腺，深裂分為6個獨立葉，緊貼橫膈面；尾狀葉具腎窩嵌合右腎。",
    "mesh": merge_mesh_list([liv_ll, liv_lm, liv_q, liv_rm, liv_rl, liv_cp])
}

# (G) 膽囊 (Gallbladder)
dog_parts["dog_gallbladder"] = {
    "nameZh": "膽囊 (膽囊窩與膽囊管)",
    "nameEn": "Canine Gallbladder",
    "latin": "Vesica biliaris",
    "desc": "梨形囊袋，深嵌於肝臟方葉與右內側葉之間的膽囊窩內，儲存濃縮肝細胞分泌之膽汁。",
    "mesh": create_sphere(0.85, 14, 12, scale=(0.75, 1.35, 0.75), offset=(-2.5, -1.2, -0.8), rot=(0.2, 0, 0.5))
}

# (H) 單胃 (J-Shaped Monogastric Stomach)
stom_pts = spline_interpolate([
    [-4.0, 1.4, 0.2],    # 賁門 Cardia
    [-5.6, 0.8, 1.3],    # 胃底 Fundus
    [-6.8, -0.8, 0.8],   # 胃體大彎 Greater curvature
    [-5.8, -1.8, -0.2],  # 幽門竇 Pyloric antrum
    [-4.5, -1.2, -0.9]   # 幽門 Pylorus
], 28)
def stom_radius(t):
    # 胃底與胃體較粗膨大，兩端較細
    return 1.1 + math.sin(t * math.pi) * 0.75

dog_parts["dog_stomach"] = {
    "nameZh": "單胃 (胃底・胃體・幽門・大彎與小彎)",
    "nameEn": "Canine Simple Stomach (J-shaped)",
    "latin": "Gaster (Ventriculus)",
    "desc": "橫置於腹前部左側之 C/J 形單胃，容量約 0.5-8 公升；大彎側連接大網膜與舌狀脾臟。",
    "mesh": create_tube(stom_pts, stom_radius, 14)
}

# (I) 舌狀脾臟 (Tongue-like Spleen)
dog_parts["dog_spleen"] = {
    "nameZh": "舌狀脾臟 (體內最大儲血器官)",
    "nameEn": "Canine Spleen (Tongue-shaped)",
    "latin": "Splen (Lien)",
    "desc": "暗紅色長舌狀扁平器官，背端較窄位於左季肋部，腹端較寬游離於臍部大網膜內，能強力收縮供血。",
    "mesh": create_sphere(1.2, 16, 12, scale=(0.55, 3.4, 0.28), offset=(-6.8, -0.6, 2.3), rot=(0.2, 0.3, 0.32))
}

# (J) V形胰臟 (V-shaped Pancreas)
pan_r = spline_interpolate([[-4.4, -1.1, -0.9], [-5.2, -1.5, -1.8], [-6.4, -1.8, -2.1]], 14)
pan_l = spline_interpolate([[-4.4, -1.1, -0.9], [-5.4, -0.5, -0.2], [-6.2, 0.2, 0.5]], 14)
mesh_pr = create_tube(pan_r, 0.32, 8)
mesh_pl = create_tube(pan_l, 0.30, 8)
dog_parts["dog_pancreas"] = {
    "nameZh": "V形胰臟 (左葉與右葉)",
    "nameEn": "Canine V-shaped Pancreas",
    "latin": "Pancreas",
    "desc": "呈倒 V 形，右葉緊附於十二指腸降部，左葉延伸於胃背側大網膜深葉內，分泌胰液與胰島素。",
    "mesh": merge_mesh_list([mesh_pr, mesh_pl])
}

# (K) 小腸曲折群 (Small Intestine Loops)
sm_pts = []
for step in range(60):
    t = step / 59.0
    rad = 1.6 + math.sin(t * math.pi * 5) * 0.4
    x = -7.5 + math.sin(t * math.pi * 4) * 1.8
    y = -1.8 + math.cos(t * math.pi * 6) * 1.1
    z = -0.5 + math.sin(t * math.pi * 3) * 1.6
    sm_pts.append([x, y, z])
dog_parts["dog_small_intestine"] = {
    "nameZh": "小腸 (空腸迴腸曲折群)",
    "nameEn": "Canine Small Intestines",
    "latin": "Intestinum tenue",
    "desc": "佔據中腹部主要空間，由十二指腸、高度曲折之空腸與短迴腸構成，吸收營養核心部位。",
    "mesh": create_tube(sm_pts, 0.35, 8)
}

# (L) S形螺旋盲腸 (Canine S-shaped Cecum - 犬特徵標記)
cecum_pts = spline_interpolate([
    [-7.2, 0.3, -1.2],
    [-7.8, -0.4, -1.7],
    [-8.3, 0.1, -1.2],
    [-8.7, -0.6, -1.5],
    [-9.0, -0.2, -1.0]
], 24)
dog_parts["dog_cecum"] = {
    "nameZh": "犬特徵 S 形螺旋盲腸 (標誌性消化器官)",
    "nameEn": "Canine S-shaped Cecum",
    "latin": "Caecum",
    "desc": "犬標誌性解剖特徵！呈雙重 S 形扭曲或指狀螺旋迴旋，位於右側第2-4腰椎下方迴盲口側邊。",
    "mesh": create_tube(cecum_pts, 0.44, 10)
}

# (M) 結腸與直腸 (Colon & Rectum)
col_pts = spline_interpolate([
    [-7.4, 0.5, -1.1],   # 升結腸
    [-7.0, 1.5, 0.0],    # 橫結腸
    [-9.5, 1.6, 0.8],    # 降結腸
    [-13.0, 1.2, 0.2],   # 直腸
    [-15.0, 0.7, 0.0]    # 肛門段
], 30)
dog_parts["dog_colon"] = {
    "nameZh": "結腸與直腸 (升・橫・降結腸)",
    "nameEn": "Canine Colon & Rectum",
    "latin": "Colon et Rectum",
    "desc": "呈馬蹄形或倒U形排列，吸收水分與電解質，末端直腸穿經骨盆腔通往肛門囊。",
    "mesh": create_tube(col_pts, 0.62, 12)
}

# (N) 雙腎 (Kidneys: Bilateral Bean-shaped)
k_l = create_sphere(1.2, 16, 12, scale=(1.5, 0.85, 0.9), offset=(-8.8, 1.2, 1.4), rot=(0, 0.2, 0))
k_r = create_sphere(1.2, 16, 12, scale=(1.5, 0.85, 0.9), offset=(-7.2, 1.3, -1.5), rot=(0, -0.2, 0))
dog_parts["dog_kidneys"] = {
    "nameZh": "雙側腎臟 (右腎前位・左腎游離)",
    "nameEn": "Canine Kidneys (Left & Right)",
    "latin": "Renes",
    "desc": "平滑單乳頭腎，蠶豆狀；右腎位置較前固定於肝尾狀葉窩，左腎位置較後且游離可觸診。",
    "mesh": merge_mesh_list([k_l, k_r])
}

# (O) 膀胱 (Urinary Bladder)
dog_parts["dog_urinary_bladder"] = {
    "nameZh": "膀胱 (頂・體・頸部)",
    "nameEn": "Canine Urinary Bladder",
    "latin": "Vesica urinaria",
    "desc": "厚壁平滑肌囊，充盈時向前突入腹腔底壁，空虛時縮回骨盆腔底部，向後續接尿道。",
    "mesh": create_sphere(1.6, 16, 14, scale=(1.3, 0.9, 0.9), offset=(-12.8, -0.5, 0))
}

# -------------------------------------------------------------
# 2. 🐖 豬特徵器官 3D 模型生成 (Porcine Characteristic Viscera)
# -------------------------------------------------------------
pig_parts = {}

# (A) 拱土吻骨與吻軟骨 (Os rostri)
snout_pad = create_sphere(1.8, 16, 12, scale=(0.5, 1.2, 1.4), offset=(13.8, 2.8, 0))
rostral_bone = create_sphere(0.7, 12, 10, scale=(1.4, 0.6, 0.6), offset=(12.8, 2.8, 0))
pig_parts["pig_rostral_bone"] = {
    "nameZh": "拱土吻骨與吻軟骨 (豬特化骨骼標記)",
    "nameEn": "Porcine Rostral Bone & Cartilage",
    "latin": "Os rostri",
    "desc": "豬特化之拱土覓食骨骼！位於鼻中隔前部鼻鏡深面，使豬鼻具備極強掘土與觸覺探索力學強度。",
    "mesh": merge_mesh_list([snout_pad, rostral_bone])
}

# (B) 氣管與「氣管支氣管」 (Trachea & Tracheal Bronchus - 豬胸腔最大標記)
pig_trach_pts = spline_interpolate([[11.5, 2.4, 0], [8.5, 1.5, 0], [5.0, 0.8, 0], [1.8, 0.3, 0]], 25)
trach_main = create_tube(pig_trach_pts, 0.52, 12)
# 特徵氣管支氣管：在氣管分叉前 3-5cm 獨立發出直達右前肺葉！
bronch_pts = spline_interpolate([[3.8, 0.6, 0], [2.6, 0.9, -1.2], [1.5, 1.3, -1.8]], 15)
trach_branch = create_tube(bronch_pts, 0.34, 10)
pig_parts["pig_trachea_and_bronchus"] = {
    "nameZh": "氣管與【氣管支氣管】(豬標誌性解剖特徵)",
    "nameEn": "Porcine Trachea & Tracheal Bronchus",
    "latin": "Trachea et Bronchus trachealis",
    "desc": "豬最著名之胸腔解剖標誌！在氣管抵達隆凸分叉前約3-5cm，直接獨立發出一支支氣管專屬供應右肺尖葉！",
    "mesh": merge_mesh_list([trach_main, trach_branch])
}

# (C) 心臟 (Heart)
pig_parts["pig_heart"] = {
    "nameZh": "豬心臟 (冠狀溝脂肪球)",
    "nameEn": "Porcine Heart",
    "latin": "Cor",
    "desc": "形似圓卵形，冠狀溝脂肪豐富，心尖鈍圓，完全位於第2至第5肋間之胸腔縱隔內。",
    "mesh": create_sphere(2.3, 18, 14, scale=(1.05, 1.2, 0.92), offset=(1.2, -0.9, 0.2))
}

# (D) 分葉肺臟 (Lungs)
p_lung_l = create_sphere(2.4, 16, 12, scale=(1.7, 0.9, 1.1), offset=(0.5, 0.6, 1.7), rot=(0.1, 0.1, -0.2))
p_lung_r = create_sphere(2.7, 18, 14, scale=(1.8, 0.95, 1.1), offset=(0.7, 0.5, -1.7), rot=(-0.1, -0.1, -0.2))
pig_parts["pig_lungs"] = {
    "nameZh": "豬分葉肺臟 (右尖葉由氣管支氣管獨立供應)",
    "nameEn": "Porcine Lobulated Lungs",
    "latin": "Pulmones",
    "desc": "右肺分為尖葉、心葉、膈葉與副葉；其右肺尖葉直接由氣管支氣管單獨通氣。",
    "mesh": merge_mesh_list([p_lung_l, p_lung_r])
}

# (E) 胃與特徵【胃憩室】 (Stomach & Diverticulum ventriculi)
stom_base = create_sphere(2.8, 20, 16, scale=(1.35, 0.95, 0.9), offset=(-3.8, -0.2, 0.2))
# 特徵錐狀盲囊：胃憩室
divert_pts = spline_interpolate([[-4.6, 0.6, 0.5], [-5.4, 1.6, 0.8], [-6.0, 2.5, 1.0]], 15)
def div_radius(t): return 1.1 * (1.0 - t * 0.7)
divert_mesh = create_tube(divert_pts, div_radius, 12)
# 幽門枕肌肉隆起
torus = create_sphere(0.65, 12, 10, scale=(1, 1, 0.8), offset=(-2.6, -0.8, -0.8))
pig_parts["pig_stomach_diverticulum"] = {
    "nameZh": "胃與【胃憩室】盲囊 (豬獨有標誌器官)",
    "nameEn": "Porcine Stomach & Diverticulum ventriculi",
    "latin": "Ventriculus et Diverticulum ventriculi",
    "desc": "豬特徵器官！胃底背側特化出一圓錐形盲囊袋「胃憩室」；幽門口處具括約肌黏膜隆起「幽門枕(Torus pyloricus)」。",
    "mesh": merge_mesh_list([stom_base, divert_mesh, torus])
}

# (F) 龜甲網紋分葉肝臟 (Interlobular Connective Tissue Liver)
liv_p1 = create_sphere(2.2, 16, 12, scale=(1.1, 1.3, 0.7), offset=(-1.8, -0.6, 1.6), rot=(0.2, 0.1, -0.1))
liv_p2 = create_sphere(2.4, 18, 14, scale=(1.2, 1.4, 0.8), offset=(-2.0, -0.5, 0.0))
liv_p3 = create_sphere(2.2, 16, 12, scale=(1.1, 1.3, 0.7), offset=(-1.8, -0.6, -1.6), rot=(-0.2, -0.1, -0.1))
pig_parts["pig_liver_lobules"] = {
    "nameZh": "龜甲網紋分葉肝臟 (小葉間結締組織發達)",
    "nameEn": "Porcine Liver (Lobulated)",
    "latin": "Hepar",
    "desc": "豬肝小葉間結締組織極為發達，將每個肝小葉完全包裹，使肝臟表面呈現清晰之多角形龜甲狀網紋。",
    "mesh": merge_mesh_list([liv_p1, liv_p2, liv_p3])
}

# (G) 膽囊 (Gallbladder)
pig_parts["pig_gallbladder"] = {
    "nameZh": "膽囊 (右內側葉窩)",
    "nameEn": "Porcine Gallbladder",
    "latin": "Vesica biliaris",
    "desc": "橢圓梨形膽囊，位於右內側葉切跡深面，膽囊管與肝管匯合為膽總管注入十二指腸。",
    "mesh": create_sphere(0.85, 14, 12, scale=(0.8, 1.3, 0.8), offset=(-1.4, -1.6, -0.8))
}

# (H) 帶狀長脾臟 (Strap-like Spleen)
pig_parts["pig_spleen"] = {
    "nameZh": "帶狀扁長脾臟 (皮帶狀 Strap-like spleen)",
    "nameEn": "Porcine Strap-like Spleen",
    "latin": "Lien (Splen)",
    "desc": "呈極為修長之皮帶狀（Strap-like），寬度均勻，沿胃大彎左側縱向向下延伸，紅髓儲血豐富。",
    "mesh": create_sphere(1.0, 16, 12, scale=(0.55, 3.8, 0.25), offset=(-4.9, -1.2, 2.1), rot=(0.2, 0.3, 0.15))
}

# (I) 環狀胰臟 (Annular Pancreas)
pan_ring = []
for s in range(24):
    ang = s * 2 * math.pi / 23.0
    pan_ring.append([-3.2 + math.cos(ang)*1.2, 0.6 + math.sin(ang)*0.6, -0.4 + math.sin(ang)*0.8])
pig_parts["pig_pancreas"] = {
    "nameZh": "環狀胰臟 (門靜脈穿環)",
    "nameEn": "Porcine Pancreas",
    "latin": "Pancreas",
    "desc": "豬胰臟體部環繞門靜脈形成胰環（Annulus pancreatis），具獨立副胰管通入十二指腸。",
    "mesh": create_tube(pan_ring, 0.32, 8)
}

# (J) 圓錐螺旋結腸盤 (Spiral Colon / Colonic Cone - 豬最著名的解剖特徵！)
# 外層向心迴旋 (Centripetal turns) 往圓錐尖端 + 尖端中央曲 + 內層離心迴旋 (Centrifugal turns)
cone_spiral_pts = []
# 1. 向心迴旋 (向頂點旋轉，外層半徑較大)
num_turns = 4
for step in range(50):
    t = step / 49.0
    ang = t * math.pi * 2 * num_turns
    rad = 2.6 * (1.0 - t * 0.65)
    y = -2.2 + t * 2.8
    x = -8.2 + math.cos(ang) * rad
    z = -0.4 + math.sin(ang) * rad
    cone_spiral_pts.append([x, y, z])

# 2. 離心迴旋 (從頂點向底面旋轉，內層半徑較小)
for step in range(40):
    t = step / 39.0
    ang = (1.0 - t) * math.pi * 2 * num_turns + math.pi
    rad = 1.0 * (1.0 - (1.0 - t) * 0.5)
    y = 0.6 - t * 2.6
    x = -8.2 + math.cos(ang) * rad
    z = -0.4 + math.sin(ang) * rad
    cone_spiral_pts.append([x, y, z])

pig_parts["pig_spiral_colon"] = {
    "nameZh": "圓錐螺旋結腸盤【結腸錐】(豬最著名標誌器官)",
    "nameEn": "Porcine Spiral Colon (Colonic Cone)",
    "latin": "Colon spirale (Ansa spiralis coli)",
    "desc": "豬解剖第一大考點！升結腸高度特化盤旋成圓錐狀螺旋盤：外層為寬大具肌帶之向心迴旋，頂端中央曲折返後，內層為平滑離心迴旋！",
    "mesh": create_tube(cone_spiral_pts, 0.44, 10)
}

# (K) 圓筒狀粗盲腸 (Cylindrical Cecum)
cecum_p = spline_interpolate([[-7.0, -0.6, 1.8], [-7.6, -1.8, 1.9], [-8.4, -2.8, 1.6]], 16)
pig_parts["pig_cecum"] = {
    "nameZh": "圓筒狀粗盲腸 (3條肌帶與3排盲囊)",
    "nameEn": "Porcine Cylindrical Cecum",
    "latin": "Caecum",
    "desc": "粗大圓筒狀盲囊，長約 30-40cm，具 3 條結腸帶（Taeniae）與 3 排袋狀囊（Haustra），盲端朝向後下方。",
    "mesh": create_tube(cecum_p, 0.95, 12)
}

# (L) 平滑多腎盞腎臟 (Kidneys: Multipyramidal)
kp_l = create_sphere(1.4, 16, 12, scale=(1.6, 0.7, 0.95), offset=(-6.8, 1.2, 1.3))
kp_r = create_sphere(1.4, 16, 12, scale=(1.6, 0.7, 0.95), offset=(-6.6, 1.2, -1.3))
pig_parts["pig_kidneys"] = {
    "nameZh": "平滑多腎盞腎臟 (雙側對稱扁橢圓形)",
    "nameEn": "Porcine Kidneys (Multipyramidal)",
    "latin": "Renes",
    "desc": "表面平滑但內部具多個腎錐體與小腎盞，外觀扁平橢圓，左右對稱排列於最後胸椎至第4腰椎下方。",
    "mesh": merge_mesh_list([kp_l, kp_r])
}

# (M) 膀胱 (Urinary Bladder)
pig_parts["pig_urinary_bladder"] = {
    "nameZh": "豬膀胱 (巨大平滑肌囊)",
    "nameEn": "Porcine Urinary Bladder",
    "latin": "Vesica urinaria",
    "desc": "容量巨大之肌性囊袋，充盈時向前膨展延伸至下腹部臍區腹壁。",
    "mesh": create_sphere(1.7, 16, 14, scale=(1.25, 0.9, 0.9), offset=(-12.4, -0.6, 0))
}

# -------------------------------------------------------------
# 導出 OBJ 檔案與對應的 JS 封裝檔
# -------------------------------------------------------------
def export_model_package(animal_key, parts_dict):
    obj_file = os.path.join(out_dir, f"{animal_key}_organs_model.obj")
    js_file = os.path.join(out_dir, f"{animal_key}_model_data.js")
    
    meta_dict = {}
    
    print(f"Exporting {animal_key} model ({len(parts_dict)} anatomical parts)...")
    
    with open(obj_file, "w", encoding="ascii") as f_obj:
        f_obj.write(f"# Realistic 3D {animal_key.upper()} Visceral Organs Model\n")
        
        vert_offset = 0
        for part_id, data in parts_dict.items():
            verts, faces = data["mesh"]
            meta_dict[part_id] = {
                "nameZh": data["nameZh"],
                "nameEn": data["nameEn"],
                "latin": data["latin"],
                "desc": data["desc"],
                "faceCount": len(faces)
            }
            
            # Write vertices
            for v in verts:
                f_obj.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
            
            # Write group
            f_obj.write(f"\ng {part_id}\n")
            f_obj.write(f"o {part_id}\n")
            for face in faces:
                # 1-based index
                f_obj.write("f " + " ".join(str(idx + vert_offset + 1) for idx in face) + "\n")
            
            vert_offset += len(verts)

    # Read back OBJ content
    with open(obj_file, "r", encoding="ascii") as f_obj:
        obj_text = f_obj.read()

    # Write JS file
    with open(js_file, "w", encoding="utf-8") as f_js:
        var_prefix = animal_key.upper()
        f_js.write(f"// 3D {animal_key.upper()} Visceral Organs Embedded Data (Zero CORS, 100% Offline)\n")
        f_js.write(f"window.{var_prefix}_METADATA = ")
        json.dump(meta_dict, f_js, ensure_ascii=False)
        f_js.write(";\n\n")
        f_js.write(f"window.{var_prefix}_OBJ_DATA = `")
        safe_text = obj_text.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
        f_js.write(safe_text)
        f_js.write("`;\n")

    print(f"Exported {animal_key} successfully! OBJ: {os.path.getsize(obj_file)} B, JS: {os.path.getsize(js_file)} B")

export_model_package("dog", dog_parts)
export_model_package("pig", pig_parts)
print("All animal 3D organ packages generated successfully!")
