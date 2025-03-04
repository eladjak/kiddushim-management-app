
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";
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

/**
 * Main application component
 * 
 * Sets up routing, authentication context, and global UI elements
 */
function App() {
  // Force RTL direction at the root level
  document.documentElement.dir = "rtl";
  document.body.dir = "rtl";
  
  return (
    <AuthProvider>
      <div dir="rtl" className="rtl-app"> {/* Added rtl-app class for additional CSS targeting */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/events" element={<Events />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
