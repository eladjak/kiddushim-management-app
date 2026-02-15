
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { createNotification } from "@/utils/notificationUtils";
import { useCreateEvent } from "@/services/query/hooks/useEvents";
import { EventFormData } from "./useFormState";
import type { EventCreate } from "@/types/events";

/**
 * הוק לטיפול בשליחת טופס האירוע
 */
export const useEventSubmission = (
  formData: EventFormData, 
  posterUrl: string, 
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        description: "נדרש להתחבר כדי ליצור אירוע",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      logger.info("Creating event", { formData });
      
      const eventDate = new Date(formData.date);
      
      const setupTimeParts = formData.setupTime.split(':');
      const setupDate = new Date(eventDate);
      setupDate.setHours(parseInt(setupTimeParts[0], 10), parseInt(setupTimeParts[1], 10), 0, 0);
      
      const mainTimeParts = formData.mainTime.split(':');
      const mainDate = new Date(eventDate);
      mainDate.setHours(parseInt(mainTimeParts[0], 10), parseInt(mainTimeParts[1], 10), 0, 0);
      
      const cleanupTimeParts = formData.cleanupTime.split(':');
      const cleanupDate = new Date(eventDate);
      cleanupDate.setHours(parseInt(cleanupTimeParts[0], 10), parseInt(cleanupTimeParts[1], 10), 0, 0);

      const eventData = {
        title: formData.title,
        date: eventDate.toISOString(),
        setup_time: setupDate.toISOString(),
        main_time: mainDate.toISOString(),
        cleanup_time: cleanupDate.toISOString(),
        location_name: formData.locationName,
        location_address: formData.locationAddress,
        required_service_girls: formData.requiredServiceGirls,
        required_youth_volunteers: formData.requiredYouthVolunteers,
        poster_url: posterUrl || null,
        parasha: formData.parasha || null,
        facilitator: formData.facilitator || null,
        workshop_content: formData.workshopContent || null,
        event_content: formData.eventContent || null,
        created_by: user.id,
        status: "draft"
      };

      logger.info("Submitting event data:", { event: JSON.stringify(eventData) });

      createEventMutation.mutate(eventData as EventCreate, {
        onSuccess: (data) => {
          logger.info("Event created successfully", { eventId: data.id });

          if (user.id && data.id) {
            createNotification({
              userId: user.id,
              content: `האירוע "${formData.title}" נוצר בהצלחה`,
              type: "event",
              link: `/events/${data.id}`,
              metadata: { eventId: data.id }
            });
          }

          toast({
            description: "האירוע נוצר בהצלחה",
          });

          navigate("/events");
        },
        onError: (error: Error) => {
          logger.error("Failed to create event", { error: error.message });

          toast({
            variant: "destructive",
            description: error.message || "אירעה שגיאה ביצירת האירוע",
          });
        },
        onSettled: () => {
          setIsLoading(false);
        }
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : "אירעה שגיאה ביצירת האירוע";
      logger.error("Failed to create event", { error: message });

      toast({
        variant: "destructive",
        description: message,
      });
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    navigate
  };
};
