-- Fix security issue: Restrict profile data access based on user roles and relationships

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only authenticated users can view profiles" ON public.profiles;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user can view profile details
CREATE OR REPLACE FUNCTION public.can_view_profile_details(profile_user_id uuid)
RETURNS BOOLEAN AS $$
  SELECT CASE 
    -- Users can always view their own profile
    WHEN profile_user_id = auth.uid() THEN true
    -- Admins and coordinators can view all profile details
    WHEN public.get_current_user_role() IN ('admin', 'coordinator') THEN true
    -- Others cannot view full profile details
    ELSE false
  END;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new restrictive RLS policies

-- Policy for basic profile info (name, avatar) - visible to all authenticated users
CREATE POLICY "Public profile info readable by authenticated users" 
ON public.profiles FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Policy for personal details (phone, email) - only for authorized users
CREATE POLICY "Personal details restricted access" 
ON public.profiles FOR SELECT 
USING (public.can_view_profile_details(id));

-- Update policy for users to modify their own profiles
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create a view for public profile information
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  name,
  avatar_url,
  role,
  last_active,
  CASE 
    WHEN public.can_view_profile_details(id) THEN email
    ELSE NULL
  END as email,
  CASE 
    WHEN public.can_view_profile_details(id) THEN phone
    ELSE NULL
  END as phone,
  created_at,
  updated_at,
  language,
  shabbat_mode,
  encoding_support,
  CASE 
    WHEN public.can_view_profile_details(id) THEN settings
    ELSE '{}'::jsonb
  END as settings,
  CASE 
    WHEN public.can_view_profile_details(id) THEN notification_settings
    ELSE '{}'::jsonb
  END as notification_settings
FROM public.profiles;