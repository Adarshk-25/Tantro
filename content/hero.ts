export type HeroStage = {
  code: string;
  name: string;
  headline: string;
  body: string;
  highlights: string[];
  cta: { label: string; href: string };
};

export const hero = {
  headline: ['Engineering the systems', 'that power industry.'],
  support:
    'From automation and secure industrial infrastructure to intelligent software, AI and robotics, Tantro engineers connected solutions for modern industrial operations.',
  storyline: 'From control to intelligence. Engineered as one.',
  primary: { label: 'Explore Tantro', href: '#physical' },
  secondary: { label: 'Start a Conversation', href: '#contact' },
  explore: 'Explore components',
  stages: [
    {
      code: 'S1',
      name: 'Engineer',
      headline: 'Build control into every process.',
      body: 'Reliable operations start with engineered control: sequences that run the same way every time, process variables held at set-point, interlocks that protect equipment, and supervision operators can trust.',
      highlights: ['PLC & DCS programming, migration and commissioning', 'SCADA / HMI development and alarm management', 'Functional specifications, FAT and SAT'],
      cta: { label: 'Explore control engineering', href: '#automation' },
    },
    {
      code: 'S2',
      name: 'Secure & connect',
      headline: 'Connect operations. Protect what matters.',
      body: 'Plants need data to flow — without opening controllers to the enterprise. We design zones, conduits and an industrial DMZ so only approved information moves, through boundaries you can verify.',
      highlights: ['OT security assessment and segmentation', 'Industrial DMZ, secure remote access', 'Governed connectivity to MES, ERP and cloud'],
      cta: { label: 'Explore OT cybersecurity', href: '#security' },
    },
    {
      code: 'S3',
      name: 'Understand & optimize',
      headline: 'Turn operational data into intelligence.',
      body: 'Historians, context models and analytics turn signals into understanding. Computer vision and machine learning then support maintenance, quality and operations — with uncertainty shown, not hidden.',
      highlights: ['Historians and ISA-95 context models', 'Predictive maintenance and vision inspection', 'Decision support with human review'],
      cta: { label: 'Open the decision lab', href: '#intelligence' },
    },
    {
      code: 'S4',
      name: 'Integrate & advance',
      headline: 'Bring engineering and intelligence together.',
      body: 'Physical systems, automation, security, enterprise applications, AI and robotics work as one environment — each layer engineered so the next can depend on it.',
      highlights: ['End-to-end architecture, one accountable team', 'Industrial applications and digital platforms', 'Robotics and physical AI, safely bounded'],
      cta: { label: 'Discuss your operation', href: '#contact' },
    },
  ] as HeroStage[],
};
