'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/** Returns to the work list with the filter the visitor came from. */
export function BackToWork({ className = '' }: { className?: string }) {
  const [href, setHref] = useState('/#work');
  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get('from');
    if (from && from !== 'all') setHref(`/?work=${encodeURIComponent(from)}#work`);
  }, []);
  return (
    <Link href={href} className={`btn-line !py-2 text-[0.9rem] ${className}`}>
      <span aria-hidden="true">←</span> Back to work
    </Link>
  );
}
