'use client';

import { chapters } from '@/content/site';
import { useActiveChapter, useSurfaceUnderNav } from './useActiveChapter';

/** Vertical chapter index on the right edge (desktop). Orientation without clutter. */
export function ChapterRail() {
  const active = useActiveChapter();
  const surface = useSurfaceUnderNav();
  const activeIdx = chapters.findIndex((c) => c.id === active);
  const onBone = surface === 'bone';

  return (
    <nav
      aria-label="Chapters"
      className={`fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 xl:block ${
        onBone ? 'text-onlight' : 'text-hi'
      }`}
    >
      <ol className="flex flex-col items-end gap-3.5">
        {chapters.map((c, i) => {
          const isActive = i === activeIdx;
          return (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-label={`${c.index} ${c.label}`}
                aria-current={isActive ? 'step' : undefined}
                className="group relative flex items-center gap-2 py-0.5"
              >
                <span className="t-mono text-[0.62rem]">
                  <span className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>
                    {c.index}
                  </span>
                  {/* Full label only on hover/focus, on an opaque chip so it never collides with content */}
                  <span
                    className={`pointer-events-none absolute right-full mr-3 translate-x-2 px-2 py-1 whitespace-nowrap opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 ${
                      onBone ? 'bg-onlight text-bone-50' : 'bg-hi text-ink-950'
                    }`}
                  >
                    {c.label}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`block h-px transition-all duration-500 ${
                    isActive ? 'w-5 bg-signal' : i < activeIdx ? 'w-3 bg-current opacity-60' : 'w-2 bg-current opacity-30'
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
