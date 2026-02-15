
import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Trash } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'AvatarUpload' });

interface AvatarUploadProps {
  onAvatarChange?: (url: string) => void;
}

export const AvatarUpload = ({ onAvatarChange }: AvatarUploadProps) => {
  const { profile, updateAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("עליך לבחור קובץ");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${profile?.id}/${fileName}`;

      // Create URL preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload to Supabase
      let { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const avatarUrl = data.publicUrl;

      // Update user profile
      await updateAvatar(avatarUrl);

      // Call the callback if provided
      if (onAvatarChange) {
        onAvatarChange(avatarUrl);
      }

      toast({
        description: "התמונה הועלתה בהצלחה",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: `שגיאה בהעלאת התמונה: ${error.message}`,
      });
      log.error('Error uploading avatar', { error });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteAvatar = async () => {
    try {
      setUploading(true);
      // Update with empty string to remove avatar
      await updateAvatar("");
      setPreview(null);
      
      toast({
        description: "התמונה הוסרה בהצלחה",
      });
      
      // Call the callback if provided
      if (onAvatarChange) {
        onAvatarChange("");
      }
      
    } catch (error) {
      toast({
        variant: "destructive",
        description: `שגיאה בהסרת התמונה: ${error.message}`,
      });
    } finally {
      setUploading(false);
    }
  };

  // Use preview if available, otherwise use profile avatar
  const avatarSrc = preview || profile?.avatar_url || "";
  
  // Calculate initials for the avatar fallback
  const getInitials = (): string => {
    if (!profile?.name) return "NA";
    
    const nameParts = profile.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;
    }
    return nameParts[0].substring(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarSrc} alt={profile?.name || "תמונת משתמש"} />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      
      <div className="flex space-x-2 rtl:space-x-reverse">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleButtonClick} 
          disabled={uploading}
        >
          {uploading ? (
            "מעלה..."
          ) : (
            <>
              <Camera className="h-4 w-4 me-2" />
              {profile?.avatar_url ? "החלף תמונה" : "הוסף תמונה"}
            </>
          )}
        </Button>
        
        {(profile?.avatar_url || preview) && (
          <Button 
            type="button" 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteAvatar} 
            disabled={uploading}
          >
            <Trash className="h-4 w-4 me-2" />
            הסר
          </Button>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={uploadAvatar}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};
