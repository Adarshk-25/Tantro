export type ScenarioId = 'anomaly' | 'vision' | 'bottleneck';

export type Stage = { key: 'input' | 'processing' | 'insight' | 'action'; label: string; text: string };

export type Scenario = {
  id: ScenarioId;
  letter: string;
  name: string;
  asset: string;
  stages: Stage[];
};

export const scenarios: Scenario[] = [
  {
    id: 'anomaly',
    letter: 'A',
    name: 'Machine anomaly detection',
    asset: 'Pump P-102 · illustrative',
    stages: [
      {
        key: 'input',
        label: 'Input',
        text: 'Vibration velocity and bearing temperature, sampled continuously from a centrifugal pump.',
      },
      {
        key: 'processing',
        label: 'Processing',
        text: 'A baseline learned from normal operation scores each window. Frequency content is compared, not just amplitude.',
      },
      {
        key: 'insight',
        label: 'Insight',
        text: 'Energy is rising in a high-frequency band while amplitude is still within the alarm limit — consistent with early bearing wear.',
      },
      {
        key: 'action',
        label: 'Recommended action',
        text: 'Raise an inspection work order for the next planned stop. Check lubrication; do not trip the asset.',
      },
    ],
  },
  {
    id: 'vision',
    letter: 'B',
    name: 'Vision-based quality inspection',
    asset: 'Machined bracket · illustrative',
    stages: [
      {
        key: 'input',
        label: 'Input',
        text: 'A camera frame for every part, captured under controlled lighting at the end of the line.',
      },
      {
        key: 'processing',
        label: 'Processing',
        text: 'The frame is aligned to the part geometry, then a model examines each region for surface defects.',
      },
      {
        key: 'insight',
        label: 'Insight',
        text: 'A surface scratch is located near the mounting hole, with its position and confidence recorded against the part ID.',
      },
      {
        key: 'action',
        label: 'Recommended action',
        text: 'Divert the part for review, tag the batch, and correlate with the machine state at the time of production.',
      },
    ],
  },
  {
    id: 'bottleneck',
    letter: 'C',
    name: 'Production bottleneck identification',
    asset: 'Five-station line · illustrative',
    stages: [
      {
        key: 'input',
        label: 'Input',
        text: 'Station states, cycle times and buffer levels from each machine on the line.',
      },
      {
        key: 'processing',
        label: 'Processing',
        text: 'Each station is classified as working, starved or blocked over time. The constraint is the one that is rarely starved and others wait on.',
      },
      {
        key: 'insight',
        label: 'Insight',
        text: 'Station 3 is limiting throughput: its buffer fills while downstream stations are starved.',
      },
      {
        key: 'action',
        label: 'Recommended action',
        text: 'Focus improvement on station 3 — changeover and minor stops — before adding capacity anywhere else.',
      },
    ],
  },
];

export const intelligenceCopy = {
  index: '03',
  eyebrow: 'Intelligence',
  headline: 'From data to decisions.',
  body: 'Intelligence is only useful when it ends in an action someone can take. Run a scenario and follow it from raw input to recommendation.',
  disclaimer: 'Illustrative simulation. All data is synthetic and generated in your browser.',
};
