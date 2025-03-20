
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

// Schema for report form validation
export const reportFormSchema = z.object({
  title: z.string().min(3, "יש להזין כותרת באורך של 3 תווים לפחות"),
  description: z.string().min(10, "יש להזין תיאור באורך של 10 תווים לפחות"),
  event_id: z.string().min(1, "יש לבחור אירוע").optional(),
  reporter_name: z.string().min(2, "יש להזין שם בן 2 תווים לפחות"),
  severity: z.string().min(1, "יש לבחור רמת חומרה").default("medium"),
  overall_rating: z.number().min(1).max(10).default(5),
  audience_rating: z.number().min(1).max(10).default(5),
  organization_rating: z.number().min(1).max(10).default(5),
  logistics_rating: z.number().min(1).max(10).default(5),
  what_was_good: z.string().optional(),
  what_to_improve: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface SubmitReportParams {
  values: ReportFormValues;
  images: string[];
  userId: string;
  reportType: string;
}

export const useReportForm = () => {
  const [events, setEvents] = useState<any[]>([]);
  const log = logger.createLogger({ component: 'useReportForm' });

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

  const defaultValues: ReportFormValues = {
    title: "",
    description: "",
    event_id: events.length > 0 ? events[0]?.id : undefined,
    reporter_name: "",
    severity: "medium",
    overall_rating: 5,
    audience_rating: 5,
    organization_rating: 5,
    logistics_rating: 5,
    what_was_good: "",
    what_to_improve: "",
  };

  const getReportTypeName = (reportType: string) => {
    switch (reportType) {
      case "event_report": return "דיווח אירוע";
      case "feedback": return "משוב";
      case "issue": return "תקלה";
      default: return "דיווח";
    }
  };

  const submitReport = async ({ values, images, userId, reportType }: SubmitReportParams) => {
    try {
      // Create content object with sanitized values
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
      
      // Create sanitized report data object
      const reportData = {
        content: contentData,
        event_id: values.event_id || null,
        reporter_id: userId,
        type: reportType,
      };
      
      // Log the data being sent for debugging
      log.info("Submitting report data:", { report: JSON.stringify(reportData) });
      
      // Handle the case where event_id is null or undefined
      if (!reportData.event_id) {
        reportData.event_id = 'no-events';
      }
      
      const { data, error } = await supabase
        .from("reports")
        .insert(reportData)
        .select();
        
      if (error) {
        log.error("Error submitting report:", { error });
        throw error;
      }
      
      log.info("Report submitted successfully:", { reportId: data?.[0]?.id });
      return data?.[0];
    } catch (error) {
      log.error("Error in submitReport:", { error });
      throw error;
    }
  };

  return {
    reportFormSchema,
    defaultValues,
    events,
    getReportTypeName,
    submitReport
  };
};
