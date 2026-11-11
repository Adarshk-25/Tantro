/**
 * Six forms for the capability explorer, one per discipline. Same point
 * count and category order in every form, so the explorer can morph freely.
 */

import type { CapabilityShape } from '@/content/capabilities';
import { mulberry32 } from '../random';
import { boxEdges, boxSurface, fillParts, ring, segment, sphere, tube, type Part, type Rand, type Vec3 } from './sampling';
import { armParts, latticeParts } from './shapes';

type Form = { nodes: Part[]; structure: Part[] };

/** A spur gear: tooth contour on both faces, filled web, hub and bore. */
function gearParts(c: Vec3, R: number, teeth: number, th: number, phase = 0): Form {
  const contour: [number, number][] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step + phase;
    const prof: [number, number][] = [
      [a, R * 0.86],
      [a + step * 0.2, R * 0.86],
      [a + step * 0.3, R],
      [a + step * 0.6, R],
      [a + step * 0.7, R * 0.86],
    ];
    prof.forEach(([ang, r]) => contour.push([c[0] + Math.cos(ang) * r, c[1] + Math.sin(ang) * r]));
  }
  const face = (z: number, w: number): Part[] =>
    contour.map((p, i) => {
      const q = contour[(i + 1) % contour.length];
      return { w: Math.hypot(q[0] - p[0], q[1] - p[1]) * w, s: segment([p[0], p[1], c[2] + z], [q[0], q[1], c[2] + z], 0.003) };
    });
  const annulus = (z: number, r0: number, r1: number): Part => ({
    w: R * R * 2.2,
    s: (rnd: Rand): Vec3 => {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(r0 * r0 + rnd() * (r1 * r1 - r0 * r0));
      return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2] + z];
    },
  });
  return {
    structure: [
      ...face(th, 3),
      ...face(-th, 3),
      annulus(th, R * 0.3, R * 0.8),
      { w: R * 2, s: ring([c[0], c[1], c[2] + th], [0, 0, 1], R * 0.8, 0.003) },
      { w: R * 1.2, s: tube([c[0], c[1], c[2] - th * 2.4], [c[0], c[1], c[2] + th * 2.4], R * 0.22) },
    ],
    nodes: [
      { w: 2, s: ring([c[0], c[1], c[2] + th * 2.4], [0, 0, 1], R * 0.22, 0.003), accent: 1 },
      { w: 1, s: ring([c[0], c[1], c[2] + th], [0, 0, 1], R * 0.3, 0.003), accent: 1 },
    ],
  };
}

function gear(): Form {
  const a = gearParts([-0.35, 0.2, 0], 1.0, 16, 0.12);
  const b = gearParts([0.98, -0.62, 0], 0.62, 10, 0.12, 0.16);
  return { structure: [...a.structure, ...b.structure], nodes: [...a.nodes, ...b.nodes] };
}

function mesh(): Form {
  // Ring bus with branch nodes — a redundant industrial network topology.
  const n = 10;
  const ringPts: Vec3[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * 0.95, Math.sin(a) * 0.95, Math.sin(a * 2) * 0.15];
  });
  const structure: Part[] = [];
  const nodes: Part[] = [];
  ringPts.forEach((p, i) => {
    const q = ringPts[(i + 1) % n];
    structure.push({ w: 3, s: segment(p, q, 0.004) });
    structure.push({ w: 1.2, s: segment([0, 0, 0], p, 0.003) });
    nodes.push({ w: 2, s: sphere(p, 0.05), accent: 1 });
    const a = (i / n) * Math.PI * 2;
    [-0.22, 0.22].forEach((da, j) => {
      const leaf: Vec3 = [Math.cos(a + da) * 1.45, Math.sin(a + da) * 1.45, (j ? 0.3 : -0.3) + p[2]];
      structure.push({ w: 1.4, s: segment(p, leaf, 0.003) });
      nodes.push({ w: 0.8, s: sphere(leaf, 0.035), accent: 1 });
      structure.push({ w: 0.6, s: ring(leaf, [0, 0, 1], 0.08, 0.002) });
    });
  });
  structure.push({ w: 4, s: ring([0, 0, 0], [0, 0, 1], 0.95, 0.003) });
  nodes.push({ w: 3, s: sphere([0, 0, 0], 0.09), accent: 1 });
  return { structure, nodes };
}

function strata(): Form {
  const structure: Part[] = [];
  const nodes: Part[] = [];
  [-0.8, -0.27, 0.26, 0.79].forEach((y, i) => {
    const s = 1.25 - i * 0.12;
    structure.push({ w: 6, s: boxEdges([0, y, 0], [s * 1.7, 0.04, s], 0.003) });
    structure.push({ w: 5, s: boxSurface([0, y + 0.02, 0], [s * 1.6, 0.001, s * 0.92]) });
    // application panels floating on each layer
    [-0.45, 0.3].forEach((x, j) => {
      structure.push({ w: 2, s: boxEdges([x * s, y + 0.18, (j - 0.5) * 0.3], [0.5, 0.26, 0.004], 0.002) });
      nodes.push({ w: 1, s: segment([x * s - 0.18, y + 0.22, (j - 0.5) * 0.3], [x * s + 0.12, y + 0.22, (j - 0.5) * 0.3], 0.003), accent: 1 });
    });
  });
  [-0.6, 0.6].forEach((x) => structure.push({ w: 2, s: segment([x, -0.8, 0.35], [x, 0.8, 0.35], 0.003) }));
  return { structure, nodes };
}

function rack(): Form {
  const structure: Part[] = [];
  const nodes: Part[] = [];
  [-0.8, 0, 0.8].forEach((x) => {
    structure.push({ w: 6, s: boxEdges([x, 0, 0], [0.62, 2.0, 0.7], 0.004) });
    for (let u = 0; u < 7; u++) {
      const y = -0.8 + u * 0.27;
      structure.push({ w: 1, s: segment([x - 0.28, y, 0.35], [x + 0.28, y, 0.35], 0.004) });
      nodes.push({ w: 1, s: sphere([x + 0.22, y + 0.08, 0.36], 0.025), accent: 1 });
    }
  });
  structure.push({ w: 3, s: segment([-1.1, 1.05, 0], [1.1, 1.05, 0], 0.01) });
  return { structure, nodes };
}

const builders: Record<CapabilityShape, () => Form> = {
  gear,
  mesh,
  lattice: () => latticeParts({ at: [0, 0, 0], s: 0.42 }),
  strata,
  arm: () => armParts({ at: [-0.55, 0.15, 0], s: 0.52 }, false),
  rack,
};

export const CAPABILITY_ORDER: CapabilityShape[] = ['gear', 'mesh', 'lattice', 'strata', 'arm', 'rack'];

export function buildCapabilityForms(count: number) {
  const nodeCount = Math.round(count * 0.14);
  const forms = CAPABILITY_ORDER.map((key, i) => {
    const pos = new Float32Array(count * 3);
    const acc = new Float32Array(count);
    const r = mulberry32(300 + i);
    const f = builders[key]();
    fillParts(pos, acc, 0, nodeCount, f.nodes, r);
    fillParts(pos, acc, nodeCount, count - nodeCount, f.structure, r);
    return { pos, acc };
  });
  const seeds = new Float32Array(count);
  const r = mulberry32(11);
  for (let i = 0; i < count; i++) seeds[i] = r();
  return { count, forms, seeds };
}
