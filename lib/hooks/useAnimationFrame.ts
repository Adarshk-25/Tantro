'use client';

import { useEffect, useRef } from 'react';

/**
 * Runs `cb(time, delta)` every frame while `active` is true and the tab is visible.
 * Delta is clamped so a backgrounded tab does not produce a huge jump.
 */
export function useAnimationFrame(cb: (t: number, dt: number) => void, active: boolean) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!document.hidden) cbRef.current(now / 1000, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
