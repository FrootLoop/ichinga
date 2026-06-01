-- Translations catalogue
CREATE TABLE IF NOT EXISTS translations (
  id         TEXT    PRIMARY KEY,
  name       TEXT    NOT NULL,
  admin_only BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Seed built-in translations
INSERT INTO translations (id, name, admin_only, sort_order) VALUES
  ('en', 'English',  false, 0),
  ('fr', 'Français', false, 1)
ON CONFLICT (id) DO NOTHING;

-- All clients may read the translations list
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "translations_public_read" ON translations;
CREATE POLICY "translations_public_read" ON translations
  FOR SELECT USING (true);

-- Ensure profiles table exists (may have been created manually)
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Store each user's preferred translation
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS translation_id TEXT NOT NULL DEFAULT 'en';
