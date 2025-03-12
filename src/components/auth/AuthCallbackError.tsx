
import { useNavigate } from "react-router-dom";

interface AuthCallbackErrorProps {
  error: string;
}

export const AuthCallbackError = ({ error }: AuthCallbackErrorProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-red-500 mb-4">שגיאה בהתחברות</div>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => navigate("/auth")}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          חזרה לדף ההתחברות
        </button>
      </div>
    </div>
  );
};
