import type { ReactNode } from 'react';

export type Surface = 'ink' | 'graphite' | 'stone';

/**
 * Chapter shell. Every chapter is a viewport-height story panel on desktop:
 * a compact header (index, title, lede) and an interactive stage that fills
 * the remaining height, so heading and interaction stay in view together.
 */
export function ChapterTransition({
  id,
  index,
  eyebrow,
  surface = 'ink',
  title,
  lede,
  aside,
  labelledBy,
  className = '',
  fit = true,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  surface?: Surface;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  labelledBy: string;
  className?: string;
  fit?: boolean;
  children: ReactNode;
}) {
  const light = surface === 'stone';
  return (
    <section
      id={id}
      data-chapter={id}
      data-surface={light ? 'bone' : 'ink'}
      aria-labelledby={labelledBy}
      className={`relative isolate overflow-hidden surface-${surface} ${fit ? 'lg:min-h-[100svh]' : ''} ${className}`}
    >
      <div
        className={`relative flex flex-col px-[var(--gutter)] pt-[calc(var(--nav-h)+1.25rem)] pb-10 lg:pb-8 ${
          fit ? 'lg:min-h-[100svh]' : ''
        }`}
      >
        <header className="grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-8" data-reveal>
          <div className="lg:col-span-7">
            <p className={`t-label flex items-center gap-3 ${light ? 'text-signal-deep' : 'text-signal'}`}>
              <span>{index}</span>
              <span className={`h-px w-8 ${light ? 'bg-signal-deep/50' : 'bg-signal/50'}`} aria-hidden="true" />
              <span className={light ? 'text-onlight-mid' : 'text-mid'}>{eyebrow}</span>
            </p>
            <h2 id={labelledBy} className="t-h2 mt-4">
              {title}
            </h2>
          </div>
          {(lede || aside) && (
            <div className="lg:col-span-5 lg:pb-1">
              {lede && <p className={`t-body max-w-[34rem] ${light ? 'text-onlight-mid' : 'text-mid'}`}>{lede}</p>}
              {aside}
            </div>
          )}
        </header>
        <div className="relative mt-7 flex min-h-0 flex-1 flex-col lg:mt-8">{children}</div>
      </div>
    </section>
  );
}
