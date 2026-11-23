/* 有機建模工具：符號距離場（SDF）＋表面網格化（surface nets）＋剖面點陣貼圖 */
const SDF = (function () {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  // ---- 基本形 ----
  const sph = (x, y, z, c, r) => Math.hypot(x - c[0], y - c[1], z - c[2]) - r;
  function ell(x, y, z, c, r) { // 近似橢球（IQ）
    const px = (x - c[0]) / r[0], py = (y - c[1]) / r[1], pz = (z - c[2]) / r[2];
    const k0 = Math.hypot(px, py, pz), k1 = Math.hypot(px / r[0], py / r[1], pz / r[2]);
    return k1 < 1e-9 ? -Math.min(r[0], r[1], r[2]) : k0 * (k0 - 1) / k1;
  }
  function cap(x, y, z, a, b, r1, r2) { // 兩端半徑不同的膠囊
    const bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2], px = x - a[0], py = y - a[1], pz = z - a[2];
    const t = clamp((px * bx + py * by + pz * bz) / (bx * bx + by * by + bz * bz), 0, 1);
    return Math.hypot(px - bx * t, py - by * t, pz - bz * t) - (r1 + (r2 - r1) * t);
  }
  // 沿折線的膠囊鏈（半徑逐點）
  function chain(x, y, z, pts, rs) { let d = 1e9; for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, cap(x, y, z, pts[i], pts[i + 1], rs[i], rs[i + 1])); return d; }
  // ---- 運算 ----
  function smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }
  const smax = (a, b, k) => -smin(-a, -b, k);
  const sub = (a, b, k) => k ? smax(a, -b, k) : Math.max(a, -b);

  // ---- 表面網格化（naive surface nets） ----
  function mesh(f, b0, b1, h, opt = {}) {
    const nx = Math.ceil((b1[0] - b0[0]) / h) + 1, ny = Math.ceil((b1[1] - b0[1]) / h) + 1, nz = Math.ceil((b1[2] - b0[2]) / h) + 1;
    const F = new Float32Array(nx * ny * nz), I = (i, j, k) => i + nx * (j + ny * k);
    for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) F[I(i, j, k)] = f(b0[0] + i * h, b0[1] + j * h, b0[2] + k * h);
    const cx = nx - 1, cy = ny - 1, cz = nz - 1, C = new Int32Array(cx * cy * cz).fill(-1), CI = (i, j, k) => i + cx * (j + cy * k);
    const pos = [], E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    const O = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]], v = new Float32Array(8);
    let nv = 0;
    for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
      let m = 0; for (let c = 0; c < 8; c++) { v[c] = F[I(i + O[c][0], j + O[c][1], k + O[c][2])]; if (v[c] < 0) m |= 1 << c; }
      if (m === 0 || m === 255) continue;
      let sx = 0, sy = 0, sz = 0, n = 0;
      for (const [a, b] of E) {
        if ((v[a] < 0) === (v[b] < 0)) continue;
        const t = v[a] / (v[a] - v[b]);
        sx += O[a][0] + (O[b][0] - O[a][0]) * t; sy += O[a][1] + (O[b][1] - O[a][1]) * t; sz += O[a][2] + (O[b][2] - O[a][2]) * t; n++;
      }
      pos.push(b0[0] + (i + sx / n) * h, b0[1] + (j + sy / n) * h, b0[2] + (k + sz / n) * h);
      C[CI(i, j, k)] = nv++;
    }
    const idx = [];
    const quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; flip ? idx.push(a, c, b, a, d, c) : idx.push(a, b, c, a, c, d); };
    for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const s0 = F[I(i, j, k)] < 0;
      if (i < cx && j > 0 && k > 0 && j < cy && k < cz && (F[I(i + 1, j, k)] < 0) !== s0) quad(C[CI(i, j - 1, k - 1)], C[CI(i, j, k - 1)], C[CI(i, j, k)], C[CI(i, j - 1, k)], s0);
      if (j < cy && i > 0 && k > 0 && i < cx && k < cz && (F[I(i, j + 1, k)] < 0) !== s0) quad(C[CI(i - 1, j, k - 1)], C[CI(i - 1, j, k)], C[CI(i, j, k)], C[CI(i, j, k - 1)], s0);
      if (k < cz && i > 0 && j > 0 && i < cx && j < cy && (F[I(i, j, k + 1)] < 0) !== s0) quad(C[CI(i - 1, j - 1, k)], C[CI(i, j - 1, k)], C[CI(i, j, k)], C[CI(i - 1, j, k)], s0);
    }
    // 由梯度求平滑法線
    const nor = new Float32Array(pos.length), e = h * 0.5;
    for (let q = 0; q < pos.length; q += 3) {
      const x = pos[q], y = pos[q + 1], z = pos[q + 2];
      let gx = f(x + e, y, z) - f(x - e, y, z), gy = f(x, y + e, z) - f(x, y - e, z), gz = f(x, y, z + e) - f(x, y, z - e);
      const L = Math.hypot(gx, gy, gz) || 1; nor[q] = gx / L; nor[q + 1] = gy / L; nor[q + 2] = gz / L;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    if (opt.color) { const col = []; for (let q = 0; q < pos.length; q += 3) col.push(...opt.color(pos[q], pos[q + 1], pos[q + 2])); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); }
    g.setIndex(idx); g.computeBoundingBox(); g.computeBoundingSphere();
    return g;
  }

  // ---- 剖面點陣貼圖：在平面上逐像素呼叫 colorAt(x,y,z) → [r,g,b,a]（0–255）或 null ----
  // plane: { o:[x,y,z] 左下角, u:[...] 寬方向單位向量, v:[...] 高方向, w, h（世界單位）}, ppu：每單位像素
  function slice(plane, ppu, colorAt) {
    const W = Math.ceil(plane.w * ppu), H = Math.ceil(plane.h * ppu);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'), img = c.createImageData(W, H), d = img.data;
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const a = (px + 0.5) / ppu, b = plane.h - (py + 0.5) / ppu;
      const x = plane.o[0] + plane.u[0] * a + plane.v[0] * b, y = plane.o[1] + plane.u[1] * a + plane.v[1] * b, z = plane.o[2] + plane.u[2] * a + plane.v[2] * b;
      const col = colorAt(x, y, z); if (!col) continue;
      const q = (py * W + px) * 4; d[q] = col[0]; d[q + 1] = col[1]; d[q + 2] = col[2]; d[q + 3] = col[3] === undefined ? 255 : col[3];
    }
    c.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 8;
    const g = new THREE.PlaneGeometry(plane.w, plane.h);
    const m = new THREE.Mesh(g, mat(0xffffff, 1, { map: tex, alphaTest: 0.5, transparent: false }));
    // 擺到平面中心並轉向
    const U = new THREE.Vector3(...plane.u), Vv = new THREE.Vector3(...plane.v), N = U.clone().cross(Vv).normalize();
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(U, Vv, N));
    m.position.set(...plane.o).addScaledVector(U, plane.w / 2).addScaledVector(Vv, plane.h / 2);
    return m;
  }
  // 多區域剖面：classify(x,y,z) → [區域名, [r,g,b]] 或 null；回傳 {名稱: mesh}，點選時依貼圖透明度判斷
  function slices(plane, ppu, classify, z0 = 0.004) {
    const W = Math.ceil(plane.w * ppu), H = Math.ceil(plane.h * ppu), buf = {}, out = {};
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const a = (px + 0.5) / ppu, b = plane.h - (py + 0.5) / ppu;
      const x = plane.o[0] + plane.u[0] * a + plane.v[0] * b, y = plane.o[1] + plane.u[1] * a + plane.v[1] * b, z = plane.o[2] + plane.u[2] * a + plane.v[2] * b;
      const r = classify(x, y, z); if (!r) continue;
      let B = buf[r[0]]; if (!B) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); B = buf[r[0]] = { cv, c, img: c.createImageData(W, H) }; }
      const q = (py * W + px) * 4, d = B.img.data; d[q] = r[1][0]; d[q + 1] = r[1][1]; d[q + 2] = r[1][2]; d[q + 3] = 255;
    }
    const U = new THREE.Vector3(...plane.u), Vv = new THREE.Vector3(...plane.v), N = U.clone().cross(Vv).normalize();
    Object.keys(buf).forEach((k, n) => {
      const B = buf[k]; B.c.putImageData(B.img, 0, 0);
      const tex = new THREE.CanvasTexture(B.cv); tex.anisotropy = 8;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(plane.w, plane.h), mat(0xffffff, 1, { map: tex, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -2 - n, polygonOffsetUnits: -4 }));
      m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(U, Vv, N));
      m.position.set(...plane.o).addScaledVector(U, plane.w / 2).addScaledVector(Vv, plane.h / 2).addScaledVector(N, z0 + n * 0.0005);
      const data = B.img.data;
      m.raycast = function (ray, hits) {
        const tmp = []; THREE.Mesh.prototype.raycast.call(this, ray, tmp);
        tmp.forEach(h => { if (!h.uv) return; const px = Math.floor(h.uv.x * W), py = Math.floor((1 - h.uv.y) * H); if (data[(py * W + px) * 4 + 3] > 0) hits.push(h); });
      };
      m.userData.sliceRegion = k; m.geometry.userData.shared = true; out[k] = m;
    });
    return out;
  }
  // 把既有網格沿法線外推成一層「皮」（骨膜、關節軟骨），keep(x,y,z,nx,ny,nz) 決定保留哪些三角形
  function skin(geo, dist, keep) {
    const P = geo.attributes.position, Nn = geo.attributes.normal, ix = geo.index.array, pos = new Float32Array(P.count * 3), ok = new Uint8Array(P.count);
    for (let i = 0; i < P.count; i++) {
      const nx = Nn.getX(i), ny = Nn.getY(i), nz = Nn.getZ(i), x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      pos[i * 3] = x + nx * dist; pos[i * 3 + 1] = y + ny * dist; pos[i * 3 + 2] = z + nz * dist; ok[i] = keep(x, y, z, nx, ny, nz) ? 1 : 0;
    }
    const idx = []; for (let t = 0; t < ix.length; t += 3) if (ok[ix[t]] && ok[ix[t + 1]] && ok[ix[t + 2]]) idx.push(ix[t], ix[t + 1], ix[t + 2]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', Nn.clone()); g.setIndex(idx); g.computeBoundingSphere();
    return g;
  }
  // 從色碼轉陣列
  const rgb = (hex, a = 255) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255, a];
  const mix = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t, 255];
  return { sph, ell, cap, chain, smin, smax, sub, mesh, slice, slices, skin, rgb, mix, clamp };
})();
