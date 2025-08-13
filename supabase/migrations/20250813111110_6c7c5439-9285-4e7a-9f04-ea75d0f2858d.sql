-- יצירת טבלה להרשמות לאירועים קידושישי
-- טבלה זו תשמש לאיסוף הרשמות מהציבור הרחב לאירועי קידושישי

CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  family_size INTEGER DEFAULT 1,
  children_ages TEXT,
  comments TEXT,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_id UUID REFERENCES public.events(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- הוספת RLS לטבלה
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- מדיניות לאפשר לכולם להירשם (גם ללא חשבון משתמש)
CREATE POLICY "Everyone can register for events"
ON public.event_registrations
FOR INSERT
WITH CHECK (true);

-- מדיניות לאפשר לאדמינים ורכזים לראות הרשמות
CREATE POLICY "Admins and coordinators can view registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'coordinator')
  )
);

-- מדיניות לאפשר לאדמינים לעדכן הרשמות
CREATE POLICY "Admins can update registrations"
ON public.event_registrations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- הוספת טריגר לעדכון updated_at
CREATE TRIGGER update_event_registrations_updated_at
BEFORE UPDATE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();