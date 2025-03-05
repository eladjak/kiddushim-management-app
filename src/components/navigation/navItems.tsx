
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
      icon: <Calendar className="h-4 w-4 ml-1" />,
    },
    {
      path: "/events",
      label: "אירועים",
      icon: <Calendar className="h-4 w-4 ml-1" />,
    },
    {
      path: "/documentation",
      label: "תיעוד",
      icon: <FileText className="h-4 w-4 ml-1" />,
    },
    {
      path: "/volunteers",
      label: "מתנדבים",
      icon: <Users className="h-4 w-4 ml-1" />,
      requiredRoles: ["admin", "coordinator"],
    },
    {
      path: "/users",
      label: "ניהול משתמשים",
      icon: <Shield className="h-4 w-4 ml-1" />,
      requiredRoles: ["admin"],
    },
    {
      path: "/reports",
      label: "דיווחים",
      icon: <FileSpreadsheet className="h-4 w-4 ml-1" />,
    },
    {
      path: "/equipment",
      label: "ציוד",
      icon: <Package2 className="h-4 w-4 ml-1" />,
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
