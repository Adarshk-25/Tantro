export type CapabilityShape = 'gear' | 'screens' | 'shield' | 'mesh' | 'lattice' | 'strata' | 'rack' | 'arm';

export type Capability = {
  id: string;
  index: string;
  name: string;
  full: string;
  shape: CapabilityShape;
  link: string;
  statement: string;
  challenge: string;
  services: string[];
  approach: string;
  technologies: string[];
  deliverables: string[];
  outcomes: string;
};

export const capabilities: Capability[] = [
  {
    id: 'control',
    index: '01',
    name: 'PLC, DCS & Control',
    full: 'PLC, DCS & Control Engineering',
    shape: 'gear',
    link: '#automation',
    statement: 'Control logic and process control engineered for deterministic behaviour, safe change and long service lives.',
    challenge: 'Machines and processes run on logic that is undocumented, ageing or held by one person — so every change is slow and risky.',
    services: ['PLC programming, modification and migration', 'DCS configuration and control modules', 'Sequences, interlocks, permissives and PID', 'Simulation, FAT, SAT and commissioning'],
    approach: 'Specify first (FDS, I/O list, control narrative), build against IEC 61131-3 structure, test in simulation, then commission in staged steps.',
    technologies: ['IEC 61131-3', 'ISA-88', 'PID control', 'Fieldbus & I/O', 'Simulation'],
    deliverables: ['Functional design specification', 'Commented, structured control code', 'I/O list & cause-and-effect', 'FAT/SAT records'],
    outcomes: 'Predictable machine and process behaviour, faster changes, and documentation the site team can maintain.',
  },
  {
    id: 'scada',
    index: '02',
    name: 'SCADA, HMI & MES',
    full: 'SCADA, HMI & MES',
    shape: 'screens',
    link: '#svc-scada',
    statement: 'Supervision and production systems that give operators clarity and give the business reliable production data.',
    challenge: 'Ageing SCADA, cluttered graphics and alarm floods — and production data that never reaches planning on time.',
    services: ['SCADA architecture and development', 'High-performance HMI graphics and alarm management', 'Historisation, trends and reporting', 'MES integration with orders, genealogy and OEE'],
    approach: 'Templated objects and ISA-101 graphic principles, an alarm philosophy per ISA-18.2, and ISA-95 based exchange with MES and ERP.',
    technologies: ['SCADA / HMI', 'ISA-101', 'ISA-18.2', 'ISA-95 / B2MML', 'Historians'],
    deliverables: ['SCADA application & object library', 'Alarm philosophy and rationalised alarm list', 'MES interface specification', 'Operator training material'],
    outcomes: 'Operators see what matters; production performance reaches planning the same shift.',
  },
  {
    id: 'security',
    index: '03',
    name: 'OT Cybersecurity',
    full: 'OT Cybersecurity & Secure Infrastructure',
    shape: 'shield',
    link: '#security',
    statement: 'Protecting industrial systems with security designed around safety, availability and operational continuity.',
    challenge: 'Flat networks, unmanaged remote access and unknown assets — in systems that cannot simply be patched or rebooted.',
    services: ['OT asset inventory and security assessment', 'Zones, conduits and industrial DMZ design', 'System hardening and secure remote access', 'Monitoring, backup and recovery readiness'],
    approach: 'Discover before changing, segment by function and criticality, harden what can be hardened, monitor passively, and rehearse recovery.',
    technologies: ['IEC 62443 principles', 'NIST SP 800-82', 'Industrial firewalls', 'Passive OT monitoring', 'Secure remote access'],
    deliverables: ['Asset inventory & risk register', 'Target zone/conduit architecture', 'Firewall rule review', 'Recovery runbooks'],
    outcomes: 'Reduced exposure, controlled access and a plant that can recover — without disrupting production.',
  },
  {
    id: 'connectivity',
    index: '04',
    name: 'Connectivity & Data',
    full: 'Industrial Connectivity & Data Engineering',
    shape: 'mesh',
    link: '#connectivity',
    statement: 'Reliable, contextualised data out of mixed-vendor, mixed-age equipment — governed so every application can trust it.',
    challenge: 'Data sits in dozens of machines and spreadsheets with no consistent names, units, timestamps or context.',
    services: ['Brownfield connectivity and protocol interoperability', 'Asset models and unified namespace', 'Edge normalisation and buffering', 'Historian and time-series pipelines'],
    approach: 'Read-only acquisition at the edge, one asset model and naming convention, outbound flows through the DMZ.',
    technologies: ['OPC UA', 'MQTT / Sparkplug B', 'Modbus · S7 · CIP', 'Historians', 'ISA-95 models'],
    deliverables: ['Data architecture', 'Namespace & tag mapping', 'Edge deployment', 'Data quality rules'],
    outcomes: 'Every new use case starts from trusted data instead of a new integration project.',
  },
  {
    id: 'ai',
    index: '05',
    name: 'Industrial AI & Analytics',
    full: 'Industrial AI, ML & Advanced Analytics',
    shape: 'lattice',
    link: '#intelligence',
    statement: 'Models that detect, classify, predict and advise on industrial data — explainable to engineers and deployable on the line.',
    challenge: 'Inspection misses fine defects, maintenance is mistimed, and analysis of losses takes weeks.',
    services: ['Predictive maintenance and health indices', 'Computer vision inspection', 'Process drift, SPC and root-cause assistance', 'Production and energy analytics'],
    approach: 'Agree the decision and accuracy target first, validate on site data, deploy with monitoring, keep a human in the loop.',
    technologies: ['Time-series ML', 'Computer vision', 'SPC / Cpk', 'Edge inference', 'MLOps'],
    deliverables: ['Validated model & evaluation report', 'Inference service', 'Monitoring & drift alerts', 'Operator-facing explanation'],
    outcomes: 'Earlier warnings, fewer escapes and decisions based on evidence — with uncertainty made visible.',
  },
  {
    id: 'platforms',
    index: '06',
    name: 'Applications & Platforms',
    full: 'Industrial Applications & Digital Platforms',
    shape: 'strata',
    link: '#work',
    statement: 'Software that puts the right information in front of operators, engineers and managers — and closes the loop into work.',
    challenge: 'Teams reconcile production, quality and energy data by hand from systems that do not agree.',
    services: ['Operations portals and industrial data apps', 'Maintenance and quality workflows', 'Shift handover and reporting', 'Digital twins of lines and processes'],
    approach: 'Build around one operational decision, integrate with existing systems through APIs and the namespace, extend iteratively.',
    technologies: ['Web applications', 'APIs & events', 'Time-series databases', 'Role-based access', 'Digital twins'],
    deliverables: ['Application & source code', 'Integration interfaces', 'User & admin documentation', 'Support plan'],
    outcomes: 'Less time assembling information, more time acting on it.',
  },
  {
    id: 'infrastructure',
    index: '07',
    name: 'Edge, Cloud & Infrastructure',
    full: 'Edge, Cloud & Industrial Infrastructure',
    shape: 'rack',
    link: '#connectivity',
    statement: 'The compute, networks and deployment patterns that let industrial software run reliably — and safely next to control.',
    challenge: 'New software needs to run near machines without exposing the control network or creating unmanaged boxes.',
    services: ['Edge runtimes and container platforms', 'Industrial DMZ and hybrid-cloud patterns', 'Server and virtualisation design', 'Observability and update management'],
    approach: 'Segmented placement, declared workloads, monitored hosts and a defined update path agreed with operations.',
    technologies: ['Edge compute', 'Containers', 'Virtualisation', 'Industrial DMZ', 'Observability'],
    deliverables: ['Infrastructure design', 'Deployment automation', 'Monitoring dashboards', 'Operations runbooks'],
    outcomes: 'Industrial software that stays secure, observable and maintainable for years.',
  },
  {
    id: 'physical-ai',
    index: '08',
    name: 'Physical AI & Robotics',
    full: 'Physical AI, Robotics & Advanced Systems',
    shape: 'arm',
    link: '#innovation',
    statement: 'Systems that perceive, reason and act in the physical world — simulated first, supervised always.',
    challenge: 'A task is repetitive, variable and ergonomically hard — too irregular for fixed automation.',
    services: ['Robot integration and cell design', 'Perception and scene understanding', 'Simulation and motion planning', 'Human-in-the-loop supervision design'],
    approach: 'Prove the task in simulation, define confidence thresholds and safety boundaries, then integrate on hardware with the site.',
    technologies: ['ROS 2', 'Simulation', 'Perception', 'Motion planning', 'Functional safety'],
    deliverables: ['Simulation & feasibility report', 'Cell concept and safety concept inputs', 'Integration plan', 'Pilot results'],
    outcomes: 'Automation of variable tasks with risk retired early, in simulation rather than on the shop floor.',
  },
];

export const capabilitiesCopy = {
  index: '06',
  eyebrow: 'Capabilities',
  title: 'Different disciplines. One engineering mindset.',
  lede: 'From a single PLC change to an enterprise data platform: eight disciplines, engineered to depend on each other — from the machine to the business.',
};
