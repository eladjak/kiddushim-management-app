
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, FileText, Shield, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface QuickActionsProps {
  eventsCount?: number;
  assignmentsCount?: number;
  notificationsCount?: number;
  isLoading?: {
    events: boolean;
    assignments: boolean;
    notifications: boolean;
  };
}

export const QuickActions = ({
  eventsCount = 0,
  assignmentsCount = 0,
  notificationsCount = 0,
  isLoading = { events: false, assignments: false, notifications: false }
}: QuickActionsProps) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator" || isAdmin;

  const LoadingBadge = () => <Skeleton className="h-4 w-4 rounded-full" />;

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
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 relative">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">אירועים</span>
              {isLoading.events ? (
                <LoadingBadge />
              ) : eventsCount > 0 ? (
                <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  {eventsCount}
                </Badge>
              ) : null}
            </Button>
          </Link>
          
          <Link to="/reports">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 relative">
              <FileText className="h-5 w-5" />
              <span className="text-xs">דיווחים</span>
              {isLoading.assignments ? (
                <LoadingBadge />
              ) : assignmentsCount > 0 ? (
                <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  {assignmentsCount}
                </Badge>
              ) : null}
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
          
          <div className="relative">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
              <Bell className="h-5 w-5" />
              <span className="text-xs">התראות</span>
              {isLoading.notifications ? (
                <LoadingBadge />
              ) : notificationsCount > 0 ? (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  {notificationsCount}
                </Badge>
              ) : null}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
