
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type CreateReportFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
  reportType: string;
};

export const CreateReportForm = ({ onCancel, onSuccess, reportType }: CreateReportFormProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_id: "",
    reporter_name: profile?.name || "",
    severity: "medium",
  });

  const [events, setEvents] = useState<any[]>([]);

  // Fetch events for dropdown
  useState(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title")
        .order("date", { ascending: false });

      if (!error && data) {
        setEvents(data);
      }
    };

    fetchEvents();
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const getReportTypeName = () => {
    switch (reportType) {
      case "event_report": return "דיווח אירוע";
      case "feedback": return "משוב";
      case "issue": return "תקלה";
      default: return "דיווח";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        description: "נדרש להתחבר כדי לשלוח דיווח",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create content object to store in the JSON field
      const contentData = {
        title: formData.title,
        description: formData.description,
        reporter_name: formData.reporter_name,
        status: "new",
        severity: reportType === "issue" ? formData.severity : null,
      };
      
      const reportData = {
        content: contentData,
        event_id: formData.event_id || null,
        reporter_id: user.id,
        type: reportType,
      };
      
      const { error } = await supabase
        .from("reports")
        .insert(reportData);
        
      if (error) throw error;
      
      toast({
        description: "הדיווח נשלח בהצלחה",
      });

      // Refresh reports data
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      
      onSuccess();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "אירעה שגיאה בשליחת הדיווח",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{getReportTypeName()} חדש</h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">כותרת</Label>
          <Input 
            id="title" 
            name="title" 
            value={formData.title} 
            onChange={handleInputChange} 
            required 
            placeholder="הזן כותרת לדיווח"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">תיאור</Label>
          <Textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            required 
            placeholder="תאר את הדיווח בהרחבה"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event_id">אירוע קשור (אופציונלי)</Label>
          <Select 
            value={formData.event_id} 
            onValueChange={(value) => handleSelectChange("event_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר אירוע" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reporter_name">שם המדווח</Label>
          <Input 
            id="reporter_name" 
            name="reporter_name" 
            value={formData.reporter_name} 
            onChange={handleInputChange} 
            required 
            placeholder="הזן את שמך"
          />
        </div>

        {reportType === "issue" && (
          <div className="space-y-2">
            <Label htmlFor="severity">חומרת התקלה</Label>
            <Select 
              value={formData.severity} 
              onValueChange={(value) => handleSelectChange("severity", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">נמוכה</SelectItem>
                <SelectItem value="medium">בינונית</SelectItem>
                <SelectItem value="high">גבוהה</SelectItem>
                <SelectItem value="critical">קריטית</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex justify-end pt-2">
          <Button 
            variant="outline" 
            type="button" 
            className="ml-2"
            onClick={onCancel}
          >
            ביטול
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "שולח..." : "שלח דיווח"}
          </Button>
        </div>
      </form>
    </div>
  );
};
