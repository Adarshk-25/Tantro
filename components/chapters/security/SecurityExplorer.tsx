'use client';

import { useRef, useState } from 'react';
import { secScenarios, type SecScenario } from '@/content/security';
import type { IconName } from '@/content/network';
import { Icon } from '@/components/viz/icons';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

type N = { id: string; x: number; y: number; label: string; icon: IconName };
const nodes: N[] = [
  { id: 'sensors', x: 70, y: 110, label: 'Field devices', icon: 'sensor' },
  { id: 'drives', x: 70, y: 210, label: 'Drives & motors', icon: 'drive' },
  { id: 'robot', x: 70, y: 310, label: 'Robot cell', icon: 'robot' },
  { id: 'plc', x: 210, y: 150, label: 'PLC', icon: 'plc' },
  { id: 'dcs', x: 210, y: 280, label: 'DCS controller', icon: 'plc' },
  { id: 'scada', x: 360, y: 110, label: 'SCADA server', icon: 'scada' },
  { id: 'hmi', x: 360, y: 210, label: 'Operator HMI', icon: 'hmi' },
  { id: 'ews', x: 360, y: 310, label: 'Engineering WS', icon: 'app' },
  { id: 'hist', x: 505, y: 120, label: 'Site historian', icon: 'db' },
  { id: 'switch', x: 505, y: 235, label: 'OT core switch', icon: 'gateway' },
  { id: 'backup', x: 505, y: 345, label: 'Backup store', icon: 'db' },
  { id: 'histr', x: 655, y: 95, label: 'Historian replica', icon: 'db' },
  { id: 'jump', x: 655, y: 185, label: 'Jump host', icon: 'chip' },
  { id: 'rag', x: 655, y: 275, label: 'Remote-access GW', icon: 'shield' },
  { id: 'patch', x: 655, y: 365, label: 'Patch / AV relay', icon: 'model' },
  { id: 'erp', x: 805, y: 120, label: 'ERP / MES', icon: 'erp' },
  { id: 'it', x: 805, y: 230, label: 'Enterprise users', icon: 'user' },
  { id: 'siem', x: 805, y: 340, label: 'SOC / SIEM', icon: 'shield' },
  { id: 'vendor', x: 915, y: 290, label: 'Vendor (internet)', icon: 'cloud' },
  { id: 'ids', x: 430, y: 410, label: 'OT monitoring sensor', icon: 'sensor' },
  { id: 'rogue', x: 290, y: 395, label: 'Unknown host', icon: 'app' },
];
const zones = [
  { x: 10, w: 125, label: 'L0 Field' },
  { x: 140, w: 140, label: 'L1 Control' },
  { x: 285, w: 150, label: 'L2 Supervisory' },
  { x: 440, w: 135, label: 'L3 Site ops' },
  { x: 585, w: 140, label: 'Industrial DMZ' },
  { x: 735, w: 140, label: 'L4 Enterprise' },
];
type Kind = 'ok' | 'exposure' | 'blocked' | 'monitor' | 'alert' | 'backup' | 'remote';
type Flow = { a: string; b: string; kind: Kind; label?: string };

const FLOWS: Record<SecScenario, Flow[]> = {
  flat: [
    { a: 'sensors', b: 'plc', kind: 'ok' },
    { a: 'plc', b: 'scada', kind: 'ok' },
    { a: 'it', b: 'plc', kind: 'exposure', label: 'direct reach' },
    { a: 'erp', b: 'dcs', kind: 'exposure' },
    { a: 'vendor', b: 'ews', kind: 'exposure', label: 'always-on remote' },
    { a: 'it', b: 'scada', kind: 'exposure' },
  ],
  segmented: [
    { a: 'sensors', b: 'plc', kind: 'ok' },
    { a: 'plc', b: 'scada', kind: 'ok', label: 'OPC UA' },
    { a: 'scada', b: 'hist', kind: 'ok' },
    { a: 'hist', b: 'histr', kind: 'ok', label: 'outbound replication' },
    { a: 'histr', b: 'erp', kind: 'ok' },
    { a: 'it', b: 'plc', kind: 'blocked', label: 'denied' },
    { a: 'vendor', b: 'ews', kind: 'blocked' },
  ],
  remote: [
    { a: 'vendor', b: 'rag', kind: 'remote', label: 'MFA + approval' },
    { a: 'rag', b: 'jump', kind: 'remote', label: 'session recorded' },
    { a: 'jump', b: 'ews', kind: 'remote', label: 'time-limited' },
    { a: 'ews', b: 'plc', kind: 'remote', label: 'named asset only' },
    { a: 'rag', b: 'siem', kind: 'monitor', label: 'audit log' },
  ],
  monitoring: [
    { a: 'plc', b: 'scada', kind: 'ok' },
    { a: 'switch', b: 'ids', kind: 'monitor', label: 'mirror port (passive)' },
    { a: 'rogue', b: 'plc', kind: 'alert', label: 'unexpected write request' },
    { a: 'ids', b: 'siem', kind: 'monitor', label: 'alert for investigation' },
  ],
  recovery: [
    { a: 'plc', b: 'backup', kind: 'backup', label: 'program backup' },
    { a: 'dcs', b: 'backup', kind: 'backup' },
    { a: 'scada', b: 'backup', kind: 'backup', label: 'server image' },
    { a: 'backup', b: 'ews', kind: 'ok', label: 'restore test + hash compare' },
  ],
};
const FIREWALLS: Record<SecScenario, number[]> = {
  flat: [],
  segmented: [282, 580, 730],
  remote: [282, 580, 730],
  monitoring: [282, 580, 730],
  recovery: [282, 580, 730],
};
const KIND_STYLE: Record<Kind, { color: string; dash?: string }> = {
  ok: { color: '#3cc4d2' },
  remote: { color: '#5b9bf5' },
  exposure: { color: '#f2707a', dash: '5 5' },
  blocked: { color: '#f2707a', dash: '2 4' },
  monitor: { color: '#2ec79e', dash: '3 4' },
  alert: { color: '#f2b545', dash: '4 4' },
  backup: { color: '#2ec79e' },
};
const byId = (id: string) => nodes.find((n) => n.id === id)!;

export function SecurityExplorer() {
  const [sc, setSc] = useState<SecScenario>('flat');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const s = secScenarios.find((x) => x.id === sc)!;
  const flows = FLOWS[sc];
  const fws = FIREWALLS[sc];
  const involved = new Set(flows.flatMap((f) => [f.a, f.b]));
  const showRogue = sc === 'monitoring';
  const showIds = sc === 'monitoring';

  const path = (f: Flow) => {
    const a = byId(f.a);
    const b = byId(f.b);
    if (f.kind === 'blocked') {
      // stops at the first firewall between a and b
      const wall = fws.filter((x) => (x - a.x) * (x - b.x) < 0).sort((p, q) => Math.abs(p - a.x) - Math.abs(q - a.x))[0] ?? b.x;
      const t = (wall - a.x) / (b.x - a.x);
      return { d: `M${a.x} ${a.y} L${wall} ${a.y + (b.y - a.y) * t}`, stop: { x: wall, y: a.y + (b.y - a.y) * t } };
    }
    const mx = (a.x + b.x) / 2;
    return { d: `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`, stop: null };
  };

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div role="tablist" aria-label="Security scenarios" className="no-scrollbar -mx-[var(--gutter)] flex gap-1.5 overflow-x-auto px-[var(--gutter)] md:mx-0 md:px-0">
        {secScenarios.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={sc === x.id}
            onClick={() => setSc(x.id)}
            className={`flex shrink-0 items-baseline gap-2 rounded-xl border px-3.5 py-2 text-[0.86rem] transition-colors ${
              sc === x.id ? 'border-teal/60 bg-teal/10 text-hi' : 'border-hi/8 text-mid hover:border-hi/25 hover:text-hi'
            }`}
          >
            <span className="t-mono-plain text-[0.7rem] text-teal">{x.letter}</span>
            {x.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <figure className="panel p-3 md:p-4 lg:col-span-8">
          <div className="overflow-x-auto">
            <svg
              viewBox="0 0 960 440"
              className="block h-auto w-full min-w-[640px]"
              role="img"
              aria-label={`${s.name}: ${flows.map((f) => `${byId(f.a).label} to ${byId(f.b).label} (${f.kind})`).join('; ')}.`}
            >
              {zones.map((z, i) => (
                <g key={z.label}>
                  <rect
                    x={z.x}
                    y={30}
                    width={z.w}
                    height={360}
                    rx={10}
                    fill={z.label.includes('DMZ') ? 'rgb(46 199 158 / 0.06)' : i % 2 ? 'rgb(226 234 246 / 0.03)' : 'rgb(91 155 245 / 0.04)'}
                    stroke={sc === 'flat' ? 'rgb(226 234 246 / 0.06)' : z.label.includes('DMZ') ? 'rgb(46 199 158 / 0.45)' : 'rgb(226 234 246 / 0.14)'}
                    strokeDasharray={sc === 'flat' ? '2 6' : undefined}
                  />
                  <text x={z.x + 10} y={48} fontSize={10} fill={z.label.includes('DMZ') ? '#2ec79e' : '#7d8ba3'} className="t-mono-plain" letterSpacing="0.06em">
                    {z.label.toUpperCase()}
                  </text>
                </g>
              ))}
              {sc === 'flat' && (
                <text x={480} y={22} textAnchor="middle" fontSize={11} fill="#f2707a" className="t-mono-plain">
                  ONE FLAT NETWORK · NO ENFORCED BOUNDARIES
                </text>
              )}
              {/* Industrial firewalls */}
              {fws.map((x) => (
                <g key={x}>
                  <rect x={x - 5} y={34} width={10} height={352} rx={3} fill="rgb(46 199 158 / 0.18)" stroke="#2ec79e" />
                  {Array.from({ length: 22 }, (_, i) => (
                    <line key={i} x1={x - 5} x2={x + 5} y1={44 + i * 16} y2={44 + i * 16} stroke="rgb(46 199 158 / 0.5)" />
                  ))}
                </g>
              ))}
              {fws.length > 0 && (
                <text x={fws[1] ?? fws[0]} y={404} textAnchor="middle" fontSize={9.5} fill="#2ec79e" className="t-mono-plain">
                  INDUSTRIAL FIREWALL · CONDUIT
                </text>
              )}

              {/* Flows */}
              {flows.map((f, i) => {
                const st = KIND_STYLE[f.kind];
                const { d, stop } = path(f);
                const id = `sec-${sc}-${i}`;
                const a = byId(f.a);
                const b = byId(f.b);
                return (
                  <g key={id}>
                    <path id={id} d={d} fill="none" stroke={st.color} strokeWidth={f.kind === 'exposure' || f.kind === 'alert' ? 2 : 1.6} strokeDasharray={st.dash} opacity={0.9} />
                    {inView && !reduced && f.kind !== 'blocked' && (
                      <circle r={3.2} fill={st.color}>
                        <animateMotion dur={`${2.2 + i * 0.2}s`} repeatCount="indefinite">
                          <mpath href={`#${id}`} />
                        </animateMotion>
                      </circle>
                    )}
                    {stop && (
                      <g transform={`translate(${stop.x} ${stop.y})`}>
                        <circle r={10} fill="#090d16" stroke="#f2707a" />
                        <path d="M-4 -4 L4 4 M4 -4 L-4 4" stroke="#f2707a" strokeWidth={2} />
                      </g>
                    )}
                    {f.label && (
                      <text
                        x={stop ? stop.x + 14 : (a.x + b.x) / 2}
                        y={stop ? stop.y - 12 : (a.y + b.y) / 2 - 8}
                        textAnchor={stop ? 'start' : 'middle'}
                        fontSize={9.5}
                        fill={st.color}
                        className="t-mono-plain"
                        paintOrder="stroke"
                        stroke="#0e1420"
                        strokeWidth={4}
                      >
                        {f.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Assets */}
              {nodes.map((n) => {
                if ((n.id === 'rogue' && !showRogue) || (n.id === 'ids' && !showIds)) return null;
                const on = involved.has(n.id);
                const atRisk = sc === 'flat' && ['plc', 'dcs', 'scada', 'hmi', 'ews'].includes(n.id);
                const color = n.id === 'rogue' ? '#f2b545' : atRisk ? '#f2707a' : on ? '#a6c8fb' : '#7d8ba3';
                return (
                  <g key={n.id} transform={`translate(${n.x} ${n.y})`} opacity={on || atRisk ? 1 : 0.5} className="transition-opacity duration-500">
                    <rect x={-17} y={-17} width={34} height={34} rx={9} fill="#141c2b" stroke={color} />
                    <g color={color}>
                      <Icon name={n.icon} size={18} x={-9} y={-9} />
                    </g>
                    <text y={30} textAnchor="middle" fontSize={9.5} fill={on || atRisk ? '#f3f6fc' : '#94a2ba'}>
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <figcaption className="t-label mt-2 flex flex-wrap gap-x-4 gap-y-1 text-lo">
            <span className="text-[#3cc4d2]">━ approved flow</span>
            <span className="text-[#f2707a]">┅ exposure / denied</span>
            <span className="text-[#2ec79e]">┅ monitoring · backup</span>
            <span>Illustrative, defensive architecture view — no live systems.</span>
          </figcaption>
        </figure>

        <aside className="panel flex flex-col p-5 lg:col-span-4" aria-live="polite">
          <div key={sc} className="swap-in flex flex-1 flex-col">
            <p className="t-label text-teal">
              Scenario {s.letter} · {s.name}
            </p>
            <dl className="t-small mt-3 grid gap-3">
              {[
                ['Security challenge', s.challenge],
                ['Affected assets', s.affected],
                ['Engineering control', s.control],
                ['Operational considerations', s.operational],
                ['Residual risk & verification', s.residual],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className={`t-label ${k === 'Engineering control' ? 'text-teal' : 'text-mid'}`}>{k}</dt>
                  <dd className="mt-1 text-hi/90">{v}</dd>
                </div>
              ))}
            </dl>
            {(sc === 'flat' || sc === 'segmented') && (
              <button type="button" onClick={() => setSc(sc === 'flat' ? 'segmented' : 'flat')} className="btn-line mt-auto self-start !py-2 pt-4 text-[0.85rem]">
                {sc === 'flat' ? 'Compare: after segmentation →' : '← Compare: before (flat network)'}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
