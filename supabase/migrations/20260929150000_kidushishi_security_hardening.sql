-- Kidushishi security hardening (live check 2026-09-29).
-- Touches ONLY Kidushishi tables/view. Shared Bayit BeSeder objects
-- (profiles, user_roles, notifications, auth.users, on_auth_user_created_role) are NOT touched.
-- Rollback: supabase/rollbacks/20260929150000_kidushishi_security_hardening.down.sql

-- G1: a youth_volunteer could self-assign to any event (policy "Users can create their own
-- assignments") and then read every registrant (name/phone/email) through this policy.
-- Registrants are visible to staff only (admin/coordinator, policy "Staff can view all registrations").
DROP POLICY IF EXISTS "Users can view registrations for events they're assigned to" ON public.event_registrations;

-- G2: public_upcoming_events is an auto-updatable view owned by postgres (bypasses RLS) and anon
-- held INSERT/UPDATE/DELETE on it => anon could modify/delete rows of public.events.
-- Make the view strictly read-only.
REVOKE ALL ON public.public_upcoming_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_upcoming_events TO anon, authenticated;

-- G3 (defense in depth): anon has no policies on these tables and must only write via edge
-- functions (service_role). Remove the default Supabase grants so RLS is not the only wall.
REVOKE ALL ON TABLE public.events, public.event_assignments, public.event_equipment,
  public.event_registrations, public.registration_rate_limits, public.equipment,
  public.equipment_changes, public.reports, public.feedback, public.messages FROM anon;
-- authenticated keeps DML (governed by RLS) but not the privileges that bypass or sidestep RLS.
REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.events, public.event_assignments,
  public.event_equipment, public.event_registrations, public.registration_rate_limits,
  public.equipment, public.equipment_changes, public.reports, public.feedback, public.messages FROM authenticated;

-- G4: the second INSERT policy on reports had a tautology (event_id = event_id), so any assigned
-- user could insert a report with an arbitrary reporter_id. The remaining policy
-- "Authenticated users can submit reports" (reporter_id = auth.uid()) fully covers legit use.
DROP POLICY IF EXISTS "Users can create reports for events they're assigned to" ON public.reports;
