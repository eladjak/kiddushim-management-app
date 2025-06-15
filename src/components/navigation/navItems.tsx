
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
      path: "/timeline",
      label: "לוח זמנים",
      icon: <Calendar className="h-4 w-4 ml-1" />,
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
    }
    // הסרנו את הפרופיל מכאן כי הוא נגיש דרך תפריט האווטאר
  ];
};

export const getPublicNavItems = (): NavItem[] => {
  return [
    {
      path: "/auth",
      label: "התחבר",
    },
  ];
};
