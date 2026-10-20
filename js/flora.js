const Flora = { sunflowers: null, grassA: null, grassB: null, trees: [], windU: { value: 0 } };

function makeTree(scene, opt) {
  const s = opt.scale || 1;
  const g = new THREE.Group();
  const baseY = groundH(opt.x, opt.z);
  g.position.set(opt.x, baseY, opt.z);
  g.rotation.y = rand(0, 6.28);
  scene.add(g);

  const H = 5.6 * s;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.2, 0),
    new THREE.Vector3(0.2 * s, H * 0.32, -0.12 * s),
    new THREE.Vector3(-0.16 * s, H * 0.66, 0.18 * s),
    new THREE.Vector3(0.05 * s, H, 0.02 * s)
  ]);
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.34 * s, 10, false), MAT.bark);
  trunk.castShadow = true; trunk.receiveShadow = true;
  g.add(trunk);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 6.283 + rand(-0.3, 0.3);
    const root = new THREE.Mesh(new THREE.ConeGeometry(0.2 * s, rand(0.7, 1.15) * s, 5), MAT.bark);
    root.position.set(Math.cos(a) * 0.22 * s, 0.18 * s, Math.sin(a) * 0.22 * s);
    root.rotation.z = Math.cos(a) * 0.55;
    root.rotation.x = -Math.sin(a) * 0.55;
    root.castShadow = true;
    g.add(root);
  }

  const branches = [];
  const nB = 6;
  for (let i = 0; i < nB; i++) {
    const t = 0.42 + (i / nB) * 0.5;
    const p0 = curve.getPointAt(clamp(t, 0.02, 0.96));
    const ang = (i / nB) * 6.283 + rand(-0.45, 0.45);
    const len = (1.9 + rand(0, 1.3)) * s;
    const rise = (1.0 + rand(0, 0.9)) * s;
    const p1 = p0.clone().add(new THREE.Vector3(Math.cos(ang) * len * 0.45, rise * 0.55, Math.sin(ang) * len * 0.45));
    const p2 = p0.clone().add(new THREE.Vector3(Math.cos(ang) * len, rise, Math.sin(ang) * len));
    const bc = new THREE.CatmullRomCurve3([p0, p1, p2]);
    const bt = new THREE.Mesh(new THREE.TubeGeometry(bc, 9, 0.115 * s, 6, false), MAT.bark);
    bt.castShadow = true;
    g.add(bt);
    branches.push({ tip: p2.clone(), mid: p1.clone() });
  }

  const canopy = [];
  for (let i = 0; i < 8; i++) {
    const a = rand(0, 6.283), r = rand(0, 1.9 * s);
    canopy.push({
      p: new THREE.Vector3(Math.cos(a) * r, H + rand(-0.9, 1.3) * s, Math.sin(a) * r),
      r: rand(1.45, 2.35) * s
    });
  }
  branches.forEach(b => canopy.push({ p: b.tip.clone(), r: rand(1.05, 1.65) * s }));

  const icoGeo = new THREE.IcosahedronGeometry(1, 1);
  const leafMat = new THREE.MeshStandardMaterial({ roughness: 0.95, flatShading: true });
  const im = new THREE.InstancedMesh(icoGeo, leafMat, canopy.length);
  im.castShadow = true; im.receiveShadow = true;
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  const greens = [0x57803a, 0x679149, 0x4a6d30, 0x76994f];
  canopy.forEach((c, i) => {
    dummy.position.copy(c.p);
    dummy.rotation.set(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28));
    dummy.scale.set(c.r, c.r * rand(0.8, 1.05), c.r);
    dummy.updateMatrix();
    im.setMatrixAt(i, dummy.matrix);
    col.setHex(greens[(Math.random() * greens.length) | 0]);
    col.offsetHSL(rand(-0.02, 0.02), rand(-0.05, 0.05), rand(-0.05, 0.05));
    im.setColorAt(i, col);
  });
  im.instanceMatrix.needsUpdate = true;
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  g.add(im);

  const res = { group: g, branches, curve, height: H, scale: s, pos: new THREE.Vector3(opt.x, baseY, opt.z) };
  Flora.trees.push(res);
  return res;
}

function buildNearTrees(scene) {
  const back = makeTree(scene, { x: -13.2, z: -6.4, scale: 1.15 });
  const squirrelTree = makeTree(scene, { x: 10.2, z: 1.0, scale: 1.28 });
  const owlTree = makeTree(scene, { x: -12.6, z: 12.0, scale: 0.95 });
  makeTree(scene, { x: 12.6, z: -7.0, scale: 1.0 });
  World.treeRefs = { back, squirrelTree, owlTree };
  scene.updateMatrixWorld(true);
  return World.treeRefs;
}

function buildForest(scene) {
  const N = 130;
  const trunks = [], cones = [], cones2 = [], balls = [];
  const d = new THREE.Object3D();
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const a = rand(0, 6.283);
    const r = rand(26, 76);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x) < 13 && z > -12 && z < 18) continue;
    const y = groundH(x, z);
    const conifer = Math.random() > 0.42;
    const H = rand(6, 13.5) * (0.8 + r / 90);
    trunks.push({ x, y, z, h: H * (conifer ? 0.34 : 0.46), w: H * 0.028 });
    if (conifer) {
      cones.push({ x, y: y + H * 0.28, z, h: H * 0.62, w: H * 0.23, ry: rand(0, 6.28) });
      cones2.push({ x, y: y + H * 0.56, z, h: H * 0.5, w: H * 0.17, ry: rand(0, 6.28) });
    } else {
      balls.push({ x, y: y + H * 0.58, z, h: H * 0.42, ry: rand(0, 6.28) });
    }
  }

  const trunkGeo = new THREE.CylinderGeometry(0.55, 1, 1, 6);
  const trunkIM = new THREE.InstancedMesh(trunkGeo, MAT.bark, trunks.length);
  trunks.forEach((t, i) => {
    d.position.set(t.x, t.y + t.h / 2, t.z);
    d.rotation.set(0, rand(0, 6.28), 0);
    d.scale.set(t.w, t.h, t.w);
    d.updateMatrix();
    trunkIM.setMatrixAt(i, d.matrix);
  });
  trunkIM.castShadow = false; trunkIM.receiveShadow = true;
  scene.add(trunkIM);

  const coneMat = new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true });
  const coneGeo = new THREE.ConeGeometry(1, 1, 7);
  const makeConeIM = (arr, baseColor) => {
    const im = new THREE.InstancedMesh(coneGeo, coneMat.clone(), arr.length);
    arr.forEach((t, i) => {
      d.position.set(t.x, t.y + t.h / 2, t.z);
      d.rotation.set(0, t.ry, 0);
      d.scale.set(t.w, t.h, t.w);
      d.updateMatrix();
      im.setMatrixAt(i, d.matrix);
      c.setHex(baseColor); c.offsetHSL(rand(-0.03, 0.02), rand(-0.08, 0.06), rand(-0.07, 0.07));
      im.setColorAt(i, c);
    });
    im.castShadow = false; im.receiveShadow = false;
    scene.add(im);
    return im;
  };
  if (cones.length) makeConeIM(cones, 0x2f5a26);
  if (cones2.length) makeConeIM(cones2, 0x3c6b2e);

  if (balls.length) {
    const ballGeo = new THREE.IcosahedronGeometry(1, 0);
    const im = new THREE.InstancedMesh(ballGeo, coneMat.clone(), balls.length);
    balls.forEach((t, i) => {
      d.position.set(t.x, t.y, t.z);
      d.rotation.set(rand(0, 6.28), t.ry, rand(0, 6.28));
      d.scale.set(t.h * 1.15, t.h * 0.95, t.h * 1.15);
      d.updateMatrix();
      im.setMatrixAt(i, d.matrix);
      c.setHex(Math.random() > .5 ? 0x46752f : 0x39632a);
      c.offsetHSL(rand(-0.02, 0.02), rand(-0.06, 0.06), rand(-0.06, 0.06));
      im.setColorAt(i, c);
    });
    im.castShadow = false;
    scene.add(im);
  }
}

function buildSunflowers(scene, count) {
  const spots = [];
  let guard = 0;
  while (spots.length < count && guard++ < count * 60) {
    const x = rand(-9.2, 9.2), z = rand(4.4, 16.4);
    const ex = x / 9.4, ez = (z - 10.4) / 6.9;
    if (ex * ex + ez * ez > 1) continue;
    if (Math.abs(x) < 1.6 && z < 11.6) continue;
    if (z < 6.4 && Math.abs(x) < 4.6) continue;
    let ok = true;
    for (let i = 0; i < spots.length; i++) {
      const dx = spots[i].x - x, dz = spots[i].z - z;
      if (dx * dx + dz * dz < 0.55) { ok = false; break; }
    }
    if (!ok) continue;
    spots.push({ x, z });
  }

  const n = spots.length;
  const PCH = 13, LV = 5;

  const stemGeo = new THREE.CylinderGeometry(0.030, 0.046, 1, 6);
  const headGeo = new THREE.CylinderGeometry(0.315, 0.27, 0.086, 18);
  const faceGeo = new THREE.CircleGeometry(0.284, 24);
  faceGeo.rotateX(-Math.PI / 2);
  faceGeo.translate(0, 0.043, 0);
  const petalGeo = new THREE.PlaneGeometry(0.198, 0.50);
  const leafGeo = (function () {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.155, 0.07, 0.255, 0.26, 0.04, 0.43);
    s.bezierCurveTo(-0.148, 0.28, -0.124, 0.085, 0, 0);
    const gg = new THREE.ShapeGeometry(s, 6);
    return gg;
  })();

  const stemIM = new THREE.InstancedMesh(stemGeo, MAT.stem, n);
  const headIM = new THREE.InstancedMesh(headGeo, MAT.petal, n);
  const faceIM = new THREE.InstancedMesh(faceGeo, MAT.disc, n);
  const petalIM = new THREE.InstancedMesh(petalGeo, MAT.petal, n * PCH);
  const leafIM = new THREE.InstancedMesh(leafGeo, MAT.leafG, n * LV);

  headIM.material = new THREE.MeshStandardMaterial({ color: 0x6f4b1e, roughness: 0.88 });

  const rootM = new THREE.Matrix4();
  const headM = new THREE.Matrix4();
  const headRot = new THREE.Matrix4();
  const transM = new THREE.Matrix4();
  const outM = new THREE.Matrix4();
  const o = new THREE.Object3D();
  const e = new THREE.Euler();
  const q = new THREE.Quaternion();
  const col = new THREE.Color();
  let pi = 0, li = 0;

  for (let i = 0; i < n; i++) {
    const sp = spots[i];
    const h = rand(1.3, 2.35);
    e.set(rand(-0.07, 0.07), rand(0, 6.283), rand(-0.07, 0.07), 'YXZ');
    q.setFromEuler(e);
    rootM.compose(new THREE.Vector3(sp.x, 0, sp.z), q, new THREE.Vector3(1, 1, 1));

    o.position.set(0, h / 2, 0); o.rotation.set(0, 0, 0); o.scale.set(1, h, 1);
    o.updateMatrix();
    outM.multiplyMatrices(rootM, o.matrix);
    stemIM.setMatrixAt(i, outM);
    stemIM.setColorAt(i, col.setHex(0x4f7d2f).offsetHSL(rand(-0.03, 0.03), rand(-0.05, 0.05), rand(-0.08, 0.08)));

    const hp = rand(0.2, 0.5);
    const hy = -0.78 + rand(-0.95, 0.95);
    headRot.makeRotationFromEuler(e.set(-hp, hy, 0, 'YXZ'));
    headM.copy(rootM);
    headM.multiply(transM.makeTranslation(0, h + 0.02, 0));
    headM.multiply(headRot);

    o.position.set(0, 0, 0); o.rotation.set(0, 0, 0);
    o.scale.set(rand(0.92, 1.14), rand(0.9, 1.08), rand(0.92, 1.14));
    o.updateMatrix();
    outM.multiplyMatrices(headM, o.matrix);
    headIM.setMatrixAt(i, outM);

    o.position.set(0, 0, 0); o.scale.set(1, 1, 1);
    o.updateMatrix();
    outM.multiplyMatrices(headM, o.matrix);
    faceIM.setMatrixAt(i, outM);

    for (let k = 0; k < PCH; k++) {
      const a = (k / PCH) * 6.283 + rand(-0.035, 0.035);
      const R = 0.328;
      o.position.set(Math.cos(a) * R, 0.034 + rand(-0.012, 0.026), Math.sin(a) * R);
      const up = 0.14 + rand(-0.06, 0.1);
      e.set(-Math.PI / 2 + up, -a - Math.PI / 2, 0, 'YXZ');
      o.rotation.copy(e);
      o.scale.set(rand(0.84, 1.14), rand(0.88, 1.2), 1);
      o.updateMatrix();
      outM.multiplyMatrices(headM, o.matrix);
      petalIM.setMatrixAt(pi, outM);
      petalIM.setColorAt(pi, col.setHex(0xf7c62a).offsetHSL(rand(-0.02, 0.015), rand(-0.06, 0.04), rand(-0.09, 0.06)));
      pi++;
    }

    for (let k = 0; k < LV; k++) {
      const a = (k / LV) * 6.283 + rand(0, 1.2);
      const y = h * rand(0.3, 0.68);
      o.position.set(Math.cos(a) * 0.06, y, Math.sin(a) * 0.06);
      e.set(-1.95 + rand(-0.2, 0.22), a - Math.PI / 2, 0, 'YXZ');
      o.rotation.copy(e);
      const sc = rand(0.72, 1.12) * (1.1 - y / (h * 2.4));
      o.scale.set(sc, sc, 1);
      o.updateMatrix();
      outM.multiplyMatrices(rootM, o.matrix);
      leafIM.setMatrixAt(li, outM);
      leafIM.setColorAt(li, col.setHex(0x4f8030).offsetHSL(rand(-0.03, 0.02), rand(-0.06, 0.06), rand(-0.1, 0.08)));
      li++;
    }
  }

  [stemIM, headIM, faceIM, petalIM, leafIM].forEach(im => {
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = true;
    im.receiveShadow = true;
    scene.add(im);
  });
  petalIM.castShadow = false;
  faceIM.castShadow = false;
  leafIM.castShadow = false;
  Flora.sunflowers = { stemIM, headIM, faceIM, petalIM, leafIM, spots };
}

function _makeGrassMat() {
  const m = new THREE.MeshStandardMaterial({
    map: Tex.texBlade, alphaTest: 0.42, side: THREE.DoubleSide,
    roughness: 1, metalness: 0
  });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = Flora.windU;
    shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       #ifdef USE_INSTANCING
         float wPh = instanceMatrix[3][0] * 0.55 + instanceMatrix[3][2] * 0.38;
         float sway = sin(uTime * 1.55 + wPh) * 0.6 + sin(uTime * 2.7 + wPh * 1.7) * 0.4;
         float amp = max(transformed.y, 0.0);
         transformed.x += sway * amp * 0.30;
         transformed.z += cos(uTime * 1.2 + wPh) * amp * 0.17;
       #endif`
    );
  };
  return m;
}

function buildGrass(scene, count) {
  const matA = _makeGrassMat();
  const geo = new THREE.PlaneGeometry(0.85, 0.75);
  geo.translate(0, 0.375, 0);
  const imA = new THREE.InstancedMesh(geo, matA, count);
  const imB = new THREE.InstancedMesh(geo, matA, count);

  const d = new THREE.Object3D();
  const rot = new THREE.Matrix4();
  const tmp = new THREE.Matrix4();
  const col = new THREE.Color();
  let placed = 0, guard = 0;
  while (placed < count && guard++ < count * 12) {
    const a = rand(0, 6.283);
    const r = rand(2.2, 27);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x) < 2.3 && z > 2.6 && z < 11.5) continue;
    if (Math.abs(x) < 4.6 && z > -3.6 && z < 4.0) continue;
    if (Math.abs(x) < 10 && Math.abs(z) < 4.2) continue;
    const y = groundH(x, z);
    const sc = rand(0.72, 1.6);
    d.position.set(x, y - 0.02, z);
    d.rotation.set(0, rand(0, 6.283), 0);
    d.scale.set(sc * rand(0.8, 1.25), sc, 1);
    d.updateMatrix();
    imA.setMatrixAt(placed, d.matrix);
    imB.setMatrixAt(placed, tmp.multiplyMatrices(d.matrix, rot.makeRotationY(1.5708)));
    const cc = col.setHex(0x86a85a).offsetHSL(rand(-0.03, 0.03), rand(-0.1, 0.08), rand(-0.16, 0.1));
    imA.setColorAt(placed, cc);
    imB.setColorAt(placed, cc);
    placed++;
  }
  imA.count = placed; imB.count = placed;
  imA.instanceMatrix.needsUpdate = true; imB.instanceMatrix.needsUpdate = true;
  if (imA.instanceColor) imA.instanceColor.needsUpdate = true;
  if (imB.instanceColor) imB.instanceColor.needsUpdate = true;
  imA.castShadow = false; imB.castShadow = false;
  imA.receiveShadow = true; imB.receiveShadow = true;
  scene.add(imA); scene.add(imB);
  Flora.grassA = imA; Flora.grassB = imB;
}

function buildFloraDetails(scene) {
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x8d8b82, roughness: 0.95, flatShading: true });
  const rockGeo = new THREE.IcosahedronGeometry(1, 0);
  const places = [
    [-3.4, 6.2, 0.42], [4.1, 8.6, 0.3], [-6.8, 5.0, 0.5], [7.4, 11.5, 0.36],
    [-9.2, 11.0, 0.28], [2.6, 15.2, 0.34], [-2.0, 15.9, 0.26], [6.2, 2.0, 0.22]
  ];
  places.forEach(p => {
    const m = new THREE.Mesh(rockGeo, rockMat);
    m.position.set(p[0], groundH(p[0], p[1]) + p[2] * 0.45, p[1]);
    m.scale.set(p[2] * rand(0.9, 1.4), p[2] * rand(0.6, 0.95), p[2] * rand(0.9, 1.3));
    m.rotation.set(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28));
    m.castShadow = true; m.receiveShadow = true;
    scene.add(m);
  });

  const capMat = new THREE.MeshStandardMaterial({ color: 0xc4402f, roughness: 0.72 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0xf0e8d8, roughness: 0.85 });
  const dotMat = new THREE.MeshStandardMaterial({ color: 0xf6f1e4, roughness: 0.8 });
  const mush = [[-7.6, 4.6, 0.72], [-7.0, 4.2, 0.44], [8.2, 3.0, 0.6], [8.8, 3.6, 0.38], [-4.6, 9.4, 0.5], [10.0, 0.2, 0.46]];
  mush.forEach(mp => {
    const g = new THREE.Group();
    const s = mp[2];
    g.position.set(mp[0], groundH(mp[0], mp[1]), mp[1]);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.08 * s, 0.34 * s, 7), stemMat);
    st.position.y = 0.17 * s;
    st.castShadow = true;
    g.add(st);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24 * s, 12, 8, 0, 6.283, 0, Math.PI / 2), capMat);
    cap.position.y = 0.32 * s;
    cap.scale.y = 0.78;
    cap.castShadow = true;
    g.add(cap);
    for (let i = 0; i < 5; i++) {
      const a = rand(0, 6.28), rr = rand(0.05, 0.2) * s;
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.032 * s, 6, 5), dotMat);
      dot.position.set(Math.cos(a) * rr, 0.33 * s + Math.sqrt(Math.max(0, 0.05 - rr * rr * 1.8)) * s, Math.sin(a) * rr);
      g.add(dot);
    }
    scene.add(g);
  });

  const bushMat = new THREE.MeshStandardMaterial({ color: 0x41702c, roughness: 0.95, flatShading: true });
  const bushGeo = new THREE.IcosahedronGeometry(1, 1);
  [[-11.5, 2.4, 1.05], [12.2, 4.8, 0.9], [-10.4, 14.6, 0.85], [10.8, 14.0, 1.0], [-13.0, 7.4, 0.8]].forEach(bp => {
    const g = new THREE.Group();
    g.position.set(bp[0], groundH(bp[0], bp[1]), bp[1]);
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(bushGeo, bushMat);
      m.position.set(rand(-0.5, 0.5) * bp[2], bp[2] * rand(0.35, 0.7), rand(-0.5, 0.5) * bp[2]);
      const s = bp[2] * rand(0.45, 0.75);
      m.scale.set(s, s * 0.82, s);
      m.rotation.set(rand(0, 6.28), rand(0, 6.28), 0);
      m.castShadow = true;
      g.add(m);
    }
    scene.add(g);
  });

  const flowerGeo = new THREE.SphereGeometry(0.042, 7, 5);
  const flowerCols = [0xe8d9ac, 0xef9fc0, 0xf0c246, 0xc6b0e0, 0xe8825f];
  const N = 56;
  const fIM = new THREE.InstancedMesh(flowerGeo, new THREE.MeshStandardMaterial({ roughness: 0.7 }), N);
  const d = new THREE.Object3D();
  const c = new THREE.Color();
  let k = 0, guard = 0;
  while (k < N && guard++ < 900) {
    const a = rand(0, 6.283), r = rand(3, 24);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x) < 2.4 && z > 2.4 && z < 11.5) continue;
    if (Math.abs(x) < 9 && Math.abs(z) < 3.6) continue;
    d.position.set(x, groundH(x, z) + rand(0.1, 0.24), z);
    d.scale.setScalar(rand(0.7, 1.5));
    d.updateMatrix();
    fIM.setMatrixAt(k, d.matrix);
    fIM.setColorAt(k, c.setHex(flowerCols[k % flowerCols.length]));
    k++;
  }
  fIM.count = k;
  fIM.instanceMatrix.needsUpdate = true;
  if (fIM.instanceColor) fIM.instanceColor.needsUpdate = true;
  scene.add(fIM);
}
