
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { specialDates } from "@/data/calendar/specialDates";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export const CalendarInfoAccordion = () => {
  const { holidays, fasts, breakPeriods } = specialDates;
  
  return (
    <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <AccordionItem value="events-calendar">
        <AccordionTrigger className="text-lg font-medium">
          לוח שנתי - מידע חשוב
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6 py-2">
            <div>
              <h3 className="font-bold mb-2">חגים ומועדים</h3>
              <ul className="list-disc list-inside space-y-1 pr-4">
                {holidays.map((holiday, index) => (
                  <li key={index}>
                    {holiday.name}: {format(new Date(holiday.date), "dd/MM/yyyy", { locale: he })}
                    {holiday.endDate && <> עד {format(new Date(holiday.endDate), "dd/MM/yyyy", { locale: he })}</>}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">צומות</h3>
              <ul className="list-disc list-inside space-y-1 pr-4">
                {fasts.map((fast, index) => (
                  <li key={index}>
                    {fast.name}: {format(new Date(fast.date), "dd/MM/yyyy", { locale: he })}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-2 text-red-600">תקופות הפסקה - לא מתקיימים אירועים</h3>
              <ul className="list-disc list-inside space-y-1 pr-4">
                {breakPeriods.map((period, index) => (
                  <li key={index} className="text-red-600">
                    {period.name}: {format(new Date(period.startDate), "dd/MM/yyyy", { locale: he })} - 
                    {format(new Date(period.endDate), "dd/MM/yyyy", { locale: he })}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="font-bold text-blue-700 mb-2">הערות חשובות</h3>
              <ul className="list-disc list-inside space-y-2 pr-4 text-sm">
                <li>אירועים בימי חמישי מתקיימים בשעות הערב, אירועים בימי שישי לפני כניסת השבת</li>
                <li>באירועים המסומנים ב-👧 בנות שירות לאומי זמינות לעזרה בהפקת האירוע</li>
                <li>יש להגיע לפחות שעה לפני תחילת האירוע לצורך הכנות</li>
              </ul>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
