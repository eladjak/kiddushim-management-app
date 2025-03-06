
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
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ReportDetail } from "./ReportDetail";
import { fetchReports } from "@/lib/reports";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

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
  content: Json;
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
        content: report.content as unknown as ReportContent
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

  // Format report status in Hebrew
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">חדש</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">בטיפול</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">טופל</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">סגור</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format severity in Hebrew
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">נמוכה</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">בינונית</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">גבוהה</Badge>;
      case "critical":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">קריטית</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 bg-white rounded-md shadow animate-pulse">
        <p className="text-lg text-gray-500">טוען דיווחים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-md shadow">
        <p className="text-lg text-red-500">שגיאה בטעינת הדיווחים</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          נסה שוב
        </Button>
      </div>
    );
  }

  if (!filteredReports || filteredReports.length === 0) {
    return (
      <Card className="border border-muted">
        <CardContent className="text-center py-12">
          <p className="text-lg text-muted-foreground">לא נמצאו דיווחים מסוג זה</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-muted overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">סוג דיווח</TableHead>
              <TableHead className="text-right">כותרת</TableHead>
              <TableHead className="text-right">אירוע</TableHead>
              <TableHead className="text-right">מדווח</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              {activeTab === "issues" && (
                <TableHead className="text-right">חומרה</TableHead>
              )}
              <TableHead className="text-right">תאריך</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report: Report) => (
              <TableRow key={report.id}>
                <TableCell>{formatReportType(report.type)}</TableCell>
                <TableCell className="max-w-[200px] truncate">{report.content.title}</TableCell>
                <TableCell>
                  {report.events?.title || "—"}
                </TableCell>
                <TableCell>{report.content.reporter_name}</TableCell>
                <TableCell>{getStatusBadge(report.content.status)}</TableCell>
                {activeTab === "issues" && (
                  <TableCell>{report.content.severity ? getSeverityBadge(report.content.severity) : null}</TableCell>
                )}
                <TableCell>
                  {new Date(report.created_at).toLocaleDateString('he-IL')}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        צפה בפרטים
                      </Button>
                    </DialogTrigger>
                    <ReportDetail report={report} formatReportType={formatReportType} />
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
