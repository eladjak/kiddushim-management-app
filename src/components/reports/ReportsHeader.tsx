
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { CreateReportForm } from "./CreateReportForm";

export const ReportsHeader = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reportType, setReportType] = useState("event_report");
  
  const handleOpenDialog = (type: string) => {
    setReportType(type);
    setIsDialogOpen(true);
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 className="text-3xl font-bold mb-4 md:mb-0 text-right">דיווחים</h1>
      
      <div className="flex gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>יצירת דיווח חדש</DialogTitle>
              <DialogDescription>
                מלא את הפרטים ליצירת דיווח אירוע לצהר
              </DialogDescription>
            </DialogHeader>
            <CreateReportForm 
              onClose={() => setIsDialogOpen(false)}
              eventId="no-events"
              reportType={reportType}
            />
          </DialogContent>
          
          <div className="relative">
            <Button
              onClick={() => handleOpenDialog("event_report")}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4 ml-1" />
              דיווח חדש
            </Button>
          </div>
        </Dialog>
      </div>
    </div>
  );
};
