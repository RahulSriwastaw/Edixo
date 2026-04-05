-- Safe single-owner cleanup script (manual execution)
-- Purpose: remove legacy multi-tenant/org structures after validating single-owner runtime.
-- IMPORTANT:
-- 1) Take a full PostgreSQL backup before executing.
-- 2) Run in a maintenance window.
-- 3) Review table list and remove any table you still need.

BEGIN;

-- Optional: keep a marker in case this script is applied.
CREATE TABLE IF NOT EXISTS platform_schema_changes (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

INSERT INTO platform_schema_changes (id, notes)
VALUES ('single-owner-org-cleanup-v1', 'Removed legacy org/multi-tenant tables')
ON CONFLICT (id) DO NOTHING;

-- Drop core org root first (CASCADE handles dependent foreign keys).
-- Keep whiteboard + platform audit tables intact.
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop known org/multi-tenant domain tables (idempotent).
DROP TABLE IF EXISTS org_feature_flags CASCADE;
DROP TABLE IF EXISTS org_staff CASCADE;
DROP TABLE IF EXISTS org_notifications CASCADE;
DROP TABLE IF EXISTS org_personalization_settings CASCADE;
DROP TABLE IF EXISTS whiteboard_settings CASCADE;
DROP TABLE IF EXISTS admin_curated_suggestions CASCADE;
DROP TABLE IF EXISTS study_plan_templates CASCADE;
DROP TABLE IF EXISTS auto_set_configs CASCADE;
DROP TABLE IF EXISTS ai_credit_transactions CASCADE;
DROP TABLE IF EXISTS org_audit_logs CASCADE;
DROP TABLE IF EXISTS bulk_upload_batches CASCADE;
DROP TABLE IF EXISTS bulk_upload_rows CASCADE;

-- Legacy education domain tables tied to org model.
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS super_admins CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS batch_students CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS qbank_folders CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS question_reports CASCADE;
DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS question_sets CASCADE;
DROP TABLE IF EXISTS question_set_items CASCADE;
DROP TABLE IF EXISTS mock_tests CASCADE;
DROP TABLE IF EXISTS mock_test_sections CASCADE;
DROP TABLE IF EXISTS mock_test_batches CASCADE;
DROP TABLE IF EXISTS test_attempts CASCADE;
DROP TABLE IF EXISTS attempt_answers CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;
DROP TABLE IF EXISTS fee_transactions CASCADE;
DROP TABLE IF EXISTS student_practice_sets CASCADE;
DROP TABLE IF EXISTS student_question_history CASCADE;
DROP TABLE IF EXISTS student_topic_mastery CASCADE;
DROP TABLE IF EXISTS student_study_plans CASCADE;
DROP TABLE IF EXISTS student_personalization_statuses CASCADE;
DROP TABLE IF EXISTS exam_folders CASCADE;
DROP TABLE IF EXISTS exam_categories CASCADE;
DROP TABLE IF EXISTS exam_sub_categories CASCADE;

-- Preserve these single-owner tables:
-- - whiteboard_accounts
-- - whiteboard_sessions
-- - platform_audit_logs
-- - _prisma_migrations

COMMIT;
