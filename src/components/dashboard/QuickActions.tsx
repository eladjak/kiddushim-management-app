
import { Calendar, Users, FileText, Bell } from "lucide-react";
import { QuickActionCard } from "./QuickActionCard";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <QuickActionCard
        title="אירועים קרובים"
        subtitle={isLoading.events ? "טוען..." : `${eventsCount || 0} אירועים קרובים`}
        icon={Calendar}
        iconColor="text-primary"
        iconBgColor="bg-primary/10"
      />
      <QuickActionCard
        title="השיבוצים שלי"
        subtitle={isLoading.assignments ? "טוען..." : `${assignmentsCount || 0} שיבוצים`}
        icon={Users}
        iconColor="text-accent"
        iconBgColor="bg-accent/10"
      />
      <QuickActionCard
        title="דיווחים"
        subtitle="לא נמצאו דיווחים חדשים"
        icon={FileText}
        iconColor="text-primary"
        iconBgColor="bg-primary/10"
      />
      <QuickActionCard
        title="התראות"
        subtitle={isLoading.notifications ? "טוען..." : `${notificationsCount || 0} התראות חדשות`}
        icon={Bell}
        iconColor="text-accent"
        iconBgColor="bg-accent/10"
      />
    </div>
  );
};
