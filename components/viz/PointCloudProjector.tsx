'use client';

import { useEffect, useMemo, useRef } from 'react';
import { buildCapabilityForms } from '@/lib/particles/capabilityShapes';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

/**
 * Lightweight 3D point-cloud renderer on a 2D canvas: perspective projection,
 * depth-based size and alpha, staggered morphs. No WebGL context required.
 */
export function PointCloudProjector({
  formIndex,
  ink = '15,23,38',
  accent = '31,91,184',
  className,
  label,
}: {
  formIndex: number;
  ink?: string;
  accent?: string;
  className?: string;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(canvasRef, { rootMargin: '120px' });
  const data = useMemo(() => {
    const small = typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches;
    return buildCapabilityForms(small ? 1100 : 1700);
  }, []);
  const state = useRef({ from: formIndex, to: formIndex, k: 1, rotY: 0.5, tiltX: 0, tiltY: 0, px: 0, py: 0 });

  useEffect(() => {
    const s = state.current;
    if (formIndex === s.to) return;
    s.from = s.to;
    s.to = formIndex;
    s.k = reduced ? 1 : 0;
  }, [formIndex, reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !inView) return;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      state.current.px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      state.current.py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = () => {
      state.current.px = 0;
      state.current.py = 0;
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    let raf = 0;
    let last = performance.now();
    const proj = new Float32Array(data.count * 3);
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const s = state.current;
      if (s.k < 1) s.k = Math.min(1, s.k + dt / 1.3);
      if (!reduced) {
        s.rotY += dt * 0.22;
        s.tiltX += (s.py * 0.35 - s.tiltX) * (1 - Math.exp(-dt * 4));
        s.tiltY += (s.px * 0.5 - s.tiltY) * (1 - Math.exp(-dt * 4));
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const A = data.forms[s.from];
      const B = data.forms[s.to];
      const ry = s.rotY + s.tiltY;
      const rx = -0.32 + s.tiltX;
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);
      const scale = Math.min(w, h) * 0.3;
      for (let i = 0; i < data.count; i++) {
        const local = Math.min(1, Math.max(0, s.k * 1.5 - data.seeds[i] * 0.5));
        const e = local * local * (3 - 2 * local);
        const lift = Math.sin(e * Math.PI) * 0.25;
        let x = A.pos[i * 3] + (B.pos[i * 3] - A.pos[i * 3]) * e;
        let y = A.pos[i * 3 + 1] + (B.pos[i * 3 + 1] - A.pos[i * 3 + 1]) * e + lift * (data.seeds[i] - 0.5);
        let z = A.pos[i * 3 + 2] + (B.pos[i * 3 + 2] - A.pos[i * 3 + 2]) * e;
        // rotate Y then X
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y1 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        x = x1;
        y = y1;
        z = z2;
        const persp = 3.2 / (3.2 - z);
        proj[i * 3] = w / 2 + x * scale * persp;
        proj[i * 3 + 1] = h / 2 - y * scale * persp;
        proj[i * 3 + 2] = persp;
      }
      for (let i = 0; i < data.count; i++) {
        const acc = A.acc[i] + (B.acc[i] - A.acc[i]) * Math.min(1, s.k * 1.2);
        const p = proj[i * 3 + 2];
        const alpha = Math.min(1, 0.25 + (p - 0.7) * 1.1);
        const size = (acc > 0.5 ? 2.6 : 1.5) * p;
        ctx.fillStyle = acc > 0.5 ? `rgba(${accent},${Math.min(1, alpha + 0.25)})` : `rgba(${ink},${alpha * 0.8})`;
        ctx.fillRect(proj[i * 3] - size / 2, proj[i * 3 + 1] - size / 2, size, size);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [data, inView, reduced, ink, accent]);

  return <canvas ref={canvasRef} className={className} role="img" aria-label={label} />;
}
