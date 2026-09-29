import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { logger } from "@/utils/logger";
import { CONSENT_VERSION } from "@/lib/privacy";
import { validateRegistration, parseFamilySize, extractRegistrationError } from "@/lib/registration";
import {
  RegistrationForm,
  HeroSection,
  AboutSection,
  EventDetailsSection,
  PartnersSection,
  ContactSection,
  LandingFooter,
  INITIAL_FORM_DATA,
} from "@/components/landing";
import type { RegistrationFormData, UpcomingEvent } from "@/components/landing";

const log = logger.createLogger({ component: 'Landing' });

const Landing = () => {
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>(INITIAL_FORM_DATA);

  // קוראים מהתצוגה הציבורית public_upcoming_events (שדות מצומצמים, אירועים מתוכננים בלבד)
  // ולא מטבלת events עצמה - כך אורח לא-מחובר לא נחשף לטיוטות ולשדות פנימיים.
  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery<UpcomingEvent[]>({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_upcoming_events' as never)
        .select('id, title, date, location_name, location_address')
        .order('date', { ascending: true })
        .limit(3);

      if (error) {
        // התצוגה עדיין לא הותקנה או שאין הרשאה - מציגים "האירוע הבא בתכנון" ולא שגיאה
        log.warn('Public events unavailable', { error: error.message });
        return [];
      }
      return (data ?? []) as unknown as UpcomingEvent[];
    }
  });

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateRegistration(formData);
    if (validationError) {
      toast({ title: "בדקו את הפרטים", description: validationError, variant: "destructive" });
      return;
    }

    setIsRegistering(true);

    try {
      const registrationData = {
        name: formData.name.trim(),
        phone: formData.phone,
        email: formData.email.trim(),
        family_size: parseFamilySize(formData.family_size),
        children_ages: formData.children_ages.trim(),
        comments: formData.comments.trim(),
        event_id: upcomingEvents?.[0]?.id || null,
        consent: true,
        consent_version: CONSENT_VERSION,
      };

      // אימות ההרשמה נשלח בצד השרת (secure-registration) - הלקוח לא קורא
      // ישירות לפונקציית המייל, כדי שאי אפשר יהיה להשתמש בה לשליחת דואר לכתובות זרות.
      const { data, error: functionError } = await supabase.functions.invoke('secure-registration', {
        body: registrationData
      });

      if (functionError) throw functionError;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "נרשמת בהצלחה!",
        description: "תקבל הודעה עם פרטי האירוע הקרוב בהקדם",
      });

      setShowRegistration(false);
      setFormData(INITIAL_FORM_DATA);
    } catch (err) {
      log.warn('Registration failed', { error: err instanceof Error ? err.message : 'unknown' });
      toast({
        title: "שגיאה",
        description: await extractRegistrationError(err),
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (showRegistration) {
    return (
      <RegistrationForm
        formData={formData}
        isRegistering={isRegistering}
        onFormDataChange={setFormData}
        onSubmit={handleRegistration}
        onBack={() => setShowRegistration(false)}
        hasUpcomingEvent={Boolean(upcomingEvents?.length)}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-background dark:via-background dark:to-background">
      <HeroSection onRegisterClick={() => setShowRegistration(true)} />
      <AboutSection />
      <EventDetailsSection
        upcomingEvents={upcomingEvents}
        eventsLoading={eventsLoading}
      />
      <PartnersSection />
      <ContactSection onRegisterClick={() => setShowRegistration(true)} />
      <LandingFooter />
    </div>
  );
};

export default Landing;
