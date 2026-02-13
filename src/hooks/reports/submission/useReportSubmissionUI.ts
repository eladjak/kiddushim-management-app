
import { toast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'useReportSubmissionUI' });

export const useReportSubmissionUI = () => {
  const showSuccessMessage = () => {
    toast({
      title: "הדיווח נשלח בהצלחה",
      description: "הדיווח נשלח לארגון צהר ונשמר במערכת",
    });
  };

  const showErrorMessage = (error?: any) => {
    log.error("Error submitting report:", { error });
    toast({
      title: "שגיאה בשליחת הדיווח",
      description: "אירעה שגיאה בשליחת הדיווח. נסה שוב.",
      variant: "destructive",
    });
  };

  const showAuthErrorMessage = () => {
    toast({
      title: "שגיאה",
      description: "יש להתחבר כדי לשלוח דיווח",
      variant: "destructive",
    });
  };

  return {
    showSuccessMessage,
    showErrorMessage,
    showAuthErrorMessage,
  };
};
