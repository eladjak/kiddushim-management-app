
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserRound, Users, Briefcase, CalendarClock, LucideIcon } from "lucide-react";

interface RoleCard {
  title: string;
  description: string;
  icon: LucideIcon;
  responsibilities: string[];
}

const roles: RoleCard[] = [
  {
    title: "רכז ראשי",
    description: "ניהול הפרויקט ברמה האסטרטגית",
    icon: UserRound,
    responsibilities: [
      "תיאום כללי מול צהר",
      "אישור תקציבים",
      "פיקוח והכוונה",
      "קבלת החלטות אסטרטגיות"
    ]
  },
  {
    title: "רכזי משנה",
    description: "ניהול תחומים ספציפיים בפרויקט",
    icon: Users,
    responsibilities: [
      "ניהול תחום ספציפי (תוכן/לוגיסטיקה/שיווק)",
      "הפעלת צוות מתנדבים",
      "דיווח שוטף",
      "תכנון שוטף של אירועים"
    ]
  },
  {
    title: "בנות שירות",
    description: "הפעלת הפעילויות בשטח",
    icon: CalendarClock,
    responsibilities: [
      "הפעלה בשטח",
      "קשר עם משתתפים",
      "תיעוד ודיווח",
      "הכנת חומרים ואביזרים"
    ]
  },
  {
    title: "מתנדבי נוער",
    description: "תמיכה לוגיסטית ותפעולית",
    icon: Briefcase,
    responsibilities: [
      "תמיכה בהפעלות",
      "עזרה לוגיסטית",
      "גיוס משתתפים",
      "עזרה ביצירת אווירה ומשוב"
    ]
  }
];

/**
 * Team structure component showing the organizational hierarchy and responsibilities
 */
export const TeamStructure = () => {
  return (
    <div className="space-y-6 lg:space-y-8 py-4 lg:py-6">
      <h2 className="text-3xl font-bold text-right">מבנה צוות - קידושישי 2025</h2>
      
      <p className="text-gray-600 text-right">
        פרויקט קידושישי מתבסס על מבנה צוות היררכי עם תחומי אחריות מוגדרים לכל בעל תפקיד.
        מבנה זה מאפשר ניהול יעיל של הפעילויות תוך שיתוף פעולה בין הדרגים השונים.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Card key={role.title} className="overflow-hidden">
              <CardHeader className="bg-secondary/20 pb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-primary/80 text-white">
                    <AvatarFallback>
                      <Icon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-3 text-right">{role.description}</p>
                <Separator className="my-2" />
                <h4 className="font-semibold text-sm mb-2 text-right">תחומי אחריות:</h4>
                <ul className="text-sm text-gray-600 space-y-1 rtl list-disc list-inside">
                  {role.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="bg-muted p-4 rounded-lg mt-8">
        <h3 className="font-semibold text-right mb-2">זרימת תקשורת ודיווח</h3>
        <p className="text-sm text-gray-600 text-right">
          כל בעל תפקיד מדווח לרמה הממונה עליו. מתנדבי הנוער מדווחים לבנות השירות,
          בנות השירות לרכזי המשנה, ורכזי המשנה לרכז הראשי. הרכז הראשי מתקשר ישירות עם צהר ועם השותפים האסטרטגיים.
        </p>
      </div>
    </div>
  );
};
