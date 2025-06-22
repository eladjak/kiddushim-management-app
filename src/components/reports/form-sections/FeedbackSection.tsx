
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportFormData } from "@/hooks/reports/useReportFormState";

interface FeedbackSectionProps {
  formData: ReportFormData;
  onFieldChange: (field: keyof ReportFormData, value: any) => void;
}

export const FeedbackSection = ({ formData, onFieldChange }: FeedbackSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>משוב נוסף</CardTitle>
        <CardDescription>הערות נוספות לגבי האירוע</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="additional_feedback">הערות כלליות</Label>
          <Textarea
            id="additional_feedback"
            value={formData.additional_feedback || ""}
            onChange={(e) => onFieldChange("additional_feedback", e.target.value)}
            placeholder="הוסף כאן הערות נוספות לגבי האירוע..."
            rows={4}
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};
