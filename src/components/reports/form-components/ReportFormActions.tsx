
import { Button } from "@/components/ui/button";

interface ReportFormActionsProps {
  isSubmitting: boolean;
  isFormValid: boolean;
  onClose: () => void;
}

export const ReportFormActions = ({ isSubmitting, isFormValid, onClose }: ReportFormActionsProps) => {
  return (
    <div className="flex justify-between pt-6 border-t">
      <Button type="button" variant="outline" onClick={onClose}>
        ביטול
      </Button>
      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={!isFormValid || isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? "שולח..." : "שלח דיווח"}
        </Button>
      </div>
    </div>
  );
};
