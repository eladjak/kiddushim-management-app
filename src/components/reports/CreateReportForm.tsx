
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReportForm } from "@/hooks/reports/useReportForm";
import { ReportBasicInfo } from "./form-sections/ReportBasicInfo";
import { EventRatingSection } from "./form-sections/EventRatingSection";
import { FeedbackSection } from "./form-sections/FeedbackSection";
import { ReportFormActions } from "./form-actions/ReportFormActions";
import { SeverityField } from "./form-fields/SeverityField";
import { useReportEvents } from "@/hooks/reports/useReportEvents";
import { DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { logger } from "@/utils/logger";

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
  const [images, setImages] = useState<string[]>([]);
  const log = logger.createLogger({ component: 'CreateReportForm' });
  
  const { reportFormSchema, defaultValues, getReportTypeName, submitReport } = useReportForm();
  const { data: events = [] } = useReportEvents();
  
  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      ...defaultValues,
      reporter_name: profile?.name || "",
      event_id: events.length > 0 ? events[0]?.id : undefined,
    }
  });

  const handleSubmit = async (values: z.infer<typeof reportFormSchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        description: "נדרש להתחבר כדי לשלוח דיווח",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      log.info("Submitting report with values:", { 
        type: reportType,
        title: values.title,
        eventId: values.event_id || 'none'
      });
      
      const result = await submitReport({
        values,
        images,
        userId: user.id,
        reportType,
      });
      
      log.info("Report submitted successfully", { reportId: result?.id });
      
      toast({
        description: "הדיווח נשלח בהצלחה",
      });

      // Refresh reports data
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      
      onSuccess();
      
    } catch (error: any) {
      log.error("Error submitting report:", { error, values });
      
      toast({
        variant: "destructive",
        description: error.message || "אירעה שגיאה בשליחת הדיווח",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reportTypeName = getReportTypeName(reportType);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-xl font-bold">{reportTypeName} חדש</DialogTitle>
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
