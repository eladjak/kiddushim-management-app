import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { RoleBasedFormWrapper } from "./RoleBasedFormWrapper";
import { AdminEventForm } from "./role-specific/AdminEventForm";
import { ServiceGirlForm } from "./role-specific/ServiceGirlForm";
import { VolunteerForm } from "./role-specific/VolunteerForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Heart, 
  Users, 
  FileText,
  Calendar,
  MessageSquare,
  CheckCircle,
  UserPlus,
  Clock,
  BarChart3
} from "lucide-react";

interface RoleFormData {
  [key: string]: unknown;
}

interface RoleBasedFormSelectorProps {
  onSubmit: (data: RoleFormData) => void;
  isLoading?: boolean;
}

export const RoleBasedFormSelector = ({ onSubmit, isLoading = false }: RoleBasedFormSelectorProps) => {
  const { profile } = useAuth();
  const [selectedForm, setSelectedForm] = useState<string>("");

  // Get available forms based on user role
  const getAvailableForms = () => {
    const forms = [];

    if (profile?.role === "admin" || profile?.role === "coordinator") {
      forms.push(
        {
          id: "admin_event",
          title: "יצירת אירוע מתקדם",
          description: "טופס מלא ליצירת אירועים עם כל האפשרויות",
          icon: <Settings className="h-5 w-5" />,
          color: "bg-blue-500",
          component: AdminEventForm
        }
      );
    }

    if (profile?.role === "service_girl") {
      forms.push(
        {
          id: "service_availability",
          title: "דיווח זמינות",
          description: "דיווח על זמינות לאירועים קרובים",
          icon: <Calendar className="h-5 w-5" />,
          color: "bg-pink-500",
          component: (props: Omit<React.ComponentProps<typeof ServiceGirlForm>, 'formType'>) => <ServiceGirlForm {...props} formType="availability" />
        },
        {
          id: "service_feedback",
          title: "משוב על אירוע",
          description: "משוב לאחר השתתפות באירוע",
          icon: <MessageSquare className="h-5 w-5" />,
          color: "bg-pink-400",
          component: (props: Omit<React.ComponentProps<typeof ServiceGirlForm>, 'formType'>) => <ServiceGirlForm {...props} formType="feedback" />
        },
        {
          id: "service_report",
          title: "דיווח פעילות",
          description: "דיווח על פעילויות שהנחיתי",
          icon: <CheckCircle className="h-5 w-5" />,
          color: "bg-pink-600",
          component: (props: Omit<React.ComponentProps<typeof ServiceGirlForm>, 'formType'>) => <ServiceGirlForm {...props} formType="activity_report" />
        }
      );
    }

    if (profile?.role === "youth_volunteer") {
      forms.push(
        {
          id: "volunteer_registration",
          title: "הרשמה להתנדבות",
          description: "הרשמה ראשונית למערך ההתנדבות",
          icon: <UserPlus className="h-5 w-5" />,
          color: "bg-blue-500",
          component: (props: Omit<React.ComponentProps<typeof VolunteerForm>, 'formType'>) => <VolunteerForm {...props} formType="registration" />
        },
        {
          id: "volunteer_availability",
          title: "דיווח זמינות",
          description: "עדכון זמינות לאירועים",
          icon: <Clock className="h-5 w-5" />,
          color: "bg-blue-400",
          component: (props: Omit<React.ComponentProps<typeof VolunteerForm>, 'formType'>) => <VolunteerForm {...props} formType="availability" />
        },
        {
          id: "volunteer_experience",
          title: "דיווח חוויה",
          description: "משוב לאחר התנדבות באירוע",
          icon: <BarChart3 className="h-5 w-5" />,
          color: "bg-blue-600",
          component: (props: Omit<React.ComponentProps<typeof VolunteerForm>, 'formType'>) => <VolunteerForm {...props} formType="experience_report" />
        }
      );
    }

    return forms;
  };

  const availableForms = getAvailableForms();
  const selectedFormData = availableForms.find(form => form.id === selectedForm);

  if (availableForms.length === 0) {
    return (
      <Card className="border-muted">
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">אין טפסים זמינים</h3>
          <p className="text-muted-foreground">
            לא נמצאו טפסים מתאימים לתפקיד שלך: <strong>{profile?.role}</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!selectedForm) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">בחר טופס</h2>
          <p className="text-muted-foreground">
            בחר את הטופס המתאים לפעילות שלך
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableForms.map((form) => (
            <Card 
              key={form.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => setSelectedForm(form.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`${form.color} text-white p-2 rounded-lg`}>
                    {form.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{form.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {form.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  בחר טופס זה
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (selectedFormData) {
    const FormComponent = selectedFormData.component;
    
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${selectedFormData.color} text-white p-2 rounded-lg`}>
              {selectedFormData.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold">{selectedFormData.title}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedFormData.description}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedForm("")}
          >
            חזור לבחירה
          </Button>
        </div>

        <RoleBasedFormWrapper
          title={selectedFormData.title}
          description={selectedFormData.description}
        >
          <FormComponent onSubmit={onSubmit} isLoading={isLoading} />
        </RoleBasedFormWrapper>
      </div>
    );
  }

  return null;
};