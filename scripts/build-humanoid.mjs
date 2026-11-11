/**
 * Offline generator for the Tantro humanoid point cloud.
 *
 * The figure is an ORIGINAL design, sculpted from smooth signed-distance fields
 * (blended ellipsoids, tapered round cones, rounded boxes) per body part.
 * Candidate points are projected onto each part's surface, points buried inside
 * other parts are removed, panel seams are cut, and the result is thinned with
 * blue-noise (Poisson-disk) spacing for an even, dense dot pattern.
 *
 * Output: public/models/humanoid-points.bin
 *   uint32 count, then per point (12 bytes):
 *   int16 x,y,z (metres × 16000) · int8 nx,ny,nz · uint8 part · uint8 accent · uint8 pad
 *
 * Run:  node scripts/build-humanoid.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('public/models', { recursive: true });

/* ------------------------------ maths ------------------------------ */
const len = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function smin(a, b, k) {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b * (1 - h) + a * h - k * h * (1 - h);
}
let seed = 1234567;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

/* --------------------------- primitives ---------------------------- */
const ell = (c, r) => (x, y, z) => {
  const px = (x - c[0]) / r[0], py = (y - c[1]) / r[1], pz = (z - c[2]) / r[2];
  const k0 = len(px, py, pz);
  const k1 = len(px / r[0], py / r[1], pz / r[2]);
  return k1 === 0 ? -Math.min(...r) : (k0 * (k0 - 1)) / k1;
};
const sph = (c, r) => (x, y, z) => len(x - c[0], y - c[1], z - c[2]) - r;
const cap = (a, b, r) => (x, y, z) => {
  const pax = x - a[0], pay = y - a[1], paz = z - a[2];
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
  return len(pax - bax * h, pay - bay * h, paz - baz * h) - r;
};
/** Tapered capsule (round cone) — iq's exact formulation. */
const rcone = (a, b, r1, r2) => (x, y, z) => {
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const l2 = bax * bax + bay * bay + baz * baz;
  const rr = r1 - r2;
  const a2 = l2 - rr * rr;
  const il2 = 1 / l2;
  const pax = x - a[0], pay = y - a[1], paz = z - a[2];
  const yv = pax * bax + pay * bay + paz * baz;
  const zv = yv - l2;
  const qx = pax * l2 - bax * yv, qy = pay * l2 - bay * yv, qz = paz * l2 - baz * yv;
  const x2 = qx * qx + qy * qy + qz * qz;
  const y2 = yv * yv * l2;
  const z2 = zv * zv * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(zv) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(yv) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
  return (Math.sqrt(x2 * a2 * il2) + yv * rr) * il2 - r1;
};
const rbox = (c, h, r) => (x, y, z) => {
  const qx = Math.abs(x - c[0]) - h[0] + r, qy = Math.abs(y - c[1]) - h[1] + r, qz = Math.abs(z - c[2]) - h[2] + r;
  return len(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, Math.max(qy, qz)), 0) - r;
};
const blend = (k, ...fs) => (x, y, z) => {
  let d = fs[0](x, y, z);
  for (let i = 1; i < fs.length; i++) d = smin(d, fs[i](x, y, z), k);
  return d;
};
const union = (...fs) => (x, y, z) => {
  let d = Infinity;
  for (const f of fs) d = Math.min(d, f(x, y, z));
  return d;
};

/* ----------------------------- anatomy ----------------------------- */
// Rest pose: y up, feet on y = 0, facing +z. Height ≈ 1.80 m. s = side (+1 right/+x, −1 left).

const parts = [];
const P = (id, name, sdf, bbox, seams = [], accent = () => 0) => parts.push({ id, name, sdf, bbox, seams, accent });

// 0 head — skull, face, jaw, ear pods
P(
  0,
  'head',
  union(
    blend(
      0.03,
      ell([0, 1.668, 0.0], [0.096, 0.12, 0.108]),
      ell([0, 1.612, 0.03], [0.072, 0.068, 0.082]),
      ell([0, 1.7, 0.012], [0.09, 0.075, 0.1]),
    ),
    cap([0.08, 1.652, -0.008], [0.094, 1.652, -0.008], 0.031),
    cap([-0.08, 1.652, -0.008], [-0.094, 1.652, -0.008], 0.031),
  ),
  [[-0.15, 1.52, -0.14], [0.15, 1.8, 0.14]],
  [
    { c: [0.095, 1.655, 0], n: [1, 0, 0], w: 0.0028 },
    { c: [-0.095, 1.655, 0], n: [-1, 0, 0], w: 0.0028 },
  ],
  (x, y, z, nx, ny, nz) => (nz > 0.45 && y > 1.636 && y < 1.684 && Math.abs(x) < 0.07 ? 1 : 0),
);

// 1 neck — tapered column with two cables
P(
  1,
  'neck',
  union(
    rcone([0, 1.47, -0.008], [0, 1.57, 0], 0.052, 0.044),
    cap([0.026, 1.49, 0.034], [0.02, 1.56, 0.038], 0.0085),
    cap([-0.026, 1.49, 0.034], [-0.02, 1.56, 0.038], 0.0085),
  ),
  [[-0.08, 1.44, -0.08], [0.08, 1.6, 0.08]],
  [{ c: [0, 1.52, 0], n: [0, 1, 0], w: 0.0025 }],
);

// 2 torso — chest, trapezius, pecs, waist, abdomen plate
P(
  2,
  'torso',
  blend(
    0.045,
    ell([0, 1.31, 0], [0.165, 0.16, 0.105]),
    ell([0, 1.405, -0.012], [0.155, 0.07, 0.085]),
    ell([0.074, 1.33, 0.045], [0.085, 0.074, 0.06]),
    ell([-0.074, 1.33, 0.045], [0.085, 0.074, 0.06]),
    rcone([0, 1.2, -0.005], [0, 1.04, -0.005], 0.112, 0.097),
    ell([0, 1.115, 0.036], [0.084, 0.1, 0.066]),
    ell([0, 1.27, -0.06], [0.13, 0.12, 0.05]),
  ),
  [[-0.21, 0.98, -0.14], [0.21, 1.5, 0.15]],
  [
    { c: [0, 1.215, 0], n: [0, 1, 0], w: 0.0035 },
    { c: [0, 1.118, 0], n: [0, 1, 0], w: 0.003 },
    { c: [0, 1.07, 0], n: [0, 1, 0], w: 0.003 },
    { c: [0, 0, 0], n: [1, 0, 0], w: 0.0022, zmin: 0.02, ymax: 1.215 },
  ],
  (x, y, z, nx, ny, nz) => (nz > 0.6 && Math.abs(x) < 0.032 && Math.abs(y - 1.36) < 0.0075 ? 1 : 0),
);

// 3 pelvis — hips, groin plate, hip covers
P(
  3,
  'pelvis',
  blend(
    0.035,
    ell([0, 0.968, -0.004], [0.148, 0.085, 0.098]),
    ell([0, 0.9, 0.028], [0.07, 0.062, 0.06]),
    ell([0.118, 0.93, 0], [0.062, 0.064, 0.066]),
    ell([-0.118, 0.93, 0], [0.062, 0.064, 0.066]),
  ),
  [[-0.2, 0.82, -0.12], [0.2, 1.06, 0.12]],
  [{ c: [0, 1.0, 0], n: [0, 1, 0], w: 0.003 }],
);

const arm = (side, idUpper, idFore, idHand) => {
  const s = side;
  const shoulder = [0.2 * s, 1.4, 0];
  const elbow = [0.252 * s, 1.15, -0.006];
  const wrist = [0.29 * s, 0.886, 0.02];
  const upperDir = [elbow[0] - shoulder[0], elbow[1] - shoulder[1], elbow[2] - shoulder[2]];
  const ul = len(...upperDir);
  const un = upperDir.map((v) => v / ul);
  const foreDir = [wrist[0] - elbow[0], wrist[1] - elbow[1], wrist[2] - elbow[2]];
  const fl = len(...foreDir);
  const fn = foreDir.map((v) => v / fl);
  const along = (a, n, t) => [a[0] + n[0] * t, a[1] + n[1] * t, a[2] + n[2] * t];

  // Upper arm: layered shoulder shells + tapered arm with bicep volume
  P(
    idUpper,
    s > 0 ? 'upperArmR' : 'upperArmL',
    union(
      blend(0.018, ell([0.198 * s, 1.414, 0], [0.064, 0.046, 0.066]), ell([0.212 * s, 1.383, 0.002], [0.058, 0.042, 0.062])),
      ell([0.255 * s, 1.37, 0], [0.012, 0.034, 0.034]),
      blend(
        0.03,
        rcone(along(shoulder, un, 0.03), along(elbow, un, -0.02), 0.051, 0.042),
        ell([0.226 * s, 1.27, 0.012], [0.047, 0.072, 0.05]),
      ),
    ),
    [
      [Math.min(0.12 * s, 0.31 * s), 1.1, -0.1],
      [Math.max(0.12 * s, 0.31 * s), 1.49, 0.1],
    ],
    [
      { c: [0.212 * s, 1.394, 0], n: [0.25 * s, 1, 0], w: 0.0028 },
      { c: along(shoulder, un, 0.2), n: un, w: 0.0025 },
    ],
  );
  // Forearm: elbow joint, tapered casing, wrist joint
  P(
    idFore,
    s > 0 ? 'forearmR' : 'forearmL',
    union(
      sph(elbow, 0.037),
      ell([elbow[0] + 0.036 * s, elbow[1], elbow[2]], [0.009, 0.028, 0.028]),
      blend(
        0.025,
        rcone(along(elbow, fn, 0.015), along(wrist, fn, -0.012), 0.045, 0.031),
        ell([0.262 * s, 1.075, 0.004], [0.045, 0.066, 0.045]),
      ),
      sph(wrist, 0.027),
    ),
    [
      [Math.min(0.19 * s, 0.34 * s), 0.85, -0.07],
      [Math.max(0.19 * s, 0.34 * s), 1.2, 0.08],
    ],
    [
      { c: along(elbow, fn, 0.05), n: fn, w: 0.0025 },
      { c: along(elbow, fn, 0.2), n: fn, w: 0.0022 },
    ],
    (x, y, z) => {
      const dx = x - elbow[0], dy = y - elbow[1], dz = z - elbow[2];
      return Math.abs(len(dx, dy, dz) - 0.039) < 0.004 && Math.abs(dx * s) > 0.025 ? 0.5 : 0;
    },
  );
  // Hand: palm + five articulated fingers
  const px = 0.298 * s;
  const inward = -s;
  const fingers = [];
  [-0.027, -0.009, 0.009, 0.026].forEach((fz, i) => {
    const L = [0.84, 1.0, 0.95, 0.78][i];
    const a = [px, 0.786, 0.026 + fz];
    const b = [px + inward * 0.004, 0.786 - 0.038 * L, 0.03 + fz];
    const c = [px + inward * 0.011, 0.786 - 0.066 * L, 0.035 + fz];
    const d = [px + inward * 0.018, 0.786 - 0.088 * L, 0.038 + fz];
    fingers.push(cap(a, b, 0.0088), cap(b, c, 0.008), cap(c, d, 0.0072));
  });
  const t0 = [px + inward * 0.006, 0.838, 0.058];
  const t1 = [px + inward * 0.017, 0.81, 0.07];
  const t2 = [px + inward * 0.026, 0.786, 0.072];
  fingers.push(cap(t0, t1, 0.0098), cap(t1, t2, 0.0085));
  P(
    idHand,
    s > 0 ? 'handR' : 'handL',
    union(blend(0.012, rbox([px, 0.828, 0.026], [0.0145, 0.045, 0.038], 0.011), ell([px + inward * 0.004, 0.83, 0.05], [0.014, 0.03, 0.02])), ...fingers),
    [
      [Math.min(0.24 * s, 0.34 * s), 0.68, -0.03],
      [Math.max(0.24 * s, 0.34 * s), 0.89, 0.1],
    ],
    [{ c: [px, 0.787, 0], n: [0, 1, 0], w: 0.0018 }],
  );
};
arm(1, 4, 5, 6);
arm(-1, 7, 8, 9);

const leg = (side, idThigh, idShin, idFoot) => {
  const s = side;
  const hip = [0.1 * s, 0.9, 0];
  const knee = [0.105 * s, 0.505, 0.003];
  const ankle = [0.103 * s, 0.095, -0.012];
  P(
    idThigh,
    s > 0 ? 'thighR' : 'thighL',
    blend(
      0.035,
      rcone(hip, [knee[0], knee[1] + 0.03, knee[2]], 0.077, 0.048),
      ell([0.1 * s, 0.77, 0.022], [0.064, 0.13, 0.058]),
      ell([0.11 * s, 0.7, -0.014], [0.054, 0.11, 0.052]),
      ell([0.165 * s, 0.875, 0], [0.012, 0.048, 0.048]),
    ),
    [
      [Math.min(0.0, 0.2 * s), 0.5, -0.1],
      [Math.max(0.0, 0.2 * s), 0.95, 0.11],
    ],
    [{ c: [0, 0.62, 0], n: [0, 1, 0], w: 0.003 }],
    (x, y, z, nx) => (Math.abs(x - 0.165 * s) < 0.013 && Math.abs(nx) > 0.7 && len(y - 0.875, z) > 0.03 && len(y - 0.875, z) < 0.045 ? 0.6 : 0),
  );
  P(
    idShin,
    s > 0 ? 'shinR' : 'shinL',
    union(
      blend(0.02, ell([0.105 * s, 0.505, 0.04], [0.04, 0.046, 0.028]), ell([0.105 * s, 0.502, 0], [0.05, 0.046, 0.046])),
      ell([0.152 * s, 0.502, 0], [0.01, 0.032, 0.032]),
      blend(
        0.03,
        rcone([knee[0], knee[1] - 0.03, knee[2] - 0.004], [ankle[0], ankle[1] + 0.02, ankle[2]], 0.056, 0.034),
        ell([0.105 * s, 0.37, -0.03], [0.05, 0.1, 0.05]),
        ell([0.105 * s, 0.33, 0.028], [0.034, 0.13, 0.02]),
      ),
      sph(ankle, 0.036),
    ),
    [
      [Math.min(0.03 * s, 0.18 * s), 0.05, -0.1],
      [Math.max(0.03 * s, 0.18 * s), 0.57, 0.1],
    ],
    [
      { c: [0, 0.462, 0], n: [0, 1, 0], w: 0.003 },
      { c: [0, 0.17, 0], n: [0, 1, 0], w: 0.0025 },
    ],
    (x, y, z) => (Math.abs(y - 0.502) < 0.004 && Math.abs(x - knee[0]) > 0.04 ? 0.5 : 0),
  );
  P(
    idFoot,
    s > 0 ? 'footR' : 'footL',
    blend(
      0.02,
      rbox([0.103 * s, 0.038, 0.035], [0.044, 0.036, 0.1], 0.026),
      ell([0.103 * s, 0.032, 0.13], [0.046, 0.03, 0.055]),
      ell([0.103 * s, 0.065, -0.005], [0.042, 0.04, 0.05]),
    ),
    [
      [Math.min(0.03 * s, 0.18 * s), -0.005, -0.09],
      [Math.max(0.03 * s, 0.18 * s), 0.12, 0.2],
    ],
    [{ c: [0, 0.016, 0], n: [0, 1, 0], w: 0.0025 }],
  );
};
leg(1, 10, 11, 12);
leg(-1, 13, 14, 15);

parts.sort((a, b) => a.id - b.id);

/* -------------------------- surface sampling ------------------------ */
const EPS = 0.0006;
function grad(f, x, y, z) {
  const e = 0.0005;
  const gx = f(x + e, y, z) - f(x - e, y, z);
  const gy = f(x, y + e, z) - f(x, y - e, z);
  const gz = f(x, y, z + e) - f(x, y, z - e);
  const l = len(gx, gy, gz) || 1;
  return [gx / l, gy / l, gz / l];
}

const TARGET = Number(process.argv[2] ?? 96000);
const pts = []; // [x,y,z,nx,ny,nz,part,accent]
const t0 = Date.now();
for (const part of parts) {
  const [mn, mx] = part.bbox;
  const vol = (mx[0] - mn[0]) * (mx[1] - mn[1]) * (mx[2] - mn[2]);
  const n = Math.round(Math.pow(vol, 2 / 3) * 2.4e6);
  let kept = 0;
  for (let i = 0; i < n; i++) {
    let x = mn[0] + rnd() * (mx[0] - mn[0]);
    let y = mn[1] + rnd() * (mx[1] - mn[1]);
    let z = mn[2] + rnd() * (mx[2] - mn[2]);
    let d = part.sdf(x, y, z);
    if (Math.abs(d) > 0.05) continue;
    for (let k = 0; k < 6 && Math.abs(d) > EPS * 0.3; k++) {
      const g = grad(part.sdf, x, y, z);
      x -= g[0] * d;
      y -= g[1] * d;
      z -= g[2] * d;
      d = part.sdf(x, y, z);
    }
    if (Math.abs(d) > EPS) continue;
    // buried inside another part? (mechanical overlaps)
    let buried = false;
    for (const o of parts) {
      if (o === part) continue;
      const [a, b] = o.bbox;
      if (x < a[0] || y < a[1] || z < a[2] || x > b[0] || y > b[1] || z > b[2]) continue;
      if (o.sdf(x, y, z) < -0.0015) {
        buried = true;
        break;
      }
    }
    if (buried) continue;
    // panel seams
    let seam = false;
    for (const sm of part.seams) {
      if (sm.zmin !== undefined && z < sm.zmin) continue;
      if (sm.ymax !== undefined && y > sm.ymax) continue;
      const dist = (x - sm.c[0]) * sm.n[0] + (y - sm.c[1]) * sm.n[1] + (z - sm.c[2]) * sm.n[2];
      const nl = len(...sm.n);
      if (Math.abs(dist / nl) < sm.w) {
        seam = true;
        break;
      }
    }
    if (seam) continue;
    const g = grad(part.sdf, x, y, z);
    pts.push([x, y, z, g[0], g[1], g[2], part.id, part.accent(x, y, z, g[0], g[1], g[2])]);
    kept++;
  }
  console.log(`${part.name.padEnd(10)} candidates ${String(n).padStart(8)}  on-surface ${kept}`);
}
console.log(`surface points: ${pts.length} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

/* ------------- nested blue-noise (Poisson) levels for adaptive budgets ------------- */
// Each level adds points to the previous ones, so every level boundary is itself an
// evenly spaced set. The client snaps its budget to a boundary.
const LEVELS = [12000, 20000, 32000, 52000, TARGET];
const cellKey = (i, j, k) => `${i},${j},${k}`;
const order = pts.map((_, i) => i);
for (let i = order.length - 1; i > 0; i--) {
  const j = Math.floor(rnd() * (i + 1));
  [order[i], order[j]] = [order[j], order[i]];
}
function runLevels(radii) {
  const accepted = [];
  const used = new Uint8Array(pts.length);
  const bounds = [];
  for (const r of radii) {
    const cell = r / Math.sqrt(3);
    const grid = new Map();
    const reach = Math.ceil(r / cell);
    const insert = (p) => {
      const key = cellKey(Math.floor(p[0] / cell), Math.floor(p[1] / cell), Math.floor(p[2] / cell));
      const list = grid.get(key);
      if (list) list.push(p);
      else grid.set(key, [p]);
    };
    accepted.forEach(insert);
    const r2 = r * r;
    for (const idx of order) {
      if (used[idx]) continue;
      const p = pts[idx];
      const ci = Math.floor(p[0] / cell), cj = Math.floor(p[1] / cell), ck = Math.floor(p[2] / cell);
      let ok = true;
      for (let a = -reach; a <= reach && ok; a++)
        for (let b = -reach; b <= reach && ok; b++)
          for (let c = -reach; c <= reach && ok; c++) {
            const list = grid.get(cellKey(ci + a, cj + b, ck + c));
            if (!list) continue;
            for (const q of list) {
              const dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2];
              if (dx * dx + dy * dy + dz * dz < r2) {
                ok = false;
                break;
              }
            }
          }
      if (!ok) continue;
      used[idx] = 1;
      accepted.push(p);
      insert(p);
    }
    bounds.push(accepted.length);
  }
  return { accepted, bounds };
}
// calibrate radii so each level lands near its target count
let radii = LEVELS.map((n) => 0.0033 * Math.sqrt(96000 / n));
let run = runLevels(radii);
for (let it = 0; it < 2; it++) {
  let prev = 0;
  radii = radii.map((r, i) => {
    const got = run.bounds[i];
    const fix = Math.sqrt(got / LEVELS[i]);
    prev = got;
    return r * fix;
  });
  run = runLevels(radii);
  console.log('levels', run.bounds.join(' / '), 'radii mm', radii.map((r) => (r * 1000).toFixed(2)).join(' / '));
}
// shuffle within each level only (prefixes stay blue-noise at boundaries)
const result = [];
let startIdx = 0;
for (const b of run.bounds) {
  const slice = run.accepted.slice(startIdx, b);
  for (let i = slice.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [slice[i], slice[j]] = [slice[j], slice[i]];
  }
  result.push(...slice);
  startIdx = b;
}
writeFileSync('public/models/humanoid-levels.json', JSON.stringify(run.bounds));

/* ------------------------------- write ------------------------------- */
const buf = Buffer.alloc(4 + result.length * 12);
buf.writeUInt32LE(result.length, 0);
result.forEach((p, i) => {
  const o = 4 + i * 12;
  buf.writeInt16LE(Math.round(p[0] * 16000), o);
  buf.writeInt16LE(Math.round(p[1] * 16000), o + 2);
  buf.writeInt16LE(Math.round(p[2] * 16000), o + 4);
  buf.writeInt8(Math.round(p[3] * 127), o + 6);
  buf.writeInt8(Math.round(p[4] * 127), o + 7);
  buf.writeInt8(Math.round(p[5] * 127), o + 8);
  buf.writeUInt8(p[6], o + 9);
  buf.writeUInt8(Math.round(clamp(p[7], 0, 1) * 255), o + 10);
});
writeFileSync('public/models/humanoid-points.bin', buf);
console.log(`wrote ${result.length} points, ${(buf.length / 1024).toFixed(0)} KiB`);
