import Link from 'next/link';

export default function NotFound() {
  return (
    <section data-surface="ink" className="blueprint flex min-h-[80svh] flex-col justify-end px-[var(--gutter)] pt-32 pb-20">
      <p className="t-mono text-signal">404 · No signal</p>
      <h1 className="t-display mt-4 text-[clamp(2.6rem,1.4rem+5vw,6.5rem)]">
        This node is
        <br />
        not on the network.
      </h1>
      <Link href="/" className="btn-plate mt-10 self-start">
        Return to Tantro <span className="arrow" aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
