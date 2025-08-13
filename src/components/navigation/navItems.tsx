
import { Calendar, Users, FileText, Settings, Wrench, BookOpen, Clock, UserCheck, Home } from "lucide-react";

export const navItems = [
  {
    title: "דף קידושישי",
    href: "/landing",
    icon: Home,
    path: "/landing",
    label: "דף קידושישי",
    public: true
  },
  {
    title: "אירועים",
    href: "/events",
    icon: Calendar,
    path: "/events",
    label: "אירועים",
  },
  {
    title: "לוח זמנים",
    href: "/timeline", 
    icon: Clock,
    path: "/timeline",
    label: "לוח זמנים",
  },
  {
    title: "דיווחים",
    href: "/reports",
    icon: FileText,
    path: "/reports",
    label: "דיווחים",
  },
  {
    title: "משתמשים",
    href: "/users",
    icon: Users,
    adminOnly: true,
    path: "/users",
    label: "משתמשים",
  },
  {
    title: "מתנדבים",
    href: "/volunteers",
    icon: UserCheck,
    path: "/volunteers",
    label: "מתנדבים",
  },
  {
    title: "ציוד",
    href: "/equipment",
    icon: Wrench,
    path: "/equipment",
    label: "ציוד",
  },
  {
    title: "תיעוד",
    href: "/documentation",
    icon: BookOpen,
    path: "/documentation",
    label: "תיעוד",
  },
];

export const getNavItems = (isAdmin: boolean = false, isCoordinator: boolean = false) => {
  return navItems.filter(item => {
    // אם הפריט דורש הרשאות אדמין ולמשתמש אין הרשאות אדמין - לא להציג
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });
};
