/**
 * Six recognisable forms for the capability explorer, one per discipline.
 * Same point count and category order in every form, so the explorer can morph freely.
 */

import type { CapabilityShape } from '@/content/capabilities';
import { mulberry32 } from '../random';
import { boxEdges, boxSurface, fillParts, floorGrid, ring, segment, sphere, type Part, type Rand, type Vec3 } from './sampling';
import { cabinet, chartPanel, database, edgeBox, monitor, pumpSkid } from './heroScenes';
import { armParts } from './shapes';

type Form = { nodes: Part[]; structure: Part[] };
const merge = (...fs: Form[]): Form => ({ nodes: fs.flatMap((f) => f.nodes), structure: fs.flatMap((f) => f.structure) });
const scaleForm = (f: Form, k: number, at: Vec3 = [0, 0, 0]): Form => {
  const m = (p: Part): Part => ({ ...p, s: (r: Rand) => { const v = p.s(r); return [at[0] + v[0] * k, at[1] + v[1] * k, at[2] + v[2] * k]; } });
  return { nodes: f.nodes.map(m), structure: f.structure.map(m) };
};

/** Automation: a controlled production cell — robot, conveyor, PLC cabinet. */
function automation(): Form {
  return scaleForm(automationCell(), 0.78, [0.05, 0.1, 0]);
}
function automationCell(): Form {
  const arm = armParts({ at: [-0.75, 0.05, 0], s: 0.42 }, false);
  const plc = cabinet([1.0, -0.15, -0.35], 0.75);
  return merge(arm, plc, {
    structure: [
      { w: 3, s: boxEdges([0.35, -0.82, 0.45], [1.7, 0.1, 0.32], 0.003) },
      ...[-0.2, 0.25, 0.7].map((x) => ({ w: 0.8, s: boxSurface([x, -0.7, 0.45], [0.14, 0.14, 0.14]) }) as Part),
      { w: 3, s: floorGrid([0, -0.9, 0], 1.6, 0.16) },
      { w: 1, s: segment([0.75, -0.3, -0.2], [0.35, -0.75, 0.3], 0.003) },
    ],
    nodes: [{ w: 0.6, s: sphere([1.0, 0.15, -0.18], 0.025), accent: 1 }],
  });
}

/** Connectivity: industrial assets feeding a governed data network. */
function connectivity(): Form {
  const hub: Vec3 = [0, 0.55, 0];
  const assets: Vec3[] = [
    [-1.2, -0.75, 0.3],
    [-0.4, -0.85, 0.45],
    [0.4, -0.85, 0.45],
    [1.2, -0.75, 0.3],
  ];
  const structure: Part[] = [{ w: 3, s: floorGrid([0, -1.05, 0.2], 1.6, 0.16) }];
  const nodes: Part[] = [];
  assets.forEach((a, i) => {
    structure.push({ w: 2, s: boxEdges(a, [0.34, 0.4, 0.3], 0.003) }, { w: 1, s: boxSurface(a, [0.3, 0.36, 0.28]) });
    structure.push({ w: 1.6, s: segment([a[0], a[1] + 0.22, a[2]], [a[0] * 0.55, -0.05, a[2] * 0.4], 0.003) });
    nodes.push({ w: 0.8, s: sphere([a[0] * 0.55, -0.05, a[2] * 0.4], 0.04), accent: 1 });
    structure.push({ w: 1.6, s: segment([a[0] * 0.55, -0.05, a[2] * 0.4], hub, 0.003) });
    if (i < 3) structure.push({ w: 0.8, s: segment([a[0] * 0.55, -0.05, a[2] * 0.4], [assets[i + 1][0] * 0.55, -0.05, assets[i + 1][2] * 0.4], 0.003) });
  });
  nodes.push({ w: 2, s: ring(hub, [0, 1, 0], 0.16, 0.003), accent: 1 }, { w: 1, s: sphere(hub, 0.06), accent: 1 });
  [-0.8, 0, 0.8].forEach((x) => {
    structure.push({ w: 1.6, s: segment(hub, [x, 1.15, -0.2], 0.003) }, { w: 1.5, s: boxEdges([x, 1.2, -0.2], [0.42, 0.18, 0.04], 0.003) });
  });
  return { structure, nodes };
}

/** Intelligence: the equipment and the model that watches it. */
function intelligence(): Form {
  return merge(scaleForm(pumpSkid([0, 0, 0], 1), 0.62, [-0.35, -0.65, 0.3]), chartPanel([0.25, 0.55, -0.2], 1.9, 0.95, true), {
    structure: [{ w: 2, s: floorGrid([0, -0.95, 0.2], 1.5, 0.16) }],
    nodes: [{ w: 1.2, s: segment([-0.25, -0.55, 0.3], [-0.2, 0.08, -0.2], 0.003), accent: 0.7 }],
  });
}

/** Digital platforms: a layered industrial application interface. */
function platforms(): Form {
  const structure: Part[] = [];
  const nodes: Part[] = [];
  [-0.35, 0, 0.35].forEach((z, layer) => {
    const c: Vec3 = [layer * 0.18 - 0.18, layer * 0.14 - 0.14, z];
    structure.push({ w: 4, s: boxEdges(c, [2.2, 1.4, 0.004], 0.003) });
    if (layer === 2) {
      structure.push({ w: 1.5, s: boxSurface([c[0], c[1] + 0.62, c[2]], [2.2, 0.16, 0.001]) });
      structure.push({ w: 1.2, s: boxSurface([c[0] - 0.95, c[1] - 0.08, c[2]], [0.3, 1.2, 0.001]) });
      [-0.45, 0.05, 0.55].forEach((x) => {
        structure.push({ w: 1.2, s: boxEdges([c[0] + x, c[1] + 0.32, c[2] + 0.01], [0.42, 0.24, 0.002], 0.002) });
        nodes.push({ w: 0.6, s: segment([c[0] + x - 0.12, c[1] + 0.3, c[2] + 0.02], [c[0] + x + 0.1, c[1] + 0.3, c[2] + 0.02], 0.004), accent: 1 });
      });
      const pts: Vec3[] = Array.from({ length: 10 }, (_, i) => [c[0] - 0.65 + i * 0.16, c[1] - 0.3 + Math.sin(i * 0.9) * 0.12, c[2] + 0.02]);
      pts.slice(0, -1).forEach((p, i) => nodes.push({ w: 0.5, s: segment(p, pts[i + 1], 0.003), accent: 1 }));
      [0, 1, 2, 3, 4].forEach((i) => structure.push({ w: 0.6, s: boxSurface([c[0] + 0.85, c[1] - 0.48 + i * 0.03, c[2] + 0.01], [0.04 + i * 0.03, 0.02, 0.001]) }));
    }
  });
  return { structure, nodes };
}

/** Physical AI: the humanoid point cloud (or an arm fallback until it loads). */
function physicalAI(humanoid?: Float32Array): Form {
  if (!humanoid) return armParts({ at: [-0.5, 0.1, 0], s: 0.5 }, false);
  const n = humanoid.length / 3;
  return {
    structure: [
      {
        w: 1,
        s: (r: Rand): Vec3 => {
          const i = Math.floor(r() * n);
          // fit the 1.8 m figure into the frame
          return [humanoid[i * 3] * 1.25, (humanoid[i * 3 + 1] - 0.92) * 1.25, humanoid[i * 3 + 2] * 1.25];
        },
      },
    ],
    nodes: [
      { w: 1, s: ring([0, (1.66 - 0.92) * 1.25, 0], [0, 1, 0], 0.14, 0.003), accent: 1 },
      { w: 1, s: ring([0, (0.0 - 0.92) * 1.25 + 0.01, 0], [0, 1, 0], 0.55, 0.004), accent: 0.6 },
    ],
  };
}

/** Infrastructure: OT, edge and compute layers with segmentation. */
function infrastructure(): Form {
  const structure: Part[] = [];
  const nodes: Part[] = [];
  const layers = [
    { y: -0.85, label: 'ot' },
    { y: 0.0, label: 'edge' },
    { y: 0.85, label: 'compute' },
  ];
  layers.forEach((L, i) => {
    structure.push({ w: 3, s: boxEdges([0, L.y, 0], [2.4, 0.02, 1.2], 0.003) }, { w: 1.5, s: floorGrid([0, L.y, 0], 1.0, 0.2, false) });
  });
  // OT: machines
  [-0.8, 0, 0.8].forEach((x) => structure.push({ w: 1.2, s: boxEdges([x, -0.68, 0.1], [0.32, 0.32, 0.3], 0.003) }));
  // Edge: two gateways + firewall
  const e1 = edgeBox([-0.55, 0.12, 0.1], 0.8);
  const e2 = edgeBox([0.55, 0.12, 0.1], 0.8);
  structure.push(...e1.structure, ...e2.structure);
  nodes.push(...e1.nodes, ...e2.nodes);
  // Compute: racks
  [-0.6, 0, 0.6].forEach((x) => {
    structure.push({ w: 1.6, s: boxEdges([x, 1.15, -0.1], [0.36, 0.58, 0.36], 0.003) });
    for (let u = 0; u < 5; u++) nodes.push({ w: 0.3, s: sphere([x + 0.12, 0.92 + u * 0.1, 0.09], 0.012), accent: 1 });
  });
  // conduits between zones (segmentation)
  [-0.55, 0.55].forEach((x) => {
    nodes.push({ w: 1, s: segment([x, -0.85, 0.1], [x, 0.0, 0.1], 0.004), accent: 0.7 }, { w: 1, s: segment([x, 0.0, 0.1], [x * 0.6, 0.85, -0.1], 0.004), accent: 0.7 });
  });
  return { structure, nodes };
}

/** SCADA / HMI / MES: a control-room screen wall above redundant servers. */
function screens(): Form {
  const parts: Form[] = [
    monitor([-0.85, 0.55, -0.2], 0.95, 'mimic'),
    monitor([0.0, 0.62, -0.3], 0.95, 'trend'),
    monitor([0.85, 0.55, -0.2], 0.95, 'list'),
  ];
  const structure: Part[] = [{ w: 3, s: floorGrid([0, -0.95, 0.2], 1.5, 0.16) }];
  [-0.35, 0.35].forEach((x) =>
    [0, 1, 2].forEach((u) => structure.push({ w: 1, s: boxEdges([x, -0.75 + u * 0.18, 0.2], [0.5, 0.14, 0.42], 0.003) })),
  );
  const nodes: Part[] = [-0.35, 0.35].map((x) => ({ w: 0.6, s: segment([x - 0.2, -0.44, 0.42], [x + 0.2, -0.44, 0.42], 0.004), accent: 1 }));
  nodes.push({ w: 0.8, s: segment([-0.35, -0.3, 0.2], [0, 0.32, -0.3], 0.003), accent: 0.6 }, { w: 0.8, s: segment([0.35, -0.3, 0.2], [0, 0.32, -0.3], 0.003), accent: 0.6 });
  return merge(...parts, { structure, nodes });
}

/** OT cybersecurity: zones separated by firewall walls, one approved conduit. */
function shield(): Form {
  const structure: Part[] = [];
  const nodes: Part[] = [];
  const xs = [-1.05, 0, 1.05];
  xs.forEach((x, i) => {
    structure.push({ w: 2.2, s: boxEdges([x, -0.85, 0], [0.9, 0.01, 1.0], 0.002) });
    structure.push({ w: 1.5, s: boxEdges([x, -0.55, 0.05], [0.36, 0.42, 0.3], 0.003) });
    nodes.push({ w: 0.5, s: sphere([x, -0.25, 0.05], 0.035), accent: 1 });
    if (i < 2) {
      const wx = x + 0.525;
      structure.push({
        w: 5,
        s: (r: Rand): Vec3 => {
          for (let k = 0; k < 6; k++) {
            const y = -0.85 + r() * 1.6;
            if (Math.abs(y + 0.35) < 0.12) continue;
            return [wx, y, -0.5 + r() * 1.0];
          }
          return [wx, 0.5, 0];
        },
      });
      nodes.push({ w: 1, s: ring([wx, -0.35, 0], [1, 0, 0], 0.11, 0.003), accent: 1 });
    }
  });
  nodes.push({ w: 2, s: segment([-1.05, -0.35, 0.05], [1.05, -0.35, 0.05], 0.004), accent: 0.9 });
  // shield outline above
  nodes.push({
    w: 2,
    s: (r: Rand): Vec3 => {
      const t = r();
      const a = t * Math.PI;
      return [Math.cos(a) * 0.38 * (1 - 0.15 * Math.sin(a)), 0.75 - Math.sin(a) * 0.5 - (t > 0.5 ? 0 : 0), 0];
    },
    accent: 1,
  });
  structure.push({ w: 1.2, s: segment([-0.38, 0.75, 0], [0.38, 0.75, 0], 0.003) });
  return { structure, nodes };
}

export const CAPABILITY_ORDER: CapabilityShape[] = ['gear', 'screens', 'shield', 'mesh', 'lattice', 'strata', 'rack', 'arm'];

export function buildCapabilityForms(count: number, humanoid?: Float32Array) {
  const builders: Record<CapabilityShape, () => Form> = {
    gear: automation,
    screens,
    shield,
    mesh: connectivity,
    lattice: intelligence,
    strata: platforms,
    arm: () => physicalAI(humanoid),
    rack: infrastructure,
  };
  const nodeCount = Math.round(count * 0.12);
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
