'use client';

import { useRef, useState, type FormEvent } from 'react';
import { contactCopy, interestAreas } from '@/content/contact';
import { site } from '@/content/site';
import { LIMITS, validateContact, type ContactInput, type FieldErrors } from '@/lib/contact/validate';
import { ChapterTransition } from './ChapterTransition';

type Status = 'idle' | 'submitting' | 'sent' | 'error';

const empty: ContactInput = { name: '', email: '', organization: '', interest: '', message: '', website: '' };

export function ContactForm() {
  const [values, setValues] = useState<ContactInput>(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [warnings, setWarnings] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof ContactInput, v: string) => {
    const next = { ...values, [k]: v };
    setValues(next);
    if (attempted) {
      const r = validateContact(next);
      setErrors(r.errors);
      setWarnings(r.warnings);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    const r = validateContact(values);
    setErrors(r.errors);
    setWarnings(r.warnings);
    if (Object.keys(r.errors).length) {
      const first = Object.keys(r.errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus('submitting');
    setServerError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: FieldErrors };
      if (res.ok && json.ok) {
        setStatus('sent');
        setValues(empty);
        requestAnimationFrame(() => resultRef.current?.focus());
        return;
      }
      if (json.fields) setErrors(json.fields);
      setServerError(json.error || 'Something went wrong. Please email us directly.');
      setStatus('error');
    } catch {
      setServerError(`We could not reach the server. Please check your connection, or email ${site.email}.`);
      setStatus('error');
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const fieldProps = (k: keyof ContactInput) => ({
    id: `f-${k}`,
    name: k,
    value: values[k] ?? '',
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] || warnings[k] ? `f-${k}-msg` : undefined,
  });

  const Msg = ({ k }: { k: keyof ContactInput }) =>
    errors[k] ? (
      <p id={`f-${k}-msg`} className="mt-2 text-[0.85rem] text-alert">
        {errors[k]}
      </p>
    ) : warnings[k] ? (
      <p id={`f-${k}-msg`} className="mt-2 text-[0.85rem] text-mid">
        {warnings[k]}
      </p>
    ) : null;

  return (
    <ChapterTransition
      id="contact"
      index={contactCopy.index}
      eyebrow={contactCopy.eyebrow}
      labelledBy="contact-title"
      className="pb-28"
    >
      <div className="grid gap-14 px-[var(--gutter)] pt-20 md:pt-28 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <h2 id="contact-title" data-reveal className="t-display text-[clamp(2.6rem,1.3rem+4.4vw,6rem)]">
            Bring us the problem <span className="text-signal">worth solving.</span>
          </h2>
          <p data-reveal className="t-lede mt-8 max-w-[28rem] text-mid">
            {contactCopy.body}
          </p>
          <div data-reveal className="mt-12 border-t border-hi/12 pt-6">
            <p className="t-mono text-lo">{contactCopy.directLabel}</p>
            <a
              href={`mailto:${site.email}`}
              className="link-signal t-display-condensed mt-3 inline-block text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] text-hi"
            >
              {site.email}
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7" data-reveal>
          {status === 'sent' ? (
            <div ref={resultRef} tabIndex={-1} role="status" className="border-t border-signal pt-8 outline-none">
              <p className="t-mono text-signal">Message delivered</p>
              <p className="t-display-condensed mt-4 text-[2.4rem] text-hi">Thank you. We will be in touch.</p>
              <p className="mt-4 text-mid">We read every message ourselves and usually reply within two working days.</p>
              <button type="button" className="btn-line mt-8" onClick={() => setStatus('idle')}>
                Send another message
              </button>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={onSubmit} className="grid gap-9" aria-describedby="form-note">
              <div className="grid gap-9 sm:grid-cols-2 sm:gap-6">
                <div>
                  <label htmlFor="f-name" className="t-mono text-mid">
                    Name
                  </label>
                  <input {...fieldProps('name')} autoComplete="name" className="field-line" onChange={(e) => set('name', e.target.value)} maxLength={LIMITS.name} />
                  <Msg k="name" />
                </div>
                <div>
                  <label htmlFor="f-email" className="t-mono text-mid">
                    Business email
                  </label>
                  <input
                    {...fieldProps('email')}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    className="field-line"
                    onChange={(e) => set('email', e.target.value)}
                    maxLength={LIMITS.email}
                  />
                  <Msg k="email" />
                </div>
              </div>
              <div>
                <label htmlFor="f-organization" className="t-mono text-mid">
                  Organisation
                </label>
                <input
                  {...fieldProps('organization')}
                  autoComplete="organization"
                  className="field-line"
                  onChange={(e) => set('organization', e.target.value)}
                  maxLength={LIMITS.organization}
                />
                <Msg k="organization" />
              </div>

              <fieldset aria-describedby={errors.interest ? 'f-interest-msg' : undefined}>
                <legend className="t-mono text-mid">Area of interest</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {interestAreas.map((a) => {
                    const on = values.interest === a;
                    return (
                      <label
                        key={a}
                        className={`cursor-pointer border px-3.5 py-2 text-[0.88rem] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal ${
                          on ? 'border-signal bg-signal text-ink-950' : 'border-hi/20 text-hi/85 hover:border-hi/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="interest"
                          value={a}
                          checked={on}
                          onChange={() => set('interest', a)}
                          className="sr-only"
                          aria-invalid={errors.interest ? true : undefined}
                        />
                        {a}
                      </label>
                    );
                  })}
                </div>
                <Msg k="interest" />
              </fieldset>

              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="f-message" className="t-mono text-mid">
                    Project description
                  </label>
                  <span className="t-mono text-[0.62rem] text-lo" aria-hidden="true">
                    {values.message.length}/{LIMITS.message}
                  </span>
                </div>
                <textarea
                  {...fieldProps('message')}
                  rows={5}
                  className="field-line"
                  placeholder="What are you trying to improve, and what is in the way?"
                  onChange={(e) => set('message', e.target.value)}
                  maxLength={LIMITS.message}
                />
                <Msg k="message" />
              </div>

              {/* Honeypot: hidden from people and assistive tech */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="f-website">Website</label>
                <input id="f-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website', e.target.value)} />
              </div>

              {status === 'error' && (
                <div ref={resultRef} tabIndex={-1} role="alert" className="border-l-2 border-alert pl-4 text-[0.95rem] text-hi outline-none">
                  {serverError.split(site.email).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <a className="link-signal text-signal-soft" href={`mailto:${site.email}`}>
                          {site.email}
                        </a>
                      )}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-6">
                <button type="submit" className="btn-plate disabled:opacity-60" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Sending…' : 'Send message'}
                  <span className="arrow" aria-hidden="true">
                    →
                  </span>
                </button>
                <p id="form-note" className="text-[0.82rem] text-lo">
                  We use your details only to reply to this enquiry.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </ChapterTransition>
  );
}
