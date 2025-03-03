
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BriefcaseIcon, CalendarIcon, UsersIcon } from "lucide-react";

/**
 * Project overview component displaying summary information about the project
 */
export const ProjectOverview = () => {
  return (
    <div className="space-y-6 lg:space-y-8 py-4 lg:py-6">
      <h1 className="text-3xl font-bold text-right">סקירת פרויקט - קידושישי 2025</h1>
      
      <Alert className="bg-primary/20 border-primary/30">
        <AlertTitle className="text-right text-lg font-semibold">חזון הפרויקט</AlertTitle>
        <AlertDescription className="text-right">
          יצירת מסורת קהילתית מאחדת של קבלות שבת במגדל העמק, המחברת בין כל חלקי האוכלוסייה 
          דרך חוויה משותפת של קדושת השבת, מוזיקה, לימוד ויצירה.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">מועדים</h3>
          </div>
          <p className="text-sm text-gray-600">15-20 מפגשי קידושישי לאורך השנה</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">יעד משתתפים</h3>
          </div>
          <p className="text-sm text-gray-600">קהל יעד קבוע של 100+ משתתפים בכל אירוע</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BriefcaseIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">תקציב</h3>
          </div>
          <p className="text-sm text-gray-600">מימון של 1,000 ₪ לכל מפגש מארגון צהר</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-3 text-right">שותפים מרכזיים</h3>
          <ul className="list-disc list-inside rtl text-right space-y-1 text-gray-600">
            <li>ארגון צהר - מימון ותמיכה</li>
            <li>הגרעין התורני מגדל העמק - שותף מרכזי בהפעלה</li>
            <li>יאיר גרינר - מנכ"ל הגרעין התורני, שותף אסטרטגי</li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-3 text-right">יעדים מרכזיים</h3>
          <ul className="list-disc list-inside rtl text-right space-y-1 text-gray-600">
            <li>קיום 15-20 מפגשי קידושישי לאורך השנה</li>
            <li>הגעה לקהל יעד קבוע של 100+ משתתפים בכל אירוע</li>
            <li>יצירת מערך תומך של מתנדבים ושותפים קהילתיים</li>
            <li>בניית מותג מוכר ואהוב בקהילה</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
