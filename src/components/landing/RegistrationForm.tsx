import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import type { RegistrationFormData } from "./types";

interface RegistrationFormProps {
  formData: RegistrationFormData;
  isRegistering: boolean;
  onFormDataChange: (updater: (prev: RegistrationFormData) => RegistrationFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export const RegistrationForm = ({
  formData,
  isRegistering,
  onFormDataChange,
  onSubmit,
  onBack,
}: RegistrationFormProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 me-2" />
          חזרה
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">הרשמה לקידושישי מגדל העמק</CardTitle>
            <CardDescription className="text-blue-100">
              מלא את הפרטים ונשלח לך הזמנה לאירוע הקרוב
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">שם מלא *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => onFormDataChange(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="השם שלך"
                />
              </div>

              <div>
                <Label htmlFor="phone">טלפון *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => onFormDataChange(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  placeholder="050-1234567"
                />
              </div>

              <div>
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormDataChange(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="family_size">כמה אנשים במשפחה?</Label>
                <Input
                  id="family_size"
                  type="number"
                  min="1"
                  value={formData.family_size}
                  onChange={(e) => onFormDataChange(prev => ({ ...prev, family_size: e.target.value }))}
                  placeholder="4"
                />
              </div>

              <div>
                <Label htmlFor="children_ages">גילאי ילדים (אם יש)</Label>
                <Input
                  id="children_ages"
                  value={formData.children_ages}
                  onChange={(e) => onFormDataChange(prev => ({ ...prev, children_ages: e.target.value }))}
                  placeholder="למשל: 5, 8, 12"
                />
              </div>

              <div>
                <Label htmlFor="comments">הערות או בקשות מיוחדות</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => onFormDataChange(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="כל דבר שחשוב לנו לדעת..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                disabled={isRegistering}
              >
                {isRegistering ? "נרשם..." : "הרשם עכשיו"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
