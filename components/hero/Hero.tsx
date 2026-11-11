'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hero } from '@/content/hero';
import { getQualityTier, hasWebGL, type QualityTier } from '@/lib/device';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { clamp } from '@/lib/random';
import { heroAnchors } from '@/lib/particles/shapes';
import { heroMorphAt, useScrollStory } from '@/components/scroll/ScrollStoryController';
import type { MorphStore } from '@/components/three/ParticleMorphSystem';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });
const HeroFallback = dynamic(() => import('./HeroFallback'), { ssr: false });

type Mode = 'pending' | 'webgl' | 'fallback';
const HOLD_MS = 2800;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const meterRef = useRef<HTMLSpanElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const store = useRef<MorphStore>({ morph: 0, explode: 0, labels: {} });
  const explodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullRef = useRef(false);

  const reduced = useReducedMotion();
  const inView = useInView(sectionRef, { rootMargin: '100px' });
  const [mode, setMode] = useState<Mode>('pending');
  const [tier, setTier] = useState<QualityTier>('medium');
  const [narrow, setNarrow] = useState(false);
  const [exploded, setExploded] = useState(false);
  const anchors = useMemo(() => heroAnchors().flat(), []);

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

  /* ---------- Component disassembly ---------- */
  const reform = useCallback(() => {
    if (explodeTimer.current) clearTimeout(explodeTimer.current);
    fullRef.current = false;
    store.current.explode = 0;
    setExploded(false);
  }, []);
  const disassemble = useCallback(() => {
    if (explodeTimer.current) clearTimeout(explodeTimer.current);
    fullRef.current = true;
    store.current.explode = 1;
    setExploded(true);
    // hold at a readable exploded state, then reform
    explodeTimer.current = setTimeout(reform, HOLD_MS + 1200);
  }, [reform]);
  const toggle = useCallback(() => (fullRef.current ? reform() : disassemble()), [disassemble, reform]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && fullRef.current && reform();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (explodeTimer.current) clearTimeout(explodeTimer.current);
    };
  }, [reform]);

  /* ---------- Scroll choreography ---------- */
  const onProgress = useCallback((p: number) => {
    const morph = heroMorphAt(p);
    store.current.morph = morph;
    const headOut = clamp((p - 0.03) / 0.07);
    if (headRef.current) {
      headRef.current.style.opacity = String(1 - headOut);
      headRef.current.style.transform = `translate3d(0, ${-headOut * 30}px, 0)`;
      headRef.current.style.visibility = headOut >= 1 ? 'hidden' : 'visible';
    }
    panelRefs.current.forEach((el, k) => {
      if (!el) return;
      let o = clamp(1 - Math.abs(morph - k) * 2.4);
      if (k === 0) o *= clamp((p - 0.07) / 0.05);
      el.style.opacity = String(o);
      el.style.transform = `translate3d(0, ${(morph - k) * -22}px, 0)`;
      const on = o > 0.5;
      el.style.pointerEvents = on ? 'auto' : 'none';
      el.setAttribute('aria-hidden', on ? 'false' : 'true');
      el.inert = !on;
    });
    const step = Math.round(morph);
    if (meterRef.current) meterRef.current.style.transform = `scaleX(${morph / 3})`;
    if (counterRef.current) counterRef.current.textContent = `S${step + 1} / 04`;
    stepRefs.current.forEach((el, k) => {
      if (!el) return;
      el.classList.toggle('text-hi', k === step);
      el.classList.toggle('text-lo', k !== step);
    });
    if (cueRef.current) cueRef.current.style.opacity = String(1 - clamp(p / 0.05));
    // leaving a stage reforms the model
    if (fullRef.current && Math.abs(morph - Math.round(morph)) > 0.15) {
      fullRef.current = false;
      store.current.explode = 0;
    }
  }, []);
  useScrollStory(sectionRef, onProgress);

  // Hover preview: a subtle separation while the pointer rests over the model.
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || fullRef.current) return;
      const r = el.getBoundingClientRect();
      const overModel = narrow ? e.clientY - r.top < r.height * 0.55 : e.clientX - r.left > r.width * 0.46;
      const inside = e.clientY >= r.top && e.clientY <= r.bottom;
      store.current.explode = inside && overModel ? 0.14 : 0;
    };
    const leave = () => !fullRef.current && (store.current.explode = 0);
    const click = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a,button,[role="button"]')) return;
      const r = el.getBoundingClientRect();
      const overModel = narrow ? e.clientY - r.top < r.height * 0.55 : e.clientX - r.left > r.width * 0.46;
      if (overModel) toggle();
    };
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    el.addEventListener('click', click);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('click', click);
    };
  }, [narrow, toggle]);

  return (
    <section id="top" ref={sectionRef} aria-labelledby="hero-title" className="relative h-[400svh] md:h-[460svh]" data-chapter="top" data-surface="ink">
      <div ref={stickyRef} className="grain sticky top-0 h-[100svh] overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          {mode === 'webgl' && <HeroScene tier={tier} store={store} active={inView} reducedMotion={reduced} narrow={narrow} />}
          {mode === 'fallback' && <HeroFallback store={store} />}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(9_13_22/0.92)_0%,rgb(9_13_22/0.55)_36%,transparent_62%)] max-lg:bg-[linear-gradient(0deg,rgb(9_13_22/0.96)_0%,rgb(9_13_22/0.7)_42%,transparent_66%)]"
        />

        {/* Projected labels for the industrial objects */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {anchors.map((a) => (
            <span
              key={a.id}
              ref={(el) => {
                store.current.labels[a.id] = el;
              }}
              className="absolute top-0 left-0 opacity-0"
            >
              <span className="t-label block -translate-x-1/2 -translate-y-[130%] rounded-full border border-signal/30 bg-ink-950/80 px-2.5 py-1 whitespace-nowrap text-hi backdrop-blur-sm max-lg:text-[0.58rem]">
                {a.label}
              </span>
            </span>
          ))}
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col px-[var(--gutter)] pt-[calc(var(--nav-h)+1.25rem)] pb-7">
          <div className="t-label hidden items-center gap-4 text-mid lg:flex">
            <span className="hairline-gradient h-px w-10" aria-hidden="true" />
            <span>Automation · Connectivity · Intelligence · Physical AI</span>
          </div>

          <div className="relative mt-auto max-w-[40rem] lg:max-w-[min(44vw,40rem)]">
            {/* Opening */}
            <div ref={headRef} className="will-change-transform">
              <h1 id="hero-title" className="t-h1 text-hi">
                <span className="block">{hero.headline[0]}</span>
                <span className="text-brand-gradient block">{hero.headline[1]}</span>
              </h1>
              <p className="t-lede mt-6 max-w-[34rem] text-mid">{hero.support}</p>
              <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
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

            {/* Stage dialogue, synchronised with the transformation */}
            {hero.stages.map((s, k) => (
              <div
                key={s.code}
                ref={(el) => {
                  panelRefs.current[k] = el;
                }}
                className="absolute bottom-0 left-0 w-full opacity-0"
                aria-hidden="true"
                style={{ pointerEvents: 'none' }}
              >
                <p className="t-label flex items-center gap-3 text-signal">
                  <span className="rounded-full border border-signal/40 px-2 py-0.5">{s.code} / 04</span>
                  <span className="text-mid">{s.name}</span>
                </p>
                <h2 className="t-h2 mt-4 text-hi">{s.headline}</h2>
                <p className="t-body mt-4 max-w-[34rem] text-mid">{s.body}</p>
                <ul className="mt-5 grid gap-1.5">
                  {s.highlights.map((h) => (
                    <li key={h} className="t-small flex items-center gap-3 text-hi/85">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
                <a href={s.cta.href} className="btn-line mt-5 !py-2.5 text-[0.9rem]">
                  {s.cta.label} <span aria-hidden="true">→</span>
                </a>
              </div>
            ))}
          </div>

          {/* Readout and model controls */}
          <div className="mt-7 flex items-end justify-between gap-6 text-mid">
            <div ref={cueRef} className="t-label flex items-center gap-3">
              <span className="relative flex h-9 w-6 justify-center rounded-full border border-hi/30" aria-hidden="true">
                <span className="blink mt-1.5 block h-2 w-0.5 rounded bg-signal" />
              </span>
              Scroll to transform
            </div>
            <div className="pointer-events-auto flex items-center gap-5">
              <button
                type="button"
                onClick={toggle}
                aria-pressed={exploded}
                className="t-label rounded-full border border-hi/20 bg-ink-950/60 px-3.5 py-2 text-hi backdrop-blur transition-colors hover:border-signal"
              >
                {exploded ? '⟲ Reassemble' : `⤢ ${hero.explore}`}
              </button>
              <div className="hidden w-[min(28rem,34vw)] lg:block" aria-hidden="true">
                <div className="relative h-px bg-hi/15">
                  <span ref={meterRef} className="hairline-gradient absolute inset-0 origin-left" style={{ transform: 'scaleX(0)' }} />
                </div>
                <ol className="t-label mt-3 grid grid-cols-4">
                  {hero.stages.map((s, k) => (
                    <li
                      key={s.code}
                      ref={(el) => {
                        stepRefs.current[k] = el;
                      }}
                      className={`transition-colors duration-500 ${k === 0 ? 'text-hi' : 'text-lo'} ${k === 3 ? 'text-right' : k > 0 ? 'text-center' : ''}`}
                    >
                      {s.name}
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
      </div>
    </section>
  );
}
