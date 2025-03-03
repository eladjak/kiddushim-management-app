
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar, Check } from "lucide-react";

// Sample events data
const events = [
  {
    id: 1,
    date: new Date("2025-02-15"),
    title: "פרשת יתרו",
    description: "שעה: 16:00-17:30 (כניסת שבת: 17:17)",
    hasBanotSherut: true,
    note: "ט\"ו בשבט (14.2)"
  },
  {
    id: 2,
    date: new Date("2025-03-08"),
    title: "פרשת תצוה (שבת זכור)",
    description: "שעה: 16:00-17:30 (כניסת שבת: 17:38)",
    hasBanotSherut: true,
    note: "לפני פורים"
  },
  {
    id: 3,
    date: new Date("2025-03-29"),
    title: "פרשת פקודי",
    description: "שעה: 18:28-19:33 (כניסת שבת: 19:33)",
    hasBanotSherut: true,
    note: null
  }
];

/**
 * Timeline component showing upcoming events schedule
 */
export const Timeline = () => {
  // Group events by month
  const eventsByMonth: Record<string, typeof events> = {};
  
  events.forEach(event => {
    const monthYear = format(event.date, 'MMMM yyyy', { locale: he });
    if (!eventsByMonth[monthYear]) {
      eventsByMonth[monthYear] = [];
    }
    eventsByMonth[monthYear].push(event);
  });

  return (
    <div className="space-y-6 lg:space-y-8 py-4 lg:py-6">
      <h2 className="text-3xl font-bold text-right">לוח זמנים - קידושישי 2025</h2>
      
      <p className="text-gray-600 text-right">
        להלן לוח הזמנים המתוכנן עבור מפגשי קידושישי בשנת 2025.
        כל האירועים נערכים בימי שישי לקראת כניסת השבת, אלא אם צוין אחרת.
      </p>
      
      {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
        <div key={month} className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">{month}</h3>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            {monthEvents.map((event, index) => (
              <div key={event.id}>
                {index > 0 && <Separator />}
                <div className="p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div className="text-right space-y-1">
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-sm text-gray-600">{event.description}</div>
                      {event.note && (
                        <div className="text-sm text-amber-600">{event.note}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-center min-w-20">
                      <div className="text-lg font-bold">
                        {format(event.date, 'd', { locale: he })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(event.date, 'EEEE', { locale: he })}
                      </div>
                      {event.hasBanotSherut && (
                        <div className="mt-2 flex items-center text-xs text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          בנות שירות זמינות
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="bg-muted p-4 rounded-lg mt-8">
        <p className="text-sm text-gray-600 text-right">
          הערה: לוח הזמנים עשוי להשתנות. יש לוודא את המועדים הסופיים לקראת האירועים.
        </p>
      </div>
    </div>
  );
};
