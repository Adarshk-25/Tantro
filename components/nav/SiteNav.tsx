'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { journeys, nav } from '@/content/site';
import { useActiveChapter, useSurfaceUnderNav } from './useActiveChapter';

const hrefChapter = (href: string) => (href.startsWith('/#') ? href.slice(2) : null);

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official Tantro logomark (transparent derivative of public/tantro-logo.png) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/tantro-mark.png" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
      <span className="font-display text-[1.02rem] font-[650] tracking-[0.32em] [font-variation-settings:'wdth'_118]">
        TANTRO
      </span>
    </span>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const active = useActiveChapter();
  const surface = useSurfaceUnderNav();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on route change and on Escape; trap focus within the open panel.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      }
      if (e.key === 'Tab' && panel.current) {
        const f = Array.from(panel.current.querySelectorAll<HTMLElement>('a, button'));
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onBone = surface === 'bone' && !open;
  const isCurrent = (href: string) => {
    const ch = hrefChapter(href);
    if (ch) return onHome && active === ch;
    return pathname === href;
  };

  return (
    <>
      <a href="#main" className="sr-only-focusable fixed top-3 left-3 z-[90] bg-signal px-4 py-2 text-ink-950">
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] transition-[background-color,color,border-color] duration-500 ${
          onBone ? 'text-onlight' : 'text-hi'
        } ${
          scrolled && !open
            ? onBone
              ? 'border-b border-onlight/10 bg-bone-50/80 backdrop-blur-md'
              : 'border-b border-hi/8 bg-ink-950/70 backdrop-blur-md'
            : 'border-b border-transparent'
        }`}
      >
        <nav aria-label="Primary" className="flex h-full items-center justify-between px-[var(--gutter)]">
          <Link href="/" aria-label="Tantro home" className="relative z-10">
            <Wordmark />
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {nav.map((item, i) => {
              const current = isCurrent(item.href);
              const num = (
                <span
                  className={`t-mono-plain text-[0.62rem] transition-colors ${current ? 'text-signal' : onBone ? 'text-onlight-mid' : 'text-lo'} group-hover:text-signal`}
                  aria-hidden="true"
                >
                  0{i + 1}
                </span>
              );
              if (item.label === 'Services')
                return (
                  <li
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setSvcOpen(true)}
                    onMouseLeave={() => setSvcOpen(false)}
                    onKeyDown={(e) => e.key === 'Escape' && setSvcOpen(false)}
                    onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setSvcOpen(false)}
                  >
                    <button
                      type="button"
                      aria-expanded={svcOpen}
                      aria-controls="services-menu"
                      onClick={(e) => setSvcOpen((o) => (e.detail > 0 ? true : !o))} // pointer clicks follow hover (and touch's emulated hover) so they never close what hover just opened; keyboard toggles
                      className="group link-signal flex items-baseline gap-1.5 text-[0.88rem] font-medium"
                    >
                      {num}
                      {item.label}
                      <span aria-hidden="true" className={`text-[0.7rem] transition-transform ${svcOpen ? 'rotate-180' : ''}`}>
                        ▾
                      </span>
                    </button>
                    <div
                      id="services-menu"
                      hidden={!svcOpen}
                      className="absolute top-full left-1/2 w-[min(40rem,80vw)] -translate-x-1/2 pt-4"
                    >
                      <div className="panel !rounded-2xl !bg-ink-900/95 p-3 text-hi backdrop-blur-xl">
                        <p className="t-label px-3 pt-1 pb-2 text-lo">What do you need?</p>
                        <ul className="grid grid-cols-2 gap-1">
                          {journeys.map((j) => (
                            <li key={j.href}>
                              <Link
                                href={j.href}
                                onClick={() => setSvcOpen(false)}
                                className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-hi/5 focus-visible:bg-hi/5"
                              >
                                <span className="block text-[0.92rem] font-medium text-hi">{j.label}</span>
                                <span className="block text-[0.78rem] text-mid">{j.text}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link href="/#capabilities" onClick={() => setSvcOpen(false)} className="t-label mt-1 block rounded-xl px-3 py-2 text-signal hover:bg-hi/5">
                          All eight capabilities →
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={current ? 'true' : undefined} className="group link-signal flex items-baseline gap-1.5 text-[0.88rem] font-medium">
                    {num}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            ref={menuBtn}
            type="button"
            className="t-mono relative z-10 flex items-center gap-3 py-2 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Menu'}
            <span className="relative block h-2.5 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 h-px w-full bg-current transition-transform duration-500 ${open ? 'top-1/2 rotate-45' : 'top-0'}`}
              />
              <span
                className={`absolute left-0 h-px bg-current transition-all duration-500 ${open ? 'top-1/2 w-full -rotate-45' : 'bottom-0 w-3/5'}`}
              />
            </span>
          </button>
        </nav>
      </header>

      {/* Mobile menu: a full-height index */}
      <div
        id="mobile-menu"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="fixed inset-0 z-40 overflow-y-auto bg-ink-950 px-[var(--gutter)] pt-[calc(var(--nav-h)+1.5rem)] pb-10 lg:hidden"
      >
        <ul className="flex flex-col">
          {nav.map((item, i) => (
            <li key={item.href} className="border-b border-hi/10">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between py-4 text-hi transition-colors hover:text-signal-soft"
              >
                <span className="t-display-condensed text-[2.1rem]">{item.label}</span>
                <span className="t-mono text-lo">0{i + 1}</span>
              </Link>
              {item.label === 'Services' && (
                <ul className="mb-3 grid gap-0.5">
                  {journeys.map((j) => (
                    <li key={j.href}>
                      <Link href={j.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-1.5 text-[0.95rem] text-mid hover:text-hi">
                        {j.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <a href="mailto:info@tantro.in" className="t-mono mt-10 inline-block text-mid">
          info@tantro.in
        </a>
      </div>
    </>
  );
}
