-- Fix remaining security issues by properly handling existing policies
-- 1. Fix function search_path issues
-- 2. Remove insecure view
-- 3. Update RLS policies securely

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
-- Applications should use the profiles table directly with proper RLS
DROP VIEW IF EXISTS public.public_profiles;

-- Drop overly permissive policies that allow all authenticated users to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;

-- Add secure policy for admins and coordinators to view all profiles
-- Only if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Admins and coordinators can view all profiles'
    ) THEN
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
    END IF;
END $$;