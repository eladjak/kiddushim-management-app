
import { Navigation } from "@/components/Navigation";
import { Calendar, Users, FileText, Bell, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch upcoming events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      console.log("Fetching events...");
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("main_time", new Date().toISOString())
        .order("main_time", { ascending: true })
        .limit(2);

      if (error) {
        console.error("Error fetching events:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת האירועים",
          description: error.message,
        });
        throw error;
      }

      console.log("Events fetched successfully:", data);
      return data;
    },
    enabled: !!user,
  });

  // Fetch event assignments
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments", user?.id],
    queryFn: async () => {
      console.log("Fetching assignments...");
      const { data, error } = await supabase
        .from("event_assignments")
        .select("*")
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error fetching assignments:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת השיבוצים",
          description: error.message,
        });
        throw error;
      }

      console.log("Assignments fetched successfully:", data);
      return data;
    },
    enabled: !!user,
  });

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      console.log("Fetching notifications...");
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .eq("read", false);

      if (error) {
        console.error("Error fetching notifications:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת ההתראות",
          description: error.message,
        });
        throw error;
      }

      console.log("Notifications fetched successfully:", data);
      return data;
    },
    enabled: !!user,
  });

  const isAllDataLoaded = !eventsLoading && !assignmentsLoading && !notificationsLoading;

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {isAllDataLoaded && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 text-right">
            <div className="flex items-center justify-end gap-2">
              <span>כל המערכות פועלות כראוי</span>
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quick Action Cards */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-center space-x-4 justify-end text-right">
              <div>
                <h3 className="text-lg font-semibold mb-1">אירועים קרובים</h3>
                <p className="text-sm text-gray-600">
                  {eventsLoading ? "טוען..." : `${events?.length || 0} אירועים קרובים`}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-center space-x-4 justify-end text-right">
              <div>
                <h3 className="text-lg font-semibold mb-1">השיבוצים שלי</h3>
                <p className="text-sm text-gray-600">
                  {assignmentsLoading ? "טוען..." : `${assignments?.length || 0} שיבוצים`}
                </p>
              </div>
              <div className="bg-accent/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-center space-x-4 justify-end text-right">
              <div>
                <h3 className="text-lg font-semibold mb-1">דיווחים</h3>
                <p className="text-sm text-gray-600">לא נמצאו דיווחים חדשים</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-center space-x-4 justify-end text-right">
              <div>
                <h3 className="text-lg font-semibold mb-1">התראות</h3>
                <p className="text-sm text-gray-600">
                  {notificationsLoading ? "טוען..." : `${notifications?.length || 0} התראות חדשות`}
                </p>
              </div>
              <div className="bg-accent/10 p-3 rounded-full">
                <Bell className="h-6 w-6 text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-right">אירועים קרובים</h2>
          {eventsLoading ? (
            <div className="text-center py-8">טוען אירועים...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events?.map((event) => (
                <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium mb-2">
                      {format(new Date(event.main_time), "EEEE, d בMMMM", { locale: he })}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{event.location_name}</p>
                    <div className="flex justify-end space-x-4">
                      <button className="px-4 py-2 text-sm rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                        פרטים נוספים
                      </button>
                      <button className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary/80 transition-colors">
                        הרשמה לאירוע
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {events?.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  לא נמצאו אירועים קרובים
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
