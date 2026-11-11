import type { WorkFigure as Fig } from '@/content/work';

/** Original, minimal technical figures — one per work category. */
export function WorkFigure({ figure }: { figure: Fig }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, vectorEffect: 'non-scaling-stroke' as const };
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full text-onlight" aria-hidden="true">
      {figure === 'architecture' && (
        <g {...common}>
          {[30, 70, 110, 150].map((y, i) => (
            <g key={y}>
              <line x1={20} x2={300} y1={y} y2={y} opacity={0.25} />
              {Array.from({ length: [2, 2, 3, 5][i] }, (_, k) => {
                const w = 260 / [2, 2, 3, 5][i];
                return <rect key={k} x={30 + k * w + 6} y={y + 8} width={w - 18} height={20} opacity={0.8} />;
              })}
            </g>
          ))}
          <rect x={14} y={100} width={292} height={40} strokeDasharray="4 4" className="flow-hover text-signal-deep" stroke="currentColor" />
          <text x={300} y={96} textAnchor="end" className="t-mono" fill="currentColor" stroke="none" style={{ fontSize: 9 }}>
            EDGE ZONE
          </text>
        </g>
      )}
      {figure === 'integration' && (
        <g {...common}>
          <path d="M40 30 V170 M40 60 H70 M40 100 H70 M40 140 H70 M70 100 V160 M70 130 H95 M70 160 H95" opacity={0.7} />
          {[30, 60, 100, 140, 130, 160].map((y, i) => (
            <circle key={i} cx={i < 4 ? (i === 0 ? 40 : 70) : 95} cy={y} r={3.5} />
          ))}
          <path d="M120 100 C170 100 170 60 220 60 M120 100 C170 100 170 100 220 100 M120 100 C170 100 170 140 220 140" className="flow-hover text-signal-deep" stroke="currentColor" />
          {[60, 100, 140].map((y) => (
            <rect key={y} x={220} y={y - 10} width={80} height={20} />
          ))}
        </g>
      )}
      {figure === 'vision' && (
        <g {...common}>
          <rect x={60} y={30} width={200} height={140} opacity={0.35} />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`v${i}`} x1={60 + (i + 1) * 25} x2={60 + (i + 1) * 25} y1={30} y2={170} opacity={0.12} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1={60} x2={260} y1={30 + (i + 1) * 23.3} y2={30 + (i + 1) * 23.3} opacity={0.12} />
          ))}
          <rect x={90} y={70} width={140} height={70} rx={16} />
          <circle cx={112} cy={105} r={9} />
          <circle cx={208} cy={105} r={9} />
          <path d="M180 78 q8 6 12 22" />
          <rect x={172} y={70} width={30} height={36} className="flow-hover text-signal-deep" stroke="currentColor" strokeWidth={1.6} />
        </g>
      )}
      {figure === 'predictive' && (
        <g {...common}>
          <rect x={20} y={70} width={280} height={60} opacity={0} />
          <path d="M20 75 H300 M20 125 H300" strokeDasharray="3 5" opacity={0.4} />
          <path
            d={`M20 100 ${Array.from({ length: 70 }, (_, i) => {
              const x = 20 + i * 4;
              const f = Math.max(0, (i - 44) / 26);
              const y = 100 + Math.sin(i * 0.9) * 14 + Math.sin(i * 2.6) * 10 * f * f * 2.4;
              return `L${x} ${y.toFixed(1)}`;
            }).join(' ')}`}
          />
          <path d="M196 40 H300 V160 H196 Z" className="flow-hover text-signal-deep" stroke="currentColor" strokeDasharray="4 4" />
        </g>
      )}
      {figure === 'robotics' && (
        <g {...common}>
          <path d="M40 170 H120 M60 170 V150 H100 V170" opacity={0.6} />
          <path d="M80 150 L95 90 L160 70 L180 100" />
          {[
            [80, 150],
            [95, 90],
            [160, 70],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r={6} />
          ))}
          <path d="M180 100 C220 60 260 80 270 130" strokeDasharray="2 5" className="flow-hover text-signal-deep" stroke="currentColor" />
          <rect x={258} y={130} width={24} height={24} />
          <circle cx={270} cy={142} r={56} strokeDasharray="3 6" opacity={0.3} />
        </g>
      )}
      {figure === 'control' && (
        <g {...common}>
          {['IDLE', 'READY', 'START', 'RUN', 'STOP', 'DONE'].map((t, i) => (
            <g key={t}>
              <rect x={14 + i * 50} y={40} width={42} height={22} rx={5} opacity={i === 3 ? 1 : 0.6} />
              <text x={35 + i * 50} y={55} textAnchor="middle" fontSize={8} fill="currentColor" stroke="none" className="t-mono-plain">
                {t}
              </text>
              {i < 5 && <path d={`M${56 + i * 50} 51h8`} />}
            </g>
          ))}
          <path d="M175 62 v40 h-30" className="flow-hover text-signal-deep" stroke="currentColor" />
          <rect x={95} y={92} width={50} height={22} rx={5} className="text-signal-deep" stroke="currentColor" />
          <text x={120} y={107} textAnchor="middle" fontSize={8} fill="currentColor" stroke="none" className="t-mono-plain text-signal-deep">
            HELD
          </text>
          <path d="M40 150h240 M40 170h240" opacity={0.5} />
          {[60, 120, 180].map((x) => (
            <rect key={x} x={x} y={152} width={22} height={16} />
          ))}
          <rect x={250} y={140} width={10} height={10} />
        </g>
      )}
      {figure === 'scada' && (
        <g {...common}>
          <rect x={30} y={24} width={260} height={150} rx={6} />
          <rect x={30} y={24} width={260} height={18} rx={6} opacity={0.5} />
          <circle cx={90} cy={100} r={26} />
          <circle cx={200} cy={100} r={26} />
          <path d="M116 100h58" />
          <path d="M50 160 L80 150 L110 155 L140 140 L170 148 L200 130 L230 136 L270 128" className="flow-hover text-signal-deep" stroke="currentColor" />
          <rect x={232} y={50} width={50} height={14} rx={3} className="text-signal-deep" stroke="currentColor" />
        </g>
      )}
      {figure === 'security' && (
        <g {...common}>
          {[20, 110, 200].map((x) => (
            <rect key={x} x={x} y={40} width={84} height={120} rx={8} opacity={0.6} />
          ))}
          {[107, 197].map((x) => (
            <rect key={x} x={x - 3} y={36} width={6} height={128} className="text-signal-deep" stroke="currentColor" />
          ))}
          <path d="M60 100 H150 H240" className="flow-hover text-signal-deep" stroke="currentColor" />
          <path d="M150 20c12 4 22 4 22 4v14c0 10-10 16-22 20-12-4-22-10-22-20V24s10 0 22-4z" />
        </g>
      )}
      {figure === 'mes' && (
        <g {...common}>
          <rect x={20} y={70} width={70} height={50} rx={6} />
          <rect x={125} y={70} width={70} height={50} rx={6} />
          <rect x={230} y={70} width={70} height={50} rx={6} />
          <text x={55} y={99} textAnchor="middle" fontSize={10} fill="currentColor" stroke="none">LINE</text>
          <text x={160} y={99} textAnchor="middle" fontSize={10} fill="currentColor" stroke="none">MES</text>
          <text x={265} y={99} textAnchor="middle" fontSize={10} fill="currentColor" stroke="none">ERP</text>
          <path d="M195 85 H230 M90 95 H125" className="flow-hover text-signal-deep" stroke="currentColor" />
          <path d="M230 108 H195" />
        </g>
      )}
    </svg>
  );
}
