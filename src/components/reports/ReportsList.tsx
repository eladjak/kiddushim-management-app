
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ReportDetail } from "./ReportDetail";
import { fetchReports } from "@/lib/reports";

interface ReportsListProps {
  activeTab: string;
}

export const ReportsList = ({ activeTab }: ReportsListProps) => {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Fetch reports data
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports(toast),
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
    return <div className="text-center py-6">טוען דיווחים...</div>;
  }

  if (!filteredReports || filteredReports.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-md shadow">
        <p className="text-lg text-gray-500">לא נמצאו דיווחים מסוג זה</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">סוג דיווח</TableHead>
            <TableHead className="text-right">אירוע</TableHead>
            <TableHead className="text-right">מדווח</TableHead>
            <TableHead className="text-right">תאריך</TableHead>
            <TableHead className="text-right">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{formatReportType(report.type)}</TableCell>
              <TableCell>
                {report.events?.title || "—"}
              </TableCell>
              <TableCell>{report.reporter_name}</TableCell>
              <TableCell>
                {new Date(report.created_at).toLocaleDateString('he-IL')}
              </TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        צפה בפרטים
                      </Button>
                    </DialogTrigger>
                    <ReportDetail report={report} formatReportType={formatReportType} />
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
