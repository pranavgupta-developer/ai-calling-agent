-- Migration: Add status, is_active, is_featured to Properties

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'available',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Add index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- Add index on is_active for faster filtering
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON public.properties(is_active);

-- Add index on agency_id since we filter by it
CREATE INDEX IF NOT EXISTS idx_properties_agency_id ON public.properties(agency_id);
