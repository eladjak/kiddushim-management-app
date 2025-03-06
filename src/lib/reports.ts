
import { supabase } from "@/integrations/supabase/client";

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

    // Return the combined data
    return reportsData || [];
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
