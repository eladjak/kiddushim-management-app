
import { useReportEvents } from "./useReportEvents";
import { useReportFormValidation } from "./useReportFormValidation";
import { useReportSubmission } from "./useReportSubmission";
import { useReportTypes } from "./useReportTypes";

export const useReportForm = () => {
  const { events } = useReportEvents();
  const { reportFormSchema, defaultValues } = useReportFormValidation();
  const { submitReport } = useReportSubmission();
  const { getReportTypeName } = useReportTypes();

  return {
    reportFormSchema,
    defaultValues,
    events,
    getReportTypeName,
    submitReport
  };
};
