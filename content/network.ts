/** Connectivity chapter: an ISA-95-informed layered architecture. */

export type Layer = { id: string; level: string; name: string };

export const layers: Layer[] = [
  { id: 'enterprise', level: 'L4', name: 'Enterprise' },
  { id: 'operations', level: 'L3', name: 'Operations' },
  { id: 'edge', level: 'DMZ / Edge', name: 'Edge & integration' },
  { id: 'control', level: 'L1–L2', name: 'Control & supervision' },
  { id: 'field', level: 'L0', name: 'Physical assets' },
];

export type NetNode = { id: string; layer: Layer['id']; label: string; sub: string };

export const netNodes: NetNode[] = [
  { id: 'erp', layer: 'enterprise', label: 'ERP', sub: 'Orders, materials, cost' },
  { id: 'analytics', layer: 'enterprise', label: 'Analytics / AI', sub: 'Models, reporting' },
  { id: 'mes', layer: 'operations', label: 'MES', sub: 'Work orders, genealogy' },
  { id: 'historian', layer: 'operations', label: 'Historian', sub: 'Time-series storage' },
  { id: 'edge', layer: 'edge', label: 'Edge gateway', sub: 'OPC UA client · normalisation' },
  { id: 'broker', layer: 'edge', label: 'MQTT broker', sub: 'Unified namespace' },
  { id: 'scada', layer: 'control', label: 'SCADA / HMI', sub: 'Supervision, alarms' },
  { id: 'plc', layer: 'control', label: 'PLC', sub: 'Deterministic control' },
  { id: 'press', layer: 'field', label: 'Press line', sub: 'Drives, I/O' },
  { id: 'cnc', layer: 'field', label: 'CNC cell', sub: 'Machine controller' },
  { id: 'vision', layer: 'field', label: 'Vision station', sub: 'Camera, lighting' },
  { id: 'utility', layer: 'field', label: 'Utilities', sub: 'Energy, air meters' },
];

export type NetLink = { from: string; to: string; protocol: string };

export const netLinks: NetLink[] = [
  { from: 'press', to: 'plc', protocol: 'PROFINET' },
  { from: 'cnc', to: 'plc', protocol: 'EtherNet/IP' },
  { from: 'cnc', to: 'edge', protocol: 'OPC UA' },
  { from: 'vision', to: 'edge', protocol: 'GigE · inference' },
  { from: 'utility', to: 'edge', protocol: 'Modbus TCP' },
  { from: 'plc', to: 'scada', protocol: 'OPC UA' },
  { from: 'plc', to: 'edge', protocol: 'OPC UA' },
  { from: 'edge', to: 'broker', protocol: 'MQTT · Sparkplug B' },
  { from: 'broker', to: 'historian', protocol: 'MQTT' },
  { from: 'broker', to: 'mes', protocol: 'MQTT / REST' },
  { from: 'historian', to: 'analytics', protocol: 'SQL · Parquet' },
  { from: 'mes', to: 'erp', protocol: 'B2MML / API' },
];

/** What happens when a visitor selects a physical asset. */
export const assetPaths: Record<string, { path: string[]; explain: string }> = {
  press: {
    path: ['press', 'plc', 'edge', 'broker', 'mes', 'erp'],
    explain:
      'Press signals stay in the deterministic control loop, supervised by SCADA. The PLC exposes state and counts over OPC UA; the edge publishes them to the namespace, where MES turns strokes into produced quantities.',
  },
  cnc: {
    path: ['cnc', 'plc', 'edge', 'broker', 'historian', 'analytics'],
    explain:
      'The CNC controller is read directly at the edge for spindle and program data, while the PLC supplies cell state. Both land in the historian with consistent naming for analysis.',
  },
  vision: {
    path: ['vision', 'edge', 'broker', 'mes', 'erp'],
    explain:
      'Images are processed at the edge — they are too heavy for the network above. Only the verdict, confidence and part ID travel upward, linked to the work order in MES.',
  },
  utility: {
    path: ['utility', 'edge', 'broker', 'historian', 'analytics'],
    explain:
      'Energy and air meters rarely sit on the control network. A Modbus driver at the edge brings them in, so consumption can be aligned with production state.',
  },
};

export const networkCopy = {
  index: '02',
  eyebrow: 'Connectivity',
  headline: 'Make systems speak.',
  body: 'Connected does not mean everything talks to everything. Control stays deterministic, the edge translates and protects, and the enterprise receives context, not noise.',
  prompt: 'Select a physical asset',
};
