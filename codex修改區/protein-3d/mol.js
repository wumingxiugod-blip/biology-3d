/* 分子模型工具：主鏈生成（NeRF，依 φ/ψ/ω）、原子、鍵、氫鍵、卡通結構。單位：Å */
const EL = { // CPK 配色與球半徑
  C: [0x9a9a9a, 0.36], N: [0x3c64ff, 0.34], O: [0xff3030, 0.34], H: [0xf2f2f2, 0.2],
  S: [0xffd000, 0.45], Fe: [0xe07a30, 0.55], R: [0xb070e0, 0.5]
};
const DEG = Math.PI / 180;
const _cylG = new THREE.CylinderGeometry(1, 1, 1, 12); _cylG.userData.shared = true;

// 由 A,B,C 與鍵長 l、鍵角 ang(BCD)、扭轉角 tor(ABCD) 放置 D
function nerf(A, B, C, l, ang, tor) {
  const bc = C.clone().sub(B).normalize();
  const n = B.clone().sub(A).cross(bc).normalize();
  const m = n.clone().cross(bc);
  const x = -l * Math.cos(ang), y = l * Math.sin(ang) * Math.cos(tor), z = l * Math.sin(ang) * Math.sin(tor);
  return C.clone().addScaledVector(bc, x).addScaledVector(m, y).addScaledVector(n, z);
}
function dihedral(a, b, c, d) {
  const b0 = a.clone().sub(b), b1 = c.clone().sub(b).normalize(), b2 = d.clone().sub(c);
  const v = b0.clone().addScaledVector(b1, -b0.dot(b1)), w = b2.clone().addScaledVector(b1, -b2.dot(b1));
  const x = v.dot(w), y = b1.clone().cross(v).dot(w);
  return Math.atan2(y, x);
}

/**
 * 依各殘基 [φ, ψ, ω(可省，預設180)]（度）生成主鏈原子 N, CA, C, O, H, CB
 * pro: 殘基索引集合 → 該殘基為 Pro（N 上無 H）
 */
function backbone(angles, pro = new Set()) {
  const L = { NCA: 1.458, CAC: 1.525, CN: 1.329, CO: 1.231, NH: 1.01 };
  const A = { NCAC: 111.2 * DEG, CACN: 116.2 * DEG, CNCA: 121.7 * DEG };
  const res = [];
  let N = V(0, 0, 0), CA = V(L.NCA, 0, 0);
  let C = nerf(V(0, -1, 0), N, CA, L.CAC, A.NCAC, 0); // 起始任意
  for (let i = 0; i < angles.length; i++) {
    const [phi, psi, om = 180] = angles[i];
    if (i > 0) {
      const p = res[i - 1];
      N = nerf(p.N, p.CA, p.C, L.CN, A.CACN, p.psi * DEG);
      CA = nerf(p.CA, p.C, N, L.NCA, A.CNCA, p.om * DEG);
      C = nerf(p.C, N, CA, L.CAC, A.NCAC, phi * DEG);
    }
    res.push({ N, CA, C, phi, psi, om, pro: pro.has(i) });
  }
  // 最後一個殘基之後再放一個 N，用於定出羰基 O 的方向
  const last = res[res.length - 1];
  const Nx = nerf(last.N, last.CA, last.C, L.CN, A.CACN, last.psi * DEG);
  res.forEach((r, i) => {
    const Nn = i + 1 < res.length ? res[i + 1].N : Nx;
    // O：在 CA-C-N 平面內，與兩鍵的角平分線反向
    const u = r.CA.clone().sub(r.C).normalize().add(Nn.clone().sub(r.C).normalize()).normalize();
    r.O = r.C.clone().addScaledVector(u, -L.CO);
    if (i > 0 && !r.pro) {
      const Cp = res[i - 1].C;
      const w = Cp.clone().sub(r.N).normalize().add(r.CA.clone().sub(r.N).normalize()).normalize();
      r.H = r.N.clone().addScaledVector(w, -L.NH);
    }
    // CB（L 型理想幾何）
    const b = r.CA.clone().sub(r.N), c = r.C.clone().sub(r.CA), a = b.clone().cross(c);
    r.CB = r.CA.clone().addScaledVector(a, -0.58273431).addScaledVector(b, 0.56802827).addScaledVector(c, -0.54067466);
    r.Rdir = r.CB.clone().sub(r.CA).normalize();
  });
  return res;
}
// 對原子座標套用 Matrix4（就地）
function xformRes(res, m4) {
  res.forEach(r => ['N', 'CA', 'C', 'O', 'H', 'CB'].forEach(k => r[k] && r[k].applyMatrix4(m4)));
  res.forEach(r => r.Rdir = r.CB.clone().sub(r.CA).normalize());
  return res;
}
// 主鏈的平均軸（首尾 CA 方向）與中心
function chainAxis(res) {
  const c = new THREE.Vector3(); res.forEach(r => c.add(r.CA)); c.multiplyScalar(1 / res.length);
  return { c, u: res[res.length - 1].CA.clone().sub(res[0].CA).normalize() };
}

/* ---- 繪製 ---- */
function smat(col, o = 1, extra) { return mat(col, o, extra); }
function atomM(p, el, m, s = 1) {
  const mm = new THREE.Mesh(_sph, m); mm.position.copy(p); mm.scale.setScalar(EL[el][1] * s); return mm;
}
function stickM(a, b, r, m) {
  const mm = new THREE.Mesh(_cylG, m); setStick(mm, a, b, r); return mm;
}
function setStick(mm, a, b, r) {
  const d = b.clone().sub(a), len = d.length();
  mm.position.copy(a).addScaledVector(d, 0.5);
  mm.scale.set(r, len, r);
  mm.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
}
// 虛線（一串短圓柱）
function dashM(a, b, r, m, seg = 0.35, gap = 0.25) {
  const d = b.clone().sub(a), L = d.length(), u = d.clone().normalize(), out = [];
  for (let s = 0; s < L - 0.05; s += seg + gap) {
    const e = Math.min(L, s + seg);
    out.push(stickM(a.clone().addScaledVector(u, s), a.clone().addScaledVector(u, e), r, m));
  }
  return out;
}
// 在線段 a-b 上更新一組 dash（數量固定；多出者隱藏）
function setDash(list, a, b, r, seg = 0.35, gap = 0.25) {
  const d = b.clone().sub(a), L = d.length(), u = d.clone().normalize();
  list.forEach((mm, k) => {
    const s = k * (seg + gap), e = Math.min(L, s + seg);
    mm.userData.off = s >= L;
    if (s < L) setStick(mm, a.clone().addScaledVector(u, s), a.clone().addScaledVector(u, e), r);
    else mm.scale.set(0.0001, 0.0001, 0.0001);
  });
}

/**
 * 將主鏈畫成球棍模型並以構造分組註冊
 * opt: {G 分組, tag 名稱尾碼, bb:true, H:true, R:'CB'|'R'|false, pep:true, rCol, skipR:Set}
 * 回傳 {atoms:{N:[],..}, parts}
 */
function drawBackbone(res, opt = {}) {
  const G = opt.G || '主鏈', tg = opt.tag || '';
  const mN = smat(EL.N[0]), mC = smat(EL.C[0]), mO = smat(EL.O[0]), mH = smat(EL.H[0]), mB = smat(0xcfcfcf);
  const mP = smat(0x34d0c0), mR = smat(opt.rCol || EL.R[0]), mCB = smat(0x8a8a8a);
  const s = opt.scale || 1, br = 0.14 * s;
  const CA = [], NC = [], O = [], H = [], B = [], P = [], R = [];
  const mCA = smat(0x707070);
  res.forEach((r, i) => {
    CA.push(atomM(r.CA, 'C', mCA, s * 1.15));
    NC.push(atomM(r.N, 'N', mN, s), atomM(r.C, 'C', mC, s));
    O.push(atomM(r.O, 'O', mO, s));
    B.push(stickM(r.N, r.CA, br, mB), stickM(r.CA, r.C, br, mB), stickM(r.C, r.O, br, mO));
    if (r.H && opt.H !== false) { H.push(atomM(r.H, 'H', mH, s)); B.push(stickM(r.N, r.H, br * 0.8, mB)); }
    if (i + 1 < res.length) P.push(stickM(r.C, res[i + 1].N, br * 1.25, mP));
    if (opt.R !== false && !(opt.skipR && opt.skipR.has(i))) {
      const tip = r.CA.clone().addScaledVector(r.Rdir, opt.R === 'CB' ? 1.53 : 2.3);
      R.push(stickM(r.CA, tip, br, mCB), atomM(tip, 'R', mR, s * (opt.R === 'CB' ? 0.75 : 1)));
    }
  });
  const parts = {};
  const mid = res[Math.floor(res.length / 2)];
  parts.CA = reg(G, 'α 碳（Cα）' + tg, 'α-carbon', '每個胺基酸中央的碳；連接胺基、羧基、H 與側鏈 R。主鏈即由 <b>N–Cα–C</b> 重複組成。', CA, { anchor: mid.CA.toArray() });
  parts.NC = reg(G, '主鏈 N、C' + tg, 'Backbone N & carbonyl C', '主鏈（main chain / backbone）為固定不變的骨架；變化的只有側鏈。', NC, { nolabel: true });
  parts.O = reg(G, '羰基 C=O' + tg, 'Carbonyl oxygen', '主鏈的 C=O 是<b>氫鍵受體</b>（hydrogen bond acceptor）。', O, { anchor: res[1].O.toArray() });
  if (H.length) parts.H = reg(G, '醯胺 N–H' + tg, 'Amide hydrogen', '主鏈的 N–H 是<b>氫鍵供體</b>。Pro 的 α-胺基在環上，<b>沒有 N–H</b>。', H, { anchor: res[Math.min(res.length - 1, 2)].H ? res[2].H.toArray() : undefined });
  parts.B = reg(G, '主鏈共價鍵' + tg, 'Backbone bonds', 'N–Cα 與 Cα–C 為<b>純單鍵</b>，可自由旋轉（φ、ψ）。', B, { nolabel: true });
  if (P.length) parts.P = reg(G, '肽鍵 C–N' + tg, 'Peptide (amide) bond', '一個胺基酸的 α-羧基與下一個胺基酸的 α-胺基縮合形成的<b>醯胺鍵</b>；具<b>部分雙鍵性質</b>，不能旋轉，使 Cα、C、O、N、H、Cα 六原子共平面。', P, { anchor: res[0].C.clone().lerp(res[1].N, 0.5).toArray() });
  if (R.length) parts.R = reg(G, '側鏈 R 基' + tg, 'Side chain (R group)', opt.Rinfo || '20 種側鏈在大小、形狀、電荷、氫鍵能力、疏水性與反應性上各不相同，決定每個胺基酸的特性。', R, { anchor: res[res.length - 2].CA.clone().addScaledVector(res[res.length - 2].Rdir, 2.3).toArray() });
  return parts;
}

// 找主鏈氫鍵：O(i) … H–N(j)；回傳 [{i,j,O,H,N}]
function findHB(resA, resB, maxOH = 2.6, same = true) {
  const out = [];
  resA.forEach((a, i) => resB.forEach((b, j) => {
    if (!b.H || (same && Math.abs(i - j) < 3)) return;
    const d = a.O.distanceTo(b.H);
    if (d < maxOH && a.O.distanceTo(b.N) < 3.5) out.push({ i, j, O: a.O, H: b.H, N: b.N, d });
  }));
  return out;
}
function drawHB(list, G, zh, en, info, col = 0xffe066) {
  const m = smat(col); const ms = [];
  list.forEach(h => ms.push(...dashM(h.O, h.H, 0.06, m, 0.22, 0.16)));
  if (!ms.length) return null;
  const h0 = list[Math.floor(list.length / 2)];
  return reg(G, zh, en, info, ms, { anchor: h0.O.clone().lerp(h0.H, 0.5).toArray() });
}

/* ---- 卡通（緞帶）結構 ---- */
// β 股箭頭：從 a 到 b，寬 w，面法向 nrm
function arrowM(a, b, nrm, col, w = 1.6, o = 1) {
  a = a.isVector3 ? a : V(...a); b = b.isVector3 ? b : V(...b);
  const L = a.distanceTo(b), hl = Math.min(2.2, L * 0.3);
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, L - hl); s.lineTo(w, L - hl); s.lineTo(0, L);
  s.lineTo(-w, L - hl); s.lineTo(-w / 2, L - hl); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: false }); g.translate(0, 0, -0.2);
  const m = new THREE.Mesh(g, mat(col, o));
  const y = b.clone().sub(a).normalize(), z = (nrm.isVector3 ? nrm : V(...nrm)).clone();
  z.addScaledVector(y, -z.dot(y)).normalize();
  const x = y.clone().cross(z);
  m.matrix.makeBasis(x, y, z).setPosition(a); m.matrix.decompose(m.position, m.quaternion, m.scale);
  return m;
}
// α 螺旋卡通：沿 a→b 的理想螺旋 CA 軌跡（右手、3.6 殘基/圈、每殘基升 1.5 Å、半徑 2.3 Å）
function helixTrace(a, b, nRes, phase = 0, handed = 1, perTurn = 3.6, rad = 2.3) {
  a = a.isVector3 ? a : V(...a); b = b.isVector3 ? b : V(...b);
  const u = b.clone().sub(a).normalize();
  const t1 = Math.abs(u.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
  const e1 = t1.clone().cross(u).normalize(), e2 = u.clone().cross(e1);
  const L = a.distanceTo(b), pts = [];
  for (let i = 0; i < nRes; i++) {
    const t = nRes > 1 ? i / (nRes - 1) : 0, ang = phase + handed * i * 2 * Math.PI / perTurn;
    pts.push(a.clone().addScaledVector(u, t * L).addScaledVector(e1, Math.cos(ang) * rad).addScaledVector(e2, Math.sin(ang) * rad));
  }
  return pts;
}
// 平滑連接兩點的環（loop），中間往 bulge 方向鼓起
function loopPts(a, b, bulge, n = 6) {
  a = a.isVector3 ? a : V(...a); b = b.isVector3 ? b : V(...b);
  const bg = bulge.isVector3 ? bulge : V(...bulge), pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n; pts.push(a.clone().lerp(b, t).addScaledVector(bg, Math.sin(t * Math.PI)));
  }
  return pts;
}

/* ---- 血基質（protoporphyrin IX）：Fe 在原點、環在 xy 平面 ---- */
function hemeAtoms() {
  const at = [], bd = [];
  const add = (p, el) => { at.push({ p: p.isVector3 ? p : V(...p), el }); return at.length - 1; };
  const fe = add([0, 0, 0], 'Fe');
  const R = 1.174, side = [];
  const subs = [['Me', 'Vi'], ['Me', 'Vi'], ['Me', 'Pr'], ['Pr', 'Me']]; // 吡咯 A–D 上的取代基
  const pyr = [];
  for (let k = 0; k < 4; k++) {
    const th = k * Math.PI / 2, d = V(Math.cos(th), Math.sin(th), 0), cen = d.clone().multiplyScalar(2.03 + R);
    const vtx = [];
    for (let j = 0; j < 5; j++) {
      const a = th + Math.PI + j * 2 * Math.PI / 5;
      vtx.push(add(cen.clone().add(V(Math.cos(a) * R, Math.sin(a) * R, 0)), j === 0 ? 'N' : 'C'));
    }
    for (let j = 0; j < 5; j++) bd.push([vtx[j], vtx[(j + 1) % 5]]);
    pyr.push(vtx);
    // 取代基接在 Cβ（vtx[2], vtx[3]）
    [2, 3].forEach((j, q) => {
      const p = at[vtx[j]].p, out = p.clone().sub(cen).normalize();
      const type = subs[k][q];
      const c1 = add(p.clone().addScaledVector(out, 1.5), 'C'); bd.push([vtx[j], c1]);
      if (type === 'Vi') { const c2 = add(at[c1].p.clone().addScaledVector(out, 0.8).add(V(-out.y, out.x, 0).multiplyScalar(1.1)), 'C'); bd.push([c1, c2]); }
      if (type === 'Pr') {
        const c2 = add(at[c1].p.clone().addScaledVector(out, 1.1).add(V(0, 0, 1.0)), 'C'); bd.push([c1, c2]);
        const c3 = add(at[c2].p.clone().addScaledVector(out, 1.0).add(V(0, 0, 0.6)), 'C'); bd.push([c2, c3]);
        const o1 = add(at[c3].p.clone().add(V(0, 0, 1.2)), 'O'), o2 = add(at[c3].p.clone().addScaledVector(out, 1.2), 'O');
        bd.push([c3, o1], [c3, o2]);
      }
      side.push({ type, atom: c1 });
    });
  }
  // 次甲基橋 –CH=：連接相鄰吡咯的 Cα
  const meth = [];
  for (let k = 0; k < 4; k++) {
    const a = pyr[k][1], b = pyr[(k + 1) % 4][4];
    const mp = at[a].p.clone().lerp(at[b].p, 0.5); mp.multiplyScalar(1 + 0.62 / mp.length());
    const m = add(mp, 'C'); bd.push([a, m], [m, b]); meth.push(m);
  }
  return { at, bd, fe, pyrN: pyr.map(v => v[0]), pyr, meth, side };
}

// 重建目前分頁但保留視角（用於切換結構狀態）
function reloadKeep() {
  const p = camera.position.clone(), t = controls.target.clone();
  loadScene(curIdx); camera.position.copy(p); controls.target.copy(t); controls.update();
}
// 在 extra 面板加入滑桿：回傳 input
function slider(box, label, min, max, val, step, on) {
  const w = document.createElement('label'); w.className = 'sl';
  const b = document.createElement('b'); const inp = document.createElement('input');
  Object.assign(inp, { type: 'range', min, max, value: val, step });
  w.append(label + '：', b, inp); box.appendChild(w);
  const f = () => { b.textContent = inp.value; on(+inp.value); };
  inp.oninput = f; b.textContent = val;
  return inp;
}
function checkbox(box, label, val, on) {
  const w = document.createElement('label'); const c = document.createElement('input');
  c.type = 'checkbox'; c.checked = val; c.onchange = () => on(c.checked);
  w.append(c, ' ' + label); box.appendChild(w); return c;
}
function note(box, html, cls = 'note') { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; box.appendChild(d); return d; }
function partBy(zh) { return CUR.parts.find(p => p.zh === zh); }
function togglePart(zh, on) { const p = partBy(zh); if (!p) return; p.visible = on === undefined ? !p.visible : on; rebuildList(); refresh(); return p; }
// 讓構造跟著某個 Group 移動：meshes 已用 grp 的區域座標建立，anchor 也是區域座標
function attachPart(p, grp) { p._grp = grp; p._loc = p.anchor.clone(); p.meshes.forEach(m => grp.add(m)); return p; }
function updateAnchors() { CUR.parts.forEach(p => { if (p._grp) { p._grp.updateMatrixWorld(); p.anchor.copy(p._loc).applyMatrix4(p._grp.matrixWorld); } }); }
