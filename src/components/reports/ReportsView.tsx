import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ReportDetail } from "./ReportDetail";
import { fetchReports } from "@/lib/reports";
import { ReportsTable } from "./ReportsTable";
import { ReportsGrid } from "./ReportsGrid";
import { ReportsEmptyState } from "./ReportsEmptyState";
import { ReportsLoading } from "./ReportsLoading";
import { ReportsError } from "./ReportsError";
import { Report, ReportContent } from "./ReportsList";

// Define a type for reports coming from Supabase
interface SupabaseReport {
  id: string;
  type: string;
  content: any;
  event_id: string;
  reporter_id: string;
  created_at: string;
  updated_at: string;
  events?: {
    id: string;
    title: string;
    date: string;
  };
}

interface ReportsViewProps {
  activeTab: string;
  viewMode: "grid" | "list";
}

export const ReportsView = ({ activeTab, viewMode }: ReportsViewProps) => {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Fetch reports data and convert to our Report type
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports(toast),
    select: (data: SupabaseReport[]) => {
      return data.map((report): Report => ({
        ...report,
        content: report.content as ReportContent
      }));
    }
  });

  // Filter reports based on active tab
  const filteredReports = reports?.filter(report => {
    if (activeTab === "event_reports") return report.type === "event_report";
    if (activeTab === "feedback") return report.type === "feedback";
    if (activeTab === "issues") return report.type === "issue";
    return true;
  });

  // Format report type in Hebrew
  const formatReportType = (type: string) => {
    switch (type) {
      case "event_report": return "דיווח אירוע";
      case "feedback": return "משוב";
      case "issue": return "תקלה";
      default: return type;
    }
  };

  if (isLoading) {
    return <ReportsLoading />;
  }

  if (error) {
    return <ReportsError onRetry={() => window.location.reload()} />;
  }

  if (!filteredReports || filteredReports.length === 0) {
    return <ReportsEmptyState />;
  }

  return (
    <Dialog>
      {viewMode === "grid" ? (
        <ReportsGrid 
          reports={filteredReports} 
          activeTab={activeTab}
          formatReportType={formatReportType}
          onViewReport={setSelectedReport}
        />
      ) : (
        <ReportsTable 
          reports={filteredReports} 
          activeTab={activeTab}
          formatReportType={formatReportType}
          onViewReport={setSelectedReport}
        />
      )}
      
      {selectedReport && (
        <ReportDetail 
          report={selectedReport} 
          formatReportType={formatReportType} 
        />
      )}
    </Dialog>
  );
};