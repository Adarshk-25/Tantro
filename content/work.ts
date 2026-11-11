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

export type WorkPreview = 'architecture' | 'uns' | 'vision' | 'health' | 'robotics';

export type WorkItem = {
  id: string;
  slug: string;
  category: string;
  title: string;
  status: WorkStatus;
  figure: WorkFigure;
  preview: WorkPreview;
  summary: string;
  problem: string;
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
    id: 'w-architecture',
    slug: "brownfield-connectivity-architecture",
    preview: "architecture",
    problem: "Plants want production data from mixed-generation equipment, but every new connection risks the control network and multiplies point-to-point links.",
    challenge: "Connect machines with very different interfaces (native OPC UA, vendor PLCs, and machines with only I/O) without changing control logic or opening the control zone.",
    built: "A reference architecture and decision guide: which acquisition method fits which machine, where the edge sits, and how data is named and secured.",
    howItWorks: ["Read-only acquisition per machine type at the edge", "Normalisation into one asset model and namespace", "Store-and-forward buffering across network loss", "Segmented zones with a defined conduit to IT"],
    validation: "Concept design. To be validated in a pilot against data completeness, latency and security-review criteria agreed with the plant.",
    capabilities: ["Automation", "Connectivity", "Infrastructure"],
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
    slug: "opcua-uns-bridge",
    preview: "uns",
    problem: "Each new application needs its own connection to each machine, so integrations multiply and copies of data disagree.",
    challenge: "Map an OPC UA address space to a governed MQTT topic structure without hand-written code per machine, preserving quality and timestamps.",
    built: "An internal demonstrator that browses OPC UA servers, applies a configuration-driven mapping, and publishes changes to a unified namespace.",
    howItWorks: ["Browse the address space and select nodes by rule", "Map nodes to enterprise/site/area/line/asset topics", "Publish by exception with quality and source timestamp", "Subscribers join without new point-to-point links"],
    validation: "Internal demonstration on simulated machines. Not yet deployed at a customer site.",
    capabilities: ["Connectivity", "Digital Platforms"],
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
    slug: "surface-defect-inspection-pipeline",
    preview: "vision",
    problem: "Manual end-of-line inspection misses fine surface defects, and results are not linked to how each part was made.",
    challenge: "Build the full path (capture, alignment, inference, decision, traceability) so model accuracy is not the only thing being tested.",
    built: "An end-to-end inspection pipeline running on public and synthetic defect images, designed for an edge GPU.",
    howItWorks: ["Triggered capture with part ID from the PLC", "Alignment to part geometry before inference", "Region-level classification with calibrated thresholds", "Verdict, confidence and image reference stored per part"],
    validation: "Internal demonstration on public and synthetic data. Accuracy on a real line must be established with that line's own parts and lighting.",
    capabilities: ["Intelligence", "Infrastructure"],
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
    slug: "rotating-equipment-baselines",
    preview: "health",
    problem: "Failure examples are rare in most plants, so supervised failure prediction is often impractical.",
    challenge: "Detect meaningful deviation early using only healthy operation, while keeping explanations an engineer can verify.",
    built: "Research into operating-state-aware baselines and frequency-band features, combined into an illustrative composite health index.",
    howItWorks: ["Segment data by operating state", "Learn band-energy baselines per state", "Score deviation and combine into a health index", "Project degradation with an uncertainty band"],
    validation: "Research. Methods are evaluated on public bearing datasets; no plant results are claimed.",
    capabilities: ["Intelligence"],
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
    slug: "perception-to-motion-simulation",
    preview: "robotics",
    problem: "Variable pick-and-place tasks are hard to automate safely with fixed programs.",
    challenge: "Close the loop from perception to motion while keeping humans in control of uncertain decisions.",
    built: "A simulated pick task used to study perception, planning, confidence thresholds and supervision before any hardware.",
    howItWorks: ["Randomised scenes generate perception data", "Grasp and path are planned around obstacles", "Low-confidence steps require operator approval", "Safety zones act as hard constraints"],
    validation: "Research in simulation only.",
    capabilities: ["Physical AI", "Intelligence"],
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

export const workBySlug = (slug: string) => workItems.find((w) => w.slug === slug);
