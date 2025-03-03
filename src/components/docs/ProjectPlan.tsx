
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ProjectPlan = () => {
  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <Card className="mb-8">
        <CardHeader className="bg-primary/10 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">תוכנית עבודה - קידושישי 2025</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full mb-6 grid grid-cols-1 md:grid-cols-4">
              <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
              <TabsTrigger value="schedule">לוח זמנים</TabsTrigger>
              <TabsTrigger value="management">מבנה ניהולי</TabsTrigger>
              <TabsTrigger value="app">אפליקציה</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">חזון הפרויקט</h3>
                <p className="text-muted-foreground">
                  יצירת מסורת קהילתית מאחדת של קבלות שבת במגדל העמק, המחברת בין כל חלקי האוכלוסייה דרך 
                  חוויה משותפת של קדושת השבת, מוזיקה, לימוד ויצירה.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">שותפים ומימון</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>ארגון צהר - מימון של 1,000 ₪ לכל מפגש</li>
                  <li>מינימום 30 משתתפים נדרש לכל אירוע</li>
                  <li>הגרעין התורני מגדל העמק - שותף מרכזי בהפעלה</li>
                  <li>יאיר גרינר - מנכ"ל הגרעין התורני, שותף אסטרטגי</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">יעדים מרכזיים</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>קיום 20 מפגשי קידושישי לאורך השנה</li>
                  <li>הגעה לקהל יעד קבוע של 100+ משתתפים בכל אירוע</li>
                  <li>יצירת מערך תומך של מתנדבים ושותפים קהילתיים</li>
                  <li>בניית מותג מוכר ואהוב בקהילה</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">שלבי הפרויקט</h3>
                <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
                  <li className="font-medium">שלב ההכנה (שבט-אדר 2025)
                    <ul className="list-disc list-inside mr-6 mt-2 font-normal">
                      <li>הקמת צוות מוביל</li>
                      <li>גיוס שותפים ומתנדבים</li>
                      <li>תכנון תוכן שנתי</li>
                      <li>בניית תקציב ותוכנית לוגיסטית</li>
                    </ul>
                  </li>
                  <li className="font-medium">שלב היח"צ והגיוס (אדר-ניסן 2025)
                    <ul className="list-disc list-inside mr-6 mt-2 font-normal">
                      <li>ביקורים בבתי ספר וגני ילדים</li>
                      <li>הפעלת קבלות שבת מקדימות</li>
                      <li>בניית נוכחות במדיה החברתית</li>
                      <li>גיוס תקציבים ושותפים</li>
                    </ul>
                  </li>
                  <li className="font-medium">שלב ההפעלה (אייר 2025 ואילך)
                    <ul className="list-disc list-inside mr-6 mt-2 font-normal">
                      <li>הפעלת האירועים בתדירות של אחת לשבועיים/שלושה</li>
                      <li>מעקב והערכה שוטפים</li>
                      <li>התאמות ושיפורים מתמשכים</li>
                    </ul>
                  </li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">מודל גמיש - פעילויות</h3>
                <div className="border rounded-lg p-4 bg-secondary/20">
                  <h4 className="font-medium mb-2">מבנה בסיסי (45-90 דקות)</h4>
                  <ul className="list-none space-y-3">
                    <li><span className="font-medium">פתיחה מהירה (5-10 דק'):</span> התחלה "מהאמצע" - היישר לפעילות, אנרגיה גבוהה</li>
                    <li><span className="font-medium">גוף הפעילות (30-60 דק'):</span> מודולרי ומותאם לקהל, אפשרות למעבר בין תחנות</li>
                    <li><span className="font-medium">סיום משמעותי (10-20 דק'):</span> חיבור לשבת/פרשה, "טעימה" למפגש הבא</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="management" className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">מבנה הצוות וחלוקת אחריות</h3>
                <div className="space-y-4">
                  <div className="border-r-4 border-primary pr-4">
                    <h4 className="font-medium">רכז ראשי</h4>
                    <p className="text-sm text-muted-foreground">תיאום כללי מול צהר, אישור תקציבים, פיקוח והכוונה, קבלת החלטות אסטרטגיות</p>
                  </div>
                  
                  <div className="border-r-4 border-accent pr-4">
                    <h4 className="font-medium">רכזי משנה</h4>
                    <p className="text-sm text-muted-foreground">ניהול תחום ספציפי (תוכן/לוגיסטיקה/שיווק), הפעלת צוות מתנדבים, דיווח שוטף</p>
                  </div>
                  
                  <div className="border-r-4 border-secondary pr-4">
                    <h4 className="font-medium">בנות שירות</h4>
                    <p className="text-sm text-muted-foreground">הפעלה בשטח, קשר עם משתתפים, תיעוד ודיווח</p>
                  </div>
                  
                  <div className="border-r-4 border-muted pr-4">
                    <h4 className="font-medium">מתנדבי נוער</h4>
                    <p className="text-sm text-muted-foreground">תמיכה בהפעלות, עזרה לוגיסטית, גיוס משתתפים</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">מעגלי אחריות והעצמה</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <h4 className="font-medium text-center mb-2">מעגל ראשון - צוות מוביל</h4>
                    <ul className="list-disc list-inside text-sm">
                      <li>השתתפות בתכנון</li>
                      <li>קבלת החלטות משותפת</li>
                      <li>הובלת תחומים</li>
                    </ul>
                  </div>
                  
                  <div className="bg-secondary/20 rounded-lg p-4">
                    <h4 className="font-medium text-center mb-2">מעגל שני - מפעילים</h4>
                    <ul className="list-disc list-inside text-sm">
                      <li>אחריות על חלק מוגדר</li>
                      <li>יוזמה בתחום</li>
                      <li>דיווח לרכז הרלוונטי</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h4 className="font-medium text-center mb-2">מעגל שלישי - תומכים</h4>
                    <ul className="list-disc list-inside text-sm">
                      <li>ביצוע משימות מוגדרות</li>
                      <li>השתתפות בתדריכים</li>
                      <li>משוב ולקחים</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="app" className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">אפיון אפליקציית קידושישי</h3>
                <p className="text-muted-foreground mb-4">
                  אפליקציית קידושישי 2025 נועדה לשמש ככלי ניהול מרכזי עבור פרויקט קידושישי במגדל העמק. 
                  האפליקציה תאפשר ניהול יעיל של האירועים, המשתתפים, והמשאבים, תוך מתן גישה מותאמת לבעלי תפקידים שונים בפרויקט.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">מבנה האפליקציה</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-primary mb-2">ניהול אירועים</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li>יצירה ועריכה של אירועים</li>
                      <li>צפייה בפרטי אירוע (מיקום, זמן, תוכן)</li>
                      <li>רשימת משתתפים ורישום</li>
                      <li>צ'קליסט הכנות לאירוע</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-primary mb-2">ניהול משתמשים</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li>הוספה ועריכה של משתמשים</li>
                      <li>הגדרת הרשאות גישה</li>
                      <li>צפייה בפעילות משתמשים</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-primary mb-2">ניהול משאבים</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li>מעקב אחר ציוד ומשאבים</li>
                      <li>הזמנת ציוד לאירועים</li>
                      <li>ניהול תקציב</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-primary mb-2">דיווחים ומשובים</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li>טפסי דיווח לאחר אירוע</li>
                      <li>טפסי משוב למשתתפים</li>
                      <li>הפקת דו"חות לצהר</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">שלבי פיתוח מוצעים</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>אפיון מפורט ועיצוב UX/UI</li>
                  <li>פיתוח גרסת בטא עם פונקציונליות בסיסית</li>
                  <li>בדיקות משתמשים ואיסוף משוב</li>
                  <li>פיתוח פונקציונליות מלאה</li>
                  <li>בדיקות QA ותיקון באגים</li>
                  <li>השקה ותמיכה שוטפת</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
