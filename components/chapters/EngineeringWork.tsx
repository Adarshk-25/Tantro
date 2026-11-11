'use client';

import { useState } from 'react';
import { statusLabels, workCopy, workItems, type WorkStatus } from '@/content/work';
import { ChapterTransition } from './ChapterTransition';
import { WorkFigure } from './WorkFigure';

const filters: ('all' | WorkStatus)[] = ['all', 'case-study', 'demonstration', 'concept', 'research'];

const statusMark: Record<WorkStatus, string> = {
  'case-study': 'bg-signal-deep',
  demonstration: 'bg-onlight',
  concept: 'border border-onlight bg-transparent',
  research: 'border border-dashed border-onlight bg-transparent',
};

export function EngineeringWork() {
  const [filter, setFilter] = useState<'all' | WorkStatus>('all');
  const [open, setOpen] = useState<string | null>(workItems[0].id);
  const items = workItems.filter((w) => filter === 'all' || w.status === filter);
  const count = (f: 'all' | WorkStatus) => (f === 'all' ? workItems.length : workItems.filter((w) => w.status === f).length);
  const showCaseSlot = filter === 'all' || filter === 'case-study';

  return (
    <ChapterTransition
      id="work"
      index={workCopy.index}
      eyebrow={workCopy.eyebrow}
      surface="bone"
      labelledBy="work-title"
      className="pb-28"
    >
      <div className="px-[var(--gutter)] pt-20 md:pt-28">
        <h2 id="work-title" data-reveal className="t-display max-w-[16ch] text-[clamp(2.6rem,1.3rem+4.8vw,6.6rem)]">
          Ideas become valuable when they <em className="text-signal-deep not-italic">work.</em>
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-12" data-reveal>
          <p className="t-lede text-onlight-mid md:col-span-6">{workCopy.body}</p>
        </div>
      </div>

      <div className="mt-14 px-[var(--gutter)]" data-reveal>
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-x-6 gap-y-3 border-b border-onlight/15 pb-4">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`t-mono link-signal py-1 transition-colors ${filter === f ? 'text-onlight' : 'text-onlight-mid hover:text-onlight'}`}
              aria-current={filter === f ? 'true' : undefined}
            >
              {f === 'all' ? 'All work' : statusLabels[f]} <span className="text-onlight-mid">({count(f)})</span>
            </button>
          ))}
        </div>

        <ul>
          {showCaseSlot && (
            <li className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-onlight/15 py-6 md:grid-cols-[4rem_14rem_1fr_auto]">
              <span className="t-mono text-onlight-mid">—</span>
              <span className="t-mono hidden text-onlight-mid md:block">Client work</span>
              <p className="col-start-2 text-onlight-mid md:col-start-auto">{workCopy.emptyCaseStudies}</p>
              <span className="t-mono col-start-2 flex items-center gap-2 text-[0.62rem] text-onlight-mid md:col-start-auto">
                <span className={`h-2.5 w-2.5 rounded-full ${statusMark['case-study']}`} aria-hidden="true" />
                {statusLabels['case-study']}
              </span>
            </li>
          )}
          {items.map((w, i) => {
            const isOpen = open === w.id;
            return (
              <li key={w.id} className="border-b border-onlight/15">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${w.id}-detail`}
                    onClick={() => setOpen(isOpen ? null : w.id)}
                    className="group grid w-full grid-cols-[2.5rem_1fr] items-baseline gap-4 py-6 text-left md:grid-cols-[4rem_14rem_1fr_auto]"
                  >
                    <span className="t-mono text-onlight-mid">{String(i + 1).padStart(2, '0')}</span>
                    <span className="t-mono hidden text-onlight-mid md:block">{w.category}</span>
                    <span className="t-display-condensed col-start-2 text-[clamp(1.5rem,1.1rem+1.4vw,2.5rem)] leading-tight transition-colors group-hover:text-signal-deep md:col-start-auto">
                      {w.title}
                    </span>
                    <span className="t-mono col-start-2 flex items-center gap-2 text-[0.62rem] text-onlight-mid md:col-start-auto">
                      <span className={`h-2.5 w-2.5 rounded-full ${statusMark[w.status]}`} aria-hidden="true" />
                      {statusLabels[w.status]}
                      <span
                        aria-hidden="true"
                        className={`ml-3 inline-block transition-transform duration-500 ${isOpen ? 'rotate-45' : ''}`}
                      >
                        +
                      </span>
                    </span>
                  </button>
                </h3>
                <div
                  id={`${w.id}-detail`}
                  className={`grid transition-[grid-template-rows] duration-700 ease-[var(--ease-precise)] ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                  inert={!isOpen}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-8 pb-10 md:grid-cols-[4rem_14rem_1fr] md:gap-4">
                      <div className="md:col-span-2 md:pr-6">
                        <div className="border border-onlight/15 bg-bone-100 p-4">
                          <WorkFigure figure={w.figure} />
                        </div>
                      </div>
                      <div className="grid gap-6 lg:grid-cols-2">
                        <p className="text-[1.05rem] leading-relaxed">{w.summary}</p>
                        <div>
                          <p className="t-mono text-onlight-mid">Approach</p>
                          <ul className="mt-3 space-y-2">
                            {w.approach.map((a) => (
                              <li key={a} className="flex gap-3 leading-snug">
                                <span className="mt-2 h-px w-3 shrink-0 bg-signal-deep" aria-hidden="true" />
                                {a}
                              </li>
                            ))}
                          </ul>
                          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1" aria-label="Technologies">
                            {w.stack.map((s) => (
                              <li key={s} className="tag-bracket text-onlight-mid">
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {items.length === 0 && filter !== 'case-study' && <p className="py-8 text-onlight-mid">Nothing in this category yet.</p>}
      </div>
    </ChapterTransition>
  );
}
