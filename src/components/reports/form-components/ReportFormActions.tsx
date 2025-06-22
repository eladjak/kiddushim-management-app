
import { Button } from "@/components/ui/button";
import { AlertCircle, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReportFormActionsProps {
  isSubmitting: boolean;
  isFormValid: boolean;
  onClose: () => void;
}

export const ReportFormActions = ({ isSubmitting, isFormValid, onClose }: ReportFormActionsProps) => {
  return (
    <div className="space-y-4" dir="rtl">
      {!isFormValid && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            נא למלא את כל השדות הנדרשים בכדי לשלוח את הדיווח
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          ביטול
        </Button>
        <Button 
          type="submit" 
          disabled={!isFormValid || isSubmitting}
          className="min-w-[120px] flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              שולח...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              שלח דיווח
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
