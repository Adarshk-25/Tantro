'use client';

import { useEffect, useRef, useState } from 'react';
import { ceViews, ioPoints, permissives, recovery, safetyNote, states, type CeView, type CellState } from '@/content/automation';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

const DUR: Record<string, number> = { IDLE: 1600, READY: 1600, STARTING: 1500, RUNNING: 6500, STOPPING: 1500, COMPLETE: 2000 };
const C = { hi: '#f3f6fc', mid: '#abb8ce', lo: '#7d8ba3', line: 'rgb(226 234 246 / 0.22)', blue: '#5b9bf5', cyan: '#3cc4d2', teal: '#2ec79e', warn: '#f2b545', alert: '#f2707a' };

type Alarm = { time: string; tag: string; text: string; prio: 'high' | 'medium' };

export function ControlEngineeringExplorer() {
  const [view, setView] = useState<CeView>('sequence');
  const [state, setState] = useState<CellState>('IDLE');
  const [count, setCount] = useState(1832);
  const [faulted, setFaulted] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(0);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [tick, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const v = ceViews.find((x) => x.id === view)!;
  const running = state === 'RUNNING';

  // Sequence clock (browser-only simulation)
  useEffect(() => {
    if (!inView || faulted) return;
    const t = setTimeout(() => {
      const i = states.indexOf(state as (typeof states)[number]);
      setState(states[(i + 1) % states.length]);
    }, DUR[state] ?? 1500);
    return () => clearTimeout(t);
  }, [state, inView, faulted]);
  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => {
      setTick((k) => k + 1);
      if (running && !faulted) setCount((c) => c + 1);
    }, 900);
    return () => clearInterval(t);
  }, [inView, running, faulted]);

  const triggerFault = () => {
    setView('fault');
    setFaulted(true);
    setState('HELD');
    setRecoveryStep(0);
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setAlarms([{ time: ts, tag: 'CV-101', text: 'Conveyor jam — PE-102 blocked > 3 s', prio: 'high' }]);
  };
  const advanceRecovery = () => {
    if (recoveryStep < recovery.length - 1) setRecoveryStep((s) => s + 1);
    else {
      setFaulted(false);
      setAlarms([]);
      setState('READY');
      setRecoveryStep(0);
    }
  };

  const pe102 = faulted ? 1 : running ? (tick % 3 === 0 ? 1 : 0) : 0;
  const ioValue = (tag: string) => {
    switch (tag) {
      case 'PE-102':
        return pe102 ? 'ON' : 'OFF';
      case 'PX-104':
        return running ? (tick % 2 ? 'ON' : 'OFF') : 'OFF';
      case 'GS-101':
        return 'ON';
      case 'M-101':
        return running && !faulted ? 'ON' : 'OFF';
      case 'YV-120':
        return running && tick % 2 ? 'ON' : 'OFF';
      case 'TT-130':
        return `${(182 + Math.sin(tick * 0.7) * 1.2).toFixed(1)} °C`;
      case 'PT-110':
        return `${(6.2 + Math.sin(tick * 0.5) * 0.08).toFixed(2)} bar`;
    }
    return '';
  };
  const stateColor = state === 'HELD' ? C.alert : state === 'RUNNING' ? C.teal : state === 'COMPLETE' ? C.cyan : C.blue;
  const hl = (layer: 'field' | 'plc' | 'hmi' | 'mes') =>
    (view === 'io' && (layer === 'field' || layer === 'plc')) ||
    (view === 'sequence' && layer === 'plc') ||
    (view === 'scada' && layer === 'hmi') ||
    (view === 'mes' && (layer === 'mes' || layer === 'hmi')) ||
    (view === 'fault' && (layer === 'field' || layer === 'hmi'));

  return (
    <div ref={ref} className="flex flex-col gap-4">
      {/* Views */}
      <div role="tablist" aria-label="Control engineering views" className="no-scrollbar -mx-[var(--gutter)] flex gap-1.5 overflow-x-auto px-[var(--gutter)] md:mx-0 md:px-0">
        {ceViews.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={view === x.id}
            onClick={() => setView(x.id)}
            className={`flex shrink-0 items-baseline gap-2 rounded-xl border px-3.5 py-2 text-[0.86rem] transition-colors ${
              view === x.id ? 'border-signal/60 bg-signal/10 text-hi' : 'border-hi/8 text-mid hover:border-hi/25 hover:text-hi'
            }`}
          >
            <span className="t-mono-plain text-[0.7rem] text-signal">{i + 1}</span>
            {x.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Cell schematic */}
        <figure className="panel relative p-3 md:p-4 lg:col-span-7">
          <div className="t-label mb-2 flex flex-wrap items-center justify-between gap-2 text-lo">
            <span>Automated production cell · illustrative</span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: stateColor }} aria-hidden="true" />
              <span className="text-hi">STATE: {state}</span>
            </span>
          </div>
          <svg viewBox="0 0 720 400" className="block h-auto w-full" role="img" aria-label={`Production cell schematic. State ${state}. ${faulted ? 'Fault: conveyor jam at photo-eye PE-102.' : ''}`}>
            <defs>
              <pattern id="ce-belt" width="14" height="10" patternUnits="userSpaceOnUse">
                <path d="M0 10 L7 0" stroke="rgb(226 234 246 / 0.18)" />
              </pattern>
            </defs>
            {/* Levels */}
            {[
              ['MES / ERP', 18],
              ['SCADA / HMI', 88],
              ['PLC / controller', 166],
              ['Field devices', 262],
            ].map(([l, y]) => (
              <text key={l as string} x={8} y={(y as number) + 12} fontSize={9.5} fill={C.lo} className="t-mono-plain" letterSpacing="0.06em">
                {(l as string).toUpperCase()}
              </text>
            ))}
            {/* MES */}
            <g opacity={hl('mes') ? 1 : 0.45} className="transition-opacity duration-500">
              <rect x={470} y={12} width={210} height={52} rx={8} fill="#141c2b" stroke={hl('mes') ? C.blue : C.line} />
              <text x={484} y={32} fontSize={12} fill={C.hi}>MES · order 4471</text>
              <text x={484} y={50} fontSize={10.5} fill={C.mid} className="t-mono-plain">
                good {count.toLocaleString('en')} · reject 14
              </text>
            </g>
            {/* HMI */}
            <g opacity={hl('hmi') ? 1 : 0.45} className="transition-opacity duration-500">
              <rect x={200} y={80} width={260} height={66} rx={8} fill="#1a2233" stroke={hl('hmi') ? C.blue : C.line} />
              <rect x={210} y={90} width={150} height={46} rx={4} fill="#2a3446" />
              <rect x={222} y={104} width={36} height={18} rx={2} fill={running && !faulted ? '#8f9bb0' : '#5a6478'} />
              <text x={226} y={117} fontSize={8.5} fill="#0e1420" className="t-mono-plain">
                CV-101
              </text>
              <path d={`M270 ${126 - 6} ${Array.from({ length: 9 }, (_, i) => `L${270 + i * 10} ${118 - Math.sin((i + tick) * 0.9) * 6}`).join(' ')}`} fill="none" stroke="#c9d2e0" strokeWidth={1.2} />
              <rect x={368} y={90} width={84} height={46} rx={4} fill={faulted ? 'rgb(242 112 122 / 0.18)' : '#222b3c'} stroke={faulted ? C.alert : 'transparent'} />
              <text x={376} y={106} fontSize={8.5} fill={faulted ? C.alert : C.mid} className="t-mono-plain">
                {faulted ? 'ALARM' : 'NO ALARMS'}
              </text>
              {faulted && (
                <text x={376} y={122} fontSize={8} fill={C.hi} className="t-mono-plain">
                  CV-101 JAM
                </text>
              )}
            </g>
            {/* PLC rack */}
            <g opacity={hl('plc') ? 1 : 0.5} className="transition-opacity duration-500">
              <rect x={200} y={160} width={300} height={62} rx={6} fill="#141c2b" stroke={hl('plc') ? C.blue : C.line} />
              {['CPU', 'DI 16', 'DO 16', 'AI 8', 'COMM'].map((m, i) => (
                <g key={m}>
                  <rect x={212 + i * 56} y={170} width={48} height={42} rx={3} fill="#1c2638" stroke="rgb(226 234 246 / 0.16)" />
                  <text x={236 + i * 56} y={195} textAnchor="middle" fontSize={9} fill={C.mid} className="t-mono-plain">
                    {m}
                  </text>
                  <circle cx={220 + i * 56} cy={176} r={2.2} fill={i === 0 ? stateColor : C.teal} />
                </g>
              ))}
            </g>
            {/* Network */}
            <path d="M330 146 V160 M460 113 H520 V64" fill="none" stroke={C.cyan} strokeWidth={1.4} strokeDasharray={reduced ? undefined : '4 5'} className={reduced ? '' : 'flow-dash'} opacity={0.7} />
            {/* Field level */}
            <rect x={120} y={330} width={480} height={22} rx={4} fill="url(#ce-belt)" stroke={C.line} />
            {[0, 1, 2, 3].map((i) => {
              const x0 = 140 + ((i * 120 + (running && !faulted && !reduced ? tick * 18 : 0)) % 440);
              const jamX = 540;
              const x = faulted && i === 0 ? jamX : x0;
              return <rect key={i} x={x} y={304} width={34} height={26} rx={2} fill={faulted && i === 0 ? 'rgb(242 112 122 / 0.35)' : '#2a3446'} stroke={faulted && i === 0 ? C.alert : 'rgb(226 234 246 / 0.25)'} className="transition-[x] duration-700" />;
            })}
            {/* Devices */}
            {[
              { tag: 'M-101', x: 112, y: 340, kind: 'motor' },
              { tag: 'PX-104', x: 300, y: 286, kind: 'sensor' },
              { tag: 'YV-120', x: 360, y: 280, kind: 'valve' },
              { tag: 'PE-102', x: 590, y: 300, kind: 'sensor' },
              { tag: 'GS-101', x: 660, y: 300, kind: 'guard' },
              { tag: 'TT-130', x: 440, y: 286, kind: 'sensor' },
            ].map((d) => {
              const active = view === 'io' || (view === 'fault' && d.tag === 'PE-102');
              const tripped = faulted && d.tag === 'PE-102';
              return (
                <g key={d.tag} opacity={hl('field') || view === 'sequence' ? 1 : 0.55}>
                  {/* field wiring to I/O cards */}
                  <path
                    d={`M${d.x} ${d.y - 6} C${d.x} ${250} ${300} ${240} ${300 + (['M-101', 'YV-120'].includes(d.tag) ? 56 : d.tag === 'TT-130' ? 112 : 0)} 222`}
                    fill="none"
                    stroke={tripped ? C.alert : active ? C.cyan : C.line}
                    strokeWidth={active ? 1.3 : 1}
                    strokeDasharray={active && !reduced ? '3 4' : undefined}
                    className={active && !reduced ? 'flow-dash' : ''}
                  />
                  {d.kind === 'motor' ? (
                    <circle cx={d.x} cy={d.y} r={11} fill="#1c2638" stroke={running && !faulted ? C.teal : C.line} strokeWidth={1.5} />
                  ) : d.kind === 'guard' ? (
                    <rect x={d.x - 8} y={d.y - 4} width={16} height={60} rx={2} fill="none" stroke={C.mid} strokeDasharray="2 3" />
                  ) : (
                    <rect x={d.x - 8} y={d.y - 8} width={16} height={16} rx={3} fill={tripped ? 'rgb(242 112 122 / 0.4)' : '#1c2638'} stroke={tripped ? C.alert : C.blue} />
                  )}
                  <text x={d.x} y={d.y + (d.kind === 'guard' ? 70 : 24)} textAnchor="middle" fontSize={9} fill={tripped ? C.alert : C.mid} className="t-mono-plain">
                    {d.tag}
                  </text>
                </g>
              );
            })}
          </svg>
          <figcaption className="t-label mt-2 text-lo">{safetyNote}</figcaption>
        </figure>

        {/* View panel */}
        <div className="panel flex flex-col p-5 lg:col-span-5" aria-live="polite">
          <p className="t-label text-signal">{v.name}</p>
          <p className="t-small mt-2 text-hi/85">{v.text}</p>

          {view === 'io' && (
            <table className="mt-4 w-full text-left text-[0.76rem]">
              <thead className="t-label text-lo">
                <tr>
                  <th className="pb-1 font-normal">Tag</th>
                  <th className="pb-1 font-normal">Type</th>
                  <th className="pb-1 font-normal">Address</th>
                  <th className="pb-1 text-right font-normal">Value</th>
                </tr>
              </thead>
              <tbody className="t-mono-plain">
                {ioPoints.map((p) => (
                  <tr key={p.tag} className="border-t border-hi/8">
                    <td className="py-1.5 text-hi">
                      {p.tag}
                      <span className="block font-sans text-[0.68rem] text-lo">{p.desc}</span>
                    </td>
                    <td className="text-mid">{p.type}</td>
                    <td className="text-mid">{p.addr}</td>
                    <td className={`text-right ${ioValue(p.tag) === 'ON' ? 'text-teal' : 'text-hi'}`}>{ioValue(p.tag)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {view === 'sequence' && (
            <>
              <ol className="mt-4 flex flex-wrap items-center gap-1 text-[0.7rem]" aria-label="State machine">
                {states.map((s, i) => (
                  <li key={s} className="flex items-center gap-1">
                    <span
                      className={`t-mono-plain rounded-md border px-1.5 py-1 transition-colors ${
                        state === s ? 'border-teal bg-teal/15 text-hi' : 'border-hi/12 text-lo'
                      }`}
                    >
                      {s}
                    </span>
                    {i < states.length - 1 && <span className="text-lo">→</span>}
                  </li>
                ))}
              </ol>
              <p className="t-label mt-4 text-mid">Permissives for READY → STARTING</p>
              <ul className="mt-2 grid gap-1">
                {permissives.map((p) => (
                  <li key={p.tag} className="flex items-center justify-between gap-2 text-[0.8rem]">
                    <span className="text-hi/85">
                      <span className="t-mono-plain mr-2 text-[0.7rem] text-lo">{p.tag}</span>
                      {p.text}
                    </span>
                    <span className="text-teal">✓</span>
                  </li>
                ))}
              </ul>
              <pre className="t-mono-plain mt-4 overflow-x-auto rounded-lg border border-hi/8 bg-ink-950/60 p-3 text-[0.68rem] leading-relaxed text-mid">
{`CASE State OF
  READY:
    IF Permissives_OK AND Start_Cmd THEN
      State := STARTING;
    END_IF;
  RUNNING:
    IF PE102_Blocked_3s THEN
      State := HELD;  Alarm_CV101_Jam := TRUE;
    ELSIF Batch_Done THEN
      State := STOPPING;
    END_IF;
END_CASE;`}
              </pre>
            </>
          )}

          {view === 'scada' && (
            <dl className="mt-4 grid grid-cols-2 gap-3 text-[0.8rem]">
              {[
                ['Cell state', state],
                ['Conveyor CV-101', running && !faulted ? 'Running' : 'Stopped'],
                ['Oven TT-130', ioValue('TT-130')],
                ['Air PT-110', ioValue('PT-110')],
                ['Active alarms', String(alarms.length)],
                ['Operator', 'Shift B · level 2'],
              ].map(([k, val]) => (
                <div key={k} className="border-b border-hi/8 pb-1">
                  <dt className="t-label text-lo">{k}</dt>
                  <dd className="t-mono-plain text-hi">{val}</dd>
                </div>
              ))}
            </dl>
          )}

          {view === 'mes' && (
            <div className="mt-4 grid gap-3 text-[0.8rem]">
              <div className="rounded-lg border border-hi/10 p-3">
                <p className="t-label text-lo">Down · from MES (ISA-95 production schedule)</p>
                <p className="mt-1 text-hi">Order 4471 · bracket B-12 · 2,400 pcs · recipe R-07</p>
              </div>
              <div className="rounded-lg border border-hi/10 p-3">
                <p className="t-label text-lo">Up · to MES (production performance)</p>
                <p className="t-mono-plain mt-1 text-hi">
                  good {count.toLocaleString('en')} · reject 14 · downtime 6 min (changeover)
                </p>
              </div>
              <p className="text-[0.75rem] text-lo">Exchange runs through the supervisory layer; controllers are never exposed to enterprise systems.</p>
            </div>
          )}

          {view === 'fault' && (
            <div className="mt-4 grid gap-3">
              {!faulted ? (
                <button type="button" onClick={triggerFault} className="btn-plate self-start !py-2.5 text-[0.88rem]">
                  Simulate a conveyor jam
                </button>
              ) : (
                <>
                  <div className="rounded-lg border border-alert/50 bg-alert/10 p-3 text-[0.8rem]">
                    <p className="t-label text-alert">Alarm · high priority</p>
                    <p className="t-mono-plain mt-1 text-hi">
                      {alarms[0]?.time} · {alarms[0]?.tag} · {alarms[0]?.text}
                    </p>
                  </div>
                  <div className="text-[0.8rem]">
                    <p className="t-label text-mid">Diagnostic context</p>
                    <ul className="mt-1 grid gap-0.5 text-hi/85">
                      <li>Sequence held in RUNNING → HELD; motor M-101 de-energised by logic</li>
                      <li>PE-102 has stayed ON for more than 3 s (normal pulse ≈ 0.4 s)</li>
                      <li>Upstream PX-104 and air pressure normal — likely a mis-oriented carton</li>
                    </ul>
                  </div>
                  <ol className="grid gap-1.5 text-[0.8rem]" aria-label="Recovery workflow">
                    {recovery.map((r, i) => (
                      <li key={r} className={`flex gap-2 ${i < recoveryStep ? 'text-lo line-through' : i === recoveryStep ? 'text-hi' : 'text-lo'}`}>
                        <span className={`t-mono-plain flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.6rem] ${i === recoveryStep ? 'bg-signal text-white' : 'border border-hi/20'}`}>{i + 1}</span>
                        {r}
                      </li>
                    ))}
                  </ol>
                  <button type="button" onClick={advanceRecovery} className="btn-line self-start !py-2 text-[0.85rem]">
                    {recoveryStep < recovery.length - 1 ? 'Complete step →' : 'Restart from READY →'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
