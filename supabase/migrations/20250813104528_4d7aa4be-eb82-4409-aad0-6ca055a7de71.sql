-- Drop and recreate the public_profiles view without SECURITY DEFINER
-- The view itself doesn't need SECURITY DEFINER since the security is handled 
-- by the can_view_profile_details() function which is already SECURITY DEFINER

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  name,
  avatar_url,
  role,
  last_active,
  CASE 
    WHEN can_view_profile_details(id) THEN email 
    ELSE NULL 
  END AS email,
  CASE 
    WHEN can_view_profile_details(id) THEN phone 
    ELSE NULL 
  END AS phone,
  created_at,
  updated_at,
  language,
  shabbat_mode,
  encoding_support,
  CASE 
    WHEN can_view_profile_details(id) THEN settings 
    ELSE '{}'::jsonb 
  END AS settings,
  CASE 
    WHEN can_view_profile_details(id) THEN notification_settings 
    ELSE '{}'::jsonb 
  END AS notification_settings
FROM profiles;