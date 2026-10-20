const World = {
  sky: null, sun: null, sunGlow: null, moon: null,
  stars: null, clouds: [], cabin: null, windows: [], lanterns: [],
  ground: null, smoke: null, skyUniforms: null
};

function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}
function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }

function groundH(x, z) {
  const d = Math.sqrt(x * x + z * z);
  const flat = smoothstep(14, 30, d);
  let h = Math.sin(x * 0.17) * Math.cos(z * 0.14) * 0.6
    + Math.sin(x * 0.061 + z * 0.083) * 0.72
    + Math.sin(x * 0.33 + 1.3) * Math.cos(z * 0.29) * 0.16;
  h *= flat;
  const rim = smoothstep(34, 62, d) * 2.6 + smoothstep(54, 80, d) * 3.4;
  return h + rim;
}

const MAT = {};

function initMaterials() {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  MAT.woodWall = std({ map: Tex.texWoodH, roughness: 0.82, metalness: 0 });
  MAT.woodSide = std({ map: _tex(Tex.wood({ planks: 8 }), 1.4, 1), roughness: 0.82 });
  MAT.woodDark = std({ map: Tex.texWoodV, roughness: 0.8 });
  MAT.woodDoor = std({ map: Tex.texDoor, roughness: 0.74 });
  MAT.beam = std({ color: 0x5f4025, roughness: 0.85 });
  MAT.roof = std({ map: Tex.texRoof, roughness: 0.92, metalness: 0.04 });
  MAT.stone = std({ map: Tex.texStone, roughness: 0.95 });
  MAT.stoneLight = std({ map: Tex.texStone, color: 0xa8a496, roughness: 0.95 });
  MAT.bark = std({ map: Tex.texBark, roughness: 1 });
  MAT.soil = std({ map: Tex.texSoil, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
  MAT.grassG = std({ map: Tex.texGrass, roughness: 1, color: 0xffffff });
  MAT.glass = std({
    color: 0xa8c4d8, emissive: 0xffb65a, emissiveIntensity: 0.55,
    roughness: 0.2, metalness: 0.15, transparent: true, opacity: 0.96
  });
  MAT.glow = new THREE.MeshBasicMaterial({ color: 0xffd08a, transparent: true, opacity: 0.75 });
  MAT.leafA = std({ color: 0x4e7d33, roughness: 0.95, flatShading: true });
  MAT.leafB = std({ color: 0x638f3f, roughness: 0.95, flatShading: true });
  MAT.leafC = std({ color: 0x3d6a2a, roughness: 0.95, flatShading: true });
  MAT.petal = std({ map: Tex.texPetal, roughness: 0.66, side: THREE.DoubleSide, emissive: 0x2a1a00, emissiveIntensity: 0.28 });
  MAT.disc = std({ map: Tex.texSeed, roughness: 0.9 });
  MAT.stem = std({ color: 0x4b7a2f, roughness: 0.9 });
  MAT.leafG = std({ color: 0x4f8030, roughness: 0.85, side: THREE.DoubleSide });
}

function buildSky(scene) {
  const uniforms = {
    cTop: { value: new THREE.Color(0x4a9fe0) },
    cMid: { value: new THREE.Color(0x9fd0f0) },
    cBot: { value: new THREE.Color(0xdfeef0) },
    uSun: { value: new THREE.Vector3(0.4, 0.55, 0.6) },
    uGlow: { value: 0.5 }
  };
  World.skyUniforms = uniforms;

  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 cTop; uniform vec3 cMid; uniform vec3 cBot; uniform vec3 uSun; uniform float uGlow;
      varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(cBot, cMid, smoothstep(-0.06, 0.22, h));
        col = mix(col, cTop, smoothstep(0.16, 0.78, h));
        float sd = max(dot(d, normalize(uSun)), 0.0);
        col += vec3(1.0, 0.86, 0.62) * pow(sd, 8.0) * uGlow * 0.55;
        col += vec3(1.0, 0.9, 0.72) * pow(sd, 220.0) * uGlow * 1.6;
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(280, 40, 24), mat);
  sky.frustumCulled = false;
  scene.add(sky);
  World.sky = sky;

  const starGeo = new THREE.BufferGeometry();
  const SN = 1300;
  const sp = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) {
    const u = Math.random() * 2 - 1;
    const th = Math.random() * 6.2832;
    const rr = 246;
    const sr = Math.sqrt(1 - u * u);
    sp[i * 3] = Math.cos(th) * sr * rr;
    sp[i * 3 + 1] = u * rr;
    sp[i * 3 + 2] = Math.sin(th) * sr * rr;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({
    size: 3.3, map: Tex.texDot, transparent: true, opacity: 0,
    sizeAttenuation: false, blending: THREE.AdditiveBlending,
    depthWrite: false, depthTest: false, fog: false
  });
  const stars = new THREE.Points(starGeo, starMat);
  stars.frustumCulled = false;
  scene.add(stars);
  World.stars = stars;

  const sunSpr = new THREE.Sprite(new THREE.SpriteMaterial({
    map: Tex.texGlow, color: 0xfff3d0, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, fog: false
  }));
  sunSpr.scale.set(26, 26, 1);
  scene.add(sunSpr);
  World.sun = sunSpr;

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 20, 14),
    new THREE.MeshBasicMaterial({ color: 0xf2f4ee, transparent: true, opacity: 0, fog: false })
  );
  scene.add(moon);
  World.moon = moon;

  for (let i = 0; i < 16; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: Tex.texCloud, transparent: true, opacity: 0.55, depthWrite: false, fog: false
    }));
    const a = rand(0, Math.PI * 2), r = rand(60, 150);
    s.position.set(Math.cos(a) * r, rand(28, 62), Math.sin(a) * r);
    const w = rand(34, 78);
    s.scale.set(w, w * rand(0.34, 0.52), 1);
    s.userData = { sp: rand(0.35, 1.1), base: s.position.clone(), op: rand(0.32, 0.72) };
    scene.add(s);
    World.clouds.push(s);
  }
}

function buildGround(scene) {
  const size = 170, seg = 150;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = groundH(x, z);
    pos.setY(i, y);
    const t = clamp(y / 8, 0, 1);
    const c = new THREE.Color().setHSL(
      0.245 + rand(-0.018, 0.018),
      0.40 - t * 0.14,
      0.30 + t * 0.10 + rand(-0.02, 0.03)
    );
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const matGrass = new THREE.MeshStandardMaterial({
    map: Tex.texGrass, vertexColors: true, roughness: 1, metalness: 0
  });
  const ground = new THREE.Mesh(geo, matGrass);
  ground.receiveShadow = true;
  scene.add(ground);
  World.ground = ground;
  World.groundMat = matGrass;

  const patchGeo = new THREE.CircleGeometry(1, 72);
  patchGeo.rotateX(-Math.PI / 2);
  const patch = new THREE.Mesh(patchGeo, MAT.soil);
  patch.scale.set(9.6, 1, 7.4);
  patch.position.set(0, 0.022, 9.4);
  patch.receiveShadow = true;
  scene.add(patch);
  World.soilPatch = patch;

  const patchGeo2 = new THREE.CircleGeometry(1, 48);
  patchGeo2.rotateX(-Math.PI / 2);
  const patch2 = new THREE.Mesh(patchGeo2, MAT.soil.clone());
  patch2.material.map = null;
  patch2.material.color = new THREE.Color(0x6b5a44);
  patch2.material.opacity = 1;
  patch2.scale.set(4.2, 1, 3.1);
  patch2.position.set(7.6, 0.021, 3.2);
  patch2.receiveShadow = true;
  scene.add(patch2);
}

function _box(w, h, d, mat, x, y, z, parent, cast, recv) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = cast !== false;
  m.receiveShadow = recv !== false;
  parent.add(m);
  return m;
}

function buildCabin(scene) {
  const cabin = new THREE.Group();
  cabin.position.set(0, 0, 0);
  scene.add(cabin);
  World.cabin = cabin;

  const W = 8.4, D = 6.4, baseH = 0.55, wallH = 4.0;
  const wallTop = baseH + wallH;

  _box(W + 0.7, baseH, D + 0.7, MAT.stone, 0, baseH / 2, 0, cabin);

  const walls = new THREE.Group();
  walls.position.y = baseH;
  cabin.add(walls);

  const front = _box(W, wallH, 0.24, MAT.woodWall, 0, wallH / 2, D / 2, walls);
  front.material = MAT.woodWall;
  _box(W, wallH, 0.24, MAT.woodWall, 0, wallH / 2, -D / 2, walls);
  const sideL = _box(0.24, wallH, D, MAT.woodSide, -W / 2, wallH / 2, 0, walls);
  const sideR = _box(0.24, wallH, D, MAT.woodSide, W / 2, wallH / 2, 0, walls);

  for (let i = 0; i < 5; i++) {
    const y = 0.42 + i * 0.82;
    _box(W + 0.12, 0.07, 0.1, MAT.beam, 0, y, D / 2 + 0.13, walls, false);
    _box(W + 0.12, 0.07, 0.1, MAT.beam, 0, y, -D / 2 - 0.13, walls, false);
    _box(0.1, 0.07, D, MAT.beam, -W / 2 - 0.13, y, 0, walls, false);
    _box(0.1, 0.07, D, MAT.beam, W / 2 + 0.13, y, 0, walls, false);
  }

  for (const sx of [-1, 1]) {
    _box(0.22, wallH, 0.22, MAT.woodDark, sx * (W / 2 - 0.14), wallH / 2, D / 2 + 0.06, walls);
    _box(0.22, wallH, 0.22, MAT.woodDark, sx * (W / 2 - 0.14), wallH / 2, -D / 2 - 0.06, walls);
  }

  const gShape = new THREE.Shape();
  gShape.moveTo(-W / 2, 0);
  gShape.lineTo(W / 2, 0);
  gShape.lineTo(0, 2.62);
  gShape.closePath();
  const gHole = new THREE.Path();
  gHole.absarc(0, 0.92, 0.44, 0, Math.PI * 2, true);
  gShape.holes.push(gHole);

  for (const sz of [1, -1]) {
    const gg = new THREE.ExtrudeGeometry(gShape, { depth: 0.24, bevelEnabled: false });
    const gable = new THREE.Mesh(gg, MAT.woodWall);
    gable.position.set(0, wallTop, sz * (D / 2) - (sz > 0 ? 0.24 : 0));
    gable.castShadow = true; gable.receiveShadow = true;
    cabin.add(gable);
  }

  const atticGlass = new THREE.Mesh(new THREE.CircleGeometry(0.44, 24), MAT.glass.clone());
  atticGlass.position.set(0, wallTop + 0.92, D / 2 - 0.235);
  cabin.add(atticGlass);
  World.windows.push(atticGlass);

  const atticFrame = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.05, 8, 26), MAT.beam);
  atticFrame.position.set(0, wallTop + 0.92, D / 2 - 0.22);
  cabin.add(atticFrame);

  const pitch = Math.atan2(2.62, W / 2 + 0.85);
  const slope = Math.sqrt(Math.pow(W / 2 + 0.85, 2) + Math.pow(2.62, 2));
  for (const sx of [-1, 1]) {
    const roof = _box(slope, 0.24, D + 1.6, MAT.roof, sx * (W / 2 + 0.85) / 2, wallTop + 1.31, 0, cabin);
    roof.rotation.z = -sx * pitch;
    const eave = _box(slope, 0.16, 0.2, MAT.beam, sx * (W / 2 + 0.85) / 2, wallTop + 1.31 - 0.12, D / 2 + 0.78, cabin);
    eave.rotation.z = -sx * pitch;
    const eave2 = _box(slope, 0.16, 0.2, MAT.beam, sx * (W / 2 + 0.85) / 2, wallTop + 1.31 - 0.12, -D / 2 - 0.78, cabin);
    eave2.rotation.z = -sx * pitch;
  }
  const ridge = _box(0.42, 0.26, D + 1.66, MAT.roof, 0, wallTop + 2.66, 0, cabin);
  ridge.material = MAT.roof;

  const chimney = _box(1.15, 3.7, 1.15, MAT.stone, 2.35, wallTop + 1.15, -1.7, cabin);
  _box(1.38, 0.18, 1.38, MAT.stoneLight, 2.35, wallTop + 3.05, -1.7, cabin);
  const chimTop = new THREE.Vector3(2.35, wallTop + 3.15, -1.7);
  World.chimneyTop = chimTop;

  for (const sx of [-2.55, 2.55]) {
    makeWindow(cabin, sx, baseH + 2.45, D / 2 + 0.08, 0);
  }
  makeWindow(cabin, -W / 2 - 0.08, baseH + 2.45, 0, -Math.PI / 2);
  makeWindow(cabin, W / 2 + 0.08, baseH + 2.45, 0, Math.PI / 2);

  makeDoor(cabin, 0, baseH, D / 2 + 0.08);

  const deckY = 0.46;
  _box(4.4, 0.2, 2.3, MAT.stone, 0, deckY - 0.1, D / 2 + 1.15, cabin);
  _box(2.9, 0.17, 0.42, MAT.stone, 0, 0.3, D / 2 + 2.42, cabin);
  _box(3.3, 0.16, 0.44, MAT.stone, 0, 0.14, D / 2 + 2.86, cabin);

  makeLantern(cabin, 1.72, baseH + 2.82, D / 2 + 0.5);
  makeLantern(cabin, -1.72, baseH + 2.82, D / 2 + 0.5);

  _box(2.3, 0.74, 0.1, MAT.woodDark, 0, baseH + 3.28, D / 2 + 0.1, cabin);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.06, 0.64),
    new THREE.MeshStandardMaterial({ map: Tex.texSign, roughness: 0.8 }));
  sign.position.set(0, baseH + 3.28, D / 2 + 0.17);
  cabin.add(sign);

  buildPile(cabin, -5.3, 0, 2.2);
  buildBarrel(cabin, 5.0, 0, 2.6);
  buildBarrel(cabin, 5.9, 0, 1.5, 0.78);
}

function makeWindow(parent, x, y, z, rotY) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
  const fw = 1.5, fh = 1.72, t = 0.1;
  _box(fw, t, 0.16, MAT.woodDark, 0, fh / 2 - t / 2, 0, g);
  _box(fw, t, 0.16, MAT.woodDark, 0, -fh / 2 + t / 2, 0, g);
  _box(t, fh, 0.16, MAT.woodDark, -fw / 2 + t / 2, 0, 0, g);
  _box(t, fh, 0.16, MAT.woodDark, fw / 2 - t / 2, 0, 0, g);

  const glass = new THREE.Mesh(new THREE.PlaneGeometry(fw - 0.18, fh - 0.18), MAT.glass.clone());
  glass.position.z = 0.02;
  g.add(glass);
  World.windows.push(glass);

  _box(0.055, fh - 0.16, 0.07, MAT.beam, 0, 0, 0.055, g, false);
  _box(fw - 0.16, 0.055, 0.07, MAT.beam, 0, 0.08, 0.055, g, false);

  _box(fw + 0.28, 0.11, 0.36, MAT.woodDark, 0, -fh / 2 - 0.06, 0.16, g);

  const box = _box(fw + 0.05, 0.3, 0.3, MAT.woodDark, 0, -fh / 2 - 0.24, 0.2, g);
  const soilTop = _box(fw - 0.02, 0.04, 0.24, MAT.soil, 0, -fh / 2 - 0.09, 0.2, g, false);
  const flowerCols = [0xe8607a, 0xf2a4c0, 0xf7f2e8, 0xe8a13c, 0xc86fa8];
  for (let i = 0; i < 9; i++) {
    const fx = rand(-fw / 2 + 0.14, fw / 2 - 0.14);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, rand(0.12, 0.2), 4), MAT.stem);
    stem.position.set(fx, -fh / 2 - 0.04 + stem.geometry.parameters.height / 2, rand(0.12, 0.28));
    g.add(stem);
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(rand(0.045, 0.075), 8, 6),
      new THREE.MeshStandardMaterial({ color: flowerCols[i % flowerCols.length], roughness: 0.7 }));
    bloom.position.set(fx, stem.position.y + stem.geometry.parameters.height / 2 + 0.03, stem.position.z);
    bloom.castShadow = true;
    g.add(bloom);
  }
}

function makeDoor(parent, x, baseH, z) {
  const g = new THREE.Group();
  g.position.set(x, baseH, z);
  parent.add(g);
  const dw = 1.62, dh = 2.62, t = 0.13;
  _box(dw, dh, t, MAT.woodDoor, 0, dh / 2, 0, g);
  _box(t * 1.25, dh + 0.1, 0.18, MAT.woodDark, -dw / 2 - 0.03, dh / 2, 0.02, g);
  _box(t * 1.25, dh + 0.1, 0.18, MAT.woodDark, dw / 2 + 0.03, dh / 2, 0.02, g);
  _box(dw + 0.32, 0.18, 0.2, MAT.woodDark, 0, dh + 0.05, 0.02, g);

  _box(dw - 0.3, 0.06, 0.04, MAT.beam, 0, dh * 0.62, t / 2 + 0.01, g, false);
  _box(dw - 0.3, 0.06, 0.04, MAT.beam, 0, dh * 0.3, t / 2 + 0.01, g, false);

  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xb98a3c, roughness: 0.32, metalness: 0.85 }));
  knob.position.set(dw * 0.32, dh * 0.46, t / 2 + 0.06);
  knob.castShadow = true;
  g.add(knob);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 6, 18),
    new THREE.MeshStandardMaterial({ color: 0x8f6a2c, roughness: 0.4, metalness: 0.8 }));
  ring.position.set(dw * 0.32, dh * 0.33, t / 2 + 0.05);
  g.add(ring);

}

function makeLantern(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 5), MAT.beam);
  hook.position.y = 0.26;
  g.add(hook);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.12, 8), MAT.beam);
  cap.position.y = 0.11;
  g.add(cap);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.2),
    new THREE.MeshStandardMaterial({
      color: 0xffe3b0, emissive: 0xffa63c, emissiveIntensity: 1.2,
      transparent: true, opacity: 0.92, roughness: 0.5
    }));
  body.position.y = -0.04;
  g.add(body);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.24), MAT.beam);
  base.position.y = -0.18;
  g.add(base);
  const pl = new THREE.PointLight(0xffb257, 0, 7, 2);
  pl.position.y = -0.04;
  g.add(pl);
  World.lanterns.push({ light: pl, body });
}

function buildPile(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const logMat = MAT.woodDark;
  for (let row = 0; row < 3; row++) {
    const n = 3 - row;
    for (let i = 0; i < n; i++) {
      const r = 0.17;
      const log = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.94, rand(1.1, 1.5), 8), logMat);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = rand(-0.08, 0.08);
      log.position.set(rand(-0.08, 0.08), r + row * r * 1.72, (i - (n - 1) / 2) * r * 2.05);
      log.castShadow = true; log.receiveShadow = true;
      g.add(log);
    }
  }
}

function buildBarrel(parent, x, y, z, sc) {
  sc = sc || 1;
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(sc);
  parent.add(g);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.86, 14, 1), MAT.woodSide);
  body.position.y = 0.43;
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.55, metalness: 0.7 });
  for (const yy of [0.16, 0.7]) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.028, 5, 22), metalMat);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.y = yy;
    hoop.scale.set(1, 1, 1);
    g.add(hoop);
    hoop.scale.set(1.02, 1.02, 1);
  }
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.05, 14), MAT.woodDark);
  top.position.y = 0.86;
  g.add(top);
}

function buildStonePath(scene) {
  const g = new THREE.Group();
  scene.add(g);
  const stoneMat = MAT.stoneLight.clone();
  stoneMat.color = new THREE.Color(0xb8b3a6);
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const z = 5.75 + t * 4.2;
    const x = Math.sin(t * 3.1) * 0.32;
    const geo = new THREE.CylinderGeometry(rand(0.34, 0.48), rand(0.36, 0.5), 0.1, 7);
    const m = new THREE.Mesh(geo, stoneMat);
    m.position.set(x, 0.05 + rand(0, 0.015), z);
    m.rotation.y = rand(0, 6.28);
    m.scale.set(1, 1, rand(0.7, 1.1));
    m.receiveShadow = true; m.castShadow = false;
    g.add(m);
  }
  World.pathGroup = g;
}

function buildSmoke(scene) {
  const N = 34;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const phases = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
    sizes[i] = rand(0.6, 1.5);
    phases[i] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTex: { value: Tex.texCloud },
      uOpacity: { value: 0.26 },
      uColor: { value: new THREE.Color(0xd6d8da) }
    },
    transparent: true, depthWrite: false,
    vertexShader: `
      attribute float aSize; attribute float aPhase;
      uniform float uTime;
      varying float vA;
      void main(){
        float life = fract(aPhase + uTime * 0.035);
        vec3 p = position;
        p.y += life * 5.4;
        p.x += sin(life * 5.0 + aPhase * 12.0) * (0.35 + life * 1.5);
        p.z += cos(life * 4.2 + aPhase * 9.0) * (0.3 + life * 1.1);
        vA = smoothstep(0.0, 0.16, life) * (1.0 - smoothstep(0.42, 1.0, life));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aSize * (9.0 + life * 26.0) * (72.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D uTex; uniform float uOpacity; uniform vec3 uColor;
      varying float vA;
      void main(){
        vec4 t = texture2D(uTex, gl_PointCoord);
        gl_FragColor = vec4(uColor, t.a * vA * uOpacity);
      }`
  });
  const pts = new THREE.Points(geo, mat);
  pts.position.copy(World.chimneyTop);
  pts.frustumCulled = false;
  scene.add(pts);
  World.smoke = pts;
}
