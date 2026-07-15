-- Migration: Setup Retrieval Engine
-- Creates search_logs, adds tsvector for FTS, and creates GIN indexes

-- 1. search_logs table
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_found INTEGER NOT NULL DEFAULT 0,
    search_time_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for search_logs
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert search logs for their agency"
ON public.search_logs FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can view search logs for their agency"
ON public.search_logs FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Grant permissions for search_logs
GRANT SELECT, INSERT ON TABLE public.search_logs TO authenticated;
GRANT SELECT, INSERT ON TABLE public.search_logs TO service_role;


-- 2. Add tsvector to properties and knowledge_base
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS fts tsvector;

ALTER TABLE public.knowledge_base
ADD COLUMN IF NOT EXISTS fts tsvector;

-- 3. Functions to update tsvector
CREATE OR REPLACE FUNCTION properties_fts_update() RETURNS trigger AS $$
BEGIN
  NEW.fts :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.property_type, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.amenities::text, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION knowledge_base_fts_update() RETURNS trigger AS $$
BEGIN
  NEW.fts :=
    setweight(to_tsvector('english', coalesce(NEW.question, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.tags::text, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.search_text, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.answer, '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;


-- 4. Triggers to automatically update fts
DROP TRIGGER IF EXISTS tsvectorupdate ON public.properties;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON public.properties FOR EACH ROW EXECUTE FUNCTION properties_fts_update();

DROP TRIGGER IF EXISTS tsvectorupdate ON public.knowledge_base;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON public.knowledge_base FOR EACH ROW EXECUTE FUNCTION knowledge_base_fts_update();


-- 5. Indexes
-- GIN indexes for fast full text search
CREATE INDEX IF NOT EXISTS properties_fts_idx ON public.properties USING GIN (fts);
CREATE INDEX IF NOT EXISTS knowledge_base_fts_idx ON public.knowledge_base USING GIN (fts);

-- Indexes for ranking & filtering (if not exists)
CREATE INDEX IF NOT EXISTS properties_updated_at_idx ON public.properties(updated_at DESC);
CREATE INDEX IF NOT EXISTS knowledge_base_updated_at_idx ON public.knowledge_base(updated_at DESC);
CREATE INDEX IF NOT EXISTS knowledge_base_tags_idx ON public.knowledge_base USING GIN (tags);

-- Backfill fts for existing records
UPDATE public.properties SET id = id; -- forces trigger to fire
UPDATE public.knowledge_base SET id = id; -- forces trigger to fire
