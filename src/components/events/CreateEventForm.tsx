
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        <div className="space-y-2">
          <Label htmlFor="title">כותרת האירוע</Label>
          <Input 
            id="title" 
            name="title" 
            value={formData.title} 
            onChange={handleInputChange} 
            required 
            placeholder="הזן את כותרת האירוע"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">תאריך</Label>
            <Input 
              id="date" 
              name="date" 
              type="date" 
              value={formData.date} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="setupTime">שעת הכנות</Label>
            <Input 
              id="setupTime" 
              name="setupTime" 
              type="time" 
              value={formData.setupTime} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mainTime">שעת התחלה</Label>
            <Input 
              id="mainTime" 
              name="mainTime" 
              type="time" 
              value={formData.mainTime} 
              onChange={handleInputChange} 
              required 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cleanupTime">שעת סיום</Label>
            <Input 
              id="cleanupTime" 
              name="cleanupTime" 
              type="time" 
              value={formData.cleanupTime} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requiredServiceGirls">נערות שירות נדרשות</Label>
            <Input 
              id="requiredServiceGirls" 
              name="requiredServiceGirls" 
              type="number" 
              min="0"
              value={formData.requiredServiceGirls} 
              onChange={handleInputChange} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requiredYouthVolunteers">מתנדבי נוער נדרשים</Label>
            <Input 
              id="requiredYouthVolunteers" 
              name="requiredYouthVolunteers" 
              type="number" 
              min="0"
              value={formData.requiredYouthVolunteers} 
              onChange={handleInputChange} 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="locationName">שם המיקום</Label>
          <Input 
            id="locationName" 
            name="locationName" 
            value={formData.locationName} 
            onChange={handleInputChange} 
            required 
            placeholder="לדוגמה: בית הכנסת המרכזי"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="locationAddress">כתובת מלאה</Label>
          <Input 
            id="locationAddress" 
            name="locationAddress" 
            value={formData.locationAddress} 
            onChange={handleInputChange} 
            required 
            placeholder="הזן כתובת מלאה"
          />
        </div>
        
        <div className="flex justify-end pt-4">
          <Button 
            variant="outline" 
            type="button" 
            className="ml-2"
            onClick={() => navigate("/events")}
          >
            ביטול
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "יוצר אירוע..." : "צור אירוע"}
          </Button>
        </div>
      </form>
    </div>
  );
};
