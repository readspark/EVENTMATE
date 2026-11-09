import type { Event } from './types';

// Empty by default - no pre-added mock events
export const EVENTS: Event[] = [];

export const CATEGORIES = [
  'All',
  'Conference',
  'Workshop',
  'Meetup',
  'Webinar',
  'Networking',
  'Executive'
] as const;

export const INSPIRATION_THEMES = [
  { label: "AI & Autonomous Systems", prompt: "Frontier AI and autonomous agents for enterprise automation" },
  { label: "Design Systems & UX", prompt: "Modern tokenized design systems and high-craft frontend engineering" },
  { label: "Founders & Angels Mixer", prompt: "Curated venture capital networking for seed to Series A tech founders" },
  { label: "CleanTech & Sustainability", prompt: "Sustainable energy transition, circular supply chains, and green infrastructure" },
  { label: "Cybersecurity Summit", prompt: "Zero-trust architecture, cloud workload security, and proactive incident response" },
  { label: "Product Leadership Roundtable", prompt: "Executive product strategy, roadmap prioritization, and metrics that matter" }
];
