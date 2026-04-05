# EduHub — Super Admin Panel
## Whiteboard Management Module
### Full Stack Development PRD

**Document ID:** EH-SA-WB-PRD-002
**Version:** 2.0 — Complete Rewrite
**Date:** March 2026
**Status:** Final — Ready for Development
**Classification:** Confidential — Internal Use Only
**Prepared For:** Full Stack Development Team / AI IDE (Cursor / Windsurf)

**Related Documents:**
- `EH-SA-FE-PRD-001` — Super Admin Frontend Design PRD (design system source of truth)
- `EH-SA-FS-PRD-001` — Super Admin Fullstack AWS PRD (tech stack + architecture)
- `EH-WB-PRD-001` — Whiteboard App PRD (the app being managed)

---

## Table of Contents

1. [Module Overview & Context](#1-module-overview--context)
2. [Design System Reference](#2-design-system-reference)
3. [Navigation & Route Map](#3-navigation--route-map)
4. [Database Schema](#4-database-schema)
5. [TypeScript Interfaces](#5-typescript-interfaces)
6. [API Endpoints — Complete Reference](#6-api-endpoints--complete-reference)
7. [Page: Overview Dashboard `/whiteboard`](#7-page-overview-dashboard-whiteboard)
8. [Page: Accounts List `/whiteboard/accounts`](#8-page-accounts-list-whiteboardaccounts)
9. [Page: Create Account `/whiteboard/accounts/new`](#9-page-create-account-whiteboardaccountsnew)
10. [Page: Account Detail `/whiteboard/accounts/[id]`](#10-page-account-detail-whiteboardaccountsid)
11. [Page: Org Access `/whiteboard/org-access`](#11-page-org-access-whiteboardorg-access)
12. [Page: AI Quotas `/whiteboard/ai-quotas`](#12-page-ai-quotas-whiteboardai-quotas)
13. [Page: Sessions `/whiteboard/sessions`](#13-page-sessions-whiteboardsessions)
14. [Page: Notes `/whiteboard/notes`](#14-page-notes-whiteboardnotes)
15. [Page: Analytics `/whiteboard/analytics`](#15-page-analytics-whiteboardanalytics)
16. [Page: Settings `/whiteboard/settings`](#16-page-settings-whiteboardsettings)
17. [Shared Components — Whiteboard Module](#17-shared-components--whiteboard-module)
18. [Page Flows & User Journeys](#18-page-flows--user-journeys)
19. [Business Rules & Validation](#19-business-rules--validation)
20. [Error States & Edge Cases](#20-error-states--edge-cases)
21. [Backend Service Layer](#21-backend-service-layer)
22. [AI IDE Developer Prompt](#22-ai-ide-developer-prompt)

---

# 1. Module Overview & Context

## 1.1 Platform Architecture Context

EduHub Super Admin Panel ka yeh module — **Whiteboard Management** — platform ke whiteboard ecosystem ka complete control centre hai. Yahan se:

```
WHITEBOARD ECOSYSTEM
══════════════════════════════════════════════════════

  Super Admin Panel                  Whiteboard App
  ─────────────────                  ───────────────
  Creates IDs         ────────────>  Teacher logs in
  Sets AI quota       ────────────>  AI calls limited
  Monitors sessions   <────────────  Sessions reported
  Views notes         <────────────  Notes auto-saved
  Org access toggle   ────────────>  Org accounts ON/OFF

══════════════════════════════════════════════════════
```

## 1.2 Two Account Types — Critical Distinction

Yeh module do **completely alag** types ke whiteboard accounts manage karta hai:

| | **Standalone Account** | **Org-Based Account** |
|---|---|---|
| **Kaun banata hai** | Super Admin directly | Org Admin (apne panel se) |
| **Org link** | Koi org nahi | EduHub org se linked |
| **Manage karta hai** | Only Super Admin | Org Admin + Super Admin oversight |
| **QBank access** | No | Yes (org ka shared QBank) |
| **Whiteboard toggle** | N/A (always standalone) | Org-level ON/OFF affects these |
| **Visible kahan** | Only in Super Admin | Super Admin + Org Admin panel |

## 1.3 Module Position in Sidebar

Existing Super Admin sidebar mein yeh module Digital Board ke **baad** aur Student App ke **pehle** aata hai:

```
Super Admin Sidebar (Dark Blue #1E3A5F)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏠  Dashboard
  🏢  Organizations
  📚  Question Bank
  📋  MockBook
  📟  Digital Board
  🖥️  Whiteboard         ← THIS MODULE
       ├─ Overview
       ├─ Accounts
       ├─ Org Access
       ├─ AI Quotas
       ├─ Sessions
       ├─ Notes
       ├─ Analytics
       └─ Settings
  📱  Student App
  💳  Billing
  ⚙️  Settings & Audit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

# 2. Design System Reference

> **CRITICAL:** Is module mein `EH-SA-FE-PRD-001` ka design system EXACTLY follow karna hai. Koi bhi naya pattern introduce mat karo.

## 2.1 Colors (from EH-SA-FE-PRD-001)

```css
/* Brand */
--brand-primary:      #F4511E;   /* CTA buttons, active states */
--brand-primary-hover:#E64A19;
--brand-primary-tint: #FFF3EE;
--brand-dark:         #1E3A5F;   /* Sidebar, headers */
--brand-dark-deep:    #162C47;   /* Active sidebar item bg */

/* Neutral */
--neutral-bg:         #F9FAFB;   /* Page background */
--neutral-card:       #FFFFFF;
--neutral-border:     #E5E7EB;
--text-primary:       #111827;
--text-secondary:     #6B7280;

/* Status */
--status-success:     #16A34A;
--status-warning:     #F59E0B;
--status-danger:      #DC2626;
--status-info:        #2563EB;

/* Status Background Tints */
--success-tint:       #DCFCE7;
--warning-tint:       #FEF3C7;
--danger-tint:        #FEE2E2;
--info-tint:          #DBEAFE;
```

## 2.2 Typography (from EH-SA-FE-PRD-001)

```
Font: Inter, system-ui, sans-serif

Page Title:    36px / 700 / #111827
Section Head:  22px / 600 / #111827
Table Header:  12px / 500 / #6B7280 / UPPERCASE / letter-spacing: 0.05em
Table Cell:    14px / 400 / #111827
Badge text:    12px / 500
Mono (IDs):    14px / 400 / Courier New, monospace
Button:        16px / 600
Caption:       12px / 400 / #6B7280
```

## 2.3 Component Rules (from EH-SA-FE-PRD-001)

```
Card:          bg white, border 1px #E5E7EB, radius 12px, padding 24px
Table row:     height 52px, hover bg #F9FAFB
Button (CTA):  bg #F4511E, text white, radius 10px, height 40px, px 16px
Button (ghost):border 1px #E5E7EB, bg white, text #374151, radius 10px
Toggle:        44×24px, ON=#F4511E, OFF=#E5E7EB, knob 20px white
Modal:         max-w 560px, radius 12px, overlay rgba(0,0,0,0.4)
Slide-over:    width 600px, from right, 250ms ease
Toast:         bottom-right, left-border 4px, max-w 380px
```

---

# 3. Navigation & Route Map

```
/whiteboard                          Overview dashboard
/whiteboard/accounts                 Accounts list (standalone + org-based)
/whiteboard/accounts/new             Create new standalone account
/whiteboard/accounts/[id]            Account detail + tabs
/whiteboard/accounts/[id]/edit       Edit account info
/whiteboard/org-access               Org-level whiteboard toggle table
/whiteboard/org-access/[orgId]       Single org whiteboard settings slide-over
/whiteboard/ai-quotas                AI quota management table
/whiteboard/sessions                 Live + recent sessions monitor
/whiteboard/notes                    All notes across all accounts
/whiteboard/analytics                Charts, reports, exports
/whiteboard/settings                 Global configuration
```

---

# 4. Database Schema

> **Convention:** Existing EduHub schema style follow karo — UUID primary keys, snake_case, TIMESTAMPTZ, soft deletes.

## 4.1 `whiteboard_accounts`

```sql
CREATE TABLE whiteboard_accounts (
  -- Identity
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whiteboard_id         CHAR(6) UNIQUE NOT NULL,
    -- 6-digit numeric string, globally unique
    -- References same pool as question_sets.set_code, ebook IDs etc.
    -- Range: '100000'–'999999'
  password_hash         TEXT NOT NULL,
    -- bcrypt, rounds=12

  -- Display Info
  display_name          VARCHAR(255) NOT NULL,
    -- e.g. "DPS Rohini — Room 4"
  description           TEXT,
  institution_name      VARCHAR(255),
  city                  VARCHAR(100),
  state                 VARCHAR(100),
  contact_person        VARCHAR(255),
  contact_email         VARCHAR(255),
  contact_phone         VARCHAR(20),

  -- Account Type
  account_type          VARCHAR(20) NOT NULL DEFAULT 'standalone',
    -- CHECK: 'standalone' | 'org_based'
  org_id                UUID REFERENCES organizations(id) ON DELETE SET NULL,
    -- NULL for standalone accounts

  -- Status
  status                VARCHAR(20) NOT NULL DEFAULT 'active',
    -- CHECK: 'active' | 'suspended' | 'deleted'
  suspended_at          TIMESTAMPTZ,
  suspended_by          UUID REFERENCES users(id),
  suspended_reason      TEXT,
  deleted_at            TIMESTAMPTZ,   -- soft delete

  -- Feature Flags (override org-level if needed)
  feat_set_fetch        BOOLEAN NOT NULL DEFAULT TRUE,
  feat_ai               BOOLEAN NOT NULL DEFAULT TRUE,
  feat_cloud_notes      BOOLEAN NOT NULL DEFAULT TRUE,
  feat_collab_view      BOOLEAN NOT NULL DEFAULT TRUE,
  feat_org_qbank        BOOLEAN NOT NULL DEFAULT FALSE,
    -- Only meaningful for org_based accounts

  -- AI Quota
  ai_quota_monthly      INTEGER NOT NULL DEFAULT 100,
  ai_quota_used         INTEGER NOT NULL DEFAULT 0,
  ai_quota_reset_date   DATE NOT NULL DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),

  -- Security
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until          TIMESTAMPTZ,
  last_login_at         TIMESTAMPTZ,
  last_login_ip         INET,
  last_login_device     VARCHAR(20),
    -- 'windows' | 'android' | 'ios' | 'web'

  -- Metadata
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wb_accounts_whiteboard_id  ON whiteboard_accounts(whiteboard_id);
CREATE INDEX idx_wb_accounts_org_id         ON whiteboard_accounts(org_id);
CREATE INDEX idx_wb_accounts_status         ON whiteboard_accounts(status);
CREATE INDEX idx_wb_accounts_account_type   ON whiteboard_accounts(account_type);
CREATE INDEX idx_wb_accounts_created_at     ON whiteboard_accounts(created_at DESC);
```

## 4.2 `whiteboard_sessions`

```sql
CREATE TABLE whiteboard_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES whiteboard_accounts(id) ON DELETE CASCADE,

  -- Session Info
  collab_code       CHAR(6),
    -- 6-digit code generated when teacher starts sharing
    -- NULL if no collaborative view started
  device_type       VARCHAR(20),
    -- 'windows' | 'android' | 'ios' | 'web'

  -- Activity
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  duration_seconds  INTEGER,
    -- computed on end: ended_at - started_at

  -- What was used
  set_ids_used      TEXT[] DEFAULT '{}',
    -- Array of 6-digit set IDs loaded during session
  ai_calls_count    INTEGER NOT NULL DEFAULT 0,
  pages_created     INTEGER NOT NULL DEFAULT 0,
  notes_saved       INTEGER NOT NULL DEFAULT 0,

  -- Collaborative View
  max_students_connected INTEGER NOT NULL DEFAULT 0,

  -- Status
  is_live           BOOLEAN NOT NULL DEFAULT TRUE,
  ended_by          VARCHAR(20),
    -- 'teacher' | 'admin_forced' | 'timeout' | 'system'
  forced_end_by     UUID REFERENCES users(id),
    -- Super Admin who force-ended (if ended_by = 'admin_forced')

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wb_sessions_account_id   ON whiteboard_sessions(account_id);
CREATE INDEX idx_wb_sessions_is_live      ON whiteboard_sessions(is_live) WHERE is_live = TRUE;
CREATE INDEX idx_wb_sessions_started_at   ON whiteboard_sessions(started_at DESC);
```

## 4.3 `whiteboard_notes`

```sql
CREATE TABLE whiteboard_notes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES whiteboard_accounts(id) ON DELETE CASCADE,
  session_id        UUID REFERENCES whiteboard_sessions(id) ON DELETE SET NULL,

  -- Content
  title             VARCHAR(255) NOT NULL DEFAULT 'Untitled',
  subject           VARCHAR(100),
  chapter           VARCHAR(100),
  set_id_linked     CHAR(6),
    -- The primary Set ID used during this note's session

  -- Storage
  canvas_s3_key     TEXT,
    -- S3 path: whiteboard-notes/{account_id}/{note_id}/canvas.json
  thumbnail_s3_key  TEXT,
    -- S3 path: whiteboard-notes/{account_id}/{note_id}/thumb.png
  size_bytes        BIGINT NOT NULL DEFAULT 0,
  page_count        INTEGER NOT NULL DEFAULT 1,

  -- Session Meta
  duration_seconds  INTEGER NOT NULL DEFAULT 0,

  -- Sharing
  share_token       VARCHAR(64) UNIQUE,
  share_expires_at  TIMESTAMPTZ,
  share_views       INTEGER NOT NULL DEFAULT 0,

  -- Soft Delete
  is_deleted        BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at        TIMESTAMPTZ,
  deleted_by        VARCHAR(20) DEFAULT 'user',
    -- 'user' | 'admin' | 'system'

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wb_notes_account_id      ON whiteboard_notes(account_id);
CREATE INDEX idx_wb_notes_is_deleted      ON whiteboard_notes(is_deleted);
CREATE INDEX idx_wb_notes_created_at      ON whiteboard_notes(created_at DESC);
CREATE INDEX idx_wb_notes_share_token     ON whiteboard_notes(share_token) WHERE share_token IS NOT NULL;
```

## 4.4 `whiteboard_ai_logs`

```sql
CREATE TABLE whiteboard_ai_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES whiteboard_accounts(id) ON DELETE CASCADE,
  session_id        UUID REFERENCES whiteboard_sessions(id) ON DELETE SET NULL,

  action_type       VARCHAR(30) NOT NULL,
    -- 'explain' | 'solve' | 'examples' | 'summarize' | 'ocr' | 'generate_questions' | 'custom'
  prompt_tokens     INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens      INTEGER NOT NULL DEFAULT 0,
  model_used        VARCHAR(50),
    -- e.g. 'gpt-4o', 'claude-3-5-sonnet'
  response_ms       INTEGER,
    -- API latency in milliseconds
  was_cached        BOOLEAN NOT NULL DEFAULT FALSE,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wb_ai_logs_account_id    ON whiteboard_ai_logs(account_id);
CREATE INDEX idx_wb_ai_logs_created_at    ON whiteboard_ai_logs(created_at DESC);
CREATE INDEX idx_wb_ai_logs_action_type   ON whiteboard_ai_logs(action_type);
```

## 4.5 `org_whiteboard_config`

```sql
CREATE TABLE org_whiteboard_config (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Master toggle
  is_enabled            BOOLEAN NOT NULL DEFAULT FALSE,
  enabled_at            TIMESTAMPTZ,
  disabled_at           TIMESTAMPTZ,
  toggled_by            UUID REFERENCES users(id),

  -- Feature defaults for all accounts under this org
  feat_set_fetch        BOOLEAN NOT NULL DEFAULT TRUE,
  feat_ai               BOOLEAN NOT NULL DEFAULT TRUE,
  feat_cloud_notes      BOOLEAN NOT NULL DEFAULT TRUE,
  feat_collab_view      BOOLEAN NOT NULL DEFAULT TRUE,
  feat_org_qbank        BOOLEAN NOT NULL DEFAULT TRUE,

  -- Limits
  ai_quota_per_account  INTEGER NOT NULL DEFAULT 100,
    -- Each org account gets this monthly AI quota
  max_accounts          INTEGER,
    -- NULL = unlimited
  max_pages_per_note    INTEGER NOT NULL DEFAULT 100,

  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_wb_config_org_id     ON org_whiteboard_config(org_id);
CREATE INDEX idx_org_wb_config_enabled    ON org_whiteboard_config(is_enabled);
```

## 4.6 `whiteboard_activity_log`

```sql
CREATE TABLE whiteboard_activity_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID REFERENCES whiteboard_accounts(id) ON DELETE SET NULL,
  org_id          UUID REFERENCES organizations(id) ON DELETE SET NULL,

  actor_type      VARCHAR(20) NOT NULL,
    -- 'super_admin' | 'org_admin' | 'account' | 'system'
  actor_id        UUID,
    -- UUID of super admin user / org admin user / whiteboard account

  action          VARCHAR(100) NOT NULL,
    -- See action constants below
  metadata        JSONB NOT NULL DEFAULT '{}',
    -- Varies per action — see Section 4.7

  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wb_activity_account_id   ON whiteboard_activity_log(account_id);
CREATE INDEX idx_wb_activity_org_id       ON whiteboard_activity_log(org_id);
CREATE INDEX idx_wb_activity_created_at   ON whiteboard_activity_log(created_at DESC);
CREATE INDEX idx_wb_activity_action       ON whiteboard_activity_log(action);
```

## 4.7 Activity Action Constants

```typescript
// All possible action values for whiteboard_activity_log.action
export const WB_ACTIONS = {
  // Account lifecycle
  ACCOUNT_CREATED:          'account.created',
  ACCOUNT_UPDATED:          'account.updated',
  ACCOUNT_SUSPENDED:        'account.suspended',
  ACCOUNT_UNSUSPENDED:      'account.unsuspended',
  ACCOUNT_DELETED:          'account.deleted',
  ACCOUNT_PASSWORD_RESET:   'account.password_reset',
  ACCOUNT_FEATURES_CHANGED: 'account.features_changed',
  ACCOUNT_QUOTA_CHANGED:    'account.quota_changed',

  // Auth
  LOGIN_SUCCESS:            'auth.login_success',
  LOGIN_FAILED:             'auth.login_failed',
  ACCOUNT_LOCKED:           'auth.account_locked',

  // Session
  SESSION_STARTED:          'session.started',
  SESSION_ENDED:            'session.ended',
  SESSION_FORCE_ENDED:      'session.force_ended',

  // Notes
  NOTE_CREATED:             'note.created',
  NOTE_DELETED:             'note.deleted',
  NOTE_EXPORTED:            'note.exported',
  NOTE_SHARED:              'note.shared',

  // AI
  AI_QUOTA_RESET:           'ai.quota_reset',
  AI_QUOTA_UPDATED:         'ai.quota_updated',

  // Org
  ORG_WB_ENABLED:           'org.whiteboard_enabled',
  ORG_WB_DISABLED:          'org.whiteboard_disabled',
  ORG_WB_CONFIG_UPDATED:    'org.whiteboard_config_updated',
} as const;
```

---

# 5. TypeScript Interfaces

```typescript
// ── Whiteboard Account ────────────────────────────────
export interface WhiteboardAccount {
  id: string;
  whiteboard_id: string;          // 6-digit string
  display_name: string;
  description: string | null;
  institution_name: string | null;
  city: string | null;
  state: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  account_type: 'standalone' | 'org_based';
  org_id: string | null;
  org_name?: string;              // joined from organizations
  status: 'active' | 'suspended' | 'deleted';
  suspended_at: string | null;
  suspended_reason: string | null;
  features: {
    set_fetch: boolean;
    ai: boolean;
    cloud_notes: boolean;
    collab_view: boolean;
    org_qbank: boolean;
  };
  ai_quota: {
    monthly: number;
    used: number;
    remaining: number;
    reset_date: string;           // ISO date
    percentage: number;           // 0–100
  };
  security: {
    failed_attempts: number;
    locked_until: string | null;
    last_login_at: string | null;
    last_login_device: 'windows' | 'android' | 'ios' | 'web' | null;
  };
  stats?: {
    total_sessions: number;
    total_notes: number;
    total_pages: number;
  };
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Create Account Payload ────────────────────────────
export interface CreateWhiteboardAccountPayload {
  display_name: string;
  description?: string;
  institution_name?: string;
  city?: string;
  state?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  whiteboard_id?: string;         // Optional: auto-generated if omitted
  password?: string;              // Optional: auto-generated if omitted
  features: {
    set_fetch: boolean;
    ai: boolean;
    cloud_notes: boolean;
    collab_view: boolean;
  };
  ai_quota_monthly: number;
  notify_email: boolean;
  notify_whatsapp: boolean;
}

// ── Session ───────────────────────────────────────────
export interface WhiteboardSession {
  id: string;
  account_id: string;
  account_name?: string;          // joined
  org_name?: string;              // joined
  collab_code: string | null;
  device_type: 'windows' | 'android' | 'ios' | 'web' | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  set_ids_used: string[];
  ai_calls_count: number;
  pages_created: number;
  notes_saved: number;
  max_students_connected: number;
  is_live: boolean;
  ended_by: string | null;
}

// ── Note ──────────────────────────────────────────────
export interface WhiteboardNote {
  id: string;
  account_id: string;
  account_name?: string;
  org_name?: string;
  session_id: string | null;
  title: string;
  subject: string | null;
  set_id_linked: string | null;
  thumbnail_url: string | null;   // signed S3 URL
  size_bytes: number;
  page_count: number;
  duration_seconds: number;
  share_token: string | null;
  share_expires_at: string | null;
  share_views: number;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Org Whiteboard Config ─────────────────────────────
export interface OrgWhiteboardConfig {
  org_id: string;
  org_name: string;
  org_unique_id: string;
  org_plan: string;
  org_status: string;
  is_enabled: boolean;
  enabled_at: string | null;
  features: {
    set_fetch: boolean;
    ai: boolean;
    cloud_notes: boolean;
    collab_view: boolean;
    org_qbank: boolean;
  };
  ai_quota_per_account: number;
  max_accounts: number | null;
  max_pages_per_note: number;
  account_count: number;          // computed: count of org's whiteboard accounts
  live_sessions: number;          // computed: active sessions right now
  ai_used_this_month: number;     // computed: sum of ai_quota_used
  ai_total_this_month: number;    // computed: sum of ai_quota_monthly
  last_activity_at: string | null;
}

// ── Analytics ─────────────────────────────────────────
export interface WhiteboardAnalyticsOverview {
  period: { from: string; to: string };
  totals: {
    sessions: number;
    notes: number;
    pages: number;
    ai_calls: number;
    unique_accounts: number;
    avg_session_minutes: number;
  };
  growth: {
    sessions_pct: number;         // vs previous period
    notes_pct: number;
    ai_calls_pct: number;
  };
  device_breakdown: Record<string, number>;
  top_accounts: Array<{
    account_id: string;
    account_name: string;
    sessions: number;
    notes: number;
  }>;
}

// ── Global Settings ───────────────────────────────────
export interface WhiteboardGlobalSettings {
  defaults: {
    ai_quota_monthly: number;
    max_pages_per_note: number;
    note_trash_retention_days: number;
    share_link_expiry_days: number;
    session_auto_end_hours: number;
  };
  platform_ai: {
    monthly_budget: number;
    alert_threshold_pct: number;
    hard_cap_enabled: boolean;
    ai_provider: string;
    ocr_provider: string;
  };
  features: {
    set_fetch_enabled: boolean;
    ai_enabled: boolean;
    collab_view_enabled: boolean;
    audio_recording_enabled: boolean;
    cloud_notes_enabled: boolean;
    note_sharing_enabled: boolean;
    pdf_export_enabled: boolean;
  };
  notifications: {
    admin_email: string;
    notify_on_ai_quota_exhausted: boolean;
    notify_on_platform_ai_80pct: boolean;
    notify_on_storage_80pct: boolean;
    notify_on_failed_logins: boolean;
    daily_summary_enabled: boolean;
  };
}
```

---

# 6. API Endpoints — Complete Reference

## 6.1 Standard Response Envelope

```typescript
// All API responses follow this shape (same as existing EduHub APIs)
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  pagination?: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}
```

## 6.2 Accounts Endpoints

```
GET    /api/v1/admin/whiteboard/accounts
  Query: page, per_page, search, type, status, org_id, sort, order
  Response: { data: WhiteboardAccount[], pagination }

POST   /api/v1/admin/whiteboard/accounts
  Body: CreateWhiteboardAccountPayload
  Response: { data: { account: WhiteboardAccount, password_plain: string } }
  Note: password_plain ONLY returned once at creation

GET    /api/v1/admin/whiteboard/accounts/:id
  Response: { data: WhiteboardAccount & { recent_sessions, recent_notes } }

PATCH  /api/v1/admin/whiteboard/accounts/:id
  Body: Partial<CreateWhiteboardAccountPayload>
  Response: { data: WhiteboardAccount }

DELETE /api/v1/admin/whiteboard/accounts/:id
  Body: { reason?: string }
  Response: { success: true }
  Side effect: soft delete, sessions terminated, notes preserved

POST   /api/v1/admin/whiteboard/accounts/:id/suspend
  Body: { reason: string }
  Response: { data: WhiteboardAccount }
  Side effect: terminate all live sessions

POST   /api/v1/admin/whiteboard/accounts/:id/unsuspend
  Response: { data: WhiteboardAccount }

POST   /api/v1/admin/whiteboard/accounts/:id/reset-password
  Body: { custom_password?: string, notify_email?: boolean }
  Response: { data: { new_password: string } }
  Note: new_password returned ONCE, never stored in plain text

GET    /api/v1/admin/whiteboard/accounts/:id/sessions
  Query: page, per_page, from_date, to_date
  Response: { data: WhiteboardSession[], pagination }

GET    /api/v1/admin/whiteboard/accounts/:id/notes
  Query: page, per_page, subject, include_deleted
  Response: { data: WhiteboardNote[], pagination }

GET    /api/v1/admin/whiteboard/accounts/:id/ai-usage
  Query: period (month/week/custom), from_date, to_date
  Response: { data: { breakdown_by_action: Record<string,number>, daily_trend: [...] } }

GET    /api/v1/admin/whiteboard/accounts/:id/activity
  Query: page, per_page, action_filter
  Response: { data: ActivityLog[], pagination }

GET    /api/v1/admin/whiteboard/check-id/:whiteboard_id
  Response: { data: { available: boolean } }
  Note: Used for real-time uniqueness check on form
```

## 6.3 Org Access Endpoints

```
GET    /api/v1/admin/whiteboard/org-access
  Query: page, per_page, search, plan, is_enabled
  Response: { data: OrgWhiteboardConfig[], pagination }

GET    /api/v1/admin/whiteboard/org-access/:orgId
  Response: { data: OrgWhiteboardConfig }

PUT    /api/v1/admin/whiteboard/org-access/:orgId
  Body: Partial<OrgWhiteboardConfig> (only config fields, not computed)
  Response: { data: OrgWhiteboardConfig }
  Side effect: if is_enabled toggled to false → suspend all org accounts

GET    /api/v1/admin/whiteboard/org-access/:orgId/accounts
  Query: page, per_page, status
  Response: { data: WhiteboardAccount[], pagination }
```

## 6.4 AI Quota Endpoints

```
GET    /api/v1/admin/whiteboard/ai-quotas
  Query: page, per_page, search, type, quota_status (normal/near_limit/exhausted)
  Response: { data: AiQuotaSummary[], pagination, platform_totals }

PATCH  /api/v1/admin/whiteboard/ai-quotas/:accountId
  Body: { monthly_quota: number }
  Response: { data: { account_id, new_quota } }

POST   /api/v1/admin/whiteboard/ai-quotas/:accountId/reset
  Response: { data: { account_id, quota_used_reset_to: 0 } }

POST   /api/v1/admin/whiteboard/ai-quotas/bulk-update
  Body: {
    target: 'all' | 'standalone' | 'org_based' | 'selected',
    account_ids?: string[],
    new_monthly_quota: number,
    only_if_below?: boolean
  }
  Response: { data: { updated_count: number } }
```

## 6.5 Sessions Endpoints

```
GET    /api/v1/admin/whiteboard/sessions/live
  Response: { data: WhiteboardSession[] }
  Note: Real-time, no caching, max age 30s

GET    /api/v1/admin/whiteboard/sessions
  Query: page, per_page, account_id, org_id, device_type, from_date, to_date, min_duration_sec
  Response: { data: WhiteboardSession[], pagination }

DELETE /api/v1/admin/whiteboard/sessions/:id
  Body: { reason?: string }
  Response: { success: true }
  Side effect: WebSocket message to teacher + connected students, notes auto-saved
```

## 6.6 Notes Endpoints

```
GET    /api/v1/admin/whiteboard/notes
  Query: page, per_page, account_id, org_id, subject, set_id, from_date, to_date,
         include_deleted, min_pages, max_size_mb
  Response: { data: WhiteboardNote[], pagination }

GET    /api/v1/admin/whiteboard/notes/storage-stats
  Response: { data: { total_bytes, by_org: [...], trash_bytes, trash_count } }

DELETE /api/v1/admin/whiteboard/notes/:id
  Body: { permanent?: boolean }
  Response: { success: true }
  Note: permanent=false → soft delete (default). permanent=true → hard delete + S3 removal.

POST   /api/v1/admin/whiteboard/notes/empty-trash
  Response: { data: { deleted_count: number, freed_bytes: number } }
```

## 6.7 Analytics Endpoints

```
GET    /api/v1/admin/whiteboard/analytics/overview
  Query: from_date, to_date, compare_previous=true
  Response: { data: WhiteboardAnalyticsOverview }

GET    /api/v1/admin/whiteboard/analytics/sessions-chart
  Query: from_date, to_date, granularity (day/week/month)
  Response: { data: Array<{ date: string, sessions: number, notes: number }> }

GET    /api/v1/admin/whiteboard/analytics/ai-chart
  Query: from_date, to_date, account_id?
  Response: { data: { by_action: Record<string,number>, daily: [...] } }

GET    /api/v1/admin/whiteboard/analytics/orgs-table
  Query: from_date, to_date, page, per_page, sort
  Response: { data: OrgAnalyticsRow[], pagination }

GET    /api/v1/admin/whiteboard/analytics/export
  Query: format (csv/pdf), from_date, to_date, report_type
  Response: file download (CSV or PDF)
```

## 6.8 Settings Endpoints

```
GET    /api/v1/admin/whiteboard/settings
  Response: { data: WhiteboardGlobalSettings }

PATCH  /api/v1/admin/whiteboard/settings
  Body: Partial<WhiteboardGlobalSettings>
  Response: { data: WhiteboardGlobalSettings }
```

---

# 7. Page: Overview Dashboard `/whiteboard`

## 7.1 Page Layout

```
┌─ PAGE HEADER ──────────────────────────────────────────────────────────┐
│                                                                        │
│  🖥️ Whiteboard Management                         [+ New Account]     │
│  Monitor and manage all whiteboard accounts, sessions, and usage       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ STATS ROW ─────────────────────────────────────────────────────────────┐
│  [Card 1]  [Card 2]  [Card 3]  [Card 4]  [Card 5]  [Card 6]           │
└─────────────────────────────────────────────────────────────────────────┘

┌─ LEFT 60% ─────────────────────┬─ RIGHT 40% ─────────────────────────┐
│  Sessions + Notes Chart        │  Quick Actions                       │
│                                │  ─────────────────────────────────── │
│  ─────────────────────────     │  Org Access Summary                  │
│  Recent Activity Feed          │  ─────────────────────────────────── │
│                                │  Platform AI Budget                  │
└────────────────────────────────┴─────────────────────────────────────┘
```

## 7.2 Stats Cards (6 cards, col-span-2 each on 12-col grid)

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Total Accounts   │  │ Org-Based        │  │ Standalone       │
│                  │  │                  │  │                  │
│       284        │  │       241        │  │       43         │
│  ↑ +12 today    │  │  38 organizations│  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ ● Live Sessions  │  │ Notes Today      │  │ AI Calls / Month │
│                  │  │                  │  │                  │
│       47         │  │       128        │  │    14,291        │
│  [View Live →]  │  │  across 94 accs  │  │  ████░░ 28.6%   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Card Spec:**
- Container: `bg-white border border-[#E5E7EB] rounded-xl p-6`
- Number: `text-3xl font-bold text-[#111827]`
- Label: `text-sm text-[#6B7280] mt-1`
- Sub-info: `text-xs text-[#6B7280] mt-2`
- Live Sessions card: pulsing green dot `animate-pulse bg-[#16A34A]`
- AI Calls card: mini progress bar below number

## 7.3 Sessions + Notes Chart

```
ACTIVITY — Last 30 Days                      [7D] [30D●] [90D] [Custom]
──────────────────────────────────────────────────────────────────────

[Recharts ComposedChart]
  - Line:    Sessions per day (color #1E3A5F)
  - Bar:     Notes per day (color #F4511E, opacity 0.7)
  - X-Axis:  dates (formatted dd MMM)
  - Y-Axis:  count
  - Tooltip: custom styled, shows both metrics
  - Legend:  Sessions ■ | Notes ■
  - Height:  280px
```

## 7.4 Recent Activity Feed

```
RECENT ACTIVITY
──────────────────────────────────────────────────────
● Account created       "DPS Rohini — Room 4"    2m ago
● Session started       "Apex Batch A"            5m ago
⚠ AI quota exhausted   "Old Board Account"       8m ago
● Notes exported        "Chemistry Class — 4 Mar" 15m ago
● Password reset        "Career Point Board"      1h ago
✗ Account suspended     "Inactive Board"          3h ago
──────────────────────────────────────────────────────
                                 [View All Activity →]
```

**Feed Item Design:**
- Left colored dot: green (created/started), orange (warning), red (suspended/error)
- Text: `text-sm text-[#374151]`
- Account name: `font-medium`
- Timestamp: `text-xs text-[#6B7280]`

## 7.5 Quick Actions Panel

```
QUICK ACTIONS
──────────────────────────────────────────────
[+ Create Standalone Account]
[📋 View Live Sessions]
[📊 Download Report]
[⚙️ Whiteboard Settings]
──────────────────────────────────────────────
ORG ACCESS
──────────────────────────────────────────────
38 / 52 organizations have whiteboard enabled

[████████████████████░░░░]
                    [Manage Org Access →]
──────────────────────────────────────────────
PLATFORM AI BUDGET
──────────────────────────────────────────────
14,291 / 50,000 calls this month
[████████░░░░░░░░░░░░░░░░]  28.6%
Resets: 1 April 2026
                    [Manage AI Quotas →]
```

---

# 8. Page: Accounts List `/whiteboard/accounts`

## 8.1 Page Header

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Whiteboard Accounts                               [+ New Account]       │
│  284 total · 241 org-based · 43 standalone                               │
└──────────────────────────────────────────────────────────────────────────┘
```

## 8.2 Filter Bar

```
[🔍 Search name, ID, institution...]   [Type ▾]   [Status ▾]   [Org ▾]   [Export CSV]

Type dropdown:    All  /  Standalone  /  Org-Based
Status dropdown:  All  /  Active  /  Suspended  /  Quota Exhausted  /  Locked
Org dropdown:     All orgs (searchable select)
```

## 8.3 Table — Full Specification

| Col | Header | Content | Width | Sort |
|---|---|---|---|---|
| 1 | — | Checkbox | 40px | — |
| 2 | ACCOUNT | Name (bold) + ID badge + institution (muted) | 28% | Yes |
| 3 | TYPE | Standalone / Org-Based pill | 10% | Yes |
| 4 | ORGANIZATION | Org name (link) or "—" for standalone | 14% | Yes |
| 5 | STATUS | Active / Suspended / Locked badge | 10% | Yes |
| 6 | AI QUOTA | `47 / 100` + mini bar | 13% | Yes |
| 7 | LAST ACTIVE | Relative time ("2h ago") | 10% | Yes |
| 8 | NOTES | Count number | 7% | Yes |
| 9 | ACTIONS | `[⋮]` dropdown | 8% | — |

**Table Row Design:**
```
┌────────────────────────────────────────────────────────────────────────┐
│ ☐  🖥️ DPS Rohini — Room 4        Standalone   —          ● Active     │
│       ID: [482931]  Delhi Public School                                 │
│                                                [43/100 ██░]  2h  12 [⋮]│
└────────────────────────────────────────────────────────────────────────┘
```

**Row Actions Dropdown `[⋮]`:**
```
👁  View Details
✏️  Edit Account
🔑  Reset Password
📊  View Activity
──────────────────
⏸  Suspend Account    ← orange text
🗑  Delete Account     ← red text
```

## 8.4 Bulk Actions (when rows selected)

```
[3 selected]  [Suspend Selected]  [Reset Passwords]  [Export Selected]  [Cancel]
```

## 8.5 Empty State

```
        🖥️
  No whiteboard accounts found

  No accounts match your current filters.
  Try adjusting your search or filters.

  [Clear Filters]        [+ Create Account]
```

---

# 9. Page: Create Account `/whiteboard/accounts/new`

## 9.1 Page Header

```
← Back to Accounts

Create Whiteboard Account
Set up a new standalone whiteboard login for a classroom or institution
```

## 9.2 Form — Two Column Layout

```
LEFT COLUMN (form fields)               RIGHT COLUMN (credentials + config)
────────────────────────────────────    ────────────────────────────────────

ACCOUNT INFORMATION                     CREDENTIALS

Account Name *                          WHITEBOARD ID
[DPS Rohini — Room 4           ]        [Auto-generated]  [🔀 Regenerate]
hint: e.g. "DPS Rohini — Room 4"
                                        ┌───┐┌───┐┌───┐ ┌───┐┌───┐┌───┐
Description                             │ 4 ││ 8 ││ 2 │ │ 9 ││ 3 ││ 1 │
[                              ]        └───┘└───┘└───┘ └───┘└───┘└───┘
                                        ✓ Available  (live check on change)

Institution / School                    PASSWORD
[Delhi Public School Rohini    ]        [Auto-generated]  [🔀 Regenerate]

City                  State             ┌───┐┌───┐┌───┐ ┌───┐┌───┐┌───┐
[Delhi        ] [Delhi      ]           │ 7 ││ 3 ││ 8 │ │ 2 ││ 9 ││ 1 │
                                        └───┘└───┘└───┘ └───┘└───┘└───┘
CONTACT DETAILS                         ✓ Strong password

Contact Person                          ────────────────────────────────
[Rahul Kumar                   ]        FEATURE ACCESS
                                        ☑  Set ID / Question Fetch
Contact Email                           ☑  AI Assistant
[rahul@dps.edu.in              ]        ☑  Cloud Notes Save
                                        ☑  Collaborative Student View
Contact Phone                           ☐  Org QBank Access
[+91 9812345678                ]           (not available for standalone)

                                        ────────────────────────────────
                                        AI QUOTA

                                        Monthly AI Calls
                                        [100     ] calls/month
                                        Platform default: 100

                                        ────────────────────────────────
                                        SEND CREDENTIALS

                                        ☑  Send via Email
                                           [rahul@dps.edu.in        ]
                                        ☐  Send via WhatsApp
                                           [+91 9812345678          ]
────────────────────────────────────────────────────────────────────────
                         [Cancel]                  [Create Account →]
```

**Validation Rules:**
- Account Name: required, min 3 chars, max 100 chars
- Whiteboard ID: 6 digits, 100000–999999, not in weak list, unique check via API
- Password: 6 digits, not in weak list
- Contact Email: valid email format if provided
- AI Quota: 1–9999 integer

**Weak IDs/Passwords blocked (shown inline error):**
```
000000, 111111, 222222, 333333, 444444, 555555,
666666, 777777, 888888, 999999, 123456, 654321,
112233, 998877, 121212, 111222
```

## 9.3 Success Modal

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ✅  Account Created Successfully!                        │
│      DPS Rohini — Room 4                                  │
│                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐      │
│  │  Whiteboard ID       │  │  Password             │      │
│  │                      │  │                       │      │
│  │  4  8  2  9  3  1    │  │  7  3  8  2  9  1     │      │
│  │       [📋 Copy]      │  │       [📋 Copy]        │      │
│  └──────────────────────┘  └──────────────────────┘      │
│                                                           │
│  [📋 Copy Both]  [📧 Email Credentials]  [💬 WhatsApp]   │
│                                                           │
│  [View Account]              [Create Another →]           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Important:** Password shown here only once. After modal closes, password cannot be retrieved — only reset.

---

# 10. Page: Account Detail `/whiteboard/accounts/[id]`

## 10.1 Page Header

```
← Back to Accounts

┌──────────────────────────────────────────────────────────────────────────┐
│  🖥️  DPS Rohini — Room 4                                    ● Active    │
│  Standalone Account  ·  ID: [482931]  ·  Created: 15 Jan 2026           │
│  Delhi Public School Rohini  ·  Delhi                                   │
│                                                                          │
│  [✏️ Edit]   [🔑 Reset Password]   [⏸ Suspend]   [🗑 Delete]           │
└──────────────────────────────────────────────────────────────────────────┘
```

## 10.2 Two-Column Info Section

```
LEFT — ACCOUNT INFO (card)              RIGHT — FEATURE ACCESS (card)
─────────────────────────────────────   ─────────────────────────────────────
Contact: Rahul Kumar                    Set ID / Question Fetch    ● ON
Email:   rahul@dps.edu.in              AI Assistant               ● ON
Phone:   +91 9812345678                Cloud Notes                ● ON
                                        Collaborative View         ● ON
Last Login:  2h ago (Windows)           Org QBank                  ○ OFF
Created By:  Super Admin
                                                          [✏️ Edit Features]
```

## 10.3 Credentials Card

```
┌──────────────────────────────────────────────────────────────────────────┐
│  🔐 CREDENTIALS                                    [🔑 Reset Password]  │
│                                                                          │
│  Whiteboard ID:    ┌─────────────────────┐                              │
│                    │  4  8  2  9  3  1   │  [📋 Copy]                   │
│                    └─────────────────────┘                              │
│  Password:         ●  ●  ●  ●  ●  ●        [👁 Show]  [📋 Copy]        │
│                                                                          │
│  [Copy Both]   [📧 Resend via Email]   [💬 Resend via WhatsApp]         │
│                                                                          │
│  Last reset: Never                                                       │
└──────────────────────────────────────────────────────────────────────────┘
```

## 10.4 AI Quota Card

```
┌──────────────────────────────────────────────────────────────────────────┐
│  🤖 AI QUOTA                                       [✏️ Edit Quota]     │
│                                                                          │
│  Monthly Limit    Used This Month    Remaining    Resets On              │
│     100 calls         47 calls        53 calls    1 Apr 2026             │
│                                                                          │
│  [████████████████░░░░░░░░░░░░░░░░░░░]    47 / 100   (47%)              │
│                                                                          │
│                            [📊 View AI History]   [🔄 Reset Used Count] │
└──────────────────────────────────────────────────────────────────────────┘
```

## 10.5 Stats Row

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ Total Sessions │  │ Total Notes    │  │ Total Pages    │  │ Avg Duration   │
│      284       │  │      128       │  │      847       │  │    54 min      │
└────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘
```

## 10.6 Tabs

```
[Sessions]  [Notes]  [Activity Log]  [AI Usage]
```

### Tab: Sessions

```
SESSIONS HISTORY
─────────────────────────────────────────────────────────────────────────
Date / Time          Duration    Pages  Set IDs Used     Device   Students
─────────────────────────────────────────────────────────────────────────
04 Mar 2026, 10:15   1h 23m      8      482931           Windows  23
03 Mar 2026, 09:30   45m         5      —                Android  0
02 Mar 2026, 11:00   2h 10m      12     591047, 382819   Windows  8
─────────────────────────────────────────────────────────────────────────
                                                              [Load More]
```

### Tab: Notes

```
SAVED NOTES (128 total)
─────────────────────────────────────────────────────────────────────────────────
[thumb]  Algebra Class — 4 Mar 2026    8 pages   1.2 MB   Set:482931   [View][🗑]
[thumb]  Chemistry Notes — 3 Mar       5 pages   0.8 MB   —            [View][🗑]
[thumb]  Physics: Kinematics           12 pages  2.1 MB   Set:591047   [View][🗑]
─────────────────────────────────────────────────────────────────────────────────
Filter: [Subject ▾] [Date ▾] [Has Set ID ▾]                     [Load More]
```

### Tab: Activity Log

```
ACTIVITY LOG
──────────────────────────────────────────────────────────────────
● Session started                       04 Mar 2026, 10:15 AM
● Set 482931 loaded (Math - Algebra)    04 Mar 2026, 10:18 AM
● AI called: explain                    04 Mar 2026, 10:32 AM
● Note saved (cloud): "Algebra Class"   04 Mar 2026, 10:45 AM
● Session ended by teacher              04 Mar 2026, 11:38 AM
● Password reset by Super Admin         01 Mar 2026, 09:00 AM
● Account created by Super Admin        15 Jan 2026, 03:00 PM
──────────────────────────────────────────────────────────────────
                                                      [Load More]
```

### Tab: AI Usage

```
AI USAGE — March 2026
──────────────────────────────────────────
Action              Calls     % Share
──────────────────────────────────────────
Explain             18        38%     [████████████████████]
Solve Question      14        30%     [████████████████]
Generate Examples    9        19%     [██████████]
Summarize            4         9%     [█████]
OCR                  2         4%     [██]
──────────────────────────────────────────
Total               47 calls used

[Bar Chart: AI calls per day - last 30 days]
```

## 10.7 Danger Zone

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ⚠️  DANGER ZONE                                                        │
│                                                                          │
│  Suspend Account                                                         │
│  Account login will be disabled immediately. All active sessions will    │
│  be terminated. Saved notes will be preserved.                           │
│                                [Suspend Account]  ← orange button       │
│                                                                          │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Delete Account                                                          │
│  Account will be permanently deleted. Notes will be moved to trash for  │
│  30 days then permanently removed.                                       │
│                                [Delete Account]   ← red button          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Delete Confirmation:** Type-to-confirm pattern (from EH-SA-FE-PRD-001):
```
Type "DELETE DPS ROHINI — ROOM 4" to confirm

[_________________________________]

[Cancel]                    [Delete Account]  ← disabled until text matches
```

---

# 11. Page: Org Access `/whiteboard/org-access`

## 11.1 Page Header

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Organization Whiteboard Access                                            │
│  Control which organizations can access the whiteboard feature             │
│                                                                            │
│  38 of 52 organizations enabled     [████████████████████░░░░░░░] 73%    │
│                                                                            │
│                          [Bulk Enable All]   [Bulk Disable All]           │
└────────────────────────────────────────────────────────────────────────────┘
```

## 11.2 Filter Bar

```
[🔍 Search organization...]   [Plan ▾]   [Status ▾]   [Whiteboard ▾]
```

## 11.3 Table

| Col | Content | Width |
|---|---|---|
| Organization | Name (bold) + Unique ID (mono badge) | 24% |
| Plan | Badge (Free/Starter/Pro/Enterprise) | 10% |
| Whiteboard | Toggle Switch | 10% |
| Accounts | Count with link | 10% |
| Live Now | `● 3` pulsing or `—` | 8% |
| AI Usage | `342 / 500` + bar | 14% |
| Last Activity | Relative time | 10% |
| Actions | `[⋮]` | 8% (fixed) |

```
┌────────────────────────────────────────────────────────────────────────────┐
│  🏢 Apex Academy          Pro     [● ON]    12 accs   ● 3   342/500  2h  [⋮]│
│     GK-ORG-00142                                                           │
│  🏢 Delhi IAS Centre      Starter [● ON]     5 accs   ● 1   89/200   1d  [⋮]│
│     GK-ORG-00089                                                           │
│  🏢 Career Point          Free    [○ OFF]    0 accs   —     —/100    —   [⋮]│
│     GK-ORG-00201                                                           │
└────────────────────────────────────────────────────────────────────────────┘
```

**Row Actions `[⋮]`:**
```
👁  View Accounts
⚙️  Edit Settings
📊  View Analytics
──────────────
○  Disable Whiteboard   ← only if enabled
●  Enable Whiteboard    ← only if disabled
```

## 11.4 Toggle Confirmation Modal

```
Disabling whiteboard:

┌─────────────────────────────────────────────────────────┐
│  ⚠️  Disable Whiteboard for Apex Academy?               │
│                                                         │
│  This action will:                                      │
│  • Suspend all 12 whiteboard accounts immediately       │
│  • Terminate 3 currently live sessions                  │
│  • Org Admin will lose access to whiteboard settings    │
│  • Notes from all accounts will be preserved            │
│                                                         │
│  Re-enabling will reactivate all accounts.              │
│                                                         │
│  [Cancel]                    [Yes, Disable Whiteboard]  │
└─────────────────────────────────────────────────────────┘
```

## 11.5 Org Whiteboard Settings (Slide-Over, 600px)

Triggered from `[⋮] → Edit Settings`:

```
Whiteboard Settings — Apex Academy
GK-ORG-00142
──────────────────────────────────────────────────────
STATUS

Whiteboard Access         [● ON ──────]

──────────────────────────────────────────────────────
FEATURE ACCESS (Defaults for all org accounts)

Set ID / Question Fetch   [● ON]
AI Assistant              [● ON]
Cloud Notes               [● ON]
Collaborative View        [● ON]
Org QBank Access          [● ON]   ← Only for org accounts

──────────────────────────────────────────────────────
LIMITS

Monthly AI per Account    [100      ] calls
Max Accounts              [Unlimited▾]
  Options: 5 / 10 / 20 / 50 / 100 / Unlimited
Max Pages per Note        [100      ]

──────────────────────────────────────────────────────
CURRENT USAGE

Accounts:         12 / Unlimited
Total AI Used:    342 / 1,200 this month
Notes Stored:     284  (3.2 GB)

──────────────────────────────────────────────────────
                         [Cancel]   [Save Settings]
```

---

# 12. Page: AI Quotas `/whiteboard/ai-quotas`

## 12.1 Page Header

```
┌────────────────────────────────────────────────────────────────────────────┐
│  AI Quota Management                            [Bulk Update]              │
│  Monitor and control AI usage across all whiteboard accounts               │
│                                                                            │
│  Platform Total:  14,291 / 50,000 calls this month                        │
│  [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  28.6%   Resets: 1 Apr 2026    │
└────────────────────────────────────────────────────────────────────────────┘
```

## 12.2 Summary Stats Row

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Total Calls  │  │ Exhausted    │  │ Near Limit   │  │ Avg Usage    │
│ Today        │  │ Accounts     │  │ > 80% Used   │  │ This Month   │
│              │  │              │  │              │  │              │
│     482      │  │      3       │  │      8       │  │   50.3 / 100 │
│              │  │  [View All]  │  │  [View All]  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

## 12.3 Table

| Col | Content | Width |
|---|---|---|
| Account | Name + ID + Type badge | 28% |
| Monthly Limit | Inline editable number | 12% |
| Used | `47` mono | 8% |
| Progress | Color bar `47/100 (47%)` | 20% |
| Top Action | Most used AI action | 12% |
| Resets | Date | 10% |
| Actions | Edit · Reset · History | 10% |

```
Progress bar color logic:
  < 70%  → bg-[#16A34A]
  70–90% → bg-[#F59E0B]  + pill "Near Limit" (warning tint)
  > 90%  → bg-[#DC2626]  + pill "Critical"
  = 100% → bg-[#DC2626]  + pill "Exhausted" (animate-pulse)
```

**Inline Edit (click on limit number):**
```
Before click: 100
After click:  [100] ✓ ✗
              ↑ input field, width 80px
              Press Enter or ✓ to save
              Press Escape or ✗ to cancel
```

## 12.4 Bulk Update Modal

```
┌─────────────────────────────────────────────────────────┐
│  Bulk Update AI Quotas                                  │
│                                                         │
│  Apply to:                                              │
│  ○ All Accounts             (284)                       │
│  ● All Standalone Accounts  (43)                        │
│  ○ All Org-Based Accounts   (241)                       │
│  ○ Selected Accounts        (use table checkboxes)      │
│                                                         │
│  New Monthly Limit:  [150      ] calls/month            │
│                                                         │
│  ☑ Only update accounts currently below this limit      │
│    (Prevents reducing accounts that have higher quota)  │
│                                                         │
│  This will update 31 accounts.                          │
│                                                         │
│  [Cancel]                        [Apply Changes]        │
└─────────────────────────────────────────────────────────┘
```

---

# 13. Page: Sessions `/whiteboard/sessions`

## 13.1 Page Header

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Sessions Monitor                                                          │
│  Real-time view of all whiteboard sessions across all accounts             │
│                                                                            │
│  ● 47 Live Now                             [Auto-refresh: 30s ▾]  [🔄]    │
└────────────────────────────────────────────────────────────────────────────┘
```

## 13.2 Live Sessions Panel

```
● LIVE SESSIONS  (47 active)
──────────────────────────────────────────────────────────────────────────
Account              Org            Collab  Duration   Device   Actions
──────────────────────────────────────────────────────────────────────────
DPS Room 4           Standalone     ● 23    00:42:10   Windows  [⏹ End]
Apex Academy Batch A Apex Academy   ● 12    01:15:33   Android  [⏹ End]
Career Point Board   Career Point   —       00:08:45   Windows  [⏹ End]
Delhi IAS Room 1     Delhi IAS      ● 5     00:31:22   Web      [⏹ End]
──────────────────────────────────────────────────────────────────────────

● 23 = 23 students in collaborative view
—   = no collaborative view / no students

Auto-refreshes every 30 seconds (configurable: 10s / 30s / 60s / Off)
```

## 13.3 Recent Sessions Table

```
RECENT SESSIONS
──────────────────────────────────────────────────────────────────────────────
Date/Time           Account          Duration   Pages  Set IDs     Device
──────────────────────────────────────────────────────────────────────────────
04 Mar, 10:15 AM    DPS Room 4       1h 23m     8      482931      Windows
04 Mar, 09:30 AM    Apex Batch A     45m        5      —           Android
03 Mar, 02:00 PM    Career Pt Board  2h 10m     12     591047      Windows
──────────────────────────────────────────────────────────────────────────────

Filters: [Date Range ▾] [Account ▾] [Organization ▾] [Device ▾] [Min Duration ▾]
Pagination: 20 per page
```

## 13.4 Force End Session Modal

```
┌──────────────────────────────────────────────────────┐
│  ⏹  Force End Session?                               │
│  DPS Room 4                                          │
│                                                      │
│  This will:                                          │
│  • Disconnect 23 connected students immediately     │
│  • Auto-save current notes to cloud                 │
│  • Session marked as "Ended by Admin"                │
│  • Teacher receives in-app notification              │
│                                                      │
│  Reason (optional):                                  │
│  [________________________]                          │
│                                                      │
│  [Cancel]                    [End Session]           │
└──────────────────────────────────────────────────────┘
```

---

# 14. Page: Notes `/whiteboard/notes`

## 14.1 Page Header

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Notes Management                                                          │
│  All class notes saved across all whiteboard accounts                      │
│                                                                            │
│  4,281 notes  ·  128 today  ·  89.4 GB used  ·  142 in trash             │
│                                                    [Empty Trash]  [Export] │
└────────────────────────────────────────────────────────────────────────────┘
```

## 14.2 Filter Bar

```
[🔍 Search title...]   [Account ▾]   [Org ▾]   [Subject ▾]   [Date ▾]   [Show Deleted ☐]
```

## 14.3 Notes Table

| Col | Content | Width |
|---|---|---|
| Note | Thumbnail + Title + subject tag | 30% |
| Account | Name + ID | 18% |
| Organization | Org name / "Standalone" | 14% |
| Pages | Count | 6% |
| Set ID | Linked set ID badge or — | 8% |
| Size | MB | 7% |
| Created | Date | 10% |
| Actions | View · Delete | 7% |

**Thumbnail:** 48×36px, lazy loaded from signed S3 URL. Fallback: icon placeholder.

## 14.4 Storage Stats Card

```
┌────────────────────────────────────────────────────────────────────────────┐
│  STORAGE USAGE                                                             │
│                                                                            │
│  Total:      89.4 GB / 500 GB                                              │
│  [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  17.8%                         │
│                                                                            │
│  Top Consumers:                                                            │
│  1.  Apex Academy        24.2 GB  (284 notes)     [████]                  │
│  2.  Delhi IAS Centre    12.8 GB  (152 notes)     [███]                   │
│  3.  DPS Rohini           8.4 GB  (128 notes)     [██]                    │
│                                                                            │
│  Trash: 142 notes · 3.2 GB                    [Empty Trash Now]           │
└────────────────────────────────────────────────────────────────────────────┘
```

---

# 15. Page: Analytics `/whiteboard/analytics`

## 15.1 Controls Bar

```
[Last 7 Days]  [Last 30 Days ●]  [Last 90 Days]  [Custom Range]
                                               [📥 Export PDF]  [📥 Export CSV]
```

## 15.2 KPI Row

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Sessions     │  │ Notes        │  │ Avg Duration │  │ AI Calls     │  │ Active Accs  │
│   1,284      │  │   3,841      │  │   52 min     │  │   14,291     │  │    168       │
│  ↑ 12%       │  │  ↑ 8%        │  │  ↑ 3 min     │  │  ↑ 22%       │  │  ↑ 4         │
│  vs last     │  │  vs last     │  │              │  │  vs last     │  │  accounts    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

## 15.3 Charts Grid

```
ROW 1 — Full Width
─────────────────────────────────────────────────────────────────────────────
SESSIONS & NOTES — Daily Trend (ComposedChart: Line + Bar)
  Line: Sessions/day (color: #1E3A5F, strokeWidth: 2)
  Bar:  Notes/day (color: #F4511E, opacity: 0.7)
  Height: 300px
  X: date labels, Y: count
  Tooltip: custom with both metrics

ROW 2 — Two Columns
─────────────────────────────────────────────────────────────────────────────
LEFT (50%): AI USAGE BREAKDOWN (PieChart / Donut)
  Explain           38%  #1E3A5F
  Solve Question    30%  #F4511E
  Examples          19%  #16A34A
  Summarize          9%  #F59E0B
  OCR                4%  #6B7280
  Center label: "14,291 total"
  Legend: right side

RIGHT (50%): DEVICE BREAKDOWN (Horizontal BarChart)
  Windows     52%  ████████████
  Android     31%  ███████
  Web         12%  ███
  iOS          5%  █
  Color: #1E3A5F
  Y-Axis: platform names

ROW 3 — Full Width
─────────────────────────────────────────────────────────────────────────────
TOP ORGANIZATIONS TABLE
  Cols: Organization | Sessions | Avg Duration | Notes | AI Calls | Top Feature
  Sortable by all columns
  Pagination: 10 rows, [Load More]
```

---

# 16. Page: Settings `/whiteboard/settings`

## 16.1 Page Layout — Sections

```
┌─ GLOBAL DEFAULTS ──────────────────────────────────────────────────────────┐
│  Applied to all new accounts unless overridden at account/org level        │
│                                                                            │
│  Default Monthly AI Quota:        [100       ] calls/month                 │
│  Max Pages per Note:              [100       ] pages                        │
│  Max Notes per Account:           [Unlimited ▾]                            │
│  Note Trash Retention:            [30        ] days                        │
│  Share Link Expiry:               [7         ] days                        │
│  Session Auto-End After:          [6         ] hours                        │
│  Local Auto-Save Interval:        [30        ] seconds                     │
│  Cloud Auto-Save Interval:        [120       ] seconds                     │
│                                                    [Save Global Defaults]  │
└────────────────────────────────────────────────────────────────────────────┘

┌─ PLATFORM AI BUDGET ───────────────────────────────────────────────────────┐
│                                                                            │
│  Monthly Budget (all accounts):   [50000     ] calls/month                 │
│  Alert When Usage Reaches:        [80        ] %                           │
│  Hard Cap:  ☑ Stop all AI calls when platform budget exhausted            │
│                                                                            │
│  AI Provider:   [OpenAI GPT-4o ▾]                                         │
│  OCR Provider:  [Google Vision API ▾]                                     │
│                                                       [Save AI Settings]  │
└────────────────────────────────────────────────────────────────────────────┘

┌─ FEATURE TOGGLES (Platform-Wide) ──────────────────────────────────────────┐
│  Override feature availability for all whiteboard accounts platform-wide   │
│                                                                            │
│  Set ID / Question Fetch          [● ON]                                   │
│  AI Assistant                     [● ON]                                   │
│  Collaborative Student View       [● ON]                                   │
│  Audio Recording                  [○ OFF]   (Phase 3 — not yet released)  │
│  Cloud Notes Backup               [● ON]                                   │
│  Note Share Links                 [● ON]                                   │
│  PDF Export                       [● ON]                                   │
│  Math Tools                       [● ON]                                   │
│  Chemistry Tools                  [● ON]                                   │
│  Physics Tools                    [● ON]                                   │
│                                                    [Save Feature Toggles]  │
└────────────────────────────────────────────────────────────────────────────┘

┌─ ADMIN NOTIFICATIONS ───────────────────────────────────────────────────────┐
│                                                                            │
│  ☑ Email when any account's AI quota is exhausted                         │
│  ☑ Email when platform AI budget > 80%                                    │
│  ☑ Email when storage usage > 80%                                         │
│  ☑ Email when account has 5+ consecutive failed login attempts            │
│  ☐ Daily session summary email                                             │
│                                                                            │
│  Admin Notification Email:  [admin@eduhub.com                    ]        │
│                                                   [Save Notifications]     │
└────────────────────────────────────────────────────────────────────────────┘
```

---

# 17. Shared Components — Whiteboard Module

## 17.1 `<WhiteboardIdBadge>`

```tsx
// Usage: <WhiteboardIdBadge id="482931" copyable />

// Visual:
// ┌─────────────────────────────┐
// │  🖥️  4 8 2 9 3 1  [📋]     │
// └─────────────────────────────┘

// Specs:
// - Font: Courier New, monospace, 14px, letter-spacing: 0.15em
// - Background: #F3F4F6, border: 1px solid #E5E7EB, radius: 6px
// - Padding: 4px 10px
// - Copy button: shows on hover, copies to clipboard, shows "Copied!" toast
```

## 17.2 `<AiQuotaBar>`

```tsx
// Usage: <AiQuotaBar used={47} total={100} showLabel showBadge />

// Visual:
// 47 / 100   [████████░░░░░░░░░░░░]  47%
// Color: green / orange / red based on percentage
// Badge: "Near Limit" or "Exhausted" when applicable

// Color Logic:
// < 70%  → #16A34A  (green)
// 70–90% → #F59E0B  (orange) + "Near Limit" badge
// > 90%  → #DC2626  (red)    + "Critical" badge
// = 100% → #DC2626  (red) pulsing + "Exhausted" badge
```

## 17.3 `<StatusBadge>`

```tsx
// Usage: <StatusBadge status="active" | "suspended" | "deleted" | "locked" />

// active:    ● Active     bg:#DCFCE7  text:#16A34A
// suspended: ⏸ Suspended  bg:#FEE2E2  text:#DC2626
// deleted:   🗑 Deleted    bg:#F3F4F6  text:#6B7280
// locked:    🔒 Locked     bg:#FEF3C7  text:#D97706
// exhausted: ✗ Exhausted  bg:#FEE2E2  text:#DC2626
```

## 17.4 `<AccountTypeBadge>`

```tsx
// Usage: <AccountTypeBadge type="standalone" | "org_based" />

// standalone: 🖥️ Standalone   bg:#DBEAFE  text:#1D4ED8
// org_based:  🏢 Org-Based     bg:#EDE9FE  text:#7C3AED
```

## 17.5 `<LiveSessionDot>`

```tsx
// Usage: <LiveSessionDot count={47} />

// Visual: ● 47 Live
// Green dot with animate-pulse
// Click: navigates to /whiteboard/sessions
```

## 17.6 `<CredentialDisplay>`

```tsx
// Shows whiteboard ID + password in OTP-box style
// Props: whiteboardId, showPassword (default false)
// Copy buttons for each, "Copy Both" button
// Password hidden by default with [👁 Show] toggle
```

## 17.7 `<ConfirmModal>` (from EH-SA-FE-PRD-001)

```tsx
// Standard confirmation modal — reuse existing component
// Props: title, description, impacts (string[]), confirmLabel, confirmVariant, onConfirm, onCancel
// confirmVariant: "orange" | "red"
```

## 17.8 `<OrgAccessToggle>`

```tsx
// Toggle switch for org whiteboard ON/OFF
// ON click → opens ConfirmModal with impact list
// After confirm → calls API, shows success/error toast
// Loading state during API call
```

---

# 18. Page Flows & User Journeys

## 18.1 Create Standalone Account

```
Super Admin → /whiteboard/accounts → [+ New Account]
      ↓
/whiteboard/accounts/new
      ↓
Fill: Account Name, Contact Details
Auto-generated: ID + Password (regeneratable)
Configure: Features + AI Quota
Optional: Send via Email/WhatsApp
      ↓
[Create Account →]
      ↓
Backend:
  1. Check ID uniqueness (global pool)
  2. Check password not in weak list
  3. Hash password (bcrypt, 12 rounds)
  4. Insert whiteboard_accounts row
  5. Insert whiteboard_activity_log (ACCOUNT_CREATED)
  6. If notify_email → send credentials email via AWS SES
      ↓
✅ Success Modal → shows ID + password (only time password shown)
      ↓
[View Account] or [Create Another]
```

## 18.2 Suspend Account

```
/whiteboard/accounts/[id] → [⏸ Suspend]
      ↓
Confirmation Modal:
  "Suspend DPS Rohini — Room 4?"
  • Account login will be disabled immediately
  • X live sessions will be terminated
  • Notes will be preserved
  Reason: [text input — optional]
      ↓
[Yes, Suspend]
      ↓
Backend:
  1. UPDATE status='suspended', suspended_at=NOW(), suspended_by=admin_id
  2. Find all live sessions for this account → terminate each
     - Send WebSocket event: { type: 'SESSION_FORCE_ENDED' }
     - Save notes (trigger auto-save webhook)
  3. Log: ACCOUNT_SUSPENDED in whiteboard_activity_log
      ↓
✅ Toast: "Account suspended. 3 sessions terminated."
   Badge updated to "⏸ Suspended"
```

## 18.3 Enable Org Whiteboard

```
/whiteboard/org-access → Find org → Toggle OFF→ON
      ↓
No confirmation needed for enabling (non-destructive)
      ↓
Backend:
  1. UPSERT org_whiteboard_config: is_enabled=true, enabled_at=NOW(), toggled_by=admin_id
  2. If org had previously-suspended-due-to-toggle accounts → reactivate them
  3. Log: ORG_WB_ENABLED
      ↓
✅ Toast: "Whiteboard enabled for Apex Academy"
```

## 18.4 Disable Org Whiteboard

```
/whiteboard/org-access → Find org → Toggle ON→OFF
      ↓
Confirmation Modal (destructive):
  "Disable Whiteboard for Apex Academy?"
  • 12 accounts will be suspended immediately
  • 3 live sessions will be terminated
  • Notes preserved
  • Org Admin loses whiteboard access
      ↓
[Yes, Disable]
      ↓
Backend:
  1. UPDATE org_whiteboard_config: is_enabled=false, disabled_at=NOW()
  2. Suspend ALL accounts for this org
  3. Terminate all live sessions for those accounts
  4. Log: ORG_WB_DISABLED
      ↓
✅ Toast: "Whiteboard disabled. 12 accounts suspended, 3 sessions terminated."
```

## 18.5 Reset Account Password

```
/whiteboard/accounts/[id] → [🔑 Reset Password]
      ↓
Modal:
  "Reset Password for DPS Rohini — Room 4?"
  New Password: [Auto-generate ●]  [Custom ○]
    If custom: input field appears
  ☑ Send new password to rahul@dps.edu.in
  ☑ Send via WhatsApp to +91 9812345678
      ↓
[Reset Password]
      ↓
Backend:
  1. Generate/validate new 6-digit password
  2. Check not in weak list
  3. bcrypt hash, update password_hash
  4. Clear failed_login_attempts, locked_until
  5. Log: ACCOUNT_PASSWORD_RESET
  6. Send email/WhatsApp if requested
      ↓
✅ Modal shows new password (one time only):
  New Password: 8 4 7 2 0 3  [📋 Copy]
  "Share this with the account holder. It won't be shown again."
```

---

# 19. Business Rules & Validation

## 19.1 Whiteboard ID Rules

```
Format:    6-digit numeric string (not integer — preserve leading zeros conceptually)
Range:     100000 – 999999
Pool:      GLOBAL — shared with question_sets, ebooks, mocktests, etc.
           NEVER issue same ID to two different content types
Blocked:   000000, 111111, 222222, 333333, 444444, 555555,
           666666, 777777, 888888, 999999, 123456, 654321,
           112233, 998877, 121212, 111222, 999888
Reuse:     Deleted accounts' IDs can be reused after 90 days
Check:     Real-time API check during form input (debounced 500ms)
```

## 19.2 Password Rules

```
Same format as Whiteboard ID: 6-digit numeric
Blocked: Same weak list as IDs
Storage: bcrypt, 12 rounds — NEVER stored in plain text
Display: Shown ONCE at creation/reset — never retrievable after that
```

## 19.3 Login Security Rules

```
Failed attempts:      5 consecutive failures → lock account
Lockout duration:     30 minutes
Lockout message:      "Account locked. Try again in XX:XX"
On success:           Reset failed_attempts to 0
Admin reset:          [Reset Password] also clears failed_attempts + locked_until
Admin notification:   Email when account hits 5 failures (if setting enabled)
```

## 19.4 Org Toggle Rules

```
Toggle OFF:
  → All org whiteboard accounts: status='suspended'
  → suspended_reason='org_whiteboard_disabled'
  → All live sessions: force-terminated
  → All notes: preserved
  → Org Admin: whiteboard section removed from their panel

Toggle ON:
  → Only accounts suspended with reason='org_whiteboard_disabled' are reactivated
  → Accounts suspended for other reasons stay suspended
  → Org Admin: whiteboard section reappears

Cascade delete:
  → If org is hard-deleted: org_whiteboard_config deleted, accounts soft-deleted
```

## 19.5 AI Quota Rules

```
Reset:    1st of every month at 00:00 UTC
Overage:  HARD STOP — 0 tolerance. When quota hits monthly limit, AI returns 429.
Platform: If platform budget hits hard cap → ALL AI calls return 429 regardless of account quota
Manual:   Admin can reset any account's used_count to 0 at any time
Bulk:     Bulk update can be scoped to standalone / org-based / all / selected
Guard:    "only_if_below" option prevents reducing higher quotas unintentionally
```

## 19.6 Notes & Storage Rules

```
Soft delete:      Notes stay in trash for 30 days, then auto-hard-deleted + S3 removed
Hard delete:      Admin can force-hard-delete immediately (permanent = true)
Trash expiry:     BullMQ daily job runs DELETE WHERE is_deleted=true AND deleted_at < NOW()-30d
Storage limit:    Global platform limit (configurable in settings, default 500GB)
At limit:         New notes fail to save. Teacher gets "Storage full" error. Admin notified.
Share links:      Expire after 7 days (configurable). Each view increments share_views.
```

---

# 20. Error States & Edge Cases

## 20.1 UI Empty States (per section)

```
Accounts list — no results:
  Icon: 🖥️ (48px)
  Title: "No whiteboard accounts found"
  Sub:   "Try adjusting your filters or create a new account"
  CTA:   [Clear Filters] [+ Create Account]

Sessions — no live:
  Icon: 📡
  Title: "No active sessions right now"
  Sub:   "Sessions will appear here when teachers are online"

Notes — no results:
  Icon: 📝
  Title: "No notes found"
  Sub:   "Notes will appear here after teachers start classes"

AI Quotas — all normal:
  (no empty state — table always has data if accounts exist)
```

## 20.2 Loading States

```
Table loading:     Skeleton rows (5 rows, all columns shimmer)
Stats cards:       Skeleton number placeholder
Chart loading:     Gray placeholder box same height as chart
Detail page:       Full skeleton layout matching page structure
Inline save:       Spinner replaces ✓ button, disabled during save
Toggle switch:     Spinner inside switch circle during API call
```

## 20.3 Error Toast Messages

```
Account create fail (ID taken):  "Whiteboard ID already in use. Please generate a new one."
Account create fail (server):    "Failed to create account. Please try again."
Suspend fail (no sessions):      "Account suspended. (No active sessions to terminate)"
Session end fail:                "Failed to end session. Please refresh and try again."
Quota update fail:               "Failed to update quota. Please try again."
Org toggle fail:                 "Failed to update whiteboard access. Please try again."
Password reset fail:             "Password reset failed. Please try again."
```

## 20.4 Edge Cases

```
Simultaneous logins:
  Same whiteboard ID can be logged in from multiple devices simultaneously
  All count as one "account" — sessions tracked separately per device

Account in use during suspend:
  If 1+ sessions active when admin suspends:
    → Suspend proceeds immediately
    → Active sessions terminated with WebSocket notification
    → Notes auto-saved before termination

Org delete while whiteboard enabled:
  → Cascade: org_whiteboard_config deleted
  → All org whiteboard accounts soft-deleted
  → All live sessions terminated
  → Notes preserved in trash (30-day retention)

Quota reset date mismatch:
  If account created mid-month:
    → First reset on 1st of NEXT month
    → Pro-rated quota NOT applied (full quota from creation)

Duplicate ID attempt:
  Global uniqueness check at DB level (UNIQUE constraint)
  Frontend shows: "✗ ID taken — try regenerating"
  Backend returns: 409 Conflict with code: "WHITEBOARD_ID_TAKEN"
```

---

# 21. Backend Service Layer

## 21.1 `WhiteboardAccountService`

```typescript
class WhiteboardAccountService {
  // Generates a unique 6-digit ID not in weak list and not already used
  async generateUniqueId(): Promise<string>

  // Generates a strong 6-digit password not in weak list
  async generatePassword(): Promise<string>

  // Creates account: generates creds, hashes password, inserts row, logs activity
  async createAccount(payload: CreateWhiteboardAccountPayload, adminId: string): Promise<{
    account: WhiteboardAccount;
    password_plain: string;  // returned ONCE
  }>

  // Suspends account + terminates all live sessions
  async suspendAccount(accountId: string, adminId: string, reason?: string): Promise<{
    terminated_sessions: number;
  }>

  // Resets password: generates new, hashes, updates, optionally notifies
  async resetPassword(accountId: string, options: {
    custom?: string;
    notify_email?: boolean;
    notify_whatsapp?: boolean;
  }): Promise<{ new_password: string }>

  // Checks AI quota before allowing AI call
  async checkAndDecrementAiQuota(accountId: string): Promise<{
    allowed: boolean;
    remaining: number;
  }>
}
```

## 21.2 `OrgWhiteboardService`

```typescript
class OrgWhiteboardService {
  // Enables whiteboard for org + reactivates previously-disabled accounts
  async enableWhiteboard(orgId: string, adminId: string): Promise<void>

  // Disables whiteboard: suspends all org accounts + terminates sessions
  async disableWhiteboard(orgId: string, adminId: string): Promise<{
    accounts_suspended: number;
    sessions_terminated: number;
  }>
}
```

## 21.3 `WhiteboardAnalyticsService`

```typescript
class WhiteboardAnalyticsService {
  // Aggregated metrics for given period
  async getOverview(from: Date, to: Date): Promise<WhiteboardAnalyticsOverview>

  // Daily trend data for charts
  async getSessionsChart(from: Date, to: Date, granularity: 'day'|'week'|'month'): Promise<ChartDataPoint[]>

  // AI breakdown by action type
  async getAiChart(from: Date, to: Date, accountId?: string): Promise<AiChartData>

  // Per-org analytics table
  async getOrgsTable(from: Date, to: Date, pagination: PaginationParams): Promise<OrgAnalyticsRow[]>

  // Generate CSV or PDF export
  async exportReport(params: ExportParams): Promise<Buffer>
}
```

## 21.4 Background Jobs (BullMQ)

```typescript
// Job: Reset AI quota monthly (runs 1st of month, 00:00 UTC)
scheduler.add('reset-whiteboard-ai-quotas', '0 0 1 * *', async () => {
  await db.execute(
    'UPDATE whiteboard_accounts SET ai_quota_used = 0, ai_quota_reset_date = (DATE_TRUNC(\'month\', NOW()) + INTERVAL \'1 month\')'
  );
});

// Job: Clean trash notes (runs daily, 02:00 UTC)
scheduler.add('clean-whiteboard-trash', '0 2 * * *', async () => {
  const expired = await db.whiteboard_notes.findMany({
    where: { is_deleted: true, deleted_at: { lte: subDays(new Date(), 30) } }
  });
  for (const note of expired) {
    await s3.deleteObject({ Bucket: WB_BUCKET, Key: note.canvas_s3_key });
    await s3.deleteObject({ Bucket: WB_BUCKET, Key: note.thumbnail_s3_key });
    await db.whiteboard_notes.delete({ where: { id: note.id } });
  }
});

// Job: Check platform AI budget (runs hourly)
scheduler.add('check-platform-ai-budget', '0 * * * *', async () => {
  const used = await getTotalPlatformAiCallsThisMonth();
  const settings = await getWhiteboardSettings();
  const pct = (used / settings.platform_ai.monthly_budget) * 100;
  if (pct >= settings.platform_ai.alert_threshold_pct) {
    await sendAdminEmail('Platform AI Budget Alert', `${pct.toFixed(1)}% used`);
  }
});
```

---

# 22. AI IDE Developer Prompt

```
Tum EduHub Super Admin Panel mein "Whiteboard Management" module develop kar rahe ho.
Yeh existing Super Admin Panel ka ek naaya module hai — sab existing conventions EXACTLY follow karo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECH STACK (match exactly — EH-SA-FS-PRD-001)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend:   Next.js 14 App Router + TypeScript
CSS:        Tailwind CSS (no custom CSS files)
Components: shadcn/ui (already installed)
Icons:      Lucide React
Charts:     Recharts
Tables:     TanStack Table v8
Forms:      React Hook Form + Zod validation
State:      Zustand (global) + TanStack Query (server state)
Animations: Framer Motion
Toasts:     Sonner (already configured)

Backend:    Node.js + Express + TypeScript
ORM:        Prisma (existing schema — add new models)
DB:         PostgreSQL (AWS RDS — existing connection)
Cache:      Redis ElastiCache (existing)
Jobs:       BullMQ (existing queue setup)
Email:      AWS SES (existing ses.service.ts)
Auth:       JWT middleware (existing requireSuperAdmin middleware)
S3:         Existing S3 service for file upload/signed URLs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILES TO CREATE (Frontend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app/(admin)/whiteboard/page.tsx                    ← Overview dashboard
app/(admin)/whiteboard/accounts/page.tsx           ← Accounts list
app/(admin)/whiteboard/accounts/new/page.tsx       ← Create account
app/(admin)/whiteboard/accounts/[id]/page.tsx      ← Account detail
app/(admin)/whiteboard/accounts/[id]/edit/page.tsx ← Edit account
app/(admin)/whiteboard/org-access/page.tsx         ← Org access table
app/(admin)/whiteboard/ai-quotas/page.tsx          ← AI quota management
app/(admin)/whiteboard/sessions/page.tsx           ← Sessions monitor
app/(admin)/whiteboard/notes/page.tsx              ← Notes management
app/(admin)/whiteboard/analytics/page.tsx          ← Analytics + charts
app/(admin)/whiteboard/settings/page.tsx           ← Global settings

components/whiteboard/WhiteboardIdBadge.tsx
components/whiteboard/AiQuotaBar.tsx
components/whiteboard/StatusBadge.tsx
components/whiteboard/AccountTypeBadge.tsx
components/whiteboard/LiveSessionDot.tsx
components/whiteboard/CredentialDisplay.tsx
components/whiteboard/OrgAccessToggle.tsx
components/whiteboard/CreateAccountForm.tsx
components/whiteboard/AccountDetailTabs.tsx
components/whiteboard/OrgSettingsSlideOver.tsx
components/whiteboard/BulkQuotaModal.tsx
components/whiteboard/ForceEndSessionModal.tsx

lib/api/whiteboard.ts        ← TanStack Query hooks + API calls
lib/stores/whiteboard.ts     ← Zustand store (filters, UI state)
lib/validations/whiteboard.ts ← Zod schemas for all forms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILES TO CREATE (Backend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
src/routes/admin/whiteboard/
  accounts.routes.ts         ← CRUD + suspend/reset
  org-access.routes.ts       ← Org toggle + settings
  ai-quotas.routes.ts        ← Quota management
  sessions.routes.ts         ← Monitor + force-end
  notes.routes.ts            ← Notes + storage
  analytics.routes.ts        ← Charts + export
  settings.routes.ts         ← Global config

src/services/
  whiteboard-account.service.ts
  org-whiteboard.service.ts
  whiteboard-analytics.service.ts

src/jobs/
  reset-whiteboard-ai-quotas.job.ts
  clean-whiteboard-trash.job.ts
  check-platform-ai-budget.job.ts

prisma/migrations/
  XXXXXX_add_whiteboard_management/migration.sql

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SIDEBAR ADDITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add to existing sidebar config (components/layout/Sidebar.tsx):

{
  icon: Monitor,           // Lucide icon
  label: 'Whiteboard',
  href: '/whiteboard',
  children: [
    { label: 'Overview',    href: '/whiteboard' },
    { label: 'Accounts',    href: '/whiteboard/accounts' },
    { label: 'Org Access',  href: '/whiteboard/org-access' },
    { label: 'AI Quotas',   href: '/whiteboard/ai-quotas' },
    { label: 'Sessions',    href: '/whiteboard/sessions' },
    { label: 'Notes',       href: '/whiteboard/notes' },
    { label: 'Analytics',   href: '/whiteboard/analytics' },
    { label: 'Settings',    href: '/whiteboard/settings' },
  ]
}

Position: after Digital Board, before Student App

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Whiteboard ID globally unique — check against ALL content IDs in platform
2. Password shown ONCE at creation/reset — never stored plain text — bcrypt 12 rounds
3. 6-digit format everywhere — same as existing EduHub Set IDs
4. Org toggle OFF → ALL org accounts suspended immediately (cascade)
5. AI quota: HARD STOP at limit — no overage
6. Soft delete everywhere — hard delete only from trash job or explicit admin
7. ALL admin actions logged to whiteboard_activity_log
8. requireSuperAdmin middleware on ALL routes
9. Use existing design system — no new colors, no custom CSS
10. Match existing table/card/modal patterns from EH-SA-FE-PRD-001

Jo bhi PRD mein cover nahi hua — existing Super Admin Panel patterns exactly
follow karo. Loading states, error states, responsive layout — sab existing
conventions se match karo. Koi naaya pattern introduce mat karo.
```

---

*Document End*
*EduHub Super Admin — Whiteboard Management PRD v2.0 — March 2026 — Confidential*
*Prepared by: EduHub Product Team*
