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
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-gray-100 transition-colors duration-200"
          aria-label="חזרה לעמוד הראשי"
        >
          <ArrowLeft className="h-4 w-4 me-2" />
          חזרה
        </Button>

        <Card className="shadow-2xl rounded-2xl border border-gray-100 overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-8">
            <CardTitle className="text-2xl">הרשמה לקידושישי מגדל העמק</CardTitle>
            <CardDescription className="text-blue-100 text-base">
              מלא את הפרטים ונשלח לך הזמנה לאירוע הקרוב
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Personal Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">שם מלא *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => onFormDataChange(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="השם שלך"
                    className="mt-1.5 focus:ring-2 focus:ring-blue-500/30 transition-shadow duration-200"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">טלפון *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => onFormDataChange(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder="050-1234567"
                    className="mt-1.5 focus:ring-2 focus:ring-blue-500/30 transition-shadow duration-200"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => onFormDataChange(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="mt-1.5 focus:ring-2 focus:ring-blue-500/30 transition-shadow duration-200"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Family Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="family_size" className="text-sm font-medium text-gray-700">כמה אנשים במשפחה?</Label>
                  <Input
                    id="family_size"
                    type="number"
                    min="1"
                    value={formData.family_size}
                    onChange={(e) => onFormDataChange(prev => ({ ...prev, family_size: e.target.value }))}
                    placeholder="4"
                    className="mt-1.5 focus:ring-2 focus:ring-blue-500/30 transition-shadow duration-200"
                  />
                </div>

                <div>
                  <Label htmlFor="children_ages" className="text-sm font-medium text-gray-700">גילאי ילדים (אם יש)</Label>
                  <Input
                    id="children_ages"
                    value={formData.children_ages}
                    onChange={(e) => onFormDataChange(prev => ({ ...prev, children_ages: e.target.value }))}
                    placeholder="למשל: 5, 8, 12"
                    className="mt-1.5 focus:ring-2 focus:ring-blue-500/30 transition-shadow duration-200"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Additional Info */}
              <div>
                <Label htmlFor="comments" className="text-sm font-medium text-gray-700">הערות או בקשות מיוחדות</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => onFormDataChange(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="כל דבר שחשוב לנו לדעת..."
                  rows={3}
                  className="mt-1.5 focus:ring-2 focus:ring-blue-500/30 transition-shadow duration-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-lg bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30"
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
