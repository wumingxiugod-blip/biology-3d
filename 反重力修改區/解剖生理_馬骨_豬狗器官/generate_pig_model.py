"""Build only the porcine organ assets; this never reads or writes canine meshes."""
from __future__ import annotations

import argparse
import json
import re
import zipfile
from pathlib import Path

from pig_organs_sdf import ORGANS, build_pig_meshes


PROJECT = Path(r"D:\大學\大二\雷弟生物學-3d\解剖生理_馬骨_豬狗器官")
SOURCE_JS = PROJECT / "models" / "pig_model_data.js"

PIG_INFO = {
    "pig_os_rostri": ("吻骨與吻軟骨", "Rostral Bone & Cartilage", "Os rostri",
                      "豬吻端的吻骨與鼻鏡軟骨構造，支撐拱土時受力的鼻端。"),
    "pig_trachea_and_bronchus": ("氣管、主支氣管與氣管支氣管", "Trachea, Main Bronchi & Tracheal Bronchus",
                                 "Trachea et bronchus trachealis",
                                 "氣管軟骨環於隆突前由右側壁分出氣管支氣管，通往右肺前葉；隆突後再分左右主支氣管。"),
    "pig_heart": ("心臟與大血管", "Heart & Great Vessels", "Cor",
                  "由心房、左右心室與心尖構成，並連接主動脈、肺動脈及腔靜脈。"),
    "pig_lungs": ("分葉肺臟：右四葉、左兩葉", "Lobulated Lungs: Four Right and Two Left Lobes", "Pulmones",
                  "右肺含前葉、中葉、後葉與副葉，左肺分前葉與後葉；右前葉由氣管支氣管供氣。"),
    "pig_stomach_diverticulum": ("單室胃、胃憩室與幽門枕", "Simple Stomach, Gastric Diverticulum & Torus Pyloricus",
                                 "Ventriculus et diverticulum ventriculi",
                                 "單室胃的胃底在食道入口附近形成盲袋狀胃憩室；幽門端另有突入幽門管的幽門枕。"),
    "pig_liver_lobules": ("分葉肝臟與肝小葉紋理", "Lobulated Liver with Interlobular Texture", "Hepar",
                          "呈典型豬肝分葉，含左右外葉、左右內葉、尾狀葉及小型方葉；膽囊窩位於臟面。"),
    "pig_gallbladder": ("膽囊與膽囊管", "Gallbladder & Cystic Duct", "Vesica biliaris",
                        "梨形囊袋位於肝臟臟面、方葉與右內側葉之間，膽囊管接向肝外膽道。"),
    "pig_spleen": ("帶狀脾臟", "Strap-like Spleen", "Lien",
                   "狹長扁平的帶狀脾臟，沿胃大彎左側延伸，兩端較窄、中央略寬。"),
    "pig_pancreas": ("三葉胰臟與門靜脈環", "Three-lobed Pancreas & Portal Ring", "Pancreas",
                     "由脾葉、十二指腸葉及連接葉構成；連接葉與胰體形成環狀關係，包繞門靜脈區域。"),
    "pig_spiral_colon": ("圓錐螺旋結腸盤", "Conical Spiral Colon", "Colon spirale",
                         "升結腸盤成圓錐形：外層向心迴旋抵達中央曲，再由內層離心迴旋返回。"),
    "pig_cecum": ("盲腸與縱行肌帶", "Cecum with Longitudinal Bands", "Caecum",
                  "圓筒狀盲腸接在迴腸與結腸交界，表面有縱行肌帶及囊袋狀分節。"),
    "pig_kidneys": ("雙側平滑腎臟與輸尿管", "Paired Smooth Kidneys & Ureters", "Renes",
                    "左右腎表面平滑，內部有多個腎錐體及腎盞；輸尿管由腎門走向膀胱。"),
    "pig_urinary_bladder": ("膀胱與尿道", "Urinary Bladder & Urethra", "Vesica urinaria",
                            "梨形平滑肌囊，兩側輸尿管在膀胱背側入囊，膀胱頸延續為尿道。"),
}

PIG_COLORS = {
    "pig_os_rostri": (0.83, 0.79, 0.56),
    "pig_trachea_and_bronchus": (0.70, 0.84, 0.88),
    "pig_heart": (0.72, 0.16, 0.20),
    "pig_lungs": (0.91, 0.58, 0.62),
    "pig_stomach_diverticulum": (0.87, 0.66, 0.58),
    "pig_liver_lobules": (0.48, 0.16, 0.13),
    "pig_gallbladder": (0.18, 0.48, 0.24),
    "pig_spleen": (0.47, 0.13, 0.21),
    "pig_pancreas": (0.91, 0.80, 0.57),
    "pig_spiral_colon": (0.76, 0.47, 0.49),
    "pig_cecum": (0.80, 0.43, 0.45),
    "pig_kidneys": (0.53, 0.18, 0.18),
    "pig_urinary_bladder": (0.91, 0.72, 0.39),
}


def read_existing_metadata():
    source = SOURCE_JS.read_text(encoding="utf-8")
    match = re.search(r"window\.PIG_METADATA\s*=\s*(\{.*?\});", source, re.S)
    if not match:
        raise ValueError(f"Could not read metadata from {SOURCE_JS}")
    return json.loads(match.group(1))


def obj_text(meshes, archive=False):
    mtllib = "pig_organs.mtl" if archive else "pig_organs_model.mtl"
    lines = ["# Porcine visceral anatomy (SDF sculpt + surface nets)\n", f"mtllib {mtllib}\n"]
    base = 1
    for name, (vertices, normals, triangles) in meshes.items():
        lines.append(f"o {name}\nusemtl {name}\ns 1\n")
        lines.extend(f"v {x:.5f} {y:.5f} {z:.5f}\n" for x, y, z in vertices)
        lines.extend(f"vn {x:.6f} {y:.6f} {z:.6f}\n" for x, y, z in normals)
        faces = triangles + base
        lines.extend(f"f {a}//{a} {b}//{b} {c}//{c}\n" for a, b, c in faces)
        base += len(vertices)
    return "".join(lines)


def mtl_text():
    lines = ["# Porcine organ materials\n"]
    for name, color in PIG_COLORS.items():
        lines.extend((f"newmtl {name}\n", f"Kd {color[0]:.3f} {color[1]:.3f} {color[2]:.3f}\n",
                      "Ka 0.060 0.060 0.060\n", "Ks 0.20 0.20 0.20\n", "Ns 24\n\n"))
    return "".join(lines)


def build(output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    meshes = build_pig_meshes(verbose=True)
    metadata = read_existing_metadata()
    for name, (_, _, triangles) in meshes.items():
        old = metadata.get(name, {})
        zh, en, latin, desc = PIG_INFO[name]
        metadata[name] = {**old, "nameZh": zh, "nameEn": en, "latin": latin,
                          "desc": desc, "faceCount": int(len(triangles))}
    # Older data used the alternate key for this same rostral structure.
    if "pig_os_rostri" in metadata:
        metadata["pig_rostral_bone"] = {**metadata["pig_os_rostri"]}

    obj = obj_text(meshes)
    mtl = mtl_text()
    js = ("// Porcine visceral organ data (smooth SDF surfaces with vertex normals)\n"
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
