
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, User, FileText, Flag, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Report, ReportContent } from "./ReportsList";

interface ReportDetailProps {
  report: Report;
  formatReportType: (type: string) => string;
}

export const ReportDetail = ({ report, formatReportType }: ReportDetailProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const updateReportStatus = async (newStatus: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        description: "נדרש להתחבר כדי לעדכן סטטוס דיווח",
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Update the status in the content JSON object
      const updatedContent = {
        ...report.content,
        status: newStatus
      };
      
      const { error } = await supabase
        .from("reports")
        .update({ 
          content: updatedContent 
        })
        .eq("id", report.id);
        
      if (error) throw error;
      
      toast({
        description: "סטטוס הדיווח עודכן בהצלחה",
      });

      // Refresh reports data
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "אירעה שגיאה בעדכון סטטוס הדיווח",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">{report.content.title}</DialogTitle>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary">
            {formatReportType(report.type)}
          </Badge>
          {getStatusBadge(report.content.status)}
          {report.content.severity && getSeverityBadge(report.content.severity)}
        </div>
      </DialogHeader>
      
      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">דווח ב-{formatDate(report.created_at)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="text-sm">על ידי {report.content.reporter_name}</span>
          </div>
          
          {report.events && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm">אירוע: {report.events.title}</span>
            </div>
          )}
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-2">תיאור הדיווח:</h3>
          <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
            {report.content.description || "אין תיאור לדיווח זה"}
          </div>
        </div>
        
        {user && (
          <>
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">עדכון סטטוס:</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={report.content.status === "new" || isUpdating}
                  onClick={() => updateReportStatus("new")}
                >
                  חדש
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={report.content.status === "in_progress" || isUpdating}
                  onClick={() => updateReportStatus("in_progress")}
                >
                  בטיפול
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={report.content.status === "resolved" || isUpdating}
                  onClick={() => updateReportStatus("resolved")}
                >
                  טופל
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={report.content.status === "closed" || isUpdating}
                  onClick={() => updateReportStatus("closed")}
                >
                  סגור
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </DialogContent>
  );
};
