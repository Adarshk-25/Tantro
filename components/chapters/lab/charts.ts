/**
 * Decision-lab chart renderers (Canvas 2D).
 * phase 0 = raw signals, 1 = model overlay, 2 = insight; k ∈ [0,1] eases each phase in.
 */

import type { ChartKind } from '@/content/intelligence';
import { drawBottleneck, type LineSim } from '../intelligence/bottleneck';
import { drawVision } from '../intelligence/vision';

type Ctx = CanvasRenderingContext2D;
export type DrawArgs = { w: number; h: number; t: number; phase: 0 | 1 | 2; k: number; sim: LineSim };
type F = { x: number; y: number; w: number; h: number };

export const COL = {
  hi: '#f3f6fc',
  bone: 'rgba(226,234,246,0.82)',
  mid: '#abb8ce',
  lo: '#7d8ba3',
  grid: 'rgba(226,234,246,0.06)',
  axis: 'rgba(226,234,246,0.2)',
  sig: '#4c8df0',
  sigSoft: 'rgba(76,141,240,0.16)',
  alert: '#e46d55',
  ok: '#9cc3a4',
};

const noise = (i: number, s = 1) => {
  const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return (v - Math.floor(v)) * 2 - 1;
};
const ease = (k: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);

function txt(ctx: Ctx, s: string, x: number, y: number, color = COL.mid, align: CanvasTextAlign = 'left', size = 10.5, mono = true) {
  ctx.font = `${size}px ${mono ? '"IBM Plex Mono", ui-monospace, monospace' : 'Geist, ui-sans-serif, sans-serif'}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function area(w: number, h: number, l = 46, r = 18, t = 26, b = 34): F {
  return { x: l, y: t, w: w - l - r, h: h - t - b };
}

function grid(ctx: Ctx, f: F, nx = 8, ny = 4) {
  ctx.strokeStyle = COL.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= nx; i++) {
    const x = Math.round(f.x + (f.w * i) / nx) + 0.5;
    ctx.moveTo(x, f.y);
    ctx.lineTo(x, f.y + f.h);
  }
  for (let j = 0; j <= ny; j++) {
    const y = Math.round(f.y + (f.h * j) / ny) + 0.5;
    ctx.moveTo(f.x, y);
    ctx.lineTo(f.x + f.w, y);
  }
  ctx.stroke();
  ctx.strokeStyle = COL.axis;
  ctx.beginPath();
  ctx.moveTo(f.x, f.y);
  ctx.lineTo(f.x, f.y + f.h);
  ctx.lineTo(f.x + f.w, f.y + f.h);
  ctx.stroke();
}

function line(ctx: Ctx, pts: [number, number][], color: string, width = 1.4, dash?: number[]) {
  if (pts.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash ?? []);
  ctx.lineJoin = 'round';
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.setLineDash([]);
}

function band(ctx: Ctx, up: [number, number][], lo: [number, number][], fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  up.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  [...lo].reverse().forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.closePath();
  ctx.fill();
}

/** Annotation: dot + leader + label box. */
function callout(ctx: Ctx, x: number, y: number, text: string, dx: number, dy: number, a = 1, color = COL.sig) {
  ctx.globalAlpha = a;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dx, y + dy);
  ctx.stroke();
  ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
  const tw = ctx.measureText(text).width + 14;
  const bx = dx < 0 ? x + dx - tw : x + dx;
  const by = y + dy - 10;
  ctx.fillStyle = 'rgba(9,13,22,0.92)';
  ctx.fillRect(bx, by, tw, 20);
  ctx.strokeRect(bx + 0.5, by + 0.5, tw - 1, 19);
  txt(ctx, text, bx + 7, by + 14, color === COL.sig ? '#a9cbfa' : color, 'left', 11);
  ctx.globalAlpha = 1;
}

/* ------------------------------------------------------------------ */

function anomaly(ctx: Ctx, { w, h, t, phase, k }: DrawArgs) {
  const specW = w > 520 ? Math.min(190, w * 0.26) : 0;
  const f = area(w - specW - (specW ? 14 : 0), h * 0.64);
  grid(ctx, f, 8, 4);
  txt(ctx, 'VIBRATION · mm/s', f.x, f.y - 10);
  const N = Math.max(160, Math.floor(f.w / 2));
  const y0 = f.y + f.h / 2;
  const sig = (x: number) => {
    const u = x * 46 + t * 2.2;
    const fault = Math.max(0, (x - 0.6) / 0.4);
    return Math.sin(u * 1.1) * 0.38 + Math.sin(u * 2.3 + 1) * 0.1 + noise(Math.floor(u * 9)) * 0.05 + Math.sin(u * 9.7) * 0.34 * fault * fault;
  };
  if (phase >= 1) {
    const a = ease(k) * (phase > 1 ? 1 : 1);
    ctx.globalAlpha = a;
    band(
      ctx,
      [[f.x, y0 - f.h * 0.3], [f.x + f.w, y0 - f.h * 0.3]],
      [[f.x, y0 + f.h * 0.3], [f.x + f.w, y0 + f.h * 0.3]],
      'rgba(226,234,246,0.06)',
    );
    line(ctx, [[f.x, y0 - f.h * 0.3], [f.x + f.w, y0 - f.h * 0.3]], COL.axis, 1, [3, 5]);
    line(ctx, [[f.x, y0 + f.h * 0.3], [f.x + f.w, y0 + f.h * 0.3]], COL.axis, 1, [3, 5]);
    txt(ctx, 'μ ± 3σ (state: full load)', f.x + 6, y0 - f.h * 0.3 - 5, COL.mid);
    ctx.globalAlpha = 1;
  }
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) pts.push([f.x + (i / N) * f.w, y0 - sig(i / N) * f.h * 0.5]);
  const cut = Math.floor(N * 0.62);
  line(ctx, pts.slice(0, cut + 1), COL.bone, 1.1);
  line(ctx, pts.slice(cut), phase === 2 ? COL.sig : COL.bone, phase === 2 ? 1.5 : 1.1);

  // anomaly score strip
  const s = area(w - specW - (specW ? 14 : 0), h, 46, 18, h * 0.64 + 26, 26);
  if (phase === 0) {
    ctx.strokeStyle = COL.grid;
    ctx.setLineDash([3, 4]);
    ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1);
    ctx.setLineDash([]);
    txt(ctx, 'anomaly score — computed in the model-logic step', s.x + s.w / 2, s.y + s.h / 2 + 4, COL.lo, 'center', 10);
  }
  if (phase >= 1) {
    txt(ctx, 'ANOMALY SCORE z', s.x, s.y - 8);
    const thrY = s.y + s.h * 0.3;
    line(ctx, [[s.x, thrY], [s.x + s.w, thrY]], 'rgba(228,109,85,0.7)', 1, [2, 4]);
    txt(ctx, 'z = 3', s.x + s.w, thrY - 5, COL.alert, 'right');
    const zp: [number, number][] = [];
    const reveal = phase === 1 ? ease(k) : 1;
    for (let i = 0; i <= N * reveal; i++) {
      const x = i / N;
      const z = 0.12 + 0.04 * Math.sin(x * 60 + t) + Math.pow(Math.max(0, (x - 0.56) / 0.44), 1.5) * 1.05;
      zp.push([s.x + x * s.w, s.y + s.h - Math.min(1, z / 1.05) * s.h]);
    }
    line(ctx, zp, phase === 2 ? COL.sig : COL.bone, 1.4);
    if (phase === 2) callout(ctx, s.x + s.w * 0.93, s.y + s.h * 0.12, 'z = 3.4 · 6 windows', -40, 14, ease(k));
  }
  if (specW) {
    const sx = w - specW - 6;
    const sf = { x: sx, y: f.y, w: specW, h: f.h };
    txt(ctx, 'BAND ENERGY', sx, f.y - 10);
    const bands = 8;
    const bw = sf.w / bands - 5;
    for (let b = 0; b < bands; b++) {
      const normal = 0.6 * Math.exp(-b * 0.42) + 0.08;
      const now = normal + (b >= 5 && b <= 6 ? 0.4 + 0.03 * Math.sin(t * 3 + b) : 0.02 * Math.sin(t * 2 + b));
      const bx = sx + b * (bw + 5);
      const base = sf.y + sf.h;
      ctx.fillStyle = 'rgba(226,234,246,0.12)';
      ctx.fillRect(bx, base - normal * sf.h, bw, normal * sf.h);
      ctx.fillStyle = phase === 2 && b >= 5 && b <= 6 ? COL.sig : 'rgba(226,234,246,0.7)';
      ctx.fillRect(bx + bw * 0.3, base - now * sf.h, bw * 0.4, now * sf.h);
    }
    txt(ctx, 'low → high frequency', sx, sf.y + sf.h + 14, COL.lo);
  }
}

function health(ctx: Ctx, { w, h, phase, k }: DrawArgs) {
  const gaugeW = w > 520 ? 170 : 0;
  const f = area(w - gaugeW, h);
  grid(ctx, f, 6, 4);
  txt(ctx, phase === 0 ? 'DEGRADATION INDICATORS dᵢ (normalised)' : 'HEALTH INDEX HI · G-07 (illustrative composite)', f.x, f.y - 10);
  const days = 90;
  const now = 62;
  const X = (d: number) => f.x + (d / days) * f.w;
  const Y = (v: number) => f.y + f.h - v * f.h;
  const hiAt = (d: number) => 1 - 0.06 * (d / now) - Math.pow(Math.max(0, d - 30) / 60, 1.8) * 0.65;
  if (phase === 0 || (phase === 1 && k < 1)) {
    const a = phase === 0 ? 1 : 1 - ease(k);
    ctx.globalAlpha = a;
    ['vib RMS', 'kurtosis', 'temp rise'].forEach((name, j) => {
      const pts: [number, number][] = [];
      for (let d = 0; d <= now; d++) pts.push([X(d), Y(0.2 + j * 0.06 + (1 - hiAt(d)) * (0.55 - j * 0.12) + noise(d, j + 2) * 0.03)]);
      line(ctx, pts, j === 0 ? COL.bone : j === 1 ? 'rgba(226,234,246,0.55)' : 'rgba(226,234,246,0.35)', 1.1);
      txt(ctx, name, X(now) + 4, pts[pts.length - 1][1] + 3, COL.lo);
    });
    ctx.globalAlpha = 1;
  }
  if (phase >= 1) {
    const a = phase === 1 ? ease(k) : 1;
    ctx.globalAlpha = a;
    const pts: [number, number][] = [];
    for (let d = 0; d <= now; d++) pts.push([X(d), Y(hiAt(d) + noise(d, 9) * 0.02)]);
    line(ctx, pts, COL.hi, 1.6);
    const thr = 0.35;
    line(ctx, [[f.x, Y(thr)], [f.x + f.w, Y(thr)]], COL.alert, 1, [3, 4]);
    txt(ctx, 'intervention threshold HI 35', f.x + f.w, Y(thr) - 6, COL.alert, 'right');
    ctx.globalAlpha = 1;
    if (phase === 2) {
      const r = ease(k);
      const up: [number, number][] = [];
      const lo: [number, number][] = [];
      const mid: [number, number][] = [];
      for (let d = now; d <= now + 28 * r; d++) {
        const v = hiAt(d);
        const spread = (d - now) * 0.006;
        up.push([X(d), Y(v + spread)]);
        lo.push([X(d), Y(v - spread)]);
        mid.push([X(d), Y(v)]);
      }
      band(ctx, up, lo, COL.sigSoft);
      line(ctx, mid, COL.sig, 1.4, [4, 4]);
      const dHit = now + 19;
      if (r > 0.7) callout(ctx, X(dHit), Y(thr), '≈ 19 days (80 %: 13–25)', -10, -40, (r - 0.7) / 0.3);
    }
  }
  txt(ctx, 'days', f.x + f.w, f.y + f.h + 18, COL.lo, 'right');
  txt(ctx, 'today', X(now), f.y + f.h + 18, COL.mid, 'center');
  if (gaugeW) {
    const cx = w - gaugeW / 2 - 4;
    const cy = h * 0.52;
    const R = Math.min(gaugeW * 0.4, h * 0.26);
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(226,234,246,0.1)';
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();
    const val = phase >= 1 ? 0.58 : 0;
    const shown = phase === 1 ? val * ease(k) : val;
    ctx.strokeStyle = shown < 0.6 ? COL.sig : COL.ok;
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * shown));
    ctx.stroke();
    ctx.lineCap = 'butt';
    txt(ctx, phase >= 1 ? (shown * 100).toFixed(0) : '—', cx, cy + 6, COL.hi, 'center', 24, false);
    txt(ctx, 'HI / 100', cx, cy + 26, COL.mid, 'center', 9.5);
    if (phase >= 1) {
      txt(ctx, 'w: vib .40 · kurt .25 · temp .20 · I .15', cx, cy + R + 30, COL.lo, 'center', 9);
    }
  }
}

function toolwear(ctx: Ctx, { w, h, phase, k }: DrawArgs) {
  const f = area(w, h, 52);
  grid(ctx, f, 8, 5);
  txt(ctx, 'FLANK WEAR VB (mm) vs PARTS', f.x, f.y - 10);
  const N = 900;
  const nNow = 610;
  const X = (n: number) => f.x + (n / N) * f.w;
  const Y = (v: number) => f.y + f.h - (v / 0.36) * f.h;
  const vb = (n: number) => 0.06 * Math.pow(n / 60, 0.45) * (n < 60 ? n / 60 : 1) + Math.pow(Math.max(0, n - 480) / 420, 2.2) * 0.17;
  // measured points at tool changes / samples
  const meas = [40, 120, 220, 330, 430, 520, 600];
  // process-derived estimate (raw)
  const est: [number, number][] = [];
  for (let n = 0; n <= nNow; n += 6) est.push([X(n), Y(vb(n) + noise(n, 4) * 0.008)]);
  line(ctx, est, phase === 0 ? COL.bone : 'rgba(226,234,246,0.35)', 1);
  meas.forEach((n) => {
    ctx.fillStyle = COL.hi;
    ctx.beginPath();
    ctx.arc(X(n), Y(vb(n) + noise(n, 5) * 0.006), 3, 0, Math.PI * 2);
    ctx.fill();
  });
  const lim = 0.3;
  line(ctx, [[f.x, Y(lim)], [f.x + f.w, Y(lim)]], COL.alert, 1, [3, 4]);
  txt(ctx, 'VB_max 0.30', f.x + f.w, Y(lim) - 6, COL.alert, 'right');
  if (phase >= 1) {
    const a = phase === 1 ? ease(k) : 1;
    const fit: [number, number][] = [];
    for (let n = 0; n <= nNow * a; n += 4) fit.push([X(n), Y(vb(n))]);
    line(ctx, fit, COL.hi, 1.6);
    ctx.globalAlpha = a;
    txt(ctx, 'break-in', X(30), Y(0.02), COL.lo);
    txt(ctx, 'steady wear', X(220), Y(vb(260)) - 12, COL.lo);
    txt(ctx, 'accelerated', X(500), Y(vb(560)) - 14, COL.lo);
    ctx.globalAlpha = 1;
  }
  if (phase === 2) {
    const r = ease(k);
    const up: [number, number][] = [];
    const lo: [number, number][] = [];
    for (let n = nNow; n <= nNow + 220 * r; n += 4) {
      const s = (n - nNow) * 0.00022;
      up.push([X(n), Y(vb(n) + s)]);
      lo.push([X(n), Y(vb(n) - s)]);
    }
    band(ctx, up, lo, COL.sigSoft);
    const proj: [number, number][] = [];
    for (let n = nNow; n <= nNow + 220 * r; n += 4) proj.push([X(n), Y(vb(n))]);
    line(ctx, proj, COL.sig, 1.4, [4, 4]);
    if (r > 0.6) callout(ctx, X(nNow), Y(vb(nNow)), 'RUL ≈ 140 ± 35 parts', 24, -36, (r - 0.6) / 0.4);
  }
  txt(ctx, 'parts machined', f.x + f.w, f.y + f.h + 18, COL.lo, 'right');
}

function spc(ctx: Ctx, { w, h, phase, k }: DrawArgs) {
  const cpkW = w > 520 ? 150 : 0;
  const f = area(w - cpkW, h, 50);
  grid(ctx, f, 10, 6);
  txt(ctx, 'X̄ CHART · BORE Ø (mm), n = 5', f.x, f.y - 10);
  const N = 60;
  const lo = 24.97;
  const hi = 25.03;
  const X = (i: number) => f.x + (i / (N - 1)) * f.w;
  const Y = (v: number) => f.y + f.h - ((v - lo) / (hi - lo)) * f.h;
  const val = (i: number) => 25.0 + noise(i, 3) * 0.0042 + (i > 38 ? Math.min(1, (i - 38) / 10) * 0.0072 : 0);
  // spec limits
  line(ctx, [[f.x, Y(25.028)], [f.x + f.w, Y(25.028)]], 'rgba(228,109,85,0.75)', 1);
  line(ctx, [[f.x, Y(24.972)], [f.x + f.w, Y(24.972)]], 'rgba(228,109,85,0.75)', 1);
  txt(ctx, 'USL', f.x + f.w, Y(25.028) - 4, COL.alert, 'right', 9.5);
  txt(ctx, 'LSL', f.x + f.w, Y(24.972) + 12, COL.alert, 'right', 9.5);
  if (phase >= 1) {
    ctx.globalAlpha = phase === 1 ? ease(k) : 1;
    line(ctx, [[f.x, Y(25.0)], [f.x + f.w, Y(25.0)]], COL.axis, 1);
    line(ctx, [[f.x, Y(25.009)], [f.x + f.w, Y(25.009)]], COL.mid, 1, [4, 4]);
    line(ctx, [[f.x, Y(24.991)], [f.x + f.w, Y(24.991)]], COL.mid, 1, [4, 4]);
    txt(ctx, 'UCL', f.x + 4, Y(25.009) - 4, COL.mid, 'left', 9.5);
    txt(ctx, 'LCL', f.x + 4, Y(24.991) + 12, COL.mid, 'left', 9.5);
    ctx.globalAlpha = 1;
  }
  const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) pts.push([X(i), Y(val(i))]);
  line(ctx, pts, 'rgba(226,234,246,0.55)', 1);
  pts.forEach(([x, y], i) => {
    const flagged = phase === 2 && i >= 40;
    ctx.fillStyle = flagged ? COL.sig : COL.hi;
    ctx.beginPath();
    ctx.arc(x, y, flagged ? 3 : 2.2, 0, Math.PI * 2);
    ctx.fill();
  });
  if (phase === 2) {
    const a = ease(k);
    ctx.globalAlpha = a * 0.6;
    ctx.fillStyle = COL.sigSoft;
    ctx.fillRect(X(38), f.y, X(N - 1) - X(38), f.h);
    ctx.globalAlpha = 1;
    callout(ctx, X(39), Y(val(39)), 'Rule: 8+ points above x̄', -20, -42, a);
  }
  if (cpkW) {
    const g = { x: w - cpkW + 10, y: f.y, w: cpkW - 20, h: f.h };
    txt(ctx, 'Cpk TREND', g.x, g.y - 10);
    const cpk = (i: number) => 1.67 - (i > 38 ? Math.min(1, (i - 38) / 21) * 0.55 : 0) + noise(i, 7) * 0.02;
    const Yc = (v: number) => g.y + g.h - ((v - 0.8) / 1.0) * g.h;
    ctx.strokeStyle = COL.grid;
    ctx.strokeRect(g.x, g.y, g.w, g.h);
    line(ctx, [[g.x, Yc(1.33)], [g.x + g.w, Yc(1.33)]], COL.mid, 1, [3, 4]);
    txt(ctx, '1.33', g.x + g.w, Yc(1.33) - 4, COL.mid, 'right', 9);
    line(ctx, [[g.x, Yc(1.0)], [g.x + g.w, Yc(1.0)]], COL.alert, 1, [3, 4]);
    txt(ctx, '1.00', g.x + g.w, Yc(1.0) - 4, COL.alert, 'right', 9);
    const cp: [number, number][] = [];
    for (let i = 0; i < N; i++) cp.push([g.x + (i / (N - 1)) * g.w, Yc(cpk(i))]);
    line(ctx, cp, phase === 2 ? COL.sig : COL.bone, 1.5);
    txt(ctx, phase === 2 ? '1.67 → 1.12' : '', g.x, g.y + g.h + 18, COL.sig);
  }
}

function rootcause(ctx: Ctx, { w, h, phase, k }: DrawArgs) {
  const causes: [string, number][] = [
    ['Material batch B-17', 0.41],
    ['Coolant temperature', 0.27],
    ['Tool age', 0.12],
    ['Spindle speed setting', 0.07],
    ['Operator shift', 0.03],
    ['Ambient humidity', 0.02],
  ];
  const labW = Math.min(190, w * 0.38);
  const f = area(w, h, labW + 14, 60, 30, 36);
  txt(ctx, phase === 0 ? 'CANDIDATE FACTORS' : 'CONTRIBUTION TO Δ P(defect)', 14, f.y - 12);
  const rowH = f.h / causes.length;
  causes.forEach(([name, v], i) => {
    const y = f.y + i * rowH + rowH / 2;
    const top = i < 2 && phase === 2;
    txt(ctx, name, labW, y + 4, top ? COL.hi : COL.mid, 'right', 12, false);
    ctx.fillStyle = 'rgba(226,234,246,0.06)';
    ctx.fillRect(f.x, y - 8, f.w, 16);
    if (phase >= 1) {
      const g = phase === 1 ? ease(k - i * 0.08) : 1;
      ctx.fillStyle = top ? COL.sig : 'rgba(226,234,246,0.55)';
      ctx.fillRect(f.x, y - 8, (v / 0.45) * f.w * g, 16);
      txt(ctx, `${Math.round(v * 100 * g)}%`, f.x + (v / 0.45) * f.w * g + 8, y + 4, top ? COL.sig : COL.mid);
    }
  });
  if (phase === 2) {
    const a = ease(k);
    ctx.globalAlpha = a;
    txt(ctx, 'Counterfactual: excluding B-17 restores baseline scrap rate', 14, h - 10, COL.sig, 'left', 10.5);
    ctx.globalAlpha = 1;
  }
}

function oee(ctx: Ctx, { w, h, phase, k }: DrawArgs) {
  const steps: [string, number, 'total' | 'loss' | 'result'][] = [
    ['Planned time', 100, 'total'],
    ['Breakdowns', 7, 'loss'],
    ['Changeovers', 11, 'loss'],
    ['Minor stops', 6, 'loss'],
    ['Reduced speed', 8, 'loss'],
    ['Scrap', 3, 'loss'],
    ['Rework', 1, 'loss'],
    ['OEE', 64, 'result'],
  ];
  const f = area(w, h, 40, 14, 48, 50);
  grid(ctx, f, 0, 5);
  txt(ctx, 'SIX BIG LOSSES · % of planned time', f.x, 18);
  const bw = f.w / steps.length;
  const Y = (v: number) => f.y + f.h - (v / 100) * f.h;
  let level = 100;
  steps.forEach(([name, v, kind], i) => {
    const x = f.x + i * bw + bw * 0.16;
    const ww = bw * 0.68;
    const show = phase === 0 ? kind !== 'loss' : 1;
    const g = phase === 1 && kind === 'loss' ? ease(k * 1.4 - i * 0.12) : 1;
    let top: number;
    let bottom: number;
    if (kind === 'total') {
      top = 100;
      bottom = 0;
    } else if (kind === 'result') {
      top = 64;
      bottom = 0;
    } else {
      top = level;
      bottom = level - v;
      level = bottom;
    }
    if (!show) return;
    const big = phase === 2 && name === 'Changeovers';
    ctx.fillStyle = kind === 'result' ? COL.sig : kind === 'total' ? 'rgba(226,234,246,0.55)' : big ? COL.sig : 'rgba(228,109,85,0.55)';
    const hh = (Y(bottom) - Y(top)) * g;
    ctx.fillRect(x, Y(top), ww, hh);
    txt(ctx, kind === 'loss' ? `−${v}` : `${v}%`, x + ww / 2, Y(top) - 6, big || kind === 'result' ? COL.sig : COL.mid, 'center', 10.5);
    ctx.save();
    ctx.translate(x + ww / 2, f.y + f.h + 12);
    ctx.rotate(w < 520 ? -0.6 : 0);
    txt(ctx, name, 0, 0, big ? COL.hi : COL.lo, w < 520 ? 'right' : 'center', w < 520 ? 9 : 10, false);
    ctx.restore();
  });
  if (phase === 2) txt(ctx, 'A 0.82 × P 0.86 × Q 0.96 ≈ 0.64 · illustrative', f.x + f.w, 18, COL.mid, 'right');
}

function downtime(ctx: Ctx, { w, h, phase, k }: DrawArgs) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const f = area(w, h, 40, 14, 28, 34);
  txt(ctx, 'STOP MINUTES · weekday × hour (8 weeks)', f.x, f.y - 10);
  const cw = f.w / 24;
  const ch = f.h / 7;
  for (let d = 0; d < 7; d++) {
    txt(ctx, days[d], f.x - 6, f.y + d * ch + ch / 2 + 4, COL.lo, 'right', 9.5);
    for (let hr = 0; hr < 24; hr++) {
      const shiftStart = hr === 6 || hr === 14 || hr === 22;
      const cluster = shiftStart && d < 3 ? 0.85 : shiftStart ? 0.35 : 0;
      const weekend = d >= 5 ? 0.3 : 1;
      const v = Math.max(0, (0.18 + noise(d * 24 + hr, 2) * 0.14 + cluster) * weekend);
      const hot = phase >= 1 && cluster > 0.5;
      const a = 0.08 + v * 0.75;
      ctx.fillStyle = hot && phase === 2 ? `rgba(76,141,240,${0.25 + v * 0.7})` : `rgba(226,234,246,${a})`;
      ctx.fillRect(f.x + hr * cw + 1, f.y + d * ch + 1, cw - 2, ch - 2);
    }
  }
  for (let hr = 0; hr < 24; hr += 2) txt(ctx, String(hr).padStart(2, '0'), f.x + hr * cw + cw / 2, f.y + f.h + 14, COL.lo, 'center', 9);
  if (phase >= 1) {
    ctx.globalAlpha = phase === 1 ? ease(k) : 1;
    [6, 14, 22].forEach((hr) => {
      ctx.strokeStyle = COL.sig;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(f.x + hr * cw + 0.5, f.y + 0.5, cw - 1, ch * 3 - 1);
      ctx.setLineDash([]);
    });
    ctx.globalAlpha = 1;
  }
  if (phase === 2) callout(ctx, f.x + 14 * cw + cw / 2, f.y + ch * 1.5, 'z > 2 · first hour, Mon–Wed', 30, ch * 2.6, ease(k));
}

function forecast(ctx: Ctx, { w, h, phase, k }: DrawArgs) {
  const f = area(w, h, 50);
  grid(ctx, f, 7, 4);
  txt(ctx, 'CUMULATIVE OUTPUT · this week (units)', f.x, f.y - 10);
  const H = 120;
  const now = 50;
  const X = (hr: number) => f.x + (hr / H) * f.w;
  const Y = (v: number) => f.y + f.h - (v / 12000) * f.h;
  const rate = (hr: number) => 92 + noise(hr, 6) * 18 - (hr > 30 ? 8 : 0);
  let acc = 0;
  const hist: [number, number][] = [];
  for (let hr = 0; hr <= now; hr++) {
    acc += rate(hr);
    hist.push([X(hr), Y(acc)]);
  }
  line(ctx, [[f.x, Y(10500)], [f.x + f.w, Y(10500)]], COL.mid, 1, [4, 4]);
  txt(ctx, 'weekly target 10 500', f.x + 6, Y(10500) - 6, COL.mid);
  line(ctx, hist, COL.hi, 1.6);
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach((d, i) => txt(ctx, d, X(i * 24 + 12), f.y + f.h + 16, COL.lo, 'center', 9.5));
  if (phase >= 1) {
    const r = phase === 1 ? ease(k) : 1;
    const up: [number, number][] = [];
    const lo: [number, number][] = [];
    const mid: [number, number][] = [];
    let m = acc;
    for (let hr = now; hr <= now + (H - now) * r; hr++) {
      m += 84;
      const s = Math.sqrt(hr - now) * 70;
      up.push([X(hr), Y(m + s)]);
      lo.push([X(hr), Y(m - s)]);
      mid.push([X(hr), Y(m)]);
    }
    band(ctx, up, lo, COL.sigSoft);
    line(ctx, mid, COL.sig, 1.4, [4, 4]);
    if (r === 1) txt(ctx, '80% interval', X(H) - 4, lo[lo.length - 1][1] + 14, COL.sig, 'right', 9.5);
  }
  if (phase === 2) callout(ctx, X(now), Y(acc), 'P(miss target) = 0.68', 30, -50, ease(k));
}

function alarms(ctx: Ctx, { w, h, phase, k }: DrawArgs) {
  const paretoW = w > 520 ? Math.min(210, w * 0.32) : 0;
  const f = area(w - paretoW, h, 40);
  grid(ctx, f, 6, 4);
  txt(ctx, 'ALARMS PER 10 MIN · one shift', f.x, f.y - 10);
  if (phase === 2) callout(ctx, f.x + (11 / 48) * f.w, f.y + f.h * 0.12, 'root event: CMP-01 trip → 37 alarms', 18, 10, ease(k));
  const N = 48;
  const bw = f.w / N;
  const Y = (v: number) => f.y + f.h - (v / 30) * f.h;
  for (let i = 0; i < N; i++) {
    const flood = (i > 9 && i < 13) || (i > 27 && i < 30) || (i > 40 && i < 43);
    const v = Math.max(0.5, 3 + noise(i, 8) * 2.5 + (flood ? 18 + noise(i, 3) * 4 : 0));
    ctx.fillStyle = phase >= 1 && flood ? COL.sig : v > 10 ? 'rgba(226,234,246,0.7)' : 'rgba(226,234,246,0.45)';
    ctx.fillRect(f.x + i * bw + 1, Y(v), bw - 2, f.y + f.h - Y(v));
  }
  if (phase >= 1) {
    ctx.globalAlpha = phase === 1 ? ease(k) : 1;
    line(ctx, [[f.x, Y(10)], [f.x + f.w, Y(10)]], COL.alert, 1, [3, 4]);
    txt(ctx, 'flood > 10', f.x + f.w, Y(10) - 5, COL.alert, 'right', 9.5);
    line(ctx, [[f.x, Y(1)], [f.x + f.w, Y(1)]], COL.ok, 1, [3, 4]);
    txt(ctx, 'manageable ≈ 1', f.x + f.w, Y(1) - 5, COL.ok, 'right', 9.5);
    ctx.globalAlpha = 1;
  }
  if (paretoW) {
    const g = { x: w - paretoW + 12, y: f.y, w: paretoW - 18, h: f.h };
    txt(ctx, 'TOP BAD ACTORS', g.x, g.y - 10);
    const items: [string, number, boolean][] = [
      ['TT-104 HI', 0.19, true],
      ['PT-221 LO', 0.14, true],
      ['LS-310 HH', 0.12, false],
      ['FT-088 DEV', 0.1, true],
      ['ZS-415 FAULT', 0.08, true],
    ];
    const rh = g.h / items.length;
    items.forEach(([name, v, chatter], i) => {
      const y = g.y + i * rh;
      txt(ctx, name, g.x, y + 12, COL.mid, 'left', 9.5);
      const show = phase === 2 ? ease(k) : phase === 1 ? 0.3 : 0;
      ctx.fillStyle = phase === 2 ? COL.sig : 'rgba(226,234,246,0.4)';
      ctx.fillRect(g.x, y + 17, (v / 0.2) * (g.w - 30) * show, 7);
      if (phase === 2 && chatter) txt(ctx, 'chatter', g.x + g.w, y + 12, COL.alert, 'right', 8.5);
    });
  }
}

function guidance(ctx: Ctx, { w, h, phase, k }: DrawArgs) {
  const root = { x: w / 2, y: 40 };
  ctx.font = '12px Geist, sans-serif';
  const boxW = 210;
  ctx.fillStyle = 'rgba(76,141,240,0.14)';
  ctx.strokeStyle = COL.sig;
  ctx.fillRect(root.x - boxW / 2, root.y - 18, boxW, 34);
  ctx.strokeRect(root.x - boxW / 2 + 0.5, root.y - 17.5, boxW - 1, 33);
  txt(ctx, 'Symptom: hydraulic pressure low', root.x, root.y + 4, COL.hi, 'center', 12, false);
  const causes: [string, number, string][] = [
    ['Clogged filter', 0.52, 'Δp across filter'],
    ['Worn pump', 0.27, 'case drain flow'],
    ['Relief valve leak', 0.14, 'valve temperature'],
    ['Low oil level', 0.07, 'sight glass'],
  ];
  const n = causes.length;
  const cw = Math.min(170, (w - 40) / n - 10);
  causes.forEach(([name, p, check], i) => {
    const cx = 20 + (i + 0.5) * ((w - 40) / n);
    const cy = h * 0.46;
    const visible = phase >= 1 ? (phase === 1 ? ease(k * 1.5 - i * 0.15) : 1) : 0.25;
    ctx.globalAlpha = Math.max(0.15, visible);
    ctx.strokeStyle = 'rgba(226,234,246,0.25)';
    ctx.beginPath();
    ctx.moveTo(root.x, root.y + 16);
    ctx.bezierCurveTo(root.x, cy - 40, cx, root.y + 40, cx, cy - 22);
    ctx.stroke();
    const best = phase === 2 && i === 0;
    ctx.fillStyle = best ? 'rgba(76,141,240,0.16)' : 'rgba(226,234,246,0.05)';
    ctx.fillRect(cx - cw / 2, cy - 22, cw, 64);
    ctx.strokeStyle = best ? COL.sig : 'rgba(226,234,246,0.18)';
    ctx.strokeRect(cx - cw / 2 + 0.5, cy - 21.5, cw - 1, 63);
    txt(ctx, name, cx, cy - 4, COL.hi, 'center', w < 520 ? 10 : 12, false);
    if (phase >= 1) {
      txt(ctx, `P = ${p.toFixed(2)}`, cx, cy + 14, best ? COL.sig : COL.mid, 'center', 10.5);
      ctx.fillStyle = 'rgba(226,234,246,0.1)';
      ctx.fillRect(cx - cw / 2 + 10, cy + 24, cw - 20, 4);
      ctx.fillStyle = best ? COL.sig : COL.bone;
      ctx.fillRect(cx - cw / 2 + 10, cy + 24, (cw - 20) * p, 4);
    }
    ctx.globalAlpha = 1;
    if (phase === 2 && i < 2) {
      const a = ease(k * 1.4 - i * 0.3);
      ctx.globalAlpha = a;
      const sy = h * 0.78;
      ctx.fillStyle = COL.sig;
      ctx.beginPath();
      ctx.arc(cx - cw / 2 + 12, sy, 9, 0, Math.PI * 2);
      ctx.fill();
      txt(ctx, String(i + 1), cx - cw / 2 + 12, sy + 4, '#090d16', 'center', 10.5);
      txt(ctx, `Check ${check}`, cx - cw / 2 + 28, sy + 4, COL.hi, 'left', w < 520 ? 9.5 : 11, false);
      ctx.globalAlpha = 1;
    }
  });
  if (phase === 2) txt(ctx, 'Ordered by probability ÷ effort · from asset documentation', w / 2, h - 12, COL.lo, 'center', 9.5);
}

function energy(ctx: Ctx, { w, h, phase, k }: DrawArgs) {
  const f = area(w, h, 46);
  grid(ctx, f, 8, 4);
  txt(ctx, 'ELECTRICAL LOAD · kW (48 h)', f.x, f.y - 10);
  const N = 48 * 4;
  const X = (i: number) => f.x + (i / N) * f.w;
  const Y = (v: number) => f.y + f.h - (v / 260) * f.h;
  const producing = (i: number) => {
    const hr = (i / 4) % 24;
    return hr >= 6 && hr < 22;
  };
  const units = (i: number) => (producing(i) ? 70 + noise(i, 2) * 15 : 0);
  const pred = (i: number) => 22 + units(i) * 2.2;
  const actual = (i: number) => pred(i) + (producing(i) ? noise(i, 5) * 8 : 38 + noise(i, 5) * 4);
  // production bars (context)
  for (let i = 0; i < N; i += 2) {
    if (!producing(i)) continue;
    ctx.fillStyle = 'rgba(226,234,246,0.05)';
    ctx.fillRect(X(i), f.y, X(i + 2) - X(i), f.h);
  }
  txt(ctx, 'production', X(36), f.y + 12, COL.lo, 'center', 9);
  if (phase >= 1) {
    const r = phase === 1 ? ease(k) : 1;
    const p: [number, number][] = [];
    for (let i = 0; i <= N * r; i++) p.push([X(i), Y(pred(i))]);
    line(ctx, p, COL.mid, 1.2, [4, 3]);
    if (r === 1) txt(ctx, 'baseline Ê', X(N) - 4, Y(pred(N - 4)) - 8, COL.mid, 'right', 9.5);
  }
  if (phase === 2) {
    const a = ease(k);
    for (let i = 0; i < N; i++) {
      if (producing(i)) continue;
      ctx.fillStyle = `rgba(76,141,240,${0.35 * a})`;
      ctx.fillRect(X(i), Y(actual(i)), X(i + 1) - X(i) + 0.5, Y(pred(i)) - Y(actual(i)));
    }
  }
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) pts.push([X(i), Y(actual(i))]);
  line(ctx, pts, COL.hi, 1.3);
  ['00', '06', '12', '18', '00', '06', '12', '18'].forEach((s, j) => txt(ctx, s, X(j * 24), f.y + f.h + 16, COL.lo, 'center', 9));
  if (phase === 2) callout(ctx, X(4 * 26), Y(actual(4 * 26)), '+38 kW at zero output', 26, -44, ease(k));
}

export function drawChart(kind: ChartKind, ctx: Ctx, a: DrawArgs) {
  switch (kind) {
    case 'anomaly':
      return anomaly(ctx, a);
    case 'health':
      return health(ctx, a);
    case 'toolwear':
      return toolwear(ctx, a);
    case 'vision':
      return drawVision(ctx, a.w, a.h, a.t, a.phase === 0 ? 0 : a.phase === 1 ? 1 : 2);
    case 'spc':
      return spc(ctx, a);
    case 'rootcause':
      return rootcause(ctx, a);
    case 'bottleneck':
      return drawBottleneck(ctx, a.w, a.h, a.sim, a.phase);
    case 'oee':
      return oee(ctx, a);
    case 'downtime':
      return downtime(ctx, a);
    case 'forecast':
      return forecast(ctx, a);
    case 'alarms':
      return alarms(ctx, a);
    case 'guidance':
      return guidance(ctx, a);
    case 'energy':
      return energy(ctx, a);
  }
}
