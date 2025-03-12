
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar, Info } from "lucide-react";
import { specialDates } from "@/data/eventCalendar";

export const CalendarInfoAccordion = () => {
  return (
    <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm p-6">
      <AccordionItem value="calendar-info">
        <AccordionTrigger className="text-right py-2">
          <div className="flex items-center">
            <Info className="h-4 w-4 ml-2 text-primary" />
            <span>לוח שנתי - מידע מיוחד</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-sm space-y-4">
          <div className="bg-secondary/10 p-3 rounded-md border border-secondary/20">
            <h3 className="font-bold mb-2 text-base">ימי זיכרון וחגים לאומיים 🕯️</h3>
            <ul className="list-disc list-inside space-y-1">
              {specialDates.holidays.map((holiday, index) => (
                <li key={index} className="text-sm">
                  {holiday.name}: {new Date(holiday.date).toLocaleDateString('he-IL')}
                  {holiday.endDate && ` - ${new Date(holiday.endDate).toLocaleDateString('he-IL')}`}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-secondary/10 p-3 rounded-md border border-secondary/20">
            <h3 className="font-bold mb-2 text-base">צומות 📅</h3>
            <ul className="list-disc list-inside space-y-1">
              {specialDates.fasts.map((fast, index) => (
                <li key={index} className="text-sm">
                  {fast.name}: {new Date(fast.date).toLocaleDateString('he-IL')}
                  {fast.endDate && ` - ${new Date(fast.endDate).toLocaleDateString('he-IL')}`}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-red-50 p-3 rounded-md border border-red-200">
            <h3 className="font-bold mb-2 text-base text-red-700">תקופות הפסקה ⛔</h3>
            <ul className="list-disc list-inside space-y-1">
              {specialDates.breakPeriods.map((period, index) => (
                <li key={index} className="text-sm text-red-700">
                  {period.name}: {new Date(period.startDate).toLocaleDateString('he-IL')} - {new Date(period.endDate).toLocaleDateString('he-IL')}
                </li>
              ))}
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
