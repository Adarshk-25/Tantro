/**
 * The four conceptual states of the hero particle system.
 *
 * Every state is built from the same three point categories in the same order:
 *   [ nodes | structure | dust ]
 * so index i always plays the same role. Joints become network nodes, network
 * nodes become neurons, neurons become the nodes of the integrated system. That
 * shared ordering is what gives the morph its continuity.
 */

import { mulberry32 } from '../random';
import {
  boxEdges,
  boxSurface,
  curve,
  disc,
  fillParts,
  floorGrid,
  ring,
  segment,
  sphere,
  tube,
  volume,
  type Part,
  type Rand,
  type Vec3,
} from './sampling';

export type ShapeParts = { nodes: Part[]; structure: Part[] };

/** A network/neural node: a tight core plus a thin orbit ring. */
function nodeSampler(c: Vec3, r: number) {
  const core = sphere(c, r * 0.35);
  const orbit = ring(c, [0.3, 1, 0.5], r * 1.6, 0.004);
  return (rand: Rand): Vec3 => (rand() < 0.45 ? core(rand) : orbit(rand));
}
type Xf = { at: Vec3; s: number };

const xf = (p: Vec3, t: Xf): Vec3 => [t.at[0] + p[0] * t.s, t.at[1] + p[1] * t.s, t.at[2] + p[2] * t.s];

/* ---------------------------------------------------------------- */
/* State 1 — articulated industrial arm on a work cell               */
/* ---------------------------------------------------------------- */

export function armParts(t: Xf = { at: [0, 0, 0], s: 1 }, withFloor = true): ShapeParts {
  const P = (p: Vec3) => xf(p, t);
  const R = (v: number) => v * t.s;
  const base: Vec3 = P([0, -2, 0]);
  const shoulder: Vec3 = P([0, -0.85, 0]);
  const elbow: Vec3 = P([0.95, 1.05, 0.05]);
  const wrist: Vec3 = P([2.35, 0.55, 0.1]);
  const flange: Vec3 = P([2.55, 0.15, 0.1]);
  const zAxis: Vec3 = [0, 0, 1];
  const fore = [wrist[0] - elbow[0], wrist[1] - elbow[1], wrist[2] - elbow[2]] as Vec3;

  const structure: Part[] = [
    // base plinth
    { w: 6, s: ring(base, [0, 1, 0], R(1.15), 0.01) },
    { w: 4, s: ring(P([0, -1.78, 0]), [0, 1, 0], R(1.15), 0.01) },
    { w: 5, s: disc(P([0, -1.78, 0]), [0, 1, 0], R(1.1)) },
    // turret
    { w: 7, s: tube(P([0, -1.78, 0]), P([0, -1.05, 0]), R(0.55), R(0.5)) },
    // upper arm, forearm, wrist
    { w: 16, s: tube(shoulder, elbow, R(0.34), R(0.27)) },
    { w: 11, s: tube(elbow, wrist, R(0.24), R(0.17)) },
    { w: 3, s: tube(wrist, flange, R(0.14), R(0.12)) },
    // gripper fingers
    { w: 1.5, s: boxEdges(P([2.62, -0.2, -0.06]), [R(0.07), R(0.55), R(0.06)]) },
    { w: 1.5, s: boxEdges(P([2.62, -0.2, 0.26]), [R(0.07), R(0.55), R(0.06)]) },
    // the part being handled, on the work surface
    { w: 3, s: boxSurface(P([2.62, -1.72, 0.1]), [R(0.5), R(0.3), R(0.5)]) },
    // cable loom along the arm
    { w: 2, s: curve(P([-0.3, -1.2, -0.3]), P([0.2, 0.6, -0.45]), P([1.2, 1.25, -0.25]), 0.01) },
  ];
  if (withFloor) structure.push({ w: 12, s: floorGrid(P([0.6, -2.05, 0]), R(3.4), R(0.22)) });

  const nodes: Part[] = [
    { w: 3, s: ring(shoulder, zAxis, R(0.48), 0.01), accent: 1 },
    { w: 3, s: ring(elbow, zAxis, R(0.38), 0.01), accent: 1 },
    { w: 2, s: ring(wrist, fore, R(0.24), 0.01), accent: 1 },
    { w: 2, s: ring(P([0, -1.4, 0]), [0, 1, 0], R(0.6), 0.01), accent: 1 },
    // sensors placed around the cell
    { w: 1, s: sphere(P([-1.7, -1.9, 1.2]), R(0.07)), accent: 1 },
    { w: 1, s: sphere(P([2.9, -1.9, -1.3]), R(0.07)), accent: 1 },
    { w: 1, s: sphere(P([-1.4, -1.9, -1.6]), R(0.07)), accent: 1 },
    { w: 1, s: sphere(P([3.6, -1.9, 1.1]), R(0.07)), accent: 1 },
  ];
  return { nodes, structure };
}

/* ---------------------------------------------------------------- */
/* State 2 — layered industrial network (field → enterprise)          */
/* ---------------------------------------------------------------- */

function networkLayout(r: Rand, t: Xf) {
  const levels = [
    { y: -1.9, count: 10, spread: 3.0 },
    { y: -0.65, count: 6, spread: 2.3 },
    { y: 0.6, count: 3, spread: 1.3 },
    { y: 1.85, count: 4, spread: 1.9 },
  ];
  const nodes: Vec3[][] = levels.map((L, li) =>
    Array.from({ length: L.count }, (_, i) => {
      const a = (i / L.count) * Math.PI * 2 + li * 0.6;
      const rad = L.spread * (0.55 + 0.45 * ((i * 7919) % 5) / 4);
      return xf([Math.cos(a) * rad, L.y, Math.sin(a) * rad * 0.75] as Vec3, t);
    }),
  );
  const links: [Vec3, Vec3][] = [];
  for (let li = 0; li < nodes.length - 1; li++) {
    const lower = nodes[li];
    const upper = nodes[li + 1];
    lower.forEach((n) => {
      // connect to nearest node(s) in the layer above — layered, not all-to-all
      const sorted = [...upper].sort(
        (a, b) => Math.hypot(a[0] - n[0], a[2] - n[2]) - Math.hypot(b[0] - n[0], b[2] - n[2]),
      );
      links.push([n, sorted[0]]);
      if (r() < 0.35 && sorted[1]) links.push([n, sorted[1]]);
    });
  }
  // a few lateral links inside each layer
  nodes.forEach((layer) =>
    layer.forEach((n, i) => {
      if (layer.length > 2 && i % 2 === 0) links.push([n, layer[(i + 1) % layer.length]]);
    }),
  );
  return { levels, nodes, links };
}

function networkParts(t: Xf = { at: [0, 0, 0], s: 1 }): ShapeParts {
  const r = mulberry32(42);
  const { levels, nodes, links } = networkLayout(r, t);
  const structure: Part[] = links.map(([a, b]) => ({
    w: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]),
    s: segment(a, b, 0.008),
  }));
  levels.forEach((L) => {
    const c = xf([0, L.y, 0], t);
    structure.push({ w: 2.2 * L.spread, s: ring(c, [0, 1, 0], (L.spread + 0.7) * t.s, 0.006) });
    structure.push({ w: 1.6 * L.spread, s: floorGrid(c, (L.spread + 0.5) * t.s, 0.32 * t.s) });
  });
  const nodeParts: Part[] = nodes.flat().map((n, i) => ({
    w: 1,
    s: nodeSampler(n, (i < 10 ? 0.075 : 0.11) * t.s),
    accent: 1,
  }));
  return { nodes: nodeParts, structure };
}

/* ---------------------------------------------------------------- */
/* State 3 — computational lattice (layered neural structure)         */
/* ---------------------------------------------------------------- */

export function latticeParts(t: Xf = { at: [0, 0, 0], s: 1 }): ShapeParts {
  const r = mulberry32(7);
  const spec = [
    { x: -2.6, n: 8, rad: 1.0 },
    { x: -1.3, n: 13, rad: 1.65 },
    { x: 0, n: 17, rad: 2.0 },
    { x: 1.3, n: 13, rad: 1.65 },
    { x: 2.6, n: 5, rad: 0.75 },
  ];
  const layers: Vec3[][] = spec.map((L) =>
    Array.from({ length: L.n }, (_, i) => {
      // phyllotaxis disc keeps neurons evenly spaced
      const k = i + 0.5;
      const a = k * 2.39996;
      const rad = Math.sqrt(k / L.n) * L.rad;
      return xf([L.x, Math.cos(a) * rad, Math.sin(a) * rad], t);
    }),
  );
  const structure: Part[] = [];
  for (let li = 0; li < layers.length - 1; li++) {
    layers[li].forEach((a) =>
      layers[li + 1].forEach((b) => {
        if (r() < 0.32) structure.push({ w: 1, s: segment(a, b, 0.006) });
      }),
    );
  }
  spec.forEach((L) => {
    structure.push({ w: 10, s: ring(xf([L.x, 0, 0], t), [1, 0, 0], (L.rad + 0.25) * t.s, 0.006) });
  });
  const nodes: Part[] = layers.flat().map((n) => ({ w: 1, s: nodeSampler(n, 0.07 * t.s), accent: 1 }));
  return { nodes, structure };
}

/* ---------------------------------------------------------------- */
/* State 4 — integrated system: machine, network and model in a loop  */
/* ---------------------------------------------------------------- */

function integratedParts(): ShapeParts {
  const arm = armParts({ at: [-2.3, 0.35, 0], s: 0.56 }, false);
  const net = networkParts({ at: [0.2, -1.05, 0], s: 0.6 });
  const brain = latticeParts({ at: [2.35, 1.25, 0], s: 0.42 });

  // The loop: machine → network → model → back to the machine.
  const loop: Part[] = [
    { w: 6, s: curve([-1.6, -0.6, 0.2], [-1.2, -1.9, 0.6], [-0.6, -1.9, 0.2], 0.01), accent: 0.85 },
    { w: 7, s: curve([1.1, -1.4, 0], [2.4, -1.2, 0.3], [2.3, 0.3, 0], 0.01), accent: 0.85 },
    { w: 8, s: curve([1.4, 1.75, 0], [0, 2.9, 0.2], [-1.8, 1.3, 0], 0.01), accent: 0.85 },
  ];
  return {
    nodes: [...share(arm.nodes, 0.4), ...share(net.nodes, 0.3), ...share(brain.nodes, 0.3)],
    structure: [
      ...share(arm.structure, 0.3),
      ...share(net.structure, 0.26),
      ...share(brain.structure, 0.2),
      ...share(loop, 0.16),
      { w: 0.08, s: floorGrid([0, -2.2, 0], 4.2, 0.3) },
    ],
  };
}

/** Rescale a group of parts so its weights sum to `total`. */
function share(parts: Part[], total: number): Part[] {
  const sum = parts.reduce((a, p) => a + p.w, 0) || 1;
  return parts.map((p) => ({ ...p, w: (p.w / sum) * total }));
}

/* ---------------------------------------------------------------- */

export type HeroStates = {
  count: number;
  positions: Float32Array[];
  accents: Float32Array[];
  seeds: Float32Array;
};

export const HERO_STATE_COUNT = 4;

export function buildHeroStates(count: number): HeroStates {
  const nodeCount = Math.round(count * 0.13);
  const dustCount = Math.round(count * 0.06);
  const structCount = count - nodeCount - dustCount;
  const builders = [() => armParts({ at: [-0.6, 0, 0], s: 1 }), () => networkParts(), () => latticeParts(), () => integratedParts()];

  const positions: Float32Array[] = [];
  const accents: Float32Array[] = [];
  builders.forEach((build, i) => {
    const r = mulberry32(1000 + i * 17);
    const pos = new Float32Array(count * 3);
    const acc = new Float32Array(count);
    const { nodes, structure } = build();
    fillParts(pos, acc, 0, nodeCount, nodes, r);
    fillParts(pos, acc, nodeCount, structCount, structure, r);
    // Dust shares the same seed in every state, so it barely moves: a stable depth field.
    fillParts(pos, acc, nodeCount + structCount, dustCount, [{ w: 1, s: volume([0, 0, -1], [16, 10, 9]) }], mulberry32(99));
    positions.push(pos);
    accents.push(acc);
  });

  const seeds = new Float32Array(count);
  const sr = mulberry32(5);
  for (let i = 0; i < count; i++) seeds[i] = sr();
  return { count, positions, accents, seeds };
}
