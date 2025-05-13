
import { PredefinedEvent, convertPredefinedToEvent } from './types/predefinedEvents';
import { isDateInBreakPeriod, getHebrewMonthName } from './calendar/calendarUtils';
import { specialDates } from './calendar/specialDates';

/**
 * אירועים מוגדרים מראש לשימוש בלוח השנה
 */
export const predefinedEvents: PredefinedEvent[] = [
  {
    id: '1',
    date: '2025-05-02',
    hebrewDate: 'ב׳ אייר תשפ״ה',
    parasha: 'תזריע-מצורע',
    dayOfWeek: 'יום שישי',
    time: '16:00-17:30',
    setupTime: "15:00",
    mainTime: "16:00",
    serviceLadiesAvailable: true,
    notes: ['במסגרת ספירת העומר', 'סמוך ליום העצמאות (1-2.5)']
  },
  {
    id: '2',
    date: '2025-05-16',
    hebrewDate: 'ט״ז אייר תשפ״ה',
    parasha: 'אמור',
    dayOfWeek: 'יום שישי',
    time: '16:30-18:00',
    setupTime: "15:30",
    mainTime: "16:30",
    serviceLadiesAvailable: true,
    notes: ['בתוך ספירת העומר', 'אחרי ל״ג בעומר (15.5)']
  },
  {
    id: '3',
    date: '2025-05-23',
    hebrewDate: 'כ״ג אייר תשפ״ה',
    parasha: 'בהר-בחוקותי',
    dayOfWeek: 'יום שישי',
    time: '17:00-18:30',
    setupTime: "16:00",
    mainTime: "17:00",
    serviceLadiesAvailable: false,
    notes: ['בתוך ספירת העומר']
  },
  {
    id: '4',
    date: '2025-06-06',
    hebrewDate: 'ח׳ סיוון תשפ״ה',
    parasha: 'נשא',
    dayOfWeek: 'יום שישי',
    time: '17:30-19:00',
    setupTime: "16:30",
    mainTime: "17:30",
    serviceLadiesAvailable: true,
    notes: ['אחרי חג השבועות (1-2.6)']
  },
  {
    id: '5',
    date: '2025-06-20',
    hebrewDate: 'כ״ב סיוון תשפ״ה',
    parasha: 'שלח',
    dayOfWeek: 'יום שישי',
    time: '18:00-19:30',
    setupTime: "17:00",
    mainTime: "18:00",
    serviceLadiesAvailable: false,
    notes: []
  },
  {
    id: '6',
    date: '2025-07-04',
    hebrewDate: 'ו׳ תמוז תשפ״ה',
    parasha: 'חקת',
    dayOfWeek: 'יום שישי',
    time: '18:30-20:00',
    setupTime: "17:30",
    mainTime: "18:30",
    serviceLadiesAvailable: false,
    notes: []
  },
  {
    id: '7',
    date: '2025-07-11',
    hebrewDate: 'י״ג תמוז תשפ״ה',
    parasha: 'בלק',
    dayOfWeek: 'יום שישי',
    time: '18:30-20:00',
    setupTime: "17:30",
    mainTime: "18:30",
    serviceLadiesAvailable: true,
    notes: ['ערב צום י״ז בתמוז (13.7)']
  },
  {
    id: '8',
    date: '2025-07-18',
    hebrewDate: 'כ׳ תמוז תשפ״ה',
    parasha: 'פינחס',
    dayOfWeek: 'יום שישי',
    time: '18:30-20:00',
    setupTime: "17:30",
    mainTime: "18:30",
    serviceLadiesAvailable: false,
    notes: ['לפני תשעת הימים']
  },
  {
    id: '9',
    date: '2025-08-15',
    hebrewDate: 'י״ח אב תשפ״ה',
    parasha: 'עקב',
    dayOfWeek: 'יום שישי',
    time: '18:00-19:30',
    setupTime: "17:00", 
    mainTime: "18:00",
    serviceLadiesAvailable: false,
    notes: ['אחרי ט״ו באב (14.8)']
  },
  {
    id: '10',
    date: '2025-08-22',
    hebrewDate: 'כ״ה אב תשפ״ה',
    parasha: 'ראה',
    dayOfWeek: 'יום שישי',
    time: '18:00-19:30',
    setupTime: "17:00",
    mainTime: "18:00",
    serviceLadiesAvailable: false,
    notes: []
  },
  {
    id: '11',
    date: '2025-08-29',
    hebrewDate: 'ג׳ אלול תשפ״ה',
    parasha: 'שופטים',
    dayOfWeek: 'יום שישי',
    time: '17:30-19:00',
    setupTime: "16:30",
    mainTime: "17:30",
    serviceLadiesAvailable: false,
    notes: []
  },
  {
    id: '12',
    date: '2025-09-05',
    hebrewDate: 'י׳ אלול תשפ״ה',
    parasha: 'כי תצא',
    dayOfWeek: 'יום שישי',
    time: '17:30-19:00',
    setupTime: "16:30",
    mainTime: "17:30",
    serviceLadiesAvailable: false,
    notes: []
  },
  {
    id: '13',
    date: '2025-09-12',
    hebrewDate: 'י״ז אלול תשפ״ה',
    parasha: 'כי תבוא',
    dayOfWeek: 'יום שישי',
    time: '17:00-18:30',
    setupTime: "16:00",
    mainTime: "17:00",
    serviceLadiesAvailable: false,
    notes: []
  },
  {
    id: '14',
    date: '2025-09-19',
    hebrewDate: 'כ״ד אלול תשפ״ה',
    parasha: 'ניצבים',
    dayOfWeek: 'יום שישי',
    time: '16:30-18:00',
    setupTime: "15:30",
    mainTime: "16:30",
    serviceLadiesAvailable: true,
    notes: ['לפני ראש השנה']
  },
  {
    id: '15',
    date: '2025-10-24',
    hebrewDate: 'ג׳ חשוון תשפ״ו',
    parasha: 'נח',
    dayOfWeek: 'יום חמישי',
    time: '17:00-18:30',
    setupTime: "16:00",
    mainTime: "17:00",
    serviceLadiesAvailable: false,
    notes: []
  },
  {
    id: '16',
    date: '2025-11-07',
    hebrewDate: 'י״ז חשוון תשפ״ו',
    parasha: 'וירא',
    dayOfWeek: 'יום שישי',
    time: '16:00-17:30',
    setupTime: "15:00",
    mainTime: "16:00",
    serviceLadiesAvailable: false,
    notes: []
  },
  {
    id: '17',
    date: '2025-11-21',
    hebrewDate: 'א׳ כסלו תשפ״ו',
    parasha: 'תולדות',
    dayOfWeek: 'יום שישי',
    time: '16:00-17:30',
    setupTime: "15:00",
    mainTime: "16:00",
    serviceLadiesAvailable: false,
    notes: []
  }
];

// Convert a predefined event to a regular event
export function getPredefinedEventById(id: string) {
  return predefinedEvents.find(event => event.id === id);
}

// Convert all predefined events to regular events
export function getPredefinedEventsAsEvents() {
  return predefinedEvents.map(convertPredefinedToEvent);
}

// Export utils
export { isDateInBreakPeriod, getHebrewMonthName, specialDates };
