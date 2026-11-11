'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/** Returns to the work list with the filter the visitor came from. */
export function BackToWork({ className = '' }: { className?: string }) {
  const [href, setHref] = useState('/#work');
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const out = new URLSearchParams();
    const from = q.get('from');
    const cat = q.get('cat');
    if (from && from !== 'all') out.set('work', from);
    if (cat) out.set('cat', cat);
    const qs = out.toString();
    if (qs) setHref(`/?${qs}#work`);
  }, []);
  return (
    <Link href={href} className={`btn-line !py-2 text-[0.9rem] ${className}`}>
      <span aria-hidden="true">←</span> Back to work
    </Link>
  );
}
