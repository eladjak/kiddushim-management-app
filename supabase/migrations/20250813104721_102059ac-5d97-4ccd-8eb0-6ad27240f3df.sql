-- Fix remaining security issues
-- 1. Add proper RLS policies for the public_profiles view
-- 2. Fix function search_path issues

-- First, ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Update functions to have proper search_path set
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.can_view_profile_details(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    -- Users can always view their own profile
    WHEN profile_user_id = auth.uid() THEN true
    -- Admins and coordinators can view all profile details
    WHEN public.get_current_user_role() IN ('admin', 'coordinator') THEN true
    -- Others cannot view full profile details
    ELSE false
  END;
$$;

-- Drop the public_profiles view since it creates a security backdoor
-- Instead, applications should use the profiles table directly with proper RLS
DROP VIEW IF EXISTS public.public_profiles;

-- Update profiles table RLS policies to be more secure
-- Drop existing potentially overly permissive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;

-- Create secure RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins and coordinators can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'coordinator')
  )
);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "New users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());