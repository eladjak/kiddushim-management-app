
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportBasicInfo } from "../form-sections/ReportBasicInfo";
import { ParticipantsSection } from "../form-sections/ParticipantsSection";
import { EventRatingSection } from "../form-sections/EventRatingSection";
import { FeedbackSection } from "../form-sections/FeedbackSection";
import { MediaUploadSection } from "../form-sections/MediaUploadSection";
import { TzoharSection } from "../form-sections/TzoharSection";
import { ReportFormData } from "@/hooks/reports/useReportFormState";
import type { ReportEvent } from "@/hooks/reports/useReportEvents";

interface ReportFormContentProps {
  events: ReportEvent[];
  formData: ReportFormData;
  images: string[];
  currentTab: string;
  reportType: string;
  onTabChange: (tab: string) => void;
  onFieldChange: (field: keyof ReportFormData, value: string | number | boolean) => void;
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
  onImagesChange,
}: ReportFormContentProps) => {
  const isEventReport = reportType === "event_report";
  const isFeedback = reportType === "feedback";

  return (
    <div className="w-full" dir="rtl">
      <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basic" className="text-sm">פרטים בסיסיים</TabsTrigger>
          <TabsTrigger value="details" className="text-sm">פרטים נוספים</TabsTrigger>
          <TabsTrigger value="media" className="text-sm">מדיה ומשוב</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <ReportBasicInfo
            events={events}
            formData={formData}
            reportType={reportType}
            onFieldChange={onFieldChange}
          />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="space-y-6">
            <ParticipantsSection
              formData={formData}
              onFieldChange={onFieldChange}
            />
            
            {(isEventReport || isFeedback) && (
              <EventRatingSection
                formData={formData}
                onFieldChange={onFieldChange}
              />
            )}
            
            <TzoharSection
              formData={formData}
              onFieldChange={onFieldChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <div className="space-y-6">
            <MediaUploadSection
              images={images}
              onImagesChange={onImagesChange}
            />
            
            <FeedbackSection
              formData={formData}
              onFieldChange={onFieldChange}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
