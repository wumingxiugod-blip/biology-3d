"""
重建狗內臟器官模型並輸出：
  models/dog_model_data.js   (index.html 內嵌載入，離線可用)
  models/dog_organs_model.obj / .mtl / dog_organs_pkg.zip   (下載用)

用法：python build_dog_model.py           # 完整重建 (約數分鐘)
      python build_dog_model.py --cache   # 使用 dog_organs_sdf.py 上次留下的 _dog_mesh_cache.pkl
"""
import json
import os
import pickle
import re
import sys
import zipfile

from dog_organs_sdf import DogMeshBuilder

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(HERE, "models")
CACHE = os.path.join(HERE, "_dog_mesh_cache.pkl")

# 物件名稱 → (Kd 顏色, 中文/英文/拉丁/描述)
DOG_ORGAN_INFO = {
    "dog_brain": ((0.93, 0.78, 0.76), "大腦與小腦 (腦部總成)", "Canine Brain (Cerebrum & Cerebellum)", "Encephalon",
                  "大腦雙半球具腦回與腦溝、縱裂分隔左右，前端為嗅球；後方為具葉片之小腦，腹側接腦橋與延腦。"),
    "dog_trachea": ((0.70, 0.86, 0.95), "喉・氣管與支氣管樹", "Larynx, Trachea & Bronchi", "Trachea",
                    "由 C 形透明軟骨環構成，背側為氣管肌；於心底背側 (約第 5 胸椎) 分為左右主支氣管再分出各肺葉支氣管。"),
    "dog_heart": ((0.72, 0.12, 0.16), "心臟與大血管", "Canine Heart & Great Vessels", "Cor",
                  "斜置於第 3–6 肋間，心尖偏左朝尾腹側；含左右心房、心耳、心室、冠狀溝與室間溝，連接主動脈弓、肺動脈幹與前/後腔靜脈。"),
    "dog_lung_left": ((0.93, 0.62, 0.64), "左肺 (前葉前部・前葉後部・後葉)", "Left Lung (Cranial & Caudal lobes)", "Pulmo sinister",
                      "左肺分前葉 (再分前部與後部) 及後葉，腹側具心切跡。"),
    "dog_lung_right": ((0.93, 0.62, 0.64), "右肺 (前葉・中葉・後葉・副葉)", "Right Lung (4 Lobes)", "Pulmo dexter",
                       "右肺大於左肺，分前葉、中葉、後葉，及位於心臟與橫膈間、包繞後腔靜脈之副葉。"),
    "dog_liver": ((0.45, 0.13, 0.11), "肝臟 (六葉)", "Canine Liver (6 Lobes)", "Hepar",
                  "緊貼橫膈臟面，深裂分為左外葉、左內葉、方葉、右內葉、右外葉與尾狀葉 (尾狀突形成右腎窩、乳頭突)。"),
    "dog_gallbladder": ((0.20, 0.50, 0.25), "膽囊與膽管", "Gallbladder & Bile Duct", "Vesica fellea",
                        "梨形，位於方葉與右內葉間之膽囊窩，經膽囊管、總膽管開口於十二指腸。"),
    "dog_stomach": ((0.90, 0.68, 0.62), "胃 (單胃)", "Canine Stomach", "Gaster",
                    "位於左季肋部，賁門接食道，胃底向背左側膨大，胃體下行後轉向右側成幽門竇、幽門。"),
    "dog_spleen": ((0.42, 0.10, 0.18), "脾臟 (舌狀)", "Canine Spleen", "Lien",
                   "扁平舌狀，沿胃大彎垂掛於左側腹壁，背側端窄、腹側端寬。"),
    "dog_pancreas": ((0.96, 0.84, 0.55), "胰臟 (V 形)", "Canine Pancreas", "Pancreas",
                     "胰體位於幽門附近，右葉沿降十二指腸向尾側延伸，左葉沿胃大彎深面伸向脾臟。"),
    "dog_small_intestine": ((0.94, 0.66, 0.62), "小腸 (十二指腸・空腸・迴腸)", "Small Intestine", "Intestinum tenue",
                            "十二指腸自幽門經前曲、降部、後曲、升部至十二指腸空腸曲；空腸盤曲佔腹腔腹側，迴腸於右側開口入結腸。"),
    "dog_cecum": ((0.85, 0.35, 0.40), "盲腸 (螺旋形)", "Canine Cecum", "Caecum",
                  "短小螺旋/逗號形盲囊，位於右側迴結腸接合處，經盲結口與結腸相通。"),
    "dog_colon": ((0.82, 0.58, 0.40), "結腸與直腸", "Colon & Rectum", "Colon et rectum",
                  "呈問號形：右側短升結腸、經右結腸曲轉為橫結腸、再經左結腸曲成為左側長降結腸，入骨盆腔為直腸至肛門。"),
    "dog_kidney_left": ((0.55, 0.16, 0.16), "左腎 (游離可觸診)", "Canine Left Kidney", "Ren sinister",
                        "平滑單乳頭腎，蠶豆形，腎門朝內側；位置較右腎靠後，輸尿管沿腰下向後通至膀胱頸背側。"),
    "dog_kidney_right": ((0.55, 0.16, 0.16), "右腎 (嵌於肝尾狀突腎窩)", "Canine Right Kidney", "Ren dexter",
                         "位置較左腎靠前約半個腎長，頭端嵌入肝尾狀突之腎窩。"),
    "dog_urinary_bladder": ((0.95, 0.80, 0.45), "膀胱與尿道", "Urinary Bladder & Urethra", "Vesica urinaria",
                            "梨形，頂朝頭側，膀胱頸位於恥骨前緣並延續為尿道進入骨盆腔。"),
}


def obj_with_materials(builder):
    obj = builder.to_obj_string()
    # 每個物件加上 usemtl，方便外部軟體載入 .mtl
    return re.sub(r"^o (\S+)\n", lambda m: f"o {m.group(1)}\nusemtl {m.group(1)}\n", obj, flags=re.M)


def mtl_text():
    out = ["# Material library for Dog Visceral Organs\n"]
    for name, (kd, *_rest) in DOG_ORGAN_INFO.items():
        out.append(f"newmtl {name}\nKd {kd[0]:.2f} {kd[1]:.2f} {kd[2]:.2f}\nKs 0.25 0.25 0.25\nNs 25\n\n")
    return "".join(out)


class _Cached:
    def __init__(self, meshes):
        self.meshes = meshes
        self.objects = {k: v[2] for k, v in meshes.items()}
    to_obj_string = DogMeshBuilder.to_obj_string


def main():
    if "--cache" in sys.argv and os.path.exists(CACHE):
        with open(CACHE, "rb") as f:
            builder = _Cached(pickle.load(f))
        print("Loaded cached meshes")
    else:
        builder = DogMeshBuilder()
        with open(CACHE, "wb") as f:
            pickle.dump(builder.meshes, f)

    meta = {}
    for name, tris in builder.objects.items():
        _kd, zh, en, latin, desc = DOG_ORGAN_INFO[name]
        meta[name] = {"nameZh": zh, "nameEn": en, "latin": latin, "desc": desc, "faceCount": int(len(tris))}

    obj = obj_with_materials(builder)
    with open(os.path.join(MODELS, "dog_model_data.js"), "w", encoding="utf-8") as f:
        f.write("// 3D DOG Visceral Organs Embedded Data (SDF sculpt + surface nets, smooth normals, 100% Offline)\n")
        f.write("window.DOG_METADATA = " + json.dumps(meta, ensure_ascii=False) + ";\n\n")
        f.write("window.DOG_OBJ_DATA = `" + obj + "`;\n")
    with open(os.path.join(MODELS, "dog_organs_model.obj"), "w", encoding="utf-8") as f:
        f.write("mtllib dog_organs.mtl\n" + obj)
    with open(os.path.join(MODELS, "dog_organs_model.mtl"), "w", encoding="utf-8") as f:
        f.write(mtl_text())
    with zipfile.ZipFile(os.path.join(MODELS, "dog_organs_pkg.zip"), "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(os.path.join(MODELS, "dog_organs_model.obj"), arcname="dog_organs.obj")
        zf.write(os.path.join(MODELS, "dog_organs_model.mtl"), arcname="dog_organs.mtl")
    total = sum(m["faceCount"] for m in meta.values())
    size = os.path.getsize(os.path.join(MODELS, "dog_model_data.js")) / 1e6
    print(f"Saved dog_model_data.js ({size:.1f} MB, {total} triangles, {len(meta)} organs) + OBJ/MTL/ZIP")


if __name__ == "__main__":
    main()
