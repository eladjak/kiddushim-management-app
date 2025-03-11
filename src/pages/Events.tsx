
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { CreateEventForm } from "@/components/events/CreateEventForm";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Plus, Info } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { specialDates } from "@/components/events/form-fields/ParashaField";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Events = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator";
  const canCreateEvents = isAdmin || isCoordinator;
  
  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events_page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('main_time', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
  });
  
  // Group events by month
  const eventsByMonth: Record<string, any[]> = {};
  events.forEach(event => {
    const date = new Date(event.main_time);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = [];
    }
    eventsByMonth[monthKey].push(event);
  });
  
  // Sort months chronologically
  const sortedMonthKeys = Object.keys(eventsByMonth).sort();
  
  // Check if a date is in a break period
  const isDateInBreakPeriod = (dateStr: string) => {
    const date = new Date(dateStr);
    return specialDates.breakPeriods.some(period => {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      return date >= startDate && date <= endDate;
    });
  };
  
  // Check if there are upcoming events
  const hasEvents = events.length > 0;
  
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-primary ml-2" />
            <h1 className="text-3xl font-bold">אירועים</h1>
          </div>
          
          {canCreateEvents && !showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 ml-1" />
              אירוע חדש
            </Button>
          )}
          
          {showCreateForm && (
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              חזרה לרשימת האירועים
            </Button>
          )}
        </div>
        
        {showCreateForm ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <CreateEventForm />
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center py-10">
            טוען אירועים...
          </div>
        ) : !hasEvents ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col items-center py-12">
              <Image
                src="/lovable-uploads/a0a5beb0-b56a-44ad-900e-7dccede43ce0.png"
                alt="קידושישי"
                className="h-24 w-auto mb-6"
                fallback="/placeholder.svg"
              />
              <h2 className="text-2xl font-semibold mb-4">עדיין אין אירועים</h2>
              <p className="text-gray-600 mb-6 text-center max-w-lg">
                {canCreateEvents 
                  ? "כרגע אין אירועים במערכת. התחל ליצור אירועים חדשים בלחיצה על כפתור 'אירוע חדש'" 
                  : "כרגע אין אירועים במערכת. אירועים חדשים יופיעו כאן כאשר יתווספו על ידי מנהל או רכז"}
              </p>
              
              {canCreateEvents && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 ml-1" />
                  צור אירוע ראשון
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm p-6">
              <AccordionItem value="calendar-info">
                <AccordionTrigger className="text-right py-2">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 ml-2 text-primary" />
                    <span>לוח שנתי - מידע מיוחד</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm space-y-4">
                  <div className="bg-secondary/10 p-3 rounded-md border border-secondary/20">
                    <h3 className="font-bold mb-2 text-base">ימי זיכרון וחגים לאומיים 🕯️</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {specialDates.holidays.map((holiday, index) => (
                        <li key={index} className="text-sm">
                          {holiday.name}: {new Date(holiday.date).toLocaleDateString('he-IL')}
                          {holiday.endDate && ` - ${new Date(holiday.endDate).toLocaleDateString('he-IL')}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-secondary/10 p-3 rounded-md border border-secondary/20">
                    <h3 className="font-bold mb-2 text-base">צומות 📅</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {specialDates.fasts.map((fast, index) => (
                        <li key={index} className="text-sm">
                          {fast.name}: {new Date(fast.date).toLocaleDateString('he-IL')}
                          {fast.endDate && ` - ${new Date(fast.endDate).toLocaleDateString('he-IL')}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-md border border-red-200">
                    <h3 className="font-bold mb-2 text-base text-red-700">תקופות הפסקה ⛔</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {specialDates.breakPeriods.map((period, index) => (
                        <li key={index} className="text-sm text-red-700">
                          {period.name}: {new Date(period.startDate).toLocaleDateString('he-IL')} - {new Date(period.endDate).toLocaleDateString('he-IL')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {sortedMonthKeys.map(monthKey => {
              const monthEvents = eventsByMonth[monthKey];
              const firstEventDate = new Date(monthEvents[0].main_time);
              const monthLabel = format(firstEventDate, 'MMMM yyyy', { locale: he });
              
              return (
                <div key={monthKey} className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b">{monthLabel}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {monthEvents.map(event => {
                      const isInBreakPeriod = isDateInBreakPeriod(event.main_time);
                      
                      return (
                        <div 
                          key={event.id} 
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
                            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                            
                            {event.parasha && (
                              <div className="text-sm text-gray-700 mb-1">פרשת {event.parasha}</div>
                            )}
                            
                            <p className="text-sm text-gray-600 mb-4">{event.location_name}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                event.status === 'published' ? 'bg-green-100 text-green-800' : 
                                event.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {event.status === 'published' ? 'פורסם' : 
                                event.status === 'draft' ? 'טיוטה' : 
                                'ממתין לאישור'}
                              </span>
                              
                              {event.setup_time && (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  הכנה: {format(new Date(event.setup_time), "HH:mm", { locale: he })}
                                </span>
                              )}
                              
                              {event.main_time && (
                                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                  התחלה: {format(new Date(event.main_time), "HH:mm", { locale: he })}
                                </span>
                              )}
                              
                              {event.cleanup_time && (
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                  סיום: {format(new Date(event.cleanup_time), "HH:mm", { locale: he })}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
                              <Button variant="outline" size="sm">
                                פרטים נוספים
                              </Button>
                              <Button size="sm" disabled={isInBreakPeriod}>
                                הרשמה לאירוע
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
