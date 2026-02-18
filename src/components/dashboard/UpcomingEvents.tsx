
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useRegisterParticipant } from "@/services/query/hooks/useEvents";
import { Badge } from "@/components/ui/badge";
import { logger } from "@/utils/logger";
import type { Event } from "@/types/events";

interface UpcomingEventsProps {
  events: Event[] | null;
  isLoading: boolean;
}

export const UpcomingEvents = ({ events, isLoading }: UpcomingEventsProps) => {
  const { user } = useAuth();
  const registerMutation = useRegisterParticipant();
  const log = logger.createLogger({ component: 'UpcomingEvents' });

  const handleRegister = (eventId: string) => {
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר למערכת כדי להירשם לאירוע",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({ 
      eventId, 
      userId: user.id 
    }, {
      onSuccess: () => {
        toast({
          description: "נרשמת בהצלחה לאירוע",
        });
      }
    });
  };
  
  if (isLoading) {
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-right">אירועים קרובים</h2>
        <div className="text-center py-8">טוען אירועים...</div>
      </section>
    );
  }

  // Log the events for debugging
  log.info("Rendering upcoming events", { 
    count: events?.length || 0,
    events: events?.map(e => ({ id: e.id, title: e.title, date: e.main_time }))
  });

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-right">אירועים קרובים</h2>
        <Link to="/events">
          <Button variant="ghost" size="sm" className="text-primary">
            <Calendar className="h-4 w-4 ms-1" />
            כל האירועים
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events && events.length > 0 ? events.map((event) => (
          <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
            <div className="text-right">
              <div className="text-sm text-accent font-medium mb-2">
                {event.main_time ? format(new Date(event.main_time), "EEEE, d בMMMM", { locale: he }) : "תאריך לא זמין"}
              </div>
              <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
              
              {event.parasha && (
                <div className="text-sm text-gray-700 mb-1">פרשת {event.parasha}</div>
              )}
              
              <p className="text-sm text-gray-600 mb-4">{event.location_name || "מיקום לא צוין"}</p>
              
              {event.status && (
                <div className="mb-4">
                  <Badge className={`px-2 py-1 ${
                    event.status === 'published' ? 'bg-green-100 text-green-800' : 
                    event.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.status === 'published' ? 'פורסם' : 
                     event.status === 'draft' ? 'טיוטה' : 
                     'ממתין לאישור'}
                  </Badge>
                </div>
              )}
              
              <div className="flex justify-end space-x-4 rtl:space-x-reverse">
                <Link to={`/events/${event.id}`}>
                  <Button variant="outline" size="sm">
                    פרטים נוספים
                  </Button>
                </Link>
                <Button 
                  size="sm"
                  onClick={() => handleRegister(event.id)}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending && event.id === registerMutation.variables?.eventId 
                    ? "רושם..." 
                    : "הרשמה לאירוע"}
                </Button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            לא נמצאו אירועים קרובים
          </div>
        )}
      </div>
    </section>
  );
};
