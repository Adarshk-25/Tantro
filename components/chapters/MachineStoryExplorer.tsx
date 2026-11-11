'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { assets, physicalCopy, type AssetStory } from '@/content/physical';
import type { Shape } from '@/lib/iso';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { mulberry32 } from '@/lib/random';
import { ChapterTransition } from './ChapterTransition';
import { buildIndustrialScene } from './physical/industrialScene';

const TOUR_MS = 8000;

const toneStyle: Record<string, { fill: string; stroke: string; width?: number }> = {
  top: { fill: '#30353b', stroke: 'rgb(236 232 224 / 0.16)' },
  left: { fill: '#23272c', stroke: 'rgb(236 232 224 / 0.12)' },
  right: { fill: '#1a1d21', stroke: 'rgb(236 232 224 / 0.1)' },
  belt: { fill: '#2b2e33', stroke: 'rgb(236 232 224 / 0.16)' },
  cyl: { fill: 'url(#iso-cyl)', stroke: 'rgb(236 232 224 / 0.14)' },
  cap: { fill: '#3c4147', stroke: 'rgb(236 232 224 / 0.2)' },
  glass: { fill: 'rgb(170 190 205 / 0.07)', stroke: 'rgb(236 232 224 / 0.22)' },
  screen: { fill: 'rgb(232 149 74 / 0.28)', stroke: 'rgb(232 149 74 / 0.6)' },
  frame: { fill: 'none', stroke: 'rgb(236 232 224 / 0.26)' },
  line: { fill: 'none', stroke: 'rgb(236 232 224 / 0.18)' },
  lamp: { fill: '#e8954a', stroke: '#ffb070' },
};

function ShapePath({ s }: { s: Shape }) {
  const closed = s.d.trimEnd().endsWith('Z');
  if (s.tone === 'arm')
    return (
      <>
        <path d={s.d} fill="none" stroke="#15171a" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
        <path d={s.d} fill="none" stroke="url(#iso-arm)" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  if (s.tone === 'pipe')
    return (
      <>
        <path d={s.d} fill="none" stroke="#3d4248" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={s.d} fill="none" stroke="rgb(236 232 224 / 0.16)" strokeWidth={1} />
      </>
    );
  const t = toneStyle[s.tone] ?? toneStyle.line;
  if (!closed) return <path d={s.d} fill="none" stroke={s.tone === 'lamp' ? '#e8954a' : t.stroke} strokeWidth={s.tone === 'lamp' ? 1.6 : 1} />;
  return <path d={s.d} fill={t.fill} stroke={t.stroke} strokeWidth={0.8} strokeLinejoin="round" />;
}

/** Illustrative trend: an eased rise with deterministic noise. */
function useTrend(a: AssetStory) {
  return useMemo(() => {
    const r = mulberry32(a.id.length * 97 + a.name.length);
    const n = 48;
    const pts = Array.from({ length: n }, (_, i) => {
      const k = i / (n - 1);
      const e = k < 0.45 ? k * 0.25 : 0.1125 + Math.pow((k - 0.45) / 0.55, 1.6) * 0.8875;
      return a.trend.from + (a.trend.to - a.trend.from) * e + (r() - 0.5) * 2 * a.trend.noise;
    });
    const lo = Math.min(...pts, a.trend.from) * 0.92;
    const hi = Math.max(...pts, a.trend.limit) * 1.04;
    return { pts, lo, hi };
  }, [a]);
}

function Sparkline({ a }: { a: AssetStory }) {
  const { pts, lo, hi } = useTrend(a);
  const W = 300;
  const H = 74;
  const x = (i: number) => (i / (pts.length - 1)) * W;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const d = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const fmt = (v: number) => (Math.abs(v) < 10 ? v.toFixed(2) : v.toFixed(0));
  return (
    <figure className="mt-3">
      <svg viewBox={`0 -8 ${W + 44} ${H + 16}`} className="h-auto w-full" role="img" aria-label={`${a.trend.label} trend, illustrative: rising from ${fmt(a.trend.from)} to ${fmt(last)} ${a.trend.unit}, limit ${a.trend.limit}.`}>
        <defs>
          <linearGradient id={`spark-${a.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#e8954a" stopOpacity="0.28" />
            <stop offset="1" stopColor="#e8954a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={0} x2={W} y1={y(a.trend.limit)} y2={y(a.trend.limit)} stroke="#e46d55" strokeDasharray="3 4" strokeWidth={1} />
        <text x={W + 4} y={y(a.trend.limit) + 3} fill="#e46d55" fontSize={9} className="t-mono-plain">
          limit
        </text>
        <path d={`${d} L${W} ${H} L0 ${H} Z`} fill={`url(#spark-${a.id})`} />
        <path key={a.id} d={d} fill="none" stroke="#e8954a" strokeWidth={1.6} pathLength={1} className="spark-draw" />
        <circle cx={x(pts.length - 1)} cy={y(last)} r={3.5} fill="#e8954a" />
        <text x={W + 4} y={y(last) + 4} fill="#ece8e0" fontSize={11} className="t-mono-plain">
          {fmt(last)}
        </text>
      </svg>
      <figcaption className="t-label mt-1 flex justify-between text-lo">
        <span>
          {a.trend.label} {a.trend.unit && `(${a.trend.unit})`}
        </span>
        <span>last 3 weeks · illustrative</span>
      </figcaption>
    </figure>
  );
}

export function MachineStoryExplorer() {
  const scene = useMemo(() => buildIndustrialScene(), []);
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [touring, setTouring] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(stageRef, { rootMargin: '-20% 0px -20% 0px' });
  const reduced = useReducedMotion();
  const asset = assets[idx];
  const focus = hover ?? asset.id;

  // Guided tour: advances while visible until the visitor takes control.
  useEffect(() => {
    if (!touring || !inView || reduced) {
      if (progressRef.current) progressRef.current.style.animation = 'none';
      return;
    }
    const el = progressRef.current;
    if (el) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = `fill-x ${TOUR_MS}ms linear forwards`;
    }
    const t = setTimeout(() => setIdx((i) => (i + 1) % assets.length), TOUR_MS);
    return () => clearTimeout(t);
  }, [idx, touring, inView, reduced]);

  const select = (i: number) => {
    setIdx(((i % assets.length) + assets.length) % assets.length);
    setTouring(false);
  };

  const { bounds } = scene;
  const pct = (p: [number, number, number]) => {
    const [x, y] = scene.project(p);
    return { left: `${((x - bounds.x) / bounds.w) * 100}%`, top: `${((y - bounds.y) / bounds.h) * 100}%` };
  };
  const floorPt = scene.project(scene.assets.find((a) => a.id === asset.id)!.floor);

  return (
    <ChapterTransition
      id="physical"
      index={physicalCopy.index}
      eyebrow={physicalCopy.eyebrow}
      surface="graphite"
      labelledBy="physical-title"
      title={physicalCopy.title}
      lede={physicalCopy.lede}
    >
      <div className="grid flex-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Plant cell */}
        <div className="flex min-w-0 flex-col lg:order-2 lg:col-span-8" data-reveal>
          <div ref={stageRef} className="relative">
            <p className="t-label absolute top-0 left-0 z-10 flex items-center gap-2 text-mid">
              <span className="relative flex h-2 w-2">
                <span className="ping absolute inset-0 rounded-full bg-signal" />
                <span className="relative h-2 w-2 rounded-full bg-signal" />
              </span>
              Click an asset or a numbered marker
            </p>
            <svg
              viewBox={`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`}
              className="block h-auto max-h-[58svh] w-full"
              role="img"
              aria-label="Isometric production cell with a CNC machining centre, robot cell, conveyor and packaging line, vision station, cooling pump, compressed-air skid and control panel."
            >
              <defs>
                <linearGradient id="iso-cyl" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#1b1e22" />
                  <stop offset="0.38" stopColor="#3a3f45" />
                  <stop offset="0.55" stopColor="#4a5057" />
                  <stop offset="1" stopColor="#191c1f" />
                </linearGradient>
                <linearGradient id="iso-arm" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#d9d2c6" />
                  <stop offset="1" stopColor="#8c877f" />
                </linearGradient>
                <radialGradient id="iso-glow">
                  <stop offset="0" stopColor="#ff9a45" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#ff9a45" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="iso-floor" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#1a1d20" />
                  <stop offset="1" stopColor="#121417" />
                </linearGradient>
              </defs>
              <path d={scene.floor} fill="url(#iso-floor)" stroke="rgb(236 232 224 / 0.08)" />
              <g stroke="rgb(236 232 224 / 0.045)" strokeWidth={1}>
                {scene.grid.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              <ellipse
                cx={floorPt[0]}
                cy={floorPt[1]}
                rx={150}
                ry={80}
                fill="url(#iso-glow)"
                className="transition-all duration-700"
                style={{ transformOrigin: 'center' }}
              />
              {scene.context.map((s, i) => (
                <ShapePath key={`ctx${i}`} s={s} />
              ))}
              {scene.assets.map((a) => {
                const on = focus === a.id;
                const i = assets.findIndex((x) => x.id === a.id);
                return (
                  <g
                    key={a.id}
                    onClick={() => select(i)}
                    onPointerEnter={() => setHover(a.id)}
                    onPointerLeave={() => setHover(null)}
                    className="cursor-pointer transition-opacity duration-500"
                    opacity={on ? 1 : 0.62}
                  >
                    {a.shapes.map((s, j) => (
                      <ShapePath key={j} s={s} />
                    ))}
                    {on &&
                      a.shapes
                        .filter((s) => s.d.trimEnd().endsWith('Z'))
                        .map((s, j) => (
                          <path
                            key={`h${j}`}
                            d={s.d}
                            fill="rgb(232 149 74 / 0.1)"
                            stroke="#e8954a"
                            strokeWidth={1.1}
                            strokeLinejoin="round"
                            pointerEvents="none"
                          />
                        ))}
                  </g>
                );
              })}
            </svg>

            {/* Numbered hotspots: real buttons on the drawing's anchors */}
            <ol aria-label="Assets in the production cell">
              {assets.map((a, i) => {
                const on = i === idx;
                const sa = scene.assets.find((s) => s.id === a.id)!;
                return (
                  <li key={a.id} className="absolute" style={pct(sa.anchor)}>
                    <button
                      type="button"
                      aria-pressed={on}
                      aria-label={`${i + 1}. ${a.name}`}
                      onClick={() => select(i)}
                      onPointerEnter={() => setHover(a.id)}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover(a.id)}
                      onBlur={() => setHover(null)}
                      className="group absolute -translate-x-1/2 -translate-y-1/2 p-2"
                    >
                      <span className="relative flex h-6 w-6 items-center justify-center">
                        {!on && <span className="ping absolute inset-0 rounded-full border border-signal/70" aria-hidden="true" />}
                        <span
                          className={`t-mono-plain relative flex h-6 w-6 items-center justify-center rounded-full text-[0.68rem] font-medium transition-all duration-300 ${
                            on
                              ? 'scale-110 bg-signal text-ink-950 shadow-[0_0_24px_rgb(232_149_74/0.7)]'
                              : 'border border-hi/40 bg-ink-950/85 text-hi group-hover:border-signal group-hover:text-signal-soft'
                          }`}
                        >
                          {i + 1}
                        </span>
                      </span>
                      <span
                        className={`t-label pointer-events-none absolute top-1/2 left-full ml-1 -translate-y-1/2 rounded-md bg-ink-950/90 px-2 py-1 whitespace-nowrap text-hi transition-opacity duration-300 ${
                          on || hover === a.id ? 'opacity-100' : 'opacity-0'
                        } hidden md:block`}
                      >
                        {a.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Selector + tour controls */}
          <div className="mt-4 flex flex-col gap-3 border-t border-hi/10 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choose an asset">
              {assets.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={i === idx}
                  onClick={() => select(i)}
                  className={`rounded-full border px-3 py-1.5 text-[0.8rem] transition-colors ${
                    i === idx ? 'border-signal bg-signal/15 text-hi' : 'border-hi/12 text-mid hover:border-hi/35 hover:text-hi'
                  }`}
                >
                  <span className="t-mono-plain mr-1.5 text-[0.7rem] text-signal">{i + 1}</span>
                  {a.area}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => select(idx - 1)} className="rounded-full p-2 text-mid hover:text-hi" aria-label="Previous asset">
                ←
              </button>
              <button
                type="button"
                onClick={() => setTouring((t) => !t)}
                aria-pressed={touring}
                className="t-label relative overflow-hidden rounded-full border border-hi/15 px-3 py-2 text-hi hover:border-signal"
              >
                <span ref={progressRef} aria-hidden="true" className="absolute inset-0 origin-left bg-signal/15" style={{ transform: 'scaleX(0)' }} />
                <span className="relative">{touring ? '❚❚ Guided tour' : '▶ Guided tour'}</span>
              </button>
              <button type="button" onClick={() => select(idx + 1)} className="rounded-full p-2 text-mid hover:text-hi" aria-label="Next asset">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Story panel */}
        <article className="panel flex flex-col p-5 md:p-6 lg:order-1 lg:col-span-4" aria-live="polite" data-reveal>
          <div key={asset.id} className="swap-in flex flex-1 flex-col">
            <p className="t-label flex items-center justify-between text-mid">
              <span>
                <span className="text-signal">
                  {String(idx + 1).padStart(2, '0')} / {String(assets.length).padStart(2, '0')}
                </span>{' '}
                · {asset.area}
              </span>
            </p>
            <h3 className="t-h3 mt-2 text-hi">{asset.name}</h3>

            <ol className="mt-4 flex flex-1 flex-col gap-4">
              <Step n={1} label={physicalCopy.steps[0]}>
                <p className="text-hi/90">{asset.problem}</p>
              </Step>
              <Step n={2} label={physicalCopy.steps[1]}>
                <dl className="grid gap-1">
                  {asset.observed.map((o) => (
                    <div key={o.label} className="flex justify-between gap-3 border-b border-hi/6 pb-1">
                      <dt className="text-mid">{o.label}</dt>
                      <dd className="t-mono-plain text-right text-[0.82rem] text-hi">{o.value}</dd>
                    </div>
                  ))}
                </dl>
                <Sparkline a={asset} />
              </Step>
              <Step n={3} label={physicalCopy.steps[2]}>
                <p className="text-hi/85">{asset.risk}</p>
              </Step>
              <Step n={4} label={physicalCopy.steps[3]} accent>
                <p className="text-hi">{asset.action}</p>
              </Step>
            </ol>
            <p className="t-label mt-4 text-lo">{physicalCopy.disclaimer}</p>
          </div>
        </article>
      </div>
    </ChapterTransition>
  );
}

function Step({ n, label, accent, children }: { n: number; label: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[1.6rem_1fr] gap-x-3">
      <span
        className={`t-mono-plain flex h-6 w-6 items-center justify-center rounded-full text-[0.68rem] ${
          accent ? 'bg-signal text-ink-950' : 'border border-hi/20 text-mid'
        }`}
        aria-hidden="true"
      >
        {n}
      </span>
      <div className="t-small">
        <p className={`t-label mb-1.5 ${accent ? 'text-signal' : 'text-mid'}`}>{label}</p>
        {children}
      </div>
    </li>
  );
}
