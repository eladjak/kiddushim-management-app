
import { useReportValidationSchema } from "./validation/useReportValidationSchema";
import { useReportDefaultValues } from "./validation/useReportDefaultValues";

export { ReportFormValues } from "@/types/reportFormTypes";

export const useReportFormValidation = () => {
  const { reportFormSchema } = useReportValidationSchema();
  const { defaultValues } = useReportDefaultValues();

  console.log("useReportFormValidation - Combining validation components");

  return {
    reportFormSchema,
    defaultValues,
  };
};
