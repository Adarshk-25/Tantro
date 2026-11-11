import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

/**
 * An original humanoid robot built from lathe-turned, anatomically proportioned
 * segments in a proper joint hierarchy (pelvis → spine → chest → neck → head;
 * shoulders → elbows → wrists → fingers; hips → knees → ankles).
 * Rendered as dark machined shells with a warm rim light and a fine point skin.
 */

export type Part = 'head' | 'torso' | 'armL' | 'armR' | 'legs' | 'hands' | 'joints';

const armorVertex = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying float vY;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = -mv.xyz;
    vY = (modelMatrix * vec4(position, 1.0)).y;
    gl_Position = projectionMatrix * mv;
  }
`;

const armorFragment = /* glsl */ `
  uniform vec3 uColor; uniform vec3 uRim; uniform vec3 uAccent;
  uniform float uHighlight; uniform float uScan; uniform float uScanY; uniform float uDim;
  varying vec3 vN; varying vec3 vV; varying float vY;
  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vV);
    vec3 L = normalize(vec3(0.45, 0.75, 0.55));
    vec3 L2 = normalize(vec3(-0.6, 0.2, -0.4));
    float diff = max(dot(N, L), 0.0);
    float back = max(dot(N, L2), 0.0);
    float spec = pow(max(dot(reflect(-L, N), V), 0.0), 28.0);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.4);
    vec3 col = uColor * (0.28 + 0.72 * diff) + vec3(0.55, 0.6, 0.66) * back * 0.06;
    col += vec3(1.0, 0.96, 0.9) * spec * 0.32;
    col += uRim * fres * 0.62;
    col += uAccent * (fres * 1.1 + 0.07) * uHighlight;
    col += uAccent * smoothstep(0.025, 0.0, abs(vY - uScanY)) * uScan * 0.9;
    gl_FragColor = vec4(col * uDim, 1.0);
  }
`;

function armorMaterial(color = '#2a2e33') {
  return new THREE.ShaderMaterial({
    vertexShader: armorVertex,
    fragmentShader: armorFragment,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uRim: { value: new THREE.Color('#f3e8d8') },
      uAccent: { value: new THREE.Color('#ff9a45') },
      uHighlight: { value: 0 },
      uScan: { value: 0 },
      uScanY: { value: 0 },
      uDim: { value: 1 },
    },
  });
}

/** Rounded, tapered limb along −Y (top at 0). */
function limbGeometry(len: number, r1: number, r2: number) {
  const pts: THREE.Vector2[] = [];
  const cap = 8;
  for (let i = 0; i <= cap; i++) {
    const a = (i / cap) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.sin(a) * r1, -r1 + Math.cos(a) * r1 * 0.9 + r1 * 0.1));
  }
  const body = 12;
  for (let i = 1; i < body; i++) {
    const t = i / body;
    // slight muscle-like belly in the upper third
    const belly = Math.sin(Math.min(1, t * 1.6) * Math.PI) * 0.12 * r1;
    pts.push(new THREE.Vector2(r1 + (r2 - r1) * t + belly, -r1 - (len - r1 - r2) * t));
  }
  for (let i = 0; i <= cap; i++) {
    const a = (i / cap) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.cos(a) * r2, -len + r2 - Math.sin(a) * r2));
  }
  return new THREE.LatheGeometry(pts, 28);
}

function latheProfile(profile: [number, number][], seg = 40) {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    seg,
  );
}

function skin(mesh: THREE.Mesh, count: number, mat: THREE.PointsMaterial) {
  const sampler = new MeshSurfaceSampler(mesh).build();
  const pos = new Float32Array(count * 3);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    sampler.sample(p, n);
    p.addScaledVector(n, 0.004);
    pos.set([p.x, p.y, p.z], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, mat);
  mesh.add(pts);
  return pts;
}

export type Humanoid = ReturnType<typeof buildHumanoid>;

export function buildHumanoid(density = 1) {
  const mats: Record<Part, THREE.ShaderMaterial> = {
    head: armorMaterial('#353a40'),
    torso: armorMaterial('#30353b'),
    armL: armorMaterial('#33383e'),
    armR: armorMaterial('#33383e'),
    legs: armorMaterial('#2e3338'),
    hands: armorMaterial('#30343a'),
    joints: armorMaterial('#3a3f45'),
  };
  const dotMat = new THREE.PointsMaterial({
    color: new THREE.Color('#f1e6d6'),
    size: 0.0042,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const visorMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff9a45'), transparent: true, opacity: 0.85 });
  const seamMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff9a45'), transparent: true, opacity: 0.35 });
  const D = (n: number) => Math.round(n * density);

  const mesh = (geo: THREE.BufferGeometry, part: Part, dots = 0) => {
    const m = new THREE.Mesh(geo, mats[part]);
    if (dots) skin(m, D(dots), dotMat);
    return m;
  };
  const joint = (r: number) => mesh(new THREE.SphereGeometry(r, 24, 16), 'joints', 120);
  const anchors: Record<string, THREE.Object3D> = {};
  const anchor = (name: string, parent: THREE.Object3D, pos: [number, number, number]) => {
    const o = new THREE.Object3D();
    o.position.set(...pos);
    parent.add(o);
    anchors[name] = o;
    return o;
  };

  const root = new THREE.Group();

  // Pelvis
  const pelvis = new THREE.Group();
  pelvis.position.set(0, 0.95, 0);
  root.add(pelvis);
  const pelvisMesh = mesh(
    latheProfile([
      [0, -0.07],
      [0.1, -0.065],
      [0.145, -0.02],
      [0.155, 0.03],
      [0.13, 0.08],
      [0.11, 0.1],
      [0, 0.105],
    ]),
    'torso',
    600,
  );
  pelvisMesh.scale.set(1, 1, 0.72);
  pelvis.add(pelvisMesh);

  // Spine & abdomen
  const spine = new THREE.Group();
  spine.position.set(0, 0.1, 0);
  pelvis.add(spine);
  const abdomen = mesh(
    latheProfile([
      [0.09, 0],
      [0.11, 0.03],
      [0.115, 0.09],
      [0.11, 0.15],
      [0.1, 0.18],
    ]),
    'torso',
    300,
  );
  abdomen.scale.set(1, 1, 0.78);
  spine.add(abdomen);
  // abdomen segment seams
  [0.05, 0.1].forEach((y) => {
    const s = new THREE.Mesh(new THREE.TorusGeometry(0.116, 0.0025, 6, 48), seamMat);
    s.rotation.x = Math.PI / 2;
    s.position.y = y;
    s.scale.set(1, 0.78, 1);
    spine.add(s);
  });

  // Chest
  const chest = new THREE.Group();
  chest.position.set(0, 0.16, 0);
  spine.add(chest);
  const torso = mesh(
    latheProfile([
      [0.1, 0],
      [0.135, 0.04],
      [0.165, 0.12],
      [0.185, 0.2],
      [0.19, 0.26],
      [0.17, 0.31],
      [0.12, 0.345],
      [0.06, 0.36],
      [0, 0.362],
    ]),
    'torso',
    1500,
  );
  torso.scale.set(1, 1, 0.68);
  chest.add(torso);
  // chest plate seam and core light
  const plate = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.003, 6, 40, Math.PI), seamMat);
  plate.position.set(0, 0.2, 0.122);
  plate.rotation.z = Math.PI;
  chest.add(plate);
  const core = new THREE.Mesh(new THREE.CircleGeometry(0.018, 24), visorMat);
  core.position.set(0, 0.2, 0.128);
  chest.add(core);
  anchor('core', chest, [0, 0.2, 0.13]);

  // Neck & head
  const neck = new THREE.Group();
  neck.position.set(0, 0.36, 0);
  chest.add(neck);
  neck.add(mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 20), 'joints', 80));
  const head = new THREE.Group();
  head.position.set(0, 0.15, 0);
  neck.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.1, 40, 28), 'head', 700);
  skull.scale.set(1, 1.22, 1.08);
  head.add(skull);
  const jaw = mesh(new THREE.SphereGeometry(0.075, 28, 18, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.45), 'head', 120);
  jaw.position.set(0, -0.045, 0.012);
  head.add(jaw);
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.103, 40, 12, -Math.PI * 0.32, Math.PI * 0.64, Math.PI * 0.43, Math.PI * 0.11), visorMat);
  visor.scale.set(1, 1.22, 1.1);
  visor.rotation.y = 0;
  head.add(visor);
  anchor('eye', head, [0, 0.02, 0.12]);

  // Arms
  const buildArm = (side: 1 | -1) => {
    const part: Part = side === 1 ? 'armR' : 'armL';
    const shoulder = new THREE.Group();
    shoulder.position.set(0.215 * side, 0.29, 0);
    chest.add(shoulder);
    // pauldron: a flattened shell over the shoulder joint
    const cap = mesh(new THREE.SphereGeometry(0.062, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.62), part, 160);
    cap.scale.set(1.12, 0.9, 1.05);
    cap.position.y = 0.01;
    shoulder.add(mesh(new THREE.SphereGeometry(0.05, 20, 14), 'joints'));
    shoulder.add(cap);
    const upper = mesh(limbGeometry(0.29, 0.054, 0.043), part, 380);
    upper.position.y = -0.02;
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.set(0, -0.3, 0);
    shoulder.add(elbow);
    elbow.add(joint(0.044));
    const fore = mesh(limbGeometry(0.26, 0.045, 0.034), part, 320);
    elbow.add(fore);
    const wrist = new THREE.Group();
    wrist.position.set(0, -0.265, 0);
    elbow.add(wrist);
    wrist.add(joint(0.03));
    // hand: palm + four fingers + thumb
    const palm = mesh(new THREE.BoxGeometry(0.06, 0.08, 0.026, 2, 2, 2), 'hands', 120);
    palm.position.set(0, -0.055, 0);
    wrist.add(palm);
    for (let f = 0; f < 4; f++) {
      const finger = mesh(new THREE.CapsuleGeometry(0.0075, 0.045 - Math.abs(f - 1.5) * 0.006, 4, 8), 'hands');
      finger.position.set(-0.022 + f * 0.0145, -0.118, 0.004);
      finger.rotation.x = 0.25;
      wrist.add(finger);
    }
    const thumb = mesh(new THREE.CapsuleGeometry(0.009, 0.035, 4, 8), 'hands');
    thumb.position.set(0.036 * -side, -0.06, 0.014);
    thumb.rotation.z = 0.6 * side;
    wrist.add(thumb);
    // joint accent rings (visible in Motion)
    const ringGeo = new THREE.TorusGeometry(0.075, 0.003, 6, 48);
    const ringS = new THREE.Mesh(ringGeo, visorMat.clone());
    ringS.rotation.y = Math.PI / 2;
    shoulder.add(ringS);
    const ringE = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.0028, 6, 40), visorMat.clone());
    ringE.rotation.y = Math.PI / 2;
    elbow.add(ringE);
    const hand = anchor(side === 1 ? 'hand' : 'handL', wrist, [0, -0.12, 0.01]);
    if (side === 1) anchor('shoulder', shoulder, [0.08, 0.04, 0]);
    return { shoulder, elbow, wrist, rings: [ringS, ringE], hand };
  };
  const armR = buildArm(1);
  const armL = buildArm(-1);

  // Legs
  const buildLeg = (side: 1 | -1) => {
    const hip = new THREE.Group();
    hip.position.set(0.095 * side, -0.04, 0);
    pelvis.add(hip);
    const hipJ = joint(0.05);
    hipJ.scale.set(0.9, 0.8, 0.9);
    hip.add(hipJ);
    const thigh = mesh(limbGeometry(0.42, 0.072, 0.05), 'legs', 520);
    hip.add(thigh);
    const knee = new THREE.Group();
    knee.position.set(0, -0.43, 0);
    hip.add(knee);
    const kneeCap = joint(0.047);
    knee.add(kneeCap);
    const shin = mesh(limbGeometry(0.41, 0.054, 0.037), 'legs', 420);
    knee.add(shin);
    const ankle = new THREE.Group();
    ankle.position.set(0, -0.42, 0);
    knee.add(ankle);
    ankle.add(joint(0.033));
    const foot = mesh(new THREE.BoxGeometry(0.085, 0.045, 0.21, 2, 2, 4), 'legs', 140);
    foot.position.set(0, -0.045, 0.045);
    ankle.add(foot);
    const ringK = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.0028, 6, 40), visorMat.clone());
    ringK.rotation.y = Math.PI / 2;
    knee.add(ringK);
    return { hip, knee, ankle, ring: ringK };
  };
  const legR = buildLeg(1);
  const legL = buildLeg(-1);

  const jointRings = [...armR.rings, ...armL.rings, legR.ring, legL.ring];
  jointRings.forEach((r) => ((r.material as THREE.MeshBasicMaterial).opacity = 0));

  return {
    root,
    pelvis,
    spine,
    chest,
    neck,
    head,
    armR,
    armL,
    legR,
    legL,
    mats,
    dotMat,
    visorMat,
    jointRings,
    anchors,
  };
}

/** Pose helper: rest (0) → reach (1) for the right arm, with torso follow-through. */
export function applyPose(h: Humanoid, reach: number, t: number, motion: number) {
  const breathe = Math.sin(t * 1.4) * 0.012 * motion;
  h.chest.rotation.x = 0.02 + breathe + reach * 0.1;
  h.spine.rotation.x = reach * 0.08;
  h.spine.rotation.y = -reach * 0.12;
  h.pelvis.position.y = 0.95 + Math.sin(t * 1.4) * 0.002 * motion;
  // right arm: shoulder flexion + abduction, elbow flexion
  h.armR.shoulder.rotation.set(-0.08 - reach * 1.05, 0, 0.1 + reach * 0.12);
  h.armR.elbow.rotation.set(-0.18 - reach * 0.55, 0, 0);
  h.armR.wrist.rotation.set(reach * 0.25, 0, 0);
  // left arm relaxed, slight counter-motion
  h.armL.shoulder.rotation.set(-0.06 + Math.sin(t * 0.7) * 0.02 * motion, 0, -0.1);
  h.armL.elbow.rotation.set(-0.22, 0, 0);
  // legs: natural stance
  h.legR.hip.rotation.set(-0.04, 0, 0.03);
  h.legR.knee.rotation.set(0.07, 0, 0);
  h.legR.ankle.rotation.set(-0.03, 0, 0);
  h.legL.hip.rotation.set(0.02, 0, -0.04);
  h.legL.knee.rotation.set(0.05, 0, 0);
  h.legL.ankle.rotation.set(-0.07, 0, 0);
}
