'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GROUPS, type HeroStates } from '@/lib/particles/shapes';

/** Mutable values written by the hero controllers, read every frame. */
export type MorphStore = {
  morph: number; // 0..3
  explode: number; // target 0..1 (component disassembly)
  /** DOM label elements, keyed by anchor id; positioned every frame. */
  labels: Record<string, HTMLElement | null>;
};

const vertex = /* glsl */ `
  uniform float uMorph;
  uniform float uTime;
  uniform float uMotion;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uExplode;
  uniform vec3 uOffsets[${4 * GROUPS}];

  attribute vec3 aP0;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  attribute vec4 aAccent;
  attribute vec4 aGroup;
  attribute float aSeed;

  varying float vAccent;
  varying float vFade;
  varying float vSeed;
  varying float vHue;

  void main() {
    float seg = clamp(floor(uMorph), 0.0, 2.0);
    float f = clamp(uMorph - seg, 0.0, 1.0);
    float local = smoothstep(0.0, 1.0, clamp(f * 1.6 - aSeed * 0.6, 0.0, 1.0));

    vec3 a; vec3 b; float accA; float accB; float gA; float gB; int sA;
    if (seg < 0.5) { a = aP0; b = aP1; accA = aAccent.x; accB = aAccent.y; gA = aGroup.x; gB = aGroup.y; sA = 0; }
    else if (seg < 1.5) { a = aP1; b = aP2; accA = aAccent.y; accB = aAccent.z; gA = aGroup.y; gB = aGroup.z; sA = 1; }
    else { a = aP2; b = aP3; accA = aAccent.z; accB = aAccent.w; gA = aGroup.z; gB = aGroup.w; sA = 2; }

    // Component disassembly: whole groups translate together (staggered by group),
    // so every object keeps its identity while it separates.
    vec3 offA = uOffsets[sA * ${GROUPS} + int(gA + 0.5)];
    vec3 offB = uOffsets[(sA + 1) * ${GROUPS} + int(gB + 0.5)];
    float gk = clamp(uExplode * 1.25 - mix(gA, gB, local) * 0.03, 0.0, 1.0);
    float ge = gk * gk * (3.0 - 2.0 * gk);
    vec3 p = mix(a + offA * ge, b + offB * ge, local);

    // In transit between states, particles travel along a soft arc.
    float transit = sin(local * 3.14159);
    p += vec3(
      sin(aSeed * 41.0 + p.y * 0.7 + uTime * 0.5),
      cos(aSeed * 23.0 + p.x * 0.6 + uTime * 0.4),
      sin(aSeed * 17.0 + p.z * 0.8 - uTime * 0.3)
    ) * transit * 0.5;

    // Very small idle drift (disabled for reduced motion).
    p += uMotion * 0.012 * vec3(sin(uTime * 0.9 + aSeed * 31.0), cos(uTime * 0.7 + aSeed * 19.0), sin(uTime * 0.6 + aSeed * 11.0));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float acc = mix(accA, accB, local);
    vAccent = acc;
    vSeed = aSeed;
    vHue = clamp(p.x * 0.18 + 0.5, 0.0, 1.0);
    float depth = -mv.z;
    vFade = clamp(1.55 - depth * 0.065, 0.22, 1.0);
    gl_PointSize = max(1.0, uSize * (1.0 + acc * 0.25) * (0.75 + aSeed * 0.5) * uPixelRatio / depth);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uBlue;
  uniform vec3 uIndigo;
  uniform vec3 uCyan;
  uniform vec3 uTeal;
  uniform float uTime;
  uniform float uMotion;
  varying float vAccent;
  varying float vFade;
  varying float vSeed;
  varying float vHue;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, 0.05, r);
    float pulse = 0.82 + 0.18 * sin(uTime * 1.6 + vSeed * 40.0) * uMotion;
    vec3 base = mix(uBase, uBase * vec3(0.78, 0.84, 0.94), fract(vSeed * 7.31));
    // Brand gradient across the scene: blue → indigo → cyan → teal
    vec3 grad = vHue < 0.33 ? mix(uBlue, uIndigo, vHue / 0.33)
              : vHue < 0.66 ? mix(uIndigo, uCyan, (vHue - 0.33) / 0.33)
              : mix(uCyan, uTeal, (vHue - 0.66) / 0.34);
    vec3 col = mix(base, grad, vAccent);
    float alpha = core * vFade * mix(0.46, 0.8 * pulse, vAccent);
    gl_FragColor = vec4(col, alpha);
  }
`;

type CamKey = { pos: [number, number, number]; look: [number, number, number] };

// Wide screens: objects sit on the right; the left column holds the stage dialogue.
const CAMERA_WIDE: CamKey[] = [
  { pos: [2.4, 0.9, 8.8], look: [-2.3, -0.3, 0] },
  { pos: [0.6, 1.2, 10.4], look: [-2.15, 0.15, 0] },
  { pos: [-0.8, 0.8, 9.4], look: [-2.3, 0.15, 0] },
  { pos: [0.3, 0.9, 10.2], look: [-2.2, 0.1, 0] },
];
const CAMERA_NARROW: CamKey[] = [
  { pos: [2.4, 0.2, 14.5], look: [0.5, -3.1, 0] },
  { pos: [0.4, 0.8, 13.8], look: [0, -3.2, 0] },
  { pos: [-0.6, 0.5, 13.2], look: [0, -3.0, 0] },
  { pos: [0.2, 0.6, 13.8], look: [0, -3.1, 0] },
];

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const proj = new THREE.Vector3();

export function ParticleMorphSystem({
  states,
  store,
  reducedMotion,
  narrow,
}: {
  states: HeroStates;
  store: React.RefObject<MorphStore>;
  reducedMotion: boolean;
  narrow: boolean;
}) {
  const { camera, gl, size } = useThree();
  const smooth = useRef({ morph: store.current?.morph ?? 0, explode: 0, px: 0, py: 0 });

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(states.positions[0], 3));
    states.positions.forEach((p, i) => g.setAttribute(`aP${i}`, new THREE.BufferAttribute(p, 3)));
    const acc = new Float32Array(states.count * 4);
    const grp = new Float32Array(states.count * 4);
    for (let i = 0; i < states.count; i++) {
      for (let s = 0; s < 4; s++) {
        acc[i * 4 + s] = states.accents[s][i];
        grp[i * 4 + s] = states.groups[s][i];
      }
    }
    g.setAttribute('aAccent', new THREE.BufferAttribute(acc, 4));
    g.setAttribute('aGroup', new THREE.BufferAttribute(grp, 4));
    g.setAttribute('aSeed', new THREE.BufferAttribute(states.seeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 12);
    return g;
  }, [states]);

  const material = useMemo(() => {
    const offs: THREE.Vector3[] = [];
    for (let i = 0; i < 4 * GROUPS; i++)
      offs.push(new THREE.Vector3(states.offsets[i * 3], states.offsets[i * 3 + 1], states.offsets[i * 3 + 2]));
    return new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uMorph: { value: 0 },
        uTime: { value: 0 },
        uMotion: { value: 1 },
        uSize: { value: 17 },
        uPixelRatio: { value: 1 },
        uExplode: { value: 0 },
        uOffsets: { value: offs },
        uBase: { value: new THREE.Color('#e3ebf8') },
        uBlue: { value: new THREE.Color('#3d84f0') },
        uIndigo: { value: new THREE.Color('#6d68f0') },
        uCyan: { value: new THREE.Color('#25c0d1') },
        uTeal: { value: new THREE.Color('#22c79c') },
      },
    });
  }, [states]);

  // A soft cool light pool under the machine.
  const glow = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uOpacity: { value: 1 }, uColor: { value: new THREE.Color('#2a6fe0') } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform float uOpacity; uniform vec3 uColor; varying vec2 vUv;
          void main(){ float d = length(vUv - 0.5) * 2.0; float g = pow(max(0.0, 1.0 - d), 2.6);
          gl_FragColor = vec4(uColor, g * 0.24 * uOpacity); }`,
      }),
    [],
  );

  useFrame((state, delta) => {
    const s = store.current;
    if (!s) return;
    const sm = smooth.current;
    const k = 1 - Math.exp(-delta * (reducedMotion ? 30 : 5));
    sm.morph += (s.morph - sm.morph) * k;
    const explodeTarget = reducedMotion ? Math.min(s.explode, 0.25) : s.explode;
    sm.explode += (explodeTarget - sm.explode) * (1 - Math.exp(-delta * (reducedMotion ? 30 : 3.2)));

    const u = material.uniforms;
    u.uMorph.value = sm.morph;
    u.uExplode.value = sm.explode;
    u.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
    u.uMotion.value = reducedMotion ? 0 : 1;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uSize.value = narrow ? 20 : 17;
    glow.uniforms.uOpacity.value = Math.max(0, 1 - sm.morph) + Math.max(0, sm.morph - 2) * 0.35;

    // Camera follows the story.
    const keys = narrow ? CAMERA_NARROW : CAMERA_WIDE;
    const seg = Math.min(2, Math.floor(sm.morph));
    const f = Math.min(1, sm.morph - seg);
    const e = f * f * (3 - 2 * f);
    tmpA.fromArray(keys[seg].pos).lerp(tmpB.fromArray(keys[seg + 1].pos), e);
    camera.position.copy(tmpA);
    lookTarget.fromArray(keys[seg].look).lerp(tmpB.fromArray(keys[seg + 1].look), e);
    camera.lookAt(lookTarget);

    // Project label anchors of the visible state(s) into the DOM.
    states.anchors.forEach((list, si) => {
      // S1 component labels only appear in the exploded view
      const w = Math.max(0, 1 - Math.abs(sm.morph - si) * 2.4) * (si === 0 ? Math.min(1, sm.explode * 1.6) : 1);
      list.forEach((a) => {
        const el = s.labels[a.id];
        if (!el) return;
        // labels travel with their component in the exploded view
        const o = a.g !== undefined ? (si * GROUPS + a.g) * 3 : -1;
        const ex = sm.explode;
        proj
          .set(
            a.pos[0] + (o >= 0 ? states.offsets[o] * ex : 0),
            a.pos[1] + (o >= 0 ? states.offsets[o + 1] * ex : 0),
            a.pos[2] + (o >= 0 ? states.offsets[o + 2] * ex : 0),
          )
          .project(camera);
        const x = (proj.x * 0.5 + 0.5) * size.width;
        const y = (-proj.y * 0.5 + 0.5) * size.height;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        el.style.opacity = w > 0.02 && proj.z < 1 ? w.toFixed(2) : '0';
      });
    });
  });

  return (
    <>
      <mesh position={[-0.6, -2.09, 0]} rotation={[-Math.PI / 2, 0, 0]} material={glow}>
        <planeGeometry args={[10, 10]} />
      </mesh>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </>
  );
}
