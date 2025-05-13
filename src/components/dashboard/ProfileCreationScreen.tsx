
import React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

interface ProfileCreationScreenProps {
  isCreatingProfile: boolean;
  creationAttempts: number;
  onCreateProfile: () => void;
  onRefresh: () => void;
  onSignOut: () => void;
}

export const ProfileCreationScreen: React.FC<ProfileCreationScreenProps> = ({
  isCreatingProfile,
  creationAttempts,
  onCreateProfile,
  onRefresh,
  onSignOut
}) => {
  const { toast } = useToast();

  const handleCreateProfile = () => {
    toast({
      description: "יוצר פרופיל משתמש...",
    });
    onCreateProfile();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <div className="text-primary font-medium mb-4 text-xl">יצירת פרופיל משתמש</div>
      
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
      
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-sm text-gray-600 mb-6">
          מזהה שלך ({creationAttempts === 0 ? "ראשון" : creationAttempts >= 2 ? `${creationAttempts} ניסיונות` : "שני"} ניסיונות)
        </div>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleCreateProfile}
            disabled={isCreatingProfile}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isCreatingProfile ? (
              <>
                <Spinner className="mr-2 h-4 w-4" /> יוצר פרופיל...
              </>
            ) : (
              "צור פרופיל באופן ידני"
            )}
          </Button>
          
          <Button 
            onClick={onRefresh}
            variant="outline"
            className="w-full"
          >
            רענן דף
          </Button>
          
          <Button 
            onClick={onSignOut}
            variant="ghost"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            התנתק ונסה שוב
          </Button>
        </div>
        
        {creationAttempts > 0 && (
          <div className="mt-4 text-xs text-gray-500">
            מספר ניסיונות: {creationAttempts}
          </div>
        )}
      </div>
    </div>
  );
};
