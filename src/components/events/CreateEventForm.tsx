
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EventTitleField } from "./form-fields/EventTitleField";
import { DateTimeFields } from "./form-fields/DateTimeFields";
import { VolunteersFields } from "./form-fields/VolunteersFields";
import { LocationFields } from "./form-fields/LocationFields";
import { EventFormActions } from "./form-actions/EventFormActions";

export const CreateEventForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    setupTime: "",
    mainTime: "",
    cleanupTime: "",
    locationName: "",
    locationAddress: "",
    requiredServiceGirls: 0,
    requiredYouthVolunteers: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    });
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
      // Parse input dates
      const eventDate = new Date(formData.date);
      const setupTime = new Date(`${formData.date}T${formData.setupTime}:00`);
      const mainTime = new Date(`${formData.date}T${formData.mainTime}:00`);
      const cleanupTime = new Date(`${formData.date}T${formData.cleanupTime}:00`);
      
      const { error } = await supabase
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
          created_by: user.id,
          status: "draft",
        });
        
      if (error) throw error;
      
      toast({
        description: "האירוע נוצר בהצלחה",
      });
      
      navigate("/events");
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "אירעה שגיאה ביצירת האירוע",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-6 w-6 text-primary ml-2" />
        <h2 className="text-2xl font-bold">יצירת אירוע חדש</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <EventTitleField 
          value={formData.title}
          onChange={handleInputChange}
        />
        
        <DateTimeFields 
          formData={formData}
          onChange={handleInputChange}
        />
        
        <VolunteersFields 
          formData={formData}
          onChange={handleInputChange}
        />
        
        <LocationFields 
          formData={formData}
          onChange={handleInputChange}
        />
        
        <EventFormActions 
          isLoading={isLoading}
          onCancel={() => navigate("/events")}
        />
      </form>
    </div>
  );
};
