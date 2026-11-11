export type StageId = 'perception' | 'reasoning' | 'planning' | 'motion' | 'supervision';

export type InnovationStage = {
  id: StageId;
  name: string;
  question: string;
  text: string;
  elements: string[];
  /** In-scene annotations, anchored to named points in the 3D figure. */
  labels: { anchor: string; text: string }[];
};

export const innovationStages: InnovationStage[] = [
  {
    id: 'perception',
    name: 'Perception',
    question: 'What is around me?',
    text: 'Cameras, depth sensing and LiDAR build a live model of the scene — objects, their poses, free space and the people nearby.',
    elements: ['RGB-D cameras & LiDAR', 'Object detection & 6-DoF pose', 'Scene and occupancy mapping'],
    labels: [
      { anchor: 'eye', text: 'RGB-D + LiDAR' },
      { anchor: 'target', text: 'bracket · p 0.96' },
      { anchor: 'obstacle', text: 'fixture · p 0.91' },
    ],
  },
  {
    id: 'reasoning',
    name: 'Reasoning',
    question: 'What does it mean?',
    text: 'Perception is related to the task: which part, in what state, under which constraints — and whether the system is confident enough to proceed.',
    elements: ['Task and object context', 'Constraints and preconditions', 'Confidence-aware decision logic'],
    labels: [
      { anchor: 'graph', text: 'task: pick → place' },
      { anchor: 'target', text: 'grasp: top face' },
    ],
  },
  {
    id: 'planning',
    name: 'Planning',
    question: 'What should I do?',
    text: 'A collision-free trajectory is computed around obstacles, within joint limits and speed constraints, and sequenced into steps.',
    elements: ['Task sequencing', 'Collision-aware path planning', 'Joint, speed and force limits'],
    labels: [
      { anchor: 'obstacle', text: 'collision volume' },
      { anchor: 'waypoint', text: 'waypoint 3 / 4' },
    ],
  },
  {
    id: 'motion',
    name: 'Motion',
    question: 'How do I do it?',
    text: 'Joint-level control turns the plan into smooth, repeatable motion, continuously corrected by feedback from encoders and force sensing.',
    elements: ['Trajectory execution', 'Closed-loop joint control', 'Force-aware contact'],
    labels: [
      { anchor: 'shoulder', text: 'J2 · 18 Nm' },
      { anchor: 'hand', text: 'contact force 4 N' },
    ],
  },
  {
    id: 'supervision',
    name: 'Human supervision',
    question: 'Who stays in control?',
    text: 'People set goals, approve uncertain actions and can always stop the system. Speed and separation are monitored; autonomy is bounded by design.',
    elements: ['Operator approval for low-confidence steps', 'Speed & separation monitoring', 'Emergency stop and audit trail'],
    labels: [
      { anchor: 'operator', text: 'operator approval' },
      { anchor: 'zone', text: 'protective zone' },
    ],
  },
];

export const innovationCopy = {
  index: '05',
  eyebrow: 'Physical AI',
  title: 'The next frontier is physical.',
  lede: 'AI is moving from screens into machines that perceive and act. This is the loop we are researching and building toward — explore each stage on the figure.',
  note: 'A research direction, not a product announcement. Values shown are illustrative.',
};
