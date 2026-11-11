'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { networkCopy, scenarios } from '@/content/network';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ArchitectureDiagram } from '@/components/viz/ArchitectureDiagram';
import { ChapterTransition } from './ChapterTransition';

export function ConnectivityExplorer() {
  const [idx, setIdx] = useState(0);
  const [focusLink, setFocusLink] = useState<number | null>(null);
  const [vertical, setVertical] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef);
  const reduced = useReducedMotion();
  const sc = scenarios[idx];
  const label = (id: string) => sc.nodes.find((n) => n.id === id)?.label;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const upd = () => setVertical(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);

  const go = (i: number) => {
    const n = scenarios.length;
    setIdx(((i % n) + n) % n);
    setFocusLink(null);
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i + 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i - 1;
    if (next !== -1) {
      e.preventDefault();
      const n = (next + scenarios.length) % scenarios.length;
      go(n);
      tabs.current[n]?.focus();
      tabs.current[n]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  return (
    <ChapterTransition
      id="connectivity"
      index={networkCopy.index}
      eyebrow={networkCopy.eyebrow}
      surface="ink"
      labelledBy="connectivity-title"
      title={
        <>
          Make systems <span className="text-signal">speak.</span>
        </>
      }
      lede={networkCopy.lede}
    >
      <div className="flex flex-1 flex-col gap-5">
        {/* Scenario selector */}
        <div
          role="tablist"
          aria-label="Connectivity scenarios"
          className="no-scrollbar -mx-[var(--gutter)] flex snap-x gap-1.5 overflow-x-auto px-[var(--gutter)] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0"
          data-reveal
        >
          {scenarios.map((s, i) => {
            const on = i === idx;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                aria-selected={on}
                aria-controls="conn-panel"
                id={`conn-tab-${s.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => go(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`group flex shrink-0 snap-start items-baseline gap-2.5 rounded-xl border px-3.5 py-2 text-left transition-colors md:shrink ${
                  on ? 'border-signal/60 bg-signal/10 text-hi' : 'border-hi/8 text-mid hover:border-hi/25 hover:text-hi'
                }`}
              >
                <span className={`t-mono-plain text-[0.7rem] ${on ? 'text-signal' : 'text-lo group-hover:text-signal'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[0.86rem] leading-snug font-medium whitespace-nowrap md:whitespace-normal">{s.name}</span>
              </button>
            );
          })}
        </div>

        <div id="conn-panel" role="tabpanel" aria-labelledby={`conn-tab-${sc.id}`} className="grid flex-1 gap-5 lg:grid-cols-12">
          <div ref={stageRef} className="panel relative flex flex-col p-3 md:p-5 lg:col-span-8" data-reveal>
            <div className="t-label mb-2 flex flex-wrap items-center justify-between gap-2 text-lo">
              <span>
                Pattern · <span className="text-mid">{sc.short}</span>
              </span>
              <span className="text-mid">Hover or tap a node to trace its data paths</span>
            </div>
            <div key={sc.id} className="swap-in flex flex-1 items-center lg:items-start">
              <ArchitectureDiagram scenario={sc} vertical={vertical} animate={inView && !reduced} focusLink={focusLink} />
            </div>
          </div>

          <aside className="panel flex flex-col p-5 md:p-6 lg:col-span-4" aria-live="polite" data-reveal>
            <div key={sc.id} className="swap-in flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <p className="t-label text-signal">
                  Scenario {String(idx + 1).padStart(2, '0')} / {String(scenarios.length).padStart(2, '0')}
                </p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => go(idx - 1)} className="rounded-full px-2 py-1 text-mid hover:text-hi" aria-label="Previous scenario">
                    ←
                  </button>
                  <button type="button" onClick={() => go(idx + 1)} className="rounded-full px-2 py-1 text-mid hover:text-hi" aria-label="Next scenario">
                    →
                  </button>
                </div>
              </div>
              <h3 className="t-h3 mt-2 text-hi">{sc.name}</h3>
              <dl className="t-small mt-4 grid gap-3">
                <div>
                  <dt className="t-label text-mid">Challenge</dt>
                  <dd className="mt-1 text-hi/85">{sc.challenge}</dd>
                </div>
                <div>
                  <dt className="t-label text-mid">How we architect it</dt>
                  <dd className="mt-1 text-hi/85">{sc.approach}</dd>
                </div>
                <div>
                  <dt className="t-label text-signal">Outcome</dt>
                  <dd className="mt-1 text-hi">{sc.outcome}</dd>
                </div>
              </dl>
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
                {sc.tech.map((t) => (
                  <li key={t} className="t-mono-plain rounded-full border border-hi/12 px-2.5 py-1 text-[0.7rem] text-mid">
                    {t}
                  </li>
                ))}
              </ul>
              <details className="group mt-4 border-t border-hi/10 pt-3">
                <summary className="t-label flex cursor-pointer list-none items-center justify-between text-mid hover:text-hi">
                  Data paths ({sc.links.length})
                  <span className="transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <ul className="mt-2 grid gap-0.5">
                  {sc.links.map((l, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onPointerEnter={() => setFocusLink(i)}
                        onPointerLeave={() => setFocusLink(null)}
                        onFocus={() => setFocusLink(i)}
                        onBlur={() => setFocusLink(null)}
                        className={`flex w-full items-baseline justify-between gap-3 rounded-md px-2 py-1 text-left text-[0.8rem] transition-colors ${
                          focusLink === i ? 'bg-signal/10 text-hi' : 'text-mid hover:text-hi'
                        }`}
                      >
                        <span className="truncate">
                          {label(l.from)} <span className="text-lo">→</span> {label(l.to)}
                        </span>
                        <span className="t-mono-plain shrink-0 text-[0.68rem] text-signal-soft">{l.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </aside>
        </div>
        <p className="t-label text-lo">
          Architecture patterns for illustration. Every site is designed around its own constraints, standards and security zones.
        </p>
      </div>
    </ChapterTransition>
  );
}
