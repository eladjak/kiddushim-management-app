
import { 
  Event, EventDB, EventWithDetails, EventWithDetailsDB,
  EventType, EventStatus
} from '@/types/events';

/**
 * Helper function to convert DB event format to application Event format
 */
export function convertDBEventToEvent(dbEvent: EventDB): Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.title, // Using title as fallback for description
    location: dbEvent.location_name,
    date: dbEvent.date,
    main_time: dbEvent.main_time,
    time_start: dbEvent.main_time,
    time_end: dbEvent.cleanup_time,
    status: (dbEvent.status as any) || 'draft',
    type: EventType.KIDUSH, // Default type
    max_participants: dbEvent.required_service_girls || 0,
    created_at: dbEvent.created_at,
    updated_at: dbEvent.updated_at,
    created_by: dbEvent.created_by,
    // Add required properties for the dashboard and events page components
    location_name: dbEvent.location_name,
    parasha: dbEvent.parasha
  };
}

/**
 * Helper function to convert DB event with details to application EventWithDetails format
 */
export function convertDBEventToEventWithDetails(dbEvent: EventWithDetailsDB): EventWithDetails {
  const baseEvent = convertDBEventToEvent(dbEvent);
  
  return {
    ...baseEvent,
    participants: dbEvent.event_participants,
    equipment: dbEvent.event_equipment,
    assignments: dbEvent.event_assignments
  };
}

/**
 * Helper function to convert array of DB events to application Events
 */
export function convertDBEventsToEvents(dbEvents: EventDB[]): Event[] {
  return dbEvents.map(convertDBEventToEvent);
}
