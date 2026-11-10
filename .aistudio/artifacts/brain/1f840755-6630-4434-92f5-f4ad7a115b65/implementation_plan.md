# Color Palette Integration Plan

Apply the user's custom color palette across EventMate Pro to establish a clean, cohesive emerald, amber, and slate visual identity with crisp contrast and accessible typographic hierarchy.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following color distribution decisions were confirmed during clarification:
> - **Primary (`#047857`)**: Main action buttons (Create Event, Register, Save, Generate, Chatbot launcher), active top navigation tabs, and primary interactive indicators.
> - **Secondary (`#10B981`)**: Check-in badges, success confirmations, checkmark icons, and active progress highlights.
> - **Accent (`#FBBF24`)**: AI ideation sparkles, key high-priority callouts, ratings, and active promotional banners.
> - **Background (`#F1F5F9`)**: Canvas backdrop for `html`, `body`, and page containers.
> - **Surface (`#FFFFFF`)**: Modal windows, cards, table surfaces, dropdown panels, and chat popup body.
> - **Main Text (`#0F172A`)**: Headings, titles, high-contrast labels, and primary inputs.
> - **Secondary Text (`#64748B`)**: Metadata timestamps, captions, subheadings, and placeholders.
> - **Theme Variables**: Registered in `:root` CSS variables and Tailwind theme config for system-wide consistency.

---

### 1. Overview & Visual Identity

The new palette delivers an organic, high-trust executive feel with deep emerald greens (`#047857`), fresh secondary mint highlights (`#10B981`), warm amber accents (`#FBBF24`), crisp neutral surfaces (`#FFFFFF`), and soft slate canvas tones (`#F1F5F9`).

#### Palette Mapping Matrix
| Token | HEX | Application / Role |
|---|---|---|
| **Primary** | `#047857` | Primary buttons, active nav pills, focused inputs, brand logo accent |
| **Secondary** | `#10B981` | Checked-in indicators, success badges, check icons, status pill highlight |
| **Accent** | `#FBBF24` | AI Studio sparkles, quick prompt chips, high-priority notifications, star badges |
| **Background** | `#F1F5F9` | App canvas, modal backdrop underlays, secondary control containers |
| **Surface** | `#FFFFFF` | Event cards, data table, modals, popovers, chat window, input surfaces |
| **Main Text** | `#0F172A` | Primary typography, headers, metric numbers, table titles |
| **Secondary Text** | `#64748B` | Timestamps, locations, attendee counters, helper copy, table headers |

---

### 2. User Experience & Component System

```
┌────────────────────────────────────────────────────────────────────────┐
│ Header: Surface (#FFFFFF) | Wordmark (#047857) | Nav: Active (#047857) │
├────────────────────────────────────────────────────────────────────────┤
│ Page Canvas: Background (#F1F5F9)                                      │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Search & Filter Bar: Surface (#FFFFFF) with Text (#0F172A)         │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌───────────────────────────┐  ┌───────────────────────────┐          │
│ │ Event Card Surface (#FFF) │  │ Event Card Surface (#FFF) │          │
│ │ Category: #047857         │  │ Category: #047857         │          │
│ │ Title: #0F172A            │  │ Title: #0F172A            │          │
│ │ Date/Loc: #64748B         │  │ Date/Loc: #64748B         │          │
│ │ Check-in Bar: #10B981     │  │ Check-in Bar: #10B981     │          │
│ │ Primary CTA: #047857      │  │ Primary CTA: #047857      │          │
│ └───────────────────────────┘  └───────────────────────────┘          │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ AI Ideation Studio: Surface (#FFFFFF) | Sparkle: Accent (#FBBF24)  │ │
│ │ Action: Primary Fill (#047857)                                     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ Chat Launcher: #047857  │  Chat Window: Surface (#FFFFFF), Bot: #10B981│
└────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Component Polish:
1. **Global Entry (`index.html`)**:
   - Update `tailwind.config` colors to include `brand-primary` (`#047857`), `brand-secondary` (`#10B981`), `brand-accent` (`#FBBF24`), `brand-bg` (`#F1F5F9`), `brand-surface` (`#FFFFFF`), `brand-text` (`#0F172A`), `brand-muted` (`#64748B`).
   - Update `:root` CSS variables and body background (`bg-[#F1F5F9] text-[#0F172A]`).
   - Fix body tag in `index.html` which previously retained a hardcoded dark background `#040e3b`.

2. **Navigation & Header (`components/Header.tsx`)**:
   - Wordmark badge with `#047857`.
   - Nav pill toggle: inactive items in `#64748B`, active selected tab in `#047857` with white text.
   - User profile badge and sign-in button using `#047857`.

3. **Event Cards & Table (`components/EventCard.tsx`, `components/EventsTableView.tsx`)**:
   - Surface in `#FFFFFF` with `#E2E8F0` border.
   - Title in `#0F172A`, metadata in `#64748B`.
   - Status badge and progress indicators using `#10B981` / `#047857`.
   - Action buttons: "Manage" and calendar download in `#047857`.

4. **Modals & Overlays (`NewEventModal`, `RegistrationModal`, `DailyCalendarModal`, `MyEventsModal`, `EditProfileModal`, `SignInModal`, `ReminderModal`)**:
   - Backdrop overlay: `bg-[#0F172A]/40`.
   - Modal container: `#FFFFFF` surface with `#E2E8F0` border.
   - Primary submission and save buttons: `#047857` with hover `#065f46`.
   - Check-in icons and status tags: `#10B981`.
   - Tab borders for active view: `#047857`.

5. **AI Ideation & Chatbot (`components/IdeaGenerator.tsx`, `components/Chatbot.tsx`)**:
   - AI Studio title icon and badge accents: warm amber `#FBBF24`.
   - Generate button and chatbot launcher: `#047857` with soft emerald shadow.
   - Chatbot window: `#FFFFFF` surface with `#F1F5F9` header and user message bubbles in `#047857`.

---

### 3. Key Technical Decisions & Verification

- **Theme Variable Architecture**:
  - CSS variables (`--color-primary`, `--color-secondary`, `--color-accent`, etc.) declared on `:root` in `index.html` for clean single-source-of-truth configuration.
  - Tailored utility classes mapped in `tailwind.config` to allow intuitive use across all components.
- **Accessibility & Contrast**:
  - `#047857` on white achieves a contrast ratio of > 4.5:1 (WCAG AA compliant for regular text and AAA for large text).
  - `#0F172A` on `#F1F5F9` and `#FFFFFF` provides > 12:1 contrast for crisp readability.
  - `#FBBF24` is used specifically for decorative sparkles, badges, and icon highlights to prevent yellow-on-white text readability issues.
- **Verification Strategy**:
  - Run `compile_applet` and `lint_applet` in parallel to ensure zero TypeScript or syntax regressions.
  - Restart the dev server to confirm proper rendering across all views and modals.
