-- Rollback for 20260929150000_kidushishi_security_hardening.sql (restores previous, weaker state).
CREATE POLICY "Users can view registrations for events they're assigned to" ON public.event_registrations
  FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM event_assignments
                 WHERE event_assignments.event_id = event_registrations.event_id
                   AND event_assignments.user_id = auth.uid()));
GRANT ALL ON public.public_upcoming_events TO anon, authenticated;
GRANT ALL ON TABLE public.events, public.event_assignments, public.event_equipment,
  public.event_registrations, public.registration_rate_limits, public.equipment,
  public.equipment_changes, public.reports, public.feedback, public.messages TO anon;
GRANT TRUNCATE, TRIGGER, REFERENCES ON TABLE public.events, public.event_assignments,
  public.event_equipment, public.event_registrations, public.registration_rate_limits,
  public.equipment, public.equipment_changes, public.reports, public.feedback, public.messages TO authenticated;
CREATE POLICY "Users can create reports for events they're assigned to" ON public.reports
  FOR INSERT TO public
  WITH CHECK (EXISTS (SELECT 1 FROM event_assignments
                      WHERE event_assignments.event_id = event_assignments.event_id
                        AND event_assignments.user_id = auth.uid()));
