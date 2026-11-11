'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { assets, investigation, physicalCopy, type InvestigationChapter, type Status } from '@/content/physical';
import type { Shape } from '@/lib/iso';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { mulberry32 } from '@/lib/random';
import { ChapterTransition } from './ChapterTransition';
import { buildIndustrialScene } from './physical/industrialScene';

type Trend = { label: string; unit: string; from: number; to: number; limit: number; noise: number; band?: boolean };
const STATUS_COLOR: Record<Status, string> = { ok: '#2ec79e', warn: '#f2b545', alert: '#f2707a' };
const STATUS_TEXT: Record<Status, string> = { ok: 'text-teal', warn: 'text-[#f2b545]', alert: 'text-alert' };

const toneStyle: Record<string, { fill: string; stroke: string }> = {
  top: { fill: '#27324a', stroke: 'rgb(226 234 246 / 0.16)' },
  left: { fill: '#1c2638', stroke: 'rgb(226 234 246 / 0.12)' },
  right: { fill: '#141c2b', stroke: 'rgb(226 234 246 / 0.1)' },
  belt: { fill: '#212b3f', stroke: 'rgb(226 234 246 / 0.16)' },
  cyl: { fill: 'url(#iso-cyl)', stroke: 'rgb(226 234 246 / 0.14)' },
  cap: { fill: '#33415e', stroke: 'rgb(226 234 246 / 0.2)' },
  glass: { fill: 'rgb(150 190 240 / 0.07)', stroke: 'rgb(226 234 246 / 0.22)' },
  screen: { fill: 'rgb(60 196 210 / 0.28)', stroke: 'rgb(60 196 210 / 0.6)' },
  frame: { fill: 'none', stroke: 'rgb(226 234 246 / 0.26)' },
  line: { fill: 'none', stroke: 'rgb(226 234 246 / 0.18)' },
};

function ShapePath({ s, lamp = '#2ec79e' }: { s: Shape; lamp?: string }) {
  const closed = s.d.trimEnd().endsWith('Z');
  if (s.tone === 'arm')
    return (
      <>
        <path d={s.d} fill="none" stroke="#0f1726" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
        <path d={s.d} fill="none" stroke="url(#iso-arm)" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  if (s.tone === 'pipe')
    return (
      <>
        <path d={s.d} fill="none" stroke="#33415e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={s.d} fill="none" stroke="rgb(226 234 246 / 0.16)" strokeWidth={1} />
      </>
    );
  if (s.tone === 'lamp') return closed ? <path d={s.d} fill={lamp} stroke={lamp} strokeWidth={0.8} /> : <path d={s.d} fill="none" stroke="#5b9bf5" strokeWidth={1.6} />;
  const t = toneStyle[s.tone] ?? toneStyle.line;
  if (!closed) return <path d={s.d} fill="none" stroke={t.stroke} strokeWidth={1} />;
  return <path d={s.d} fill={t.fill} stroke={t.stroke} strokeWidth={0.8} strokeLinejoin="round" />;
}

function Sparkline({ id, trend, caption }: { id: string; trend: Trend; caption: string }) {
  const { pts, lo, hi } = useMemo(() => {
    const r = mulberry32(id.length * 97 + trend.to);
    const n = 48;
    const pts = Array.from({ length: n }, (_, i) => {
      const k = i / (n - 1);
      const e = k < 0.45 ? k * 0.25 : 0.1125 + Math.pow((k - 0.45) / 0.55, 1.6) * 0.8875;
      const spread = trend.band ? 1 + k * 1.8 : 1;
      return trend.from + (trend.to - trend.from) * e + (r() - 0.5) * 2 * trend.noise * spread;
    });
    return { pts, lo: Math.min(...pts, trend.from) * 0.92, hi: Math.max(...pts, trend.limit) * 1.04 };
  }, [id, trend]);
  const W = 300;
  const H = 70;
  const x = (i: number) => (i / (pts.length - 1)) * W;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const d = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const fmt = (v: number) => (Math.abs(v) < 10 ? v.toFixed(2) : v.toFixed(0));
  return (
    <figure className="mt-3">
      <svg viewBox={`0 -8 ${W + 44} ${H + 16}`} className="h-auto w-full" role="img" aria-label={`${trend.label} trend, illustrative: from ${fmt(trend.from)} to ${fmt(last)} ${trend.unit}, limit ${trend.limit}.`}>
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3cc4d2" stopOpacity="0.3" />
            <stop offset="1" stopColor="#3cc4d2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={0} x2={W} y1={y(trend.limit)} y2={y(trend.limit)} stroke="#f2707a" strokeDasharray="3 4" strokeWidth={1} />
        <text x={W + 4} y={y(trend.limit) + 3} fill="#f2707a" fontSize={9} className="t-mono-plain">
          limit
        </text>
        <path d={`${d} L${W} ${H} L0 ${H} Z`} fill={`url(#spark-${id})`} />
        <path key={id} d={d} fill="none" stroke="#3cc4d2" strokeWidth={1.6} pathLength={1} className="spark-draw" />
        <circle cx={x(pts.length - 1)} cy={y(last)} r={3.5} fill="#3cc4d2" />
        <text x={W + 4} y={y(last) + 4} fill="#f3f6fc" fontSize={11} className="t-mono-plain">
          {fmt(last)}
        </text>
      </svg>
      <figcaption className="t-label mt-1 flex justify-between text-lo">
        <span>
          {trend.label} {trend.unit && `(${trend.unit})`}
        </span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

/** How long a chapter stays on screen: long enough to read it. */
function chapterMs(c: InvestigationChapter) {
  const words =
    (c.text + (c.evidence?.map((e) => e.source + e.signal).join(' ') ?? '') + (c.hypotheses?.map((h) => h.cause + h.forEvidence).join(' ') ?? '') + (c.actions?.join(' ') ?? ''))
      .split(/\s+/).length;
  return Math.max(9000, Math.min(20000, words * 260 + 3500));
}

export function MachineStoryExplorer() {
  const scene = useMemo(() => buildIndustrialScene(), []);
  const [mode, setMode] = useState<'guided' | 'assets'>('guided');
  const [chapter, setChapter] = useState(0);
  const [assetIdx, setAssetIdx] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [started, setStarted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(stageRef, { rootMargin: '-30% 0px -30% 0px' });
  const reduced = useReducedMotion();
  const ch = investigation.chapters[chapter];
  const asset = assets[assetIdx];

  // Start once when the section is substantially visible; never restart on small scrolls.
  useEffect(() => {
    if (inView && !started) setStarted(true);
  }, [inView, started]);

  const running = mode === 'guided' && playing && started && inView && !reduced;
  useEffect(() => {
    const el = progressRef.current;
    if (!running) {
      if (el) el.style.animationPlayState = 'paused';
      return;
    }
    const ms = chapterMs(ch);
    if (el) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = `fill-x ${ms}ms linear forwards`;
    }
    const t = setTimeout(() => {
      if (chapter < investigation.chapters.length - 1) setChapter((c) => c + 1);
      else setPlaying(false);
    }, ms);
    return () => clearTimeout(t);
  }, [running, chapter, ch]);

  const goChapter = (i: number) => {
    setMode('guided');
    setChapter(Math.max(0, Math.min(investigation.chapters.length - 1, i)));
    setPlaying(false);
  };
  const restart = () => {
    setMode('guided');
    setChapter(0);
    setPlaying(true);
  };
  const chooseAsset = (i: number) => {
    setMode('assets');
    setAssetIdx(((i % assets.length) + assets.length) % assets.length);
    setPlaying(false);
  };

  const focus = mode === 'guided' ? ch.focus : [hover ?? asset.id];
  const callouts = mode === 'guided' ? ch.callouts : [];
  const { bounds } = scene;
  const pct = (p: [number, number, number]) => {
    const [x, y] = scene.project(p);
    return { left: `${((x - bounds.x) / bounds.w) * 100}%`, top: `${((y - bounds.y) / bounds.h) * 100}%` };
  };
  const anchorOf = (id: string) => scene.assets.find((a) => a.id === id)!.anchor;

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
        <div className="flex min-w-0 flex-col lg:order-2 lg:col-span-7" data-reveal>
          {/* KPI strip (guided) */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
            {(mode === 'guided' ? ch.kpis : investigation.chapters[0].kpis).map((k) => (
              <div key={k.label} className="panel !rounded-xl px-3 py-2">
                <p className="t-label flex items-center gap-1.5 text-lo">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[k.status] }} aria-hidden="true" />
                  {k.label}
                </p>
                <p className="t-mono-plain mt-1 text-[1rem] text-hi">
                  {k.value} {k.delta && <span className={`text-[0.7rem] ${STATUS_TEXT[k.status]}`}>{k.delta}</span>}
                </p>
              </div>
            ))}
          </div>

          <div ref={stageRef} className="relative mt-3">
            <svg
              viewBox={`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`}
              className="block h-auto max-h-[46svh] w-full"
              role="img"
              aria-label="Isometric production cell: CNC machining centre, robot cell, conveyor and packaging line, vision station, cooling pump, compressed-air skid and control panel with HMI."
            >
              <defs>
                <linearGradient id="iso-cyl" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#121a28" />
                  <stop offset="0.38" stopColor="#33415e" />
                  <stop offset="0.55" stopColor="#45557a" />
                  <stop offset="1" stopColor="#121a28" />
                </linearGradient>
                <linearGradient id="iso-arm" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#d5deec" />
                  <stop offset="1" stopColor="#7f8ba1" />
                </linearGradient>
                <radialGradient id="iso-glow">
                  <stop offset="0" stopColor="#3d84f0" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#3d84f0" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="iso-floor" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#141c2b" />
                  <stop offset="1" stopColor="#0e1420" />
                </linearGradient>
              </defs>
              <path d={scene.floor} fill="url(#iso-floor)" stroke="rgb(226 234 246 / 0.08)" />
              <g stroke="rgb(226 234 246 / 0.045)" strokeWidth={1}>
                {scene.grid.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              {focus.map((id) => {
                const fp = scene.project(scene.assets.find((a) => a.id === id)!.floor);
                return <ellipse key={id} cx={fp[0]} cy={fp[1]} rx={140} ry={75} fill="url(#iso-glow)" />;
              })}
              {scene.context.map((s, i) => (
                <ShapePath key={`ctx${i}`} s={s} />
              ))}
              {scene.assets.map((a) => {
                const on = focus.includes(a.id);
                const i = assets.findIndex((x) => x.id === a.id);
                return (
                  <g
                    key={a.id}
                    onClick={() => chooseAsset(i)}
                    onPointerEnter={() => setHover(a.id)}
                    onPointerLeave={() => setHover(null)}
                    className="cursor-pointer transition-opacity duration-500"
                    opacity={on ? 1 : 0.55}
                  >
                    {a.shapes.map((s, j) => (
                      <ShapePath key={j} s={s} lamp={a.id === 'cnc' && mode === 'guided' ? STATUS_COLOR[ch.cncStatus] : undefined} />
                    ))}
                    {on &&
                      a.shapes
                        .filter((s) => s.d.trimEnd().endsWith('Z'))
                        .map((s, j) => (
                          <path key={`h${j}`} d={s.d} fill="rgb(76 141 240 / 0.1)" stroke="#5b9bf5" strokeWidth={1.1} strokeLinejoin="round" pointerEvents="none" />
                        ))}
                  </g>
                );
              })}
            </svg>

            {/* Scene annotations for the current chapter */}
            <div aria-hidden="true">
              {callouts.map((c) => (
                <span key={`${ch.id}-${c.asset}`} className="pointer-events-none absolute" style={pct(anchorOf(c.asset))}>
                  <span
                    className="swap-in t-label absolute bottom-3 left-0 -translate-x-1/2 rounded-full border bg-ink-950/90 px-2.5 py-1 whitespace-nowrap text-hi max-sm:text-[0.55rem]"
                    style={{ borderColor: STATUS_COLOR[c.tone] }}
                  >
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: STATUS_COLOR[c.tone] }} />
                    {c.text}
                  </span>
                </span>
              ))}
            </div>

            {/* Asset hotspots (choose an asset) */}
            <ol aria-label="Assets in the production cell">
              {assets.map((a, i) => (
                <li key={a.id} className="absolute" style={pct(scene.assets.find((s) => s.id === a.id)!.anchor)}>
                  <button
                    type="button"
                    aria-label={`Explore ${a.name}`}
                    aria-pressed={mode === 'assets' && i === assetIdx}
                    onClick={() => chooseAsset(i)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 p-2"
                  >
                    <span
                      className={`t-mono-plain flex h-5 w-5 items-center justify-center rounded-full text-[0.62rem] transition-all ${
                        mode === 'assets' && i === assetIdx ? 'bg-signal text-white' : 'border border-hi/35 bg-ink-950/80 text-mid group-hover:border-signal group-hover:text-hi'
                      }`}
                    >
                      {i + 1}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Tour controls */}
          <div className="mt-3 flex flex-col gap-3 border-t border-hi/10 pt-3 md:flex-row md:items-center md:justify-between">
            <ol className="flex flex-wrap gap-1.5" aria-label="Investigation chapters">
              {investigation.chapters.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => goChapter(i)}
                    aria-current={mode === 'guided' && i === chapter ? 'step' : undefined}
                    className={`relative overflow-hidden rounded-full border px-3 py-1.5 text-[0.78rem] transition-colors ${
                      mode === 'guided' && i === chapter
                        ? 'border-signal bg-signal/12 text-hi'
                        : i < chapter && mode === 'guided'
                          ? 'border-hi/15 text-mid'
                          : 'border-hi/10 text-lo hover:text-hi'
                    }`}
                  >
                    {mode === 'guided' && i === chapter && (
                      <span ref={progressRef} aria-hidden="true" className="absolute inset-0 origin-left bg-signal/15" style={{ transform: 'scaleX(0)' }} />
                    )}
                    <span className="relative">
                      <span className="t-mono-plain mr-1 text-[0.68rem] text-signal">{i + 1}</span>
                      {c.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => goChapter(chapter - 1)} className="rounded-full px-2 py-1.5 text-mid hover:text-hi" aria-label="Previous chapter">
                ←
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('guided');
                  setPlaying((p) => !p);
                }}
                className="t-label rounded-full border border-hi/15 px-3 py-2 text-hi hover:border-signal"
              >
                {running ? '❚❚ Pause tour' : '▶ Resume tour'}
              </button>
              <button type="button" onClick={restart} className="t-label rounded-full px-3 py-2 text-mid hover:text-hi">
                ⟲ Restart
              </button>
              <button type="button" onClick={() => goChapter(chapter + 1)} className="rounded-full px-2 py-1.5 text-mid hover:text-hi" aria-label="Next chapter">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Story panel */}
        <article className="panel flex flex-col p-5 md:p-6 lg:order-1 lg:col-span-5" aria-live="polite" data-reveal>
          <div className="mb-4 flex rounded-full border border-hi/10 p-1 text-[0.8rem]" role="group" aria-label="Story mode">
            <button
              type="button"
              aria-pressed={mode === 'guided'}
              onClick={() => setMode('guided')}
              className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${mode === 'guided' ? 'bg-hi/10 text-hi' : 'text-mid hover:text-hi'}`}
            >
              Guided investigation
            </button>
            <button
              type="button"
              aria-pressed={mode === 'assets'}
              onClick={() => chooseAsset(assetIdx)}
              className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${mode === 'assets' ? 'bg-hi/10 text-hi' : 'text-mid hover:text-hi'}`}
            >
              Choose an asset
            </button>
          </div>

          {mode === 'guided' ? (
            <div key={ch.id} className="swap-in flex flex-1 flex-col">
              <p className="t-label text-signal">
                Chapter {chapter + 1} / {investigation.chapters.length} · {ch.question}
              </p>
              <h3 className="t-h3 mt-2 text-hi">{ch.title}</h3>
              <p className="t-small mt-3 text-hi/85">{ch.text}</p>

              {ch.trend && <Sparkline id={ch.id} trend={ch.trend} caption="last 3 shifts · illustrative" />}
              {ch.watching && (
                <ul className="mt-4 grid gap-1.5">
                  {ch.watching.map((w) => (
                    <li key={w} className="t-small flex gap-2.5 text-mid">
                      <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
                      {w}
                    </li>
                  ))}
                </ul>
              )}

              {ch.evidence && (
                <table className="mt-4 w-full text-left text-[0.78rem]">
                  <caption className="t-label mb-2 text-left text-mid">Correlated evidence · one timeline</caption>
                  <thead className="t-label text-lo">
                    <tr>
                      <th className="pb-1 font-normal">Time</th>
                      <th className="pb-1 font-normal">Source</th>
                      <th className="pb-1 font-normal">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ch.evidence.map((e) => (
                      <tr key={e.source} className="border-t border-hi/8 align-top">
                        <td className="t-mono-plain py-1.5 pr-2 text-mid">{e.time}</td>
                        <td className="py-1.5 pr-2 text-hi">
                          {e.source}
                          <span className="t-mono-plain block text-[0.64rem] text-lo">{e.protocol}</span>
                        </td>
                        <td className="py-1.5">
                          <span className="text-mid">{e.signal}</span>
                          <span className={`t-mono-plain block ${STATUS_TEXT[e.tone]}`}>{e.value}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {ch.hypotheses && (
                <ul className="mt-4 grid gap-3" aria-label="Ranked hypotheses">
                  {ch.hypotheses.map((h, i) => (
                    <li key={h.cause}>
                      <div className="flex items-baseline justify-between text-[0.85rem]">
                        <span className={i === 0 ? 'font-medium text-hi' : 'text-mid'}>{h.cause}</span>
                        <span className="t-mono-plain text-[0.75rem] text-signal">p ≈ {h.p.toFixed(2)}</span>
                      </div>
                      <span className="mt-1 block h-1 overflow-hidden rounded-full bg-hi/10">
                        <span className="bg-brand-gradient block h-1 rounded-full" style={{ width: `${h.p * 100}%` }} />
                      </span>
                      <p className="mt-1 text-[0.74rem] text-lo">
                        For: {h.forEvidence}. Against: {h.against}.
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {ch.actions && (
                <>
                  <ol className="mt-4 grid gap-1.5">
                    {ch.actions.map((a, i) => (
                      <li key={a} className="t-small flex gap-2.5 text-hi/90">
                        <span className="t-mono-plain mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal/20 text-[0.6rem] text-teal">{i + 1}</span>
                        {a}
                      </li>
                    ))}
                  </ol>
                  {ch.outcome && (
                    <div className="mt-4 rounded-xl border border-teal/25 bg-teal/5 p-3">
                      <p className="t-label text-teal">Simulated outcome · illustrative</p>
                      <dl className="mt-2 grid grid-cols-3 gap-2 text-[0.78rem]">
                        {ch.outcome.map((o) => (
                          <div key={o.label}>
                            <dt className="text-lo">{o.label}</dt>
                            <dd className="t-mono-plain text-hi">
                              <span className="text-mid line-through decoration-hi/30">{o.before}</span> → {o.after}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </>
              )}
              <p className="t-label mt-auto pt-4 text-lo">{physicalCopy.disclaimer}</p>
            </div>
          ) : (
            <div key={asset.id} className="swap-in flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <p className="t-label text-signal">
                  Asset {assetIdx + 1} / {assets.length} · {asset.area}
                </p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => chooseAsset(assetIdx - 1)} className="px-2 text-mid hover:text-hi" aria-label="Previous asset">
                    ←
                  </button>
                  <button type="button" onClick={() => chooseAsset(assetIdx + 1)} className="px-2 text-mid hover:text-hi" aria-label="Next asset">
                    →
                  </button>
                </div>
              </div>
              <h3 className="t-h3 mt-2 text-hi">{asset.name}</h3>
              <dl className="t-small mt-3 grid gap-3">
                <div>
                  <dt className="t-label text-mid">{physicalCopy.steps[0]}</dt>
                  <dd className="mt-1 text-hi/90">{asset.problem}</dd>
                </div>
                <div>
                  <dt className="t-label text-mid">{physicalCopy.steps[1]}</dt>
                  <dd className="mt-1 grid gap-1">
                    {asset.observed.map((o) => (
                      <span key={o.label} className="flex justify-between gap-3 border-b border-hi/6 pb-1">
                        <span className="text-mid">{o.label}</span>
                        <span className="t-mono-plain text-[0.8rem] text-hi">{o.value}</span>
                      </span>
                    ))}
                    <Sparkline id={asset.id} trend={asset.trend} caption="last 3 weeks · illustrative" />
                  </dd>
                </div>
                <div>
                  <dt className="t-label text-mid">{physicalCopy.steps[2]}</dt>
                  <dd className="mt-1 text-hi/85">{asset.risk}</dd>
                </div>
                <div>
                  <dt className="t-label text-teal">{physicalCopy.steps[3]}</dt>
                  <dd className="mt-1 text-hi">{asset.action}</dd>
                </div>
              </dl>
              <button type="button" onClick={restart} className="btn-line mt-auto self-start !py-2 text-[0.85rem]">
                ⟲ Back to the guided investigation
              </button>
            </div>
          )}
        </article>
      </div>
    </ChapterTransition>
  );
}
