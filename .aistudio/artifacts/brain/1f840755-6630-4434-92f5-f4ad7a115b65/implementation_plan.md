# EventMate Pro: Executive Event Management & Planning Suite

Transform EventMate from a basic prototype into a high-grade event planning and operations platform featuring an executive SaaS dashboard, interactive agenda builder, attendee management with check-in, .ics calendar exports, and multi-format AI promotional generation.

## User Review & Critical Decisions

> [!IMPORTANT]
> The current application stores data locally via `localStorage` with server-side Gemini 2.5 Flash endpoints. We will preserve existing local persistence while upgrading the data schema to support categories, capacity limits, run-of-show agendas, and check-in statuses seamlessly without data loss.

- **Confirmed Decision 1 (Execution Direct)**: The user confirmed to execute all professional polishes and feature additions end-to-end.
- **Visual Aesthetic**: Tailored SaaS dashboard adhering to the Universal Frontend Design Constitution (60-30-10 palette, zero-pill metadata discipline with unboxed text separators, Plus Jakarta Sans display typography, tabular figures for all dates and counts, and single-elevation surfaces).
- **Core Additions**:
  - Live search, category filters, and dual-view switcher (Grid Cards vs. High-Density Operations Table).
  - Multi-tab Event Operations workspace (Details, Attendees & Check-In, AI Run-of-Show Agenda, AI Multi-Channel Marketing).
  - Calendar `.ics` file generator alongside CSV exports.
  - Quick-start inspiration templates for the Idea Generator.

---

## 1. Overview & Core Concept

- **What It Does**: EventMate Pro is an event operations and creative planning hub. Planners can brainstorm event concepts with Gemini AI, configure schedules and capacity, manage attendee rosters with live check-in statuses, export `.ics` calendar invites and attendee CSVs, and draft multi-channel promotional copy.
- **Target Audience / Persona**: Event coordinators, community managers, corporate organizers, and workshop leaders who need a structured tool to manage logistics, agendas, and attendee communications in one cohesive place.
- **Key Value**: Streamlines the journey from abstract event idea to fully organized execution with zero friction and enterprise-grade polish.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Dashboard & Discovery**:
   - The user lands on an executive workspace with key metrics at the top (Total Events, Active Attendees, Confirmed Venues, Upcoming Schedules).
   - Filter events instantly by search query, status (*All, Upcoming, In Planning, Completed*), or category (*Conference, Workshop, Meetup, Webinar, Executive*).
   - Toggle between **Visual Grid Cards** (with cover art, capacity bars, and dates) and **High-Density Table View** (for rapid multi-event scanning).

2. **Event Operations & Management**:
   - Clicking **Manage** opens an operations modal with a tabbed layout:
     - **Overview & Logistics**: Edit title, date/time, venue/virtual link, category, capacity, and detailed brief.
     - **Attendees & Check-In**: Add/remove attendees, toggle check-in status (Registered vs. Checked In), download attendee CSV, and download standard `.ics` Calendar invites.
     - **AI Run-of-Show (Agenda)**: One-click generation of a minute-by-minute event timeline using Gemini, with editable agenda items.
     - **AI Communications Hub**: Draft custom reminder emails, LinkedIn announcement posts, or Twitter/X threads tailored to the event.

3. **Intelligent Idea Generator**:
   - One-click industry starter prompts (*"Executive AI Summit", "Sustainable Architecture Forum", "Founders Networking Dinner"*).
   - Generated cards display structured breakdowns: target audience, recommended format, suggested duration, and instant 1-click addition to dashboard.

4. **EventMate AI Assistant**:
   - Grounded chatbot floating console that knows all the user's active events.
   - Quick-action prompt chips (*"Draft an apology email for delay", "Suggest 3 icebreakers for my workshop", "Plan a $5k catering budget"*).
   - One-click copy for AI responses.

### Visual Identity & Theme Tokens

- **Aesthetic Direction**: High-end modern SaaS operations tool (sleek dark slate, crisp hairline borders, balanced negative space, zero pill clutter).
- **Color System (60-30-10 Rule)**:
  - `60% Neutral Canvas`: Deep midnight canvas (`bg-slate-950` / `#0b0f19`) and page background (`#0f172a`).
  - `30% Structural Surfaces`: Polished surface cards (`bg-slate-900/90` with `border border-slate-800`), muted borders (`border-slate-800/80`), subtle row hovers (`hover:bg-slate-800/50`).
  - `10% Intentional Accents`: Deep Indigo/Violet primary actions (`bg-indigo-600 hover:bg-indigo-500`), emerald confirmations (`text-emerald-400`), amber warnings.
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` or `Outfit` via clean modern typography.
  - Body Text: Clean readable sans with strict line-height (1.5–1.7).
  - Tabular Numerals: Tabular figures (`tabular-nums font-mono`) applied to all dates, times, attendee counts, and capacities.
- **Zero-Pill Metadata**: No colored candy badges or pill sandwiches. Metadata uses clean unboxed text with typographic separators (`·` or `/`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side .ICS Calendar File Generation**
  - *Chosen Approach*: Generate RFC 5545 compliant `.ics` files in the browser and trigger instant download.
  - *Why*: Allows organizers to import events directly into Apple Calendar, Google Calendar, or Outlook without needing third-party calendar sync APIs or OAuth logins.
- **Decision 2: Tabbed Modal vs. Multi-Page Routing**
  - *Chosen Approach*: Rich multi-tabbed operations modal directly within the SPA.
  - *Why*: Preserves lightning-fast state transitions, eliminates routing lag, and allows the user to inspect agendas or attendees while keeping their dashboard state in view.
- **Decision 3: Structured Gemini API Prompts with Fallbacks**
  - *Chosen Approach*: Dedicated serverless endpoint handlers for Run-of-Show and Marketing Copy, returning structured JSON with reliable client fallbacks.
  - *Why*: Guarantees that even if external network latency occurs, users always receive an editable template.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      EventMate Pro SPA                      │
│                                                             │
│  ┌───────────────────────┐  ┌────────────────────────────┐  │
│  │   Top Navigation Bar  │  │   Metrics & Analytics Bar  │  │
│  │  (Wordmark · Profile) │  │  (Total, Attendees, Dates) │  │
│  └───────────────────────┘  └────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │    Search, Category Filter & View Mode Controls       │  │
│  │   [Search...] [All/Upcoming/Drafts] [Grid | Table]    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────┐  ┌────────────────────────────┐  │
│  │   Idea Generator Box  │  │    Events Grid / Table     │  │
│  │  (Templates + Gemini) │  │   (Cards / Operations Rows)│  │
│  └───────────────────────┘  └─────────────┬──────────────┘  │
│                                           │                 │
│                                           ▼                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Event Operations Workspace Modal            │  │
│  │  ┌────────────┬─────────────┬───────────┬──────────┐  │  │
│  │  │  Overview  │  Attendees  │ Run-Show  │ Promo AI │  │  │
│  │  │ & Details  │ & Check-In  │  Agenda   │ Copy Hub │  │  │
│  │  └────────────┴─────────────┴───────────┴──────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │       Floating Grounded Gemini Assistant Chatbot      │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────────┐   ┌─────────────────────────┐
│     Client Local Storage      │   │   Serverless API Layer  │
│   (eventmate-events-v2)       │   │  /api/gemini/generate   │
│   (eventmate-user)            │   │  /api/gemini/reminder   │
│                               │   │  /api/gemini/chatbot    │
└───────────────────────────────┘   └─────────────────────────┘
```

### Data Model Enhancements (`types.ts`)

```typescript
export type EventCategory = 'Conference' | 'Workshop' | 'Meetup' | 'Webinar' | 'Networking' | 'Executive';
export type EventStatus = 'Draft' | 'Upcoming' | 'In Progress' | 'Completed';

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  speakerOrLead?: string;
  notes?: string;
}

export interface Registration {
  id: number;
  name: string;
  email: string;
  checkedIn?: boolean;
  registeredAt?: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  isVirtual?: boolean;
  category: EventCategory;
  status: EventStatus;
  capacity?: number;
  registrations: Registration[];
  agenda?: AgendaItem[];
}
```
