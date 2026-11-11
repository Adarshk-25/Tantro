'use client';

import { useMemo, useState } from 'react';

import { lanes, zones, type Lane, type Scenario } from '@/content/network';
import { Icon } from './icons';

type Box = { x: number; y: number; w: number; h: number };
type Layout = { W: number; H: number; boxes: Record<string, Box>; laneBox: Record<Lane, Box>; vertical: boolean };

const laneIndex = (l: Lane) => lanes.findIndex((x) => x.id === l);

/** Wide (lanes left → right) or tall (lanes top → bottom) composition of one scenario. */
function layout(s: Scenario, vertical: boolean): Layout {
  const boxes: Record<string, Box> = {};
  const laneBox = {} as Record<Lane, Box>;
  if (!vertical) {
    const W = 1000;
    const H = 440;
    const top = 58;
    const colW = W / lanes.length;
    lanes.forEach((L, i) => {
      laneBox[L.id] = { x: i * colW, y: 0, w: colW, h: H };
      const members = s.nodes.filter((n) => n.lane === L.id);
      const nh = 56;
      const gap = Math.min(34, (H - top - 30 - members.length * nh) / Math.max(1, members.length));
      const total = members.length * nh + (members.length - 1) * gap;
      const y0 = top + (H - top - 20 - total) / 2;
      members.forEach((n, k) => {
        boxes[n.id] = { x: i * colW + 12, y: y0 + k * (nh + gap), w: colW - 24, h: nh };
      });
    });
    return { W, H, boxes, laneBox, vertical };
  }
  const W = 360;
  const rowGap = 34;
  let y = 8;
  lanes.forEach((L) => {
    const members = s.nodes.filter((n) => n.lane === L.id);
    const rows = Math.max(1, Math.ceil(members.length / 2));
    const h = 26 + rows * 50 + (rows - 1) * 10;
    laneBox[L.id] = { x: 0, y, w: W, h };
    members.forEach((n, k) => {
      const row = Math.floor(k / 2);
      const inRow = Math.min(2, members.length - row * 2);
      const col = k % 2;
      const bw = 164;
      const x = inRow === 1 ? (W - bw) / 2 : 8 + col * (bw + 16);
      boxes[n.id] = { x, y: y + 26 + row * 60, w: bw, h: 50 };
    });
    y += h + rowGap;
  });
  return { W, H: y - rowGap + 8, boxes, laneBox, vertical };
}

function route(a: Box, b: Box, la: number, lb: number, vertical: boolean) {
  if (la === lb) {
    // same lane: an arc that bulges outward
    if (!vertical) {
      const x = a.x + a.w;
      const [y1, y2] = [a.y + a.h / 2, b.y + b.h / 2];
      return `M${x} ${y1} C${x + 34} ${y1} ${x + 34} ${y2} ${x} ${y2}`;
    }
    const [x1, x2] = [a.x + a.w / 2, b.x + b.w / 2];
    const y = a.y + a.h;
    return `M${x1} ${y} C${x1} ${y + 22} ${x2} ${y + 22} ${x2} ${y}`;
  }
  const forward = lb > la;
  if (!vertical) {
    const x1 = forward ? a.x + a.w : a.x;
    const x2 = forward ? b.x : b.x + b.w;
    const y1 = a.y + a.h / 2;
    const y2 = b.y + b.h / 2;
    const mx = (x1 + x2) / 2;
    return `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
  }
  const y1 = forward ? a.y + a.h : a.y;
  const y2 = forward ? b.y : b.y + b.h;
  const x1 = a.x + a.w / 2;
  const x2 = b.x + b.w / 2;
  const my = (y1 + y2) / 2;
  return `M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}`;
}

export function ArchitectureDiagram({
  scenario,
  vertical,
  animate,
  focusLink,
}: {
  scenario: Scenario;
  vertical: boolean;
  animate: boolean;
  /** Index of a link highlighted from outside (e.g. the data-path list). */
  focusLink: number | null;
}) {
  const L = useMemo(() => layout(scenario, vertical), [scenario, vertical]);
  const [hover, setHover] = useState<string | null>(null);
  const lane = (id: string) => laneIndex(scenario.nodes.find((n) => n.id === id)!.lane);

  const links = scenario.links.map((l, i) => {
    const a = L.boxes[l.from];
    const b = L.boxes[l.to];
    const d = route(a, b, lane(l.from), lane(l.to), vertical);
    const traced = focusLink !== null ? focusLink === i : hover ? hover === l.from || hover === l.to : false;
    const active = traced || (focusLink === null && !hover);
    return { ...l, d, id: `${scenario.id}-l${i}`, active, traced, a, b };
  });

  return (
    <svg
      viewBox={`0 0 ${L.W} ${L.H}`}
      className="block h-auto w-full"
      role="img"
      aria-label={`${scenario.name} architecture: ${scenario.links
        .map((l) => `${scenario.nodes.find((n) => n.id === l.from)?.label} to ${scenario.nodes.find((n) => n.id === l.to)?.label} via ${l.label}`)
        .join('; ')}.`}
    >
      <defs>
        <linearGradient id="arch-node" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#24282d" />
          <stop offset="1" stopColor="#1a1d21" />
        </linearGradient>
        <filter id="arch-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Security zones */}
      {zones.map((z) => {
        const a = L.laneBox[z.from];
        const b = L.laneBox[z.to];
        const box = vertical
          ? { x: 0, y: a.y - 4, w: L.W, h: b.y + b.h - a.y + 8 }
          : { x: a.x + 4, y: 22, w: b.x + b.w - a.x - 8, h: L.H - 50 };
        const dmz = z.id === 'dmz';
        return (
          <g key={z.id}>
            <rect
              {...box}
              rx={12}
              fill={dmz ? 'rgb(232 149 74 / 0.06)' : 'rgb(236 232 224 / 0.035)'}
              stroke={dmz ? 'rgb(232 149 74 / 0.45)' : 'rgb(236 232 224 / 0.16)'}
              strokeDasharray={dmz ? '5 5' : undefined}
            />
            <text
              x={box.x + 12}
              y={box.y + (vertical ? -6 : 18)}
              className="t-mono-plain"
              fontSize={vertical ? 9 : 10}
              letterSpacing="0.08em"
              fill={dmz ? '#e8954a' : '#857f77'}
              style={{ display: vertical ? 'none' : undefined }}
            >
              {z.label.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Lane titles */}
      {lanes.map((ln) => {
        const b = L.laneBox[ln.id];
        return vertical ? (
          <text key={ln.id} x={8} y={b.y + 14} fontSize={9.5} fill="#b5afa5" className="t-mono-plain" letterSpacing="0.08em">
            {ln.label.toUpperCase()}
          </text>
        ) : (
          <g key={ln.id}>
            <text x={b.x + b.w / 2} y={L.H - 6} textAnchor="middle" fontSize={11.5} fill="#b5afa5">
              {ln.label}
            </text>
          </g>
        );
      })}

      {/* Links */}
      {links.map((l) => (
        <g key={l.id} opacity={l.active ? 1 : 0.18} className="transition-opacity duration-300">
          <path id={l.id} d={l.d} fill="none" stroke="rgb(232 149 74 / 0.25)" strokeWidth={3} filter="url(#arch-glow)" />
          <path d={l.d} fill="none" stroke="rgb(232 149 74 / 0.7)" strokeWidth={1.2} />
          {animate &&
            [0, 1].map((k) => (
              <circle key={k} r={k ? 2 : 3} fill="#ffc08a">
                <animateMotion dur={`${2.6 + (l.d.length % 7) * 0.15}s`} begin={`${k * 1.3}s`} repeatCount="indefinite">
                  <mpath href={`#${l.id}`} />
                </animateMotion>
              </circle>
            ))}
        </g>
      ))}

      {/* Nodes */}
      {scenario.nodes.map((n) => {
        const b = L.boxes[n.id];
        const on = hover === n.id;
        return (
          <g
            key={n.id}
            transform={`translate(${b.x} ${b.y})`}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(n.id)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
            onClick={() => setHover((h) => (h === n.id ? null : n.id))}
            className="cursor-pointer"
          >
            <rect width={b.w} height={b.h} rx={10} fill="url(#arch-node)" stroke={on ? '#e8954a' : 'rgb(236 232 224 / 0.16)'}
              strokeWidth={on ? 1.5 : 1} />
            <rect x={10} y={b.h / 2 - 15} width={30} height={30} rx={8} fill="rgb(232 149 74 / 0.12)" />
            <g color="#f0b57a">
              <Icon name={n.icon} size={18} x={16} y={b.h / 2 - 9} />
            </g>
            <text x={50} y={b.h / 2 - (vertical ? 2 : 3)} fontSize={vertical ? 11.5 : 13.5} fill="#ece8e0" fontWeight={500}>
              {n.label}
            </text>
            <text x={50} y={b.h / 2 + (vertical ? 12 : 14)} fontSize={vertical ? 9 : 10.5} fill="#9d978e">
              {n.sub}
            </text>
          </g>
        );
      })}
      {/* Protocol labels (on top of links) */}
      {links.map((l) => {
        const sameLane = lane(l.from) === lane(l.to);
        const mx = sameLane && !vertical ? l.a.x + l.a.w + 30 : (l.a.x + l.a.w / 2 + l.b.x + l.b.w / 2) / 2;
        const my = sameLane && vertical ? l.a.y + l.a.h + 18 : (l.a.y + l.a.h / 2 + l.b.y + l.b.h / 2) / 2;
        const fs = vertical ? 8.5 : 9.5;
        const w = l.label.length * fs * 0.62 + 12;
        return (
          <g key={`t${l.id}`} transform={`translate(${mx} ${my})`} opacity={l.traced ? 1 : 0}
            pointerEvents="none"
            className="transition-opacity duration-300">
            <rect x={-w / 2} y={-8.5} width={w} height={17} rx={8.5} fill="#121417" stroke="rgb(232 149 74 / 0.4)" />
            <text textAnchor="middle" y={3.2} fontSize={fs} fill="#f0b57a" className="t-mono-plain">
              {l.label}
            </text>
          </g>
        );
      })}

    </svg>
  );
}
