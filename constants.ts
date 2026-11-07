import type { Event } from './types';

export const EVENTS: Event[] = [
  {
    id: 101,
    title: "Global AI Leaders Summit 2026",
    description: "An executive gathering of frontier AI researchers, engineering VPs, and enterprise leaders discussing safe scaling, multimodal agents, and next-gen infrastructure.",
    date: "2026-11-24",
    time: "09:00 AM - 05:00 PM",
    location: "Palace of Fine Arts, San Francisco, CA",
    isVirtual: false,
    category: "Conference",
    status: "Upcoming",
    capacity: 250,
    registrations: [
      { id: 1, name: "Elena Rostova", email: "elena.rostova@frontier.ai", checkedIn: true, registeredAt: "2026-11-01" },
      { id: 2, name: "Marcus Chen", email: "mchen@synthetix.io", checkedIn: true, registeredAt: "2026-11-02" },
      { id: 3, name: "Sarah Jenkins", email: "sjenkins@cloudscale.net", checkedIn: false, registeredAt: "2026-11-03" },
      { id: 4, name: "Dr. Tariq Al-Mansoor", email: "t.mansoor@vectorlab.org", checkedIn: false, registeredAt: "2026-11-04" },
      { id: 5, name: "Amara Osei", email: "amara@deepfoundry.tech", checkedIn: false, registeredAt: "2026-11-05" },
    ],
    agenda: [
      { id: "ag-1", time: "09:00 AM", title: "Registration & Breakfast Networking", speakerOrLead: "Executive Host Committee", notes: "Main atrium entrance" },
      { id: "ag-2", time: "10:00 AM", title: "Keynote: The Architecture of Reasoning Agents", speakerOrLead: "Dr. Alistair Vance", notes: "Main Auditorium A" },
      { id: "ag-3", time: "11:30 AM", title: "Panel: Enterprise Inference at Scale", speakerOrLead: "Moderated by Elena Rostova", notes: "Breakout Stage 1" },
      { id: "ag-4", time: "01:00 PM", title: "Catered Executive Lunch & VIP Roundtable", speakerOrLead: "All Attendees", notes: "Terrace Garden" },
      { id: "ag-5", time: "02:30 PM", title: "Hands-on Workshop: Realtime Multimodal Pipelines", speakerOrLead: "Marcus Chen", notes: "Lab Suite B" },
      { id: "ag-6", time: "04:30 PM", title: "Closing Remarks & Evening Reception", speakerOrLead: "Executive Host Committee", notes: "Skyline Lounge" },
    ]
  },
  {
    id: 102,
    title: "Full-Stack Design Systems Masterclass",
    description: "An intensive interactive workshop for senior designers and engineers on token architectures, accessible component design, and fluid micro-interactions in React 19.",
    date: "2026-12-05",
    time: "10:00 AM - 02:00 PM",
    location: "https://zoom.us/j/9482710384",
    isVirtual: true,
    category: "Workshop",
    status: "Upcoming",
    capacity: 60,
    registrations: [
      { id: 6, name: "Chloe Dupont", email: "chloe@designfoundry.co", checkedIn: false, registeredAt: "2026-11-04" },
      { id: 7, name: "Liam O'Connor", email: "liam.oc@frontendcraft.io", checkedIn: true, registeredAt: "2026-11-05" },
      { id: 8, name: "Yuki Tanaka", email: "ytanaka@tokyoworks.jp", checkedIn: false, registeredAt: "2026-11-06" }
    ],
    agenda: [
      { id: "ag-11", time: "10:00 AM", title: "Token Hierarchies & Semantic Theme Tokens", speakerOrLead: "Lead Design Engineer", notes: "Figma + Tailwind v4 sync" },
      { id: "ag-12", time: "11:15 AM", title: "Compound Component Patterns & Headless Primitives", speakerOrLead: "Staff Architect", notes: "Live refactoring demo" },
      { id: "ag-13", time: "12:30 PM", title: "Interactive Audit: Accessibility & Focus Traps", speakerOrLead: "Accessibility Specialist", notes: "Interactive group review" },
      { id: "ag-14", time: "01:45 PM", title: "Q&A and Distribution Package Setup", speakerOrLead: "Lead Design Engineer", notes: "Private GitHub repo access" }
    ]
  },
  {
    id: 103,
    title: "Founders & Angels Sunset Mixer",
    description: "Curated networking evening connecting seed and Series-A founders with venture partners across enterprise software, developer tools, and autonomous robotics.",
    date: "2026-11-18",
    time: "06:30 PM - 09:30 PM",
    location: "Rooftop Conservatory, SoMa, San Francisco",
    isVirtual: false,
    category: "Networking",
    status: "Upcoming",
    capacity: 80,
    registrations: [
      { id: 9, name: "Kavita Rao", email: "kavita@nexusventures.vc", checkedIn: true, registeredAt: "2026-11-03" },
      { id: 10, name: "David Miller", email: "dmiller@quantumseed.com", checkedIn: false, registeredAt: "2026-11-04" }
    ],
    agenda: [
      { id: "ag-21", time: "06:30 PM", title: "Check-in & Welcome Cocktails", speakerOrLead: "Event Concierge", notes: "Name badges and sector tags" },
      { id: "ag-22", time: "07:15 PM", title: "Flash Pitches: 5-Minute Lightning Introductions", speakerOrLead: "Founders Cohort", notes: "Main stage" },
      { id: "ag-23", time: "08:00 PM", title: "Open Curated Networking & Hors d'Oeuvres", speakerOrLead: "All Attendees", notes: "Conservatory Lounge" }
    ]
  }
];

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
