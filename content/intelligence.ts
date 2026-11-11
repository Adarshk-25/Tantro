/**
 * Chapter 03 — the Industrial Decision Lab.
 * Each scenario runs Problem → Data → Analysis → Output → Action → Value.
 * All data is synthetic; formulas are simplified, clearly labelled cues.
 */

export type ChartKind =
  | 'anomaly'
  | 'health'
  | 'toolwear'
  | 'vision'
  | 'spc'
  | 'rootcause'
  | 'bottleneck'
  | 'oee'
  | 'downtime'
  | 'forecast'
  | 'alarms'
  | 'guidance'
  | 'energy';

export type UseCase = {
  id: string;
  group: 'Asset health' | 'Quality' | 'Operations' | 'Energy';
  name: string;
  asset: string;
  chart: ChartKind;
  formula: string;
  formulaNote: string;
  problem: string;
  data: string;
  dataset: { columns: string[]; rows: string[][] };
  analysis: string;
  output: string;
  confidence: string;
  action: string;
  value: string;
};

export const stepLabels = ['Problem', 'Data', 'Analysis', 'Output', 'Action', 'Value'] as const;

export const useCases: UseCase[] = [
  {
    id: 'health',
    group: 'Asset health',
    name: 'Asset health & predictive maintenance',
    asset: 'Gearbox G-07 · conveyor drive',
    chart: 'health',
    formula: 'HI = 100 × (1 − Σ wᵢ·dᵢ),  Σwᵢ = 1,  dᵢ ∈ [0,1]',
    formulaNote:
      'An illustrative composite index, not a universal standard. FMEA severity, occurrence and detection rankings (RPN = S × O × D) prioritise which failure modes the indicators should cover; they are scenario-specific and not comparable across organisations.',
    problem: 'Forty motors and gearboxes are maintained on fixed intervals. Some are opened too early; one failed between services last quarter.',
    data: 'Condition indicators per asset, each normalised to a degradation score dᵢ against that asset’s own healthy baseline.',
    dataset: {
      columns: ['Indicator', 'Unit', 'Now', 'dᵢ', 'wᵢ'],
      rows: [
        ['Vibration velocity RMS', 'mm/s', '4.1', '0.52', '0.40'],
        ['Kurtosis (bearing band)', '–', '5.8', '0.47', '0.25'],
        ['Oil temperature rise', 'K', '+9', '0.31', '0.20'],
        ['Motor current imbalance', '%', '3.2', '0.18', '0.15'],
      ],
    },
    analysis:
      'Weights reflect the failure modes ranked highest in the asset’s FMEA (bearing and gear-mesh wear). The index trend is fitted with a degradation model to project when it crosses the intervention threshold.',
    output: 'HI = 58 / 100 and falling. Projected to reach the intervention threshold (HI 35) in about 19 days.',
    confidence: '80 % interval: 13–25 days. Wide because the trend has only 9 weeks of history.',
    action: 'Plan a bearing and gear-mesh inspection into the shutdown in two weeks; order the bearing kit now.',
    value: 'Maintenance effort follows condition rather than the calendar, and the shutdown is used for the asset that needs it.',
  },
  {
    id: 'vision',
    group: 'Quality',
    name: 'Vision-based inspection',
    asset: 'Machined bracket · end-of-line station',
    chart: 'vision',
    formula: 'p(class | image) via softmax  ·  reject if p(defect) ≥ τ',
    formulaNote: 'τ is chosen from the relative cost of a false reject versus an escaped defect, then verified on a held-out set.',
    problem: 'Manual inspection catches obvious defects but misses fine scratches near mounting features.',
    data: 'One triggered image per part under controlled lighting, with part ID and order from the PLC and MES.',
    dataset: {
      columns: ['Part ID', 'Time', 'p(scratch)', 'p(dent)', 'Verdict'],
      rows: [
        ['B-24471', '10:02:11', '0.03', '0.01', 'pass'],
        ['B-24472', '10:02:17', '0.05', '0.02', 'pass'],
        ['B-24473', '10:02:23', '0.93', '0.04', 'reject'],
        ['B-24474', '10:02:29', '0.02', '0.01', 'pass'],
      ],
    },
    analysis: 'Images are aligned to part geometry, then a classifier scores regions; the decision uses a threshold calibrated on validation data.',
    output: 'Scratch near the mounting hole on part B-24473.',
    confidence: 'p(scratch) = 0.93 against τ = 0.80. Validation recall on this class: 0.96 (synthetic set).',
    action: 'Divert the part to review, tag the batch and link the image to machine state at production time.',
    value: 'Consistent inspection on every part, with traceable evidence for root-cause work.',
  },
  {
    id: 'spc',
    group: 'Quality',
    name: 'Process drift & capability',
    asset: 'Bore Ø 25.000 mm · CNC cell 3',
    chart: 'spc',
    formula: 'Cpk = min(USL − μ, μ − LSL) / 3σ  ·  run rule: 8 points one side of x̄',
    formulaNote: 'Control limits come from a stable reference period; specification limits come from the drawing. They are not the same thing.',
    problem: 'A bore diameter is still inside tolerance, so no one is looking at it.',
    data: 'In-line gauge readings (mm, 0.001 resolution), subgrouped by five parts.',
    dataset: {
      columns: ['Subgroup', 'x̄ (mm)', 'R (mm)', 'Rule'],
      rows: [
        ['36', '25.0004', '0.006', '—'],
        ['41', '25.0061', '0.005', '1 of 8'],
        ['48', '25.0068', '0.006', '8 of 8'],
        ['58', '25.0072', '0.007', 'shift'],
      ],
    },
    analysis: 'An X̄ chart with run rules detects a sustained shift long before a specification limit is reached; capability is tracked alongside.',
    output: 'A sustained upward shift started about 22 subgroups ago; Cpk has fallen from 1.67 to 1.12.',
    confidence: 'Run rule violated with 8 consecutive points; probability under a stable process < 1 %.',
    action: 'Check tool offset and thermal compensation; correct before Cpk falls below 1.33.',
    value: 'Drift is corrected while every part is still good — no sorting, no scrap.',
  },
  {
    id: 'rootcause',
    group: 'Quality',
    name: 'Root-cause assistance',
    asset: 'Housing line · porosity defects',
    chart: 'rootcause',
    formula: 'rank factors by Δ contribution to P(defect)  ·  confirm by counterfactual',
    formulaNote: 'Contribution ranking narrows the search; it is not proof of causation. Confirmation requires a controlled check.',
    problem: 'Scrap doubled last week and six people have six theories.',
    data: 'Defect records joined with process context: material lot, tool age, coolant temperature, shift and speeds.',
    dataset: {
      columns: ['Factor', 'Type', 'Range in window'],
      rows: [
        ['Material lot', 'category', 'B-15, B-16, B-17'],
        ['Coolant temp', '°C', '18.2 – 24.9'],
        ['Tool age', 'parts', '120 – 1,950'],
        ['Shift', 'category', 'A, B, C'],
      ],
    },
    analysis: 'A model of defect probability is fitted on the joined data; each factor’s contribution is estimated and tested by excluding it.',
    output: 'Material lot B-17 and coolant temperature explain most of the increase; shift and operator do not.',
    confidence: 'Excluding B-17 restores the baseline scrap rate in the model; to be confirmed with a controlled run.',
    action: 'Quarantine remaining B-17 stock, check the coolant chiller, and verify with a controlled run.',
    value: 'Investigations start from evidence, not opinion — and blame lands nowhere it should not.',
  },
  {
    id: 'bottleneck',
    group: 'Operations',
    name: 'Production bottleneck identification',
    asset: 'Five-station assembly line',
    chart: 'bottleneck',
    formula: 'constraint = station with max working share whose upstream is blocked and downstream starved',
    formulaNote: 'A state-based method; cycle time alone can mislead when stations have different minor-stop behaviour.',
    problem: 'The line misses rate and every station looks busy. Capex for a second station 4 is being discussed.',
    data: 'Station states (working, starved, blocked), cycle times and buffer levels at 1 s resolution.',
    dataset: {
      columns: ['Station', 'Cycle (s)', 'Working', 'Starved', 'Blocked'],
      rows: [
        ['S2', '3.9', '90 %', '0 %', '10 %'],
        ['S3', '5.4', '100 %', '0 %', '0 %'],
        ['S4', '3.4', '59 %', '41 %', '0 %'],
        ['S5', '3.7', '61 %', '39 %', '0 %'],
      ],
    },
    analysis: 'Time in each state is accumulated per station; the constraint is identified from the blocking/starving pattern rather than averages.',
    output: 'Station 3 limits throughput: never starved, its upstream buffer full, downstream stations starved.',
    confidence: 'Stable across 12 shifts analysed; holds for both product variants.',
    action: 'Focus on station 3 changeovers and minor stops before adding capacity at station 4.',
    value: 'Improvement effort raises output; an unnecessary capital request is avoided.',
  },
  {
    id: 'oee',
    group: 'Operations',
    name: 'OEE loss analysis',
    asset: 'Packaging line 2',
    chart: 'oee',
    formula: 'OEE = Availability × Performance × Quality',
    formulaNote: 'Losses are decomposed into the six classic categories so that one number becomes a ranked list.',
    problem: 'OEE is reported weekly as a single number that nobody can act on.',
    data: 'Machine states, ideal cycle time, total and good counts per shift.',
    dataset: {
      columns: ['Factor', 'Value', 'Main loss'],
      rows: [
        ['Availability', '0.82', 'Changeovers 11 %'],
        ['Performance', '0.86', 'Reduced speed 8 %'],
        ['Quality', '0.96', 'Scrap 3 %'],
        ['OEE', '0.68', '—'],
      ],
    },
    analysis: 'Planned time is decomposed into breakdowns, changeovers, minor stops, reduced speed, scrap and rework.',
    output: 'Changeovers are the largest single loss, ahead of breakdowns.',
    confidence: 'Based on 6 weeks of state data; changeover classification checked against operator logs.',
    action: 'Run a SMED workshop on the two most frequent changeovers and track changeover time per shift.',
    value: 'A ranked, owned list of losses instead of a number on a slide.',
  },
  {
    id: 'alarms',
    group: 'Operations',
    name: 'Alarm & event correlation',
    asset: 'Utilities SCADA · one shift',
    chart: 'alarms',
    formula: 'alarm rate per 10 min vs ISA-18.2 benchmarks  ·  group alarms within Δt of a root event',
    formulaNote: 'Benchmarks (≈1 alarm per 10 min manageable; >10 is a flood) guide rationalisation; they are not pass/fail limits.',
    problem: 'Operators face hundreds of alarms per shift and acknowledge them by reflex.',
    data: 'The SCADA alarm & event journal: activations, acknowledgements, returns to normal and operator actions.',
    dataset: {
      columns: ['Time', 'Tag', 'Event', 'Priority'],
      rows: [
        ['06:42:10', 'CMP-01', 'trip', 'high'],
        ['06:42:11', 'PT-221', 'header pressure LO', 'medium'],
        ['06:42:14', 'FT-088', 'flow deviation', 'low'],
        ['06:42:15 →', '34 more', 'consequential alarms', 'mixed'],
      ],
    },
    analysis: 'Alarm rates are compared with benchmarks; alarms following a root event within a time window are grouped; chattering and standing alarms are flagged.',
    output: 'Three floods this shift, each traced to a single root event; ten alarms create 71 % of the load, four of them chattering.',
    confidence: 'Grouping verified on 3 weeks of journal; 2 groups need operator confirmation.',
    action: 'Suppress consequential alarms by design, fix chattering deadbands, and document the response for the top ten.',
    value: 'Fewer, more meaningful alarms — the one that matters is no longer buried in a flood.',
  },
  {
    id: 'energy',
    group: 'Energy',
    name: 'Energy anomaly detection',
    asset: 'Hall B · compressed air and extraction',
    chart: 'energy',
    formula: 'Ê = β₀ + β₁·units + β₂·T_amb  ·  anomaly if E − Ê > 2σ_res',
    formulaNote: 'A baseline regression in the spirit of ISO 50006 energy baselines; coefficients are re-estimated quarterly.',
    problem: 'Energy is a top-three cost, but consumption is only reviewed on the monthly bill.',
    data: 'Sub-metered electrical load (kW, 15 min), compressed-air flow (m³/min), output (units/h) and ambient temperature (°C).',
    dataset: {
      columns: ['Interval', 'Units/h', 'T (°C)', 'E (kW)', 'Ê (kW)'],
      rows: [
        ['Tue 10:00', '72', '24', '183', '181'],
        ['Tue 15:00', '68', '27', '178', '174'],
        ['Tue 23:00', '0', '19', '60', '22'],
        ['Sun 03:00', '0', '17', '58', '22'],
      ],
    },
    analysis: 'The baseline explains consumption from output and weather; residuals reveal energy that production does not explain.',
    output: 'About 38 kW drawn on nights and weekends with zero output — compressors and extraction left running.',
    confidence: 'Residual exceeds 2σ in 94 % of non-production intervals over 4 weeks.',
    action: 'Automated idle shutdown on non-production schedules and a leak survey on the compressed-air network.',
    value: 'A verifiable baseline to measure savings against, aligned with ISO 50001 practice.',
  },
];

export const intelligenceCopy = {
  index: '03',
  eyebrow: 'Industrial decision lab',
  title: 'From data to decisions.',
  lede: 'Eight industrial scenarios, each followed from the problem and its data to the analysis, the output with its uncertainty, the engineering action and the value. The lab plays itself — or choose a scenario.',
  disclaimer: 'Illustrative simulations on synthetic data. Formulas are simplified cues to the method.',
};
