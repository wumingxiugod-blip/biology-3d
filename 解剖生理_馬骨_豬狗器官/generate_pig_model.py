"""Build only the porcine organ assets; this never reads or writes canine meshes."""
from __future__ import annotations

import argparse
import json
import zipfile
from pathlib import Path

from pig_organs_sdf import build_pig_meshes


PROJECT = Path(__file__).resolve().parent

PIG_INFO = {
    "pig_os_rostri": (
        "吻骨與吻軟骨", "Rostral Bone & Cartilage", "Os rostri",
        "豬吻端鼻中膈前端之特化錐形異位骨與鼻鏡軟骨盤，支撐拱土與掘食時受力的吻端。"
    ),
    "pig_trachea_and_bronchus": (
        "氣管、主支氣管與氣管支氣管", "Trachea, Main Bronchi & Tracheal Bronchus",
        "Trachea et bronchus trachealis",
        "氣管軟骨環於隆突前方由右側壁單獨分出「氣管支氣管」直接供應右肺前葉；隆突後再分為左右主支氣管。"
    ),
    "pig_heart": (
        "心臟與大血管", "Heart & Great Vessels", "Cor",
        "斜置於胸腔腹側，心尖偏左尾腹側；包含左右心房、心室、主動脈弓、肺動脈幹與右側進入右心房之前後腔靜脈。"
    ),
    "pig_lungs": (
        "分葉肺臟 (右4葉・左2葉)", "Lobulated Lungs (Right 4 / Left 2 Lobes)", "Pulmones",
        "右肺分前葉、中葉、後葉與副葉，左肺分前葉（前後部）與後葉；右肺前葉由氣管支氣管單獨供氣。"
    ),
    "pig_liver_lobules": (
        "分葉肝臟 (具顯著小葉網紋)", "Lobulated Liver (Interlobular Texture)", "Hepar",
        "貼於橫膈後方，深裂為左外、左內、右內、右外、方葉與尾狀葉；小葉間結締組織極厚，表面呈清晰多角形小葉網紋。"
    ),
    "pig_gallbladder": (
        "膽囊與膽囊管", "Gallbladder & Cystic Duct", "Vesica biliaris",
        "梨形囊袋嵌於肝臟臟面（右內葉與方葉之間膽囊窩），經膽囊管與總膽管開口於十二指腸。"
    ),
    "pig_stomach_diverticulum": (
        "單室胃、胃憩室與幽門枕", "Simple Stomach, Gastric Diverticulum & Torus Pyloricus",
        "Ventriculus et diverticulum ventriculi",
        "位於左前腹腔，食道自頭背側入賁門；胃底背左側具錐形盲囊「胃憩室」，幽門出口具半球形「幽門枕」。"
    ),
    "pig_spleen": (
        "帶狀脾臟 (狹長帶狀)", "Strap-like Spleen", "Lien",
        "極為狹長扁平的帶狀脾臟，沿胃大彎左側縱向延伸，與犬之扁平舌狀脾明顯不同。"
    ),
    "pig_pancreas": (
        "三葉胰臟與門靜脈環", "Three-lobed Pancreas & Portal Ring", "Pancreas",
        "由脾葉（左葉）、十二指腸葉（右葉）及連接葉組成；胰體與連接葉圍繞門靜脈形成門靜脈環。"
    ),
    "pig_small_intestine": (
        "小腸 (十二指腸・空腸・迴腸)", "Small Intestine (Duodenum, Jejunum & Ileum)",
        "Intestinum tenue",
        "空腸形成密集平滑腸曲位於腹腔右側與腹底；末端迴腸向左跨行，經明顯的迴腸乳頭（Ileal papilla）開口於盲結腸交界。"
    ),
    "pig_cecum": (
        "圓筒盲腸 (左側・具縱行肌帶)", "Cylindrical Cecum (Left, with Taeniae)", "Caecum",
        "位於腹腔左側中後部，呈粗大圓筒狀盲囊、盲端朝尾腹側，表面具 3 條縱行肌帶（Taeniae）與囊袋分節（Haustra）。"
    ),
    "pig_spiral_colon": (
        "圓錐螺旋結腸盤 (背底腹尖)", "Conical Spiral Colon (Dorsal Base, Ventral Apex)",
        "Colon spirale",
        "位於腹腔左側之標誌性器官：升結腸盤成基底朝背、尖端朝腹的倒圓錐；外層向心迴旋（具縱帶與袋狀分節），內層離心迴旋（較細且平滑無帶），隨後延續為橫結腸與降結腸。"
    ),
    "pig_kidneys": (
        "雙側對稱平滑腎臟與輸尿管", "Paired Symmetrical Smooth Kidneys & Ureters", "Renes",
        "左右腎幾乎對稱位於腰下腹膜後（背腹扁平、表面平滑、內具多腎盞），輸尿管沿背壁向尾側入膀胱背頸部。"
    ),
    "pig_urinary_bladder": (
        "膀胱與尿道", "Urinary Bladder & Urethra", "Vesica urinaria",
        "梨形厚壁平滑肌儲尿囊袋，位於骨盆入口前腹側，向後接骨盆尿道。"
    ),
}

PIG_COLORS = {
    "pig_os_rostri": (0.86, 0.82, 0.64),
    "pig_trachea_and_bronchus": (0.68, 0.85, 0.92),
    "pig_heart": (0.74, 0.16, 0.22),
    "pig_lungs": (0.92, 0.56, 0.62),
    "pig_liver_lobules": (0.50, 0.15, 0.14),
    "pig_gallbladder": (0.16, 0.52, 0.26),
    "pig_stomach_diverticulum": (0.90, 0.62, 0.58),
    "pig_spleen": (0.44, 0.12, 0.22),
    "pig_pancreas": (0.93, 0.82, 0.52),
    "pig_small_intestine": (0.95, 0.72, 0.68),
    "pig_cecum": (0.84, 0.52, 0.24),
    "pig_spiral_colon": (0.76, 0.44, 0.22),
    "pig_kidneys": (0.56, 0.18, 0.22),
    "pig_urinary_bladder": (0.92, 0.74, 0.36),
}


def obj_text(meshes, archive=False):
    mtllib = "pig_organs.mtl" if archive else "pig_organs_model.mtl"
    lines = ["# Porcine visceral anatomy (anatomically verified smooth SDF + parametric tubes)\n", f"mtllib {mtllib}\n"]
    base = 1
    for name, (vertices, normals, triangles) in meshes.items():
        lines.append(f"o {name}\nusemtl {name}\ns 1\n")
        lines.extend(f"v {x:.4f} {y:.4f} {z:.4f}\n" for x, y, z in vertices)
        lines.extend(f"vn {x:.5f} {y:.5f} {z:.5f}\n" for x, y, z in normals)
        faces = triangles + base
        lines.extend(f"f {a}//{a} {b}//{b} {c}//{c}\n" for a, b, c in faces)
        base += len(vertices)
    return "".join(lines)


def mtl_text():
    lines = ["# Porcine organ materials\n"]
    for name, color in PIG_COLORS.items():
        lines.extend((f"newmtl {name}\n", f"Kd {color[0]:.3f} {color[1]:.3f} {color[2]:.3f}\n",
                      "Ka 0.060 0.060 0.060\n", "Ks 0.18 0.18 0.18\n", "Ns 24\n\n"))
    return "".join(lines)


def build(output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    meshes = build_pig_meshes(verbose=True)
    metadata = {}
    for name, (_, _, triangles) in meshes.items():
        zh, en, latin, desc = PIG_INFO[name]
        metadata[name] = {
            "nameZh": zh,
            "nameEn": en,
            "latin": latin,
            "desc": desc,
            "faceCount": int(len(triangles)),
        }
    if "pig_os_rostri" in metadata:
        metadata["pig_rostral_bone"] = {**metadata["pig_os_rostri"]}

    obj = obj_text(meshes)
    mtl = mtl_text()
    js = ("// Porcine visceral organ data (anatomically verified smooth surfaces with vertex normals)\n"
          + "window.PIG_METADATA = " + json.dumps(metadata, ensure_ascii=False) + ";\n\n"
          + "window.PIG_OBJ_DATA = `\n" + obj + "`;\n")
    (output_dir / "pig_model_data.js").write_text(js, encoding="utf-8")
    (output_dir / "pig_organs_model.obj").write_text(obj, encoding="utf-8")
    (output_dir / "pig_organs_model.mtl").write_text(mtl, encoding="utf-8")
    zip_path = output_dir / "pig_organs_pkg.zip"
    archive_obj = obj_text(meshes, archive=True)
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("pig_organs.obj", archive_obj)
        zf.writestr("pig_organs.mtl", mtl)
    print(f"Wrote pig-only assets to {output_dir}")
    print(f"OBJ groups: {len(meshes)}; triangles: {sum(len(m[2]) for m in meshes.values()):,}")
    print(f"JS size: {(output_dir / 'pig_model_data.js').stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, default=PROJECT / "models")
    args = parser.parse_args()
    build(args.output_dir)
