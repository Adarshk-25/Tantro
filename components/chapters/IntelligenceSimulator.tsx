'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { intelligenceCopy, scenarios, type ScenarioId } from '@/content/intelligence';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ChapterTransition } from './ChapterTransition';
import { drawAnomaly } from './intelligence/anomaly';
import { createLineSim, drawBottleneck, stepLineSim, type LineSim } from './intelligence/bottleneck';
import type { StageIndex } from './intelligence/palette';
import { drawVision } from './intelligence/vision';

const STAGE_SECONDS = 3.4;

function prewarmedSim(): LineSim {
  const s = createLineSim();
  for (let i = 0; i < 1200; i++) stepLineSim(s, 0.05);
  return s;
}

export function IntelligenceSimulator() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('anomaly');
  const [stage, setStage] = useState<StageIndex>(0);
  const [running, setRunning] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const simRef = useRef<LineSim>(prewarmedSim());
  const stageClock = useRef(0);
  const timeRef = useRef(1.3);
  const inView = useInView(wrapRef);
  const reduced = useReducedMotion();
  const scenario = scenarios.find((s) => s.id === scenarioId)!;

  // Start the walkthrough once, the first time the instrument is visible.
  useEffect(() => {
    if (inView && !autoStarted) {
      setAutoStarted(true);
      if (!reduced) setRunning(true);
    }
  }, [inView, autoStarted, reduced]);

  const selectScenario = useCallback((id: ScenarioId) => {
    setScenarioId(id);
    setStage(0);
    stageClock.current = 0;
    setRunning(true);
  }, []);

  const selectStage = (i: StageIndex) => {
    setStage(i);
    stageClock.current = 0;
    setRunning(false);
  };

  // Render + stage clock.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !inView) return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        if (!reduced) {
          timeRef.current += dt;
          if (scenarioId === 'bottleneck') stepLineSim(simRef.current, dt * 2.5);
        }
        const t = timeRef.current;
        if (scenarioId === 'anomaly') drawAnomaly(ctx, w, h, t, stage);
        else if (scenarioId === 'vision') drawVision(ctx, w, h, t, stage);
        else drawBottleneck(ctx, w, h, simRef.current, stage);

        if (running) {
          stageClock.current += dt;
          const k = Math.min(1, stageClock.current / STAGE_SECONDS);
          if (meterRef.current) meterRef.current.style.transform = `scaleX(${k})`;
          if (k >= 1) {
            stageClock.current = 0;
            if (stage < 3) setStage((s) => Math.min(3, s + 1) as StageIndex);
            else setRunning(false);
          }
        } else if (meterRef.current) {
          meterRef.current.style.transform = 'scaleX(0)';
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, scenarioId, stage, running, reduced]);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = scenarios.length;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    if (next >= 0) {
      e.preventDefault();
      selectScenario(scenarios[next].id);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <ChapterTransition
      id="intelligence"
      index={intelligenceCopy.index}
      eyebrow={intelligenceCopy.eyebrow}
      labelledBy="intelligence-title"
      className="bg-ink-900 pb-28"
    >
      <div className="px-[var(--gutter)] pt-20 md:pt-28">
        <h2 id="intelligence-title" className="t-display text-[clamp(2.6rem,1.3rem+5.4vw,7.2rem)]">
          <span className="block" data-reveal>
            From data
          </span>
          <span className="block text-mid md:pl-[18vw]" data-reveal>
            to decisions.
          </span>
        </h2>
        <p data-reveal className="t-lede mt-8 max-w-[34rem] text-mid md:ml-[18vw]">
          {intelligenceCopy.body}
        </p>
      </div>

      <div ref={wrapRef} className="mx-[var(--gutter)] mt-14 border border-hi/12 bg-ink-950" data-reveal>
        {/* Instrument header: scenario tabs */}
        <div role="tablist" aria-label="Scenarios" className="grid grid-cols-3 border-b border-hi/12">
          {scenarios.map((s, i) => {
            const on = s.id === scenarioId;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${s.id}`}
                aria-selected={on}
                aria-controls="sim-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => selectScenario(s.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`group relative flex flex-col items-start gap-1 px-3 py-4 text-left transition-colors md:flex-row md:items-baseline md:gap-4 md:px-6 md:py-5 ${
                  i > 0 ? 'border-l border-hi/12' : ''
                } ${on ? 'bg-ink-850 text-hi' : 'text-mid hover:bg-ink-900 hover:text-hi'}`}
              >
                <span className={`t-display-condensed text-[1.8rem] leading-none ${on ? 'text-signal' : ''}`}>{s.letter}</span>
                <span className="text-[0.8rem] leading-snug md:text-[0.95rem]">{s.name}</span>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-signal transition-transform duration-500 ${
                    on ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div id="sim-panel" role="tabpanel" aria-labelledby={`tab-${scenarioId}`} className="grid lg:grid-cols-12">
          <div className="relative lg:col-span-8">
            <div className="t-mono flex items-center justify-between px-4 pt-4 text-[0.62rem] text-lo md:px-6">
              <span>{scenario.asset}</span>
              <span className="text-signal/80">Illustrative · synthetic data</span>
            </div>
            <canvas
              ref={canvasRef}
              className="block aspect-[4/3] w-full md:aspect-[16/9]"
              role="img"
              aria-label={`${scenario.name}, stage ${stage + 1} of 4: ${scenario.stages[stage].label}. ${scenario.stages[stage].text}`}
            />
          </div>

          <div className="flex flex-col border-t border-hi/12 lg:col-span-4 lg:border-t-0 lg:border-l">
            <ol className="flex-1">
              {scenario.stages.map((st, i) => {
                const on = i === stage;
                const done = i < stage;
                return (
                  <li key={st.key} className="border-b border-hi/10">
                    <button
                      type="button"
                      onClick={() => selectStage(i as StageIndex)}
                      aria-current={on ? 'step' : undefined}
                      className="group w-full px-5 py-4 text-left md:px-6"
                    >
                      <span className="flex items-center gap-3">
                        <span className={`t-mono ${on ? 'text-signal' : done ? 'text-hi/70' : 'text-lo'}`}>0{i + 1}</span>
                        <span
                          className={`font-medium transition-colors ${on ? 'text-hi' : 'text-mid group-hover:text-hi'} ${
                            st.key === 'action' && on ? 'text-signal-soft' : ''
                          }`}
                        >
                          {st.label}
                        </span>
                        {done && (
                          <span className="ml-auto text-[0.7rem] text-ok" aria-label="completed">
                            ✓
                          </span>
                        )}
                      </span>
                      <span
                        className={`grid transition-[grid-template-rows,opacity] duration-500 ${
                          on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <span className="overflow-hidden">
                          <span className="block pt-2 pl-8 text-[0.95rem] leading-relaxed text-hi/85">{st.text}</span>
                        </span>
                      </span>
                      {on && (
                        <span className="mt-3 ml-8 block h-px bg-hi/10" aria-hidden="true">
                          <span ref={meterRef} className="block h-px origin-left bg-signal" style={{ transform: 'scaleX(0)' }} />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="flex items-center gap-4 px-5 py-4 md:px-6">
              <button
                type="button"
                onClick={() => {
                  if (stage === 3 && !running) {
                    setStage(0);
                    stageClock.current = 0;
                  }
                  setRunning((r) => !r);
                }}
                className="t-mono border border-hi/20 px-4 py-2.5 text-hi transition-colors hover:border-signal hover:text-signal-soft"
              >
                {running ? 'Pause' : stage === 3 ? 'Replay' : 'Run'}
              </button>
              <button
                type="button"
                disabled={stage === 3}
                onClick={() => selectStage(Math.min(3, stage + 1) as StageIndex)}
                className="t-mono px-2 py-2.5 text-mid transition-colors hover:text-hi disabled:opacity-30"
              >
                Next step →
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="t-mono mx-[var(--gutter)] mt-4 text-[0.62rem] text-lo">{intelligenceCopy.disclaimer}</p>
    </ChapterTransition>
  );
}
