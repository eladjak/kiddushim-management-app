
import { ReportFormValues } from "@/types/reportFormTypes";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'useReportDefaultValues' });

export const useReportDefaultValues = () => {
  // ערכי ברירת מחדל ריקים
  const defaultValues: ReportFormValues = {
    title: "",
    description: "",
    event_id: "",
    reporter_name: "",
    severity: "medium",
    participants_count: 0,
    participants_kids: 0,
    participants_adults: 0,
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

  log.debug("Default values created:", { defaultValues });

  return {
    defaultValues,
  };
};
