
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
  dayOfWeek?: string;
}

export interface SpecialDate {
  name: string;
  date: string;
  endDate?: string;
}

export interface BreakPeriod {
  name: string;
  startDate: string;
  endDate: string;
}

export interface SpecialDates {
  holidays: SpecialDate[];
  fasts: SpecialDate[];
  breakPeriods: BreakPeriod[];
}
