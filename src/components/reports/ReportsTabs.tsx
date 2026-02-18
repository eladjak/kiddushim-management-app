
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ReportsView } from "./ReportsView";
import { QuickActions } from "./QuickActions";
import { Grid, List, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { RTLFlex } from "@/components/ui/rtl-layout";

export const ReportsTabs = () => {
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleReportSuccess = () => {
    // Force refresh of reports list
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <QuickActions onReportSuccess={handleReportSuccess} />

      {/* View Controls */}
      <RTLFlex className="items-center justify-between">
        <h2 className="text-xl font-semibold">הדיווחים שלי</h2>
        <RTLFlex className="items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 ms-1" />
            רענן
          </Button>
          
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && setViewMode(value as "grid" | "list")}
            className="border rounded-md"
          >
            <ToggleGroupItem 
              value="grid" 
              aria-label="תצוגת רשת"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="list" 
              aria-label="תצוגת רשימה"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </RTLFlex>
      </RTLFlex>

      {/* Reports Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">כל הדיווחים</TabsTrigger>
          <TabsTrigger value="event_reports">דיווחי אירועים</TabsTrigger>
          <TabsTrigger value="feedback">משובים</TabsTrigger>
          <TabsTrigger value="issues">תקלות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ReportsView activeTab="all" viewMode={viewMode} />
        </TabsContent>
        
        <TabsContent value="event_reports" className="mt-6">
          <ReportsView activeTab="event_reports" viewMode={viewMode} />
        </TabsContent>
        
        <TabsContent value="feedback" className="mt-6">
          <ReportsView activeTab="feedback" viewMode={viewMode} />
        </TabsContent>
        
        <TabsContent value="issues" className="mt-6">
          <ReportsView activeTab="issues" viewMode={viewMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
