
import { Button } from "@/components/ui/button";

interface ReportFormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
}

export const ReportFormActions = ({ isLoading, onCancel }: ReportFormActionsProps) => {
  return (
    <div className="flex justify-end pt-2">
      <Button 
        variant="outline" 
        type="button" 
        className="ml-2"
        onClick={onCancel}
      >
        ביטול
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "שולח..." : "שלח דיווח"}
      </Button>
    </div>
  );
};
