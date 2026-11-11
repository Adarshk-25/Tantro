import { C, monoText, type StageIndex } from './palette';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawVision(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, stage: StageIndex) {
  const pad = Math.max(16, w * 0.04);
  // belt
  ctx.strokeStyle = C.faint;
  for (let x = ((t * 40) % 28) - 28; x < w; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.18);
    ctx.lineTo(x + 18, h * 0.86);
    ctx.stroke();
  }

  // the part: a machined bracket, centred in the camera frame
  const pw = Math.min(w * (w > 520 ? 0.4 : 0.6), h * 0.95);
  const ph = pw * 0.56;
  let px = (w > 520 ? w * 0.42 : w / 2) - pw / 2;
  let py = h * 0.52 - ph / 2;
  if (stage === 3) {
    // diverted: the part slides out of the inspection frame
    const k = (t % 3) / 3;
    px += k * w * 0.3;
    py += k * h * 0.18;
    ctx.globalAlpha = 1 - k * 0.6;
  }
  const grad = ctx.createLinearGradient(px, py, px + pw, py + ph);
  grad.addColorStop(0, '#3a3e42');
  grad.addColorStop(0.5, '#575c61');
  grad.addColorStop(1, '#2e3236');
  roundRect(ctx, px, py, pw, ph, ph * 0.12);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(236,232,224,0.35)';
  ctx.stroke();
  // machining marks
  ctx.strokeStyle = 'rgba(236,232,224,0.05)';
  for (let i = 0; i < 26; i++) {
    ctx.beginPath();
    ctx.arc(px + pw * 0.5, py + ph * 0.5, (pw * 0.6 * (i + 1)) / 26, 0, Math.PI * 2);
    ctx.stroke();
  }
  // holes and slot
  const holes: [number, number][] = [
    [0.16, 0.5],
    [0.84, 0.5],
  ];
  holes.forEach(([hx, hy]) => {
    ctx.beginPath();
    ctx.arc(px + pw * hx, py + ph * hy, ph * 0.13, 0, Math.PI * 2);
    ctx.fillStyle = '#0b0c0d';
    ctx.fill();
    ctx.strokeStyle = 'rgba(236,232,224,0.4)';
    ctx.stroke();
  });
  roundRect(ctx, px + pw * 0.38, py + ph * 0.38, pw * 0.24, ph * 0.24, ph * 0.12);
  ctx.fillStyle = '#0b0c0d';
  ctx.fill();
  ctx.stroke();
  // the defect: a fine scratch near the right hole
  const sx = px + pw * 0.66;
  const sy = py + ph * 0.24;
  ctx.strokeStyle = 'rgba(236,232,224,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.quadraticCurveTo(sx + pw * 0.05, sy + ph * 0.06, sx + pw * 0.09, sy + ph * 0.2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // camera frame corners
  const fx = px + pw / 2 - pw * 0.62;
  const fy = h * 0.52 - ph * 0.85;
  const fw = pw * 1.24;
  const fh = ph * 1.7;
  ctx.strokeStyle = C.bone;
  ctx.lineWidth = 1.2;
  const L = 16;
  [
    [fx, fy, 1, 1],
    [fx + fw, fy, -1, 1],
    [fx, fy + fh, 1, -1],
    [fx + fw, fy + fh, -1, -1],
  ].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * L);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * L, y);
    ctx.stroke();
  });
  monoText(ctx, 'CAM-01 · FRAME 4 812', fx, fy - 10, C.mid);

  if (stage === 0) {
    // acquisition scanline
    const ly = fy + ((t * 0.5) % 1) * fh;
    ctx.fillStyle = 'rgba(224,149,74,0.12)';
    ctx.fillRect(fx, ly - 14, fw, 14);
    ctx.fillStyle = C.signal;
    ctx.fillRect(fx, ly, fw, 1);
  }

  if (stage >= 1 && stage < 3) {
    // alignment grid and region scoring
    const cols = 8;
    const rows = 5;
    const cw = pw / cols;
    const rh = ph / rows;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const hot = i === 5 && (j === 1 || j === 2);
        const reveal = stage === 1 ? Math.min(1, Math.max(0, (t * 1.5) % 4 - (i + j) * 0.12)) : 1;
        ctx.strokeStyle = `rgba(236,232,224,${0.1 * reveal})`;
        ctx.strokeRect(px + i * cw, py + j * rh, cw, rh);
        if (hot && reveal > 0.5) {
          ctx.fillStyle = `rgba(224,149,74,${stage === 1 ? 0.18 : 0.08})`;
          ctx.fillRect(px + i * cw, py + j * rh, cw, rh);
        }
      }
    }
  }

  if (stage >= 2 && stage < 3) {
    const bx = sx - 10;
    const by = sy - 10;
    const bw = pw * 0.09 + 20;
    const bh = ph * 0.2 + 20;
    ctx.strokeStyle = C.signal;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = C.signal;
    ctx.fillRect(bx, by - 18, 128, 18);
    monoText(ctx, 'SCRATCH · 0.93', bx + 6, by - 5, '#0b0c0d');
  }

  if (stage >= 2 && w > 520) {
    // class probabilities from the classifier head
    const bx = w - pad - 150;
    const by = h * 0.3;
    monoText(ctx, 'p(class | image)', bx, by - 12, C.mid);
    ([['scratch', 0.93], ['dent', 0.04], ['ok', 0.03]] as [string, number][]).forEach(([name, p], i) => {
      const y = by + i * 30;
      monoText(ctx, name, bx, y + 10, i === 0 ? C.hi : C.mid);
      monoText(ctx, p.toFixed(2), bx + 150, y + 10, i === 0 ? C.signal : C.mid, 'right');
      ctx.fillStyle = 'rgba(236,232,224,0.1)';
      ctx.fillRect(bx, y + 15, 150, 4);
      ctx.fillStyle = i === 0 ? C.signal : 'rgba(236,232,224,0.6)';
      ctx.fillRect(bx, y + 15, 150 * p, 4);
    });
    monoText(ctx, 'τ = 0.80 → REJECT', bx, by + 104, C.signal);
  }
  if (stage === 3) {
    monoText(ctx, 'DIVERTED → REVIEW LANE', w - pad, h - pad, C.signal, 'right');
  }
  monoText(ctx, stage === 0 ? 'ACQUIRE' : stage === 1 ? 'ALIGN · SCORE REGIONS' : stage === 2 ? 'LOCATE' : 'ROUTE', pad, h - pad, C.mid);
}
