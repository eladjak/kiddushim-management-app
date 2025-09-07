-- Fix security issue: Secure event registrations
-- First, drop all existing policies to rebuild them securely
DROP POLICY IF EXISTS "Everyone can register for events" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins and coordinators can view registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can update registrations" ON public.event_registrations;

-- Create new secure policies
-- Only allow system (via edge functions) to insert registrations
CREATE POLICY "Secure registration via system only" 
ON public.event_registrations 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Admins and coordinators can view all registrations
CREATE POLICY "Staff can view all registrations" 
ON public.event_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'coordinator')
  )
);

-- Admins can update registrations
CREATE POLICY "Admins can update registrations" 
ON public.event_registrations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Add rate limiting table for registration security
CREATE TABLE IF NOT EXISTS public.registration_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  attempts INTEGER DEFAULT 1,
  first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rate limits table
ALTER TABLE public.registration_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System manages rate limits" 
ON public.registration_rate_limits 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');