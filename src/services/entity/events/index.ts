
// ייבוא כל הפונקציות מהמודולים השונים
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from './crud';
import { getUpcomingEvents } from './upcoming';
import { addParticipant, removeParticipant, getParticipants } from './participants';
import { convertDBEventToEvent, convertDBEventToEventWithDetails, convertDBEventsToEvents } from './converters';

// שירות מאוחד לניהול אירועים
export const eventsService = {
  // CRUD Operations
  getAll: getAllEvents,
  getById: getEventById,
  create: createEvent,
  update: updateEvent,
  delete: deleteEvent,

  // Upcoming Events
  getUpcoming: getUpcomingEvents,

  // Participants
  addParticipant,
  removeParticipant,
  getParticipants,

  // Converters (backward compatibility)
  convertDBEventToEvent,
  convertDBEventToEventWithDetails,
  convertDBEventsToEvents
};
