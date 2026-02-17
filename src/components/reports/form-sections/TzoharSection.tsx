
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportFormData } from "@/hooks/reports/useReportFormState";

interface TzoharSectionProps {
  formData: ReportFormData;
  onFieldChange: (field: keyof ReportFormData, value: string | number | boolean) => void;
}

export const TzoharSection = ({ formData, onFieldChange }: TzoharSectionProps) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>פרטים לארגון צהר</CardTitle>
        <CardDescription>מידע נדרש לדיווח לארגון צהר</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="participants_gained">מה המשתתפים למדו/קיבלו באירוע? *</Label>
          <Textarea
            id="participants_gained"
            value={formData.participants_gained || ""}
            onChange={(e) => {
              onFieldChange("participants_gained", e.target.value);
            }}
            placeholder="תאר בקצרה מה המשתתפים למדו, חוו או קיבלו מהאירוע..."
            rows={3}
            className="resize-none"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_tzohar_representative"
            checked={formData.is_tzohar_representative || false}
            onCheckedChange={(checked) => {
              onFieldChange("is_tzohar_representative", checked);
            }}
          />
          <Label htmlFor="is_tzohar_representative" className="text-sm">
            אני נציג מטעם ארגון צהר
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
