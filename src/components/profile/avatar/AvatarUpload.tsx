
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { User, Upload, Trash2, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/AuthContext";

interface AvatarUploadProps {
  avatarUrl: string | null;
}

export const AvatarUpload = ({ avatarUrl }: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user, updateAvatar } = useAuth();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileSize = file.size / 1024 / 1024; // Convert to MB
    
    // Validate file type and size
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExt?.toLowerCase() || '')) {
      toast({
        variant: "destructive",
        description: "ניתן להעלות רק קבצי תמונה מסוג jpg, jpeg, png או webp",
      });
      return;
    }
    
    if (fileSize > 2) {
      toast({
        variant: "destructive",
        description: "גודל הקובץ חייב להיות קטן מ-2MB",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      if (!user?.id) {
        throw new Error("המשתמש אינו מחובר");
      }
      
      const fileName = `${user.id}_${uuidv4()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      if (!urlData || !urlData.publicUrl) {
        throw new Error("שגיאה בקבלת כתובת התמונה");
      }
      
      // Update profile
      await updateAvatar(urlData.publicUrl);
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: "destructive",
        description: error.message || "שגיאה בהעלאת התמונה",
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };
  
  const handleDeleteAvatar = async () => {
    if (!avatarUrl || !user?.id) return;
    
    setIsDeleting(true);
    
    try {
      // For images from Google, we just remove the URL from the profile
      if (avatarUrl.includes('googleusercontent.com')) {
        await updateAvatar('');
        return;
      }
      
      // For our own storage, try to delete the file
      const avatarPath = avatarUrl.split('/').pop();
      
      if (avatarPath) {
        await supabase.storage
          .from('avatars')
          .remove([avatarPath]);
      }
      
      await updateAvatar('');
      
    } catch (error: any) {
      console.error('Error deleting avatar:', error);
      toast({
        variant: "destructive",
        description: error.message || "שגיאה במחיקת התמונה",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden relative group">
        {avatarUrl ? (
          <Image 
            src={avatarUrl} 
            alt="תמונת פרופיל" 
            className="w-full h-full object-cover"
            fallback={
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                <User size={48} />
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
            <User size={48} />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading || isDeleting ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <>
              <label htmlFor="avatar-upload" className="cursor-pointer p-2 text-white hover:text-primary-foreground">
                <Upload className="w-6 h-6" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  className="hidden" 
                  onChange={handleFileChange}
                  disabled={isUploading || isDeleting}
                />
              </label>
              
              {avatarUrl && (
                <button 
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={isUploading || isDeleting}
                  className="p-2 text-white hover:text-red-400"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => document.getElementById('avatar-upload')?.click()}
        disabled={isUploading || isDeleting}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            מעלה...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            החלף תמונה
          </>
        )}
      </Button>
    </div>
  );
};
