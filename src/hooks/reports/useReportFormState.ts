
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export interface ReportFormData {
  title: string;
  description: string;
  event_id: string;
  reporter_name: string;
  participants_count: number;
  participants_kids: number;
  participants_adults: number;
  participants_gained: string;
  is_tzohar_representative: boolean;
  overall_rating?: number;
  audience_rating?: number;
  organization_rating?: number;
  logistics_rating?: number;
  additional_feedback: string;
}

export const useReportFormState = () => {
  const { user, profile } = useAuth();
  
  const getDefaultValues = (): ReportFormData => ({
    title: "",
    description: "",
    event_id: "",
    reporter_name: profile?.name || "",
    participants_count: 0,
    participants_kids: 0,
    participants_adults: 0,
    participants_gained: "",
    is_tzohar_representative: false,
    overall_rating: undefined,
    audience_rating: undefined,
    organization_rating: undefined,
    logistics_rating: undefined,
    additional_feedback: "",
  });

  const [formData, setFormData] = useState<ReportFormData>(getDefaultValues());
  const [images, setImages] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState("basic");

  const handleFieldChange = (field: keyof ReportFormData, value: any) => {
    console.log(`Field change: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(getDefaultValues());
    setImages([]);
    setCurrentTab("basic");
  };

  const isFormValid = (): boolean => {
    return (
      formData.title.length >= 3 &&
      formData.description.length >= 10 &&
      formData.reporter_name.length >= 2 &&
      formData.participants_count > 0 &&
      formData.participants_gained.length >= 5
    );
  };

  return {
    formData,
    images,
    currentTab,
    setCurrentTab,
    handleFieldChange,
    setImages,
    resetForm,
    isFormValid,
  };
};
