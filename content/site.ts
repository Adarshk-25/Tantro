export const site = {
  name: 'TANTRO',
  domain: 'tantro.in',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tantro.in',
  positioning: 'Engineering the systems that power industry.',
  description:
    'Tantro is an industrial engineering and technology company: PLC/DCS and SCADA engineering, OT cybersecurity, industrial connectivity and data, industrial AI, software platforms, robotics and physical AI.',
  email: 'info@tantro.in',
  // Editable placeholders — replace with registered company details before launch.
  legal: {
    entity: '[Registered company name]',
    location: '[City, India]',
  },
} as const;

export type NavItem = { label: string; href: string };

export const nav: NavItem[] = [
  { label: 'Services', href: '/#automation' },
  { label: 'Capabilities', href: '/#capabilities' },
  { label: 'Our Work', href: '/#work' },
  { label: 'Innovation', href: '/#innovation' },
  { label: 'Company', href: '/company' },
  { label: 'Contact', href: '/#contact' },
];

/** Service-based customer journeys, reachable from the Services menu. */
export const journeys = [
  { label: 'PLC & DCS programming', text: 'Control logic, sequences, migration, FAT and SAT', href: '/#automation' },
  { label: 'SCADA, HMI & MES', text: 'Supervision, alarm management, MES integration', href: '/#svc-scada' },
  { label: 'OT cybersecurity assessment', text: 'Assessment, segmentation, remote access, monitoring', href: '/#security' },
  { label: 'Industrial connectivity & data', text: 'Brownfield, unified namespace, DMZ, historians', href: '/#connectivity' },
  { label: 'Industrial AI & analytics', text: 'The decision lab: 14 worked scenarios', href: '/#intelligence' },
  { label: 'Robotics & physical AI', text: 'Perception to supervised motion', href: '/#innovation' },
];

/** Homepage chapters, used by the progress rail. */
export const chapters = [
  { id: 'top', index: '00', label: 'Tantro' },
  { id: 'physical', index: '01', label: 'Machine story' },
  { id: 'automation', index: '02', label: 'Control engineering' },
  { id: 'security', index: '03', label: 'OT cybersecurity' },
  { id: 'connectivity', index: '04', label: 'Connectivity' },
  { id: 'intelligence', index: '05', label: 'Decision lab' },
  { id: 'capabilities', index: '06', label: 'Capabilities' },
  { id: 'innovation', index: '07', label: 'Physical AI' },
  { id: 'work', index: '08', label: 'Engineering work' },
  { id: 'contact', index: '09', label: 'Contact' },
] as const;
