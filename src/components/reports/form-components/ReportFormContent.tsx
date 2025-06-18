
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportBasicInfo } from "../form-sections/ReportBasicInfo";
import { ParticipantsSection } from "../form-sections/ParticipantsSection";
import { TzoharSection } from "../form-sections/TzoharSection";
import { EventRatingSection } from "../form-sections/EventRatingSection";
import { FeedbackSection } from "../form-sections/FeedbackSection";
import { MediaUploadSection } from "../form-sections/MediaUploadSection";
import { ReportFormData } from "@/hooks/reports/useReportFormState";

interface ReportFormContentProps {
  events: any[];
  formData: ReportFormData;
  images: string[];
  currentTab: string;
  reportType: string;
  onTabChange: (value: string) => void;
  onFieldChange: (field: keyof ReportFormData, value: any) => void;
  onImagesChange: (images: string[]) => void;
}

export const ReportFormContent = ({
  events,
  formData,
  images,
  currentTab,
  reportType,
  onTabChange,
  onFieldChange,
  onImagesChange
}: ReportFormContentProps) => {
  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
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
          onFieldChange={onFieldChange}
        />
      </TabsContent>

      <TabsContent value="participants" className="space-y-4">
        <ParticipantsSection
          formData={{
            participants_count: formData.participants_count,
            participants_kids: formData.participants_kids,
            participants_adults: formData.participants_adults
          }}
          onFieldChange={onFieldChange}
        />
      </TabsContent>

      <TabsContent value="content" className="space-y-4">
        <TzoharSection
          formData={{
            participants_gained: formData.participants_gained,
            is_tzohar_representative: formData.is_tzohar_representative
          }}
          onFieldChange={onFieldChange}
        />
        
        {(reportType === "event_report" || reportType === "feedback") && (
          <EventRatingSection
            formData={{
              overall_rating: formData.overall_rating,
              audience_rating: formData.audience_rating,
              organization_rating: formData.organization_rating,
              logistics_rating: formData.logistics_rating
            }}
            onFieldChange={onFieldChange}
          />
        )}
        
        <FeedbackSection
          formData={{
            additional_feedback: formData.additional_feedback
          }}
          onFieldChange={onFieldChange}
          images={images}
          onImagesChange={onImagesChange}
        />
      </TabsContent>

      <TabsContent value="media" className="space-y-4">
        <MediaUploadSection
          images={images}
          onImagesChange={onImagesChange}
        />
      </TabsContent>
    </Tabs>
  );
};
