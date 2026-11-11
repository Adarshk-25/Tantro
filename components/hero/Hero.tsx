'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { hero } from '@/content/hero';
import { getQualityTier, hasWebGL, type QualityTier } from '@/lib/device';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { clamp } from '@/lib/random';
import { heroMorphAt, useScrollStory } from '@/components/scroll/ScrollStoryController';
import type { MorphStore } from '@/components/three/ParticleMorphSystem';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });
const HeroFallback = dynamic(() => import('./HeroFallback'), { ssr: false });

type Mode = 'pending' | 'webgl' | 'fallback';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const meterRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const store = useRef<MorphStore>({ morph: 0, pointer: { x: 0, y: 0, active: false } });

  const reduced = useReducedMotion();
  const inView = useInView(sectionRef, { rootMargin: '100px' });
  const [mode, setMode] = useState<Mode>('pending');
  const [tier, setTier] = useState<QualityTier>('medium');
  const [narrow, setNarrow] = useState(false);

  // Decide rendering path after first paint so the headline renders immediately.
  useEffect(() => {
    const decide = () => {
      setTier(getQualityTier());
      setMode(hasWebGL() ? 'webgl' : 'fallback');
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(decide, { timeout: 600 });
    else setTimeout(decide, 120);

    const mq = window.matchMedia('(max-width: 1023px), (orientation: portrait)');
    const upd = () => setNarrow(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);

  const onProgress = useCallback((p: number) => {
    const morph = heroMorphAt(p);
    store.current.morph = morph;

    // Headline gives way to the state captions.
    const headOut = clamp((p - 0.04) / 0.1);
    if (headRef.current) {
      headRef.current.style.opacity = String(1 - headOut);
      headRef.current.style.transform = `translate3d(0, ${-headOut * 40}px, 0)`;
      headRef.current.style.visibility = headOut >= 1 ? 'hidden' : 'visible';
    }
    captionRefs.current.forEach((el, k) => {
      if (!el) return;
      let o = clamp(1 - Math.abs(morph - k) * 2.2);
      if (k === 0) o *= headOut;
      el.style.opacity = String(o);
      el.style.transform = `translate3d(0, ${(morph - k) * -18}px, 0)`;
      el.setAttribute('aria-hidden', o < 0.5 ? 'true' : 'false');
    });
    if (meterRef.current) meterRef.current.style.transform = `scaleX(${morph / 3})`;
    const step = Math.round(morph);
    if (counterRef.current) counterRef.current.textContent = `S${step + 1} / 04`;
    stepRefs.current.forEach((el, k) => {
      if (!el) return;
      el.classList.toggle('text-hi', k === step);
      el.classList.toggle('text-lo', k !== step);
    });
    if (cueRef.current) cueRef.current.style.opacity = String(1 - clamp(p / 0.05));
  }, []);

  useScrollStory(sectionRef, onProgress);

  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      const inside = e.clientY >= r.top && e.clientY <= r.bottom;
      store.current.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      store.current.pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      store.current.pointer.active = inside;
    };
    const leave = () => (store.current.pointer.active = false);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="relative h-[400svh] md:h-[460svh]"
      data-chapter="top"
      data-surface="ink"
    >
      <div ref={stickyRef} className="grain sticky top-0 h-[100svh] overflow-hidden">
        {/* Scene layer */}
        <div className="absolute inset-0">
          {mode === 'webgl' && (
            <HeroScene tier={tier} store={store} active={inView} reducedMotion={reduced} narrow={narrow} />
          )}
          {mode === 'fallback' && <HeroFallback store={store} />}
        </div>
        {/* Legibility: darken the text side only */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(11_12_13/0.86)_0%,rgb(11_12_13/0.35)_42%,transparent_70%)] max-lg:bg-[linear-gradient(0deg,rgb(11_12_13/0.95)_0%,rgb(11_12_13/0.6)_40%,transparent_65%)]"
        />

        <div className="pointer-events-none relative z-10 flex h-full flex-col px-[var(--gutter)] pt-[calc(var(--nav-h)+1.25rem)] pb-8">
          <div className="t-mono hidden items-center gap-4 text-mid lg:flex">
            <span className="h-px w-8 bg-signal" aria-hidden="true" />
            <span>Automation · Connectivity · Intelligence · Physical AI</span>
          </div>

          <div className="relative mt-auto">
            {/* Opening headline */}
            <div ref={headRef} className="max-w-[46rem] will-change-transform">
              <h1 id="hero-title" className="t-h1 text-hi">
                <span className="block">{hero.headline[0]}</span>
                <span className="block text-mid">{hero.headline[1]}</span>
              </h1>
              <p className="t-lede mt-7 max-w-[34rem] text-mid">{hero.support}</p>
              <div className="pointer-events-auto mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
                <a href={hero.primary.href} className="btn-plate">
                  {hero.primary.label}
                  <span className="arrow" aria-hidden="true">
                    ↓
                  </span>
                </a>
                <a href={hero.secondary.href} className="btn-line">
                  {hero.secondary.label}
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            {/* State captions, revealed by scroll */}
            <ol className="absolute bottom-0 left-0 max-w-[30rem]" aria-label="What the particles show">
              {hero.states.map((s, k) => (
                <li
                  key={s.code}
                  ref={(el) => {
                    captionRefs.current[k] = el;
                  }}
                  className="absolute bottom-0 left-0 w-[min(30rem,calc(100vw-2*var(--gutter)))] opacity-0"
                >
                  <p className="t-mono text-signal">
                    {s.code} / 04 — {s.title}
                  </p>
                  <p className="t-h3 mt-3 text-[clamp(1.5rem,1.1rem+1.4vw,2.4rem)] text-hi">{s.line}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Readout: where you are in the transformation */}
          <div className="mt-8 flex items-end justify-between gap-6 text-mid">
            <div ref={cueRef} className="t-label flex items-center gap-3">
              <span className="relative flex h-9 w-6 justify-center rounded-full border border-hi/30" aria-hidden="true">
                <span className="blink mt-1.5 block h-2 w-0.5 rounded bg-signal" />
              </span>
              Scroll to transform
            </div>
            <div className="hidden w-[min(30rem,42vw)] lg:block" aria-hidden="true">
              <div className="relative h-px bg-hi/15">
                <span ref={meterRef} className="absolute inset-0 origin-left bg-signal" style={{ transform: 'scaleX(0)' }} />
              </div>
              <ol className="t-label mt-3 grid grid-cols-4">
                {hero.states.map((s, k) => (
                  <li
                    key={s.code}
                    ref={(el) => {
                      stepRefs.current[k] = el;
                    }}
                    className={`transition-colors duration-500 ${k === 0 ? 'text-hi' : 'text-lo'} ${k === 3 ? 'text-right' : k > 0 ? 'text-center' : ''}`}
                  >
                    {s.title}
                  </li>
                ))}
              </ol>
            </div>
            <span ref={counterRef} className="t-label text-hi lg:hidden" aria-hidden="true">
              S1 / 04
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
