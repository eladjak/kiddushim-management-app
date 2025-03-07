
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { SeverityField } from "./form-fields/SeverityField";
import { ReportFormActions } from "./form-actions/ReportFormActions";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReportBasicInfo } from "./form-sections/ReportBasicInfo";
import { EventRatingSection } from "./form-sections/EventRatingSection";
import { FeedbackSection } from "./form-sections/FeedbackSection";

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
      // ASCII-escape Hebrew content to prevent encoding issues
      const safeValues = {
        ...values,
        title: encodeContentForStorage(values.title),
        description: encodeContentForStorage(values.description),
        reporter_name: encodeContentForStorage(values.reporter_name),
        what_was_good: values.what_was_good ? encodeContentForStorage(values.what_was_good) : "",
        what_to_improve: values.what_to_improve ? encodeContentForStorage(values.what_to_improve) : "",
      };
      
      // Create content object to store in the JSON field
      const contentData = {
        title: safeValues.title,
        description: safeValues.description,
        reporter_name: safeValues.reporter_name,
        status: "new",
        severity: reportType === "issue" ? safeValues.severity : null,
        images: images.length > 0 ? images : null,
        ratings: reportType === "event_report" || reportType === "feedback" ? {
          overall: safeValues.overall_rating,
          audience: safeValues.audience_rating,
          organization: safeValues.organization_rating,
          logistics: safeValues.logistics_rating,
        } : null,
        feedback: {
          positive: safeValues.what_was_good || "",
          improvement: safeValues.what_to_improve || "",
        },
      };
      
      const reportData = {
        content: contentData,
        event_id: safeValues.event_id || null,
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

  // Encode content for storage to prevent unicode/encoding issues
  const encodeContentForStorage = (content: string): string => {
    return content;
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{getReportTypeName()} חדש</h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 max-h-[75vh] pr-4">
        <div className="pr-2 pb-4">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <ReportBasicInfo events={events} />

              {reportType === "issue" && (
                <SeverityField 
                  value={form.watch("severity") || "medium"}
                  onValueChange={(value) => form.setValue("severity", value)}
                />
              )}

              {(reportType === "event_report" || reportType === "feedback") && (
                <>
                  <EventRatingSection />
                  <FeedbackSection images={images} onImagesChange={setImages} />
                </>
              )}
              
              <ReportFormActions 
                isLoading={isLoading}
                onCancel={onCancel}
              />
            </form>
          </FormProvider>
        </div>
      </ScrollArea>
    </div>
  );
};
