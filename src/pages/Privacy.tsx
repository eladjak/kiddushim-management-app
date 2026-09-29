import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

const CONTACT_PHONE_DISPLAY = "052-542-7474";
const CONTACT_PHONE_HREF = "tel:+972525427474";
const LAST_UPDATED = "29.9.2026";

const Privacy = () => {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-background dark:via-background dark:to-background flex flex-col" dir="rtl">
      <main id="main-content" className="flex-grow px-4 py-10">
        <article className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-10 leading-relaxed">
          <Link
            to="/landing"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            חזרה לעמוד ההרשמה
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">מדיניות פרטיות</h1>
          <p className="text-sm text-muted-foreground mb-8">
            קידושישי מגדל העמק · עודכן לאחרונה: {LAST_UPDATED}
          </p>

          <section className="space-y-2 mb-8">
            <h2 className="text-xl font-semibold">מי אנחנו</h2>
            <p>
              קידושישי מגדל העמק הוא פרויקט קהילתי של הגרעין התורני אורות יהודה וארגון רבני צהר.
              הדף הזה מסביר איזה מידע אישי אנחנו אוספים כשנרשמים לאירוע, למה, ומה הזכויות שלכם.
            </p>
          </section>

          <section className="space-y-2 mb-8">
            <h2 className="text-xl font-semibold">איזה מידע נאסף בטופס ההרשמה</h2>
            <ul className="list-disc pe-6 space-y-1">
              <li>שם מלא וטלפון - חובה, כדי שנוכל לשלוח את פרטי האירוע ולהתאים את ההכנות.</li>
              <li>כתובת אימייל - לא חובה. משמשת רק לשליחת אישור הרשמה.</li>
              <li>מספר האנשים במשפחה וגילאי ילדים - לא חובה. עוזרים לנו להיערך (כיבוד, פעילות לילדים).</li>
              <li>
                הערות חופשיות - לא חובה. <strong>נבקש לא לכתוב שם מידע רפואי או רגיש.</strong>{" "}
                אם יש צורך מיוחד (למשל אלרגיה), עדיף ליצור קשר ישירות עם הרכז.
              </li>
            </ul>
            <p>לא נבקש מכם מספר זהות, כתובת מגורים או פרטי תשלום. ההשתתפות ללא עלות.</p>
          </section>

          <section className="space-y-2 mb-8">
            <h2 className="text-xl font-semibold">למה משתמשים במידע</h2>
            <p>
              רק לצורך ארגון אירועי קידושישי: לעדכן אתכם בפרטי האירוע, להעריך כמה משתתפים יגיעו,
              ולחזור אליכם אם יש שינוי. לא נשתמש במידע לפרסום מסחרי, ולא נמכור אותו או נעביר אותו
              לגורמים שאינם חלק מהפעילות.
            </p>
          </section>

          <section className="space-y-2 mb-8">
            <h2 className="text-xl font-semibold">מי רואה את המידע</h2>
            <p>
              רק רכזי הפרויקט ואנשי צוות מורשים, אחרי כניסה מאובטחת למערכת. לצורך פעולת האתר אנו
              נעזרים בספקי תשתית - אחסון האתר ובסיס הנתונים ושליחת האימייל - שמעבדים את המידע
              בשמנו ולצורך זה בלבד.
            </p>
          </section>

          <section className="space-y-2 mb-8">
            <h2 className="text-xl font-semibold">הזכויות שלכם</h2>
            <p>
              אפשר לבקש בכל עת לראות את המידע ששמרנו עליכם, לתקן אותו או למחוק אותו, וגם לבטל
              הסכמה לקבלת הודעות. פנו אלינו בטלפון{" "}
              <a href={CONTACT_PHONE_HREF} className="text-primary underline" dir="ltr">
                {CONTACT_PHONE_DISPLAY}
              </a>{" "}
              ונטפל בבקשה.
            </p>
            <p>
              ההרשמה בטופס היא מרצון, והיא כוללת הסכמה מפורשת לעיבוד המידע כמתואר בדף זה.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">קטינים</h2>
            <p>
              הטופס מיועד להורים ולמבוגרים. את גילאי הילדים ממלאים ההורים בלבד, ואנחנו לא שומרים
              שמות או פרטי זיהוי של ילדים.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
