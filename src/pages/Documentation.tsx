
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectPlan } from "@/components/docs/ProjectPlan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Terminal, Layers, Users, Calendar, Database } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

/**
 * Documentation page showing project plan information in both English and Hebrew
 */
const Documentation = () => {
  const [language, setLanguage] = useState<"he" | "en">("he");

  return (
    <div className="min-h-screen bg-secondary/10 flex flex-col">
      <main className="pt-6 pb-12 container max-w-6xl mx-auto flex-grow px-4">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <CardTitle>
                {language === "he" ? "תיעוד מערכת ניהול קידושישי" : "KidushiShi Management System Documentation"}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === "he" ? "en" : "he")}
              >
                {language === "he" ? "Switch to English" : "עבור לעברית"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4" dir={language === "he" ? "rtl" : "ltr"}>
          <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto">
            <TabsTrigger value="overview" className="py-2 flex gap-2 items-center">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{language === "he" ? "סקירה" : "Overview"}</span>
            </TabsTrigger>
            <TabsTrigger value="architecture" className="py-2 flex gap-2 items-center">
              <Layers className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{language === "he" ? "ארכיטקטורה" : "Architecture"}</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="py-2 flex gap-2 items-center">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{language === "he" ? "אירועים" : "Events"}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="py-2 flex gap-2 items-center">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{language === "he" ? "משתמשים" : "Users"}</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="py-2 flex gap-2 items-center">
              <Database className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{language === "he" ? "מסד נתונים" : "Database"}</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="py-2 flex gap-2 items-center">
              <Terminal className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">API</span>
            </TabsTrigger>
          </TabsList>
          
          <DocumentationContent language={language} />
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

interface DocContentProps {
  language: "he" | "en";
}

const DocumentationContent = ({ language }: DocContentProps) => {
  return (
    <>
      <TabsContent value="overview" className="space-y-4">
        {language === "he" ? <ProjectOverviewHebrew /> : <ProjectOverviewEnglish />}
      </TabsContent>
      
      <TabsContent value="architecture" className="space-y-4">
        {language === "he" ? <ArchitectureDocsHebrew /> : <ArchitectureDocsEnglish />}
      </TabsContent>
      
      <TabsContent value="events" className="space-y-4">
        {language === "he" ? <EventsDocsHebrew /> : <EventsDocsEnglish />}
      </TabsContent>
      
      <TabsContent value="users" className="space-y-4">
        {language === "he" ? <UsersDocsHebrew /> : <UsersDocsEnglish />}
      </TabsContent>
      
      <TabsContent value="database" className="space-y-4">
        {language === "he" ? <DatabaseDocsHebrew /> : <DatabaseDocsEnglish />}
      </TabsContent>
      
      <TabsContent value="api" className="space-y-4">
        {language === "he" ? <ApiDocsHebrew /> : <ApiDocsEnglish />}
      </TabsContent>
    </>
  );
};

// Project Overview Documentation Components
const ProjectOverviewHebrew = () => (
  <Card>
    <CardHeader>
      <CardTitle>סקירת הפרויקט</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">מהות הפרויקט</h3>
        <p>
          קידושישי הוא מיזם קהילתי המיועד ליצור מסורת של קבלות שבת משותפות ומאחדות במגדל העמק. 
          המיזם נתמך על ידי ארגון 'צהר' והגרעין התורני מגדל העמק, ומטרתו לחבר בין כל חלקי האוכלוסייה 
          דרך חוויה משותפת של קדושת השבת, מוזיקה, לימוד ויצירה.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">חזון</h3>
        <p>
          יצירת מסורת קהילתית מאחדת של קבלות שבת במגדל העמק, המחברת בין כל חלקי האוכלוסייה 
          דרך חוויה משותפת של קדושת השבת, מוזיקה, לימוד ויצירה, תוך יצירת מרחב מכבד ומותאם לכולם.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">ערכי ליבה</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>חיבור קהילתי</strong>: יצירת גשרים בין קהילות וקבוצות שונות בעיר</li>
          <li><strong>נגישות למסורת</strong>: הנגשת ערכי השבת באופן מכבד ומותאם לכל הרקעים</li>
          <li><strong>יצירה משותפת</strong>: בניית חוויה שבה כל אחד יכול לתרום ולהשתתף</li>
          <li><strong>שמחה ואחדות</strong>: דגש על אווירה חיובית ומאחדת</li>
          <li><strong>העצמת צעירים</strong>: שילוב בני נוער ובנות שירות כמובילים בקהילה</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

const ProjectOverviewEnglish = () => (
  <Card>
    <CardHeader>
      <CardTitle>Project Overview</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">Project Essence</h3>
        <p>
          KidushiShi is a community initiative designed to create a tradition of united Shabbat receptions in Migdal HaEmek.
          The project is supported by the 'Tzohar' organization and the Torah nucleus of Migdal HaEmek, and aims to connect
          all parts of the population through a shared experience of Shabbat sanctity, music, learning, and creation.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">Vision</h3>
        <p>
          Creating a unifying community tradition of Shabbat receptions in Migdal HaEmek, connecting all segments of the population
          through a shared experience of Shabbat sanctity, music, learning, and creation, while creating a respectful space suitable for everyone.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">Core Values</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Community Connection</strong>: Creating bridges between different communities and groups in the city</li>
          <li><strong>Tradition Accessibility</strong>: Making Shabbat values accessible in a respectful manner suitable for all backgrounds</li>
          <li><strong>Collaborative Creation</strong>: Building an experience where everyone can contribute and participate</li>
          <li><strong>Joy and Unity</strong>: Emphasis on a positive and unifying atmosphere</li>
          <li><strong>Youth Empowerment</strong>: Integrating youth and National Service girls as community leaders</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

// Architecture Documentation Components
const ArchitectureDocsHebrew = () => (
  <Card>
    <CardHeader>
      <CardTitle>ארכיטקטורת המערכת</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">מבנה כללי</h3>
        <p>
          המערכת בנויה כאפליקציית דפדפן חד-דפית (SPA) המבוססת על React וTypescript. 
          הצד הקדמי מתקשר עם שירותי Supabase לניהול אימות, אחסון ומסד נתונים.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">רכיבים מרכזיים</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>AuthContext</strong>: ניהול אימות המשתמש ומידע הפרופיל</li>
          <li><strong>React Router</strong>: ניהול ניתוב וניווט באפליקציה</li>
          <li><strong>Tailwind CSS</strong>: מסגרת עיצוב לממשק משתמש מותאם אישית</li>
          <li><strong>Shadcn</strong>: רכיבי ממשק מוכנים מראש לשימוש חוזר</li>
          <li><strong>React Query</strong>: ניהול מצב ושליפת נתונים</li>
          <li><strong>Supabase</strong>: שירותי בסיס נתונים, אימות ואחסון</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">תצורת הפרויקט</h3>
        <p>
          הפרויקט מאורגן לפי תיקיות תפקודיות:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>components</strong>: רכיבי React לשימוש בממשק</li>
          <li><strong>context</strong>: ניהול מצב גלובלי באפליקציה</li>
          <li><strong>hooks</strong>: לוגיקה משותפת לשימוש חוזר</li>
          <li><strong>pages</strong>: דפים ראשיים באפליקציה</li>
          <li><strong>utils</strong>: פונקציות עזר</li>
          <li><strong>integrations</strong>: שילוב עם שירותים חיצוניים כמו Supabase</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

const ArchitectureDocsEnglish = () => (
  <Card>
    <CardHeader>
      <CardTitle>System Architecture</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">General Structure</h3>
        <p>
          The system is built as a Single Page Application (SPA) based on React and TypeScript.
          The frontend communicates with Supabase services for authentication, storage, and database management.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">Core Components</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>AuthContext</strong>: Manages user authentication and profile information</li>
          <li><strong>React Router</strong>: Handles routing and navigation in the application</li>
          <li><strong>Tailwind CSS</strong>: Framework for custom UI styling</li>
          <li><strong>Shadcn</strong>: Pre-built UI components for reuse</li>
          <li><strong>React Query</strong>: State management and data fetching</li>
          <li><strong>Supabase</strong>: Database, authentication, and storage services</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">Project Configuration</h3>
        <p>
          The project is organized by functional folders:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>components</strong>: React components for UI</li>
          <li><strong>context</strong>: Global state management in the application</li>
          <li><strong>hooks</strong>: Shared logic for reuse</li>
          <li><strong>pages</strong>: Main pages in the application</li>
          <li><strong>utils</strong>: Helper functions</li>
          <li><strong>integrations</strong>: Integration with external services like Supabase</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

// Events Documentation Components
const EventsDocsHebrew = () => (
  <Card>
    <CardHeader>
      <CardTitle>ניהול אירועים</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">מבנה אירוע</h3>
        <p>
          אירועים הם הליבה של מערכת קידושישי. כל אירוע מכיל את המידע הבא:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>כותרת</strong>: שם האירוע</li>
          <li><strong>תאריך</strong>: מועד האירוע</li>
          <li><strong>פרשת שבוע</strong>: פרשת השבוע הרלוונטית</li>
          <li><strong>זמני אירוע</strong>: זמן הקמה, זמן עיקרי, זמן פירוק</li>
          <li><strong>מיקום</strong>: שם המקום וכתובת מדויקת</li>
          <li><strong>מתנדבים נדרשים</strong>: מספר בנות שירות ומתנדבים נוער</li>
          <li><strong>תוכן</strong>: תיאור תוכן האירוע והסדנאות</li>
          <li><strong>פוסטר</strong>: תמונת פרסום לאירוע</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">תהליך יצירת אירוע</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>משתמש עם הרשאות מתאימות ניגש לעמוד האירועים ובוחר "צור אירוע חדש"</li>
          <li>המשתמש יכול לבחור אירוע מוגדר מראש מלוח השנה או ליצור אירוע חדש מאפס</li>
          <li>מילוי פרטי האירוע בטופס הכולל שדות נדרשים וקישור למפה</li>
          <li>העלאת פוסטר לאירוע (אופציונלי)</li>
          <li>שמירת האירוע שיופיע ברשימת האירועים</li>
        </ol>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">הרשאות ניהול אירועים</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>מנהלים</strong>: יכולים ליצור, לערוך ולמחוק כל אירוע</li>
          <li><strong>רכזים</strong>: יכולים ליצור אירועים חדשים ולערוך אירועים שהם יצרו</li>
          <li><strong>משתמשים רגילים</strong>: יכולים לצפות באירועים ולהירשם אליהם</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

const EventsDocsEnglish = () => (
  <Card>
    <CardHeader>
      <CardTitle>Event Management</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">Event Structure</h3>
        <p>
          Events are the core of the KidushiShi system. Each event contains the following information:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Title</strong>: Name of the event</li>
          <li><strong>Date</strong>: When the event takes place</li>
          <li><strong>Weekly Portion</strong>: The relevant Torah portion</li>
          <li><strong>Event Times</strong>: Setup time, main time, cleanup time</li>
          <li><strong>Location</strong>: Venue name and exact address</li>
          <li><strong>Required Volunteers</strong>: Number of service girls and youth volunteers</li>
          <li><strong>Content</strong>: Description of event content and workshops</li>
          <li><strong>Poster</strong>: Promotional image for the event</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">Event Creation Process</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>User with appropriate permissions accesses the events page and selects "Create New Event"</li>
          <li>User can choose a predefined event from the calendar or create a new event from scratch</li>
          <li>Fill in event details in a form including required fields and map link</li>
          <li>Upload a poster for the event (optional)</li>
          <li>Save the event which will appear in the events list</li>
        </ol>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">Event Management Permissions</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Administrators</strong>: Can create, edit, and delete any event</li>
          <li><strong>Coordinators</strong>: Can create new events and edit events they created</li>
          <li><strong>Regular Users</strong>: Can view events and register for them</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

// Users Documentation Components
const UsersDocsHebrew = () => (
  <Card>
    <CardHeader>
      <CardTitle>ניהול משתמשים</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">סוגי משתמשים</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>מנהל מערכת (Admin)</strong>: הרשאות מלאות במערכת, כולל ניהול משתמשים וציוד</li>
          <li><strong>רכז (Coordinator)</strong>: יכול ליצור אירועים, להקצות מתנדבים ולנהל דיווחים</li>
          <li><strong>מתנדב (Volunteer)</strong>: יכול להירשם לאירועים ולראות את המשימות שלו</li>
          <li><strong>משתמש (User)</strong>: יכול לצפות באירועים ובמידע בסיסי</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">תהליך התחברות</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>משתמש מגיע לעמוד הכניסה ומזין את דוא"ל וסיסמה, או מתחבר באמצעות Google</li>
          <li>לאחר אימות מוצלח, המשתמש מועבר ללוח המחוונים</li>
          <li>פרופיל המשתמש נטען עם המידע הרלוונטי והרשאות הגישה</li>
        </ol>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">ניהול פרופיל</h3>
        <p>
          משתמשים יכולים לנהל את הפרופיל שלהם, כולל:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>עדכון פרטים אישיים (שם, מספר טלפון)</li>
          <li>החלפת תמונת פרופיל</li>
          <li>צפייה באירועים שהם רשומים אליהם</li>
          <li>צפייה בהיסטוריית הפעילות שלהם</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

const UsersDocsEnglish = () => (
  <Card>
    <CardHeader>
      <CardTitle>User Management</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">User Types</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Administrator (Admin)</strong>: Full permissions in the system, including user and equipment management</li>
          <li><strong>Coordinator</strong>: Can create events, assign volunteers, and manage reports</li>
          <li><strong>Volunteer</strong>: Can register for events and see their assignments</li>
          <li><strong>User</strong>: Can view events and basic information</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">Login Process</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>User arrives at the login page and enters email and password, or signs in with Google</li>
          <li>After successful authentication, the user is redirected to the dashboard</li>
          <li>User profile is loaded with relevant information and access permissions</li>
        </ol>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">Profile Management</h3>
        <p>
          Users can manage their profile, including:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Updating personal details (name, phone number)</li>
          <li>Changing profile picture</li>
          <li>Viewing events they are registered for</li>
          <li>Viewing their activity history</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

// Database Documentation Components
const DatabaseDocsHebrew = () => (
  <Card>
    <CardHeader>
      <CardTitle>מבנה מסד הנתונים</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">טבלאות עיקריות</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>profiles</strong>: מידע על משתמשים (מקושר ל-auth.users)</li>
          <li><strong>events</strong>: אירועי קידושישי</li>
          <li><strong>event_volunteers</strong>: שיוך מתנדבים לאירועים</li>
          <li><strong>notifications</strong>: התראות למשתמשים</li>
          <li><strong>equipment</strong>: פריטי ציוד זמינים</li>
          <li><strong>reports</strong>: דיווחים לאחר אירועים</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">אבטחת נתונים</h3>
        <p>
          מסד הנתונים מאובטח באמצעות מדיניות Row Level Security (RLS) של Supabase:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>הרשאות מותאמות לפי סוג משתמש</li>
          <li>אימות באמצעות Supabase Auth</li>
          <li>גישה מוגבלת לנתונים לפי תפקיד המשתמש</li>
          <li>נתונים רגישים מוצפנים</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">יחסים בין טבלאות</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>משתמש יכול ליצור מספר אירועים</li>
          <li>אירוע יכול לכלול מספר מתנדבים</li>
          <li>מתנדב יכול להשתתף במספר אירועים</li>
          <li>לכל אירוע יכולים להיות מספר דיווחים</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

const DatabaseDocsEnglish = () => (
  <Card>
    <CardHeader>
      <CardTitle>Database Structure</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">Main Tables</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>profiles</strong>: User information (linked to auth.users)</li>
          <li><strong>events</strong>: KidushiShi events</li>
          <li><strong>event_volunteers</strong>: Assignment of volunteers to events</li>
          <li><strong>notifications</strong>: User notifications</li>
          <li><strong>equipment</strong>: Available equipment items</li>
          <li><strong>reports</strong>: Post-event reports</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">Data Security</h3>
        <p>
          The database is secured using Supabase's Row Level Security (RLS) policies:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Custom permissions by user type</li>
          <li>Authentication through Supabase Auth</li>
          <li>Limited data access according to user role</li>
          <li>Sensitive data is encrypted</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">Table Relationships</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>A user can create multiple events</li>
          <li>An event can include multiple volunteers</li>
          <li>A volunteer can participate in multiple events</li>
          <li>Each event can have multiple reports</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

// API Documentation Components
const ApiDocsHebrew = () => (
  <Card>
    <CardHeader>
      <CardTitle>תיעוד API</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">אינטגרציה עם Supabase</h3>
        <p>
          המערכת משתמשת ב-Supabase כשירות Backend-as-a-Service המספק API לפעולות הבאות:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>אימות וניהול משתמשים</li>
          <li>אחסון ושליפת נתונים</li>
          <li>אחסון קבצים ותמונות</li>
          <li>התראות בזמן אמת</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">פעולות API מרכזיות</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>ניהול אירועים</strong>: יצירה, עדכון, מחיקה וקבלת אירועים</li>
          <li><strong>ניהול מתנדבים</strong>: הקצאת מתנדבים לאירועים, ניהול זמינות</li>
          <li><strong>ניהול התראות</strong>: שליחת התראות למשתמשים, סימון התראות כנקראו</li>
          <li><strong>ניהול דיווחים</strong>: הגשת דיווחים לאחר אירועים, קבלת דיווחים</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">אבטחת API</h3>
        <p>
          האפליקציה משתמשת במנגנוני האבטחה הבאים:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>אימות JWT לבקשות API</li>
          <li>מדיניות Row Level Security ברמת הנתונים</li>
          <li>הרשאות גישה לפי תפקיד</li>
          <li>תקשורת מאובטחת באמצעות HTTPS</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

const ApiDocsEnglish = () => (
  <Card>
    <CardHeader>
      <CardTitle>API Documentation</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <h3 className="text-lg font-medium mb-2">Supabase Integration</h3>
        <p>
          The system uses Supabase as a Backend-as-a-Service providing APIs for the following operations:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>User authentication and management</li>
          <li>Data storage and retrieval</li>
          <li>File and image storage</li>
          <li>Real-time notifications</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">Core API Operations</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Event Management</strong>: Create, update, delete, and retrieve events</li>
          <li><strong>Volunteer Management</strong>: Assign volunteers to events, manage availability</li>
          <li><strong>Notification Management</strong>: Send notifications to users, mark notifications as read</li>
          <li><strong>Report Management</strong>: Submit reports after events, retrieve reports</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-2">API Security</h3>
        <p>
          The application uses the following security mechanisms:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>JWT authentication for API requests</li>
          <li>Row Level Security policies at the data level</li>
          <li>Role-based access permissions</li>
          <li>Secure communication via HTTPS</li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

export default Documentation;
