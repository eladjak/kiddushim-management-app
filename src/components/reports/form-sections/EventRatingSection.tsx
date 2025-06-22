
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportFormData } from "@/hooks/reports/useReportFormState";

interface EventRatingSectionProps {
  formData: ReportFormData;
  onFieldChange: (field: keyof ReportFormData, value: any) => void;
}

export const EventRatingSection = ({ formData, onFieldChange }: EventRatingSectionProps) => {
  const handleRatingChange = (field: keyof ReportFormData, values: number[]) => {
    onFieldChange(field, values[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>דירוג האירוע</CardTitle>
        <CardDescription>דרג את האירוע בקטגוריות שונות</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="overall_rating">
            דירוג כללי ({formData.overall_rating || 5})
          </Label>
          <Slider 
            id="overall_rating"
            min={1} 
            max={10} 
            step={1}
            value={[formData.overall_rating || 5]} 
            onValueChange={(values) => handleRatingChange("overall_rating", values)}
            className="pt-2" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience_rating">
            חווית הקהל ({formData.audience_rating || 5})
          </Label>
          <Slider 
            id="audience_rating"
            min={1} 
            max={10} 
            step={1}
            value={[formData.audience_rating || 5]} 
            onValueChange={(values) => handleRatingChange("audience_rating", values)}
            className="pt-2" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization_rating">
            רמת הארגון ({formData.organization_rating || 5})
          </Label>
          <Slider 
            id="organization_rating"
            min={1} 
            max={10} 
            step={1}
            value={[formData.organization_rating || 5]} 
            onValueChange={(values) => handleRatingChange("organization_rating", values)}
            className="pt-2" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logistics_rating">
            לוגיסטיקה ({formData.logistics_rating || 5})
          </Label>
          <Slider 
            id="logistics_rating"
            min={1} 
            max={10} 
            step={1}
            value={[formData.logistics_rating || 5]} 
            onValueChange={(values) => handleRatingChange("logistics_rating", values)}
            className="pt-2" 
          />
        </div>
      </CardContent>
    </Card>
  );
};
