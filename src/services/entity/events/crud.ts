
import { supabase } from '@/integrations/supabase/client';
import {
  Event, EventCreate, EventUpdate, EventWithDetails,
  normalizeEvent, normalizeEventWithDetails, normalizeEvents
} from '@/types/events';
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

  return normalizeEvents(data as Record<string, unknown>[]);
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

  return normalizeEventWithDetails(data as Record<string, unknown>);
}

/**
 * יצירת אירוע חדש
 * Accepts EventCreate which uses DB column names directly.
 */
export async function createEvent(event: EventCreate): Promise<Event> {
  log.debug('Creating new event', { action: 'create', title: event.title });

  // Build the DB insert object from EventCreate fields.
  // Since EventCreate now uses DB column names, we can pass fields directly.
  const dbEvent: Record<string, unknown> = {
    title: event.title,
    date: event.date,
    setup_time: event.setup_time || event.setupTime || event.main_time || '',
    main_time: event.main_time || '',
    cleanup_time: event.cleanup_time || event.main_time || '',
    location_name: event.location_name || event.location || '',
    location_address: event.location_address || event.location || '',
    created_by: event.created_by,
    status: event.status || 'draft',
    parasha: event.parasha,
    required_service_girls: event.required_service_girls ?? event.max_participants ?? 0,
    required_youth_volunteers: event.required_youth_volunteers ?? 0,
  };

  // Pass through optional fields if present
  if (event.equipment) dbEvent.equipment = event.equipment;
  if (event.location_coordinates) dbEvent.location_coordinates = event.location_coordinates;

  const { data, error } = await supabase
    .from('events')
    .insert(dbEvent)
    .select()
    .single();

  if (error) {
    log.error('Error creating event', { error });
    throw error;
  }

  return normalizeEvent(data as Record<string, unknown>);
}

/**
 * עדכון אירוע קיים
 */
export async function updateEvent(id: string, event: EventUpdate): Promise<Event> {
  log.debug(`Updating event ${id}`, { action: 'update' });

  // Build the DB update object, only including provided fields.
  const dbUpdate: Record<string, unknown> = {};

  if (event.title) dbUpdate.title = event.title;
  if (event.date) dbUpdate.date = event.date;
  if (event.setup_time || event.setupTime) {
    dbUpdate.setup_time = event.setup_time || event.setupTime;
  }
  if (event.main_time) {
    dbUpdate.main_time = event.main_time;
    // If setup_time not explicitly set, default to main_time
    if (!dbUpdate.setup_time) dbUpdate.setup_time = event.main_time;
  }
  if (event.cleanup_time || event.main_time) {
    dbUpdate.cleanup_time = event.cleanup_time || event.main_time;
  }
  if (event.location_name || event.location) {
    dbUpdate.location_name = event.location_name || event.location;
  }
  if (event.location_address || event.location) {
    dbUpdate.location_address = event.location_address || event.location;
  }
  if (event.status) dbUpdate.status = event.status;
  if (event.parasha) dbUpdate.parasha = event.parasha;
  if (event.required_service_girls !== undefined) {
    dbUpdate.required_service_girls = event.required_service_girls;
  } else if (event.max_participants !== undefined) {
    dbUpdate.required_service_girls = event.max_participants;
  }
  if (event.required_youth_volunteers !== undefined) {
    dbUpdate.required_youth_volunteers = event.required_youth_volunteers;
  }
  if (event.equipment) dbUpdate.equipment = event.equipment;
  if (event.location_coordinates) dbUpdate.location_coordinates = event.location_coordinates;

  const { data, error } = await supabase
    .from('events')
    .update(dbUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    log.error(`Error updating event ${id}`, { error });
    throw error;
  }

  return normalizeEvent(data as Record<string, unknown>);
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
