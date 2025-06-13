
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, FileText, Shield, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const QuickActions = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator" || isAdmin;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          פעולות מהירות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/events">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">אירועים</span>
            </Button>
          </Link>
          
          <Link to="/reports">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
              <FileText className="h-5 w-5" />
              <span className="text-xs">דיווחים</span>
            </Button>
          </Link>
          
          {isCoordinator && (
            <Link to="/volunteers">
              <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                <Users className="h-5 w-5" />
                <span className="text-xs">מתנדבים</span>
              </Button>
            </Link>
          )}
          
          {isAdmin && (
            <Link to="/users">
              <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                <Shield className="h-5 w-5" />
                <span className="text-xs">ניהול משתמשים</span>
              </Button>
            </Link>
          )}
        </div>
        
        {isAdmin && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">פעולות מנהל</h4>
            <div className="flex gap-2">
              <Link to="/users">
                <Button size="sm" className="flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  הוספת משתמש
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
