
import { useEvents, useUpcomingEvents, useEvent } from './events/useEventQueries';
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from './events/useEventMutations';
import { useRegisterParticipant, useCancelParticipation } from './events/useEventParticipation';
import { EVENTS_KEYS } from './events/eventQueryKeys';

// Re-exporting all event hooks
export {
  // Query keys
  EVENTS_KEYS,
  
  // Query hooks
  useEvents,
  useUpcomingEvents,
  useEvent,
  
  // Mutation hooks
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  
  // Participant hooks
  useRegisterParticipant,
  useCancelParticipation
};
