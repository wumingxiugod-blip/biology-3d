/* 場景①：骨骼肌的層級構造（Ch12 12.1、Fig 12.1、12.5、12.6） */
(function () {
  // 六角最密排列：回傳半徑 R 以內的 [y,z]
  function hexPts(s, R) {
    const out = [];
    for (let i = -12; i <= 12; i++) for (let j = -12; j <= 12; j++) {
      const y = (i + j / 2) * s, z = j * s * Math.sqrt(3) / 2;
      if (Math.hypot(y, z) <= R) out.push([y, z]);
    }
    return out;
  }
  const RED = 0xb8433f, CT = 0xf2efe6;

  SCENES.push({
    name: '① 層級構造',
    title: '骨骼肌的層級構造：肌肉 → 肌束 → 肌纖維 → 肌原纖維',
    camera: { pos: [8, 16, 78], target: [10, 0, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([8, 16, 78], [10, 0, 0]); } },
      { label: '🔍 整塊肌肉', fn() { flyTo([-24, 8, 26], [-22, 0, 0]); } },
      { label: '🔍 肌束', fn() { flyTo([6, 6, 20], [6, 0, 0]); } },
      { label: '🔍 肌纖維', fn() { flyTo([27, 6, 18], [27, 0, 0]); } },
      { label: '🔍 肌原纖維', fn() { flyTo([50, 5, 14], [50, 0, 0]); } }
    ],
    desc: `
  <p>骨骼肌兩端以<b>肌腱</b>附著於骨（肌腱纖維與<b>骨外膜</b>相連）。由外而內，結締組織一層層包裹：</p>
  <table>
  <tr><td><b>肌外膜</b><br>epimysium</td><td>由肌腱的緻密結締組織延伸，包住整塊肌肉</td></tr>
  <tr><td><b>肌束膜</b><br>perimysium</td><td>伸入肌肉內，把肌纖維分成一束束<b>肌束</b>（fascicle）</td></tr>
  <tr><td><b>肌內膜</b><br>endomysium</td><td>包住每一條肌纖維的薄層結締組織</td></tr>
  </table>
  <p><b>肌纖維</b>＝肌細胞：由許多胚胎<b>肌母細胞</b>（myoblast）融合而成，因此<b>多核</b>，細胞核位於周邊、緊貼<b>肌膜</b>（sarcolemma）下方；細胞質稱<b>肌質</b>（sarcoplasm）。</p>
  <p>每條肌纖維內塞滿直徑約 <b>1 µm</b> 的<b>肌原纖維</b>（myofibril），貫穿全長；肌原纖維由<b>粗肌絲</b>（肌凝蛋白）與<b>細肌絲</b>（肌動蛋白）組成。各肌原纖維的明暗帶<b>對齊排列</b>，所以整條纖維看起來有<b>橫紋</b>：暗帶 A、明帶 I。</p>
  <p class="hint">由左至右放大四個層級；虛線表示放大的來源。</p>`,
    build() {
      // ── 層級 0：整塊肌肉（x −44 → −14）
      reg('整塊肌肉', '骨（含骨外膜）', 'Bone with periosteum', '肌腱的膠原纖維與包覆骨的<b>骨外膜</b>（periosteum）相連，把肌肉收縮的拉力傳到骨骼。',
        [cyl([-44, -9, 0], [-44, 9, 0], 2.2, 0xe6d8b8), cyl([-44, -9.2, 0], [-44, 9.2, 0], 2.32, 0xd9b48a, 0.35)], { anchor: [-44, 6, 2] });
      reg('整塊肌肉', '肌腱', 'Tendon', '由<b>緻密規則結締組織</b>（膠原纖維）構成，把肌肉連到骨。肌腱的結締組織往肌肉方向延伸，形成肌外膜。',
        ttube([[-42, 0, 0], [-38, 0, 0], [-34, 0, 0], [-31, 0, 0]], t => 0.7 + 0.9 * t * t, 0xf4f1ea), { anchor: [-37, 0.8, 0.5] });

      const X0 = -31, LEN = 17, rOf = h => 1.6 + 2.9 * Math.sin(Math.PI * h / 26);
      const prof = []; for (let h = 0; h <= LEN; h += 0.5) prof.push([rOf(h), h]);
      reg('整塊肌肉', '肌外膜', 'Epimysium', '包住整塊肌肉的結締組織鞘，由肌腱延伸而來。',
        lathe(prof, CT, 0.28, [X0, 0, 0], [1, 0, 0], 48), { anchor: [-22, 4.6, 0] });
      const fasc = lathe(prof.map(p => [p[0] + 0.25, p[1]]), 0x9ab0c0, 0.16, [X0, 0, 0], [1, 0, 0], 48);
      fasc.geometry = new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0] + 0.25, p[1])), 40, Math.PI, Math.PI);
      reg('整塊肌肉', '筋膜', 'Fascia', '包在肌外膜之外的結締組織層，把肌肉與周圍構造隔開（此處只畫後半圈）。', fasc, { anchor: [-26, 0, -4] });

      const fr = 0.72, F = hexPts(1.6, 3.4), fM = [], pM = [], rr = rnd(7);
      F.forEach(([y, z]) => {
        const d = Math.hypot(y, z) + fr;
        let h0 = 0; while (h0 < LEN && rOf(h0) < d) h0 += 0.25;
        const x1 = X0 + LEN + 0.4 + rr() * 2.6;
        fM.push([new THREE.CylinderGeometry(fr, fr, x1 - (X0 + h0), 20), mtx([(X0 + h0 + x1) / 2, y, z], [1, 0, 0])]);
        pM.push([new THREE.CylinderGeometry(fr + 0.07, fr + 0.07, x1 - (X0 + h0) - 0.15, 20, 1, true), mtx([(X0 + h0 + x1) / 2 - 0.08, y, z], [1, 0, 0])]);
      });
      reg('整塊肌肉', '肌束', 'Muscle fascicle', '一束肌纖維；由<b>肌束膜</b>包覆。肉眼可見的肌肉「紋理」就是肌束。',
        new THREE.Mesh(mergeGeo(fM), mat(RED)), { anchor: [-12.5, 1.6, 2.4] });
      reg('整塊肌肉', '肌束膜', 'Perimysium', '肌外膜伸入肌肉內部的結締組織，把肌肉分隔成肌束。',
        new THREE.Mesh(mergeGeo(pM), mat(CT, 0.4)), { anchor: [-15, -2.4, 2.6] });
      textSprite('① 整塊肌肉', [-30, 9, 0], 1.6, '#ffd479', 'Skeletal muscle');

      // ── 層級 1：肌束（x 0 → 13）
      const S1 = 0.62, P1 = hexPts(1.38, 2.6), fib = [], endo = [], X1 = 0, L1 = 12;
      P1.forEach(([y, z]) => {
        const x1 = X1 + L1 + 0.3 + rr() * 1.8, l = x1 - X1;
        fib.push([new THREE.CylinderGeometry(S1, S1, l, 18), mtx([X1 + l / 2, y, z], [1, 0, 0])]);
        endo.push([new THREE.CylinderGeometry(S1 + 0.05, S1 + 0.05, l - 0.12, 18, 1, true), mtx([X1 + l / 2 - 0.06, y, z], [1, 0, 0])]);
      });
      const fibM = new THREE.Mesh(mergeGeo(fib), mat(0xc4554e));
      reg('肌束', '肌纖維（肌細胞）', 'Muscle fiber', '肌束由許多肌纖維組成；每一條肌纖維就是一個<b>多核</b>的肌細胞，可長達數公分。', fibM, { anchor: [13.6, 0.6, 1.2] });
      reg('肌束', '肌內膜', 'Endomysium', '包住每一條肌纖維的薄層結締組織。', new THREE.Mesh(mergeGeo(endo), mat(CT, 0.32)), { anchor: [9, -1.4, 2.0] });
      reg('肌束', '肌束膜（放大）', 'Perimysium', '包住整個肌束的結締組織鞘。', cylM([X1 - 0.2, 0, 0], [X1 + L1 - 0.5, 0, 0], 3.25, mat(CT, 0.22), 40, true), { anchor: [5, 3.2, 0.6] });
      reg('肌束', '微血管', 'Capillaries', '走在肌內膜中、肌纖維之間，供應氧氣與養分。',
        [[0.7, 0.62], [-0.7, -0.6], [0.0, -1.8]].map(([y, z]) => ttube([[X1, y, z], [X1 + 4, y + 0.15, z], [X1 + 8, y - 0.1, z], [X1 + 11.6, y, z]], 0.12, 0xd02030)), { anchor: [3, 0.7, 0.6] });
      textSprite('② 肌束', [6, 5.5, 0], 1.3, '#ffd479', 'Fascicle');
      dash([-12.7, 1.6 + fr, 1.6], [X1, 3.25, 0]); dash([-12.7, 1.6 - fr, 1.6], [X1, -3.25, 0]);

      // ── 層級 2：一條肌纖維（x 20 → 34）
      const X2 = 20, L2 = 14, R2 = 3;
      const sl = cylM([X2, 0, 0], [X2 + L2, 0, 0], R2, mat(0xe8a0a0, 0.38), 48, true);
      sl.geometry = new THREE.CylinderGeometry(R2, R2, L2, 48, 1, true, 0.4 * Math.PI, 1.35 * Math.PI);
      sl.quaternion.setFromUnitVectors(V(0, 1, 0), V(1, 0, 0));
      reg('肌纖維', '肌膜', 'Sarcolemma', '肌纖維的細胞膜。可傳導動作電位，並向內凹陷形成<b>橫小管</b>（見⑤）。正下方有 dystrophin 蛋白支撐（杜顯氏肌肉萎縮症即此基因突變）。', sl, { anchor: [27, -2.4, -1.8] });
      const mf = [], mfP = hexPts(0.95, 2.45);
      mfP.forEach(([y, z]) => {
        const len = L2 + 0.3 + rr() * 1.6, t = stripeTex(len / 0.6, { I: "#e7b2aa" });
        mf.push(cylM([X2, y, z], [X2 + len, y, z], 0.42, tmat(t), 14));
      });
      reg('肌纖維', '肌原纖維', 'Myofibrils', '直徑約 1 µm、貫穿肌纖維全長的收縮單位。相鄰肌原纖維的 A 帶與 I 帶<b>對齊</b>，形成整條纖維的橫紋。', mf, { anchor: [X2 + L2 + 1.2, 0.5, 0.5] });
      const nu = [];
      for (let k = 0; k < 9; k++) {
        const a = 0.45 * Math.PI + (k % 5) * 0.25 * Math.PI, x = X2 + 1 + k * 1.45;
        const e = ell([x, -Math.sin(a) * 2.75, Math.cos(a) * 2.75], [0.75, 0.26, 0.26], 0x5060c8);
        nu.push(e);
      }
      reg('肌纖維', '細胞核（多核、周邊）', 'Nuclei', '肌纖維由許多肌母細胞融合而成，所以是<b>多核</b>細胞；細胞核被肌原纖維擠到周邊，位於肌膜正下方。', nu, { anchor: [X2 + 4, -2.6, 0.4] });
      const mi = [];
      mfP.slice(0, 14).forEach(([y, z], k) => { if (k % 2) mi.push(ell([X2 + 3 + (k % 5) * 2.2, y + 0.47, z + 0.27], [0.5, 0.14, 0.14], 0xf0a030)); });
      reg('肌纖維', '粒線體', 'Mitochondria', '位於肌原纖維之間，以有氧呼吸供應收縮所需 ATP。', mi, { anchor: [X2 + 5, 1.6, 1.2] });
      reg('肌纖維', '肌質', 'Sarcoplasm', '肌纖維的細胞質；含肝醣顆粒、肌紅素等，肌原纖維與胞器懸浮其中。',
        cylM([X2 + 0.05, 0, 0], [X2 + L2 - 0.05, 0, 0], 2.9, mat(0xf3c8c0, 0.12), 40), { anchor: [X2 + 2, 2.2, -1] });
      textSprite('③ 肌纖維（肌細胞）', [27, 5.2, 0], 1.2, '#ffd479', 'Muscle fiber');
      dash([13.8, 0.6 + S1, 1.2], [X2, R2, 0]); dash([13.8, 0.6 - S1, 1.2], [X2, -R2, 0]);

      // ── 層級 3：一條肌原纖維與肌絲（x 42 → 60）
      const X3 = 42, SL = 4.4, NS = 3, R3 = 1.4, L3 = SL * NS;
      reg('肌原纖維', '肌原纖維（放大）', 'Myofibril', '由一個接一個的<b>肌節</b>串成。末端可看到其中的肌絲。',
        cylM([X3, 0, 0], [X3 + L3, 0, 0], R3, tmat(stripeTex(NS)), 36), { anchor: [X3 + 1, -1.3, 0.6] });
      const band = (zh, en, info, x0, x1, col) => reg('肌原纖維', zh, en, info,
        cylM([x0, 0, 0], [x1, 0, 0], R3 + 0.06, mat(col, 0.12), 36, true), { anchor: [(x0 + x1) / 2, R3 + 0.05, 0.3] });
      const z0 = X3 + SL;
      band('A 帶（暗帶）', 'A band', '含<b>粗肌絲</b>（主要是肌凝蛋白）的整個長度，兩端與細肌絲重疊，所以顏色深。收縮時<b>長度不變</b>。', z0 + 0.18 * SL, z0 + 0.82 * SL, 0xffa040);
      band('I 帶（明帶）', 'I band', '只有<b>細肌絲</b>（主要是肌動蛋白）的區域，從一疊粗肌絲邊緣到下一疊的邊緣，中央是 Z 線。收縮時<b>變短</b>。', z0 - 0.18 * SL, z0 + 0.18 * SL, 0x70c0ff);
      band('H 帶', 'H band', 'A 帶中央較淡的區域：只有粗肌絲、沒有與細肌絲重疊。收縮時<b>變短</b>。', z0 + 0.42 * SL, z0 + 0.58 * SL, 0xffe070);
      band('Z 線（Z 盤）', 'Z line / Z disc', '位於 I 帶中央；細肌絲固定於此。從橫切面看其實是一個盤狀構造（Z 盤）。', z0 - 0.03, z0 + 0.03, 0xb080ff);
      band('M 線', 'M line', 'A 帶正中央的蛋白質細絲，把粗肌絲連在一起、固定其位置。', z0 + 0.49 * SL, z0 + 0.51 * SL, 0xff60a0);
      // 肌節括號
      const bx0 = z0, bx1 = z0 + SL, by = -R3 - 0.7;
      reg('肌原纖維', '肌節', 'Sarcomere', '兩條 Z 線之間的重複單位，是骨骼肌<b>收縮的基本單位</b>。收縮時 Z 線彼此靠近。',
        [cyl([bx0, by, 0], [bx1, by, 0], 0.07, 0xffd479), cyl([bx0, by, 0], [bx0, by + 0.45, 0], 0.07, 0xffd479), cyl([bx1, by, 0], [bx1, by + 0.45, 0], 0.07, 0xffd479)],
        { anchor: [(bx0 + bx1) / 2, by, 0] });
      // 末端露出的肌絲（六角排列：粗肌絲在格點、細肌絲在三角形中心）
      const s = 0.55, thick = [], thin = [];
      for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
        const y = (i + j / 2) * s, z = j * s * Math.sqrt(3) / 2;
        if (Math.hypot(y, z) < R3 - 0.25) thick.push([y, z]);
        [[1 / 3, 1 / 3], [2 / 3, 2 / 3]].forEach(([a, b]) => {
          const yy = y + (a + b / 2) * s, zz = z + b * s * Math.sqrt(3) / 2;
          if (Math.hypot(yy, zz) < R3 - 0.15) thin.push([yy, zz]);
        });
      }
      const xe = X3 + L3;
      reg('肌原纖維', '粗肌絲（肌凝蛋白）', 'Thick filament (myosin)', '位於 A 帶；主要由肌凝蛋白構成，表面伸出肌凝蛋白頭部（橫橋）。',
        new THREE.Mesh(mergeGeo(thick.map(([y, z], k) => [new THREE.CylinderGeometry(0.11, 0.11, 2.4 + (k % 3) * 0.6, 8), mtx([xe + 1.2 + (k % 3) * 0.3, y, z], [1, 0, 0])])), mat(0xe0603a)), { anchor: [xe + 3, 0.9, 0.3] });
      reg('肌原纖維', '細肌絲（肌動蛋白）', 'Thin filament (actin)', '從 Z 盤伸向肌節中央；主要由肌動蛋白構成。橫切面上每條粗肌絲被 6 條細肌絲圍繞。',
        new THREE.Mesh(mergeGeo(thin.map(([y, z], k) => [new THREE.CylinderGeometry(0.05, 0.05, 3.2 + (k % 4) * 0.4, 6), mtx([xe + 1.6 + (k % 4) * 0.2, y, z], [1, 0, 0])])), mat(0x4fb3e8)), { anchor: [xe + 3.4, -1.1, 0.4] });
      textSprite('④ 肌原纖維', [50, 4.4, 0], 1.1, '#ffd479', 'Myofibril');
      dash([X2 + L2 + 1, 0.5 + 0.42, 0.5], [X3, R3, 0]); dash([X2 + L2 + 1, 0.5 - 0.42, 0.5], [X3, -R3, 0]);
    }
  });
})();
