
import { Calendar, Users, FileText, Wrench, BookOpen, Clock, UserCheck, Home } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  {
    label: "דף קידושישי",
    path: "/landing",
    icon: Home,
  },
  {
    label: "אירועים",
    path: "/events",
    icon: Calendar,
  },
  {
    label: "לוח זמנים",
    path: "/timeline",
    icon: Clock,
  },
  {
    label: "דיווחים",
    path: "/reports",
    icon: FileText,
  },
  {
    label: "משתמשים",
    path: "/users",
    icon: Users,
    adminOnly: true,
  },
  {
    label: "מתנדבים",
    path: "/volunteers",
    icon: UserCheck,
  },
  {
    label: "ציוד",
    path: "/equipment",
    icon: Wrench,
  },
  {
    label: "תיעוד",
    path: "/documentation",
    icon: BookOpen,
  },
];

export const getNavItems = (isAdmin: boolean = false): NavItem[] => {
  return navItems.filter(item => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });
};
