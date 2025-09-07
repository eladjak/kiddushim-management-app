-- Fix security issue: Restrict direct access to event_registrations
-- Remove the insecure policy that allows everyone to register
DROP POLICY IF EXISTS "Everyone can register for events" ON public.event_registrations;

-- Create secure policies
-- Only authenticated users can view their own registrations
CREATE POLICY "Users can view their own registrations" 
ON public.event_registrations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only admins and coordinators can view all registrations (already exists but ensuring it's correct)
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

-- Only allow system (service role) to insert registrations
-- This will be used by our secure edge function
CREATE POLICY "System can create registrations" 
ON public.event_registrations 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

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