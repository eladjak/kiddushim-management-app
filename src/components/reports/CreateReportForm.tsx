
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useReportForm } from "@/hooks/reports/useReportForm";
import { ParticipantsCountField } from "./form-fields/ParticipantsCountField";
import { TzoharRepresentativeField } from "./form-fields/TzoharRepresentativeField";
import { ReportTitleField } from "./form-fields/ReportTitleField";
import { ReportDescriptionField } from "./form-fields/ReportDescriptionField";
import { ReporterNameField } from "./form-fields/ReporterNameField";
import { ReportEventField } from "./form-fields/ReportEventField";
import { FeedbackField } from "./form-fields/FeedbackField";
import { Button } from "@/components/ui/button";

interface CreateReportFormProps {
  eventId: string;
  reportType: string;
  onClose: () => void;
}

export const CreateReportForm = ({ eventId, reportType, onClose }: CreateReportFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { submitReport, events } = useReportForm();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reporter_name: "",
    participants_count: 50,
    participants_kids: 20,
    participants_adults: 80,
    location_other: "",
    participants_gained: "",
    what_was_good: "",
    what_to_improve: "",
    is_tzohar_representative: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
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
      // Validation for Tzohar requirements
      if (!formData.title || !formData.description || !formData.reporter_name) {
        throw new Error("יש למלא את כל השדות הנדרשים");
      }

      if (!formData.participants_gained) {
        throw new Error("יש לתאר מה המשתתפים למדו/קיבלו מהאירוע");
      }

      await submitReport({
        values: {
          ...formData,
          event_id: eventId || undefined,
          severity: "medium",
          overall_rating: 5,
          audience_rating: 5,
          organization_rating: 5,
          logistics_rating: 5,
        },
        images: [],
        userId: user.id,
        reportType
      });

      toast({
        description: "הדיווח לצהר נוצר בהצלחה!",
      });

      onClose();
      navigate("/reports");
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "אירעה שגיאה ביצירת הדיווח",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-lg mb-2">דיווח אירוע לצהר</h3>
        <p className="text-sm text-gray-600">
          טופס זה מותאם לדרישות הדיווח של ארגון צהר
        </p>
      </div>

      <ReportTitleField 
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
      />

      <ReportDescriptionField 
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
      />

      <ReporterNameField 
        value={formData.reporter_name}
        onChange={(e) => handleChange('reporter_name', e.target.value)}
      />

      <ReportEventField 
        value={eventId}
        events={events}
        onChange={(value) => handleChange('event_id', value)}
      />

      <ParticipantsCountField
        totalParticipants={formData.participants_count}
        kidsCount={formData.participants_kids}
        adultsCount={formData.participants_adults}
        onTotalChange={(value) => handleChange('participants_count', value)}
        onKidsChange={(value) => handleChange('participants_kids', value)}
        onAdultsChange={(value) => handleChange('participants_adults', value)}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">
          מה להערכתך קיבלו המשתתפים שהיו באירוע? *
        </label>
        <p className="text-sm text-gray-500">
          איזה פרטו האם יצירתם איתם קשר, כיצד לדעתכם הם השתלבו?
        </p>
        <textarea
          value={formData.participants_gained}
          onChange={(e) => handleChange('participants_gained', e.target.value)}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="כאן תגיעו תיאור החוויה והקבלה מהמשתתפים..."
          required
        />
      </div>

      <TzoharRepresentativeField
        value={formData.is_tzohar_representative}
        onChange={(value) => handleChange('is_tzohar_representative', value)}
      />

      <FeedbackField
        label="מה היה טוב באירוע?"
        value={formData.what_was_good}
        onChange={(e) => handleChange('what_was_good', e.target.value)}
        placeholder="תארו את הדברים החיוביים שקרו באירוע..."
      />

      <FeedbackField
        label="מה ניתן לשפר?"
        value={formData.what_to_improve}
        onChange={(e) => handleChange('what_to_improve', e.target.value)}
        placeholder="הצעות לשיפור לאירועים הבאים..."
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "שולח דיווח..." : "שלח דיווח לצהר"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          ביטול
        </Button>
      </div>
    </form>
  );
};
