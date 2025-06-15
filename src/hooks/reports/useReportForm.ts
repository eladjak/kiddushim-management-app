
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

// Schema for report form validation matching Tzohar requirements
export const reportFormSchema = z.object({
  title: z.string().min(3, "יש להזין כותרת באורך של 3 תווים לפחות"),
  description: z.string().min(10, "יש להזין תיאור באורך של 10 תווים לפחות"),
  event_id: z.string().min(1, "יש לבחור אירוע").optional(),
  reporter_name: z.string().min(2, "יש להזין שם בן 2 תווים לפחות"),
  severity: z.string().min(1, "יש לבחור רמת חומרה").default("medium"),
  
  // Tzohar specific fields
  participants_count: z.number().min(1, "יש להזין מספר משתתפים").max(200, "מקסימום 200 משתתפים"),
  participants_kids: z.number().min(0, "מספר ילדים לא יכול להיות שלילי").max(100),
  participants_adults: z.number().min(0, "מספר מבוגרים לא יכול להיות שלילי").max(100),
  location_other: z.string().optional(),
  
  // New field for what participants learned/gained
  participants_gained: z.string().min(5, "יש לתאר מה המשתתפים למדו/קיבלו"),
  
  // Modified rating fields for Tzohar
  overall_rating: z.number().min(1).max(10).default(5),
  audience_rating: z.number().min(1).max(10).default(5),
  organization_rating: z.number().min(1).max(10).default(5),
  logistics_rating: z.number().min(1).max(10).default(5),
  
  // Standard feedback fields
  what_was_good: z.string().optional(),
  what_to_improve: z.string().optional(),
  additional_feedback: z.string().optional(),
  
  // Tzohar specific - is the reporter from their team
  is_tzohar_representative: z.boolean().default(false),
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
      console.log("useReportForm - Fetching events...");
      const { data, error } = await supabase
        .from("events")
        .select("id, title")
        .order("date", { ascending: false });

      if (!error && data) {
        console.log("useReportForm - Events fetched successfully:", data);
        setEvents(data);
      } else {
        console.error("useReportForm - Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // ערכי ברירת מחדל ריקים
  const defaultValues: ReportFormValues = {
    title: "",
    description: "",
    event_id: "",
    reporter_name: "",
    severity: "medium",
    participants_count: 0, // שינוי ל-0 במקום 30
    participants_kids: 0, // שינוי ל-0 במקום 20
    participants_adults: 0, // שינוי ל-0 במקום 80
    location_other: "",
    participants_gained: "",
    overall_rating: 5,
    audience_rating: 5,
    organization_rating: 5,
    logistics_rating: 5,
    what_was_good: "",
    what_to_improve: "",
    additional_feedback: "",
    is_tzohar_representative: false,
  };

  console.log("useReportForm - Default values created:", defaultValues);

  const getReportTypeName = (reportType: string) => {
    switch (reportType) {
      case "event_report": return "דיווח אירוע לצהר";
      case "feedback": return "משוב";
      case "issue": return "תקלה";
      default: return "דיווח";
    }
  };

  const submitReport = async ({ values, images, userId, reportType }: SubmitReportParams) => {
    try {
      console.log("useReportForm - Submitting report with values:", values);
      
      // Create content object with sanitized values for Tzohar format
      const contentData = {
        title: values.title,
        description: values.description,
        reporter_name: values.reporter_name,
        status: "new",
        severity: reportType === "issue" ? values.severity : null,
        images: images.length > 0 ? images : null,
        
        // Tzohar specific fields
        participants: {
          total: values.participants_count,
          kids: values.participants_kids,
          adults: values.participants_adults,
        },
        location_details: values.location_other || "",
        participants_gained: values.participants_gained,
        is_tzohar_representative: values.is_tzohar_representative,
        
        ratings: reportType === "event_report" || reportType === "feedback" ? {
          overall: values.overall_rating,
          audience: values.audience_rating,
          organization: values.organization_rating,
          logistics: values.logistics_rating,
        } : null,
        feedback: {
          positive: values.what_was_good || "",
          improvement: values.what_to_improve || "",
          additional: values.additional_feedback || "",
        },
      };
      
      // Create sanitized report data object
      const reportData = {
        content: contentData,
        event_id: values.event_id || 'no-events',
        reporter_id: userId,
        type: reportType,
      } as any;
      
      // Log the data being sent for debugging
      log.info("Submitting Tzohar report data:", { report: JSON.stringify(reportData) });
      
      const { data, error } = await supabase
        .from("reports")
        .insert(reportData)
        .select();
        
      if (error) {
        log.error("Error submitting report:", { error });
        throw error;
      }
      
      const reportId = data && data.length > 0 ? (data[0] as any).id : undefined;
      log.info("Tzohar report submitted successfully:", { reportId });
      
      return data?.[0] as any;
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
