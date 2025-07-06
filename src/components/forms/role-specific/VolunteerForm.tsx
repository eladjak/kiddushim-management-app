import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Users, Star, Zap, Calendar } from "lucide-react";

interface VolunteerFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
  formType?: "registration" | "availability" | "experience_report";
}

export const VolunteerForm = ({ 
  onSubmit, 
  initialData = {}, 
  isLoading = false,
  formType = "registration"
}: VolunteerFormProps) => {
  const [formData, setFormData] = React.useState({
    // Registration fields
    age: initialData.age || "",
    school: initialData.school || "",
    interests: initialData.interests || [],
    experience: initialData.experience || "",
    
    // Availability fields
    availableDays: initialData.availableDays || [],
    preferredTasks: initialData.preferredTasks || [],
    canLead: initialData.canLead || false,
    
    // Experience report fields
    tasksCompleted: initialData.tasksCompleted || "",
    helpfulnessFeedback: initialData.helpfulnessFeedback || "",
    learningExperience: initialData.learningExperience || "",
    recommendToFriends: initialData.recommendToFriends || "",
    
    // Common fields
    notes: initialData.notes || "",
    excited: initialData.excited || true,
    ...initialData
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...(prev[name] || []), value]
        : (prev[name] || []).filter((item: string) => item !== value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderRegistrationForm = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            הרשמה להתנדבות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">גיל</Label>
              <Select value={formData.age} onValueChange={(value) => handleSelectChange("age", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר גיל" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="13-14">13-14</SelectItem>
                  <SelectItem value="15-16">15-16</SelectItem>
                  <SelectItem value="17-18">17-18</SelectItem>
                  <SelectItem value="19-20">19-20</SelectItem>
                  <SelectItem value="21+">21+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">בית ספר / מסגרת</Label>
              <Input
                id="school"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                placeholder="שם בית הספר או המסגרת"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>תחומי עניין (בחר כמה שרוצה)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "מוזיקה", "ספורט", "אמנות", "טכנולוgiה", 
                "בישול", "משחקים", "צילום", "כתיבה", "תיאטרון"
              ].map((interest) => (
                <div key={interest} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={interest}
                    checked={formData.interests.includes(interest)}
                    onCheckedChange={(checked) => handleCheckboxChange("interests", interest, !!checked)}
                  />
                  <Label htmlFor={interest} className="text-sm">{interest}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">ניסיון קודם בהתנדבות</Label>
            <Textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              placeholder="ספר על ניסיון קודם בהתנדבות או עבודה עם ילדים..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderAvailabilityForm = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-500" />
            זמינות להתנדבות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>איזה ימים אתה זמין? (בחר כמה שרוצה)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map((day) => (
                <div key={day} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={day}
                    checked={formData.availableDays.includes(day)}
                    onCheckedChange={(checked) => handleCheckboxChange("availableDays", day, !!checked)}
                  />
                  <Label htmlFor={day} className="text-sm">{day}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>איזה סוג עזרה אתה מעדיף?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "הכנות לפני האירוע", "עזרה במהלך האירוע", 
                "ליווי ילדים", "הפעלה ומשחקים",
                "עזרה טכנית", "צילום ותיעוד",
                "ניקיון אחרי האירוע", "הובלת ציוד"
              ].map((task) => (
                <div key={task} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={task}
                    checked={formData.preferredTasks.includes(task)}
                    onCheckedChange={(checked) => handleCheckboxChange("preferredTasks", task, !!checked)}
                  />
                  <Label htmlFor={task} className="text-sm">{task}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <Label className="text-base font-medium">מוכן להוביל פעילות</Label>
              <p className="text-sm text-muted-foreground">אני מוכן לקחת אחריות על פעילות או קבוצה</p>
            </div>
            <Switch
              checked={formData.canLead}
              onCheckedChange={(checked) => handleSwitchChange("canLead", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderExperienceReportForm = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            דיווח על ההתנדבות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tasksCompleted">מה עשיתי באירוע?</Label>
            <Textarea
              id="tasksCompleted"
              name="tasksCompleted"
              value={formData.tasksCompleted}
              onChange={handleInputChange}
              placeholder="תאר את המשימות שביצעת והפעילויות שהשתתפת בהן..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="helpfulnessFeedback">איך הרגשתי שעזרתי?</Label>
            <Select value={formData.helpfulnessFeedback} onValueChange={(value) => handleSelectChange("helpfulnessFeedback", value)}>
              <SelectTrigger>
                <SelectValue placeholder="בחר איך הרגשת" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_helpful">עזרתי הרבה וזה היה נהדר! 🌟</SelectItem>
                <SelectItem value="helpful">עזרתי וזה היה טוב 😊</SelectItem>
                <SelectItem value="somewhat_helpful">עזרתי קצת 🙂</SelectItem>
                <SelectItem value="not_sure">לא בטוח כמה עזרתי 🤔</SelectItem>
                <SelectItem value="could_help_more">יכולתי לעזור יותר 😕</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningExperience">מה למדתי מההתנדבות?</Label>
            <Textarea
              id="learningExperience"
              name="learningExperience"
              value={formData.learningExperience}
              onChange={handleInputChange}
              placeholder="כישורים חדשים, תובנות, דברים מעניינים שגיליתי..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendToFriends">האם הייתי ממליץ לחברים להתנדב?</Label>
            <Select value={formData.recommendToFriends} onValueChange={(value) => handleSelectChange("recommendToFriends", value)}>
              <SelectTrigger>
                <SelectValue placeholder="בחר תשובה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="definitely">בהחלט! זה היה מדהים 🎉</SelectItem>
                <SelectItem value="probably">כנראה שכן, זה היה טוב 👍</SelectItem>
                <SelectItem value="maybe">אולי, תלוי בחבר 🤷‍♂️</SelectItem>
                <SelectItem value="probably_not">כנראה שלא 👎</SelectItem>
                <SelectItem value="definitely_not">בהחלט לא 😞</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {formType === "registration" && renderRegistrationForm()}
      {formType === "availability" && renderAvailabilityForm()}
      {formType === "experience_report" && renderExperienceReportForm()}
      
      {/* Common Excitement Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                אני מתרגש מההתנדבות!
              </Label>
              <p className="text-sm text-muted-foreground">זה עוזר לנו להבין את המוטיבציה שלך</p>
            </div>
            <Switch
              checked={formData.excited}
              onCheckedChange={(checked) => handleSwitchChange("excited", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Common Notes Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="notes">עוד משהו שחשוב לנו לדעת?</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="רעיונות, שאלות, או כל דבר אחר שחשוב לך לחלוק..."
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
        <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
          {isLoading ? "שולח..." : "שלח"}
        </Button>
      </div>
    </form>
  );
};