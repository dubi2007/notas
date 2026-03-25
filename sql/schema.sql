-- ============================================================
-- SCHEMA: Notas App – Academic notes platform
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- FOLDERS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id  UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (char_length(name) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────
-- TEMPLATES
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (char_length(name) > 0),
  content    JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_select" ON public.templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "templates_insert" ON public.templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "templates_update" ON public.templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "templates_delete" ON public.templates FOR DELETE USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- NOTES
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id  UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT 'Untitled',
  content    JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────
-- TRIGGER: auto-update updated_at
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notes_set_updated_at ON public.notes;
CREATE TRIGGER notes_set_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ──────────────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_folders_user_id    ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id  ON public.folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id  ON public.templates(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id     ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id   ON public.notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_folder ON public.notes(user_id, folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_title       ON public.notes USING gin(to_tsvector('english', title));

-- ──────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes   ENABLE ROW LEVEL SECURITY;

-- FOLDERS policies
CREATE POLICY "folders_select" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "folders_insert" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "folders_update" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "folders_delete" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- NOTES policies
CREATE POLICY "notes_select" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notes_insert" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_update" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notes_delete" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- QR SESSIONS (WhatsApp Web style QR login)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.qr_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT,
  desktop_otp TEXT,
  confirmed   BOOLEAN NOT NULL DEFAULT false,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accessed only via service_role (admin client) — no RLS needed by users
-- Auto-cleanup: delete expired sessions
CREATE INDEX IF NOT EXISTS idx_qr_sessions_expires ON public.qr_sessions(expires_at);

-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  code       TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email      ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- STORAGE bucket: note-images
-- Run this block in Supabase SQL Editor (separate from the tables above)
-- ──────────────────────────────────────────────────────────

-- 1. Create the public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload to their own subfolder
--    Files are stored as: {user_id}/{timestamp}-{random}.{ext}
CREATE POLICY "images_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'note-images'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- 3. Anyone can read (bucket is public – needed for <img src=...>)
CREATE POLICY "images_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'note-images');

-- 4. Users can only delete their own images
CREATE POLICY "images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'note-images'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
