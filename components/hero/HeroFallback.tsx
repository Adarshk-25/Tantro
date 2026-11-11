'use client';

import { useEffect, useMemo, useRef } from 'react';
import { buildHeroStates } from '@/lib/particles/shapes';
import type { MorphStore } from '@/components/three/ParticleMorphSystem';

/**
 * 2D canvas rendering of the same procedural states, for devices without WebGL.
 * Redraws only when the scroll state changes.
 */
export default function HeroFallback({ store }: { store: React.RefObject<MorphStore> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const states = useMemo(() => buildHeroStates(3200), []);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let raf = 0;
    let lastMorph = -1;
    const draw = () => {
      const morph = store.current?.morph ?? 0;
      if (Math.abs(morph - lastMorph) > 0.002) {
        lastMorph = morph;
        const w = (canvas.width = canvas.clientWidth * Math.min(devicePixelRatio, 1.5));
        const h = (canvas.height = canvas.clientHeight * Math.min(devicePixelRatio, 1.5));
        ctx.clearRect(0, 0, w, h);
        const seg = Math.min(2, Math.floor(morph));
        const f = morph - seg;
        const A = states.positions[seg];
        const B = states.positions[seg + 1];
        const narrow = w < h;
        const cx = narrow ? w * 0.5 : w * 0.66;
        const cy = narrow ? h * 0.32 : h * 0.5;
        const sc = Math.min(w, h) * (narrow ? 0.1 : 0.11);
        for (let i = 0; i < states.count; i++) {
          const x = A[i * 3] + (B[i * 3] - A[i * 3]) * f;
          const y = A[i * 3 + 1] + (B[i * 3 + 1] - A[i * 3 + 1]) * f;
          const z = A[i * 3 + 2] + (B[i * 3 + 2] - A[i * 3 + 2]) * f;
          const persp = 1 / (1 + z * 0.06);
          const acc = states.accents[seg][i] * (1 - f) + states.accents[seg + 1][i] * f;
          ctx.fillStyle = acc > 0.5 ? 'rgba(224,149,74,0.9)' : 'rgba(217,211,199,0.45)';
          const s = acc > 0.5 ? 2.2 : 1.3;
          ctx.fillRect(cx + (x - z * 0.35) * sc * persp, cy - (y + z * 0.18) * sc * persp, s, s);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [states, store]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
