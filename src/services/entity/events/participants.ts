
import { supabase } from '@/integrations/supabase/client';

/**
 * הוספת משתתף לאירוע
 */
export async function addParticipant(eventId: string, userId: string) {
  console.log(`Adding participant ${userId} to event ${eventId}`);
  
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
}

/**
 * הסרת משתתף מאירוע
 */
export async function removeParticipant(eventId: string, userId: string) {
  console.log(`Removing participant ${userId} from event ${eventId}`);
  
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
}

/**
 * קבלת רשימת משתתפים לאירוע
 */
export async function getParticipants(eventId: string) {
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
