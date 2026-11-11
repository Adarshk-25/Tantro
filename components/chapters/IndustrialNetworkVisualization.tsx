'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { assetPaths, layers, netLinks, netNodes, networkCopy } from '@/content/network';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ChapterTransition } from './ChapterTransition';

type Box = { x: number; y: number; w: number; h: number };

/** Two compositions of the same architecture: wide (desktop) and tall (phone). */
function layout(narrow: boolean) {
  const W = narrow ? 360 : 1000;
  const bandH = narrow ? 150 : 118;
  const top = narrow ? 30 : 24;
  const nodeW = narrow ? 150 : 168;
  const nodeH = 46;
  const left = narrow ? 18 : 150;
  const usable = W - left - (narrow ? 18 : 20);
  const boxes: Record<string, Box> = {};
  layers.forEach((L, li) => {
    const members = netNodes.filter((n) => n.layer === L.id);
    const perRow = narrow ? 2 : members.length;
    members.forEach((n, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const inRow = Math.min(perRow, members.length - row * perRow);
      const slot = usable / inRow;
      const x = left + slot * col + (slot - nodeW) / 2;
      const y = top + li * bandH + (narrow ? 26 + row * (nodeH + 10) : (bandH - nodeH) / 2 + 8);
      boxes[n.id] = { x, y, w: nodeW, h: nodeH };
    });
  });
  const H = top + layers.length * bandH + (narrow ? 60 : 10);
  return { W, H, bandH, top, boxes };
}

function linkPath(a: Box, b: Box) {
  if (Math.abs(a.y - b.y) < 1) {
    // same layer: a short horizontal bus between neighbours
    const [l, r] = a.x < b.x ? [a, b] : [b, a];
    const y = a.y + a.h / 2;
    return `M${l.x + l.w} ${y} L${r.x} ${y}`;
  }
  // a is lower in the stack (larger y); connect a's top to b's bottom
  const x1 = a.x + a.w / 2;
  const y1 = a.y;
  const x2 = b.x + b.w / 2;
  const y2 = b.y + b.h;
  const my = (y1 + y2) / 2;
  return `M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}`;
}

const fieldAssets = netNodes.filter((n) => n.layer === 'field');

export function IndustrialNetworkVisualization() {
  const [narrow, setNarrow] = useState(false);
  const [selected, setSelected] = useState('cnc');
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef);
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const packetRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const upd = () => setNarrow(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);

  const L = useMemo(() => layout(narrow), [narrow]);
  const route = assetPaths[selected];
  const hops = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < route.path.length - 1; i++) {
      const a = route.path[i];
      const b = route.path[i + 1];
      const link = netLinks.find((l) => (l.from === a && l.to === b) || (l.from === b && l.to === a));
      if (link) out.push(`${link.from}>${link.to}`);
    }
    return out;
  }, [route]);
  const onPath = new Set(route.path);
  const onHop = new Set(hops);

  // Packets travel the selected route, hop by hop.
  useEffect(() => {
    if (!inView || reduced) {
      packetRefs.current.forEach((c) => c?.setAttribute('opacity', '0'));
      return;
    }
    let raf = 0;
    const start = performance.now();
    const perHop = 0.7;
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      packetRefs.current.forEach((c, k) => {
        if (!c) return;
        const total = hops.length * perHop + 0.6;
        const local = (t - k * 0.35) % total;
        const hopIdx = Math.floor(local / perHop);
        const el = hopIdx < hops.length && local >= 0 ? pathRefs.current[hops[hopIdx]] : null;
        if (!el) {
          c.setAttribute('opacity', '0');
          return;
        }
        const f = (local - hopIdx * perHop) / perHop;
        // links are drawn lower → upper; flip if the route goes downward
        const [from] = hops[hopIdx].split('>');
        const forward = route.path.indexOf(from) < route.path.indexOf(hops[hopIdx].split('>')[1]);
        const len = el.getTotalLength();
        const p = el.getPointAtLength((forward ? f : 1 - f) * len);
        c.setAttribute('cx', String(p.x));
        c.setAttribute('cy', String(p.y));
        c.setAttribute('opacity', String(k === 0 ? 1 : 0.45));
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hops, inView, reduced, route.path]);

  const pct = (b: Box) => ({
    left: `${(b.x / L.W) * 100}%`,
    top: `${(b.y / L.H) * 100}%`,
    width: `${(b.w / L.W) * 100}%`,
    height: `${(b.h / L.H) * 100}%`,
  });

  return (
    <ChapterTransition
      id="connectivity"
      index={networkCopy.index}
      eyebrow={networkCopy.eyebrow}
      labelledBy="connectivity-title"
      className="blueprint pb-28"
    >
      <div className="px-[var(--gutter)] pt-20 md:pt-28">
        <h2
          id="connectivity-title"
          data-reveal
          className="t-display text-center text-[clamp(2.8rem,1.4rem+6vw,8rem)]"
        >
          Make systems <span className="text-signal">speak.</span>
        </h2>
        <p data-reveal className="t-lede mx-auto mt-6 max-w-[40rem] text-center text-mid">
          {networkCopy.body}
        </p>
      </div>

      <div className="mt-14 grid gap-10 px-[var(--gutter)] lg:grid-cols-12 lg:gap-6">
        <div ref={stageRef} className="relative lg:col-span-9" data-reveal>
          <svg viewBox={`0 0 ${L.W} ${L.H}`} className="block h-auto w-full" aria-hidden="true">
            {layers.map((layer, i) => (
              <g key={layer.id}>
                <line
                  x1={0}
                  x2={L.W}
                  y1={L.top + i * L.bandH}
                  y2={L.top + i * L.bandH}
                  stroke="rgb(236 232 224 / 0.1)"
                  strokeDasharray={layer.id === 'edge' ? '2 6' : undefined}
                />
                <text
                  x={narrow ? 18 : 0}
                  y={L.top + i * L.bandH + (narrow ? 16 : 24)}
                  fill="rgb(163 158 149)"
                  className="t-mono"
                  style={{ fontSize: narrow ? 9 : 10 }}
                >
                  {layer.level}
                </text>
                {!narrow && (
                  <text x={0} y={L.top + i * L.bandH + 40} fill="rgb(236 232 224 / 0.75)" style={{ fontSize: 12 }}>
                    {layer.name}
                  </text>
                )}
              </g>
            ))}
            {netLinks.map((l) => {
              const key = `${l.from}>${l.to}`;
              const a = L.boxes[l.from];
              const b = L.boxes[l.to];
              const on = onHop.has(key);
              return (
                <path
                  key={key}
                  ref={(el) => {
                    pathRefs.current[key] = el;
                  }}
                  d={linkPath(a, b)}
                  fill="none"
                  stroke={on ? '#e0954a' : 'rgb(236 232 224 / 0.16)'}
                  strokeWidth={on ? 1.6 : 1}
                  className="transition-[stroke] duration-500"
                />
              );
            })}
            {hops.map((key) => {
              const [from, to] = key.split('>');
              const link = netLinks.find((l) => l.from === from && l.to === to)!;
              const a = L.boxes[from];
              const b = L.boxes[to];
              const x = (a.x + a.w / 2 + b.x + b.w / 2) / 2;
              const y = (a.y + b.y + b.h) / 2;
              const w = link.protocol.length * (narrow ? 5.4 : 6.2) + 12;
              return (
                <g key={`p-${key}`} transform={`translate(${x} ${y})`}>
                  <rect x={-w / 2} y={-9} width={w} height={18} fill="#0b0c0d" stroke="rgb(224 149 74 / 0.5)" />
                  <text
                    textAnchor="middle"
                    y={4}
                    fill="#f0b57a"
                    className="t-mono"
                    style={{ fontSize: narrow ? 8.5 : 10, letterSpacing: '0.04em' }}
                  >
                    {link.protocol}
                  </text>
                </g>
              );
            })}
            {[0, 1, 2].map((k) => (
              <circle
                key={k}
                ref={(el) => {
                  packetRefs.current[k] = el;
                }}
                r={k === 0 ? 4 : 3}
                fill="#f0b57a"
                opacity={0}
              />
            ))}
          </svg>

          {/* Nodes as HTML for crisp text; field assets are buttons */}
          {netNodes.map((n) => {
            const b = L.boxes[n.id];
            const on = onPath.has(n.id);
            const isField = n.layer === 'field';
            const inner = (
              <>
                <span className="flex items-center gap-2">
                  <span
                    className={`block h-1.5 w-1.5 shrink-0 ${on ? 'bg-signal' : 'bg-lo'} transition-colors`}
                    aria-hidden="true"
                  />
                  <span className="truncate text-[0.8rem] font-medium md:text-[0.86rem]">{n.label}</span>
                </span>
                {!narrow && <span className="t-mono-plain block truncate text-[0.62rem] text-mid">{n.sub}</span>}
              </>
            );
            const cls = `absolute flex flex-col justify-center px-2.5 text-left transition-[border-color,background-color,opacity] duration-500 md:px-3 ${
              on ? 'border-signal/70 bg-ink-850 opacity-100' : 'border-hi/12 bg-ink-900 opacity-70'
            } border`;
            return isField ? (
              <button
                key={n.id}
                type="button"
                style={pct(b)}
                aria-pressed={selected === n.id}
                onClick={() => setSelected(n.id)}
                className={`${cls} cursor-pointer hover:border-signal hover:opacity-100 ${
                  selected === n.id ? 'outline outline-1 outline-offset-4 outline-signal/60' : ''
                }`}
              >
                {inner}
              </button>
            ) : (
              <div key={n.id} style={pct(b)} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>

        <aside className="lg:col-span-3 lg:pt-6" aria-live="polite" data-reveal>
          <p className="t-mono text-signal">{networkCopy.prompt}</p>
          <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
            {fieldAssets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelected(a.id)}
                aria-pressed={selected === a.id}
                className={`t-mono border px-3 py-2 ${selected === a.id ? 'border-signal text-signal-soft' : 'border-hi/15 text-mid'}`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <h3 className="t-display-condensed mt-6 text-[2.1rem] text-hi">
            {netNodes.find((n) => n.id === selected)?.label}
          </h3>
          <ol className="t-mono mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.62rem] text-mid">
            {route.path.map((id, i) => (
              <li key={id} className="flex items-center gap-1.5">
                <span className={i === 0 ? 'text-signal-soft' : ''}>{netNodes.find((n) => n.id === id)?.label}</span>
                {i < route.path.length - 1 && <span aria-hidden="true">→</span>}
              </li>
            ))}
          </ol>
          <p className="mt-6 leading-relaxed text-hi/90">{route.explain}</p>
          <p className="t-mono mt-8 border-t border-hi/10 pt-4 text-[0.62rem] leading-relaxed text-lo">
            Control traffic stays in its zone. Data leaves through the edge — never by connecting enterprise systems straight
            to controllers.
          </p>
        </aside>
      </div>
    </ChapterTransition>
  );
}
