import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { CalendarPlus, Package, Users, Link2, Rocket } from "lucide-react";

interface GettingStartedCardProps {
  /** מנהל מערכת רואה גם את שלב ניהול המשתמשים וההרשאות */
  isAdmin: boolean;
}

/**
 * כרטיס "איך מתחילים" למנהל/רכז שנכנס למערכת ריקה.
 * מוצג רק כשאין אירועים קרובים, ונעלם מעצמו ברגע שיש אירוע.
 */
export const GettingStartedCard = ({ isAdmin }: GettingStartedCardProps) => {
  const registrationUrl = `${window.location.origin}/landing`;

  const copyRegistrationLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationUrl);
      toast({ description: "הקישור להרשמה הועתק. אפשר להדביק בקבוצת הוואטסאפ." });
    } catch {
      toast({ description: `הקישור להרשמה: ${registrationUrl}` });
    }
  };

  const steps = [
    {
      icon: CalendarPlus,
      title: "1. צרו את האירוע הראשון",
      text: "תאריך, מקום ומספר המתנדבים הנדרש. האירוע נשמר כטיוטה - אף אחד מבחוץ לא רואה אותו עדיין.",
      to: "/events",
      cta: "ליצירת אירוע",
    },
    {
      icon: Package,
      title: "2. הוסיפו ציוד",
      text: "רשמו מה יש ומה צריך לקחת לאירוע, כדי שהמתנדבים ידעו מי מביא מה.",
      to: "/equipment",
      cta: "לניהול ציוד",
    },
    ...(isAdmin
      ? [
          {
            icon: Users,
            title: "3. הזמינו את הצוות",
            text: "מתנדבים נרשמים בעצמם דרך עמוד הכניסה. כאן תקבעו מי רכז ומי מתנדב.",
            to: "/users",
            cta: "לניהול משתמשים",
          },
        ]
      : []),
  ];

  return (
    <Card className="mt-4 border-primary/30 bg-primary/5" aria-labelledby="getting-started-title">
      <CardHeader>
        <CardTitle id="getting-started-title" className="flex items-center gap-2 text-lg">
          <Rocket className="h-5 w-5 text-primary" aria-hidden="true" />
          מתחילים: {isAdmin ? "ארבעה" : "שלושה"} צעדים עד האירוע הראשון
        </CardTitle>
        <CardDescription>
          עדיין אין אירועים קרובים במערכת. הכרטיס הזה ייעלם ברגע שיהיה אירוע.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-4 md:grid-cols-2">
          {steps.map(({ icon: Icon, title, text, to, cta }) => (
            <li key={title} className="rounded-lg bg-background p-4 border">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                {title}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{text}</p>
              <Button asChild size="sm" variant="outline">
                <Link to={to}>{cta}</Link>
              </Button>
            </li>
          ))}
          <li className="rounded-lg bg-background p-4 border">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <Link2 className="h-4 w-4 text-primary" aria-hidden="true" />
              {isAdmin ? "4." : "3."} פרסמו ושתפו קישור הרשמה
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              באירוע שיצרתם לחצו "פרסם באתר" כדי שיופיע בעמוד ההרשמה הציבורי, ואז שתפו את הקישור עם הקהילה.
            </p>
            <Button size="sm" variant="outline" onClick={copyRegistrationLink}>
              העתקת קישור הרשמה
            </Button>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
};
