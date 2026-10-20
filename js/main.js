const IS_MOBILE = /Android|iPhone|iPad|iPod|HarmonyOS|Mobile/i.test(navigator.userAgent) || window.innerWidth < 820;
const PORTRAIT = window.innerWidth / window.innerHeight < 0.85;
const LOW = { pixelRatio: Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.7 : 2), shadow: IS_MOBILE ? 1024 : 2048 };

let renderer, scene, camera, clock;
let hemiLight, dirLight, ambLight;
let controls, Cur, weatherKey = 'sunny';

const C = (hex) => new THREE.Color(hex);

const PRESETS = {
  sunny: {
    skyTop: 0x1a63b4, skyMid: 0x56a4dc, skyBot: 0x9cc8e2,
    sunColor: 0xfff8ea, sunIntensity: 4.1, sunPos: [-30, 44, 24],
    hemiSky: 0xc4e6ff, hemiGround: 0x7fa05c, hemiInt: 1.78,
    ambColor: 0xb4d2ea, ambInt: 0.5,
    fogColor: 0xa8cbe0, fogDensity: 0.0105,
    exposure: 1.16, sunOpacity: 0.95, sunScale: 30,
    starOpacity: 0, moonOpacity: 0,
    cloudColor: 0xffffff, cloudOpacity: 0.70,
    glassGlow: 0.14, lantern: 0,
    firefly: 0, rain: 0, leaves: 1, smoke: 0.26,
    groundTint: 0xffffff
  },
  foggy: {
    skyTop: 0x93a5ab, skyMid: 0xbcc7c8, skyBot: 0xd2d8d2,
    sunColor: 0xe4ecec, sunIntensity: 1.55, sunPos: [-12, 32, 30],
    hemiSky: 0xd9e2e2, hemiGround: 0x74855f, hemiInt: 1.45,
    ambColor: 0xd2dcd9, ambInt: 0.55,
    fogColor: 0xcbd4d0, fogDensity: 0.034,
    exposure: 1.1, sunOpacity: 0.16, sunScale: 46,
    starOpacity: 0, moonOpacity: 0,
    cloudColor: 0xdfe6e4, cloudOpacity: 0.12,
    glassGlow: 0.45, lantern: 0.3,
    firefly: 0, rain: 0, leaves: 0.45, smoke: 0.42,
    groundTint: 0xc6cfc2
  },
  sunset: {
    skyTop: 0x2a4e83, skyMid: 0xe08a58, skyBot: 0xf7c785,
    sunColor: 0xffab5e, sunIntensity: 3.6, sunPos: [-52, 9, 18],
    hemiSky: 0xf3b888, hemiGround: 0x4c5a3e, hemiInt: 1.25,
    ambColor: 0xd79a76, ambInt: 0.46,
    fogColor: 0xe8b183, fogDensity: 0.014,
    exposure: 1.2, sunOpacity: 1.0, sunScale: 44,
    starOpacity: 0.08, moonOpacity: 0,
    cloudColor: 0xffd0a4, cloudOpacity: 0.85,
    glassGlow: 1.1, lantern: 0.9,
    firefly: 0.25, rain: 0, leaves: 0.8, smoke: 0.55,
    groundTint: 0xf0d4b4
  },
  night: {
    skyTop: 0x0a1430, skyMid: 0x18294a, skyBot: 0x263a5e,
    sunColor: 0x9cb8e8, sunIntensity: 0.7, sunPos: [40, 56, -42],
    hemiSky: 0x4e74aa, hemiGround: 0x1e2a1c, hemiInt: 0.68,
    ambColor: 0x3f5c8c, ambInt: 0.44,
    fogColor: 0x1a2436, fogDensity: 0.020,
    exposure: 1.42, sunOpacity: 0, sunScale: 20,
    starOpacity: 1, moonOpacity: 1,
    cloudColor: 0x1b2536, cloudOpacity: 0.14,
    glassGlow: 2.6, lantern: 1.5,
    firefly: 1, rain: 0, leaves: 0.3, smoke: 0.34,
    groundTint: 0x8a96ac
  },
  rain: {
    skyTop: 0x3d525f, skyMid: 0x63757e, skyBot: 0x8a99a0,
    sunColor: 0xc2d0d6, sunIntensity: 1.55, sunPos: [16, 38, 26],
    hemiSky: 0x9aaab4, hemiGround: 0x4c5a42, hemiInt: 1.38,
    ambColor: 0xa8b6bd, ambInt: 0.6,
    fogColor: 0x8b98a2, fogDensity: 0.030,
    exposure: 1.14, sunOpacity: 0.06, sunScale: 40,
    starOpacity: 0, moonOpacity: 0,
    cloudColor: 0x646f78, cloudOpacity: 0.85,
    glassGlow: 1.4, lantern: 1.1,
    firefly: 0, rain: 1, leaves: 0.2, smoke: 0.4,
    groundTint: 0x9aa6a4
  }
};

const NUMK = ['sunIntensity', 'hemiInt', 'ambInt', 'fogDensity', 'exposure',
  'sunOpacity', 'sunScale', 'starOpacity', 'moonOpacity', 'cloudOpacity',
  'glassGlow', 'lantern', 'firefly', 'rain', 'leaves', 'smoke'];
const COLK = ['skyTop', 'skyMid', 'skyBot', 'sunColor', 'hemiSky', 'hemiGround',
  'ambColor', 'fogColor', 'cloudColor', 'groundTint'];
const VECK = ['sunPos'];

function clonePreset(p) {
  const o = {};
  NUMK.forEach(k => o[k] = p[k]);
  COLK.forEach(k => o[k] = C(p[k]));
  VECK.forEach(k => o[k] = new THREE.Vector3().fromArray(p[k]));
  return o;
}

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: !IS_MOBILE, powerPreference: 'high-performance' });
  renderer.setPixelRatio(LOW.pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.getElementById('stage').appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xd3e6ee, 0.0062);

  camera = new THREE.PerspectiveCamera(PORTRAIT ? 58 : 54, window.innerWidth / window.innerHeight, 0.1, 420);

  clock = new THREE.Clock();

  initMaterials();
  buildSky(scene);
  buildGround(scene);
  buildCabin(scene);
  buildStonePath(scene);
  buildNearTrees(scene);
  buildForest(scene);
  buildFloraDetails(scene);
  buildSunflowers(scene, IS_MOBILE ? 52 : 78);
  buildGrass(scene, IS_MOBILE ? 820 : 1900);
  buildCreatures(scene);
  buildSmoke(scene);

  hemiLight = new THREE.HemisphereLight(0xc4e6ff, 0x6f9250, 1.15);
  scene.add(hemiLight);

  ambLight = new THREE.AmbientLight(0xa9c9e6, 0.3);
  scene.add(ambLight);

  dirLight = new THREE.DirectionalLight(0xfff2cc, 3.6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(LOW.shadow, LOW.shadow);
  const sc = dirLight.shadow.camera;
  sc.left = -26; sc.right = 26; sc.top = 26; sc.bottom = -26;
  sc.near = 1; sc.far = 160;
  dirLight.shadow.bias = -0.0004;
  dirLight.shadow.normalBias = 0.035;
  dirLight.shadow.radius = 3;
  scene.add(dirLight);
  scene.add(dirLight.target);
  dirLight.target.position.set(0, 1.5, 4);

  Cur = clonePreset(PRESETS.sunny);
  controls = {
    theta: 0.30, phi: PORTRAIT ? 1.06 : 1.22, radius: IS_MOBILE ? (PORTRAIT ? 32 : 26) : 21,
    tTheta: 0.30, tPhi: PORTRAIT ? 1.06 : 1.22, tRadius: IS_MOBILE ? (PORTRAIT ? 32 : 26) : 21,
    tx: 0, ty: 3.0, tz: 4.6, target: new THREE.Vector3(0, 3.0, 4.6)
  };
  applyState(0);

  bindPointer();
  bindUI();
  window.addEventListener('resize', onResize);
  animate();
}

function applyState(dt) {
  const k = dt === 0 ? 1 : 1 - Math.exp(-dt * 2.4);
  const p = PRESETS[weatherKey];

  NUMK.forEach(key => { Cur[key] = lerp(Cur[key], p[key], k); });
  COLK.forEach(key => { Cur[key].lerp(C(p[key]), k); });
  for (let i = 0; i < 3; i++) Cur.sunPos.setComponent(i, lerp(Cur.sunPos.getComponent(i), p.sunPos[i], k));

  const u = World.skyUniforms;
  u.cTop.value.copy(Cur.skyTop);
  u.cMid.value.copy(Cur.skyMid);
  u.cBot.value.copy(Cur.skyBot);

  scene.fog.color.copy(Cur.fogColor);
  scene.fog.density = Cur.fogDensity;

  const dirN = Cur.sunPos.clone().normalize();
  u.uSun.value.copy(dirN);
  u.uGlow.value = Cur.sunOpacity * 0.9;

  World.sun.position.copy(dirN.clone().multiplyScalar(238));
  World.sun.material.opacity = Cur.sunOpacity;
  World.sun.scale.setScalar(Cur.sunScale);
  World.sun.material.color.copy(Cur.sunColor);

  World.stars.material.opacity = Cur.starOpacity;
  const moonDir = new THREE.Vector3(0.45, 0.62, -0.64).normalize();
  World.moon.position.copy(moonDir.multiplyScalar(232));
  World.moon.material.opacity = Cur.moonOpacity * 0.95;
  World.moon.visible = Cur.moonOpacity > 0.02;

  dirLight.color.copy(Cur.sunColor);
  dirLight.intensity = Cur.sunIntensity;
  dirLight.position.copy(Cur.sunPos.clone().normalize().multiplyScalar(62));
  hemiLight.color.copy(Cur.hemiSky);
  hemiLight.groundColor.copy(Cur.hemiGround);
  hemiLight.intensity = Cur.hemiInt;
  ambLight.color.copy(Cur.ambColor);
  ambLight.intensity = Cur.ambInt;

  renderer.toneMappingExposure = Cur.exposure;

  World.clouds.forEach(c => {
    c.material.color.copy(Cur.cloudColor);
    c.material.opacity = Cur.cloudOpacity * c.userData.op;
  });

  World.windows.forEach(w => { w.material.emissiveIntensity = Cur.glassGlow; });
  World.lanterns.forEach(l => {
    l.light.intensity = Cur.lantern * 3.4;
    l.body.material.emissiveIntensity = 0.5 + Cur.lantern * 2.6;
  });

  Life.rain.material.uniforms.uOpacity.value = Cur.rain * 0.8;
  Life.rain.visible = Cur.rain > 0.02;
  if (World.smoke) World.smoke.material.uniforms.uOpacity.value = Cur.smoke;

  if (World.groundMat) World.groundMat.color.copy(Cur.groundTint);
}

function bindUI() {
  document.querySelectorAll('.wbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('on')) return;
      document.querySelectorAll('.wbtn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      weatherKey = btn.dataset.weather;
      idleTimer = 0;
    });
  });
  const hint = document.getElementById('hint');
  hint.textContent = IS_MOBILE ? '单指旋转 · 双指缩放' : '拖动旋转 · 滚轮缩放';
}

let idleTimer = 0;
let userActive = false;

function bindPointer() {
  const el = renderer.domElement;
  const stage = document.getElementById('stage');
  const pointers = new Map();
  let lastPinch = 0;
  let lastMove = 0;

  const arr = () => Array.from(pointers.values());

  el.addEventListener('pointerdown', e => {
    el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    stage.classList.add('dragging');
    userActive = true;
    lastMove = performance.now();
    idleTimer = 0;
    if (pointers.size === 2) lastPinch = dist2(arr());
  });

  el.addEventListener('pointermove', e => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    lastMove = performance.now();
    idleTimer = 0;

    if (pointers.size === 1) {
      controls.tTheta -= dx * 0.0055;
      controls.tPhi = clamp(controls.tPhi - dy * 0.0045, 0.36, 1.42);
    } else if (pointers.size >= 2) {
      const d = dist2(arr());
      if (lastPinch > 0) {
        controls.tRadius = clamp(controls.tRadius * (lastPinch / d), 7.5, 34);
      }
      lastPinch = d;
    }
  });

  const end = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) lastPinch = 0;
    if (pointers.size === 0) {
      stage.classList.remove('dragging');
      setTimeout(() => { userActive = false; }, 280);
    }
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('pointerleave', end);

  el.addEventListener('wheel', e => {
    e.preventDefault();
    controls.tRadius = clamp(controls.tRadius * (1 + Math.sign(e.deltaY) * 0.085), 7.5, 34);
    idleTimer = 0;
  }, { passive: false });

  function dist2(a) {
    const dx = a[0].x - a[1].x, dy = a[0].y - a[1].y;
    return Math.sqrt(dx * dx + dy * dy) || 1;
  }
}

function onResize() {
  const asp = window.innerWidth / window.innerHeight;
  camera.aspect = asp;
  camera.fov = asp < 0.85 ? 58 : 54;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

let fpsT = 0, fpsN = 0, degraded = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  idleTimer += dt;
  if (idleTimer > 6 && !userActive) {
    controls.tTheta += dt * 0.038;
  }

  controls.theta = lerp(controls.theta, controls.tTheta, 1 - Math.exp(-dt * 7));
  controls.phi = lerp(controls.phi, controls.tPhi, 1 - Math.exp(-dt * 7));
  controls.radius = lerp(controls.radius, controls.tRadius, 1 - Math.exp(-dt * 5));

  const sp = Math.sin(controls.phi), cp = Math.cos(controls.phi);
  camera.position.set(
    controls.target.x + controls.radius * sp * Math.sin(controls.theta),
    controls.target.y + controls.radius * cp,
    controls.target.z + controls.radius * sp * Math.cos(controls.theta)
  );
  camera.lookAt(controls.target);

  Flora.windU.value = t;
  Life.rainU.value = t;
  if (World.smoke) World.smoke.material.uniforms.uTime.value = t;

  World.clouds.forEach(c => {
    c.position.x += c.userData.sp * dt;
    if (c.position.x > 170) c.position.x = -170;
  });

  applyState(dt);

  updateCreatures(dt, t, {
    firefly: Cur.firefly,
    leaves: Cur.leaves,
    rain: Cur.rain
  });

  if (World.stars) World.stars.rotation.y = t * 0.004;

  renderer.render(scene, camera);

  fpsT += dt; fpsN++;
  if (fpsT > 2.5) {
    const fps = fpsN / fpsT;
    if (fps < 42 && degraded < 2) {
      degraded++;
      if (degraded === 1) {
        renderer.setPixelRatio(Math.min(1.2, window.devicePixelRatio));
      } else {
        renderer.shadowMap.enabled = false;
        scene.traverse(o => { if (o.isMesh) o.castShadow = false; });
      }
    }
    fpsT = 0; fpsN = 0;
  }
}

function boot() {
  const bar = document.querySelector('.ldbar i');
  const loader = document.getElementById('loader');
  bar.style.width = '26%';
  setTimeout(() => { bar.style.width = '58%'; }, 120);

  requestAnimationFrame(() => {
    try {
      init();
      bar.style.width = '100%';
      setTimeout(() => {
        loader.classList.add('done');
        document.getElementById('title').classList.add('show');
      }, 420);
    } catch (err) {
      console.error(err);
      loader.innerHTML = '<div style="color:#3a4a34;font-size:13px;letter-spacing:.1em">场景加载失败，请刷新重试</div>';
    }
  });
}

window.addEventListener('DOMContentLoaded', boot);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
