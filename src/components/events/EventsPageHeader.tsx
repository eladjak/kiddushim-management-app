
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Calendar, Download } from "lucide-react";

interface EventsPageHeaderProps {
  canCreateEvents?: boolean;
  showCreateForm?: boolean;
  onToggleCreateForm?: () => void;
}

export function EventsPageHeader({ canCreateEvents, showCreateForm, onToggleCreateForm }: EventsPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-right">אירועי קידושישי</h1>
      <p className="text-gray-500 text-right">צפיה, ניהול וארגון אירועי קידושישי הקרובים</p>
      
      <div className="flex justify-between mt-2">
        {canCreateEvents && (
          <Button
            onClick={onToggleCreateForm}
            variant={showCreateForm ? "outline" : "default"}
            className="flex items-center gap-2"
          >
            {showCreateForm ? "סגור טופס" : "הוסף אירוע חדש"}
            {showCreateForm ? null : "+"}
          </Button>
        )}
        
        <Button 
          onClick={() => navigate('/timeline-pdf')} 
          variant="outline" 
          className="flex items-center gap-2 text-sm"
        >
          <Calendar className="h-4 w-4" />
          <span>צפה בלוח השנה להדפסה</span>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
