
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

interface PosterUploadFieldProps {
  posterUrl: string;
  onPosterChange: (url: string) => void;
}

export const PosterUploadField = ({ posterUrl, onPosterChange }: PosterUploadFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    try {
      // Check file size (150-400KB as mentioned in form)
      if (file.size < 150 * 1024 || file.size > 400 * 1024) {
        toast({
          variant: "destructive",
          description: "התמונה צריכה להיות בגודל בין 150-400 KB",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `event-posters/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('event_posters')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('event_posters')
        .getPublicUrl(filePath);
      
      onPosterChange(data.publicUrl);
      
      toast({
        description: "הפוסטר הועלה בהצלחה",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        description: `שגיאה בהעלאת הפוסטר: ${error.message}`,
      });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };
  
  const removePoster = () => {
    onPosterChange("");
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>תמונת אווירה *</Label>
        <p className="text-sm text-gray-500">יש לצרף תמונת אווירה של אופי האירוע / הקהל (לא מודעת פרסום)</p>
        <p className="text-sm text-gray-500">התמונה צריכה להיות בגודל בין 150-400 KB</p>
        
        {posterUrl ? (
          <div className="relative rounded-md overflow-hidden border h-40 w-full">
            <Image 
              src={posterUrl} 
              alt="תמונת אווירה"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 left-2 h-6 w-6"
              onClick={removePoster}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center border rounded-md h-40 bg-muted/50">
            <div className="text-center">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="mt-2"
                disabled={isUploading}
                onClick={() => document.getElementById('poster-upload')?.click()}
              >
                {isUploading ? "מעלה..." : "לא נבחר קובץ"}
              </Button>
            </div>
            
            <input
              id="poster-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>

      <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded">
        במידה וקובץ התמונה שלכם גדול ניתן להקטין אותו בקלות בקישור זה:
        <br />
        <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" className="underline">
          https://tinypng.com
        </a>
      </div>

      <div className="space-y-2">
        <Label>יש לצרף מודעת פרסום של האירוע *</Label>
        <p className="text-sm text-gray-500">(שימו לב לנוכחות הלוגואים של צהר והפרויקט במיקום בולט)</p>
        
        <div className="flex items-center justify-center border rounded-md h-20 bg-muted/50">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => document.getElementById('poster-ad-upload')?.click()}
          >
            לא נבחר קובץ
          </Button>
          
          <input
            id="poster-ad-upload"
            type="file"
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
