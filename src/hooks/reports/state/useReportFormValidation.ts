
import { useReportFormValidation as useBaseValidation } from "../useReportFormValidation";
import { ReportFormData } from "./useReportFormData";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'useReportFormFieldValidation' });

export const useReportFormFieldValidation = () => {
  const { reportFormSchema } = useBaseValidation();

  const isFormValid = (formData: ReportFormData): boolean => {
    try {
      reportFormSchema.parse(formData);
      return true;
    } catch (error) {
      log.debug("Form validation failed:", { error });
      return false;
    }
  };

  const getFieldErrors = (formData: ReportFormData) => {
    try {
      reportFormSchema.parse(formData);
      return {};
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
      }
      return fieldErrors;
    }
  };

  return {
    isFormValid,
    getFieldErrors,
    reportFormSchema,
  };
};
