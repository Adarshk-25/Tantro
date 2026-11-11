/**
 * Chapter 03 — the Industrial Decision Lab.
 * Each use case runs Context → Signals → Model logic → Insight → Action → Impact.
 * All data is synthetic; formulas are simplified cues, not full methods.
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
  chart: ChartKind;
  formula: string;
  context: string;
  signals: string;
  model: string;
  insight: string;
  action: string;
  impact: string;
};

export const stepLabels = ['Context', 'Input signals', 'Model logic', 'Insight', 'Recommended action', 'Business impact'] as const;

export const useCases: UseCase[] = [
  {
    id: 'anomaly',
    group: 'Asset health',
    name: 'Machine anomaly detection',
    chart: 'anomaly',
    formula: 'zₜ = (xₜ − μ̂ₛ) / σ̂ₛ  ·  alert if zₜ > 3 for k windows',
    context: 'A critical cooling pump has no failure history to learn from — the usual situation in a plant.',
    signals: 'Vibration velocity at 10 kHz, bearing temperature and motor current, windowed every 10 s.',
    model: 'A baseline learned per operating state (s) from healthy weeks. Band energy is compared, not just amplitude, so changes show before the alarm limit.',
    insight: 'High-frequency band energy is 3.4σ above the learned normal for six consecutive windows — consistent with early bearing wear (FMEA: bearing, severity 7).',
    action: 'Inspection work order for the next planned stop; check lubrication and alignment. No trip.',
    impact: 'Converts a likely unplanned stop into a planned, short intervention.',
  },
  {
    id: 'health',
    group: 'Asset health',
    name: 'Predictive maintenance health index',
    chart: 'health',
    formula: 'HI = 1 − Σ wᵢ·ẑᵢ  ·  RUL: t where HI(t) ≤ HI_min',
    context: 'A fleet of 40 motors and gearboxes; maintenance runs on fixed intervals regardless of condition.',
    signals: 'Condition indicators per asset: vibration RMS, kurtosis, temperature rise, current imbalance.',
    model: 'Indicators are normalised against each asset’s own baseline and weighted by failure-mode relevance into one health index. A degradation trend projects remaining useful life with an uncertainty band.',
    insight: 'Gearbox G-07 health is 0.58 and falling; projected to reach the intervention threshold in 19 ± 6 days.',
    action: 'Plan the gearbox service into the shutdown in two weeks; order the bearing kit now.',
    impact: 'Maintenance effort follows condition, not the calendar; spares are ordered before they are urgent.',
  },
  {
    id: 'toolwear',
    group: 'Asset health',
    name: 'Tool wear estimation',
    chart: 'toolwear',
    formula: 'VB(n) ≈ a·n^b  ·  RUL ≈ (VB_max − VB(n)) / (dVB/dn)',
    context: 'Tools are changed on fixed part counts — early on easy jobs, too late on hard ones.',
    signals: 'Spindle load, power and cycle time per part, plus occasional measured flank wear (VB) at tool changes.',
    model: 'A wear curve fitted from process signals, calibrated with the measured VB points; break-in, steady and accelerated wear are recognised.',
    insight: 'This tool has entered accelerated wear; estimated 140 ± 35 parts before VB reaches 0.3 mm.',
    action: 'Schedule the tool change at the next changeover instead of mid-batch.',
    impact: 'Fewer scrapped parts at end of tool life, and fewer tools discarded early.',
  },
  {
    id: 'vision',
    group: 'Quality',
    name: 'Vision-based quality inspection',
    chart: 'vision',
    formula: 'p(class | image) via softmax  ·  reject if p(defect) ≥ τ',
    context: 'Manual end-of-line inspection catches obvious defects but misses fine scratches near features.',
    signals: 'A triggered image per part under controlled lighting, with part ID from the PLC.',
    model: 'The image is aligned to part geometry, then a classifier scores each region. The decision threshold τ is set from the cost of a false reject versus an escape.',
    insight: 'Scratch near the mounting hole: p(scratch) = 0.93, p(dent) = 0.04, p(ok) = 0.03.',
    action: 'Divert to the review lane, tag the batch, and link the image to machine state at production time.',
    impact: 'Consistent inspection on every part, with evidence that supports root-cause work.',
  },
  {
    id: 'spc',
    group: 'Quality',
    name: 'Process drift detection',
    chart: 'spc',
    formula: 'Cpk = min(USL − μ, μ − LSL) / 3σ  ·  rule: 8 points one side of x̄',
    context: 'A bore diameter is still in tolerance, so no one is looking at it.',
    signals: 'In-line gauge measurements per part, subgrouped by five.',
    model: 'An X̄ control chart with control limits from a stable reference period, plus run rules to detect drift long before a specification limit is crossed.',
    insight: 'A sustained upward shift started 22 subgroups ago; Cpk has fallen from 1.67 to 1.12.',
    action: 'Check tool offset and thermal compensation; correct before Cpk falls below 1.0.',
    impact: 'Drift corrected while every part is still good — no sorting, no scrap.',
  },
  {
    id: 'rootcause',
    group: 'Quality',
    name: 'Root-cause assistance',
    chart: 'rootcause',
    formula: 'rank causes by Δ contribution to P(defect)  ·  check: does removing it restore baseline?',
    context: 'Scrap rose last week. Six people have six theories.',
    signals: 'Defect records joined with process context: material batch, tool age, coolant temperature, shift, speeds.',
    model: 'A model of defect probability is trained on the joined data; each factor’s contribution is estimated and checked against a counterfactual.',
    insight: 'Material batch B-17 and coolant temperature explain most of the increase; shift and operator do not.',
    action: 'Quarantine remaining B-17 stock, check the coolant chiller, and verify with a controlled run.',
    impact: 'Investigations start from evidence, not opinion — and blame lands nowhere it should not.',
  },
  {
    id: 'bottleneck',
    group: 'Operations',
    name: 'Production bottleneck identification',
    chart: 'bottleneck',
    formula: 'constraint = argmax(working share) where upstream blocked ∧ downstream starved',
    context: 'A five-station line misses rate. Every station looks busy.',
    signals: 'Station states (working, starved, blocked), cycle times and buffer levels.',
    model: 'Each station’s time is classified by state. The constraint is the station that is almost never starved while its upstream is blocked and downstream starved.',
    insight: 'Station 3 is the constraint: 100% working, its upstream buffer full, downstream starved.',
    action: 'Focus improvement on station 3 — changeover and minor stops — before adding capacity elsewhere.',
    impact: 'Improvement effort goes where it raises output; capex elsewhere can wait.',
  },
  {
    id: 'oee',
    group: 'Operations',
    name: 'OEE loss analysis',
    chart: 'oee',
    formula: 'OEE = Availability × Performance × Quality',
    context: 'OEE is reported weekly as a single number that nobody can act on.',
    signals: 'Machine states, ideal cycle times, good and rejected counts from the line.',
    model: 'Planned time is decomposed into the six classic losses — breakdowns, changeovers, minor stops, reduced speed, scrap and rework.',
    insight: 'Changeovers are the largest loss on this line, ahead of breakdowns.',
    action: 'Run a SMED workshop on the two most frequent changeovers.',
    impact: 'A single number becomes a ranked list of what to fix first.',
  },
  {
    id: 'downtime',
    group: 'Operations',
    name: 'Downtime pattern analysis',
    chart: 'downtime',
    formula: 'stop minutes aggregated by (weekday, hour) · cluster where z > 2',
    context: 'Stops feel random. Reports list them, but no pattern is visible.',
    signals: 'Every stop with start time, duration and reason code over eight weeks.',
    model: 'Stops are aggregated by weekday and hour and compared with the line’s average to find clusters that are unlikely to be chance.',
    insight: 'Stops cluster in the first hour after shift start, Monday to Wednesday — material staging, not machines.',
    action: 'Move material staging to the end of the previous shift; track the first-hour stop rate.',
    impact: 'A process fix with no capital spend.',
  },
  {
    id: 'forecast',
    group: 'Operations',
    name: 'Throughput prediction',
    chart: 'forecast',
    formula: 'ŷₜ₊ₕ = f(mix, staffing, history)  ·  80% prediction interval',
    context: 'Planners learn on Friday that the weekly target will be missed.',
    signals: 'Hourly output, product mix, staffing and planned downtime.',
    model: 'A forecast of remaining-week output with a prediction interval, updated each hour as the mix changes.',
    insight: 'At the current mix there is a 68% probability of missing the weekly target by Thursday.',
    action: 'Resequence two high-runner orders to Tuesday and authorise one extra shift now.',
    impact: 'Decisions move from Friday firefighting to Tuesday planning.',
  },
  {
    id: 'alarms',
    group: 'Operations',
    name: 'Alarm rationalisation insights',
    chart: 'alarms',
    formula: 'alarm rate per 10 min vs ISA-18.2 benchmarks · flood if > 10',
    context: 'Operators face hundreds of alarms per shift and acknowledge them by reflex.',
    signals: 'The alarm and event journal from SCADA: activations, acknowledgements, returns to normal.',
    model: 'Alarm rates are compared with ISA-18.2 benchmarks; floods, chattering and standing alarms are identified; bad actors are ranked.',
    insight: 'Three floods this shift; ten alarms create 71% of the load, four of them chattering.',
    action: 'Fix deadbands on chattering alarms, review priorities, and document the response for the top ten.',
    impact: 'Operators see fewer, more meaningful alarms — and respond to the ones that matter.',
  },
  {
    id: 'guidance',
    group: 'Operations',
    name: 'AI-assisted troubleshooting',
    chart: 'guidance',
    formula: 'P(cause | symptoms) ∝ P(symptoms | cause) · P(cause)  ·  order checks by P / effort',
    context: 'A night-shift technician faces a fault they have seen once before.',
    signals: 'Active alarms, recent state changes, and the asset’s maintenance history.',
    model: 'Likely causes are ranked from the symptoms and history; checks are ordered by probability and effort, with the procedure from the asset’s documentation.',
    insight: 'Low hydraulic pressure: a clogged filter is most likely (0.52), then a worn pump (0.27).',
    action: 'Step-by-step guidance: check filter differential pressure first, then pump case drain flow.',
    impact: 'Faster recovery with consistent, documented troubleshooting.',
  },
  {
    id: 'energy',
    group: 'Energy',
    name: 'Energy optimisation & utility anomaly',
    chart: 'energy',
    formula: 'Ê = β₀ + β₁·units + β₂·T_amb  ·  anomaly if E − Ê > 2σ',
    context: 'Energy is a top-three cost, but consumption is only seen on the monthly bill.',
    signals: 'Sub-metered electrical load, compressed-air flow, production output and ambient temperature.',
    model: 'A baseline regression predicts expected energy from output and weather; residuals show waste that production does not explain.',
    insight: 'Nights and weekends draw 38 kW with zero output — compressors and extraction left running.',
    action: 'Automated idle shutdown on non-production schedules; leak survey on compressed air.',
    impact: 'A verifiable baseline to measure savings against, aligned with ISO 50001 practice.',
  },
];

export const intelligenceCopy = {
  index: '03',
  eyebrow: 'Industrial decision lab',
  title: 'From data to decisions.',
  lede: 'Thirteen industrial use cases, each followed from raw signal to model logic, insight, action and impact. The lab plays itself — or choose a use case and step through it.',
  disclaimer: 'Illustrative simulations on synthetic data. Formulas are simplified cues to the method.',
};
