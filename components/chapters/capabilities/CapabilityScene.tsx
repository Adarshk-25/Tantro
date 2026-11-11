'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { decodeHumanoid, loadHumanoidBuffer } from '../robotics/pointHumanoid';
import { SceneCanvas } from '@/components/three/SceneCanvas';
import { MorphCloud } from '@/components/three/MorphCloud';
import type { QualityTier } from '@/lib/device';
import { buildCapabilityForms } from '@/lib/particles/capabilityShapes';

const COUNT: Record<QualityTier, number> = { low: 9000, medium: 15000, high: 24000 };

/** Lazy-loaded WebGL figure for the capability explorer. */
export default function CapabilityScene({
  index,
  tier,
  active,
  reducedMotion,
  label,
}: {
  index: number;
  tier: QualityTier;
  active: boolean;
  reducedMotion: boolean;
  label: string;
}) {
  const [humanoid, setHumanoid] = useState<Float32Array | undefined>();
  useEffect(() => {
    loadHumanoidBuffer()
      .then((buf) => setHumanoid(decodeHumanoid(buf, 32038).pos))
      .catch(() => undefined);
  }, []);
  const data = useMemo(() => buildCapabilityForms(COUNT[tier], humanoid), [tier, humanoid]);
  const pointer = useRef({ x: 0, y: 0 });
  return (
    <div
      className="absolute inset-0"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      }}
      onPointerLeave={() => {
        pointer.current.x = 0;
        pointer.current.y = 0;
      }}
    >
      <SceneCanvas tier={tier} active={active} className="absolute inset-0" label={label} camera={{ position: [0, 0, 5.2], fov: 38 }}>
        <MorphCloud data={data} index={index} reducedMotion={reducedMotion} pointer={pointer} />
      </SceneCanvas>
    </div>
  );
}
