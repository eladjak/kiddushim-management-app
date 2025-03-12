
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

interface EventsPageHeaderProps {
  canCreateEvents: boolean;
  showCreateForm: boolean;
  onToggleCreateForm: () => void;
}

export const EventsPageHeader = ({ 
  canCreateEvents, 
  showCreateForm, 
  onToggleCreateForm 
}: EventsPageHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center">
        <Calendar className="h-6 w-6 text-primary ml-2" />
        <h1 className="text-3xl font-bold">אירועים</h1>
      </div>
      
      {canCreateEvents && !showCreateForm && (
        <Button onClick={onToggleCreateForm}>
          <Plus className="h-4 w-4 ml-1" />
          אירוע חדש
        </Button>
      )}
      
      {showCreateForm && (
        <Button variant="outline" onClick={onToggleCreateForm}>
          חזרה לרשימת האירועים
        </Button>
      )}
    </div>
  );
};
