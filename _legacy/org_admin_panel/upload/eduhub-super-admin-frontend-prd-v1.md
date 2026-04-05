# EduHub — Super Admin Panel
## Frontend Design PRD

**Document ID:** EH-SA-FE-PRD-001
**Version:** 1.0
**Date:** March 2026
**Status:** Final
**Classification:** Confidential — Internal Use Only
**Prepared For:** Frontend Development Team / AI IDE

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Design System](#2-design-system)
3. [Layout Architecture](#3-layout-architecture)
4. [Navigation & Shell](#4-navigation--shell)
5. [Dashboard Screen](#5-dashboard-screen)
6. [Organizations Module](#6-organizations-module)
7. [Question Bank Module](#7-question-bank-module)
8. [MockBook Module](#8-mockbook-module)
9. [Digital Board Module](#9-digital-board-module)
10. [Student App Module](#10-student-app-module)
11. [Org Admin Panel Control](#11-org-admin-panel-control)
12. [Users Module](#12-users-module)
13. [Billing Module](#13-billing-module)
14. [Analytics Module](#14-analytics-module)
15. [White-Label Module](#15-white-label-module)
16. [Public Website CMS](#16-public-website-cms)
17. [Settings & Audit](#17-settings--audit)
18. [Component Library](#18-component-library)
19. [Page Flows](#19-page-flows)
20. [Responsive Rules](#20-responsive-rules)
21. [Accessibility](#21-accessibility)
22. [Tech Stack](#22-tech-stack)

---

## 1. Product Overview

### 1.1 Platform Context

EduHub ek **multi-tenant SaaS EdTech platform** hai jahan:

- Multiple coaching organizations onboard ho sakti hain
- Har org apna content, teachers, students independently manage karti hai
- Students ek **combined app** se courses + mock tests access karte hain
- Teachers **Whiteboard App** (Windows/Android) se padhate hain
- Public website se marketing, SEO, blogs aur tools run hote hain
- Sab kuch ek **single Supabase backend** se securely controlled hai

### 1.2 Super Admin Panel — Role

Super Admin Panel platform owner ka **complete control centre** hai:

| Responsibility | Details |
|---|---|
| Organizations manage karna | Create, update, disable, plan assign |
| Global Question Bank | Questions create, AI generate, sets banana, globally publish |
| MockBook oversight | AI quotas, taxonomy, marketplace, cross-org results |
| Digital Board control | Set IDs, sessions, app releases |
| Student App config | Gamification, notifications, app flags |
| Org Admin provisioning | Feature flags, domains, impersonation |
| Users overview | All users across all orgs |
| Billing & revenue | Invoices, plans, MRR tracking |
| Public website CMS | Blogs, tools, SEO content |
| White-label config | Per-org branding, custom domains |
| Audit trail | All platform actions logged |

### 1.3 Architecture Principles

- **Single Backend:** Supabase (Auth + DB + RLS + Edge Functions)
- **No role-conditional UI logic** — RLS handles data isolation automatically
- **org_id never trusted from frontend** — backend DOMAIN se resolve karta hai
- **Shared UI modules** — MockBook/Q-Bank components develop once, sync to Org Admin
- **Multi-tenant by default** — complete cross-org data isolation

### 1.4 Key Business Rule — Question Bank

> Super Admin ek **Global Question Bank** maintain karta hai. Questions ko "Public" mark karne par koi bhi org/user use kar sakta hai. Jab bhi koi question use karta hai, uske **points cut** hote hain aur content unke apne question bank mein **save** ho jaata hai.

---

## 2. Design System

### 2.1 Brand Identity

| Attribute | Value |
|---|---|
| Platform Type | Competitive Exam + SaaS Education |
| Brand Personality | Bold, Energetic, Professional, Trustworthy, Modern |
| Design Goal | Clean UI + Strong Orange Accent + Dark Professional Sections |
| Theme | Light-first, Dark sidebar |

---

### 2.2 Official Color Palette

#### Primary Accent — Orange

| Token | Hex | Usage |
|---|---|---|
| `brand.primary` | `#F4511E` | CTA buttons, active tabs, active sidebar item, price highlight, badges |
| `brand.primary.hover` | `#E64A19` | Hover state on primary buttons |
| `brand.primary.tint` | `#FFF3EE` | Light background tint, subtle highlights |

#### Dark Brand Color — Blue

| Token | Hex | Usage |
|---|---|---|
| `brand.dark` | `#1E3A5F` | Super Admin sidebar, footer, dark sections, analytics header bars |
| `brand.dark.deep` | `#162C47` | Sidebar active item bg, dark headers |

#### Neutral Colors

| Token | Hex | Usage |
|---|---|---|
| `neutral.bg` | `#F9FAFB` | Page background |
| `neutral.card` | `#FFFFFF` | Card background |
| `neutral.border` | `#E5E7EB` | Card borders, dividers, input borders |
| `neutral.text.primary` | `#111827` | Headings, important text |
| `neutral.text.secondary` | `#6B7280` | Body text, descriptions |

#### Status / Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `status.success` | `#16A34A` | Active status, success toasts |
| `status.warning` | `#F59E0B` | Warnings, pending items |
| `status.danger` | `#DC2626` | Errors, destructive actions |
| `status.info` | `#2563EB` | Info messages, links |

#### Dark Mode Tokens (Future Ready)

| Token | Hex |
|---|---|
| `dark.bg` | `#0F172A` |
| `dark.card` | `#1E293B` |
| `dark.text` | `#F1F5F9` |

> **Rule:** Sab modules in design tokens use karein. No hardcoded hex values in components. No inline styles.

---

### 2.3 Typography

**Font Family:** `Inter, system-ui, sans-serif`
**Fallback:** `Poppins`
**Load via:** Google Fonts

#### Type Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| `type.h1` | 36px | 700 Bold | Page titles |
| `type.h2` | 28px | 700 Bold | Section headings |
| `type.h3` | 22px | 600 Semibold | Card titles, panel headers |
| `type.h4` | 18px | 600 Semibold | Sub-sections |
| `type.body` | 16px | 400 Regular | Body text, descriptions |
| `type.small` | 14px | 400 Regular | Table cells, metadata |
| `type.caption` | 12px | 400 Regular | Hints, timestamps, muted info |
| `type.button` | 16px | 600 Semibold | Buttons |
| `type.label` | 12px | 500 Medium | Form labels, column headers |
| `type.mono` | 14px | 400 Regular | IDs, codes, numbers |

---

### 2.4 Spacing System (8px Grid)

| Token | Value | Usage |
|---|---|---|
| `space.1` | 4px | Tight internal padding |
| `space.2` | 8px | Button padding, small gaps |
| `space.3` | 12px | Input padding, icon gaps |
| `space.4` | 16px | Card padding, form spacing |
| `space.6` | 24px | Section gaps, grid gutters |
| `space.8` | 32px | Page section spacing |
| `space.12` | 48px | Large section separators |
| `space.16` | 64px | Hero/page-level spacing |

> **Rule:** No random spacing. Only multiples of 8px allowed (with 4px exception for tight UI).

---

### 2.5 Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius.input` | 8px | Text inputs, selects |
| `radius.button` | 10px | All buttons |
| `radius.card` | 12px | Cards, panels, modals |
| `radius.badge` | 9999px | Status badges, tags, pills |

---

### 2.6 Shadow System

| Token | Value | Usage |
|---|---|---|
| `shadow.card` | `0 4px 12px rgba(0,0,0,0.05)` | Default card elevation |
| `shadow.hover` | `0 6px 16px rgba(0,0,0,0.08)` | Card on hover |
| `shadow.modal` | `0 16px 40px rgba(0,0,0,0.12)` | Modals, dropdowns |
| `shadow.focus` | `0 0 0 3px rgba(244,81,30,0.2)` | Focus ring (orange) |

---

### 2.7 Component Visual Tokens

| Property | Value |
|---|---|
| Sidebar background | `#1E3A5F` (brand.dark) |
| Sidebar text | `#CBD5E1` (slate-300) |
| Sidebar active item bg | `#162C47` (brand.dark.deep) |
| Sidebar active text | `#FFFFFF` |
| Sidebar active left bar | 3px solid `#F4511E` |
| Content area bg | `#F9FAFB` |
| Card bg | `#FFFFFF` |
| Primary button bg | `#F4511E` |
| Primary button hover | `#E64A19` |
| Table header bg | `#F9FAFB` |
| Table row hover | `#FFF3EE` (primary tint) |

---

## 3. Layout Architecture

### 3.1 Overall Structure

```
┌──────────────────────────────────────────────────────────┐
│  TOPBAR (64px, sticky, white, border-bottom)             │
│  [Logo]  Breadcrumb        [Search ⌘K] [🔔] [Avatar ▾]  │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│  SIDEBAR     │  MAIN CONTENT AREA                        │
│  240px       │  Background: #F9FAFB                      │
│  fixed       │  Padding: 24px                            │
│  dark blue   │  Max-width: 1400px                        │
│  #1E3A5F     │  12-column grid system                    │
│              │                                           │
│  (scrollable)│  (scrollable)                             │
│              │                                           │
└──────────────┴───────────────────────────────────────────┘
```

### 3.2 Grid System

| Span | Columns | Usage |
|---|---|---|
| Full | 12 | Full-width tables, charts |
| Wide | 8 | Main content + 4-col sidebar panel |
| Half | 6 | Two equal panels |
| Third | 4 | Three analytics panels per row |
| Quarter | 3 | Four KPI stat cards per row |

**Gutter:** 24px
**Content max-width:** 1400px (centered on wide screens)

### 3.3 Content Page Standard Structure

```
Page Title + Subtitle          [Action Buttons — right aligned]
──────────────────────────────────────────────────────────────
[Summary Cards Row]

[Filter Bar / Search]

[Main Data Table / Content Area]

[Pagination]
```

---

## 4. Navigation & Shell

### 4.1 Sidebar Specification

| Property | Value |
|---|---|
| Width | 240px (desktop), 64px icon-only (tablet) |
| Background | `#1E3A5F` |
| Position | Fixed left, full height |
| Border Right | none (shadow only) |

**Logo Block:**
- EduHub logo (white version) + platform name
- Below: `SUPER ADMIN` badge in orange `#F4511E`
- Height: 72px, border-bottom: `rgba(255,255,255,0.1)`

**Nav Item Visual:**

| State | Background | Text | Left Bar |
|---|---|---|---|
| Default | transparent | `#94A3B8` | none |
| Hover | `rgba(255,255,255,0.05)` | `#E2E8F0` | none |
| Active | `#162C47` | `#FFFFFF` | 3px solid `#F4511E` |

**Nav Item Anatomy:**
- Height: 44px (min touch target)
- Padding: 0 16px
- Icon: 20px Lucide icon
- Label: 14px, 500 weight
- Badge count: Orange pill, 11px

**Navigation Groups:**

```
────────────────────────────────
[EduHub Logo]
SUPER ADMIN
────────────────────────────────

OVERVIEW
  📊  Dashboard
  📈  Analytics
  🔔  Alerts                [3]

PLATFORM
  🏢  Organizations
  🪪  Unique IDs
  💳  Billing              [2]

CONTENT
  📚  Question Bank         ← GLOBAL Q-BANK
  📋  MockBook
  🖥️   Digital Board
  🌐  Public Website CMS

APPS
  🎓  Student App
  🏛️   Org Admin Control

MANAGEMENT
  👥  Users
  🎨  White-Label
  📝  Audit Log
  ⚙️   Settings

────────────────────────────────
[Avatar]  Platform Owner
          admin@eduhub.in
[Logout icon]
────────────────────────────────
```

---

### 4.2 Topbar Specification

| Property | Value |
|---|---|
| Height | 64px |
| Background | `#FFFFFF` |
| Border Bottom | 1px solid `#E5E7EB` |
| Position | Sticky, top: 0, z-index: 100 |
| Shadow | `shadow.card` |

**Elements Left → Right:**

1. **Breadcrumb** — `neutral.text.secondary` › `neutral.text.primary`, 14px
2. **Global Search ⌘K** — 200px input, border rounded-lg, expands to 400px on focus. Orange focus ring.
3. **Notification Bell** — Orange dot for unread. Click → right slide-out panel (320px)
4. **Avatar + Dropdown** — 36px circle, name + role text. Dropdown: Profile · Audit Log · Help · Sign Out

---

### 4.3 Global Search (⌘K) — Command Palette

- Centered modal, max-width: 560px, border-radius: 12px, shadow.modal
- Search across: Organizations · Unique IDs · Users · Questions · Sets · Invoices · Settings
- Results grouped by entity with icon prefix
- Keyboard: `↑↓` navigate · `Enter` select · `Esc` close
- Shows 6 recent searches when empty
- Highlighted match substring in results (orange color)

---

## 5. Dashboard Screen

**Route:** `/dashboard`

### 5.1 Page Header

```
Welcome back, Platform Owner 👋                    [View Reports ▾]
Today: Sunday, March 01, 2026 — Platform Health: ● All Systems Normal
```

### 5.2 Row 1 — KPI Stat Cards (4 cards, col-3 each)

**Card Anatomy:**

```
┌─────────────────────────────┐
│  [Icon — colored bg circle] │
│  METRIC LABEL               │
│  42                         │
│  ↑ +6 this month  (green)  │
│  ▁▂▃▄▅▆▇ (sparkline)        │
└─────────────────────────────┘
```

| # | Metric | Icon | Accent Color |
|---|---|---|---|
| 1 | Total Organizations | `Building2` | Info blue |
| 2 | MRR — Monthly Revenue | `IndianRupee` | Success green |
| 3 | Active Students (30d) | `GraduationCap` | Orange |
| 4 | Tests Attempted (30d) | `ClipboardList` | Purple |

**Row 2 cards (4 more, col-3 each):**

| # | Metric | Icon | Accent Color |
|---|---|---|---|
| 5 | Global Questions | `BookOpen` | Orange |
| 6 | Unique IDs Issued | `Fingerprint` | Blue |
| 7 | Whiteboard Sessions (24h) | `Monitor` | Teal |
| 8 | Pending Invoices | `Receipt` | Warning yellow |

**KPI Card Spec:**

| Property | Value |
|---|---|
| Background | `#FFFFFF` |
| Border | 1px solid `#E5E7EB` |
| Border Radius | 12px |
| Shadow | `shadow.card` |
| Hover Shadow | `shadow.hover` |
| Padding | 20px |
| Icon circle size | 44px, bg = tint of accent color, icon = accent color |
| Value font | 28px, 700, `#111827` |
| Label font | 12px, 500, `#6B7280`, uppercase, letter-spacing |
| Change indicator | 13px, green (↑) or red (↓) |
| Sparkline | 48px tall, orange line, transparent fill |

---

### 5.3 Row 2 — Charts (col-8 + col-4)

**Revenue Trend Chart (col-8):**

| Property | Value |
|---|---|
| Type | Area Chart (Recharts) |
| X-axis | Last 12 months |
| Y-axis | ₹ MRR |
| Line color | `#F4511E` (primary) |
| Fill | Gradient — `#FFF3EE` to transparent |
| Toggle | Lines per plan tier |
| Card title | "Revenue Growth" |

**Activity Feed (col-4):**

- Card title: "Recent Activity" + "View All" link
- Each entry: colored icon circle + text + timestamp
- Event types with colors:
  - 🟢 New org onboarded
  - 🟠 Payment received
  - 🔵 New Unique ID generated
  - 🔴 Suspension event
  - 🟡 System alert
- Auto-refresh: 30 seconds
- Max height: 360px, scrollable

---

### 5.4 Row 3 — Secondary Panels (col-4 each)

**Org Plan Distribution (col-4):**
- Donut chart, legend below
- Segments: Small / Medium / Large / Enterprise
- Segment colors: Blue / Orange / Green / Purple

**App Type Distribution (col-4):**
- Donut chart
- Segments: Student App Only / MockBook Only / Both Apps
- Title: "App Distribution"

**System Status (col-4):**
- Card title: "System Health"
- Services list with status dots:
  - 🟢 API Gateway — Operational · 48ms
  - 🟢 Supabase DB — Operational · 22ms
  - 🟡 AI Service — Degraded · 320ms
  - 🟢 CDN — Operational
  - 🟢 Auth — Operational
  - 🟢 Email — Operational
- Dot colors: green, yellow, red
- Auto-refresh: 30 seconds

---

### 5.5 Row 4 — Recent Organizations Table (col-12)

Quick summary table, last 10 orgs.

Columns: Logo + Name · Unique Org ID · App Type · Plan · Status · MRR · [View →]

---

## 6. Organizations Module

**Route:** `/organizations`

### 6.1 List Page Header

```
Organizations                                48 total
Manage all organizations, plans and licensing
                                    [Export CSV]  [+ New Organization]
```

### 6.2 Filter Bar

```
[🔍 Search organizations...]  [Status ▾]  [Plan ▾]  [App Type ▾]  [Date ▾]
                                                                [Clear Filters]
```

### 6.3 Table

| Column | Type | Notes |
|---|---|---|
| ☐ | Checkbox | Bulk select |
| Organization | Logo (32px, rounded-lg) + Name + Domain (caption below) | |
| Unique Org ID | `GK-ORG-xxxxx` — Mono font, copy icon on hover | Orange copy icon |
| App Type | Badge | `STUDENT` / `MOCKBOOK` / `BOTH` |
| Plan | Badge | Small / Medium / Large / Enterprise |
| Status | Badge | Active / Trial / Suspended |
| Teachers | Number, 14px, center | |
| Students | Number, 14px, center | |
| MRR | `₹15,000` — mono, right-aligned | Red if overdue |
| Renewal | Date, caption | Orange if < 30 days |
| Actions | `[View]` + `[⋯]` dropdown | |

**Row actions dropdown:** View Details · Manage IDs · Change App Type · Change Plan · Extend Trial · Suspend · Impersonate Admin · Delete

**Bulk action bar (on selection):**
```
3 selected   [Suspend]  [Export]  [Delete]   ✕ Clear
```

**Pagination:**
```
Showing 1–20 of 48    [‹ Prev]  [1] [2] [3]  [Next ›]    Per page: [20 ▾]
```

---

### 6.4 Organization Detail — Tabs

**Route:** `/organizations/[id]`

```
← Back to Organizations

[Logo]  Apex Academy                           [Suspend]  [⋯ More]
        GK-ORG-00142 [copy]  ●ACTIVE  MEDIUM PLAN  BOTH APPS
        apex-academy.com · contact@apex.com

[Overview] [Unique IDs] [Apps] [Users] [Billing] [White-Label] [Audit] [Settings]
```

**Overview Tab — 2-col layout:**

Left (col-8): Profile form (editable), Quick Stats row
Right (col-4): Quick Actions card

**Quick Actions Card:**
```
┌─────────────────────────┐
│  Quick Actions          │
│─────────────────────────│
│  [🔑 Impersonate Admin] │
│  [📱 Change App Type  ] │
│  [💳 Change Plan      ] │
│  [⏱ Extend Trial      ] │
│  [🔒 Suspend Org      ] │
└─────────────────────────┘
```

**Settings Tab — Danger Zone:**
```
┌─────────────────────────────────────────────────────┐
│  ⚠️  Danger Zone                                    │
│─────────────────────────────────────────────────────│
│  Suspend Organization                               │
│  All users will immediately lose access.            │
│                              [Suspend Organization] │
│─────────────────────────────────────────────────────│
│  Delete Organization                                │
│  Permanently deletes org and all data. Irreversible.│
│                              [Delete Organization]  │
└─────────────────────────────────────────────────────┘
```

---

### 6.5 New Organization — 5-Step Wizard

**Route:** `/organizations/new`

```
[1. Basic Info] ──── [2. Plan] ──── [3. App Type] ──── [4. Branding] ──── [5. Admin User]
      ●                  ○               ○                   ○                   ○
```

**Step 3 — App Type Selection (Visual Cards):**

```
Select which app(s) this organization's students will use:

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  🎓              │  │  📋              │  │  🎓 + 📋         │
│  Student App     │  │  MockBook App    │  │  Both Apps       │
│  Only            │  │  Only            │  │  (Recommended)   │
│                  │  │                  │  │                  │
│  Courses, notes, │  │  Mock tests,     │  │  Full platform   │
│  videos, class   │  │  question bank,  │  │  access for      │
│  schedule        │  │  exam practice   │  │  students        │
│                  │  │                  │  │                  │
│  [ Select ]      │  │  [ Select ]      │  │  ✓ Selected      │
└──────────────────┘  └──────────────────┘  └──────────────────┘
                                                (orange border)
```

**Step Completion Screen:**
```
┌─────────────────────────────────────────────┐
│  ✅  Organization Created Successfully!     │
│                                             │
│  Unique Org ID                              │
│  ┌─────────────────────────────────────┐   │
│  │  GK-ORG-00142          [📋 Copy]   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  App Provisioning:  🔄 In Progress          │
│  Estimated time: 2–3 minutes                │
│                                             │
│  [View Organization]   [Create Another]     │
└─────────────────────────────────────────────┘
```

---

## 7. Question Bank Module

**Route:** `/question-bank`

> **Core Business Rule:** Yeh Super Admin ka **Global Question Bank** hai. Super Admin yahan questions create karta hai, AI se generate karta hai, aur sets banata hai. Questions ko "Public" mark karne par koi bhi org/teacher use kar sakta hai — use karte waqt unke **points cut** hote hain aur question unke personal bank mein **copy** ho jaata hai.

### 7.1 Sub-Pages

| Route | Purpose |
|---|---|
| `/question-bank` | Dashboard overview |
| `/question-bank/questions` | All questions list |
| `/question-bank/create` | Create single question |
| `/question-bank/ai-generate` | AI question generation |
| `/question-bank/sets` | Question sets management |
| `/question-bank/sets/[id]` | Set detail + items |
| `/question-bank/marketplace` | Public questions catalog |
| `/question-bank/usage-log` | Who used which question + points ledger |

---

### 7.2 Question Bank Dashboard (`/question-bank`)

**Stats Row (4 cards, col-3 each):**

| Card | Metric |
|---|---|
| Total Questions | COUNT all questions |
| Public Questions | COUNT where is_public = true |
| Sets Created | COUNT sets |
| Points Earned (Platform) | SUM of all usage point deductions |

**Charts Row:**
- Questions by Subject (bar chart, col-6)
- Usage trend last 30 days (line chart, col-6)

**Recent Usage Table (col-12):**
Columns: Question Preview · Used By (Org) · Teacher · Date · Points Deducted

---

### 7.3 Questions List Page (`/question-bank/questions`)

**Header:**
```
Question Bank                     2,341 questions
Global platform questions — public or private
                    [🤖 AI Generate]  [Import CSV]  [+ Create Question]
```

**Filter Bar:**
```
[🔍 Search questions...]  [Subject ▾]  [Chapter ▾]  [Difficulty ▾]  [Type ▾]  [Visibility ▾]
```

**Table Columns:**

| Column | Notes |
|---|---|
| ☐ | Checkbox |
| Question | First 100 chars, italic. Click → modal preview |
| Type | Badge: MCQ / Integer / Multi-select / True-False |
| Subject → Chapter | `Physics > Kinematics` format |
| Difficulty | Colored badge: Easy (green) / Medium (orange) / Hard (red) |
| Visibility | Toggle: 🔒 Private / 🌐 Public |
| Point Cost | How many points cut when used. Editable inline. |
| Usage Count | How many times used by orgs |
| Actions | Preview · Edit · Duplicate · Delete |

**Bulk Actions:**
```
Selected: 24    [Make Public]  [Make Private]  [Add to Set]  [Set Point Cost]  [Delete]
```

---

### 7.4 Create Question Form (`/question-bank/create`)

**Layout:** Two-column — Left: Form | Right: Live Preview

**Form Fields:**

```
QUESTION DETAILS
────────────────
Subject *                  [dropdown]
Chapter *                  [dropdown — filtered by subject]
Topic                      [dropdown — filtered by chapter]
Difficulty *               [Easy] [Medium] [Hard]   ← segmented button
Question Type *            [MCQ] [Integer] [Multi-select] [True-False]

QUESTION CONTENT
────────────────
Question Text *            [Rich text editor — supports LaTeX, image upload]

OPTIONS (for MCQ / Multi-select)
────────────────
Option A *                 [text input]    ☐ Correct
Option B *                 [text input]    ☐ Correct
Option C                   [text input]    ☐ Correct
Option D                   [text input]    ☐ Correct
                                           [+ Add Option]

ANSWER & EXPLANATION
────────────────────
Correct Answer             [auto from options, or manual for Integer]
Explanation                [Rich text editor — optional]
Explanation Image          [Image upload]

SOURCES (AI-generated or manual)
────────────────────────────────
[+ Add Source]
  Source Type  [Dropdown: NCERT / PYQ / Custom]
  Source Text  [text input]

SETTINGS
────────
Visibility *               [● Private  ○ Public]
Point Cost *               [number input — default: 5]  ← points cut per use
Tags                       [tag input — comma separated]
```

**Right Panel — Live Preview:**
```
┌────────────────────────────────────┐
│  PREVIEW                           │
│  ──────────────────────────────── │
│  Q. Which law states F = ma?       │
│                                    │
│  ○ A. Newton's First Law           │
│  ● B. Newton's Second Law          │  ← selected correct
│  ○ C. Newton's Third Law           │
│  ○ D. None of these                │
│                                    │
│  📗 Explanation available          │
│  [Show Explanation]                │
└────────────────────────────────────┘
```

**Bottom Actions:**
```
[Cancel]           [Save as Draft]    [Save & Publish]
```

---

### 7.5 AI Question Generation (`/question-bank/ai-generate`)

**Layout:** Single form, 2-column at top, full-width results below

**Form:**

```
AI QUESTION GENERATOR
─────────────────────

Subject *         [dropdown]        Chapter *       [dropdown]
Topic             [dropdown]        Difficulty *    [Easy ▾]
Question Type *   [MCQ ▾]           Count *         [10 ▾]
Language          [Hindi / English] Exam Style      [JEE / NEET / UPSC / Custom]

Source Context (optional):
[Paste text, topic description, or notes for AI to generate from...]

                                    [🤖 Generate Questions]
```

**Results Area:**

```
✅ 10 questions generated                [Select All]  [Save Selected]  [Regenerate]

┌─────────────────────────────────────────────────────────────────┐
│ ☑  Q1. A car accelerates from rest...                           │
│    ○ A. 20 m/s   ● B. 40 m/s   ○ C. 60 m/s   ○ D. 80 m/s     │
│    Difficulty: Medium  |  Chapter: Kinematics                   │
│    [Edit]  [Preview]  [✓ Select]                                │
├─────────────────────────────────────────────────────────────────┤
│ ☐  Q2. Which of the following...                                │
│    ...                                                          │
└─────────────────────────────────────────────────────────────────┘

SETTINGS FOR SELECTED
Point Cost: [5]  Visibility: [● Private  ○ Public]  Add to Set: [-- none --]

[Save 8 Selected Questions]
```

---

### 7.6 Sets Management (`/question-bank/sets`)

**Header:**
```
Question Sets                          142 sets
Organize questions into sets for MockBook
                                   [+ Create New Set]
```

**Table Columns:**

| Column | Notes |
|---|---|
| Set Name | Bold |
| Set Code | `SET-XXXX` — mono, copyable |
| Subject | |
| Question Count | Number |
| Visibility | Badge: Public / Private |
| Used By | How many orgs are using this set |
| Created | Date |
| Actions | View · Edit · Duplicate · Delete |

---

### 7.7 Set Detail Page (`/question-bank/sets/[id]`)

**Layout:**
- Left (col-8): Questions list in set, drag-to-reorder
- Right (col-4): Set info card + actions

**Left Panel — Questions List:**
```
[≡ Drag] Q1. Which law states...     [Medium] [MCQ]    [×]
[≡ Drag] Q2. A particle moves...     [Hard]   [Integer] [×]
[≡ Drag] Q3. ...                     [Easy]   [MCQ]    [×]

[+ Add Questions from Bank]
```

Click "Add from Bank" → opens slide-over search panel to pick questions

**Right Panel — Set Info:**
```
┌──────────────────────────┐
│  Question Set Details    │
│──────────────────────────│
│  Name: JEE Physics Set 1 │
│  Code: SET-2024-PHY-001  │
│  Questions: 30           │
│  Visibility: Public      │
│  Point Cost: 5/question  │
│──────────────────────────│
│  [Edit Details]          │
│  [Duplicate Set]         │
│  [View Usage Log]        │
│  [Delete Set]            │
└──────────────────────────┘
```

---

### 7.8 Marketplace Page (`/question-bank/marketplace`)

Public questions/sets catalog — orgs browse and use.

**Layout:**
- Filter sidebar (left, 240px): Subject · Chapter · Difficulty · Type · Point Cost range
- Grid (right): Cards — 3 per row

**Question/Set Card:**
```
┌─────────────────────────────┐
│  📋 JEE Physics Set 1       │
│  Physics > Kinematics       │
│  ─────────────────────────  │
│  30 Questions               │
│  🟠 5 points per question   │
│  Used: 124 times            │
│                             │
│  [Preview]    [Use Set →]   │
└─────────────────────────────┘
```

When "Use Set" clicked:
- Point deduction preview modal shown
- Confirm → questions copied to org's question bank
- Points deducted from org's balance
- Usage logged in `/question-bank/usage-log`

---

### 7.9 Usage Log (`/question-bank/usage-log`)

**Table Columns:**

| Column | Notes |
|---|---|
| Question / Set | Preview + link |
| Used By | Org name + Unique Org ID |
| Teacher | Name |
| Used At | Date + time |
| Points Deducted | Number, orange colored |
| Cumulative Org Balance | Remaining points |

**Summary at top:**
```
Total Points Earned (Platform): 48,201 pts
Total Usage Events: 3,842
Top Org by Usage: Apex Academy (1,240 pts)
```

---

## 8. MockBook Module

**Route:** `/mockbook`

> **Note:** MockBook ka content creation (questions, sets, exams) Org Admin Panel se hota hai. Super Admin ke paas global oversight, AI quotas, taxonomy, aur marketplace control hai. Shared UI modules — same components, RLS alag-alag data dikhata hai.

### 8.1 Sub-Pages

| Route | Purpose |
|---|---|
| `/mockbook` | Overview dashboard |
| `/mockbook/org-content` | Cross-org content oversight (read-only) |
| `/mockbook/ai-quotas` | Per-org AI credit management |
| `/mockbook/taxonomy` | Global Subject → Chapter → Topic |
| `/mockbook/marketplace` | Premium content catalog |
| `/mockbook/results` | Cross-org results analytics |
| `/mockbook/config` | Global MockBook app settings |

---

### 8.2 AI Quota Management (`/mockbook/ai-quotas`)

**Header:**
```
AI Generation Quotas                    48 organizations
Manage monthly AI credit limits per organization
                                     [Bulk Update Plans]
```

**Table:**

| Column | Notes |
|---|---|
| Organization | Name + Unique Org ID |
| Plan | Badge |
| Monthly Limit | Editable inline — click to edit |
| Used This Month | `342 / 500` — mono |
| Progress Bar | Green < 70%, orange 70–90%, red > 90% |
| Resets On | Date |
| Actions | Edit · Reset · History |

**Quota Progress Bar Component:**
```
[████████░░]  342 / 500 (68%)
```
Colors: `#16A34A` → `#F59E0B` → `#DC2626` based on percentage

---

### 8.3 Taxonomy Editor (`/mockbook/taxonomy`)

**Layout:** Full-width tree UI

```
SUBJECT HIERARCHY                              [+ Add Subject]
────────────────────────────────────────────────────────────
▼ Physics                          [Edit] [Delete]
   ▼ Kinematics                    [Edit] [Delete]
       • Uniform Motion            [Edit] [Delete]
       • Non-uniform Motion        [Edit] [Delete]
       [+ Add Topic]
   ▶ Laws of Motion
   [+ Add Chapter]
▶ Mathematics
▶ Chemistry
[+ Add Subject]
```

Actions per node: inline edit on click · delete with confirmation · drag to reorder
Warning on delete: "12 questions use this topic. They will become uncategorized."

---

## 9. Digital Board Module

**Route:** `/digital-board`

### 9.1 Sub-Pages

| Route | Purpose |
|---|---|
| `/digital-board/sets` | All whiteboard Set IDs |
| `/digital-board/sessions` | Live + recent sessions monitor |
| `/digital-board/assets` | Drawing asset library |
| `/digital-board/releases` | App version management |
| `/digital-board/public-users` | Public access log |

---

### 9.2 Sessions Monitor

**Live Sessions Panel:**
```
● LIVE SESSIONS    47 active                      [Auto-refresh: 30s]

┌──────────────────────────────────────────────────────────────────┐
│  SET-2A94F  Apex Academy  23 viewers  00:42:10  Windows  [End]  │
│  SET-7B12C  Public        5 viewers   00:12:30  Android  [End]  │
└──────────────────────────────────────────────────────────────────┘
```

---

### 9.3 App Release Management

**Three platform cards (col-4 each):**

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  🪟 Windows App  │  │  🤖 Android App  │  │  🍎 iOS App      │
│  v2.4.1 — Live  │  │  v2.4.0 — Live  │  │  v2.3.9 — Review │
│  3,241 installs  │  │  8,102 installs  │  │  2,890 installs  │
│  Updated: Feb 28 │  │  Updated: Feb 20 │  │  Under Review    │
│  [Push Update]   │  │  [Push Update]   │  │  [Check Status]  │
│  [Changelog]     │  │  [Changelog]     │  │  [Changelog]     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 10. Student App Module

**Route:** `/student-app`

### 10.1 Sub-Pages

| Route | Purpose |
|---|---|
| `/student-app/students` | All students |
| `/student-app/gamification` | Points, badges, leaderboard |
| `/student-app/notifications` | Push notification centre |
| `/student-app/performance` | Cross-org analytics |
| `/student-app/app-config` | Feature flags, min version |

---

### 10.2 Students List Page

**Filter Bar:**
```
[🔍 Search...]   [Org ▾]   [App Type ▾]   [Status ▾]   [Last Active ▾]
```

**Table Columns:**

| Column | Notes |
|---|---|
| Name + Avatar | Initials fallback, 32px circle |
| Student ID | System-generated, mono |
| Organization | Link |
| App Access | `STUDENT` / `MOCKBOOK` / `BOTH` badge |
| Linked Teacher ID | `GK-TCH-xxxxx` — mono |
| Last Active | Relative time |
| Tests Taken | Number |
| Status | Active / Suspended badge |
| Actions | View · Suspend · Reset Password |

---

### 10.3 Gamification Config

**Layout:** Two-column form

**Left — Points Rules:**

```
GLOBAL POINTS CONFIGURATION
(Org Admin can override from their panel)
────────────────────────────────────────
Points per correct answer          [10]
Points deducted per wrong answer   [-3]
Daily login bonus                  [ 5]
Test completion bonus              [25]
Perfect score bonus                [50]
Streak multiplier (from Day 7)     [1.5x]

[Save Configuration]   [Reset to Defaults]
```

**Right — Badge Management Grid:**
```
┌─────┐  ┌─────┐  ┌─────┐  ┌──────┐
│  🏆 │  │  🔥 │  │  ⭐ │  │  +  │
│Champ│  │ 30d │  │ 100%│  │ Add  │
│ ●ON │  │ ●ON │  │ ●ON │  │      │
└─────┘  └─────┘  └─────┘  └──────┘
```

---

### 10.4 Push Notification Centre

**Compose Form:**
```
SEND NOTIFICATION
─────────────────
Title *                    [text input — max 60 chars]          42/60
Message *                  [textarea — max 120 chars]           __ /120
                                                               character counter

Target Audience *          ○ All Students
                           ○ Specific Organization   [select org]
                           ○ By App Type             [select type]
                           ○ Custom Segment

Schedule                   ● Send Now   ○ Schedule
                                        [date-time picker]
                                                  [Preview]  [Send Notification]
```

**iPhone + Android preview panels** shown when "Preview" clicked.

---

## 11. Org Admin Panel Control

**Route:** `/org-admin`

> Yeh module define karta hai ki Org Admin Panel mein kya features accessible hain. Class management, schedule, MockBook content creation — sab Org Admin ke paas hota hai. Super Admin yahan sirf flags set karta hai aur oversight rakhta hai.

### 11.1 What Org Admin Controls (Reference Table)

| Feature | Org Admin Controls |
|---|---|
| Teacher Management | Add/remove/assign teachers |
| Student Enrollment | Enroll/remove students |
| Class Management | Batches, classes |
| Schedule Builder | Class timetable, exam schedule |
| MockBook Control Panel | Questions, sets, exams create |
| Content Management | Videos, notes, PDFs upload |
| AI Generation | Within Super Admin quota |
| Analytics | Own org data |
| Branding | Logo, colors (within limits) |
| Announcements | Notifications to own students |

---

### 11.2 Per-Org Feature Flags

**Route:** `/org-admin/[org-id]/flags`

**Page Layout:**
```
Apex Academy — Feature Flags                    GK-ORG-00142
Configure what Org Admin can access in their panel
                                               [Save All Changes]

MOCKBOOK & CONTENT
──────────────────────────────────────────────
MockBook Control Panel           [●────] ON    Teachers can create questions & exams
AI Question Generation           [●────] ON    Teachers can use AI to generate
Content Upload (Videos/PDFs)     [●────] ON    Upload learning materials

OPERATIONS
──────────────────────────────────────────────
Class Management                 [●────] ON    Batches and class creation
Schedule Builder                 [●────] ON    Timetable and exam scheduling
Student Enrollment               [●────] ON    Manage student access

FEATURES
──────────────────────────────────────────────
Digital Board Access             [●────] ON
Advanced Analytics               [──●─] OFF    Medium+ plan only
Student Leaderboard              [●────] ON
Certificate Generation           [──●─] OFF
Parent Portal                    [──●─] OFF
Custom Branding                  [●────] ON
Billing View (read-only)         [●────] ON
```

Toggle component: 44×24px, `#F4511E` when ON, `#E5E7EB` when OFF, smooth 200ms transition.

---

### 11.3 MockBook Oversight Per Org

**Route:** `/org-admin/[org-id]/mockbook`

Read-only view. Super Admin dekh sakta hai.

**Tabs:**
```
[Questions]  [Sets]  [Scheduled Exams]  [Results Summary]  [AI Usage]
```

Questions Tab: Org ke sabhi questions, filterable, flag for review action
AI Usage Tab: Credits used this month, per-teacher breakdown

---

### 11.4 Impersonation

```
On Org Detail page:
[🔑 Impersonate Admin]  →  confirmation dialog

Opens new tab:
┌──────────────────────────────────────────────────────────────────┐
│  ⚠️  You are impersonating APEX ACADEMY as Org Admin             │
│  All actions will be logged.                          [Exit ✕]  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 12. Users Module

**Route:** `/users`

### 12.1 List Page

**Filter Bar:**
```
[🔍 Search...]  [Role ▾]  [Organization ▾]  [App Access ▾]  [Status ▾]
```

**Table Columns:**

| Column | Notes |
|---|---|
| Avatar + Name | 32px circle |
| Email | ✓ badge if verified |
| Role | Badge: Student / Teacher / Org Admin |
| Unique ID | `GK-TCH-xxxxx` if teacher — mono |
| Organization | Link |
| App Access | Badge |
| Last Active | Relative time |
| Status | Active / Suspended |
| Actions | View · Suspend · Reset Password · Delete |

---

### 12.2 Permissions Reference

| Action | Public | Student | Teacher | Org Admin | Super Admin |
|---|---|---|---|---|---|
| Create Questions | ✗ | ✗ | ✓ (MockBook) | ✓ | ✓ |
| Use Global Questions | ✗ | ✗ | ✓ (points) | ✓ (points) | ✓ |
| Class Management | ✗ | ✗ | ✗ | ✓ | ✓ |
| Schedule Builder | ✗ | ✗ | ✗ | ✓ | ✓ |
| Generate Unique IDs | ✗ | ✗ | ✗ | ✗ | ✓ |
| Feature Flags | ✗ | ✗ | ✗ | ✗ | ✓ |
| AI Quota Config | ✗ | ✗ | ✗ | ✗ | ✓ |
| Billing (full) | ✗ | ✗ | ✗ | View only | ✓ |
| Delete Org | ✗ | ✗ | ✗ | ✗ | ✓ |
| Impersonation | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## 13. Billing Module

**Route:** `/billing`

### 13.1 Tabs

```
[Overview]  [Invoices]  [Subscriptions]  [Revenue Analytics]
```

### 13.2 Overview — KPI Cards (col-3 each, 4 cards)

| Metric | Accent |
|---|---|
| MRR | Green |
| ARR | Blue |
| Pending Invoices | Yellow |
| Overdue (Action Required) | Red |

---

### 13.3 Invoices Table

**Filter:** Date Range · Status · Organization · Plan

| Column | Notes |
|---|---|
| Invoice # | `INV-2024-001` — mono, orange |
| Organization | Name + Unique Org ID (caption) |
| Plan | Badge |
| Amount | `₹15,000` — mono, right-aligned |
| Period | `Feb 2026` |
| Status | Paid / Pending / Overdue / Cancelled |
| Due Date | Red if overdue |
| Actions | Mark Paid · PDF · Send Reminder |

---

### 13.4 Plan Reference

| Plan | Limit | Monthly | Annual |
|---|---|---|---|
| Small | 1–10 teachers | ₹5,000 | ₹54,000 |
| Medium | 11–50 teachers | ₹15,000 | ₹1,62,000 |
| Large | 51–200 teachers | ₹40,000 | ₹4,32,000 |
| Enterprise | 200+ | Custom | Custom |

---

## 14. Analytics Module

**Route:** `/analytics`

### 14.1 Header Controls

```
Platform Analytics                          [📅 Last 30 days ▾]  [Export ▾]
                                                Compare to: [Previous Period]
```

### 14.2 Charts Available

| Chart | Type | Metric |
|---|---|---|
| Revenue Growth | Area (Recharts) | MRR per month, orange line |
| Org Onboarding | Bar | New orgs per week |
| User Growth | Stacked Area | Students + Teachers |
| Test Volume | Bar | MockBook attempts per day |
| App Distribution | Donut | Student / MockBook / Both |
| Question Usage | Line | Points transacted per day |
| Whiteboard Sessions | Heatmap | Hour × Day of week |
| Retention Cohort | Cohort Matrix | Monthly org retention |
| Geography | India State Map | Orgs by state, orange intensity |
| AI Usage Trend | Line | Credits used per day |

**Chart color standard:** Primary orange `#F4511E` for main lines/bars, blue `#2563EB` secondary, `#F9FAFB` grid.

### 14.3 Exportable Reports

| Report | Format |
|---|---|
| Monthly Revenue | PDF |
| All Users | CSV |
| Organizations Summary | CSV |
| Question Usage + Points | CSV |
| MockBook Results | CSV |
| Invoice History | CSV |
| Audit Log | CSV |

---

## 15. White-Label Module

**Route:** `/white-label`

### 15.1 Per-Org Branding Editor

**Layout:** Left form (col-7) + Right preview (col-5)

**Form:**
```
WHITE-LABEL SETTINGS — Apex Academy
────────────────────────────────────
Display Name          [Apex Academy          ]
Logo URL              [https://...           ] [Upload]
Primary Color         [#1E40AF  ████ ]
App Name (Student)    [Apex Student App      ]
App Name (MockBook)   [Apex Mock Tests       ]
Custom Admin Domain   [admin.apex-academy.com]
Favicon URL           [https://...           ]

DNS STATUS
──────────
admin.apex-academy.com    ● DNS VERIFIED    ● SSL ACTIVE
                          Expires: Dec 2026 (Auto-renew ON)

[Save & Preview]    [Reset to Defaults]
```

**Right Preview:**
- Iframe mockup of org admin panel with applied branding
- Toggle: Desktop / Tablet view

---

### 15.2 Reseller Partners Table

| Column | Notes |
|---|---|
| Partner | Name |
| Orgs | Count, clickable |
| Revenue Share | Default 20% |
| Total Generated | ₹ format |
| Partner Cut | ₹ format |
| Status | Active / Inactive |
| Actions | Edit · Statement · Deactivate |

---

## 16. Public Website CMS

**Route:** `/website`

### 16.1 Sub-Pages

| Route | Purpose |
|---|---|
| `/website/blogs` | Blog post management |
| `/website/tools` | Free/paid tools management |
| `/website/pages` | Static SEO pages |
| `/website/downloads` | Whiteboard app downloads |
| `/website/leads` | Lead generation forms |
| `/website/seo` | Meta tags, sitemap, robots |

---

### 16.2 Blog Management

**Table Columns:** Title · Status (Published/Draft) · Category · Author · Published Date · Views · Actions

**Blog Editor:**
- Rich text WYSIWYG editor
- SEO fields: Meta title, meta description, focus keyword
- Featured image upload
- Category + tags
- Scheduled publish option

---

### 16.3 Tools Management

| Column | Notes |
|---|---|
| Tool Name | |
| Type | Free / Paid |
| Price | ₹ or "Free" |
| Uses (30d) | |
| Revenue (30d) | |
| Status | Active / Hidden |
| Actions | Edit · Toggle · Delete |

---

## 17. Settings & Audit

### 17.1 Settings Page (`/settings`)

**Sections:**

```
PLATFORM SETTINGS
─────────────────
Platform Name           [EduHub                ]
Platform URL            [https://eduhub.in     ]
Support Email           [support@eduhub.in     ]
Default Currency        [INR (₹)  ▾]
Default Language        [English  ▾]
Time Zone               [Asia/Kolkata (IST)  ▾]

SECURITY
─────────
IP Whitelist            [List of allowed IPs]
Session Timeout         [120 minutes ▾]
MFA Enforcement         [● Required for Super Admin]

INTEGRATIONS
─────────────
Supabase Project URL    [https://xxxx.supabase.co]
Email Provider          [Resend ▾]
Payment Gateway         [Razorpay ▾]
AI Provider             [OpenAI / Gemini ▾]

POINTS ECONOMY
──────────────
Default AI Usage Cost   [5 points/question]
Platform Point Rate     [1 point = ₹1]
```

---

### 17.2 Audit Log (`/audit-log`)

**Filter Bar:**
```
[🔍 Search action...]  [Actor ▾]  [Entity Type ▾]  [Date Range ▾]  [Action Type ▾]
```

**Table Columns:**

| Column | Notes |
|---|---|
| Timestamp | `2026-03-01 12:34:56` — mono |
| Actor | Name + Role badge |
| Action | `ORG_CREATED`, `ID_REVOKED` — mono orange |
| Entity | Entity type + ID |
| Details | Brief description |
| IP Address | Mono, small |

**Impersonation entries:** Show `[IMPERSONATED]` badge in red on actor column.

---

## 18. Component Library

### 18.1 Buttons

**Primary Button:**
```
Background: #F4511E
Hover: #E64A19
Text: #FFFFFF, 16px, 600
Border Radius: 10px
Padding: 10px 20px
Shadow: none (flat)
Focus ring: 0 0 0 3px rgba(244,81,30,0.2)
```

**Secondary Button:**
```
Background: #FFFFFF
Border: 1.5px solid #E5E7EB
Text: #374151, 16px, 500
Hover bg: #F9FAFB
```

**Ghost / Text Button:**
```
Background: transparent
Text: #6B7280
Hover text: #F4511E
Hover bg: #FFF3EE
```

**Danger Button:**
```
Background: #FEF2F2
Border: 1.5px solid #FECACA
Text: #DC2626
Hover bg: #FEE2E2
```

**Sizes:**

| Size | Height | Padding | Font |
|---|---|---|---|
| Small (sm) | 32px | 6px 14px | 14px |
| Default (md) | 40px | 10px 20px | 16px |
| Large (lg) | 48px | 12px 24px | 18px |

---

### 18.2 Status Badges

| Badge | Background | Text | Usage |
|---|---|---|---|
| `ACTIVE` | `#F0FDF4` | `#16A34A` | Active orgs, users |
| `TRIAL` | `#EFF6FF` | `#2563EB` | Trial period |
| `PENDING` | `#FFFBEB` | `#F59E0B` | Awaiting |
| `SUSPENDED` | `#FEF2F2` | `#DC2626` | Suspended |
| `REVOKED` | `#FEF2F2` | `#DC2626` | Revoked IDs |
| `EXPIRED` | `#F9FAFB` | `#6B7280` | Expired |
| `STUDENT APP` | `#EFF6FF` | `#2563EB` | App type |
| `MOCKBOOK` | `#F5F3FF` | `#7C3AED` | App type |
| `BOTH APPS` | `#F0FDF4` | `#16A34A` | App type |
| `PUBLIC` | `#FFF7ED` | `#EA580C` | Question visibility |
| `PRIVATE` | `#F9FAFB` | `#6B7280` | Question visibility |

Style: `font-size: 12px · font-weight: 500 · border-radius: 9999px · padding: 3px 10px`

---

### 18.3 Unique ID Display Component

```
┌─────────────────────────────────────────┐
│  GK-TCH-00892                [📋 Copy]  │  ← mono font, orange copy icon
│  ─────────────────────────────────────  │
│  ● ACTIVE  ·  Teacher ID                │  ← status dot + type
│  Apex Academy                           │  ← org name
└─────────────────────────────────────────┘

Background: #F9FAFB
Border: 1px solid #E5E7EB
Border Radius: 8px
ID Text: 14px, mono, #F4511E (orange)
Copy tooltip: "Copied!" shown 2 seconds
```

---

### 18.4 KPI Card

```
┌─────────────────────────────────────────┐
│  [■ icon 44px circle bg-orange-50]      │
│  TOTAL ORGANIZATIONS                    │  ← 12px, uppercase, text.secondary
│  48                                     │  ← 28px, bold, text.primary
│  ↑ +6 this month                        │  ← 13px, #16A34A
│  ▁▂▃▄▅▆▇█  sparkline                   │  ← 48px tall, #F4511E
└─────────────────────────────────────────┘

Background: #FFFFFF
Border: 1px solid #E5E7EB
Border Radius: 12px
Shadow: shadow.card
Hover: shadow.hover + scale(1.01)
Padding: 20px
```

---

### 18.5 Data Table

| Property | Value |
|---|---|
| Container bg | `#FFFFFF` |
| Container border | `1px solid #E5E7EB` |
| Container radius | `12px` |
| Header bg | `#F9FAFB` |
| Header font | `12px, 500, #6B7280, uppercase, letter-spacing: 0.05em` |
| Row height | 52px default · 40px compact |
| Row border | `1px solid #F3F4F6` (horizontal only) |
| Row hover | `#FFF3EE` (brand tint) |
| Row selected | `#FFF3EE` with orange left border 3px |
| Loading | Skeleton shimmer rows |
| Empty state | Centered icon + heading + description + CTA |

---

### 18.6 Form Inputs

**Text Input:**
```
Background: #FFFFFF
Border: 1.5px solid #E5E7EB
Border Radius: 8px
Padding: 10px 14px
Font: 14px, #111827
Placeholder: #9CA3AF

Focus:
  Border: #F4511E
  Shadow: 0 0 0 3px rgba(244,81,30,0.15)

Error:
  Border: #DC2626
  Shadow: 0 0 0 3px rgba(220,38,38,0.15)

Disabled:
  Background: #F9FAFB
  Opacity: 0.6
  Cursor: not-allowed
```

**Form Label:**
```
Font: 14px, 500, #374151
Margin bottom: 6px
Required marker: * in #DC2626
```

**Toggle Switch:**
```
Track: 44px × 24px, radius: 9999px
ON:  background #F4511E
OFF: background #E5E7EB
Knob: 20px white circle, shadow
Animation: 200ms ease
```

**Segmented Button (Difficulty):**
```
[Easy] [Medium] [Hard]

Container: border 1px #E5E7EB, radius 8px
Default: bg transparent, text #6B7280
Selected: bg #F4511E, text white, radius 6px
```

---

### 18.7 Modals

**Standard Modal:**
```
Overlay: rgba(0,0,0,0.4)
Container: bg #FFFFFF, radius 12px, shadow.modal
Max-width: 560px (centered)
Header: 20px bold + × close button
Body: 16px padding
Footer: right-aligned buttons
Animation: scale(0.95) → scale(1), 150ms
```

**Confirmation Dialog:**
```
Icon (warning): 48px, centered top
Title: 18px, 600
Description: 14px, text.secondary
Buttons: [Cancel] [Confirm — orange or red]
Max-width: 420px
```

**Type-to-Confirm (Destructive Actions):**
```
Description of irreversible action
Instructions: "Type DELETE APEX ACADEMY to confirm"
Input field: standard text input
Confirm button: disabled (50% opacity) until text matches exactly
```

**Slide-Over Panel:**
```
Width: 600px
Slides from: right edge
Overlay: rgba(0,0,0,0.3), click to close
Header: title + × button
Animation: translateX(100%) → translateX(0), 250ms
```

---

### 18.8 Toast Notifications

| Type | Left bar color | Icon | Duration |
|---|---|---|---|
| Success | `#16A34A` | `CheckCircle` | 4s |
| Error | `#DC2626` | `XCircle` | 6s |
| Warning | `#F59E0B` | `AlertTriangle` | 6s |
| Info | `#2563EB` | `Info` | 8s |

```
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border-left: 4px solid [type color]
Border Radius: 8px
Shadow: shadow.modal
Position: bottom-right, 24px margin
Stack: up to 4 visible, older push up
Max-width: 380px
```

---

### 18.9 Empty States

```
┌─────────────────────────────────────────┐
│                                         │
│          [🗂️ Icon — 64px]              │
│                                         │
│     No Questions Found                  │   ← 18px, 600
│     Add your first question to start    │   ← 14px, text.secondary
│     building the question bank.         │
│                                         │
│          [+ Create Question]            │   ← primary button
│                                         │
└─────────────────────────────────────────┘
```

---

### 18.10 Points Display Component

For Question Bank usage system:

```
┌──────────────────────────────────┐
│  🔸  5 points per use            │
│      Used 124 times              │
│      Revenue: 620 points         │
└──────────────────────────────────┘

Point balance chip (org view):
[🔸 Balance: 1,240 pts]
orange bg tint, bold number
```

---

## 19. Page Flows

### 19.1 Create & Publish Global Question

```
/question-bank/questions
      ↓
[+ Create Question]
      ↓
Fill: Subject, Chapter, Type, Content, Options, Answer
      ↓
Set Visibility: ● Private  ○ Public
Set Point Cost: 5
      ↓
[Save & Publish]
      ↓
✅ Question created
   Visibility: Private (default)

   To make public:
   Toggle visibility to PUBLIC in question row
      ↓
✅ Question now in Marketplace
   Available for orgs to use (5 points per use)
```

---

### 19.2 Org Uses Global Question (Point Deduction)

```
Org Teacher (in MockBook panel) browses marketplace
      ↓
Finds "JEE Physics Set 1"  (30 questions × 5 pts = 150 pts)
      ↓
[Use Set] clicked
      ↓
Modal: "Using this set will deduct 150 points from Apex Academy"
       Current Balance: 1,240 pts  →  After: 1,090 pts
      ↓
[Confirm]
      ↓
✅ 30 questions copied to org's own question bank
✅ 150 points deducted from org balance
✅ Usage logged in /question-bank/usage-log
✅ Teacher can now use questions in their exams
```

---

### 19.3 Onboard New Organization

```
/organizations/new
      ↓
Step 1: Name, Domain, Contact
      ↓
Step 2: Plan + Billing + Trial
      ↓
Step 3: App Type selection (Student / MockBook / Both)
      ↓
Step 4: Branding (logo, color, domain)
      ↓
Step 5: Admin User (email + password)
      ↓
✅ Org Created
✅ GK-ORG-00142 generated  [Copy]
✅ App(s) provisioned
✅ Welcome email sent
```

---

### 19.4 Generate Teacher Unique ID

```
/unique-ids/generate
      ↓
ID Type: Teacher ID
Org: Apex Academy
Name: Rajesh Kumar
App Type: Both Apps
      ↓
[Generate ID]
      ↓
✅ GK-TCH-00892 generated  [Copy]
✅ Apps provisioned (2-3 min)
```

---

### 19.5 Suspend Organization

```
/organizations/[id] → Settings → Danger Zone
      ↓
[Suspend Organization]
      ↓
Confirmation: "All users lose access immediately"
      ↓
[Yes, Suspend]
      ↓
✅ Status: SUSPENDED
✅ All app access revoked
✅ Toast: "Apex Academy suspended"
✅ Audit entry created
```

---

## 20. Responsive Rules

> Super Admin Panel is **desktop-first** (1280px minimum). Tablet supported with collapsed sidebar.

| Breakpoint | Width | Behaviour |
|---|---|---|
| Mobile | < 768px | Locked: "Open on desktop browser for Super Admin access." Full-page message. |
| Tablet | 768–1279px | Sidebar collapses to 64px icons only. Tooltips on hover. Grid adjusts (2-col max). |
| Desktop (min) | 1280px+ | Full 240px sidebar. 12-col grid. All features accessible. |
| Desktop (standard) | 1440px+ | Content max-width 1400px, centered. |
| Ultrawide | 1920px+ | 3-panel optional layouts for analytics. |

**Tablet Sidebar (64px):**
- Icon only (20px Lucide icons)
- Tooltip on hover shows nav label
- Active: orange left bar still visible
- Logo: platform icon only (no text)
- User: avatar circle only

---

## 21. Accessibility

### 21.1 Standards

| Requirement | Target |
|---|---|
| WCAG Compliance | AA |
| Color Contrast (text) | 4.5:1 min |
| Color Contrast (UI) | 3:1 min |
| Keyboard Navigation | Full tab order |
| Focus Indicators | Orange ring (shadow.focus) |
| Minimum touch target | 44px height |

### 21.2 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` | Global search |
| `⌘/` | Shortcuts help |
| `⌘N` | New (context-aware) |
| `Esc` | Close modal/panel |
| `↑↓` | Navigate lists |
| `Enter` | Select/confirm |
| `⌘E` | Export view |
| `G D` | Dashboard |
| `G O` | Organizations |
| `G Q` | Question Bank |
| `G B` | Billing |

### 21.3 ARIA Requirements

- All inputs: `<label>` or `aria-label`
- Icon buttons: `aria-label` always
- Modals: focus trap inside
- Toasts: `aria-live="polite"`
- Errors: `aria-describedby` on input
- Tables: `<caption>` + `scope` on headers
- Nav: `<nav aria-label="Main navigation">`

---

## 22. Tech Stack

### 22.1 Frontend Web

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5+ |
| CSS | Tailwind CSS 3 |
| Components | shadcn/ui |
| Icons | Lucide React |
| Charts | Recharts |
| Tables | TanStack Table v8 |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion (200ms micro-interactions) |
| State | Zustand |
| Data Fetching | TanStack Query v5 |
| Auth | Supabase Auth |
| DB | Supabase (PostgreSQL + RLS) |
| Hosting | Vercel |

> **Rules:**
> - No Bootstrap. No Material UI. No mixed UI systems.
> - No inline styles. All design tokens via Tailwind config.
> - No `if (role === 'super_admin')` UI logic — let RLS handle data.

---

### 22.2 Folder Structure

```
app/
├── (auth)/login/                    ← MFA + IP whitelist
├── (admin)/
│   ├── layout.tsx                   ← Shell: sidebar + topbar
│   ├── dashboard/
│   ├── organizations/
│   │   ├── page.tsx
│   │   ├── new/page.tsx             ← 5-step wizard
│   │   └── [id]/page.tsx
│   ├── unique-ids/
│   │   ├── page.tsx
│   │   ├── generate/page.tsx
│   │   └── [id]/page.tsx
│   ├── question-bank/               ← GLOBAL Q-BANK
│   │   ├── page.tsx
│   │   ├── questions/
│   │   ├── create/page.tsx
│   │   ├── ai-generate/page.tsx
│   │   ├── sets/
│   │   │   └── [id]/page.tsx
│   │   ├── marketplace/
│   │   └── usage-log/
│   ├── mockbook/
│   │   ├── org-content/
│   │   ├── ai-quotas/
│   │   ├── taxonomy/
│   │   ├── marketplace/
│   │   ├── results/
│   │   └── config/
│   ├── digital-board/
│   │   ├── sets/ · sessions/ · assets/ · releases/
│   ├── student-app/
│   │   ├── students/ · gamification/ · notifications/
│   │   ├── performance/ · app-config/
│   ├── org-admin/
│   │   └── [org-id]/
│   │       ├── flags/
│   │       └── mockbook/
│   ├── users/
│   ├── billing/
│   ├── analytics/
│   ├── white-label/
│   ├── website/
│   │   ├── blogs/ · tools/ · pages/ · downloads/ · seo/
│   ├── settings/
│   └── audit-log/

components/
├── ui/                              ← shadcn/ui base
├── admin/
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── GlobalSearch.tsx
│   ├── StatCard.tsx
│   ├── UniqueIDCard.tsx
│   ├── AppTypeBadge.tsx
│   ├── FeatureFlagGrid.tsx
│   ├── AIQuotaBar.tsx
│   ├── PointsDisplay.tsx            ← Q-Bank points system
│   ├── ActivityFeed.tsx
│   └── SystemStatus.tsx
├── mockbook/                        ← SHARED MODULES (synced to Org Admin)
│   ├── QuestionTable.tsx
│   ├── QuestionModal.tsx
│   ├── SetManager.tsx
│   └── ExamScheduler.tsx
├── qbank/                           ← GLOBAL Q-BANK specific
│   ├── CreateQuestionForm.tsx
│   ├── AIGenerator.tsx
│   ├── MarketplaceCard.tsx
│   └── UsageLogTable.tsx
├── forms/
│   ├── NewOrgWizard.tsx
│   └── GenerateIDForm.tsx
└── modals/
    ├── ConfirmDialog.tsx
    ├── TypeToConfirm.tsx
    ├── AppTypeChangeImpact.tsx
    ├── PointDeductionPreview.tsx    ← Q-Bank usage confirm
    └── SlideOver.tsx

lib/
├── supabase/                        ← typed queries
├── hooks/
├── utils/
└── validations/                     ← zod schemas
```

---

## Appendix A: Complete Route Index

| Route | Page |
|---|---|
| `/login` | Super Admin login |
| `/dashboard` | Main dashboard |
| `/organizations` | Org list |
| `/organizations/new` | New org wizard |
| `/organizations/[id]` | Org detail |
| `/unique-ids` | All IDs |
| `/unique-ids/generate` | Generate ID |
| `/unique-ids/[id]` | ID detail |
| `/question-bank` | Q-Bank dashboard |
| `/question-bank/questions` | All questions |
| `/question-bank/create` | Create question |
| `/question-bank/ai-generate` | AI generate |
| `/question-bank/sets` | Sets list |
| `/question-bank/sets/[id]` | Set detail |
| `/question-bank/marketplace` | Public catalog |
| `/question-bank/usage-log` | Points ledger |
| `/mockbook/org-content` | Cross-org overview |
| `/mockbook/ai-quotas` | AI quota mgmt |
| `/mockbook/taxonomy` | Subject tree |
| `/mockbook/marketplace` | Premium content |
| `/mockbook/results` | Cross-org results |
| `/digital-board/sessions` | Live monitor |
| `/digital-board/releases` | App versions |
| `/student-app/students` | All students |
| `/student-app/gamification` | Points & badges |
| `/student-app/notifications` | Push notifs |
| `/org-admin/[id]/flags` | Feature flags |
| `/org-admin/[id]/mockbook` | MockBook oversight |
| `/users` | All users |
| `/billing` | Billing & invoices |
| `/analytics` | Analytics |
| `/white-label` | White-label config |
| `/website/blogs` | Blog CMS |
| `/website/tools` | Tools mgmt |
| `/settings` | Platform settings |
| `/audit-log` | Audit trail |

---

## Appendix B: Design Decisions

| Decision | Rationale |
|---|---|
| Orange `#F4511E` as primary | Bold, energetic — matches competitive exam brand personality |
| Dark blue `#1E3A5F` sidebar | Professional SaaS look — high contrast for dense nav |
| Light `#F9FAFB` content bg | Easy on eyes for long admin sessions |
| Question Bank separate from MockBook | Global Q-Bank is platform asset; MockBook is org-level operation |
| Points system for question usage | Monetization + prevents unlimited copying of premium content |
| Shared UI modules (sync script) | DRY — develop once in Super Admin, sync to Org Admin |
| No role-conditional UI | RLS handles data — cleaner code, no security holes |
| Teaching App removed | Org Admin Panel handles class/schedule/content — simpler architecture |
| Unique ID system | Portable teacher identity that controls app access |
| 5-step org wizard | Progressive disclosure — app type selection added as dedicated step |
| Desktop-only super admin | Complex data operations not practical on mobile |
| Inter font | Best readability for data-heavy SaaS interfaces |

---

*Document End*

---

**EduHub Platform — Super Admin Panel Frontend Design PRD**
Version 1.0 | March 2026 | Confidential — Internal Use Only
