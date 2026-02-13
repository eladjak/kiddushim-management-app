
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const log = logger.createLogger({ component: 'EventParticipants' });

/**
 * הוספת משתתף לאירוע
 */
export async function addParticipant(eventId: string, userId: string) {
  log.debug(`Adding participant ${userId} to event ${eventId}`, { action: 'addParticipant' });

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
      log.error(`Error adding participant to event ${eventId}`, { error });
      throw error;
    }

    return data;
  } catch (error) {
    log.error(`Error adding participant to event ${eventId}`, { error });
    throw error;
  }
}

/**
 * הסרת משתתף מאירוע
 */
export async function removeParticipant(eventId: string, userId: string) {
  log.debug(`Removing participant ${userId} from event ${eventId}`, { action: 'removeParticipant' });

  try {
    const { error } = await supabase
      .from('event_assignments')
      .delete()
      .match({ event_id: eventId, user_id: userId });

    if (error) {
      log.error(`Error removing participant from event ${eventId}`, { error });
      throw error;
    }

    return true;
  } catch (error) {
    log.error(`Error removing participant from event ${eventId}`, { error });
    throw error;
  }
}

/**
 * קבלת רשימת משתתפים לאירוע
 */
export async function getParticipants(eventId: string) {
  log.debug(`Fetching participants for event ${eventId}`, { action: 'getParticipants' });

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
      log.error(`Error fetching participants for event ${eventId}`, { error });
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
    log.error(`Error fetching participants for event ${eventId}`, { error });
    throw error;
  }
}
