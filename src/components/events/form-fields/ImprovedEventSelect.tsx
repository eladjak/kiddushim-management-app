
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Search, Plus } from "lucide-react";
import { kidushishiEvents2025_2026, getUpcomingKidushishiEvents, getKidushishiEventById } from "@/data/events/predefinedEvents2025-2026";
import { isDateInBreakPeriod, getHebrewMonthName } from "@/data/calendar/calendarUtils";
import { PredefinedEvent } from "@/data/types/eventTypes";
import { logger } from "@/utils/logger";

interface ImprovedEventSelectProps {
  onEventSelect: (eventId: string) => void;
  onCustomEventCreate?: () => void;
}

export const ImprovedEventSelect = ({ onEventSelect, onCustomEventCreate }: ImprovedEventSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"upcoming" | "all">("upcoming");
  const log = logger.createLogger({ component: 'ImprovedEventSelect' });
  
  // Get events based on selected category
  const allEvents = selectedCategory === "upcoming" 
    ? getUpcomingKidushishiEvents() 
    : kidushishiEvents2025_2026;
  
  // Filter events based on search term
  const filteredEvents = allEvents.filter(event => 
    event.parasha.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.hebrewDate.includes(searchTerm) ||
    event.dayOfWeek.includes(searchTerm)
  );

  // Group events by month
  const eventsByMonth: Record<string, PredefinedEvent[]> = {};
  
  filteredEvents.forEach(event => {
    try {
      const date = new Date(event.date);
      if (isNaN(date.getTime())) {
        log.warn('Invalid date for event', { event });
        return;
      }
      
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!eventsByMonth[monthKey]) {
        eventsByMonth[monthKey] = [];
      }
      
      eventsByMonth[monthKey].push(event);
    } catch (error) {
      log.error('Error processing event for grouping', { error, event });
    }
  });
  
  const sortedMonthKeys = Object.keys(eventsByMonth).sort();

  const handleEventSelect = (eventId: string) => {
    log.info('Event selected from improved selector', { eventId });
    onEventSelect(eventId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            בחירת אירוע מתוכנן
          </CardTitle>
          <CardDescription>
            בחר אירוע קידושישי מתוכנן או צור אירוע חדש באופן ידני
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="event-search">חיפוש אירוע</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="event-search"
                  placeholder="חפש לפי פרשה או תאריך..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pe-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="event-category">קטגוריה</Label>
              <Select value={selectedCategory} onValueChange={(value: "upcoming" | "all") => setSelectedCategory(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">עתידיים</SelectItem>
                  <SelectItem value="all">כל האירועים</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Event Selection */}
          <div>
            <Label htmlFor="event-select">בחר אירוע</Label>
            <Select onValueChange={handleEventSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="בחר מועד קידושישי מתוכנן" />
              </SelectTrigger>
              <SelectContent className="max-h-[350px]">
                {sortedMonthKeys.length > 0 ? (
                  sortedMonthKeys.map(monthKey => {
                    const monthEvents = eventsByMonth[monthKey];
                    const firstEvent = monthEvents[0];
                    const hebrewMonth = getHebrewMonthName(firstEvent.date);
                    
                    return (
                      <div key={monthKey} className="mb-2">
                        <div className="px-2 py-1 font-semibold bg-secondary/20 rounded-sm text-right">
                          {hebrewMonth} (חודש {new Date(firstEvent.date).getMonth() + 1})
                        </div>
                        {monthEvents.map(event => {
                          const isBreakPeriod = isDateInBreakPeriod(event.date);
                          const eventDate = new Date(event.date);
                          const today = new Date();
                          const isPast = eventDate < today;
                          
                          return (
                            <SelectItem 
                              key={event.id} 
                              value={event.id}
                              disabled={isBreakPeriod || isPast}
                              className={`${isBreakPeriod ? "opacity-50 line-through" : ""} ${isPast ? "text-gray-400" : ""}`}
                            >
                              {event.dayOfWeek}, {event.hebrewDate} - {event.parasha}
                              {event.serviceLadiesAvailable && " 👧"}
                              {isBreakPeriod && " (בתוך תקופת הפסקה)"}
                              {isPast && " (עבר)"}
                            </SelectItem>
                          );
                        })}
                      </div>
                    );
                  })
                ) : (
                  <SelectItem value="no-events" disabled>
                    {searchTerm ? "לא נמצאו אירועים התואמים לחיפוש" : "אין אירועים זמינים"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Event Option */}
          {onCustomEventCreate && (
            <div className="pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCustomEventCreate}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                צור אירוע מותאם אישית
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
