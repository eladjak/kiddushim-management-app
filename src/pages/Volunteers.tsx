
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Volunteers = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch volunteers data
  const { data: volunteers, isLoading, refetch } = useQuery({
    queryKey: ['volunteers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in('role', ['youth_volunteer', 'service_girl', 'coordinator'])
        .order('name');
        
      if (error) {
        toast({
          variant: "destructive",
          description: `שגיאה בטעינת רשימת המתנדבים: ${error.message}`,
        });
        return [];
      }
      
      return data || [];
    },
  });

  // Filter volunteers based on search term and active tab
  const filteredVolunteers = volunteers?.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (volunteer.email && volunteer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (volunteer.phone && volunteer.phone.includes(searchTerm));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "youth_volunteer") return volunteer.role === "youth_volunteer" && matchesSearch;
    if (activeTab === "service_girl") return volunteer.role === "service_girl" && matchesSearch;
    if (activeTab === "coordinator") return volunteer.role === "coordinator" && matchesSearch;
    
    return matchesSearch;
  });

  // Render role in Hebrew
  const renderRole = (role: string) => {
    switch (role) {
      case "youth_volunteer": return "מתנדב/ת צעיר/ה";
      case "service_girl": return "בת שירות";
      case "coordinator": return "רכז/ת";
      case "admin": return "מנהל/ת";
      case "content_provider": return "ספק/ית תוכן";
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0 text-right">ניהול מתנדבים</h1>
          
          <div className="w-full md:w-1/3">
            <Input
              type="search"
              placeholder="חיפוש לפי שם, אימייל או טלפון..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-end mb-6">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="all">הכל</TabsTrigger>
              <TabsTrigger value="youth_volunteer">מתנדבים צעירים</TabsTrigger>
              <TabsTrigger value="service_girl">בנות שירות</TabsTrigger>
              <TabsTrigger value="coordinator">רכזים</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="text-center py-6">טוען מתנדבים...</div>
            ) : filteredVolunteers && filteredVolunteers.length > 0 ? (
              <div className="bg-white rounded-md shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">שם</TableHead>
                      <TableHead className="text-right">תפקיד</TableHead>
                      <TableHead className="text-right">אימייל</TableHead>
                      <TableHead className="text-right">טלפון</TableHead>
                      <TableHead className="text-right">פעילות אחרונה</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVolunteers.map((volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell className="font-medium">{volunteer.name}</TableCell>
                        <TableCell>{renderRole(volunteer.role)}</TableCell>
                        <TableCell>{volunteer.email}</TableCell>
                        <TableCell dir="ltr" className="text-right">{volunteer.phone || "—"}</TableCell>
                        <TableCell>
                          {volunteer.last_active 
                            ? new Date(volunteer.last_active).toLocaleDateString('he-IL')
                            : "לא פעיל/ה"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  description: "הפעולה עדיין לא מיושמת",
                                });
                              }}
                            >
                              שיבוצים
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  description: "הפעולה עדיין לא מיושמת",
                                });
                              }}
                            >
                              שלח הודעה
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-md shadow">
                <p className="text-lg text-gray-500">לא נמצאו מתנדבים התואמים את החיפוש</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Volunteers;
