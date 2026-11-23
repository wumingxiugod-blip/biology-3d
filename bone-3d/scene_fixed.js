/* 場景⑥：不動關節與微動關節（講義 p.5、p.7） */
(function () {
  const POS = { suture: [-12, 5], gomph: [0, 5], synch: [12, 5], synost: [-12, -6], syndes: [0, -6], symph: [12, -6] };
  const at = (k, dx = 0, dy = 0, dz = 0) => [POS[k][0] + dx, POS[k][1] + dy, dz];

  SCENES.push({
    name: '⑥ 不動與微動關節',
    title: '關節的分類：不動關節與微動關節',
    camera: { pos: [0, 2, 34], target: [0, -0.5, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([0, 2, 34], [0, -0.5, 0]); } },
      ...Object.entries({ suture: '縫合', gomph: '釘嵌', synch: '軟骨接合', synost: '骨質接合', syndes: '韌帶聯合', symph: '聯合' }).map(([k, n]) => ({ label: '🔍 ' + n, fn() { const [x, y] = POS[k]; flyTo([x + 2, y + 2, 10], [x, y, 0]); } }))
    ],
    desc: `
  <p><b>關節</b>（articulation）：兩骨交接處。依<b>運動範圍</b>分為：</p>
  <p><b>1. 不動關節</b>（synarthrosis）：無關節腔，骨間充填結締組織或軟骨，年齡增長後可能癒合。</p>
  <ul>
  <li>依骨接面：<b>縫合</b>（suture）—額、頂、顳骨間的骨縫；<b>釘嵌</b>（gomphosis）—牙齒與齒槽。</li>
  <li>依組織性質：<b>軟骨接合</b>（synchondrosis）—以透明軟骨相連，如第一肋骨與胸骨柄、骺板；<b>骨質接合</b>（synostosis）—原本分開的骨完全癒合，如頭部諸骨。</li>
  </ul>
  <p><b>2. 微動關節</b>（amphiarthrosis）：只允許非常有限的運動。</p>
  <ul><li><b>韌帶聯合</b>（syndesmosis）—脛骨與腓骨遠端之間的骨間韌帶。</li><li><b>聯合</b>（symphysis）—以纖維軟骨盤相連，如<b>恥骨聯合</b>。</li></ul>
  <p><b>3. 可動關節</b>（synovial joint）：見④⑤。</p>`,
    build() {
      // 縫合：兩片顱骨以鋸齒狀邊緣互相嵌合
      const zig = []; for (let i = 0; i <= 24; i++) { const y = -2.2 + i * 4.4 / 24; zig.push([0.35 * Math.sin(i * 1.7) + 0.2 * Math.sin(i * 4.1), y]); }
      // 顱骨片：球殼的一部分（外板／板障／內板），以鋸齒線分成左右兩塊
      const RS = 7, CZ = 0.3 - RS, zx = y => 0.35 * Math.sin((y + 2.2) / 4.4 * 24 * 1.7) + 0.2 * Math.sin((y + 2.2) / 4.4 * 24 * 4.1);
      const shell = (x, y, z) => Math.abs(Math.hypot(x, y, z - CZ) - (RS - 0.3)) - 0.3;
      const rect = (x, y) => Math.max(Math.abs(x) - 3, Math.abs(y) - 2.2);
      const lin = c => [Math.pow(((c >> 16) & 255) / 255, 2.2), Math.pow(((c >> 8) & 255) / 255, 2.2), Math.pow((c & 255) / 255, 2.2)];
      const layerCol = (x, y, z) => Math.abs(Math.hypot(x, y, z - CZ) - (RS - 0.3)) < 0.13 ? lin(0xc86a5a) : lin(0xe6d6b2);
      const SK = BONES.once('skullGeo', () => {
        const m = f => { const g = SDF.mesh(f, [-3.15, -2.35, -0.9], [3.15, 2.35, 0.5], 0.055, { color: layerCol }); g.userData.shared = true; return g; };
        return { L: m((x, y, z) => Math.max(shell(x, y, z), rect(x, y), x - zx(y))), R: m((x, y, z) => Math.max(shell(x, y, z), rect(x, y), zx(y) + 0.07 - x)), F: m((x, y, z) => Math.max(shell(x, y, z), rect(x, y))) };
      });
      const pl = (g, k) => { const m = new THREE.Mesh(g, mat(0xffffff, 1, { vertexColors: true })); m.position.set(...at(k)); m.rotation.x = -0.35; return m; };
      reg('不動關節', '縫合（顱骨）', 'Suture', '顱骨之間以<b>鋸齒狀邊緣</b>互相嵌合，其間只有很薄的緻密結締組織（縫合韌帶）。例：額骨、頂骨、顳骨之間的骨縫。成年後可逐漸骨化（成為骨質接合）。切面可見顱骨的三層：外板、內板（緻密骨）夾著<b>板障</b>（海綿骨）。',
        [pl(SK.L, 'suture'), pl(SK.R, 'suture')], { anchor: at('suture', 0.3, 1.2, 0.6) });
      textSprite('縫合 Suture', at('suture', 0, 3.6), 0.75, '#ffd479', '額、頂、顳骨縫');
      // 釘嵌：牙根插在齒槽中
      const [gx, gy] = POS.gomph;
      reg('不動關節', '牙齒', 'Tooth', '牙根像釘子一樣嵌入顎骨的齒槽。', [lathe([[0.01, 1.8], [0.9, 1.6], [1.15, 1.0], [1.0, 0.2], [0.75, -0.6], [0.45, -2.0], [0.12, -2.6], [0.01, -2.65]].map(p => [p[0], p[1]]).reverse().map(p => [p[0], p[1]]), 0xf8f8f0, 1, [gx, gy + 0.6, 0], [0, 1, 0], 32)], { anchor: [gx + 1.1, gy + 1.9, 0.4] });
      partBy('牙齒').meshes[0].geometry = new THREE.LatheGeometry([[0.01, -2.65], [0.12, -2.6], [0.45, -2.0], [0.75, -0.6], [1.0, 0.2], [1.15, 1.0], [0.9, 1.6], [0.01, 1.8]].map(p => new THREE.Vector2(p[0], p[1])), 32);
      const jaw = (() => { const s = new THREE.Shape(); s.moveTo(-2.6, -3.4); s.lineTo(2.6, -3.4); s.lineTo(2.6, 0.2); s.lineTo(1.0, 0.25); s.lineTo(0.55, -2.1); s.lineTo(-0.55, -2.1); s.lineTo(-1.0, 0.25); s.lineTo(-2.6, 0.2); const g = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: false }); g.translate(gx, gy + 0.6, -1.6); return new THREE.Mesh(g, mat(0xd8c49a)); })();
      reg('不動關節', '齒槽（顎骨，後半）', 'Alveolar socket', '上、下顎骨中容納牙根的凹窩（此處只畫後半以露出牙根）。', jaw, { anchor: [gx - 2, gy - 1, 0.1] });
      reg('不動關節', '牙周韌帶', 'Periodontal ligament', '連接牙根與齒槽骨壁的緻密結締組織，使牙齒牢固嵌合＝<b>釘嵌</b>（gomphosis）。',
        lathe([[0.55, -1.5], [0.85, -0.6], [1.08, 0.35]].map(p => [p[0] + 0.08, p[1]]), 0xff9fb0, 0.55, [gx, gy + 0.6, 0], [0, 1, 0], 32), { anchor: [gx + 0.95, gy, 0.5] });
      textSprite('釘嵌 Gomphosis', at('gomph', 0, 3.6), 0.75, '#ffd479', '牙齒與齒槽');
      // 軟骨接合：第一肋骨—肋軟骨—胸骨柄
      const [cx, cy] = POS.synch;
      reg('不動關節', '胸骨柄', 'Manubrium', '胸骨最上部。', box([cx - 1.9, cy, 0], [1.4, 3.6, 0.8], 0xe6d4ae), { anchor: [cx - 1.9, cy + 1.5, 0.5] });
      reg('不動關節', '第一肋軟骨（透明軟骨）', 'First costal cartilage', '以<b>透明軟骨</b>把第一肋骨直接連到胸骨柄＝<b>軟骨接合</b>（synchondrosis），不能活動。生長中的<b>骺板</b>也屬此類。', ttube([[cx - 1.2, cy + 0.9, 0], [cx - 0.2, cy + 1.0, 0], [cx + 0.6, cy + 0.8, 0]], 0.36, CART), { anchor: [cx - 0.3, cy + 1.6, 0.3] });
      reg('不動關節', '第一肋骨', 'First rib', '', ttube([[cx + 0.6, cy + 0.8, 0], [cx + 2.2, cy + 0.4, -0.3], [cx + 3.2, cy - 1, -0.8], [cx + 3.0, cy - 2.6, -1.2]], 0.34, 0xe6d4ae), { anchor: [cx + 2.8, cy - 1.2, 0] });
      textSprite('軟骨接合 Synchondrosis', at('synch', 0, 3.6), 0.75, '#ffd479', '第一肋骨與胸骨柄、骺板');
      // 骨質接合：兩骨癒合
      const [sx, sy] = POS.synost;
      reg('不動關節', '癒合的骨', 'Fused bones (synostosis)', '原本分開的骨（或骨縫）<b>完全骨化癒合</b>成一塊＝<b>骨質接合</b>（synostosis）。例：成人的許多頭部骨縫、骨骺與骨幹（骺線）。',
        pl(SK.F, 'synost'), { anchor: [sx + 1.6, sy + 1.3, 0.4] });
      const gp = []; for (let i = 0; i <= 96; i++) { const y = -2.2 + i * 4.4 / 96, x = zx(y); gp.push(V(x, y, CZ + Math.sqrt(RS * RS - x * x - y * y) + 0.01)); }
      const ghost = new THREE.Line(new THREE.BufferGeometry().setFromPoints(gp), new THREE.LineDashedMaterial({ color: 0x9a8058, dashSize: 0.15, gapSize: 0.12 }));
      ghost.computeLineDistances(); ghost.position.set(sx, sy, 0); ghost.rotation.x = -0.35; CUR.root.add(ghost);
      textSprite('骨質接合 Synostosis', at('synost', 0, 3.6), 0.75, '#ffd479', '虛線＝原本的骨縫');
      // 韌帶聯合：脛骨—腓骨遠端
      const [dx, dy] = POS.syndes;
      // 真實的脛骨、腓骨遠端（取自骨骼模型，縮放 0.55）
      const SS = 0.55, SC = [0.4, -38.2, -0.2], toW = (x, y, z) => [dx + (x - SC[0]) * SS, dy + (y - SC[1]) * SS, (z - SC[2]) * SS];
      const SG = BONES.once('syndesGeo', () => {
        const xf = g => { const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const w = toW(P.getX(i), P.getY(i), P.getZ(i)); P.setXYZ(i, w[0], w[1], w[2]); } g.computeBoundingSphere(); g.userData.shared = true; return g; };
        return { tib: xf(SDF.mesh((x, y, z) => Math.max(BONES.tibia(x, y, z), y + 33.4), [-1.9, -42.9, -1.4], [1.4, -33.2, 1.4], 0.08)),
                 fib: xf(SDF.mesh((x, y, z) => Math.max(BONES.fibula(x, y, z), y + 33.4), [1.2, -42.8, -1.3], [2.7, -33.2, 0.7], 0.06)) };
      });
      reg('微動關節', '脛骨（遠端）', 'Tibia', '小腿內側的骨；下端內側突出為內踝。', new THREE.Mesh(SG.tib, mat(0xe6d4ae)), { anchor: toW(-0.9, -36, 0.6) });
      reg('微動關節', '腓骨（遠端）', 'Fibula', '小腿外側的細骨；下端為外踝。', new THREE.Mesh(SG.fib, mat(0xd8c49a)), { anchor: toW(2.4, -36, 0.4) });
      const fib = []; for (let i = 0; i < 10; i++) { const y = -35.2 - i * 0.48; fib.push(cyl(toW(0.85, y, -0.25), toW(1.62, y - 0.35, -0.45), 0.05, 0xf4f1ea)); }
      reg('微動關節', '骨間韌帶', 'Interosseous ligament', '連接脛骨與腓骨的緻密結締組織纖維；只允許極小的運動＝<b>韌帶聯合</b>（syndesmosis）。', fib, { anchor: toW(1.25, -37, 0.2) });
      textSprite('韌帶聯合 Syndesmosis', at('syndes', 0, 3.8), 0.75, '#ffd479', '脛腓骨遠端');
      // 聯合：恥骨聯合
      const [px, py] = POS.symph;
      const pub = s => { const m = ttube([[px + s * 0.42, py + 0.8, 0], [px + s * 1.6, py + 1.3, -0.2], [px + s * 3.0, py + 0.6, -0.6], [px + s * 3.2, py - 1.4, -0.6], [px + s * 1.6, py - 1.8, -0.2], [px + s * 0.42, py - 0.6, 0]], 0.42, 0xe6d4ae); return m; };
      reg('微動關節', '恥骨', 'Pubic bones', '左右髖骨的前下部。', [pub(1), pub(-1)], { anchor: [px + 2.6, py + 1.2, 0.3] });
      reg('微動關節', '纖維軟骨盤', 'Fibrocartilaginous disc', '左右恥骨之間的<b>纖維軟骨</b>盤＝<b>聯合</b>（symphysis），允許些微運動（分娩時稍可分開）。椎間盤也屬此類。', box([px, py + 0.1, 0], [0.55, 1.9, 0.9], 0x9fc8f0), { anchor: [px, py + 1.3, 0.5] });
      textSprite('聯合 Symphysis', at('symph', 0, 3.6), 0.75, '#ffd479', '恥骨聯合');
    }
  });
})();
