import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Music, Heart } from "lucide-react";
import familiesActivity from "@/assets/families-activity.jpg";

export const AboutSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            מה זה קידושישי?
          </h2>
          <div className="text-xl text-gray-600 max-w-4xl mx-auto space-y-4">
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
          <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="mb-3 text-xl">קהילה מאוחדת</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              חיבור בין כל חלקי האוכלוסיה במגדל העמק דרך חוויה משותפת של קדושת השבת
            </CardDescription>
          </Card>

          <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center"
              style={{ backgroundImage: `url(${familiesActivity})` }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="mb-3 text-xl">מוזיקה ויצירה</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                אירועים עשירים בשירה, מוזיקה, פעילויות יצירה ולימוד משותף לכל המשפחה
              </CardDescription>
            </div>
          </Card>

          <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
