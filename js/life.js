const Life = {
  butterflies: [], bees: [], fireflies: [], birds: [], leaves: null,
  squirrel: null, owl: null, rabbit: null, rain: null, rainU: { value: 0 },
  swayU: { value: 0 }
};

const FUR = {
  orange: new THREE.MeshStandardMaterial({ color: 0xb4652c, roughness: 0.85 }),
  orangeL: new THREE.MeshStandardMaterial({ color: 0xd98b4a, roughness: 0.85 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xf0dfc4, roughness: 0.8 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.6 }),
  beak: new THREE.MeshStandardMaterial({ color: 0xe8a13c, roughness: 0.55 }),
  eye: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.28, metalness: 0.2 })
};

function makeSquirrel() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), FUR.orange);
  body.scale.set(0.86, 1.05, 1.25);
  body.position.y = 0.22;
  body.castShadow = true;
  g.add(body);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), FUR.cream);
  chest.scale.set(0.78, 0.95, 0.7);
  chest.position.set(0, 0.26, 0.14);
  g.add(chest);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 14, 12), FUR.orange);
  head.scale.set(1, 0.95, 0.95);
  head.position.set(0, 0.5, 0.06);
  head.castShadow = true;
  g.add(head);

  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), FUR.cream);
  muzzle.scale.set(1, 0.8, 1.1);
  muzzle.position.set(0, 0.46, 0.19);
  g.add(muzzle);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.026, 7, 6), FUR.dark);
  nose.position.set(0, 0.475, 0.255);
  g.add(nose);

  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 6), FUR.orange);
    ear.position.set(sx * 0.1, 0.62, 0.02);
    ear.rotation.z = -sx * 0.28;
    ear.castShadow = true;
    g.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.09, 6), FUR.cream);
    inner.position.set(sx * 0.1, 0.615, 0.035);
    inner.rotation.z = -sx * 0.28;
    g.add(inner);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), FUR.eye);
    eye.position.set(sx * 0.088, 0.535, 0.135);
    g.add(eye);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.013, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0xffffff }));
    glint.position.set(sx * 0.1, 0.55, 0.163);
    g.add(glint);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), FUR.orangeL);
    paw.scale.set(0.9, 0.7, 1.2);
    paw.position.set(sx * 0.1, 0.14, 0.2);
    g.add(paw);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.058, 8, 6), FUR.orangeL);
    foot.scale.set(0.85, 0.6, 1.4);
    foot.position.set(sx * 0.12, 0.045, 0.1);
    g.add(foot);
  }

  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.16, -0.24),
    new THREE.Vector3(0, 0.5, -0.44),
    new THREE.Vector3(0.02, 0.82, -0.34),
    new THREE.Vector3(0.02, 0.92, -0.06),
    new THREE.Vector3(0.01, 0.78, 0.1)
  ]);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 22, 0.105, 8, false), FUR.orange);
  tail.castShadow = true;
  g.add(tail);
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), FUR.orangeL);
  tailTip.position.set(0.01, 0.78, 0.1);
  g.add(tailTip);
  for (let i = 0; i < 5; i++) {
    const p = tailCurve.getPoint(i / 4);
    const fluff = new THREE.Mesh(new THREE.SphereGeometry(0.115, 9, 7), FUR.orange);
    fluff.position.copy(p);
    fluff.scale.set(1, 1, 0.75);
    g.add(fluff);
  }

  g.userData.tail = tail;
  g.userData.tailTip = tailTip;
  g.userData.head = head;
  g.userData.tailCurve = tailCurve;
  g.userData.fluffs = g.children.filter(c => c.geometry && c.geometry.type === 'SphereGeometry' && c.material === FUR.orange && c.position.z < -0.15);
  return g;
}

function makeBird(colA, colB) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: colA, roughness: 0.8 });
  const wingMat = new THREE.MeshStandardMaterial({ color: colB, roughness: 0.82 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), bodyMat);
  body.scale.set(0.92, 0.95, 1.35);
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.098, 12, 10), bodyMat);
  head.position.set(0, 0.1, 0.13);
  head.castShadow = true;
  g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.095, 6), FUR.beak);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.095, 0.235);
  g.add(beak);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.022, 0.19), wingMat);
  tail.position.set(0, 0.03, -0.2);
  tail.rotation.x = -0.22;
  g.add(tail);
  const wingL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), wingMat);
  wingL.scale.set(0.24, 0.62, 1.15);
  wingL.position.set(-0.11, 0.02, -0.02);
  g.add(wingL);
  const wingR = wingL.clone();
  wingR.position.x = 0.11;
  g.add(wingR);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), FUR.eye);
    eye.position.set(sx * 0.06, 0.13, 0.2);
    g.add(eye);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.009, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    gl.position.set(sx * 0.065, 0.138, 0.219);
    g.add(gl);
  }
  for (const sx of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.06, 5), FUR.beak);
    leg.position.set(sx * 0.045, -0.11, 0.02);
    g.add(leg);
  }
  g.userData = { head, wingL, wingR, tail };
  return g;
}

function makeOwl() {
  const g = new THREE.Group();
  const feather = new THREE.MeshStandardMaterial({ color: 0x8a7156, roughness: 0.92 });
  const featherL = new THREE.MeshStandardMaterial({ color: 0xb59b78, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), feather);
  body.scale.set(0.95, 1.18, 0.9);
  body.position.y = 0.28;
  body.castShadow = true;
  g.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10), featherL);
  belly.scale.set(0.85, 1.05, 0.6);
  belly.position.set(0, 0.26, 0.1);
  g.add(belly);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.215, 14, 12), feather);
  head.scale.set(1.05, 0.95, 0.95);
  head.position.set(0, 0.6, 0);
  head.castShadow = true;
  g.add(head);
  for (const sx of [-1, 1]) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), feather);
    tuft.position.set(sx * 0.14, 0.75, 0);
    tuft.rotation.z = -sx * 0.34;
    g.add(tuft);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), new THREE.MeshStandardMaterial({ color: 0xe8dcc2, roughness: 0.8 }));
    disc.position.set(sx * 0.095, 0.62, 0.185);
    g.add(disc);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.052, 14), FUR.eye);
    pupil.position.set(sx * 0.095, 0.62, 0.19);
    g.add(pupil);
    const gl = new THREE.Mesh(new THREE.CircleGeometry(0.018, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    gl.position.set(sx * 0.112, 0.638, 0.193);
    g.add(gl);
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), feather);
    wing.scale.set(0.35, 1.0, 0.62);
    wing.position.set(sx * 0.24, 0.32, 0);
    g.add(wing);
  }
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.11, 5), FUR.beak);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.545, 0.2);
  g.add(beak);
  const footL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 5), FUR.beak);
  footL.position.set(-0.09, 0.02, 0.05);
  g.add(footL);
  const footR = footL.clone(); footR.position.x = 0.09;
  g.add(footR);
  g.userData = { head, pupils: g.children.filter(c => c.material === FUR.eye) };
  return g;
}

function makeRabbit() {
  const g = new THREE.Group();
  const furM = new THREE.MeshStandardMaterial({ color: 0xc9b8a2, roughness: 0.88 });
  const furL = new THREE.MeshStandardMaterial({ color: 0xf2e8da, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 12), furM);
  body.scale.set(0.95, 1.0, 1.25);
  body.position.y = 0.19;
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 12), furM);
  head.position.set(0, 0.35, 0.12);
  head.castShadow = true;
  g.add(head);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), furL);
  muzzle.position.set(0, 0.32, 0.22);
  muzzle.scale.set(1, 0.85, 1);
  g.add(muzzle);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.022, 7, 6),
    new THREE.MeshStandardMaterial({ color: 0xd88f9a, roughness: 0.6 }));
  nose.position.set(0, 0.335, 0.275);
  g.add(nose);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), furM);
    ear.scale.set(0.62, 2.6, 0.5);
    ear.position.set(sx * 0.06, 0.52, 0.08);
    ear.rotation.z = -sx * 0.16;
    ear.rotation.x = -0.12;
    ear.castShadow = true;
    g.add(ear);
    const earIn = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xe8b8bc, roughness: 0.7 }));
    earIn.scale.set(0.62, 2.5, 0.35);
    earIn.position.set(sx * 0.06, 0.52, 0.105);
    earIn.rotation.z = -sx * 0.16;
    earIn.rotation.x = -0.12;
    g.add(earIn);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 9, 7), FUR.eye);
    eye.position.set(sx * 0.075, 0.385, 0.2);
    g.add(eye);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    gl.position.set(sx * 0.081, 0.395, 0.221);
    g.add(gl);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 9, 7), furL);
    foot.scale.set(0.8, 0.55, 1.7);
    foot.position.set(sx * 0.09, 0.055, 0.1);
    g.add(foot);
  }
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), furL);
  tail.position.set(0, 0.21, -0.21);
  g.add(tail);
  g.userData = { head, ears: [] };
  return g;
}

function wingShapeGeo() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.09, 0.15, 0.30, 0.19, 0.32, 0.05);
  s.bezierCurveTo(0.335, -0.06, 0.18, -0.12, 0.06, -0.055);
  s.bezierCurveTo(0.02, -0.04, 0, -0.02, 0, 0);
  const geo = new THREE.ShapeGeometry(s, 8);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function wingShapeGeoLower() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.07, 0.02, 0.20, -0.02, 0.19, -0.11);
  s.bezierCurveTo(0.17, -0.19, 0.05, -0.14, 0, -0.02);
  const geo = new THREE.ShapeGeometry(s, 8);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function makeButterfly(colorA, colorB) {
  const g = new THREE.Group();
  const wingMat = new THREE.MeshStandardMaterial({
    color: colorA, roughness: 0.55, side: THREE.DoubleSide, transparent: true, opacity: 0.94,
    emissive: new THREE.Color(colorA).multiplyScalar(0.14)
  });
  const wingMatL = new THREE.MeshStandardMaterial({
    color: colorB, roughness: 0.55, side: THREE.DoubleSide, transparent: true, opacity: 0.9
  });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x241c14, roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.013, 0.085, 4, 7), bodyMat);
  body.rotation.x = Math.PI / 2;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), bodyMat);
  head.position.z = 0.075;
  g.add(head);
  for (const sx of [-1, 1]) {
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.075, 4), bodyMat);
    ant.position.set(sx * 0.016, 0.03, 0.095);
    ant.rotation.set(0.5, 0, -sx * 0.42);
    g.add(ant);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.008, 5, 4), bodyMat);
    tip.position.set(sx * 0.032, 0.058, 0.11);
    g.add(tip);
  }

  const upGeo = wingShapeGeo();
  const loGeo = wingShapeGeoLower();
  const mk = (geo, mat, sx) => {
    const pivot = new THREE.Group();
    const m = new THREE.Mesh(geo, mat);
    m.scale.x = sx;
    pivot.add(m);
    g.add(pivot);
    return pivot;
  };
  const upL = mk(upGeo, wingMat, -1);
  const upR = mk(upGeo, wingMat, 1);
  const loL = mk(loGeo, wingMatL, -1);
  const loR = mk(loGeo, wingMatL, 1);
  g.scale.setScalar(1.15);
  g.userData = { upL, upR, loL, loR };
  return g;
}

function makeBee() {
  const g = new THREE.Group();
  const yel = new THREE.MeshStandardMaterial({ color: 0xf2c034, roughness: 0.6 });
  const blk = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.6 });
  const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 8), yel);
  b1.scale.set(0.95, 0.95, 1.1);
  g.add(b1);
  const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), blk);
  b2.position.z = 0.055;
  b2.scale.set(1.01, 1.01, 0.42);
  g.add(b2);
  const b3 = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 8), blk);
  b3.position.z = -0.055;
  b3.scale.set(1.02, 1.02, 0.42);
  g.add(b3);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), blk);
  head.position.z = 0.088;
  g.add(head);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.014, 7, 6), new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.2 }));
  eyeL.position.set(-0.024, 0.012, 0.108);
  g.add(eyeL);
  const eyeR = eyeL.clone(); eyeR.position.x = 0.024;
  g.add(eyeR);
  const sting = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.04, 5), blk);
  sting.rotation.x = -Math.PI / 2;
  sting.position.z = -0.1;
  g.add(sting);

  const wMat = new THREE.MeshStandardMaterial({
    color: 0xeaf4ff, transparent: true, opacity: 0.36, roughness: 0.15,
    metalness: 0.1, side: THREE.DoubleSide, depthWrite: false
  });
  const wGeo = new THREE.CircleGeometry(0.055, 12);
  wGeo.scale(1, 1.7, 1);
  wGeo.rotateX(-Math.PI / 2);
  const wL = new THREE.Mesh(wGeo, wMat);
  wL.position.set(-0.045, 0.035, 0.015);
  g.add(wL);
  const wR = new THREE.Mesh(wGeo, wMat);
  wR.position.set(0.045, 0.035, 0.015);
  g.add(wR);
  g.scale.setScalar(1.55);
  g.userData = { wL, wR };
  return g;
}

function onBranch(tree, idx, drop, out) {
  const b = tree.branches[idx % tree.branches.length];
  const p = b.tip.clone();
  tree.group.localToWorld(p);
  p.y -= drop;
  p.z += out;
  return p;
}

function onTrunk(tree, t, out) {
  const p = tree.curve.getPointAt(t).clone();
  tree.group.localToWorld(p);
  p.z += out;
  p.y -= 0.05;
  return p;
}

function buildCreatures(scene) {
  scene.updateMatrixWorld(true);
  const TR = World.treeRefs || {};

  const sq = makeSquirrel();
  if (TR.squirrelTree) {
    sq.position.copy(onTrunk(TR.squirrelTree, 0.56, 0.5));
    sq.rotation.y = 0.95;
  } else {
    sq.position.set(8.0, 4.2, 1.1);
    sq.rotation.y = 0.95;
  }
  sq.rotation.x = 0.1;
  sq.scale.setScalar(1.45);
  scene.add(sq);
  Life.squirrel = sq;

  const birdData = [
    { tree: TR.back, t: 0.46, br: 1, ry: 0.35, a: 0x3f7fc4, b: 0x2d5f96 },
    { tree: TR.squirrelTree, t: 0.31, br: 3, ry: -0.5, a: 0xc4553f, b: 0x9a3b2c },
    { tree: TR.owlTree, t: 0.68, br: 0, ry: 0.2, a: 0xd8b23f, b: 0xb08c2a }
  ];
  birdData.forEach((bd, i) => {
    const b = makeBird(bd.a, bd.b);
    if (bd.tree) b.position.copy(onBranch(bd.tree, bd.br, 0.55, 0.3));
    else b.position.set(-8.0, 5.0, -2.6);
    b.rotation.y = bd.ry;
    b.userData.phase = i * 2.1;
    b.userData.homeY = b.position.y;
    b.scale.setScalar(1.22);
    scene.add(b);
    Life.birds.push(b);
  });

  const owl = makeOwl();
  if (TR.owlTree) owl.position.copy(onTrunk(TR.owlTree, 0.44, 0.62));
  else owl.position.set(-5.05, 2.4, 8.6);
  owl.rotation.y = 0.55;
  owl.scale.setScalar(1.3);
  scene.add(owl);
  Life.owl = owl;

  const rb = makeRabbit();
  rb.position.set(-4.1, 0.0, 7.2);
  rb.rotation.y = 2.3;
  scene.add(rb);
  Life.rabbit = rb;

  const bColors = [
    [0xf08c2e, 0xd86a18], [0x6f9fe0, 0x4a76b8], [0xf5d05a, 0xdfb23a],
    [0xef8fb4, 0xd06a92], [0xe8dcc0, 0xcabfa4], [0xa87fd8, 0x8257b8]
  ];
  const bSpots = [
    { c: [-3.2, 1.5, 11.4], r: 2.6 }, { c: [3.6, 1.7, 12.8], r: 2.2 },
    { c: [-5.6, 2.0, 8.0], r: 2.4 }, { c: [5.2, 1.4, 7.2], r: 2.8 },
    { c: [0.8, 2.4, 15.2], r: 2.0 }, { c: [-1.6, 1.2, 5.8], r: 1.8 }
  ];
  bSpots.forEach((sp, i) => {
    const col = bColors[i % bColors.length];
    const bf = makeButterfly(col[0], col[1]);
    bf.position.set(sp.c[0], sp.c[1], sp.c[2]);
    bf.userData.t = Math.random() * 100;
    bf.userData.c = sp.c;
    bf.userData.r = sp.r;
    bf.userData.f1 = rand(0.55, 0.95);
    bf.userData.f2 = rand(0.45, 0.8);
    bf.userData.p1 = rand(0, 6.28);
    bf.userData.p2 = rand(0, 6.28);
    bf.userData.flap = rand(8, 13);
    bf.userData.flapPh = rand(0, 6.28);
    bf.userData.vy = rand(0.3, 0.62);
    scene.add(bf);
    Life.butterflies.push(bf);
  });

  for (let i = 0; i < 9; i++) {
    const bee = makeBee();
    const a = rand(0, 6.28), r = rand(1.5, 8);
    const cx = Math.cos(a) * r, cz = 10.4 + Math.sin(a) * r * 0.72;
    bee.position.set(cx, rand(0.9, 2.3), cz);
    bee.userData.t = Math.random() * 100;
    bee.userData.c = [cx, bee.position.y, cz];
    bee.userData.r = rand(0.5, 1.6);
    bee.userData.f = rand(2.2, 4.2);
    bee.userData.ph = rand(0, 6.28);
    bee.userData.flap = rand(38, 52);
    scene.add(bee);
    Life.bees.push(bee);
  }

  const ffMat = new THREE.SpriteMaterial({
    map: Tex.texGlow, color: 0xd8ff9a, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  for (let i = 0; i < 26; i++) {
    const sp = new THREE.Sprite(ffMat.clone());
    sp.scale.setScalar(rand(0.16, 0.36));
    const a = rand(0, 6.28), r = rand(2, 12);
    sp.position.set(Math.cos(a) * r, rand(0.5, 3.2), 8 + Math.sin(a) * r * 0.8);
    sp.userData = { ph: rand(0, 6.28), sp: rand(0.7, 2.0), base: sp.position.clone(), amp: rand(0.25, 0.9) };
    scene.add(sp);
    Life.fireflies.push(sp);
  }

  buildLeaves(scene);
  buildRain(scene);
}

function buildLeaves(scene) {
  const N = 26;
  const geo = new THREE.PlaneGeometry(0.14, 0.1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x9a7b32, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.95
  });
  const im = new THREE.InstancedMesh(geo, mat, N);
  const data = [];
  for (let i = 0; i < N; i++) {
    data.push({
      x: rand(-16, 16), z: rand(-6, 18), y: rand(2, 12),
      vy: rand(0.35, 0.85), ph: rand(0, 6.28), rot: rand(0, 6.28),
      rx: rand(-1, 1), rz: rand(-1, 1), sc: rand(0.7, 1.5)
    });
  }
  im.frustumCulled = false;
  scene.add(im);
  Life.leaves = { im, data, N };
}

function buildRain(scene) {
  const N = 1400;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const off = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = rand(0, 6.283), r = Math.sqrt(Math.random()) * 34;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = rand(0, 34);
    pos[i * 3 + 2] = Math.sin(a) * r;
    off[i] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aOff', new THREE.BufferAttribute(off, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: Life.rainU, uOpacity: { value: 0 } },
    transparent: true, depthWrite: false,
    vertexShader: `
      attribute float aOff; uniform float uTime; varying float vA;
      void main(){
        vec3 p = position;
        float fall = mod(p.y - uTime * 17.0 + aOff * 44.0, 40.0);
        p.y = fall;
        p.x += fall * 0.06;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (260.0 / -mv.z) * 0.55;
        vA = smoothstep(0.0, 3.0, fall) * (1.0 - smoothstep(30.0, 40.0, fall));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uOpacity; varying float vA;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float a = smoothstep(0.5, 0.0, length(vec2(c.x * 3.4, c.y)));
        gl_FragColor = vec4(0.78, 0.86, 0.94, a * vA * uOpacity);
      }`
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.visible = false;
  scene.add(pts);
  Life.rain = pts;
}

function updateCreatures(dt, t, opts) {
  const wind = Flora.windU.value;

  if (Life.squirrel) {
    const s = Life.squirrel;
    s.userData.tail.rotation.z = Math.sin(t * 1.3) * 0.10;
    s.userData.tail.rotation.x = Math.sin(t * 0.9 + 0.6) * 0.06;
    s.userData.head.rotation.y = Math.sin(t * 0.42) * 0.42;
    s.userData.head.rotation.x = Math.sin(t * 0.63 + 1.2) * 0.14;
  }

  Life.birds.forEach((b, i) => {
    const ph = b.userData.phase;
    b.userData.head.rotation.y = Math.sin(t * 1.5 + ph) * 0.55;
    b.userData.head.rotation.x = Math.sin(t * 0.9 + ph * 2) * 0.18;
    const hop = Math.max(0, Math.sin(t * 2.4 + ph * 3.1));
    b.position.y = b.userData.homeY + Math.pow(hop, 5) * 0.11;
    const flap = 0.06 + Math.pow(Math.max(0, Math.sin(t * 3.1 + ph * 2)), 6) * 0.5;
    b.userData.wingL.scale.set(0.24 + flap, 0.62, 1.15);
    b.userData.wingR.scale.set(0.24 + flap, 0.62, 1.15);
    b.rotation.z = Math.sin(t * 1.1 + ph) * 0.05;
  });

  if (Life.owl) {
    const o = Life.owl;
    o.userData.head.rotation.y = Math.sin(t * 0.33) * 0.5;
    o.userData.head.rotation.z = Math.sin(t * 0.24 + 1) * 0.09;
    const blink = (Math.sin(t * 0.9) > 0.985) ? 0.1 : 1;
    o.userData.pupils.forEach(p => { p.scale.y = blink; });
  }

  if (Life.rabbit) {
    const r = Life.rabbit;
    r.userData.head.rotation.y = Math.sin(t * 0.7) * 0.5;
    r.userData.head.position.y = 0.35 + Math.max(0, Math.sin(t * 1.9)) * 0.02;
    r.rotation.y = 2.3 + Math.sin(t * 0.3) * 0.25;
  }

  Life.butterflies.forEach((b, i) => {
    const u = b.userData;
    u.t += dt;
    const tt = u.t;
    const px = u.c[0] + Math.sin(tt * u.f1 + u.p1) * u.r + Math.sin(tt * 1.7) * 0.35;
    const pz = u.c[2] + Math.cos(tt * u.f2 + u.p2) * u.r * 0.86;
    const py = u.c[1] + Math.sin(tt * 1.25 + u.p1 * 2) * u.vy + Math.sin(tt * 3.1) * 0.08;
    const prev = b.position.clone();
    b.position.set(px, Math.max(0.5, py), pz);
    const dx = px - prev.x, dz = pz - prev.z;
    if (Math.abs(dx) + Math.abs(dz) > 0.0001) {
      const targetYaw = Math.atan2(dx, dz);
      let cur = b.rotation.y;
      let diff = ((targetYaw - cur + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      b.rotation.y = cur + diff * Math.min(1, dt * 4);
    }
    b.rotation.z = Math.sin(tt * 2.2) * 0.16;
    const f = (Math.sin(tt * u.flap + u.flapPh) * 0.5 + 0.5);
    const ang = 0.18 + f * 1.05;
    b.userData.upR.rotation.z = -ang;
    b.userData.upL.rotation.z = ang;
    b.userData.loR.rotation.z = -ang * 0.82;
    b.userData.loL.rotation.z = ang * 0.82;
  });

  Life.bees.forEach((b) => {
    const u = b.userData;
    u.t += dt;
    const tt = u.t * u.f;
    const px = u.c[0] + Math.sin(tt + u.ph) * u.r + Math.sin(tt * 2.7) * 0.22;
    const pz = u.c[2] + Math.cos(tt * 1.3 + u.ph) * u.r + Math.cos(tt * 3.1) * 0.18;
    const py = u.c[1] + Math.sin(tt * 1.9 + u.ph) * 0.22;
    const prev = b.position.clone();
    b.position.set(px, py, pz);
    const dx = px - prev.x, dz = pz - prev.z;
    if (Math.abs(dx) + Math.abs(dz) > 0.00001) {
      const ty = Math.atan2(dx, dz);
      let diff = ((ty - b.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      b.rotation.y += diff * Math.min(1, dt * 8);
    }
    b.rotation.x = Math.sin(tt * 2.2) * 0.1;
    const f = Math.sin(t * u.flap);
    b.userData.wL.rotation.z = 0.35 + f * 0.75;
    b.userData.wR.rotation.z = -0.35 - f * 0.75;
  });

  const nightF = opts.firefly;
  Life.fireflies.forEach((sp, i) => {
    const u = sp.userData;
    const tt = t * u.sp + u.ph;
    sp.position.set(
      u.base.x + Math.sin(tt * 0.55) * u.amp,
      u.base.y + Math.sin(tt * 0.8 + 1) * u.amp * 0.7,
      u.base.z + Math.cos(tt * 0.45) * u.amp
    );
    const blink = Math.pow(Math.max(0, Math.sin(tt * 1.6)), 3);
    sp.material.opacity = nightF * (0.25 + blink * 0.75);
    sp.visible = nightF > 0.02;
  });

  if (Life.leaves) {
    const { im, data, N } = Life.leaves;
    const d = new THREE.Object3D();
    const leafFade = opts.leaves;
    im.visible = leafFade > 0.02;
    if (im.visible) {
      for (let i = 0; i < N; i++) {
        const L = data[i];
        L.y -= L.vy * dt;
        L.rot += dt * 1.2;
        if (L.y < 0.12) { L.y = rand(7, 13); L.x = rand(-16, 16); L.z = rand(-6, 18); }
        d.position.set(L.x + Math.sin(t * 0.8 + L.ph) * 0.55, L.y, L.z + Math.cos(t * 0.6 + L.ph) * 0.4);
        d.rotation.set(L.rot * L.rx, L.rot, L.rot * L.rz);
        d.scale.setScalar(L.sc);
        d.updateMatrix();
        im.setMatrixAt(i, d.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
    }
  }
}
