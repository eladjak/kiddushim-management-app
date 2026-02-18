
/**
 * Event converters - re-exports from unified types.
 * These are now thin wrappers since Event and EventDB are unified.
 */
export {
  normalizeEvent as convertDBEventToEvent,
  normalizeEventWithDetails as convertDBEventToEventWithDetails,
  normalizeEvents as convertDBEventsToEvents,
} from '@/types/events';
