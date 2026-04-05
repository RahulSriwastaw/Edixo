# EduHub / GyaanKendra — MockBook Module
## Complete Full-Stack PRD (Super Admin Panel)

**Document ID:** EH-MOCKBOOK-PRD-001
**Version:** 1.0
**Date:** March 2026
**Status:** Final — Ready for Development
**Classification:** Confidential — Internal Use Only
**Module:** Super Admin Panel → MockBook
**Prepared For:** Full Stack Development Team

---

## Table of Contents

1. [Vision & Concept](#1-vision--concept)
2. [Org Switcher — Core Feature](#2-org-switcher--core-feature)
3. [MockBook Global Overview (Super Admin)](#3-mockbook-global-overview)
4. [Content Structure Hierarchy](#4-content-structure-hierarchy)
5. [Folder Management](#5-folder-management)
6. [Category & Sub-Category](#6-category--sub-category)
7. [Question Sets (Already Built — Reference)](#7-question-sets)
8. [MockTest / Exam Management](#8-mocktest--exam-management)
9. [Pack System (Student Plans)](#9-pack-system)
10. [Study Plan](#10-study-plan)
11. [Daily Practice](#11-daily-practice)
12. [Student Management (Per Org)](#12-student-management)
13. [Results & Analytics (Per Org)](#13-results--analytics)
14. [AI Quota Management](#14-ai-quota-management)
15. [Taxonomy Management](#15-taxonomy-management)
16. [Marketplace](#16-marketplace)
17. [In-App Purchase Control](#17-in-app-purchase-control)
18. [Database Schema](#18-database-schema)
19. [API Endpoints](#19-api-endpoints)
20. [UI Screens Specification](#20-ui-screens-specification)
21. [Business Rules & Edge Cases](#21-business-rules--edge-cases)
22. [Development Phases](#22-development-phases)

---

## 1. Vision & Concept

### 1.1 MockBook Kya Hai?

MockBook EduHub platform ka **exam preparation product** hai. Super Admin Panel se:

- **Platform-wide** — Sabhi orgs ka overview, AI quotas, taxonomy, marketplace
- **Org-specific** — Kisi bhi org ka MockBook fully manage karo (Org Switcher se)

### 1.2 Two-Level Control

```
LEVEL 1 — GLOBAL (Platform-wide)
─────────────────────────────────
Super Admin → MockBook (no org selected)
  ├── Total exams across all orgs
  ├── AI Credits used platform-wide
  ├── Active orgs count
  ├── Tests this month (all orgs)
  ├── AI Quota per org management
  ├── Taxonomy (global subjects/chapters)
  ├── Marketplace (global question sets)
  └── Results (platform-wide)

LEVEL 2 — ORG-SPECIFIC (Org Switcher)
──────────────────────────────────────
Super Admin → MockBook → [Select Org]
  ├── Folders, Categories, Sub-Categories
  ├── Question Sets (already built)
  ├── MockTests / Exams
  ├── Packs (Student Plans)
  ├── Study Plans
  ├── Daily Practice
  ├── Students (view, edit, manage)
  └── Org-level Results & Analytics
```

### 1.3 Key Business Rules

| Rule | Description |
|---|---|
| **Org Isolation** | Ek org ka data doosri org ko nahi dikhta |
| **Super Admin Override** | Super Admin kisi bhi org ka data access + edit kar sakta hai |
| **Set → MockTest** | MockTest sirf Question Set ID + Password se banta hai |
| **Pack = Plan** | Students ko content access dene ka subscription system |
| **Dual Purchase** | Pack: In-app payment se ya Org Admin assign kare |
| **Multiple Packs** | Ek student ek saath multiple packs le sakta hai |
| **AI Points** | Org ke AI points Super Admin control karta hai |

---

## 2. Org Switcher — Core Feature

### 2.1 Concept

```
MockBook page open hote hi:
  ┌─────────────────────────────────────────┐
  │  MockBook                               │
  │  Global overview + Org management       │
  │                                         │
  │  [🏢 Select Organization to Manage ▾]  │
  │                                         │
  │  Currently viewing: GLOBAL              │
  └─────────────────────────────────────────┘

Org select karne ke baad:
  ┌─────────────────────────────────────────┐
  │  MockBook — Apex Academy                │
  │  GK-ORG-00142                  [✕ Exit] │
  │                                         │
  │  [🏢 Apex Academy (GK-ORG-00142) ▾]   │
  │                                         │
  │  Currently managing: APEX ACADEMY       │
  └─────────────────────────────────────────┘
```

### 2.2 Org Switcher Dropdown Spec

```
┌─── Select Organization ──────────────────────────┐
│  🔍 [Search by name or ID...                   ] │
│  ────────────────────────────────────────────── │
│  RECENTLY ACCESSED                               │
│  🏢 Apex Academy          GK-ORG-00142  [Select] │
│  🏢 Brilliant Coaching    GK-ORG-00141  [Select] │
│  ────────────────────────────────────────────── │
│  ALL ORGANIZATIONS (48)                          │
│  🏢 Excel Institute       GK-ORG-00140  [Select] │
│  🏢 Success Classes       GK-ORG-00139  [Select] │
│  🏢 Prime Tutorials       GK-ORG-00137  [Select] │
│  🏢 Knowledge Park        GK-ORG-00136  [Select] │
│  ...                                             │
│  [Load More]                                     │
└──────────────────────────────────────────────────┘
```

### 2.3 Org Context Banner

Jab org selected ho tab **top pe sticky banner** rahega:

```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Managing: Apex Academy (GK-ORG-00142)   [Switch Org] [✕ Exit]│
└──────────────────────────────────────────────────────────────────┘
```

- Banner **accent.orange** color ka hoga taaki clear pata chale ki org mode mein hai
- Exit karne par wapas Global view aata hai

### 2.4 Org-Specific Navigation Tabs

Org select karne ke baad tabs change ho jaate hain:

```
GLOBAL TABS:
[Overview] [AI Quotas] [Taxonomy] [Marketplace] [Results]

ORG-SPECIFIC TABS:
[Overview] [Folders] [MockTests] [Packs] [Study Plans] [Daily Practice] [Students] [Results]
```

---

## 3. MockBook Global Overview

### 3.1 Global Stats (Already Developed)

| Stat | Description |
|---|---|
| Total Exams | Platform-wide total exams created |
| AI Credits Used | Total AI credits consumed this month |
| Active Orgs | Orgs with at least 1 active exam |
| Tests This Month | Total test attempts across all orgs |

### 3.2 Global Overview Tab

```
┌─── MockBook Global Overview ─────────────────────────────────────┐
│                                                                    │
│  [Total Exams: 1,247]  [AI Credits: 8,421]                       │
│  [Active Orgs: 48]     [Tests This Month: 34,291]                │
│                                                                    │
│  ─── PLATFORM ACTIVITY ───────────────────────────────────────── │
│  [📈 Tests per day — Last 30 days — Line Chart]                  │
│                                                                    │
│  ─── TOP ORGS BY ACTIVITY ────────────────────────────────────── │
│  Org Name          Tests   Students   Avg Score   Status         │
│  Apex Academy      8,421   1,200      72%         🟢 Active      │
│  Prime Tutorials   6,891   980        68%         🟢 Active      │
│  Excel Institute   5,234   750        74%         🟢 Active      │
│  ...                                                              │
│                                                                    │
│  ─── RECENT ALERTS ───────────────────────────────────────────── │
│  🔴 Success Classes — AI Quota 97% used (Reset: Mar 25)          │
│  🟡 Brilliant Coaching — AI Quota 78% used                       │
└────────────────────────────────────────────────────────────────── ┘
```

---

## 4. Content Structure Hierarchy

### 4.1 Complete Hierarchy

```
ORG's MockBook
│
├── 📁 FOLDER (Top-level grouping)
│   Example: "JEE 2026 Preparation", "NEET Batch A", "Class 10 Board"
│   │
│   ├── 📂 CATEGORY (Subject level)
│   │   Example: "Physics", "Chemistry", "Mathematics"
│   │   │
│   │   └── 📂 SUB-CATEGORY (Chapter level)
│   │       Example: "Kinematics", "Thermodynamics", "Organic Chemistry"
│   │       │
│   │       └── 📋 QUESTION SETS (Already built)
│   │           (ID + Password → Used in MockTests)
│   │
│   ├── 📝 MOCK TESTS / EXAMS
│   │   (Built from Question Sets via Set ID + Password)
│   │
│   ├── 📦 PACKS (Student subscription plans)
│   │   (Contains: MockTests, Study Material, Daily Practice)
│   │
│   ├── 📅 STUDY PLANS
│   │   (Day-wise schedule of content)
│   │
│   └── 🎯 DAILY PRACTICE
│       (Auto or manual daily question sets)
│
└── 👥 STUDENTS
    (All students of this org — manage data, assign packs)
```

### 4.2 Visibility Rules

| Content | Who Can See |
|---|---|
| Folder | Students enrolled in that folder's pack |
| Category/Sub-Category | All students of org (navigation only) |
| MockTest (Free) | All org students |
| MockTest (Pack) | Only students with that pack |
| Daily Practice | All org students (if enabled) |
| Study Plan | Students assigned to that plan |

---

## 5. Folder Management

### 5.1 Folder Features

| Feature | Description |
|---|---|
| Create Folder | Name, description, thumbnail image, visibility |
| Edit Folder | Update any field |
| Delete Folder | Soft delete — content moves to "Uncategorized" |
| Duplicate Folder | Copy with all sub-content |
| Reorder | Drag & drop folder order |
| Visibility | Public (all org students) / Private (pack-only) |
| Assign to Pack | Folder ka content specific pack mein include karo |
| Student Count | Kitne students enrolled hain |
| Archive | Active / Archived status |

### 5.2 Folder Create/Edit Form

```
┌─── Create Folder ────────────────────────────────────────────────┐
│                                                                    │
│  Folder Name *          [JEE 2026 Complete Preparation        ]  │
│                                                                    │
│  Description            [Complete JEE preparation with full...  ]│
│                                                                    │
│  Thumbnail Image        [📷 Upload Image]                        │
│                                                                    │
│  Visibility             [● Public  ○ Pack Only]                  │
│                                                                    │
│  Assign to Pack(s)      [Select Packs ▾]                         │
│  (if Pack Only)         ☑ JEE Gold Pack   ☑ JEE Platinum Pack   │
│                                                                    │
│  Status                 [● Active  ○ Draft  ○ Archived]          │
│                                                                    │
│  Display Order          [1]                                       │
│                                                                    │
│             [Cancel]              [Save Folder]                   │
└────────────────────────────────────────────────────────────────── ┘
```

---

## 6. Category & Sub-Category

### 6.1 Category

- Folder ke andar subjects hote hain — yeh Category hai
- Example: Physics, Chemistry, Biology, Math
- Category ka apna icon/color hota hai
- Category se directly questions/sets navigate hote hain

### 6.2 Sub-Category

- Category ke andar chapters hote hain — yeh Sub-Category hai
- Example: Physics → Kinematics, Optics, Thermodynamics
- Sub-Category se specific question sets linked hote hain

### 6.3 Category/Sub-Category Form

```
┌─── Create Category ──────────────────────────────────────────────┐
│                                                                    │
│  Parent Folder *        [JEE 2026 Preparation ▾]                 │
│                                                                    │
│  Category Name *        [Physics                              ]   │
│                                                                    │
│  Icon                   [🔬 Select Icon]                         │
│                                                                    │
│  Color Tag              [● Blue ○ Green ○ Orange ○ Purple]       │
│                                                                    │
│  Description            [Optional...                          ]   │
│                                                                    │
│  Display Order          [1]                                       │
│                                                                    │
│             [Cancel]         [Save Category]                      │
└────────────────────────────────────────────────────────────────── ┘

┌─── Create Sub-Category ──────────────────────────────────────────┐
│  Parent Category *      [Physics ▾]                               │
│  Sub-Category Name *    [Kinematics                           ]   │
│  Description            [Optional...                          ]   │
│  Display Order          [1]                                       │
│             [Cancel]         [Save Sub-Category]                  │
└────────────────────────────────────────────────────────────────── ┘
```

---

## 7. Question Sets (Already Built — Reference)

### 7.1 Quick Reference

Already developed hai — yahan sirf MockBook context mein kaise use hota hai:

```
Question Bank → Question Sets mein:
  Set Name: "JEE Physics Kinematics Set 1"
  Set ID:   482931
  Password: 738291
  Questions: 30
  Marks:     120
  
MockBook mein use:
  MockTest create karo → Set ID: 482931 + Password: 738291 → MockTest ready
```

### 7.2 Sets Ko MockBook Se Browse Karna

Org ke context mein Super Admin:

```
MockBook → Org Selected → MockTests → Create New
  ├── "Link Question Set" tab
  │     └── Search: [Set name or ID...]
  │           ├── Sets from THIS org's Q-Bank
  │           └── Sets from Global Q-Bank (if purchased)
  └── Enter Set ID + Password manually
```

---

## 8. MockTest / Exam Management

### 8.1 MockTest Types

| Type | Description | Timer |
|---|---|---|
| **Full Mock Test** | Complete syllabus test | Yes — Strict |
| **Chapter Test** | Single chapter/topic | Yes — Flexible |
| **Previous Year (PYQ)** | Past year papers | Yes |
| **Mini Mock** | 10-20 questions, quick | Yes — Short |
| **Practice Mode** | No timer, self-paced | No |
| **Custom Test** | Mixed topics | Yes |
| **Speed Test** | Time-pressured rapid questions | Yes — Very Short |

### 8.2 MockTest Create Form

```
┌─── Create MockTest ──────────────────────────────────────────────┐
│                                                                    │
│  BASIC INFO                                                        │
│  Test Name *            [JEE Full Mock Test - Series 1        ]  │
│  Test Type *            [Full Mock Test ▾]                       │
│  Description            [Complete JEE syllabus — 180 questions] │
│  Thumbnail              [📷 Upload]                               │
│                                                                    │
│  QUESTION SOURCE                                                   │
│  ● Link Question Set (recommended)                                │
│    Set ID *             [482931          ]                        │
│    Password *           [738291          ]   [✅ Verified]        │
│    Questions loaded:    30 questions · 120 marks                  │
│                                                                    │
│  ○ Add Multiple Sets                                              │
│    [+ Add Set] [+ Add Set] [+ Add Set]                           │
│    Total: 0 questions · 0 marks                                   │
│                                                                    │
│  EXAM SETTINGS                                                     │
│  Duration *             [180] minutes                            │
│  Total Marks            [360] (auto from set)                    │
│  Negative Marking       [● Yes  ○ No]                            │
│    Per wrong answer:    [-1] marks                                │
│  Pass Marks             [120] marks (optional)                    │
│                                                                    │
│  ATTEMPT SETTINGS                                                  │
│  Max Attempts           [● Unlimited  ○ Limited: [3] attempts]   │
│  Show Result After      [● Immediate  ○ After deadline  ○ Manual]│
│  Show Solutions         [● After attempt  ○ After deadline ○ Never]│
│  Shuffle Questions      [●─────] Yes                             │
│  Shuffle Options        [●─────] Yes                             │
│                                                                    │
│  SCHEDULING                                                        │
│  Availability           [● Always  ○ Date Range]                 │
│  Start Date             [📅 Pick date & time]                    │
│  End Date               [📅 Pick date & time]                    │
│                                                                    │
│  ACCESS CONTROL                                                    │
│  Access Type            [● Free (all org students)               │
│                           ○ Pack Only — select packs:            │
│                             ☑ JEE Gold   ☑ JEE Platinum]         │
│                                                                    │
│  PLACEMENT                                                         │
│  Folder                 [JEE 2026 Preparation ▾]                 │
│  Category               [Physics ▾]                               │
│  Sub-Category           [Full Syllabus ▾]                        │
│  Display Order          [1]                                       │
│                                                                    │
│  INSTRUCTIONS (shown to student before start)                     │
│  [Rich text area — type exam instructions here...]                │
│                                                                    │
│       [Cancel]    [Save as Draft]    [Save & Publish]             │
└────────────────────────────────────────────────────────────────── ┘
```

### 8.3 MockTest List View

```
┌─── MockTests — Apex Academy ─────────────────────────────────────┐
│  [+ Create MockTest]  [🔍 Search]  [Filter: All Types ▾]         │
│                                                                    │
│  ☐  NAME                    TYPE        STATUS    ATTEMPTS  DATE  │
│  ──────────────────────────────────────────────────────────────  │
│  ☐  JEE Full Mock - S1     Full Mock   Published  1,247    Mar1  │
│     GK-ORG-00142 · 180min · 360 marks · Free                    │
│     [Edit] [Results] [Duplicate] [Unpublish] [Delete]           │
│                                                                    │
│  ☐  Physics Chapter Test    Chapter     Draft      —       Mar3  │
│     GK-ORG-00142 · 60min · 120 marks · Pack Only               │
│     [Edit] [Publish] [Duplicate] [Delete]                        │
│                                                                    │
│  ☐  PYQ 2024 Paper          PYQ         Scheduled  —       Mar5  │
│     Starts: Mar 10, 2026 · 180min · 360 marks · Free            │
│     [Edit] [Results] [Duplicate] [Cancel Schedule] [Delete]     │
└────────────────────────────────────────────────────────────────── ┘
```

### 8.4 MockTest Actions

| Action | Description |
|---|---|
| **Edit** | Modify any field (if no attempts → full edit; if attempts → limited edit) |
| **Publish/Unpublish** | Toggle live status |
| **Duplicate** | Copy test with new ID, reset attempts to 0 |
| **View Results** | See all student attempts for this test |
| **Delete** | Soft delete — archived, not shown to students |
| **Reset All Attempts** | Clear all student attempts (with confirmation) |
| **Export Results** | Download CSV of all attempts |
| **Schedule** | Set start/end date |
| **Assign to Pack** | Add/remove from packs |

---

## 9. Pack System

### 9.1 Pack Kya Hai?

Pack = **Student ke liye subscription plan** jo MockBook content ka access deta hai.

```
PACK EXAMPLE:

┌─────────────────────────────────────────────────┐
│  🏆 JEE Gold Pack                               │
│  ₹999/month  |  ₹8,999/year                    │
│                                                  │
│  INCLUDES:                                       │
│  ✅ All JEE Full Mock Tests (unlimited)         │
│  ✅ Chapter-wise Tests (Physics, Chem, Math)    │
│  ✅ PYQ Papers (2015-2024)                      │
│  ✅ Study Plan — 90 Day JEE Prep               │
│  ✅ Daily Practice (20 questions/day)           │
│  ✅ AI-powered analysis                         │
│  ✅ Performance analytics                        │
│  ✅ 500 AI Points/month                         │
│                                                  │
│  STUDENTS ENROLLED: 342                         │
│  STATUS: 🟢 Active                              │
└─────────────────────────────────────────────────┘
```

### 9.2 Pack Create Form

```
┌─── Create Pack ──────────────────────────────────────────────────┐
│                                                                    │
│  BASIC INFO                                                        │
│  Pack Name *            [JEE Gold Pack                        ]  │
│  Short Description      [Complete JEE prep with AI analysis   ]  │
│  Long Description       [Rich text editor — full pack details]   │
│  Thumbnail Image        [📷 Upload — shown to students]          │
│  Badge/Tag              [🏆 Most Popular] [🔥 Bestseller] [New] │
│                                                                    │
│  PRICING & DURATION                                                │
│  Pack Type              [● Paid  ○ Free]                         │
│                                                                    │
│  Pricing Plans:                                                    │
│  [+ Add Plan]                                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Plan 1                                      [🗑 Remove]   │  │
│  │  Duration Type   [● Daily ○ Weekly ○ Monthly ○ Yearly      │  │
│  │                   ○ Custom (X days)]                        │  │
│  │  Duration        [1] Month                                  │  │
│  │  Price           [₹] [999]                                  │  │
│  │  Discounted MRP  [₹] [1,299]  (shows strikethrough)        │  │
│  │  Label           [Most Popular]                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Plan 2                                      [🗑 Remove]   │  │
│  │  Duration Type   [● Yearly]                                 │  │
│  │  Duration        [1] Year                                   │  │
│  │  Price           [₹] [8,999]                                │  │
│  │  Discounted MRP  [₹] [11,988]                               │  │
│  │  Label           [Best Value]                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  CONTENT ACCESS                                                    │
│  Included Folders       ☑ JEE 2026 Complete Prep                │
│                         ☑ PYQ Series                             │
│                         ☐ NEET Content (not included)            │
│                                                                    │
│  Included MockTests     [● All in selected folders               │
│                          ○ Select specific tests]                 │
│                                                                    │
│  Study Plans            ☑ 90 Day JEE Study Plan                 │
│                         ☐ 60 Day Crash Course                    │
│                                                                    │
│  Daily Practice         [● Enabled  ○ Disabled]                  │
│  Questions/Day          [20]                                      │
│                                                                    │
│  AI FEATURES                                                       │
│  AI Points/Month        [500] points                              │
│  AI Analysis            [●─────] Enabled                         │
│  AI Doubt Solver        [●─────] Enabled                         │
│  AI Performance Tips    [●─────] Enabled                         │
│                                                                    │
│  PURCHASE METHODS                                                  │
│  ☑ In-App Purchase (students buy directly)                       │
│  ☑ Org Admin Assign (org admin can give to students)             │
│  ☑ Super Admin Assign (super admin can give to students)         │
│                                                                    │
│  VALIDITY SETTINGS                                                 │
│  Pack Availability      [● Always  ○ Date Range]                 │
│  Trial Available        [●─────] Yes                             │
│  Trial Duration         [3] days (full access trial)             │
│                                                                    │
│  PAYMENT GATEWAY        [● Razorpay  ○ Stripe  ○ Manual]        │
│                                                                    │
│  STATUS                 [● Active  ○ Draft  ○ Archived]          │
│                                                                    │
│       [Cancel]    [Save as Draft]    [Save & Publish]             │
└────────────────────────────────────────────────────────────────── ┘
```

### 9.3 Pack Management Actions

| Action | Description |
|---|---|
| **Edit Pack** | Modify pack details (pricing, content, AI points) |
| **View Subscribers** | All students with this pack + expiry dates |
| **Assign to Student** | Manually assign pack to specific student(s) |
| **Revoke Access** | Remove pack from student |
| **Extend Expiry** | Extend pack validity for specific student |
| **Pause Pack** | Stop new purchases (existing subscribers unaffected) |
| **Archive Pack** | Fully disable pack |
| **Duplicate Pack** | Copy pack structure |
| **Export Subscribers** | CSV of all subscribers |
| **Revenue Report** | Pack-wise revenue analytics |

### 9.4 Pack Subscribers Table

```
┌─── JEE Gold Pack — Subscribers (342) ───────────────────────────┐
│  [🔍 Search student]  [Assign to Student +]  [Export CSV]        │
│                                                                    │
│  STUDENT NAME      STUDENT ID  PLAN     PURCHASED    EXPIRES     │
│  ─────────────────────────────────────────────────────────────── │
│  Rahul Sharma      STU-001     Monthly  Feb 15, 2026 Mar 15, 2026│
│  [View] [Extend] [Revoke]                                        │
│                                                                    │
│  Priya Verma       STU-002     Yearly   Jan 1, 2026  Jan 1, 2027 │
│  [View] [Extend] [Revoke]                                        │
│                                                                    │
│  Amit Kumar        STU-003     Assigned Mar 1, 2026  Mar 31, 2026│
│  (Assigned by Org Admin)                                          │
│  [View] [Extend] [Revoke]                                        │
└────────────────────────────────────────────────────────────────── ┘
```

---

## 10. Study Plan

### 10.1 Kya Hai Study Plan?

Study Plan = **Day-wise content schedule** jo students ko follow karna hota hai.

```
90 Day JEE Study Plan
├── Week 1
│   ├── Day 1: Physics — Kinematics (Read + 20 practice questions)
│   ├── Day 2: Chemistry — Atomic Structure (Read + 15 questions)
│   ├── Day 3: Math — Quadratic Equations (Read + 20 questions)
│   ├── Day 4: Revision Day (Mix — 30 questions)
│   ├── Day 5: Mini Mock Test (Physics Week 1)
│   ├── Day 6: Chemistry — Chemical Bonding
│   └── Day 7: Rest / Self Study
├── Week 2
│   └── ...
└── Week 13
    └── Day 90: Full Mock Test + Analysis
```

### 10.2 Study Plan Create Form

```
┌─── Create Study Plan ────────────────────────────────────────────┐
│                                                                    │
│  Plan Name *            [90 Day JEE Complete Preparation      ]  │
│  Description            [Structured day-wise JEE prep plan...]   │
│  Thumbnail              [📷 Upload]                               │
│  Total Days *           [90]                                      │
│  Difficulty             [● Beginner ○ Intermediate ○ Advanced]   │
│                                                                    │
│  PLAN BUILDER                                                      │
│  ┌── DAY 1 ────────────────────────────────────────────────────┐ │
│  │  Day Title    [Physics — Kinematics Basics              ]   │ │
│  │  Description  [Understand motion in one dimension...]       │ │
│  │  Content Items:                                              │ │
│  │  [+ Add Item ▾]                                             │ │
│  │   ┌─────────────────────────────────────────────────────┐  │ │
│  │   │  📝 Practice Set    Kinematics Set 1 (Set: 482931)  │  │ │
│  │   │  Target: 20 questions  Time: 30 min  [🗑]           │  │ │
│  │   └─────────────────────────────────────────────────────┘  │ │
│  │   ┌─────────────────────────────────────────────────────┐  │ │
│  │   │  🎯 MockTest        Mini Mock — Kinematics          │  │ │
│  │   │  20 questions · 40 marks · 30 min  [🗑]             │  │ │
│  │   └─────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  [+ Add Day]  [Bulk Add Days (template)]                         │
│                                                                    │
│  ASSIGNMENT                                                        │
│  Assign To              [● Pack Only  ○ All Students  ○ Manual]  │
│  Included in Packs      ☑ JEE Gold Pack  ☑ JEE Platinum Pack    │
│                                                                    │
│  Start Options          [● Student chooses start date            │
│                           ○ Fixed start date: [📅]               │
│                           ○ Starts on enrollment]                 │
│                                                                    │
│  Status                 [● Active  ○ Draft]                      │
│                                                                    │
│       [Cancel]    [Save Draft]    [Save & Publish]                │
└────────────────────────────────────────────────────────────────── ┘
```

### 10.3 Study Plan Day Content Types

| Content Type | Description |
|---|---|
| **Practice Set** | Question set se practice (Set ID link) |
| **MockTest** | Full/Chapter test |
| **Study Note** | Text/PDF reading material |
| **Video** | Video lecture link |
| **Revision** | Previous day topics revisit |
| **Rest Day** | No content — rest/self-study |
| **Assessment** | Mandatory test before next day unlocks |

---

## 11. Daily Practice

### 11.1 Kya Hai Daily Practice?

Daily Practice = **Har din automatically questions milte hain** students ko.

```
DAILY PRACTICE ENGINE:
  ├── Super Admin / Org Admin sets configuration
  ├── Every midnight IST → New day's questions generated
  ├── Questions drawn from: org's Q-Bank + Global Q-Bank
  ├── Algorithm considers: student's weak areas, recent performance
  └── Student completes → Streak maintained + Points earned
```

### 11.2 Daily Practice Configuration

```
┌─── Daily Practice Configuration ────────────────────────────────┐
│  Organization: Apex Academy                                       │
│                                                                    │
│  STATUS                 [●─────] Enabled                         │
│                                                                    │
│  QUESTION SETTINGS                                                 │
│  Questions Per Day      [20]                                      │
│  Difficulty Mix         Easy [30%] Medium [50%] Hard [20%]       │
│  Subject Mix            Auto (based on study plan) / Manual      │
│                                                                    │
│  MANUAL SUBJECT MIX:                                              │
│  Physics                [35%]                                     │
│  Chemistry              [35%]                                     │
│  Mathematics            [30%]                                     │
│                                                                    │
│  QUESTION SOURCE                                                   │
│  ☑ Org's own Q-Bank                                              │
│  ☑ Global Q-Bank (public questions)                               │
│  ☐ Specific Sets only [Select Sets...]                           │
│                                                                    │
│  TIME SETTINGS                                                     │
│  Available From         [6:00 AM IST]                             │
│  Expires At             [11:59 PM IST] (same day)                │
│  Timer                  [● No Timer  ○ [30] minutes]             │
│                                                                    │
│  ADAPTIVE MODE                                                     │
│  Smart Difficulty       [●─────] On                              │
│  (Adjust based on student performance automatically)              │
│                                                                    │
│  GAMIFICATION                                                      │
│  Points Per Correct     [2] points                                │
│  Streak Bonus           [● Enabled]                               │
│    7-day streak:        [+50] bonus points                        │
│    30-day streak:       [+200] bonus points                       │
│                                                                    │
│  NOTIFICATION                                                      │
│  Daily Reminder         [● Enabled]                               │
│  Reminder Time          [8:00 AM IST]                             │
│  Reminder Message       [🎯 Your daily practice is ready! Solve  │
│                           today's 20 questions and maintain your  │
│                           streak!]                                │
│                                                                    │
│            [Cancel]              [Save Configuration]             │
└────────────────────────────────────────────────────────────────── ┘
```

---

## 12. Student Management (Per Org)

### 12.1 Student List View

```
┌─── Students — Apex Academy (1,247 students) ─────────────────────┐
│  [🔍 Search by name/ID]  [Filter ▾]  [+ Add Student]  [Import CSV]│
│  [Export CSV]                                                      │
│                                                                    │
│  ☐  STUDENT         ID          PACKS        TESTS  STREAK  STATUS│
│  ───────────────────────────────────────────────────────────────  │
│  ☐  Rahul Sharma   STU-001    Gold, Platinum   48    🔥12   Active │
│     rahul@email.com · Class 12 · JEE Target                      │
│     [View] [Edit] [Packs] [Results] [Reset] [Suspend]            │
│                                                                    │
│  ☐  Priya Verma    STU-002    Gold             32    🔥5    Active │
│     priya@email.com · Class 12 · JEE Target                      │
│     [View] [Edit] [Packs] [Results] [Reset] [Suspend]            │
│                                                                    │
│  ☐  Amit Kumar     STU-003    None              5    —      Active │
│     amit@email.com · Class 11                                     │
│     [View] [Edit] [Packs] [Results] [Reset] [Suspend]            │
└────────────────────────────────────────────────────────────────── ┘
```

### 12.2 Student Detail View

```
┌─── Student Profile — Rahul Sharma ───────────────────────────────┐
│  [← Students]                                                     │
│                                                                    │
│  [Avatar] Rahul Sharma                    [Edit Profile]          │
│           STU-001 · GK-ORG-00142                                  │
│           rahul.sharma@email.com · +91 98765 43210               │
│           Class 12 · Target: JEE 2026                            │
│           Joined: Jan 15, 2026 · Last Active: Mar 3, 2026        │
│                                                                    │
├── STATS ─────────────────────────────────────────────────────────│
│  Tests Taken: 48    Avg Score: 72%    Best Score: 94%            │
│  Practice Qs: 1,240    Streak: 🔥12 days    Points: 2,450        │
│                                                                    │
├── PACKS ─────────────────────────────────────────────────────────│
│  Pack            Type      Purchased     Expires      Action     │
│  JEE Gold        Monthly   Feb 15, 2026  Mar 15, 2026 [Extend][Revoke]│
│  JEE Platinum    Yearly    Jan 1, 2026   Jan 1, 2027  [Extend][Revoke]│
│  [+ Assign New Pack]                                              │
│                                                                    │
├── RECENT TESTS ──────────────────────────────────────────────────│
│  Test Name              Date      Score    Rank    Action        │
│  JEE Full Mock - S3     Mar 3     285/360  12/342  [View] [Reset]│
│  Physics Chapter Test   Mar 1     87/120   5/342   [View] [Reset]│
│  PYQ 2024 Paper         Feb 28    310/360  3/342   [View] [Reset]│
│  [View All Results →]                                             │
│                                                                    │
├── AI USAGE ──────────────────────────────────────────────────────│
│  AI Points Balance: 380 / 500 this month                         │
│  [+ Add Points]  [View Usage Log]                                │
│                                                                    │
├── STUDY PLAN ────────────────────────────────────────────────────│
│  Plan: 90 Day JEE Prep                                           │
│  Progress: Day 47 / 90  (52% complete)                           │
│  Today: Physics — Electromagnetic Induction                      │
│                                                                    │
└── ACTIONS ───────────────────────────────────────────────────────│
  [Edit Profile]  [Reset Password]  [Suspend Account]              │
  [Reset All Attempts]  [Clear Streak]  [Export Student Data]      │
└────────────────────────────────────────────────────────────────── ┘
```

### 12.3 Student Management Actions

| Action | Description | Confirmation Required |
|---|---|---|
| **Edit Profile** | Name, email, phone, class, target exam | No |
| **Reset Password** | Generate new temp password | No |
| **Assign Pack** | Give pack to student (manual) | No |
| **Revoke Pack** | Remove pack access | Yes |
| **Extend Pack Expiry** | Add days to pack | No |
| **Add AI Points** | Manually add points to balance | No |
| **Deduct AI Points** | Remove points from balance | Yes |
| **Reset Single Test Attempt** | Clear specific test attempt | Yes |
| **Reset All Attempts** | Clear all test history | Yes — Type to confirm |
| **Clear Streak** | Reset daily practice streak | Yes |
| **Suspend Account** | Block login temporarily | Yes |
| **Delete Account** | Permanently delete (soft) | Yes — Type to confirm |
| **Export Student Data** | All data CSV download | No |

---

## 13. Results & Analytics (Per Org)

### 13.1 Org-Level Results Tab

```
┌─── Results — Apex Academy ───────────────────────────────────────┐
│  [Filter: All Tests ▾] [Date Range ▾] [Export ▾]                │
│                                                                    │
│  SUMMARY STATS                                                     │
│  Total Attempts: 8,421    Avg Score: 68%    Completion Rate: 84% │
│  Top Scorer: Rahul Sharma (310/360)   Lowest: 45/360             │
│                                                                    │
│  [📊 Score Distribution — Bell Curve]                             │
│  [📈 Daily Attempts — Last 30 days]                               │
│                                                                    │
│  PER-TEST RESULTS                                                  │
│  Test Name              Attempts  Avg Score  Top Score  Action   │
│  ───────────────────────────────────────────────────────────────  │
│  JEE Full Mock - S3     342       68%        94%        [View]   │
│  Physics Chapter Test   286       72%        100%       [View]   │
│  PYQ 2024 Paper         198       61%        86%        [View]   │
│                                                                    │
│  PER-TEST DETAILED VIEW (click View):                             │
│  Student Name    Score    Time Taken   Rank   Attempt#   Action  │
│  Rahul Sharma    285/360  2h 45m       12     1          [Detail]│
│  Priya Verma     240/360  3h 00m       28     2          [Detail]│
│  [Reset This Attempt] [View Answer Sheet]                        │
└────────────────────────────────────────────────────────────────── ┘
```

### 13.2 Individual Attempt Detail

```
┌─── Attempt Detail — Rahul Sharma — JEE Full Mock S3 ─────────────┐
│  Score: 285/360 (79.2%)   Rank: 12/342   Time: 2h 45m           │
│  Correct: 82   Wrong: 14   Unattempted: 4   Negative: -14        │
│                                                                    │
│  SUBJECT-WISE BREAKDOWN                                           │
│  Physics     28/30 correct   93%   [████████░░]                  │
│  Chemistry   24/30 correct   80%   [████████░░]                  │
│  Maths       30/30 correct   100%  [██████████]                  │
│                                                                    │
│  QUESTION-WISE (scroll)                                           │
│  Q1. ✅ Correct  Time: 45s  Topic: Kinematics                    │
│  Q2. ❌ Wrong    Time: 2m   Topic: Optics   [View Solution]      │
│  Q3. ⭕ Skip     Time: —    Topic: Waves                         │
│  ...                                                              │
│                                                                    │
│  ACTIONS                                                           │
│  [Reset This Attempt]  [Export Answer Sheet PDF]                 │
└────────────────────────────────────────────────────────────────── ┘
```

---

## 14. AI Quota Management

### 14.1 Already Developed (Screenshot mein dikh raha hai)

Tab: **AI Quotas** — Already built:
- Org list with Plan badge, Monthly Limit, Usage progress bar, Reset date
- Bulk Update Plans button
- Search organizations

### 14.2 Additional Actions (To be added)

Per-org actions (3-dot menu):

| Action | Description |
|---|---|
| **Edit AI Limit** | Change monthly question generation limit |
| **Add Bonus Credits** | One-time extra credits (not monthly reset) |
| **Reset Now** | Manually reset quota before scheduled date |
| **View Usage Log** | See how AI credits were spent |
| **Change Plan** | Upgrade/downgrade org's plan |
| **Pause AI Access** | Temporarily disable AI for org |

### 14.3 AI Usage Log (Per Org)

```
┌─── AI Usage Log — Apex Academy ──────────────────────────────────┐
│  Monthly Limit: 500   Used: 342   Remaining: 158                 │
│  Resets On: Mar 15, 2026                                         │
│                                                                    │
│  DATE          USED BY        ACTION              CREDITS USED   │
│  Mar 3, 2026   Admin          Q-Bank AI Generate  50 questions   │
│  Mar 2, 2026   Teacher Priya  Doubt Solver        15 questions   │
│  Mar 1, 2026   Admin          Daily Practice Gen  20 questions   │
│  Feb 28, 2026  Admin          Q-Bank AI Generate  100 questions  │
└────────────────────────────────────────────────────────────────── ┘
```

---

## 15. Taxonomy Management

### 15.1 Global Taxonomy (Already Developed Partially)

Taxonomy = Subject → Chapter → Topic hierarchy (platform-wide)

```
Tab: Taxonomy

SUBJECTS TREE                    ACTIONS
───────────────                  ───────
📚 Physics              [+Chapter] [Edit] [Delete] [Reorder]
   ├── Kinematics        [+Topic]  [Edit] [Delete] [Reorder ↕]
   │   ├── Linear Motion
   │   ├── Projectile Motion
   │   └── Circular Motion
   ├── Optics
   └── Thermodynamics

📚 Chemistry
   ├── Organic Chemistry
   │   ├── Hydrocarbons
   │   └── Alcohols
   └── Physical Chemistry

📚 Mathematics
   └── ...
```

### 15.2 Taxonomy Actions

| Action | Description |
|---|---|
| **Add Subject** | New top-level subject |
| **Add Chapter** | Chapter under subject |
| **Add Topic** | Topic under chapter |
| **Edit** | Rename any node |
| **Delete** | Remove (warns if questions tagged) |
| **Reorder** | Drag & drop sort order |
| **Merge** | Merge two similar chapters |
| **Bulk Import** | CSV se taxonomy import |

---

## 16. Marketplace

### 16.1 Marketplace Tab

Global Question Sets/Packs jo Super Admin ne public kiye hain:

```
┌─── Marketplace ──────────────────────────────────────────────────┐
│  [🔍 Search sets...]  [Filter: Subject ▾] [Sort: Popular ▾]     │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  📋 JEE Physics Complete Set 2026        🌐 Public        │  │
│  │  30 questions · Physics · Kinematics+Optics+Thermo        │  │
│  │  Point Cost: 5 pts   Used by: 28 orgs                     │  │
│  │  [Preview] [Add to Org Q-Bank] [Set Point Cost] [Unpublish]│  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  📋 NEET Biology MCQ Set 2025            🔒 Private       │  │
│  │  50 questions · Biology · All Chapters                    │  │
│  │  Point Cost: 10 pts  Used by: 0 orgs                      │  │
│  │  [Preview] [Make Public] [Edit Point Cost] [Delete]        │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────── ┘
```

---

## 17. In-App Purchase Control

### 17.1 Payment Gateway Settings

```
┌─── In-App Purchase Settings ─────────────────────────────────────┐
│  (Settings → MockBook → Payments)                                 │
│                                                                    │
│  PAYMENT GATEWAY        [● Razorpay  ○ Stripe  ○ PayU]          │
│  API Key                [*********************]  [Edit]          │
│  Webhook Secret         [*********************]  [Edit]          │
│  Test Mode              [○─────] Off (Production)                │
│                                                                    │
│  CURRENCY               [● INR ₹  ○ USD $]                      │
│                                                                    │
│  GST SETTINGS                                                      │
│  Apply GST              [●─────] Yes                             │
│  GST Rate               [18%]                                     │
│  GST Number             [27XXXXX1234X1ZX]                        │
│                                                                    │
│  REFUND POLICY                                                     │
│  Auto Refund            [○─────] Off (Manual only)               │
│  Refund Window          [7] days                                  │
│                                                                    │
│  COMMISSION                                                        │
│  Platform Commission    [20%] of pack sale goes to platform       │
│  Org Revenue Share      [80%] goes to org's account              │
└────────────────────────────────────────────────────────────────── ┘
```

### 17.2 Transaction Log (Per Org)

```
┌─── Transactions — Apex Academy ──────────────────────────────────┐
│  Total Revenue: ₹3,24,500   Platform Cut: ₹64,900   Org: ₹2,59,600│
│                                                                    │
│  DATE       STUDENT      PACK          AMOUNT  TYPE    STATUS    │
│  Mar 3      Rahul S      JEE Gold/M    ₹999    Payment  ✅ Success│
│  Mar 3      Priya V      JEE Gold/Y    ₹8,999  Payment  ✅ Success│
│  Mar 2      Amit K       —             —        Assigned —       │
│  Feb 28     Suresh P     JEE Gold/M    ₹999    Refund   ✅ Done  │
└────────────────────────────────────────────────────────────────── ┘
```

---

## 18. Database Schema

### 18.1 Core Tables

```sql
-- Folders (per org)
CREATE TABLE mockbook_folders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id) NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  visibility    TEXT DEFAULT 'public',  -- public, pack_only
  status        TEXT DEFAULT 'active',  -- active, draft, archived
  display_order INTEGER DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  created_by    UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE mockbook_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id) NOT NULL,
  folder_id     UUID REFERENCES mockbook_folders(id),
  name          TEXT NOT NULL,
  icon          TEXT,
  color         TEXT,
  description   TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Sub-Categories
CREATE TABLE mockbook_subcategories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id) NOT NULL,
  category_id   UUID REFERENCES mockbook_categories(id) NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- MockTests
CREATE TABLE mockbook_tests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID REFERENCES organizations(id) NOT NULL,
  folder_id           UUID REFERENCES mockbook_folders(id),
  category_id         UUID REFERENCES mockbook_categories(id),
  subcategory_id      UUID REFERENCES mockbook_subcategories(id),
  name                TEXT NOT NULL,
  description         TEXT,
  thumbnail_url       TEXT,
  test_type           TEXT NOT NULL,  -- full_mock, chapter, pyq, mini, practice, custom, speed
  instructions        TEXT,
  duration_minutes    INTEGER,
  total_marks         INTEGER,
  pass_marks          INTEGER,
  negative_marking    BOOLEAN DEFAULT false,
  negative_per_wrong  DECIMAL(4,2) DEFAULT 0,
  max_attempts        INTEGER,        -- NULL = unlimited
  shuffle_questions   BOOLEAN DEFAULT true,
  shuffle_options     BOOLEAN DEFAULT true,
  show_result_after   TEXT DEFAULT 'immediate',  -- immediate, deadline, manual
  show_solutions      TEXT DEFAULT 'after_attempt',
  access_type         TEXT DEFAULT 'free',  -- free, pack_only
  status              TEXT DEFAULT 'draft',  -- draft, published, archived
  starts_at           TIMESTAMPTZ,
  ends_at             TIMESTAMPTZ,
  attempt_count       INTEGER DEFAULT 0,
  created_by          UUID,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Test-Set Links (MockTest uses Question Sets)
CREATE TABLE mockbook_test_sets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id    UUID REFERENCES mockbook_tests(id) ON DELETE CASCADE,
  set_id     UUID REFERENCES question_sets(id) NOT NULL,
  set_order  INTEGER DEFAULT 0
);

-- Test-Pack Links
CREATE TABLE mockbook_test_packs (
  test_id UUID REFERENCES mockbook_tests(id) ON DELETE CASCADE,
  pack_id UUID REFERENCES mockbook_packs(id) ON DELETE CASCADE,
  PRIMARY KEY (test_id, pack_id)
);

-- Packs
CREATE TABLE mockbook_packs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID REFERENCES organizations(id) NOT NULL,
  name              TEXT NOT NULL,
  short_description TEXT,
  long_description  TEXT,
  thumbnail_url     TEXT,
  badge             TEXT,
  pack_type         TEXT DEFAULT 'paid',  -- free, paid
  ai_points_monthly INTEGER DEFAULT 0,
  ai_analysis       BOOLEAN DEFAULT true,
  ai_doubt_solver   BOOLEAN DEFAULT false,
  ai_perf_tips      BOOLEAN DEFAULT true,
  daily_practice    BOOLEAN DEFAULT false,
  daily_questions   INTEGER DEFAULT 0,
  purchase_methods  TEXT[] DEFAULT ARRAY['inapp','org_assign','admin_assign'],
  trial_enabled     BOOLEAN DEFAULT false,
  trial_days        INTEGER DEFAULT 0,
  payment_gateway   TEXT DEFAULT 'razorpay',
  status            TEXT DEFAULT 'draft',
  available_from    TIMESTAMPTZ,
  available_until   TIMESTAMPTZ,
  subscriber_count  INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Pack Pricing Plans
CREATE TABLE mockbook_pack_plans (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id        UUID REFERENCES mockbook_packs(id) ON DELETE CASCADE,
  duration_type  TEXT NOT NULL,  -- daily, weekly, monthly, yearly, custom
  duration_days  INTEGER NOT NULL,
  price          DECIMAL(10,2) NOT NULL,
  mrp            DECIMAL(10,2),
  label          TEXT,
  is_popular     BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Pack-Folder Links
CREATE TABLE mockbook_pack_folders (
  pack_id   UUID REFERENCES mockbook_packs(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES mockbook_folders(id) ON DELETE CASCADE,
  PRIMARY KEY (pack_id, folder_id)
);

-- Student Pack Subscriptions
CREATE TABLE mockbook_student_packs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES students(id) NOT NULL,
  pack_id         UUID REFERENCES mockbook_packs(id) NOT NULL,
  plan_id         UUID REFERENCES mockbook_pack_plans(id),
  org_id          UUID REFERENCES organizations(id) NOT NULL,
  assigned_by     TEXT DEFAULT 'self',  -- self, org_admin, super_admin
  assigned_by_id  UUID,
  purchase_method TEXT,  -- inapp, assigned
  amount_paid     DECIMAL(10,2) DEFAULT 0,
  payment_id      TEXT,
  starts_at       TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  is_trial        BOOLEAN DEFAULT false,
  status          TEXT DEFAULT 'active',  -- active, expired, revoked
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Student Test Attempts
CREATE TABLE mockbook_attempts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES students(id) NOT NULL,
  test_id          UUID REFERENCES mockbook_tests(id) NOT NULL,
  org_id           UUID REFERENCES organizations(id) NOT NULL,
  attempt_number   INTEGER DEFAULT 1,
  status           TEXT DEFAULT 'in_progress',  -- in_progress, completed, abandoned
  score            DECIMAL(8,2) DEFAULT 0,
  total_marks      INTEGER,
  percentage       DECIMAL(5,2),
  rank             INTEGER,
  time_taken_sec   INTEGER,
  correct_count    INTEGER DEFAULT 0,
  wrong_count      INTEGER DEFAULT 0,
  skip_count       INTEGER DEFAULT 0,
  answers          JSONB,  -- { q_id: { selected: 'B', time: 45, is_correct: true } }
  started_at       TIMESTAMPTZ DEFAULT NOW(),
  submitted_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Study Plans
CREATE TABLE mockbook_study_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id) NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  total_days    INTEGER NOT NULL,
  difficulty    TEXT DEFAULT 'intermediate',
  assign_type   TEXT DEFAULT 'pack',  -- pack, all, manual
  start_type    TEXT DEFAULT 'student_choice',  -- student_choice, fixed, on_enrollment
  fixed_start   TIMESTAMPTZ,
  status        TEXT DEFAULT 'draft',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Study Plan Days
CREATE TABLE mockbook_study_plan_days (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     UUID REFERENCES mockbook_study_plans(id) ON DELETE CASCADE,
  day_number  INTEGER NOT NULL,
  title       TEXT,
  description TEXT,
  is_rest_day BOOLEAN DEFAULT false
);

-- Study Plan Day Content
CREATE TABLE mockbook_study_plan_content (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id       UUID REFERENCES mockbook_study_plan_days(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,  -- practice_set, mocktest, note, video, revision, assessment
  content_id   UUID,
  title        TEXT,
  duration_min INTEGER,
  display_order INTEGER DEFAULT 0
);

-- Daily Practice Config (per org)
CREATE TABLE mockbook_daily_practice_config (
  org_id            UUID PRIMARY KEY REFERENCES organizations(id),
  is_enabled        BOOLEAN DEFAULT false,
  questions_per_day INTEGER DEFAULT 20,
  difficulty_easy   INTEGER DEFAULT 30,
  difficulty_medium INTEGER DEFAULT 50,
  difficulty_hard   INTEGER DEFAULT 20,
  use_own_qbank     BOOLEAN DEFAULT true,
  use_global_qbank  BOOLEAN DEFAULT true,
  timer_enabled     BOOLEAN DEFAULT false,
  timer_minutes     INTEGER,
  adaptive_mode     BOOLEAN DEFAULT true,
  points_per_correct INTEGER DEFAULT 2,
  streak_bonus      BOOLEAN DEFAULT true,
  notif_enabled     BOOLEAN DEFAULT true,
  notif_time        TIME DEFAULT '08:00:00',
  notif_message     TEXT,
  available_from    TIME DEFAULT '06:00:00',
  expires_at        TIME DEFAULT '23:59:00',
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE mockbook_transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID REFERENCES organizations(id) NOT NULL,
  student_id       UUID REFERENCES students(id) NOT NULL,
  pack_id          UUID REFERENCES mockbook_packs(id),
  plan_id          UUID REFERENCES mockbook_pack_plans(id),
  transaction_type TEXT NOT NULL,  -- payment, refund, assigned
  amount           DECIMAL(10,2) DEFAULT 0,
  platform_cut     DECIMAL(10,2) DEFAULT 0,
  org_revenue      DECIMAL(10,2) DEFAULT 0,
  payment_id       TEXT,
  gateway          TEXT,
  status           TEXT DEFAULT 'success',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Org Switcher — Recent Access Log
CREATE TABLE admin_org_access_log (
  admin_id    UUID NOT NULL,
  org_id      UUID REFERENCES organizations(id),
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (admin_id, org_id)
);
```

### 18.2 Key Indexes

```sql
CREATE INDEX idx_mockbook_tests_org ON mockbook_tests(org_id, status);
CREATE INDEX idx_mockbook_attempts_student ON mockbook_attempts(student_id, test_id);
CREATE INDEX idx_mockbook_attempts_test ON mockbook_attempts(test_id, submitted_at DESC);
CREATE INDEX idx_student_packs_student ON mockbook_student_packs(student_id, status);
CREATE INDEX idx_student_packs_org ON mockbook_student_packs(org_id, status);
CREATE INDEX idx_transactions_org ON mockbook_transactions(org_id, created_at DESC);
CREATE INDEX idx_folders_org ON mockbook_folders(org_id, status);
```

---

## 19. API Endpoints

### 19.1 Global MockBook APIs

```
GET  /api/v1/admin/mockbook/stats              → Global stats (4 cards)
GET  /api/v1/admin/mockbook/overview           → Top orgs, alerts
GET  /api/v1/admin/mockbook/ai-quotas          → All org AI quotas list
PUT  /api/v1/admin/mockbook/ai-quotas/bulk     → Bulk update plans
PUT  /api/v1/admin/mockbook/ai-quotas/:orgId   → Update single org quota
POST /api/v1/admin/mockbook/ai-quotas/:orgId/reset → Manual reset
GET  /api/v1/admin/mockbook/ai-quotas/:orgId/log  → Usage log
GET  /api/v1/admin/mockbook/taxonomy           → Global taxonomy tree
POST /api/v1/admin/mockbook/taxonomy/subjects  → Create subject
PUT  /api/v1/admin/mockbook/taxonomy/subjects/:id → Update
DELETE /api/v1/admin/mockbook/taxonomy/subjects/:id → Delete
GET  /api/v1/admin/mockbook/marketplace        → All sets (public+private)
PUT  /api/v1/admin/mockbook/marketplace/:id    → Update visibility/price
GET  /api/v1/admin/mockbook/results            → Platform-wide results
```

### 19.2 Org Switcher

```
GET  /api/v1/admin/mockbook/orgs               → All orgs list (for switcher)
GET  /api/v1/admin/mockbook/orgs/recent        → Recently accessed orgs
POST /api/v1/admin/mockbook/orgs/:orgId/switch → Log org access
```

### 19.3 Org-Specific APIs

```
FOLDERS
GET    /api/v1/admin/mockbook/:orgId/folders
POST   /api/v1/admin/mockbook/:orgId/folders
GET    /api/v1/admin/mockbook/:orgId/folders/:id
PUT    /api/v1/admin/mockbook/:orgId/folders/:id
DELETE /api/v1/admin/mockbook/:orgId/folders/:id
POST   /api/v1/admin/mockbook/:orgId/folders/:id/duplicate
PUT    /api/v1/admin/mockbook/:orgId/folders/reorder

CATEGORIES
GET    /api/v1/admin/mockbook/:orgId/categories
POST   /api/v1/admin/mockbook/:orgId/categories
PUT    /api/v1/admin/mockbook/:orgId/categories/:id
DELETE /api/v1/admin/mockbook/:orgId/categories/:id
PUT    /api/v1/admin/mockbook/:orgId/categories/reorder

SUB-CATEGORIES
GET    /api/v1/admin/mockbook/:orgId/subcategories
POST   /api/v1/admin/mockbook/:orgId/subcategories
PUT    /api/v1/admin/mockbook/:orgId/subcategories/:id
DELETE /api/v1/admin/mockbook/:orgId/subcategories/:id

MOCKTESTS
GET    /api/v1/admin/mockbook/:orgId/tests
POST   /api/v1/admin/mockbook/:orgId/tests
GET    /api/v1/admin/mockbook/:orgId/tests/:id
PUT    /api/v1/admin/mockbook/:orgId/tests/:id
DELETE /api/v1/admin/mockbook/:orgId/tests/:id
POST   /api/v1/admin/mockbook/:orgId/tests/:id/publish
POST   /api/v1/admin/mockbook/:orgId/tests/:id/unpublish
POST   /api/v1/admin/mockbook/:orgId/tests/:id/duplicate
POST   /api/v1/admin/mockbook/:orgId/tests/:id/reset-all-attempts
GET    /api/v1/admin/mockbook/:orgId/tests/:id/results
GET    /api/v1/admin/mockbook/:orgId/tests/:id/export

PACKS
GET    /api/v1/admin/mockbook/:orgId/packs
POST   /api/v1/admin/mockbook/:orgId/packs
GET    /api/v1/admin/mockbook/:orgId/packs/:id
PUT    /api/v1/admin/mockbook/:orgId/packs/:id
DELETE /api/v1/admin/mockbook/:orgId/packs/:id
GET    /api/v1/admin/mockbook/:orgId/packs/:id/subscribers
POST   /api/v1/admin/mockbook/:orgId/packs/:id/assign
DELETE /api/v1/admin/mockbook/:orgId/packs/:id/revoke/:studentId
PUT    /api/v1/admin/mockbook/:orgId/packs/:id/extend/:studentId

STUDY PLANS
GET    /api/v1/admin/mockbook/:orgId/study-plans
POST   /api/v1/admin/mockbook/:orgId/study-plans
PUT    /api/v1/admin/mockbook/:orgId/study-plans/:id
DELETE /api/v1/admin/mockbook/:orgId/study-plans/:id

DAILY PRACTICE
GET    /api/v1/admin/mockbook/:orgId/daily-practice/config
PUT    /api/v1/admin/mockbook/:orgId/daily-practice/config

STUDENTS
GET    /api/v1/admin/mockbook/:orgId/students
GET    /api/v1/admin/mockbook/:orgId/students/:id
PUT    /api/v1/admin/mockbook/:orgId/students/:id
POST   /api/v1/admin/mockbook/:orgId/students/:id/reset-password
POST   /api/v1/admin/mockbook/:orgId/students/:id/reset-attempts
POST   /api/v1/admin/mockbook/:orgId/students/:id/add-points
POST   /api/v1/admin/mockbook/:orgId/students/:id/suspend
DELETE /api/v1/admin/mockbook/:orgId/students/:id
GET    /api/v1/admin/mockbook/:orgId/students/:id/results
GET    /api/v1/admin/mockbook/:orgId/students/:id/packs

RESULTS
GET    /api/v1/admin/mockbook/:orgId/results                → All results
GET    /api/v1/admin/mockbook/:orgId/results/:attemptId     → Attempt detail
DELETE /api/v1/admin/mockbook/:orgId/results/:attemptId     → Reset attempt
GET    /api/v1/admin/mockbook/:orgId/results/export         → CSV

TRANSACTIONS
GET    /api/v1/admin/mockbook/:orgId/transactions
GET    /api/v1/admin/mockbook/:orgId/transactions/revenue
```

---

## 20. UI Screens Specification

### 20.1 MockBook Main Page (Global)

Already developed hai (screenshot ke according) — Org Switcher add karna hai.

```
┌─── MockBook ─────────────────────────────────────────────────────┐
│  Global oversight, AI quotas, and taxonomy management            │
│                                              [View Results]       │
│                                                                    │
│  [🏢 Select Organization to Manage ▾]       ← NEW FEATURE       │
│                                                                    │
│  [Total Exams: 1,247] [AI Credits: 8,421]                        │
│  [Active Orgs: 48]    [Tests This Month: 34,291]                 │
│                                                                    │
│  [Overview] [AI Quotas] [Taxonomy] [Marketplace] [Results]       │
└────────────────────────────────────────────────────────────────── ┘
```

### 20.2 MockBook Org Mode Page

```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Managing: Apex Academy (GK-ORG-00142)   [Switch Org] [✕ Exit]│ ← Orange banner
├──────────────────────────────────────────────────────────────────┤
│  MockBook — Apex Academy                     [View Results]       │
│                                                                    │
│  [Total Tests: 48] [Students: 1,247] [Packs: 3] [Revenue: ₹3.2L]│
│                                                                    │
│  [Overview][Folders][MockTests][Packs][Study Plans][Daily][Students][Results]│
└────────────────────────────────────────────────────────────────── ┘
```

### 20.3 Folders Tab

```
┌─── Folders — Apex Academy ───────────────────────────────────────┐
│  [+ Create Folder]                                                │
│                                                                    │
│  FOLDER STRUCTURE (Tree view / Card view toggle)                  │
│                                                                    │
│  📁 JEE 2026 Complete Prep         🟢 Active   234 students     │
│     3 Categories · 12 Sub-categories · 48 Tests                  │
│     [Edit] [+ Category] [Duplicate] [Archive] [Delete]           │
│     │                                                             │
│     ├── 📂 Physics                 8 Sub-cats · 18 Tests         │
│     │   [Edit] [+ Sub-Cat] [Delete]                              │
│     │   ├── 📂 Kinematics          5 Tests [Edit][Delete]        │
│     │   ├── 📂 Optics              4 Tests [Edit][Delete]        │
│     │   └── 📂 Thermodynamics      9 Tests [Edit][Delete]        │
│     │                                                             │
│     ├── 📂 Chemistry               10 Tests                      │
│     └── 📂 Mathematics             20 Tests                      │
│                                                                    │
│  📁 PYQ Series 2015-2024           🟢 Active   189 students     │
│     1 Category · 10 Tests                                        │
│     [Edit] [+ Category] [Duplicate] [Archive] [Delete]           │
└────────────────────────────────────────────────────────────────── ┘
```

### 20.4 MockTests Tab

Already specified in Section 8.3

### 20.5 Packs Tab

```
┌─── Packs — Apex Academy ─────────────────────────────────────────┐
│  [+ Create Pack]  [Revenue Report]                                │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  🏆 JEE Gold Pack                          🟢 Active        ││
│  │  Monthly: ₹999  |  Yearly: ₹8,999                           ││
│  │  Subscribers: 342  |  Revenue: ₹2,14,500   AI: 500pts/mo   ││
│  │  Includes: JEE 2026 Folder + PYQ Series + Study Plan        ││
│  │  [Edit] [View Subscribers] [Pause] [Duplicate] [Archive]    ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  💎 JEE Platinum Pack                      🟢 Active        ││
│  │  Monthly: ₹1,999  |  Yearly: ₹15,999                        ││
│  │  Subscribers: 87   |  Revenue: ₹89,200    AI: 1000pts/mo   ││
│  │  [Edit] [View Subscribers] [Pause] [Duplicate] [Archive]    ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  🆓 Free Starter Pack                      🟢 Active        ││
│  │  Free Forever                                                ││
│  │  Subscribers: 818  |  Revenue: —           AI: 50pts/mo    ││
│  │  [Edit] [View Subscribers] [Archive]                         ││
│  └──────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────── ┘
```

---

## 21. Business Rules & Edge Cases

### 21.1 MockTest Rules

| Scenario | Rule |
|---|---|
| Edit test after attempts | Title/description edit allowed. Questions/marks change blocked. Show warning. |
| Delete test with attempts | Soft delete. Attempts archived. Students see "Test Removed". |
| Set ID/Password wrong | Verification API call. If wrong → error shown, cannot save. |
| Test without end date | Available forever until manually unpublished. |
| Multiple sets in one test | Questions combined, marks summed. Order as added. |
| Student mid-test when unpublished | Current attempt saved. Cannot retake. |

### 21.2 Pack Rules

| Scenario | Rule |
|---|---|
| Pack price change | Existing subscribers unaffected. New purchases at new price. |
| Pack deleted with subscribers | Cannot delete. Must archive. Subscribers keep access till expiry. |
| Multiple packs same student | Allowed. Access = union of all packs. |
| Pack expired but test in progress | Test can be completed. No new tests after expiry. |
| Trial → Paid upgrade | Days remaining from trial not added to paid plan. Fresh start. |
| Free pack + Paid pack | Student has both. Both packs' content accessible. |
| Org admin assigns pack | Pack added with manual expiry date set by admin. |

### 21.3 Student Rules

| Scenario | Rule |
|---|---|
| Reset all attempts | Irreversible. All test history cleared. Rank recalculated. |
| Suspend student | Login blocked. Data preserved. Packs paused (not cancelled). |
| Delete student | Soft delete. Anonymize data. Packs cancelled. No refund auto. |
| Student org transfer | Not supported in V1. |

### 21.4 Org Switcher Rules

| Scenario | Rule |
|---|---|
| Org not found | Error: "Organization not found or inactive". |
| Unsaved changes on switch | Warning: "You have unsaved changes. Leave?" |
| Session timeout in org mode | Redirect to login. Last org remembered. |
| Concurrent editing | Last save wins. No conflict detection in V1. |

### 21.5 Daily Practice Rules

| Scenario | Rule |
|---|---|
| No questions available | Skip day. Log warning. Admin notified. |
| Student completes in 5 min | Accepted. Streak counted. |
| Student skips a day | Streak resets to 0. Bonus lost. |
| Questions repeat | Same question not shown within 7 days. |
| Config changed mid-month | New config applies from next day. |

---

## 22. Development Phases

### Phase 1 — Org Switcher + Basic Structure (Week 1-2)

- Org Switcher UI + API
- Org context banner
- Folder CRUD
- Category + Sub-Category CRUD
- Basic org-mode navigation tabs

**Deliverable:** Super Admin can switch to any org and manage folder structure

---

### Phase 2 — MockTest Management (Week 3-4)

- MockTest create/edit/delete with Set ID+Password linking
- MockTest publish/schedule/unpublish
- MockTest list with filters
- Test-Pack linking
- Results view per test

**Deliverable:** Full MockTest management per org

---

### Phase 3 — Pack System (Week 5-6)

- Pack create with multiple pricing plans
- Pack-folder/test linking
- Student pack assignment (manual by admin)
- Pack subscriber list
- Extend/revoke pack
- Transaction log

**Deliverable:** Complete Pack system (without payment gateway)

---

### Phase 4 — In-App Purchase (Week 7)

- Razorpay integration
- Payment webhook handling
- Auto-pack activation on payment
- Refund flow
- Revenue dashboard

**Deliverable:** Students can buy packs directly

---

### Phase 5 — Study Plans + Daily Practice (Week 8-9)

- Study Plan builder (day-wise)
- Study Plan assign to packs
- Daily Practice configuration
- Daily question generation (Lambda cron)
- Streak system

**Deliverable:** Full learning journey features

---

### Phase 6 — Student Management (Week 10)

- Student list per org
- Student detail page
- All student actions (edit, reset, assign, suspend)
- AI points management per student
- Student results with attempt detail

**Deliverable:** Complete student management from Super Admin

---

### Phase 7 — Analytics + Polish (Week 11-12)

- Org-level results analytics
- Revenue reporting
- AI quota usage logs
- Export features (CSV)
- Performance optimization
- Edge case handling

**Deliverable:** Production-ready MockBook module

---

*Document End*

---

**EduHub / GyaanKendra — MockBook Module Complete PRD**
Version 1.0 | March 2026 | Confidential — Internal Use Only
