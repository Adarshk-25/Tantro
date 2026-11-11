export type CapabilityShape =
  | 'gear'
  | 'mesh'
  | 'lattice'
  | 'strata'
  | 'arm'
  | 'rack';

export type Capability = {
  id: string;
  index: string;
  name: string;
  full: string;
  shape: CapabilityShape;
  statement: string;
  technologies: string[];
  problem: string;
  outcome: string;
};

export const capabilities: Capability[] = [
  {
    id: 'automation',
    index: '01',
    name: 'Automation',
    full: 'Industrial Automation & OT Integration',
    shape: 'gear',
    statement:
      'Control logic, machine integration and OT systems engineered for deterministic behaviour and safe change.',
    technologies: ['PLC', 'SCADA / HMI', 'IEC 61131-3', 'Drives & motion', 'Safety interlocks'],
    problem:
      'A line runs on undocumented logic and isolated machines, so every change is slow and risky.',
    outcome:
      'A mapped, documented control layer with defined interfaces — ready for data and further automation.',
  },
  {
    id: 'connectivity',
    index: '02',
    name: 'Connectivity',
    full: 'Industrial Data Engineering & Connectivity',
    shape: 'mesh',
    statement:
      'Getting reliable, contextualised data out of mixed-vendor equipment and into the systems that need it.',
    technologies: ['OPC UA', 'MQTT / Sparkplug B', 'Modbus', 'Historians', 'Unified namespace'],
    problem:
      'Data exists in dozens of machines and spreadsheets, with no consistent names, units or timestamps.',
    outcome:
      'A governed data flow from asset to enterprise, with a namespace your teams can build on.',
  },
  {
    id: 'intelligence',
    index: '03',
    name: 'Intelligence',
    full: 'AI, Machine Learning & Computer Vision',
    shape: 'lattice',
    statement:
      'Models that detect, classify and predict on industrial data — designed to be explainable and deployable.',
    technologies: ['Computer vision', 'Anomaly detection', 'Time-series ML', 'Edge inference', 'MLOps'],
    problem:
      'Manual inspection misses defects and maintenance is either too early or too late.',
    outcome:
      'A validated model on your data, an agreed accuracy target, and a path to run it on the line.',
  },
  {
    id: 'platforms',
    index: '04',
    name: 'Digital Platforms',
    full: 'Industrial Applications & Digital Platforms',
    shape: 'strata',
    statement:
      'Applications that put the right information in front of operators, engineers and managers.',
    technologies: ['Web applications', 'APIs', 'Time-series databases', 'Role-based access', 'Cloud & on-prem'],
    problem:
      'Teams reconcile production, quality and energy data by hand from systems that do not agree.',
    outcome:
      'A focused application around one operational decision, built to extend rather than replace.',
  },
  {
    id: 'physical-ai',
    index: '05',
    name: 'Physical AI',
    full: 'Digital Twins, Robotics & Physical AI',
    shape: 'arm',
    statement:
      'Simulation, robotics and perception-driven systems that act in the physical world under supervision.',
    technologies: ['Digital twins', 'Robot integration', 'Simulation', 'Perception', 'Motion planning'],
    problem:
      'A task is repetitive, variable and unsafe, but too irregular for fixed automation.',
    outcome:
      'A simulated and tested concept with clear safety boundaries before any hardware is committed.',
  },
  {
    id: 'infrastructure',
    index: '06',
    name: 'Infrastructure',
    full: 'Edge Computing & Industrial Infrastructure',
    shape: 'rack',
    statement:
      'The compute, networks and segmentation that let industrial software run reliably and securely.',
    technologies: ['Edge compute', 'Containers', 'Network segmentation', 'IEC 62443 principles', 'Remote operations'],
    problem:
      'New software needs to run near machines without exposing the control network.',
    outcome:
      'A segmented, maintainable edge architecture with monitoring and a defined update path.',
  },
];

export const capabilitiesCopy = {
  index: '04',
  eyebrow: 'Capabilities',
  headline: 'Different disciplines. One engineering mindset.',
  body: 'Industrial problems rarely respect organisational boundaries. We work across all six layers so the solution holds together.',
};
