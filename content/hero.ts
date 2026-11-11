export type HeroStage = {
  code: string;
  name: string;
  headline: string;
  body: string;
  highlights: string[];
  cta: { label: string; href: string };
};

export const hero = {
  headline: ['Engineering intelligence', 'into the physical world.'],
  support: 'We connect physical systems, software and intelligence to engineer what comes next.',
  primary: { label: 'Explore Tantro', href: '#physical' },
  secondary: { label: 'Start a Conversation', href: '#contact' },
  explore: 'Explore components',
  stages: [
    {
      code: 'S1',
      name: 'Physical systems',
      headline: 'Intelligence begins in the physical world.',
      body: 'Every motion has a purpose. Every process generates signals. Every variation tells us something about how a system performs.',
      highlights: ['Automation & control engineering', 'Robotics and motion systems', 'Instrumentation and machine signals'],
      cta: { label: 'See how machines tell their story', href: '#physical' },
    },
    {
      code: 'S2',
      name: 'Connected systems',
      headline: 'Connect the systems. Understand the process.',
      body: 'Controllers, SCADA, MES, edge systems and enterprise platforms produce different views of the same operation. We bring the context together.',
      highlights: ['PLC/DCS, SCADA and MES integration', 'Edge platforms and unified namespace', 'Governed industrial data services'],
      cta: { label: 'Explore connectivity scenarios', href: '#connectivity' },
    },
    {
      code: 'S3',
      name: 'Intelligence',
      headline: 'Turn industrial data into actionable intelligence.',
      body: 'Patterns become visible. Models identify deviation, estimate risk and support better operational decisions.',
      highlights: ['Asset health and anomaly detection', 'Vision inspection and process drift', 'Explainable, monitored models'],
      cta: { label: 'Open the decision lab', href: '#intelligence' },
    },
    {
      code: 'S4',
      name: 'Integrated intelligence',
      headline: 'From insight to coordinated action.',
      body: 'Engineering, connectivity, software and AI come together to support decisions and improve physical operations — with people approving what changes.',
      highlights: ['Physical asset → data → intelligence', 'Operator applications and approvals', 'Closed-loop improvement, safely bounded'],
      cta: { label: 'Discuss your operation', href: '#contact' },
    },
  ] as HeroStage[],
};
