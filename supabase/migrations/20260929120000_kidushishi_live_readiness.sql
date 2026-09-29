-- Kidushishi live-readiness (29.9.2026)
-- ADDITIVE ONLY. Touches Kidushishi-only objects (event_registrations + a new view).
-- Does NOT touch profiles / user_roles / notifications / auth.users / on_auth_user_created_role
-- (shared with Bayit BeSeder - see CANONICAL.md).
-- NOT APPLIED. Apply order: this migration FIRST, then deploy the edge functions.

-- 1) Record consent with each public registration: when, and to which wording.
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_version text;

COMMENT ON COLUMN public.event_registrations.consent_at IS
  'When the registrant ticked the privacy-policy consent box. NULL = registered before consent was collected.';
COMMENT ON COLUMN public.event_registrations.consent_version IS
  'Version id of the consent wording shown (src/lib/privacy.ts CONSENT_VERSION).';

-- 2) Public, minimal read of published upcoming events for the anonymous landing page.
--    The events table itself stays closed to anonymous visitors (drafts, internal fields).
--    An event is "published" when staff set status = planned/ongoing (button "פרסם באתר").
--    The view runs with its owner's rights on purpose (default): it exposes ONLY these five columns
--    of ONLY published, future events.
CREATE OR REPLACE VIEW public.public_upcoming_events AS
SELECT id, title, date, location_name, location_address
FROM public.events
WHERE status IN ('planned', 'ongoing')
  AND date >= now();

GRANT SELECT ON public.public_upcoming_events TO anon, authenticated;

-- ROLLBACK (manual, if ever needed):
--   DROP VIEW IF EXISTS public.public_upcoming_events;
--   ALTER TABLE public.event_registrations DROP COLUMN IF EXISTS consent_at, DROP COLUMN IF EXISTS consent_version;
