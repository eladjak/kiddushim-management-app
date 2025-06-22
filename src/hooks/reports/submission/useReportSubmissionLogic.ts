
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useReportForm } from "../useReportForm";
import { ReportFormData } from "../useReportFormState";

export const useReportSubmissionLogic = () => {
  const { user } = useAuth();
  const { submitReport } = useReportForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performSubmission = async (
    formData: ReportFormData, 
    images: string[], 
    reportType: string
  ) => {
    if (!user) {
      throw new Error("יש להתחבר כדי לשלוח דיווח");
    }

    setIsSubmitting(true);

    try {
      const result = await submitReport({
        values: formData,
        images,
        userId: user.id,
        reportType,
      });

      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    performSubmission,
  };
};
