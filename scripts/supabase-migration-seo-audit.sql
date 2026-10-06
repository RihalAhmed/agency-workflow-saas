-- Prosflow SEO Audit — Supabase Migration
-- Run this in the Supabase Dashboard → SQL Editor
--
-- Adds two JSONB columns to the 'audits' table:
--   audit_result    — stores the full structured audit output JSON
--   category_scores — stores per-category letter grades

ALTER TABLE audits ADD COLUMN IF NOT EXISTS audit_result jsonb;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS category_scores jsonb;

-- Also add a target_keyword column for user-specified keyword override
ALTER TABLE audits ADD COLUMN IF NOT EXISTS target_keyword text;
