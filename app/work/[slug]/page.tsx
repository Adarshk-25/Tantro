import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { capabilities } from '@/content/capabilities';
import { statusLabels, workBySlug, workItems } from '@/content/work';
import { BackToWork } from '@/components/work/BackToWork';
import { WorkPreview } from '@/components/work/WorkPreview';

export function generateStaticParams() {
  return workItems.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = workBySlug(slug);
  if (!w) return {};
  return { title: w.title, description: w.summary, alternates: { canonical: `/work/${w.slug}` } };
}

const statusMeaning = {
  'case-study': 'Completed client work, published with written approval.',
  demonstration: 'Built by Tantro and running on synthetic or public data.',
  concept: 'A designed architecture or approach, not yet implemented.',
  research: 'Exploratory work and experiments.',
} as const;

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = workBySlug(slug);
  if (!w) notFound();
  const related = capabilities.filter((c) => w.capabilities.includes(c.name));
  const idx = workItems.findIndex((x) => x.slug === w.slug);
  const next = workItems[(idx + 1) % workItems.length];

  return (
    <article data-surface="ink" className="surface-ink min-h-[100svh] px-[var(--gutter)] pt-[calc(var(--nav-h)+2rem)] pb-24">
      <BackToWork />
      <header className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="t-label flex flex-wrap items-center gap-3 text-mid">
            <span className="rounded-full border border-signal/40 px-2.5 py-1 text-signal">{statusLabels[w.status]}</span>
            {w.category}
          </p>
          <h1 className="t-h2 mt-5 text-hi">{w.title}</h1>
          <p className="t-lede mt-5 max-w-[46rem] text-mid">{w.summary}</p>
        </div>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-12">
        <section className="panel p-4 md:p-6 lg:col-span-7" aria-labelledby="preview-title">
          <h2 id="preview-title" className="t-label mb-4 text-mid">
            Interactive preview
          </h2>
          <WorkPreview item={w} />
        </section>
        <div className="grid gap-6 lg:col-span-5">
          {[
            ['Industrial problem', w.problem],
            ['Engineering challenge', w.challenge],
            ['What was built', w.built],
          ].map(([k, v]) => (
            <section key={k}>
              <h2 className="t-label text-signal">{k}</h2>
              <p className="t-body mt-2 text-hi/90">{v}</p>
            </section>
          ))}
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <h2 className="t-h3 text-hi">How it works</h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            {w.howItWorks.map((s, i) => (
              <li key={s} className="panel flex gap-3 p-4">
                <span className="t-mono-plain flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal/15 text-[0.7rem] text-signal">{i + 1}</span>
                <span className="t-small text-hi/90">{s}</span>
              </li>
            ))}
          </ol>
          <h2 className="t-label mt-8 text-mid">Technology approach</h2>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {w.stack.map((s) => (
              <li key={s} className="t-mono-plain rounded-full border border-hi/12 px-2.5 py-1 text-[0.72rem] text-mid">
                {s}
              </li>
            ))}
          </ul>
        </section>
        <aside className="grid content-start gap-6 lg:col-span-5">
          <section className="rounded-2xl border border-teal/25 bg-teal/5 p-5">
            <h2 className="t-label text-teal">Validation status</h2>
            <p className="t-small mt-2 text-hi/90">{w.validation}</p>
            <p className="t-small mt-3 text-lo">
              <strong className="font-medium text-mid">{statusLabels[w.status]}:</strong> {statusMeaning[w.status]}
            </p>
          </section>
          <section>
            <h2 className="t-label text-mid">Related capabilities</h2>
            <ul className="mt-3 grid gap-1.5">
              {related.map((c) => (
                <li key={c.id}>
                  <Link href="/#capabilities" className="link-signal text-hi">
                    {c.full}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <nav aria-label="More work" className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-hi/10 pt-6">
        <BackToWork />
        <Link href={`/work/${next.slug}`} className="link-signal text-mid hover:text-hi">
          Next: {next.title} <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </article>
  );
}
