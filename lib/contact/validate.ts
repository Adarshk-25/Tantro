import { interestAreas } from '@/content/contact';

export type ContactInput = {
  name: string;
  email: string;
  organization: string;
  interest: string;
  message: string;
  /** Honeypot — must stay empty. */
  website?: string;
};

export type FieldErrors = Partial<Record<keyof ContactInput, string>>;

export const LIMITS = { name: 120, email: 200, organization: 160, message: 4000, messageMin: 20 };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FREE_MAIL = /@(gmail|yahoo|hotmail|outlook|live|icloud|aol|proton|protonmail|rediffmail)\./i;

/** Shared by the browser and the server; the server's result is authoritative. */
export function validateContact(raw: Partial<Record<keyof ContactInput, unknown>>): {
  data: ContactInput;
  errors: FieldErrors;
  warnings: FieldErrors;
} {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const data: ContactInput = {
    name: str(raw.name),
    email: str(raw.email).toLowerCase(),
    organization: str(raw.organization),
    interest: str(raw.interest),
    message: str(raw.message),
    website: str(raw.website),
  };
  const errors: FieldErrors = {};
  const warnings: FieldErrors = {};

  if (!data.name) errors.name = 'Please tell us your name.';
  else if (data.name.length > LIMITS.name) errors.name = 'That name is too long.';

  if (!data.email) errors.email = 'A business email lets us reply.';
  else if (!EMAIL.test(data.email) || data.email.length > LIMITS.email) errors.email = 'That email address does not look valid.';
  else if (FREE_MAIL.test(data.email)) warnings.email = 'A company address helps us respond faster — but this one works too.';

  if (!data.organization) errors.organization = 'Which organisation are you with?';
  else if (data.organization.length > LIMITS.organization) errors.organization = 'That name is too long.';

  if (!(interestAreas as readonly string[]).includes(data.interest)) errors.interest = 'Choose the closest area.';

  if (data.message.length < LIMITS.messageMin)
    errors.message = `A sentence or two is enough — at least ${LIMITS.messageMin} characters.`;
  else if (data.message.length > LIMITS.message) errors.message = `Please keep it under ${LIMITS.message} characters.`;

  return { data, errors, warnings };
}
