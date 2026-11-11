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
  index: '07',
  eyebrow: 'Contact',
  headline: 'Bring us the problem worth solving.',
  body: 'Tell us what you are trying to improve. A short description is enough — we will reply with questions, not a brochure.',
  directLabel: 'Or write directly',
};
