-- Migration: Update AI Agents Table
-- Adjusts schema to match exact AI Agent Management requirements.

-- 1. Rename greeting_message to greeting
ALTER TABLE public.ai_agents RENAME COLUMN greeting_message TO greeting;

-- 2. Add new columns and adjust types
ALTER TABLE public.ai_agents 
  ADD COLUMN IF NOT EXISTS tool_permissions JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS response_style TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3. Replace fallback_to_human (BOOLEAN) with fallback_mode (TEXT)
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS fallback_mode TEXT DEFAULT 'handoff_to_human';

-- Assuming we want to drop fallback_to_human if it existed, we do it safely:
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ai_agents' AND column_name = 'fallback_to_human'
    ) THEN
        ALTER TABLE public.ai_agents DROP COLUMN fallback_to_human;
    END IF;
END $$;

-- 4. Create an index on deleted_at to speed up filtering of non-deleted rows
CREATE INDEX IF NOT EXISTS idx_ai_agents_deleted_at ON public.ai_agents(deleted_at);
