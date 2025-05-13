
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/react-query";
import { Toaster } from "./components/ui/toaster";
import { useAdminCheck } from "./lib/admin-utils";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/layout/Footer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Events from "./pages/Events";
import Volunteers from "./pages/Volunteers";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Equipment from "./pages/Equipment";
import Documentation from "./pages/Documentation";
import UserProfile from "./pages/UserProfile";
import TimelinePDF from "./pages/TimelinePDF";
import "./App.css";
import "./styles/rtl.css"; // Import RTL styles
import { useEffect } from "react";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";

// Layout component with Navigation and Footer for authenticated routes
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Layout for the Index page - Navigation will appear conditionally based on auth state
const IndexLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Layout without Navigation for public routes
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
};

/**
 * Main application component with admin check
 */
function AppWithAdminCheck() {
  // Check if user should have admin permissions
  useAdminCheck();
  
  return (
    <Routes>
      {/* Index route with its own layout (navigation will show only for authenticated users) */}
      <Route path="/" element={<IndexLayout><Index /></IndexLayout>} />
      
      {/* Public routes */}
      <Route path="/auth" element={<PublicLayout><Auth /></PublicLayout>} />
      <Route path="/auth/callback" element={<PublicLayout><AuthCallback /></PublicLayout>} />
      
      {/* Authenticated routes with Navigation */}
      <Route path="/documentation" element={<AuthenticatedLayout><Documentation /></AuthenticatedLayout>} />
      <Route path="/events" element={<AuthenticatedLayout><Events /></AuthenticatedLayout>} />
      <Route path="/volunteers" element={<AuthenticatedLayout><Volunteers /></AuthenticatedLayout>} />
      <Route path="/users" element={<AuthenticatedLayout><Users /></AuthenticatedLayout>} />
      <Route path="/reports" element={<AuthenticatedLayout><Reports /></AuthenticatedLayout>} />
      <Route path="/equipment" element={<AuthenticatedLayout><Equipment /></AuthenticatedLayout>} />
      <Route path="/profile" element={<AuthenticatedLayout><UserProfile /></AuthenticatedLayout>} />
      
      {/* נוסיף את TimelinePDF כקומפוננט עצמאי (לא בתוך AuthenticatedLayout) */}
      <Route path="/timeline-pdf" element={<TimelinePDF />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/**
 * Main application component
 * 
 * Sets up routing, authentication context, admin check, and global UI elements
 */
function App() {
  const log = logger.createLogger({ component: 'App' });
  
  // לוג מצב אימות מיד בטעינת האפליקציה
  useEffect(() => {
    async function checkInitialAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          log.error("Error checking initial session in App:", error);
        } else {
          log.info("Initial App session check:", { 
            hasSession: !!data.session, 
            userId: data.session?.user?.id 
          });
        }
      } catch (err) {
        log.error("Unexpected error in initial App session check:", err);
      }
    }
    
    checkInitialAuth();
    
    // הגדרת מאזין לשינויי אימות גם ברמת האפליקציה
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      log.info("Auth state changed: INITIAL_SESSION", { 
        _type: typeof event, 
        value: event 
      });
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Force RTL direction at the root level
  document.documentElement.dir = "rtl";
  document.body.dir = "rtl";
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div dir="rtl" className="rtl-app">
          <AppWithAdminCheck />
          <Toaster />
        </div>
      </AuthProvider>
      {/* React Query Devtools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
