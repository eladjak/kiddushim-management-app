
import { Button } from "@/components/ui/button";

interface EventFormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
}

export const EventFormActions = ({ isLoading, onCancel }: EventFormActionsProps) => {
  return (
    <div className="flex justify-end pt-4">
      <Button 
        variant="outline" 
        type="button" 
        className="ml-2"
        onClick={onCancel}
      >
        ביטול
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "יוצר אירוע..." : "צור אירוע"}
      </Button>
    </div>
  );
};
