'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneCanvas } from '@/components/three/SceneCanvas';
import type { InnovationStage, StageId } from '@/content/innovation';
import type { QualityTier } from '@/lib/device';
import { PART, buildPointHumanoid, loadHumanoidBuffer, poseHumanoid, snapBudget, type PointHumanoid } from './pointHumanoid';

export type ViewId = 'front' | 'threeq' | 'side';
export const VIEW_AZIMUTH: Record<ViewId, number> = { front: 0, threeq: -0.6, side: -1.4 };

const BLUE = new THREE.Color('#5b9bf5');
const CYAN = new THREE.Color('#3cc4d2');
const TEAL = new THREE.Color('#2ec79e');
const SILVER = new THREE.Color('#dfe7f3');
const TIER_CAP: Record<QualityTier, number> = { low: 20009, medium: 51909, high: 96157 };
const FOV = 28;
const TARGET_Y = 0.93;

/** Reach → hold → return, every 5 s. */
function reachCycle(t: number) {
  const p = (t % 5) / 5;
  const ss = (a: number, b: number, x: number) => {
    const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return k * k * (3 - 2 * k);
  };
  return ss(0.05, 0.4, p) * (1 - ss(0.62, 0.95, p));
}

type Fade = { mat: THREE.Material & { opacity: number }; base: number };
function layer() {
  const group = new THREE.Group();
  const mats: Fade[] = [];
  const add = <T extends THREE.Object3D>(o: T, base: number) => {
    group.add(o);
    o.traverse((c) => {
      const m = (c as THREE.Mesh).material as (THREE.Material & { opacity: number }) | undefined;
      if (m && !mats.some((x) => x.mat === m)) {
        m.transparent = true;
        m.depthWrite = false;
        mats.push({ mat: m, base });
      }
    });
    return o;
  };
  return { group, mats, add };
}
const lineMat = (c: THREE.Color, o = 1) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o });
const dotsMat = (c: THREE.Color, size: number, o = 1) =>
  new THREE.PointsMaterial({ color: c, size, sizeAttenuation: true, transparent: true, opacity: o, depthWrite: false });

function boxEdges(c: THREE.Vector3, s: THREE.Vector3, m: THREE.LineBasicMaterial) {
  const l = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s.x, s.y, s.z)), m);
  l.position.copy(c);
  return l;
}

/** Points on a box surface (for small objects in the scene). */
function boxCloud(c: THREE.Vector3, s: THREE.Vector3, n: number) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const face = Math.floor(Math.random() * 6);
    const u = Math.random() - 0.5;
    const v = Math.random() - 0.5;
    const sg = face % 2 ? 0.5 : -0.5;
    const ax = Math.floor(face / 2);
    const p = ax === 0 ? [sg, u, v] : ax === 1 ? [u, sg, v] : [u, v, sg];
    a.set([c.x + p[0] * s.x, c.y + p[1] * s.y, c.z + p[2] * s.z], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  return g;
}

function World({
  tier,
  stage,
  reducedMotion,
  labels,
  labelEls,
  view,
  resetKey,
  onReady,
}: {
  tier: QualityTier;
  stage: StageId;
  reducedMotion: boolean;
  labels: InnovationStage['labels'];
  labelEls: React.RefObject<(HTMLElement | null)[]>;
  view: ViewId;
  resetKey: number;
  onReady: (count: number) => void;
}) {
  const { camera, size, gl } = useThree();
  const [human, setHuman] = useState<PointHumanoid | null>(null);
  const fade = useRef<Record<StageId, number>>({ perception: 0, reasoning: 0, planning: 0, motion: 0, supervision: 0 });
  const reach = useRef(0);
  const orbit = useRef({ az: VIEW_AZIMUTH[view], target: VIEW_AZIMUTH[view], drag: 0, el: 0.06, elTarget: 0.06 });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Budget from the figure's on-screen height: aim for ~2.2 px dot spacing.
  useEffect(() => {
    let cancelled = false;
    const figurePx = size.height * 0.84 * Math.min(window.devicePixelRatio || 1, 2);
    const mPerPx = 1.85 / figurePx;
    const spacing = 2.9 * mPerPx;
    const budget = Math.min(TIER_CAP[tier], Math.round(96000 * Math.pow(0.0033 / spacing, 2)));
    const dist = 1.05 / Math.tan(((FOV / 2) * Math.PI) / 180);
    const dotPx = 1.85;
    loadHumanoidBuffer()
      .then((buf) => {
        if (cancelled) return;
        const h = buildPointHumanoid(buf, snapBudget(budget), dotPx * dist);
        setHuman(h);
        onReady(h.count);
      })
      .catch(() => onReady(0));
    return () => {
      cancelled = true;
    };
    // build once per tier; resizes keep the existing cloud
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);
  useEffect(() => () => human?.dispose(), [human]);

  useEffect(() => {
    orbit.current.target = VIEW_AZIMUTH[view];
  }, [view, resetKey]);

  // Constrained drag-to-orbit on the canvas.
  useEffect(() => {
    const el = gl.domElement;
    let down = false;
    let lastX = 0;
    let lastY = 0;
    const pd = (e: PointerEvent) => {
      down = true;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const pm = (e: PointerEvent) => {
      if (!down) return;
      const o = orbit.current;
      o.target = Math.max(-1.6, Math.min(1.6, o.target + (e.clientX - lastX) * 0.008));
      o.elTarget = Math.max(-0.05, Math.min(0.35, o.elTarget + (e.clientY - lastY) * 0.004));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const pu = () => (down = false);
    el.addEventListener('pointerdown', pd);
    el.addEventListener('pointermove', pm);
    el.addEventListener('pointerup', pu);
    el.addEventListener('pointercancel', pu);
    el.style.touchAction = 'pan-y';
    el.style.cursor = 'grab';
    return () => {
      el.removeEventListener('pointerdown', pd);
      el.removeEventListener('pointermove', pm);
      el.removeEventListener('pointerup', pu);
      el.removeEventListener('pointercancel', pu);
    };
  }, [gl]);
  useEffect(() => {
    orbit.current.elTarget = 0.06;
  }, [resetKey]);

  // Scene props and per-stage overlays, built once the figure exists.
  const W = useMemo(() => {
    if (!human) return null;
    const scene = new THREE.Group();
    scene.add(human.root);
    const anchors: Record<string, THREE.Object3D> = {};
    const anchor = (name: string, parent: THREE.Object3D, p: THREE.Vector3) => {
      const o = new THREE.Object3D();
      o.position.copy(p);
      parent.add(o);
      anchors[name] = o;
    };
    // body anchors
    anchor('eye', human.joints[PART.head], new THREE.Vector3(0, 0.1, 0.11));
    anchor('shoulder', human.joints[PART.upperArmR], new THREE.Vector3(0.08, 0.02, 0));
    anchor('hand', human.joints[PART.handR], new THREE.Vector3(0.01, -0.1, 0.03));
    anchor('core', human.joints[PART.torso], new THREE.Vector3(0, 0.31, 0.11));

    // where the hand lands at full reach → place the work object there
    poseHumanoid(human, 1, 0, 0);
    human.root.updateMatrixWorld(true);
    const reachHand = anchors.hand.getWorldPosition(new THREE.Vector3());
    poseHumanoid(human, 0, 0, 0);
    human.root.updateMatrixWorld(true);
    const restHand = anchors.hand.getWorldPosition(new THREE.Vector3());

    // Dotted floor
    const fl: number[] = [];
    for (let r = 0.14; r < 1.25; r += 0.045)
      for (let a = 0; a < Math.PI * 2; a += 0.022 / r) fl.push(Math.cos(a) * r, 0.0, Math.sin(a) * r);
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.Float32BufferAttribute(fl, 3));
    scene.add(
      new THREE.Points(
        fg,
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { uPR: { value: 1 } },
          vertexShader:
            'uniform float uPR; varying float vF; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv; vF = 1.0 - smoothstep(0.3, 1.25, length(position.xz)); gl_PointSize = 5.5*uPR/-mv.z; }',
          fragmentShader:
            'varying float vF; void main(){ if (length(gl_PointCoord-0.5)>0.5) discard; gl_FragColor = vec4(0.62,0.72,0.86, 0.32*vF); }',
        }),
      ),
    );

    // Minimal work shelf with two objects (target and obstacle)
    const top = reachHand.y - 0.085;
    const shelfC = new THREE.Vector3(reachHand.x + 0.08, top, reachHand.z);
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.012, 0.3),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#5b9bf5'), transparent: true, opacity: 0.06, depthWrite: false }),
    );
    shelf.position.copy(shelfC);
    scene.add(shelf, boxEdges(shelfC, new THREE.Vector3(0.42, 0.012, 0.3), lineMat(new THREE.Color('#7f9cc8'), 0.35)));
    const targetC = new THREE.Vector3(reachHand.x, top + 0.04, reachHand.z);
    scene.add(new THREE.Points(boxCloud(targetC, new THREE.Vector3(0.075, 0.06, 0.06), 700), dotsMat(SILVER, 0.0045, 0.9)));
    const obstacleC = new THREE.Vector3(reachHand.x + 0.15, top + 0.07, reachHand.z - 0.08);
    scene.add(new THREE.Points(boxCloud(obstacleC, new THREE.Vector3(0.06, 0.13, 0.06), 700), dotsMat(SILVER, 0.0045, 0.6)));
    const objAnchor = (name: string, p: THREE.Vector3) => {
      const o = new THREE.Object3D();
      o.position.copy(p);
      scene.add(o);
      anchors[name] = o;
    };
    objAnchor('target', targetC.clone().add(new THREE.Vector3(0, 0.05, 0)));
    objAnchor('obstacle', obstacleC.clone().add(new THREE.Vector3(0, 0.09, 0)));

    /* Perception: sensor frustum, detections, depth scan plane */
    const per = layer();
    const eyeW = anchors.eye.getWorldPosition(new THREE.Vector3());
    const fr = 0.2;
    const corners = [
      [-fr, -0.7 * fr],
      [fr, -0.7 * fr],
      [fr, 0.7 * fr],
      [-fr, 0.7 * fr],
    ].map(([dx, dz]) => new THREE.Vector3(shelfC.x + dx, top + 0.006, shelfC.z + dz));
    const fp: number[] = [];
    corners.forEach((c, i) => {
      const nx = corners[(i + 1) % 4];
      fp.push(...eyeW.toArray(), ...c.toArray(), ...c.toArray(), ...nx.toArray());
    });
    const fgeo = new THREE.BufferGeometry();
    fgeo.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
    per.add(new THREE.LineSegments(fgeo, lineMat(CYAN, 0.65)), 0.65);
    per.add(boxEdges(targetC, new THREE.Vector3(0.11, 0.09, 0.09), lineMat(CYAN, 1)), 1);
    per.add(boxEdges(obstacleC, new THREE.Vector3(0.09, 0.16, 0.09), lineMat(BLUE, 0.9)), 0.9);
    const scanPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.34),
      new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }),
    );
    scanPlane.rotation.x = -Math.PI / 2;
    scanPlane.position.copy(shelfC);
    per.add(scanPlane, 0.12);

    /* Reasoning: compact task graph beside the head */
    const rea = layer();
    const headW = human.joints[PART.head].getWorldPosition(new THREE.Vector3());
    const gc = new THREE.Vector3(headW.x - 0.4, headW.y + 0.05, headW.z + 0.18);
    const gN = [
      [0, 0.09, 0],
      [-0.11, 0.02, 0.03],
      [0.1, 0.03, -0.02],
      [-0.06, -0.08, 0.02],
      [0.07, -0.08, 0.03],
      [0, 0, 0.07],
    ].map(([x, y, z]) => new THREE.Vector3(gc.x + x, gc.y + y, gc.z + z));
    const gE: [number, number][] = [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 5],
      [5, 0],
    ];
    gN.forEach((p, i) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(i === 5 ? 0.012 : 0.008, 12, 8), new THREE.MeshBasicMaterial({ color: i === 5 ? TEAL : BLUE }));
      s.position.copy(p);
      rea.add(s, 1);
    });
    const ep: number[] = [];
    gE.forEach(([a, b]) => ep.push(...gN[a].toArray(), ...gN[b].toArray()));
    ep.push(...gN[2].toArray(), headW.x - 0.06, headW.y + 0.08, headW.z + 0.05);
    const egeo = new THREE.BufferGeometry();
    egeo.setAttribute('position', new THREE.Float32BufferAttribute(ep, 3));
    rea.add(new THREE.LineSegments(egeo, lineMat(BLUE, 0.55)), 0.55);
    rea.add(boxEdges(targetC, new THREE.Vector3(0.11, 0.09, 0.09), lineMat(TEAL, 1)), 1);
    const pulses = [0, 1, 2].map(() => rea.add(new THREE.Mesh(new THREE.SphereGeometry(0.005, 8, 6), new THREE.MeshBasicMaterial({ color: CYAN })), 1));
    objAnchor('graph', gN[0].clone().add(new THREE.Vector3(0, 0.05, 0)));

    /* Planning: collision-aware end-effector path */
    const pla = layer();
    const path = new THREE.CatmullRomCurve3([
      restHand.clone(),
      restHand.clone().lerp(reachHand, 0.35).add(new THREE.Vector3(0.03, 0.1, 0.12)),
      reachHand.clone().lerp(restHand, 0.45).add(new THREE.Vector3(0.06, 0.12, 0.1)),
      reachHand.clone().add(new THREE.Vector3(0, 0.09, 0)),
      reachHand.clone(),
    ]);
    const pp: number[] = [];
    for (let i = 0; i <= 140; i++) pp.push(...path.getPoint(i / 140).toArray());
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3));
    pla.add(new THREE.Points(pgeo, dotsMat(CYAN, 0.009, 1)), 1);
    [0.33, 0.66, 1].forEach((t) => {
      const w = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.0018, 6, 32), new THREE.MeshBasicMaterial({ color: TEAL }));
      w.position.copy(path.getPoint(t));
      w.rotation.x = Math.PI / 2;
      pla.add(w, 1);
    });
    const coll = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 12), new THREE.MeshBasicMaterial({ color: BLUE, wireframe: true }));
    coll.position.copy(obstacleC);
    pla.add(coll, 0.22);
    objAnchor('waypoint', path.getPoint(0.66));

    /* Supervision: protective zone on the floor + approval link */
    const sup = layer();
    for (let i = 0; i < 72; i++) {
      const seg = new THREE.Mesh(
        new THREE.RingGeometry(0.98, 1.0, 4, 1, (i / 72) * Math.PI * 2, (Math.PI * 2) / 72 / 1.8),
        new THREE.MeshBasicMaterial({ color: TEAL, side: THREE.DoubleSide }),
      );
      seg.rotation.x = -Math.PI / 2;
      seg.position.y = 0.003;
      sup.add(seg, 0.85);
    }
    objAnchor('zone', new THREE.Vector3(-0.72, 0.05, 0.7));
    objAnchor('operator', new THREE.Vector3(-0.5, 1.45, 0.3));

    scene.add(per.group, rea.group, pla.group, sup.group);
    return {
      scene,
      anchors,
      layers: { perception: per, reasoning: rea, planning: pla, motion: { mats: [] as Fade[] }, supervision: sup } as Record<StageId, { mats: Fade[] }>,
      scanPlane,
      top,
      pulses,
      gN,
      gE,
      floorMat: (scene.children.find((c) => c instanceof THREE.Points) as THREE.Points).material as THREE.ShaderMaterial,
    };
  }, [human]);

  useFrame((st, dt) => {
    if (!human || !W) return;
    const t = reducedMotion ? 2 : st.clock.elapsedTime;
    const motion = reducedMotion ? 0 : 1;
    const f = fade.current;
    (Object.keys(f) as StageId[]).forEach((k) => (f[k] += ((k === stage ? 1 : 0) - f[k]) * (1 - Math.exp(-dt * 5))));
    (Object.keys(W.layers) as StageId[]).forEach((k) => W.layers[k].mats.forEach((m) => (m.mat.opacity = m.base * f[k])));
    W.scanPlane.position.y = W.top + 0.01 + ((t * 0.5) % 1) * 0.14;
    W.pulses.forEach((p, i) => {
      const [a, b] = W.gE[(Math.floor(t * 0.9) + i * 2) % W.gE.length];
      p.position.lerpVectors(W.gN[a], W.gN[b], (t * 0.9 + i * 0.33) % 1);
    });

    // Pose for the stage: subtle, physically plausible
    const want = stage === 'motion' ? (reducedMotion ? 0.8 : reachCycle(t)) : stage === 'planning' ? 0.1 : stage === 'supervision' ? 0.35 : 0;
    reach.current += (want - reach.current) * (1 - Math.exp(-dt * 4));
    poseHumanoid(human, reach.current, t, motion);
    const head = human.joints[PART.head];
    const hy = stage === 'supervision' ? -0.5 : stage === 'reasoning' ? 0.08 : 0.42;
    const hx = stage === 'supervision' || stage === 'reasoning' ? 0.04 : 0.28;
    head.rotation.y += (hy - head.rotation.y) * (1 - Math.exp(-dt * 3));
    head.rotation.x += (hx - head.rotation.x) * (1 - Math.exp(-dt * 3));

    // Part highlights
    const hl = (parts: number[], v: number) =>
      parts.forEach((p) => {
        const u = human.materials[p].uniforms.uHighlight;
        u.value += (v - u.value) * (1 - Math.exp(-dt * 4));
      });
    hl([PART.head], stage === 'perception' || stage === 'reasoning' ? 0.55 : 0);
    hl([PART.upperArmR, PART.forearmR, PART.handR], stage === 'motion' ? 0.55 : stage === 'planning' ? 0.3 : 0);
    hl([PART.torso, PART.neck, PART.pelvis, PART.upperArmL, PART.forearmL, PART.handL, PART.thighR, PART.thighL, PART.shinR, PART.shinL, PART.footR, PART.footL], 0);
    human.materials.forEach((m) => {
      m.uniforms.uDim.value += ((stage === 'supervision' ? 0.82 : 1) - m.uniforms.uDim.value) * (1 - Math.exp(-dt * 4));
      m.uniforms.uPixelRatio.value = gl.getPixelRatio();
    });
    human.occluderMat.uniforms.uPixelRatio.value = gl.getPixelRatio();
    W.floorMat.uniforms.uPR.value = gl.getPixelRatio();
    const headMat = human.materials[PART.head].uniforms;
    headMat.uScan.value = stage === 'perception' ? 1 : 0;
    headMat.uScanY.value = 1.66 + Math.sin(t * 2.4) * 0.07;

    // Camera: fit full body, orbit with constraints
    const o = orbit.current;
    o.az += (o.target - o.az) * (1 - Math.exp(-dt * 3));
    o.el += (o.elTarget - o.el) * (1 - Math.exp(-dt * 3));
    const aspect = size.width / Math.max(1, size.height);
    const tanH = Math.tan(((FOV / 2) * Math.PI) / 180);
    const dist = Math.max(1.06 / tanH, 0.92 / (tanH * aspect));
    camera.position.set(Math.sin(o.az) * Math.cos(o.el) * dist, TARGET_Y + Math.sin(o.el) * dist, Math.cos(o.az) * Math.cos(o.el) * dist);
    camera.lookAt(0.12, TARGET_Y, 0);

    // Screen-space callouts
    labels.forEach((l, i) => {
      const el = labelEls.current?.[i];
      const a = W.anchors[l.anchor];
      if (!el || !a) return;
      a.getWorldPosition(tmp).project(camera);
      const x = (tmp.x * 0.5 + 0.5) * size.width;
      const y = (-tmp.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      el.style.opacity = tmp.z < 1 ? String(Math.min(1, f[stage] * 1.3)) : '0';
    });
  });

  return W ? <primitive object={W.scene} /> : null;
}

export default function HumanoidScene(props: {
  tier: QualityTier;
  active: boolean;
  stage: StageId;
  reducedMotion: boolean;
  labels: InnovationStage['labels'];
  labelEls: React.RefObject<(HTMLElement | null)[]>;
  view: ViewId;
  resetKey: number;
  onReady: (count: number) => void;
}) {
  return (
    <SceneCanvas
      tier={props.tier}
      active={props.active}
      className="absolute inset-0"
      camera={{ position: [1.6, 1.0, 4.2], fov: FOV }}
      label={`An original humanoid robot rendered as a dense point cloud, showing the ${props.stage} stage of a physical AI system.`}
    >
      <World {...props} />
    </SceneCanvas>
  );
}
