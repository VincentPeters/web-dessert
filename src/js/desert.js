(() => {
  const c = document.querySelector('.desert');
  if (!c) return;
  const g = c.getContext('2d');

  // ====== TWEAKABLE PARAMETERS ======
  const CFG = {
    // Camera
    tilt: 0.5, // X-axis tilt in radians (0=side, -PI/2=top-down)
    fov: 10, // perspective field-of-view (higher=flatter)
    horizonY: 0.6, // horizon position (0=top, 1=bottom)
    rotSpeed: 0.002, // rotation speed (radians/frame)

    // Projection scale
    scaleX: 0.07, // horizontal spread
    scaleY: 0.22, // vertical spread

    // Pyramid shape
    baseSize: 1, // half-width of pyramid base
    apexHeight: 2, // height of apex above base

    // Scene: [{x, z, s}] — position and scale of each pyramid
    pyramids: [
      { x: 0, z: 0, s: 1 },
      { x: -3.5, z: 1.5, s: 0.65 },
      { x: 4, z: 2.5, s: 0.45 },
    ],

    // Stars
    starCount: 100, // number of stars
    starAlpha: 0.3, // star opacity
    starSize: 1.5, // star pixel size

    // Dunes & ground lines
    horizonAlpha: 1,
    duneY: -20, // vertical offset for dunes in px (positive=down)
    duneWaves: 2, // number of overlapping sine waves
    duneAmplitude: 10, // max wave height in px
    duneFrequency: 0.015, // spatial frequency (higher=tighter waves)
    duneSpeed: 0.001, // how fast dunes shift (very slow)
    groundLines: 3, // number of receding ground lines
    groundAlpha: 1, // base opacity for ground lines

    // Edges
    visibleAlpha: 0.55, // visible edge opacity
    visibleWidth: 1.2, // visible edge line width
    hiddenAlpha: 0.15, // hidden edge opacity
    hiddenWidth: 0.8, // hidden edge line width
    hiddenDash: [3, 3],

    // Faces
    faceOpaque: true, // fill faces with bg color (solid, not see-through)
    faceAlpha: 0.07, // shading on top of solid fill (0=flat, higher=tinted)

    // Sun / Moon
    celestialRadius: 14, // base radius in px
    celestialAlpha: 0.5, // opacity
    celestialSpeed: 0.0003, // arc speed (fraction of rotSpeed)
    celestialArcTop: 0.08, // highest point (fraction of horizon)
    celestialArcBot: 0.52, // lowest point (near horizon)
    sunRays: 8, // number of sun rays
    sunRayLen: 8, // ray length in px
    moonCrescent: 0.35, // crescent offset (fraction of radius)
  };
  // ==================================

  const B = CFG.baseSize,
    H = CFG.apexHeight;
  const V = [
    [-B, 0, -B],
    [B, 0, -B],
    [B, 0, B],
    [-B, 0, B],
    [0, -H, 0],
  ];
  const E = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
  ];
  const F = [
    [0, 1, 4],
    [1, 2, 4],
    [2, 3, 4],
    [3, 0, 4],
    [3, 2, 1, 0],
  ];
  const st = [];
  for (let i = 0; i < CFG.starCount; i++)
    st.push([
      Math.sin(i * 127.1) * 0.5 + 0.5,
      Math.sin(i * 311.7) * 0.3 + 0.12,
      Math.sin(i * 73.3) * 0.5 + 0.5,
      Math.sin(i * 191.9) * 0.5 + 0.5,
    ]);
  const slow = matchMedia(
    '(prefers-reduced-motion:reduce)',
  ).matches;
  let t = Math.random() * 2000;
  function rz() {
    const d = devicePixelRatio || 1;
    c.width = c.offsetWidth * d;
    c.height = c.offsetHeight * d;
    g.setTransform(d, 0, 0, d, 0, 0);
  }
  new ResizeObserver(rz).observe(c);
  function frame() {
    const w = c.offsetWidth,
      h = c.offsetHeight;
    if (!w || !h) {
      requestAnimationFrame(frame);
      return;
    }
    const hy = h * CFG.horizonY;
    g.clearRect(0, 0, w, h);
    const col = getComputedStyle(c).color;
    g.strokeStyle = col;
    g.fillStyle = col;
    const isDark =
      document.documentElement.classList.contains('dark') ||
      (!document.documentElement.classList.contains('light') &&
        matchMedia('(prefers-color-scheme:dark)').matches);
    // Stars (night only, slowly drifting)
    if (isDark) {
      g.globalAlpha = CFG.starAlpha;
      st.forEach(([x, y, dx, dy]) => {
        const sx = ((x + dx * t * 0.00004) % 1 + 1) % 1;
        const sy = ((y + dy * t * 0.00002) % 0.45 + 0.45) % 0.45;
        g.fillRect(sx * w, sy * h, CFG.starSize, CFG.starSize);
      });
    }
    // Sun / Moon
    const arc = (t * CFG.celestialSpeed * 600) % (Math.PI * 2);
    const cxPos = w * 0.15 + (w * 0.7 * (arc / (Math.PI * 2)));
    const cyPos =
      h *
      (CFG.celestialArcBot -
        Math.sin(arc) *
          (CFG.celestialArcBot - CFG.celestialArcTop));
    const cr = CFG.celestialRadius;
    g.globalAlpha = CFG.celestialAlpha;
    g.strokeStyle = col;
    g.lineWidth = 1;
    if (isDark) {
      // Moon: closed crescent from two intersecting circle arcs
      const off = cr * CFG.moonCrescent;
      const dx = off, dy = -off;
      const R = cr, r = cr * 0.85;
      const d = Math.hypot(dx, dy);
      const a = (R * R - r * r + d * d) / (2 * d);
      const hh = Math.sqrt(R * R - a * a);
      const mx = (a * dx) / d, my = (a * dy) / d;
      const ix1 = mx + (hh * dy) / d, iy1 = my - (hh * dx) / d;
      const ix2 = mx - (hh * dy) / d, iy2 = my + (hh * dx) / d;
      const oa1 = Math.atan2(iy1, ix1);
      const oa2 = Math.atan2(iy2, ix2);
      const ia1 = Math.atan2(iy1 - dy, ix1 - dx);
      const ia2 = Math.atan2(iy2 - dy, ix2 - dx);
      g.beginPath();
      g.arc(cxPos, cyPos, R, oa1, oa2, true);
      g.arc(cxPos + dx, cyPos + dy, r, ia2, ia1, false);
      g.closePath();
      g.stroke();
    } else {
      // Sun: circle + rays
      g.beginPath();
      g.arc(cxPos, cyPos, cr, 0, Math.PI * 2);
      g.stroke();
      for (let i = 0; i < CFG.sunRays; i++) {
        const a = (i / CFG.sunRays) * Math.PI * 2;
        const x1 = cxPos + Math.cos(a) * (cr + 3);
        const y1 = cyPos + Math.sin(a) * (cr + 3);
        const x2 = cxPos + Math.cos(a) * (cr + 3 + CFG.sunRayLen);
        const y2 = cyPos + Math.sin(a) * (cr + 3 + CFG.sunRayLen);
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke();
      }
    }
    g.fillStyle = col;
    g.strokeStyle = col;

    // Dune wave helper: sum of sine waves at position x
    const dune = (x, offset) => {
      let y = 0;
      for (let n = 1; n <= CFG.duneWaves; n++) {
        const freq = CFG.duneFrequency * n * 0.7;
        const amp = CFG.duneAmplitude / n;
        const phase = n * 1.3 + (t * CFG.duneSpeed * 600) / n;
        y += Math.sin(x * freq + phase + offset) * amp;
      }
      return y;
    };
    // Dune lines (back to front, filled to occlude)
    const dy = CFG.duneY;
    const dbg = getComputedStyle(document.body).backgroundColor;
    for (let i = CFG.groundLines; i >= 0; i--) {
      const baseY = hy + dy + i * 6;
      const off = i * 2;
      // Fill shape: dune curve down to canvas bottom
      g.beginPath();
      g.moveTo(0, h);
      for (let x = 0; x <= w; x += 2)
        g.lineTo(x, baseY + dune(x, off));
      g.lineTo(w, h);
      g.closePath();
      g.globalAlpha = 1;
      g.fillStyle = dbg;
      g.fill();
      // Stroke the dune line on top
      g.globalAlpha =
        i === 0 ? CFG.horizonAlpha : CFG.groundAlpha;
      g.strokeStyle = col;
      g.fillStyle = col;
      g.lineWidth = 0.5;
      g.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const py = baseY + dune(x, off);
        x === 0 ? g.moveTo(x, py) : g.lineTo(x, py);
      }
      g.stroke();
    }
    // Camera: Y-rotate + X-tilt
    const tx = CFG.tilt,
      cy = Math.cos(t),
      sy = Math.sin(t),
      cx = Math.cos(tx),
      sx = Math.sin(tx);
    CFG.pyramids.forEach((p) => {
      const tv = V.map((v) => {
        let x = v[0] * p.s,
          y = v[1] * p.s,
          z = v[2] * p.s;
        const rx = x * cy - z * sy,
          rz = x * sy + z * cy;
        return [
          rx + p.x,
          y * cx - rz * sx,
          y * sx + rz * cx + p.z,
        ];
      });
      const pj = tv.map((v) => {
        const d = CFG.fov / (v[2] + CFG.fov + 1);
        return [
          w / 2 + v[0] * d * w * CFG.scaleX,
          hy + v[1] * d * h * CFG.scaleY,
        ];
      });
      // Face normals + depth sort
      const fd = F.map((f) => {
        const a = tv[f[1]],
          b = tv[f[2]],
          o = tv[f[0]];
        const nz =
          (a[0] - o[0]) * (b[1] - o[1]) -
          (a[1] - o[1]) * (b[0] - o[0]);
        const az =
          f.reduce((s, i) => s + tv[i][2], 0) / f.length;
        return { f, nz, az };
      }).sort((a, b) => b.az - a.az);
      // Fill front-facing faces
      const bg = getComputedStyle(
        document.body,
      ).backgroundColor;
      fd.forEach(({ f, nz }) => {
        if (nz >= 0) return;
        g.beginPath();
        g.moveTo(pj[f[0]][0], pj[f[0]][1]);
        for (let i = 1; i < f.length; i++)
          g.lineTo(pj[f[i]][0], pj[f[i]][1]);
        g.closePath();
        if (CFG.faceOpaque) {
          g.globalAlpha = 1;
          g.fillStyle = bg;
          g.fill();
          g.fillStyle = col;
        }
        g.globalAlpha = CFG.faceAlpha;
        g.fill();
      });
      // Hidden edges (dashed)
      g.setLineDash(CFG.hiddenDash);
      g.globalAlpha = CFG.hiddenAlpha;
      g.lineWidth = CFG.hiddenWidth;
      g.beginPath();
      E.forEach(([a, b]) => {
        if (
          !fd.some(
            ({ f, nz }) =>
              nz < 0 && f.includes(a) && f.includes(b),
          )
        ) {
          g.moveTo(pj[a][0], pj[a][1]);
          g.lineTo(pj[b][0], pj[b][1]);
        }
      });
      g.stroke();
      // Visible edges (solid)
      g.setLineDash([]);
      g.globalAlpha = CFG.visibleAlpha;
      g.lineWidth = CFG.visibleWidth;
      g.beginPath();
      E.forEach(([a, b]) => {
        if (
          fd.some(
            ({ f, nz }) =>
              nz < 0 && f.includes(a) && f.includes(b),
          )
        ) {
          g.moveTo(pj[a][0], pj[a][1]);
          g.lineTo(pj[b][0], pj[b][1]);
        }
      });
      g.stroke();
    });
    if (!slow) t += CFG.rotSpeed;
    requestAnimationFrame(frame);
  }
  frame();
})();
