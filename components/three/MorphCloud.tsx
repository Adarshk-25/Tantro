'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export type CloudForms = { count: number; forms: { pos: Float32Array; acc: Float32Array }[]; seeds: Float32Array };

const vertex = /* glsl */ `
  uniform float uK; uniform float uTime; uniform float uMotion; uniform float uSize; uniform float uPixelRatio;
  attribute vec3 aFrom; attribute vec3 aTo; attribute float aAccFrom; attribute float aAccTo; attribute float aSeed;
  varying float vAcc; varying float vFade; varying float vSeed;
  void main() {
    float l = smoothstep(0.0, 1.0, clamp(uK * 1.5 - aSeed * 0.5, 0.0, 1.0));
    vec3 p = mix(aFrom, aTo, l);
    p += vec3(sin(aSeed * 31.0 + uTime), cos(aSeed * 17.0 + uTime * 0.8), sin(aSeed * 11.0 - uTime)) * sin(l * 3.14159) * 0.28;
    p += uMotion * 0.008 * vec3(sin(uTime + aSeed * 40.0), cos(uTime * 0.9 + aSeed * 23.0), 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vAcc = mix(aAccFrom, aAccTo, l);
    vSeed = aSeed;
    float depth = -mv.z;
    vFade = clamp(1.6 - depth * 0.22, 0.25, 1.0);
    gl_PointSize = max(1.0, uSize * (1.0 + vAcc * 0.6) * (0.75 + aSeed * 0.5) * uPixelRatio / depth);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uBase; uniform vec3 uSignal; uniform float uTime; uniform float uMotion;
  varying float vAcc; varying float vFade; varying float vSeed;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, 0.05, r);
    float pulse = 0.8 + 0.2 * sin(uTime * 1.7 + vSeed * 40.0) * uMotion;
    vec3 col = mix(uBase * mix(0.8, 1.0, fract(vSeed * 5.3)), uSignal, vAcc);
    gl_FragColor = vec4(col, core * vFade * mix(0.5, 0.95 * pulse, vAcc));
  }
`;

/** Point cloud that morphs between procedural forms on the GPU. */
export function MorphCloud({
  data,
  index,
  reducedMotion,
  pointer,
}: {
  data: CloudForms;
  index: number;
  reducedMotion: boolean;
  pointer: React.RefObject<{ x: number; y: number }>;
}) {
  const gl = useThree((s) => s.gl);
  const group = useRef<THREE.Group>(null);
  const state = useRef({ from: index, to: index, k: 1 });

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const f = data.forms[index];
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(f.pos), 3));
    g.setAttribute('aFrom', new THREE.BufferAttribute(new Float32Array(f.pos), 3));
    g.setAttribute('aTo', new THREE.BufferAttribute(new Float32Array(f.pos), 3));
    g.setAttribute('aAccFrom', new THREE.BufferAttribute(new Float32Array(f.acc), 1));
    g.setAttribute('aAccTo', new THREE.BufferAttribute(new Float32Array(f.acc), 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(data.seeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uK: { value: 1 },
          uTime: { value: 0 },
          uMotion: { value: 1 },
          uSize: { value: 10 },
          uPixelRatio: { value: 1 },
          uBase: { value: new THREE.Color('#e8eef8') },
          uSignal: { value: new THREE.Color('#3fa9f5') },
        },
      }),
    [],
  );

  useEffect(() => {
    const s = state.current;
    if (index === s.to) return;
    s.from = s.to;
    s.to = index;
    s.k = reducedMotion ? 1 : 0;
    const set = (name: string, arr: Float32Array) => {
      const attr = geometry.getAttribute(name) as THREE.BufferAttribute;
      (attr.array as Float32Array).set(arr);
      attr.needsUpdate = true;
    };
    set('aFrom', data.forms[s.from].pos);
    set('aTo', data.forms[s.to].pos);
    set('aAccFrom', data.forms[s.from].acc);
    set('aAccTo', data.forms[s.to].acc);
  }, [index, data, geometry, reducedMotion]);

  useFrame((st, dt) => {
    const s = state.current;
    if (s.k < 1) s.k = Math.min(1, s.k + dt / 1.4);
    const u = material.uniforms;
    u.uK.value = s.k;
    u.uTime.value = reducedMotion ? 0 : st.clock.elapsedTime;
    u.uMotion.value = reducedMotion ? 0 : 1;
    u.uPixelRatio.value = gl.getPixelRatio();
    if (group.current && !reducedMotion) {
      const p = pointer.current ?? { x: 0, y: 0 };
      group.current.rotation.y += dt * 0.18;
      group.current.rotation.x += (-0.25 + p.y * 0.3 - group.current.rotation.x) * (1 - Math.exp(-dt * 3));
      group.current.rotation.z += (p.x * 0.15 - group.current.rotation.z) * (1 - Math.exp(-dt * 3));
    }
  });

  return (
    <group ref={group} rotation={[-0.25, 0.5, 0]}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
