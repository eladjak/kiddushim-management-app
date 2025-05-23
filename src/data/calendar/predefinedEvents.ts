
import { PredefinedEvent } from "../types/eventTypes";
import { predefinedEventsByMonth } from "./eventsByMonth";

// Get all events as a flat array
export const predefinedEvents: PredefinedEvent[] = Object.values(predefinedEventsByMonth)
  .flatMap(monthEvents => monthEvents);

/**
 * Get a predefined event by ID
 */
export function getPredefinedEventById(id: string): PredefinedEvent | undefined {
  return predefinedEvents.find(event => event.id === id);
}

/**
 * Get upcoming predefined events (dates after today)
 */
export function getUpcomingPredefinedEvents(): PredefinedEvent[] {
  const today = new Date();
  return predefinedEvents
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Check if an event is available for selection
 * (not in break period and not in the past)
 */
export function isEventAvailable(event: PredefinedEvent): boolean {
  const today = new Date();
  const eventDate = new Date(event.date);
  return eventDate >= today;
}
