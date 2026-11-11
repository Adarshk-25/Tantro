'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { capabilities, capabilitiesCopy } from '@/content/capabilities';
import { CAPABILITY_ORDER } from '@/lib/particles/capabilityShapes';
import { PointCloudProjector } from '@/components/viz/PointCloudProjector';
import { ChapterTransition } from './ChapterTransition';

export function CapabilityExplorer() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const cap = capabilities[active];

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
      surface="bone"
      labelledBy="capabilities-title"
      className="blueprint-light pb-28"
    >
      <div className="grid gap-6 px-[var(--gutter)] pt-20 md:pt-28 lg:grid-cols-12">
        <h2
          id="capabilities-title"
          data-reveal
          className="t-display-condensed text-[clamp(2.6rem,1.2rem+5.2vw,7rem)] lg:col-span-9"
        >
          Different disciplines.
          <br />
          <span className="text-signal-deep">One engineering mindset.</span>
        </h2>
        <p data-reveal className="t-lede text-onlight-mid lg:col-span-3 lg:self-end">
          {capabilitiesCopy.body}
        </p>
      </div>

      <div className="mt-14 grid gap-10 px-[var(--gutter)] lg:grid-cols-12 lg:gap-8" data-reveal>
        {/* Discipline index */}
        <div
          role="tablist"
          aria-label="Capabilities"
          aria-orientation="vertical"
          className="grid grid-cols-2 gap-px self-start bg-onlight/12 sm:grid-cols-3 lg:col-span-3 lg:grid-cols-1 lg:bg-transparent"
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
                className={`group flex items-baseline gap-3 bg-bone-50 px-3 py-3.5 text-left transition-colors lg:border-b lg:border-onlight/12 lg:px-0 lg:py-4 ${
                  on ? 'text-onlight' : 'text-onlight-mid hover:text-onlight'
                }`}
              >
                <span className={`t-mono transition-colors ${on ? 'text-signal-deep' : ''}`}>{c.index}</span>
                <span className="t-display-condensed text-[1.35rem] leading-none transition-transform duration-500 group-hover:translate-x-1 lg:text-[1.9rem]">
                  {c.name}
                </span>
                <span
                  aria-hidden="true"
                  className={`ml-auto hidden h-px bg-signal-deep transition-all duration-500 lg:block ${on ? 'w-10' : 'w-0'}`}
                />
              </button>
            );
          })}
        </div>

        {/* Central technical visualisation */}
        <div className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-square max-w-[560px]">
            <span aria-hidden="true" className="absolute inset-[6%] rounded-full border border-onlight/10" />
            <span aria-hidden="true" className="absolute inset-[22%] rounded-full border border-dashed border-onlight/10" />
            <PointCloudProjector
              formIndex={CAPABILITY_ORDER.indexOf(cap.shape)}
              className="absolute inset-0 h-full w-full"
              label={`Procedural form representing ${cap.full}`}
            />
            <span className="t-mono absolute top-2 left-0 text-[0.62rem] text-onlight-mid">FIG. {cap.index}</span>
            <span className="t-mono absolute right-0 bottom-2 text-[0.62rem] text-onlight-mid">{cap.full}</span>
          </div>
        </div>

        {/* Detail */}
        <div id="cap-panel" role="tabpanel" aria-labelledby={`cap-tab-${cap.id}`} className="lg:col-span-4" key={cap.id}>
          <p className="t-mono text-signal-deep">{cap.full}</p>
          <p className="mt-4 text-[1.3rem] leading-snug font-medium md:text-[1.5rem]">{cap.statement}</p>
          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2" aria-label="Relevant technologies">
            {cap.technologies.map((t) => (
              <li key={t} className="tag-bracket text-onlight-mid">
                {t}
              </li>
            ))}
          </ul>
          <dl className="mt-8 grid gap-6 border-t border-onlight/15 pt-6">
            <div>
              <dt className="t-mono text-onlight-mid">A typical problem</dt>
              <dd className="mt-2 leading-relaxed">{cap.problem}</dd>
            </div>
            <div>
              <dt className="t-mono text-onlight-mid">A typical engagement outcome</dt>
              <dd className="mt-2 leading-relaxed">{cap.outcome}</dd>
            </div>
          </dl>
          <a href="#contact" className="link-signal mt-8 inline-flex items-center gap-2 font-medium text-signal-deep">
            Discuss {cap.name.toLowerCase()} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </ChapterTransition>
  );
}
