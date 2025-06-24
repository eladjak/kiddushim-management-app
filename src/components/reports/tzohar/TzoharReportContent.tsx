
import { TzoharReportData } from "@/types/tzoharReportTypes";
import { ReportTitleField } from "../form-fields/ReportTitleField";
import { ReportDescriptionField } from "../form-fields/ReportDescriptionField";
import { ReportEventField } from "../form-fields/ReportEventField";
import { ReporterNameField } from "../form-fields/ReporterNameField";
import { ParticipantsCountField } from "../form-fields/ParticipantsCountField";
import { TzoharRepresentativeField } from "../form-fields/TzoharRepresentativeField";
import { FeedbackField } from "../form-fields/FeedbackField";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TzoharReportContentProps {
  events: any[];
  formData: TzoharReportData;
  onFieldChange: (field: keyof TzoharReportData, value: any) => void;
}

export const TzoharReportContent = ({ events, formData, onFieldChange }: TzoharReportContentProps) => {
  const handleEventDetailsLoad = (eventDetails: any) => {
    console.log("TzoharReportContent - Auto-filling from event details:", eventDetails);
    
    if (eventDetails.title && !formData.title) {
      onFieldChange("title", `דיווח ${eventDetails.title}`);
    }
    
    if (eventDetails.parasha && eventDetails.hebrewDate && !formData.description) {
      const basicDescription = `דיווח על אירוע קידושישי פרשת ${eventDetails.parasha} שהתקיים ב${eventDetails.hebrewDate}`;
      onFieldChange("description", basicDescription);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>פרטים בסיסיים</CardTitle>
          <CardDescription>מידע כללי על הדיווח</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReportTitleField 
            value={formData.title}
            onChange={(e) => onFieldChange("title", e.target.value)}
          />
          
          <ReportDescriptionField 
            value={formData.description}
            onChange={(e) => onFieldChange("description", e.target.value)}
          />
          
          <ReportEventField 
            value={formData.event_id || ""}
            events={events}
            onChange={(value) => onFieldChange("event_id", value)}
            onEventDetailsLoad={handleEventDetailsLoad}
          />
          
          <ReporterNameField 
            value={formData.reporter_name}
            onChange={(e) => onFieldChange("reporter_name", e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Participants Information */}
      <Card>
        <CardHeader>
          <CardTitle>פרטי משתתפים</CardTitle>
          <CardDescription>מספר המשתתפים באירוע (נדרש לצהר)</CardDescription>
        </CardHeader>
        <CardContent>
          <ParticipantsCountField
            totalParticipants={formData.participants_count}
            kidsCount={formData.participants_kids}
            adultsCount={formData.participants_adults}
            onTotalChange={(value) => onFieldChange('participants_count', value)}
            onKidsChange={(value) => onFieldChange('participants_kids', value)}
            onAdultsChange={(value) => onFieldChange('participants_adults', value)}
          />
        </CardContent>
      </Card>

      {/* Tzohar Specific Information */}
      <Card>
        <CardHeader>
          <CardTitle>מידע מיוחד לצהר</CardTitle>
          <CardDescription>שדות נדרשים לדיווח לארגון צהר</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participants_gained">
              מה המשתתפים למדו/קיבלו באירוע? *
            </Label>
            <p className="text-sm text-gray-500">
              איך המשתתפים השתלבו? איזה קשר נוצר איתם?
            </p>
            <Textarea
              id="participants_gained"
              value={formData.participants_gained}
              onChange={(e) => onFieldChange('participants_gained', e.target.value)}
              rows={4}
              placeholder="תאר בפירוט את החוויה של המשתתפים והקבלה שלהם מהאירוע..."
              required
            />
          </div>

          <TzoharRepresentativeField
            value={formData.is_tzohar_representative}
            onChange={(value) => onFieldChange('is_tzohar_representative', value)}
          />
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle>משוב על האירוע</CardTitle>
          <CardDescription>הערות לשיפור והמשך</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeedbackField
              name="what_was_good"
              label="מה היה טוב באירוע?"
              value={formData.what_was_good || ""}
              onChange={(e) => onFieldChange('what_was_good', e.target.value)}
              placeholder="תארו את הדברים החיוביים שקרו באירוע..."
            />

            <FeedbackField
              name="what_to_improve"
              label="מה ניתן לשפר?"
              value={formData.what_to_improve || ""}
              onChange={(e) => onFieldChange('what_to_improve', e.target.value)}
              placeholder="הצעות לשיפור לאירועים הבאים..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
