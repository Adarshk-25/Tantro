'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { dprCap, type QualityTier } from '@/lib/device';

/**
 * Shared R3F canvas wrapper.
 *  - caps device pixel ratio by quality tier
 *  - stops rendering entirely when off-screen or the tab is hidden
 *  - lowers DPR if sustained frame rate drops (frame-rate-aware quality)
 */
export function SceneCanvas({
  tier,
  active,
  children,
  className,
  label,
  camera = { position: [0, 0, 9], fov: 38 },
}: {
  tier: QualityTier;
  active: boolean;
  children: ReactNode;
  className?: string;
  label: string;
  camera?: { position: [number, number, number]; fov: number };
}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <div className={className} role="img" aria-label={label}>
      <Canvas
        dpr={[1, dprCap[tier]]}
        frameloop={active && visible ? 'always' : 'never'}
        camera={{ position: camera.position, fov: camera.fov, near: 0.1, far: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <AdaptiveDpr cap={dprCap[tier]} />
        {children}
      </Canvas>
    </div>
  );
}

/** Steps DPR down when the average frame time stays above ~40 ms. */
function AdaptiveDpr({ cap }: { cap: number }) {
  const setDpr = useThree((s) => s.setDpr);
  const samples = useRef<number[]>([]);
  const current = useRef(cap);
  useEffect(() => {
    current.current = Math.min(cap, window.devicePixelRatio || 1);
  }, [cap]);
  useFrame((_, delta) => {
    // Ignore long gaps (scrolling back into view, tab switches).
    if (delta < 0.25) samples.current.push(delta);
    if (samples.current.length < 90) return;
    const avg = samples.current.reduce((a, b) => a + b, 0) / samples.current.length;
    samples.current = [];
    if (avg > 0.04 && current.current > 0.75) {
      current.current = Math.max(0.75, current.current - 0.25);
      setDpr(current.current);
    }
  });
  return null;
}
