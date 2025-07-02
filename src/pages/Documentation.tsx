
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ProjectOverview } from "@/components/docs/ProjectOverview";
import { TeamStructure } from "@/components/docs/TeamStructure";
import { BudgetAndLogistics } from "@/components/docs/BudgetAndLogistics";
import { WorkProcesses } from "@/components/docs/WorkProcesses";
import { Timeline } from "@/components/docs/Timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventTimeline } from "@/components/events/EventTimeline";

const Documentation = () => {
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 py-20 flex-grow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">תיעוד פרויקט קידושישי</h1>
          
          <Tabs defaultValue="timeline" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg shadow p-1">
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <TabsTrigger value="timeline" className="px-4 py-2 rounded hover:bg-gray-100">לוח זמנים</TabsTrigger>
                  <TabsTrigger value="overview" className="px-4 py-2 rounded hover:bg-gray-100">סקירה כללית</TabsTrigger>
                  <TabsTrigger value="team" className="px-4 py-2 rounded hover:bg-gray-100">מבנה צוות</TabsTrigger>
                  <TabsTrigger value="plan" className="px-4 py-2 rounded hover:bg-gray-100">תכנית עבודה</TabsTrigger>
                  <TabsTrigger value="budget" className="px-4 py-2 rounded hover:bg-gray-100">תקציב ולוגיסטיקה</TabsTrigger>
                  <TabsTrigger value="process" className="px-4 py-2 rounded hover:bg-gray-100">תהליכי עבודה</TabsTrigger>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <TabsContent value="timeline">
                <div>
                  <h2 className="text-2xl font-bold mb-4">לוח זמנים שנתי</h2>
                  <div className="text-center p-8 text-gray-500">
                    <p>לוח הזמנים זמינות בקרוב...</p>
                    <p className="text-sm mt-2">הקומפוננט נמצא כעת בפיתוח</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="overview">
                <ProjectOverview />
              </TabsContent>
              
              <TabsContent value="team">
                <TeamStructure />
              </TabsContent>
              
              <TabsContent value="plan">
                <div>
                  <h2 className="text-2xl font-bold mb-4">תכנית עבודה</h2>
                  <div className="text-center p-8 text-gray-500">
                    <p>תכנית העבודה זמינות בקרוב...</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="budget">
                <BudgetAndLogistics />
              </TabsContent>
              
              <TabsContent value="process">
                <WorkProcesses />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Documentation;
