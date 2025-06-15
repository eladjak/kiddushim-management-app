
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MediaUploadSectionProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export const MediaUploadSection = ({ images, onImagesChange }: MediaUploadSectionProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('event-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      onImagesChange([...images, ...uploadedUrls]);
      toast({
        title: "העלאה הושלמה",
        description: `${uploadedUrls.length} קבצים הועלו בהצלחה`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "שגיאה בהעלאה",
        description: "אירעה שגיאה בהעלאת הקבצים",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) {
      return 'video';
    }
    return 'unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>תמונות וסרטונים</CardTitle>
        <CardDescription>העלה תמונות וסרטונים מהאירוע</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="media-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">לחץ להעלאה</span> או גרור קבצים לכאן
              </p>
              <p className="text-xs text-muted-foreground">תמונות וסרטונים בלבד</p>
            </div>
            <input
              id="media-upload"
              type="file"
              className="hidden"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {uploading && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">מעלה קבצים...</p>
          </div>
        )}

        {images.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">קבצים שהועלו:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {images.map((url, index) => {
                const fileType = getFileType(url);
                return (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center">
                      {fileType === 'image' ? (
                        <Image className="w-8 h-8 text-muted-foreground" />
                      ) : (
                        <Video className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">
                      {fileType}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
