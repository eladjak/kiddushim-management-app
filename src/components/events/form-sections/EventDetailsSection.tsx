
import React from "react";
import { PosterUploadField } from "../form-fields/PosterUploadField";
import { EventImagesField } from "../form-fields/EventImagesField";
import { ContactPersonField } from "../form-fields/ContactPersonField";
import { EventContentField } from "../form-fields/EventContentField";

interface EventDetailsSectionProps {
  formData: {
    contactName: string;
    contactPhone: string;
    hasWhatsApp: string;
    eventContent: string;
  };
  posterUrl: string;
  eventImages: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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

      <EventContentField
        value={formData.eventContent}
        onChange={onChange}
      />
    </div>
  );
};
