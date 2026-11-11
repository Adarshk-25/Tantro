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

export const workCategories = [
  'PLC and DCS Engineering',
  'SCADA/HMI Development',
  'OT Cybersecurity Architecture',
  'Industrial Connectivity',
  'Edge and Industrial Data Platforms',
  'Industrial AI & Vision',
  'Industrial Software and MES',
  'Physical AI and Robotics Research',
] as const;

export type WorkStatus = 'case-study' | 'demonstration' | 'concept' | 'research';

export const statusLabels: Record<WorkStatus, string> = {
  'case-study': 'Approved case study',
  demonstration: 'Internal demonstration',
  concept: 'Concept design',
  research: 'Research',
};

export type WorkFigure = 'architecture' | 'integration' | 'vision' | 'predictive' | 'robotics' | 'control' | 'scada' | 'security' | 'mes';

export type WorkPreview = 'architecture' | 'uns' | 'vision' | 'health' | 'robotics' | 'control' | 'security' | 'alarms' | 'mes-erp';

export type WorkItem = {
  id: string;
  slug: string;
  category: (typeof workCategories)[number];
  title: string;
  status: WorkStatus;
  figure: WorkFigure;
  preview: WorkPreview;
  summary: string;
  problem: string;
  scope: string;
  deliverables: string[];
  challenge: string;
  built: string;
  howItWorks: string[];
  validation: string;
  capabilities: string[];
  approach: string[];
  stack: string[];
};

export const workItems: WorkItem[] = [
  {
    id: "w-control",
    slug: "cell-control-fault-recovery-demo",
    category: "PLC and DCS Engineering",
    title: "Production cell sequence & fault-recovery demonstrator",
    status: "demonstration",
    figure: "control",
    preview: "control",
    summary: "A browser-based demonstration of how we structure cell control: a state machine with permissives, live I/O, SCADA alarming and a guided recovery from a conveyor jam.",
    problem: "Machine sequences that are hard to read make faults slow to diagnose and changes risky.",
    scope: "Illustrative cell: conveyor, clamp, oven and guard; IDLE→COMPLETE state machine with HELD on fault. Browser simulation only.",
    deliverables: ["State-machine structure (Structured Text pattern)", "Permissive and interlock list", "I/O list with tags and addresses", "Fault diagnostic and recovery workflow"],
    challenge: "Make sequence, signals, alarms and recovery understandable as one system, while keeping safety functions clearly separate from standard control.",
    built: "The Control Engineering Explorer on this website, used to discuss control-structure standards with clients.",
    howItWorks: ["States change only when permissives are true", "A blocked photo-eye for >3 s holds the sequence", "SCADA raises a prioritised alarm with context", "Recovery returns through READY with permissives re-checked"],
    validation: "Internal demonstration (browser simulation). Not a deployed control system.",
    capabilities: ["PLC, DCS & Control", "SCADA, HMI & MES"],
    approach: ["IEC 61131-3 structured state machine", "Interlocks distinct from safety functions", "Alarm with cause and recovery guidance"],
    stack: ["IEC 61131-3 ST", "State machines", "ISA-18.2 alarm principles"],
  },
  {
    id: "w-scada",
    slug: "scada-alarm-rationalisation-approach",
    category: "SCADA/HMI Development",
    title: "High-performance SCADA & alarm rationalisation approach",
    status: "concept",
    figure: "scada",
    preview: "alarms",
    summary: "A structured approach to modernising SCADA graphics and reducing alarm load, based on ISA-101 and ISA-18.2 principles.",
    problem: "Operators face cluttered screens and alarm floods, and acknowledge alarms by reflex.",
    scope: "Method and templates for an existing SCADA: graphics hierarchy, alarm philosophy, bad-actor analysis and rationalisation workshops.",
    deliverables: ["Alarm philosophy document", "Bad-actor analysis", "Graphics hierarchy & object templates", "Rationalisation worksheet"],
    challenge: "Reduce alarm load and improve situational awareness without removing alarms operators genuinely need.",
    built: "A concept method and analysis templates; the alarm-correlation scenario in the decision lab illustrates the analysis.",
    howItWorks: ["Analyse the alarm journal against benchmarks", "Rank bad actors: chattering, standing, floods", "Rationalise each alarm: cause, consequence, response, priority", "Rebuild graphics in a level 1–4 hierarchy"],
    validation: "Concept design. Effectiveness to be measured on a real system by alarm rates before and after.",
    capabilities: ["SCADA, HMI & MES"],
    approach: ["ISA-18.2 alarm lifecycle", "ISA-101 display hierarchy", "Operator-involved rationalisation"],
    stack: ["SCADA / HMI", "Alarm & event journals", "ISA-101", "ISA-18.2"],
  },
  {
    id: "w-security",
    slug: "segmented-ot-reference-architecture",
    category: "OT Cybersecurity Architecture",
    title: "Segmented OT reference architecture (zones & conduits)",
    status: "concept",
    figure: "security",
    preview: "security",
    summary: "A reference architecture for segmenting a typical manufacturing site into zones and conduits with an industrial DMZ, secure remote access and passive monitoring.",
    problem: "Flat networks and permanent remote access expose controllers to anything on the enterprise network.",
    scope: "Reference design for a single site: zone model, conduits, DMZ services, remote-access pattern, monitoring and backup placement.",
    deliverables: ["Zone & conduit model", "Conduit/flow matrix", "DMZ service design", "Remote-access procedure", "Monitoring placement"],
    challenge: "Introduce boundaries without breaking production flows, and keep the design maintainable by site teams.",
    built: "A concept architecture, illustrated interactively by the Secure Industrial Operations Explorer.",
    howItWorks: ["Inventory assets and observe real flows first", "Group assets into zones by function and criticality", "Allow only documented flows through conduits", "Replicate data outward via the DMZ; no inbound to control"],
    validation: "Concept design applying IEC 62443 and NIST SP 800-82 principles. Not a certification or a site assessment.",
    capabilities: ["OT Cybersecurity", "Edge, Cloud & Infrastructure"],
    approach: ["Discover before changing", "Zones & conduits", "Outbound-only replication"],
    stack: ["Industrial firewalls", "Industrial DMZ", "Jump host & MFA", "Passive OT monitoring"],
  },
  {
    id: "w-mes",
    slug: "mes-erp-order-integration-pattern",
    category: "Industrial Software and MES",
    title: "MES–ERP production order integration pattern",
    status: "concept",
    figure: "mes",
    preview: "mes-erp",
    summary: "An integration pattern for sending production orders from ERP to MES and returning confirmations, consumption and scrap the same shift.",
    problem: "Orders are keyed twice and ERP learns about output and scrap days later.",
    scope: "Interface pattern between ERP and MES with line data collected through an edge layer.",
    deliverables: ["Interface specification (ISA-95 based)", "Message mapping", "Error-handling and reconciliation rules", "Test scenarios"],
    challenge: "Keep ERP and MES consistent without ever letting enterprise systems reach controllers.",
    built: "A concept pattern illustrated by the MES and ERP scenario in the connectivity explorer.",
    howItWorks: ["ERP releases orders to MES (B2MML)", "MES dispatches and collects counts via the edge", "Confirmations and consumption return to ERP", "Reconciliation catches gaps and duplicates"],
    validation: "Concept design. To be validated in an integration test environment with the client’s ERP and MES.",
    capabilities: ["SCADA, HMI & MES", "Applications & Platforms"],
    approach: ["ISA-95 information model", "Asynchronous messaging", "Reconciliation by design"],
    stack: ["ISA-95 / B2MML", "MES", "ERP APIs", "Edge acquisition"],
  },
  {
    id: 'w-architecture',
    scope: "Architecture definition for connecting 20\u201340 machines of mixed age across one site, excluding control logic changes.",
    deliverables: ["Reference architecture document", "Acquisition method per machine type", "Naming & namespace convention", "Security zone placement"],
    slug: "brownfield-connectivity-architecture",
    preview: "architecture",
    problem: "Plants want production data from mixed-generation equipment, but every new connection risks the control network and multiplies point-to-point links.",
    challenge: "Connect machines with very different interfaces (native OPC UA, vendor PLCs, and machines with only I/O) without changing control logic or opening the control zone.",
    built: "A reference architecture and decision guide: which acquisition method fits which machine, where the edge sits, and how data is named and secured.",
    howItWorks: ["Read-only acquisition per machine type at the edge", "Normalisation into one asset model and namespace", "Store-and-forward buffering across network loss", "Segmented zones with a defined conduit to IT"],
    validation: "Concept design. To be validated in a pilot against data completeness, latency and security-review criteria agreed with the plant.",
    capabilities: ["PLC, DCS & Control", "Connectivity & Data", "Edge, Cloud & Infrastructure"],
    category: "Industrial Connectivity",
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
    scope: "Demonstrator software and configuration, running against simulated OPC UA servers.",
    deliverables: ["Bridge service (containerised)", "Mapping configuration schema", "Topic structure guideline", "Demo dashboard"],
    slug: "opcua-uns-bridge",
    preview: "uns",
    problem: "Each new application needs its own connection to each machine, so integrations multiply and copies of data disagree.",
    challenge: "Map an OPC UA address space to a governed MQTT topic structure without hand-written code per machine, preserving quality and timestamps.",
    built: "An internal demonstrator that browses OPC UA servers, applies a configuration-driven mapping, and publishes changes to a unified namespace.",
    howItWorks: ["Browse the address space and select nodes by rule", "Map nodes to enterprise/site/area/line/asset topics", "Publish by exception with quality and source timestamp", "Subscribers join without new point-to-point links"],
    validation: "Internal demonstration on simulated machines. Not yet deployed at a customer site.",
    capabilities: ["Connectivity & Data", "Applications & Platforms"],
    category: "Edge and Industrial Data Platforms",
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
    scope: "End-to-end pipeline from capture to stored verdict, on public and synthetic images.",
    deliverables: ["Inference pipeline", "Alignment and region scoring", "Threshold calibration notebook", "Traceability data model"],
    slug: "surface-defect-inspection-pipeline",
    preview: "vision",
    problem: "Manual end-of-line inspection misses fine surface defects, and results are not linked to how each part was made.",
    challenge: "Build the full path (capture, alignment, inference, decision, traceability) so model accuracy is not the only thing being tested.",
    built: "An end-to-end inspection pipeline running on public and synthetic defect images, designed for an edge GPU.",
    howItWorks: ["Triggered capture with part ID from the PLC", "Alignment to part geometry before inference", "Region-level classification with calibrated thresholds", "Verdict, confidence and image reference stored per part"],
    validation: "Internal demonstration on public and synthetic data. Accuracy on a real line must be established with that line's own parts and lighting.",
    capabilities: ["Industrial AI & Analytics", "Edge, Cloud & Infrastructure"],
    category: "Industrial AI & Vision",
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
    scope: "Method research on rotating-equipment condition baselines using public datasets.",
    deliverables: ["Feature extraction methods", "State-aware baseline approach", "Illustrative health-index design", "Evaluation notes"],
    slug: "rotating-equipment-baselines",
    preview: "health",
    problem: "Failure examples are rare in most plants, so supervised failure prediction is often impractical.",
    challenge: "Detect meaningful deviation early using only healthy operation, while keeping explanations an engineer can verify.",
    built: "Research into operating-state-aware baselines and frequency-band features, combined into an illustrative composite health index.",
    howItWorks: ["Segment data by operating state", "Learn band-energy baselines per state", "Score deviation and combine into a health index", "Project degradation with an uncertainty band"],
    validation: "Research. Methods are evaluated on public bearing datasets; no plant results are claimed.",
    capabilities: ["Industrial AI & Analytics"],
    category: "Industrial AI & Vision",
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
    scope: "Simulation study of a supervised pick task; no hardware.",
    deliverables: ["Simulation scene", "Perception & planning loop", "Confidence-threshold design", "Supervision concept"],
    slug: "perception-to-motion-simulation",
    preview: "robotics",
    problem: "Variable pick-and-place tasks are hard to automate safely with fixed programs.",
    challenge: "Close the loop from perception to motion while keeping humans in control of uncertain decisions.",
    built: "A simulated pick task used to study perception, planning, confidence thresholds and supervision before any hardware.",
    howItWorks: ["Randomised scenes generate perception data", "Grasp and path are planned around obstacles", "Low-confidence steps require operator approval", "Safety zones act as hard constraints"],
    validation: "Research in simulation only.",
    capabilities: ["Physical AI & Robotics", "Industrial AI & Analytics"],
    category: "Physical AI and Robotics Research",
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
  index: '08',
  eyebrow: 'Engineering work',
  headline: 'Ideas become valuable when they work.',
  body: 'We label our work for what it is. Approved client case studies will appear here once our clients agree to publish them.',
  emptyCaseStudies:
    'No client case studies are published yet. We only publish results our clients have approved.',
};

export const workBySlug = (slug: string) => workItems.find((w) => w.slug === slug);
