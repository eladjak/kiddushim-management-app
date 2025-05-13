
import { supabase } from '@/integrations/supabase/client';
import { Event, EventDB } from '@/types/events';
import { convertDBEventsToEvents } from './converters';

/**
 * קבלת אירועים עתידיים
 */
export async function getUpcomingEvents(): Promise<Event[]> {
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
  
  // המרה מפורמט הדאטהבייס לפורמט האפליקציה
  return convertDBEventsToEvents(data as EventDB[]);
}
