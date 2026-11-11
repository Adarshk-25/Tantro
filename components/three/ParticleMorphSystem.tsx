'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { HeroStates } from '@/lib/particles/shapes';

/** Mutable values written by the scroll/pointer controllers, read every frame. */
export type MorphStore = {
  morph: number; // 0..3
  pointer: { x: number; y: number; active: boolean }; // NDC
};

const vertex = /* glsl */ `
  uniform float uMorph;
  uniform float uTime;
  uniform float uMotion;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uPointer;
  uniform float uPointerStrength;

  attribute vec3 aP0;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  attribute vec4 aAccent;
  attribute float aSeed;

  varying float vAccent;
  varying float vFade;
  varying float vSeed;

  void main() {
    float seg = clamp(floor(uMorph), 0.0, 2.0);
    float f = clamp(uMorph - seg, 0.0, 1.0);
    // Staggered per-particle progress: the structure re-assembles in a wave.
    float local = smoothstep(0.0, 1.0, clamp(f * 1.6 - aSeed * 0.6, 0.0, 1.0));

    vec3 a; vec3 b; float accA; float accB;
    if (seg < 0.5) { a = aP0; b = aP1; accA = aAccent.x; accB = aAccent.y; }
    else if (seg < 1.5) { a = aP1; b = aP2; accA = aAccent.y; accB = aAccent.z; }
    else { a = aP2; b = aP3; accA = aAccent.z; accB = aAccent.w; }

    vec3 p = mix(a, b, local);

    // In transit, particles leave the surface along a smooth curl-like arc.
    float transit = sin(local * 3.14159);
    vec3 swirl = vec3(
      sin(aSeed * 41.0 + p.y * 0.7 + uTime * 0.5),
      cos(aSeed * 23.0 + p.x * 0.6 + uTime * 0.4),
      sin(aSeed * 17.0 + p.z * 0.8 - uTime * 0.3)
    );
    p += swirl * transit * 0.6;

    // Idle micro-motion — a living structure, disabled for reduced motion.
    p += uMotion * 0.022 * vec3(
      sin(uTime * 0.9 + aSeed * 31.0),
      cos(uTime * 0.7 + aSeed * 19.0),
      sin(uTime * 0.6 + aSeed * 11.0)
    );

    vec4 world = modelMatrix * vec4(p, 1.0);

    // Pointer: a soft pressure field in world space.
    vec3 d = world.xyz - uPointer;
    float dist = length(d.xy);
    float push = uPointerStrength * (1.0 - smoothstep(0.0, 1.5, dist));
    world.xyz += normalize(d + vec3(0.0001)) * push * 0.42;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;

    float acc = mix(accA, accB, local);
    vAccent = acc;
    vSeed = aSeed;
    float depth = -mv.z;
    vFade = clamp(1.5 - depth * 0.06, 0.3, 1.0);
    gl_PointSize = uSize * (1.0 + acc * 0.9) * uPixelRatio / depth;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uSignal;
  uniform float uTime;
  uniform float uMotion;

  varying float vAccent;
  varying float vFade;
  varying float vSeed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, 0.0, r);
    // Accent nodes pulse slowly, out of phase, like status lights on a panel.
    float pulse = 0.75 + 0.25 * sin(uTime * 1.6 + vSeed * 40.0) * uMotion;
    vec3 col = mix(uBase, uSignal, vAccent);
    float alpha = core * vFade * mix(0.72, 0.85 * pulse, vAccent);
    gl_FragColor = vec4(col, alpha);
  }
`;

type CamKey = { pos: [number, number, number]; look: [number, number, number] };

const CAMERA_WIDE: CamKey[] = [
  { pos: [2.4, 0.9, 8.8], look: [-2.3, -0.3, 0] },
  { pos: [1.0, 4.4, 9.4], look: [-1.9, -0.2, 0] },
  { pos: [-2.4, 0.9, 9.0], look: [-1.9, 0.0, 0] },
  { pos: [0.4, 1.5, 11.2], look: [-1.8, 0.1, 0] },
];

const CAMERA_NARROW: CamKey[] = [
  { pos: [2.4, 0.2, 14.5], look: [0.5, -3.1, 0] },
  { pos: [0.6, 3.6, 15.0], look: [0, -2.9, 0] },
  { pos: [-2.6, 0.6, 15.0], look: [0, -2.7, 0] },
  { pos: [0.2, 1.0, 16.5], look: [0, -2.8, 0] },
];

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const raycastPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const hit = new THREE.Vector3();

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
  const { camera, gl } = useThree();
  const points = useRef<THREE.Points>(null);
  const smooth = useRef({ morph: store.current?.morph ?? 0, strength: 0, px: 0, py: 0 });

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    // `position` is required by three for bounds; the shader uses aP*.
    g.setAttribute('position', new THREE.BufferAttribute(states.positions[0], 3));
    states.positions.forEach((p, i) => g.setAttribute(`aP${i}`, new THREE.BufferAttribute(p, 3)));
    const acc = new Float32Array(states.count * 4);
    for (let i = 0; i < states.count; i++) {
      for (let s = 0; s < 4; s++) acc[i * 4 + s] = states.accents[s][i];
    }
    g.setAttribute('aAccent', new THREE.BufferAttribute(acc, 4));
    g.setAttribute('aSeed', new THREE.BufferAttribute(states.seeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 12);
    return g;
  }, [states]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uMotion: { value: 1 },
          uSize: { value: 30 },
          uPixelRatio: { value: 1 },
          uPointer: { value: new THREE.Vector3(99, 99, 0) },
          uPointerStrength: { value: 0 },
          uBase: { value: new THREE.Color('#d9d3c7') },
          uSignal: { value: new THREE.Color('#e0954a') },
        },
      }),
    [],
  );

  useFrame((state, delta) => {
    const s = store.current;
    if (!s) return;
    const sm = smooth.current;
    const k = 1 - Math.exp(-delta * (reducedMotion ? 30 : 5));
    sm.morph += (s.morph - sm.morph) * k;
    sm.strength += ((s.pointer.active && !reducedMotion ? 1 : 0) - sm.strength) * (1 - Math.exp(-delta * 3));
    sm.px += (s.pointer.x - sm.px) * (1 - Math.exp(-delta * 4));
    sm.py += (s.pointer.y - sm.py) * (1 - Math.exp(-delta * 4));

    const u = material.uniforms;
    u.uMorph.value = sm.morph;
    u.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
    u.uMotion.value = reducedMotion ? 0 : 1;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uSize.value = narrow ? 40 : 36;
    u.uPointerStrength.value = sm.strength;

    // Camera follows the story, plus a slight pointer parallax.
    const keys = narrow ? CAMERA_NARROW : CAMERA_WIDE;
    const seg = Math.min(2, Math.floor(sm.morph));
    const f = Math.min(1, sm.morph - seg);
    const e = f * f * (3 - 2 * f);
    tmpA.fromArray(keys[seg].pos).lerp(tmpB.fromArray(keys[seg + 1].pos), e);
    const par = reducedMotion ? 0 : 0.35;
    camera.position.set(tmpA.x + sm.px * par, tmpA.y + sm.py * par * 0.6, tmpA.z);
    lookTarget.fromArray(keys[seg].look).lerp(tmpB.fromArray(keys[seg + 1].look), e);
    camera.lookAt(lookTarget);

    if (points.current && !reducedMotion) {
      points.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.12;
    }

    // Project pointer onto the z=0 plane for the pressure field.
    ndc.set(sm.px, sm.py);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(raycastPlane, hit)) u.uPointer.value.copy(hit);
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}
