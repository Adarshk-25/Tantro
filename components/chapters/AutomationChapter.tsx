import { automationCopy, ecosystemNote, ecosystems, serviceGroups } from '@/content/automation';
import { ChapterTransition } from './ChapterTransition';
import { ControlEngineeringExplorer } from './automation/ControlEngineeringExplorer';

/** Industrial Automation & Control Engineering — a primary Tantro service. */
export function AutomationChapter() {
  return (
    <ChapterTransition
      id="automation"
      index={automationCopy.index}
      eyebrow={automationCopy.eyebrow}
      surface="ink"
      labelledBy="automation-title"
      title={automationCopy.title}
      lede={automationCopy.lede}
      fit={false}
    >
      <div data-reveal>
        <ControlEngineeringExplorer />
      </div>

      <div className="mt-12" data-reveal>
        <h3 className="t-h3 text-hi">Control engineering services</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {serviceGroups.map((g) => (
            <section key={g.id} id={`svc-${g.id}`} className="panel flex flex-col p-5" aria-labelledby={`svc-${g.id}-t`}>
              <h4 id={`svc-${g.id}-t`} className="font-semibold text-hi">
                {g.name}
              </h4>
              <p className="t-small mt-1.5 text-mid">{g.summary}</p>
              <ul className="mt-4 grid gap-1.5">
                {g.items.slice(0, 6).map((i) => (
                  <li key={i} className="t-small flex gap-2.5 text-hi/85">
                    <span className="mt-[0.55rem] h-1 w-2.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                    {i}
                  </li>
                ))}
              </ul>
              {g.items.length > 6 && (
                <details className="group mt-1.5">
                  <summary className="t-label cursor-pointer list-none py-1 text-signal hover:text-hi">
                    <span className="group-open:hidden">+ {g.items.length - 6} more</span>
                    <span className="hidden group-open:inline">− show fewer</span>
                  </summary>
                  <ul className="mt-1 grid gap-1.5">
                    {g.items.slice(6).map((i) => (
                      <li key={i} className="t-small flex gap-2.5 text-hi/85">
                        <span className="mt-[0.55rem] h-1 w-2.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                        {i}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </section>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-4 border-t border-hi/10 pt-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="t-label text-mid">Representative ecosystems</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {ecosystems.map((e) => (
                <li key={e} className="rounded-full border border-hi/12 px-3 py-1 text-[0.8rem] text-hi/85">
                  {e}
                </li>
              ))}
            </ul>
            <p className="t-label mt-3 max-w-[48rem] text-lo">{ecosystemNote}</p>
          </div>
          <a href="#contact" className="btn-plate shrink-0 self-start">
            Discuss a PLC, DCS or SCADA project <span className="arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </ChapterTransition>
  );
}
