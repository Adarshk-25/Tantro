import type { IconName } from '@/content/network';

/** Minimal 24×24 line icons for industrial architecture nodes (original drawings). */
const P: Record<IconName, string> = {
  plc: 'M3 4h18v16H3z M8 4v16 M13 4v16 M5.5 7h0 M5.5 10h0',
  robot: 'M4 20h9 M8.5 20v-4 M8.5 16l4.5-6.5 5.5 3 M18.5 12.5l1.5 3 M18.5 12.5l-1.2 3.2 M8.5 16a1.4 1.4 0 1 0 0.01 0 M13 9.5a1.4 1.4 0 1 0 0.01 0',
  cnc: 'M3 5h18v14H3z M6 8h8v7H6z M10 8v3 M17 8v2 M17 12v2 M3 19v2 M21 19v2',
  sensor: 'M12 9a3 3 0 1 0 0.01 0 M7.5 7.5a6.4 6.4 0 0 0 0 9 M16.5 7.5a6.4 6.4 0 0 1 0 9 M4.6 4.6a10.5 10.5 0 0 0 0 14.8 M19.4 4.6a10.5 10.5 0 0 1 0 14.8',
  camera: 'M3 7h13v10H3z M16 10.5l5-2.5v8l-5-2.5 M6 10h3',
  meter: 'M12 6a7 7 0 1 0 0.01 0 M12 13l3.2-3.2 M8 3h8 M8.5 17h7',
  drive: 'M4 7h11v10H4z M15 10h3v4h-3 M18 12h3 M7 7v10 M10 7v10',
  scada: 'M3 4h18v12H3z M8 20h8 M12 16v4 M6 12l3-3 3 2 4-4.5 2 1.5',
  hmi: 'M4 3h16v12H4z M7 18.5h0 M12 18.5h0 M17 18.5h0 M7 7h10 M7 10h6',
  gateway: 'M3 10h18v7H3z M7 10V5 M17 10V5 M7 13.5h0 M10.5 13.5h0 M14 13.5h4',
  broker: 'M12 9.5a2.5 2.5 0 1 0 0.01 0 M5 5a1.5 1.5 0 1 0 0.01 0 M19 5a1.5 1.5 0 1 0 0.01 0 M5 19a1.5 1.5 0 1 0 0.01 0 M19 19a1.5 1.5 0 1 0 0.01 0 M6 6l4.3 4.3 M18 6l-4.3 4.3 M6 18l4.3-4.3 M18 18l-4.3-4.3',
  chip: 'M7 7h10v10H7z M10 10h4v4h-4z M9 3v4 M12 3v4 M15 3v4 M9 17v4 M12 17v4 M15 17v4 M3 9h4 M3 12h4 M3 15h4 M17 9h4 M17 12h4 M17 15h4',
  db: 'M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6 M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3',
  cloud: 'M7 18a4 4 0 0 1-.5-8 6 6 0 0 1 11.5 1.5A3.3 3.3 0 0 1 17.5 18z',
  app: 'M3 4h18v16H3z M3 8h18 M7 12h6 M7 15.5h10',
  ai: 'M5 7a1.6 1.6 0 1 0 0.01 0 M5 17a1.6 1.6 0 1 0 0.01 0 M12 12a1.6 1.6 0 1 0 0.01 0 M19 7a1.6 1.6 0 1 0 0.01 0 M19 17a1.6 1.6 0 1 0 0.01 0 M6.4 7.8l4.2 3.4 M6.4 16.2l4.2-3.4 M13.4 11.2l4.2-3.4 M13.4 12.8l4.2 3.4',
  user: 'M12 4a4 4 0 1 0 0.01 0 M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
  erp: 'M12 3l9 5-9 5-9-5z M3 12.5l9 5 9-5 M3 16.5l9 5 9-5',
  model: 'M9 3h6v4H9z M3 16h6v4H3z M15 16h6v4h-6z M12 7v4 M6 11h12 M6 11v5 M18 11v5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4',
};

export function Icon({ name, size = 18, x = 0, y = 0 }: { name: IconName; size?: number; x?: number; y?: number }) {
  const s = size / 24;
  return (
    <path
      d={P[name]}
      transform={`translate(${x} ${y}) scale(${s})`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6 / s > 3 ? 1.6 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  );
}
