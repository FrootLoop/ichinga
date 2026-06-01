-- Add Persian translation to the catalogue (admin-only by default)
INSERT INTO translations (id, name, admin_only, sort_order) VALUES
  ('fa', 'فارسی', true, 2)
ON CONFLICT (id) DO NOTHING;
