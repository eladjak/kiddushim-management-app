import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, MapPin, Clock, AlertCircle } from "lucide-react";

interface AdminEventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  setupTime: string;
  cleanupTime: string;
  locationName: string;
  locationAddress: string;
  maxParticipants: string;
  requiredServiceGirls: number;
  requiredVolunteers: number;
  budget: string;
  specialRequirements: string;
  isPublic: boolean;
  requiresApproval: boolean;
  sendNotifications: boolean;
  priority: string;
  category: string;
  [key: string]: unknown;
}

interface AdminEventFormProps {
  onSubmit: (data: AdminEventFormData) => void;
  initialData?: Partial<AdminEventFormData>;
  isLoading?: boolean;
}

export const AdminEventForm = ({ onSubmit, initialData = {}, isLoading = false }: AdminEventFormProps) => {
  const [formData, setFormData] = React.useState({
    title: initialData.title || "",
    description: initialData.description || "",
    date: initialData.date || "",
    startTime: initialData.startTime || "",
    endTime: initialData.endTime || "",
    setupTime: initialData.setupTime || "",
    cleanupTime: initialData.cleanupTime || "",
    locationName: initialData.locationName || "",
    locationAddress: initialData.locationAddress || "",
    maxParticipants: initialData.maxParticipants || "",
    requiredServiceGirls: initialData.requiredServiceGirls || 0,
    requiredVolunteers: initialData.requiredVolunteers || 0,
    budget: initialData.budget || "",
    specialRequirements: initialData.specialRequirements || "",
    isPublic: initialData.isPublic || true,
    requiresApproval: initialData.requiresApproval || false,
    sendNotifications: initialData.sendNotifications || true,
    priority: initialData.priority || "medium",
    category: initialData.category || "kidush",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            מידע בסיסי
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">כותרת האירוע *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="שם האירוע"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">קטגוריה *</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kidush">קידושישי</SelectItem>
                  <SelectItem value="workshop">סדנה</SelectItem>
                  <SelectItem value="lecture">הרצאה</SelectItem>
                  <SelectItem value="community">אירוע קהילתי</SelectItem>
                  <SelectItem value="holiday">חג ומועד</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור האירוע</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="תיאור מפורט של האירוע..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            תזמון ולוח זמנים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">תאריך *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startTime">שעת התחלה *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">שעת סיום *</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setupTime">שעת הכנה</Label>
              <Input
                id="setupTime"
                name="setupTime"
                type="time"
                value={formData.setupTime}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cleanupTime">שעת סיום וניקיון</Label>
              <Input
                id="cleanupTime"
                name="cleanupTime"
                type="time"
                value={formData.cleanupTime}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            מיקום
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationName">שם המקום *</Label>
              <Input
                id="locationName"
                name="locationName"
                value={formData.locationName}
                onChange={handleInputChange}
                placeholder="פארק רבין"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationAddress">כתובת מלאה *</Label>
              <Input
                id="locationAddress"
                name="locationAddress"
                value={formData.locationAddress}
                onChange={handleInputChange}
                placeholder="רחוב הפלמח 15, מגדל העמק"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources & Staff */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            משאבים וכוח אדם
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">מקסימום משתתפים</Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                placeholder="100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requiredServiceGirls">בנות שירות נדרשות</Label>
              <Input
                id="requiredServiceGirls"
                name="requiredServiceGirls"
                type="number"
                value={formData.requiredServiceGirls}
                onChange={handleInputChange}
                placeholder="2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requiredVolunteers">מתנדבים נדרשים</Label>
              <Input
                id="requiredVolunteers"
                name="requiredVolunteers"
                type="number"
                value={formData.requiredVolunteers}
                onChange={handleInputChange}
                placeholder="3"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">תקציב (₪)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="1000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequirements">דרישות מיוחדות</Label>
            <Textarea
              id="specialRequirements"
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleInputChange}
              placeholder="ציוד מיוחד, הרשאות, דרישות נגישות..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            הגדרות מתקדמות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>אירוע ציבורי</Label>
                <p className="text-sm text-muted-foreground">האם האירוע מופיע ברשימה הציבורית</p>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleSwitchChange("isPublic", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>דורש אישור</Label>
                <p className="text-sm text-muted-foreground">האם נדרש אישור להשתתפות</p>
              </div>
              <Switch
                checked={formData.requiresApproval}
                onCheckedChange={(checked) => handleSwitchChange("requiresApproval", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>שלח התראות</Label>
                <p className="text-sm text-muted-foreground">שלח התראות למשתתפים</p>
              </div>
              <Switch
                checked={formData.sendNotifications}
                onCheckedChange={(checked) => handleSwitchChange("sendNotifications", checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>עדיפות</Label>
            <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">נמוכה</SelectItem>
                <SelectItem value="medium">בינונית</SelectItem>
                <SelectItem value="high">גבוהה</SelectItem>
                <SelectItem value="urgent">דחופה</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          ביטול
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "שומר..." : "שמור אירוע"}
        </Button>
      </div>
    </form>
  );
};