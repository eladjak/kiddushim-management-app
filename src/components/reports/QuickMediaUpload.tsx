import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  AlertCircle,
  Image as ImageIcon,
  Video,
  File,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface QuickMediaUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  url: string;
  uploaded: boolean;
  progress: number;
  error?: string;
}

export const QuickMediaUpload = ({ onClose, onSuccess }: QuickMediaUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [eventTitle, setEventTitle] = useState("");

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    selectedFiles.forEach((file) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          description: `הקובץ ${file.name} גדול מדי (מקסימום 10MB)`,
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          variant: "destructive", 
          description: `הקובץ ${file.name} אינו תמונה או וידאו`,
        });
        return;
      }

      const newFile: UploadedFile = {
        id: uuidv4(),
        file,
        url: URL.createObjectURL(file),
        uploaded: false,
        progress: 0
      };

      setFiles(prev => [...prev, newFile]);
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return updatedFiles;
    });
  };

  // Upload single file
  const uploadFile = async (uploadFile: UploadedFile): Promise<string | null> => {
    try {
      const fileExt = uploadFile.file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `quick-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('report_images')
        .upload(filePath, uploadFile.file);

      if (uploadError) throw uploadError;

      // Update progress to 100% after successful upload
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, progress: 100, uploaded: true }
          : f
      ));

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('report_images')
        .getPublicUrl(filePath);

      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, uploaded: true }
          : f
      ));

      return publicUrl;
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, error: error.message, progress: 0 }
          : f
      ));
      return null;
    }
  };

  // Submit quick upload
  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        description: "נדרש להיות מחובר",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        variant: "destructive",
        description: "יש להעלות לפחות קובץ אחד",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload all files
      const uploadPromises = files.map(uploadFile);
      const uploadedUrls = await Promise.all(uploadPromises);
      const successfulUploads = uploadedUrls.filter(url => url !== null);

      if (successfulUploads.length === 0) {
        throw new Error("לא הצלחנו להעלות אף קובץ");
      }

      // Create a quick report with the uploaded media
      const reportData = {
        type: "media_upload",
        content: {
          title: eventTitle || "העלאה מהירה",
          description: description || "העלאת מדיה מהירה מהאירוע",
          reporter_name: user.email,
          media_urls: successfulUploads,
          status: "new"
        },
        reporter_id: user.id,
        event_id: null // Quick uploads aren't tied to specific events
      };

      const { error: reportError } = await supabase
        .from('reports')
        .insert(reportData);

      if (reportError) throw reportError;

      toast({
        description: `הועלו בהצלחה ${successfulUploads.length} קבצים!`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        description: error.message || "שגיאה בהעלאת הקבצים",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <Camera className="h-8 w-8 mx-auto mb-2 text-blue-600" />
        <h3 className="font-medium text-lg">העלאה מהירה</h3>
        <p className="text-sm text-gray-600 mt-1">
          העלו תמונות ווידאו מהאירוע במהירות וקלות
        </p>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="event-title">שם האירוע (אופציונלי)</Label>
          <Input
            id="event-title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="למשל: קידושישי פרשת נח"
          />
        </div>

        <div>
          <Label htmlFor="description">תיאור קצר (אופציונלי)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="תיאור קצר של התמונות/וידאו..."
          />
        </div>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          גררו קבצים או לחצו לבחירה
        </p>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          בחרו קבצים
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          תמונות ווידאו עד 10MB לכל קובץ
        </p>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">קבצים להעלאה ({files.length})</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {getFileIcon(file.file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  
                  {file.progress > 0 && !file.uploaded && !file.error && (
                    <Progress value={file.progress} className="h-1 mt-1" />
                  )}
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  {file.uploaded && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Check className="h-3 w-3 ms-1" />
                      הועלה
                    </Badge>
                  )}
                  
                  {file.error && (
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      <AlertCircle className="h-3 w-3 ms-1" />
                      שגיאה
                    </Badge>
                  )}
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={isUploading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button 
          onClick={handleSubmit} 
          disabled={files.length === 0 || isUploading}
          className="flex-1"
        >
          {isUploading ? "מעלה..." : `העלה ${files.length} קבצים`}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          ביטול
        </Button>
      </div>
    </div>
  );
};