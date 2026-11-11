export type CapabilityShape = 'gear' | 'mesh' | 'lattice' | 'strata' | 'arm' | 'rack';

export type Capability = {
  id: string;
  index: string;
  name: string;
  full: string;
  shape: CapabilityShape;
  statement: string;
  scope: string[];
  technologies: string[];
  problem: string;
  outcome: string;
  value: string;
};

export const capabilities: Capability[] = [
  {
    id: 'automation',
    index: '01',
    name: 'Automation',
    full: 'Industrial Automation & OT Integration',
    shape: 'gear',
    statement:
      'Control systems engineered for deterministic behaviour, safe change and long service lives — from PLC logic to supervisory control.',
    scope: [
      'PLC / DCS programming, integration and migration',
      'SCADA and HMI strategy, ISA-101 high-performance graphics',
      'Alarm management, interlocks and process visibility',
      'Control-system modernisation with staged cut-overs',
      'Machine and line integration across vendors',
    ],
    technologies: ['IEC 61131-3', 'PLC / DCS', 'SCADA / HMI', 'ISA-88 / ISA-101', 'ISA-18.2', 'Drives & motion'],
    problem: 'A line runs on undocumented logic and an obsolete SCADA; every change is slow, risky and depends on one person.',
    outcome: 'A documented, modernised control layer with templated objects, a rationalised alarm system and defined interfaces.',
    value: 'Lower change risk, faster commissioning and a control layer that is ready for data and further automation.',
  },
  {
    id: 'connectivity',
    index: '02',
    name: 'Connectivity',
    full: 'Industrial Data Engineering & Connectivity',
    shape: 'mesh',
    statement:
      'Reliable, contextualised data out of mixed-vendor, mixed-age equipment — governed so that every application can trust it.',
    scope: [
      'Brownfield connectivity and protocol interoperability',
      'Asset models and ISA-95 hierarchies',
      'Edge normalisation, buffering and data quality',
      'Unified namespace and historian strategy',
      'Time-series pipelines into analytics and enterprise systems',
    ],
    technologies: ['OPC UA', 'MQTT / Sparkplug B', 'Modbus · S7 · CIP', 'MTConnect', 'Historians', 'Time-series stores'],
    problem: 'Data sits in dozens of machines and spreadsheets with no consistent names, units, timestamps or context.',
    outcome: 'A governed data flow from asset to enterprise, with a namespace and asset model your teams build on.',
    value: 'Every new use case starts from trusted data instead of a new integration project.',
  },
  {
    id: 'intelligence',
    index: '03',
    name: 'Intelligence',
    full: 'Industrial AI, Machine Learning & Computer Vision',
    shape: 'lattice',
    statement:
      'Models that detect, classify, predict and advise on industrial data — explainable to engineers and deployable on the line.',
    scope: [
      'Predictive maintenance and health indices',
      'Computer vision for inspection and measurement',
      'Statistical learning for process drift and quality',
      'Root-cause and advisory analytics',
      'AI-assisted decisions with humans in the loop',
    ],
    technologies: ['Time-series ML', 'Anomaly detection', 'Computer vision', 'SPC / Cpk', 'Edge inference', 'MLOps'],
    problem: 'Inspection misses fine defects, and maintenance happens either too early or too late.',
    outcome: 'A validated model on your data against an agreed accuracy target, with a path to run and monitor it in production.',
    value: 'Decisions based on evidence — earlier warnings, fewer escapes and less wasted maintenance.',
  },
  {
    id: 'platforms',
    index: '04',
    name: 'Digital Platforms',
    full: 'Industrial Applications & Digital Platforms',
    shape: 'strata',
    statement:
      'Software that puts the right information in front of operators, engineers and managers — and closes the loop into work.',
    scope: [
      'Operations portals and industrial data applications',
      'Role-based dashboards and shift handover tools',
      'Workflow systems for maintenance and quality',
      'Digital twins of lines and processes',
      'Command and control layers across sites',
    ],
    technologies: ['Web applications', 'APIs & events', 'Time-series databases', 'Digital twins', 'Role-based access', 'Cloud & on-prem'],
    problem: 'Teams reconcile production, quality and energy data by hand from systems that do not agree.',
    outcome: 'A focused application around one operational decision, designed to extend rather than replace existing systems.',
    value: 'Less time assembling information, more time acting on it — with one version of the truth.',
  },
  {
    id: 'physical-ai',
    index: '05',
    name: 'Physical AI',
    full: 'Digital Twins, Robotics & Physical AI',
    shape: 'arm',
    statement:
      'Systems that perceive, reason and act in the physical world — simulated first, supervised always.',
    scope: [
      'Perception: vision, depth and scene understanding',
      'Task reasoning and motion planning',
      'Simulation and synthetic data before hardware',
      'Robot integration and orchestration',
      'Human-in-the-loop supervision and safety design',
    ],
    technologies: ['Simulation', 'ROS 2', 'Perception', 'Motion planning', 'Robot integration', 'Functional safety'],
    problem: 'A task is repetitive, variable and ergonomically hard — too irregular for fixed automation.',
    outcome: 'A simulated, tested concept with clear safety boundaries and success criteria before hardware is committed.',
    value: 'Automation of variable tasks with risk retired early, in simulation, not on the shop floor.',
  },
  {
    id: 'infrastructure',
    index: '06',
    name: 'Infrastructure',
    full: 'Edge Computing & Industrial Infrastructure',
    shape: 'rack',
    statement:
      'The compute, networks and security zoning that let industrial software run reliably — and safely next to control.',
    scope: [
      'Edge runtimes and container orchestration',
      'Security zoning and conduits (IEC 62443 principles)',
      'Industrial DMZ and cloud connectivity patterns',
      'Data platforms and deployment models',
      'Observability, updates and remote operations',
    ],
    technologies: ['Edge compute', 'Containers', 'IEC 62443', 'Industrial DMZ', 'Observability', 'Hybrid cloud'],
    problem: 'New software needs to run near machines without exposing the control network or creating unmanaged boxes.',
    outcome: 'A segmented, monitored edge architecture with a defined update path and clear ownership.',
    value: 'Industrial software that stays secure, observable and maintainable for years.',
  },
];

export const capabilitiesCopy = {
  index: '04',
  eyebrow: 'Capabilities',
  title: (
    'Different disciplines. One engineering mindset.'
  ),
  lede: 'Industrial problems rarely respect organisational boundaries. We work across all six layers, so the solution holds together from the machine to the business.',
};
