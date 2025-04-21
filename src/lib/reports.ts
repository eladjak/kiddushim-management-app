
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Encode content for storage in reports table
 */
export function encodeContentForStorage(content: Record<string, any>) {
  // Convert any non-JSON-serializable data to a proper format
  return content;
}

/**
 * Decode content from storage in reports table
 */
export function decodeContentFromStorage(content: any) {
  // If content is already in the right format, return it
  if (typeof content === 'object' && content !== null) {
    return content;
  }
  
  // If it's a JSON string, parse it
  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch (e) {
      return { error: 'Invalid content format' };
    }
  }
  
  return { error: 'Unknown content format' };
}

/**
 * Fetch reports from the database
 */
export const fetchReports = (toast: any) => async () => {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        events(id, title, date)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      logger.error("Error fetching reports", { error });
      throw error;
    }
    
    // Safely process and return the reports data with type assertions
    const safeData = (data || []) as any[];
    
    // Process each report to ensure content is properly formatted
    return safeData.map(report => {
      // Use type assertion for safer access
      const reportData = report as any;
      const processedReport = {
        ...reportData,
        // Ensure events is properly handled
        events: reportData.events ? {
          id: reportData.events.id,
          title: reportData.events.title,
          date: reportData.events.date
        } : null
      };
      
      return processedReport;
    });
  } catch (error: any) {
    logger.error("Failed to fetch reports", { error });
    toast({
      variant: "destructive", 
      description: `שגיאה בטעינת הדיווחים: ${error.message}`
    });
    return [];
  }
};
