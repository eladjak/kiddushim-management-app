
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { PredefinedEvent } from "@/data/types/eventTypes";
import { createNotification } from "@/utils/notificationUtils";

export interface EventFormData {
  title: string;
  date: string;
  setupTime: string;
  mainTime: string;
  cleanupTime: string;
  locationName: string;
  locationAddress: string;
  requiredServiceGirls: number;
  requiredYouthVolunteers: number;
  parasha: string;
  facilitator: string;
  workshopContent: string;
  eventContent: string;
}

export const useEventForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [posterUrl, setPosterUrl] = useState("");
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    date: "",
    setupTime: "",
    mainTime: "",
    cleanupTime: "",
    locationName: "",
    locationAddress: "",
    requiredServiceGirls: 0,
    requiredYouthVolunteers: 0,
    parasha: "",
    facilitator: "",
    workshopContent: "",
    eventContent: "",
  });

  const [eventNotes, setEventNotes] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    });
  };

  const handleEventSelect = (event: PredefinedEvent) => {
    const mainTimeParts = event.mainTime?.split(":").map(Number) || [0, 0];
    const mainTimeHour = mainTimeParts[0];
    const mainTimeMinute = mainTimeParts[1];
    
    let cleanupHour = mainTimeHour;
    let cleanupMinute = mainTimeMinute + 30;
    
    if (cleanupMinute >= 60) {
      cleanupHour += 1;
      cleanupMinute -= 60;
    }
    
    const cleanupTime = `${cleanupHour.toString().padStart(2, '0')}:${cleanupMinute.toString().padStart(2, '0')}`;
    
    setFormData({
      ...formData,
      title: `קידושישי - פרשת ${event.parasha}`,
      date: event.date,
      setupTime: event.setupTime || "",
      mainTime: event.mainTime || "",
      cleanupTime: cleanupTime,
      parasha: event.parasha,
      requiredServiceGirls: event.serviceLadiesAvailable ? 2 : 0,
      requiredYouthVolunteers: 3,
    });
    
    if (event.notes && event.notes.length > 0) {
      setEventNotes(event.notes);
    } else {
      setEventNotes([]);
    }
  };

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

      const { data, error } = await supabase
        .from("events")
        .insert(eventData as any)
        .select();
        
      if (error) {
        logger.error("Error creating event", { error });
        throw error;
      }
      
      // Safe access to the event ID using type assertion
      const eventId = data && data[0] ? (data[0] as any).id : undefined;
      logger.info("Event created successfully", { eventId });
      
      if (user.id && eventId) {
        await createNotification({
          userId: user.id,
          content: `האירוע "${formData.title}" נוצר בהצלחה`,
          type: "event",
          link: `/events/${eventId}`,
          metadata: { eventId }
        });
      }
      
      toast({
        description: "האירוע נוצר בהצלחה",
      });
      
      navigate("/events");
      
    } catch (error: any) {
      logger.error("Failed to create event", { error });
      
      toast({
        variant: "destructive",
        description: error.message || "אירעה שגיאה ביצירת האירוע",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    posterUrl,
    eventNotes,
    isLoading,
    setPosterUrl,
    handleInputChange,
    handleEventSelect,
    handleSubmit,
    navigate
  };
};
