export const hero = {
  headline: ['Engineering intelligence', 'into the physical world.'],
  support: 'We connect physical systems, software and intelligence to engineer what comes next.',
  primary: { label: 'Explore Tantro', href: '#physical' },
  secondary: { label: 'Start a Conversation', href: '#contact' },
  /** One caption per particle state, in scroll order. */
  states: [
    {
      code: 'S1',
      title: 'Mechanism',
      line: 'It starts with physical things: axes, joints, tolerances, cycle times.',
    },
    {
      code: 'S2',
      title: 'Connected network',
      line: 'Each asset becomes a node: controllers, edge, operations and enterprise, joined in layers.',
    },
    {
      code: 'S3',
      title: 'Intelligence',
      line: 'Signals become features, features become models, and models make inferences.',
    },
    {
      code: 'S4',
      title: 'Integrated system',
      line: 'Machine, network and model working as one loop — sensing, deciding, acting.',
    },
  ],
} as const;
