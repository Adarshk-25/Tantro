'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { innovationCopy, innovationLayers, type InnovationLayer } from '@/content/innovation';
import { getQualityTier, hasWebGL, type QualityTier } from '@/lib/device';
import { useInView } from '@/lib/hooks/useInView';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { PointCloudProjector } from '@/components/viz/PointCloudProjector';
import { CAPABILITY_ORDER } from '@/lib/particles/capabilityShapes';
import { ChapterTransition } from './ChapterTransition';

const RoboticsScene = dynamic(() => import('./robotics/RoboticsScene'), { ssr: false });

const loop = innovationLayers.filter((l) => l.id !== 'supervision');
const supervision = innovationLayers.find((l) => l.id === 'supervision')!;

export function RoboticsExplorer() {
  const [layer, setLayer] = useState<InnovationLayer['id']>('perception');
  const [mode, setMode] = useState<'pending' | 'webgl' | 'fallback'>('pending');
  const [tier, setTier] = useState<QualityTier>('medium');
  const stageRef = useRef<HTMLDivElement>(null);
  const near = useInView(stageRef, { rootMargin: '400px', once: true });
  const visible = useInView(stageRef);
  const reduced = useReducedMotion();
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const current = innovationLayers.find((l) => l.id === layer)!;

  // Load the 3D scene only as the visitor approaches it.
  useEffect(() => {
    if (!near || mode !== 'pending') return;
    setTier(getQualityTier());
    setMode(hasWebGL() ? 'webgl' : 'fallback');
  }, [near, mode]);

  const order = innovationLayers.map((l) => l.id);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = order.indexOf(layer);
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % order.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + order.length) % order.length;
    if (next >= 0) {
      e.preventDefault();
      setLayer(order[next]);
      tabs.current[order[next]]?.focus();
    }
  };

  const tabProps = (l: InnovationLayer) => ({
    ref: (el: HTMLButtonElement | null) => {
      tabs.current[l.id] = el;
    },
    role: 'tab' as const,
    id: `inno-tab-${l.id}`,
    'aria-selected': layer === l.id,
    'aria-controls': 'inno-panel',
    tabIndex: layer === l.id ? 0 : -1,
    onClick: () => setLayer(l.id),
    onKeyDown: onKey,
  });

  return (
    <ChapterTransition
      id="innovation"
      index={innovationCopy.index}
      eyebrow={innovationCopy.eyebrow}
      labelledBy="innovation-title"
      className="grain overflow-hidden pb-24"
    >
      <div className="grid gap-10 px-[var(--gutter)] pt-20 md:pt-28 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:pt-8">
          <h2 id="innovation-title" data-reveal className="t-display text-[clamp(2.6rem,1.3rem+4.4vw,6rem)]">
            The next frontier is <span className="text-signal">physical.</span>
          </h2>
          <p data-reveal className="t-lede mt-8 max-w-[30rem] text-mid">
            {innovationCopy.body}
          </p>

          <div
            id="inno-panel"
            role="tabpanel"
            aria-labelledby={`inno-tab-${layer}`}
            aria-live="polite"
            className="mt-12 border-t border-hi/12 pt-8"
            key={layer}
          >
            <p className="t-mono text-signal">{current.name}</p>
            <p className="t-display-condensed mt-3 text-[clamp(2rem,1.4rem+2vw,3.2rem)] text-hi">{current.question}</p>
            <p className="mt-4 max-w-[30rem] leading-relaxed text-hi/85">{current.text}</p>
          </div>
          <p className="t-mono mt-10 text-[0.62rem] text-lo">{innovationCopy.note}</p>
        </div>

        <div className="lg:col-span-7">
          <div ref={stageRef} className="relative aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-[6/6.4]" data-reveal>
            {mode === 'webgl' && <RoboticsScene layer={layer} tier={tier} active={visible} reducedMotion={reduced} />}
            {mode === 'fallback' && (
              <PointCloudProjector
                formIndex={CAPABILITY_ORDER.indexOf('arm')}
                ink="217,211,199"
                accent="224,149,74"
                className="absolute inset-0 h-full w-full"
                label="A robotic arm drawn as a point cloud."
              />
            )}
            <span className="t-mono absolute top-0 left-0 text-[0.62rem] text-lo">Concept model · procedural</span>
          </div>

          {/* The loop, with supervision spanning all of it */}
          <div role="tablist" aria-label="Layers of a physical AI system" className="mt-6">
            <button
              {...tabProps(supervision)}
              className={`group relative mb-3 flex w-full items-center gap-3 border-t pt-3 text-left transition-colors ${
                layer === 'supervision' ? 'border-signal text-hi' : 'border-hi/20 text-mid hover:border-hi/50 hover:text-hi'
              }`}
            >
              <span className={`t-mono ${layer === 'supervision' ? 'text-signal' : ''}`}>05</span>
              <span className="font-medium">{supervision.name}</span>
              <span className="t-mono ml-auto hidden text-[0.62rem] text-lo sm:inline">spans every step</span>
            </button>
            <div className="grid grid-cols-2 gap-px bg-hi/10 sm:grid-cols-4">
              {loop.map((l, i) => {
                const on = layer === l.id;
                return (
                  <button
                    key={l.id}
                    {...tabProps(l)}
                    className={`group relative flex items-center gap-3 bg-ink-950 px-3 py-4 text-left transition-colors ${
                      on ? 'text-hi' : 'text-mid hover:text-hi'
                    }`}
                  >
                    <span className={`t-mono ${on ? 'text-signal' : ''}`}>0{i + 1}</span>
                    <span className="font-medium">{l.name}</span>
                    {i < loop.length - 1 && (
                      <span aria-hidden="true" className="t-mono ml-auto hidden text-lo sm:inline">
                        →
                      </span>
                    )}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-signal transition-transform duration-500 ${
                        on ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ChapterTransition>
  );
}
