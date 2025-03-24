
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AuthCallbackErrorProps {
  error: string;
}

export const AuthCallbackError = ({ error }: AuthCallbackErrorProps) => {
  const navigate = useNavigate();
  
  // Function to extract and display token from error message if present
  const formatErrorMessage = (error: string) => {
    // Check if the error contains sensitive information like tokens
    if (error.includes('access_token') || error.includes('refresh_token')) {
      return "שגיאה בעיבוד פרטי ההתחברות. נא לנסות שוב.";
    }
    
    return error;
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-red-500 mb-4 text-xl font-medium">שגיאה בהתחברות</div>
        <p className="mb-6 text-gray-700">{formatErrorMessage(error)}</p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/auth")}
            className="w-full"
          >
            חזרה לדף ההתחברות
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            רענן ונסה שוב
          </Button>
        </div>
      </div>
    </div>
  );
};
