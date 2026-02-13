
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useReportForm } from "@/hooks/reports/useReportForm";
import { TzoharReportData, tzoharReportDefaults, tzoharReportSchema } from "@/types/tzoharReportTypes";
import { TzoharReportContent } from "./TzoharReportContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TzoharReportFormProps {
  eventId?: string;
  onClose: () => void;
}

export const TzoharReportForm = ({ eventId, onClose }: TzoharReportFormProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { submitReport, events } = useReportForm();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TzoharReportData>({
    ...tzoharReportDefaults,
    event_id: eventId || "",
    reporter_name: profile?.name || "",
  });

  const handleFieldChange = (field: keyof TzoharReportData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    try {
      tzoharReportSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
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

    if (!validateForm()) {
      toast({
        variant: "destructive",
        description: "יש למלא את כל השדות הנדרשים",
      });
      return;
    }

    setLoading(true);

    try {
      await submitReport({
        values: {
          ...formData,
          severity: "medium",
          overall_rating: 5,
          audience_rating: 5,
          organization_rating: 5,
          logistics_rating: 5,
        },
        images: [],
        userId: user.id,
        reportType: "event_report"
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
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>דיווח אירוע לצהר</CardTitle>
          <CardDescription>
            טופס מותאם לדרישות הדיווח של ארגון צהר
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <TzoharReportContent
          events={events}
          formData={formData}
          onFieldChange={handleFieldChange}
        />

        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" disabled={loading || !validateForm()} className="flex-1">
            {loading ? "שולח דיווח..." : "שלח דיווח לצהר"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            ביטול
          </Button>
        </div>
      </form>
    </div>
  );
};
