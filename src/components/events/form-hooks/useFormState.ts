
import { useState } from "react";

export interface EventFormData {
  title: string;
  date: string;
  setupTime: string;
  mainTime: string;
  cleanupTime: string;
  locationName: string;
  locationAddress: string;
  requiredServiceGirls: number;
  requiredYouthVolunteers: number;
  parasha: string;
  facilitator: string;
  workshopContent: string;
  eventContent: string;
}

/**
 * הוק לניהול מצב טופס האירוע
 */
export const useFormState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [posterUrl, setPosterUrl] = useState("");
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    date: "",
    setupTime: "",
    mainTime: "",
    cleanupTime: "",
    locationName: "",
    locationAddress: "",
    requiredServiceGirls: 0,
    requiredYouthVolunteers: 0,
    parasha: "",
    facilitator: "",
    workshopContent: "",
    eventContent: "",
  });

  const [eventNotes, setEventNotes] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    });
  };

  return {
    formData,
    setFormData,
    isLoading,
    setIsLoading,
    posterUrl,
    setPosterUrl,
    eventNotes,
    setEventNotes,
    handleInputChange
  };
};
