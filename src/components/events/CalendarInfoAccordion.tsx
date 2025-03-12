
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "lucide-react";

export const CalendarInfoAccordion = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="calendar-info" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/10">
            <div className="flex items-center text-primary">
              <Calendar className="h-5 w-5 ml-2" />
              <span className="font-medium">מידע שנתי - לוח אירועי קידושישי</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              <div className="space-y-2">
                <h3 className="font-bold text-primary">ימי זיכרון וחגים לאומיים 🕯️</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>יום הזיכרון לשואה ולגבורה: 24.4.25</li>
                  <li>יום הזיכרון לחללי צה"ל: 30.4.25</li>
                  <li>יום העצמאות: 1-2.5.25</li>
                  <li>ל"ג בעומר: 15.5.25</li>
                  <li>יום ירושלים: 28.5.25</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-primary">צומות 📅</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>צום י"ז בתמוז: 13.7.25</li>
                  <li>צום תשעה באב: 31.7.25</li>
                  <li>צום גדליה: 25.9.25</li>
                  <li>יום כיפור: 1-2.10.25</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-primary">תקופות הפסקה</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>הפסקה בתשעת הימים (23.7-1.8.25)</li>
                  <li>הפסקת חגי תשרי (24.9-17.10.25)</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
