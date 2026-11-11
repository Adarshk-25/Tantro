import { securityCopy, securityServices, standards, standardsNote } from '@/content/security';
import { ChapterTransition } from './ChapterTransition';
import { SecurityExplorer } from './security/SecurityExplorer';

/** OT Cybersecurity — a primary Tantro capability with its own explorer. */
export function SecurityChapter() {
  return (
    <ChapterTransition
      id="security"
      index={securityCopy.index}
      eyebrow={securityCopy.eyebrow}
      surface="graphite"
      labelledBy="security-title"
      title={securityCopy.title}
      lede={securityCopy.lede}
      fit={false}
    >
      <div data-reveal>
        <SecurityExplorer />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-12" data-reveal>
        <div className="lg:col-span-8">
          <h3 className="t-h3 text-hi">OT cybersecurity services</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {securityServices.map((g) => (
              <section key={g.id} id={`sec-${g.id}`} className="panel p-5" aria-labelledby={`sec-${g.id}-t`}>
                <h4 id={`sec-${g.id}-t`} className="font-semibold text-hi">
                  {g.name}
                </h4>
                <ul className="mt-3 grid gap-1.5">
                  {g.items.map((i) => (
                    <li key={i} className="t-small flex gap-2.5 text-hi/85">
                      <span className="mt-[0.55rem] h-1 w-2.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                      {i}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
        <aside className="lg:col-span-4">
          <h3 className="t-label text-mid">Standards & governance we apply</h3>
          <dl className="mt-4 grid gap-4">
            {standards.map((s) => (
              <div key={s.name} className="border-l-2 border-teal/50 pl-4">
                <dt className="font-medium text-hi">{s.name}</dt>
                <dd className="t-small mt-1 text-mid">{s.text}</dd>
              </div>
            ))}
          </dl>
          <p className="t-label mt-5 text-lo">{standardsNote}</p>
          <a href="#contact" className="btn-plate mt-6">
            Request an OT security assessment <span className="arrow" aria-hidden="true">→</span>
          </a>
        </aside>
      </div>
    </ChapterTransition>
  );
}
