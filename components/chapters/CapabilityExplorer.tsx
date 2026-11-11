'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { capabilities, capabilitiesCopy } from '@/content/capabilities';
import { CAPABILITY_ORDER } from '@/lib/particles/capabilityShapes';
import { getQualityTier, hasWebGL, type QualityTier } from '@/lib/device';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { PointCloudProjector } from '@/components/viz/PointCloudProjector';
import { ChapterTransition } from './ChapterTransition';

const CapabilityScene = dynamic(() => import('./capabilities/CapabilityScene'), { ssr: false });

export function CapabilityExplorer() {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<'pending' | 'webgl' | 'fallback'>('pending');
  const [tier, setTier] = useState<QualityTier>('medium');
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const figRef = useRef<HTMLDivElement>(null);
  const near = useInView(figRef, { rootMargin: '500px', once: true });
  const visible = useInView(figRef);
  const reduced = useReducedMotion();
  const cap = capabilities[active];
  const formIndex = CAPABILITY_ORDER.indexOf(cap.shape);

  useEffect(() => {
    if (!near || mode !== 'pending') return;
    setTier(getQualityTier());
    setMode(hasWebGL() ? 'webgl' : 'fallback');
  }, [near, mode]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = capabilities.length;
    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % n;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + n) % n;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    if (next >= 0) {
      e.preventDefault();
      setActive(next);
      tabs.current[next]?.focus();
    }
  };

  return (
    <ChapterTransition
      id="capabilities"
      index={capabilitiesCopy.index}
      eyebrow={capabilitiesCopy.eyebrow}
      surface="stone"
      labelledBy="capabilities-title"
      title={
        <>
          Different disciplines.
          <br />
          <span className="text-signal-deep">One engineering mindset.</span>
        </>
      }
      lede={capabilitiesCopy.lede}
    >
      <div className="grid flex-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Disciplines */}
        <div
          role="tablist"
          aria-label="Capabilities"
          aria-orientation="vertical"
          className="grid grid-cols-2 gap-1 self-start sm:grid-cols-3 lg:col-span-3 lg:grid-cols-1"
          data-reveal
        >
          {capabilities.map((c, i) => {
            const on = i === active;
            return (
              <button
                key={c.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`cap-tab-${c.id}`}
                aria-selected={on}
                aria-controls="cap-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`choice group !py-3 ${on ? 'text-onlight' : 'text-onlight-mid hover:text-onlight'}`}
              >
                <span className={`t-mono-plain text-[0.7rem] ${on ? 'text-signal-deep' : ''}`}>{c.index}</span>
                <span className="flex flex-col">
                  <span className="text-[1.05rem] leading-tight font-semibold lg:text-[1.15rem]">{c.name}</span>
                  <span className="hidden text-[0.75rem] leading-snug opacity-70 lg:block">{c.full}</span>
                </span>
                <span aria-hidden="true" className={`ml-auto hidden transition-transform duration-500 lg:block ${on ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0 group-hover:opacity-60'}`}>
                  →
                </span>
              </button>
            );
          })}
          <p className="t-label col-span-full mt-3 hidden px-3 text-onlight-mid lg:block">
            <span className="kbd">↑</span> <span className="kbd">↓</span> to switch
          </p>
        </div>

        {/* Reading zone */}
        <div id="cap-panel" role="tabpanel" aria-labelledby={`cap-tab-${cap.id}`} className="lg:col-span-5" data-reveal>
          <div key={cap.id} className="swap-in">
            <p className="t-label text-signal-deep">{cap.full}</p>
            <p className="mt-3 text-[1.25rem] leading-snug font-medium text-onlight md:text-[1.4rem]">{cap.statement}</p>
            <ul className="t-small mt-5 grid gap-1.5 text-onlight/85">
              {cap.scope.map((s) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-[0.6rem] h-px w-3 shrink-0 bg-signal-deep" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
            <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
              {cap.technologies.map((t) => (
                <li key={t} className="t-mono-plain rounded-full border border-onlight/15 bg-white/40 px-2.5 py-1 text-[0.7rem] text-onlight-mid">
                  {t}
                </li>
              ))}
            </ul>
            <dl className="mt-6 grid gap-px overflow-hidden rounded-xl border border-onlight/10 bg-onlight/10 sm:grid-cols-3">
              {[
                ['Typical problem', cap.problem],
                ['Engagement outcome', cap.outcome],
                ['Value created', cap.value],
              ].map(([k, v], i) => (
                <div key={k} className={`p-4 ${i === 2 ? 'bg-[#f3e6d6]' : 'bg-stone'}`}>
                  <dt className={`t-label ${i === 2 ? 'text-signal-deep' : 'text-onlight-mid'}`}>{k}</dt>
                  <dd className="t-small mt-2 text-onlight">{v}</dd>
                </div>
              ))}
            </dl>
            <a href="#contact" className="link-signal mt-5 inline-flex items-center gap-2 text-[0.95rem] font-medium text-signal-deep">
              Discuss {cap.name.toLowerCase()} with us <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Figure */}
        <div className="lg:col-span-4" data-reveal>
          <div ref={figRef} className="relative aspect-square overflow-hidden rounded-2xl bg-[#0f1113] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)] lg:aspect-auto lg:h-full lg:min-h-[420px]">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgb(232_149_74/0.12),transparent_60%)]" />
            {mode === 'webgl' && (
              <CapabilityScene index={formIndex} tier={tier} active={visible} reducedMotion={reduced} label={`Procedural form representing ${cap.full}`} />
            )}
            {mode === 'fallback' && (
              <PointCloudProjector
                formIndex={formIndex}
                ink="236,232,224"
                accent="232,149,74"
                className="absolute inset-0 h-full w-full"
                label={`Procedural form representing ${cap.full}`}
              />
            )}
            <div className="t-label pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4 text-[#9d978e]">
              <span>Fig. {cap.index}</span>
              <span>Move pointer to tilt</span>
            </div>
            <p className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-[0.95rem] font-medium text-[#ece8e0]">{cap.name}</p>
          </div>
        </div>
      </div>
    </ChapterTransition>
  );
}
