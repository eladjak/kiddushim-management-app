
import { useState } from "react";
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

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <Tabs
        defaultValue="overview"
        className="w-full"
        dir="rtl"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow p-1">
            <div className="flex space-x-2 rtl:space-x-reverse">
              <TabsTrigger value="overview" className="px-4 py-2 rounded hover:bg-gray-100">סקירה כללית</TabsTrigger>
              <TabsTrigger value="timeline" className="px-4 py-2 rounded hover:bg-gray-100">לוח זמנים</TabsTrigger>
              <TabsTrigger value="team" className="px-4 py-2 rounded hover:bg-gray-100">מבנה צוות</TabsTrigger>
              <TabsTrigger value="budget" className="px-4 py-2 rounded hover:bg-gray-100">תקציב ולוגיסטיקה</TabsTrigger>
              <TabsTrigger value="processes" className="px-4 py-2 rounded hover:bg-gray-100">תהליכי עבודה</TabsTrigger>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <TabsContent value="overview">
            <ProjectOverview />
          </TabsContent>
          
          <TabsContent value="timeline">
            <Timeline />
          </TabsContent>
          
          <TabsContent value="team">
            <TeamStructure />
          </TabsContent>
          
          <TabsContent value="budget">
            <BudgetAndLogistics />
          </TabsContent>
          
          <TabsContent value="processes">
            <WorkProcesses />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
