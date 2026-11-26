/* 場景②：肌節與肌絲滑動學說（Ch12 12.2、Fig 12.6–12.9、Table 12.2；長度-張力關係 12.3） */
(function () {
  const U = 10;                       // 1 µm = 10 單位
  const THICK = 1.6, THIN = 1.0, BARE = 0.25; // µm：粗肌絲長、單側細肌絲長、粗肌絲中央無頭區
  const NEBULIN_FRAC = 0.88, NEBULIN_OFFSET = 0.14;
  const NEBULIN_LEN = THIN * U * NEBULIN_FRAC;
  let S = null;                       // 目前場景狀態

  // 長度-張力曲線（示意：依上述肌絲長度）
  const LT = [[1.27, 0], [1.67, 0.84], [THIN * 2, 1], [THIN * 2 + BARE, 1], [THICK + 2 * THIN, 0]];
  function tension(L) {
    if (L <= LT[0][0] || L >= LT[4][0]) return 0;
    for (let i = 1; i < LT.length; i++) if (L <= LT[i][0]) {
      const [a, ta] = LT[i - 1], [b, tb] = LT[i]; return ta + (tb - ta) * (L - a) / (b - a);
    }
    return 0;
  }

  function setL(L) {
    if (!S) return;
    S.L = L; const Lu = L * U;
    S.zG.forEach((g, k) => g.position.x = (k - 1) * Lu);
    S.tG.forEach((g, k) => g.position.x = (k - 0.5) * Lu);
    // 帶狀標示
    const Iw = Math.max(0.001, Lu - THICK * U), Hw = Math.max(0.001, Lu - 2 * THIN * U);
    S.Ibar[1].position.x = 0; S.Ibar[1].scale.x = Iw;
    S.Ibar[0].position.x = -Lu + Iw / 4; S.Ibar[0].scale.x = Iw / 2;
    S.Ibar[2].position.x = Lu - Iw / 4; S.Ibar[2].scale.x = Iw / 2;
    S.Hbar.forEach((b, k) => { b.position.x = (k - 0.5) * Lu; b.scale.x = Hw; b.visible = Hw > 0.01 && S.pH.visible; });
    S.sprA.forEach((sp, k) => sp.position.x = (k - 0.5) * Lu);
    S.sprI.position.x = 0; S.sprH.forEach((sp, k) => { sp.position.x = (k - 0.5) * Lu; sp.visible = Hw > 0.3; });
    // 肌節括號
    const [b0, b1, b2] = S.brk;
    setCyl(b0, V(-Lu, -2.7, 0), V(0, -2.7, 0), 0.07); setCyl(b1, V(-Lu, -2.7, 0), V(-Lu, -2.2, 0), 0.07); setCyl(b2, V(0, -2.7, 0), V(0, -2.2, 0), 0.07);
    // 肌聯蛋白（titin）：從 Z 盤到粗肌絲端點為彈簧段，粗肌絲內段為直線直達 M 線
    const items = [];
    [[-Lu, -Lu / 2, 1], [0, -Lu / 2, -1], [0, Lu / 2, 1], [Lu, Lu / 2, -1]].forEach(([zx, mx, dir]) => {
      const tip = mx - dir * THICK * U / 2, y = S.titY, z = S.titZ, pts = [];
      const n = 120, span = tip - zx, turns = 9;
      for (let i = 0; i <= n; i++) { const t = i / n, a = t * turns * Math.PI * 2; pts.push(V(zx + span * t, y + 0.12 * Math.cos(a), z + 0.12 * Math.sin(a))); }
      pts.push(V(mx, y, z));
      items.push([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.035, 5), null]);
    });
    S.titM.geometry.dispose(); S.titM.geometry = mergeGeo(items);
    // 錨點
    S.pThin.anchor.set(-Lu / 2 - 1.5, 0.95, 0.8); S.pThick.anchor.set(-Lu / 2 + 3, -0.6, 0.6);
    S.pHead.anchor.set(Lu / 2 + 4, 0.7, 0.4); S.pZ.anchor.set(0, 1.9, 0); S.pM.anchor.set(-Lu / 2, -1.75, 0);
    S.pTit.anchor.set(-Lu + (Lu - THICK * U) / 4, S.titY, S.titZ);
    S.pNeb.anchor.set(S.zG[1].position.x + 0.08 + NEBULIN_LEN / 2, S.nebY, S.nebZ);
    S.pA.anchor.set(-Lu / 2, 2.8, 0); S.pI.anchor.set(0, 2.8, 0); S.pH.anchor.set(Lu / 2, 2.8, 0); S.pS.anchor.set(-Lu / 2, -2.7, 0);
    // 讀數
    if (S.rd) {
      const ov = Math.max(0, Math.min(THICK - BARE, 2 * THIN - (L - THICK)) / 2);
      S.rd.innerHTML = `肌節長度 <b>${L.toFixed(2)}</b> µm<br>A 帶 <b>${THICK.toFixed(2)}</b> µm（不變）<br>I 帶 <b>${Math.max(0, L - THICK).toFixed(2)}</b> µm　H 帶 <b>${Math.max(0, L - 2 * THIN).toFixed(2)}</b> µm<br>相對張力 <b>${Math.round(tension(L) * 100)}%</b>` +
        (L < 2 * THIN ? '<br><span class="warn">細肌絲在中央互相重疊</span>' : '') + (L > THICK + 2 * THIN - 0.01 ? '<br><span class="warn">粗、細肌絲完全不重疊 → 無法形成橫橋</span>' : '');
      drawLT();
    }
  }
  function drawLT() {
    const c = S.cv, g = c.getContext('2d'), W = c.width, H = c.height, x0 = 28, y0 = H - 22, xs = (W - 38) / 2.4, ys = (H - 34);
    const X = L => x0 + (L - 1.2) * xs, Y = t => y0 - t * ys;
    g.clearRect(0, 0, W, H); g.strokeStyle = '#35516d'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x0, 8); g.lineTo(x0, y0); g.lineTo(W - 6, y0); g.stroke();
    g.fillStyle = '#9fb6c8'; g.font = '10px sans-serif';
    [1.27, 1.6, 2, 2.5, 3, 3.5].forEach(L => g.fillText(L.toFixed(L % 1 ? 2 : 1), X(L) - 9, y0 + 12));
    g.fillText('肌節長度 (µm)', W - 80, H - 1); g.save(); g.translate(10, H / 2 + 22); g.rotate(-Math.PI / 2); g.fillText('張力 %', 0, 0); g.restore();
    // 1.27–1.60 µm 保留參考張力曲線，但不延伸 3D 模型；此時固定長度的粗肌絲會越過 Z 盤。
    const curve = (from, to, dash) => {
      g.setLineDash(dash); g.beginPath(); g.moveTo(X(from), Y(tension(from)));
      for (let L = from + 0.01; L < to; L += 0.01) g.lineTo(X(L), Y(tension(L)));
      g.lineTo(X(to), Y(tension(to))); g.stroke();
    };
    g.strokeStyle = '#6bb2ff'; g.lineWidth = 2;
    curve(1.2, 1.27, []); curve(1.27, 1.6, [4, 3]); curve(1.6, 3.6, []);
    g.setLineDash([]);
    g.strokeStyle = '#ffd479'; g.lineWidth = 1; g.setLineDash([3, 3]);
    g.beginPath(); g.moveTo(X(1.6), 8); g.lineTo(X(1.6), y0); g.stroke(); g.setLineDash([]);
    g.strokeStyle = '#6bb2ff'; g.fillStyle = '#9fb6c8'; g.font = '9px sans-serif';
    g.setLineDash([4, 3]); g.beginPath(); g.moveTo(W - 112, 12); g.lineTo(W - 91, 12); g.stroke(); g.setLineDash([]);
    g.fillText('虛線＝未做 3D 模擬', W - 87, 15);
    g.fillStyle = '#ffd479'; g.beginPath(); g.arc(X(S.L), Y(tension(S.L)), 4.5, 0, 7); g.fill();
  }

  SCENES.push({
    name: '② 肌節滑動',
    title: '肌節與肌絲滑動學說（sliding filament theory）',
    camera: { pos: [0, 9, 62], target: [0, 0, 0] },
    controls: [
      { label: '🔍 全部', fn() { flyTo([0, 9, 62], [0, 0, 0]); } },
      { label: '🔍 橫切面（六角排列）', fn() { flyTo([-S.L * U / 2 + 6, 1, 10], [-S.L * U / 2 + 6, 0, 0]); } },
      { label: '🔍 Z 盤附近', fn() { flyTo([2, 5, 16], [0, 0, 0]); } }
    ],
    desc: `
  <p><b>肌節</b>（sarcomere）＝兩條 Z 盤之間的重複單位。</p>
  <table>
  <tr><td><b>A 帶</b></td><td>粗肌絲（肌凝蛋白）全長</td></tr>
  <tr><td><b>I 帶</b></td><td>只有細肌絲（肌動蛋白），中央有 Z 盤</td></tr>
  <tr><td><b>H 帶</b></td><td>A 帶中央只有粗肌絲的部分</td></tr>
  <tr><td><b>M 線</b></td><td>A 帶中央連結粗肌絲的蛋白</td></tr>
  <tr><td><b>肌聯蛋白</b><br>titin</td><td>巨大彈性蛋白，自 M 線穿過粗肌絲到 Z 盤；穩定粗肌絲位置，並提供肌肉被拉長後的<b>彈性回縮</b></td></tr>
  <tr><td><b>伴肌動蛋白</b><br>nebulin</td><td>沿細肌絲大部分長度排列，協助穩定並調節細肌絲長度</td></tr>
  </table>
  <p><b>Nebulin</b>：骨骼肌中的大型肌節蛋白，C 端錨定於 Z 盤，沿肌動蛋白細肌絲排列。收縮時它隨細肌絲滑向 M 線，本身不縮短、也不產生拉力；它參與細肌絲的穩定與長度調節。細肌絲末端也受其他蛋白調控，因此此處不把 nebulin 畫成唯一的「分子尺」。</p>
  <p><b>收縮時</b>（Table 12.2）：肌絲本身<b>長度不變</b>，而是細肌絲在粗肌絲之間<b>滑向肌節中央</b>：</p>
  <ul><li>Z 盤靠近 → 肌節變短</li><li><b>A 帶長度不變</b>，相鄰 A 帶彼此靠近</li><li><b>I 帶變短</b></li><li><b>H 帶變短</b>（甚至消失）</li></ul>
  <p><b>長度-張力關係</b>（Fig 12.21）：肌節長 <b>2.0–2.25 µm</b>（＝肌肉正常的靜止長度）時重疊最適當、可形成最多橫橋，張力最大；拉得太長重疊少、張力下降，完全不重疊就無法產生張力；太短時細肌絲互相重疊、粗肌絲頂到 Z 盤，張力也下降。</p>
  <p class="hint">右側滑桿可改變肌節長度；肌絲長度（粗 1.6 µm、細 1.0 µm）為示意值，使張力高原落在課本的 2.0–2.25 µm。橫向間距已放大以便觀察。</p>
  <p class="hint"><b>為何虛線段不做 3D：</b>依 Fox《Human Physiology》16e 第 12 章第 12.3 節，肌節短於 2.0 µm 時，肌纖維越短越粗，肌漿液體壓力等反向力增加、粗細肌絲間距變大，細肌絲彼此的雙重重疊也會降低橫橋作用效率。到約 1.7 µm，粗肌絲抵達 Z 盤，肌凝蛋白可能進一步變形；約 1.25 µm 時張力降至零（第 376 頁，圖 12.21）。</p>
  <p class="hint">本 3D 場景只做剛性肌絲的相對滑動，沒有計算肌纖維變粗、肌絲間距與反向力、細肌絲雙重重疊造成的橫橋效率變化，也沒有粗肌絲抵住 Z 盤後的形變。因此低於 1.6 µm 若繼續播放，只會讓剛性幾何互相穿越，不能呈現課本所述的力學變化。<b>1.6 µm 是這個 3D 模型的幾何下限</b>；虛線 1.27–1.60 µm 留在長度－張力圖作課本概念參考，不表示生理上不能再短。（Fox, <i>Human Physiology</i>, 16e, Ch. 12, §12.3, pp. 375–376, Fig. 12.21。）</p>`,
    build() {
      S = { L: 2.2 }; const Lu = S.L * U;
      const s = 1.25, thickP = [], thinP = [];
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
        const y = (i + j / 2) * s, z = j * s * Math.sqrt(3) / 2;
        if (Math.hypot(y, z) <= s * 1.05) thickP.push([y, z]);
        [1 / 3, 2 / 3].forEach(f => {
          const yy = y + f * 1.5 * s, zz = z + f * s * Math.sqrt(3) / 2;
          if (Math.hypot(yy, zz) <= s * 1.2 && !thinP.some(p => Math.hypot(p[0] - yy, p[1] - zz) < 0.01)) thinP.push([yy, zz]);
        });
      }
      S.titY = thickP[1][0]; S.titZ = thickP[1][1];

      // Z 盤群組（細肌絲與 nebulin 隨 Z 盤移動）
      S.zG = [0, 1, 2].map(() => { const g = new THREE.Group(); CUR.root.add(g); return g; });
      const thinMs = [], zMs = [], nebMs = [], nebByGroup = [];
      S.zG.forEach((g, k) => {
        const it = [], nb = [];
        [-1, 1].forEach(dir => {
          if ((k === 0 && dir < 0) || (k === 2 && dir > 0)) return;
          thinP.forEach(([y, z]) => {
            const dz = dir > 0 ? 0 : 0.13; // 兩側細肌絲稍微錯開，重疊時看得清楚
            // 細肌絲＝兩股 G-actin 珠串扭成螺旋
            for (let q = 0; q < THIN * U / 0.11; q++) for (let st = 0; st < 2; st++) {
              const xx = dir * (q * 0.11 + st * 0.055 + 0.05), ang = q * 0.11 / 0.8 * Math.PI * 2 + st * Math.PI + y * 3;
              it.push(M4().compose(V(xx, y + Math.cos(ang) * 0.055, z + dz + Math.sin(ang) * 0.055), new THREE.Quaternion(), V(0.072, 0.072, 0.072)));
            }
            // Nebulin 沿 actin 細肌絲排列；以表面偏移的綠色細線呈現，並保留末端一小段 actin。
            const x0 = dir * 0.08, x1 = dir * NEBULIN_LEN;
            nb.push(cylM([x0, y, z + dz + NEBULIN_OFFSET], [x1, y, z + dz + NEBULIN_OFFSET], 0.045, mat(0x62e58a), 8));
          });
        });
        const m = inst(new THREE.SphereGeometry(1, 8, 6), it, 0x4fb3e8); thinMs.push(m);
        zMs.push(cylM([-0.12, 0, 0], [0.12, 0, 0], 1.95, mat(0xa070ff, 0.85), 32));
        nebMs.push(...nb); nebByGroup.push(nb);
      });
      S.nebY = thinP[0][0]; S.nebZ = thinP[0][1] + NEBULIN_OFFSET;
      S.pThin = reg('肌絲', '細肌絲（肌動蛋白）', 'Thin filament (actin)', '一端固定在 Z 盤、伸向肌節中央；由肌動蛋白、肌旋蛋白、肌鈣蛋白組成（見③）。收縮時被橫橋拉向中央，<b>本身長度不變</b>。', thinMs, { anchor: [0, 0, 0] });
      S.pNeb = reg('肌絲', '伴肌動蛋白（nebulin）', 'Nebulin', '大型肌節蛋白，沿細肌絲大部分長度排列並錨定於 Z 盤；參與細肌絲穩定與長度調節。綠色線為示意，隨 actin 細肌絲滑動，但長度不變。', nebMs, { anchor: [NEBULIN_LEN / 2, S.nebY, S.nebZ] });
      S.pZ = reg('肌絲', 'Z 盤', 'Z disc', 'I 帶中央、細肌絲的錨定處；縱切面看是 Z 線，橫切面看是盤狀。兩個 Z 盤之間即一個肌節。', zMs, { anchor: [0, 0, 0] });
      thinMs.forEach((m, k) => S.zG[k].add(m)); zMs.forEach((m, k) => S.zG[k].add(m));
      nebByGroup.forEach((ms, k) => ms.forEach(m => S.zG[k].add(m)));

      // 粗肌絲群組
      S.tG = [0, 1].map(() => { const g = new THREE.Group(); CUR.root.add(g); return g; });
      const bbMs = [], hdMs = [], mMs = [];
      S.tG.forEach((g, k) => {
        const bb = [], hd = [], hg = new THREE.SphereGeometry(1, 8, 6);
        thickP.forEach(([y, z], ti) => {
          bb.push([new THREE.CylinderGeometry(0.2, 0.2, THICK * U, 10), mtx([0, y, z], [1, 0, 0])]);
          let n = 0;
          for (let x = -THICK * U / 2 + 0.25; x <= THICK * U / 2 - 0.2; x += 0.42, n++) {
            if (Math.abs(x) < BARE * U / 2) continue;
            const a = n * Math.PI / 3 + ti * 0.4, ry = Math.cos(a), rz = Math.sin(a), sx = Math.sign(x);
            hd.push([hg, M4().compose(V(x - sx * 0.08, y + ry * 0.36, z + rz * 0.36), new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), V(-sx * 0.5, ry, rz).normalize()), V(0.17, 0.09, 0.09))]);
          }
        });
        bbMs.push(new THREE.Mesh(mergeGeo(bb), mat(0xe0603a)));
        hdMs.push(new THREE.Mesh(mergeGeo(hd), mat(0xff9a66)));
        mMs.push(cylM([-0.08, 0, 0], [0.08, 0, 0], 1.75, mat(0xff60a0, 0.7), 32));
      });
      S.pThick = reg('肌絲', '粗肌絲（肌凝蛋白）', 'Thick filament (myosin)', '構成 A 帶；由許多肌凝蛋白分子的尾部束成。兩半的肌凝蛋白方向相反，所以兩側的橫橋都把細肌絲<b>往中央拉</b>。', bbMs, { anchor: [0, 0, 0] });
      S.pHead = reg('肌絲', '肌凝蛋白頭部（橫橋）', 'Myosin heads (cross bridges)', '自粗肌絲伸出、可與肌動蛋白結合的球狀頭部；每個頭部有 ATP 結合位（ATPase）。中央一小段（無頭區）沒有頭部。', hdMs, { anchor: [0, 0, 0] });
      S.pM = reg('肌絲', 'M 線', 'M line', '位於粗肌絲（A 帶）正中央，把粗肌絲互相連結固定。', mMs, { anchor: [0, 0, 0] });
      bbMs.forEach((m, k) => S.tG[k].add(m)); hdMs.forEach((m, k) => S.tG[k].add(m)); mMs.forEach((m, k) => S.tG[k].add(m));

      S.titM = new THREE.Mesh(new THREE.BufferGeometry(), mat(0x7be07b));
      S.pTit = reg('肌絲', '肌聯蛋白（titin）', 'Titin', '體積極大的<b>彈性蛋白</b>，從 M 線穿過粗肌絲延伸到 Z 盤（I 帶中的部分像彈簧）。穩定粗肌絲位置，肌肉被拉長後幫助<b>彈性回縮</b>。（此處只畫一條代表）', S.titM, { anchor: [0, 0, 0] });

      // 帶狀標示（上方）與肌節括號（下方）
      const bar = (col, w) => { const m = box([0, 2.8, 0], [1, 0.32, 0.12], col, 0.75); return m; };
      const Ab = [bar(0xd08030), bar(0xd08030)], Ib = [bar(0x80c8ff), bar(0x80c8ff), bar(0x80c8ff)], Hb = [bar(0xffe070), bar(0xffe070)];
      Ab.forEach((b, k) => { b.scale.x = THICK * U; b.position.y = 3.25; S.tG[k].add(b); });
      Hb.forEach(b => b.position.y = 2.85);
      S.pA = reg('明暗帶', 'A 帶（暗帶）', 'A band', '= 粗肌絲的長度。收縮時<b>長度不變</b>，只是相鄰的 A 帶互相靠近。', Ab, { anchor: [0, 0, 0] });
      Ab.forEach((b, k) => S.tG[k].add(b));
      S.pI = reg('明暗帶', 'I 帶（明帶）', 'I band', '相鄰兩疊粗肌絲之間、只有細肌絲的區域。收縮時<b>變短</b>。', Ib, { anchor: [0, 0, 0] });
      S.pH = reg('明暗帶', 'H 帶', 'H band', 'A 帶中央、細肌絲尚未伸入的區域。收縮時<b>變短</b>，肌節夠短時消失。', Hb, { anchor: [0, 0, 0] });
      S.Ibar = Ib; S.Hbar = Hb;
      S.brk = [0, 1, 2].map(() => new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8), mat(0xffd479)));
      S.pS = reg('明暗帶', '肌節', 'Sarcomere', 'Z 盤到 Z 盤；骨骼肌收縮的基本單位。肌肉在正常靜止長度時，肌節約 2.0–2.25 µm。', S.brk, { anchor: [0, 0, 0] });
      S.sprA = [0, 1].map(() => textSprite('A', [0, 4.45, 0], 0.85, '#ffb060'));
      S.sprI = textSprite('I', [0, 3.5, 0], 0.8, '#a0d8ff');
      S.sprH = [0, 1].map(() => textSprite('H', [0, 3.5, 0], 0.75, '#ffe070'));
      // 讓 A 標籤跟著粗肌絲群組
      S.sprA.forEach((sp, k) => { sp.position.x = 0; });
      setL(S.L);

      let play = false, ph = 0;
      const dt = dtClock();
      S.togglePlay = () => { play = !play; return play; };
      CUR.tick = () => {
        const d = dt();
        if (play) { ph += d * 0.9; const L = 2.2 + 0.4 * Math.cos(ph); S.sl.value = L.toFixed(2); S.sl.dispatchEvent(new Event('input')); }
      };
    },
    panel(box) {
      S.sl = slider(box, '肌節長度 (µm)', 1.6, 3.6, S.L, 0.02, v => setL(v));
      note(box, '滑桿下限 1.60 µm 是本模型的幾何限制；短肌節的張力變化與原因見左側第 12 章說明。');
      checkbox(box, '顯示 Nebulin', true, v => { S.pNeb.visible = v; rebuildList(); refresh(); });
      S.rd = note(box, '', 'rd');
      const cv = document.createElement('canvas'); cv.width = 290; cv.height = 130; box.appendChild(cv); S.cv = cv;
      note(box, '長度-張力關係（Length-tension relationship）');
      btnRow(box, [
        ['▶ 收縮／舒張', function () { this.textContent = S.togglePlay() ? '⏸ 停止' : '▶ 收縮／舒張'; }],
        ['靜止 2.2', () => { S.sl.value = 2.2; S.sl.dispatchEvent(new Event('input')); }],
        ['收縮 1.8', () => { S.sl.value = 1.8; S.sl.dispatchEvent(new Event('input')); }]
      ]);
      setL(S.L);
    }
  });
})();
