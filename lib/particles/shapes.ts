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
  const Y: Vec3 = [0, 1, 0];
  const Z: Vec3 = [0, 0, 1];
  const shoulder: Vec3 = [0, -0.85, 0];
  const elbow: Vec3 = [0.95, 1.05, 0.05];
  const wrist: Vec3 = [2.3, 0.6, 0.08];
  const flange: Vec3 = [2.55, 0.2, 0.08];
  const lerp3 = (a: Vec3, b: Vec3, k: number): Vec3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const dir = (a: Vec3, b: Vec3): Vec3 => [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const upperDir = dir(shoulder, elbow);
  const foreDir = dir(elbow, wrist);
  const toolDir = dir(wrist, flange);
  /** A joint housing: a short cylinder along z with capped, seamed ends. */
  const housing = (c: Vec3, r: number, half: number, w: number): Part[] => [
    { w: w, s: tube(P([c[0], c[1], c[2] - half]), P([c[0], c[1], c[2] + half]), R(r)) },
    { w: w * 0.35, s: disc(P([c[0], c[1], c[2] + half]), Z, R(r)) },
    { w: w * 0.35, s: disc(P([c[0], c[1], c[2] - half]), Z, R(r)) },
  ];

  const structure: Part[] = [
    // base plinth with seams and a lightly filled top
    { w: 7, s: tube(P([0, -2.05, 0]), P([0, -1.86, 0]), R(1.05)) },
    { w: 3, s: ring(P([0, -1.86, 0]), Y, R(1.05), 0.003) },
    { w: 3, s: ring(P([0, -2.05, 0]), Y, R(1.05), 0.003) },
    { w: 3, s: disc(P([0, -1.86, 0]), Y, R(1.02)) },
    // J1 turret
    { w: 9, s: tube(P([0, -1.86, 0]), P([0, -1.22, 0]), R(0.62), R(0.55)) },
    { w: 1.5, s: ring(P([0, -1.55, 0]), Y, R(0.6), 0.003) },
    // J2 shoulder housing + side motor pod
    ...housing(shoulder, 0.45, 0.5, 9),
    { w: 2.5, s: tube(P([-0.12, -0.85, 0.5]), P([-0.12, -0.85, 0.95]), R(0.2)) },
    { w: 0.8, s: disc(P([-0.12, -0.85, 0.95]), Z, R(0.2)) },
    // upper arm link, tapered, with seams near each end
    { w: 20, s: tube(lerp3(P(shoulder), P(elbow), 0.08), P(elbow), R(0.31), R(0.25)) },
    { w: 1.2, s: ring(lerp3(P(shoulder), P(elbow), 0.22), upperDir, R(0.3), 0.003) },
    { w: 1.2, s: ring(lerp3(P(shoulder), P(elbow), 0.86), upperDir, R(0.26), 0.003) },
    // J3 elbow housing and counterweight behind it
    ...housing(elbow, 0.32, 0.36, 6),
    { w: 3, s: tube(P(elbow), lerp3(P(elbow), P(wrist), -0.3), R(0.22), R(0.2)) },
    // forearm
    { w: 13, s: tube(P(elbow), P(wrist), R(0.22), R(0.15)) },
    { w: 1, s: ring(lerp3(P(elbow), P(wrist), 0.78), foreDir, R(0.17), 0.003) },
    // J5 wrist and J6 flange
    ...housing(wrist, 0.17, 0.17, 2.4),
    { w: 2.4, s: tube(P(wrist), P(flange), R(0.13), R(0.11)) },
    { w: 1, s: disc(P(flange), toolDir, R(0.14)) },
    // gripper
    { w: 2, s: boxSurface(P([2.62, 0.02, 0.08]), [R(0.26), R(0.14), R(0.34)]) },
    { w: 1.4, s: boxSurface(P([2.62, -0.22, -0.06]), [R(0.06), R(0.38), R(0.05)]) },
    { w: 1.4, s: boxSurface(P([2.62, -0.22, 0.22]), [R(0.06), R(0.38), R(0.05)]) },
    // dress pack: cable loom following the arm
    { w: 2.5, s: curve(P([-0.35, -1.25, -0.35]), P([0.1, 0.7, -0.5]), P([1.1, 1.32, -0.3]), 0.008) },
  ];
  if (withFloor) {
    // work table with the part being handled
    structure.push(
      { w: 3, s: boxEdges(P([2.62, -1.4, 0.1]), [R(1.3), R(0.06), R(1.1)], 0.003) },
      { w: 1.6, s: boxSurface(P([2.62, -1.37, 0.1]), [R(1.24), R(0.001), R(1.04)]) },
      { w: 1, s: segment(P([2.05, -1.43, -0.38]), P([2.05, -2.05, -0.38]), 0.004) },
      { w: 1, s: segment(P([3.2, -1.43, 0.6]), P([3.2, -2.05, 0.6]), 0.004) },
      { w: 1, s: segment(P([2.05, -1.43, 0.6]), P([2.05, -2.05, 0.6]), 0.004) },
      { w: 3, s: boxSurface(P([2.62, -1.22, 0.1]), [R(0.42), R(0.3), R(0.42)]) },
    );
    // the floor: concentric precision rings and radial gauge lines
    [1.45, 2.25, 3.05, 3.85].forEach((rad, i) =>
      structure.push({ w: 3.2 - i * 0.4, s: ring(P([0, -2.06, 0]), Y, R(rad), 0.002) }),
    );
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const r0 = i % 3 === 0 ? 1.25 : 3.05;
      structure.push({
        w: 0.22,
        s: segment(P([Math.cos(a) * r0, -2.06, Math.sin(a) * r0]), P([Math.cos(a) * 3.85, -2.06, Math.sin(a) * 3.85]), 0.002),
      });
    }
    structure.push({ w: 4, s: floorGrid(P([0, -2.07, 0]), R(4.4), R(0.16)) });
  }

  const nodes: Part[] = [
    { w: 3, s: ring(P([0, -0.85, 0.51]), Z, R(0.45), 0.004), accent: 0.65 },
    { w: 3, s: ring(P([0, -0.85, -0.51]), Z, R(0.45), 0.004), accent: 0.65 },
    { w: 2, s: ring(P([elbow[0], elbow[1], elbow[2] + 0.37]), Z, R(0.32), 0.004), accent: 0.65 },
    { w: 2, s: ring(P([elbow[0], elbow[1], elbow[2] - 0.37]), Z, R(0.32), 0.004), accent: 0.65 },
    { w: 1.5, s: ring(P(flange), toolDir, R(0.16), 0.003), accent: 1 },
    { w: 2.5, s: ring(P([0, -1.22, 0]), Y, R(0.56), 0.003), accent: 0.65 },
    // instrumented points around the cell
    { w: 1, s: nodeSampler(P([-1.9, -2.0, 1.4]), R(0.09)), accent: 1 },
    { w: 1, s: nodeSampler(P([-1.5, -2.0, -1.8]), R(0.09)), accent: 1 },
    { w: 1, s: nodeSampler(P([3.5, -2.0, -1.5]), R(0.09)), accent: 1 },
    { w: 1, s: nodeSampler(P([2.62, -0.98, 0.1]), R(0.08)), accent: 1 },
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
