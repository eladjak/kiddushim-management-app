
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ReportDetail } from "./ReportDetail";
import { fetchReports } from "@/lib/reports";
import { ReportsTable } from "./ReportsTable";
import { ReportsEmptyState } from "./ReportsEmptyState";
import { ReportsLoading } from "./ReportsLoading";
import { ReportsError } from "./ReportsError";

// Define Report interface to properly type the content field
export interface ReportContent {
  title: string;
  reporter_name: string;
  status: string;
  severity?: string;
  description?: string;
  [key: string]: any; // For any other fields that might be in the content
}

export interface Report {
  id: string;
  type: string;
  content: ReportContent;
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

interface ReportsListProps {
  activeTab: string;
}

export const ReportsList = ({ activeTab }: ReportsListProps) => {
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
      <ReportsTable 
        reports={filteredReports} 
        activeTab={activeTab}
        formatReportType={formatReportType}
        onViewReport={setSelectedReport}
      />
      
      {selectedReport && (
        <ReportDetail 
          report={selectedReport} 
          formatReportType={formatReportType} 
        />
      )}
    </Dialog>
  );
};
