
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useReportForm } from "@/hooks/reports/useReportForm";
import { ReportFormData } from "@/hooks/reports/useReportFormState";

interface UseReportFormSubmissionProps {
  reportType: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const useReportFormSubmission = ({ reportType, onClose, onSuccess }: UseReportFormSubmissionProps) => {
  const { user } = useAuth();
  const { submitReport } = useReportForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: ReportFormData, images: string[]) => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר כדי לשלוח דיווח",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitReport({
        values: formData,
        images,
        userId: user.id,
        reportType,
      });

      toast({
        title: "הדיווח נשלח בהצלחה",
        description: "הדיווח נשלח לארגון צהר ונשמר במערכת",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "שגיאה בשליחת הדיווח",
        description: "אירעה שגיאה בשליחת הדיווח. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
};
