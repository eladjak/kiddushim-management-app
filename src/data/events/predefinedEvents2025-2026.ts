
import { PredefinedEvent } from "@/data/types/eventTypes";

/**
 * לוח אירועי קידושישי מגדל העמק 2025-2026 
 * 18 אירועים קהילתיים - מעבר לפורמט חמישי החדש החל מיוני 2025
 */
export const kidushishiEvents2025_2026: PredefinedEvent[] = [
  // אירועים שהושלמו (בימי שישי)
  {
    id: "tazria-metzora-2025",
    date: "2025-05-02",
    hebrewDate: "ב' אייר תשפ״ה",
    parasha: "תזריע-מצורע",
    time: "15:30-16:30",
    mainTime: "15:30",
    setupTime: "15:00",
    dayOfWeek: "שישי",
    serviceLadiesAvailable: true,
    notes: ["הושלם", "חיבור וקהילה"],
    location: "פארק רבין"
  },
  {
    id: "emor-2025",
    date: "2025-05-16", 
    hebrewDate: "י' אייר תשפ״ה",
    parasha: "אמור",
    time: "15:30-16:30",
    mainTime: "15:30",
    setupTime: "15:00",
    dayOfWeek: "שישי",
    serviceLadiesAvailable: true,
    notes: ["הושלם", "מנהיגות ואחריות"],
    location: "פארק רבין"
  },
  {
    id: "bamidbar-2025",
    date: "2025-05-30",
    hebrewDate: "כ״ד אייר תשפ״ה", 
    parasha: "במדבר",
    time: "16:00-17:00",
    mainTime: "16:00",
    setupTime: "15:30",
    dayOfWeek: "שישי",
    serviceLadiesAvailable: true,
    notes: ["הושלם", "קהילה וארגון"],
    location: "פארק רבין"
  },
  
  // מעבר לפורמט חמישי החדש!
  {
    id: "behaalotcha-2025",
    date: "2025-06-12",
    hebrewDate: "ח' סיון תשפ״ה",
    parasha: "בהעלותך", 
    time: "17:00-18:30",
    mainTime: "17:00",
    setupTime: "16:30",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["בוטל", "אור ומנהיגות", "מעבר לפורמט חמישי!", "בוטל עקב קיום מאוחר של אירועי יום העצמאות"],
    location: "פארק יער בלפור"
  },
  {
    id: "korach-2025",
    date: "2025-06-26",
    hebrewDate: "כ״ב סיון תשפ״ה",
    parasha: "קרח",
    time: "17:00-18:30", 
    mainTime: "17:00",
    setupTime: "16:30",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["אחדות ושלום"],
    location: "פארק יער בלפור"
  },
  {
    id: "chukat-2025",
    date: "2025-07-10",
    hebrewDate: "י״ב תמוז תשפ״ה",
    parasha: "חקת",
    time: "17:00-18:30",
    mainTime: "17:00", 
    setupTime: "16:30",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["התמודדות עם שינויים", "לפני י״ז בתמוז"],
    location: "פארק יער בלפור"
  },
  {
    id: "matot-masei-2025",
    date: "2025-07-24",
    hebrewDate: "כ״ו תמוז תשפ״ה",
    parasha: "מטות-מסעי",
    time: "17:00-18:30",
    mainTime: "17:00",
    setupTime: "16:30", 
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["מסעות וערכים", "ללא מוזיקה בין המצרים"],
    location: "פארק יער בלפור"
  },
  {
    id: "vaetchanan-2025",
    date: "2025-08-07",
    hebrewDate: "י״א אב תשפ״ה",
    parasha: "ואתחנן",
    time: "17:00-18:30",
    mainTime: "17:00",
    setupTime: "16:30",
    dayOfWeek: "חמישי", 
    serviceLadiesAvailable: true,
    notes: ["אהבה ומחויבות", "אחרי ט׳ באב"],
    location: "פארק יער בלפור"
  },
  {
    id: "reeh-2025",
    date: "2025-08-21",
    hebrewDate: "כ״ה אב תשפ״ה",
    parasha: "ראה",
    time: "16:30-18:00",
    mainTime: "16:30",
    setupTime: "16:00",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["בחירות והשלכות"],
    location: "פארק יער בלפור"
  },
  {
    id: "ki-tetze-2025", 
    date: "2025-09-04",
    hebrewDate: "ט׳ אלול תשפ״ה",
    parasha: "כי תצא",
    time: "16:30-18:00",
    mainTime: "16:30",
    setupTime: "16:00",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true, 
    notes: ["חסד ורחמים"],
    location: "פארק יער בלפור"
  },
  {
    id: "nitzavim-2025",
    date: "2025-09-18",
    hebrewDate: "כ״ג אלול תשפ״ה",
    parasha: "ניצבים",
    time: "16:30-18:00",
    mainTime: "16:30",
    setupTime: "16:00",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["עומדים יחד", "לפני ראש השנה"],
    location: "פארק יער בלפור"
  },
  {
    id: "bereshit-2025",
    date: "2025-10-16",
    hebrewDate: "כ״ב תשרי תשפ״ו",
    parasha: "בראשית",
    time: "16:30-18:00",
    mainTime: "16:30",
    setupTime: "16:00", 
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["התחלות חדשות", "אחרי שמחת תורה"],
    location: "פארק יער בלפור"
  },
  {
    id: "vayera-2025",
    date: "2025-11-06",
    hebrewDate: "י״ג חשון תשפ״ו",
    parasha: "וירא",
    time: "16:30-18:00",
    mainTime: "16:30",
    setupTime: "16:00",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["הכנסת אורחים וחסד"],
    location: "פארק יער בלפור"
  },
  {
    id: "vayetze-2025",
    date: "2025-11-27", 
    hebrewDate: "ד׳ כסלו תשפ״ו",
    parasha: "ויצא",
    time: "16:30-18:00",
    mainTime: "16:30",
    setupTime: "16:00",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["חלומות ושאיפות"],
    location: "פארק יער בלפור"
  },
  {
    id: "vayeshev-2025",
    date: "2025-12-11",
    hebrewDate: "י״ח כסלו תשפ״ו",
    parasha: "וישב",
    time: "16:30-18:00", 
    mainTime: "16:30",
    setupTime: "16:00",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["התמודדות עם אתגרים"],
    location: "פארק יער בלפור"
  },
  {
    id: "chanukah-2025",
    date: "2025-12-25",
    hebrewDate: "ה׳ טבת תשפ״ו",
    parasha: "חנוכה",
    time: "16:30-18:00",
    mainTime: "16:30",
    setupTime: "16:00",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["אור וניסים", "נר שלישי של חנוכה"],
    location: "פארק יער בלפור"
  },
  {
    id: "shemot-2026",
    date: "2026-01-09",
    hebrewDate: "י״ח טבת תשפ״ו", 
    parasha: "שמות",
    time: "16:30-18:00",
    mainTime: "16:30",
    setupTime: "16:00",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["ערכים ומנהיגות"],
    location: "פארק יער בלפור"
  },
  {
    id: "beshalach-2026",
    date: "2026-01-30",
    hebrewDate: "ט׳ שבט תשפ״ו",
    parasha: "בשלח",
    time: "16:30-18:00",
    mainTime: "16:30",
    setupTime: "16:00",
    dayOfWeek: "חמישי",
    serviceLadiesAvailable: true,
    notes: ["שירה וחירות", "שבת שירה"],
    location: "פארק יער בלפור"
  }
];

/**
 * קבלת אירוע לפי ID
 */
export function getKidushishiEventById(id: string): PredefinedEvent | undefined {
  return kidushishiEvents2025_2026.find(event => event.id === id);
}

/**
 * קבלת אירועים עתידיים
 */
export function getUpcomingKidushishiEvents(): PredefinedEvent[] {
  const today = new Date();
  return kidushishiEvents2025_2026
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * קבלת אירועים שהושלמו
 */
export function getCompletedKidushishiEvents(): PredefinedEvent[] {
  const today = new Date();
  return kidushishiEvents2025_2026
    .filter(event => new Date(event.date) < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
