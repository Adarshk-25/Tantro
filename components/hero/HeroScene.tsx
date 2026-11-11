'use client';

import { useMemo } from 'react';
import { SceneCanvas } from '@/components/three/SceneCanvas';
import { ParticleMorphSystem, type MorphStore } from '@/components/three/ParticleMorphSystem';
import { particleBudget, type QualityTier } from '@/lib/device';
import { buildHeroStates } from '@/lib/particles/shapes';

/** Loaded with next/dynamic so three.js never blocks first paint. */
export default function HeroScene({
  tier,
  store,
  active,
  reducedMotion,
  narrow,
}: {
  tier: QualityTier;
  store: React.RefObject<MorphStore>;
  active: boolean;
  reducedMotion: boolean;
  narrow: boolean;
}) {
  const states = useMemo(() => buildHeroStates(particleBudget[tier]), [tier]);
  return (
    <SceneCanvas
      tier={tier}
      active={active}
      className="absolute inset-0"
      label="A field of particles that forms an industrial robot arm, then a layered industrial network, then a neural network, then an integrated system, as you scroll."
    >
      <ParticleMorphSystem states={states} store={store} reducedMotion={reducedMotion} narrow={narrow} />
    </SceneCanvas>
  );
}
