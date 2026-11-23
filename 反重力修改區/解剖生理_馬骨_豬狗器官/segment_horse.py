import collections
import json
import os

obj_path = r"C:\Users\user\.gemini\antigravity\scratch\vet_anatomy_quiz\models\horse_skeleton.obj"
out_obj = r"C:\Users\user\.gemini\antigravity\scratch\vet_anatomy_quiz\models\horse_skeleton_segmented.obj"
out_json = r"C:\Users\user\.gemini\antigravity\scratch\vet_anatomy_quiz\models\horse_skeleton_metadata.json"

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

metadata = {}

def classify_component(c, idx):
    comp_v = set()
    for fi in c:
        for vi in faces[fi]:
            comp_v.add(vi)
    xs = [vertices[vi][0] for vi in comp_v]
    ys = [vertices[vi][1] for vi in comp_v]
    zs = [vertices[vi][2] for vi in comp_v]
    cx = (min(xs) + max(xs)) / 2
    cy = (min(ys) + max(ys)) / 2
    cz = (min(zs) + max(zs)) / 2
    abs_cx = abs(cx)
    is_left = cx < -3.5
    is_right = cx > 3.5
    side_zh = "左側" if is_left else ("右側" if is_right else "中央")
    side_en = "Left" if is_left else ("Right" if is_right else "Central")
    side_key = "l" if is_left else ("r" if is_right else "mid")

    # Head region: Z > 95, Y > 165
    if cz > 95 and cy > 165:
        if len(c) > 3000:
            key = f"cranium_{idx}"
            return key, "馬頭顱骨 (Cranium)", "Cranium", "Os cranii", "馬頭部腦顱與面部骨骼總成，包含額竇、面脊與骨性眼眶。"
        elif cy < 200 and cz > 95:
            key = f"mandible_{idx}"
            return key, "馬下頜骨 (Mandibula)", "Mandible", "Mandibula", "下頜切跡為面動脈搏動檢查點，具巨大下頜支供嚼肌附著。"
        key = f"facial_bones_{idx}"
        return key, "顱面部骨骼 (Ossa faciei)", "Facial Bones", "Ossa faciei", "包含上頜骨、鼻骨、切齒骨等面部骨骼結構。"

    # Cervical: 60 < Z <= 95, Y > 145, central
    if 60 < cz <= 95 and cy > 145 and abs_cx < 12:
        key = f"cervical_vert_{idx}"
        return key, "頸椎 (Vertebrae cervicales)", "Cervical Vertebrae", "Vertebrae cervicales", "馬具7枚頸椎，包含寬大寰椎翼(C1)與發達齒突之樞椎(C2)。"

    # Thoracic spine: 10 < Z <= 60, Y > 145, central
    if 10 < cz <= 60 and cy > 145 and abs_cx < 12:
        key = f"thoracic_vert_{idx}"
        return key, "胸椎與髻甲高棘突 (Vertebrae thoracicae)", "Thoracic Vertebrae & Wither", "Vertebrae thoracicae", "T1-T5具有極高背側棘突，構成馬體最高點「髻甲部(Withers)」。"

    # Lumbar spine: -60 < Z <= 10, Y > 150, central
    if -60 < cz <= 10 and cy > 150 and abs_cx < 12:
        key = f"lumbar_vert_{idx}"
        return key, "腰椎 (Vertebrae lumbales)", "Lumbar Vertebrae", "Vertebrae lumbales", "共6枚腰椎，特徵為寬扁水平橫突與橫突間關節。"

    # Sacrum & Caudal: Z <= -60, Y > 150, central
    if cz <= -60 and cy > 150 and abs_cx < 10:
        if cz < -85:
            key = f"caudal_vert_{idx}"
            return key, "尾椎 (Vertebrae caudales)", "Caudal Vertebrae", "Vertebrae caudales", "馬尾椎約15-21枚，構成馬尾骨骼基底。"
        key = f"sacrum_{idx}"
        return key, "薦骨 (Os sacrum)", "Sacrum", "Os sacrum", "由5枚薦椎癒合而成之三角形堅固骨板，與骨盆髂骨緊密形成薦髂關節。"

    # Pelvis: -110 < Z < -50, Y > 120
    if -110 < cz < -50 and cy > 120 and (abs_cx > 8 or len(c) > 1800):
        key = f"pelvis_{side_key}_{idx}"
        return key, f"{side_zh}骨盆 (Pelvis - 髂骨與坐骨)", f"{side_en} Pelvis", "Pelvis", "包含髖結節(腰角)、薦結節與坐骨結節(臀角)，構成強大後肢推進支架。"

    # Ribs: -40 < Z < 25, 95 < Y < 150
    if -40 < cz < 25 and 95 < cy < 150:
        if abs_cx < 5 and cy < 125:
            key = f"sternum_{idx}"
            return key, "胸骨 (Sternum)", "Sternum", "Sternum", "由胸骨柄、胸骨體與劍突軟骨構成，保護心肺與胸腔臟器。"
        key = f"ribs_{side_key}_{idx}"
        return key, f"{side_zh}肋骨群 (Costae 18對)", f"{side_en} Ribs", "Costae", "馬共18對肋骨（8對真肋、10對假肋），形成極為寬闊深邃的胸廓。"

    # Forelimb: Z > 0, abs_cx > 6
    if cz > 5 and abs_cx > 6:
        if cy > 125:
            key = f"scapula_{side_key}_{idx}"
            return key, f"{side_zh}肩胛骨 (Scapula)", f"{side_en} Scapula", "Scapula", "背側具肩胛軟骨擴充肌肉附著，無鎖骨，完全藉由肌肉懸吊前軀。"
        elif 90 <= cy <= 125:
            key = f"humerus_{side_key}_{idx}"
            return key, f"{side_zh}肱骨 (Humerus)", f"{side_en} Humerus", "Humerus", "粗壯長骨，近端具巨大大結節與結節間溝，傳導前肢強大衝擊力。"
        elif 55 <= cy < 90:
            key = f"radius_ulna_{side_key}_{idx}"
            return key, f"{side_zh}橈骨與尺骨 (Radius & Ulna)", f"{side_en} Radius & Ulna", "Radius et Ulna", "尺骨近端特化為粗大鷹嘴突(Olecranon)，遠端與橈骨緊密癒合。"
        elif 45 <= cy < 55:
            key = f"carpal_{side_key}_{idx}"
            return key, f"{side_zh}腕骨群 (Ossa carpi - 馬前膝)", f"{side_en} Carpal Bones", "Ossa carpi", "相當於人類的手腕，由近側列與遠側列小骨構成，常受運動衝擊力。"
        elif 18 <= cy < 45:
            key = f"cannon_fore_{side_key}_{idx}"
            return key, f"{side_zh}前大砲骨 (第三掌骨 Metacarpal III)", f"{side_en} Fore Cannon Bone", "Os metacarpale III", "馬最主要之單趾承重長骨，兩側緊附第二、第四副掌骨(夾骨)。"
        elif 10 <= cy < 18:
            key = f"pastern_fore_{side_key}_{idx}"
            return key, f"{side_zh}前肢繫骨 (第一指骨 Phalanx proximalis)", f"{side_en} Fore Pastern Bone", "Phalanx proximalis", "連接球節與冠骨，斜向地面，吸收奔跑時的垂直下壓震盪。"
        elif 4 <= cy < 10:
            key = f"coronet_fore_{side_key}_{idx}"
            return key, f"{side_zh}前肢冠骨與舟狀骨 (Phalanx media)", f"{side_en} Fore Coronet Bone", "Phalanx media", "短柱狀第二指骨，掌側深面緊鄰舟狀骨滑車關節。"
        else:
            key = f"coffin_fore_{side_key}_{idx}"
            return key, f"{side_zh}前肢蹄骨 (第三指骨 Os ungulare)", f"{side_en} Fore Coffin Bone", "Os ungulare", "形如馬蹄之半月錐形骨，完全包覆於蹄壁角質鞘內，易發蹄葉炎。"

    # Hindlimb: Z < 5, abs_cx > 6
    if cz <= 5 and abs_cx > 6:
        if 95 <= cy <= 145:
            key = f"femur_{side_key}_{idx}"
            return key, f"{side_zh}股骨 (Os femoris - 第三轉子)", f"{side_en} Femur & Third Trochanter", "Os femoris", "體內最粗大長骨，外側特化顯著之「第三轉子(Third trochanter)」，為馬特徵。"
        elif 55 <= cy < 95:
            key = f"tibia_fibula_{side_key}_{idx}"
            return key, f"{side_zh}脛骨與腓骨 (Tibia & Fibula)", f"{side_en} Tibia & Fibula", "Tibia et Fibula", "脛骨為小腿主要承重骨，腓骨退化為近端小骨刺；近側形成膝關節。"
        elif 45 <= cy < 55:
            key = f"tarsus_calcaneus_{side_key}_{idx}"
            return key, f"{side_zh}飛節與跟骨結節 (Tarsus & Calcaneus)", f"{side_en} Hock & Calcaneus", "Tarsus et Calcaneus", "相當於人類腳後跟，跟骨結節向後上方突出形成飛節尖，附著跟腱。"
        elif 16 <= cy < 45:
            key = f"cannon_hind_{side_key}_{idx}"
            return key, f"{side_zh}後大砲骨 (第三蹠骨 Metatarsal III)", f"{side_en} Hind Cannon Bone", "Os metatarsale III", "斷面呈圓形，較前砲骨略長，後肢主要支撐與推進骨。"
        elif 9 <= cy < 16:
            key = f"pastern_hind_{side_key}_{idx}"
            return key, f"{side_zh}後肢繫骨 (第一趾骨)", f"{side_en} Hind Pastern Bone", "Phalanx proximalis", "後肢球節下方第一趾骨，呈短管狀斜向下方。"
        elif 3 <= cy < 9:
            key = f"coronet_hind_{side_key}_{idx}"
            return key, f"{side_zh}後肢冠骨 (第二趾骨)", f"{side_en} Hind Coronet Bone", "Phalanx media", "後肢第二趾骨，介於繫骨與後蹄骨之間。"
        else:
            key = f"coffin_hind_{side_key}_{idx}"
            return key, f"{side_zh}後肢蹄骨 (第三趾骨)", f"{side_en} Hind Coffin Bone", "Os ungulare", "後蹄內部骨骼，較前蹄骨略尖窄，推動馬體向前加速。"

    # Fallback
    if cy > 130:
        key = f"vertebra_{idx}"
        return key, "脊柱椎骨 (Vertebra)", "Vertebra", "Vertebra", "中軸脊柱保護脊髓，維持軀體縱向力學穩定性。"
    elif cy > 50:
        key = f"limb_bone_{side_key}_{idx}"
        return key, f"{side_zh}四肢長骨 (Os longum)", f"{side_en} Limb Bone", "Os longum", "支持體重與槓桿運動之管狀骨。"
    else:
        key = f"phalanx_sesamoid_{side_key}_{idx}"
        return key, f"{side_zh}趾骨與種子骨 (Ossa digitorum)", f"{side_en} Digital Bone", "Ossa digitorum", "輔助肌腱滑動、分散趾部強烈著地衝擊之力學骨。"

print("Writing clean OBJ and metadata JSON...")
with open(out_obj, 'w', encoding='ascii') as out:
    out.write("# Realistic Anatomical Horse Skeleton Model\n")
    for v in vertices:
        out.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
    
    for i, c in enumerate(components):
        key, name_zh, name_en, latin, desc = classify_component(c, i)
        metadata[key] = {
            "nameZh": name_zh,
            "nameEn": name_en,
            "latin": latin,
            "desc": desc,
            "faceCount": len(c)
        }
        out.write(f"\ng {key}\n")
        out.write(f"o {key}\n")
        for fi in c:
            f = faces[fi]
            out.write("f " + " ".join(str(vi + 1) for vi in f) + "\n")

with open(out_json, 'w', encoding='utf-8') as jf:
    json.dump(metadata, jf, ensure_ascii=False, indent=2)

print(f"Done! Created OBJ ({os.path.getsize(out_obj)} bytes) and JSON ({os.path.getsize(out_json)} bytes) with {len(metadata)} labeled anatomical parts.")
