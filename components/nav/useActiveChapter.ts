'use client';

import { useEffect, useState } from 'react';

/** Tracks which [data-chapter] section crosses the middle of the viewport. */
export function useActiveChapter(): string {
  const [active, setActive] = useState('top');
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.getAttribute('data-chapter') ?? 'top');
        });
      },
      { rootMargin: '-48% 0px -48% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

/** Which surface ("ink" | "bone") sits under the fixed navigation bar. */
export function useSurfaceUnderNav(): 'ink' | 'bone' {
  const [surface, setSurface] = useState<'ink' | 'bone'>('ink');
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-surface]'));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setSurface((e.target.getAttribute('data-surface') as 'ink' | 'bone') ?? 'ink');
        });
      },
      { rootMargin: '0px 0px -96% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return surface;
}
