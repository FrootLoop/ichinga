-- Per-user translation preferences: which translations appear in the spinner.
-- NULL means not yet set (app defaults to English only).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enabled_translations text[] DEFAULT NULL;
