/**
 * Engineering work ledger.
 *
 * STATUS RULES — keep these honest:
 *  - 'case-study' : completed client work with written approval to publish.
 *  - 'demonstration' : built internally by Tantro; runs on synthetic or public data.
 *  - 'concept' : a designed architecture or approach, not yet implemented.
 *  - 'research' : exploratory work and experiments.
 *
 * Every entry below is an editable draft. Confirm status and wording before launch.
 */

export type WorkStatus = 'case-study' | 'demonstration' | 'concept' | 'research';

export const statusLabels: Record<WorkStatus, string> = {
  'case-study': 'Approved case study',
  demonstration: 'Internal demonstration',
  concept: 'Concept design',
  research: 'Research',
};

export type WorkFigure = 'architecture' | 'integration' | 'vision' | 'predictive' | 'robotics';

export type WorkItem = {
  id: string;
  category: string;
  title: string;
  status: WorkStatus;
  figure: WorkFigure;
  summary: string;
  approach: string[];
  stack: string[];
};

export const workItems: WorkItem[] = [
  {
    id: 'w-architecture',
    category: 'Industrial architecture',
    title: 'Brownfield connectivity reference architecture',
    status: 'concept',
    figure: 'architecture',
    summary:
      'A layered pattern for connecting mixed-generation equipment without touching control logic or exposing the control network.',
    approach: [
      'Read-only acquisition at the edge, segmented from the control zone',
      'One namespace convention for assets, signals and units',
      'Store-and-forward so network loss does not mean data loss',
    ],
    stack: ['OPC UA', 'MQTT', 'Edge containers', 'Segmentation'],
  },
  {
    id: 'w-integration',
    category: 'Data integration',
    title: 'OPC UA to unified namespace bridge',
    status: 'demonstration',
    figure: 'integration',
    summary:
      'A demonstrator that browses an OPC UA address space, maps nodes to a governed topic structure and publishes changes over MQTT.',
    approach: [
      'Configuration-driven node mapping, not hand-written code per machine',
      'Quality and timestamp carried with every value',
      'Simulated machines as the data source',
    ],
    stack: ['OPC UA', 'MQTT', 'TypeScript', 'Docker'],
  },
  {
    id: 'w-vision',
    category: 'Computer vision',
    title: 'Surface-defect inspection pipeline',
    status: 'demonstration',
    figure: 'vision',
    summary:
      'An end-to-end pipeline from image capture to verdict, built on public and synthetic defect images to test the engineering, not to claim accuracy.',
    approach: [
      'Alignment before inference, so models see consistent geometry',
      'Results stored with part ID for traceability',
      'Designed to run on an edge GPU',
    ],
    stack: ['PyTorch', 'ONNX', 'Edge inference', 'GigE Vision'],
  },
  {
    id: 'w-predictive',
    category: 'Predictive intelligence',
    title: 'Baselines for rotating equipment',
    status: 'research',
    figure: 'predictive',
    summary:
      'Exploring how far unsupervised baselines can go when failure examples are rare — which is the normal situation in a plant.',
    approach: [
      'Frequency-band features over raw amplitude',
      'Operating-state aware baselines',
      'Explanations an engineer can verify',
    ],
    stack: ['Python', 'Signal processing', 'Anomaly detection'],
  },
  {
    id: 'w-robotics',
    category: 'Robotics research',
    title: 'Perception-to-motion loop in simulation',
    status: 'research',
    figure: 'robotics',
    summary:
      'A simulated pick task closing the loop from camera to trajectory, used to study supervision and failure handling before hardware.',
    approach: [
      'Simulation first, with randomised scenes',
      'Explicit confidence thresholds for human approval',
      'Safety zones as constraints, not afterthoughts',
    ],
    stack: ['Simulation', 'ROS 2', 'Motion planning', 'Perception'],
  },
];

export const workCopy = {
  index: '06',
  eyebrow: 'Engineering work',
  headline: 'Ideas become valuable when they work.',
  body: 'We label our work for what it is. Approved client case studies will appear here once our clients agree to publish them.',
  emptyCaseStudies:
    'No client case studies are published yet. We only publish results our clients have approved.',
};
