
import { specialDates } from "./specialDates";

/**
 * בודק האם תאריך נמצא בתוך תקופת הפסקה
 */
export const isDateInBreakPeriod = (dateStr: string) => {
  const eventDate = new Date(dateStr);
  
  return specialDates.breakPeriods.some(period => {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return eventDate >= startDate && eventDate <= endDate;
  });
};

/**
 * מחזיר את שם החודש העברי לתאריך נתון
 */
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
