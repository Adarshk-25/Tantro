'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SceneCanvas } from '@/components/three/SceneCanvas';
import type { InnovationStage, StageId } from '@/content/innovation';
import type { QualityTier } from '@/lib/device';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { applyPose, buildHumanoid } from './buildHumanoid';

const SIGNAL = new THREE.Color('#ff9a45');

/** Reach → hold → return, every 5 s. */
function reachCycle(t: number) {
  const p = (t % 5) / 5;
  const ss = (a: number, b: number, x: number) => {
    const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return k * k * (3 - 2 * k);
  };
  return ss(0.05, 0.4, p) * (1 - ss(0.62, 0.95, p));
}
const BONE = new THREE.Color('#ece8e0');
const DENSITY: Record<QualityTier, number> = { low: 0.45, medium: 0.75, high: 1 };

type Fadeable = { mat: THREE.Material & { opacity: number }; base: number };

function fadeGroup(): { group: THREE.Group; mats: Fadeable[]; add: <T extends THREE.Object3D>(o: T, base: number) => T } {
  const group = new THREE.Group();
  const mats: Fadeable[] = [];
  return {
    group,
    mats,
    add(o, base) {
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
    },
  };
}

const basic = (color: THREE.Color, opacity = 1, additive = true) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false });
const lineMat = (color: THREE.Color, opacity = 1) => new THREE.LineBasicMaterial({ color, transparent: true, opacity });

function boxEdges(center: THREE.Vector3, size: THREE.Vector3, mat: THREE.LineBasicMaterial) {
  const l = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x, size.y, size.z)), mat);
  l.position.copy(center);
  return l;
}

function World({
  tier,
  stage,
  reducedMotion,
  labels,
  labelEls,
  narrow,
}: {
  tier: QualityTier;
  stage: StageId;
  reducedMotion: boolean;
  labels: InnovationStage['labels'];
  labelEls: React.RefObject<(HTMLElement | null)[]>;
  narrow: boolean;
}) {
  const { camera, size } = useThree();
  const fade = useRef<Record<StageId, number>>({ perception: 0, reasoning: 0, planning: 0, motion: 0, supervision: 0 });
  const reach = useRef(0);

  const W = useMemo(() => {
    const h = buildHumanoid(DENSITY[tier]);
    h.root.rotation.y = -0.18;

    // Work out where the hand lands at full reach, and build the cell around it.
    applyPose(h, 1, 0, 0);
    h.root.updateMatrixWorld(true);
    const reachHand = h.anchors.hand.getWorldPosition(new THREE.Vector3());
    applyPose(h, 0, 0, 0);
    h.root.updateMatrixWorld(true);
    const restHand = h.anchors.hand.getWorldPosition(new THREE.Vector3());

    const scene = new THREE.Group();
    scene.add(h.root);
    const anchors: Record<string, THREE.Object3D> = { ...h.anchors };
    const addAnchor = (name: string, p: THREE.Vector3) => {
      const o = new THREE.Object3D();
      o.position.copy(p);
      scene.add(o);
      anchors[name] = o;
    };

    // Workbench and objects
    const tableTop = reachHand.y - 0.09;
    const tableC = new THREE.Vector3(reachHand.x + 0.06, tableTop - 0.015, reachHand.z + 0.02);
    const tableMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#202328'), transparent: true, opacity: 0.85 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.38), tableMat);
    table.position.copy(tableC);
    scene.add(table);
    scene.add(boxEdges(tableC, new THREE.Vector3(0.5, 0.025, 0.38), lineMat(BONE, 0.3)));
    [-1, 1].forEach((sx) =>
      [-1, 1].forEach((sz) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.014, tableTop, 0.014), new THREE.MeshBasicMaterial({ color: new THREE.Color('#2a2e33') }));
        leg.position.set(tableC.x + sx * 0.23, tableTop / 2 - 0.015, tableC.z + sz * 0.17);
        scene.add(leg);
      }),
    );
    const targetC = new THREE.Vector3(reachHand.x, tableTop + 0.035, reachHand.z);
    const target = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.07), new THREE.MeshBasicMaterial({ color: new THREE.Color('#5a5f66') }));
    target.position.copy(targetC);
    scene.add(target);
    scene.add(boxEdges(targetC, new THREE.Vector3(0.09, 0.07, 0.07), lineMat(BONE, 0.5)));
    const obstacleC = new THREE.Vector3(reachHand.x - 0.16, tableTop + 0.08, reachHand.z - 0.05);
    const obstacle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.16, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color('#3f444a') }));
    obstacle.position.copy(obstacleC);
    scene.add(obstacle);
    addAnchor('target', targetC.clone().add(new THREE.Vector3(0, 0.05, 0)));
    addAnchor('obstacle', obstacleC.clone().add(new THREE.Vector3(0, 0.1, 0)));

    // Floor: precision rings + warm light pool
    [0.45, 0.8, 1.15, 1.5].forEach((r, i) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.002, r, 128), basic(BONE, 0.12 - i * 0.02, false));
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);
    });
    const pool = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uC: { value: SIGNAL } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader:
          'uniform vec3 uC; varying vec2 vUv; void main(){ float d=length(vUv-0.5)*2.0; gl_FragColor=vec4(uC, pow(max(0.0,1.0-d),3.0)*0.22); }',
      }),
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = 0.001;
    scene.add(pool);

    /* ---------- Perception ---------- */
    const per = fadeGroup();
    const eye = h.anchors.eye;
    const eyeWorld = eye.getWorldPosition(new THREE.Vector3());
    const fr = 0.24;
    const corners = [
      new THREE.Vector3(targetC.x - fr, tableTop + 0.002, targetC.z - fr * 0.8),
      new THREE.Vector3(targetC.x + fr * 0.6, tableTop + 0.002, targetC.z - fr * 0.8),
      new THREE.Vector3(targetC.x + fr * 0.6, tableTop + 0.002, targetC.z + fr * 0.8),
      new THREE.Vector3(targetC.x - fr, tableTop + 0.002, targetC.z + fr * 0.8),
    ];
    const frPts: number[] = [];
    corners.forEach((c, i) => {
      frPts.push(eyeWorld.x, eyeWorld.y, eyeWorld.z, c.x, c.y, c.z);
      const n = corners[(i + 1) % 4];
      frPts.push(c.x, c.y, c.z, n.x, n.y, n.z);
    });
    const frGeo = new THREE.BufferGeometry();
    frGeo.setAttribute('position', new THREE.Float32BufferAttribute(frPts, 3));
    per.add(new THREE.LineSegments(frGeo, lineMat(SIGNAL, 0.7)), 0.7);
    const faceGeo = new THREE.BufferGeometry();
    const fv: number[] = [];
    corners.forEach((c, i) => {
      const n = corners[(i + 1) % 4];
      fv.push(eyeWorld.x, eyeWorld.y, eyeWorld.z, c.x, c.y, c.z, n.x, n.y, n.z);
    });
    faceGeo.setAttribute('position', new THREE.Float32BufferAttribute(fv, 3));
    per.add(new THREE.Mesh(faceGeo, new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.07, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })), 0.07);
    per.add(boxEdges(targetC, new THREE.Vector3(0.13, 0.11, 0.11), lineMat(SIGNAL, 1)), 1);
    per.add(boxEdges(obstacleC, new THREE.Vector3(0.13, 0.2, 0.13), lineMat(SIGNAL, 0.8)), 0.8);
    const lidar = new THREE.Mesh(new THREE.RingGeometry(0.97, 1.0, 160), basic(SIGNAL, 0.6));
    lidar.rotation.x = -Math.PI / 2;
    lidar.position.y = 0.004;
    per.add(lidar, 0.6);

    /* ---------- Reasoning ---------- */
    const rea = fadeGroup();
    const headW = h.head.getWorldPosition(new THREE.Vector3());
    const gc = new THREE.Vector3(headW.x - 0.5, headW.y - 0.12, headW.z + 0.08);
    const gNodes = [
      [0, 0.12, 0],
      [-0.14, 0.03, 0.05],
      [0.13, 0.04, -0.03],
      [-0.08, -0.1, 0.02],
      [0.08, -0.11, 0.04],
      [0.0, -0.01, 0.1],
      [-0.2, -0.04, -0.06],
    ].map(([x, y, z]) => new THREE.Vector3(gc.x + x, gc.y + y, gc.z + z));
    const gEdges: [number, number][] = [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 5],
      [1, 6],
      [5, 0],
    ];
    gNodes.forEach((p, i) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(i === 5 ? 0.016 : 0.011, 16, 12), basic(i === 5 ? SIGNAL : BONE, 0.95));
      s.position.copy(p);
      rea.add(s, 0.95);
    });
    const ge: number[] = [];
    gEdges.forEach(([a, b]) => ge.push(...gNodes[a].toArray(), ...gNodes[b].toArray()));
    ge.push(...gNodes[2].toArray(), headW.x, headW.y + 0.02, headW.z + 0.04);
    const geG = new THREE.BufferGeometry();
    geG.setAttribute('position', new THREE.Float32BufferAttribute(ge, 3));
    rea.add(new THREE.LineSegments(geG, lineMat(SIGNAL, 0.55)), 0.55);
    const pulses = [0, 1, 2].map(() => rea.add(new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 6), basic(SIGNAL, 1)), 1));
    rea.add(boxEdges(targetC.clone().add(new THREE.Vector3(0, 0.045, 0)), new THREE.Vector3(0.1, 0.004, 0.08), lineMat(SIGNAL, 1)), 1);
    addAnchor('graph', gNodes[0].clone().add(new THREE.Vector3(0, 0.05, 0)));

    /* ---------- Planning ---------- */
    const pla = fadeGroup();
    const path = new THREE.CatmullRomCurve3([
      restHand.clone(),
      restHand.clone().lerp(reachHand, 0.35).add(new THREE.Vector3(0.02, 0.1, 0.1)),
      obstacleC.clone().add(new THREE.Vector3(0.1, 0.2, 0.06)),
      reachHand.clone().add(new THREE.Vector3(0, 0.1, 0)),
      reachHand.clone(),
    ]);
    pla.add(new THREE.Mesh(new THREE.TubeGeometry(path, 120, 0.0045, 8), basic(SIGNAL, 0.95)), 0.95);
    [0.25, 0.5, 0.75, 1].forEach((t) => {
      const w = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.002, 6, 32), basic(SIGNAL, 0.9));
      w.position.copy(path.getPoint(t));
      w.lookAt(camera.position);
      pla.add(w, 0.9);
    });
    const coll = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), new THREE.MeshBasicMaterial({ color: SIGNAL, wireframe: true, transparent: true, opacity: 0.25 }));
    coll.position.copy(obstacleC);
    pla.add(coll, 0.25);
    addAnchor('waypoint', path.getPoint(0.75));

    /* ---------- Supervision ---------- */
    const sup = fadeGroup();
    for (let i = 0; i < 64; i++) {
      const seg = new THREE.Mesh(new THREE.RingGeometry(1.18, 1.21, 6, 1, (i / 64) * Math.PI * 2, (Math.PI * 2) / 64 / 1.8), basic(SIGNAL, 0.75));
      seg.rotation.x = -Math.PI / 2;
      seg.position.y = 0.005;
      sup.add(seg, 0.75);
    }
    const op = new THREE.Group();
    // The operator: a dotted silhouette, deliberately less detailed than the robot.
    const dots = (src: THREE.BufferGeometry, y: number) => {
      const sampler = new MeshSurfaceSampler(new THREE.Mesh(src)).build();
      const arr = new Float32Array(900 * 3);
      const v = new THREE.Vector3();
      for (let i = 0; i < 900; i++) {
        sampler.sample(v);
        arr.set([v.x, v.y, v.z], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: BONE, size: 0.008, transparent: true, opacity: 0.5, depthWrite: false }));
      pts.position.y = y;
      return pts;
    };
    const body = dots(new THREE.CapsuleGeometry(0.15, 0.5, 10, 28), 1.12);
    body.scale.set(1, 1, 0.7);
    const opHead = dots(new THREE.SphereGeometry(0.1, 20, 14), 1.6);
    const legs = dots(new THREE.CapsuleGeometry(0.11, 0.62, 8, 22), 0.43);
    legs.scale.set(1, 1, 0.75);
    const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.01), basic(SIGNAL, 0.8));
    tablet.position.set(0, 1.12, 0.22);
    tablet.rotation.x = -0.6;
    op.add(body, opHead, legs);
    op.position.set(1.75, 0, -0.85);
    op.lookAt(0, 0, 0);
    sup.add(op, 0.22);
    op.add(tablet);
    sup.mats.push({ mat: tablet.material, base: 0.8 });
    op.updateMatrixWorld(true);
    const tabW = tablet.getWorldPosition(new THREE.Vector3());
    const linkGeo = new THREE.BufferGeometry().setFromPoints([tabW, headW.clone().add(new THREE.Vector3(0, 0.02, 0))]);
    sup.add(new THREE.Line(linkGeo, new THREE.LineDashedMaterial({ color: SIGNAL, dashSize: 0.03, gapSize: 0.02, transparent: true, opacity: 0.9 })), 0.9).computeLineDistances();
    const approval = sup.add(new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), basic(SIGNAL, 1)), 1);
    addAnchor('operator', opHead.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.16, 0)));
    addAnchor('zone', new THREE.Vector3(-0.75, 0.02, 0.95));

    scene.add(per.group, rea.group, pla.group, sup.group);
    const overlays: Record<StageId, { mats: Fadeable[] }> = {
      perception: per,
      reasoning: rea,
      planning: pla,
      motion: { mats: [] },
      supervision: sup,
    };
    return { h, scene, overlays, anchors, lidar, pulses, gNodes, gEdges, approval, tabW, headW };
  }, [tier, camera]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(0.2, 0.92, 0.15), []);
  const camT = useRef(0);

  useFrame((st, dt) => {
    const t = reducedMotion ? 2 : st.clock.elapsedTime;
    const motion = reducedMotion ? 0 : 1;
    const f = fade.current;
    (Object.keys(f) as StageId[]).forEach((k) => {
      f[k] += ((k === stage ? 1 : 0) - f[k]) * (1 - Math.exp(-dt * 5));
    });
    // overlays
    (Object.keys(W.overlays) as StageId[]).forEach((k) => W.overlays[k].mats.forEach((m) => (m.mat.opacity = m.base * f[k])));
    W.overlays.perception.mats.length && (W.lidar.scale.setScalar(0.15 + ((t * 0.45) % 1) * 1.25));
    W.pulses.forEach((p, i) => {
      const [a, b] = W.gEdges[(Math.floor(t * 0.9) + i * 3) % W.gEdges.length];
      p.position.lerpVectors(W.gNodes[a], W.gNodes[b], (t * 0.9 + i * 0.33) % 1);
    });
    W.approval.position.lerpVectors(W.tabW, W.headW, (t * 0.6) % 1);

    // pose per stage
    const want =
      stage === 'motion'
        ? reducedMotion
          ? 1
          : reachCycle(t)
        : stage === 'planning'
          ? 0.12
          : stage === 'supervision'
            ? 0.42
            : 0;
    reach.current += (want - reach.current) * (1 - Math.exp(-dt * 4));
    applyPose(W.h, reach.current, t, motion);
    const headY = stage === 'supervision' ? 0.95 : stage === 'perception' || stage === 'planning' || stage === 'motion' ? 0.38 : 0.12;
    const headX = stage === 'perception' || stage === 'planning' || stage === 'motion' ? 0.3 : stage === 'reasoning' ? -0.05 : 0.05;
    W.h.head.rotation.y += (headY + Math.sin(t * 0.5) * 0.03 * motion - W.h.head.rotation.y) * (1 - Math.exp(-dt * 3));
    W.h.head.rotation.x += (headX - W.h.head.rotation.x) * (1 - Math.exp(-dt * 3));

    // part highlights
    const hl = (part: keyof typeof W.h.mats, v: number) => {
      const u = W.h.mats[part].uniforms.uHighlight;
      u.value += (v - u.value) * (1 - Math.exp(-dt * 4));
    };
    hl('head', stage === 'perception' || stage === 'reasoning' ? 0.55 : 0);
    hl('torso', stage === 'reasoning' ? 0.2 : 0);
    hl('armR', stage === 'planning' || stage === 'motion' ? 0.5 : 0);
    hl('hands', stage === 'motion' ? 0.7 : 0);
    hl('joints', stage === 'motion' ? 0.8 : 0);
    Object.values(W.h.mats).forEach((m) => {
      m.uniforms.uDim.value += ((stage === 'supervision' ? 0.82 : 1) - m.uniforms.uDim.value) * (1 - Math.exp(-dt * 4));
    });
    W.h.mats.head.uniforms.uScan.value = stage === 'perception' ? 1 : 0;
    W.h.mats.head.uniforms.uScanY.value = 1.62 + Math.sin(t * 2.2) * 0.1;
    W.h.jointRings.forEach((r) => ((r.material as THREE.MeshBasicMaterial).opacity = f.motion * 0.9));

    // camera: gentle orbit following the pointer
    camT.current += ((reducedMotion ? 0 : st.pointer.x * 0.25) - camT.current) * (1 - Math.exp(-dt * 2));
    const R = narrow ? 4.4 : 3.95;
    const a = -0.5 + camT.current;
    camera.position.set(Math.sin(a) * R, narrow ? 1.45 : 1.38, Math.cos(a) * R);
    camera.lookAt(look);

    // screen-space labels
    labels.forEach((l, i) => {
      const el = labelEls.current?.[i];
      const o = W.anchors[l.anchor];
      if (!el || !o) return;
      o.getWorldPosition(tmp).project(camera);
      const x = (tmp.x * 0.5 + 0.5) * size.width;
      const y = (-tmp.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      el.style.opacity = tmp.z < 1 ? String(Math.min(1, f[stage] * 1.4)) : '0';
    });
  });

  return <primitive object={W.scene} />;
}

export default function HumanoidScene(props: {
  tier: QualityTier;
  active: boolean;
  stage: StageId;
  reducedMotion: boolean;
  labels: InnovationStage['labels'];
  labelEls: React.RefObject<(HTMLElement | null)[]>;
  narrow: boolean;
}) {
  return (
    <SceneCanvas
      tier={props.tier}
      active={props.active}
      className="absolute inset-0"
      camera={{ position: [-1.6, 1.42, 2.9], fov: 34 }}
      label={`An original humanoid robot at a workbench, showing the ${props.stage} stage of a physical AI system.`}
    >
      <World {...props} />
    </SceneCanvas>
  );
}
