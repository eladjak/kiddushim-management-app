
import { ArrowRight } from "lucide-react";
import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthHeaderProps {
  isSignUp: boolean;
  isForgotPassword: boolean;
  onBackClick?: () => void;
}

export const AuthHeader = ({ isSignUp, isForgotPassword, onBackClick }: AuthHeaderProps) => {
  return (
    <CardHeader className="p-6 space-y-1 text-center">
      {isForgotPassword && onBackClick && (
        <Button
          onClick={onBackClick}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 p-0 w-8 h-8 flex items-center justify-center"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
      
      <h2 className="text-2xl font-bold tracking-tight text-center">
        {isForgotPassword 
          ? "שחזור סיסמה" 
          : isSignUp 
            ? "הרשמה למערכת"
            : "התחברות למערכת"}
      </h2>
      
      <p className="text-sm text-muted-foreground text-center max-w-xs mx-auto">
        {isForgotPassword 
          ? "הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה" 
          : isSignUp 
            ? "צור חשבון חדש כדי להתחיל להשתמש במערכת"
            : "הזן את פרטי ההתחברות שלך כדי להיכנס למערכת"}
      </p>
    </CardHeader>
  );
};
