import os
import zipfile
import json
from generate_realistic_organs import build_pig_anatomy

# 1. Dog organs OBJ / MTL / ZIP (built by build_dog_model.py from the SDF sculpt)
import build_dog_model
build_dog_model.main()

# 2. Generate Pig Organs OBJ & MTL
print("Building Pig Organs...")
pig_builder = build_pig_anatomy()
pig_obj_str = pig_builder.to_obj_string()

with open('models/pig_organs_model.obj', 'w', encoding='utf-8') as f:
    f.write(pig_obj_str)
print("Saved models/pig_organs_model.obj")

pig_mtl = """# Material library for Pig Visceral Organs
newmtl pig_spiral_colon
Kd 0.75 0.50 0.52
Ks 0.3 0.3 0.3
Ns 25

newmtl pig_stomach_diverticulum
Kd 0.85 0.68 0.60
Ks 0.2 0.2 0.2
Ns 20

newmtl pig_heart
Kd 0.78 0.18 0.22
Ks 0.3 0.3 0.3
Ns 30

newmtl pig_liver_lobules
Kd 0.50 0.22 0.18
Ks 0.4 0.4 0.4
Ns 35

newmtl pig_spleen
Kd 0.42 0.14 0.20
Ks 0.3 0.3 0.3
Ns 20

newmtl pig_lungs
Kd 0.88 0.55 0.58
Ks 0.2 0.2 0.2
Ns 15
"""
with open('models/pig_organs_model.mtl', 'w', encoding='utf-8') as f:
    f.write(pig_mtl)

with zipfile.ZipFile('models/pig_organs_pkg.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.write('models/pig_organs_model.obj', arcname='pig_organs.obj')
    zf.write('models/pig_organs_model.mtl', arcname='pig_organs.mtl')
print("Created models/pig_organs_pkg.zip")

# Clean up search_cadnav.py
if os.path.exists('search_cadnav.py'):
    os.remove('search_cadnav.py')
