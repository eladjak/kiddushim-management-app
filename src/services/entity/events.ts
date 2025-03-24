import { supabase } from '../supabase/client';
import type { Event, EventCreate, EventUpdate, EventWithDetails } from '@/types/events';

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
    
    return data as Event[];
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
    
    return data as Event[];
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
        event_participants(*),
        event_equipment(*),
        event_assignments(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
    
    return data as EventWithDetails;
  },
  
  /**
   * יצירת אירוע חדש
   */
  async create(event: EventCreate) {
    console.log('Creating new event:', event.title);
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating event:', error);
      throw error;
    }
    
    return data as Event;
  },
  
  /**
   * עדכון אירוע קיים
   */
  async update(id: string, event: EventUpdate) {
    console.log(`Updating event ${id}:`, event);
    const { data, error } = await supabase
      .from('events')
      .update(event)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
    
    return data as Event;
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
    const { data, error } = await supabase
      .from('event_participants')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'registered'
      })
      .select()
      .single();
      
    if (error) {
      console.error(`Error adding participant to event ${eventId}:`, error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * הסרת משתתף מאירוע
   */
  async removeParticipant(eventId: string, userId: string) {
    console.log(`Removing participant ${userId} from event ${eventId}`);
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .match({ event_id: eventId, user_id: userId });
      
    if (error) {
      console.error(`Error removing participant from event ${eventId}:`, error);
      throw error;
    }
    
    return true;
  },
  
  /**
   * קבלת רשימת משתתפים לאירוע
   */
  async getParticipants(eventId: string) {
    console.log(`Fetching participants for event ${eventId}`);
    const { data, error } = await supabase
      .from('event_participants')
      .select(`
        *,
        user:user_id(id, full_name, email, phone, avatar_url)
      `)
      .eq('event_id', eventId);
      
    if (error) {
      console.error(`Error fetching participants for event ${eventId}:`, error);
      throw error;
    }
    
    return data;
  }
}; 