'use client';

import { useEffect, useRef, useState } from 'react';
import { intelligenceCopy, stepLabels, useCases, type UseCase } from '@/content/intelligence';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ChapterTransition } from './ChapterTransition';
import { drawChart } from './lab/charts';
import { createLineSim, stepLineSim, type LineSim } from './intelligence/bottleneck';

const STEP_S = 3.2;
const groups = ['Asset health', 'Quality', 'Operations', 'Energy'] as const;
const phaseOf = (step: number): 0 | 1 | 2 => (step <= 1 ? 0 : step === 2 ? 1 : 2);
const stepText = (u: UseCase, i: number) => [u.context, u.signals, u.model, u.insight, u.action, u.impact][i];

function prewarmed(): LineSim {
  const s = createLineSim();
  for (let i = 0; i < 1200; i++) stepLineSim(s, 0.05);
  return s;
}

export function DecisionLab() {
  const [uc, setUc] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const simRef = useRef<LineSim>(prewarmed());
  const clock = useRef({ t: 1.3, inStep: 0, phaseT: 9 });
  const inView = useInView(wrapRef, { rootMargin: '-15% 0px -15% 0px' });
  const reduced = useReducedMotion();
  const u = useCases[uc];

  const goUc = (i: number) => {
    const n = useCases.length;
    setUc(((i % n) + n) % n);
    setStep(0);
    clock.current.inStep = 0;
    clock.current.phaseT = 0;
  };
  const goStep = (i: number, pause = true) => {
    if (phaseOf(i) !== phaseOf(step)) clock.current.phaseT = 0;
    setStep(i);
    clock.current.inStep = 0;
    if (pause) setPlaying(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !inView) return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      const c = clock.current;
      if (!reduced) {
        c.t += dt;
        if (u.chart === 'bottleneck') stepLineSim(simRef.current, dt * 2.5);
      }
      c.phaseT += dt;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      drawChart(u.chart, ctx, {
        w,
        h,
        t: c.t,
        phase: phaseOf(step),
        k: reduced ? 1 : Math.min(1, c.phaseT / 1.3),
        sim: simRef.current,
      });

      // Autoplay: steps, then the next use case.
      segRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transform = `scaleX(${i < step ? 1 : i > step ? 0 : playing ? Math.min(1, c.inStep / STEP_S) : 1})`;
      });
      if (playing && !reduced) {
        c.inStep += dt;
        if (c.inStep >= STEP_S) {
          c.inStep = 0;
          if (step < 5) {
            if (phaseOf(step + 1) !== phaseOf(step)) c.phaseT = 0;
            setStep(step + 1);
          } else {
            c.phaseT = 0;
            setStep(0);
            setUc((i) => (i + 1) % useCases.length);
          }
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, u, step, playing, reduced]);

  return (
    <ChapterTransition
      id="intelligence"
      index={intelligenceCopy.index}
      eyebrow={intelligenceCopy.eyebrow}
      surface="graphite"
      labelledBy="intelligence-title"
      title={intelligenceCopy.title}
      lede={intelligenceCopy.lede}
    >
      <div ref={wrapRef} className="grid flex-1 gap-5 lg:grid-cols-12">
        {/* Use-case navigator */}
        <nav aria-label="Use cases" className="lg:col-span-3" data-reveal>
          <div className="no-scrollbar -mx-[var(--gutter)] flex gap-1.5 overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:block lg:max-h-[calc(100svh-15rem)] lg:overflow-y-auto lg:px-0 lg:pr-2">
            {groups.map((g) => (
              <div key={g} className="contents lg:mb-2 lg:block">
                <p className="t-label hidden px-3 pt-1 pb-1 text-[0.6rem] text-lo lg:block">{g}</p>
                {useCases.map((c, i) =>
                  c.group !== g ? null : (
                    <button
                      key={c.id}
                      type="button"
                      aria-selected={i === uc}
                      aria-current={i === uc ? 'true' : undefined}
                      onClick={() => goUc(i)}
                      className="choice shrink-0 !py-1.5 text-[0.86rem] text-mid hover:text-hi max-lg:w-auto max-lg:rounded-full max-lg:border max-lg:border-hi/10 max-lg:whitespace-nowrap"
                    >
                      <span className={`t-mono-plain text-[0.68rem] ${i === uc ? 'text-signal' : 'text-lo'}`}>{String(i + 1).padStart(2, '0')}</span>
                      {c.name}
                    </button>
                  ),
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Instrument */}
        <div className="panel flex min-h-0 flex-col overflow-hidden lg:col-span-6" data-reveal>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hi/8 px-4 py-3 md:px-5">
            <div>
              <p className="t-label text-lo">{u.group}</p>
              <h3 key={u.id} className="swap-in mt-1 text-[1.05rem] font-medium text-hi">
                {u.name}
              </h3>
            </div>
            <p className="t-mono-plain max-w-full rounded-lg border border-signal/30 bg-signal/8 px-2.5 py-1.5 text-[0.72rem] leading-snug text-signal-soft">
              {u.formula}
            </p>
          </div>
          <canvas
            ref={canvasRef}
            className="block aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-auto lg:min-h-[300px] lg:flex-1"
            role="img"
            aria-label={`${u.name}. ${stepLabels[step]}: ${stepText(u, step)}`}
          />
          <div className="flex items-center gap-3 border-t border-hi/8 px-4 py-3 md:px-5">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={playing}
              className="t-label rounded-full border border-hi/15 px-3 py-1.5 text-hi hover:border-signal"
            >
              {playing ? '❚❚ Pause' : '▶ Autoplay'}
            </button>
            <div className="flex flex-1 gap-1" aria-hidden="true">
              {stepLabels.map((_, i) => (
                <span key={i} className="relative h-1 flex-1 overflow-hidden rounded-full bg-hi/10">
                  <span
                    ref={(el) => {
                      segRefs.current[i] = el;
                    }}
                    className="absolute inset-0 origin-left rounded-full bg-signal"
                  />
                </span>
              ))}
            </div>
            <button type="button" onClick={() => goUc(uc - 1)} className="px-1 text-mid hover:text-hi" aria-label="Previous use case">
              ←
            </button>
            <span className="t-mono-plain text-[0.7rem] text-lo">
              {uc + 1}/{useCases.length}
            </span>
            <button type="button" onClick={() => goUc(uc + 1)} className="px-1 text-mid hover:text-hi" aria-label="Next use case">
              →
            </button>
          </div>
        </div>

        {/* Reasoning chain */}
        <ol className="panel flex flex-col p-2 lg:col-span-3" aria-label="Decision steps" aria-live="polite" data-reveal>
          {stepLabels.map((label, i) => {
            const on = i === step;
            const done = i < step;
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => goStep(i)}
                  aria-current={on ? 'step' : undefined}
                  className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${on ? 'bg-signal/10' : 'hover:bg-hi/4'}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`t-mono-plain flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.62rem] ${
                        on ? 'bg-signal text-ink-950' : done ? 'bg-hi/15 text-hi' : 'border border-hi/20 text-lo'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`t-label ${on ? 'text-signal' : done ? 'text-mid' : 'text-lo'}`}>{label}</span>
                  </span>
                  {(on || done) && (
                    <span
                      key={`${u.id}-${i}`}
                      className={`t-small mt-1.5 block pl-7.5 ${on ? 'swap-in text-hi' : 'line-clamp-2 text-mid/80'}`}
                    >
                      {stepText(u, i)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="t-label mt-4 text-lo">{intelligenceCopy.disclaimer}</p>
    </ChapterTransition>
  );
}
