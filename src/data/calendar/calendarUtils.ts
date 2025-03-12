
import { specialDates } from "./specialDates";

// Helper functions for event management
export const isDateInBreakPeriod = (date: string) => {
  return specialDates.breakPeriods.some(period => {
    const eventDate = new Date(date);
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return eventDate >= startDate && eventDate <= endDate;
  });
};

export const getHebrewMonthName = (dateStr: string) => {
  const date = new Date(dateStr);
  const month = date.getMonth();
  const hebrewMonths = [
    "טבת/שבט", "שבט/אדר", "אדר/ניסן", "ניסן/אייר", "אייר/סיוון", 
    "סיוון/תמוז", "תמוז/אב", "אב/אלול", "אלול/תשרי", "תשרי/חשוון", 
    "חשוון/כסלו", "כסלו/טבת"
  ];
  return hebrewMonths[month];
};
