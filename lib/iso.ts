/**
 * Isometric projection helpers for procedural technical line drawings.
 * World axes: x → right-down, y → left-down, z → up.
 */

export type P3 = [number, number, number];
export type P2 = [number, number];

const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);

export const iso = ([x, y, z]: P3, k = 40): P2 => [(x - y) * C * k, ((x + y) * S - z) * k];

export const pathOf = (pts: P3[], k?: number, close = false) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${iso(p, k)[0].toFixed(1)} ${iso(p, k)[1].toFixed(1)}`).join(' ') +
  (close ? ' Z' : '');

/** The visible faces of a box as three outlined polygons (top, left, right). */
export function boxPaths([x, y, z]: P3, [w, d, h]: P3, k?: number): string[] {
  const top: P3[] = [
    [x, y, z + h],
    [x + w, y, z + h],
    [x + w, y + d, z + h],
    [x, y + d, z + h],
  ];
  const front: P3[] = [
    [x, y + d, z],
    [x + w, y + d, z],
    [x + w, y + d, z + h],
    [x, y + d, z + h],
  ];
  const side: P3[] = [
    [x + w, y, z],
    [x + w, y + d, z],
    [x + w, y + d, z + h],
    [x + w, y, z + h],
  ];
  return [pathOf(top, k, true), pathOf(front, k, true), pathOf(side, k, true)];
}

/** Horizontal circle (drawn as projected polyline). */
export function circlePath([cx, cy, cz]: P3, r: number, k?: number, seg = 36): string {
  const pts: P3[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, cz]);
  }
  return pathOf(pts, k);
}

/** Vertical circle in the y–z plane (e.g. the end of a tank lying along x). */
export function circleYZ([cx, cy, cz]: P3, r: number, k?: number, seg = 36): string {
  const pts: P3[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pts.push([cx, cy + Math.cos(a) * r, cz + Math.sin(a) * r]);
  }
  return pathOf(pts, k);
}

/* ---------------------------------------------------------------- */
/* Shaded solids for the v2 illustration                              */
/* ---------------------------------------------------------------- */

export type Tone = 'top' | 'left' | 'right' | 'cyl' | 'cap' | 'glass' | 'screen' | 'frame' | 'line' | 'lamp' | 'belt' | 'arm' | 'pipe';
export type Shape = { d: string; tone: Tone };

const toPath = (pts: P2[]) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z';

/** Andrew's monotone chain convex hull. */
export function hull(points: P2[]): P2[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: P2[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: P2[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/** Box as three shaded faces (painter-ordered). */
export function box(o: P3, s: P3, k: number, tones: [Tone, Tone, Tone] = ['top', 'left', 'right']): Shape[] {
  const [x, y, z] = o;
  const [w, d, h] = s;
  const P = (p: P3) => iso(p, k);
  return [
    { tone: tones[1], d: toPath([P([x, y + d, z]), P([x + w, y + d, z]), P([x + w, y + d, z + h]), P([x, y + d, z + h])]) },
    { tone: tones[2], d: toPath([P([x + w, y, z]), P([x + w, y + d, z]), P([x + w, y + d, z + h]), P([x + w, y, z + h])]) },
    { tone: tones[0], d: toPath([P([x, y, z + h]), P([x + w, y, z + h]), P([x + w, y + d, z + h]), P([x, y + d, z + h])]) },
  ];
}

/** A flat rectangle on the +y face (e.g. a window or screen). */
export function faceY(x: number, y: number, z: number, w: number, h: number, k: number, tone: Tone): Shape {
  return { tone, d: toPath([iso([x, y, z], k), iso([x + w, y, z], k), iso([x + w, y, z + h], k), iso([x, y, z + h], k)]) };
}

/** A flat rectangle on the +x face. */
export function faceX(x: number, y: number, z: number, d: number, h: number, k: number, tone: Tone): Shape {
  return { tone, d: toPath([iso([x, y, z], k), iso([x, y + d, z], k), iso([x, y + d, z + h], k), iso([x, y, z + h], k)]) };
}

function circle3(c: P3, r: number, axis: 'x' | 'y' | 'z', seg = 28): P3[] {
  const out: P3[] = [];
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const u = Math.cos(a) * r;
    const v = Math.sin(a) * r;
    out.push(axis === 'z' ? [c[0] + u, c[1] + v, c[2]] : axis === 'x' ? [c[0], c[1] + u, c[2] + v] : [c[0] + u, c[1], c[2] + v]);
  }
  return out;
}

/** Cylinder along an axis: side silhouette (hull) + visible end cap. */
export function cylinder(base: P3, r: number, len: number, axis: 'x' | 'y' | 'z', k: number): Shape[] {
  const end: P3 =
    axis === 'z' ? [base[0], base[1], base[2] + len] : axis === 'x' ? [base[0] + len, base[1], base[2]] : [base[0], base[1] + len, base[2]];
  const a = circle3(base, r, axis).map((p) => iso(p, k));
  const b = circle3(end, r, axis).map((p) => iso(p, k));
  return [
    { tone: 'cyl', d: toPath(hull([...a, ...b])) },
    { tone: 'cap', d: toPath(b) },
  ];
}

/** A tube/pipe or cable drawn as a stroked polyline. */
export function polyline(pts: P3[], k: number, tone: Tone = 'line'): Shape {
  return { tone, d: pathOf(pts, k) };
}
