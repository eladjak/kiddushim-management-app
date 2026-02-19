import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { logger } from "@/utils/logger";
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

  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery<UpcomingEvent[]>({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);

      if (error) throw error;
      return (data ?? []) as UpcomingEvent[];
    }
  });

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      const registrationData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        family_size: parseInt(formData.family_size) || 1,
        children_ages: formData.children_ages,
        comments: formData.comments,
        event_id: upcomingEvents?.[0]?.id || null,
      };

      const { data, error: functionError } = await supabase.functions.invoke('secure-registration', {
        body: registrationData
      });

      if (functionError) throw functionError;
      if (data?.error) throw new Error(data.error);

      try {
        const nextEvent = upcomingEvents?.[0];
        await supabase.functions.invoke('send-registration-confirmation', {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            eventTitle: nextEvent?.title || "קידושי שבת מגדל העמק",
            eventDate: nextEvent?.date || new Date().toISOString(),
            eventLocation: nextEvent?.location_name || "יועלן בהמשך",
            familySize: parseInt(formData.family_size) || 1,
            childrenAges: formData.children_ages,
            comments: formData.comments
          }
        });
      } catch (emailError) {
        log.warn('Email notification failed', { error: emailError });
      }

      toast({
        title: "נרשמת בהצלחה!",
        description: "תקבל הודעה עם פרטי האירוע הקרוב בהקדם",
      });

      setShowRegistration(false);
      setFormData(INITIAL_FORM_DATA);
    } catch {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהרשמה. נסה שוב או צור קשר",
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
