
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
import { PosterUploadField } from "./form-fields/PosterUploadField";
import { ParashaField } from "./form-fields/ParashaField";
import { EventContentField } from "./form-fields/EventContentField";
import { v4 as uuidv4 } from "uuid";

export const CreateEventForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [posterUrl, setPosterUrl] = useState("");
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
    parasha: "",
    facilitator: "",
    workshopContent: "",
    eventContent: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
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
          poster_url: posterUrl,
          parasha: formData.parasha,
          facilitator: formData.facilitator,
          workshop_content: formData.workshopContent,
          event_content: formData.eventContent,
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
      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
        <Calendar className="h-6 w-6 text-primary ml-2" />
        <h2 className="text-2xl font-bold">יצירת אירוע חדש</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <EventTitleField 
              value={formData.title}
              onChange={handleInputChange}
            />
            
            <ParashaField
              value={formData.parasha}
              onChange={handleInputChange}
            />
            
            <EventContentField
              value={formData.eventContent}
              onChange={handleInputChange}
              label="תוכן האירוע"
              name="eventContent"
              placeholder="פרטים על האירוע והפעילויות המתוכננות"
            />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="facilitator" className="text-sm font-medium">מפעיל האירוע</label>
              </div>
              <input
                id="facilitator"
                name="facilitator"
                value={formData.facilitator}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="שם המפעיל/ה של האירוע"
              />
            </div>
            
            <EventContentField
              value={formData.workshopContent}
              onChange={handleInputChange}
              label="תוכן הסדנה"
              name="workshopContent"
              placeholder="תיאור הסדנה והפעילות"
            />
          </div>
          
          <div className="space-y-6">
            <PosterUploadField 
              posterUrl={posterUrl}
              onPosterChange={setPosterUrl}
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
          </div>
        </div>
        
        <EventFormActions 
          isLoading={isLoading}
          onCancel={() => navigate("/events")}
        />
      </form>
    </div>
  );
};
