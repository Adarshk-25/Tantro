/**
 * Hero states S2–S4: recognisable industrial objects drawn as particles.
 * Every scene returns nodes/structure parts (shared ordering for morph continuity),
 * component groups (for disassembly) and label anchors (for projected HTML labels).
 */

import { boxEdges, boxSurface, curve, disc, floorGrid, group, ring, segment, sphere, tube, type Part, type Vec3 } from './sampling';
import { armParts, type ShapeParts } from './shapes';

export type Anchor = { id: string; label: string; pos: Vec3; g?: number };
export type HeroScene = ShapeParts & { anchors: Anchor[] };

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/* ----------------------------- object kit ----------------------------- */

/** Control cabinet with a PLC/DCS rack and I/O modules. */
export function cabinet(c: Vec3, s = 1): ShapeParts {
  const W = 0.62 * s, H = 0.9 * s, D = 0.32 * s;
  const structure: Part[] = [
    { w: 4, s: boxEdges(c, [W, H, D], 0.003) },
    { w: 3, s: boxSurface(add(c, [0, 0, D / 2]), [W * 0.94, H * 0.94, 0.001]) },
  ];
  const nodes: Part[] = [];
  for (let i = 0; i < 6; i++) {
    const x = c[0] - W * 0.38 + i * W * 0.15;
    structure.push({ w: 0.8, s: boxEdges([x, c[1] + H * 0.18, c[2] + D / 2 + 0.01], [W * 0.1, H * 0.3, 0.02], 0.002) });
    nodes.push({ w: 0.4, s: sphere([x, c[1] + H * 0.3, c[2] + D / 2 + 0.02], 0.012 * s), accent: 1 });
  }
  structure.push({ w: 1, s: segment([c[0] - W * 0.42, c[1] - H * 0.15, c[2] + D / 2 + 0.01], [c[0] + W * 0.42, c[1] - H * 0.15, c[2] + D / 2 + 0.01], 0.003) });
  return { structure, nodes };
}

/** Operator screen (SCADA/HMI/MES) with content lines and a stand. */
export function monitor(c: Vec3, s = 1, content: 'trend' | 'list' | 'mimic' = 'trend'): ShapeParts {
  const W = 0.78 * s, H = 0.48 * s;
  const structure: Part[] = [
    { w: 4, s: boxEdges(c, [W, H, 0.04 * s], 0.003) },
    { w: 2.5, s: boxSurface(add(c, [0, 0, 0.022 * s]), [W * 0.92, H * 0.88, 0.001]) },
    { w: 1, s: segment(add(c, [0, -H / 2, -0.02]), add(c, [0, -H / 2 - 0.22 * s, -0.04]), 0.006) },
    { w: 1, s: disc(add(c, [0, -H / 2 - 0.22 * s, -0.04]), [0, 1, 0], 0.14 * s) },
  ];
  const nodes: Part[] = [];
  const z = c[2] + 0.03 * s;
  if (content === 'trend') {
    const pts: Vec3[] = Array.from({ length: 9 }, (_, i) => [c[0] - W * 0.4 + i * W * 0.1, c[1] - H * 0.15 + Math.sin(i * 1.3) * H * 0.18, z]);
    pts.slice(0, -1).forEach((p, i) => nodes.push({ w: 0.6, s: segment(p, pts[i + 1], 0.003), accent: 1 }));
  } else if (content === 'list') {
    for (let i = 0; i < 4; i++)
      nodes.push({ w: 0.5, s: segment([c[0] - W * 0.38, c[1] + H * 0.28 - i * H * 0.17, z], [c[0] + W * (0.1 + (i % 2) * 0.2), c[1] + H * 0.28 - i * H * 0.17, z], 0.003), accent: 1 });
  } else {
    // process mimic: two vessels and a pipe
    nodes.push(
      { w: 0.8, s: ring([c[0] - W * 0.22, c[1], z], [0, 0, 1], H * 0.22, 0.002), accent: 1 },
      { w: 0.8, s: ring([c[0] + W * 0.22, c[1], z], [0, 0, 1], H * 0.22, 0.002), accent: 1 },
      { w: 0.5, s: segment([c[0] - W * 0.12, c[1], z], [c[0] + W * 0.12, c[1], z], 0.003), accent: 1 },
    );
  }
  return { structure, nodes };
}

/** Edge gateway: finned box with ports. */
export function edgeBox(c: Vec3, s = 1): ShapeParts {
  const W = 0.5 * s, H = 0.22 * s, D = 0.34 * s;
  const structure: Part[] = [{ w: 3, s: boxEdges(c, [W, H, D], 0.003) }, { w: 2, s: boxSurface(c, [W, H, D]) }];
  for (let i = 0; i < 7; i++) structure.push({ w: 0.4, s: segment([c[0] - W * 0.4 + i * W * 0.13, c[1] + H / 2 + 0.01, c[2] - D * 0.4], [c[0] - W * 0.4 + i * W * 0.13, c[1] + H / 2 + 0.01, c[2] + D * 0.4], 0.002) });
  const nodes: Part[] = [0, 1, 2].map((i) => ({ w: 0.5, s: sphere([c[0] - W * 0.3 + i * 0.07 * s, c[1], c[2] + D / 2 + 0.01], 0.014 * s), accent: 1 }));
  return { structure, nodes };
}

/** Data services: stacked database cylinders. */
export function database(c: Vec3, s = 1): ShapeParts {
  const R = 0.24 * s, h = 0.13 * s;
  const structure: Part[] = [];
  const nodes: Part[] = [];
  for (let i = 0; i < 3; i++) {
    const y = c[1] - h * 1.2 + i * h * 1.2;
    structure.push({ w: 3, s: tube([c[0], y - h / 2, c[2]], [c[0], y + h / 2, c[2]], R) });
    nodes.push({ w: 0.8, s: ring([c[0], y + h / 2, c[2]], [0, 1, 0], R, 0.002), accent: 0.8 });
  }
  structure.push({ w: 1.2, s: disc([c[0], c[1] + h * 1.8, c[2]], [0, 1, 0], R) });
  return { structure, nodes };
}

/** Analytics panel: frame, bars and a trend with an anomaly window. */
export function chartPanel(c: Vec3, W: number, H: number, anomaly = true): ShapeParts {
  const z = c[2];
  const structure: Part[] = [
    { w: 3, s: boxEdges(c, [W, H, 0.004], 0.003) },
    { w: 1.2, s: segment([c[0] - W * 0.44, c[1] - H * 0.36, z], [c[0] + W * 0.44, c[1] - H * 0.36, z], 0.002) },
  ];
  const nodes: Part[] = [];
  const n = 22;
  const pts: Vec3[] = Array.from({ length: n }, (_, i) => {
    const k = i / (n - 1);
    const drift = anomaly && k > 0.62 ? Math.pow((k - 0.62) / 0.38, 1.6) * H * 0.38 : 0;
    return [c[0] - W * 0.42 + k * W * 0.84, c[1] - H * 0.14 + Math.sin(i * 1.15) * H * 0.07 + drift, z + 0.005];
  });
  pts.slice(0, -1).forEach((p, i) => {
    const hot = anomaly && i / (n - 1) > 0.6;
    (hot ? nodes : structure).push({ w: hot ? 0.5 : 0.6, s: segment(p, pts[i + 1], 0.003), accent: hot ? 1 : 0 });
  });
  if (anomaly) {
    // anomaly window
    const x0 = c[0] - W * 0.42 + 0.6 * W * 0.84;
    nodes.push({ w: 1.2, s: boxEdges([(x0 + c[0] + W * 0.42) / 2, c[1] + H * 0.02, z + 0.006], [c[0] + W * 0.42 - x0, H * 0.62, 0.002], 0.002), accent: 0.7 });
  }
  // normal band
  structure.push(
    { w: 0.8, s: segment([c[0] - W * 0.42, c[1] - H * 0.02, z], [c[0] + W * 0.42, c[1] - H * 0.02, z], 0.002) },
    { w: 0.8, s: segment([c[0] - W * 0.42, c[1] - H * 0.26, z], [c[0] + W * 0.42, c[1] - H * 0.26, z], 0.002) },
  );
  return { structure, nodes };
}

/** Health gauge: arc track with a filled portion. */
function gauge(c: Vec3, R: number, value: number): ShapeParts {
  const arc = (from: number, to: number) => (r: () => number): Vec3 => {
    const a = Math.PI * (1.2 - (from + (to - from) * r()) * 1.4);
    return [c[0] + Math.cos(a) * R, c[1] + Math.sin(a) * R, c[2]];
  };
  return {
    structure: [{ w: 2, s: arc(0, 1) }],
    nodes: [{ w: 2 * value, s: arc(0, value), accent: 1 }],
  };
}

/** Enterprise: stacked platform blocks. */
function enterprise(c: Vec3, s = 1): ShapeParts {
  const structure: Part[] = [];
  [0, 1, 2].forEach((i) => structure.push({ w: 2.5, s: boxEdges([c[0], c[1] - 0.2 * s + i * 0.2 * s, c[2]], [0.6 * s - i * 0.08 * s, 0.14 * s, 0.4 * s], 0.003) }));
  return { structure, nodes: [{ w: 0.6, s: sphere([c[0], c[1] + 0.32 * s, c[2]], 0.02 * s), accent: 1 }] };
}

/** Pump and motor skid (horizontal), with the bearing housing instrumented. */
export function pumpSkid(c: Vec3, s = 1): ShapeParts {
  const y = c[1];
  const structure: Part[] = [
    { w: 3, s: boxEdges([c[0], y - 0.32 * s, c[2]], [1.9 * s, 0.08 * s, 0.6 * s], 0.003) },
    { w: 6, s: tube([c[0] - 0.85 * s, y, c[2]], [c[0] + 0.05 * s, y, c[2]], 0.24 * s) },
    { w: 1.5, s: disc([c[0] - 0.85 * s, y, c[2]], [1, 0, 0], 0.24 * s) },
    { w: 1, s: tube([c[0] + 0.05 * s, y, c[2]], [c[0] + 0.25 * s, y, c[2]], 0.06 * s) },
    { w: 5, s: tube([c[0] + 0.25 * s, y, c[2]], [c[0] + 0.62 * s, y, c[2]], 0.3 * s, 0.28 * s) },
    { w: 2, s: tube([c[0] + 0.45 * s, y + 0.28 * s, c[2]], [c[0] + 0.45 * s, y + 0.75 * s, c[2]], 0.08 * s) },
    { w: 2, s: tube([c[0] + 0.62 * s, y, c[2]], [c[0] + 0.95 * s, y, c[2]], 0.08 * s) },
  ];
  for (let i = 0; i < 6; i++) structure.push({ w: 0.6, s: ring([c[0] - 0.75 * s + i * 0.14 * s, y, c[2]], [1, 0, 0], 0.245 * s, 0.002) });
  const nodes: Part[] = [
    { w: 2, s: ring([c[0] + 0.15 * s, y, c[2]], [1, 0, 0], 0.13 * s, 0.003), accent: 1 },
    { w: 1, s: ring([c[0] + 0.15 * s, y, c[2]], [1, 0, 0], 0.18 * s, 0.003), accent: 1 },
    { w: 0.8, s: sphere([c[0] + 0.15 * s, y + 0.14 * s, c[2]], 0.03 * s), accent: 1 },
  ];
  return { structure, nodes };
}

/** A simple operator silhouette. */
function operator(c: Vec3, s = 1): ShapeParts {
  return {
    structure: [
      { w: 3, s: tube(add(c, [0, -0.55 * s, 0]), add(c, [0, 0.05 * s, 0]), 0.15 * s, 0.12 * s) },
      { w: 1.5, s: sphere(add(c, [0, 0.22 * s, 0]), 0.1 * s) },
      { w: 2, s: tube(add(c, [-0.05 * s, -1.15 * s, 0]), add(c, [-0.05 * s, -0.55 * s, 0]), 0.07 * s) },
      { w: 2, s: tube(add(c, [0.07 * s, -1.15 * s, 0]), add(c, [0.07 * s, -0.55 * s, 0]), 0.07 * s) },
    ],
    nodes: [{ w: 1, s: boxEdges(add(c, [0.2 * s, -0.12 * s, 0.12 * s]), [0.2 * s, 0.14 * s, 0.01], 0.002), accent: 1 }],
  };
}

const link = (a: Vec3, b: Vec3, lift = 0.35, w = 1.2): Part => ({
  w,
  s: curve(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + lift, (a[2] + b[2]) / 2 + 0.25], b, 0.004),
  accent: 0.55,
});

const merge = (...xs: { g: number; p: ShapeParts }[]): ShapeParts => ({
  nodes: xs.flatMap((x) => group(x.g, x.p.nodes)),
  structure: xs.flatMap((x) => group(x.g, x.p.structure)),
});

/* ------------------------------- S2 ------------------------------- */
export function connectedScene(): HeroScene {
  const field = { g: 0, p: { nodes: [] as Part[], structure: [] as Part[] } };
  const arm = armParts({ at: [-2.2, -1.25, 0.2], s: 0.3 }, false);
  field.p.nodes.push(...arm.nodes);
  field.p.structure.push(...arm.structure.map((p) => ({ ...p, w: p.w * 0.6 })));
  // CNC enclosure and a conveyor with parts
  field.p.structure.push(
    { w: 4, s: boxEdges([-0.9, -1.55, 0.2], [0.7, 0.62, 0.5], 0.003) },
    { w: 2, s: boxSurface([-0.9, -1.55, 0.46], [0.6, 0.5, 0.001]) },
    { w: 3, s: boxEdges([0.55, -1.75, 0.3], [1.5, 0.12, 0.34], 0.003) },
    ...[0.05, 0.45, 0.85].map((x) => ({ w: 1, s: boxSurface([x, -1.6, 0.3], [0.16, 0.16, 0.16]) })),
  );
  field.p.nodes.push({ w: 0.8, s: sphere([-0.9, -1.15, 0.2], 0.03), accent: 1 });

  const plc = cabinet([-1.95, 0.05, 0], 0.85);
  const scada = monitor([-0.55, 0.15, 0.1], 0.95, 'mimic');
  const edge = edgeBox([0.9, -0.2, 0.1], 1.1);
  const mes = monitor([-1.95, 1.65, -0.1], 0.8, 'list');
  const data = database([-0.45, 1.55, -0.1], 1.0);
  const ai = chartPanel([1.0, 1.65, -0.1], 0.9, 0.55, false);
  const ent = enterprise([2.35, 1.55, -0.1], 1.0);

  const links: Part[] = [
    link([-2.2, -0.95, 0.2], [-1.95, -0.42, 0]),
    link([-0.9, -1.2, 0.2], [-1.6, -0.3, 0.1]),
    link([-1.6, 0.2, 0.1], [-0.95, 0.15, 0.1], 0.15),
    link([-1.6, -0.1, 0.1], [0.65, -0.2, 0.1], 0.35),
    link([0.55, -1.65, 0.3], [0.9, -0.32, 0.1], 0.1),
    link([1.1, -0.08, 0.1], [-0.45, 1.25, -0.1], 0.45),
    link([-0.2, 1.6, -0.1], [0.55, 1.6, -0.1], 0.12),
    link([-0.7, 1.6, -0.1], [-1.55, 1.65, -0.1], 0.12),
    link([1.45, 1.65, -0.1], [2.05, 1.6, -0.1], 0.12),
  ];
  const s = merge(
    field,
    { g: 1, p: { nodes: [...plc.nodes, ...scada.nodes], structure: [...plc.structure, ...scada.structure] } },
    { g: 2, p: edge },
    { g: 3, p: { nodes: [...mes.nodes, ...data.nodes, ...ai.nodes, ...ent.nodes], structure: [...mes.structure, ...data.structure, ...ai.structure, ...ent.structure] } },
    { g: 4, p: { nodes: links, structure: [{ w: 3, s: floorGrid([0, -1.85, 0], 3.2, 0.26) }] } },
  );
  return {
    ...s,
    anchors: [
      { id: 's2-field', label: 'Machines & sensors', pos: [-1.5, -1.0, 0.3], g: 0 },
      { id: 's2-plc', label: 'PLC / DCS', pos: [-1.95, 0.6, 0], g: 1 },
      { id: 's2-scada', label: 'SCADA / HMI', pos: [-0.55, 0.55, 0.1], g: 1 },
      { id: 's2-edge', label: 'Edge systems', pos: [0.9, 0.05, 0.1], g: 2 },
      { id: 's2-mes', label: 'MES', pos: [-1.95, 2.0, -0.1], g: 3 },
      { id: 's2-data', label: 'Industrial data services', pos: [-0.45, 1.95, -0.1], g: 3 },
      { id: 's2-ai', label: 'AI & analytics', pos: [1.0, 2.0, -0.1], g: 3 },
      { id: 's2-ent', label: 'Enterprise platforms', pos: [2.35, 1.95, -0.1], g: 3 },
    ],
  };
}

/* ------------------------------- S3 ------------------------------- */
export function intelligenceScene(): HeroScene {
  const pump = pumpSkid([-0.9, -0.85, 0.1], 1.25);
  const panel = chartPanel([0.9, 1.05, -0.2], 2.0, 1.05, true);
  const g = gauge([-1.55, 1.05, -0.2], 0.42, 0.62);
  const linkParts: Part[] = [
    { w: 2, s: curve([-0.7, -0.6, 0.1], [-0.2, 0.3, 0.2], [0.0, 0.55, -0.2], 0.004), accent: 0.6 },
    { w: 1.2, s: curve([-0.7, -0.6, 0.1], [-1.2, 0.2, 0.0], [-1.55, 0.62, -0.2], 0.004), accent: 0.6 },
  ];
  const s = merge(
    { g: 0, p: { nodes: [], structure: pump.structure } },
    { g: 1, p: { nodes: pump.nodes, structure: [] } },
    { g: 2, p: panel },
    { g: 3, p: g },
    { g: 4, p: { nodes: linkParts, structure: [{ w: 3, s: floorGrid([0, -1.3, 0], 2.8, 0.26) }] } },
  );
  return {
    ...s,
    anchors: [
      { id: 's3-asset', label: 'Cooling pump P-102', pos: [-2.0, -1.25, 0.4], g: 0 },
      { id: 's3-bearing', label: 'Bearing vibration · 3.4σ', pos: [-0.55, -0.35, 0.1], g: 1 },
      { id: 's3-trend', label: 'Anomaly window', pos: [1.55, 1.75, -0.2], g: 2 },
      { id: 's3-health', label: 'Health index 62 / 100', pos: [-1.55, 1.6, -0.2], g: 3 },
    ],
  };
}

/* ------------------------------- S4 ------------------------------- */
export function integratedScene(): HeroScene {
  const arm = armParts({ at: [-1.75, -1.0, 0.1], s: 0.42 }, false);
  const net: ShapeParts = { nodes: [], structure: [] };
  const hub: Vec3 = [1.5, -1.05, 0];
  [
    [1.0, -1.25, 0.25],
    [2.0, -1.2, -0.1],
    [1.6, -0.6, 0.1],
    [1.15, -0.75, -0.2],
  ].forEach((p) => {
    net.structure.push({ w: 1, s: segment(hub, p as Vec3, 0.003) });
    net.nodes.push({ w: 0.6, s: sphere(p as Vec3, 0.05), accent: 1 });
  });
  net.nodes.push({ w: 1, s: sphere(hub, 0.08), accent: 1 });
  const intel = chartPanel([1.5, 1.05, -0.1], 1.3, 0.75, true);
  const screen = monitor([-1.65, 1.15, -0.1], 0.85, 'trend');
  const op = operator([-0.75, 1.05, 0.2], 0.62);
  // the loop: asset → data → intelligence → decision → approved action
  const loop: Part[] = [
    { w: 3, s: curve([-1.0, -1.35, 0.1], [0.1, -1.75, 0.3], [1.0, -1.3, 0.2], 0.005), accent: 0.75 },
    { w: 3, s: curve([2.05, -0.75, 0], [2.6, 0.2, 0], [2.0, 0.85, -0.1], 0.005), accent: 0.75 },
    { w: 3, s: curve([0.8, 1.15, -0.1], [0.1, 1.6, 0], [-1.15, 1.35, -0.1], 0.005), accent: 0.75 },
    { w: 3, s: curve([-1.9, 0.75, -0.1], [-2.6, 0.0, 0.1], [-2.05, -0.55, 0.1], 0.005), accent: 0.9 },
  ];
  const s = merge(
    { g: 0, p: { nodes: arm.nodes, structure: arm.structure.map((p) => ({ ...p, w: p.w * 0.7 })) } },
    { g: 1, p: net },
    { g: 2, p: intel },
    { g: 3, p: { nodes: [...screen.nodes, ...op.nodes], structure: [...screen.structure, ...op.structure] } },
    { g: 4, p: { nodes: loop, structure: [{ w: 3, s: floorGrid([0, -1.6, 0], 3.0, 0.26) }] } },
  );
  return {
    ...s,
    anchors: [
      { id: 's4-asset', label: '1 · Physical asset', pos: [-1.75, -0.35, 0.1], g: 0 },
      { id: 's4-data', label: '2 · Data & context', pos: [1.6, -0.45, 0], g: 1 },
      { id: 's4-intel', label: '3 · Intelligence', pos: [1.5, 1.55, -0.1], g: 2 },
      { id: 's4-decision', label: '4 · Operator decision', pos: [-1.2, 1.75, -0.1], g: 3 },
      { id: 's4-action', label: '5 · Approved action', pos: [-2.55, 0.05, 0.1], g: 4 },
    ],
  };
}

/* =================================================================== */
/* V3.2 hero: Engineer · Secure & Connect · Understand · Integrate       */
/* =================================================================== */

/** Vertical process tank with level indication and outlet pipe. */
function tank(c: Vec3, s = 1, level = 0.62): ShapeParts {
  const R = 0.32 * s, H = 0.95 * s;
  return {
    structure: [
      { w: 5, s: tube([c[0], c[1] - H / 2, c[2]], [c[0], c[1] + H / 2, c[2]], R) },
      { w: 1.2, s: disc([c[0], c[1] + H / 2, c[2]], [0, 1, 0], R) },
      { w: 1, s: segment([c[0] + R, c[1] - H * 0.35, c[2]], [c[0] + R + 0.45 * s, c[1] - H * 0.35, c[2]], 0.012) },
      { w: 0.8, s: ring([c[0] + R + 0.25 * s, c[1] - H * 0.35, c[2]], [1, 0, 0], 0.05 * s, 0.003) },
    ],
    nodes: [{ w: 2, s: ring([c[0], c[1] - H / 2 + H * level, c[2]], [0, 1, 0], R * 1.02, 0.003), accent: 1 }],
  };
}

/** Field sensor: small instrument head on a stem. */
const sensorAt = (p: Vec3): Part[] => [
  { w: 0.4, s: segment([p[0], p[1] - 0.12, p[2]], p, 0.004) },
  { w: 0.5, s: sphere(p, 0.035), accent: 1 },
];

/** A firewall / security boundary: a vertical dotted wall with a conduit opening. */
function firewall(x: number, y0: number, y1: number, z0: number, z1: number, gapY: number): ShapeParts {
  const structure: Part[] = [];
  const h = y1 - y0;
  structure.push({
    w: 6,
    s: (r) => {
      for (let i = 0; i < 8; i++) {
        const y = y0 + r() * h;
        if (Math.abs(y - gapY) < 0.16) continue;
        return [x + (r() - 0.5) * 0.02, y, z0 + r() * (z1 - z0)];
      }
      return [x, y0, z0];
    },
  });
  return { structure, nodes: [{ w: 1.2, s: ring([x, gapY, (z0 + z1) / 2], [1, 0, 0], 0.14, 0.003), accent: 1 }] };
}

/** Zone outline on the floor. */
const zoneFrame = (c: Vec3, size: Vec3): Part => ({ w: 2.2, s: boxEdges(c, size, 0.002), accent: 0.25 });

/** Autonomous mobile robot with a small arm. */
function amr(c: Vec3, s = 1): ShapeParts {
  const arm = armParts({ at: [c[0] - 0.05 * s, c[1] + 0.85 * s, c[2]], s: 0.2 * s }, false);
  return {
    structure: [
      { w: 3, s: boxEdges([c[0], c[1], c[2]], [0.7 * s, 0.22 * s, 0.5 * s], 0.003) },
      { w: 2, s: boxSurface([c[0], c[1] + 0.11 * s, c[2]], [0.68 * s, 0.001, 0.48 * s]) },
      ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => ({ w: 0.6, s: ring([c[0] + sx * 0.25 * s, c[1] - 0.12 * s, c[2] + sz * 0.26 * s], [0, 0, 1], 0.07 * s, 0.003) }) as Part)),
      ...arm.structure.map((p) => ({ ...p, w: p.w * 0.25 })),
    ],
    nodes: [{ w: 0.6, s: ring([c[0], c[1] - 0.2 * s, c[2]], [0, 1, 0], 0.55 * s, 0.003), accent: 0.6 }, ...arm.nodes.map((p) => ({ ...p, w: p.w * 0.3 }))],
  };
}

const flow = (pts: Vec3[], accent = 0.9, w = 1.4): Part[] =>
  pts.slice(0, -1).map((p, i) => ({ w, s: segment(p, pts[i + 1], 0.004), accent }));

/* S1 — ENGINEER: a controlled process cell */
export function engineerScene(): HeroScene {
  const arm = armParts({ at: [-0.95, -0.55, 0.25], s: 0.48 }, false);
  const tk = tank([1.45, -1.05, -0.2], 1.05, 0.62);
  const plc = cabinet([-2.15, -0.2, -0.45], 0.95);
  const hmi = monitor([0.25, 1.55, -0.6], 1.15, 'mimic');
  const conveyorParts: Part[] = [
    { w: 3, s: boxEdges([0.15, -1.55, 0.55], [2.1, 0.12, 0.36], 0.003) },
    ...[-0.6, -0.05, 0.5].map((x) => ({ w: 0.9, s: boxSurface([x, -1.4, 0.55], [0.17, 0.17, 0.17]) }) as Part),
  ];
  const sensors: Part[] = [...sensorAt([1.95, -0.5, -0.2]), ...sensorAt([0.8, -1.25, 0.55]), ...sensorAt([-0.4, -1.25, 0.55]), ...sensorAt([1.45, -1.62, 0.15])];
  const signalLinks: Part[] = [
    ...flow([[-1.75, -0.2, -0.3], [-1.2, -1.05, 0.2]], 0.5, 0.8),
    ...flow([[-1.75, 0.0, -0.3], [1.1, -0.6, -0.2]], 0.5, 0.8),
    ...flow([[-1.8, 0.3, -0.4], [-0.3, 1.3, -0.6]], 0.7, 1),
  ];
  const s = merge(
    { g: 0, p: { nodes: arm.nodes, structure: arm.structure.map((p) => ({ ...p, w: p.w * 0.75 })) } },
    { g: 1, p: { nodes: [...tk.nodes, ...sensors.filter((p) => p.accent)], structure: [...tk.structure, ...conveyorParts, ...sensors.filter((p) => !p.accent)] } },
    { g: 2, p: plc },
    { g: 3, p: hmi },
    { g: 7, p: { nodes: signalLinks, structure: [{ w: 3, s: floorGrid([0, -1.75, 0], 3.2, 0.24) }] } },
  );
  return {
    ...s,
    anchors: [
      { id: 'e-plc', label: 'PLC / DCS · step 4 TRANSFER', pos: [-2.15, 0.45, -0.45], g: 2 },
      { id: 'e-hmi', label: 'SCADA / HMI', pos: [0.25, 2.0, -0.6], g: 3 },
      { id: 'e-pv', label: 'PV level 62 % · SP 60 %', pos: [1.45, -0.32, -0.2], g: 1 },
      { id: 'e-ilk', label: 'Interlock: guard closed ✓', pos: [-0.55, 1.2, 0.25], g: 0 },
      { id: 'e-run', label: 'Conveyor · RUN', pos: [0.15, -1.15, 0.55], g: 1 },
    ],
  };
}

/* S2 — SECURE & CONNECT: zones, conduits and approved flows */
export function secureScene(): HeroScene {
  const plc = cabinet([-2.2, -0.6, 0], 0.7);
  const machines: Part[] = [
    { w: 2, s: boxEdges([-2.25, -1.45, 0.45], [0.55, 0.42, 0.42], 0.003) },
    { w: 1, s: boxSurface([-2.25, -1.45, 0.67], [0.48, 0.36, 0.001]) },
  ];
  const scada = monitor([-0.85, -0.35, 0.1], 0.75, 'mimic');
  const srv: Part[] = [0, 1].map((i) => ({ w: 2, s: boxEdges([-0.85, -1.25 + i * 0.3, -0.25], [0.5, 0.2, 0.42], 0.003) }));
  const edge = edgeBox([0.55, -0.35, 0.05], 0.95);
  const broker = database([0.55, -1.15, 0.05], 0.55);
  const ent = monitor([1.95, 0.05, -0.1], 0.75, 'list');
  const entDb = database([2.0, -1.05, -0.1], 0.6);
  const fw1 = firewall(-1.55, -1.75, 1.0, -0.6, 0.7, -0.35);
  const fw2 = firewall(-0.1, -1.75, 1.0, -0.6, 0.7, -0.4);
  const fw3 = firewall(1.25, -1.75, 1.0, -0.6, 0.7, -0.35);
  const zones: Part[] = [
    zoneFrame([-2.2, -1.75, 0.05], [1.2, 0.01, 1.3]),
    zoneFrame([-0.82, -1.75, 0.05], [1.35, 0.01, 1.3]),
    zoneFrame([0.57, -1.75, 0.05], [1.25, 0.01, 1.3]),
    zoneFrame([1.95, -1.75, 0.05], [1.3, 0.01, 1.3]),
  ];
  // approved flows only pass through conduits (the firewall openings)
  const flows: Part[] = [
    ...flow([[-1.95, -0.45, 0.1], [-1.55, -0.35, 0.05], [-1.2, -0.35, 0.1]]),
    ...flow([[-0.5, -0.4, 0.1], [-0.1, -0.4, 0.05], [0.3, -0.35, 0.05]]),
    ...flow([[0.82, -0.35, 0.05], [1.25, -0.35, 0.05], [1.6, -0.05, -0.1]]),
  ];
  const s = merge(
    { g: 0, p: { nodes: plc.nodes, structure: [...plc.structure, ...machines] } },
    { g: 1, p: { nodes: scada.nodes, structure: [...scada.structure, ...srv] } },
    { g: 2, p: { nodes: [...edge.nodes, ...broker.nodes], structure: [...edge.structure, ...broker.structure] } },
    { g: 3, p: { nodes: [...ent.nodes, ...entDb.nodes], structure: [...ent.structure, ...entDb.structure] } },
    { g: 4, p: { nodes: [...fw1.nodes, ...fw2.nodes, ...fw3.nodes, ...flows], structure: [...fw1.structure, ...fw2.structure, ...fw3.structure, ...zones] } },
  );
  return {
    ...s,
    anchors: [
      { id: 'c-z1', label: 'Zone 1 · Control', pos: [-2.2, -2.0, 0.6], g: 0 },
      { id: 'c-z2', label: 'Zone 2 · SCADA', pos: [-0.85, 0.3, 0.1], g: 1 },
      { id: 'c-dmz', label: 'Industrial DMZ · edge & broker', pos: [0.55, 0.15, 0.05], g: 2 },
      { id: 'c-ent', label: 'Enterprise · MES / ERP / cloud', pos: [1.95, 0.6, -0.1], g: 3 },
      { id: 'c-fw', label: 'Firewall · approved conduit only', pos: [-0.1, 1.15, 0.05], g: 4 },
    ],
  };
}

/* S3 — UNDERSTAND & OPTIMIZE: historian, context, vision, ML */
export function understandScene(): HeroScene {
  const pump = pumpSkid([-1.35, -1.05, 0.25], 0.85);
  const hist = database([-0.15, -0.95, -0.2], 0.8);
  const tree: Part[] = [];
  const root: Vec3 = [-1.4, 1.35, -0.3];
  [
    [-2.0, 0.85, -0.3],
    [-1.4, 0.85, -0.3],
    [-0.8, 0.85, -0.3],
  ].forEach((c) => {
    tree.push({ w: 0.8, s: segment(root, c as Vec3, 0.003) }, { w: 0.8, s: boxEdges(c as Vec3, [0.32, 0.14, 0.02], 0.002) });
  });
  tree.push({ w: 1, s: boxEdges(root, [0.44, 0.16, 0.02], 0.002) });
  const chart = chartPanel([1.1, 1.0, -0.3], 1.55, 0.85, true);
  const cam: Part[] = [
    { w: 1.5, s: boxEdges([1.3, -0.3, 0.35], [0.24, 0.18, 0.3], 0.003) },
    { w: 1, s: segment([1.3, -0.4, 0.45], [1.0, -1.35, 0.6], 0.003), accent: 0.6 },
    { w: 1, s: segment([1.3, -0.4, 0.45], [1.6, -1.35, 0.6], 0.003), accent: 0.6 },
    { w: 1.2, s: boxSurface([1.3, -1.45, 0.6], [0.22, 0.12, 0.22]) },
  ];
  const wo: Part[] = [{ w: 1.4, s: boxEdges([2.1, -0.95, -0.1], [0.55, 0.36, 0.02], 0.002) }, ...flow([[1.9, -0.95, -0.08], [2.25, -0.95, -0.08]], 1, 0.4)];
  const flows: Part[] = [
    ...flow([[-1.25, -0.75, 0.25], [-0.45, -0.75, -0.2]], 0.7, 0.8),
    ...flow([[0.15, -0.6, -0.2], [0.45, 0.6, -0.3]], 0.7, 0.8),
    ...flow([[-0.15, -0.5, -0.2], [-1.4, 1.2, -0.3]], 0.6, 0.8),
    ...flow([[1.6, 0.6, -0.3], [2.1, -0.75, -0.1]], 0.8, 0.8),
  ];
  const s = merge(
    { g: 0, p: pump },
    { g: 1, p: hist },
    { g: 2, p: { nodes: [], structure: tree } },
    { g: 3, p: { nodes: [...chart.nodes, ...wo.filter((p) => p.accent)], structure: [...chart.structure, ...wo.filter((p) => !p.accent)] } },
    { g: 5, p: { nodes: cam.filter((p) => p.accent), structure: cam.filter((p) => !p.accent) } },
    { g: 7, p: { nodes: flows, structure: [{ w: 3, s: floorGrid([0, -1.6, 0], 3.0, 0.24) }] } },
  );
  return {
    ...s,
    anchors: [
      { id: 'u-hist', label: 'Historian · time-series', pos: [-0.15, -0.35, -0.2], g: 1 },
      { id: 'u-ctx', label: 'Context model · site / area / asset', pos: [-1.4, 1.65, -0.3], g: 2 },
      { id: 'u-ml', label: 'ML anomaly score · 3.4σ', pos: [1.35, 1.6, -0.3], g: 3 },
      { id: 'u-vis', label: 'Vision inspection', pos: [1.3, -0.05, 0.35], g: 5 },
      { id: 'u-wo', label: 'Maintenance work order', pos: [2.1, -0.6, -0.1], g: 3 },
    ],
  };
}

/* S4 — INTEGRATE & ADVANCE: the whole engineered environment */
export function advanceScene(): HeroScene {
  const arm = armParts({ at: [-2.0, -0.95, 0.3], s: 0.34 }, false);
  const plc = cabinet([-0.95, -0.85, -0.3], 0.62);
  const fw = firewall(-0.25, -1.65, 0.6, -0.55, 0.55, -0.7);
  const edge = edgeBox([0.4, -0.7, 0.05], 0.8);
  const app = monitor([0.25, 1.15, -0.45], 0.9, 'list');
  const ai = chartPanel([1.75, 1.15, -0.4], 1.05, 0.62, true);
  const robot = amr([1.6, -1.25, 0.35], 0.85);
  const loop: Part[] = [
    ...flow([[-1.7, -0.7, 0.3], [-1.2, -0.75, -0.2]], 0.7, 1),
    ...flow([[-0.7, -0.75, -0.2], [-0.25, -0.7, 0.0], [0.15, -0.7, 0.05]], 0.9, 1),
    ...flow([[0.6, -0.6, 0.05], [0.4, 0.75, -0.4]], 0.7, 1),
    ...flow([[0.75, 1.15, -0.45], [1.2, 1.15, -0.4]], 0.7, 1),
    ...flow([[1.8, 0.8, -0.4], [1.7, -0.85, 0.3]], 0.9, 1),
  ];
  const s = merge(
    { g: 0, p: { nodes: arm.nodes, structure: arm.structure.map((p) => ({ ...p, w: p.w * 0.6 })) } },
    { g: 1, p: plc },
    { g: 2, p: { nodes: [...fw.nodes, ...edge.nodes], structure: [...fw.structure, ...edge.structure] } },
    { g: 3, p: { nodes: [...app.nodes, ...ai.nodes], structure: [...app.structure, ...ai.structure] } },
    { g: 4, p: robot },
    { g: 7, p: { nodes: loop, structure: [{ w: 3, s: floorGrid([0, -1.65, 0], 3.1, 0.24) }] } },
  );
  return {
    ...s,
    anchors: [
      { id: 'a-phys', label: 'Physical systems', pos: [-2.1, 0.35, 0.3], g: 0 },
      { id: 'a-ctl', label: 'PLC / DCS', pos: [-0.95, -1.35, -0.3], g: 1 },
      { id: 'a-sec', label: 'Secure edge & DMZ', pos: [0.15, -0.15, 0.05], g: 2 },
      { id: 'a-app', label: 'Applications & AI', pos: [1.0, 1.75, -0.45], g: 3 },
      { id: 'a-rob', label: 'Robotics & physical AI', pos: [1.6, -0.55, 0.35], g: 4 },
    ],
  };
}
