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
