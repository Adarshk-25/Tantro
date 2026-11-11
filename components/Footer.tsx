import Link from 'next/link';
import { nav, site } from '@/content/site';
import { Wordmark } from './nav/SiteNav';

export function Footer() {
  return (
    <footer data-surface="ink" className="relative border-t border-hi/10 bg-ink-950 px-[var(--gutter)] pt-16 pb-10 text-mid">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark className="text-hi" />
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed">{site.positioning}</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.92rem]">
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="link-signal hover:text-hi">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="text-[0.92rem]">
          <a href={`mailto:${site.email}`} className="link-signal text-hi">
            {site.email}
          </a>
          <p className="mt-2">{site.legal.location}</p>
        </div>
      </div>
      <div className="t-mono mt-16 flex flex-wrap justify-between gap-4 border-t border-hi/10 pt-6 text-lo">
        <span>
          © {new Date().getFullYear()} {site.legal.entity}
        </span>
        <span>{site.domain}</span>
      </div>
    </footer>
  );
}
