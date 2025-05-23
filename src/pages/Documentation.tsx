import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ProjectOverview } from "@/components/documentation/ProjectOverview";
import { TeamStructure } from "@/components/documentation/TeamStructure";
import { ProjectPlan } from "@/components/documentation/ProjectPlan";
import { BudgetAndLogistics } from "@/components/documentation/BudgetAndLogistics";
import { WorkProcesses } from "@/components/documentation/WorkProcesses";
import { Tab, Tabs } from "@/components/ui/tabs";
import { EventTimeline } from "@/components/events/EventTimeline";

const Documentation = () => {
  const [activeTab, setActiveTab] = useState("timeline");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 py-20 flex-grow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">תיעוד פרויקט קידושישי</h1>
          
          <Tabs defaultValue="timeline">
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg shadow p-1">
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Tab value="timeline" className="px-4 py-2 rounded hover:bg-gray-100">לוח זמנים</Tab>
                  <Tab value="overview" className="px-4 py-2 rounded hover:bg-gray-100">סקירה כללית</Tab>
                  <Tab value="team" className="px-4 py-2 rounded hover:bg-gray-100">מבנה צוות</Tab>
                  <Tab value="plan" className="px-4 py-2 rounded hover:bg-gray-100">תכנית עבודה</Tab>
                  <Tab value="budget" className="px-4 py-2 rounded hover:bg-gray-100">תקציב ולוגיסטיקה</Tab>
                  <Tab value="process" className="px-4 py-2 rounded hover:bg-gray-100">תהליכי עבודה</Tab>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* New timeline tab */}
              <div data-value="timeline">
                <h2 className="text-2xl font-bold mb-4">לוח זמנים שנתי</h2>
                <EventTimeline />
              </div>
              
              {/* Keep existing tabs */}
              <div data-value="overview">
                <ProjectOverview />
              </div>
              
              <div data-value="team">
                <TeamStructure />
              </div>
              
              <div data-value="plan">
                <ProjectPlan />
              </div>
              
              <div data-value="budget">
                <BudgetAndLogistics />
              </div>
              
              <div data-value="process">
                <WorkProcesses />
              </div>
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Documentation;
