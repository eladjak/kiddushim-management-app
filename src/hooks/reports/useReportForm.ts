
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { safeEncodeHebrew } from "@/integrations/supabase/setupStorage";

// Schema for report form validation
export const reportFormSchema = z.object({
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

interface SubmitReportParams {
  values: ReportFormValues;
  images: string[];
  userId: string;
  reportType: string;
}

export const useReportForm = () => {
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

  const defaultValues: ReportFormValues = {
    title: "",
    description: "",
    event_id: "",
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
    // ASCII-escape Hebrew content to prevent encoding issues
    const safeValues = {
      ...values,
      title: safeEncodeHebrew(values.title),
      description: safeEncodeHebrew(values.description),
      reporter_name: safeEncodeHebrew(values.reporter_name),
      what_was_good: values.what_was_good ? safeEncodeHebrew(values.what_was_good) : "",
      what_to_improve: values.what_to_improve ? safeEncodeHebrew(values.what_to_improve) : "",
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
      reporter_id: userId,
      type: reportType,
    };
    
    const { error } = await supabase
      .from("reports")
      .insert(reportData);
      
    if (error) throw error;
  };

  return {
    reportFormSchema,
    defaultValues,
    events,
    getReportTypeName,
    submitReport
  };
};
