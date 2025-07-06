import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, UserCheck, FileText } from "lucide-react";

interface RoleBasedFormWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  requiredRoles?: string[];
  className?: string;
}

export const RoleBasedFormWrapper = ({
  children,
  title,
  description,
  requiredRoles = [],
  className = ""
}: RoleBasedFormWrapperProps) => {
  const { profile } = useAuth();

  // Check if user has required role
  const hasRequiredRole = requiredRoles.length === 0 || 
    (profile?.role && requiredRoles.includes(profile.role));

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "coordinator":
        return <Users className="h-4 w-4" />;
      case "service_girl":
        return <UserCheck className="h-4 w-4" />;
      case "content_provider":
        return <FileText className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "מנהל";
      case "coordinator":
        return "רכז";
      case "service_girl":
        return "בת שירות";
      case "youth_volunteer":
        return "מתנדב צעיר";
      case "content_provider":
        return "ספק תוכן";
      default:
        return role;
    }
  };

  if (!hasRequiredRole) {
    return (
      <Card className={`${className} border-destructive/50`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            גישה מוגבלת
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-muted-foreground">
              טופס זה זמין רק למשתמשים עם התפקידים הבאים:
            </p>
            <div className="flex flex-wrap gap-2">
              {requiredRoles.map((role) => (
                <Badge key={role} variant="outline" className="flex items-center gap-1">
                  {getRoleIcon(role)}
                  {getRoleLabel(role)}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              התפקיד שלך: <strong>{getRoleLabel(profile?.role || "")}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-right">{title}</CardTitle>
          {profile?.role && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {getRoleIcon(profile.role)}
              {getRoleLabel(profile.role)}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground text-right">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};