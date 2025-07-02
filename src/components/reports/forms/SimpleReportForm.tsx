import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RTLLayout } from "@/components/ui/rtl-layout";
import { useAuth } from "@/context/AuthContext";

interface SimpleReportFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SimpleReportForm = ({ onSuccess, onCancel }: SimpleReportFormProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: "event_report" | "feedback" | "issue";
    reporter_name: string;
  }>({
    title: "",
    description: "",
    type: "event_report",
    reporter_name: profile?.name || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.title.trim() || !formData.description.trim()) {
        toast({
          title: "שגיאה",
          description: "יש למלא את כל השדות הנדרשים",
          variant: "destructive"
        });
        return;
      }

      // Simulate submission - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "הצלחה!",
        description: "הדיווח נשלח בהצלחה",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "event_report",
        reporter_name: profile?.name || ""
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שליחת הדיווח נכשלה. אנא נסה שוב.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RTLLayout>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>דיווח מהיר</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Report Type */}
            <div className="space-y-2">
              <Label htmlFor="type">סוג הדיווח</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: "event_report" | "feedback" | "issue") => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event_report">דיווח אירוע</SelectItem>
                  <SelectItem value="feedback">משוב</SelectItem>
                  <SelectItem value="issue">תקלה</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">כותרת הדיווח *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="תן כותרת קצרה ומתארת לדיווח"
                required
              />
            </div>

            {/* Reporter Name */}
            <div className="space-y-2">
              <Label htmlFor="reporter">שם המדווח *</Label>
              <Input
                id="reporter"
                value={formData.reporter_name}
                onChange={(e) => setFormData(prev => ({ ...prev, reporter_name: e.target.value }))}
                placeholder="שמך המלא"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">תיאור הדיווח *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="תאר בפירוט את מה שרצית לדווח..."
                rows={4}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                ביטול
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "שולח..." : "שלח דיווח"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </RTLLayout>
  );
};