-- backend/supabase_schema.sql
-- Wedding Speech Analyzer | PUSL3190 | Student: 10952648 | Run in Supabase SQL Editor

DROP TABLE IF EXISTS public.highlights CASCADE;
DROP TABLE IF EXISTS public.transcript_segments CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.audio_files CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'videographer' CHECK (role IN ('videographer', 'editor', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_date DATE,
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'si')),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'ready', 'failed')),
    step_index INTEGER NOT NULL DEFAULT 0,
    step_label TEXT NOT NULL DEFAULT 'Queued',
    error_message TEXT,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.audio_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.transcript_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    speaker TEXT NOT NULL DEFAULT 'Speaker 1',
    start_time FLOAT NOT NULL,
    end_time FLOAT NOT NULL,
    text TEXT NOT NULL,
    highlight_label TEXT CHECK (highlight_label IN ('Emotional Peak', 'Humor', 'Toast', 'Vows', 'Advice') OR highlight_label IS NULL),
    highlight_score FLOAT DEFAULT 0.0,
    segment_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES public.transcript_segments(id) ON DELETE SET NULL,
    score FLOAT NOT NULL,
    label TEXT NOT NULL,
    start_time FLOAT NOT NULL,
    end_time FLOAT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_update_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER jobs_update_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX idx_transcript_job_id ON public.transcript_segments(job_id);
CREATE INDEX idx_transcript_segment_idx ON public.transcript_segments(job_id, segment_index);
CREATE INDEX idx_highlights_job_id ON public.highlights(job_id);
CREATE INDEX idx_highlights_score ON public.highlights(job_id, score DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, read);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- service_role key used by FastAPI bypasses RLS automatically. These policies block direct anon access.
CREATE POLICY service_role_access ON public.profiles
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY service_role_access ON public.jobs
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY service_role_access ON public.audio_files
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY service_role_access ON public.transcript_segments
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY service_role_access ON public.highlights
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY service_role_access ON public.notifications
FOR ALL TO service_role
USING (true)
WITH CHECK (true);
