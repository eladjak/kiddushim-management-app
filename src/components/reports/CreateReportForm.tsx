
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { encodeContentForStorage } from "@/lib/reports";
import { logger } from "@/utils/logger";

interface CreateReportFormProps {
  eventId: string;
  reportType: string;
  onClose: () => void;
}

export const CreateReportForm = ({ eventId, reportType, onClose }: CreateReportFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<Record<string, any>>({});
  const log = logger.createLogger({ component: 'CreateReportForm' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prevContent => ({
      ...prevContent,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: "destructive",
        description: "נדרש להיות מחובר כדי ליצור דיווח",
      });
      return;
    }

    setLoading(true);

    try {
      // בדיקת תוקף תוכן הדיווח
      if (Object.keys(content).length === 0) {
        throw new Error("יש למלא לפחות שדה אחד בדיווח");
      }

      // Encode the content for storage
      const encodedContent = encodeContentForStorage(content);
      
      log.info("Creating report", { reportType, eventId: eventId || "no-event" });

      // מניעת שגיאת אם event_id הוא ריק
      const safeEventId = eventId || 'no-event-id';

      // Use type assertion to help TypeScript understand the data structure
      const reportData = {
        type: reportType,
        content: encodedContent,
        event_id: safeEventId,
        reporter_id: user.id,
      } as any; // Type assertion for insert

      const { data, error } = await supabase
        .from("reports")
        .insert(reportData)
        .select();

      if (error) {
        log.error("Error creating report", { error, reportData });
        throw new Error(`שגיאה ביצירת הדיווח: ${error.message}`);
      }

      // Safe access to the id property with type checking
      const reportId = data?.[0] ? (data[0] as any).id : undefined;
      log.info("Report created successfully", { reportId });

      toast({
        description: "הדיווח נוצר בהצלחה!",
      });

      onClose();
      navigate("/reports");
    } catch (error: any) {
      log.error("Failed to create report", { error });
      toast({
        variant: "destructive",
        description: error.message || "אירעה שגיאה ביצירת הדיווח",
      });
    } finally {
      setLoading(false);
    }
  };

  // הוספת שדות בסיסיים אם אין עדיין תוכן
  if (Object.keys(content).length === 0) {
    setContent({
      title: "",
      description: "",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(content).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {key === 'title' ? 'כותרת' : 
             key === 'description' ? 'תיאור' : key}
          </label>
          {key === 'description' ? (
            <textarea
              id={key}
              name={key}
              value={value || ""}
              onChange={handleChange}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={key === 'description' ? 'תאר את הדיווח בהרחבה' : key}
            />
          ) : (
            <input
              type="text"
              id={key}
              name={key}
              value={value || ""}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={key === 'title' ? 'כותרת הדיווח' : key}
            />
          )}
        </div>
      ))}
      <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
        {loading ? "שולח..." : "שלח דיווח"}
      </button>
    </form>
  );
};
