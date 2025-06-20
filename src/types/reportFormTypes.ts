
import { z } from "zod";

// Schema for report form validation matching Tzohar requirements
export const reportFormSchema = z.object({
  title: z.string().min(3, "יש להזין כותרת באורך של 3 תווים לפחות"),
  description: z.string().min(10, "יש להזין תיאור באורך של 10 תווים לפחות"),
  event_id: z.string().min(1, "יש לבחור אירוע").optional(),
  reporter_name: z.string().min(2, "יש להזין שם בן 2 תווים לפחות"),
  severity: z.string().min(1, "יש לבחור רמת חומרה").default("medium"),
  
  // Tzohar specific fields
  participants_count: z.number().min(1, "יש להזין מספר משתתפים").max(200, "מקסימום 200 משתתפים"),
  participants_kids: z.number().min(0, "מספר ילדים לא יכול להיות שלילי").max(100),
  participants_adults: z.number().min(0, "מספר מבוגרים לא יכול להיות שלילי").max(100),
  location_other: z.string().optional(),
  
  // New field for what participants learned/gained
  participants_gained: z.string().min(5, "יש לתאר מה המשתתפים למדו/קיבלו"),
  
  // Modified rating fields for Tzohar
  overall_rating: z.number().min(1).max(10).default(5),
  audience_rating: z.number().min(1).max(10).default(5),
  organization_rating: z.number().min(1).max(10).default(5),
  logistics_rating: z.number().min(1).max(10).default(5),
  
  // Standard feedback fields
  what_was_good: z.string().optional(),
  what_to_improve: z.string().optional(),
  additional_feedback: z.string().optional(),
  
  // Tzohar specific - is the reporter from their team
  is_tzohar_representative: z.boolean().default(false),
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;
