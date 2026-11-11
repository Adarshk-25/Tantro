'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ensureGsap } from './ScrollStoryController';

/**
 * Opts the document into reveal motion and animates every [data-reveal]
 * element as it enters the viewport. Without JS, or with reduced motion,
 * content is simply visible.
 */
export function MotionRoot() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { gsap, ScrollTrigger } = ensureGsap();
    const root = document.documentElement;
    root.classList.add('js-motion');
    // IntersectionObserver is immune to layout shifts from lazily sized scenes.
    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target);
        if (!entering.length) return;
        entering.forEach((el) => io.unobserve(el));
        gsap.to(entering, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true });
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    const observe = () =>
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        if (getComputedStyle(el).opacity === '0') io.observe(el);
      });
    observe();
    // Keep scroll-linked scenes (the hero) aligned once fonts and scenes settle.
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [pathname]);
  return null;
}
