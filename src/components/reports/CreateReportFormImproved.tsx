
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportForm } from "@/hooks/reports/useReportForm";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ReportBasicInfo } from "./form-sections/ReportBasicInfo";
import { ParticipantsSection } from "./form-sections/ParticipantsSection";
import { TzoharSection } from "./form-sections/TzoharSection";
import { EventRatingSection } from "./form-sections/EventRatingSection";
import { FeedbackSection } from "./form-sections/FeedbackSection";
import { MediaUploadSection } from "./form-sections/MediaUploadSection";

interface CreateReportFormImprovedProps {
  reportType: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateReportFormImproved = ({ reportType, onClose, onSuccess }: CreateReportFormImprovedProps) => {
  const { user } = useAuth();
  const { defaultValues, events, submitReport } = useReportForm();
  const [formData, setFormData] = useState(defaultValues);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר כדי לשלוח דיווח",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitReport({
        values: formData,
        images,
        userId: user.id,
        reportType,
      });

      toast({
        title: "הדיווח נשלח בהצלחה",
        description: "הדיווח נשלח לארגון צהר ונשמר במערכת",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "שגיאה בשליחת הדיווח",
        description: "אירעה שגיאה בשליחת הדיווח. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.length >= 3 &&
      formData.description.length >= 10 &&
      formData.reporter_name.length >= 2 &&
      formData.participants_count > 0 &&
      formData.participants_gained.length >= 5
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>דיווח אירוע חדש</CardTitle>
          <CardDescription>
            {reportType === "event_report" && "דיווח מפורט לארגון צהר"}
            {reportType === "feedback" && "משוב על אירוع"}
            {reportType === "issue" && "דיווח על תקלה"}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">פרטים בסיסיים</TabsTrigger>
          <TabsTrigger value="participants">משתתפים</TabsTrigger>
          <TabsTrigger value="content">תוכן ומשוב</TabsTrigger>
          <TabsTrigger value="media">מדיה</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <ReportBasicInfo
            events={events}
            formData={formData}
            onFieldChange={handleFieldChange}
          />
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <ParticipantsSection
            formData={formData}
            onFieldChange={handleFieldChange}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <TzoharSection
            formData={formData}
            onFieldChange={handleFieldChange}
          />
          
          {(reportType === "event_report" || reportType === "feedback") && (
            <EventRatingSection
              formData={formData}
              onFieldChange={handleFieldChange}
            />
          )}
          
          <FeedbackSection
            formData={formData}
            onFieldChange={handleFieldChange}
          />
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <MediaUploadSection
            images={images}
            onImagesChange={setImages}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          ביטול
        </Button>
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={!isFormValid() || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "שולח..." : "שלח דיווח"}
          </Button>
        </div>
      </div>
    </form>
  );
};
