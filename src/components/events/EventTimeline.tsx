
import React from "react";
import { predefinedEvents } from "@/data/calendar/predefinedEvents";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { specialDates } from "@/data/calendar/specialDates";

export const EventTimeline = () => {
  // Group events by Hebrew month
  const eventsByMonth: Record<string, typeof predefinedEvents> = {};
  
  predefinedEvents.forEach(event => {
    const dateParts = event.hebrewDate.split(' ');
    const hebrewMonth = dateParts[1];
    
    if (!eventsByMonth[hebrewMonth]) {
      eventsByMonth[hebrewMonth] = [];
    }
    
    eventsByMonth[hebrewMonth].push(event);
  });
  
  // Get break periods
  const { breakPeriods } = specialDates;
  
  return (
    <div className="bg-slate-100 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-center mb-8">לוח אירועי קידושישי מגדל העמק 2025-2026</h2>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-500"></div>
        
        <div className="space-y-16">
          {Object.entries(eventsByMonth).map(([month, events]) => (
            <div key={month} className="relative">
              <div className="mb-8 text-center">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full inline-block">
                  חודש {month}
                </span>
              </div>
              
              <div className="space-y-12">
                {events.map(event => {
                  const eventDate = new Date(event.date);
                  const formattedDate = format(eventDate, "EEEE, d בMMMM yyyy", { locale: he });
                  
                  // Check if event is in a break period
                  const isInBreakPeriod = breakPeriods.some(period => {
                    const startDate = new Date(period.startDate);
                    const endDate = new Date(period.endDate);
                    return eventDate >= startDate && eventDate <= endDate;
                  });
                  
                  return (
                    <div key={event.id} className="flex items-center justify-between">
                      <div className="w-5/12 text-left pl-4">
                        <h3 className={`text-lg font-semibold ${isInBreakPeriod ? "line-through text-gray-400" : ""}`}>
                          {formattedDate}
                        </h3>
                        <p className="text-sm text-gray-600">{event.time}</p>
                      </div>
                      
                      <div className="w-2/12 flex justify-center">
                        <div className="bg-white w-8 h-8 rounded-full border-4 border-blue-500 z-10"></div>
                      </div>
                      
                      <div className="w-5/12 pr-4">
                        <h3 className={`text-lg font-semibold ${isInBreakPeriod ? "line-through text-gray-400" : ""}`}>
                          {event.parasha}
                        </h3>
                        <p className="text-sm">{event.hebrewDate}</p>
                        {event.notes && event.notes.length > 0 && (
                          <p className="text-xs text-gray-600 mt-1">{event.notes.join(', ')}</p>
                        )}
                        {event.serviceLadiesAvailable && (
                          <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full mt-1 inline-block">
                            בנות שירות זמינות
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Break periods indicators */}
        <div className="mt-12 space-y-4">
          <h3 className="text-xl font-semibold">תקופות הפסקה:</h3>
          <ul className="list-disc list-inside">
            {breakPeriods.map((period, index) => (
              <li key={index} className="text-red-600">
                {period.name}: {format(new Date(period.startDate), "dd/MM/yyyy")} עד {format(new Date(period.endDate), "dd/MM/yyyy")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
