
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportFormData } from "@/hooks/reports/useReportFormState";

interface ParticipantsSectionProps {
  formData: ReportFormData;
  onFieldChange: (field: keyof ReportFormData, value: any) => void;
}

export const ParticipantsSection = ({ formData, onFieldChange }: ParticipantsSectionProps) => {
  console.log("ParticipantsSection - Form data received:", formData);
  
  const handleCountChange = (field: keyof ReportFormData, value: string) => {
    const numValue = parseInt(value) || 0;
    console.log(`ParticipantsSection - ${field} change:`, value, "=>", numValue);
    onFieldChange(field, numValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>פרטי משתתפים</CardTitle>
        <CardDescription>מספר המשתתפים באירוע</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="participants_count">סך הכל משתתפים *</Label>
            <Input
              id="participants_count"
              type="number"
              min="1"
              max="200"
              value={formData.participants_count || ""}
              onChange={(e) => handleCountChange("participants_count", e.target.value)}
              placeholder="מספר כולל"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="participants_kids">ילדים</Label>
            <Input
              id="participants_kids"
              type="number"
              min="0"
              max="100"
              value={formData.participants_kids || ""}
              onChange={(e) => handleCountChange("participants_kids", e.target.value)}
              placeholder="מספר ילדים"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="participants_adults">מבוגרים</Label>
            <Input
              id="participants_adults"
              type="number"
              min="0"
              max="100"
              value={formData.participants_adults || ""}
              onChange={(e) => handleCountChange("participants_adults", e.target.value)}
              placeholder="מספר מבוגרים"
            />
          </div>
        </div>
        
        {(formData.participants_count || 0) > 0 && (
          <div className="text-sm text-muted-foreground">
            סך הכל: {formData.participants_count} משתתפים
            {(formData.participants_kids || 0) > 0 && ` (כולל ${formData.participants_kids} ילדים)`}
            {(formData.participants_adults || 0) > 0 && ` (כולל ${formData.participants_adults} מבוגרים)`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
