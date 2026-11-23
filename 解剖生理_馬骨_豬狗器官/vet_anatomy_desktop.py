# -*- coding: utf-8 -*-
"""
獸醫解剖本機桌面學習與中文抽考系統 (免安裝第三方庫，純 Python 內建標準庫)
包含：
1. 馬全身骨骼 (全身每一塊骨骼，軸向骨骼、前肢、後肢)
2. 狗器官 (胸腹腔主要臟器)
3. 豬器官 (特徵器官：吻軟骨、氣管支氣管、胃憩室、螺旋結腸等)
4. 中文鍵盤輸入抽考、同義詞容錯、提示、Streak 計分與錯題本專項複習
"""

import sys
import random
import re
import tkinter as tk
from tkinter import ttk, messagebox

# 音效支援 (Windows 內建 winsound)
try:
    import winsound
    def play_sound_correct():
        winsound.MessageBeep(winsound.MB_ICONASTERISK)
    def play_sound_wrong():
        winsound.MessageBeep(winsound.MB_ICONHAND)
except ImportError:
    def play_sound_correct(): pass
    def play_sound_wrong(): pass

# ==============================================================================
# 解剖資料庫 (馬全身骨骼、狗器官、豬器官)
# ==============================================================================
DATABASE = {
    "horse": [
        {
            "id": "skull_neurocranium", "name_zh": "腦顱骨",
            "aliases": ["腦顱", "顱骨", "枕骨", "頂骨", "顳骨", "cranium", "neurocranium"],
            "region": "頭部骨骼", "name_en": "Neurocranium", "latin": "Ossa cranii",
            "desc": "包含枕骨、頂骨、顳骨與額骨後半部，保護大腦中樞；後方形成枕骨大孔與枕髁連接頸椎。",
            "clinical": "枕骨大孔為採集腦脊髓液之小腦延髓池重要穿刺標誌。"
        },
        {
            "id": "skull_frontal", "name_zh": "額骨",
            "aliases": ["額骨", "額竇", "frontal bone", "os frontale"],
            "region": "頭部骨骼", "name_en": "Frontal Bone", "latin": "Os frontale",
            "desc": "構成額面正上方，內部包含容積龐大的額竇，與上頜竇直接貫通。",
            "clinical": "馬副鼻竇蓄膿或額竇圓鋸術（Trephination）常由額骨入路。"
        },
        {
            "id": "skull_nasal", "name_zh": "鼻骨",
            "aliases": ["鼻骨", "鼻樑骨", "nasal bone", "os nasale"],
            "region": "頭部骨骼", "name_en": "Nasal Bone", "latin": "Os nasale",
            "desc": "成對扁平骨片，構成鼻腔背壁，前端形成鼻切齒切跡。",
            "clinical": "鼻切齒切跡為臨床插置鼻胃管時極易觸摸的體表標記。"
        },
        {
            "id": "skull_maxilla", "name_zh": "上頜骨",
            "aliases": ["上頜骨", "上頷骨", "上顎骨", "maxilla"],
            "region": "頭部骨骼", "name_en": "Maxilla", "latin": "Maxilla",
            "desc": "承載上頜臼齒齒槽，外側具顯著的面脊（Facial crest），深部為上頜竇。",
            "clinical": "面脊為馬頭部最重要的體表解剖標誌，下方有面動靜脈通過。"
        },
        {
            "id": "skull_incisive", "name_zh": "切齒骨",
            "aliases": ["切齒骨", "前頜骨", "前顎骨", "incisive bone", "os incisivum"],
            "region": "頭部骨骼", "name_en": "Incisive Bone (Premaxilla)", "latin": "Os incisivum",
            "desc": "位於吻部最前端，承載上頜6枚切齒，向後與鼻骨及上頜骨相接。",
            "clinical": "馬門齒的磨損程度、黑窩及齒星為鑑定年齡的重要法醫學依據。"
        },
        {
            "id": "skull_zygomatic", "name_zh": "顴骨",
            "aliases": ["顴骨", "眼眶骨", "zygomatic bone", "os zygomaticum"],
            "region": "頭部骨骼", "name_en": "Zygomatic Bone", "latin": "Os zygomaticum",
            "desc": "構成眼眶腹外側緣，與顳骨顴突相連形成完整的骨性顴弓與完全封閉的骨性眼眶。",
            "clinical": "完整的骨性眶緣能有效保護眼球免於碰撞受損。"
        },
        {
            "id": "skull_mandible", "name_zh": "下頜骨",
            "aliases": ["下頜骨", "下頷骨", "下顎骨", "mandible", "mandibula"],
            "region": "頭部骨骼", "name_en": "Mandible", "latin": "Mandibula",
            "desc": "頭部唯一可動骨骼，由下頜體（齒槽）與下頜支（髁狀突顳顎關節）構成。",
            "clinical": "下頜切跡處可觸摸到面動脈搏動，為監測心率最實用的體表觸診點。"
        },
        {
            "id": "vert_c1_atlas", "name_zh": "寰椎",
            "aliases": ["寰椎", "第一頸椎", "第1頸椎", "c1", "atlas"],
            "region": "脊柱", "name_en": "Atlas (C1)", "latin": "Atlas",
            "desc": "第1頸椎，無椎體及棘突，兩側具有極為寬大如羽翼的寰椎翼（Alae atlantis）。",
            "clinical": "寰枕關節主掌「點頭」動作，為小腦延髓池採腦脊髓液下針處。"
        },
        {
            "id": "vert_c2_axis", "name_zh": "樞椎",
            "aliases": ["樞椎", "第二頸椎", "第2頸椎", "c2", "axis"],
            "region": "脊柱", "name_en": "Axis (C2)", "latin": "Axis",
            "desc": "第2頸椎，體部最長，前端具圓柱形齒突（Dens），背側具長而高聳的棘脊。",
            "clinical": "寰樞關節主導頭頸部「左右旋轉/搖頭」動作。"
        },
        {
            "id": "vert_c3_c7", "name_zh": "頸椎(C3-C7)",
            "aliases": ["頸椎", "第3至7頸椎", "c3-c7", "cervical vertebrae"],
            "region": "脊柱", "name_en": "Cervical Vertebrae (C3-C7)", "latin": "Vertebrae cervicales",
            "desc": "馬具典型7枚頸椎，關節突極為發達，C6橫突分三葉，C7無橫突孔。",
            "clinical": "頸椎狹窄性脊髓病（馬搖擺症 Wobbler syndrome）最常發生在此區域。"
        },
        {
            "id": "vert_withers_t1_t5", "name_zh": "胸椎棘突(髻甲部)",
            "aliases": ["髻甲", "髻甲部", "胸椎棘突", "胸椎高棘突", "withers", "棘突"],
            "region": "脊柱", "name_en": "Withers (T3-T5 Dorsal spines)", "latin": "Processus spinosus thoracis",
            "desc": "胸椎T3-T5具有極度高聳扁平之棘突，頂部覆蓋軟骨，構成馬體表最高點「髻甲」。",
            "clinical": "測量馬體高的標準基準；深層滑囊發炎稱「髻甲瘻管（Fistulous withers）」。"
        },
        {
            "id": "vert_t6_t18", "name_zh": "後段胸椎",
            "aliases": ["胸椎", "胸椎骨", "t6-t18", "thoracic vertebrae"],
            "region": "脊柱", "name_en": "Thoracic Vertebrae (T6-T18)", "latin": "Vertebrae thoracicae",
            "desc": "共18節，每節胸椎均與一對肋骨形成肋椎關節，棘突由前向後逐漸降低。",
            "clinical": "強韌的棘突上韌帶承托鞍座與騎士重量。"
        },
        {
            "id": "vert_lumbar_l1_l6", "name_zh": "腰椎",
            "aliases": ["腰椎", "腰部脊椎", "l1-l6", "lumbar vertebrae"],
            "region": "脊柱", "name_en": "Lumbar Vertebrae (L1-L6)", "latin": "Vertebrae lumbales",
            "desc": "通常為6節，椎體粗壯，具發達平直水平橫突，L5-L6橫突間具特殊關節面。",
            "clinical": "橫突間關節限制腰部側彎，增加高速奔跑時之軀幹剛性。"
        },
        {
            "id": "vert_sacrum", "name_zh": "薦骨",
            "aliases": ["薦骨", "薦椎", "骶骨", "sacrum", "os sacrum"],
            "region": "脊柱", "name_en": "Sacrum (Fused S1-S5)", "latin": "Os sacrum",
            "desc": "5節薦椎完全骨性癒合形成之三角形骨板，兩側薦骨翼與骨盆形成薦髂關節。",
            "clinical": "薦髂韌帶拉傷（Sacroiliac desmitis）好發於跨欄障礙賽馬。"
        },
        {
            "id": "vert_caudal", "name_zh": "尾椎",
            "aliases": ["尾椎", "尾骨", "尾椎骨", "caudal vertebrae"],
            "region": "脊柱", "name_en": "Caudal Vertebrae (Cd1-Cd18)", "latin": "Vertebrae caudales",
            "desc": "約15至21節，向後突起逐漸退化僅剩柱狀椎體，支撐整條尾部。",
            "clinical": "Co1-Co2間隙常作為施行後軀硬膜外麻醉之進針點。"
        },
        {
            "id": "ribs_sternal", "name_zh": "真肋(胸骨肋)",
            "aliases": ["真肋", "胸骨肋", "前8對肋骨", "sternal ribs"],
            "region": "胸廓", "name_en": "Sternal Ribs (Pairs 1-8)", "latin": "Costae verae",
            "desc": "前8對肋骨，肋軟骨直接與胸骨體相接，骨體厚實，保護心臟大血管。",
            "clinical": "為前肢肩胛與肱骨肌肉緊密覆蓋。"
        },
        {
            "id": "ribs_asternal", "name_zh": "假肋(弓肋)",
            "aliases": ["假肋", "弓肋", "後10對肋骨", "asternal ribs"],
            "region": "胸廓", "name_en": "Asternal Ribs (Pairs 9-18)", "latin": "Costae spuriae",
            "desc": "後10對肋骨（9-18對），肋軟骨彼此疊合形成肋弓，不直接接胸骨。",
            "clinical": "第9-17肋間隙為聽診肺音及胸腔穿刺術常經部位。"
        },
        {
            "id": "sternum", "name_zh": "胸骨",
            "aliases": ["胸骨", "胸骨柄", "胸骨體", "劍突", "sternum"],
            "region": "胸廓", "name_en": "Sternum", "latin": "Sternum",
            "desc": "獨木舟狀骨板，包含前端胸骨柄、中央胸骨體與後端劍突軟骨。",
            "clinical": "胸骨骨髓穿刺常於第4-5胸骨體正中線施行。"
        },
        {
            "id": "scapula", "name_zh": "肩胛骨",
            "aliases": ["肩胛骨", "肩胛軟骨", "肩胛棘", "scapula"],
            "region": "前肢骨骼", "name_en": "Scapula", "latin": "Scapula",
            "desc": "大型三角形扁骨，背側具寬厚肩胛軟骨，外側面具突出肩胛棘，馬無鎖骨。",
            "clinical": "馬以強大肌肉群（合肌架）將前肢連接胸廓，吸收著地震盪。"
        },
        {
            "id": "humerus", "name_zh": "肱骨",
            "aliases": ["肱骨", "大臂骨", "humerus"],
            "region": "前肢骨骼", "name_en": "Humerus", "latin": "Humerus",
            "desc": "粗壯長骨，斜向前下，近端具巨大大結節，遠端滑車與橈骨形成肘關節。",
            "clinical": "大結節為肩部重要觸診定位點。"
        },
        {
            "id": "radius", "name_zh": "橈骨",
            "aliases": ["橈骨", "前臂骨", "radius"],
            "region": "前肢骨骼", "name_en": "Radius", "latin": "Radius",
            "desc": "前臂主承重骨，長而堅固，承擔前肢絕大部分衝擊力。",
            "clinical": "骨折後因張力極大，內固定要求高剛性。"
        },
        {
            "id": "ulna", "name_zh": "尺骨(含鷹嘴突)",
            "aliases": ["尺骨", "鷹嘴", "鷹嘴突", "ulna", "olecranon"],
            "region": "前肢骨骼", "name_en": "Ulna (Olecranon)", "latin": "Ulna",
            "desc": "近端高度發達形成鷹嘴突（三頭肌止端），中遠段退化與橈骨永久癒合。",
            "clinical": "肘頭鷹嘴骨折為常見關節內外傷。"
        },
        {
            "id": "carpal_bones", "name_zh": "腕骨群",
            "aliases": ["腕骨", "腕骨群", "膝關節骨", "carpal bones"],
            "region": "前肢骨骼", "name_en": "Carpal Bones (Knee joint)", "latin": "Ossa carpi",
            "desc": "7-8塊短骨排列成兩列，俗稱前膝，實為解剖學手腕。",
            "clinical": "第三腕骨常因競速衝擊發生板塊狀骨折（Slab fracture）。"
        },
        {
            "id": "metacarpal_3_cannon", "name_zh": "第三掌骨(大砲骨)",
            "aliases": ["第三掌骨", "砲骨", "大砲骨", "炮骨", "第3掌骨", "cannon bone"],
            "region": "前肢骨骼", "name_en": "Third Metacarpal (Cannon Bone)", "latin": "Os metacarpale III",
            "desc": "圓柱狀主要承重長骨，承受高速奔馳體重衝擊。",
            "clinical": "賽馬職業病疳骨症（Bucked shins）即發生於其骨皮質。"
        },
        {
            "id": "metacarpal_splints", "name_zh": "副掌骨(夾骨)",
            "aliases": ["夾骨", "副掌骨", "第二掌骨", "第四掌骨", "splints"],
            "region": "前肢骨骼", "name_en": "Splint Bones (Metacarpals II & IV)", "latin": "Ossa metacarpalia II et IV",
            "desc": "貼附於第三掌骨後側兩旁之細長殘留骨針。",
            "clinical": "骨膜炎與骨贅增生稱為「夾骨腫（Splints）」。"
        },
        {
            "id": "proximal_sesamoids", "name_zh": "近端種子骨",
            "aliases": ["近端種子骨", "種子骨", "球節種子骨", "sesamoids"],
            "region": "前肢骨骼", "name_en": "Proximal Sesamoid Bones", "latin": "Ossa sesamoidea proximalia",
            "desc": "成對三稜錐短骨，位於第三掌骨遠端後方，承載懸韌帶。",
            "clinical": "球節過度下沉沉降時易發生種子骨炎或橫斷骨折。"
        },
        {
            "id": "pastern_bone", "name_zh": "近端指骨(繫骨)",
            "aliases": ["繫骨", "第一指骨", "近端指骨", "第1指骨", "pastern bone"],
            "region": "前肢骨骼", "name_en": "Proximal Phalanx (Pastern Bone)", "latin": "Phalanx proximalis",
            "desc": "球節與冠關節間之傾斜短長骨，吸收地面震動。",
            "clinical": "斜度影響步容與屈腱張力。"
        },
        {
            "id": "coronet_bone", "name_zh": "中端指骨(冠骨)",
            "aliases": ["冠骨", "第二指骨", "中端指骨", "第2指骨", "coronet bone"],
            "region": "前肢骨骼", "name_en": "Middle Phalanx (Coronet Bone)", "latin": "Phalanx media",
            "desc": "短四方形指骨，半埋於蹄匣上方冠帶中。",
            "clinical": "冠骨骨贅關節炎稱為「高環骨腫（High ringbone）」。"
        },
        {
            "id": "navicular_bone", "name_zh": "遠端種子骨(舟狀骨)",
            "aliases": ["舟狀骨", "舟骨", "遠端種子骨", "navicular bone"],
            "region": "前肢骨骼", "name_en": "Distal Sesamoid (Navicular Bone)", "latin": "Os sesamoideum distale",
            "desc": "橫向船型種子骨，藏於蹄匣內部，深屈肌腱滑動面。",
            "clinical": "舟狀骨症候群（Navicular disease）為慢性前肢跛行名疾。"
        },
        {
            "id": "coffin_bone", "name_zh": "遠端指骨(蹄骨)",
            "aliases": ["蹄骨", "第三指骨", "遠端指骨", "第3指骨", "coffin bone"],
            "region": "前肢骨骼", "name_en": "Distal Phalanx (Coffin Bone)", "latin": "Phalanx distalis",
            "desc": "半月狀多孔骨，完全被蹄葉懸吊於蹄壁匣內。",
            "clinical": "急性蹄葉炎（Laminitis）時蹄骨常發生下旋轉甚至穿底。"
        },
        {
            "id": "pelvis_ilium", "name_zh": "髂骨",
            "aliases": ["髂骨", "骨盆髂骨", "髖結節", "薦結節", "ilium"],
            "region": "後肢骨骼", "name_en": "Ilium", "latin": "Os ilii",
            "desc": "骨盆前上方扁骨，外側角為髖結節（腰角），內側為薦結節。",
            "clinical": "髖結節撞傷骨折導致單側塌陷俗稱「跛腰」。"
        },
        {
            "id": "pelvis_ischium_pubis", "name_zh": "坐骨與恥骨",
            "aliases": ["坐骨", "恥骨", "坐骨結節", "閉孔", "ischium"],
            "region": "後肢骨骼", "name_en": "Ischium & Pubis", "latin": "Os ischii et pubis",
            "desc": "構成骨盆底與後壁，後外側為坐骨結節（臀角），中央為閉孔。",
            "clinical": "構成母馬分娩之產道骨性骨架。"
        },
        {
            "id": "femur", "name_zh": "股骨",
            "aliases": ["股骨", "大腿骨", "第三轉子", "femur"],
            "region": "後肢骨骼", "name_en": "Femur (3rd Trochanter)", "latin": "Os femoris",
            "desc": "全身最粗重長骨，骨幹外側具有馬最獨特的**第三轉子（Third trochanter）**！",
            "clinical": "第三轉子為臀淺肌附著處，為馬專屬標記。"
        },
        {
            "id": "patella", "name_zh": "髕骨(膝蓋骨)",
            "aliases": ["髕骨", "膝蓋骨", "patella"],
            "region": "後肢骨骼", "name_en": "Patella", "latin": "Patella",
            "desc": "菱形種子骨，滑動於股骨滑車溝，連繫三條髕直韌帶。",
            "clinical": "具「站立鎖定機制（Stay apparatus）」，卡於滑車內脊可無力站立睡眠。"
        },
        {
            "id": "tibia", "name_zh": "脛骨",
            "aliases": ["脛骨", "後小腿骨", "tibia"],
            "region": "後肢骨骼", "name_en": "Tibia", "latin": "Tibia",
            "desc": "粗大稜柱狀長骨，前緣具鋒利脛骨脊，遠端為雙凹滑車。",
            "clinical": "骨膜直接位在皮下，受踢擊極易外傷性骨膜炎。"
        },
        {
            "id": "fibula", "name_zh": "腓骨",
            "aliases": ["腓骨", "fibula"],
            "region": "後肢骨骼", "name_en": "Fibula", "latin": "Fibula",
            "desc": "針狀退化骨棒，僅存在於脛骨近外側半段，不承重。",
            "clinical": "為演化上的殘留退化骨。"
        },
        {
            "id": "tarsal_calcaneus", "name_zh": "跟骨",
            "aliases": ["跟骨", "跟骨結節", "飛節尖", "calcaneus"],
            "region": "後肢骨骼", "name_en": "Calcaneus (Point of Hock)", "latin": "Calcaneus",
            "desc": "跗骨中最大者，後上方突出巨大跟骨結節，為阿基里斯腱附著桿槓。",
            "clinical": "形成體表清晰飛節尖，滑囊炎稱「飛節頂囊腫（Capped hock）」。"
        },
        {
            "id": "tarsal_talus_distal", "name_zh": "距骨與遠側跗骨",
            "aliases": ["距骨", "跗骨", "飛節關節骨", "talus"],
            "region": "後肢骨骼", "name_en": "Talus & Tarsal Bones", "latin": "Talus",
            "desc": "距骨具螺旋深滑車；下方為中央跗骨及第1至第4跗骨。",
            "clinical": "遠側跗骨慢性關節炎稱「骨飛節內腫（Bone spavin）」。"
        },
        {
            "id": "metatarsal_3_cannon", "name_zh": "第三蹠骨(後砲骨)",
            "aliases": ["第三蹠骨", "後砲骨", "第3蹠骨", "hind cannon"],
            "region": "後肢骨骼", "name_en": "Third Metatarsal (Hind Cannon)", "latin": "Os metatarsale III",
            "desc": "比前砲骨長約1/6，斷面更圓柱形，傳遞強大推動力。",
            "clinical": "承接後軀推進體重。"
        },
        {
            "id": "hind_digit_bones", "name_zh": "後肢指(趾)骨群",
            "aliases": ["後趾骨", "後蹄骨", "後繫骨", "後冠骨", "hind digits"],
            "region": "後肢骨骼", "name_en": "Hind Digits (Phalanges & Sesamoids)", "latin": "Ossa digiti pedis",
            "desc": "包含後繫骨、冠骨、舟骨與後蹄骨；後蹄底更凹、形狀較前蹄尖窄。",
            "clinical": "後蹄主要負責蹬地推進，前蹄承載主要體重。"
        }
    ],

    "dog": [
        {
            "id": "dog_brain", "name_zh": "大腦與小腦",
            "aliases": ["大腦", "小腦", "腦", "腦部", "brain"],
            "region": "神經系統", "name_en": "Brain (Cerebrum & Cerebellum)", "latin": "Encephalon",
            "desc": "大腦半球具複雜腦回，主掌運動與認知；小腦協調動作平衡。",
            "clinical": "犬癲癇、腦積水及犬瘟熱腦炎常見侵犯部位。"
        },
        {
            "id": "dog_trachea", "name_zh": "氣管",
            "aliases": ["氣管", "trachea"],
            "region": "呼吸系統", "name_en": "Trachea", "latin": "Trachea",
            "desc": "由35-45個C形軟骨環構成之管道，背側由氣管肌封閉。",
            "clinical": "小型犬好發氣管塌陷（Tracheal collapse），發出鵝鳴樣乾咳。"
        },
        {
            "id": "dog_heart", "name_zh": "心臟",
            "aliases": ["心臟", "心", "heart", "cor"],
            "region": "循環系統", "name_en": "Heart", "latin": "Cor",
            "desc": "位於第3至第6肋間胸腔內，心尖指向尾腹側，具四腔室結構。",
            "clinical": "二尖瓣黏液退化病變（MMVD）為高齡小型犬心衰竭最常見病因。"
        },
        {
            "id": "dog_lung_left", "name_zh": "左肺",
            "aliases": ["左肺", "左肺臟", "left lung"],
            "region": "呼吸系統", "name_en": "Left Lung (2 Lobes)", "latin": "Pulmo sinister",
            "desc": "被裂隙清晰分為前葉（含顱側與尾側部）及後葉。",
            "clinical": "心臟左側聽診的重要解剖窗口。"
        },
        {
            "id": "dog_lung_right", "name_zh": "右肺",
            "aliases": ["右肺", "右肺臟", "right lung"],
            "region": "呼吸系統", "name_en": "Right Lung (4 Lobes)", "latin": "Pulmo dexter",
            "desc": "精準分為前葉、中葉、後葉與環繞後腔靜脈之副葉。",
            "clinical": "肺葉扭轉好發於右中葉，需緊急切除。"
        },
        {
            "id": "dog_stomach", "name_zh": "胃",
            "aliases": ["胃", "胃臟", "單胃", "stomach"],
            "region": "消化系統", "name_en": "Stomach (Single C-shaped)", "latin": "Gaster",
            "desc": "橫置C形囊狀單胃，含賁門、胃底、胃體與幽門。",
            "clinical": "大型深胸犬突發致命性「胃擴張扭轉（GDV）」常需緊急手術減壓。"
        },
        {
            "id": "dog_liver", "name_zh": "肝臟",
            "aliases": ["肝臟", "肝", "多葉肝", "liver", "hepar"],
            "region": "消化系統", "name_en": "Liver (6 Lobes)", "latin": "Hepar",
            "desc": "體內最大實質臟器，深裂分為6葉：左外、左內、方葉、右內、右外與尾狀葉。",
            "clinical": "先天性肝門脈分流（PSS）好發於小型純種幼犬。"
        },
        {
            "id": "dog_gallbladder", "name_zh": "膽囊",
            "aliases": ["膽囊", "膽", "gallbladder"],
            "region": "消化系統", "name_en": "Gallbladder", "latin": "Vesica fellea",
            "desc": "梨形綠色囊袋，嵌於右內葉與方葉之間，濃縮排出膽汁。",
            "clinical": "犬膽囊黏液囊腫易導致破裂與膽汁性腹膜炎。"
        },
        {
            "id": "dog_spleen", "name_zh": "脾臟",
            "aliases": ["脾臟", "脾", "舌狀脾", "spleen"],
            "region": "免疫/造血系統", "name_en": "Spleen (Tongue-shaped)", "latin": "Lien",
            "desc": "呈長舌狀，背側固定於胃脾韌帶，體內最大血液儲存庫。",
            "clinical": "犬脾臟血管肉瘤易突發破裂引發急性失血休克。"
        },
        {
            "id": "dog_pancreas", "name_zh": "胰臟",
            "aliases": ["胰臟", "胰", "pancreas"],
            "region": "消化/內分泌", "name_en": "Pancreas (V-shaped)", "latin": "Pancreas",
            "desc": "呈V字形雙葉，右葉沿降十二指腸，左葉緊貼胃背側。",
            "clinical": "高脂飲食好發急性胰臟炎，引發劇烈腹痛嘔吐。"
        },
        {
            "id": "dog_small_intestine", "name_zh": "小腸(十二指腸/空腸/迴腸)",
            "aliases": ["小腸", "空腸", "迴腸", "十二指腸", "small intestine"],
            "region": "消化系統", "name_en": "Small Intestine", "latin": "Intestinum tenue",
            "desc": "包含十二指腸C形圈、佔據腹底部的盤曲空腸及末端迴腸。",
            "clinical": "腸套疊與吞食異物阻塞最常見部位。"
        },
        {
            "id": "dog_cecum", "name_zh": "盲腸",
            "aliases": ["盲腸", "犬盲腸", "螺旋盲腸", "cecum"],
            "region": "消化系統", "name_en": "Cecum (Spiral/S-shaped)", "latin": "Caecum",
            "desc": "犬盲腸特徵：短小且呈**S形或螺旋扭轉狀**盲囊！",
            "clinical": "盲腸內翻套疊或鞭蟲寄生常引起頑固血便。"
        },
        {
            "id": "dog_colon", "name_zh": "結腸與直腸",
            "aliases": ["結腸", "大腸", "直腸", "colon"],
            "region": "消化系統", "name_en": "Colon & Rectum", "latin": "Colon et rectum",
            "desc": "由升結腸、短橫結腸、降結腸與直腸組成；終末兩側具肛門囊。",
            "clinical": "肛門囊阻塞或膿瘍常需定期擠理維護。"
        },
        {
            "id": "dog_kidney_left", "name_zh": "左腎",
            "aliases": ["左腎", "左腎臟", "腎臟", "left kidney"],
            "region": "泌尿系統", "name_en": "Left Kidney", "latin": "Ren sinister",
            "desc": "平滑豆形，位於第2-4腰椎，位置偏腹尾側且活動度高。",
            "clinical": "觸診或超音波掃描極易推移定位。"
        },
        {
            "id": "dog_kidney_right", "name_zh": "右腎",
            "aliases": ["右腎", "右腎臟", "right kidney"],
            "region": "泌尿系統", "name_en": "Right Kidney", "latin": "Ren dexter",
            "desc": "位置較偏前（第1-3腰椎），前端緊密嵌入肝尾狀葉腎窩。",
            "clinical": "緊鄰後腔靜脈，手術暴露難度高於左腎。"
        },
        {
            "id": "dog_urinary_bladder", "name_zh": "膀胱與輸尿管",
            "aliases": ["膀胱", "輸尿管", "bladder"],
            "region": "泌尿系統", "name_en": "Urinary Bladder", "latin": "Vesica urinaria",
            "desc": "厚壁平滑肌梨狀囊袋，位於恥骨前緣腹底壁。",
            "clinical": "膀胱結石好發於公犬，常需膀胱切開取石（Cystotomy）。"
        }
    ],

    "pig": [
        {
            "id": "pig_os_rostri", "name_zh": "吻骨與吻軟骨",
            "aliases": ["吻骨", "吻軟骨", "吻突骨", "豬吻骨", "os rostri"],
            "region": "特徵器官", "name_en": "Rostral Bone (Os rostri)", "latin": "Os rostri",
            "desc": "豬特有吻端骨骼軟骨，支撐堅硬鼻鏡，專門適應「拱土（Rooting）」覓食。",
            "clinical": "現代防拱土管理常對此構造進行鈍化或戴鼻環處理。"
        },
        {
            "id": "pig_trachea_and_bronchus", "name_zh": "氣管與氣管支氣管",
            "aliases": ["氣管支氣管", "氣管", "副支氣管", "tracheal bronchus"],
            "region": "胸腔特徵", "name_en": "Tracheal Bronchus (Pig Hallmark)", "latin": "Bronchus trachealis",
            "desc": "豬呼吸道最著名標記！**氣管在主隆凸分叉前獨立分支直通右肺前葉**！",
            "clinical": "氣管插管過深會堵塞氣管支氣管，造成右肺尖葉急性萎陷塌陷。"
        },
        {
            "id": "pig_heart", "name_zh": "心臟",
            "aliases": ["心臟", "豬心", "心", "heart"],
            "region": "胸腔器官", "name_en": "Heart", "latin": "Cor",
            "desc": "外形鈍圓，冠狀血管解剖與人類極度吻合。",
            "clinical": "醫學異種器官移植（Xenotransplantation）最主要研究供體模式。"
        },
        {
            "id": "pig_lungs", "name_zh": "分葉肺臟",
            "aliases": ["肺臟", "肺", "豬肺", "lungs"],
            "region": "胸腔器官", "name_en": "Lobated Lungs", "latin": "Pulmones",
            "desc": "表面具清晰多邊形次級肺小葉間隔；右肺4葉，左肺2葉。",
            "clinical": "豬氣喘病（肺炎黴漿菌）專門侵犯由氣管支氣管供應之尖葉。"
        },
        {
            "id": "pig_stomach_diverticulum", "name_zh": "胃與胃憩室",
            "aliases": ["胃憩室", "豬胃憩室", "胃", "憩室", "diverticulum ventriculi"],
            "region": "消化特徵", "name_en": "Stomach with Diverticulum", "latin": "Diverticulum ventriculi",
            "desc": "胃底背側突出一錐形盲囊——**「胃憩室」**！幽門部具顯著的**幽門枕**。",
            "clinical": "胃憩室為豬鑑定物種的標誌器官；精飼料過細易引發胃潰瘍出血。"
        },
        {
            "id": "pig_liver_lobules", "name_zh": "網紋分葉肝臟",
            "aliases": ["肝臟", "小葉肝", "豬肝", "liver"],
            "region": "消化特徵", "name_en": "Liver (Interlobular septa)", "latin": "Hepar",
            "desc": "小葉間結締組織非常發達，呈現清晰五角/六角形龜甲狀網紋。",
            "clinical": "蛔蟲幼蟲移行穿透肝小葉修復後形成白色「奶斑肝（Milk spots）」！"
        },
        {
            "id": "pig_gallbladder", "name_zh": "膽囊",
            "aliases": ["膽囊", "豬膽", "gallbladder"],
            "region": "消化特徵", "name_en": "Gallbladder", "latin": "Vesica fellea",
            "desc": "長卵圓形，分泌特有的親水性豬膽酸（Hyocholic acid）。",
            "clinical": "膽汁酸代謝為調節代謝疾病之重要模型。"
        },
        {
            "id": "pig_spleen", "name_zh": "帶狀脾臟",
            "aliases": ["脾臟", "帶狀脾", "豬脾", "strap-like spleen"],
            "region": "特徵器官", "name_en": "Strap-like Spleen", "latin": "Lien",
            "desc": "呈狹長筆直的**「皮帶狀/條帶狀（Strap-like）」**，斷面三稜形。",
            "clinical": "非洲豬瘟（ASF）時呈現典型邊緣出血性梗塞腫大。"
        },
        {
            "id": "pig_pancreas", "name_zh": "環狀穿孔胰臟",
            "aliases": ["胰臟", "豬胰", "pancreas"],
            "region": "消化特徵", "name_en": "Annular Pancreas", "latin": "Pancreas",
            "desc": "體部具圓孔，被肝門靜脈貫穿環繞。",
            "clinical": "曾為早期提取人類醫療用胰島素之最主要天然來源。"
        },
        {
            "id": "pig_spiral_colon", "name_zh": "圓錐螺旋結腸盤",
            "aliases": ["螺旋結腸", "結腸盤", "圓錐結腸", "結腸錐", "spiral colon"],
            "region": "消化特徵", "name_en": "Spiral Colon (Swine Signature)", "latin": "Colon spirale",
            "desc": "豬解剖學最震撼標誌！升結腸盤旋成巨大的倒立圓錐結腸錐（向心與離心迴旋）！",
            "clinical": "豬痢疾短螺旋體與梭菌壞死性腸炎好發於螺旋結腸盤。"
        },
        {
            "id": "pig_cecum", "name_zh": "圓筒肌帶盲腸",
            "aliases": ["盲腸", "豬盲腸", "cecum"],
            "region": "消化特徵", "name_en": "Cylindrical Cecum (3 Taeniae)", "latin": "Caecum",
            "desc": "粗大圓筒盲囊，表面具3條平滑肌帶與多排囊袋。",
            "clinical": "進行粗飼料纖維素微生物發酵消化。"
        },
        {
            "id": "pig_kidneys", "name_zh": "平滑多腎盞腎臟",
            "aliases": ["腎臟", "豬腎", "腎", "kidneys"],
            "region": "泌尿系統", "name_en": "Smooth Kidneys with Calyces", "latin": "Renes",
            "desc": "表面平滑扁平，內部具特殊「腎盞（Calyces）」匯入腎盂。",
            "clinical": "基因編輯異種腎臟移植首選供體器官。"
        },
        {
            "id": "pig_urinary_bladder", "name_zh": "膀胱",
            "aliases": ["膀胱", "豬膀胱", "bladder"],
            "region": "泌尿系統", "name_en": "Urinary Bladder", "latin": "Vesica urinaria",
            "desc": "容量龐大之梨形厚壁肌性囊袋，接收兩側輸尿管尿液。",
            "clinical": "下泌尿道感染或公豬去勢逆行性感染好發部位。"
        }
    ]
}

# ==============================================================================
# 本機 GUI 主程式
# ==============================================================================
class VetAnatomyApp:
    def __init__(self, root):
        self.root = root
        self.root.title("🐾 獸醫解剖本機學習與中文抽考系統")
        self.root.geometry("1080x720")
        self.root.minsize(920, 600)
        self.root.configure(bg="#0f172a")

        # 應用狀態
        self.current_animal = "horse"
        self.current_mode = "study"
        self.quiz_list = []
        self.quiz_index = 0
        self.quiz_score = 0
        self.quiz_streak = 0
        self.quiz_mistakes = []
        self.selected_item = None

        self.setup_styles()
        self.build_ui()
        self.switch_animal("horse")

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure(".", background="#0f172a", foreground="#f8fafc", font=("Microsoft JhengHei", 10))
        style.configure("TFrame", background="#0f172a")
        style.configure("Header.TFrame", background="#1e293b")
        style.configure("Panel.TFrame", background="#1e293b")
        style.configure("Treeview",
                        background="#111827",
                        foreground="#f3f4f6",
                        fieldbackground="#111827",
                        rowheight=28,
                        font=("Microsoft JhengHei", 10))
        style.map("Treeview",
                  background=[("selected", "#0284c7")],
                  foreground=[("selected", "#ffffff")])

    def build_ui(self):
        # 1. 頂部選單欄
        top_bar = tk.Frame(self.root, bg="#1e293b", height=60)
        top_bar.pack(side=tk.TOP, fill=tk.X)

        # 標題
        title_lbl = tk.Label(top_bar, text="🐾 獸醫解剖學習系統", bg="#1e293b", fg="#38bdf8", font=("Microsoft JhengHei", 14, "bold"))
        title_lbl.pack(side=tk.LEFT, padx=16, pady=12)

        # 動物切換按鈕
        self.btn_horse = tk.Button(top_bar, text="🐎 馬骨骼 (全身)", font=("Microsoft JhengHei", 10, "bold"),
                                   bg="#0284c7", fg="#ffffff", activebackground="#38bdf8", relief=tk.FLAT, padx=12, pady=6,
                                   command=lambda: self.switch_animal("horse"))
        self.btn_horse.pack(side=tk.LEFT, padx=4)

        self.btn_dog = tk.Button(top_bar, text="🐕 狗 (內臟器官)", font=("Microsoft JhengHei", 10, "bold"),
                                 bg="#334155", fg="#cbd5e1", activebackground="#38bdf8", relief=tk.FLAT, padx=12, pady=6,
                                 command=lambda: self.switch_animal("dog"))
        self.btn_dog.pack(side=tk.LEFT, padx=4)

        self.btn_pig = tk.Button(top_bar, text="🐖 豬 (特徵器官)", font=("Microsoft JhengHei", 10, "bold"),
                                 bg="#334155", fg="#cbd5e1", activebackground="#38bdf8", relief=tk.FLAT, padx=12, pady=6,
                                 command=lambda: self.switch_animal("pig"))
        self.btn_pig.pack(side=tk.LEFT, padx=4)

        # 模式切換按鈕
        self.btn_mode_quiz = tk.Button(top_bar, text="🎯 進入中文抽考模式", font=("Microsoft JhengHei", 10, "bold"),
                                       bg="#f59e0b", fg="#ffffff", activebackground="#d97706", relief=tk.FLAT, padx=14, pady=6,
                                       command=self.toggle_mode)
        self.btn_mode_quiz.pack(side=tk.RIGHT, padx=16)

        # 2. 中央主區域 (左側清單 + 右側詳解/抽考面板)
        main_paned = tk.PanedWindow(self.root, orient=tk.HORIZONTAL, bg="#0f172a", sashwidth=4)
        main_paned.pack(fill=tk.BOTH, expand=True, padx=14, pady=14)

        # 左側面版 (搜尋與樹狀目錄)
        left_frame = tk.Frame(main_paned, bg="#1e293b", width=340)
        main_paned.add(left_frame, minsize=280)

        search_frame = tk.Frame(left_frame, bg="#1e293b")
        search_frame.pack(fill=tk.X, padx=10, pady=10)

        tk.Label(search_frame, text="🔍 搜尋構造：", bg="#1e293b", fg="#94a3b8", font=("Microsoft JhengHei", 9)).pack(side=tk.LEFT)
        self.search_var = tk.StringVar()
        self.search_var.trace("w", lambda *args: self.filter_tree())
        search_entry = tk.Entry(search_frame, textvariable=self.search_var, bg="#0f172a", fg="#ffffff", insertbackground="#ffffff",
                                relief=tk.FLAT, font=("Microsoft JhengHei", 10))
        search_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=4)

        # 樹狀目錄
        tree_frame = tk.Frame(left_frame, bg="#1e293b")
        tree_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0, 10))

        self.tree = ttk.Treeview(tree_frame, columns=("latin"), show="tree", selectmode="browse")
        tree_scroll = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=tree_scroll.set)
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        tree_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        self.tree.bind("<<TreeviewSelect>>", self.on_tree_select)

        # 右側面板 (學習模式檢視卡 vs 抽考模式互動控制台)
        self.right_frame = tk.Frame(main_paned, bg="#1e293b")
        main_paned.add(self.right_frame, minsize=500)

        # 右側學習模式容器
        self.study_view = tk.Frame(self.right_frame, bg="#1e293b")
        self.build_study_view()

        # 右側抽考模式容器
        self.quiz_view = tk.Frame(self.right_frame, bg="#1e293b")
        self.build_quiz_view()

        self.show_study_view()

    def build_study_view(self):
        # 標籤、名稱、拉丁學名
        self.lbl_region_tag = tk.Label(self.study_view, text="解剖分區", bg="#0284c7", fg="#ffffff", font=("Microsoft JhengHei", 9, "bold"), padx=6, pady=2)
        self.lbl_region_tag.pack(anchor=tk.W, padx=20, pady=(20, 6))

        self.lbl_title_zh = tk.Label(self.study_view, text="請從左側清單選擇解剖構造", bg="#1e293b", fg="#ffffff", font=("Microsoft JhengHei", 20, "bold"))
        self.lbl_title_zh.pack(anchor=tk.W, padx=20, pady=2)

        self.lbl_latin = tk.Label(self.study_view, text="Scientific / Latin Name", bg="#1e293b", fg="#94a3b8", font=("Georgia", 11, "italic"))
        self.lbl_latin.pack(anchor=tk.W, padx=20, pady=(2, 14))

        # 別名清單
        alias_box = tk.Frame(self.study_view, bg="#1e293b")
        alias_box.pack(fill=tk.X, padx=20, pady=4)
        tk.Label(alias_box, text="常用別稱/俗稱：", bg="#1e293b", fg="#cbd5e1", font=("Microsoft JhengHei", 9, "bold")).pack(side=tk.LEFT)
        self.lbl_aliases = tk.Label(alias_box, text="--", bg="#1e293b", fg="#38bdf8", font=("Microsoft JhengHei", 9))
        self.lbl_aliases.pack(side=tk.LEFT)

        # 解剖描述
        tk.Label(self.study_view, text="📖 解剖構造特徵：", bg="#1e293b", fg="#cbd5e1", font=("Microsoft JhengHei", 10, "bold")).pack(anchor=tk.W, padx=20, pady=(16, 4))
        self.txt_desc = tk.Text(self.study_view, bg="#111827", fg="#f3f4f6", font=("Microsoft JhengHei", 10), height=6, wrap=tk.WORD, relief=tk.FLAT, padx=12, pady=10)
        self.txt_desc.pack(fill=tk.X, padx=20, pady=4)
        self.txt_desc.config(state=tk.DISABLED)

        # 獸醫臨床重點
        tk.Label(self.study_view, text="💡 獸醫臨床重點：", bg="#1e293b", fg="#38bdf8", font=("Microsoft JhengHei", 10, "bold")).pack(anchor=tk.W, padx=20, pady=(16, 4))
        self.txt_clinical = tk.Text(self.study_view, bg="#0c4a6e", fg="#e0f2fe", font=("Microsoft JhengHei", 10), height=5, wrap=tk.WORD, relief=tk.FLAT, padx=12, pady=10)
        self.txt_clinical.pack(fill=tk.X, padx=20, pady=4)
        self.txt_clinical.config(state=tk.DISABLED)

    def build_quiz_view(self):
        # 頂部狀態列 (題號、得分、Streak)
        stats_frame = tk.Frame(self.quiz_view, bg="#111827", padx=16, pady=12)
        stats_frame.pack(fill=tk.X, padx=20, pady=16)

        self.lbl_quiz_progress = tk.Label(stats_frame, text="第 1 / 40 題", bg="#111827", fg="#ffffff", font=("Microsoft JhengHei", 11, "bold"))
        self.lbl_quiz_progress.pack(side=tk.LEFT)

        self.lbl_quiz_score = tk.Label(stats_frame, text="得分：0", bg="#111827", fg="#38bdf8", font=("Microsoft JhengHei", 11, "bold"))
        self.lbl_quiz_score.pack(side=tk.LEFT, padx=30)

        self.lbl_quiz_streak = tk.Label(stats_frame, text="🔥 連續答對：0", bg="#111827", fg="#f97316", font=("Microsoft JhengHei", 11, "bold"))
        self.lbl_quiz_streak.pack(side=tk.RIGHT)

        # 題目卡
        card_frame = tk.Frame(self.quiz_view, bg="#1e293b", padx=20, pady=10)
        card_frame.pack(fill=tk.BOTH, expand=True, padx=20)

        self.lbl_quiz_clue_region = tk.Label(card_frame, text="【分區線索】", bg="#0284c7", fg="#ffffff", font=("Microsoft JhengHei", 9, "bold"), padx=8, pady=2)
        self.lbl_quiz_clue_region.pack(anchor=tk.W, pady=6)

        tk.Label(card_frame, text="🎯 請根據解剖線索，鍵入該構造的【中文名稱】：", bg="#1e293b", fg="#ffffff", font=("Microsoft JhengHei", 13, "bold")).pack(anchor=tk.W, pady=4)

        self.txt_quiz_clue = tk.Text(card_frame, bg="#111827", fg="#e2e8f0", font=("Microsoft JhengHei", 10), height=5, wrap=tk.WORD, relief=tk.FLAT, padx=12, pady=10)
        self.txt_quiz_clue.pack(fill=tk.X, pady=8)
        self.txt_quiz_clue.config(state=tk.DISABLED)

        # 輸入區
        input_box = tk.Frame(card_frame, bg="#1e293b")
        input_box.pack(fill=tk.X, pady=12)

        self.quiz_input_var = tk.StringVar()
        self.quiz_entry = tk.Entry(input_box, textvariable=self.quiz_input_var, bg="#0f172a", fg="#ffffff", font=("Microsoft JhengHei", 13, "bold"),
                                   insertbackground="#ffffff", relief=tk.SOLID, bd=2)
        self.quiz_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=8, padx=(0, 10))
        self.quiz_entry.bind("<Return>", lambda e: self.submit_quiz_answer())

        submit_btn = tk.Button(input_box, text="確認提交 ⏎", font=("Microsoft JhengHei", 10, "bold"), bg="#0284c7", fg="#ffffff",
                               relief=tk.FLAT, padx=16, command=self.submit_quiz_answer)
        submit_btn.pack(side=tk.LEFT, padx=4)

        hint_btn = tk.Button(input_box, text="💡 提示", font=("Microsoft JhengHei", 10), bg="#334155", fg="#cbd5e1",
                             relief=tk.FLAT, padx=12, command=self.show_quiz_hint)
        hint_btn.pack(side=tk.LEFT, padx=4)

        skip_btn = tk.Button(input_box, text="跳過 ⏩", font=("Microsoft JhengHei", 10), bg="#334155", fg="#cbd5e1",
                             relief=tk.FLAT, padx=12, command=self.skip_quiz_question)
        skip_btn.pack(side=tk.LEFT, padx=4)

        # 回饋訊息
        self.lbl_quiz_feedback = tk.Label(card_frame, text="", bg="#1e293b", fg="#10b981", font=("Microsoft JhengHei", 11, "bold"))
        self.lbl_quiz_feedback.pack(fill=tk.X, pady=10)

    def show_study_view(self):
        self.current_mode = "study"
        self.quiz_view.pack_forget()
        self.study_view.pack(fill=tk.BOTH, expand=True)
        self.btn_mode_quiz.config(text="🎯 進入中文抽考模式", bg="#f59e0b")

    def show_quiz_view(self):
        self.current_mode = "quiz"
        self.study_view.pack_forget()
        self.quiz_view.pack(fill=tk.BOTH, expand=True)
        self.btn_mode_quiz.config(text="📖 回到學習模式", bg="#0284c7")
        self.start_quiz()

    def toggle_mode(self):
        if self.current_mode == "study":
            self.show_quiz_view()
        else:
            self.show_study_view()

    def switch_animal(self, animal_key):
        self.current_animal = animal_key
        # 更新按鈕外觀
        self.btn_horse.config(bg="#0284c7" if animal_key == "horse" else "#334155", fg="#fff" if animal_key == "horse" else "#cbd5e1")
        self.btn_dog.config(bg="#0284c7" if animal_key == "dog" else "#334155", fg="#fff" if animal_key == "dog" else "#cbd5e1")
        self.btn_pig.config(bg="#0284c7" if animal_key == "pig" else "#334155", fg="#fff" if animal_key == "pig" else "#cbd5e1")

        self.filter_tree()

        # 抽考模式下自動重置
        if self.current_mode == "quiz":
            self.start_quiz()

    def filter_tree(self):
        self.tree.delete(*self.tree.get_children())
        query = self.search_var.get().strip().lower()

        data_list = DATABASE.get(self.current_animal, [])
        groups = {}
        for item in data_list:
            reg = item["region"]
            if reg not in groups: groups[reg] = []
            groups[reg].append(item)

        for reg, items in groups.items():
            filtered = [
                it for it in items
                if not query or query in it["name_zh"].lower() or query in it["name_en"].lower()
                or query in it["latin"].lower() or any(query in a.lower() for a in it["aliases"])
            ]
            if filtered:
                parent_id = self.tree.insert("", "end", text=f"📂 {reg} ({len(filtered)})", open=True)
                for it in filtered:
                    self.tree.insert(parent_id, "end", iid=it["id"], text=f"  🦴 {it['name_zh']}", values=(it["latin"]))

        # 預設選取第一項
        children = self.tree.get_children()
        if children:
            first_items = self.tree.get_children(children[0])
            if first_items:
                self.tree.selection_set(first_items[0])
                self.load_detail(first_items[0])

    def on_tree_select(self, event):
        sel = self.tree.selection()
        if sel and not sel[0].startswith("I"): # 排除分類折疊節點
            self.load_detail(sel[0])

    def load_detail(self, item_id):
        data_list = DATABASE.get(self.current_animal, [])
        item = next((it for it in data_list if it["id"] == item_id), None)
        if not item: return

        self.selected_item = item
        self.lbl_region_tag.config(text=item["region"])
        self.lbl_title_zh.config(text=item["name_zh"])
        self.lbl_latin.config(text=f"{item['name_en']} ({item['latin']})")
        self.lbl_aliases.config(text="、".join(item["aliases"]))

        self.txt_desc.config(state=tk.NORMAL)
        self.txt_desc.delete("1.0", tk.END)
        self.txt_desc.insert(tk.END, item["desc"])
        self.txt_desc.config(state=tk.DISABLED)

        self.txt_clinical.config(state=tk.NORMAL)
        self.txt_clinical.delete("1.0", tk.END)
        self.txt_clinical.insert(tk.END, item["clinical"])
        self.txt_clinical.config(state=tk.DISABLED)

    # ---------------- 抽考功能 ----------------
    def start_quiz(self, retry_mistakes=False):
        if retry_mistakes and self.quiz_mistakes:
            self.quiz_list = list(self.quiz_mistakes)
        else:
            data = DATABASE.get(self.current_animal, [])
            self.quiz_list = list(data)
            random.shuffle(self.quiz_list)

        self.quiz_index = 0
        self.quiz_score = 0
        self.quiz_streak = 0
        self.quiz_mistakes = []
        self.next_quiz_question()

    def update_quiz_header(self):
        self.lbl_quiz_progress.config(text=f"第 {self.quiz_index + 1} / {len(self.quiz_list)} 題")
        self.lbl_quiz_score.config(text=f"得分：{self.quiz_score}")
        self.lbl_quiz_streak.config(text=f"🔥 連續答對：{self.quiz_streak}")

    def next_quiz_question(self):
        if self.quiz_index >= len(self.quiz_list):
            self.finish_quiz()
            return

        self.update_quiz_header()
        target = self.quiz_list[self.quiz_index]

        self.lbl_quiz_clue_region.config(text=f"所屬分類：{target['region']}")

        self.txt_quiz_clue.config(state=tk.NORMAL)
        self.txt_quiz_clue.delete("1.0", tk.END)
        clue_text = f"【形態構造特徵】\n{target['desc']}\n\n【臨床重點】\n{target['clinical']}"
        self.txt_quiz_clue.insert(tk.END, clue_text)
        self.txt_quiz_clue.config(state=tk.DISABLED)

        self.quiz_input_var.set("")
        self.quiz_entry.config(bg="#0f172a")
        self.quiz_entry.focus_set()
        self.lbl_quiz_feedback.config(text="")

    def check_match(self, user_text, target):
        clean = lambda s: re.sub(r"[\s\(\)（）\-_部骨臟]", "", s).lower()
        u = clean(user_text)
        if clean(target["name_zh"]) == u: return True
        for al in target["aliases"]:
            if clean(al) == u: return True
            if len(u) >= 2 and (clean(al) in u or u in clean(al)): return True
        if target["name_en"].lower() == user_text.lower() or target["latin"].lower() == user_text.lower():
            return True
        return False

    def submit_quiz_answer(self):
        if self.quiz_index >= len(self.quiz_list): return
        target = self.quiz_list[self.quiz_index]
        ans = self.quiz_input_var.get().strip()
        if not ans: return

        if self.check_match(ans, target):
            self.quiz_score += 10 + self.quiz_streak * 2
            self.quiz_streak += 1
            self.lbl_quiz_feedback.config(text=f"🎉 答對了！這是【{target['name_zh']}】({target['latin']})", fg="#10b981")
            self.quiz_entry.config(bg="#064e3b")
            play_sound_correct()
            self.root.after(1000, self.advance_quiz)
        else:
            self.quiz_streak = 0
            if target not in self.quiz_mistakes: self.quiz_mistakes.append(target)
            self.lbl_quiz_feedback.config(text=f"❌ 不對喔！正確名稱是：【{target['name_zh']}】({target['latin']})", fg="#ef4444")
            self.quiz_entry.config(bg="#7f1d1d")
            play_sound_wrong()
            self.root.after(1800, self.advance_quiz)

        self.update_quiz_header()

    def advance_quiz(self):
        self.quiz_index += 1
        self.next_quiz_question()

    def show_quiz_hint(self):
        if self.quiz_index >= len(self.quiz_list): return
        target = self.quiz_list[self.quiz_index]
        self.lbl_quiz_feedback.config(
            text=f"💡 提示：共 {len(target['name_zh'])} 個字，首字為「{target['name_zh'][0]}」；英文名：{target['name_en']}",
            fg="#f59e0b"
        )

    def skip_quiz_question(self):
        if self.quiz_index >= len(self.quiz_list): return
        target = self.quiz_list[self.quiz_index]
        if target not in self.quiz_mistakes: self.quiz_mistakes.append(target)
        self.quiz_streak = 0
        self.advance_quiz()

    def finish_quiz(self):
        total = len(self.quiz_list)
        wrong = len(self.quiz_mistakes)
        correct = total - wrong
        acc = int((correct / total) * 100) if total else 0

        msg = f"測驗完成！\n總題數：{total}\n答對：{correct}\n答錯：{wrong}\n答對率：{acc}%"
        if wrong > 0:
            if messagebox.askyesno("測驗結算", f"{msg}\n\n是否立即【單獨複習剛才的 {wrong} 道錯題】？"):
                self.start_quiz(retry_mistakes=True)
                return

        messagebox.showinfo("測驗結算", msg)
        self.show_study_view()

if __name__ == "__main__":
    root = tk.Tk()
    app = VetAnatomyApp(root)
    root.mainloop()
