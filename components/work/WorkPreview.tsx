'use client';

import { useEffect, useState } from 'react';
import { scenarios } from '@/content/network';
import type { WorkItem } from '@/content/work';
import { ArchitectureDiagram } from '@/components/viz/ArchitectureDiagram';
import { ChartPreview } from '@/components/viz/ChartPreview';
import { WorkFigure } from '@/components/chapters/WorkFigure';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ControlEngineeringExplorer } from '@/components/chapters/automation/ControlEngineeringExplorer';
import { SecurityExplorer } from '@/components/chapters/security/SecurityExplorer';

/** The interactive preview shown on a work detail page. */
export function WorkPreview({ item }: { item: WorkItem }) {
  const [vertical, setVertical] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const upd = () => setVertical(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);

  if (item.preview === 'control') return <ControlEngineeringExplorer />;
  if (item.preview === 'security') return <SecurityExplorer />;
  if (item.preview === 'architecture' || item.preview === 'uns' || item.preview === 'mes-erp') {
    const sc = scenarios.find((s) => s.id === (item.preview === 'uns' ? 'uns' : item.preview === 'mes-erp' ? 'mes-erp' : 'brownfield'))!;
    return (
      <figure>
        <ArchitectureDiagram scenario={sc} vertical={vertical} animate={!reduced} focusLink={null} />
        <figcaption className="t-label mt-3 text-lo">Interactive architecture · hover or tap a node to trace its data paths</figcaption>
      </figure>
    );
  }
  if (item.preview === 'vision' || item.preview === 'health' || item.preview === 'alarms') {
    return (
      <figure>
        <ChartPreview
          kind={item.preview}
          className="aspect-[16/9]"
          label={
            item.preview === 'vision'
              ? 'Simulated inspection: capture, region scoring and defect localisation'
              : item.preview === 'alarms'
                ? 'Illustrative alarm-rate analysis with flood detection and bad actors'
                : 'Illustrative health index with degradation projection'
          }
        />
        <figcaption className="t-label mt-3 text-lo">Simulated demonstration on synthetic data · cycles raw data → model → insight</figcaption>
      </figure>
    );
  }
  return (
    <figure className="work-figure-live">
      <WorkFigure figure={item.figure} />
      <figcaption className="t-label mt-3 text-lo">
        Technical illustration of the simulated task. Interactive simulation media is not published yet.
      </figcaption>
    </figure>
  );
}
