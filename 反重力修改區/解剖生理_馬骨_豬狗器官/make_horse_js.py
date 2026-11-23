import json
import os

obj_path = r"C:\Users\user\.gemini\antigravity\scratch\vet_anatomy_quiz\models\horse_skeleton_segmented.obj"
json_path = r"C:\Users\user\.gemini\antigravity\scratch\vet_anatomy_quiz\models\horse_skeleton_metadata.json"
out_js = r"C:\Users\user\.gemini\antigravity\scratch\vet_anatomy_quiz\models\horse_model_data.js"

with open(obj_path, 'r', encoding='ascii') as f:
    obj_data = f.read()

with open(json_path, 'r', encoding='utf-8') as f:
    metadata = json.load(f)

print(f"Read OBJ: {len(obj_data)} chars, Metadata: {len(metadata)} items")

with open(out_js, 'w', encoding='utf-8') as f:
    f.write("// Real 3D Horse Skeleton Embedded Data (Zero CORS, 100% Offline)\n")
    f.write("window.HORSE_METADATA = ")
    json.dump(metadata, f, ensure_ascii=False)
    f.write(";\n\n")
    f.write("window.HORSE_OBJ_DATA = `")
    # Escape backticks and ${}
    safe_obj = obj_data.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    f.write(safe_obj)
    f.write("`;\n")

print(f"Generated {out_js}! Size: {os.path.getsize(out_js)} bytes")
