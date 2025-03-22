
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
import "./App.css";
import "./styles/rtl.css"; // Import RTL styles

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
      {/* Index route - Navigation will conditionally appear based on auth state */}
      <Route path="/" element={<AuthenticatedLayout><Index /></AuthenticatedLayout>} />
      
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
  // Force RTL direction at the root level
  document.documentElement.dir = "rtl";
  document.body.dir = "rtl";
  
  return (
    <AuthProvider>
      <div dir="rtl" className="rtl-app">
        <AppWithAdminCheck />
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
