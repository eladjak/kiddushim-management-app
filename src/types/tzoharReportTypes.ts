
import { z } from "zod";

// Schema specifically for Tzohar reports
export const tzoharReportSchema = z.object({
  title: z.string().min(3, "יש להזין כותרת באורך של 3 תווים לפחות"),
  description: z.string().min(10, "יש להזין תיאור באורך של 10 תווים לפחות"),
  event_id: z.string().optional(),
  reporter_name: z.string().min(2, "יש להזין שם בן 2 תווים לפחות"),
  
  // Tzohar-specific required fields
  participants_count: z.number().min(1, "יש להזין מספר משתתפים גדול מ-0").max(200, "מקסימום 200 משתתפים"),
  participants_kids: z.number().min(0, "מספר ילדים לא יכול להיות שלילי").max(100),
  participants_adults: z.number().min(0, "מספר מבוגרים לא יכול להיות שלילי").max(100),
  
  // What participants learned/gained - required for Tzohar
  participants_gained: z.string().min(5, "יש לתאר מה המשתתפים למדו/קיבלו"),
  
  // Feedback fields
  what_was_good: z.string().optional(),
  what_to_improve: z.string().optional(),
  
  // Tzohar representative flag
  is_tzohar_representative: z.boolean().default(false),
  
  // Optional location info
  location_other: z.string().optional(),
});

export type TzoharReportData = z.infer<typeof tzoharReportSchema>;

// Default values for Tzohar reports
export const tzoharReportDefaults: TzoharReportData = {
  title: "",
  description: "",
  event_id: "",
  reporter_name: "",
  participants_count: 0,
  participants_kids: 0,
  participants_adults: 0,
  participants_gained: "",
  what_was_good: "",
  what_to_improve: "",
  is_tzohar_representative: false,
  location_other: "",
};
