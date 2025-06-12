
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { predefinedEvents } from "@/data/calendar/predefinedEvents";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export const EventTimeline = () => {
  const timelineEvents = useMemo(() => {
    return predefinedEvents
      .map(event => ({
        ...event,
        dateObj: new Date(event.date)
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">לוח זמנים שנתי - אירועי קידושישי</h2>
        <p className="text-gray-600">
          מחזור השנה של אירועי קידושישי, כולל מועדים מיוחדים וחגים
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {timelineEvents.map((event, index) => (
          <Card key={`${event.date}-${index}`} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  קידושישי - פרשת {event.parasha}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 ml-1" />
                  {format(event.dateObj, "d/M", { locale: he })}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 ml-2" />
                <span>{event.dayOfWeek || format(event.dateObj, "EEEE", { locale: he })}</span>
                <span className="mr-2">•</span>
                <span>{event.time}</span>
              </div>
              
              {event.hebrewDate && (
                <div className="text-sm text-blue-600 font-medium">
                  {event.hebrewDate}
                </div>
              )}
              
              {event.parasha && (
                <div className="text-sm text-gray-700">
                  פרשת {event.parasha}
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 ml-2" />
                <span>מגדל העמק</span>
              </div>
              
              {event.serviceLadiesAvailable && (
                <div className="flex items-center text-sm text-green-600">
                  <Users className="h-4 w-4 ml-2" />
                  <span>בנות שירות זמינות</span>
                </div>
              )}
              
              {event.notes && event.notes.length > 0 && (
                <div className="text-sm text-amber-600">
                  {event.notes.join(' • ')}
                </div>
              )}
              
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  פרטים נוספים
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Button variant="default" size="lg">
          הורד PDF עם לוח הזמנים המלא
        </Button>
      </div>
    </div>
  );
};
