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
  lede: 'Machines speak constantly — through torque, vibration, pressure, energy, cycle time, rejects and alarms. Most of it goes unheard. Select any asset in the cell to follow its story from signal to action.',
  steps: ['Emerging problem', 'Data observed', 'Operational risk', 'Action Tantro enables'],
  disclaimer: 'Illustrative scenarios and values.',
};
