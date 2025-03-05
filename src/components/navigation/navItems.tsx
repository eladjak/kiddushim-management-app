
import { FileText, User, LogOut, Camera, Calendar, Shield, Users, FileSpreadsheet, Package2 } from "lucide-react";
import { RoleType } from "@/types/profile";

export interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  requiredRoles?: RoleType[];
}

export const getNavItems = (isAdmin: boolean, isCoordinator: boolean): NavItem[] => {
  return [
    {
      path: "/",
      label: "דף הבית",
    },
    {
      path: "/events",
      label: "אירועים",
    },
    {
      path: "/documentation",
      label: "תיעוד",
    },
    {
      path: "/volunteers",
      label: "מתנדבים",
      requiredRoles: ["admin", "coordinator"],
    },
    {
      path: "/users",
      label: "ניהול משתמשים",
      requiredRoles: ["admin"],
    },
    {
      path: "/reports",
      label: "דיווחים",
    },
    {
      path: "/equipment",
      label: "ציוד",
    },
    {
      path: "/profile",
      label: "פרופיל",
      icon: <User className="h-4 w-4 ml-1" />,
    },
  ];
};

export const getPublicNavItems = (): NavItem[] => {
  return [
    {
      path: "/documentation",
      label: "תיעוד הפרויקט",
      icon: <FileText className="h-4 w-4 ml-1" />,
    },
    {
      path: "/auth",
      label: "התחבר",
    },
  ];
};
