
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
import { EventRatingField } from "./form-fields/EventRatingField";
import { FeedbackField } from "./form-fields/FeedbackField";
import { EventImagesUploadField } from "./form-fields/EventImagesUploadField";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";

type CreateReportFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
  reportType: string;
};

// Schema for report form validation
const reportFormSchema = z.object({
  title: z.string().min(3, "יש להזין כותרת באורך של 3 תווים לפחות"),
  description: z.string().min(10, "יש להזין תיאור באורך של 10 תווים לפחות"),
  event_id: z.string().optional(),
  reporter_name: z.string().min(2, "יש להזין שם בן 2 תווים לפחות"),
  severity: z.string().optional(),
  overall_rating: z.number().min(1).max(10).default(5),
  audience_rating: z.number().min(1).max(10).default(5),
  organization_rating: z.number().min(1).max(10).default(5),
  logistics_rating: z.number().min(1).max(10).default(5),
  what_was_good: z.string().optional(),
  what_to_improve: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export const CreateReportForm = ({ onCancel, onSuccess, reportType }: CreateReportFormProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      event_id: "",
      reporter_name: profile?.name || "",
      severity: "medium",
      overall_rating: 5,
      audience_rating: 5,
      organization_rating: 5,
      logistics_rating: 5,
      what_was_good: "",
      what_to_improve: "",
    }
  });

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

  const getReportTypeName = () => {
    switch (reportType) {
      case "event_report": return "דיווח אירוע";
      case "feedback": return "משוב";
      case "issue": return "תקלה";
      default: return "דיווח";
    }
  };

  const handleSubmit = async (values: ReportFormValues) => {
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
        title: values.title,
        description: values.description,
        reporter_name: values.reporter_name,
        status: "new",
        severity: reportType === "issue" ? values.severity : null,
        images: images.length > 0 ? images : null,
        ratings: reportType === "event_report" || reportType === "feedback" ? {
          overall: values.overall_rating,
          audience: values.audience_rating,
          organization: values.organization_rating,
          logistics: values.logistics_rating,
        } : null,
        feedback: {
          positive: values.what_was_good || "",
          improvement: values.what_to_improve || "",
        },
      };
      
      const reportData = {
        content: contentData,
        event_id: values.event_id || null,
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
      
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <ReportTitleField 
            value={form.watch("title")}
            onChange={(e) => form.setValue("title", e.target.value)}
          />
          
          <ReportDescriptionField 
            value={form.watch("description")}
            onChange={(e) => form.setValue("description", e.target.value)}
          />
          
          <ReportEventField 
            value={form.watch("event_id")}
            events={events}
            onValueChange={(value) => form.setValue("event_id", value)}
          />
          
          <ReporterNameField 
            value={form.watch("reporter_name")}
            onChange={(e) => form.setValue("reporter_name", e.target.value)}
          />

          {reportType === "issue" && (
            <SeverityField 
              value={form.watch("severity") || "medium"}
              onValueChange={(value) => form.setValue("severity", value)}
            />
          )}

          {(reportType === "event_report" || reportType === "feedback") && (
            <>
              <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                <h3 className="font-medium text-gray-700">דירוג האירוע</h3>
                
                <EventRatingField 
                  form={form} 
                  name="overall_rating" 
                  label="דירוג כללי" 
                />
                
                <EventRatingField 
                  form={form} 
                  name="audience_rating" 
                  label="חווית הקהל" 
                />
                
                <EventRatingField 
                  form={form} 
                  name="organization_rating" 
                  label="רמת הארגון" 
                />
                
                <EventRatingField 
                  form={form} 
                  name="logistics_rating" 
                  label="לוגיסטיקה" 
                />
              </div>

              <FeedbackField 
                name="what_was_good"
                label="מה היה טוב באירוע?"
                placeholder="ספר לנו על הדברים שעבדו היטב באירוע"
                value={form.watch("what_was_good") || ""}
                onChange={(e) => form.setValue("what_was_good", e.target.value)}
              />
              
              <FeedbackField 
                name="what_to_improve"
                label="מה ניתן לשפר להבא?"
                placeholder="ספר לנו על דברים שאפשר לשפר בפעם הבאה"
                value={form.watch("what_to_improve") || ""}
                onChange={(e) => form.setValue("what_to_improve", e.target.value)}
              />
              
              <EventImagesUploadField 
                images={images}
                onImagesChange={setImages}
              />
            </>
          )}
          
          <ReportFormActions 
            isLoading={isLoading}
            onCancel={onCancel}
          />
        </form>
      </FormProvider>
    </div>
  );
};
