
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverview } from "./ProjectOverview";
import { Timeline } from "./Timeline";
import { TeamStructure } from "./TeamStructure";
import { BudgetAndLogistics } from "./BudgetAndLogistics";
import { WorkProcesses } from "./WorkProcesses";

/**
 * Main project plan component that organizes documentation into tabs
 */
export const ProjectPlan = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Track tab changes for analytics or other purposes
  useEffect(() => {
    console.log("Documentation tab changed:", activeTab);
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <Tabs
        defaultValue="overview"
        className="w-full"
        dir="rtl"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="timeline">לוח זמנים</TabsTrigger>
          <TabsTrigger value="team">מבנה צוות</TabsTrigger>
          <TabsTrigger value="budget">תקציב ולוגיסטיקה</TabsTrigger>
          <TabsTrigger value="processes">תהליכי עבודה</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <ProjectOverview />
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-6">
          <Timeline />
        </TabsContent>
        
        <TabsContent value="team" className="mt-6">
          <TeamStructure />
        </TabsContent>
        
        <TabsContent value="budget" className="mt-6">
          <BudgetAndLogistics />
        </TabsContent>
        
        <TabsContent value="processes" className="mt-6">
          <WorkProcesses />
        </TabsContent>
      </Tabs>
    </div>
  );
};
