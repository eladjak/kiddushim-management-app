
import { supabase } from '@/integrations/supabase/client';
import {
  Event, EventCreate, EventUpdate, EventWithDetails,
  EventDB, EventCreateDB, EventUpdateDB, EventWithDetailsDB
} from '@/types/events';
import { convertDBEventToEvent, convertDBEventToEventWithDetails, convertDBEventsToEvents } from './converters';
import { logger } from '@/utils/logger';

const log = logger.createLogger({ component: 'EventsCrud' });

/**
 * קבלת כל האירועים
 */
export async function getAllEvents(): Promise<Event[]> {
  log.debug('Fetching all events');
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    log.error('Error fetching events', { error });
    throw error;
  }

  // המרה מפורמט הדאטהבייס לפורמט האפליקציה
  return convertDBEventsToEvents(data as EventDB[]);
}

/**
 * קבלת אירוע לפי מזהה
 */
export async function getEventById(id: string): Promise<EventWithDetails> {
  log.debug(`Fetching event with id: ${id}`);
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_assignments(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    log.error(`Error fetching event ${id}`, { error });
    throw error;
  }

  // המרה מפורמט הדאטהבייס לפורמט האפליקציה
  return convertDBEventToEventWithDetails(data as EventWithDetailsDB);
}

/**
 * יצירת אירוע חדש
 */
export async function createEvent(event: EventCreate): Promise<Event> {
  log.debug('Creating new event', { action: 'create', title: event.title });

  // המרה מהפורמט הישן לפורמט הדאטהבייס
  const dbEvent: EventCreateDB = {
    title: event.title,
    date: event.date,
    setup_time: event.main_time || event.setupTime || '', // Use available data
    main_time: event.main_time || '',
    cleanup_time: event.main_time || event.time_end || '', // Use available data
    location_name: event.location_name || event.location || '',
    location_address: event.location || '',
    created_by: event.created_by,
    status: event.status || 'draft',
    parasha: event.parasha,
    required_service_girls: event.max_participants || 0
  };

  const { data, error } = await supabase
    .from('events')
    .insert(dbEvent)
    .select()
    .single();

  if (error) {
    log.error('Error creating event', { error });
    throw error;
  }

  // המרה חזרה לפורמט האפליקציה
  return convertDBEventToEvent(data as EventDB);
}

/**
 * עדכון אירוע קיים
 */
export async function updateEvent(id: string, event: EventUpdate): Promise<Event> {
  log.debug(`Updating event ${id}`, { action: 'update' });

  // המרה מהפורמט הישן לפורמט הדאטהבייס
  const dbEventUpdate: EventUpdateDB = {};

  if (event.title) dbEventUpdate.title = event.title;
  if (event.date) dbEventUpdate.date = event.date;
  if (event.main_time) {
    dbEventUpdate.setup_time = event.setupTime || event.main_time;
    dbEventUpdate.main_time = event.main_time;
  }
  if (event.time_end || event.main_time) {
    dbEventUpdate.cleanup_time = event.time_end || event.main_time;
  }
  if (event.location) {
    dbEventUpdate.location_name = event.location_name || event.location;
    dbEventUpdate.location_address = event.location;
  }
  if (event.status) dbEventUpdate.status = event.status;
  if (event.parasha) dbEventUpdate.parasha = event.parasha;
  if (event.max_participants !== undefined) {
    dbEventUpdate.required_service_girls = event.max_participants;
  }

  const { data, error } = await supabase
    .from('events')
    .update(dbEventUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    log.error(`Error updating event ${id}`, { error });
    throw error;
  }

  // המרה חזרה לפורמט האפליקציה
  return convertDBEventToEvent(data as EventDB);
}

/**
 * מחיקת אירוע
 */
export async function deleteEvent(id: string): Promise<boolean> {
  log.debug(`Deleting event ${id}`, { action: 'delete' });
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    log.error(`Error deleting event ${id}`, { error });
    throw error;
  }

  return true;
}
