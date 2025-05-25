
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PosterUploadField } from "../form-fields/PosterUploadField";
import { DateTimeFields } from "../form-fields/DateTimeFields";
import { VolunteersFields } from "../form-fields/VolunteersFields";
import { LocationFields } from "../form-fields/LocationFields";
import { EventImagesField } from "../form-fields/EventImagesField";
import { ContactPersonField } from "../form-fields/ContactPersonField";

interface EventDetailsSectionProps {
  formData: {
    date: string;
    setupTime: string;
    mainTime: string;
    cleanupTime: string;
    locationName: string;
    locationAddress: string;
    requiredServiceGirls: number;
    requiredYouthVolunteers: number;
    contactName: string;
    contactPhone: string;
    hasWhatsApp: string;
  };
  posterUrl: string;
  eventImages: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onPosterChange: (url: string) => void;
  onImagesChange: (images: string[]) => void;
}

export const EventDetailsSection = ({ 
  formData, 
  posterUrl, 
  eventImages,
  onChange, 
  onSelectChange,
  onPosterChange,
  onImagesChange
}: EventDetailsSectionProps) => {
  return (
    <div className="space-y-6">
      <PosterUploadField 
        posterUrl={posterUrl}
        onPosterChange={onPosterChange}
      />
      
      <DateTimeFields 
        formData={formData}
        onChange={onChange}
      />
      
      <VolunteersFields 
        formData={formData}
        onChange={onChange}
      />
      
      <LocationFields 
        formData={formData}
        onChange={onChange}
      />

      <EventImagesField
        images={eventImages}
        onImagesChange={onImagesChange}
      />

      <ContactPersonField
        name={formData.contactName}
        phone={formData.contactPhone}
        hasWhatsApp={formData.hasWhatsApp}
        onNameChange={onChange}
        onPhoneChange={onChange}
        onWhatsAppChange={(value) => onSelectChange('hasWhatsApp', value)}
      />

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="calendar-info">
          <AccordionTrigger className="text-sm font-medium">מידע נוסף - לוח אירועים שנתי</AccordionTrigger>
          <AccordionContent>
            <div className="text-xs space-y-2 max-h-64 overflow-y-auto pr-2">
              <h3 className="font-bold">ימי זיכרון וחגים לאומיים 🕯️</h3>
              <ul className="list-disc list-inside">
                <li>יום הזיכרון לשואה ולגבורה: 24.4.25</li>
                <li>יום הזיכרון לחללי צה"ל: 30.4.25</li>
                <li>יום העצמאות: 1-2.5.25</li>
                <li>ל"ג בעומר: 15.5.25</li>
                <li>יום ירושלים: 28.5.25</li>
              </ul>
              
              <h3 className="font-bold mt-3">צומות 📅</h3>
              <ul className="list-disc list-inside">
                <li>צום י"ז בתמוז: 13.7.25</li>
                <li>צום תשעה באב: 31.7.25</li>
                <li>צום גדליה: 25.9.25</li>
                <li>יום כיפור: 1-2.10.25</li>
              </ul>
              
              <h3 className="font-bold mt-3">תקופות הפסקה</h3>
              <ul className="list-disc list-inside">
                <li>הפסקה בתשעת הימים (23.7-1.8.25)</li>
                <li>הפסקת חגי תשרי (24.9-17.10.25)</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
