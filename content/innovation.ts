export type InnovationLayer = {
  id: 'perception' | 'reasoning' | 'planning' | 'motion' | 'supervision';
  name: string;
  question: string;
  text: string;
};

export const innovationLayers: InnovationLayer[] = [
  {
    id: 'perception',
    name: 'Perception',
    question: 'What is around me?',
    text: 'Cameras and depth sensors build a model of the scene: objects, positions, people, free space.',
  },
  {
    id: 'reasoning',
    name: 'Reasoning',
    question: 'What does it mean?',
    text: 'The system relates what it perceives to the task: which object, in what state, under which constraints.',
  },
  {
    id: 'planning',
    name: 'Planning',
    question: 'What should I do?',
    text: 'A trajectory is computed that reaches the goal while avoiding collisions and respecting limits.',
  },
  {
    id: 'motion',
    name: 'Motion',
    question: 'How do I do it?',
    text: 'Joint-level control turns the plan into smooth, repeatable movement, corrected by feedback.',
  },
  {
    id: 'supervision',
    name: 'Human supervision',
    question: 'Who stays in control?',
    text: 'People set goals, approve uncertain decisions and can always stop the system. Autonomy is bounded by design.',
  },
];

export const innovationCopy = {
  index: '05',
  eyebrow: 'Innovation',
  headline: 'The next frontier is physical.',
  body: 'AI is moving from screens into machines that perceive and act. This is the direction we are researching and building toward — explore the loop that makes it work.',
  note: 'A research direction, not a product announcement.',
};
