
import { Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";
import { useAdminCheck } from "./lib/admin-utils";
import { Navigation } from "./components/Navigation";
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

// Layout component with Navigation for authenticated routes
const AuthenticatedLayout = () => {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
};

// Layout without Navigation for public routes
const PublicLayout = () => {
  return <Outlet />;
};

/**
 * Main application component with admin check
 */
function AppWithAdminCheck() {
  // Check if user should have admin permissions
  useAdminCheck();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<Index />} />
        <Route path="/documentation" element={<Documentation />} />
      </Route>
      
      {/* Authenticated routes with Navigation */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/events" element={<Events />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/users" element={<Users />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>
      
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
