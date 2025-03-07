import { supabase } from "@/integrations/supabase/client";
import { safeDecodeHebrew } from "@/integrations/supabase/setupStorage";
import { Json } from "@/integrations/supabase/types";

export const fetchReports = (toast: any) => async () => {
  try {
    // First, fetch the reports with events relation
    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .select(`
        *,
        events:event_id (
          id,
          title,
          date
        )
      `)
      .order('created_at', { ascending: false });

    if (reportsError) {
      throw reportsError;
    }

    // Process any encoded content
    const processedReports = reportsData?.map(report => {
      if (report.content && typeof report.content === 'object') {
        // Decode any encoded strings in the content
        const decodedContent: Record<string, any> = { ...report.content as Record<string, any> };
        
        // Type-safe way to access content properties
        if (decodedContent.title) {
          decodedContent.title = safeDecodeHebrew(String(decodedContent.title));
        }
        
        if (decodedContent.description) {
          decodedContent.description = safeDecodeHebrew(String(decodedContent.description));
        }
        
        if (decodedContent.reporter_name) {
          decodedContent.reporter_name = safeDecodeHebrew(String(decodedContent.reporter_name));
        }
        
        if (decodedContent.feedback && typeof decodedContent.feedback === 'object') {
          const feedback = decodedContent.feedback as Record<string, any>;
          if (feedback.positive) {
            feedback.positive = safeDecodeHebrew(String(feedback.positive));
          }
          if (feedback.improvement) {
            feedback.improvement = safeDecodeHebrew(String(feedback.improvement));
          }
        }
        
        return { ...report, content: decodedContent };
      }
      
      return report;
    });

    // Return the combined data
    return processedReports || [];
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    toast({
      variant: "destructive",
      description: `שגיאה בטעינת הדיווחים: ${error.message}`,
    });
    return [];
  }
};

export const getReportStatusText = (status: string) => {
  switch (status) {
    case "new": return "חדש";
    case "in_progress": return "בטיפול";
    case "resolved": return "טופל";
    case "closed": return "סגור";
    default: return status;
  }
};

export const getReportTypeText = (type: string) => {
  switch (type) {
    case "event_report": return "דיווח אירוע";
    case "feedback": return "משוב";
    case "issue": return "תקלה";
    default: return type;
  }
};

export const getReportSeverityText = (severity: string) => {
  switch (severity) {
    case "low": return "נמוכה";
    case "medium": return "בינונית";
    case "high": return "גבוהה";
    case "critical": return "קריטית";
    default: return severity;
  }
};

// Helper function to safely encode Hebrew for storage
export const encodeContentForStorage = (content: string): string => {
  if (!content) return '';
  return encodeURIComponent(content);
};
