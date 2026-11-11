export type AssetKind = 'machine' | 'sensor' | 'controller' | 'process';

export type PhysicalAsset = {
  id: string;
  name: string;
  kind: AssetKind;
  /** Illustrative live signals. Values are generated, not measured. */
  signals: { tag: string; unit: string; base: number; jitter: number }[];
  story: string;
  interface: string;
};

export const physicalAssets: PhysicalAsset[] = [
  {
    id: 'cnc',
    name: 'CNC machining cell',
    kind: 'machine',
    signals: [
      { tag: 'spindle_load', unit: '%', base: 62, jitter: 6 },
      { tag: 'cycle_time', unit: 's', base: 48.2, jitter: 1.4 },
    ],
    story:
      'Spindle load rising across the same program usually means tool wear — long before parts drift out of tolerance.',
    interface: 'Controller data via OPC UA or MTConnect',
  },
  {
    id: 'vib',
    name: 'Vibration sensor',
    kind: 'sensor',
    signals: [
      { tag: 'velocity_rms', unit: 'mm/s', base: 2.1, jitter: 0.3 },
      { tag: 'bearing_temp', unit: '°C', base: 54, jitter: 1.2 },
    ],
    story:
      'A few millimetres per second of change is often the earliest measurable sign of a bearing beginning to fail.',
    interface: 'IO-Link or wireless gateway to edge',
  },
  {
    id: 'plc',
    name: 'Line controller (PLC)',
    kind: 'controller',
    signals: [
      { tag: 'state', unit: '', base: 1, jitter: 0 },
      { tag: 'scan_time', unit: 'ms', base: 8, jitter: 1 },
    ],
    story:
      'The PLC already knows every stop, every fault code and every interlock. Most plants never read it beyond the HMI.',
    interface: 'Native OPC UA server or protocol driver at the edge',
  },
  {
    id: 'robot',
    name: 'Robot transfer',
    kind: 'machine',
    signals: [
      { tag: 'pick_time', unit: 's', base: 3.4, jitter: 0.2 },
      { tag: 'joint_3_torque', unit: '%', base: 41, jitter: 4 },
    ],
    story:
      'Torque profiles repeat every cycle. When the shape of a repetition changes, something mechanical has changed.',
    interface: 'Robot controller interface via the cell PLC',
  },
  {
    id: 'camera',
    name: 'Inspection camera',
    kind: 'sensor',
    signals: [
      { tag: 'frames', unit: 'fps', base: 30, jitter: 0 },
      { tag: 'reject_rate', unit: '%', base: 1.2, jitter: 0.3 },
    ],
    story:
      'Every inspected part leaves an image. Linked to batch and machine state, images explain why defects happen, not only that they did.',
    interface: 'GigE Vision camera to an edge inference node',
  },
  {
    id: 'meter',
    name: 'Energy meter',
    kind: 'sensor',
    signals: [
      { tag: 'active_power', unit: 'kW', base: 37.5, jitter: 2.5 },
      { tag: 'power_factor', unit: '', base: 0.91, jitter: 0.02 },
    ],
    story:
      'Power drawn while a line is idle is cost with no output. Meters reveal it; production context explains it.',
    interface: 'Modbus TCP to edge gateway',
  },
  {
    id: 'compressor',
    name: 'Compressed air',
    kind: 'process',
    signals: [
      { tag: 'header_pressure', unit: 'bar', base: 6.8, jitter: 0.1 },
      { tag: 'flow', unit: 'm³/min', base: 11.4, jitter: 0.8 },
    ],
    story:
      'Air flow on a stopped line is usually a leak. Compressed air is one of the most expensive utilities a plant runs.',
    interface: 'Flow and pressure transmitters, 4–20 mA via I/O',
  },
];

export const physicalCopy = {
  index: '01',
  eyebrow: 'The physical world',
  headline: 'Every machine has a story.',
  body: 'Long before a dashboard exists, a plant is already speaking: in torque, temperature, pressure, frames and fault codes. Select any element to hear what it says.',
  hint: 'Select an element',
  disclaimer: 'Illustrative signals — generated in your browser, not measured.',
};
