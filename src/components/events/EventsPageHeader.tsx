
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface EventsPageHeaderProps {
  canCreateEvents?: boolean;
  showCreateForm?: boolean;
  onToggleCreateForm?: () => void;
}

export const EventsPageHeader = ({ 
  canCreateEvents = false,
  showCreateForm = false,
  onToggleCreateForm
}: EventsPageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b">
      <div className="flex items-center mb-4 md:mb-0">
        <Calendar className="h-6 w-6 text-primary ml-2" />
        <h1 className="text-2xl font-bold">אירועים</h1>
      </div>
      
      {canCreateEvents && (
        <Button
          onClick={onToggleCreateForm}
          variant={showCreateForm ? "outline" : "default"}
        >
          {showCreateForm ? "ביטול" : "הוספת אירוע חדש"}
        </Button>
      )}
    </div>
  );
};
