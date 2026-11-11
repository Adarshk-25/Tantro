/**
 * Six forms for the capability explorer, one per discipline. Same point
 * count and category order in every form, so the explorer can morph freely.
 */

import type { CapabilityShape } from '@/content/capabilities';
import { mulberry32 } from '../random';
import { boxEdges, boxSurface, fillParts, ring, segment, sphere, tube, type Part, type Rand, type Vec3 } from './sampling';
import { armParts, latticeParts } from './shapes';

type Form = { nodes: Part[]; structure: Part[] };

function gear(): Form {
  // Closed tooth contour: root → flank → tip → flank, sampled by segment length.
  const teeth = 12;
  const contour: [number, number][] = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const step = (Math.PI * 2) / teeth;
    const pts: [number, number][] = [
      [a, 0.98],
      [a + step * 0.18, 0.98],
      [a + step * 0.28, 1.18],
      [a + step * 0.62, 1.18],
      [a + step * 0.72, 0.98],
    ];
    pts.forEach(([ang, r]) => contour.push([Math.cos(ang) * r, Math.sin(ang) * r]));
  }
  const face = (z: number): Part[] =>
    contour.map((p, i) => {
      const q = contour[(i + 1) % contour.length];
      return { w: Math.hypot(q[0] - p[0], q[1] - p[1]), s: segment([p[0], p[1], z], [q[0], q[1], z], 0.004) };
    });
  const spokes: Part[] = [0, 1, 2, 3, 4].map((i) => {
    const a = (i / 5) * Math.PI * 2;
    return { w: 0.5, s: segment([Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0], [Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0], 0.03) };
  });
  return {
    structure: [...face(0.16), ...face(-0.16), ...spokes, { w: 1.4, s: ring([0, 0, 0], [0, 0, 1], 0.88, 0.01) }],
    nodes: [
      { w: 2, s: ring([0, 0, 0.16], [0, 0, 1], 0.3, 0.006), accent: 1 },
      { w: 2, s: ring([0, 0, -0.16], [0, 0, 1], 0.3, 0.006), accent: 1 },
      { w: 1, s: tube([0, 0, -0.6], [0, 0, 0.6], 0.1), accent: 1 },
    ],
  };
}

function mesh(): Form {
  const n = 34;
  const pts: Vec3[] = Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = i * 2.39996;
    return [Math.cos(th) * rad * 1.15, y * 1.15, Math.sin(th) * rad * 1.15];
  });
  const structure: Part[] = [];
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => ({ j, d: Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) }))
      .filter((o) => o.j > i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach(({ j, d }) => structure.push({ w: d, s: segment(p, pts[j], 0.006) }));
  });
  return { structure, nodes: pts.map((p) => ({ w: 1, s: sphere(p, 0.05), accent: 1 })) };
}

function strata(): Form {
  const structure: Part[] = [];
  const nodes: Part[] = [];
  [-0.75, -0.25, 0.25, 0.75].forEach((y, i) => {
    const s = 1.2 - i * 0.12;
    structure.push({ w: 6, s: boxEdges([0, y, 0], [s * 1.6, 0.06, s], 0.004) });
    structure.push({ w: 3, s: boxSurface([0, y + 0.03, 0], [s * 1.5, 0.001, s * 0.9]) });
    nodes.push({ w: 1, s: sphere([s * 0.55, y + 0.1, s * 0.3], 0.05), accent: 1 });
    nodes.push({ w: 1, s: sphere([-s * 0.5, y + 0.1, -s * 0.25], 0.05), accent: 1 });
  });
  [-0.5, 0.5].forEach((x) => structure.push({ w: 2, s: segment([x, -0.75, 0.3], [x, 0.75, 0.3], 0.005) }));
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
