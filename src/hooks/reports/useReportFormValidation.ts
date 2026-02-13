
import { useReportValidationSchema } from "./validation/useReportValidationSchema";
import { useReportDefaultValues } from "./validation/useReportDefaultValues";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'useReportFormValidation' });

export type { ReportFormValues } from "@/types/reportFormTypes";

export const useReportFormValidation = () => {
  const { reportFormSchema } = useReportValidationSchema();
  const { defaultValues } = useReportDefaultValues();

  log.debug("Combining validation components");

  return {
    reportFormSchema,
    defaultValues,
  };
};
