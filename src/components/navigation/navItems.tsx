
import { Calendar, Users, FileText, Settings, Wrench, BookOpen, Clock, UserCheck } from "lucide-react";

export const navItems = [
  {
    title: "אירועים",
    href: "/events",
    icon: Calendar,
  },
  {
    title: "לוח זמנים",
    href: "/timeline", 
    icon: Clock,
  },
  {
    title: "דיווחים",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "משתמשים",
    href: "/users",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "מתנדבים",
    href: "/volunteers",
    icon: UserCheck,
  },
  {
    title: "ציוד",
    href: "/equipment",
    icon: Wrench,
  },
  {
    title: "תיעוד",
    href: "/documentation",
    icon: BookOpen,
  },
];
