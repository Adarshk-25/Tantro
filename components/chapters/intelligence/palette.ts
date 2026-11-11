export const C = {
  bone: '#d5deec',
  hi: '#f3f6fc',
  mid: 'rgba(163,158,149,0.9)',
  faint: 'rgba(226,234,246,0.09)',
  line: 'rgba(226,234,246,0.18)',
  signal: '#4c8df0',
  signalSoft: 'rgba(76,141,240,0.18)',
  alert: '#e46d55',
  ok: '#9cc3a4',
  mono: '11px "IBM Plex Mono", ui-monospace, monospace',
};

export type StageIndex = 0 | 1 | 2 | 3;

export function monoText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, align: CanvasTextAlign = 'left') {
  ctx.font = C.mono;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}
