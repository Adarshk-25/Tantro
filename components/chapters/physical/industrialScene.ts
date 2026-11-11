import { boxPaths, circlePath, circleYZ, iso, pathOf, type P2, type P3 } from '@/lib/iso';

/**
 * A procedural production cell, drawn as an isometric engineering illustration.
 * Each asset owns its strokes and an anchor point for its hotspot.
 */

export type SceneAsset = { id: string; paths: string[]; anchor: P3 };

const K = 34;

function cnc(): SceneAsset {
  const o: P3 = [0.5, 0.2, 0];
  const paths = boxPaths(o, [3.2, 2.6, 2.7], K);
  // machine window and control panel
  paths.push(pathOf([[1.0, 2.8, 0.9], [2.6, 2.8, 0.9], [2.6, 2.8, 2.1], [1.0, 2.8, 2.1]], K, true));
  paths.push(pathOf([[3.7, 0.6, 1.2], [3.7, 1.4, 1.2], [3.7, 1.4, 2.2], [3.7, 0.6, 2.2]], K, true));
  // spindle inside the window
  paths.push(pathOf([[1.8, 2.8, 2.1], [1.8, 2.8, 1.5]], K));
  return { id: 'cnc', paths, anchor: [2.1, 1.5, 2.7] };
}

function vibrationSensor(): SceneAsset {
  const at: P3 = [3.7, 2.2, 0.55];
  return {
    id: 'vib',
    paths: [...boxPaths(at, [0.25, 0.25, 0.3], K), pathOf([[3.95, 2.35, 0.7], [4.4, 2.6, 0.05]], K)],
    anchor: [3.82, 2.32, 0.85],
  };
}

function plc(): SceneAsset {
  const o: P3 = [5.2, -2.6, 0];
  const paths = boxPaths(o, [1.5, 0.9, 3.0], K);
  // DIN-rail modules on the door
  for (let i = 0; i < 5; i++) {
    const x = 5.35 + i * 0.25;
    paths.push(pathOf([[x, -1.7, 1.9], [x + 0.18, -1.7, 1.9], [x + 0.18, -1.7, 2.6], [x, -1.7, 2.6]], K, true));
  }
  paths.push(pathOf([[5.4, -1.7, 0.6], [6.5, -1.7, 0.6]], K));
  return { id: 'plc', paths, anchor: [5.95, -2.15, 3.0] };
}

function meter(): SceneAsset {
  const o: P3 = [7.2, -2.6, 1.3];
  const paths = boxPaths(o, [0.8, 0.5, 1.0], K);
  paths.push(pathOf([[7.35, -2.1, 1.9], [7.85, -2.1, 1.9], [7.85, -2.1, 2.15], [7.35, -2.1, 2.15]], K, true));
  paths.push(pathOf([[7.6, -2.35, 1.3], [7.6, -2.35, 0]], K));
  return { id: 'meter', paths, anchor: [7.6, -2.35, 2.3] };
}

function robot(): SceneAsset {
  const base: P3 = [6.6, 2.0, 0];
  const paths = [circlePath([base[0], base[1], 0], 0.7, K), circlePath([base[0], base[1], 0.35], 0.7, K)];
  paths.push(pathOf([[6.6, 2.0, 0.35], [6.6, 2.0, 1.1], [7.6, 2.4, 2.6], [9.1, 2.9, 2.2], [9.3, 3.2, 1.55]], K));
  paths.push(pathOf([[6.6, 2.0, 1.1], [7.6, 2.4, 2.6]], K));
  paths.push(circlePath([7.6, 2.4, 2.6], 0.25, K));
  paths.push(circlePath([6.6, 2.0, 1.1], 0.3, K));
  paths.push(pathOf([[9.15, 3.05, 1.55], [9.15, 3.05, 1.2]], K));
  paths.push(pathOf([[9.45, 3.35, 1.55], [9.45, 3.35, 1.2]], K));
  return { id: 'robot', paths, anchor: [7.6, 2.4, 2.75] };
}

function conveyorPaths(): string[] {
  const y = 4.2;
  const paths = boxPaths([1.2, y, 0.7], [11.5, 1.3, 0.2], K);
  for (let x = 1.6; x < 12.6; x += 0.8) paths.push(pathOf([[x, y, 0.9], [x, y + 1.3, 0.9]], K));
  [1.6, 6.2, 12.2].forEach((x) => {
    paths.push(pathOf([[x, y + 0.1, 0], [x, y + 0.1, 0.7]], K));
    paths.push(pathOf([[x, y + 1.2, 0], [x, y + 1.2, 0.7]], K));
  });
  // parts travelling on the line
  [3.0, 5.2, 8.4, 11.0].forEach((x) => paths.push(...boxPaths([x, y + 0.35, 0.9], [0.6, 0.6, 0.35], K)));
  return paths;
}

function camera(): SceneAsset {
  const paths: string[] = [];
  paths.push(pathOf([[10.0, 3.9, 0], [10.0, 3.9, 3.2], [10.0, 5.8, 3.2], [10.0, 5.8, 0]], K));
  paths.push(...boxPaths([9.8, 4.6, 2.5], [0.45, 0.5, 0.45], K));
  // field of view onto the conveyor
  paths.push(pathOf([[10.0, 4.85, 2.5], [9.4, 4.3, 1.25]], K));
  paths.push(pathOf([[10.0, 4.85, 2.5], [10.8, 5.4, 1.25]], K));
  paths.push(pathOf([[9.4, 4.3, 1.25], [10.8, 4.3, 1.25], [10.8, 5.4, 1.25], [9.4, 5.4, 1.25]], K, true));
  return { id: 'camera', paths, anchor: [10.02, 4.85, 3.0] };
}

function compressor(): SceneAsset {
  const paths: string[] = [];
  paths.push(...boxPaths([10.4, -2.4, 0], [2.2, 1.3, 1.2], K));
  // receiver tank lying along x
  paths.push(circleYZ([13.2, -1.0, 0.9], 0.75, K));
  paths.push(circleYZ([15.4, -1.0, 0.9], 0.75, K));
  paths.push(pathOf([[13.2, -1.0, 1.65], [15.4, -1.0, 1.65]], K));
  paths.push(pathOf([[13.2, -0.25, 0.9], [15.4, -0.25, 0.9]], K));
  // air header to the line
  paths.push(pathOf([[11.5, -1.1, 1.2], [11.5, -1.1, 2.2], [11.5, 3.6, 2.2], [11.5, 3.6, 1.0]], K));
  return { id: 'compressor', paths, anchor: [14.3, -1.0, 1.75] };
}

export type IndustrialScene = {
  assets: SceneAsset[];
  context: string[];
  grid: string[];
  cables: string[];
  bounds: { x: number; y: number; w: number; h: number };
  project: (p: P3) => P2;
};

export function buildIndustrialScene(): IndustrialScene {
  const assets = [cnc(), vibrationSensor(), plc(), robot(), camera(), meter(), compressor()];
  const context: string[] = [...conveyorPaths()];
  const grid: string[] = [];
  for (let x = -1; x <= 17; x += 1) grid.push(pathOf([[x, -4, 0], [x, 7, 0]], K));
  for (let y = -4; y <= 7; y += 1) grid.push(pathOf([[-1, y, 0], [17, y, 0]], K));
  // signal cables from the PLC (dashed, run along the floor)
  const cables = [
    pathOf([[5.9, -1.7, 0.02], [5.9, 1.4, 0.02], [3.7, 1.4, 0.02]], K),
    pathOf([[6.2, -1.7, 0.02], [6.2, 1.6, 0.02]], K),
    pathOf([[6.5, -1.7, 0.02], [6.5, -1.2, 0.02], [10.0, -1.2, 0.02], [10.0, 3.9, 0.02]], K),
    pathOf([[7.2, -2.3, 0.02], [6.7, -2.3, 0.02]], K),
  ];

  // bounds from a dense sample of the scene extent
  const corners: P3[] = [
    [-1, -4, 0],
    [17, -4, 0],
    [17, 7, 0],
    [-1, 7, 0],
    [5.2, -2.6, 3.2],
    [10, 3.9, 3.4],
  ];
  const pts = corners.map((p) => iso(p, K));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const pad = 12;
  const bounds = {
    x: Math.min(...xs) - pad,
    y: Math.min(...ys) - pad,
    w: Math.max(...xs) - Math.min(...xs) + pad * 2,
    h: Math.max(...ys) - Math.min(...ys) + pad * 2,
  };
  return { assets, context, grid, cables, bounds, project: (p) => iso(p, K) };
}
