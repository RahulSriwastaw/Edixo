# EduHub Admin Panel — Student Personalization Controls
## PRD-MOCKVEDA-01-B | Admin Panel Feature Specification

**Document ID:** EH-ADMIN-PERSONALIZATION-PRD-001B
**Version:** 1.0
**Date:** March 2026
**Status:** Final — Ready for Development
**Platform:** Org Admin Panel (orgadmin.eduhub.in) + Super Admin Panel
**Student Side:** See PRD-MOCKVEDA-01-A
**Depends On:** PRD-ORG-02 (Org Admin Panel), PRD-QBANK-03 (Folder System)

---

## Table of Contents

1. [Overview — Admin ka Role](#1-overview--admin-ka-role)
2. [Where These Controls Live](#2-where-these-controls-live)
3. [Personalization Settings](#3-personalization-settings)
4. [Admin Curated Suggestions Manager](#4-admin-curated-suggestions-manager)
5. [Study Plan Templates](#5-study-plan-templates)
6. [Student Practice Analytics](#6-student-practice-analytics)
7. [Student Unlock Management](#7-student-unlock-management)
8. [Super Admin Controls](#8-super-admin-controls)
9. [Database Schema](#9-database-schema)
10. [API Endpoints — Admin Side](#10-api-endpoints--admin-side)
11. [Business Rules](#11-business-rules)
12. [Development Checklist](#12-development-checklist)

---

## 1. Overview — Admin ka Role

```
Student ke personalization mein Admin ka kaam:

  CONFIGURE    → Threshold set karo, feature on/off karo
  CURATE       → Specific sets ko weak topics se link karo
  TEMPLATE     → Study plan templates banana
  MONITOR      → Student progress + practice sets dekhna
  OVERRIDE     → Kisi bhi student ko manually unlock karo
  ANALYZE      → Platform-wide weak areas identify karo
```

---

## 2. Where These Controls Live

### 2.1 Org Admin Panel Navigation

```
Org Admin Panel Sidebar:

  OVERVIEW
    📊 Dashboard
  
  ACADEMICS
    📝 Tests & Exams
    📚 Q-Bank
      └── 📌 Practice Recommendations  ← NEW
    ✅ Attendance
  
  MANAGEMENT
    👨‍💼 Staff Management
    💰 Fee Collection
    🔔 Notifications
  
  SETTINGS
    ⚙️  Org Settings
       Tabs: [Profile] [Branding] [Subjects]
             [Integrations] [Security]
             [Personalization]  ← NEW TAB
  
  ANALYTICS
    📈 Reports
       Tabs: [Tests] [Attendance] [Fees]
             [Student Practice]  ← NEW TAB
```

### 2.2 Three Entry Points

```
Entry Point 1: Settings → Personalization Tab
  → Feature toggle, threshold, defaults configure karo

Entry Point 2: Q-Bank → Practice Recommendations
  → Curated suggestions + study plan templates manage karo

Entry Point 3: Analytics → Student Practice Tab
  → Reports, student sets, progress dekhna + manual unlock
```

---

## 3. Personalization Settings

### 3.1 UI — Settings → Personalization Tab

```
Org Settings → Personalization

┌──────────────────────────────────────────────────────────────┐
│  Student Personalization Settings                           │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│  FEATURE TOGGLE                                            │
│  ───────────────                                           │
│  Personalized Practice Feature:                            │
│  ● ON   ○ OFF                                              │
│  (Turn off to hide from all students in this org)          │
│                                                             │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│  UNLOCK THRESHOLD                                          │
│  ─────────────────                                         │
│  Students unlock personalized practice after completing:   │
│                                                             │
│  [  50  ] tests                                            │
│  Range: 10 to 200                                          │
│                                                             │
│  Currently:                                                │
│  ✅ Unlocked:  89 students                                 │
│  🔒 Locked:   156 students                                 │
│  📊 Near threshold (≥80%): 23 students                     │
│                                                             │
│  ℹ️ Changing threshold only affects students who haven't   │
│  unlocked yet. Already-unlocked students stay unlocked.    │
│                                                             │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│  SUGGESTION SETTINGS                                       │
│  ────────────────────                                      │
│  ☑ Show admin-curated recommendations to students         │
│  ☑ Show AI-matched suggestions                            │
│  ☐ Show similar student patterns (collaborative)          │
│    ↳ Requires 50+ unlocked students for accuracy          │
│                                                             │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│  STUDY PLAN DEFAULTS                                       │
│  ─────────────────────                                     │
│  Default daily study time: [45] minutes                   │
│  Default plan duration:    [14] days                      │
│                                                             │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│  [Save Settings]                                           │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Settings Fields Detail

| Field | Type | Default | Range | Purpose |
|---|---|---|---|---|
| `isPersonalizationEnabled` | Boolean | true | ON/OFF | Feature toggle for entire org |
| `autoSetThreshold` | Integer | 50 | 10–200 | Tests needed to unlock |
| `showAdminCurated` | Boolean | true | ON/OFF | Show admin sets as suggestions |
| `showAISuggested` | Boolean | true | ON/OFF | Show AI-matched suggestions |
| `showCollaborative` | Boolean | false | ON/OFF | Similar student patterns |
| `defaultDailyMins` | Integer | 45 | 15–180 | Study plan default time/day |
| `defaultPlanDays` | Integer | 14 | 7/14/30 | Study plan default duration |

---

## 4. Admin Curated Suggestions Manager

### 4.1 Entry Point

```
Q-Bank → [Practice Recommendations] (sidebar item)

OR

Q-Bank → Any Set → [...] menu → [⭐ Recommend to Students]
```

### 4.2 Recommendations List Page

```
Q-Bank → Practice Recommendations

┌──────────────────────────────────────────────────────────────┐
│  Practice Recommendations                [+ Add Suggestion] │
│  Curate sets to suggest to students based on weak topics    │
├──────────────────────────────────────────────────────────────┤
│  [🔍 Search...]  [Status: All ▾]  [Topic ▾]                │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📝 Percentage Mastery Pack              Active ✅  │    │
│  │ SET-482931  ·  50 questions                        │    │
│  │ Target topics: Percentage, Ratio                   │    │
│  │ Priority: High  ·  Exam: SSC CGL                  │    │
│  │ ─────────────────────────────────────────────────  │    │
│  │ 👁 Impressions: 234  ·  Attempts: 89               │    │
│  │ 📈 Avg score improvement: +18%                    │    │
│  │                         [Edit] [Pause] [Delete]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📝 Error Spotting Crash Course          Active ✅  │    │
│  │ SET-671204  ·  30 questions                        │    │
│  │ Target topics: Error Spotting                      │    │
│  │ Priority: Normal  ·  Exam: SSC CGL / Banking       │    │
│  │ ─────────────────────────────────────────────────  │    │
│  │ 👁 Impressions: 156  ·  Attempts: 54               │    │
│  │ 📈 Avg score improvement: +12%                    │    │
│  │                         [Edit] [Pause] [Delete]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📝 Profit & Loss Fundamentals          Paused ⏸️   │    │
│  │ SET-891023  ·  25 questions                        │    │
│  │ Target topics: Profit & Loss                       │    │
│  │                         [Edit] [Activate] [Delete] │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Add / Edit Suggestion Modal

```
[+ Add Suggestion]

┌──────────────────────────────────────────────────────────────┐
│  Add Practice Recommendation                                │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│  Recommend which set?                                       │
│  ○ Existing Set                                            │
│    [Search sets by name or ID...     ]                     │
│    → SET-482931 · Percentage Mastery Pack · 50 Qs          │
│                                                             │
│  ○ Entire Q-Bank Folder                                    │
│    [Browse folders... ]                                    │
│    → SSC › CGL › Tier-1 › Quantitative Aptitude           │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  Display Title:                                            │
│  [Percentage Mastery Pack                            ]     │
│                                                             │
│  Description (shown to students):                          │
│  [Covers all percentage problem types — simple to        ] │
│  [advanced. Great for SSC CGL prep.                      ] │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  Show to students weak in these topics:                    │
│  [Percentage ✕] [Ratio ✕] [+ Add topic]                  │
│                                                             │
│  Target exam type (optional):                              │
│  [SSC CGL ✕] [SSC CHSL ✕] [+ Add exam]                   │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  Priority:                                                 │
│  ○ High   — shown at top of suggestions                    │
│  ● Normal — standard placement                             │
│  ○ Low    — shown last                                     │
│                                                             │
│  Expected improvement % (optional):                        │
│  [18] %  (shown as "Avg improvement: +18%" to students)   │
│                                                             │
│  [Cancel]  [Save Recommendation]                          │
└──────────────────────────────────────────────────────────────┘
```

### 4.4 Quick Add from Q-Bank

```
Q-Bank → Any Set → [...] menu:

  ┌──────────────────────────────┐
  │ ✏️  Edit Set                 │
  │ 📋  Duplicate                │
  │ ⭐  Recommend to Students   │  ← Opens Add modal
  │                              │    with set pre-filled
  │ 🗑️  Delete                  │
  └──────────────────────────────┘
```

---

## 5. Study Plan Templates

### 5.1 What Are Templates

Admin **pre-built study plan structures** bana sakta hai — students jab apna plan generate kare, yeh templates as suggestions dikhe ya auto-apply ho:

```
Examples:
  📅 "SSC CGL 30-Day Crash Course"
     → Specific subject order + daily targets
     → Weak area focus sequence

  📅 "Banking PO 14-Day Plan"
     → Quantitative heavy first week
     → Reasoning + English second week

  📅 "General 7-Day Revision"
     → Quick coverage, all subjects
```

### 5.2 Templates List Page

```
Q-Bank → Practice Recommendations → [Study Plan Templates] tab

┌──────────────────────────────────────────────────────────────┐
│  Study Plan Templates              [+ Create Template]     │
│  Pre-built plans students can apply directly               │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📅 SSC CGL 30-Day Crash Course         Active ✅  │    │
│  │ 30 days  ·  45 min/day  ·  Exam: SSC CGL           │    │
│  │ Used by: 23 students                               │    │
│  │ Avg plan completion: 71%                           │    │
│  │                             [Edit] [Preview] [Delete]   │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📅 Banking PO 14-Day Plan               Active ✅  │    │
│  │ 14 days  ·  60 min/day  ·  Exam: IBPS PO           │    │
│  │ Used by: 11 students                               │    │
│  │                             [Edit] [Preview] [Delete]   │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Create Template Form

```
[+ Create Template]

┌──────────────────────────────────────────────────────────────┐
│  Create Study Plan Template                                 │
├──────────────────────────────────────────────────────────────┤
│  Template Name:                                            │
│  [SSC CGL 30-Day Crash Course                        ]    │
│                                                             │
│  Description:                                              │
│  [Intensive 30-day preparation covering all sections...]  │
│                                                             │
│  Target Exam: [SSC CGL ▾]                                 │
│  Duration:    [30] days                                    │
│  Daily time:  [45] minutes                                 │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  SUBJECT SCHEDULE (drag to reorder):                       │
│                                                             │
│  ≡  Week 1-2: Math (Arithmetic focus)                      │
│     Priority: High  ·  Days/week: 4                       │
│     Focus topics: [Percentage ✕] [Profit ✕] [+ Add]      │
│                                                             │
│  ≡  Week 1-2: Reasoning (Basic)                            │
│     Priority: Normal  ·  Days/week: 2                     │
│                                                             │
│  ≡  Week 3-4: English (Grammar + RC)                       │
│     Priority: High  ·  Days/week: 3                       │
│                                                             │
│  ≡  Week 3-4: GK (Current Affairs)                        │
│     Priority: Normal  ·  Days/week: 1                     │
│                                                             │
│  [+ Add Week Block]                                        │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  Visibility:                                               │
│  ● All students in this org                               │
│  ○ Only students who select SSC CGL exam                  │
│                                                             │
│  [Cancel]  [Save Template]                                │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 How Template Appears to Student

```
Student → My Practice → Study Plan → [Generate My Plan]

  "Use a template or create custom?"

  ┌──────────────────────┐  ┌──────────────────────┐
  │  📅 SSC CGL 30-Day  │  │  📅 Banking PO       │
  │  Crash Course        │  │  14-Day Plan         │
  │  30 days · 45 min   │  │  14 days · 60 min    │
  │  [Use This Template] │  │  [Use This Template] │
  └──────────────────────┘  └──────────────────────┘

  ┌──────────────────────┐
  │  ✏️  Build Custom    │
  │  Plan                │
  │  I'll set my own     │
  │  schedule            │
  └──────────────────────┘
```

---

## 6. Student Practice Analytics

### 6.1 Analytics → Student Practice Tab

```
Analytics → Student Practice

┌──────────────────────────────────────────────────────────────┐
│  Student Personalization Analytics              March 2026  │
├──────────────┬──────────────┬─────────────┬────────────────┤
│  Unlocked    │ Practice Sets│ Active Plans│  Avg Mastery   │
│  89/245 (36%)│  234 created │  67 active  │    61.4%       │
├──────────────┴──────────────┴─────────────┴────────────────┤
│                                                             │
│  PLATFORM-WIDE WEAK AREAS                [Create Set →]   │
│  ─────────────────────────────────────────────────────     │
│  These topics are weak across most students in your org:   │
│                                                             │
│  1. Percentage       avg 31% mastery  67 students weak     │
│  2. Error Spotting   avg 38% mastery  54 students weak     │
│  3. Profit & Loss    avg 41% mastery  49 students weak     │
│  4. Coding-Decoding  avg 45% mastery  41 students weak     │
│  5. Current Affairs  avg 29% mastery  38 students weak     │
│                                                             │
│  [+ Create Recommendation for Top Weak Areas]              │
│                                                             │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│  STUDENT PRACTICE SETS                                     │
│  ──────────────────────                                    │
│  [🔍 Search by student name...] [Status ▾] [Date ▾]       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ STUDENT         │ SET DATE │ QS  │ STATUS   │ SCORE │   │
│  ├─────────────────┼──────────┼─────┼──────────┼───────┤   │
│  │ Rahul Kumar     │ Mar 4    │ 50  │ Pending  │  —    │   │
│  │ Priya Sharma    │ Mar 3    │ 25  │ Done ✅  │ 72%   │   │
│  │ Amit Verma      │ Mar 2    │ 50  │ In Prog  │ 12/50 │   │
│  │ Sunita Singh    │ Feb 28   │ 100 │ Done ✅  │ 68%   │   │
│  └─────────────────┴──────────┴─────┴──────────┴───────┘   │
│  [← Prev]  Page 1 of 10  [Next →]   [Export CSV]          │
│                                                             │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│  STUDY PLAN PERFORMANCE                                    │
│  ──────────────────────                                    │
│  Plan completion rate:    68%                              │
│  Avg daily streak:        2.4 days                         │
│  Students with 7+ streak: 12                               │
│                                                             │
│  TOP PERFORMERS (plan adherence):                          │
│  1. Priya Sharma    92% adherence  🔥 11 day streak        │
│  2. Rahul Kumar     84% adherence  🔥 7 day streak         │
│  3. Amit Verma      78% adherence  🔥 5 day streak        │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Individual Student Practice View

```
Analytics → Student Practice → Click student name

Student: Priya Sharma (GK-STU-00234)
Personalization status: ✅ Unlocked (completed 67 tests)

MASTERY OVERVIEW:
  Overall: 71%  ████████████████░░  Proficient
  Math: 78%  English: 58%  Reasoning: 79%  GK: 62%

PRACTICE SETS (last 30 days):
  Mar 3  25 Qs  Score: 72%  Topics: Percentage, Error Spotting
  Feb 28 50 Qs  Score: 68%  Topics: Profit & Loss
  Feb 23 25 Qs  Score: 61%  Topics: GK, Current Affairs

STUDY PLAN:
  Active plan: 14 days (Mar 1 – Mar 14)
  Progress: 9/14 days completed  ██████████████░░
  Adherence: 92%  Streak: 🔥 11 days

CURRENT WEAK AREAS:
  ❌ Error Spotting  (38% mastery)
  ⚠️ Current Affairs (45% mastery)
  ⚠️ Profit & Loss   (52% mastery)
```

---

## 7. Student Unlock Management

### 7.1 Unlock Status Overview

```
Analytics → Student Practice → [Unlock Management] tab

┌──────────────────────────────────────────────────────────────┐
│  Unlock Management                                          │
│  Threshold: 50 tests  ·  [Change in Settings]              │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│  NEAR THRESHOLD (≥ 40 tests — will unlock soon):           │
│  ──────────────────────────────────────────────            │
│  ┌───────────────────┬────────────┬──────────────────────┐  │
│  │ STUDENT           │ TESTS DONE │ ACTION               │  │
│  ├───────────────────┼────────────┼──────────────────────┤  │
│  │ Rahul Kumar       │  48 / 50   │ [Unlock Now]         │  │
│  │ Amit Verma        │  45 / 50   │ [Unlock Now]         │  │
│  │ Sunita Singh      │  41 / 50   │ [Unlock Now]         │  │
│  └───────────────────┴────────────┴──────────────────────┘  │
│                                                             │
│  ALL LOCKED STUDENTS:                                      │
│  [🔍 Search...]                                            │
│  ┌───────────────────┬────────────┬──────────────────────┐  │
│  │ STUDENT           │ TESTS DONE │ ACTION               │  │
│  ├───────────────────┼────────────┼──────────────────────┤  │
│  │ Deepak Sharma     │  12 / 50   │ [Unlock Now]         │  │
│  │ Kavita Rani       │   8 / 50   │ [Unlock Now]         │  │
│  └───────────────────┴────────────┴──────────────────────┘  │
│                                                             │
│  [Unlock All Near-Threshold Students (3)]                  │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Manual Unlock Confirmation

```
[Unlock Now] → Confirmation modal:

  "Manually unlock personalized practice for Rahul Kumar?

  Current tests completed: 48/50
  Threshold: 50

  Student will immediately get access to:
  ⚡ Auto Set Generator
  📅 Study Plan
  💡 Practice Suggestions

  [Cancel]  [Yes, Unlock Now]"
```

---

## 8. Super Admin Controls

### 8.1 Platform-Level Defaults

```
Super Admin Panel → Platform Settings → Personalization

┌──────────────────────────────────────────────────────────────┐
│  Platform Personalization Defaults                          │
│  These apply to all orgs unless org overrides them         │
├──────────────────────────────────────────────────────────────┤
│  Default unlock threshold:  [50] tests                     │
│  Minimum allowed:           [10] tests                     │
│  Maximum allowed:           [200] tests                    │
│                                                             │
│  Default daily study time:  [45] minutes                   │
│  Default plan duration:     [14] days                      │
│                                                             │
│  Collaborative filtering:   [OFF] (experimental)           │
│                                                             │
│  [Save Platform Defaults]                                  │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Per-Org Override (in Org Admin Control)

```
Super Admin → Org Admin Control → [Org Name] →
  Extra Controls → Personalization Override

  Override this org's personalization settings:
  ☑ Use custom threshold: [30] tests
  ☑ Force feature ON (ignore org admin toggle)
  ☑ Enable collaborative filtering for this org

  [Save Override]
```

---

## 9. Database Schema

### 9.1 `org_personalization_settings`

```prisma
model OrgPersonalizationSettings {
  id                      String  @id @default(uuid())
  orgId                   String  @unique
  org                     Organization @relation(
                            fields: [orgId], references: [id],
                            onDelete: Cascade
                          )

  // Feature toggle
  isEnabled               Boolean @default(true)

  // Unlock
  autoSetThreshold        Int     @default(50)   // 10-200

  // Suggestions
  showAdminCurated        Boolean @default(true)
  showAISuggested         Boolean @default(true)
  showCollaborative       Boolean @default(false)

  // Study plan defaults
  defaultDailyMins        Int     @default(45)
  defaultPlanDays         Int     @default(14)

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  @@map("org_personalization_settings")
}
```

### 9.2 `admin_curated_suggestions`

```prisma
model AdminCuratedSuggestion {
  id              String   @id @default(uuid())
  orgId           String?  // NULL = Super Admin global suggestion
  org             Organization? @relation(
                    fields: [orgId], references: [id],
                    onDelete: Cascade
                  )

  // What to recommend
  setId           String?
  set             QuestionSet? @relation(fields: [setId], references: [id])
  folderId        String?
  folder          QBankFolder? @relation(fields: [folderId], references: [id])

  // Display
  title           String
  description     String?

  // Targeting
  targetTopicIds  String[]
  targetSubjectIds String[]
  targetExamTypes String[]

  // Config
  priority        Int      @default(0)   // higher = shown first
  avgImprovement  Float?   // expected improvement % (admin input)
  isActive        Boolean  @default(true)

  // Stats (auto-updated)
  impressionCount Int      @default(0)
  attemptCount    Int      @default(0)

  createdById     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([orgId, isActive])
  @@index([targetTopicIds])
  @@map("admin_curated_suggestions")
}
```

### 9.3 `study_plan_templates`

```prisma
model StudyPlanTemplate {
  id            String   @id @default(uuid())
  orgId         String?  // NULL = platform global template
  org           Organization? @relation(
                  fields: [orgId], references: [id],
                  onDelete: Cascade
                )

  name          String
  description   String?
  targetExamType String?
  durationDays  Int
  dailyMinutes  Int

  // Template structure (JSON — flexible schedule)
  schedule      Json
  // Example:
  // [
  //   { week: 1, subject: "Math", daysPerWeek: 4,
  //     focusTopics: ["Percentage", "Profit & Loss"] },
  //   { week: 1, subject: "Reasoning", daysPerWeek: 2, focusTopics: [] }
  // ]

  isActive      Boolean  @default(true)
  usageCount    Int      @default(0)       // how many students used this
  avgAdherence  Float    @default(0)       // avg plan completion %

  createdById   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([orgId, isActive])
  @@map("study_plan_templates")
}
```

---

## 10. API Endpoints — Admin Side

```
Base: /api/v1/org-admin/personalization
Auth: ORG_ADMIN role

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET   /settings
  Returns: OrgPersonalizationSettings

PATCH /settings
  Body: {
    isEnabled?: boolean
    autoSetThreshold?: number       // 10-200 validation
    showAdminCurated?: boolean
    showAISuggested?: boolean
    showCollaborative?: boolean
    defaultDailyMins?: number
    defaultPlanDays?: number
  }
  Returns: updated settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURATED SUGGESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET   /suggestions
  Query: ?isActive=true&topicId=&page=
  Returns: paginated AdminCuratedSuggestion[]

POST  /suggestions
  Body: {
    setId?: string
    folderId?: string
    title: string
    description?: string
    targetTopicIds: string[]        // min 1
    targetSubjectIds?: string[]
    targetExamTypes?: string[]
    priority?: number               // 0-10
    avgImprovement?: number
  }
  Validation: setId OR folderId required (not both)
  Returns: created suggestion

PATCH /suggestions/:id
  Body: (same fields, all optional)

DELETE /suggestions/:id

PATCH /suggestions/:id/toggle
  Action: isActive = !isActive
  Returns: { isActive: boolean }

GET   /suggestions/:id/stats
  Returns: { impressionCount, attemptCount, avgScoreAfter }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STUDY PLAN TEMPLATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET   /templates
  Query: ?isActive=true&examType=&page=
  Returns: StudyPlanTemplate[]

POST  /templates
  Body: {
    name: string
    description?: string
    targetExamType?: string
    durationDays: number
    dailyMinutes: number
    schedule: ScheduleBlock[]
    isActive?: boolean
  }

PATCH /templates/:id
DELETE /templates/:id

GET   /templates/:id/stats
  Returns: { usageCount, avgAdherence, activeStudents }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET   /analytics/overview
  Returns: {
    totalStudents, unlockedCount, lockedCount,
    practiceSetsCreated, activePlans,
    avgMastery, planCompletionRate, avgStreak
  }

GET   /analytics/weak-areas
  Query: ?limit=10&subjectId=
  Returns: [{
    topicId, topicName, subjectName,
    avgMastery, studentsWeak, totalStudents
  }]

GET   /analytics/student-sets
  Query: ?studentId=&status=&from=&to=&page=
  Returns: paginated student practice sets (all org students)

GET   /analytics/students/:studentId/practice
  Returns: {
    unlockStatus, practiceSets[], activePlan,
    masteryOverview, currentWeakAreas[]
  }

GET   /analytics/study-plans
  Returns: {
    activePlans, completionRate, avgAdherence,
    streakLeaderboard: [{ student, streak }],
    templateUsage: [{ template, usageCount, avgAdherence }]
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNLOCK MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET   /unlock/status
  Returns: {
    unlockedCount, lockedCount,
    nearThreshold: [{ studentId, name, testCount }],
    // students who have >= 80% of threshold done
  }

POST  /unlock/:studentId
  Action: Force unlock (override threshold)
  Returns: { studentId, isUnlocked: true, unlockedAt }

POST  /unlock/bulk
  Body: { studentIds: string[] }
  Action: Bulk unlock multiple students
  Returns: { unlocked: number, failed: number }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPER ADMIN ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base: /api/v1/admin/personalization

GET   /platform-defaults
PATCH /platform-defaults
  Body: {
    defaultThreshold?: number
    minThreshold?: number     // lower bound orgs can set
    maxThreshold?: number     // upper bound orgs can set
    defaultDailyMins?: number
    defaultPlanDays?: number
    collaborativeEnabled?: boolean
  }

GET   /orgs/stats
  Returns: platform-wide personalization stats across all orgs
```

---

## 11. Business Rules

| Rule | Detail |
|---|---|
| Settings scope | Per org — each org has own settings |
| Threshold change | Only affects locked students; already-unlocked stay unlocked |
| Threshold range | Min 10, Max 200 (enforced in API validation) |
| Feature toggle OFF | Students lose access temporarily; data preserved |
| Curated suggestion | Must have setId OR folderId — not both, not neither |
| Template schedule | JSON format — validated at save time against schema |
| Template usage count | Auto-incremented when student uses template |
| Suggestion impression | Auto-incremented when suggestion shown to a student |
| Suggestion attempt | Auto-incremented when student starts the recommended set |
| Admin curated priority | Higher priority value = shown first in student suggestions |
| Super Admin override | Can set threshold lower than org minimum (platform-level control) |
| Analytics visibility | All student practice sets visible to Org Admin (isVisibleToAdmin flag) |
| Bulk unlock | Max 50 students at once in single API call |

---

## 12. Development Checklist

```
Phase 1 — Settings
  ☐ OrgPersonalizationSettings model + migration
  ☐ GET /personalization/settings API
  ☐ PATCH /personalization/settings API (with range validation)
  ☐ Settings → Personalization tab UI
  ☐ Live unlock count shown in settings page

Phase 2 — Curated Suggestions
  ☐ AdminCuratedSuggestion model + migration
  ☐ Full CRUD APIs (GET, POST, PATCH, DELETE, toggle)
  ☐ Q-Bank → Practice Recommendations page UI
  ☐ Add/Edit suggestion modal UI
  ☐ Quick add from Q-Bank set menu (⭐ Recommend)
  ☐ Impression/attempt counter auto-update hook

Phase 3 — Study Plan Templates
  ☐ StudyPlanTemplate model + migration
  ☐ Full CRUD APIs
  ☐ Templates list page UI
  ☐ Create template form UI (with week block builder)
  ☐ Wire templates into student study plan generate flow
  ☐ Usage count + adherence auto-tracking

Phase 4 — Analytics
  ☐ GET /analytics/overview API
  ☐ GET /analytics/weak-areas API (aggregated across org)
  ☐ GET /analytics/student-sets API
  ☐ GET /analytics/students/:id/practice API
  ☐ Analytics → Student Practice tab UI
  ☐ Platform-wide weak areas table + "Create Set" shortcut
  ☐ Student sets table with drill-down
  ☐ Study plan performance stats

Phase 5 — Unlock Management
  ☐ GET /unlock/status API (near-threshold list)
  ☐ POST /unlock/:studentId API (manual unlock)
  ☐ POST /unlock/bulk API
  ☐ Unlock Management tab UI
  ☐ Near-threshold students highlighted
  ☐ Bulk unlock button

Phase 6 — Super Admin
  ☐ Platform defaults API (GET + PATCH)
  ☐ Super Admin platform settings UI
  ☐ Per-org override in Org Admin Control
  ☐ Platform-wide personalization stats dashboard
```
