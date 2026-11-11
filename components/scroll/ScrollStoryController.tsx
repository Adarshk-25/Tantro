'use client';

import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;
export function ensureGsap() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/**
 * Maps native scroll position across `sectionRef` to a 0..1 progress value.
 * It never intercepts scrolling — it only observes it (no scroll hijacking).
 */
export function useScrollStory(
  sectionRef: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
) {
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const { ScrollTrigger } = ensureGsap();
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => onProgress(self.progress),
      onRefresh: (self) => onProgress(self.progress),
    });
    return () => st.kill();
  }, [sectionRef, onProgress]);
}

/**
 * Hero choreography: scroll progress → morph value in [0, 3] with holds, so
 * each state rests long enough to be read.
 */
const KEYS: [number, number][] = [
  [0, 0],
  [0.16, 0],
  [0.32, 1],
  [0.42, 1],
  [0.58, 2],
  [0.68, 2],
  [0.86, 3],
  [1, 3],
];

export function heroMorphAt(p: number): number {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [p0, v0] = KEYS[i];
    const [p1, v1] = KEYS[i + 1];
    if (p <= p1) {
      const t = p1 === p0 ? 0 : (p - p0) / (p1 - p0);
      const e = t * t * (3 - 2 * t);
      return v0 + (v1 - v0) * e;
    }
  }
  return 3;
}
