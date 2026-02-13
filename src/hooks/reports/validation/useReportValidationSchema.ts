
import { reportFormSchema } from "@/types/reportFormTypes";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'useReportValidationSchema' });

export const useReportValidationSchema = () => {
  log.debug("Schema accessed");

  return {
    reportFormSchema,
  };
};
