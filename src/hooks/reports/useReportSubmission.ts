
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ReportFormValues } from "@/types/reportFormTypes";

interface SubmitReportParams {
  values: ReportFormValues;
  images: string[];
  userId: string;
  reportType: string;
}

export const useReportSubmission = () => {
  const log = logger.createLogger({ component: 'useReportSubmission' });

  const submitReport = async ({ values, images, userId, reportType }: SubmitReportParams) => {
    try {
      log.info("Submitting report with values:", { values });

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
      };

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

      const reportId = data && data.length > 0 ? data[0].id : undefined;
      log.info("Tzohar report submitted successfully:", { reportId });

      return data?.[0];
    } catch (error) {
      log.error("Error in submitReport:", { error });
      throw error;
    }
  };

  return { submitReport };
};
