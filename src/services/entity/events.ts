
import { supabase } from '@/integrations/supabase/client';
import { 
  Event, EventCreate, EventUpdate, EventWithDetails, 
  EventDB, EventCreateDB, EventUpdateDB, EventWithDetailsDB, EventStatus, EventType
} from '@/types/events';

/**
 * Helper function to convert DB event format to application Event format
 */
function convertDBEventToEvent(dbEvent: EventDB): Event {
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
function convertDBEventToEventWithDetails(dbEvent: EventWithDetailsDB): EventWithDetails {
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
function convertDBEventsToEvents(dbEvents: EventDB[]): Event[] {
  return dbEvents.map(convertDBEventToEvent);
}

/**
 * שירות לניהול אירועים
 */
export const eventsService = {
  /**
   * קבלת כל האירועים
   */
  async getAll() {
    console.log('Fetching all events');
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
      
    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
    
    // המרה מפורמט הדאטהבייס לפורמט הישן
    return convertDBEventsToEvents(data as EventDB[]);
  },
  
  /**
   * קבלת אירועים עתידיים
   */
  async getUpcoming() {
    console.log('Fetching upcoming events');
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true });
      
    if (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
    
    // המרה מפורמט הדאטהבייס לפורמט הישן
    return convertDBEventsToEvents(data as EventDB[]);
  },
  
  /**
   * קבלת אירוע לפי מזהה
   */
  async getById(id: string) {
    console.log(`Fetching event with id: ${id}`);
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_assignments(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
    
    // המרה מפורמט הדאטהבייס לפורמט הישן
    return convertDBEventToEventWithDetails(data as EventWithDetailsDB);
  },
  
  /**
   * יצירת אירוע חדש
   */
  async create(event: EventCreate) {
    console.log('Creating new event:', event.title);
    
    // המרה מהפורמט הישן לפורמט הדאטהבייס
    const dbEvent: EventCreateDB = {
      title: event.title,
      date: event.date,
      setup_time: event.main_time, // Approximate mapping
      main_time: event.main_time,
      cleanup_time: event.main_time, // Use main_time if time_end doesn't exist
      location_name: event.location || '',
      location_address: event.location || '',
      created_by: event.created_by,
      status: 'draft',
      required_service_girls: 0
    };
    
    const { data, error } = await supabase
      .from('events')
      .insert(dbEvent)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating event:', error);
      throw error;
    }
    
    // המרה חזרה לפורמט הישן
    return convertDBEventToEvent(data as EventDB);
  },
  
  /**
   * עדכון אירוע קיים
   */
  async update(id: string, event: EventUpdate) {
    console.log(`Updating event ${id}:`, event);
    
    // המרה מהפורמט הישן לפורמט הדאטהבייס
    const dbEventUpdate: EventUpdateDB = {};
    
    if (event.title) dbEventUpdate.title = event.title;
    if (event.date) dbEventUpdate.date = event.date;
    if (event.main_time) {
      dbEventUpdate.setup_time = event.main_time;
      dbEventUpdate.main_time = event.main_time;
    }
    if (event.main_time) dbEventUpdate.cleanup_time = event.main_time;
    if (event.location) {
      dbEventUpdate.location_name = event.location;
      dbEventUpdate.location_address = event.location;
    }
    if (event.status) dbEventUpdate.status = event.status;
    
    const { data, error } = await supabase
      .from('events')
      .update(dbEventUpdate)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
    
    // המרה חזרה לפורמט הישן
    return convertDBEventToEvent(data as EventDB);
  },
  
  /**
   * מחיקת אירוע
   */
  async delete(id: string) {
    console.log(`Deleting event ${id}`);
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
    
    return true;
  },
  
  /**
   * הוספת משתתף לאירוע
   */
  async addParticipant(eventId: string, userId: string) {
    console.log(`Adding participant ${userId} to event ${eventId}`);
    
    // בדיקה אם טבלת משתתפים קיימת
    try {
      const { data, error } = await supabase
        .from('event_assignments')
        .insert({
          event_id: eventId,
          user_id: userId,
          role: 'volunteer',
          status: 'registered'
        })
        .select()
        .single();
        
      if (error) {
        console.error(`Error adding participant to event ${eventId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error adding participant to event ${eventId}:`, error);
      throw error;
    }
  },
  
  /**
   * הסרת משתתף מאירוע
   */
  async removeParticipant(eventId: string, userId: string) {
    console.log(`Removing participant ${userId} from event ${eventId}`);
    
    // בדיקה אם טבלת משתתפים קיימת
    try {
      const { error } = await supabase
        .from('event_assignments')
        .delete()
        .match({ event_id: eventId, user_id: userId });
        
      if (error) {
        console.error(`Error removing participant from event ${eventId}:`, error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Error removing participant from event ${eventId}:`, error);
      throw error;
    }
  },
  
  /**
   * קבלת רשימת משתתפים לאירוע
   */
  async getParticipants(eventId: string) {
    console.log(`Fetching participants for event ${eventId}`);
    
    try {
      const { data, error } = await supabase
        .from('event_assignments')
        .select(`
          *,
          profiles:user_id(id, name)
        `)
        .eq('event_id', eventId)
        .eq('role', 'volunteer');
        
      if (error) {
        console.error(`Error fetching participants for event ${eventId}:`, error);
        throw error;
      }
      
      // המרה לפורמט האחיד
      return data.map((assignment: any) => ({
        id: assignment.id,
        event_id: assignment.event_id,
        user_id: assignment.user_id,
        status: assignment.status,
        created_at: assignment.created_at,
        user: assignment.profiles ? {
          id: assignment.profiles.id,
          full_name: assignment.profiles.name,
          avatar_url: assignment.profiles.avatar_url
        } : undefined
      }));
    } catch (error) {
      console.error(`Error fetching participants for event ${eventId}:`, error);
      throw error;
    }
  }
}; 
