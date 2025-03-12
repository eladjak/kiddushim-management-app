
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { CreateEventForm } from "@/components/events/CreateEventForm";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Plus, Info } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventsList } from "@/components/events/EventsList";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { specialDates } from "@/data/eventCalendar";

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
            
            <EventsList events={events} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
