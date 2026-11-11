import { box, cylinder, faceX, faceY, iso, polyline, type P2, type P3, type Shape, type Tone } from '@/lib/iso';

/**
 * A procedural production cell rendered as shaded isometric solids.
 * Each asset owns its shapes and an anchor for its hotspot; assets are
 * painter-sorted by depth so overlaps resolve correctly.
 */

export type SceneAsset = { id: string; shapes: Shape[]; anchor: P3; depth: number; floor: P3 };

const K = 30;

const retone = (shapes: Shape[], tone: Tone): Shape[] => shapes.map((s) => ({ ...s, tone: s.tone === 'cyl' ? tone : s.tone }));

function cnc(): SceneAsset {
  const s: Shape[] = [
    ...box([-0.7, 0.6, 0], [0.6, 1.3, 0.55], K), // chip conveyor
    ...box([0, 0, 0], [3.6, 2.8, 0.3], K),
    ...box([0.1, 0.1, 0.3], [3.4, 2.6, 2.4], K),
    ...box([0.8, 0.5, 2.7], [1.4, 1.2, 0.25], K), // spindle head housing
    faceY(0.55, 2.7, 0.95, 1.9, 1.15, K, 'glass'),
    polyline([[1.5, 2.7, 0.95], [1.5, 2.7, 2.1]], K, 'frame'),
    faceX(3.5, 0.4, 0.6, 1.7, 0.08, K, 'frame'),
    ...box([3.55, 2.25, 1.1], [0.22, 0.45, 0.95], K),
    faceY(3.58, 2.7, 1.35, 0.16, 0.55, K, 'screen'),
    ...cylinder([3.05, 0.45, 2.7], 0.05, 0.45, 'z', K),
    ...retone(cylinder([3.05, 0.45, 3.15], 0.09, 0.14, 'z', K), 'lamp'),
    ...cylinder([3.05, 0.45, 3.29], 0.09, 0.14, 'z', K),
  ];
  return { id: 'cnc', shapes: s, anchor: [1.8, 1.4, 3.0], depth: 3.2, floor: [1.8, 1.4, 0] };
}

function robot(): SceneAsset {
  const s: Shape[] = [
    // guard fence (back and side), behind the robot
    faceY(4.4, 2.1, 0, 4.0, 1.9, K, 'glass'),
    faceX(4.4, 2.1, 0, 3.0, 1.9, K, 'glass'),
    polyline([[4.4, 5.1, 0], [4.4, 5.1, 1.9], [4.4, 2.1, 1.9], [8.4, 2.1, 1.9], [8.4, 2.1, 0]], K, 'frame'),
    polyline([[4.4, 2.1, 0], [4.4, 2.1, 1.9]], K, 'frame'),
    ...box([4.6, 2.4, 0], [3.4, 2.4, 0.08], K),
    ...box([5.4, 3.2, 0.08], [0.85, 0.85, 0.7], K),
    ...cylinder([5.82, 3.62, 0.78], 0.46, 0.28, 'z', K),
    ...cylinder([5.82, 3.62, 1.06], 0.33, 0.45, 'z', K),
    polyline([[5.82, 3.62, 1.5], [6.35, 4.25, 2.75], [7.45, 5.0, 2.3], [7.6, 5.15, 1.75]], K, 'arm'),
    ...cylinder([6.2, 4.25, 2.75], 0.22, 0.3, 'x', K),
    ...cylinder([7.35, 5.0, 2.3], 0.15, 0.22, 'x', K),
    ...box([7.45, 5.0, 1.45], [0.3, 0.3, 0.3], K),
  ];
  return { id: 'robot', shapes: s, anchor: [6.35, 4.25, 3.0], depth: 9.4, floor: [6.2, 3.6, 0] };
}

function conveyor(): Shape[] {
  const s: Shape[] = [];
  [0.4, 3.8, 7.2, 10.4].forEach((x) => {
    s.push(...box([x, 6.1, 0], [0.12, 0.12, 0.8], K), ...box([x, 7.1, 0], [0.12, 0.12, 0.8], K));
  });
  s.push(...box([0, 6, 0.8], [11, 1.35, 0.25], K, ['belt', 'left', 'right']));
  for (let x = 0.5; x < 11; x += 0.55) s.push(polyline([[x, 6.05, 1.06], [x, 7.3, 1.06]], K, 'line'));
  [1.2, 3.3, 5.6, 9.3].forEach((x) => s.push(...box([x, 6.25, 1.05], [0.85, 0.85, 0.6], K)));
  return s;
}

function packaging(): SceneAsset {
  const s: Shape[] = [
    ...conveyor(),
    ...box([11, 5.5, 0], [3.3, 2.4, 2.7], K),
    faceY(11.5, 7.9, 0.9, 1.6, 1.2, K, 'glass'),
    faceX(14.3, 5.9, 1.2, 0.9, 0.6, K, 'screen'),
    ...box([11.4, 5.8, 2.7], [2.5, 1.6, 0.18], K),
  ];
  return { id: 'packaging', shapes: s, anchor: [12.6, 6.7, 2.95], depth: 13.5, floor: [12.6, 6.7, 0] };
}

function vision(): SceneAsset {
  const s: Shape[] = [
    ...box([7.9, 5.6, 0], [0.16, 0.16, 2.75], K),
    ...box([7.9, 5.6, 2.75], [0.16, 2.1, 0.16], K),
    ...box([7.82, 6.35, 2.15], [0.32, 0.45, 0.5], K),
    ...cylinder([7.98, 6.58, 1.95], 0.1, 0.2, 'z', K),
    { tone: 'lamp', d: ringPath([7.98, 6.58, 1.75], 0.42) },
    polyline([[7.98, 6.58, 1.75], [7.35, 6.05, 1.06]], K, 'line'),
    polyline([[7.98, 6.58, 1.75], [8.6, 7.25, 1.06]], K, 'line'),
    ...box([7.9, 7.55, 0], [0.16, 0.16, 2.75], K),
  ];
  return { id: 'vision', shapes: s, anchor: [7.98, 6.6, 3.1], depth: 14.6, floor: [8, 6.6, 0] };
}

function ringPath(c: P3, r: number) {
  const pts: P3[] = [];
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]]);
  }
  return pts.map((p, i) => `${i ? 'L' : 'M'}${iso(p, K)[0].toFixed(1)} ${iso(p, K)[1].toFixed(1)}`).join(' ');
}

function pump(): SceneAsset {
  const s: Shape[] = [
    ...box([9.2, 0.3, 0], [3.4, 2.0, 0.22], K),
    ...box([9.5, 0.75, 0.22], [1.5, 1.1, 0.12], K),
    ...cylinder([9.45, 1.3, 0.85], 0.5, 1.5, 'x', K),
    ...box([10.95, 1.05, 0.55], [0.35, 0.5, 0.55], K),
    ...cylinder([11.3, 1.3, 0.85], 0.58, 0.5, 'x', K),
    ...cylinder([11.55, 1.3, 1.4], 0.16, 1.3, 'z', K),
    polyline([[11.55, 1.3, 2.7], [11.55, 1.3, 3.2], [11.55, -0.6, 3.2]], K, 'pipe'),
    ...cylinder([12.0, 1.3, 0.85], 0.16, 0.6, 'x', K),
  ];
  return { id: 'pump', shapes: s, anchor: [10.2, 1.3, 1.6], depth: 11.8, floor: [10.8, 1.3, 0] };
}

function compressor(): SceneAsset {
  const s: Shape[] = [
    ...box([13.2, 0, 0], [2.3, 1.8, 1.8], K),
    ...[0.35, 0.65, 0.95, 1.25].map((z) => polyline([[15.5, 0.2, z], [15.5, 1.6, z]], K, 'frame')),
    ...box([13.4, 2.1, 0], [1.1, 0.8, 1.25], K),
    ...cylinder([16.4, 2.3, 0], 0.72, 2.5, 'z', K),
    polyline([[16.4, 2.3, 2.5], [16.4, 2.3, 3.2], [16.4, -0.6, 3.2]], K, 'pipe'),
    polyline([[15.5, 0.9, 1.2], [15.9, 1.9, 1.2]], K, 'pipe'),
  ];
  return { id: 'compressor', shapes: s, anchor: [16.4, 2.3, 2.85], depth: 16.8, floor: [15.2, 1.4, 0] };
}

function hmi(): SceneAsset {
  const s: Shape[] = [
    ...box([4.8, -1.7, 0], [2.0, 0.85, 2.7], K),
    polyline([[5.8, -0.85, 0.1], [5.8, -0.85, 2.6]], K, 'frame'),
    faceY(5.0, -0.85, 1.9, 0.6, 0.45, K, 'screen'),
    ...box([7.4, -0.35, 0], [0.22, 0.22, 1.35], K),
    ...box([7.05, -0.55, 1.35], [0.9, 0.16, 0.62], K),
    faceY(7.12, -0.39, 1.42, 0.76, 0.48, K, 'screen'),
  ];
  return { id: 'hmi', shapes: s, anchor: [5.8, -1.25, 2.95], depth: 4.6, floor: [6.2, -0.9, 0] };
}

export type IndustrialScene = {
  assets: SceneAsset[];
  floor: string;
  grid: string[];
  context: Shape[];
  bounds: { x: number; y: number; w: number; h: number };
  project: (p: P3) => P2;
};

export function buildIndustrialScene(): IndustrialScene {
  const assets = [cnc(), hmi(), robot(), pump(), packaging(), vision(), compressor()].sort((a, b) => a.depth - b.depth);

  const fx = [-1.5, 17.8];
  const fy = [-2.4, 9.2];
  const corners: P3[] = [
    [fx[0], fy[0], 0],
    [fx[1], fy[0], 0],
    [fx[1], fy[1], 0],
    [fx[0], fy[1], 0],
  ];
  const floor = corners.map((p, i) => `${i ? 'L' : 'M'}${iso(p, K)[0]} ${iso(p, K)[1]}`).join(' ') + ' Z';
  const grid: string[] = [];
  for (let x = Math.ceil(fx[0]); x <= fx[1]; x += 1) grid.push(`M${iso([x, fy[0], 0], K).join(' ')} L${iso([x, fy[1], 0], K).join(' ')}`);
  for (let y = Math.ceil(fy[0]); y <= fy[1]; y += 1) grid.push(`M${iso([fx[0], y, 0], K).join(' ')} L${iso([fx[1], y, 0], K).join(' ')}`);

  // Services: compressed-air header and cable tray, running behind the cell.
  const context: Shape[] = [
    polyline([[16.4, -0.6, 3.2], [1.2, -0.6, 3.2], [1.2, -0.6, 2.75]], K, 'pipe'),
    polyline([[6.8, -0.85, 2.85], [6.8, 2.0, 2.85], [6.0, 2.0, 2.85]], K, 'line'),
    polyline([[4.8, -0.85, 2.8], [3.4, -0.85, 2.8], [3.4, 0.4, 2.8]], K, 'line'),
    // walkway markings
    polyline([[-1.2, 8.6, 0.01], [17.4, 8.6, 0.01]], K, 'frame'),
    polyline([[8.8, -2.0, 0.01], [8.8, 5.0, 0.01]], K, 'frame'),
  ];

  const pts: P2[] = [...corners.map((p) => iso(p, K)), iso([16.4, 2.3, 3.4], K), iso([1.8, 1.4, 3.6], K), iso([5.8, -1.7, 3.4], K)];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const pad = 6;
  const bounds = {
    x: Math.min(...xs) - pad,
    y: Math.min(...ys) - pad,
    w: Math.max(...xs) - Math.min(...xs) + pad * 2,
    h: Math.max(...ys) - Math.min(...ys) + pad * 2,
  };
  return { assets, floor, grid, context, bounds, project: (p) => iso(p, K) };
}
