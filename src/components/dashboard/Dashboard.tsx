
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/layout/Footer";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { logger } from "@/utils/logger";

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const log = logger.createLogger({ component: 'Dashboard' });
  
  useEffect(() => {
    log.info("Dashboard loaded", { 
      userId: user?.id,
      role: profile?.role 
    });
  }, [user, profile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 md:pt-24 pb-8 flex-grow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            שלום {profile?.name || 'משתמש'}
          </h1>
          
          <StatusBanner />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <UpcomingEvents />
            </div>
            
            <div>
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
