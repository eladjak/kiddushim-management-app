
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the predefined events structure
export interface PredefinedEvent {
  id: string;
  date: string;
  hebrewDate: string;
  parasha: string;
  time: string;
  shabatEntrance: string;
  serviceLadiesAvailable: boolean;
  notes?: string[];
  mainTime?: string;
  setupTime?: string;
}

// List of predefined events based on the provided schedule
const predefinedEvents: PredefinedEvent[] = [
  {
    id: "1",
    date: "2025-02-15",
    hebrewDate: "י\"ז שבט",
    parasha: "יתרו",
    time: "16:00-17:30",
    shabatEntrance: "17:17",
    serviceLadiesAvailable: true,
    notes: ["ט\"ו בשבט (14.2)"],
    mainTime: "16:00",
    setupTime: "15:00"
  },
  {
    id: "2",
    date: "2025-03-08",
    hebrewDate: "ח' אדר",
    parasha: "תצוה (שבת זכור)",
    time: "16:00-17:30",
    shabatEntrance: "17:38",
    serviceLadiesAvailable: true,
    notes: ["לפני פורים"],
    mainTime: "16:00",
    setupTime: "15:00"
  },
  {
    id: "3",
    date: "2025-03-29",
    hebrewDate: "כ\"ט אדר",
    parasha: "פקודי",
    time: "18:28-19:33",
    shabatEntrance: "19:33",
    serviceLadiesAvailable: true,
    mainTime: "18:30",
    setupTime: "17:30"
  },
  {
    id: "4",
    date: "2025-04-26",
    hebrewDate: "כ\"ח ניסן",
    parasha: "שמיני",
    time: "16:00-17:30",
    shabatEntrance: "19:55",
    serviceLadiesAvailable: true,
    notes: ["בתוך ספירת העומר", "אחרי יום השואה (24.4)"],
    mainTime: "16:00",
    setupTime: "15:00"
  },
  {
    id: "5",
    date: "2025-05-02",
    hebrewDate: "ב' אייר",
    parasha: "תזריע-מצורע",
    time: "16:00-17:30",
    shabatEntrance: "20:01",
    serviceLadiesAvailable: false,
    notes: ["בתוך ספירת העומר", "סמוך ליום העצמאות (1-2.5)"],
    mainTime: "16:00",
    setupTime: "15:00"
  },
  {
    id: "6",
    date: "2025-05-17",
    hebrewDate: "י\"ט אייר",
    parasha: "אמור",
    time: "16:00-17:30",
    shabatEntrance: "20:12",
    serviceLadiesAvailable: true,
    notes: ["בתוך ספירת העומר", "אחרי ל\"ג בעומר (15.5)"],
    mainTime: "16:00",
    setupTime: "15:00"
  },
  {
    id: "7",
    date: "2025-05-23",
    hebrewDate: "כ\"ג אייר",
    parasha: "בהר-בחוקותי",
    time: "16:00-17:30",
    shabatEntrance: "20:18",
    serviceLadiesAvailable: false,
    notes: ["בתוך ספירת העומר"],
    mainTime: "16:00",
    setupTime: "15:00"
  },
  {
    id: "8",
    date: "2025-06-07",
    hebrewDate: "י\"א סיוון",
    parasha: "נשא",
    time: "16:30-18:00",
    shabatEntrance: "20:27",
    serviceLadiesAvailable: true,
    notes: ["אחרי חג השבועות (1-2.6)"],
    mainTime: "16:30",
    setupTime: "15:30"
  },
  {
    id: "9",
    date: "2025-06-20",
    hebrewDate: "כ\"ב סיוון",
    parasha: "שלח",
    time: "16:30-18:00",
    shabatEntrance: "20:33",
    serviceLadiesAvailable: false,
    mainTime: "16:30",
    setupTime: "15:30"
  },
  {
    id: "10",
    date: "2025-06-28",
    hebrewDate: "ב' תמוז",
    parasha: "קרח",
    time: "16:30-18:00",
    shabatEntrance: "20:34",
    serviceLadiesAvailable: true,
    mainTime: "16:30",
    setupTime: "15:30"
  },
  // Adding remaining events
  {
    id: "11",
    date: "2025-07-12",
    hebrewDate: "ט\"ז תמוז",
    parasha: "בלק",
    time: "16:30-18:00",
    shabatEntrance: "20:32",
    serviceLadiesAvailable: true,
    notes: ["ערב צום י\"ז בתמוז (13.7)"],
    mainTime: "16:30",
    setupTime: "15:30"
  },
  {
    id: "12",
    date: "2025-07-18",
    hebrewDate: "כ' תמוז",
    parasha: "פינחס",
    time: "16:30-18:00",
    shabatEntrance: "20:29",
    serviceLadiesAvailable: false,
    notes: ["לפני תשעת הימים"],
    mainTime: "16:30",
    setupTime: "15:30"
  },
  {
    id: "13",
    date: "2025-07-26",
    hebrewDate: "א' אב",
    parasha: "מטות ומסעי",
    time: "16:30-18:00",
    shabatEntrance: "20:24",
    serviceLadiesAvailable: true,
    notes: ["ערב תשעת הימים"],
    mainTime: "16:30",
    setupTime: "15:30"
  },
  {
    id: "14",
    date: "2025-08-15",
    hebrewDate: "י\"ח אב",
    parasha: "עקב",
    time: "16:30-18:00",
    shabatEntrance: "20:04",
    serviceLadiesAvailable: false,
    notes: ["אחרי ט\"ו באב (14.8)"],
    mainTime: "16:30",
    setupTime: "15:30"
  },
  {
    id: "15",
    date: "2025-08-22",
    hebrewDate: "כ\"ה אב",
    parasha: "ראה",
    time: "16:00-17:30",
    shabatEntrance: "19:55",
    serviceLadiesAvailable: false,
    mainTime: "16:00",
    setupTime: "15:00"
  },
  {
    id: "16",
    date: "2025-08-29",
    hebrewDate: "ג' אלול",
    parasha: "שופטים",
    time: "16:00-17:30",
    shabatEntrance: "19:46",
    serviceLadiesAvailable: false,
    mainTime: "16:00",
    setupTime: "15:00"
  },
  {
    id: "17",
    date: "2025-09-05",
    hebrewDate: "י' אלול",
    parasha: "כי תצא",
    time: "15:45-17:15",
    shabatEntrance: "19:37",
    serviceLadiesAvailable: false,
    mainTime: "15:45",
    setupTime: "14:45"
  },
  {
    id: "18",
    date: "2025-09-12",
    hebrewDate: "י\"ז אלול",
    parasha: "כי תבוא",
    time: "15:45-17:15",
    shabatEntrance: "19:27",
    serviceLadiesAvailable: false,
    mainTime: "15:45",
    setupTime: "14:45"
  },
  {
    id: "19",
    date: "2025-09-19",
    hebrewDate: "כ\"ד אלול",
    parasha: "ניצבים",
    time: "15:30-17:00",
    shabatEntrance: "19:17",
    serviceLadiesAvailable: false,
    notes: ["לפני ראש השנה"],
    mainTime: "15:30",
    setupTime: "14:30"
  },
  {
    id: "20",
    date: "2025-10-24",
    hebrewDate: "ג' חשוון",
    parasha: "נח",
    time: "17:00-18:30",
    shabatEntrance: "18:45", // Estimated
    serviceLadiesAvailable: false,
    notes: ["יום חמישי (לא שישי)"],
    mainTime: "17:00",
    setupTime: "16:00"
  }
];

interface ParashaFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEventSelect: (event: PredefinedEvent) => void;
}

export const ParashaField = ({ value, onChange, onEventSelect }: ParashaFieldProps) => {
  const handleEventSelect = (eventId: string) => {
    const selectedEvent = predefinedEvents.find(event => event.id === eventId);
    
    if (selectedEvent) {
      // Create fake event for parasha field
      const parashaEvent = {
        target: {
          name: "parasha",
          value: selectedEvent.parasha
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      // Update parasha field
      onChange(parashaEvent);
      
      // Call the parent handler with the full event data
      onEventSelect(selectedEvent);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="event-select">מועד אירוע</Label>
      <Select onValueChange={handleEventSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="בחר מועד קידושישי מתוכנן" />
        </SelectTrigger>
        <SelectContent>
          {predefinedEvents.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.date.split("-").reverse().join("/")} - {event.hebrewDate} - {event.parasha}
              {event.serviceLadiesAvailable && " 👧"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="mt-4">
        <Label htmlFor="parasha">פרשת השבוע</Label>
        <input
          id="parasha"
          name="parasha"
          value={value}
          onChange={onChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="פרשת השבוע"
        />
      </div>
    </div>
  );
};
