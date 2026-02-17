
import { useReportFormValidation as useBaseValidation } from "../useReportFormValidation";
import { ReportFormData } from "./useReportFormData";
import { logger } from "@/utils/logger";
import { z } from "zod";

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
    } catch (error) {
      const fieldErrors: Record<string, string> = {};
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
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
