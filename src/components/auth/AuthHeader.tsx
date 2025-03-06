
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
    <CardHeader className="text-center space-y-2 relative pt-2 pb-3 px-6">
      {isForgotPassword && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 transition-transform hover:scale-105 h-8 w-8 p-0"
          onClick={onBackClick}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">חזרה</span>
        </Button>
      )}
      <CardTitle className="text-xl font-bold text-primary">
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
