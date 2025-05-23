
import { PredefinedEvent } from "../../types/eventTypes";

/**
 * Events for the month of Elul (September) 5785 - 2025
 */
export const elulEvents: PredefinedEvent[] = [
  {
    id: "11",
    date: "2025-09-05",
    hebrewDate: "י׳ אלול תשפ״ה",
    parasha: "כי תצא",
    time: "15:45-16:45",
    shabatEntrance: "20:32",
    serviceLadiesAvailable: true,
    notes: ["סליחות והכלה"],
    mainTime: "15:45",
    setupTime: "14:45",
    dayOfWeek: "יום שישי"
  },
  {
    id: "12",
    date: "2025-09-19",
    hebrewDate: "כ״ד אלול תשפ״ה",
    parasha: "ניצבים",
    time: "15:30-16:30",
    shabatEntrance: "20:29",
    serviceLadiesAvailable: false,
    notes: ["לפני ראש השנה"],
    mainTime: "15:30",
    setupTime: "14:30",
    dayOfWeek: "יום שישי"
  }
];
