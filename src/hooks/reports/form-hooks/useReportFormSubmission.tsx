
import { useReportSubmissionLogic } from "../submission/useReportSubmissionLogic";
import { useReportSubmissionUI } from "../submission/useReportSubmissionUI";
import { ReportFormData } from "../useReportFormState";

interface UseReportFormSubmissionProps {
  reportType: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const useReportFormSubmission = ({ reportType, onClose, onSuccess }: UseReportFormSubmissionProps) => {
  const { isSubmitting, performSubmission } = useReportSubmissionLogic();
  const { showSuccessMessage, showErrorMessage } = useReportSubmissionUI();

  const handleSubmit = async (formData: ReportFormData, images: string[]) => {
    try {
      await performSubmission(formData, images, reportType);
      showSuccessMessage();
      onSuccess();
      onClose();
    } catch (error) {
      if (error.message === "יש להתחבר כדי לשלוח דיווח") {
        showErrorMessage();
      } else {
        showErrorMessage(error);
      }
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
};
