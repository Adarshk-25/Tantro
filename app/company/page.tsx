import type { Metadata } from 'next';
import Link from 'next/link';
import { company } from '@/content/company';
import { capabilities } from '@/content/capabilities';

export const metadata: Metadata = {
  title: 'Company',
  description: company.lede,
  alternates: { canonical: '/company' },
};

export default function CompanyPage() {
  return (
    <>
      <section data-surface="ink" className="blueprint relative px-[var(--gutter)] pt-[calc(var(--nav-h)+5rem)] pb-24">
        <p className="t-mono text-signal" data-reveal>
          {company.title}
        </p>
        <h1 className="t-display mt-6 max-w-[22ch] text-[clamp(2.2rem,1.2rem+3.2vw,4.6rem)]" data-reveal>
          {company.lede}
        </h1>
        <div className="mt-14 grid gap-8 md:grid-cols-12">
          {company.intro.map((p, i) => (
            <p key={i} className={`t-lede text-mid md:col-span-5 ${i === 1 ? 'md:col-start-8' : ''}`} data-reveal>
              {p}
            </p>
          ))}
        </div>
      </section>

      <section data-surface="bone" className="surface-bone px-[var(--gutter)] py-24" aria-labelledby="principles">
        <h2 id="principles" className="t-mono text-signal-deep" data-reveal>
          How we work
        </h2>
        <ol className="mt-10 grid gap-x-10 md:grid-cols-2">
          {company.principles.map((p, i) => (
            <li key={p.title} className="grid grid-cols-[3rem_1fr] border-t border-onlight/15 py-8" data-reveal>
              <span className="t-mono text-onlight-mid">0{i + 1}</span>
              <div>
                <h3 className="t-display-condensed text-[clamp(1.7rem,1.3rem+1.4vw,2.6rem)]">{p.title}</h3>
                <p className="mt-3 max-w-[34rem] leading-relaxed text-onlight-mid">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section data-surface="ink" className="grid gap-14 px-[var(--gutter)] py-24 lg:grid-cols-12" aria-labelledby="commitments">
        <div className="lg:col-span-5">
          <h2 id="commitments" className="t-display-condensed text-[clamp(2rem,1.4rem+2.4vw,3.6rem)]" data-reveal>
            What we will not do
          </h2>
          <ul className="mt-8">
            {company.commitments.map((c) => (
              <li key={c} className="flex gap-4 border-t border-hi/12 py-4 text-hi/90" data-reveal>
                <span className="mt-2.5 h-px w-4 shrink-0 bg-signal" aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <h2 className="t-mono text-mid" data-reveal>
            Six disciplines
          </h2>
          <ul className="mt-6">
            {capabilities.map((c) => (
              <li key={c.id} className="flex items-baseline gap-4 border-t border-hi/12 py-3" data-reveal>
                <span className="t-mono text-lo">{c.index}</span>
                <span>{c.full}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-hi/12 pt-6" data-reveal>
            {company.facts.map((f) => (
              <div key={f.label}>
                <dt className="t-mono text-lo">{f.label}</dt>
                <dd className="mt-1 text-mid">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section data-surface="ink" className="border-t border-hi/10 px-[var(--gutter)] py-24">
        <p className="t-display-condensed max-w-[20ch] text-[clamp(2rem,1.3rem+3vw,4.4rem)]" data-reveal>
          Have a problem worth solving?
        </p>
        <Link href="/#contact" className="btn-plate mt-10" data-reveal>
          Start a conversation <span className="arrow" aria-hidden="true">→</span>
        </Link>
      </section>
    </>
  );
}
