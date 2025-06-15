
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ReportsList } from "./ReportsList";
import { CreateReportFormImproved } from "./CreateReportFormImproved";

export const ReportsTabs = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("event_report");
  
  const handleCreateReport = (reportType: string) => {
    setSelectedReportType(reportType);
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleSuccess = () => {
    // רענון הרשימה יקרה אוטומטית דרך React Query
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">דיווחים</h2>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCreateReport("event_report")}>
                <Plus className="h-4 w-4 ml-2" />
                דיווח אירוע לצהר
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>יצירת דיווח חדש</DialogTitle>
              </DialogHeader>
              <CreateReportFormImproved
                reportType={selectedReportType}
                onClose={handleCloseDialog}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={() => handleCreateReport("feedback")}>
            משוב
          </Button>
          
          <Button variant="outline" onClick={() => handleCreateReport("issue")}>
            דיווח תקלה
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">כל הדיווחים</TabsTrigger>
          <TabsTrigger value="event_reports">דיווחי אירועים</TabsTrigger>
          <TabsTrigger value="feedback">משובים</TabsTrigger>
          <TabsTrigger value="issues">תקלות</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ReportsList activeTab="all" />
        </TabsContent>
        
        <TabsContent value="event_reports">
          <ReportsList activeTab="event_reports" />
        </TabsContent>
        
        <TabsContent value="feedback">
          <ReportsList activeTab="feedback" />
        </TabsContent>
        
        <TabsContent value="issues">
          <ReportsList activeTab="issues" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
