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
    </svg>
  );
}
