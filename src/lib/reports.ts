
import { supabase } from "@/integrations/supabase/client";

export const fetchReports = (toast: any) => async () => {
  try {
    // First, fetch the basic reports data
    const { data: reportsData, error: reportsError } = await supabase
      .from("reports")
      .select(`
        *,
        events (
          title,
          main_time
        )
      `)
      .order('created_at', { ascending: false });
      
    if (reportsError) {
      toast({
        variant: "destructive",
        description: `שגיאה בטעינת הדיווחים: ${reportsError.message}`,
      });
      return [];
    }
    
    // For each report, fetch the profile info separately
    const reportsWithProfiles = await Promise.all(
      reportsData.map(async (report) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", report.reporter_id)
          .single();
          
        return {
          ...report,
          reporter_name: profileData?.name || "לא ידוע"
        };
      })
    );
    
    return reportsWithProfiles || [];
  } catch (error) {
    console.error("Error fetching reports:", error);
    toast({
      variant: "destructive",
      description: "שגיאה בטעינת הדיווחים",
    });
    return [];
  }
};
