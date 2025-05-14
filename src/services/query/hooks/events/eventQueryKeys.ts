
// Query key factory for events
export const EVENTS_KEYS = {
  all: ['events'] as const,
  lists: () => [...EVENTS_KEYS.all, 'list'] as const,
  list: (filters: string) => [...EVENTS_KEYS.lists(), { filters }] as const,
  upcoming: () => [...EVENTS_KEYS.all, 'upcoming'] as const,
  details: () => [...EVENTS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EVENTS_KEYS.details(), id] as const,
  participants: (id: string) => [...EVENTS_KEYS.detail(id), 'participants'] as const,
};
