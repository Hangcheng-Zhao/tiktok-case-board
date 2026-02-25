-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- This creates the two tables needed for the TikTok Case Discussion app
-- Supports multiple sessions (A, B, C)

-- 1. Session config (one row per session)
CREATE TABLE session_config (
  session_id TEXT PRIMARY KEY,
  current_step INTEGER NOT NULL DEFAULT 0,
  display_mode TEXT NOT NULL DEFAULT 'controlled' CHECK (display_mode IN ('controlled', 'live')),
  revealed_step INTEGER NOT NULL DEFAULT -1
);

-- Insert config rows for each section
INSERT INTO session_config (session_id) VALUES ('A'), ('B'), ('C');

-- 2. Responses table
CREATE TABLE responses (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  step INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  answer TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  poll_choice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookups by session and step
CREATE INDEX idx_responses_session_step ON responses(session_id, step);

-- Create unique constraint to prevent duplicate submissions
CREATE UNIQUE INDEX idx_responses_unique ON responses(session_id, step, student_name);

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
