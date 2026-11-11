/**
 * OT Cybersecurity & Secure Industrial Infrastructure.
 * The explorer is defensive and educational: it illustrates architecture, not attacks.
 */

export const securityCopy = {
  index: '03',
  eyebrow: 'OT cybersecurity & secure industrial infrastructure',
  title: 'Protecting the systems that keep industry running.',
  lede: 'Security for operational technology has different priorities from IT: safety, availability and continuity come first. We assess, segment, harden and monitor industrial systems with those constraints built in.',
};

export const securityServices = [
  {
    id: 'assessment',
    name: 'OT security assessment',
    items: [
      'OT asset inventory and visibility',
      'Network and communication discovery',
      'Exposure and architecture review',
      'Security maturity and gap assessment',
      'Critical asset identification',
      'Vulnerability and risk prioritisation',
    ],
  },
  {
    id: 'segmentation',
    name: 'Network segmentation & secure architecture',
    items: [
      'Zones and conduits',
      'Industrial DMZ architecture',
      'Firewall architecture and rule review',
      'Segregation of OT and enterprise environments',
      'Secure edge integration',
      'Industrial remote-access architecture',
    ],
  },
  {
    id: 'hardening',
    name: 'OT system hardening',
    items: [
      'PLC / DCS / SCADA security configuration review',
      'Windows and server hardening',
      'Network device configuration review',
      'Access control and account management',
      'Backup and restore planning',
      'Patch and vulnerability management coordination',
      'Secure configuration baselines',
    ],
  },
  {
    id: 'monitoring',
    name: 'Monitoring & resilience',
    items: [
      'OT network monitoring architecture',
      'Security event visibility',
      'Asset communication baselining',
      'Incident response planning',
      'Recovery architecture and backup validation',
      'Operational continuity considerations',
    ],
  },
];

export const standards = [
  { name: 'IEC 62443', text: 'Zones and conduits, security levels and secure development lifecycle principles for industrial automation and control systems.' },
  { name: 'NIST SP 800-82', text: 'Guidance on OT security architecture, risk management and incident response for industrial control systems.' },
  { name: 'ISA-95', text: 'Functional levels that inform where boundaries and data exchanges belong between control and enterprise.' },
  { name: 'Site & enterprise policy', text: 'Your own security, safety and change-management requirements, which always govern the design.' },
];
export const standardsNote =
  'We apply principles from these standards in our engineering. Referencing a standard does not imply certification of Tantro or compliance of any system; a website demonstration is not an assessment.';

/* ---------------- Secure Industrial Operations Explorer ---------------- */

export type SecScenario = 'flat' | 'segmented' | 'remote' | 'monitoring' | 'recovery';

export const secScenarios: {
  id: SecScenario;
  letter: string;
  name: string;
  challenge: string;
  affected: string;
  control: string;
  operational: string;
  residual: string;
}[] = [
  {
    id: 'flat',
    letter: 'A',
    name: 'Flat network exposure',
    challenge: 'Enterprise users, a vendor laptop and controllers share one flat network. Any compromised or misconfigured device can reach PLCs, DCS and SCADA directly.',
    affected: 'PLC, DCS controllers, SCADA servers, operator HMIs, engineering workstation',
    control: 'Not yet in place — this is the starting point an assessment typically finds.',
    operational: 'Changes must be staged: discovering real communication flows first avoids breaking production.',
    residual: 'High exposure. Verification starts with an asset inventory and passive traffic baseline.',
  },
  {
    id: 'segmented',
    letter: 'B',
    name: 'Segmented industrial architecture',
    challenge: 'Separate control, supervisory, site operations and enterprise environments while keeping required data flowing.',
    affected: 'All zones; conduits defined between each',
    control: 'Zones and conduits with industrial firewalls; an industrial DMZ where data is replicated outward. Only approved, documented flows cross a boundary — enterprise systems never initiate connections to controllers.',
    operational: 'Firewall rules derived from observed, approved flows; changes go through site change management; redundancy considered for critical paths.',
    residual: 'Reduced, not eliminated. A firewall alone does not secure a system: hardening, monitoring and rule reviews are still required. Verify with rule review and flow testing.',
  },
  {
    id: 'remote',
    letter: 'C',
    name: 'Secure remote maintenance',
    challenge: 'A machine vendor needs remote access to diagnose a fault without permanent inbound access into OT.',
    affected: 'Engineering workstation, target PLC',
    control: 'Remote-access gateway in the DMZ with multi-factor authentication, per-session approval by site operations, a jump host, time-limited access to a named asset, and full session recording.',
    operational: 'Site keeps control: sessions are requested, approved, supervised and closed. Access window matches the maintenance task.',
    residual: 'Residual risk from authorised users remains; review recordings and accounts periodically.',
  },
  {
    id: 'monitoring',
    letter: 'D',
    name: 'Security monitoring',
    challenge: 'Detect communication that does not match how the plant normally behaves.',
    affected: 'A controller receiving unexpected write requests',
    control: 'A passive monitoring sensor on a switch mirror port baselines normal industrial communication. An unknown host issuing write requests to a PLC is flagged for investigation and forwarded to security event management.',
    operational: 'Passive monitoring adds no traffic to the control network. Alerts are triaged with operations before any response action.',
    residual: 'Detection is not prevention. Response playbooks and tuning are needed to avoid alert fatigue.',
  },
  {
    id: 'recovery',
    letter: 'E',
    name: 'Recovery readiness',
    challenge: 'Be able to restore controllers and servers to a known-good state after a failure or incident.',
    affected: 'PLC programs, DCS configuration, SCADA servers, historian',
    control: 'Scheduled backups of programs and configurations to an offline-capable backup store, integrity checks, and periodic restore tests on a test system.',
    operational: 'Restore procedures are written, rehearsed and timed; backups are versioned with change records.',
    residual: 'An untested backup is an assumption. Verify by restoring and comparing against the running system.',
  },
];
