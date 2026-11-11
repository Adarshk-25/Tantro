'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ensureGsap } from './ScrollStoryController';

/**
 * Opts the document into reveal motion and animates every [data-reveal]
 * element as it enters the viewport. Without JS, or with reduced motion,
 * content is simply visible.
 *
 * Elements mounted AFTER this effect ran (filtered lists, route returns,
 * conditional panels) are registered by a MutationObserver. Previously they
 * stayed at opacity 0 forever — the cause of "All Work shows nothing".
 */
export function MotionRoot() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { gsap, ScrollTrigger } = ensureGsap();
    document.documentElement.classList.add('js-motion');

    const reveal = (els: Element[]) => {
      if (!els.length) return;
      gsap.to(els, { opacity: 1, y: 0, duration: 1.0, ease: 'expo.out', stagger: 0.06, overwrite: true });
    };
    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target);
        entering.forEach((el) => io.unobserve(el));
        reveal(entering);
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    const register = (el: Element) => {
      if ((el as HTMLElement).dataset.revealed) return;
      (el as HTMLElement).dataset.revealed = '1';
      io.observe(el);
    };
    document.querySelectorAll('[data-reveal]').forEach(register);

    const mo = new MutationObserver((records) => {
      records.forEach((r) =>
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.hasAttribute('data-reveal')) register(n);
          n.querySelectorAll?.('[data-reveal]').forEach(register);
        }),
      );
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      clearTimeout(t);
      io.disconnect();
      mo.disconnect();
      document.querySelectorAll<HTMLElement>('[data-revealed]').forEach((el) => delete el.dataset.revealed);
    };
  }, [pathname]);
  return null;
}
