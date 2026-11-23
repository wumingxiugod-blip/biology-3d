/* 場景①：長骨的構造（講義 p.1–2：Terminology、骨結構分佈） */
(function () {
  let S = null;
  // 外輪廓半徑（y：-15.2 → 15.2）
  const rOut = y => { const a = Math.abs(y); if (a <= 8) return 1.5; if (a <= 13) return 1.5 + 1.5 * ease((a - 8) / 5); return 3.0 * Math.sqrt(Math.max(0, 1 - ((a - 13) / 2.2) ** 2)); };
  const rCav = y => { const a = Math.abs(y); return a <= 8.5 ? 0.95 : a < 10 ? 0.95 * Math.sqrt(1 - (a - 8.5) / 1.5) : 0; };
  const samp = (y0, y1, f, n = 80) => { const o = []; for (let i = 0; i <= n; i++) { const y = y0 + (y1 - y0) * i / n; o.push([f(y), y]); } return o; };
  const YE = 15.2, YP = 11.6; // 端點、骺板位置

  SCENES.push({
    name: '① 長骨構造',
    title: '長骨的構造（以股骨為例）',
    camera: { pos: [14, 4, 50], target: [0, 0, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([14, 4, 50], [0, 0, 0]); } },
      { label: '🔍 近端骨骺', fn() { flyTo([4, 12, 14], [0, 11.5, 0]); } },
      { label: '🔍 骨幹', fn() { flyTo([5, 0, 12], [0, 0, 0]); } }
    ],
    desc: `
  <p><b>骨骼的功能</b>：① 支持（形成骨架、維持外型）② 保護臟器 ③ <b>造血</b>（紅骨髓製造紅血球、白血球、血小板）④ 儲存礦物質與脂肪 ⑤ 配合肌肉形成<b>槓桿</b>產生運動。</p>
  <p><b>組成</b>（講義）：鈣磷鹽約 2/3 骨重、膠原約 1/3、骨細胞與蛋白聚醣約 2%。課本指出骨中的鈣磷鹽是<b>羥磷灰石</b>晶體 Ca₁₀(PO₄)₆(OH)₂，沉積在成骨細胞分泌的膠原基質上。</p>
  <table>
  <tr><td><b>骨幹</b> diaphysis</td><td>骨的主體（中段）</td></tr>
  <tr><td><b>骨骺</b> epiphysis</td><td>骨的兩端</td></tr>
  <tr><td><b>骨幹端</b> metaphysis</td><td>骨幹與骨骺交接處；生長期有<b>骺板</b>（軟骨鈣化區）</td></tr>
  <tr><td><b>骨髓腔</b></td><td>骨幹內空腔，含紅、黃骨髓（成人骨幹內主要為黃骨髓）</td></tr>
  <tr><td><b>骨外膜</b> periosteum</td><td>骨表面的白色纖維膜：外層纖維層（含血管、淋巴管、神經），內層生骨層（含彈性纖維、血管與<b>成骨細胞</b>）</td></tr>
  <tr><td><b>骨內膜</b> endosteum</td><td>襯在骨髓腔內面，含<b>蝕骨細胞</b></td></tr>
  </table>
  <p><b>緻密骨</b>：由許多骨元（osteon）構成，承受應力的主要部位。<b>海綿骨</b>：無骨元，由<b>骨小樑</b>形成格子網，其間充滿<b>紅骨髓</b>（造血）。</p>`,
    build() {
      S = {};
      const outer = samp(-YE, YE, rOut, 160), shaftIn = samp(-10, 10, rCav, 60);
      // 後半外表面（緻密骨）
      S.outer = halfLathe(outer, BONE, 1, false, 48);
      
      reg('骨組織', '緻密骨', 'Compact bone', '骨幹的厚壁與骨骺表面的薄殼；由許多<b>骨元</b>構成（見②），是承受應力的主要部位。',
        [S.outer, cutFace(samp(-10, 10, rOut, 60), shaftIn, 0xe2cfa6)], { anchor: [1.25, 3, 0.05] });
      // 海綿骨剖面（兩端）：外殼 0.25 內
      const sTex = spongyTex(4);
      const spg = [];
      [[-YE + 0.4, -9.3], [9.3, YE - 0.4]].forEach(([a, b]) => {
        const sh = new THREE.Shape(), pts = samp(a, b, y => Math.max(0.05, rOut(y) - 0.25), 50);
        pts.forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1]));
        for (let i = pts.length - 1; i >= 0; i--) sh.lineTo(-pts[i][0], pts[i][1]);
        const g = new THREE.ShapeGeometry(sh), uv = [], P = g.attributes.position;
        for (let i = 0; i < P.count; i++) uv.push(P.getX(i) * 0.3, P.getY(i) * 0.3);
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.translate(0, 0, 0.01);
        spg.push(new THREE.Mesh(g, mat(0xffffff, 1, { map: sTex })));
        // 緻密骨薄殼剖面
        spg.push(null);
      });
      const shell = [];
      [[-YE, -9.3], [9.3, YE]].forEach(([a, b]) => shell.push(cutFace(samp(a, b, rOut, 50), samp(a + (a < 0 ? 0.25 : 0), b - (b > 0 ? 0.25 : 0), y => Math.max(0.02, rOut(y) - 0.25), 50), 0xe2cfa6)));
      partBy('緻密骨').meshes.push(...shell); shell.forEach(m => { m.userData.part = partBy('緻密骨'); CUR.root.add(m); });
      reg('骨組織', '海綿骨（骨小樑）', 'Spongy bone (trabeculae)', '無骨元，由<b>骨小樑</b>（trabeculae）交織成格子網；骨小樑內有骨細胞，網眼間充滿<b>紅骨髓</b>。', spg.filter(Boolean), { anchor: [1.2, 12.6, 0.05] });
      reg('骨髓', '紅骨髓', 'Red marrow', '位於海綿骨的網眼中（剖面上的紅色部分），<b>造血</b>：製造紅血球、白血球及血小板。',
        [9.3, -YE + 0.4].map((a, k) => halfLathe(samp(k ? a : a, k ? -9.3 : YE - 0.4, y => Math.max(0.05, rOut(y) - 0.27), 40), MARR, 1, false, 32)), { anchor: [-1.6, 11.0, 0.05] });
      S.pFront = reg('骨組織', '前半外表面', 'Front half', '', halfLathe(outer, BONE, 1, true, 48), { hidden: true, nolabel: true });
      reg('骨髓', '黃骨髓（骨髓腔）', 'Yellow marrow in medullary cavity', '骨幹內的空腔＝<b>骨髓腔</b>；成人骨幹內主要是以脂肪為主的黃骨髓。',
        [cutFace(shaftIn, null, MARY, 1), halfLathe(shaftIn.map(p => [p[0] - 0.02, p[1]]), MARY, 1, false, 32)], { anchor: [0, -4, 0.05] });
      partBy('黃骨髓（骨髓腔）').meshes[0].position.z = 0.02;
      reg('骨膜', '骨內膜', 'Endosteum', '襯在骨髓腔內面的薄膜，含<b>蝕骨細胞</b>（osteoclast）。', halfLathe(shaftIn.map(p => [p[0] + 0.03, p[1]]), 0xff9040, 0.55, false, 32), { anchor: [-0.95, -6, -0.1] });
      // 骨外膜：兩層，在前方剝開一片
      const pAll = samp(-YP + 0.3, YP - 0.3, rOut, 60);
      const fib = halfLathe(samp(-YP + 0.3, 3, rOut, 40).map(p => [p[0] + 0.2, p[1]]), 0xf6f6f0, 0.5, false, 48);
      const ost = halfLathe(pAll.map(p => [p[0] + 0.1, p[1]]), 0xf0a0a8, 0.5, false, 48);
      reg('骨膜', '骨外膜（纖維層）', 'Periosteum – fibrous layer', '骨表面的白色纖維外膜之<b>外層</b>：含血管、淋巴管及神經。（上半段已剝除，露出內層）', fib, { anchor: [1.9, -5, 0.6] });
      reg('骨膜', '骨外膜（生骨層）', 'Periosteum – osteogenic layer', '骨外膜<b>內層</b>：含彈性纖維、血管及<b>成骨細胞</b>（osteoblast），負責骨的<b>增粗</b>（周邊生長）與修復。', ost, { anchor: [-1.65, 5, -0.4] });
      // 關節軟骨
      const cap = [];
      [1, -1].forEach(s => {
        const pr = samp(13.4, YE + 0.25, y => Math.max(0.0001, 3.0 * Math.sqrt(Math.max(0, 1 - ((y - 13) / 2.45) ** 2)) + 0.06), 30).map(p => [p[0], s * p[1]]);
        if (s < 0) pr.reverse();
        cap.push(halfLathe(pr, CART, 1, false, 40));
        const line = samp(13.4, YE, rOut, 24), arc = line.concat(line.slice(0, -1).reverse().map(p => [-p[0], p[1]]));
        const m = extrudePoly(bandPts(arc.map(p => [p[0], s * p[1]]), 0.5), 0.02, CART, 1, 0.03); cap.push(m);
      });
      reg('關節', '關節軟骨', 'Articular cartilage', '覆蓋在骨端關節面的<b>透明軟骨</b>，表面光滑、可減少摩擦並緩衝。', cap, { anchor: [1.6, 14.9, 0.1] });
      // 骺板 / 骺線
      S.plate = [1, -1].map(s => { const m = box([0, s * YP, 0.03], [2 * rOut(YP) - 0.1, 0.32, 0.02], 0x7fc8ff); return m; });
      S.line = [1, -1].map(s => box([0, s * YP, 0.035], [2 * rOut(YP) - 0.2, 0.07, 0.02], 0xffffff));
      S.pPlate = reg('骨幹端', '骺板（生長板）', 'Epiphyseal plate', '兒童與青少年骨幹端的<b>透明軟骨</b>層；軟骨細胞分裂並鈣化、被骨取代，使骨<b>變長</b>（軟骨內骨化，見③）。', S.plate, { anchor: [1.9, YP, 0.05] });
      S.pLine = reg('骨幹端', '骺線', 'Epiphyseal line', '成年後骺板關閉、被骨取代所留下的痕跡，骨即停止增長。', S.line, { anchor: [-1.9, -YP, 0.05] });
      S.pLine.visible = false;
      // 營養動脈
      reg('血管', '營養動脈', 'Nutrient artery', '經骨幹上的<b>營養孔</b>斜穿緻密骨進入骨髓腔，分支供應骨髓與骨內部。',
        [ttube([[4.5, 1, -1.2], [2.2, 2, -1.0], [1.2, 2.4, -0.6], [0.3, 3.4, -0.3], [0.1, 8, -0.3]], 0.12, 0xd02030), ttube([[0.3, 3.4, -0.3], [0, -1, -0.3], [-0.2, -8, -0.3]], 0.09, 0xd02030)], { anchor: [3.2, 1.4, -1.1] });
      // 區域標示括號（右側）
      const br = (y0, y1, x, col) => [cyl([x, y0, 0], [x, y1, 0], 0.06, col), cyl([x - 0.4, y0, 0], [x, y0, 0], 0.06, col), cyl([x - 0.4, y1, 0], [x, y1, 0], 0.06, col)];
      reg('區域', '骨骺（近端）', 'Proximal epiphysis', '骨的兩端；內部為海綿骨（含紅骨髓），外包薄層緻密骨，關節面覆蓋關節軟骨。', br(YP + 0.2, YE, 4.2, 0xffd479), { anchor: [4.2, 13.4, 0] });
      reg('區域', '骨幹端', 'Metaphysis', '骨幹與骨骺的交接處；生長期在此有骺板（軟骨鈣化區）。', br(8, YP - 0.2, 4.2, 0x7fc8ff), { anchor: [4.2, 9.8, 0] });
      reg('區域', '骨幹', 'Diaphysis', '骨的主體，中空的管狀緻密骨，內為骨髓腔。', br(-8, 8, 4.2, 0xffffff), { anchor: [4.2, 0, 0] });
      reg('區域', '骨骺（遠端）', 'Distal epiphysis', '骨的另一端。', br(-YE, -YP - 0.2, 4.2, 0xffd479), { anchor: [4.2, -13.4, 0] });
    },
    panel(box) {
      checkbox(box, '顯示前半（完整外觀）', false, v => { S.pFront.visible = v; rebuildList(); refresh(); });
      checkbox(box, '成人（骺板已關閉 → 骺線）', false, v => { S.pPlate.visible = !v; S.pLine.visible = v; rebuildList(); refresh(); });
    }
  });
})();
