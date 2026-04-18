
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { GoogleAuthButton } from "../GoogleAuthButton";

interface AuthButtonsProps {
  isLoading: boolean;
  submitLabel: string;
  onToggleMode: (value: boolean) => void;
  toggleModeLabel: string;
  onForgotPassword?: () => void;
  forgotPasswordLabel?: string;
}

export const AuthButtons = ({
  isLoading,
  submitLabel,
  onToggleMode,
  toggleModeLabel,
  onForgotPassword,
  forgotPasswordLabel,
}: AuthButtonsProps) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full h-10"
      >
        {isLoading ? "טוען..." : submitLabel}
      </Button>
      
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-card px-2 text-gray-500 dark:text-gray-400">או</span>
        </div>
      </div>
      
      <GoogleAuthButton />
      
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-between'} gap-2 mt-2 items-center`}>
        {onForgotPassword && forgotPasswordLabel && (
          <Button
            type="button"
            variant="link"
            onClick={onForgotPassword}
            className="text-sm text-gray-500 hover:text-primary hover:underline h-8 p-0 font-normal"
          >
            {forgotPasswordLabel}
          </Button>
        )}
        
        <Button
          type="button"
          variant="link"
          onClick={() => onToggleMode(true)}
          className="text-sm text-gray-500 hover:text-primary hover:underline h-8 p-0 font-normal"
        >
          {toggleModeLabel}
        </Button>
      </div>
    </div>
  );
};
