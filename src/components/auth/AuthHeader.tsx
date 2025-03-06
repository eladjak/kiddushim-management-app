
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type AuthHeaderProps = {
  isSignUp: boolean;
  isForgotPassword: boolean;
  onBackClick: () => void;
};

export const AuthHeader = ({ isSignUp, isForgotPassword, onBackClick }: AuthHeaderProps) => {
  return (
    <CardHeader className="text-right space-y-2 relative pb-4">
      {isForgotPassword && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-4 top-4 transition-transform hover:scale-105"
          onClick={onBackClick}
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          חזרה
        </Button>
      )}
      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {isForgotPassword
          ? "שחזור סיסמה"
          : isSignUp
          ? "הרשמה"
          : "התחברות"}
      </CardTitle>
      <CardDescription className="text-muted-foreground text-sm">
        {isForgotPassword
          ? "הזן את כתובת האימייל שלך לקבלת קישור לאיפוס סיסמה"
          : isSignUp
          ? "צור חשבון חדש כדי להתחיל"
          : "התחבר כדי לנהל את האירועים שלך"}
      </CardDescription>
    </CardHeader>
  );
};
