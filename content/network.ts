/**
 * Chapter 02 — scenario-driven industrial connectivity explorer.
 * Every scenario is an architecture pattern, not a claim about a specific site.
 */

export type Lane = 'source' | 'control' | 'edge' | 'platform' | 'consumer';
export type IconName =
  | 'plc'
  | 'robot'
  | 'cnc'
  | 'sensor'
  | 'camera'
  | 'meter'
  | 'drive'
  | 'scada'
  | 'hmi'
  | 'gateway'
  | 'broker'
  | 'chip'
  | 'db'
  | 'cloud'
  | 'app'
  | 'ai'
  | 'user'
  | 'erp'
  | 'model'
  | 'shield';

export const lanes: { id: Lane; label: string; hint: string }[] = [
  { id: 'source', label: 'Physical sources', hint: 'Machines, sensors, utilities' },
  { id: 'control', label: 'Control layer', hint: 'PLC, DCS, SCADA, HMI' },
  { id: 'edge', label: 'Edge & integration', hint: 'Acquire, normalise, protect' },
  { id: 'platform', label: 'Data & applications', hint: 'Context, storage, models' },
  { id: 'consumer', label: 'Data consumers', hint: 'People and systems that act' },
];

/** Security zones span lanes. */
export const zones = [
  { id: 'ot', label: 'OT zone', from: 'source' as Lane, to: 'control' as Lane },
  { id: 'dmz', label: 'Industrial DMZ', from: 'edge' as Lane, to: 'edge' as Lane },
  { id: 'it', label: 'IT / cloud zone', from: 'platform' as Lane, to: 'consumer' as Lane },
];

export type ScenarioNode = { id: string; lane: Lane; label: string; sub: string; icon: IconName };
export type ScenarioLink = { from: string; to: string; label: string };

export type Scenario = {
  id: string;
  name: string;
  short: string;
  challenge: string;
  approach: string;
  outcome: string;
  tech: string[];
  nodes: ScenarioNode[];
  links: ScenarioLink[];
};

export const scenarios: Scenario[] = [
  {
    id: 'brownfield',
    name: 'Brownfield machine connectivity',
    short: 'Mixed-age machines, no common interface',
    challenge: 'Twenty years of equipment from different vendors: some with OPC UA, some with only I/O, some with nothing but a stack light.',
    approach: 'Read-only acquisition through the right interface for each machine — native OPC UA, protocol drivers, or retrofit I/O — normalised at the edge into one asset model.',
    outcome: 'Every machine reports state, counts and alarms in the same structure, without touching the control logic.',
    tech: ['OPC UA', 'Modbus TCP', 'S7 / EtherNet/IP drivers', 'Retrofit I/O', 'Asset model'],
    nodes: [
      { id: 'm1', lane: 'source', label: 'Modern CNC', sub: 'Native OPC UA', icon: 'cnc' },
      { id: 'm2', lane: 'source', label: 'Legacy press', sub: 'Stack light only', icon: 'drive' },
      { id: 'm3', lane: 'source', label: 'Assembly cell', sub: 'Vendor PLC', icon: 'robot' },
      { id: 'io', lane: 'control', label: 'Retrofit I/O', sub: 'Signals tapped, not rewired', icon: 'sensor' },
      { id: 'plc', lane: 'control', label: 'Cell PLC', sub: 'S7 / EtherNet/IP', icon: 'plc' },
      { id: 'gw', lane: 'edge', label: 'Edge gateway', sub: 'Drivers · normalisation', icon: 'gateway' },
      { id: 'model', lane: 'platform', label: 'Asset model', sub: 'Machine → line → site', icon: 'model' },
      { id: 'hist', lane: 'platform', label: 'Time-series store', sub: 'State, counts, alarms', icon: 'db' },
      { id: 'ops', lane: 'consumer', label: 'Operations views', sub: 'Status and losses', icon: 'app' },
    ],
    links: [
      { from: 'm1', to: 'gw', label: 'OPC UA' },
      { from: 'm2', to: 'io', label: 'Digital I/O' },
      { from: 'm3', to: 'plc', label: 'Fieldbus' },
      { from: 'io', to: 'gw', label: 'Modbus TCP' },
      { from: 'plc', to: 'gw', label: 'S7 / CIP driver' },
      { from: 'gw', to: 'model', label: 'Normalised tags' },
      { from: 'model', to: 'hist', label: 'Contextualised' },
      { from: 'hist', to: 'ops', label: 'Query API' },
    ],
  },
  {
    id: 'scada',
    name: 'SCADA modernisation',
    short: 'Ageing SCADA, isolated HMIs',
    challenge: 'An end-of-life SCADA with hard-coded screens, local alarm logs and no way to share data beyond the control room.',
    approach: 'Migrate to a modern, standards-based SCADA with templated objects, ISA-101 style graphics and an alarm philosophy — then expose its data through a secure interface instead of point-to-point links.',
    outcome: 'Supervision that operators trust, alarms that mean something, and a clean data path to the rest of the business.',
    tech: ['SCADA / HMI', 'ISA-101 graphics', 'ISA-18.2 alarms', 'Redundant servers', 'OPC UA'],
    nodes: [
      { id: 'p1', lane: 'source', label: 'Process area A', sub: 'Pumps, valves', icon: 'drive' },
      { id: 'p2', lane: 'source', label: 'Process area B', sub: 'Tanks, analysers', icon: 'sensor' },
      { id: 'plc1', lane: 'control', label: 'PLC / DCS', sub: 'Deterministic control', icon: 'plc' },
      { id: 'scada', lane: 'control', label: 'SCADA servers', sub: 'Redundant pair', icon: 'scada' },
      { id: 'hmi', lane: 'control', label: 'Operator HMIs', sub: 'High-performance graphics', icon: 'hmi' },
      { id: 'dmz', lane: 'edge', label: 'DMZ data server', sub: 'Read-only replica', icon: 'shield' },
      { id: 'alarm', lane: 'platform', label: 'Alarm analytics', sub: 'Flood, chatter, standing', icon: 'ai' },
      { id: 'hist', lane: 'platform', label: 'Historian', sub: 'Process history', icon: 'db' },
      { id: 'eng', lane: 'consumer', label: 'Engineering & reliability', sub: 'Reports, KPIs', icon: 'user' },
    ],
    links: [
      { from: 'p1', to: 'plc1', label: 'Fieldbus' },
      { from: 'p2', to: 'plc1', label: '4–20 mA / HART' },
      { from: 'plc1', to: 'scada', label: 'OPC UA' },
      { from: 'scada', to: 'hmi', label: 'Clients' },
      { from: 'scada', to: 'dmz', label: 'One-way publish' },
      { from: 'dmz', to: 'hist', label: 'Replicated' },
      { from: 'dmz', to: 'alarm', label: 'Alarm events' },
      { from: 'hist', to: 'eng', label: 'Reports' },
      { from: 'alarm', to: 'eng', label: 'Bad-actor list' },
    ],
  },
  {
    id: 'uns',
    name: 'Unified namespace (MQTT)',
    short: 'Point-to-point spaghetti',
    challenge: 'Every new application needs its own connection to every machine. Integrations multiply; nobody knows which copy of the data is right.',
    approach: 'Publish once to a governed namespace — enterprise/site/area/line/asset — using MQTT with Sparkplug B or a defined JSON schema. Applications subscribe; producers and consumers are decoupled.',
    outcome: 'One current, structured view of operations that new applications can join without new integrations.',
    tech: ['MQTT', 'Sparkplug B', 'ISA-95 hierarchy', 'Topic governance', 'Schema registry'],
    nodes: [
      { id: 'l1', lane: 'source', label: 'Line 1 assets', sub: 'PLCs, robots', icon: 'robot' },
      { id: 'l2', lane: 'source', label: 'Line 2 assets', sub: 'CNC, vision', icon: 'cnc' },
      { id: 'util', lane: 'source', label: 'Utilities', sub: 'Energy, air, water', icon: 'meter' },
      { id: 'edge1', lane: 'edge', label: 'Edge nodes', sub: 'Report by exception', icon: 'gateway' },
      { id: 'broker', lane: 'edge', label: 'MQTT broker', sub: 'Unified namespace', icon: 'broker' },
      { id: 'mes', lane: 'platform', label: 'MES', sub: 'Orders, genealogy', icon: 'erp' },
      { id: 'lake', lane: 'platform', label: 'Data platform', sub: 'History and features', icon: 'db' },
      { id: 'apps', lane: 'consumer', label: 'New applications', sub: 'Subscribe, don’t integrate', icon: 'app' },
      { id: 'ai', lane: 'consumer', label: 'Analytics & AI', sub: 'Models on live context', icon: 'ai' },
    ],
    links: [
      { from: 'l1', to: 'edge1', label: 'OPC UA' },
      { from: 'l2', to: 'edge1', label: 'OPC UA / MTConnect' },
      { from: 'util', to: 'edge1', label: 'Modbus' },
      { from: 'edge1', to: 'broker', label: 'Sparkplug B' },
      { from: 'broker', to: 'mes', label: 'Subscribe' },
      { from: 'broker', to: 'lake', label: 'Subscribe' },
      { from: 'broker', to: 'apps', label: 'Subscribe' },
      { from: 'lake', to: 'ai', label: 'Features' },
    ],
  },
  {
    id: 'edge-ai',
    name: 'Edge AI deployment',
    short: 'Models that must run next to the machine',
    challenge: 'A model works in a notebook, but the plant needs answers in milliseconds, with no dependence on the cloud and no risk to control.',
    approach: 'Package the model as a versioned container on an industrial edge computer, feed it live data, and return advisories — not control commands — to the PLC or operator, with monitoring for drift.',
    outcome: 'Low-latency inference that is observable, updatable and safe by design.',
    tech: ['Containers', 'ONNX / TensorRT', 'Model registry', 'Drift monitoring', 'PLC advisory tags'],
    nodes: [
      { id: 's1', lane: 'source', label: 'Machine signals', sub: 'Vibration, current, temp', icon: 'sensor' },
      { id: 'plc', lane: 'control', label: 'PLC', sub: 'Keeps control authority', icon: 'plc' },
      { id: 'edge', lane: 'edge', label: 'Edge runtime', sub: 'Containerised inference', icon: 'chip' },
      { id: 'mon', lane: 'edge', label: 'Model monitor', sub: 'Drift, latency, health', icon: 'shield' },
      { id: 'reg', lane: 'platform', label: 'Model registry', sub: 'Versions, approvals', icon: 'model' },
      { id: 'train', lane: 'platform', label: 'Training pipeline', sub: 'Labelled history', icon: 'ai' },
      { id: 'op', lane: 'consumer', label: 'Operator advisory', sub: 'Explained, acknowledged', icon: 'user' },
    ],
    links: [
      { from: 's1', to: 'plc', label: 'I/O' },
      { from: 'plc', to: 'edge', label: 'OPC UA read' },
      { from: 'edge', to: 'plc', label: 'Advisory tag (read by PLC logic)' },
      { from: 'edge', to: 'mon', label: 'Metrics' },
      { from: 'reg', to: 'edge', label: 'Signed deploy' },
      { from: 'mon', to: 'train', label: 'Drift → retrain' },
      { from: 'train', to: 'reg', label: 'New version' },
      { from: 'edge', to: 'op', label: 'Recommendation' },
    ],
  },
  {
    id: 'vision',
    name: 'Vision system integration',
    short: 'Images without context',
    challenge: 'Cameras pass or fail parts, but images and verdicts are stranded on the station PC — not linked to part, batch or machine state.',
    approach: 'Run inference on an edge GPU, trigger and reject through the PLC, and send verdict, confidence and image reference to MES against the part ID. Images go to managed storage for review and retraining.',
    outcome: 'Traceable quality: every verdict is explainable, searchable and connected to how the part was made.',
    tech: ['GigE Vision', 'Edge GPU', 'PLC handshake', 'MES genealogy', 'Image storage'],
    nodes: [
      { id: 'cam', lane: 'source', label: 'Cameras & lighting', sub: 'Triggered capture', icon: 'camera' },
      { id: 'enc', lane: 'source', label: 'Conveyor encoder', sub: 'Part position', icon: 'drive' },
      { id: 'plc', lane: 'control', label: 'Line PLC', sub: 'Trigger · reject gate', icon: 'plc' },
      { id: 'gpu', lane: 'edge', label: 'Inference node', sub: 'Edge GPU', icon: 'chip' },
      { id: 'mes', lane: 'platform', label: 'MES', sub: 'Verdict per part ID', icon: 'erp' },
      { id: 'img', lane: 'platform', label: 'Image store', sub: 'Review, retraining', icon: 'db' },
      { id: 'qa', lane: 'consumer', label: 'Quality engineers', sub: 'Defect Pareto, review', icon: 'user' },
    ],
    links: [
      { from: 'enc', to: 'plc', label: 'HSC input' },
      { from: 'plc', to: 'cam', label: 'Trigger' },
      { from: 'cam', to: 'gpu', label: 'GigE frames' },
      { from: 'gpu', to: 'plc', label: 'Pass / reject' },
      { from: 'gpu', to: 'mes', label: 'Verdict + confidence' },
      { from: 'gpu', to: 'img', label: 'Image + metadata' },
      { from: 'mes', to: 'qa', label: 'Traceability' },
      { from: 'img', to: 'qa', label: 'Review queue' },
    ],
  },
  {
    id: 'energy',
    name: 'Energy & utilities monitoring',
    short: 'Energy known only from the monthly bill',
    challenge: 'Electricity, compressed air, steam and water are metered at the boundary — if at all — so nobody can tie consumption to what was produced.',
    approach: 'Sub-meter significant energy users, acquire meters over Modbus or M-Bus at the edge, and align consumption with production state and output in time.',
    outcome: 'Energy per unit, idle consumption and baselines that support ISO 50001-style improvement.',
    tech: ['Modbus RTU/TCP', 'M-Bus', 'Power quality meters', 'Production context', 'EnPI baselines'],
    nodes: [
      { id: 'mt', lane: 'source', label: 'Electrical sub-meters', sub: 'Feeders, machines', icon: 'meter' },
      { id: 'air', lane: 'source', label: 'Compressed air', sub: 'Flow, pressure', icon: 'sensor' },
      { id: 'steam', lane: 'source', label: 'Steam & water', sub: 'Flow meters', icon: 'drive' },
      { id: 'plc', lane: 'control', label: 'Line PLCs', sub: 'Run state, output', icon: 'plc' },
      { id: 'gw', lane: 'edge', label: 'Edge gateway', sub: 'Meter polling, buffering', icon: 'gateway' },
      { id: 'ctx', lane: 'platform', label: 'Contextualisation', sub: 'kWh ↔ state ↔ units', icon: 'model' },
      { id: 'ts', lane: 'platform', label: 'Energy history', sub: '15-minute and live', icon: 'db' },
      { id: 'em', lane: 'consumer', label: 'Energy manager', sub: 'Baselines, savings', icon: 'user' },
    ],
    links: [
      { from: 'mt', to: 'gw', label: 'Modbus TCP' },
      { from: 'air', to: 'gw', label: '4–20 mA via I/O' },
      { from: 'steam', to: 'gw', label: 'M-Bus' },
      { from: 'plc', to: 'gw', label: 'OPC UA' },
      { from: 'gw', to: 'ctx', label: 'Time-aligned' },
      { from: 'ctx', to: 'ts', label: 'EnPIs' },
      { from: 'ts', to: 'em', label: 'Dashboards, alerts' },
    ],
  },
  {
    id: 'context',
    name: 'Production data contextualisation',
    short: 'Tags without meaning',
    challenge: 'Thousands of tags named like "DB12.DBW40". Data exists, but nobody can tell which order, product or shift a value belongs to.',
    approach: 'Map raw tags to an asset hierarchy and attach events — order, product, batch, shift, state — so every value carries the context needed to compare it.',
    outcome: 'Data you can ask business questions of: “energy per unit by product”, “scrap by tool and shift”.',
    tech: ['ISA-95 model', 'Event framing', 'Batch / order context', 'Tag mapping', 'Data quality rules'],
    nodes: [
      { id: 'tags', lane: 'source', label: 'Raw machine data', sub: 'Thousands of tags', icon: 'sensor' },
      { id: 'plc', lane: 'control', label: 'PLCs & SCADA', sub: 'Current values', icon: 'scada' },
      { id: 'gw', lane: 'edge', label: 'Edge collector', sub: 'Buffer, timestamp, quality', icon: 'gateway' },
      { id: 'map', lane: 'platform', label: 'Asset & tag model', sub: 'What each value means', icon: 'model' },
      { id: 'evt', lane: 'platform', label: 'Event context', sub: 'Order, batch, shift, state', icon: 'erp' },
      { id: 'erp', lane: 'platform', label: 'ERP / MES', sub: 'Orders, products', icon: 'db' },
      { id: 'bi', lane: 'consumer', label: 'Analysts & apps', sub: 'Business questions', icon: 'app' },
    ],
    links: [
      { from: 'tags', to: 'plc', label: 'Control network' },
      { from: 'plc', to: 'gw', label: 'OPC UA' },
      { from: 'gw', to: 'map', label: 'Mapped tags' },
      { from: 'erp', to: 'evt', label: 'Orders, products' },
      { from: 'map', to: 'evt', label: 'Framed events' },
      { from: 'evt', to: 'bi', label: 'Contextual data' },
    ],
  },
  {
    id: 'mixed',
    name: 'Mixed-vendor PLC, robot & CNC cell',
    short: 'Three vendors, three tools, one cell',
    challenge: 'A cell where a PLC, two robots and a CNC each speak their own protocol and keep their own fault history.',
    approach: 'Use the PLC as the cell coordinator for interlocks, and read robots and CNC in parallel at the edge for diagnostics — combining their states into a single cell model and fault timeline.',
    outcome: 'One timeline that explains why the cell stopped, regardless of which vendor’s equipment raised it.',
    tech: ['PROFINET / EtherNet/IP', 'Robot controller interfaces', 'MTConnect', 'Cell state model', 'Fault timelines'],
    nodes: [
      { id: 'r1', lane: 'source', label: 'Robot A', sub: 'Vendor 1', icon: 'robot' },
      { id: 'r2', lane: 'source', label: 'Robot B', sub: 'Vendor 2', icon: 'robot' },
      { id: 'cnc', lane: 'source', label: 'CNC', sub: 'Vendor 3', icon: 'cnc' },
      { id: 'plc', lane: 'control', label: 'Cell PLC', sub: 'Interlocks, sequence', icon: 'plc' },
      { id: 'safety', lane: 'control', label: 'Safety controller', sub: 'Never bypassed', icon: 'shield' },
      { id: 'gw', lane: 'edge', label: 'Diagnostics edge', sub: 'Parallel, read-only', icon: 'gateway' },
      { id: 'cell', lane: 'platform', label: 'Cell state model', sub: 'Fault timeline', icon: 'model' },
      { id: 'maint', lane: 'consumer', label: 'Maintenance', sub: 'Why it stopped', icon: 'user' },
    ],
    links: [
      { from: 'r1', to: 'plc', label: 'PROFINET' },
      { from: 'r2', to: 'plc', label: 'EtherNet/IP' },
      { from: 'cnc', to: 'plc', label: 'Handshake I/O' },
      { from: 'safety', to: 'plc', label: 'Safety status' },
      { from: 'r1', to: 'gw', label: 'Robot API' },
      { from: 'cnc', to: 'gw', label: 'MTConnect' },
      { from: 'plc', to: 'gw', label: 'OPC UA' },
      { from: 'gw', to: 'cell', label: 'Unified states' },
      { from: 'cell', to: 'maint', label: 'Timeline' },
    ],
  },
  {
    id: 'mes-erp',
    name: 'MES and ERP integration',
    short: 'Orders planned in ERP, executed blind on the floor',
    challenge: 'Production orders are keyed in twice, counts are reconciled by hand, and ERP learns about scrap days later.',
    approach: 'Define the ISA-95 exchange between ERP and MES (orders down, confirmations and consumption up), with MES collecting counts and states from the line through the edge layer — never ERP reaching into controllers.',
    outcome: 'Orders flow to the line automatically and actual output, scrap and material use flow back the same shift.',
    tech: ['ISA-95 / B2MML', 'MES', 'ERP APIs', 'Order & genealogy model', 'Edge acquisition'],
    nodes: [
      { id: 'line', lane: 'source', label: 'Production line', sub: 'Machines, scanners', icon: 'robot' },
      { id: 'scan', lane: 'source', label: 'Label & scan', sub: 'Material lots', icon: 'sensor' },
      { id: 'plc', lane: 'control', label: 'Line PLC', sub: 'Counts, states', icon: 'plc' },
      { id: 'edge', lane: 'edge', label: 'Edge collector', sub: 'Buffer, map, publish', icon: 'gateway' },
      { id: 'mes', lane: 'platform', label: 'MES', sub: 'Dispatch, genealogy', icon: 'erp' },
      { id: 'erp', lane: 'consumer', label: 'ERP', sub: 'Orders, inventory, cost', icon: 'db' },
      { id: 'sup', lane: 'consumer', label: 'Supervisors', sub: 'Shift performance', icon: 'user' },
    ],
    links: [
      { from: 'line', to: 'plc', label: 'Fieldbus' },
      { from: 'scan', to: 'edge', label: 'Scanner API' },
      { from: 'plc', to: 'edge', label: 'OPC UA' },
      { from: 'edge', to: 'mes', label: 'MQTT / REST' },
      { from: 'erp', to: 'mes', label: 'Orders (B2MML)' },
      { from: 'mes', to: 'erp', label: 'Confirmations' },
      { from: 'mes', to: 'sup', label: 'Dashboards' },
    ],
  },
  {
    id: 'cloud-dmz',
    name: 'Cloud integration via industrial DMZ',
    short: 'Cloud analytics without exposing the plant',
    challenge: 'The business wants plant data in a cloud data platform, but security policy forbids any inbound path to the control network.',
    approach: 'Outbound-only replication from an industrial DMZ: the plant historian publishes to a DMZ broker, which forwards to the cloud over authenticated, encrypted connections. Nothing in the cloud can initiate a connection into OT.',
    outcome: 'Cloud analytics and AI on near-real-time plant data, with a security boundary the plant can audit.',
    tech: ['Industrial DMZ', 'Outbound-only replication', 'TLS / mutual auth', 'IEC 62443 zones & conduits', 'Cloud data platform'],
    nodes: [
      { id: 'plc', lane: 'source', label: 'Machines & PLCs', sub: 'Level 0–1', icon: 'plc' },
      { id: 'scada', lane: 'control', label: 'SCADA', sub: 'Level 2', icon: 'scada' },
      { id: 'hist', lane: 'control', label: 'Plant historian', sub: 'Level 3', icon: 'db' },
      { id: 'fw', lane: 'edge', label: 'DMZ broker', sub: 'Firewall-separated', icon: 'shield' },
      { id: 'cloud', lane: 'platform', label: 'Cloud data platform', sub: 'Storage, models', icon: 'cloud' },
      { id: 'ai', lane: 'consumer', label: 'Analytics & AI', sub: 'Fleet insight', icon: 'ai' },
    ],
    links: [
      { from: 'plc', to: 'scada', label: 'OPC UA' },
      { from: 'scada', to: 'hist', label: 'Historise' },
      { from: 'hist', to: 'fw', label: 'Outbound publish' },
      { from: 'fw', to: 'cloud', label: 'TLS · outbound only' },
      { from: 'cloud', to: 'ai', label: 'Features' },
    ],
  },
];

export const networkCopy = {
  index: '04',
  eyebrow: 'Connectivity',
  title: 'Make systems speak.',
  lede: 'Industrial data is fragmented across vendors, protocols and decades. We design the architecture that turns it into structured, governed, usable intelligence — without compromising control. Choose a scenario.',
};
