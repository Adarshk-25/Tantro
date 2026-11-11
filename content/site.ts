export const site = {
  name: 'TANTRO',
  domain: 'tantro.in',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tantro.in',
  positioning: 'Engineering Intelligence into the Physical World.',
  description:
    'Tantro engineers industrial automation, OT connectivity, data platforms, computer vision and physical AI — connecting physical systems, software and intelligence.',
  email: 'info@tantro.in',
  // Editable placeholders — replace with registered company details before launch.
  legal: {
    entity: '[Registered company name]',
    location: '[City, India]',
  },
} as const;

export type NavItem = { label: string; href: string };

export const nav: NavItem[] = [
  { label: 'Explore', href: '/#physical' },
  { label: 'Capabilities', href: '/#capabilities' },
  { label: 'Our Work', href: '/#work' },
  { label: 'Innovation', href: '/#innovation' },
  { label: 'Company', href: '/company' },
  { label: 'Contact', href: '/#contact' },
];

/** Homepage chapters, used by the progress rail. */
export const chapters = [
  { id: 'top', index: '00', label: 'Tantro' },
  { id: 'physical', index: '01', label: 'Physical world' },
  { id: 'connectivity', index: '02', label: 'Connectivity' },
  { id: 'intelligence', index: '03', label: 'Intelligence' },
  { id: 'capabilities', index: '04', label: 'Capabilities' },
  { id: 'innovation', index: '05', label: 'Innovation' },
  { id: 'work', index: '06', label: 'Engineering work' },
  { id: 'contact', index: '07', label: 'Contact' },
] as const;
