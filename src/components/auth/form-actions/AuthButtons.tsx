
import { Button } from "@/components/ui/button";
import { GoogleAuthButton } from "../GoogleAuthButton";

interface AuthButtonsProps {
  isLoading: boolean;
  submitLabel: string;
  onForgotPassword?: () => void;
  onToggleMode: (value: boolean) => void;
  toggleModeLabel: string;
  forgotPasswordLabel?: string;
}

export const AuthButtons = ({
  isLoading,
  submitLabel,
  onForgotPassword,
  onToggleMode,
  toggleModeLabel,
  forgotPasswordLabel
}: AuthButtonsProps) => {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? "טוען..." : submitLabel}
      </Button>
      
      <GoogleAuthButton />
      
      {onForgotPassword && forgotPasswordLabel && (
        <Button
          type="button"
          variant="ghost"
          onClick={onForgotPassword}
          className="w-full hover:bg-secondary/50 transition-all duration-200"
        >
          {forgotPasswordLabel}
        </Button>
      )}
      
      <Button
        type="button"
        variant="ghost"
        onClick={() => onToggleMode(true)}
        className="w-full hover:bg-secondary/50 transition-all duration-200"
      >
        {toggleModeLabel}
      </Button>
    </div>
  );
};
