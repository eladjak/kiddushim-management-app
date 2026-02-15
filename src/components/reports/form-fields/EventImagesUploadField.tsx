
import { useState } from "react";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'EventImagesUploadField' });

interface EventImagesUploadFieldProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export const EventImagesUploadField = ({ images, onImagesChange }: EventImagesUploadFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages = [...images];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `report-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('report_images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('report_images').getPublicUrl(filePath);
        newImages.push(data.publicUrl);
      }

      onImagesChange(newImages);
      toast({
        description: "התמונות הועלו בהצלחה",
      });
    } catch (error) {
      log.error('Upload error', { error });
      toast({
        variant: "destructive",
        description: `שגיאה בהעלאת התמונות: ${error.message}`,
      });
    } finally {
      setIsUploading(false);
      // Clear the input
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <FormItem className="space-y-3">
      <FormLabel>תמונות או סרטונים מהאירוע</FormLabel>
      
      <div className="space-y-2">
        <Input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          multiple
          disabled={isUploading}
          className="cursor-pointer"
        />
        
        {isUploading && (
          <div className="text-sm text-muted-foreground animate-pulse">
            מעלה קבצים...
          </div>
        )}
        
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                {image.toLowerCase().endsWith('.mp4') ? (
                  <video
                    src={image}
                    className="h-24 w-full object-cover rounded-md border"
                    controls
                  />
                ) : (
                  <img
                    src={image}
                    alt={`תמונה ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md border"
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormItem>
  );
};
