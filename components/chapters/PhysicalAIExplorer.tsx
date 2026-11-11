'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { innovationCopy, innovationStages, type StageId } from '@/content/innovation';
import { getQualityTier, hasWebGL, type QualityTier } from '@/lib/device';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ChapterTransition } from './ChapterTransition';

const HumanoidScene = dynamic(() => import('./robotics/HumanoidScene'), { ssr: false });
type ViewId = 'front' | 'threeq' | 'side';
const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'front', label: 'Front' },
  { id: 'threeq', label: '3/4' },
  { id: 'side', label: 'Side' },
];
const CYCLE_MS = 7000;

export function PhysicalAIExplorer() {
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const [mode, setMode] = useState<'pending' | 'webgl' | 'fallback'>('pending');
  const [tier, setTier] = useState<QualityTier>('medium');
  const [view, setView] = useState<ViewId>('threeq');
  const [resetKey, setResetKey] = useState(0);
  const [points, setPoints] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const near = useInView(stageRef, { rootMargin: '600px', once: true });
  const visible = useInView(stageRef);
  const focused = useInView(stageRef, { rootMargin: '-25% 0px -25% 0px' });
  const reduced = useReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelEls = useRef<(HTMLElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const st = innovationStages[idx];

  useEffect(() => {
    if (!near || mode !== 'pending') return;
    setTier(getQualityTier());
    setMode(hasWebGL() ? 'webgl' : 'fallback');
  }, [near, mode]);

  // Autoplay through the loop while the figure is in focus.
  useEffect(() => {
    const bar = barRef.current;
    if (!auto || !focused || reduced) {
      if (bar) bar.style.animation = 'none';
      return;
    }
    if (bar) {
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = `fill-x ${CYCLE_MS}ms linear forwards`;
    }
    const t = setTimeout(() => setIdx((i) => (i + 1) % innovationStages.length), CYCLE_MS);
    return () => clearTimeout(t);
  }, [idx, auto, focused, reduced]);

  const select = (i: number) => {
    setIdx(i);
    setAuto(false);
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = innovationStages.length;
    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % n;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + n) % n;
    if (next >= 0) {
      e.preventDefault();
      select(next);
      tabs.current[next]?.focus();
    }
  };

  const tabProps = (i: number) => ({
    role: 'tab' as const,
    'aria-selected': i === idx,
    'aria-controls': 'pai-panel',
    tabIndex: i === idx ? 0 : -1,
    onClick: () => select(i),
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => onKey(e, i),
  });

  return (
    <ChapterTransition
      id="innovation"
      index={innovationCopy.index}
      eyebrow={innovationCopy.eyebrow}
      surface="ink"
      labelledBy="innovation-title"
      title={
        <>
          The next frontier is <span className="text-signal">physical.</span>
        </>
      }
      lede={innovationCopy.lede}
    >
      <div className="grid flex-1 gap-5 lg:grid-cols-[2fr_3fr] lg:gap-8">
        {/* Figure */}
        <div className="flex flex-col lg:order-2" data-reveal>
          <div
            ref={stageRef}
            className="relative h-[64svh] min-h-[420px] overflow-hidden rounded-2xl border border-hi/8 bg-[radial-gradient(ellipse_at_50%_65%,#16223a,#090d16_72%)] lg:h-full lg:min-h-[540px]"
          >
            {mode === 'webgl' && (
              <HumanoidScene
                tier={tier}
                active={visible}
                stage={st.id}
                reducedMotion={reduced}
                labels={st.labels}
                labelEls={labelEls}
                view={view}
                resetKey={resetKey}
                onReady={setPoints}
              />
            )}
            {mode === 'fallback' && (
              <p className="absolute inset-0 flex items-center justify-center p-8 text-center text-mid">
                The interactive 3D figure needs WebGL. Each stage is described alongside.
              </p>
            )}
            {/* Projected annotations */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {st.labels.map((l, i) => (
                <span
                  key={`${st.id}-${l.anchor}`}
                  ref={(el) => {
                    labelEls.current[i] = el;
                  }}
                  className="absolute top-0 left-0 opacity-0 transition-opacity duration-300"
                >
                  <span className="t-label block -translate-x-1/2 -translate-y-[150%] rounded-full border border-cyan/40 bg-ink-950/85 px-2.5 py-1 whitespace-nowrap text-hi shadow-[0_0_20px_rgb(60_196_210/0.15)]">
                    {l.text}
                  </span>
                </span>
              ))}
            </div>
            {mode === 'webgl' && points === null && (
              <p className="t-label absolute inset-0 flex items-center justify-center text-mid">Assembling point cloud…</p>
            )}
            <span className="t-label pointer-events-none absolute top-4 left-4 text-lo">
              Concept model · original design{points ? ` · ${(points / 1000).toFixed(0)}k points` : ''}
            </span>
            <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full border border-hi/10 bg-ink-950/70 p-1 backdrop-blur" role="group" aria-label="Camera view">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={view === v.id}
                  onClick={() => {
                    setView(v.id);
                    setResetKey((k) => k + 1);
                  }}
                  className={`t-label rounded-full px-2.5 py-1.5 transition-colors ${view === v.id ? 'bg-signal/20 text-hi' : 'text-mid hover:text-hi'}`}
                >
                  {v.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setView('threeq');
                  setResetKey((k) => k + 1);
                }}
                className="t-label rounded-full px-2.5 py-1.5 text-mid hover:text-hi"
              >
                Reset
              </button>
            </div>
            <span className="t-label pointer-events-none absolute top-4 right-4 hidden text-lo sm:block">Drag to orbit</span>
          </div>
          {/* Mobile stage chips, directly under the figure */}
          <div role="tablist" aria-label="Stages" className="no-scrollbar -mx-[var(--gutter)] mt-3 flex gap-1.5 overflow-x-auto px-[var(--gutter)] lg:hidden">
            {innovationStages.map((s, i) => (
              <button
                key={s.id}
                {...tabProps(i)}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-[0.85rem] whitespace-nowrap ${
                  i === idx ? 'border-signal bg-signal/15 text-hi' : 'border-hi/12 text-mid'
                }`}
              >
                <span className="t-mono-plain mr-1.5 text-[0.7rem] text-signal">{i + 1}</span>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stage selector + explanation */}
        <div className="flex flex-col gap-4 lg:order-1" data-reveal>
          <div role="tablist" aria-label="Stages of a physical AI system" aria-orientation="vertical" className="hidden lg:grid lg:gap-1">
            {innovationStages.map((s, i) => {
              const on = i === idx;
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  {...tabProps(i)}
                  id={`pai-tab-${s.id}`}
                  className={`choice group relative overflow-hidden !py-2.5 ${on ? '' : 'text-mid hover:text-hi'}`}
                >
                  <span
                    className={`t-mono-plain flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.68rem] ${
                      on ? 'bg-signal text-ink-950' : 'border border-hi/20 text-lo group-hover:border-signal/60'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="font-medium">{s.name}</span>
                  <span className="ml-auto text-[0.82rem] text-lo">{s.question}</span>
                  {on && (
                    <span aria-hidden="true" className="absolute inset-x-3 bottom-0 h-px bg-hi/10">
                      <span ref={barRef} className="block h-px origin-left bg-signal" style={{ transform: 'scaleX(0)' }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <article id="pai-panel" role="tabpanel" aria-live="polite" className="panel flex-1 p-5 md:p-6">
            <div key={st.id} className="swap-in">
              <div className="flex items-center justify-between">
                <p className="t-label text-signal">
                  Stage {idx + 1} / {innovationStages.length} · {st.name}
                </p>
                <button type="button" onClick={() => setAuto((a) => !a)} aria-pressed={auto} className="t-label text-mid hover:text-hi">
                  {auto ? '❚❚ Pause tour' : '▶ Resume tour'}
                </button>
              </div>
              <p className="t-h3 mt-3 text-hi">{st.question}</p>
              <p className="t-body mt-3 text-hi/85">{st.text}</p>
              <ul className="mt-4 grid gap-1.5">
                {st.elements.map((e) => (
                  <li key={e} className="t-small flex gap-3 text-mid">
                    <span className="mt-[0.6rem] h-px w-3 shrink-0 bg-signal" aria-hidden="true" />
                    {e}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => select((idx + innovationStages.length - 1) % innovationStages.length)} className="btn-line !py-2 text-[0.85rem]">
                  ← Previous
                </button>
                <button type="button" onClick={() => select((idx + 1) % innovationStages.length)} className="btn-line !py-2 text-[0.85rem]">
                  Next stage →
                </button>
              </div>
            </div>
          </article>
          <p className="t-label text-lo">{innovationCopy.note}</p>
        </div>
      </div>
    </ChapterTransition>
  );
}
