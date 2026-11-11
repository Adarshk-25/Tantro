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
  | 'energy'
  | 'utility';

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
    id: "anomaly",
    group: "Asset health",
    name: "Machine anomaly detection",
    asset: "Cooling pump P-102",
    chart: "anomaly",
    formula: "zₜ = (xₜ − μ̂ₛ) / σ̂ₛ  ·  alert if zₜ > 3 for k = 6 windows",
    formulaNote: "The baseline (μ̂, σ̂) is learned per operating state s from healthy weeks, so a change in load is not mistaken for a fault.",
    problem: "A critical cooling pump has no failure history to learn from — the usual situation in a plant.",
    data: "Vibration velocity (mm/s RMS, 10 kHz sampling, 10 s windows), bearing temperature (°C) and motor current (A).",
    dataset: {"columns": ["Window", "State", "v_RMS (mm/s)", "HF band (g²)", "z"], "rows": [["06:00", "full load", "2.2", "0.011", "0.4"], ["06:10", "full load", "2.4", "0.019", "1.6"], ["06:20", "full load", "2.9", "0.034", "3.1"], ["06:30", "full load", "3.4", "0.041", "3.4"]]},
    analysis: "Band energy is compared with the state-specific baseline; an alert needs a sustained exceedance, not a single spike.",
    output: "High-frequency band energy 3.4σ above normal for six consecutive windows — consistent with early bearing wear.",
    confidence: "Detection only: the cause is a hypothesis until inspected. False-alarm rate on healthy weeks: about 1 per 3 months.",
    action: "Raise an inspection for the next planned stop; check lubrication and alignment. Do not trip the pump.",
    value: "A likely unplanned stop becomes a planned, short intervention.",
  },
  {
    id: "toolwear",
    group: "Asset health",
    name: "Tool wear & remaining useful life",
    asset: "Tool T12 · CNC cell 3",
    chart: "toolwear",
    formula: "VB(n) ≈ a·nᵇ  ·  RUL ≈ (VB_max − VB(n)) / (dVB/dn)",
    formulaNote: "Flank wear VB is measured occasionally; spindle power and load estimate it between measurements. VB_max = 0.3 mm is a common rule of thumb, set per process.",
    problem: "Tools are changed on fixed part counts — too early on easy jobs, too late on hard ones.",
    data: "Spindle power (kW) and load (%) per part, cycle time (s), and flank wear (mm) measured at tool changes.",
    dataset: {"columns": ["Parts", "P_spindle (kW)", "VB meas. (mm)", "VB est. (mm)"], "rows": [["120", "6.1", "0.08", "0.08"], ["330", "6.4", "0.13", "0.12"], ["520", "6.9", "—", "0.19"], ["610", "7.3", "—", "0.22"]]},
    analysis: "A wear curve is fitted to process signals and calibrated with the measured VB points; break-in, steady and accelerated wear phases are recognised.",
    output: "Tool T12 has entered accelerated wear; estimated 140 parts before VB reaches 0.3 mm.",
    confidence: "80 % interval: 105–175 parts. Uncertainty grows because measured points are sparse.",
    action: "Schedule the tool change at the next changeover instead of mid-batch; measure VB at removal to update the model.",
    value: "Fewer scrapped parts at end of tool life and fewer tools discarded early.",
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
    id: "downtime",
    group: "Operations",
    name: "Downtime pattern analysis",
    asset: "Assembly line A",
    chart: "downtime",
    formula: "m(d,h) = Σ stop minutes by weekday d and hour h  ·  flag cells with z > 2",
    formulaNote: "Comparison is against the line’s own average for that hour; seasonality and planned stops are excluded first.",
    problem: "Stops feel random. Reports list them, but no pattern is visible.",
    data: "Every stop with start time, duration (min) and reason code over eight weeks, plus shift calendar.",
    dataset: {"columns": ["Day", "Hour", "Stop min", "z"], "rows": [["Mon", "06", "41", "2.6"], ["Tue", "06", "38", "2.3"], ["Wed", "14", "36", "2.2"], ["Thu", "10", "9", "−0.3"]]},
    analysis: "Stops are aggregated by weekday and hour and compared with the average to find clusters unlikely to be chance.",
    output: "Stops cluster in the first hour after shift start, Monday to Wednesday — reason codes point to material staging.",
    confidence: "Pattern present in 7 of 8 weeks; reason codes cover 82 % of the stop minutes in the cluster.",
    action: "Move material staging to the end of the previous shift and track the first-hour stop rate.",
    value: "A process fix with no capital spend.",
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
    id: "guidance",
    group: "Operations",
    name: "Operator troubleshooting guidance",
    asset: "Hydraulic press HP-3",
    chart: "guidance",
    formula: "P(cause | symptoms) ∝ P(symptoms | cause) · P(cause)  ·  order checks by P / effort",
    formulaNote: "Priors come from the maintenance history; likelihoods from engineering knowledge of the failure modes. The technician decides.",
    problem: "A night-shift technician faces a fault they have seen once before.",
    data: "Active alarms, recent state changes, hydraulic pressure (bar) and temperature (°C), and the asset’s work-order history.",
    dataset: {"columns": ["Signal", "Now", "Normal"], "rows": [["System pressure", "118 bar", "160 bar"], ["Oil temperature", "58 °C", "45–55 °C"], ["Filter Δp switch", "ON", "OFF"], ["Last filter change", "14 months", "12 months"]]},
    analysis: "Likely causes are ranked from the symptoms and history; checks are ordered by probability and effort, linked to the asset’s procedures.",
    output: "Clogged return filter is most likely (0.52), then a worn pump (0.27).",
    confidence: "Ranking, not a diagnosis: the first check confirms or rejects the leading hypothesis within minutes.",
    action: "Guided steps: check filter differential pressure first, then pump case-drain flow, following site lockout procedures.",
    value: "Faster recovery and consistent, documented troubleshooting across shifts.",
  },
  {
    id: "forecast",
    group: "Operations",
    name: "Throughput & production forecasting",
    asset: "Line 2 · weekly plan",
    chart: "forecast",
    formula: "ŷ(t+h) = f(mix, staffing, history)  ·  80 % prediction interval",
    formulaNote: "Intervals widen with horizon; the forecast is re-run every hour as the mix and staffing change.",
    problem: "Planners learn on Friday that the weekly target will be missed.",
    data: "Hourly good output (units/h), product mix, staffing and planned downtime.",
    dataset: {"columns": ["Day", "Plan (units)", "Actual", "Forecast end-of-week"], "rows": [["Mon", "2,100", "2,040", "—"], ["Tue", "2,100", "1,980", "10,120"], ["Wed (now)", "2,100", "—", "10,060 ± 380"], ["Target", "10,500", "—", "—"]]},
    analysis: "A model of remaining-week output by hour, with an interval, from mix, staffing and recent performance.",
    output: "At the current mix there is about a 68 % probability of missing the weekly target.",
    confidence: "Probability from the 80 % interval of the forecast distribution; back-tested on 20 past weeks.",
    action: "Resequence two high-runner orders to Tuesday and authorise one extra shift now.",
    value: "Decisions move from Friday firefighting to Tuesday planning.",
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
  {
    id: "utility",
    group: "Energy",
    name: "Energy optimisation & utility intelligence",
    asset: "Compressed-air plant · 3 compressors",
    chart: "utility",
    formula: "SP = P_total / Q_delivered (kWh/m³)  ·  stage to meet Q(t) at minimum SP",
    formulaNote: "Specific power is the standard efficiency measure for compressed air; staging respects minimum run times and pressure limits.",
    problem: "Three compressors run all day at partial load, regardless of demand.",
    data: "Compressor power (kW), delivered flow (m³/min), header pressure (bar) and production schedule, at 1-minute resolution.",
    dataset: {"columns": ["Hour", "Demand (m³/min)", "Running", "SP (kWh/m³)"], "rows": [["02:00", "8.5", "C1+C2+C3", "0.142"], ["10:00", "27.0", "C1+C2+C3", "0.118"], ["14:00", "24.5", "C1+C2+C3", "0.120"], ["22:00", "11.0", "C1+C2+C3", "0.137"]]},
    analysis: "Demand is profiled by hour; a staging plan matches running capacity to demand with a pressure margin, then is simulated against the last 4 weeks.",
    output: "Staged operation would lower average specific power from 0.126 to about 0.109 kWh/m³ (simulated).",
    confidence: "Simulation on historical demand; savings to be verified with metered data after a trial period (IPMVP-style baseline).",
    action: "Pilot the staging plan through the compressor master controller for two weeks; fix the leaks found at night.",
    value: "Lower energy cost per unit of air, verified against a measured baseline.",
  },
];

export const intelligenceCopy = {
  index: '05',
  eyebrow: 'Industrial decision lab',
  title: 'From data to decisions.',
  lede: 'Fourteen industrial scenarios, each followed from the problem and its data to the analysis, the output with its uncertainty, the engineering action and the value. The lab plays itself — or choose a scenario.',
  disclaimer: 'Illustrative simulations on synthetic data. Formulas are simplified cues to the method.',
};
