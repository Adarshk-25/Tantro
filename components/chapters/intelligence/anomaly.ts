import { C, monoText, type StageIndex } from './palette';

/** Synthetic vibration signal: periodic running component + noise + emerging high-frequency fault. */
function signal(x: number, phase: number) {
  const u = x * 40 + phase;
  const base = Math.sin(u * 1.1) * 0.42 + Math.sin(u * 2.3 + 1) * 0.12;
  const noise = Math.sin(u * 17.3) * 0.05 + Math.sin(u * 29.1 + 2) * 0.04;
  const fault = Math.max(0, (x - 0.6) / 0.4);
  const hf = Math.sin(u * 9.7) * 0.32 * fault * fault + Math.sin(u * 13.1) * 0.12 * fault;
  return base + noise + hf;
}

export function drawAnomaly(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, stage: StageIndex) {
  const pad = Math.max(16, w * 0.04);
  const specW = stage >= 1 ? Math.min(180, w * 0.24) : 0;
  const plotW = w - pad * 2 - (specW ? specW + pad : 0);
  const plotH = h * 0.5;
  const y0 = pad + 24 + plotH / 2;
  const phase = t * 2.2;

  monoText(ctx, 'VELOCITY RMS · mm/s', pad, pad + 8, C.mid);

  // grid
  ctx.strokeStyle = C.faint;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const x = pad + (plotW * i) / 8;
    ctx.beginPath();
    ctx.moveTo(x, pad + 24);
    ctx.lineTo(x, pad + 24 + plotH);
    ctx.stroke();
  }

  // learned normal envelope
  if (stage >= 1) {
    ctx.fillStyle = 'rgba(236,232,224,0.06)';
    ctx.fillRect(pad, y0 - plotH * 0.34, plotW, plotH * 0.68);
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = C.line;
    [y0 - plotH * 0.34, y0 + plotH * 0.34].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(pad + plotW, y);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    monoText(ctx, 'LEARNED NORMAL', pad + 6, y0 - plotH * 0.34 - 6, C.mid);
  }

  // signal trace — coloured where it departs from normal once insight is shown
  const N = Math.max(200, Math.floor(plotW / 1.5));
  for (let i = 1; i < N; i++) {
    const xa = (i - 1) / N;
    const xb = i / N;
    const va = signal(xa, phase);
    const vb = signal(xb, phase);
    const anomalous = stage >= 2 && xb > 0.62;
    ctx.strokeStyle = anomalous ? C.signal : C.bone;
    ctx.globalAlpha = anomalous ? 1 : 0.85;
    ctx.lineWidth = anomalous ? 1.6 : 1.1;
    ctx.beginPath();
    ctx.moveTo(pad + xa * plotW, y0 - va * plotH * 0.5);
    ctx.lineTo(pad + xb * plotW, y0 - vb * plotH * 0.5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // anomaly score strip
  const sy = pad + 24 + plotH + 34;
  const sh = h - sy - pad - 10;
  if (stage >= 1 && sh > 30) {
    monoText(ctx, 'ANOMALY SCORE', pad, sy - 10, C.mid);
    const thr = sy + sh * 0.35;
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = 'rgba(228,109,85,0.6)';
    ctx.beginPath();
    ctx.moveTo(pad, thr);
    ctx.lineTo(pad + plotW, thr);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      const s = 0.08 + 0.03 * Math.sin(x * 60 + phase) + Math.pow(Math.max(0, (x - 0.58) / 0.42), 1.6) * 0.85;
      const px = pad + x * plotW;
      const py = sy + sh - s * sh;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = stage >= 2 ? C.signal : C.bone;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    monoText(ctx, 'THRESHOLD', pad + plotW, thr - 6, 'rgba(228,109,85,0.9)', 'right');
  }

  // spectrum: band energy comparison, the "processing" view
  if (specW) {
    const sx = w - pad - specW;
    monoText(ctx, 'BAND ENERGY', sx, pad + 8, C.mid);
    const bands = 8;
    const bw = specW / bands - 4;
    for (let b = 0; b < bands; b++) {
      const normal = 0.55 * Math.exp(-b * 0.45) + 0.08;
      const now = normal + (b >= 5 && b <= 6 ? 0.42 + 0.04 * Math.sin(t * 3 + b) : 0.02 * Math.sin(t * 2 + b));
      const bx = sx + b * (bw + 4);
      const base = pad + 24 + plotH;
      ctx.fillStyle = 'rgba(236,232,224,0.14)';
      ctx.fillRect(bx, base - normal * plotH, bw, normal * plotH);
      ctx.fillStyle = stage >= 2 && b >= 5 && b <= 6 ? C.signal : 'rgba(217,211,199,0.7)';
      ctx.fillRect(bx + bw * 0.3, base - now * plotH, bw * 0.4, now * plotH);
    }
    monoText(ctx, 'LOW → HIGH FREQ', sx, pad + 24 + plotH + 16, C.mid);
  }
}
