
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
    
    // סידור האירועים לפי תאריך
    const sortedEvents = convertedEvents.sort((a, b) => {
      const dateA = a.main_time ? new Date(a.main_time) : new Date(a.date);
      const dateB = b.main_time ? new Date(b.main_time) : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Log detailed event data for debugging
    log.info('Sorted upcoming events:', { 
      count: sortedEvents.length,
      firstEvent: sortedEvents.length > 0 ? {
        id: sortedEvents[0].id,
        title: sortedEvents[0].title,
        date: sortedEvents[0].date,
        main_time: sortedEvents[0].main_time,
      } : 'No events'
    });
    
    return sortedEvents;
  } catch (error) {
    log.error('Error in getUpcomingEvents:', error);
    // Return empty array instead of throwing to avoid breaking dashboard
    return [];
  }
}
