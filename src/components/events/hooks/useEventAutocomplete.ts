import { useState, useMemo } from "react";
import { PredefinedEvent } from "@/data/types/eventTypes";
import { kidushishiEvents2025_2026 } from "@/data/events/predefinedEvents2025-2026";

export const useEventAutocomplete = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<PredefinedEvent | null>(null);

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return kidushishiEvents2025_2026;

    const term = searchTerm.toLowerCase();
    return kidushishiEvents2025_2026.filter(event => 
      event.parasha.toLowerCase().includes(term) ||
      event.location?.toLowerCase().includes(term) ||
      event.notes.some(note => note.toLowerCase().includes(term)) ||
      event.dayOfWeek.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      const date = new Date(event.date);
      const monthKey = date.toLocaleDateString('he-IL', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(event);
      return acc;
    }, {} as Record<string, PredefinedEvent[]>);
  }, [filteredEvents]);

  const handleEventSelect = (event: PredefinedEvent) => {
    setSelectedEvent(event);
    setSearchTerm("");
  };

  const clearSelection = () => {
    setSelectedEvent(null);
    setSearchTerm("");
  };

  const getEventsByParasha = (parasha: string) => {
    return kidushishiEvents2025_2026.filter(event => 
      event.parasha.toLowerCase().includes(parasha.toLowerCase())
    );
  };

  const getUpcomingEvents = (days: number = 30) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return kidushishiEvents2025_2026.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= futureDate;
    });
  };

  const getEventsByLocation = (locationName: string) => {
    return kidushishiEvents2025_2026.filter(event =>
      event.location?.toLowerCase().includes(locationName.toLowerCase())
    );
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedEvent,
    filteredEvents,
    groupedEvents,
    handleEventSelect,
    clearSelection,
    getEventsByParasha,
    getUpcomingEvents,
    getEventsByLocation
  };
};