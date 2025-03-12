
import React from "react";
import { EventTitleField } from "../form-fields/EventTitleField";
import { ParashaField } from "../form-fields/ParashaField";
import { EventContentField } from "../form-fields/EventContentField";

interface EventBasicInfoSectionProps {
  formData: {
    title: string;
    parasha: string;
    facilitator: string;
    eventContent: string;
    workshopContent: string;
  };
  eventNotes: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onEventSelect: (event: any) => void;
}

export const EventBasicInfoSection = ({ 
  formData, 
  eventNotes, 
  onChange, 
  onEventSelect 
}: EventBasicInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <EventTitleField 
        value={formData.title}
        onChange={onChange}
      />
      
      <ParashaField
        value={formData.parasha}
        onChange={onChange}
        onEventSelect={onEventSelect}
      />
      
      {eventNotes.length > 0 && (
        <div className="bg-secondary/20 p-4 rounded-md border border-secondary">
          <h3 className="text-sm font-medium mb-2">הערות למועד זה:</h3>
          <ul className="list-disc list-inside space-y-1">
            {eventNotes.map((note, index) => (
              <li key={index} className="text-sm text-gray-700">{note}</li>
            ))}
          </ul>
        </div>
      )}
      
      <EventContentField
        value={formData.eventContent}
        onChange={onChange}
        label="תוכן האירוע"
        name="eventContent"
        placeholder="פרטים על האירוע והפעילויות המתוכננות"
      />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="facilitator" className="text-sm font-medium">מפעיל האירוע</label>
        </div>
        <input
          id="facilitator"
          name="facilitator"
          value={formData.facilitator}
          onChange={onChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="שם המפעיל/ה של האירוע"
        />
      </div>
      
      <EventContentField
        value={formData.workshopContent}
        onChange={onChange}
        label="תוכן הסדנה"
        name="workshopContent"
        placeholder="תיאור הסדנה והפעילות"
      />
    </div>
  );
};
