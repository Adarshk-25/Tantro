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

const FIGURE_CAPTION: Record<string, string> = {
  gear: 'A controlled production cell',
  screens: 'A control room: screens and redundant servers',
  shield: 'Security zones, firewalls and one approved conduit',
  mesh: 'Assets feeding a governed data network',
  lattice: 'Equipment and the model that watches it',
  strata: 'A layered industrial application',
  arm: 'An original humanoid, as a point cloud',
  rack: 'OT, edge and compute layers, segmented',
};

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
      <div className="grid flex-1 gap-6 lg:grid-cols-[22fr_40fr_38fr] lg:gap-8">
        {/* Disciplines */}
        <div
          role="tablist"
          aria-label="Capabilities"
          aria-orientation="vertical"
          className="grid grid-cols-2 gap-1 self-start sm:grid-cols-3 lg:grid-cols-1"
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
        <div id="cap-panel" role="tabpanel" aria-labelledby={`cap-tab-${cap.id}`} data-reveal>
          <div key={cap.id} className="swap-in">
            <p className="t-label text-signal-deep">{cap.full}</p>
            <p className="mt-3 text-[1.15rem] leading-snug font-medium text-onlight md:text-[1.3rem]">{cap.statement}</p>
            <p className="t-small mt-4 text-onlight-mid">
              <strong className="font-semibold text-onlight">Engineering challenge.</strong> {cap.challenge}
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="t-label text-onlight-mid">Services</p>
                <ul className="t-small mt-2 grid gap-1.5 text-onlight/90">
                  {cap.services.map((x) => (
                    <li key={x} className="flex gap-2.5">
                      <span className="mt-[0.6rem] h-px w-3 shrink-0 bg-signal-deep" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="t-label text-onlight-mid">Deliverables</p>
                <ul className="t-small mt-2 grid gap-1.5 text-onlight/90">
                  {cap.deliverables.map((x) => (
                    <li key={x} className="flex gap-2.5">
                      <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full border border-signal-deep" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="t-small mt-5 text-onlight-mid">
              <strong className="font-semibold text-onlight">Approach.</strong> {cap.approach}
            </p>
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Representative technologies">
              {cap.technologies.map((t) => (
                <li key={t} className="t-mono-plain rounded-full border border-onlight/15 bg-white/40 px-2.5 py-1 text-[0.7rem] text-onlight-mid">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl border border-signal-deep/20 bg-[#e3edfc] p-4">
              <p className="t-label text-signal-deep">Typical customer outcome</p>
              <p className="t-small mt-1.5 text-onlight">{cap.outcomes}</p>
            </div>
            <a href={cap.link} className="link-signal mt-5 inline-flex items-center gap-2 text-[0.95rem] font-medium text-signal-deep">
              Go to {cap.name} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Figure */}
        <div data-reveal>
          <div ref={figRef} className="relative aspect-square overflow-hidden rounded-2xl bg-[#0b111c] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)] lg:aspect-auto lg:h-full lg:min-h-[420px]">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgb(232_149_74/0.12),transparent_60%)]" />
            {mode === 'webgl' && (
              <CapabilityScene index={formIndex} tier={tier} active={visible} reducedMotion={reduced} label={`Procedural form representing ${cap.full}`} />
            )}
            {mode === 'fallback' && (
              <PointCloudProjector
                formIndex={formIndex}
                ink="226,234,246"
                accent="76,141,240"
                className="absolute inset-0 h-full w-full"
                label={`Procedural form representing ${cap.full}`}
              />
            )}
            <div className="t-label pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4 text-[#94a2ba]">
              <span>Fig. {cap.index}</span>
              <span>Move pointer to tilt</span>
            </div>
            <p className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
              <span className="block text-[0.95rem] font-medium text-[#f3f6fc]">{cap.name}</span>
              <span className="t-label text-[#94a2ba]">{FIGURE_CAPTION[cap.shape]}</span>
            </p>
          </div>
        </div>
      </div>
    </ChapterTransition>
  );
}
