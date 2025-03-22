
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverview } from "@/components/docs/ProjectOverview";
import { ProjectPlan } from "@/components/docs/ProjectPlan";
import { TeamStructure } from "@/components/docs/TeamStructure";
import { Timeline } from "@/components/docs/Timeline";
import { WorkProcesses } from "@/components/docs/WorkProcesses";
import { BudgetAndLogistics } from "@/components/docs/BudgetAndLogistics";
import { SecurityGuidelines } from "@/components/docs/SecurityGuidelines";

const Documentation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Check if there's a section param in the URL
  useEffect(() => {
    const section = searchParams.get("section");
    if (section) {
      setActiveTab(section);
    }
  }, [searchParams]);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ section: value });
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-primary">תיעוד הפרויקט</h1>
      
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full mb-8">
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="plan">תוכנית פרויקט</TabsTrigger>
          <TabsTrigger value="team">מבנה צוות</TabsTrigger>
          <TabsTrigger value="timeline">לוח זמנים</TabsTrigger>
          <TabsTrigger value="processes">תהליכי עבודה</TabsTrigger>
          <TabsTrigger value="budget">תקציב ולוגיסטיקה</TabsTrigger>
          <TabsTrigger value="security">אבטחה</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <ProjectOverview />
        </TabsContent>
        
        <TabsContent value="plan" className="mt-4">
          <ProjectPlan />
        </TabsContent>
        
        <TabsContent value="team" className="mt-4">
          <TeamStructure />
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-4">
          <Timeline />
        </TabsContent>
        
        <TabsContent value="processes" className="mt-4">
          <WorkProcesses />
        </TabsContent>
        
        <TabsContent value="budget" className="mt-4">
          <BudgetAndLogistics />
        </TabsContent>
        
        <TabsContent value="security" className="mt-4">
          <SecurityGuidelines />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
