'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SceneCanvas } from '@/components/three/SceneCanvas';
import type { InnovationLayer } from '@/content/innovation';
import type { QualityTier } from '@/lib/device';
import { mulberry32 } from '@/lib/random';
import { fillParts, ring, segment, sphere, tube, type Part, type Vec3 } from '@/lib/particles/sampling';

type LayerId = InnovationLayer['id'];

const BONE = new THREE.Color('#d9d3c7');
const SIGNAL = new THREE.Color('#e0954a');

function pointsFrom(parts: Part[], count: number, seed: number) {
  const pos = new Float32Array(count * 3);
  const acc = new Float32Array(count);
  fillParts(pos, acc, 0, count, parts, mulberry32(seed));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return g;
}

function linesFrom(pairs: [Vec3, Vec3][]) {
  const arr = new Float32Array(pairs.length * 6);
  pairs.forEach(([a, b], i) => arr.set([...a, ...b], i * 6));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  return g;
}

function pointsMaterial(color: THREE.Color, size: number, opacity: number) {
  return new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/** Static body (everything except the animated right arm). */
function buildBody(density: number) {
  const P = (n: number) => Math.round(n * density);
  const parts: Part[] = [
    { w: 18, s: tube([0, 0, 0], [0, 0.95, 0], 0.27, 0.34) }, // torso
    { w: 4, s: ring([0, 0.95, 0], [0, 1, 0], 0.42, 0.01) }, // shoulder girdle
    { w: 3, s: tube([0, 1.0, 0], [0, 1.28, 0], 0.07) }, // neck
    { w: 10, s: sphere([0, 1.55, 0], 0.23) }, // head
    { w: 5, s: tube([-0.42, 1.0, 0], [-0.5, 0.45, 0.02], 0.085, 0.075) }, // left upper arm
    { w: 4, s: tube([-0.5, 0.45, 0.02], [-0.52, -0.05, 0.12], 0.07, 0.055) }, // left forearm
    { w: 6, s: tube([0, -0.02, 0], [0, -0.12, 0], 0.27) }, // pelvis
    { w: 7, s: tube([-0.17, -0.1, 0], [-0.2, -0.85, 0.03], 0.12, 0.1) },
    { w: 7, s: tube([0.17, -0.1, 0], [0.2, -0.85, 0.03], 0.12, 0.1) },
    { w: 6, s: tube([-0.2, -0.85, 0.03], [-0.2, -1.62, 0], 0.09, 0.07) },
    { w: 6, s: tube([0.2, -0.85, 0.03], [0.2, -1.62, 0], 0.09, 0.07) },
    { w: 2, s: segment([-0.2, -1.66, -0.05], [-0.2, -1.66, 0.22], 0.03) },
    { w: 2, s: segment([0.2, -1.66, -0.05], [0.2, -1.66, 0.22], 0.03) },
  ];
  const visor: Part[] = [{ w: 1, s: ring([0, 1.58, 0.16], [0, 0.15, 1], 0.12, 0.008) }];
  return {
    body: pointsFrom(parts, P(3600), 21),
    visor: pointsFrom(visor, 260, 22),
    skeleton: linesFrom([
      [[0, -0.05, 0], [0, 1.0, 0]],
      [[0, 1.0, 0], [0, 1.4, 0]],
      [[-0.42, 1.0, 0], [0.42, 1.0, 0]],
      [[-0.42, 1.0, 0], [-0.5, 0.45, 0.02]],
      [[-0.5, 0.45, 0.02], [-0.52, -0.05, 0.12]],
      [[-0.17, -0.05, 0], [0.17, -0.05, 0]],
      [[-0.17, -0.05, 0], [-0.2, -0.85, 0.03]],
      [[0.17, -0.05, 0], [0.2, -0.85, 0.03]],
      [[-0.2, -0.85, 0.03], [-0.2, -1.62, 0]],
      [[0.2, -0.85, 0.03], [0.2, -1.62, 0]],
    ]),
  };
}

const TARGET: Vec3 = [0.95, -0.05, 0.85];

function Figure({ layer, reducedMotion }: { layer: LayerId; reducedMotion: boolean }) {
  const root = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const reach = useRef(0);
  const fade = useRef<Record<LayerId, number>>({ perception: 0, reasoning: 0, planning: 0, motion: 0, supervision: 0 });

  const geo = useMemo(() => {
    const b = buildBody(1);
    const upper = pointsFrom([{ w: 1, s: tube([0, 0, 0], [0, -0.55, 0], 0.085, 0.075) }], 700, 31);
    const fore = pointsFrom(
      [
        { w: 5, s: tube([0, 0, 0], [0, -0.5, 0], 0.07, 0.055) },
        { w: 1, s: sphere([0, -0.56, 0], 0.06) },
      ],
      600,
      32,
    );
    const jointRings = [0.13, 0.11].map((r, i) => pointsFrom([{ w: 1, s: ring([0, 0, 0], [1, 0, 0], r, 0.004) }], 160, 40 + i));
    const target = pointsFrom([{ w: 1, s: (rr) => [TARGET[0] + (rr() - 0.5) * 0.24, TARGET[1] + (rr() - 0.5) * 0.24, TARGET[2] + (rr() - 0.5) * 0.24] }], 380, 50);
    const table = pointsFrom(
      [
        { w: 3, s: segment([0.6, -0.18, 0.5], [1.3, -0.18, 0.5], 0.004) },
        { w: 3, s: segment([0.6, -0.18, 1.2], [1.3, -0.18, 1.2], 0.004) },
        { w: 3, s: segment([0.6, -0.18, 0.5], [0.6, -0.18, 1.2], 0.004) },
        { w: 3, s: segment([1.3, -0.18, 0.5], [1.3, -0.18, 1.2], 0.004) },
        { w: 2, s: segment([0.65, -0.18, 0.55], [0.65, -1.66, 0.55], 0.004) },
        { w: 2, s: segment([1.25, -0.18, 1.15], [1.25, -1.66, 1.15], 0.004) },
      ],
      500,
      51,
    );
    const floor = pointsFrom([{ w: 1, s: ring([0, -1.68, 0], [0, 1, 0], 1.1, 0.004) }], 700, 52);
    // Perception: frustum from the visor to the target region
    const eye: Vec3 = [0.02, 1.58, 0.2];
    const c = TARGET;
    const d = 0.3;
    const corners: Vec3[] = [
      [c[0] - d, c[1] + d, c[2] - d],
      [c[0] + d, c[1] + d, c[2] + d],
      [c[0] + d, c[1] - d, c[2] + d],
      [c[0] - d, c[1] - d, c[2] - d],
    ];
    const frustum = linesFrom([...corners.map((k) => [eye, k] as [Vec3, Vec3]), ...corners.map((k, i) => [k, corners[(i + 1) % 4]] as [Vec3, Vec3])]);
    // Reasoning: a small relational graph beside the head
    const rr = mulberry32(9);
    const gn: Vec3[] = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return [-1.05 + Math.cos(a) * 0.38, 1.35 + Math.sin(a) * 0.32, (rr() - 0.5) * 0.4];
    });
    const graphEdges: [Vec3, Vec3][] = gn.flatMap((p, i) => [[p, gn[(i + 3) % 8]] as [Vec3, Vec3], [p, gn[(i + 1) % 8]] as [Vec3, Vec3]]);
    graphEdges.push([gn[0], [0, 1.55, 0]]);
    const graphLines = linesFrom(graphEdges);
    const graphNodes = pointsFrom(gn.map((p) => ({ w: 1, s: sphere(p, 0.045) })), 480, 60);
    // Planning: trajectory from the resting hand to the target
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55, -0.1, 0.1),
      new THREE.Vector3(0.95, 0.45, 0.35),
      new THREE.Vector3(1.1, 0.35, 0.75),
      new THREE.Vector3(TARGET[0], TARGET[1] + 0.2, TARGET[2]),
    ]);
    const trajPts = curve.getPoints(60);
    const traj = pointsFrom(
      trajPts.slice(0, -1).map((p, i) => ({
        w: 1,
        s: segment([p.x, p.y, p.z], [trajPts[i + 1].x, trajPts[i + 1].y, trajPts[i + 1].z], 0.004),
      })),
      520,
      62,
    );
    const waypoints = pointsFrom(
      [0, 20, 40, 60].map((i) => ({ w: 1, s: ring([trajPts[i].x, trajPts[i].y, trajPts[i].z], [0, 1, 0], 0.06, 0.003) })),
      320,
      61,
    );
    // Supervision: safety zone + operator with an approval link
    const zone = pointsFrom([{ w: 1, s: ring([0.25, -1.68, 0.25], [0, 1, 0], 1.45, 0.004) }], 1000, 70);
    const operator = pointsFrom(
      [
        { w: 4, s: tube([-1.6, -1.66, 1.6], [-1.6, -0.2, 1.6], 0.13, 0.15) },
        { w: 2, s: sphere([-1.6, 0.05, 1.6], 0.15) },
      ],
      700,
      71,
    );
    const link = linesFrom([[[-1.6, 0.1, 1.6], [0, 1.4, 0]]]);
    return { ...b, upper, fore, jointRings, target, table, floor, frustum, graphLines, graphNodes, traj, waypoints, zone, operator, link };
  }, []);

  const mats = useMemo(
    () => ({
      body: pointsMaterial(BONE, 0.02, 0.5),
      arm: pointsMaterial(BONE, 0.02, 0.55),
      accentPts: pointsMaterial(SIGNAL, 0.028, 0),
      visor: pointsMaterial(SIGNAL, 0.03, 0.9),
      target: pointsMaterial(BONE, 0.022, 0.5),
      faint: pointsMaterial(BONE, 0.018, 0.25),
      skeleton: new THREE.LineBasicMaterial({ color: BONE, transparent: true, opacity: 0.18 }),
      perception: new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0 }),
      reasoning: new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0 }),
      reasoningPts: pointsMaterial(SIGNAL, 0.03, 0),
      planningPts: pointsMaterial(SIGNAL, 0.03, 0),
      motionPts: pointsMaterial(SIGNAL, 0.03, 0),
      supervisionPts: pointsMaterial(SIGNAL, 0.026, 0),
      supervisionLine: new THREE.LineDashedMaterial({ color: SIGNAL, transparent: true, opacity: 0, dashSize: 0.08, gapSize: 0.06 }),
    }),
    [],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const f = fade.current;
    (Object.keys(f) as LayerId[]).forEach((k) => {
      f[k] += ((k === layer ? 1 : 0) - f[k]) * (1 - Math.exp(-delta * 5));
    });
    mats.perception.opacity = f.perception * 0.65;
    mats.target.opacity = 0.35 + f.perception * 0.5 + f.planning * 0.3;
    mats.target.color.copy(BONE).lerp(SIGNAL, f.perception);
    mats.reasoning.opacity = f.reasoning * (0.45 + (reducedMotion ? 0 : 0.2 * Math.sin(t * 3)));
    mats.reasoningPts.opacity = f.reasoning;
    mats.planningPts.opacity = f.planning;
    mats.motionPts.opacity = f.motion;
    mats.supervisionPts.opacity = f.supervision * 0.9;
    mats.supervisionLine.opacity = f.supervision * 0.8;
    mats.arm.color.copy(BONE).lerp(SIGNAL, f.motion * 0.6);

    // The arm reaches when planning or motion are explored; otherwise rests.
    const wantReach = layer === 'motion' ? (reducedMotion ? 1 : 0.5 + 0.5 * Math.sin(t * 1.3)) : layer === 'planning' ? 0.15 : 0;
    reach.current += (wantReach - reach.current) * (1 - Math.exp(-delta * 3));
    const r = reach.current;
    if (shoulder.current && elbow.current) {
      shoulder.current.rotation.set(-1.05 * r, 0, 0.35 + 0.15 * r);
      elbow.current.rotation.set(-0.9 * r - 0.15, 0, 0);
    }
    if (root.current) {
      const target = reducedMotion ? 0 : state.pointer.x * 0.5 + Math.sin(t * 0.25) * 0.12;
      root.current.rotation.y += (target - 0.35 - root.current.rotation.y) * (1 - Math.exp(-delta * 2));
    }
  });

  return (
    <group ref={root} position={[0.15, -0.1, 0]}>
      <points geometry={geo.body} material={mats.body} />
      <points geometry={geo.visor} material={mats.visor} />
      <lineSegments geometry={geo.skeleton} material={mats.skeleton} />
      <points geometry={geo.floor} material={mats.faint} />
      <points geometry={geo.table} material={mats.faint} />
      <points geometry={geo.target} material={mats.target} />

      {/* Animated right arm: shoulder → elbow hierarchy */}
      <group ref={shoulder} position={[0.42, 1.0, 0]}>
        <points geometry={geo.upper} material={mats.arm} />
        <points geometry={geo.jointRings[0]} material={mats.motionPts} />
        <group ref={elbow} position={[0, -0.55, 0]}>
          <points geometry={geo.fore} material={mats.arm} />
          <points geometry={geo.jointRings[1]} material={mats.motionPts} />
        </group>
      </group>

      <lineSegments geometry={geo.frustum} material={mats.perception} />
      <lineSegments geometry={geo.graphLines} material={mats.reasoning} />
      <points geometry={geo.graphNodes} material={mats.reasoningPts} />
      <points geometry={geo.traj} material={mats.planningPts} />
      <points geometry={geo.waypoints} material={mats.planningPts} />
      <points geometry={geo.zone} material={mats.supervisionPts} />
      <points geometry={geo.operator} material={mats.supervisionPts} />
      <lineSegments
        ref={(l: THREE.LineSegments | null) => l?.computeLineDistances()}
        geometry={geo.link}
        material={mats.supervisionLine}
      />
    </group>
  );
}

export default function RoboticsScene({
  layer,
  tier,
  active,
  reducedMotion,
}: {
  layer: LayerId;
  tier: QualityTier;
  active: boolean;
  reducedMotion: boolean;
}) {
  return (
    <SceneCanvas
      tier={tier}
      active={active}
      className="absolute inset-0"
      camera={{ position: [0.4, 0.5, 7.0], fov: 40 }}
      label={`A wireframe humanoid robot built from particles, highlighting the ${layer} layer.`}
    >
      <Figure layer={layer} reducedMotion={reducedMotion} />
    </SceneCanvas>
  );
}
