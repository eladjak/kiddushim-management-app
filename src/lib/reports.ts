
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Encode content for storage in reports table
 */
export function encodeContentForStorage(content: Record<string, unknown>) {
  try {
    // עיבוד כל מחרוזת בתוכן להבטחת תאימות עם API
    const processedContent: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(content)) {
      // אם הערך הוא מחרוזת, נטפל בו בצורה בטוחה
      if (typeof value === 'string') {
        processedContent[key] = value;
      } else if (value === null || value === undefined) {
        // נשאיר null ו-undefined כפי שהם
        processedContent[key] = value;
      } else if (typeof value === 'object') {
        // אם זה אובייקט, נעבד אותו רקורסיבית
        processedContent[key] = encodeContentForStorage(value);
      } else {
        // מספרים, בוליאנים וכו' נשאיר כפי שהם
        processedContent[key] = value;
      }
    }
    
    return processedContent;
  } catch (error) {
    logger.error("Error encoding content for storage", { error, content });
    // במקרה של שגיאה, נחזיר את התוכן המקורי
    return content;
  }
}

/**
 * Decode content from storage in reports table
 */
export function decodeContentFromStorage(content: unknown): Record<string, unknown> | string {
  // If content is already in the right format, return it
  if (typeof content === 'object' && content !== null) {
    // עיבוד כל שדה בנפרד
    const processedContent: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(content)) {
      // אם הערך הוא מחרוזת, ננסה לפענח אותו במידת הצורך
      if (typeof value === 'string') {
        try {
          // בדיקה אם המחרוזת היא JSON מקודד
          if (value.startsWith('%') || value.startsWith('{') || value.startsWith('[')) {
            try {
              // ניסיון לפענח אם זה JSON
              if (value.startsWith('{') || value.startsWith('[')) {
                processedContent[key] = JSON.parse(value);
              }
              // ניסיון לפענח אם זה מקודד URL
              else if (value.startsWith('%')) {
                processedContent[key] = decodeURIComponent(value);
              } else {
                processedContent[key] = value;
              }
            } catch {
              // אם הפענוח נכשל, נשאיר את הערך המקורי
              processedContent[key] = value;
            }
          } else {
            // מחרוזת רגילה
            processedContent[key] = value;
          }
        } catch {
          // במקרה של שגיאה, נשאיר את הערך המקורי
          processedContent[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        // אם זה אובייקט, נעבד אותו רקורסיבית
        processedContent[key] = decodeContentFromStorage(value);
      } else {
        // מספרים, בוליאנים, null וכו' נשאיר כפי שהם
        processedContent[key] = value;
      }
    }
    
    return processedContent;
  }
  
  // If it's a JSON string, parse it
  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch (e) {
      // אם זה לא JSON תקף, ננסה לבדוק אם זה מקודד URL
      try {
        if (content.startsWith('%')) {
          return decodeURIComponent(content);
        }
      } catch {
        // אם גם זה נכשל, נחזיר את המחרוזת המקורית
        return content;
      }
      
      return { error: 'Invalid content format', content };
    }
  }
  
  return content || { error: 'Empty content' };
}

/**
 * Fetch reports from the database
 */
interface ToastFn {
  (props: { variant?: "destructive"; description: string }): void;
}

export const fetchReports = (toast: ToastFn) => async () => {
  const log = logger.createLogger({ component: 'fetchReports' });
  
  try {
    log.info("Fetching reports");
    
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        events(id, title, date)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      log.error("Error fetching reports", { error });
      throw error;
    }
    
    log.info(`Fetched ${data?.length || 0} reports`);
    
    // Safely process and return the reports data with type assertions
    const safeData = data || [];

    // Process each report to ensure content is properly formatted
    return safeData.map(report => {
      try {
        const reportData = report;
        
        // עיבוד תוכן הדיווח
        let processedContent = reportData.content;
        if (reportData.content) {
          processedContent = decodeContentFromStorage(reportData.content);
        }
        
        const processedReport = {
          ...reportData,
          content: processedContent,
          // Ensure events is properly handled
          events: reportData.events ? {
            id: reportData.events.id,
            title: reportData.events.title,
            date: reportData.events.date
          } : null
        };
        
        return processedReport;
      } catch (parseError) {
        log.error("Error processing report", { parseError, report });
        // אם יש שגיאה בעיבוד דיווח מסוים, נחזיר אותו כפי שהוא
        return report;
      }
    });
  } catch (error) {
    log.error("Failed to fetch reports", { error });
    const message = error instanceof Error ? error.message : "שגיאה לא ידועה";
    toast({
      variant: "destructive",
      description: `שגיאה בטעינת הדיווחים: ${message}`
    });
    return [];
  }
};
