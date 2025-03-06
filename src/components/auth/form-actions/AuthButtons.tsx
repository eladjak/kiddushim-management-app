
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
    <div className="flex flex-col gap-2 pt-4">
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full h-10 transition-all duration-200 hover:bg-primary/90"
      >
        {isLoading ? "טוען..." : submitLabel}
      </Button>
      
      <GoogleAuthButton />
      
      {onForgotPassword && forgotPasswordLabel && (
        <Button
          type="button"
          variant="link"
          onClick={onForgotPassword}
          className="w-full text-sm text-gray-500 hover:text-primary hover:underline h-8 font-normal"
        >
          {forgotPasswordLabel}
        </Button>
      )}
      
      <Button
        type="button"
        variant="link"
        onClick={() => onToggleMode(true)}
        className="w-full text-sm text-gray-500 hover:text-primary hover:underline h-8 font-normal"
      >
        {toggleModeLabel}
      </Button>
    </div>
  );
};
