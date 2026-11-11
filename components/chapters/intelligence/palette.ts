export const C = {
  bone: '#d9d3c7',
  hi: '#ece8e0',
  mid: 'rgba(163,158,149,0.9)',
  faint: 'rgba(236,232,224,0.09)',
  line: 'rgba(236,232,224,0.18)',
  signal: '#e0954a',
  signalSoft: 'rgba(224,149,74,0.18)',
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
