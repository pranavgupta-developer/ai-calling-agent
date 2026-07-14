-- Create the service_templates table
CREATE TABLE IF NOT EXISTS public.service_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    pricing_type TEXT DEFAULT 'FIXED',
    fixed_price NUMERIC,
    min_price NUMERIC,
    max_price NUMERIC,
    currency TEXT DEFAULT 'INR',
    duration_minutes INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.service_templates ENABLE ROW LEVEL SECURITY;

-- Policies for service_templates (Readable by all authenticated users)
CREATE POLICY "Allow authenticated users to read service templates"
ON public.service_templates
FOR SELECT
TO authenticated
USING (true);

-- Insert 32 professional real-estate service templates
INSERT INTO public.service_templates (name, description, category, pricing_type, fixed_price, min_price, max_price, duration_minutes) VALUES
-- Consultations
('Buyer Consultation', 'Initial meeting to discuss buying preferences, budget, and timeline.', 'Buyer Consultation', 'FREE', 0, NULL, NULL, 45),
('Seller Consultation', 'Meeting to evaluate property, discuss market trends, and set a listing price strategy.', 'Seller Consultation', 'FREE', 0, NULL, NULL, 60),
('Rental Consultation', 'Guidance for tenants seeking properties for rent, including lease terms and requirements.', 'Rental Consultation', 'FREE', 0, NULL, NULL, 30),
('Investment Consultation', 'Strategic planning for real estate investors regarding ROI, locations, and market trends.', 'Investment Consultation', 'HOURLY', 150, NULL, NULL, 60),
('Luxury Property Consultation', 'Specialized consultation for high-net-worth clients seeking luxury real estate.', 'Luxury Property Consultation', 'FREE', 0, NULL, NULL, 90),
('Office Consultation', 'Consultation for businesses seeking office spaces for lease or purchase.', 'Office Consultation', 'FREE', 0, NULL, NULL, 45),
('Retail Consultation', 'Expert advice for finding optimal retail locations and negotiating commercial leases.', 'Retail Consultation', 'FREE', 0, NULL, NULL, 45),
('Builder Consultation', 'Meeting with builders and developers to discuss project marketing and sales strategies.', 'Builder Consultation', 'HOURLY', 200, NULL, NULL, 60),

-- Viewings and Tours
('Property Viewing', 'In-person guided tour of a specific property.', 'Property Viewing', 'FREE', 0, NULL, NULL, 30),
('Virtual Tour', 'Guided virtual walk-through of a property via video call.', 'Virtual Tour', 'FREE', 0, NULL, NULL, 30),

-- Transactions (Residential)
('Residential Sale', 'End-to-end service for selling a residential property.', 'Residential Sale', 'COMMISSION', NULL, NULL, NULL, NULL),
('Residential Purchase', 'Comprehensive assistance in finding, negotiating, and purchasing a home.', 'Residential Purchase', 'COMMISSION', NULL, NULL, NULL, NULL),
('Residential Rental', 'Assistance in listing and finding a tenant for a residential property.', 'Residential Rental', 'FIXED', 500, NULL, NULL, NULL),

-- Transactions (Commercial & Land)
('Commercial Sale', 'End-to-end service for selling commercial real estate.', 'Commercial Sale', 'COMMISSION', NULL, NULL, NULL, NULL),
('Commercial Lease', 'Assistance in leasing commercial properties for landlords or tenants.', 'Commercial Lease', 'COMMISSION', NULL, NULL, NULL, NULL),
('Land Purchase', 'Assistance in acquiring residential, commercial, or agricultural land.', 'Land Purchase', 'COMMISSION', NULL, NULL, NULL, NULL),
('Land Sale', 'Marketing and selling vacant land plots.', 'Land Sale', 'COMMISSION', NULL, NULL, NULL, NULL),

-- Property Management
('Property Management', 'Ongoing management of rental properties, including maintenance and tenant relations.', 'Property Management', 'PERCENTAGE', NULL, NULL, NULL, NULL),
('Tenant Screening', 'Comprehensive background, credit, and reference checks for potential tenants.', 'Tenant Screening', 'FIXED', 50, NULL, NULL, NULL),
('Rent Collection', 'Monthly collection and remittance of rent payments.', 'Rent Collection', 'PERCENTAGE', NULL, NULL, NULL, NULL),

-- Financial Services
('Home Loan Assistance', 'Guidance and processing support for acquiring a residential mortgage.', 'Home Loan Assistance', 'FREE', 0, NULL, NULL, 45),
('Mortgage Consultation', 'Expert advice on refinancing, loan types, and interest rates.', 'Mortgage Consultation', 'FREE', 0, NULL, NULL, 30),
('Property Valuation', 'Professional assessment of a property''s current market value.', 'Property Valuation', 'FIXED', 300, NULL, NULL, 120),

-- Legal and Documentation
('Legal Documentation', 'Assistance with property registration, title deeds, and legal paperwork.', 'Legal Documentation', 'FIXED', 500, NULL, NULL, NULL),
('Agreement Review', 'Professional review of lease agreements, sale deeds, or developer contracts.', 'Agreement Review', 'FIXED', 150, NULL, NULL, 60),

-- Marketing and Presentation
('Property Listing', 'Professional creation and distribution of a property listing across major portals.', 'Property Listing', 'FIXED', 100, NULL, NULL, NULL),
('Photography', 'Professional photo shoot for real estate listings.', 'Photography', 'FIXED', 200, NULL, NULL, 120),
('Drone Photography', 'Aerial photography and videography for large properties or land.', 'Drone Photography', 'FIXED', 350, NULL, NULL, 90),
('Virtual Staging', 'Digital staging of empty rooms to enhance property appeal in online listings.', 'Virtual Staging', 'FIXED', 250, NULL, NULL, NULL),

-- Specialized Services
('Pre-launch Booking', 'Assistance with early-bird booking and negotiation for new developments.', 'Pre-launch Booking', 'FREE', 0, NULL, NULL, 60),
('NRI Property Assistance', 'End-to-end real estate management and investment support for Non-Resident Indians.', 'NRI Property Assistance', 'FIXED', 1000, NULL, NULL, NULL),
('Relocation Assistance', 'Comprehensive support for individuals or corporate teams moving to a new city.', 'Relocation Assistance', 'FIXED', 750, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;
