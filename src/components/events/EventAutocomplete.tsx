import React, { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { kidushishiEvents2025_2026 } from "@/data/events/predefinedEvents2025-2026";
import { PredefinedEvent } from "@/data/types/eventTypes";

interface EventAutocompleteProps {
  value?: string;
  onSelect: (event: PredefinedEvent) => void;
  placeholder?: string;
  className?: string;
}

export const EventAutocomplete = ({ 
  value, 
  onSelect, 
  placeholder = "חפש אירוע...",
  className 
}: EventAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<PredefinedEvent | null>(null);

  // Filter events based on search
  const filteredEvents = kidushishiEvents2025_2026.filter(event =>
    event.parasha.toLowerCase().includes(searchValue.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchValue.toLowerCase()) ||
    event.notes.some(note => note.toLowerCase().includes(searchValue.toLowerCase()))
  );

  // Group events by month for better organization
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = new Date(event.date);
    const monthKey = date.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(event);
    return acc;
  }, {} as Record<string, PredefinedEvent[]>);

  const handleSelect = (event: PredefinedEvent) => {
    setSelectedEvent(event);
    onSelect(event);
    setOpen(false);
    setSearchValue("");
  };

  const formatEventPreview = (event: PredefinedEvent) => {
    const date = new Date(event.date);
    const timeStr = event.mainTime;
    
    return (
      <div className="flex flex-col space-y-1">
        <div className="font-medium text-right">קידושישי - פרשת {event.parasha}</div>
        <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeStr}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date.toLocaleDateString('he-IL')}
          </div>
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </div>
          )}
        </div>
        <Badge variant="outline" className="text-xs w-fit">
          פרשת {event.parasha}
        </Badge>
        {event.notes.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {event.notes.slice(0, 2).join(" • ")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-right"
          >
            {selectedEvent ? (
              <div className="truncate">קידושישי - פרשת {selectedEvent.parasha}</div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="end">
          <Command className="w-full">
            <CommandInput 
              placeholder="חפש אירוע לפי פרשה, מקום או הערות..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="text-right"
            />
            <CommandList className="max-h-96">
              <CommandEmpty>לא נמצאו אירועים</CommandEmpty>
              
              {Object.entries(groupedEvents).map(([month, events]) => (
                <CommandGroup key={month} heading={month}>
                  {events.map((event) => (
                    <CommandItem
                      key={event.id}
                      value={event.parasha}
                      onSelect={() => handleSelect(event)}
                      className="p-3 cursor-pointer hover:bg-accent"
                    >
                      {formatEventPreview(event)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedEvent && (
        <div className="mt-2 p-3 bg-accent/20 rounded-md border">
          {formatEventPreview(selectedEvent)}
        </div>
      )}
    </div>
  );
};