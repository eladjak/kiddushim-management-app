
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { ReportsList } from "./ReportsList";

export const ReportsTabs = () => {
  const [activeTab, setActiveTab] = useState("event_reports");

  return (
    <Tabs defaultValue="event_reports" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex justify-end mb-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="event_reports">דיווחי אירועים</TabsTrigger>
          <TabsTrigger value="feedback">משובים</TabsTrigger>
          <TabsTrigger value="issues">תקלות</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value={activeTab} className="mt-0">
        <ReportsList activeTab={activeTab} />
      </TabsContent>
    </Tabs>
  );
};
