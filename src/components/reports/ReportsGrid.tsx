import { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  User,
  ChevronRight,
  MessageSquare,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { Report } from "./ReportsList";
import { VirtualList } from "@/components/virtual/VirtualList";

interface ReportsGridProps {
  reports: Report[];
  activeTab: string;
  formatReportType: (type: string) => string;
  onViewReport: (report: Report) => void;
}

const statusVariants: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-gray-50 text-gray-700 border-gray-200",
};

const statusLabels: Record<string, string> = {
  new: "חדש",
  in_progress: "בטיפול",
  resolved: "טופל",
  closed: "סגור",
};

const severityVariants: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

const severityLabels: Record<string, string> = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
  critical: "קריטית",
};

export const ReportsGrid = memo(({
  reports,
  activeTab,
  formatReportType,
  onViewReport
}: ReportsGridProps) => {
  // Memoized helper: get icon based on report type
  const getReportIcon = useCallback((type: string) => {
    switch (type) {
      case "event_report":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "feedback":
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case "issue":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  }, []);

  // Memoized helper: get status badge
  const getStatusBadge = useCallback((status: string) => (
    <Badge
      variant="outline"
      className={`${statusVariants[status] || statusVariants.new} text-xs px-2 py-1`}
    >
      {statusLabels[status] || status}
    </Badge>
  ), []);

  // Memoized helper: get severity badge for issues
  const getSeverityBadge = useCallback((severity: string) => {
    if (!severity) return null;
    return (
      <Badge
        variant="outline"
        className={`${severityVariants[severity]} text-xs px-2 py-1 me-2`}
      >
        {severityLabels[severity]}
      </Badge>
    );
  }, []);

  const getItemKey = useCallback((report: Report) => report.id, []);

  const renderReportCard = useCallback((report: Report) => (
    <Card
      className="border border-muted hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onViewReport(report)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getReportIcon(report.type)}
            <CardTitle className="text-sm font-medium truncate">
              {formatReportType(report.type)}
            </CardTitle>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <h3 className="font-medium text-sm leading-tight line-clamp-2 text-right">
          {report.content.title}
        </h3>
        {report.events?.title && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="truncate">{report.events.title}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="truncate">{report.content.reporter_name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{new Date(report.created_at).toLocaleDateString('he-IL')}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusBadge(report.content.status)}
            {activeTab === "issues" && getSeverityBadge(report.content.severity)}
          </div>
        </div>
      </CardContent>
    </Card>
  ), [activeTab, formatReportType, getReportIcon, getStatusBadge, getSeverityBadge, onViewReport]);

  return (
    <VirtualList
      items={reports}
      estimateSize={260}
      threshold={15}
      maxHeight={700}
      overscan={5}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      getItemKey={getItemKey}
      renderItem={renderReportCard}
    />
  );
});

ReportsGrid.displayName = "ReportsGrid";