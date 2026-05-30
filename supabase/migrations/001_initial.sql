-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Readings table
CREATE TABLE IF NOT EXISTS readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  lines INTEGER[] NOT NULL,
  primary_hexagram INTEGER NOT NULL,
  transformed_hexagram INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own readings
CREATE POLICY "Users can view own readings"
  ON readings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own readings
CREATE POLICY "Users can insert own readings"
  ON readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own readings
CREATE POLICY "Users can delete own readings"
  ON readings FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries by user
CREATE INDEX readings_user_id_idx ON readings(user_id);
CREATE INDEX readings_created_at_idx ON readings(created_at DESC);
