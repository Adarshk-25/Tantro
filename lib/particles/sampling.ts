/**
 * Procedural surface/curve samplers. Every sampler returns a point for a given
 * random source, so shapes are deterministic for a given seed.
 */

export type Vec3 = [number, number, number];
export type Rand = () => number;
export type Sampler = (r: Rand) => Vec3;

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: Vec3): Vec3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Orthonormal basis perpendicular to `axis`. */
function basis(axis: Vec3): [Vec3, Vec3] {
  const n = norm(axis);
  const helper: Vec3 = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = norm(cross(n, helper));
  const v = cross(n, u);
  return [u, v];
}

const gauss = (r: Rand) => (r() + r() + r() - 1.5) / 1.5;

/** Points along a line segment with a little thickness. */
export const segment =
  (a: Vec3, b: Vec3, jitter = 0.012): Sampler =>
  (r) => {
    const t = r();
    return [
      a[0] + (b[0] - a[0]) * t + gauss(r) * jitter,
      a[1] + (b[1] - a[1]) * t + gauss(r) * jitter,
      a[2] + (b[2] - a[2]) * t + gauss(r) * jitter,
    ];
  };

/** Quadratic Bézier curve. */
export const curve =
  (a: Vec3, c: Vec3, b: Vec3, jitter = 0.015): Sampler =>
  (r) => {
    const t = r();
    const it = 1 - t;
    return [
      it * it * a[0] + 2 * it * t * c[0] + t * t * b[0] + gauss(r) * jitter,
      it * it * a[1] + 2 * it * t * c[1] + t * t * b[1] + gauss(r) * jitter,
      it * it * a[2] + 2 * it * t * c[2] + t * t * b[2] + gauss(r) * jitter,
    ];
  };

/** Surface of a capsule-like tube from a to b. */
export const tube =
  (a: Vec3, b: Vec3, radius: number, radiusB = radius): Sampler =>
  (r) => {
    const axis = sub(b, a);
    const [u, v] = basis(axis);
    const t = r();
    const th = r() * Math.PI * 2;
    const rad = radius + (radiusB - radius) * t;
    const c = add(a, scale(axis, t));
    return add(c, add(scale(u, Math.cos(th) * rad), scale(v, Math.sin(th) * rad)));
  };

/** Circle (ring) in the plane perpendicular to `axis`. */
export const ring =
  (center: Vec3, axis: Vec3, radius: number, thickness = 0.02): Sampler =>
  (r) => {
    const [u, v] = basis(axis);
    const th = r() * Math.PI * 2;
    const rad = radius + gauss(r) * thickness;
    return add(center, add(scale(u, Math.cos(th) * rad), scale(v, Math.sin(th) * rad)));
  };

/** Flat disc (filled) perpendicular to `axis`. */
export const disc =
  (center: Vec3, axis: Vec3, radius: number): Sampler =>
  (r) => {
    const [u, v] = basis(axis);
    const th = r() * Math.PI * 2;
    const rad = Math.sqrt(r()) * radius;
    return add(center, add(scale(u, Math.cos(th) * rad), scale(v, Math.sin(th) * rad)));
  };

export const sphere =
  (center: Vec3, radius: number): Sampler =>
  (r) => {
    const z = r() * 2 - 1;
    const th = r() * Math.PI * 2;
    const s = Math.sqrt(1 - z * z);
    return [center[0] + s * Math.cos(th) * radius, center[1] + z * radius, center[2] + s * Math.sin(th) * radius];
  };

/** Points on the 12 edges of an axis-aligned box. */
export const boxEdges =
  (center: Vec3, size: Vec3, jitter = 0.01): Sampler =>
  (r) => {
    const h = scale(size, 0.5);
    const axis = Math.floor(r() * 3);
    const s1 = r() < 0.5 ? -1 : 1;
    const s2 = r() < 0.5 ? -1 : 1;
    const t = r() * 2 - 1;
    const p: Vec3 =
      axis === 0 ? [t * h[0], s1 * h[1], s2 * h[2]] : axis === 1 ? [s1 * h[0], t * h[1], s2 * h[2]] : [s1 * h[0], s2 * h[1], t * h[2]];
    return [center[0] + p[0] + gauss(r) * jitter, center[1] + p[1] + gauss(r) * jitter, center[2] + p[2] + gauss(r) * jitter];
  };

/** Points on the faces of an axis-aligned box. */
export const boxSurface =
  (center: Vec3, size: Vec3): Sampler =>
  (r) => {
    const h = scale(size, 0.5);
    const face = Math.floor(r() * 6);
    const a = r() * 2 - 1;
    const b = r() * 2 - 1;
    const s = face % 2 === 0 ? -1 : 1;
    const ax = Math.floor(face / 2);
    const p: Vec3 = ax === 0 ? [s * h[0], a * h[1], b * h[2]] : ax === 1 ? [a * h[0], s * h[1], b * h[2]] : [a * h[0], b * h[1], s * h[2]];
    return add(center, p);
  };

/** Regular dot grid on a horizontal plane (y = const). */
export const floorGrid =
  (center: Vec3, half: number, step: number, radial = true): Sampler =>
  (r) => {
    const n = Math.floor((half * 2) / step);
    for (let i = 0; i < 12; i++) {
      const x = (Math.floor(r() * (n + 1)) - n / 2) * step;
      const z = (Math.floor(r() * (n + 1)) - n / 2) * step;
      if (!radial || x * x + z * z <= half * half) return [center[0] + x, center[1], center[2] + z];
    }
    return center;
  };

/** Uniform volume, used for ambient depth particles. */
export const volume =
  (center: Vec3, size: Vec3): Sampler =>
  (r) => [
    center[0] + (r() - 0.5) * size[0],
    center[1] + (r() - 0.5) * size[1],
    center[2] + (r() - 0.5) * size[2],
  ];

/** w = weight, s = sampler, accent = highlight amount, g = component group (for disassembly). */
export type Part = { w: number; s: Sampler; accent?: number; g?: number };

/** Fill `count` points from weighted parts into `out` starting at `offset`. */
export function fillParts(
  out: Float32Array,
  accent: Float32Array,
  offset: number,
  count: number,
  parts: Part[],
  r: Rand,
  transform?: (p: Vec3) => Vec3,
  groups?: Float32Array,
) {
  const total = parts.reduce((s, p) => s + p.w, 0);
  let written = 0;
  parts.forEach((part, pi) => {
    const n = pi === parts.length - 1 ? count - written : Math.round((part.w / total) * count);
    for (let i = 0; i < n && written < count; i++) {
      let p = part.s(r);
      if (transform) p = transform(p);
      const idx = offset + written;
      out[idx * 3] = p[0];
      out[idx * 3 + 1] = p[1];
      out[idx * 3 + 2] = p[2];
      accent[idx] = part.accent ?? 0;
      if (groups) groups[idx] = part.g ?? 0;
      written++;
    }
  });
}

/** Tag every part in a list with a component group. */
export const group = (g: number, parts: Part[]): Part[] => parts.map((p) => ({ ...p, g }));
