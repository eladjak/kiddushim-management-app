
import { memo, useCallback } from "react";
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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Report } from "./ReportsList";

interface ReportsTableProps {
  reports: Report[];
  activeTab: string;
  formatReportType: (type: string) => string;
  onViewReport: (report: Report) => void;
}

// Format report status in Hebrew
const getStatusBadge = (status: string) => {
  switch (status) {
    case "new":
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">חדש</Badge>;
    case "in_progress":
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">בטיפול</Badge>;
    case "resolved":
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">טופל</Badge>;
    case "closed":
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">סגור</Badge>;
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

export const ReportsTable = memo(({
  reports,
  activeTab,
  formatReportType,
  onViewReport
}: ReportsTableProps) => {
  const handleViewReport = useCallback((report: Report) => {
    onViewReport(report);
  }, [onViewReport]);

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
            {reports.map((report: Report) => (
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
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleViewReport(report)}
                    >
                      <Eye className="h-4 w-4 ms-1" />
                      צפה בפרטים
                    </Button>
                  </DialogTrigger>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
});

ReportsTable.displayName = "ReportsTable";
