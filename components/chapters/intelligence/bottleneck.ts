import { C, monoText, type StageIndex } from './palette';

/**
 * A tiny discrete line simulation: five stations, finite buffers.
 * Station 3 has the longest cycle time, so it becomes the constraint.
 */
const CYCLE = [3.6, 3.9, 5.4, 3.4, 3.7]; // illustrative seconds
const CAP = 4;

type State = 'working' | 'starved' | 'blocked';

export type LineSim = {
  timers: number[];
  holding: boolean[];
  buffers: number[]; // buffer i sits after station i (last one is output)
  stats: Record<State, number>[];
  produced: number;
};

export function createLineSim(): LineSim {
  return {
    timers: CYCLE.map(() => 0),
    holding: CYCLE.map((_, i) => i === 0),
    buffers: [2, 2, 0, 0, 0],
    stats: CYCLE.map(() => ({ working: 0, starved: 0, blocked: 0 })),
    produced: 0,
  };
}

export function stepLineSim(s: LineSim, dt: number) {
  for (let i = CYCLE.length - 1; i >= 0; i--) {
    if (!s.holding[i]) {
      // take a part from the upstream buffer (station 0 has infinite supply)
      if (i === 0 || s.buffers[i - 1] > 0) {
        if (i > 0) s.buffers[i - 1]--;
        s.holding[i] = true;
        s.timers[i] = 0;
      } else {
        s.stats[i].starved += dt;
        continue;
      }
    }
    if (s.timers[i] < CYCLE[i]) {
      s.timers[i] += dt;
      s.stats[i].working += dt;
    } else if (i === CYCLE.length - 1 || s.buffers[i] < CAP) {
      if (i === CYCLE.length - 1) s.produced++;
      else s.buffers[i]++;
      s.holding[i] = false;
    } else {
      s.stats[i].blocked += dt;
    }
  }
}

export function drawBottleneck(ctx: CanvasRenderingContext2D, w: number, h: number, sim: LineSim, stage: StageIndex) {
  const pad = Math.max(16, w * 0.04);
  const n = CYCLE.length;
  const gap = (w - pad * 2) / n;
  const bw = Math.min(gap * 0.52, 120);
  const by = h * 0.24;
  const bh = Math.min(h * 0.22, 90);

  monoText(ctx, 'FLOW →', pad, pad + 8, C.mid);

  for (let i = 0; i < n; i++) {
    const cx = pad + gap * i + gap / 2;
    const x = cx - bw / 2;
    const constraint = i === 2 && stage >= 2;
    ctx.strokeStyle = constraint ? C.signal : C.line;
    ctx.lineWidth = constraint ? 1.8 : 1;
    ctx.strokeRect(x, by, bw, bh);
    // progress of the part in the station
    if (sim.holding[i]) {
      const k = Math.min(1, sim.timers[i] / CYCLE[i]);
      ctx.fillStyle = constraint ? C.signalSoft : 'rgba(236,232,224,0.08)';
      ctx.fillRect(x, by + bh * (1 - k), bw, bh * k);
      ctx.fillStyle = constraint ? C.signal : C.bone;
      ctx.fillRect(cx - 5, by + bh / 2 - 5, 10, 10);
    }
    monoText(ctx, `S${i + 1}`, x + 6, by + 16, constraint ? C.signal : C.hi);
    monoText(ctx, `${CYCLE[i].toFixed(1)} s`, x + 6, by + bh - 8, C.mid);

    // buffer after this station
    if (i < n - 1) {
      const bx0 = x + bw + 8;
      const slots = CAP;
      const sw = Math.max(4, (gap - bw - 16) / slots - 3);
      for (let k = 0; k < slots; k++) {
        const filled = k < sim.buffers[i];
        ctx.fillStyle = filled ? (i === 1 && stage >= 2 ? C.alert : C.bone) : 'rgba(236,232,224,0.1)';
        ctx.fillRect(bx0 + k * (sw + 3), by + bh / 2 - 3, sw, 6);
      }
    }

    // state profile: working / starved / blocked share
    if (stage >= 1) {
      const st = sim.stats[i];
      const total = st.working + st.starved + st.blocked || 1;
      const py = by + bh + 34;
      const ph = Math.max(40, h - py - pad - 30);
      const segs: [number, string][] = [
        [st.working / total, constraint ? C.signal : C.bone],
        [st.starved / total, 'rgba(236,232,224,0.18)'],
        [st.blocked / total, C.alert],
      ];
      let acc = 0;
      segs.forEach(([v, col]) => {
        ctx.fillStyle = col;
        ctx.fillRect(cx - 8, py + ph * (1 - acc - v), 16, ph * v);
        acc += v;
      });
      monoText(ctx, `${Math.round((st.working / total) * 100)}%`, cx, py + ph + 16, constraint ? C.signal : C.mid, 'center');
    }
  }

  if (stage >= 1) {
    const ly = h - pad;
    monoText(ctx, '■ WORKING', pad, ly, C.bone);
    monoText(ctx, '■ STARVED', pad + 90, ly, 'rgba(236,232,224,0.4)');
    monoText(ctx, '■ BLOCKED', pad + 180, ly, C.alert);
  }
  monoText(ctx, `OUTPUT ${sim.produced}`, w - pad, pad + 8, C.mid, 'right');
}
