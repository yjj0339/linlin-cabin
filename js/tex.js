const Tex = {};

function _cv(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function _tex(cv, rx, ry, srgb) {
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx || 1, ry || 1);
  if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function _rnd(a, b) { return a + Math.random() * (b - a); }

function _noiseSpeckle(ctx, w, h, count, colors, alpha, size) {
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = alpha * _rnd(0.35, 1);
    ctx.fillStyle = colors[(Math.random() * colors.length) | 0];
    const s = _rnd(size * 0.4, size);
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, s, s * _rnd(0.5, 1.4), Math.random() * 6.28, 0, 6.283);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

Tex.wood = function (opt) {
  opt = opt || {};
  const vertical = !!opt.vertical;
  const base = opt.base || '#8a5f3c';
  const w = 512, h = 512, cv = _cv(w, h), ctx = cv.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  const planks = opt.planks || 8;
  const step = (vertical ? w : h) / planks;
  for (let i = 0; i < planks; i++) {
    const p = i * step;
    const g = ctx.createLinearGradient(vertical ? p : 0, vertical ? 0 : p, vertical ? p + step : 0, vertical ? 0 : p + step);
    const t = 0.86 + Math.random() * 0.28;
    g.addColorStop(0, `rgba(255,238,214,${0.05 * t})`);
    g.addColorStop(0.5, `rgba(255,226,190,${0.11 * t})`);
    g.addColorStop(1, `rgba(40,22,10,${0.1 * t})`);
    ctx.fillStyle = g;
    if (vertical) ctx.fillRect(p, 0, step, h); else ctx.fillRect(0, p, w, step);

    ctx.strokeStyle = 'rgba(46,26,12,.42)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    if (vertical) { ctx.moveTo(p, 0); ctx.lineTo(p, h); } else { ctx.moveTo(0, p); ctx.lineTo(w, p); }
    ctx.stroke();

    for (let k = 0; k < 7; k++) {
      ctx.strokeStyle = `rgba(${Math.random() > .5 ? '60,35,15' : '255,232,200'},${_rnd(.04, .13)})`;
      ctx.lineWidth = _rnd(.6, 2.2);
      ctx.beginPath();
      const off = _rnd(3, step - 3);
      if (vertical) {
        ctx.moveTo(p + off, 0);
        for (let y = 0; y <= h; y += 32) ctx.lineTo(p + off + Math.sin(y * .03 + i) * _rnd(1, 4), y);
      } else {
        ctx.moveTo(0, p + off);
        for (let x = 0; x <= w; x += 32) ctx.lineTo(x, p + off + Math.sin(x * .03 + i) * _rnd(1, 4));
      }
      ctx.stroke();
    }
    if (Math.random() > .55) {
      const kx = vertical ? p + step * .5 : _rnd(20, w - 20);
      const ky = vertical ? _rnd(20, h - 20) : p + step * .5;
      const rg = ctx.createRadialGradient(kx, ky, 1, kx, ky, step * .34);
      rg.addColorStop(0, 'rgba(52,28,12,.5)');
      rg.addColorStop(.55, 'rgba(70,40,18,.18)');
      rg.addColorStop(1, 'rgba(70,40,18,0)');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.ellipse(kx, ky, step * .3, step * .17, 0, 0, 6.283); ctx.fill();
    }
  }
  _noiseSpeckle(ctx, w, h, 700, ['#4a2a12', '#c99b6c', '#6b4526'], .05, 2.2);
  return cv;
};

Tex.texWoodH = _tex(Tex.wood({ planks: 10 }), 2.2, 1.1);
Tex.texWoodV = _tex(Tex.wood({ base: '#7d5535', vertical: true, planks: 6 }), 1.2, 1.6);
Tex.texDoor = _tex(Tex.wood({ base: '#6d4728', vertical: true, planks: 3 }), 1, 1);

Tex.texBark = _tex((function () {
  const w = 256, h = 512, cv = _cv(w, h), ctx = cv.getContext('2d');
  ctx.fillStyle = '#5b4130'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    ctx.strokeStyle = `rgba(${Math.random() > .5 ? '30,20,12' : '138,110,86'},${_rnd(.08, .3)})`;
    ctx.lineWidth = _rnd(.8, 5);
    ctx.beginPath();
    const x = Math.random() * w;
    let y = -20;
    ctx.moveTo(x, y);
    while (y < h + 20) { y += 24; ctx.lineTo(x + Math.sin(y * .02 + i) * _rnd(0, 9), y); }
    ctx.stroke();
  }
  _noiseSpeckle(ctx, w, h, 900, ['#33231a', '#a08464', '#6a5744'], .1, 3);
  return cv;
})(), 2, 3);

Tex.texRoof = _tex((function () {
  const w = 512, h = 512, cv = _cv(w, h), ctx = cv.getContext('2d');
  ctx.fillStyle = '#3d3a35'; ctx.fillRect(0, 0, w, h);
  const rows = 9, rh = h / rows, cols = 9, cw = w / cols;
  for (let r = 0; r < rows; r++) {
    const y = r * rh;
    for (let c = -1; c < cols + 1; c++) {
      const x = c * cw + (r % 2 ? cw * .5 : 0);
      const shade = 0.82 + Math.random() * 0.34;
      const g = ctx.createLinearGradient(x, y, x, y + rh);
      g.addColorStop(0, `rgba(${124 * shade | 0},${116 * shade | 0},${104 * shade | 0},1)`);
      g.addColorStop(.75, `rgba(${82 * shade | 0},${76 * shade | 0},${67 * shade | 0},1)`);
      g.addColorStop(1, `rgba(${46 * shade | 0},${42 * shade | 0},${37 * shade | 0},1)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x + 1, y + 1);
      ctx.lineTo(x + cw - 1, y + 1);
      ctx.lineTo(x + cw - 1, y + rh - 5);
      ctx.quadraticCurveTo(x + cw * .5, y + rh + 3, x + 1, y + rh - 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(24,28,32,.32)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  _noiseSpeckle(ctx, w, h, 1400, ['#35322c', '#8a8074', '#615a50', '#272420'], .16, 2.6);
  const mossCv = ctx;
  for (let i = 0; i < 26; i++) {
    mossCv.fillStyle = `rgba(${70 + Math.random() * 40 | 0},${95 + Math.random() * 45 | 0},${54 + Math.random() * 30 | 0},${_rnd(.05, .17)})`;
    mossCv.beginPath();
    mossCv.ellipse(Math.random() * w, Math.random() * h, _rnd(8, 34), _rnd(5, 20), Math.random() * 6, 0, 6.283);
    mossCv.fill();
  }
  return cv;
})(), 1, 1);

Tex.texStone = _tex((function () {
  const w = 512, h = 512, cv = _cv(w, h), ctx = cv.getContext('2d');
  ctx.fillStyle = '#565049'; ctx.fillRect(0, 0, w, h);
  let y = 0;
  while (y < h) {
    const rh = _rnd(38, 72);
    let x = -_rnd(0, 60);
    while (x < w) {
      const rw = _rnd(52, 116);
      const s = .78 + Math.random() * .42;
      ctx.fillStyle = `rgb(${132 * s | 0},${126 * s | 0},${114 * s | 0})`;
      ctx.beginPath();
      const rr = Math.min(rw, rh) * .18;
      ctx.moveTo(x + rr, y);
      ctx.lineTo(x + rw - rr, y);
      ctx.quadraticCurveTo(x + rw, y, x + rw, y + rr);
      ctx.lineTo(x + rw, y + rh - rr);
      ctx.quadraticCurveTo(x + rw, y + rh, x + rw - rr, y + rh);
      ctx.lineTo(x + rr, y + rh);
      ctx.quadraticCurveTo(x, y + rh, x, y + rh - rr);
      ctx.lineTo(x, y + rr);
      ctx.quadraticCurveTo(x, y, x + rr, y);
      ctx.fill();
      ctx.strokeStyle = 'rgba(32,29,26,.5)'; ctx.lineWidth = 2.4; ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${_rnd(.05, .17)})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x + 4, y + rh - 5); ctx.lineTo(x + rw - 4, y + rh - 5); ctx.stroke();
      x += rw;
    }
    y += rh;
  }
  _noiseSpeckle(ctx, w, h, 2200, ['#38332d', '#8e887c', '#b9b2a4', '#4a453e'], .1, 2.4);
  return cv;
})(), 2, 2);

Tex.texSoil = _tex((function () {
  const w = 256, h = 256, cv = _cv(w, h), ctx = cv.getContext('2d');
  ctx.fillStyle = '#5b4534'; ctx.fillRect(0, 0, w, h);
  _noiseSpeckle(ctx, w, h, 2200, ['#42301f', '#7d6248', '#94795c', '#33261a'], .28, 4.6);
  for (let i = 0; i < 90; i++) {
    ctx.strokeStyle = `rgba(${Math.random() > .5 ? '150,122,92' : '40,29,20'},${_rnd(.06, .2)})`;
    ctx.lineWidth = _rnd(.5, 1.6);
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.lineTo(Math.random() * w, Math.random() * h);
    ctx.stroke();
  }
  return cv;
})(), 4, 4);

Tex.texGrass = _tex((function () {
  const w = 512, h = 512, cv = _cv(w, h), ctx = cv.getContext('2d');
  ctx.fillStyle = '#4d7238'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = _rnd(14, 90);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const c = Math.random() > .45 ? '96,138,62' : (Math.random() > .5 ? '70,104,48' : '118,152,74');
    g.addColorStop(0, `rgba(${c},${_rnd(.1, .3)})`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  }
  for (let i = 0; i < 5200; i++) {
    ctx.strokeStyle = `rgba(${40 + Math.random() * 90 | 0},${80 + Math.random() * 80 | 0},${30 + Math.random() * 50 | 0},${_rnd(.12, .5)})`;
    ctx.lineWidth = _rnd(.5, 1.5);
    const x = Math.random() * w, y = Math.random() * h, l = _rnd(3, 9);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + _rnd(-2, 2), y - l); ctx.stroke();
  }
  _noiseSpeckle(ctx, w, h, 1400, ['#3c5c2c', '#8aa85c', '#6d8f4a'], .14, 3);
  return cv;
})(), 26, 26);

Tex.texBlade = _tex((function () {
  const w = 128, h = 128, cv = _cv(w, h), ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  const blades = 9;
  for (let i = 0; i < blades; i++) {
    const bx = 12 + (i / (blades - 1)) * (w - 24) + _rnd(-5, 5);
    const hh = _rnd(h * .42, h * .98);
    const bend = _rnd(-22, 22);
    const g = ctx.createLinearGradient(0, h, 0, h - hh);
    g.addColorStop(0, 'rgba(66,96,42,1)');
    g.addColorStop(.5, 'rgba(108,146,60,1)');
    g.addColorStop(1, 'rgba(170,201,106,.95)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(bx - _rnd(2.4, 4.6), h);
    ctx.quadraticCurveTo(bx - 2 + bend * .3, h - hh * .6, bx + bend, h - hh);
    ctx.quadraticCurveTo(bx + 2 + bend * .3, h - hh * .6, bx + _rnd(2.4, 4.6), h);
    ctx.closePath();
    ctx.fill();
  }
  return cv;
})(), 1, 1);

Tex.texPetal = _tex((function () {
  const w = 64, h = 128, cv = _cv(w, h), ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#ffd94a');
  g.addColorStop(.55, '#f7c221');
  g.addColorStop(1, '#e09b0b');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(w * .5, 2);
  ctx.bezierCurveTo(w * .96, h * .24, w * .9, h * .8, w * .5, h - 2);
  ctx.bezierCurveTo(w * .1, h * .8, w * .04, h * .24, w * .5, 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(190,125,8,.3)'; ctx.lineWidth = 1.4; ctx.stroke();
  return cv;
})(), 1, 1);

Tex.texSeed = _tex((function () {
  const w = 256, h = 256, cv = _cv(w, h), ctx = cv.getContext('2d');
  ctx.fillStyle = '#6b4a22'; ctx.beginPath(); ctx.arc(128, 128, 126, 0, 6.283); ctx.fill();
  for (let ring = 0; ring < 13; ring++) {
    const r = 8 + ring * 9.4;
    const n = Math.max(6, Math.round(r * .62));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + ring * .42;
      const x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r;
      ctx.fillStyle = `rgba(${28 + Math.random() * 46 | 0},${18 + Math.random() * 26 | 0},${8 + Math.random() * 14 | 0},.92)`;
      ctx.beginPath(); ctx.ellipse(x, y, 2.6, 4.1, a, 0, 6.283); ctx.fill();
      ctx.fillStyle = `rgba(190,150,90,${_rnd(.1, .34)})`;
      ctx.beginPath(); ctx.ellipse(x - .6, y - .8, 1.1, 1.9, a, 0, 6.283); ctx.fill();
    }
  }
  return cv;
})(), 1, 1);

Tex.texGlow = (function () {
  const s = 128, cv = _cv(s, s), ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(.22, 'rgba(255,246,214,.92)');
  g.addColorStop(.52, 'rgba(255,214,140,.34)');
  g.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

Tex.texCloud = (function () {
  const s = 256, cv = _cv(s, s), ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, s, s);
  for (let i = 0; i < 22; i++) {
    const x = _rnd(50, s - 50), y = _rnd(70, s - 80), r = _rnd(24, 62);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,.5)');
    g.addColorStop(.6, 'rgba(255,255,255,.2)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

Tex.texSign = _tex((function () {
  const w = 512, h = 160, cv = _cv(w, h), ctx = cv.getContext('2d');
  ctx.fillStyle = '#6d4728'; ctx.fillRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255,226,180,.22)');
  g.addColorStop(.5, 'rgba(255,226,180,.05)');
  g.addColorStop(1, 'rgba(30,16,6,.3)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = `rgba(${Math.random() > .5 ? '60,35,15' : '255,232,200'},${_rnd(.03, .1)})`;
    ctx.lineWidth = _rnd(.6, 2);
    ctx.beginPath(); ctx.moveTo(0, _rnd(0, h)); ctx.lineTo(w, _rnd(0, h)); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(38,20,8,.7)'; ctx.lineWidth = 7; ctx.strokeRect(3.5, 3.5, w - 7, h - 7);
  ctx.fillStyle = '#f6e6c8';
  ctx.font = 'bold 84px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(20,10,2,.75)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.fillText('霖 林 小 屋', w / 2, h / 2 + 4);
  return cv;
})(), 1, 1);

Tex.texStars = _tex((function () {
  const s = 1024, cv = _cv(s, s), ctx = cv.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * s, y = Math.random() * s;
    const r = Math.pow(Math.random(), 2.4) * 2.1 + .35;
    const a = _rnd(.25, 1);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(.4, `rgba(210,230,255,${a * .38})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, 6.283); ctx.fill();
  }
  return cv;
})(), 1, 1);

Tex.texDot = (function () {
  const s = 64, cv = _cv(s, s), ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(.32, 'rgba(238,246,255,.92)');
  g.addColorStop(.62, 'rgba(198,220,255,.28)');
  g.addColorStop(1, 'rgba(160,190,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
