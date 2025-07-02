import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Camera, 
  FileText, 
  MessageSquare, 
  AlertTriangle,
  Upload,
  Zap,
  Plus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TzoharReportForm } from "./tzohar/TzoharReportForm";
import { ReportFormSimplified } from "./ReportFormSimplified";
import { QuickMediaUpload } from "./QuickMediaUpload";

interface QuickActionsProps {
  onReportSuccess: () => void;
}

export const QuickActions = ({ onReportSuccess }: QuickActionsProps) => {
  const { profile } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [isQuickUploadOpen, setIsQuickUploadOpen] = useState(false);

  const handleAction = (actionType: string) => {
    setSelectedAction(actionType);
    setIsDialogOpen(true);
  };

  const handleQuickUpload = () => {
    setIsQuickUploadOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedAction("");
  };

  const closeQuickUpload = () => {
    setIsQuickUploadOpen(false);
  };

  // Actions based on user role
  const getActionsForRole = () => {
    const baseActions = [
      {
        id: "quick_upload",
        title: "העלאה מהירה",
        subtitle: "תמונות ווידאו מהאירוע",
        icon: <Camera className="h-6 w-6" />,
        color: "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200",
        iconBg: "bg-purple-100",
        action: handleQuickUpload
      },
      {
        id: "feedback",
        title: "משוב מהיר",
        subtitle: "חוויה כללית מהאירוע",
        icon: <MessageSquare className="h-6 w-6" />,
        color: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
        iconBg: "bg-green-100",
        action: () => handleAction("feedback")
      }
    ];

    // Add role-specific actions
    if (profile?.role === 'coordinator' || profile?.role === 'admin') {
      baseActions.unshift({
        id: "event_report",
        title: "דיווח לצהר",
        subtitle: "דיווח רשמי על האירוע",
        icon: <FileText className="h-6 w-6" />,
        color: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
        iconBg: "bg-blue-100",
        action: () => handleAction("event_report")
      });
    }

    if (profile?.role !== 'service_girl') {
      baseActions.push({
        id: "issue",
        title: "דיווח תקלה",
        subtitle: "בעיה טכנית או לוגיסטית",
        icon: <AlertTriangle className="h-6 w-6" />,
        color: "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200",
        iconBg: "bg-orange-100",
        action: () => handleAction("issue")
      });
    }

    return baseActions;
  };

  const actions = getActionsForRole();

  return (
    <>
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {actions.map((action) => (
          <Card 
            key={action.id}
            className={`${action.color} border-2 hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-105`}
            onClick={action.action}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${action.iconBg} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {action.subtitle}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Upload Dialog */}
      <Dialog open={isQuickUploadOpen} onOpenChange={closeQuickUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              העלאה מהירה
            </DialogTitle>
          </DialogHeader>
          <QuickMediaUpload onClose={closeQuickUpload} onSuccess={onReportSuccess} />
        </DialogContent>
      </Dialog>

      {/* Report Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAction === "event_report" && "דיווח אירוע לצהר"}
              {selectedAction === "feedback" && "משוב על אירוע"}
              {selectedAction === "issue" && "דיווח תקלה"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAction && (
            <>
              {selectedAction === "event_report" ? (
                <TzoharReportForm onClose={closeDialog} />
              ) : (
                <ReportFormSimplified
                  reportType={selectedAction}
                  onClose={closeDialog}
                  onSuccess={onReportSuccess}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};