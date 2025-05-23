
import { SpecialDates } from "../types/eventTypes";

// Special dates for the Jewish calendar 2025-2026
export const specialDates: SpecialDates = {
  holidays: [
    { name: "יום העצמאות", date: "2025-05-02" },
    { name: "ל\"ג בעומר", date: "2025-05-15" },
    { name: "שבועות", date: "2025-06-01", endDate: "2025-06-02" },
    { name: "ראש השנה", date: "2025-09-23", endDate: "2025-09-24" },
    { name: "יום כיפור", date: "2025-10-02", endDate: "2025-10-03" },
    { name: "סוכות", date: "2025-10-07", endDate: "2025-10-15" },
    { name: "חנוכה", date: "2025-12-17", endDate: "2025-12-25" },
    { name: "ט\"ו בשבט", date: "2026-01-14" },
    { name: "פורים", date: "2026-03-13", endDate: "2026-03-14" },
    { name: "פסח", date: "2026-04-11", endDate: "2026-04-18" }
  ],
  fasts: [
    { name: "צום י\"ז בתמוז", date: "2025-07-13" },
    { name: "צום תשעה באב", date: "2025-07-31" },
    { name: "צום גדליה", date: "2025-09-25" },
    { name: "יום כיפור", date: "2025-10-02" }
  ],
  breakPeriods: [
    // The periods when no events are held
    { name: "תשעת הימים", startDate: "2025-07-23", endDate: "2025-08-01" },
    { name: "חגי תשרי", startDate: "2025-09-22", endDate: "2025-10-17" },
    { name: "חנוכה", startDate: "2025-12-23", endDate: "2025-12-30" },
    { name: "חגי ניסן", startDate: "2026-05-08", endDate: "2026-05-27" }
  ]
};
