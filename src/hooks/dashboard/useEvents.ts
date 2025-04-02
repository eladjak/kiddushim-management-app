
import { useQuery } from "@tanstack/react-query";
import { eventsService } from "@/services/entity/events";
import { Event } from "@/types/events";

export const useEvents = (userId?: string) => {
  return useQuery({
    queryKey: ['events', userId],
    queryFn: async () => {
      try {
        // Use our updated service
        const events = await eventsService.getUpcoming();
        return events.slice(0, 6) as Event[]; // Limit to 6 events
      } catch (error) {
        console.error('Error fetching events:', error);
        return [] as Event[];
      }
    },
    enabled: true, // Always fetch events
  });
};
