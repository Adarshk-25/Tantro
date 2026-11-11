'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { physicalAssets, physicalCopy } from '@/content/physical';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ChapterTransition } from './ChapterTransition';
import { buildIndustrialScene } from './physical/industrialScene';

const kindLabel = { machine: 'Machine', sensor: 'Sensor', controller: 'Controller', process: 'Process utility' };

/** Deterministic-looking jitter for illustrative readings. */
function reading(base: number, jitter: number, t: number, i: number) {
  const v = base + Math.sin(t * 1.3 + i * 2.1) * jitter * 0.6 + Math.sin(t * 3.7 + i) * jitter * 0.4;
  const decimals = base < 10 ? 2 : 1;
  return v.toFixed(decimals);
}

export function PhysicalWorld() {
  const scene = useMemo(() => buildIndustrialScene(), []);
  const [selected, setSelected] = useState<string>('cnc');
  const [hovered, setHovered] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), 700);
    return () => clearInterval(id);
  }, [inView, reduced]);

  const focus = hovered ?? selected;
  const asset = physicalAssets.find((a) => a.id === selected)!;
  const { bounds } = scene;
  const vb = `${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`;
  const pct = (id: string) => {
    const a = scene.assets.find((s) => s.id === id)!;
    const [x, y] = scene.project(a.anchor);
    return { left: `${((x - bounds.x) / bounds.w) * 100}%`, top: `${((y - bounds.y) / bounds.h) * 100}%` };
  };

  return (
    <ChapterTransition
      id="physical"
      index={physicalCopy.index}
      eyebrow={physicalCopy.eyebrow}
      surface="bone"
      labelledBy="physical-title"
      className="overflow-hidden pb-24"
    >
      <div className="grid gap-8 px-[var(--gutter)] pt-20 md:pt-28 lg:grid-cols-12">
        <h2
          id="physical-title"
          data-reveal
          className="t-display text-[clamp(2.6rem,1.5rem+4.8vw,6.4rem)] lg:col-span-7"
        >
          Every machine
          <br />
          has a story.
        </h2>
        <div className="lg:col-span-4 lg:col-start-9 lg:self-end" data-reveal>
          <p className="t-lede text-onlight-mid">{physicalCopy.body}</p>
        </div>
      </div>

      <div className="mt-12 grid gap-10 px-[var(--gutter)] md:mt-16 lg:grid-cols-12 lg:gap-8">
        <div ref={stageRef} className="relative lg:order-2 lg:col-span-9" data-reveal>
          <svg
            viewBox={vb}
            className="block h-auto w-full"
            role="img"
            aria-label="Isometric drawing of a production cell: CNC machine, robot, conveyor, inspection camera, control cabinet, energy meter and compressed air system."
          >
            <g stroke="currentColor" fill="none" strokeLinejoin="round" strokeLinecap="round">
              <g className="text-onlight/[0.07]" strokeWidth={1}>
                {scene.grid.map((d, i) => (
                  <path key={`g${i}`} d={d} />
                ))}
              </g>
              <g className="text-onlight/45" strokeWidth={1}>
                {scene.context.map((d, i) => (
                  <path key={`c${i}`} d={d} fill={i < 3 ? 'rgb(239 235 228)' : 'none'} />
                ))}
              </g>
              <g
                className={`${focus === 'plc' ? 'text-signal-deep' : 'text-onlight/35'} transition-colors duration-500`}
                strokeWidth={1.25}
              >
                {scene.cables.map((d, i) => (
                  <path key={`k${i}`} d={d} className={reduced ? '' : 'flow-dash'} strokeDasharray="4 8" />
                ))}
              </g>
              {scene.assets.map((a) => {
                const on = focus === a.id;
                return (
                  <g
                    key={a.id}
                    className={`transition-[color,opacity] duration-500 ${
                      on ? 'text-signal-deep' : focus ? 'text-onlight/70' : 'text-onlight'
                    }`}
                    strokeWidth={on ? 1.8 : 1.2}
                  >
                    {a.paths.map((d, i) => (
                      <path key={i} d={d} fill={i < 3 ? (on ? 'rgb(224 149 74 / 0.12)' : 'rgb(239 235 228)') : 'none'} />
                    ))}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Hotspots: real buttons, positioned on the drawing's anchors */}
          <ul aria-label="Elements in the production cell">
            {physicalAssets.map((a) => {
              const on = selected === a.id;
              return (
                <li key={a.id} className="absolute" style={pct(a.id)}>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={`${a.name} — ${kindLabel[a.kind]}`}
                    onClick={() => setSelected(a.id)}
                    onPointerEnter={() => setHovered(a.id)}
                    onPointerLeave={() => setHovered(null)}
                    onFocus={() => setHovered(a.id)}
                    onBlur={() => setHovered(null)}
                    className="group absolute -translate-x-1/2 -translate-y-full p-3"
                  >
                    <span className="relative flex flex-col items-center">
                      <span
                        className={`t-mono mb-1.5 hidden whitespace-nowrap px-1.5 py-0.5 text-[0.6rem] transition-opacity md:block ${
                          on || hovered === a.id
                            ? 'bg-onlight text-bone-50 opacity-100'
                            : 'text-onlight-mid opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {a.name}
                      </span>
                      <span
                        className={`block h-3 w-3 rounded-full border-2 transition-all duration-300 ${
                          on ? 'scale-125 border-signal-deep bg-signal' : 'border-onlight bg-bone-50 group-hover:border-signal-deep'
                        }`}
                      />
                      <span className="block h-4 w-px bg-onlight/40" aria-hidden="true" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

        </div>

        {/* Readout */}
        <div className="border-t border-onlight/15 pt-6 lg:order-1 lg:col-span-3 lg:self-center" aria-live="polite" data-reveal>
            <p className="t-mono text-signal-deep">
              {kindLabel[asset.kind]} · {physicalCopy.hint}
            </p>
            <h3 className="t-display-condensed mt-2 text-[2rem]">{asset.name}</h3>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 border-y border-onlight/15 py-3" aria-live="off">
              {asset.signals.map((s, i) => (
                <div key={s.tag}>
                  <dt className="t-mono text-[0.62rem] text-onlight-mid">{s.tag}</dt>
                  <dd className="t-mono-plain mt-1 text-[1.35rem] tabular-nums">
                    {s.tag === 'state' ? (
                      <span>RUN</span>
                    ) : (
                      <>
                        {reading(s.base, s.jitter, tick * 0.7, i)}
                        <span className="ml-1 text-[0.75rem] text-onlight-mid">{s.unit}</span>
                      </>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.98rem] leading-relaxed">{asset.story}</p>
            <p className="t-mono mt-4 text-[0.62rem] text-onlight-mid">↳ {asset.interface}</p>
            <p className="t-mono mt-8 text-[0.62rem] text-onlight-mid/80">{physicalCopy.disclaimer}</p>
        </div>
      </div>
    </ChapterTransition>
  );
}
