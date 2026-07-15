-- Migration: Create Knowledge Base Table
-- Creates the `knowledge_base` table, enum, indexes, and sets up RLS policies.

-- Create Source Enum
DO $$ BEGIN
    CREATE TYPE public.knowledge_base_source_enum AS ENUM ('SYSTEM', 'CUSTOM', 'IMPORTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Knowledge Base Table
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    search_keywords TEXT,
    source public.knowledge_base_source_enum NOT NULL DEFAULT 'CUSTOM',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for performance and AI retrieval
CREATE INDEX IF NOT EXISTS idx_knowledge_base_agency_id ON public.knowledge_base(agency_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_is_active ON public.knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_display_order ON public.knowledge_base(display_order);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at_desc ON public.knowledge_base(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_deleted_at ON public.knowledge_base(deleted_at);

-- Add a basic index for question
CREATE INDEX IF NOT EXISTS idx_knowledge_base_question ON public.knowledge_base(question);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Select: Agency users can view non-deleted knowledge base entries from their own agency
CREATE POLICY "Users can view knowledge base of their agency"
ON public.knowledge_base FOR SELECT
TO authenticated
USING (
    deleted_at IS NULL AND
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Insert: Agency users can insert entries for their own agency
CREATE POLICY "Users can insert knowledge base for their agency"
ON public.knowledge_base FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Update: Agency users can update their non-deleted entries
CREATE POLICY "Users can update knowledge base for their agency"
ON public.knowledge_base FOR UPDATE
TO authenticated
USING (
    deleted_at IS NULL AND
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Delete: Agency users can physically delete their entries
CREATE POLICY "Users can delete knowledge base for their agency"
ON public.knowledge_base FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
        UNION
        SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
);

-- Grant privileges to roles
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.knowledge_base TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.knowledge_base TO service_role;
