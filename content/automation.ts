/**
 * Industrial Automation & Control Engineering — services and the Control Engineering Explorer.
 * The explorer is an illustrative, browser-only simulation: it issues no real control commands.
 */

export const automationCopy = {
  index: '02',
  eyebrow: 'Industrial automation & control engineering',
  title: 'Engineering reliable control, from field devices to enterprise operations.',
  lede: 'From a single PLC change to a complete DCS or SCADA integration: control logic, operator interfaces and lifecycle documentation engineered to run the same way every time — and to be maintained by your team.',
};

export const serviceGroups = [
  {
    id: 'plc',
    name: 'PLC engineering',
    summary: 'Machine and line control, from new programs to careful changes in running plants.',
    items: [
      'PLC programming and modification',
      'Ladder Logic, Function Block Diagram and Structured Text',
      'Machine sequence development',
      'Equipment interlocks and permissives',
      'PID and process control implementation',
      'I/O mapping and hardware configuration',
      'PLC migration and modernisation',
      'Program diagnostics and troubleshooting',
      'Industrial communications',
      'Simulation and test environments',
      'Documentation, FAT and SAT support',
    ],
  },
  {
    id: 'dcs',
    name: 'DCS engineering',
    summary: 'Continuous and batch process control with consistent, testable control modules.',
    items: [
      'DCS configuration and integration',
      'Control logic development',
      'Continuous and batch process control',
      'Function blocks and control modules',
      'Alarm and event configuration',
      'Operator graphics',
      'Process historian integration',
      'System migration and upgrades',
      'Testing and commissioning',
    ],
  },
  {
    id: 'scada',
    name: 'SCADA / HMI engineering',
    summary: 'Supervision operators trust: clear graphics, meaningful alarms and reliable history.',
    items: [
      'SCADA architecture and development',
      'Process visualisation',
      'Alarm management',
      'Historisation, trending and reporting',
      'Equipment command interfaces',
      'Recipe and batch integration where applicable',
      'User management',
      'Redundancy and high availability',
      'MES / ERP integration',
      'Modernisation of existing applications',
    ],
  },
  {
    id: 'lifecycle',
    name: 'Automation lifecycle services',
    summary: 'The engineering documents and site work that make a system maintainable.',
    items: [
      'Requirements engineering',
      'Functional design specifications',
      'I/O list preparation',
      'Control narratives',
      'Cause-and-effect documentation',
      'FAT / SAT',
      'Site commissioning',
      'Troubleshooting',
      'Change management',
      'Operations handover',
    ],
  },
];

/** Representative ecosystems. Names only — no logos, partnerships or certifications implied. */
export const ecosystems = [
  'Siemens SIMATIC / TIA Portal',
  'Rockwell ControlLogix / Studio 5000',
  'ABB System 800xA',
  'Schneider Electric Modicon / EcoStruxure',
  'Inductive Automation Ignition',
  'AVEVA System Platform',
  'Codesys-based controllers',
  'IEC 61131-3 · IEC 61499 · ISA-88 · ISA-101 · ISA-18.2',
];
export const ecosystemNote =
  'Representative ecosystems our engineering covers. Trademarks belong to their owners; no partnership, certification or endorsement is implied.';

/* ---------------- Control Engineering Explorer ---------------- */

export type CeView = 'io' | 'sequence' | 'scada' | 'mes' | 'fault';

export const ceViews: { id: CeView; name: string; short: string; text: string }[] = [
  {
    id: 'io',
    name: 'Electrical, I/O & field signals',
    short: 'Field I/O',
    text: 'Every sensor and actuator is wired to an I/O channel with a tag, a type and an address. Getting this layer right — and documented — is what makes everything above it trustworthy.',
  },
  {
    id: 'sequence',
    name: 'PLC logic & machine sequencing',
    short: 'PLC sequence',
    text: 'The cell runs a state machine. A transition only happens when its permissives are true, so the machine behaves the same way every cycle — and stops predictably when it should.',
  },
  {
    id: 'scada',
    name: 'SCADA / HMI monitoring',
    short: 'SCADA / HMI',
    text: 'Operators see state, trends and alarms in a high-performance display: grey by default, colour only where attention is needed (ISA-101 principles).',
  },
  {
    id: 'mes',
    name: 'MES & production integration',
    short: 'MES',
    text: 'Orders come down from MES; counts, states and reasons go back up. The PLC never talks to ERP directly — integration follows ISA-95 levels through the supervisory layer.',
  },
  {
    id: 'fault',
    name: 'Fault diagnostics & recovery',
    short: 'Fault & recovery',
    text: 'Simulate a conveyor jam: the sequence holds, the signal that tripped it is shown, SCADA raises an alarm, and a recovery workflow brings the cell back through READY with permissives re-checked.',
  },
];

export const states = ['IDLE', 'READY', 'STARTING', 'RUNNING', 'STOPPING', 'COMPLETE'] as const;
export type CellState = (typeof states)[number] | 'HELD';

export const permissives = [
  { tag: 'GS-101', text: 'Guard closed (status from safety relay)', safety: true },
  { tag: 'PT-110', text: 'Air pressure ≥ 5.5 bar', safety: false },
  { tag: 'UP-RDY', text: 'Upstream station ready', safety: false },
  { tag: 'ES-OK', text: 'E-stop circuit healthy (monitored only)', safety: true },
];

export const ioPoints = [
  { tag: 'PE-102', desc: 'Photo-eye, conveyor exit', type: 'DI', addr: '%I0.2' },
  { tag: 'PX-104', desc: 'Prox, clamp closed', type: 'DI', addr: '%I0.4' },
  { tag: 'GS-101', desc: 'Guard switch (via safety relay)', type: 'DI', addr: '%I1.0' },
  { tag: 'M-101', desc: 'Conveyor motor run', type: 'DO', addr: '%Q0.1' },
  { tag: 'YV-120', desc: 'Clamp valve', type: 'DO', addr: '%Q0.4' },
  { tag: 'TT-130', desc: 'Oven temperature', type: 'AI', addr: '%IW64' },
  { tag: 'PT-110', desc: 'Air header pressure', type: 'AI', addr: '%IW66' },
];

export const recovery = [
  'Acknowledge the alarm at the HMI — the cause stays latched until cleared',
  'Make the conveyor safe per site lockout procedure and clear the jammed carton',
  'Confirm PE-102 is clear and reset the fault from the HMI',
  'Restart from READY: all permissives are re-checked before RUNNING',
];

export const safetyNote =
  'Illustrative browser simulation. Safety functions such as emergency stop and guard interlocking are implemented in safety-rated systems; standard PLC logic only monitors their status and never overrides them.';
