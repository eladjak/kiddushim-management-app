import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Heart, Clock, CheckCircle } from "lucide-react";
import { useFormState } from "@/hooks/forms/useFormState";

interface ServiceGirlFormData {
  availableDates: string[];
  preferredTimes: string[];
  specialSkills: string;
  limitations: string;
  eventRating: string;
  participantsFeedback: string;
  organizationRating: string;
  suggestions: string;
  activitiesLed: string;
  participantsCount: string;
  challengesFaced: string;
  successfulMoments: string;
  materialsUsed: string;
  notes: string;
  canHelp: boolean;
  [key: string]: unknown;
}

interface ServiceGirlFormProps {
  onSubmit: (data: ServiceGirlFormData) => void;
  initialData?: Partial<ServiceGirlFormData>;
  isLoading?: boolean;
  formType?: "availability" | "feedback" | "activity_report";
}

const getInitialState = (initialData: Partial<ServiceGirlFormData>): ServiceGirlFormData => ({
  availableDates: initialData.availableDates || [],
  preferredTimes: initialData.preferredTimes || [],
  specialSkills: initialData.specialSkills || "",
  limitations: initialData.limitations || "",
  eventRating: initialData.eventRating || "",
  participantsFeedback: initialData.participantsFeedback || "",
  organizationRating: initialData.organizationRating || "",
  suggestions: initialData.suggestions || "",
  activitiesLed: initialData.activitiesLed || "",
  participantsCount: initialData.participantsCount || "",
  challengesFaced: initialData.challengesFaced || "",
  successfulMoments: initialData.successfulMoments || "",
  materialsUsed: initialData.materialsUsed || "",
  notes: initialData.notes || "",
  canHelp: initialData.canHelp ?? true,
  ...initialData,
});

export const ServiceGirlForm = ({
  onSubmit,
  initialData = {},
  isLoading = false,
  formType = "availability",
}: ServiceGirlFormProps) => {
  const { formData, handleInputChange, handleSelectChange, handleSwitchChange } =
    useFormState<ServiceGirlFormData>(getInitialState(initialData));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderAvailabilityForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-pink-500" />
          זמינות לאירועים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>איך אני יכולה לעזור?</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-pink-50">הנחיית פעילויות</Badge>
            <Badge variant="outline" className="bg-blue-50">ליווי ילדים</Badge>
            <Badge variant="outline" className="bg-green-50">הכנות לוגיסטיות</Badge>
            <Badge variant="outline" className="bg-purple-50">צילום ותיעוד</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialSkills">כישורים מיוחדים</Label>
          <Textarea
            id="specialSkills"
            name="specialSkills"
            value={formData.specialSkills}
            onChange={handleInputChange}
            placeholder="מוזיקה, אמנות, משחקים, סיפורים..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="limitations">מגבלות או דרישות מיוחדות</Label>
          <Textarea
            id="limitations"
            name="limitations"
            value={formData.limitations}
            onChange={handleInputChange}
            placeholder="זמינות מוגבלת, בעיות בריאות, דרישות מיוחדות..."
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
          <div>
            <Label className="text-base font-medium">זמינה לעזרה</Label>
            <p className="text-sm text-muted-foreground">אני מוכנה לעזור באירועים הקרובים</p>
          </div>
          <Switch
            checked={formData.canHelp}
            onCheckedChange={(checked) => handleSwitchChange("canHelp", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderFeedbackForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          משוב על האירוע
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventRating">דירוג כללי לאירוע</Label>
            <Select value={formData.eventRating} onValueChange={(value) => handleSelectChange("eventRating", value)}>
              <SelectTrigger>
                <SelectValue placeholder="בחרי דירוג" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">מעולה</SelectItem>
                <SelectItem value="very_good">טוב מאוד</SelectItem>
                <SelectItem value="good">טוב</SelectItem>
                <SelectItem value="fair">בסדר</SelectItem>
                <SelectItem value="needs_improvement">צריך שיפור</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationRating">דירוג הארגון</Label>
            <Select value={formData.organizationRating} onValueChange={(value) => handleSelectChange("organizationRating", value)}>
              <SelectTrigger>
                <SelectValue placeholder="בחרי דירוג" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">מעולה</SelectItem>
                <SelectItem value="very_good">טוב מאוד</SelectItem>
                <SelectItem value="good">טוב</SelectItem>
                <SelectItem value="fair">בסדר</SelectItem>
                <SelectItem value="needs_improvement">צריך שיפור</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="participantsFeedback">איך הילדים והמשפחות הגיבו?</Label>
          <Textarea
            id="participantsFeedback"
            name="participantsFeedback"
            value={formData.participantsFeedback}
            onChange={handleInputChange}
            placeholder="תגובות חיוביות, בקשות מיוחדות, הערות שקיבלת..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="suggestions">הצעות לשיפור</Label>
          <Textarea
            id="suggestions"
            name="suggestions"
            value={formData.suggestions}
            onChange={handleInputChange}
            placeholder="מה אפשר לשפר באירוע הבא? רעיונות חדשים?"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderActivityReportForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          דיווח פעילות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="participantsCount">כמה משתתפים היו?</Label>
            <Input
              id="participantsCount"
              name="participantsCount"
              type="number"
              value={formData.participantsCount}
              onChange={handleInputChange}
              placeholder="מספר המשתתפים"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="materialsUsed">חומרים שהשתמשתם בהם</Label>
            <Input
              id="materialsUsed"
              name="materialsUsed"
              value={formData.materialsUsed}
              onChange={handleInputChange}
              placeholder="נייר, צבעים, משחקים..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activitiesLed">אילו פעילויות הנחיתם?</Label>
          <Textarea
            id="activitiesLed"
            name="activitiesLed"
            value={formData.activitiesLed}
            onChange={handleInputChange}
            placeholder="תארי את הפעילויות שהנחיתם..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="successfulMoments">רגעים מיוחדים או מוצלחים</Label>
          <Textarea
            id="successfulMoments"
            name="successfulMoments"
            value={formData.successfulMoments}
            onChange={handleInputChange}
            placeholder="מה עבד טוב? איזה רגעים היו מיוחדים?"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="challengesFaced">אתגרים שנתקלתם בהם</Label>
          <Textarea
            id="challengesFaced"
            name="challengesFaced"
            value={formData.challengesFaced}
            onChange={handleInputChange}
            placeholder="קשיים שהיו, דברים שלא עבדו כמתוכנן..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {formType === "availability" && renderAvailabilityForm()}
      {formType === "feedback" && renderFeedbackForm()}
      {formType === "activity_report" && renderActivityReportForm()}

      {/* Common Notes Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="notes">הערות נוספות</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="כל דבר נוסף שחשוב לכם לחלוק..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          ביטול
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-pink-500 hover:bg-pink-600">
          {isLoading ? "שולח..." : "שלח"}
        </Button>
      </div>
    </form>
  );
};
