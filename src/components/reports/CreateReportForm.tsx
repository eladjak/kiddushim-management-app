
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ReportTitleField } from "./form-fields/ReportTitleField";
import { ReportDescriptionField } from "./form-fields/ReportDescriptionField";
import { ReportEventField } from "./form-fields/ReportEventField";
import { ReporterNameField } from "./form-fields/ReporterNameField";
import { SeverityField } from "./form-fields/SeverityField";
import { ReportFormActions } from "./form-actions/ReportFormActions";

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

  useEffect(() => {
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
  }, []);

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
        <ReportTitleField 
          value={formData.title}
          onChange={handleInputChange}
        />
        
        <ReportDescriptionField 
          value={formData.description}
          onChange={handleInputChange}
        />
        
        <ReportEventField 
          value={formData.event_id}
          events={events}
          onValueChange={(value) => handleSelectChange("event_id", value)}
        />
        
        <ReporterNameField 
          value={formData.reporter_name}
          onChange={handleInputChange}
        />

        {reportType === "issue" && (
          <SeverityField 
            value={formData.severity}
            onValueChange={(value) => handleSelectChange("severity", value)}
          />
        )}
        
        <ReportFormActions 
          isLoading={isLoading}
          onCancel={onCancel}
        />
      </form>
    </div>
  );
};
