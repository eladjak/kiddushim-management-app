
import { PredefinedEvent, convertPredefinedToEvent } from './types/predefinedEvents';
import { isDateInBreakPeriod, getHebrewMonthName } from './calendar/calendarUtils';
import { specialDates } from './calendar/specialDates';
import { predefinedEvents, getPredefinedEventById } from './calendar/predefinedEvents';

// Convert a predefined event to a regular event
export { getPredefinedEventById };

// Convert all predefined events to regular events
export function getPredefinedEventsAsEvents() {
  return predefinedEvents.map(convertPredefinedToEvent);
}

// Export utils
export { predefinedEvents, isDateInBreakPeriod, getHebrewMonthName, specialDates };
