/**
 * Lightweight 100% offline THREE.OBJLoader (compatible with Three.js r128)
 * Supports v, vn, vt, o, g, f (v, v/vt, v//vn, v/vt/vn, arbitrary n-gons)
 */
(function () {
  if (typeof THREE === 'undefined') return;
  THREE.OBJLoader = function () {};
  THREE.OBJLoader.prototype = {
    constructor: THREE.OBJLoader,
    parse: function (text) {
      const lines = text.split('\n');
      const root = new THREE.Group();
      const positions = [];
      const normals = [];
      const uvs = [];

      let curName = 'default';
      let curPos = [];
      let curNorm = [];
      let curUv = [];

      function commit() {
        if (curPos.length === 0) return;
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(curPos, 3));
        if (curNorm.length === curPos.length) {
          geom.setAttribute('normal', new THREE.Float32BufferAttribute(curNorm, 3));
        } else {
          geom.computeVertexNormals();
        }
        if (curUv.length === (curPos.length / 3) * 2) {
          geom.setAttribute('uv', new THREE.Float32BufferAttribute(curUv, 2));
        }
        const mesh = new THREE.Mesh(geom, new THREE.MeshLambertMaterial({ color: 0xddccbb }));
        mesh.name = curName;
        root.add(mesh);
        curPos = [];
        curNorm = [];
        curUv = [];
      }

      function resolveIdx(raw, len) {
        const idx = parseInt(raw, 10);
        if (isNaN(idx)) return -1;
        return idx < 0 ? len + idx : idx - 1;
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.charCodeAt(0) === 35) continue; // '#'
        const parts = line.split(/\s+/);
        const tag = parts[0];
        if (tag === 'v') {
          positions.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
        } else if (tag === 'vn') {
          normals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
        } else if (tag === 'vt') {
          uvs.push(parseFloat(parts[1]), parseFloat(parts[2]));
        } else if (tag === 'o' || tag === 'g') {
          commit();
          curName = parts[1] || ('obj_' + root.children.length);
        } else if (tag === 'f') {
          const vList = [], tList = [], nList = [];
          const pLen = positions.length / 3;
          const tLen = uvs.length / 2;
          const nLen = normals.length / 3;
          for (let j = 1; j < parts.length; j++) {
            const seg = parts[j].split('/');
            vList.push(resolveIdx(seg[0], pLen));
            tList.push(seg.length >= 2 && seg[1] ? resolveIdx(seg[1], tLen) : -1);
            nList.push(seg.length >= 3 && seg[2] ? resolveIdx(seg[2], nLen) : -1);
          }
          for (let j = 1; j < vList.length - 1; j++) {
            const triV = [vList[0], vList[j], vList[j + 1]];
            if (triV[0] < 0 || triV[1] < 0 || triV[2] < 0) continue;
            for (let k = 0; k < 3; k++) {
              const vi = triV[k] * 3;
              curPos.push(positions[vi], positions[vi + 1], positions[vi + 2]);
            }
            const triN = [nList[0], nList[j], nList[j + 1]];
            if (triN[0] >= 0 && triN[1] >= 0 && triN[2] >= 0) {
              for (let k = 0; k < 3; k++) {
                const ni = triN[k] * 3;
                curNorm.push(normals[ni], normals[ni + 1], normals[ni + 2]);
              }
            }
            const triT = [tList[0], tList[j], tList[j + 1]];
            if (triT[0] >= 0 && triT[1] >= 0 && triT[2] >= 0) {
              for (let k = 0; k < 3; k++) {
                const ti = triT[k] * 2;
                curUv.push(uvs[ti], uvs[ti + 1]);
              }
            }
          }
        }
      }
      commit();
      return root;
    }
  };
})();
