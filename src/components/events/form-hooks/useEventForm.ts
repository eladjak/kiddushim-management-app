
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { PredefinedEvent } from "@/data/eventCalendar";
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
    // Calculate cleanup time (30 minutes after main time)
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
    
    // Auto-fill form fields based on the selected event
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
    
    // Set event notes for display
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
      
      // Parse input dates
      const eventDate = new Date(formData.date);
      const setupTime = new Date(`${formData.date}T${formData.setupTime}:00`);
      const mainTime = new Date(`${formData.date}T${formData.mainTime}:00`);
      const cleanupTime = new Date(`${formData.date}T${formData.cleanupTime}:00`);

      // Insert data directly without encoding
      const { data, error } = await supabase
        .from("events")
        .insert({
          title: formData.title,
          date: eventDate.toISOString(),
          setup_time: setupTime.toISOString(),
          main_time: mainTime.toISOString(),
          cleanup_time: cleanupTime.toISOString(),
          location_name: formData.locationName,
          location_address: formData.locationAddress,
          required_service_girls: formData.requiredServiceGirls,
          required_youth_volunteers: formData.requiredYouthVolunteers,
          poster_url: posterUrl,
          parasha: formData.parasha,
          facilitator: formData.facilitator,
          workshop_content: formData.workshopContent,
          event_content: formData.eventContent,
          created_by: user.id,
          status: "draft",
        })
        .select();
        
      if (error) {
        logger.error("Error creating event", { error });
        throw error;
      }
      
      const eventId = data?.[0]?.id;
      logger.info("Event created successfully", { eventId });
      
      // Create notification for admins and coordinators about the new event
      if (user.id) {
        await createNotification({
          userId: user.id,
          title: "אירוע חדש נוצר",
          message: `האירוע "${formData.title}" נוצר בהצלחה`,
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
