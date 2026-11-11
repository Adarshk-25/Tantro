'use client';

import { useEffect, useRef } from 'react';
import type { ChartKind } from '@/content/intelligence';
import { drawChart } from '@/components/chapters/lab/charts';
import { createLineSim } from '@/components/chapters/intelligence/bottleneck';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

/** A decision-lab chart that cycles raw → model → insight on its own. */
export function ChartPreview({ kind, label, className = '' }: { kind: ChartKind; label: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !inView) return;
    const sim = createLineSim();
    let raf = 0;
    let t = 1.2;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduced) t += dt;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cyc = reduced ? 9 : t % 9;
      const phase = (cyc < 3 ? 0 : cyc < 5.5 ? 1 : 2) as 0 | 1 | 2;
      const k = phase === 0 ? 1 : Math.min(1, (cyc - (phase === 1 ? 3 : 5.5)) / 1.3);
      drawChart(kind, ctx, { w, h, t, phase, k, sim });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, kind, reduced]);
  return <canvas ref={ref} className={`block w-full ${className}`} role="img" aria-label={label} />;
}
