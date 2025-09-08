-- Final security cleanup: Remove any remaining insecure policies
DROP POLICY IF EXISTS "Everyone can register for events" ON public.event_registrations;

-- Ensure the secure policies are in place
-- Update the user view policy to be more restrictive (only allow viewing with event context)
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;

-- Create a more secure policy for user access
CREATE POLICY "Users can view registrations for events they're assigned to" 
ON public.event_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.event_assignments 
    WHERE event_assignments.event_id = event_registrations.event_id 
    AND event_assignments.user_id = auth.uid()
  )
);