import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  FileText, 
  Clock, 
  MapPin, 
  User,
  ChevronRight,
  MessageSquare,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Report } from "./ReportsList";

interface ReportsGridProps {
  reports: Report[];
  activeTab: string;
  formatReportType: (type: string) => string;
  onViewReport: (report: Report) => void;
}

export const ReportsGrid = ({ 
  reports, 
  activeTab, 
  formatReportType,
  onViewReport 
}: ReportsGridProps) => {
  const { profile } = useAuth();
  
  // Get icon based on report type
  const getReportIcon = (type: string) => {
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
  };

  // Get status badge with better mobile styling
  const getStatusBadge = (status: string) => {
    const variants = {
      new: "bg-blue-50 text-blue-700 border-blue-200",
      in_progress: "bg-amber-50 text-amber-700 border-amber-200", 
      resolved: "bg-green-50 text-green-700 border-green-200",
      closed: "bg-gray-50 text-gray-700 border-gray-200"
    };
    
    const labels = {
      new: "חדש",
      in_progress: "בטיפול", 
      resolved: "טופל",
      closed: "סגור"
    };

    return (
      <Badge 
        variant="outline" 
        className={`${variants[status as keyof typeof variants] || variants.new} text-xs px-2 py-1`}
      >
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  // Get severity badge for issues
  const getSeverityBadge = (severity: string) => {
    if (!severity) return null;
    
    const variants = {
      low: "bg-green-50 text-green-700 border-green-200",
      medium: "bg-amber-50 text-amber-700 border-amber-200",
      high: "bg-orange-50 text-orange-700 border-orange-200", 
      critical: "bg-red-50 text-red-700 border-red-200"
    };
    
    const labels = {
      low: "נמוכה",
      medium: "בינונית", 
      high: "גבוהה",
      critical: "קריטית"
    };

    return (
      <Badge 
        variant="outline" 
        className={`${variants[severity as keyof typeof variants]} text-xs px-2 py-1 mr-2`}
      >
        {labels[severity as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((report: Report) => (
        <Card 
          key={report.id} 
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
            {/* Title */}
            <h3 className="font-medium text-sm leading-tight line-clamp-2 text-right">
              {report.content.title}
            </h3>
            
            {/* Event info */}
            {report.events?.title && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className="truncate">{report.events.title}</span>
              </div>
            )}
            
            {/* Reporter */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">{report.content.reporter_name}</span>
            </div>
            
            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{new Date(report.created_at).toLocaleDateString('he-IL')}</span>
            </div>
            
            {/* Status and Severity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusBadge(report.content.status)}
                {activeTab === "issues" && getSeverityBadge(report.content.severity)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};