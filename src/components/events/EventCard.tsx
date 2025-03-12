
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { safeDecodeHebrew } from "@/integrations/supabase/setupStorage";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    main_time: string;
    location_name: string;
    parasha?: string;
    status?: string;
  };
  isInBreakPeriod: boolean;
}

export const EventCard = ({ event, isInBreakPeriod }: EventCardProps) => {
  return (
    <div 
      className={`p-4 rounded-md border ${
        isInBreakPeriod 
          ? 'border-red-200 bg-red-50' 
          : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
      } transition-colors`}
    >
      <div className="text-right">
        <div className="text-sm text-accent font-medium mb-2">
          {format(new Date(event.main_time), "EEEE, d בMMMM", { locale: he })}
          {isInBreakPeriod && (
            <span className="text-red-600 mr-2 font-bold">(בתקופת הפסקה)</span>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">{safeDecodeHebrew(event.title)}</h3>
        
        {event.parasha && (
          <div className="text-sm text-gray-700 mb-1">פרשת {safeDecodeHebrew(event.parasha)}</div>
        )}
        
        <p className="text-sm text-gray-600 mb-4">{safeDecodeHebrew(event.location_name)}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {event.status && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              event.status === 'published' ? 'bg-green-100 text-green-800' : 
              event.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {event.status === 'published' ? 'פורסם' : 
               event.status === 'draft' ? 'טיוטה' : 
               'ממתין לאישור'}
            </span>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 rtl:space-x-reverse">
          <Link to={`/events/${event.id}`}>
            <Button variant="outline" size="sm">
              פרטים נוספים
            </Button>
          </Link>
          <Button size="sm" disabled={isInBreakPeriod}>
            הרשמה לאירוע
          </Button>
        </div>
      </div>
    </div>
  );
};
