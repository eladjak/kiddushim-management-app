
import { supabase } from '@/integrations/supabase/client';
import { Event, EventDB } from '@/types/events';
import { convertDBEventsToEvents } from './converters';
import { logger } from '@/utils/logger';

/**
 * קבלת אירועים עתידיים
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  const log = logger.createLogger({ component: 'getUpcomingEvents' });
  log.info('Fetching upcoming events');
  
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true });
      
    if (error) {
      log.error('Error fetching upcoming events:', error);
      throw error;
    }
    
    log.info(`Retrieved ${data?.length || 0} upcoming events`);
    
    // המרה מפורמט הדאטהבייס לפורמט האפליקציה
    const convertedEvents = convertDBEventsToEvents(data as EventDB[]);
    
    // Log detailed event data for debugging
    log.info('Converted events:', { 
      count: convertedEvents.length,
      firstEvent: convertedEvents.length > 0 ? {
        id: convertedEvents[0].id,
        title: convertedEvents[0].title,
        date: convertedEvents[0].date,
        main_time: convertedEvents[0].main_time,
      } : 'No events'
    });
    
    return convertedEvents;
  } catch (error) {
    log.error('Error in getUpcomingEvents:', error);
    // Return empty array instead of throwing to avoid breaking dashboard
    return [];
  }
}
