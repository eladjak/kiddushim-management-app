
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Reports = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("event_reports");
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Fetch reports data
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      try {
        // First, fetch the basic reports data
        const { data: reportsData, error: reportsError } = await supabase
          .from("reports")
          .select(`
            *,
            events (
              title,
              main_time
            )
          `)
          .order('created_at', { ascending: false });
          
        if (reportsError) {
          toast({
            variant: "destructive",
            description: `שגיאה בטעינת הדיווחים: ${reportsError.message}`,
          });
          return [];
        }
        
        // For each report, fetch the profile info separately
        const reportsWithProfiles = await Promise.all(
          reportsData.map(async (report) => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", report.reporter_id)
              .single();
              
            return {
              ...report,
              reporter_name: profileData?.name || "לא ידוע"
            };
          })
        );
        
        return reportsWithProfiles || [];
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast({
          variant: "destructive",
          description: "שגיאה בטעינת הדיווחים",
        });
        return [];
      }
    },
    enabled: !!user,
  });

  // Filter reports based on active tab
  const filteredReports = reports?.filter(report => {
    if (activeTab === "event_reports") return report.type === "event_report";
    if (activeTab === "feedback") return report.type === "feedback";
    if (activeTab === "issues") return report.type === "issue";
    return true;
  });

  // Format report type in Hebrew
  const formatReportType = (type: string) => {
    switch (type) {
      case "event_report": return "דיווח אירוע";
      case "feedback": return "משוב";
      case "issue": return "תקלה";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0 text-right">דיווחים</h1>
          
          <Button
            onClick={() => {
              toast({
                description: "פונקציונליות הוספת דיווח עדיין לא מיושמת",
              });
            }}
          >
            דיווח חדש
          </Button>
        </div>

        <Tabs defaultValue="event_reports" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-end mb-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="event_reports">דיווחי אירועים</TabsTrigger>
              <TabsTrigger value="feedback">משובים</TabsTrigger>
              <TabsTrigger value="issues">תקלות</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="text-center py-6">טוען דיווחים...</div>
            ) : filteredReports && filteredReports.length > 0 ? (
              <div className="bg-white rounded-md shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">סוג דיווח</TableHead>
                      <TableHead className="text-right">אירוע</TableHead>
                      <TableHead className="text-right">מדווח</TableHead>
                      <TableHead className="text-right">תאריך</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{formatReportType(report.type)}</TableCell>
                        <TableCell>
                          {report.events?.title || "—"}
                        </TableCell>
                        <TableCell>{report.reporter_name}</TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleDateString('he-IL')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedReport(report)}
                                >
                                  צפה בפרטים
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>{formatReportType(report.type)}</DialogTitle>
                                  <DialogDescription>
                                    {report.events?.title ? (
                                      <span>אירוע: {report.events.title}</span>
                                    ) : null}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 text-right">
                                  <div className="mb-4">
                                    <strong>מדווח על ידי:</strong> {report.reporter_name}
                                  </div>
                                  <div className="mb-4">
                                    <strong>תאריך:</strong> {new Date(report.created_at).toLocaleDateString('he-IL')}
                                  </div>
                                  <div className="mb-4">
                                    <strong>תוכן:</strong>
                                    <div className="mt-2 p-3 bg-muted rounded-md">
                                      {JSON.stringify(report.content, null, 2)}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-md shadow">
                <p className="text-lg text-gray-500">לא נמצאו דיווחים מסוג זה</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Reports;
