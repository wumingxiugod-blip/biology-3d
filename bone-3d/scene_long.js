/* 場景①：長骨的構造——右側股骨冠狀剖面（講義 p.1–2：Terminology、骨結構分佈） */
(function () {
  let S = null, ADULT = false;
  const ZC = 0.1; // 剖面位置（z = 0.1，保留後半）
  const B0 = [-4.1, -15.8, -2.7], B1 = [3.2, 15.6, 2.2];

  function geos() {
    return BONES.once('femurGeo', () => {
      const f = BONES.femur;
      const back = SDF.mesh((x, y, z) => Math.max(f(x, y, z), z - ZC), B0, [B1[0], B1[1], ZC + 0.15], 0.1);
      const front = SDF.mesh((x, y, z) => Math.max(f(x, y, z), ZC - z), [B0[0], B0[1], ZC - 0.15], B1, 0.1);
      const notCap = (x, y, z, nx, ny, nz) => nz < 0.8 || z < ZC - 0.12;
      const cart = SDF.skin(back, 0.16, (x, y, z, nx, ny, nz) => notCap(x, y, z, nx, ny, nz) && BONES.femCartMask(x, y, z));
      const cartF = SDF.skin(front, 0.16, (x, y, z, nx, ny, nz) => (nz > -0.8 || z > ZC + 0.12) && BONES.femCartMask(x, y, z));
      const periF = SDF.skin(back, 0.09, (x, y, z, nx, ny, nz) => notCap(x, y, z, nx, ny, nz) && y > -10.5 && y < 3);
      const periO = SDF.skin(back, 0.04, (x, y, z, nx, ny, nz) => notCap(x, y, z, nx, ny, nz) && y > -10.8 && y < 9.5);
      [back, front, cart, cartF, periF, periO].forEach(g => g.userData.shared = true);
      return { back, front, cart, cartF, periF, periO };
    });
  }
  function sliceMeshes(adult) {
    return BONES.once('femurSlice' + adult, () => SDF.slices({ o: [B0[0], B0[1], ZC], u: [1, 0, 0], v: [0, 1, 0], w: B1[0] - B0[0], h: B1[1] - B0[1] }, 46, (x, y, z) => {
      const d = BONES.femur(x, y, z);
      if (d > 0.17) return null;
      const ay = Math.abs(y), tc = 0.1 + 0.27 * SDF.clamp((10 - ay) / 4, 0, 1);
      const cav = ay < 9 ? BONES.femCav(x, y, z) : null;
      const an = Math.abs(y) > 9 ? [1.25, 0.7] : [1, 1]; // 骨小樑大致沿縱向（承重方向）排列
      return BONES.boneRegion(x, y, z, d, cav, tc, BONES.femPlate(x, y, z), adult, d > 0 && BONES.femCartMask(x, y, z), an);
    }));
  }

  SCENES.push({
    name: '① 長骨構造',
    title: '長骨的構造（右側股骨，冠狀剖面）',
    camera: { pos: [9, 3, 44], target: [-0.3, 0, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([9, 3, 44], [-0.3, 0, 0]); } },
      { label: '🔍 近端（股骨頭）', fn() { flyTo([1, 13.5, 13], [-0.6, 12, 0]); } },
      { label: '🔍 骨幹', fn() { flyTo([3, 1, 11], [0.3, 0, 0]); } },
      { label: '🔍 遠端（股骨髁）', fn() { flyTo([2, -12, 12], [0, -13, 0]); } },
      { label: '🔍 背面', fn() { flyTo([-6, 2, -36], [0, 0, 0]); } }
    ],
    desc: `
  <p><b>骨骼的功能</b>：① 支持（形成骨架、維持外型）② 保護臟器 ③ <b>造血</b>（紅骨髓製造紅血球、白血球、血小板）④ 儲存礦物質與脂肪 ⑤ 配合肌肉形成<b>槓桿</b>產生運動。</p>
  <p><b>組成</b>（講義）：鈣磷鹽約 2/3 骨重、膠原約 1/3、骨細胞與蛋白聚醣約 2%。課本指出骨中的鈣磷鹽是<b>羥磷灰石</b>晶體 Ca₁₀(PO₄)₆(OH)₂，沉積在成骨細胞分泌的膠原基質上。</p>
  <table>
  <tr><td><b>骨幹</b> diaphysis</td><td>骨的主體（中段）</td></tr>
  <tr><td><b>骨骺</b> epiphysis</td><td>骨的兩端（股骨頭、股骨髁）</td></tr>
  <tr><td><b>骨幹端</b> metaphysis</td><td>骨幹與骨骺交接處；生長期有<b>骺板</b>（軟骨鈣化區）</td></tr>
  <tr><td><b>骨髓腔</b></td><td>骨幹內空腔，含紅、黃骨髓（成人骨幹內主要為黃骨髓）</td></tr>
  <tr><td><b>骨外膜</b> periosteum</td><td>骨表面的白色纖維膜：外層纖維層（含血管、淋巴管、神經），內層生骨層（含彈性纖維、血管與<b>成骨細胞</b>）</td></tr>
  <tr><td><b>骨內膜</b> endosteum</td><td>襯在骨髓腔內面，含<b>蝕骨細胞</b></td></tr>
  </table>
  <p><b>緻密骨</b>：由許多骨元構成，承受應力的主要部位（骨幹最厚）。<b>海綿骨</b>：無骨元，由<b>骨小樑</b>形成格子網，其間充滿<b>紅骨髓</b>；骨小樑的排列方向順著受力方向。</p>
  <p class="hint">模型以右側股骨為例（前方朝向你）；剖面切開前半以露出內部。</p>`,
    build() {
      S = {};
      const G = geos(), SL = sliceMeshes(ADULT);
      const boneM = new THREE.Mesh(G.back, mat(BONE));
      const P = (k, zh, en, info, anchor) => SL[k] ? reg('骨組織', zh, en, info, SL[k], { anchor }) : null;
      reg('骨組織', '緻密骨', 'Compact bone', '骨幹的厚壁與骨骺表面的薄殼；由許多<b>骨元</b>構成（見②），是承受應力的主要部位。剖面上越往骨幹中段越厚。', [boneM, SL['緻密骨']], { anchor: [-0.95, 2, ZC + 0.05] });
      P('骨小樑', '海綿骨（骨小樑）', 'Spongy bone (trabeculae)', '無骨元，由<b>骨小樑</b>交織成格子網，排列方向順著承重的應力線（股骨頸、股骨頭特別明顯）。', [-2.0, 13.6, ZC]);
      P('紅骨髓', '紅骨髓', 'Red marrow', '填在骨小樑的網眼中，<b>造血</b>：製造紅血球、白血球及血小板。', [1.2, 12.5, ZC]);
      P('黃骨髓', '黃骨髓（骨髓腔）', 'Yellow marrow in medullary cavity', '骨幹內的空腔＝<b>骨髓腔</b>；成人骨幹內主要是以脂肪為主的黃骨髓。', [0.25, -2, ZC]);
      P('骨內膜', '骨內膜', 'Endosteum', '襯在骨髓腔內面的薄膜，含<b>蝕骨細胞</b>（osteoclast）。', [-0.25, 5, ZC]);
      P(ADULT ? '骺線' : '骺板', ADULT ? '骺線' : '骺板（生長板）', ADULT ? 'Epiphyseal line' : 'Epiphyseal plate', ADULT ? '成年後骺板關閉、被骨取代所留下的痕跡，骨即停止增長。' : '兒童與青少年骨骺與骨幹端之間的<b>透明軟骨</b>層；軟骨細胞分裂並鈣化、被骨取代，使骨<b>變長</b>（見③）。股骨頭基部與遠端各有一個。', [1.6, -12.2, ZC]);
      reg('骨組織', '關節軟骨', 'Articular cartilage', '覆蓋股骨頭、股骨髁與髕骨面的<b>透明軟骨</b>，表面光滑，可減少摩擦並緩衝。', [new THREE.Mesh(G.cart, mat(CART)), ...(SL['關節軟骨'] ? [SL['關節軟骨']] : [])], { anchor: [-2.4, 15.25, 0.3] });
      S.pFront = reg('骨組織', '前半（完整外觀）', 'Front half', '', [new THREE.Mesh(G.front, mat(BONE)), new THREE.Mesh(G.cartF, mat(CART))], { hidden: true, nolabel: true });
      reg('骨膜', '骨外膜（纖維層）', 'Periosteum – fibrous layer', '骨表面的白色纖維外膜之<b>外層</b>：含血管、淋巴管及神經。（上半段已剝除，露出內層）', new THREE.Mesh(G.periF, mat(0xf6f6f0, 0.55)), { anchor: [1.25, -6, -0.4] });
      reg('骨膜', '骨外膜（生骨層）', 'Periosteum – osteogenic layer', '骨外膜<b>內層</b>：含彈性纖維、血管及<b>成骨細胞</b>（osteoblast），負責骨的<b>增粗</b>（周邊生長）與修復。', new THREE.Mesh(G.periO, mat(0xf0a0a8, 0.45)), { anchor: [-1.15, 6, -0.3] });
      // 骨的部位（標記點）
      const mk = (zh, en, info, p) => reg('股骨的部位', zh, en, info, ell(p, [0.25, 0.25, 0.25], 0xffffff, 0.0), { anchor: p });
      mk('股骨頭', 'Head of femur', '球形，嵌入髖臼形成<b>杵臼關節</b>（髖關節）；表面覆蓋關節軟骨，中央小凹為股骨頭凹（股骨頭韌帶附著）。', [-3.0, 14.6, 0.2]);
      mk('股骨頸', 'Neck of femur', '連接股骨頭與骨幹，與骨幹約成 125° 角；老年人骨質疏鬆時易在此骨折。', [-1.0, 12.9, 0.2]);
      mk('大轉子', 'Greater trochanter', '外側的大突起，臀肌附著處。', [2.1, 13.2, 0.0]);
      mk('小轉子', 'Lesser trochanter', '後內側的小突起，髂腰肌附著處。', [-0.85, 10.5, -0.6]);
      mk('內側髁', 'Medial condyle', '與脛骨內側髁形成膝關節。', [-2.3, -14.0, -0.2]);
      mk('外側髁', 'Lateral condyle', '與脛骨外側髁形成膝關節。', [2.3, -14.0, -0.2]);
      mk('髕骨面', 'Patellar surface', '遠端前方的淺溝（滑車），與髕骨後面形成關節。', [0, -12.6, 1.4]);
      mk('股骨粗線', 'Linea aspera', '骨幹後面的縱行骨嵴，許多大腿肌肉附著。', [0.25, 1, -1.05]);
      // 營養動脈（畫在剖面上）
      reg('血管', '營養動脈', 'Nutrient artery', '經骨幹上的<b>營養孔</b>斜穿緻密骨進入骨髓腔，分支供應骨髓與骨內部。',
        [ttube([[-3.2, 1.2, ZC + 0.12], [-1.5, 1.8, ZC + 0.12], [-0.7, 2.3, ZC + 0.12], [-0.15, 3.0, ZC + 0.12], [0.1, 7.5, ZC + 0.12]], 0.1, 0xd02030), ttube([[-0.15, 3.0, ZC + 0.12], [-0.05, -1, ZC + 0.12], [0.05, -7.5, ZC + 0.12]], 0.08, 0xd02030)], { anchor: [-2.6, 1.4, ZC + 0.15] });
      // 區域標示括號
      const br = (y0, y1, x, col) => [cyl([x, y0, 0], [x, y1, 0], 0.06, col), cyl([x - 0.4, y0, 0], [x, y0, 0], 0.06, col), cyl([x - 0.4, y1, 0], [x, y1, 0], 0.06, col)];
      reg('區域', '骨骺（近端）', 'Proximal epiphysis', '股骨頭：內部為海綿骨（含紅骨髓），外包薄層緻密骨，關節面覆蓋關節軟骨。', br(12.9, 15.2, 3.9, 0xffd479), { anchor: [3.9, 14, 0] });
      reg('區域', '骨幹端', 'Metaphysis', '骨幹與骨骺的交接處；生長期在此有骺板。', [...br(8.5, 12.7, 3.9, 0x7fc8ff), ...br(-12.0, -8.5, 3.9, 0x7fc8ff)], { anchor: [3.9, 10.6, 0] });
      reg('區域', '骨幹', 'Diaphysis', '骨的主體，中空的管狀緻密骨，內為骨髓腔。', br(-8.3, 8.3, 3.9, 0xffffff), { anchor: [3.9, 0, 0] });
      reg('區域', '骨骺（遠端）', 'Distal epiphysis', '股骨髁：與脛骨、髕骨形成膝關節。', br(-15.3, -12.2, 3.9, 0xffd479), { anchor: [3.9, -13.7, 0] });
    },
    panel(box) {
      checkbox(box, '顯示前半（完整外觀）', false, v => { S.pFront.visible = v; rebuildList(); refresh(); });
      checkbox(box, '成人（骺板已關閉 → 骺線）', ADULT, v => { ADULT = v; reloadKeep(); });
      note(box, '第一次開啟此頁需要約一兩秒建立骨骼模型。');
    }
  });
})();
