'use client';

import { useRef, useState } from 'react';
import { statusLabels, workCopy, workItems, type WorkItem, type WorkStatus } from '@/content/work';
import { ChapterTransition } from './ChapterTransition';
import { WorkFigure } from './WorkFigure';

const filters: ('all' | WorkStatus)[] = ['all', 'case-study', 'demonstration', 'concept', 'research'];

const statusStyle: Record<WorkStatus, string> = {
  'case-study': 'bg-signal-deep text-bone-50',
  demonstration: 'bg-onlight text-bone-50',
  concept: 'border border-onlight/40 text-onlight',
  research: 'border border-dashed border-onlight/50 text-onlight',
};

const statusMeaning: Record<WorkStatus, string> = {
  'case-study': 'Completed client work, published with written approval.',
  demonstration: 'Built by Tantro and running on synthetic or public data.',
  concept: 'A designed architecture or approach, not yet implemented.',
  research: 'Exploratory work and experiments.',
};

function Badge({ status }: { status: WorkStatus }) {
  return <span className={`t-label inline-flex shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] whitespace-nowrap ${statusStyle[status]}`}>{statusLabels[status]}</span>;
}

export function EngineeringWork() {
  const [filter, setFilter] = useState<'all' | WorkStatus>('all');
  const [open, setOpen] = useState<WorkItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const items = workItems.filter((w) => filter === 'all' || w.status === filter);
  const count = (f: 'all' | WorkStatus) => (f === 'all' ? workItems.length : workItems.filter((w) => w.status === f).length);

  const show = (w: WorkItem) => {
    setOpen(w);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  };

  return (
    <ChapterTransition
      id="work"
      index={workCopy.index}
      eyebrow={workCopy.eyebrow}
      surface="stone"
      labelledBy="work-title"
      title={
        <>
          Ideas become valuable when they <span className="text-signal-deep">work.</span>
        </>
      }
      lede={workCopy.body}
    >
      <div className="flex flex-1 flex-col gap-6">
        <div role="group" aria-label="Filter by status" className="no-scrollbar -mx-[var(--gutter)] flex gap-1 overflow-x-auto px-[var(--gutter)] md:mx-0 md:px-0" data-reveal>
          <div className="flex gap-1 rounded-full border border-onlight/10 bg-white/40 p-1">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-[0.84rem] whitespace-nowrap transition-colors ${
                  filter === f ? 'bg-onlight text-bone-50' : 'text-onlight-mid hover:text-onlight'
                }`}
              >
                {f === 'all' ? 'All work' : statusLabels[f]}
                <span className={`t-mono-plain ml-1.5 text-[0.68rem] ${filter === f ? 'text-bone-50/70' : 'text-onlight-mid/70'}`}>{count(f)}</span>
              </button>
            ))}
          </div>
        </div>

        {(filter === 'all' || filter === 'case-study') && (
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-onlight/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" data-reveal>
            <div className="flex items-center gap-3">
              <Badge status="case-study" />
              <p className="t-small text-onlight-mid">{workCopy.emptyCaseStudies}</p>
            </div>
            <p className="t-label shrink-0 text-onlight-mid">0 published</p>
          </div>
        )}
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((w) => (
            <li key={w.id} data-reveal>
              <button
                type="button"
                onClick={() => show(w)}
                aria-haspopup="dialog"
                className="panel-stone group flex h-full w-full flex-col overflow-hidden text-left transition-transform duration-500 hover:-translate-y-1"
              >
                <div className="relative border-b border-onlight/8 bg-[#ece6dc] px-8 pt-8 pb-3">
                  <WorkFigure figure={w.figure} />
                  <span className="absolute top-3 right-3">
                    <Badge status={w.status} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="t-label text-onlight-mid">{w.category}</p>
                  <p className="t-h3 mt-2 text-onlight">{w.title}</p>
                  <p className="t-small mt-3 line-clamp-3 text-onlight-mid">{w.summary}</p>
                  <span className="mt-auto flex items-center gap-2 pt-5 text-[0.88rem] font-medium text-signal-deep">
                    Open details
                    <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
        {items.length === 0 && filter !== 'case-study' && <p className="text-onlight-mid">Nothing in this category yet.</p>}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        aria-labelledby="work-dialog-title"
        className="m-auto w-[min(60rem,calc(100vw-2rem))] rounded-2xl bg-stone p-0 text-onlight shadow-2xl backdrop:bg-ink-950/70 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="grid md:grid-cols-2">
            <div className="border-b border-onlight/10 bg-[#ece6dc] p-6 md:border-r md:border-b-0 md:p-8">
              <WorkFigure figure={open.figure} />
              <p className="t-label mt-4 text-onlight-mid">Original technical illustration</p>
            </div>
            <div className="max-h-[80svh] overflow-y-auto p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <Badge status={open.status} />
                <button type="button" onClick={() => dialogRef.current?.close()} className="t-label -mt-1 rounded-full px-2 py-1 text-onlight-mid hover:text-onlight" autoFocus>
                  Close ✕
                </button>
              </div>
              <p className="t-label mt-4 text-onlight-mid">{open.category}</p>
              <h3 id="work-dialog-title" className="t-h3 mt-2">
                {open.title}
              </h3>
              <p className="t-body mt-4 text-onlight/85">{open.summary}</p>
              <p className="t-label mt-6 text-onlight-mid">Approach</p>
              <ul className="mt-2 grid gap-2">
                {open.approach.map((a) => (
                  <li key={a} className="t-small flex gap-3">
                    <span className="mt-[0.6rem] h-px w-3 shrink-0 bg-signal-deep" aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
                {open.stack.map((s) => (
                  <li key={s} className="t-mono-plain rounded-full border border-onlight/15 px-2.5 py-1 text-[0.7rem] text-onlight-mid">
                    {s}
                  </li>
                ))}
              </ul>
              <p className="t-small mt-6 border-t border-onlight/10 pt-4 text-onlight-mid">
                <strong className="font-medium text-onlight">{statusLabels[open.status]}:</strong> {statusMeaning[open.status]}
              </p>
            </div>
          </div>
        )}
      </dialog>
    </ChapterTransition>
  );
}
