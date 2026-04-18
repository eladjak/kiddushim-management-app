
import React from "react";
import { EventTitleField } from "../form-fields/EventTitleField";
import { DateTimeFields } from "../form-fields/DateTimeFields";
import { EventDurationField } from "../form-fields/EventDurationField";
import { LocationFields } from "../form-fields/LocationFields";
import { EventAudienceField } from "../form-fields/EventAudienceField";
import { EventCapacityField } from "../form-fields/EventCapacityField";
import { EventDescriptionField } from "../form-fields/EventDescriptionField";

interface EventBasicInfoSectionProps {
  formData: {
    title: string;
    date: string;
    setupTime: string;
    mainTime: string;
    cleanupTime: string;
    locationName: string;
    locationAddress: string;
    duration: string;
    audienceOpen: string;
    capacity: string;
    description: string;
  };
  eventNotes: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onEventSelect: (event: import("@/data/types/eventTypes").PredefinedEvent) => void;
}

export const EventBasicInfoSection = ({ 
  formData, 
  eventNotes, 
  onChange, 
  onSelectChange,
  onEventSelect 
}: EventBasicInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">פרטי האירוע</h2>
      
      <EventTitleField 
        value={formData.title}
        onChange={onChange}
      />
      
      <DateTimeFields 
        formData={formData}
        onChange={onChange}
      />

      <EventDurationField
        value={formData.duration}
        onChange={onChange}
      />

      <LocationFields
        formData={formData}
        onChange={onChange}
      />

      <div className="space-y-2">
        <h3 className="font-medium">קהלי יעד *</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">נא לבחור את כל האפשרויות הרלוונטיות</p>
        <div className="bg-gray-50 dark:bg-secondary p-3 rounded text-sm">
          בחירה
        </div>
      </div>

      <EventAudienceField
        value={formData.audienceOpen}
        onChange={(value) => onSelectChange('audienceOpen', value)}
      />

      <EventCapacityField
        value={formData.capacity}
        onChange={onChange}
      />
      
      <EventDescriptionField
        value={formData.description}
        onChange={onChange}
      />
    </div>
  );
};
