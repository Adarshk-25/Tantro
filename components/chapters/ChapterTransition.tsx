import type { ReactNode } from 'react';

/**
 * Chapter shell: semantic section, surface theme, and a precise seam that marks
 * the transition into each chapter (index, rule, label).
 */
export function ChapterTransition({
  id,
  index,
  eyebrow,
  surface = 'ink',
  className = '',
  children,
  labelledBy,
}: {
  id: string;
  index: string;
  eyebrow: string;
  surface?: 'ink' | 'bone';
  className?: string;
  children: ReactNode;
  labelledBy: string;
}) {
  const bone = surface === 'bone';
  return (
    <section
      id={id}
      data-chapter={id}
      data-surface={surface}
      aria-labelledby={labelledBy}
      className={`relative ${bone ? 'surface-bone' : 'bg-ink-950 text-hi'} ${className}`}
    >
      <div className="flex items-center gap-4 px-[var(--gutter)] pt-6" data-reveal>
        <span className={`t-mono ${bone ? 'text-signal-deep' : 'text-signal'}`}>{index}</span>
        <span className={`h-px flex-1 ${bone ? 'bg-onlight/15' : 'bg-hi/12'}`} aria-hidden="true" />
        <span className={`t-mono ${bone ? 'text-onlight-mid' : 'text-mid'}`}>{eyebrow}</span>
      </div>
      {children}
    </section>
  );
}
