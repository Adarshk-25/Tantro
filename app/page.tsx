"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const DURATION = 18;
const chapters = [
  { name: "Connect", detail: "OT data", line: "Every signal. One understanding." },
  { name: "See", detail: "Vision AI", line: "See what would otherwise go unseen." },
  { name: "Act", detail: "Intelligent automation", line: "Intelligence becomes action." },
];
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clockRef = useRef(0);
  const playingRef = useRef(false);
  const hoverRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: -1000, y: -1000 });
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const phase = Math.min(2, Math.floor(time / 6));
  const shownPhase = hover ?? phase;
  const ended = time >= DURATION;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 1200, height = 340, frame = 0, last = 0, lastReport = 0;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas); resize();

    const draw = (now: number) => {
      const delta = last ? Math.min((now - last) / 1000, .06) : 0;
      last = now;
      if (playingRef.current && !document.hidden) {
        clockRef.current = Math.min(DURATION, clockRef.current + delta);
        if (clockRef.current >= DURATION) { playingRef.current = false; setPlaying(false); }
      }
      if (now - lastReport > 80) { setTime(clockRef.current); lastReport = now; }
      const t = hoverRef.current === null ? clockRef.current : hoverRef.current * 6 + 3;
      const stage = Math.min(2, Math.floor(t / 6));
      const u = t >= DURATION ? 1 : (t % 6) / 6;
      const motionTime = reduced ? Math.floor(t / 6) * 6 + 3 : t;
      const sx = width / 1200, sy = height / 340;
      ctx.setTransform(canvas.width / 1200, 0, 0, canvas.height / 340, 0, 0);
      ctx.clearRect(0, 0, 1200, 340);
      const px = pointerRef.current.x / sx, py = pointerRef.current.y / sy;
      const mint = "174,228,214", silver = "199,209,211", amber = "245,172,110";
      const dot = (x: number, y: number, r: number, alpha: number, color = mint) => {
        const distance = Math.hypot(x - px, y - py);
        const proximity = clamp(1 - distance / 110);
        const offset = reduced ? 0 : proximity * 5;
        ctx.beginPath();
        ctx.arc(x + (x - px) / Math.max(distance, 1) * offset, y + (y - py) / Math.max(distance, 1) * offset, r + proximity * .8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${clamp(alpha + proximity * .6)})`;
        ctx.fill();
      };
      const line = (points: number[][], color: string, alpha: number, stroke = 1) => {
        ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
        ctx.strokeStyle = `rgba(${color},${alpha})`; ctx.lineWidth = stroke; ctx.stroke();
      };
      // Six independent machine signals converge into one contextual data stream.
      for (let lane = 0; lane < 6; lane++) {
        const points: number[][] = [];
        for (let j = 0; j <= 130; j++) {
          const f = j / 130, x = 30 + f * 482;
          const spread = Math.pow(1-f, 1.25);
          const y = 164 + (lane - 2.5) * 41 * spread + Math.sin(f * 18 + lane * 1.8 - motionTime * 1.5) * 17 * spread;
          points.push([x,y]);
          const packet = (j + lane * 17 - motionTime * 22) % 37;
          const pulse = Math.pow(Math.max(0, Math.cos(packet / 37 * Math.PI * 2)), 14);
          const fade = Math.sin(f * Math.PI) * .7 + .15;
          dot(x, y, .75 + pulse * .9, fade * (stage === 0 ? .2 + pulse * .8 : .12 + pulse * .28), stage === 0 ? mint : silver);
        }
        line(points, silver, stage === 0 ? .12 : .055);
      }
      // The inspection field is a schematic of sampled visual features, not live factory data.
      const gridLeft = 532, gridTop = 96, step = 9.5;
      const scanX = gridLeft - 12 + u * 176;
      for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
          const x = gridLeft + col * step, y = gridTop + row * step;
          const isFault = (col === 10 || col === 11) && (row === 6 || row === 7);
          const revealed = stage > 1 || (stage === 1 && x < scanX);
          const radial = clamp(1 - Math.hypot(col - 7, row - 7) / 11);
          const pulse = stage === 0 ? .05 * Math.sin(motionTime * 3 - Math.hypot(col-7,row-7)) : 0;
          dot(x, y, isFault && revealed ? 2.3 : 1.15, .2 + radial * .22 + (revealed ? .4 : pulse), isFault && revealed ? amber : mint);
        }
      }
      const bracketAlpha = stage === 1 ? .8 : .2;
      const bx = 518, by = 82, bw = 162, bh = 162;
      [[bx,by,1,1],[bx+bw,by,-1,1],[bx,by+bh,1,-1],[bx+bw,by+bh,-1,-1]].forEach(([x,y,a,b]) => line([[x+a*14,y],[x,y],[x,y+b*14]], mint, bracketAlpha));
      if (stage === 1) {
        const glow = ctx.createLinearGradient(scanX-35,0,scanX,0);
        glow.addColorStop(0,"rgba(174,228,214,0)"); glow.addColorStop(1,"rgba(174,228,214,.1)");
        ctx.fillStyle=glow; ctx.fillRect(Math.max(gridLeft-12,scanX-35),by,Math.min(35,scanX-gridLeft+12),bh);
        line([[scanX,by],[scanX,by+bh]],mint,.8);
        if (u > .68) {
          ctx.strokeStyle="rgba(245,172,110,.8)"; ctx.lineWidth=1;
          ctx.strokeRect(gridLeft+10*step-7,gridTop+6*step-7,24,24);
        }
      }
      // Verified signals continue; the detected anomaly is routed to an exception path.
      for (let lane = 0; lane < 5; lane++) {
        const points: number[][]=[];
        for (let j = 0; j <= 114; j++) {
          const f=j/114, x=688+f*480;
          const eased=f*f*(3-2*f);
          const y=164+(lane-2)*31*eased;
          points.push([x,y]);
          const pulse=Math.pow(Math.max(0,Math.cos((f*5-motionTime*.85+lane*.15)*Math.PI*2)),16);
          dot(x,y,.7+pulse, (1-f*.7)*(stage===2 ? .24+pulse*.75 : .055+pulse*.09));
        }
        line(points,mint,stage===2?.2:.04);
      }
      const route: number[][]=[[670,181],[722,181],[790,279],[981,279]];
      line(route,amber,stage===2?.35:.045);
      if(stage===2) {
        const travel=clamp(u*1.7), lengths=[52,119,191], total=362;
        let remaining=travel*total, x=670,y=181;
        for(let k=0;k<3;k++) {
          const portion=clamp(remaining/lengths[k]);
          x=route[k][0]+(route[k+1][0]-route[k][0])*portion;
          y=route[k][1]+(route[k+1][1]-route[k][1])*portion;
          if(remaining<=lengths[k]) break;
          remaining-=lengths[k];
        }
        dot(x,y,3,.95,amber);
        ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.strokeStyle="rgba(245,172,110,.18)";ctx.stroke();
        if(u>.6) { line([[989,274],[994,279],[989,284]],amber,.7); }
      }
      // Measurement marks keep the composition anchored in an engineering language.
      for(let i=0;i<43;i++) {
        const x=34+i*27;
        line([[x,317],[x,317+(i%5===0?5:2)]],silver,.14);
      }
      frame=requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();};
  },[reduced]);

  const preview = (index: number | null) => { hoverRef.current=index; setHover(index); };
  const seek = (index: number) => {
    clockRef.current=index*6;setTime(index*6);
    playingRef.current=true;setPlaying(true);preview(null);
  };
  const toggle = () => {
    preview(null);
    if(clockRef.current>=DURATION){clockRef.current=0;setTime(0);}
    playingRef.current=!playingRef.current;setPlaying(playingRef.current);
  };

  return (
    <main className={`experience ${playing ? "is-playing" : "is-paused"}`}>
      <header className="masthead"><a href="/" className="wordmark" aria-label="Tantro home">tantro<span>.</span></a><span className="edition">A new industrial perspective</span></header>
      <section className="invitation" aria-labelledby="title">
        <p className="eyebrow">In the making</p>
        <h1 id="title">Something intelligent<br /><span>is taking shape.</span></h1>
      </section>
      <section className="study" aria-label="Interactive Tantro capability study">
        <div className="signal-field" onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();pointerRef.current={x:e.clientX-r.left,y:e.clientY-r.top};}} onPointerLeave={()=>{pointerRef.current={x:-1000,y:-1000};}}>
          <canvas ref={canvasRef} role="img" aria-label="A conceptual signal flow: machine data connects, vision AI detects an anomaly, and automation routes it for action." />
          <span className="field-note">{shownPhase===0?"Independent signals → connected context":shownPhase===1?"Visual features → anomaly detected":"Verified flow → exception routed"}</span>
        </div>
        <div className="chapters" aria-label="Explore the capability sequence">
          {chapters.map((chapter,index)=><Button key={chapter.name} variant="ghost" className={`chapter ${shownPhase===index?"active":""}`} onPointerEnter={()=>preview(index)} onPointerLeave={()=>preview(null)} onFocus={()=>preview(index)} onBlur={()=>preview(null)} onClick={()=>seek(index)} aria-label={`Play ${chapter.name}: ${chapter.detail}`} aria-pressed={phase===index}>
            <span className="chapter-rule"><span style={{transform:`scaleX(${clamp((time-index*6)/6)})`}} /></span>
            <span className="chapter-text"><span className="chapter-index">0{index+1}</span><span className="chapter-title">{chapter.name}<span className="chapter-detail">{chapter.detail}</span></span><span className="chapter-mark" aria-hidden="true">+</span></span>
          </Button>)}
        </div>
        <div className="play-area"><Button variant="ghost" className="play-button" onClick={toggle} aria-label={playing?"Pause capability animation":ended?"Replay capability animation":"Play capability animation"}><span className="play-disc">{playing?<Pause size={17} fill="currentColor"/>:ended?<RotateCcw size={18}/>:<Play size={17} fill="currentColor"/>}</span><span>{playing?"Pause the moment":ended?"Experience it again":"Play the possibility"}</span></Button><p className="moment-copy" aria-live="polite">{playing||time>0||hover!==null?chapters[shownPhase].line:"A glimpse of what comes next."}</p></div>
      </section>
      <footer className="colophon"><span>Industrial intelligence. Reimagined.</span><span className="soon">Coming soon<span className="soon-line" /></span></footer>
    </main>
  );
}

