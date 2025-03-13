
import { Calendar, Users, FileText, Bell } from "lucide-react";
import { QuickActionCard } from "./QuickActionCard";
import { Link } from "react-router-dom";

interface QuickActionsProps {
  eventsCount: number | null;
  assignmentsCount: number | null;
  notificationsCount: number | null;
  isLoading: {
    events: boolean;
    assignments: boolean;
    notifications: boolean;
  };
}

export const QuickActions = ({
  eventsCount,
  assignmentsCount,
  notificationsCount,
  isLoading,
}: QuickActionsProps) => {
  return (
    <div className="space-y-4 lg:space-y-0 bg-gradient-to-br from-secondary/5 to-primary/5 p-6 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        <Link to="/events" className="block">
          <QuickActionCard
            title="אירועים קרובים"
            subtitle={isLoading.events ? "טוען..." : `${eventsCount || 0} אירועים קרובים`}
            icon={Calendar}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
        </Link>
        
        <Link to="/events" className="block">
          <QuickActionCard
            title="השיבוצים שלי"
            subtitle={isLoading.assignments ? "טוען..." : `${assignmentsCount || 0} שיבוצים`}
            icon={Users}
            iconColor="text-accent"
            iconBgColor="bg-accent/10"
          />
        </Link>
        
        <Link to="/reports" className="block">
          <QuickActionCard
            title="דיווחים"
            subtitle="לא נמצאו דיווחים חדשים"
            icon={FileText}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
        </Link>
        
        <Link to="/profile" className="block">
          <QuickActionCard
            title="התראות"
            subtitle={isLoading.notifications ? "טוען..." : `${notificationsCount || 0} התראות חדשות`}
            icon={Bell}
            iconColor="text-accent"
            iconBgColor="bg-accent/10"
          />
        </Link>
      </div>
    </div>
  );
};
