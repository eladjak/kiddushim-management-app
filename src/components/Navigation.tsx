
import { Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-primary">
              קידושישי
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/">דף הבית</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/events">אירועים</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/volunteers">מתנדבים</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/reports">דיווחים</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  התנתק
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                asChild
              >
                <Link to="/auth">התחבר</Link>
              </Button>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-secondary transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/">דף הבית</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/events">אירועים</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/volunteers">מתנדבים</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/reports">דיווחים</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors flex items-center justify-end gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  התנתק
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                asChild
              >
                <Link to="/auth">התחבר</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
