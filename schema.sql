-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- This creates the two tables needed for the TikTok Case Discussion app

-- 1. Session config (single row, controls the current state)
CREATE TABLE session_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_step INTEGER NOT NULL DEFAULT 0,
  display_mode TEXT NOT NULL DEFAULT 'controlled' CHECK (display_mode IN ('controlled', 'live')),
  revealed_step INTEGER NOT NULL DEFAULT -1
);

-- Insert the single config row
INSERT INTO session_config (id, current_step, display_mode, revealed_step)
VALUES (1, 0, 'controlled', -1);

-- 2. Responses table
CREATE TABLE responses (
  id BIGSERIAL PRIMARY KEY,
  step INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  answer TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  poll_choice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookups by step
CREATE INDEX idx_responses_step ON responses(step);

-- Create unique constraint to prevent duplicate submissions
CREATE UNIQUE INDEX idx_responses_unique_student_step ON responses(step, student_name);

-- Enable Row Level Security (required by Supabase)
ALTER TABLE session_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Public policies (no auth needed for classroom use)
CREATE POLICY "Allow public read session_config"
  ON session_config FOR SELECT
  USING (true);

CREATE POLICY "Allow public update session_config"
  ON session_config FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read responses"
  ON responses FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert responses"
  ON responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete responses"
  ON responses FOR DELETE
  USING (true);

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE session_config;
ALTER PUBLICATION supabase_realtime ADD TABLE responses;
