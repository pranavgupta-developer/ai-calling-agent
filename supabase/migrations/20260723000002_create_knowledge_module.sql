-- Migration: Create Knowledge Base Module
-- Creates categories, entries, and relations

-- Drop the old knowledge_base table and its dependencies
DROP TABLE IF EXISTS public.knowledge_base CASCADE;

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create Knowledge Categories Table
CREATE TABLE IF NOT EXISTS public.knowledge_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at for knowledge_categories
DROP TRIGGER IF EXISTS update_knowledge_categories_updated_at ON public.knowledge_categories;
CREATE TRIGGER update_knowledge_categories_updated_at
BEFORE UPDATE ON public.knowledge_categories
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create Knowledge Entries Table
CREATE TABLE IF NOT EXISTS public.knowledge_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.knowledge_categories(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}'::TEXT[],
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DRAFT')),
    is_ai_enabled BOOLEAN NOT NULL DEFAULT true,
    
    -- AI Ready Fields
    embedding VECTOR(1536), -- Assuming OpenAI text-embedding-3-small
    search_text TEXT,
    confidence_score FLOAT,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    language TEXT NOT NULL DEFAULT 'en',
    source_type TEXT NOT NULL DEFAULT 'DEFAULT_FAQ' CHECK (source_type IN ('DEFAULT_FAQ', 'CUSTOM_FAQ', 'IMPORTED', 'LEARNED')),
    
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at for knowledge_entries
DROP TRIGGER IF EXISTS update_knowledge_entries_updated_at ON public.knowledge_entries;
CREATE TRIGGER update_knowledge_entries_updated_at
BEFORE UPDATE ON public.knowledge_entries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create Knowledge Entry Services Junction Table
CREATE TABLE IF NOT EXISTS public.knowledge_entry_services (
    knowledge_entry_id UUID NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    PRIMARY KEY (knowledge_entry_id, service_id)
);

-- Create Knowledge Entry Listings Junction Table
CREATE TABLE IF NOT EXISTS public.knowledge_entry_listings (
    knowledge_entry_id UUID NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    PRIMARY KEY (knowledge_entry_id, listing_id)
);

-- Create Knowledge Entry Versions Table (for AI debugging)
CREATE TABLE IF NOT EXISTS public.knowledge_entry_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knowledge_entry_id UUID NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Knowledge Usage Logs Table
CREATE TABLE IF NOT EXISTS public.knowledge_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    knowledge_entry_id UUID REFERENCES public.knowledge_entries(id) ON DELETE SET NULL,
    conversation_id UUID, -- Assuming we might link to an external agent conversation ID later
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    customer_question TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance and AI retrieval
CREATE INDEX IF NOT EXISTS idx_knowledge_categories_agency_id ON public.knowledge_categories(agency_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_entries_agency_id ON public.knowledge_entries(agency_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_category_id ON public.knowledge_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_status ON public.knowledge_entries(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_created_at ON public.knowledge_entries(created_at);
-- Vector index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_embedding ON public.knowledge_entries USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_knowledge_usage_logs_agency_id ON public.knowledge_usage_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_usage_logs_entry_id ON public.knowledge_usage_logs(knowledge_entry_id);


-- Enable RLS
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entry_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entry_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entry_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_usage_logs ENABLE ROW LEVEL SECURITY;


-- RLS Policies for knowledge_categories
DROP POLICY IF EXISTS "Users can view knowledge categories of their agency" ON public.knowledge_categories;
CREATE POLICY "Users can view knowledge categories of their agency" ON public.knowledge_categories FOR SELECT TO authenticated
USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert knowledge categories for their agency" ON public.knowledge_categories;
CREATE POLICY "Users can insert knowledge categories for their agency" ON public.knowledge_categories FOR INSERT TO authenticated
WITH CHECK (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update knowledge categories of their agency" ON public.knowledge_categories;
CREATE POLICY "Users can update knowledge categories of their agency" ON public.knowledge_categories FOR UPDATE TO authenticated
USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete knowledge categories of their agency" ON public.knowledge_categories;
CREATE POLICY "Users can delete knowledge categories of their agency" ON public.knowledge_categories FOR DELETE TO authenticated
USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()));


-- RLS Policies for knowledge_entries
DROP POLICY IF EXISTS "Users can view knowledge entries of their agency" ON public.knowledge_entries;
CREATE POLICY "Users can view knowledge entries of their agency" ON public.knowledge_entries FOR SELECT TO authenticated
USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert knowledge entries for their agency" ON public.knowledge_entries;
CREATE POLICY "Users can insert knowledge entries for their agency" ON public.knowledge_entries FOR INSERT TO authenticated
WITH CHECK (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update knowledge entries of their agency" ON public.knowledge_entries;
CREATE POLICY "Users can update knowledge entries of their agency" ON public.knowledge_entries FOR UPDATE TO authenticated
USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete knowledge entries of their agency" ON public.knowledge_entries;
CREATE POLICY "Users can delete knowledge entries of their agency" ON public.knowledge_entries FOR DELETE TO authenticated
USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()));


-- RLS Policies for knowledge_entry_services
DROP POLICY IF EXISTS "Users can view knowledge entry services of their agency" ON public.knowledge_entry_services;
CREATE POLICY "Users can view knowledge entry services of their agency" ON public.knowledge_entry_services FOR SELECT TO authenticated
USING (knowledge_entry_id IN (
    SELECT id FROM public.knowledge_entries WHERE agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
));

DROP POLICY IF EXISTS "Users can insert knowledge entry services for their agency" ON public.knowledge_entry_services;
CREATE POLICY "Users can insert knowledge entry services for their agency" ON public.knowledge_entry_services FOR INSERT TO authenticated
WITH CHECK (knowledge_entry_id IN (
    SELECT id FROM public.knowledge_entries WHERE agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
));

DROP POLICY IF EXISTS "Users can delete knowledge entry services of their agency" ON public.knowledge_entry_services;
CREATE POLICY "Users can delete knowledge entry services of their agency" ON public.knowledge_entry_services FOR DELETE TO authenticated
USING (knowledge_entry_id IN (
    SELECT id FROM public.knowledge_entries WHERE agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
));


-- RLS Policies for knowledge_entry_listings
DROP POLICY IF EXISTS "Users can view knowledge entry listings of their agency" ON public.knowledge_entry_listings;
CREATE POLICY "Users can view knowledge entry listings of their agency" ON public.knowledge_entry_listings FOR SELECT TO authenticated
USING (knowledge_entry_id IN (
    SELECT id FROM public.knowledge_entries WHERE agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
));

DROP POLICY IF EXISTS "Users can insert knowledge entry listings for their agency" ON public.knowledge_entry_listings;
CREATE POLICY "Users can insert knowledge entry listings for their agency" ON public.knowledge_entry_listings FOR INSERT TO authenticated
WITH CHECK (knowledge_entry_id IN (
    SELECT id FROM public.knowledge_entries WHERE agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
));

DROP POLICY IF EXISTS "Users can delete knowledge entry listings of their agency" ON public.knowledge_entry_listings;
CREATE POLICY "Users can delete knowledge entry listings of their agency" ON public.knowledge_entry_listings FOR DELETE TO authenticated
USING (knowledge_entry_id IN (
    SELECT id FROM public.knowledge_entries WHERE agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
));


-- RLS Policies for knowledge_entry_versions
DROP POLICY IF EXISTS "Users can view knowledge entry versions of their agency" ON public.knowledge_entry_versions;
CREATE POLICY "Users can view knowledge entry versions of their agency" ON public.knowledge_entry_versions FOR SELECT TO authenticated
USING (knowledge_entry_id IN (
    SELECT id FROM public.knowledge_entries WHERE agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
));

DROP POLICY IF EXISTS "Users can insert knowledge entry versions for their agency" ON public.knowledge_entry_versions;
CREATE POLICY "Users can insert knowledge entry versions for their agency" ON public.knowledge_entry_versions FOR INSERT TO authenticated
WITH CHECK (knowledge_entry_id IN (
    SELECT id FROM public.knowledge_entries WHERE agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()
    )
));


-- RLS Policies for knowledge_usage_logs
DROP POLICY IF EXISTS "Users can view knowledge usage logs of their agency" ON public.knowledge_usage_logs;
CREATE POLICY "Users can view knowledge usage logs of their agency" ON public.knowledge_usage_logs FOR SELECT TO authenticated
USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert knowledge usage logs for their agency" ON public.knowledge_usage_logs;
CREATE POLICY "Users can insert knowledge usage logs for their agency" ON public.knowledge_usage_logs FOR INSERT TO authenticated
WITH CHECK (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid() UNION SELECT agency_id FROM public.agency_users WHERE auth_user_id = auth.uid()));


-- Grant privileges
GRANT ALL ON TABLE public.knowledge_categories TO authenticated, service_role;
GRANT ALL ON TABLE public.knowledge_entries TO authenticated, service_role;
GRANT ALL ON TABLE public.knowledge_entry_services TO authenticated, service_role;
GRANT ALL ON TABLE public.knowledge_entry_listings TO authenticated, service_role;
GRANT ALL ON TABLE public.knowledge_entry_versions TO authenticated, service_role;
GRANT ALL ON TABLE public.knowledge_usage_logs TO authenticated, service_role;

-- Create RPC for semantic search
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_agency_id uuid
)
RETURNS TABLE (
  id uuid,
  question text,
  answer text,
  keywords text[],
  priority text,
  status text,
  confidence_score float,
  similarity float,
  source_type text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ke.id,
    ke.question,
    ke.answer,
    ke.keywords,
    ke.priority,
    ke.status,
    ke.confidence_score,
    1 - (ke.embedding <=> query_embedding) as similarity,
    ke.source_type
  FROM
    public.knowledge_entries ke
  WHERE
    ke.agency_id = p_agency_id
    AND ke.status = 'ACTIVE'
    AND ke.is_ai_enabled = true
    AND 1 - (ke.embedding <=> query_embedding) > match_threshold
  ORDER BY
    ke.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
