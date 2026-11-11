export const interestAreas = [
  'Automation & OT integration',
  'Industrial data & connectivity',
  'AI & computer vision',
  'Industrial applications',
  'Robotics & physical AI',
  'Edge & infrastructure',
  'Not sure yet',
] as const;

export type InterestArea = (typeof interestAreas)[number];

export const contactCopy = {
  index: '09',
  eyebrow: 'Contact',
  headline: 'Bring us the problem worth solving.',
  body: 'Tell us what you are trying to improve — a line, a process, a data problem, a robot idea. A short description is enough; we reply with questions, not a brochure.',
  directLabel: 'Or write directly',
  next: [
    { title: 'We read it ourselves', text: 'An engineer — not a sales queue — reads your message and replies, usually within two working days.' },
    { title: 'A focused conversation', text: 'Thirty minutes on the problem, the constraints and what good looks like. No slides required.' },
    { title: 'A concrete next step', text: 'Typically a short assessment or proof of value with clear success criteria — or an honest “we are not the right fit”.' },
  ],
};
