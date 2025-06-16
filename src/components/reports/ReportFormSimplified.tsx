
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useReportForm } from "@/hooks/reports/useReportForm";
import { useReportFormState } from "@/hooks/reports/useReportFormState";
import { ReportBasicInfo } from "./form-sections/ReportBasicInfo";
import { ParticipantsSection } from "./form-sections/ParticipantsSection";
import { TzoharSection } from "./form-sections/TzoharSection";
import { EventRatingSection } from "./form-sections/EventRatingSection";
import { FeedbackSection } from "./form-sections/FeedbackSection";
import { MediaUploadSection } from "./form-sections/MediaUploadSection";

interface ReportFormSimplifiedProps {
  reportType: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportFormSimplified = ({ reportType, onClose, onSuccess }: ReportFormSimplifiedProps) => {
  const { user } = useAuth();
  const { events, submitReport } = useReportForm();
  const { 
    formData, 
    images, 
    currentTab,
    setCurrentTab,
    handleFieldChange, 
    setImages, 
    resetForm,
    isFormValid 
  } = useReportFormState();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("ReportFormSimplified - Form data:", formData);
  console.log("ReportFormSimplified - Events:", events);

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

    if (!isFormValid()) {
      toast({
        title: "נתונים חסרים",
        description: "אנא מלא את כל השדות הנדרשים",
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

      resetForm();
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

  const getReportTypeTitle = () => {
    switch (reportType) {
      case "event_report": return "דיווח אירוע לצהר";
      case "feedback": return "משוב על אירוע";
      case "issue": return "דיווח תקלה";
      default: return "דיווח חדש";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{getReportTypeTitle()}</CardTitle>
          <CardDescription>
            מלא את הפרטים הנדרשים לשליחת הדיווח
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">פרטים בסיסיים</TabsTrigger>
          <TabsTrigger value="participants">משתתפים</TabsTrigger>
          <TabsTrigger value="content">תוכן ומשוב</TabsTrigger>
          <TabsTrigger value="media">מדיה</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <ReportBasicInfo
            events={events}
            formData={{
              title: formData.title,
              description: formData.description,
              event_id: formData.event_id,
              reporter_name: formData.reporter_name
            }}
            onFieldChange={handleFieldChange}
          />
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <ParticipantsSection
            formData={{
              participants_count: formData.participants_count,
              participants_kids: formData.participants_kids,
              participants_adults: formData.participants_adults
            }}
            onFieldChange={handleFieldChange}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <TzoharSection
            formData={{
              participants_gained: formData.participants_gained,
              is_tzohar_representative: formData.is_tzohar_representative
            }}
            onFieldChange={handleFieldChange}
          />
          
          {(reportType === "event_report" || reportType === "feedback") && (
            <EventRatingSection
              formData={{
                overall_rating: formData.overall_rating,
                audience_rating: formData.audience_rating,
                organization_rating: formData.organization_rating,
                logistics_rating: formData.logistics_rating
              }}
              onFieldChange={handleFieldChange}
            />
          )}
          
          <FeedbackSection
            formData={{
              additional_feedback: formData.additional_feedback
            }}
            onFieldChange={handleFieldChange}
            images={images}
            onImagesChange={setImages}
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
