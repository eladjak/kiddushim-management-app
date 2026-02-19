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
  new: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  resolved: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  closed: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  new: "חדש",
  in_progress: "בטיפול",
  resolved: "טופל",
  closed: "סגור",
};

const severityVariants: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  high: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

const severityBorderColors: Record<string, string> = {
  low: "border-s-4 border-green-300",
  medium: "border-s-4 border-amber-300",
  high: "border-s-4 border-orange-400",
  critical: "border-s-4 border-red-400",
};

const statusBorderColors: Record<string, string> = {
  new: "border-s-4 border-blue-400",
  in_progress: "border-s-4 border-amber-400",
  resolved: "border-s-4 border-green-400",
  closed: "border-s-4 border-gray-300",
};

const statusDotColors: Record<string, string> = {
  new: "bg-blue-400",
  in_progress: "bg-amber-400",
  resolved: "bg-green-400",
  closed: "bg-gray-400",
};

const severityDotColors: Record<string, string> = {
  low: "bg-green-400",
  medium: "bg-amber-400",
  high: "bg-orange-400",
  critical: "bg-red-400",
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
        return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "feedback":
        return <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "issue":
        return <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  }, []);

  // Memoized helper: get status badge with dot indicator
  const getStatusBadge = useCallback((status: string) => (
    <Badge
      variant="outline"
      className={`${statusVariants[status] || statusVariants.new} text-xs font-medium px-2.5 py-0.5 rounded-full`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full me-1.5 ${statusDotColors[status] ?? "bg-blue-400"}`} aria-hidden="true" />
      {statusLabels[status] || status}
    </Badge>
  ), []);

  // Memoized helper: get severity badge for issues with dot indicator
  const getSeverityBadge = useCallback((severity: string) => {
    if (!severity) return null;
    return (
      <Badge
        variant="outline"
        className={`${severityVariants[severity]} text-xs font-medium px-2.5 py-0.5 rounded-full me-2`}
      >
        <span className={`inline-block h-1.5 w-1.5 rounded-full me-1.5 ${severityDotColors[severity] ?? "bg-gray-400"}`} aria-hidden="true" />
        {severityLabels[severity]}
      </Badge>
    );
  }, []);

  const getItemKey = useCallback((report: Report) => report.id, []);

  /** Resolve which colored start-border to apply: severity (for issues) or status. */
  const getCardBorder = useCallback((report: Report) => {
    if (report.content.severity && severityBorderColors[report.content.severity]) {
      return severityBorderColors[report.content.severity];
    }
    return statusBorderColors[report.content.status] ?? statusBorderColors.new;
  }, []);

  const renderReportCard = useCallback((report: Report) => (
    <Card
      className={`border border-muted hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group ${getCardBorder(report)}`}
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
  ), [activeTab, formatReportType, getReportIcon, getStatusBadge, getSeverityBadge, onViewReport, getCardBorder]);

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