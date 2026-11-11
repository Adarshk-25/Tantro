import { NextResponse } from 'next/server';
import { validateContact } from '@/lib/contact/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Contact delivery.
 *
 * Delivery uses the Resend HTTP API when RESEND_API_KEY and CONTACT_FROM_EMAIL are
 * configured. Without them, the endpoint validates the submission and returns
 * 503 with an honest message — it never reports success for an undelivered message.
 */

// Best-effort, per-instance rate limit (5 submissions / 10 minutes / IP).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const { data, errors } = validateContact(body as Record<string, unknown>);

  // Honeypot filled: accept silently without delivering (bots get no signal).
  if (data.website) return NextResponse.json({ ok: true });

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, error: 'Please check the highlighted fields.', fields: errors }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || 'info@tantro.in';

  if (!apiKey || !from) {
    console.warn('[contact] Delivery not configured: set RESEND_API_KEY and CONTACT_FROM_EMAIL.');
    return NextResponse.json(
      {
        ok: false,
        code: 'not_configured',
        error: 'Online delivery is not set up yet. Please email us directly at info@tantro.in.',
      },
      { status: 503 },
    );
  }

  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Organisation: ${data.organization}`,
    `Area of interest: ${data.interest}`,
    '',
    data.message,
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `Website enquiry — ${data.organization} (${data.interest})`,
        text,
        html: `<pre style="font:14px/1.5 ui-monospace,monospace;white-space:pre-wrap">${escape(text)}</pre>`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error('[contact] Delivery failed', res.status, await res.text().catch(() => ''));
      return NextResponse.json(
        { ok: false, error: 'We could not send your message just now. Please try again, or email info@tantro.in.' },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error('[contact] Delivery error', err);
    return NextResponse.json(
      { ok: false, error: 'We could not send your message just now. Please try again, or email info@tantro.in.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
