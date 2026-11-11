/**
 * Chapter 01 — the machine story explorer.
 * All values are illustrative and labelled as such on the page.
 */

export type AssetStory = {
  id: string;
  name: string;
  area: string;
  problem: string;
  observed: { label: string; value: string }[];
  risk: string;
  action: string;
  /** Illustrative trend for the sparkline. */
  trend: { label: string; unit: string; from: number; to: number; limit: number; noise: number };
};

export const assets: AssetStory[] = [
  {
    id: 'cnc',
    name: 'CNC machining centre',
    area: 'Machining',
    problem: 'Cycle time is creeping up on the same program, and nobody changed the program.',
    observed: [
      { label: 'Spindle load', value: '+12% over 3 shifts' },
      { label: 'Cycle time', value: '+4.1 s drift' },
      { label: 'Tool life used', value: '82%' },
    ],
    risk: 'Tool wear is the likely cause. Left alone, surface finish and dimensions drift — scrap appears before the next quality check catches it.',
    action: 'Plan the tool change for the next changeover, link the load trend to the tool ID, and ask quality to sample the next five parts.',
    trend: { label: 'Spindle load', unit: '%', from: 58, to: 71, limit: 75, noise: 1.6 },
  },
  {
    id: 'robot',
    name: 'Robot handling cell',
    area: 'Material handling',
    problem: 'Pick times vary far more than they used to, though the cell still makes rate.',
    observed: [
      { label: 'Joint 3 peak torque', value: '+9% vs baseline' },
      { label: 'Pick time σ', value: '2.1× wider' },
      { label: 'Gripper retries', value: '17 per hour' },
    ],
    risk: 'Gripper pads are wearing and the reducer is working harder on every retry. The next step is mis-picks and a cell stop.',
    action: 'Inspect and replace gripper pads, compare the torque signature to the commissioning baseline, and plan a reducer check.',
    trend: { label: 'Pick time σ', unit: 's', from: 0.11, to: 0.24, limit: 0.3, noise: 0.012 },
  },
  {
    id: 'pump',
    name: 'Cooling pump & motor',
    area: 'Utilities',
    problem: 'Vibration is rising at constant flow — still below the alarm limit, so nothing has fired.',
    observed: [
      { label: 'Velocity RMS', value: '2.1 → 3.4 mm/s' },
      { label: 'Bearing-band energy', value: 'rising' },
      { label: 'Bearing temperature', value: '+6 °C' },
    ],
    risk: 'Consistent with early bearing wear or misalignment. An unplanned stop of the cooling loop would stop the machines it serves.',
    action: 'Raise an inspection for the next planned stop: lubrication, alignment and bearing check. Keep the asset running meanwhile.',
    trend: { label: 'Velocity RMS', unit: 'mm/s', from: 2.1, to: 3.4, limit: 4.5, noise: 0.1 },
  },
  {
    id: 'compressor',
    name: 'Compressed-air skid',
    area: 'Energy',
    problem: 'Air demand barely falls when production stops.',
    observed: [
      { label: 'Flow, non-production', value: '38% of rated' },
      { label: 'Header pressure', value: 'stable, 6.9 bar' },
      { label: 'Specific power', value: 'kW per m³/min ↑' },
    ],
    risk: 'Leaks and idle running: electricity spent with no output, every night and weekend.',
    action: 'Run a targeted leak survey on the lines with the highest idle flow, review the pressure set-point, and add schedule-based shutdown.',
    trend: { label: 'Idle flow', unit: '% rated', from: 24, to: 38, limit: 40, noise: 1.2 },
  },
  {
    id: 'packaging',
    name: 'Conveyor & packaging line',
    area: 'Packaging',
    problem: 'The line loses output to stops so short that nobody records them.',
    observed: [
      { label: 'Micro-stops', value: '46 per shift (<2 min)' },
      { label: 'Infeed jam events', value: 'clustered after changeovers' },
      { label: 'Case packer', value: 'starved 11% of run time' },
    ],
    risk: 'Hidden availability loss. It shows up as overtime and missed dispatch — not as a single obvious failure.',
    action: 'Classify micro-stops automatically from machine states, then target the top two causes at the infeed.',
    trend: { label: 'Micro-stops / shift', unit: '', from: 28, to: 46, limit: 50, noise: 2.2 },
  },
  {
    id: 'vision',
    name: 'Vision inspection station',
    area: 'Quality',
    problem: 'Reject rate has climbed — but only on the night shift.',
    observed: [
      { label: 'Reject rate', value: '1.2% → 2.9%' },
      { label: 'Image brightness σ', value: 'up 3×' },
      { label: 'Dominant class', value: '"scratch", low confidence' },
    ],
    risk: 'Likely lighting drift causing false rejects — or a real process issue hiding behind them. Either way, good parts or bad parts are going the wrong way.',
    action: 'Check illumination and lens, re-verify against golden samples, and retrain only if the process really changed.',
    trend: { label: 'Reject rate', unit: '%', from: 1.2, to: 2.9, limit: 3.5, noise: 0.12 },
  },
  {
    id: 'hmi',
    name: 'Control panel & HMI',
    area: 'Operations',
    problem: 'Operators acknowledge alarms without acting on them.',
    observed: [
      { label: 'Alarms per shift', value: '312' },
      { label: 'Top 10 alarms', value: '71% of load' },
      { label: 'Standing alarms', value: '14' },
    ],
    risk: 'Alarm fatigue. The alarm that matters arrives inside a flood and is missed.',
    action: 'Rationalise alarms to ISA-18.2 principles: fix chattering alarms, reprioritise, and document the expected response for each.',
    trend: { label: 'Alarms / shift', unit: '', from: 220, to: 312, limit: 300, noise: 9 },
  },
];

export const physicalCopy = {
  index: '01',
  eyebrow: 'The physical world',
  title: 'Every machine has a story.',
  lede: 'Machines speak constantly — through torque, vibration, pressure, energy, cycle time, rejects and alarms. Follow a guided investigation of one production cell, or explore any asset yourself.',
  steps: ['Emerging problem', 'Data observed', 'Operational risk', 'Action Tantro enables'],
  disclaimer: 'Illustrative scenarios and values.',
};

/* ------------------------------------------------------------------ */
/* Guided investigation: "A production cell begins losing performance" */
/* ------------------------------------------------------------------ */

export type Status = 'ok' | 'warn' | 'alert';
export type Kpi = { label: string; value: string; delta?: string; status: Status };

export type InvestigationChapter = {
  id: string;
  title: string;
  question: string;
  text: string;
  focus: string[];
  cncStatus: Status;
  kpis: Kpi[];
  callouts: { asset: string; text: string; tone: Status }[];
  trend?: { label: string; unit: string; from: number; to: number; limit: number; noise: number; band?: boolean };
  evidence?: { source: string; protocol: string; time: string; signal: string; value: string; tone: Status }[];
  hypotheses?: { cause: string; p: number; forEvidence: string; against: string }[];
  watching?: string[];
  actions?: string[];
  outcome?: { label: string; before: string; after: string }[];
};

export const investigation = {
  title: 'A production cell begins losing performance',
  chapters: [
    {
      id: 'normal',
      title: 'Normal operation',
      question: 'What does good look like?',
      text: 'Cell 3 machines a steel bracket for a two-shift order. The CNC, robot and packaging line run to plan, and every signal sits inside its usual range.',
      focus: ['cnc'],
      cncStatus: 'ok',
      kpis: [
        { label: 'Cycle time', value: '48.2 s', status: 'ok' },
        { label: 'Output', value: '74 /h', status: 'ok' },
        { label: 'Reject rate', value: '0.8 %', status: 'ok' },
        { label: 'Equipment', value: 'Running', status: 'ok' },
      ],
      callouts: [{ asset: 'cnc', text: 'Running to plan', tone: 'ok' }],
      trend: { label: 'Spindle load', unit: '%', from: 60, to: 61, limit: 75, noise: 1.2 },
      watching: ['CNC spindle load and program cycle time (OPC UA)', 'PLC machine states, stops and counts', 'Vision verdicts and reject rate per part', 'SCADA alarms and events, MES order context'],
    },
    {
      id: 'deviation',
      title: 'Early deviation',
      question: 'What changed?',
      text: 'Over three shifts, spindle load creeps up and cycle-time variation widens. Nothing has alarmed — every value is still inside its limit — but the pattern has changed.',
      focus: ['cnc'],
      cncStatus: 'warn',
      kpis: [
        { label: 'Cycle time', value: '50.9 s', delta: '+5.6 %', status: 'warn' },
        { label: 'Output', value: '70 /h', delta: '−4', status: 'warn' },
        { label: 'Reject rate', value: '0.9 %', status: 'ok' },
        { label: 'Equipment', value: 'Running', status: 'ok' },
      ],
      callouts: [{ asset: 'cnc', text: 'Spindle load +12 % · cycle σ ×2', tone: 'warn' }],
      trend: { label: 'Spindle load', unit: '%', from: 60, to: 71, limit: 75, noise: 1.5, band: true },
      watching: ['No alarm has fired — every value is still inside its limit', 'The change is in the trend and the variation, not the level', 'Threshold-only monitoring would stay silent here'],
    },
    {
      id: 'investigation',
      title: 'Investigation',
      question: 'How do we know?',
      text: 'Signals from four systems are aligned on one timeline. Each source sees part of the picture; together they narrow the search.',
      focus: ['cnc', 'hmi', 'packaging'],
      cncStatus: 'warn',
      kpis: [
        { label: 'Cycle time', value: '51.3 s', delta: '+6.4 %', status: 'warn' },
        { label: 'Output', value: '69 /h', delta: '−5', status: 'warn' },
        { label: 'Reject rate', value: '1.1 %', delta: '+0.3', status: 'warn' },
        { label: 'Equipment', value: 'Running', status: 'ok' },
      ],
      callouts: [
        { asset: 'cnc', text: 'CNC · spindle load 71 %', tone: 'warn' },
        { asset: 'hmi', text: 'SCADA · coolant flow low ×2', tone: 'warn' },
        { asset: 'packaging', text: 'MES · tool T12 at 1,840 parts', tone: 'ok' },
      ],
      evidence: [
        { source: 'CNC controller', protocol: 'OPC UA', time: '06:14:22', signal: 'spindle_load', value: '71 % ↑', tone: 'warn' },
        { source: 'Cell PLC', protocol: 'OPC UA', time: '06:14:25', signal: 'feed_hold events', value: '3 in 60 min', tone: 'warn' },
        { source: 'SCADA alarms', protocol: 'A&E', time: '06:15:02', signal: 'coolant flow low', value: '2 × warning', tone: 'warn' },
        { source: 'MES', protocol: 'API', time: '06:00:00', signal: 'order 4471 · tool T12', value: '1,840 parts', tone: 'ok' },
      ],
    },
    {
      id: 'insight',
      title: 'Engineering insight',
      question: 'Why does it matter?',
      text: 'The evidence points most strongly to tool wear, but coolant delivery cannot be ruled out. This is a ranked hypothesis to verify — not a confirmed diagnosis.',
      focus: ['cnc'],
      cncStatus: 'warn',
      kpis: [
        { label: 'Cycle time', value: '51.3 s', delta: '+6.4 %', status: 'warn' },
        { label: 'Output', value: '69 /h', delta: '−5', status: 'warn' },
        { label: 'Reject rate', value: '1.1 %', delta: '+0.3', status: 'warn' },
        { label: 'Risk', value: 'Tolerance drift', status: 'alert' },
      ],
      callouts: [{ asset: 'cnc', text: 'Probable cause: tool T12 wear (0.64)', tone: 'alert' }],
      hypotheses: [
        { cause: 'Tool T12 wear', p: 0.64, forEvidence: 'Load rise tracks tool part count; past T12 life profile', against: 'Load rose faster than typical wear' },
        { cause: 'Coolant delivery restriction', p: 0.22, forEvidence: 'Two coolant-flow warnings in the window', against: 'Warnings started after the load rise' },
        { cause: 'Material lot hardness', p: 0.14, forEvidence: 'New lot L-2291 loaded at 05:40', against: 'Same lot ran normally on cell 2' },
      ],
    },
    {
      id: 'action',
      title: 'Action and outcome',
      question: 'What can be done?',
      text: 'Inspect before continuing: the change is planned into the next changeover, part quality is verified, and the result confirms or rejects the hypothesis.',
      focus: ['cnc', 'vision'],
      cncStatus: 'ok',
      kpis: [
        { label: 'Cycle time', value: '48.4 s', delta: 'simulated', status: 'ok' },
        { label: 'Output', value: '74 /h', delta: 'simulated', status: 'ok' },
        { label: 'Reject rate', value: '0.8 %', delta: 'simulated', status: 'ok' },
        { label: 'Equipment', value: 'Running', status: 'ok' },
      ],
      callouts: [
        { asset: 'cnc', text: 'Tool T12 inspected at changeover', tone: 'ok' },
        { asset: 'vision', text: '5 parts verified before restart', tone: 'ok' },
      ],
      actions: [
        'Schedule tool T12 inspection at the next changeover (in 40 min)',
        'Check the coolant filter and flow while the spindle is stopped',
        'Verify five parts at inspection before continuing production',
        'Record the finding so the hypothesis model learns from it',
      ],
      outcome: [
        { label: 'Cycle time', before: '51.3 s', after: '48.4 s' },
        { label: 'Reject rate', before: '1.1 %', after: '0.8 %' },
        { label: 'Unplanned stop', before: 'likely', after: 'avoided' },
      ],
    },
  ] as InvestigationChapter[],
};
