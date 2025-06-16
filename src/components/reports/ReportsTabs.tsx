
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReportsList } from "./ReportsList";
import { ReportFormSimplified } from "./ReportFormSimplified";
import { Plus, FileText, MessageSquare, AlertTriangle } from "lucide-react";

export const ReportsTabs = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>("");

  const handleCreateReport = (reportType: string) => {
    setSelectedReportType(reportType);
    setIsCreateDialogOpen(true);
  };

  const handleReportSuccess = () => {
    // Refresh the reports list or handle success
    console.log("Report created successfully");
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => handleCreateReport("event_report")}
          className="h-20 flex flex-col gap-2"
          variant="outline"
        >
          <FileText className="h-6 w-6" />
          <span>דיווח אירוע לצהר</span>
        </Button>
        
        <Button 
          onClick={() => handleCreateReport("feedback")}
          className="h-20 flex flex-col gap-2"
          variant="outline"
        >
          <MessageSquare className="h-6 w-6" />
          <span>משוב על אירוע</span>
        </Button>
        
        <Button 
          onClick={() => handleCreateReport("issue")}
          className="h-20 flex flex-col gap-2"
          variant="outline"
        >
          <AlertTriangle className="h-6 w-6" />
          <span>דיווח תקלה</span>
        </Button>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">כל הדיווחים</TabsTrigger>
          <TabsTrigger value="my-reports">הדיווחים שלי</TabsTrigger>
          <TabsTrigger value="pending">ממתינים לאישור</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ReportsList filter="all" />
        </TabsContent>
        
        <TabsContent value="my-reports" className="mt-6">
          <ReportsList filter="my-reports" />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <ReportsList filter="pending" />
        </TabsContent>
      </Tabs>

      {/* Create Report Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>יצירת דיווח חדש</DialogTitle>
          </DialogHeader>
          
          {selectedReportType && (
            <ReportFormSimplified
              reportType={selectedReportType}
              onClose={() => setIsCreateDialogOpen(false)}
              onSuccess={handleReportSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
