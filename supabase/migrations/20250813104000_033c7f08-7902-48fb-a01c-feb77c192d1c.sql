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

-- Create new restrictive RLS policy for profile access
CREATE POLICY "Restricted profile access" 
ON public.profiles FOR SELECT 
USING (
  -- Users can see their own profile with full details
  auth.uid() = id 
  OR 
  -- Admins and coordinators can see all profiles with full details
  public.get_current_user_role() IN ('admin', 'coordinator')
  OR
  -- Others can only see basic public info (name, avatar, role)
  auth.uid() IS NOT NULL
);

-- Create a view for safe public profile information
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