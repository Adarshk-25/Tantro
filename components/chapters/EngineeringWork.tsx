'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { statusLabels, workCategories, workCopy, workItems, type WorkStatus } from '@/content/work';
import { ChapterTransition } from './ChapterTransition';
import { WorkFigure } from './WorkFigure';

type Filter = 'all' | WorkStatus;
const filters: Filter[] = ['all', 'case-study', 'demonstration', 'concept', 'research'];
const isFilter = (v: string | null): v is Filter => !!v && (filters as string[]).includes(v);

const statusStyle: Record<WorkStatus, string> = {
  'case-study': 'bg-signal-deep text-white',
  demonstration: 'bg-onlight text-bone-50',
  concept: 'border border-onlight/40 text-onlight',
  research: 'border border-dashed border-onlight/50 text-onlight',
};

function Badge({ status }: { status: WorkStatus }) {
  return (
    <span className={`t-label inline-flex shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] whitespace-nowrap ${statusStyle[status]}`}>{statusLabels[status]}</span>
  );
}

export function EngineeringWork() {
  const [filter, setFilter] = useState<Filter>('all');
  const [cat, setCat] = useState<string>('all');

  // Restore the filter from the URL (back/forward, returning from a project).
  useEffect(() => {
    const read = () => {
      const q = new URLSearchParams(window.location.search);
      const v = q.get('work');
      setFilter(isFilter(v) ? v : 'all');
      const c = q.get('cat');
      setCat(c && (workCategories as readonly string[]).includes(c) ? c : 'all');
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);

  const sync = (f: Filter, c: string) => {
    const url = new URL(window.location.href);
    if (f === 'all') url.searchParams.delete('work');
    else url.searchParams.set('work', f);
    if (c === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', c);
    url.hash = 'work';
    window.history.replaceState(window.history.state, '', url);
  };
  const choose = (f: Filter) => {
    setFilter(f);
    sync(f, cat);
  };
  const chooseCat = (c: string) => {
    setCat(c);
    sync(filter, c);
  };

  const inCat = (w: (typeof workItems)[number]) => cat === 'all' || w.category === cat;
  const items = workItems.filter((w) => (filter === 'all' || w.status === filter) && inCat(w));
  const count = (f: Filter) => workItems.filter((w) => (f === 'all' || w.status === f) && inCat(w)).length;
  const query = new URLSearchParams({ ...(filter !== 'all' ? { from: filter } : {}), ...(cat !== 'all' ? { cat } : {}) }).toString();

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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" data-reveal>
        <div role="group" aria-label="Filter by status" className="no-scrollbar -mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] md:mx-0 md:px-0">
          <div className="inline-flex gap-1 rounded-full border border-onlight/10 bg-white/50 p-1">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => choose(f)}
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
          <label className="flex items-center gap-2 text-[0.84rem] text-onlight-mid">
            <span className="t-label">Category</span>
            <select
              value={cat}
              onChange={(e) => chooseCat(e.target.value)}
              className="rounded-full border border-onlight/15 bg-white/60 px-3 py-1.5 text-onlight"
            >
              <option value="all">All categories</option>
              {workCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        {(filter === 'all' || filter === 'case-study') && (
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-onlight/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Badge status="case-study" />
              <p className="t-small text-onlight-mid">{workCopy.emptyCaseStudies}</p>
            </div>
            <p className="t-label shrink-0 text-onlight-mid">0 published</p>
          </div>
        )}

        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
          {items.map((w) => (
            <li key={w.id}>
              <Link
                href={`/work/${w.slug}${query ? `?${query}` : ''}`}
                className="panel-stone group flex h-full w-full flex-col overflow-hidden text-left transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(15_23_38/0.45)]"
              >
                <div className="relative border-b border-onlight/8 bg-[#e6edf8] px-8 pt-8 pb-3">
                  <WorkFigure figure={w.figure} />
                  <span className="absolute top-3 right-3">
                    <Badge status={w.status} />
                  </span>
                  <span className="t-label absolute bottom-2 left-4 text-onlight-mid opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Live preview inside
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="t-label text-onlight-mid">{w.category}</p>
                  <p className="t-h3 mt-2 text-onlight">{w.title}</p>
                  <p className="t-small mt-3 line-clamp-3 text-onlight-mid">{w.problem}</p>
                  <span className="mt-auto flex items-center gap-2 pt-5 text-[0.88rem] font-medium text-signal-deep">
                    Open project
                    <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {items.length === 0 && filter !== 'case-study' && <p className="text-onlight-mid">Nothing in this category yet.</p>}
      </div>
    </ChapterTransition>
  );
}
