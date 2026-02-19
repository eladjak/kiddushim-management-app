import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Music, Heart } from "lucide-react";
import familiesActivity from "@/assets/families-activity.jpg";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";

export const AboutSection = () => {
  const sectionRef = useAnimateOnScroll<HTMLElement>();

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 relative overflow-hidden animate-on-scroll">
      {/* Subtle decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-950/20 pointer-events-none" />
      <div className="absolute top-0 start-0 w-72 h-72 bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 end-0 w-72 h-72 bg-orange-100/40 dark:bg-orange-900/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            מה זה קידושישי?
          </h2>
          {/* Gradient underline accent */}
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mx-auto mb-6" />
          <div className="text-xl text-muted-foreground max-w-4xl mx-auto space-y-4">
            <p>
              <strong>קידושישי</strong> הוא מיזם קהילתי מיוחד שנועד ליצור מסורת חדשה ומאחדת של קבלות שבת במגדל העמק.
            </p>
            <p>
              המיזם מחבר בין כל חלקי האוכלוסיה - דתיים וחילוניים, ותיקים וחדשים, צעירים ומבוגרים -
              דרך חוויה משותפת של קדושת השבת, מוזיקה עדינה, לימוד מעשיר ופעילויות יצירה משפחתיות.
            </p>
            <p>
              <strong>המטרה:</strong> לבנות קהילה חזקה ומלכדת שמכבדת את המגוון התרבותי
              ויוצרת מרחב בטוח ומזמין לכולם להתחבר לערכי השבת בדרך שמתאימה להם.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6 bg-card/80 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 animate-on-scroll stagger-1">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="mb-3 text-xl">קהילה מאוחדת</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              חיבור בין כל חלקי האוכלוסיה במגדל העמק דרך חוויה משותפת של קדושת השבת
            </CardDescription>
          </Card>

          <Card className="text-center p-6 bg-card/80 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 animate-on-scroll stagger-2 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center"
              style={{ backgroundImage: `url(${familiesActivity})` }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/25">
                <Music className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="mb-3 text-xl">מוזיקה ויצירה</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                אירועים עשירים בשירה, מוזיקה, פעילויות יצירה ולימוד משותף לכל המשפחה
              </CardDescription>
            </div>
          </Card>

          <Card className="text-center p-6 bg-card/80 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 animate-on-scroll stagger-3">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="mb-3 text-xl">חוויה משפחתית</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              פעילויות מותאמות לכל הגילאים, יצירת זיכרונות יפים ורגעי חיבור אמיתיים
            </CardDescription>
          </Card>
        </div>
      </div>
    </section>
  );
};
