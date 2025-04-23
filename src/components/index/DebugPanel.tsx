
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface DebugPanelProps {
  directSessionInfo: {
    hasSession: boolean;
    userId: string | null;
    loading: boolean;
    error: any | null;
  };
  onSignOut: () => void;
  onExitDebugMode: () => void;
}

export const DebugPanel = ({ 
  directSessionInfo, 
  onSignOut, 
  onExitDebugMode 
}: DebugPanelProps) => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, session } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">מצב דיאגנוסטיקה</h1>
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div>
          <h2 className="font-bold">מידע מקונטקסט האימות:</h2>
          <p>מצב טעינה: {authLoading ? "טוען" : "סיים טעינה"}</p>
          <p>משתמש: {user ? `נמצא (${user.id.slice(0, 6)}...)` : "לא נמצא"}</p>
          <p>סשן: {session ? `נמצא (${session.access_token.slice(0, 10)}...)` : "לא נמצא"}</p>
          <p>פרופיל: {profile ? `נמצא (${profile.name})` : "לא נמצא"}</p>
        </div>
        
        <div>
          <h2 className="font-bold">בדיקת סשן ישירה:</h2>
          <p>{directSessionInfo.hasSession ? `סשן נמצא (${directSessionInfo.userId?.slice(0, 6)}...)` : "לא נמצא סשן"}</p>
          <p>מצב טעינה: {directSessionInfo.loading ? "טוען" : "סיים טעינה"}</p>
          {directSessionInfo.error && <p className="text-red-500">שגיאה: {JSON.stringify(directSessionInfo.error)}</p>}
        </div>
        
        <div className="flex gap-4 mt-4">
          <Button onClick={onExitDebugMode}>
            חזרה למסך רגיל
          </Button>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            עבור לדף התחברות
          </Button>
          <Button variant="destructive" onClick={onSignOut}>
            התנתקות
          </Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            רענן דף
          </Button>
        </div>
      </div>
    </div>
  );
};
