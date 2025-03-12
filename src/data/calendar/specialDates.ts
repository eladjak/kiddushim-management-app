
import { SpecialDates } from "../types/eventTypes";

// Special dates and break periods
export const specialDates: SpecialDates = {
  holidays: [
    { name: "יום הזיכרון לשואה ולגבורה", date: "2025-04-24" },
    { name: "יום הזיכרון לחללי צה\"ל", date: "2025-04-30" },
    { name: "יום העצמאות", date: "2025-05-01", endDate: "2025-05-02" },
    { name: "ל\"ג בעומר", date: "2025-05-15" },
    { name: "יום ירושלים", date: "2025-05-28" },
  ],
  fasts: [
    { name: "צום י\"ז בתמוז", date: "2025-07-13" },
    { name: "צום תשעה באב", date: "2025-07-31" },
    { name: "צום גדליה", date: "2025-09-25" },
    { name: "יום כיפור", date: "2025-10-01", endDate: "2025-10-02" },
  ],
  breakPeriods: [
    { name: "הפסקה בתשעת הימים", startDate: "2025-07-23", endDate: "2025-08-01" },
    { name: "הפסקת חגי תשרי", startDate: "2025-09-24", endDate: "2025-10-17" },
  ]
};
