
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ReportFormValues } from "@/types/reportFormTypes";
import { useReportDefaultValues } from "../validation/useReportDefaultValues";

export interface ReportFormData extends ReportFormValues {}

export const useReportFormData = () => {
  const { profile } = useAuth();
  const { defaultValues } = useReportDefaultValues();
  
  // יצירת default values עם נתוני המשתמש
  const getInitialFormData = (): ReportFormData => ({
    ...defaultValues,
    reporter_name: profile?.name || defaultValues.reporter_name,
  });

  const [formData, setFormData] = useState<ReportFormData>(getInitialFormData());
  const [images, setImages] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState("basic");

  const handleFieldChange = (field: keyof ReportFormData, value: any) => {
    console.log(`Field change: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setImages([]);
    setCurrentTab("basic");
  };

  return {
    formData,
    images,
    currentTab,
    setCurrentTab,
    handleFieldChange,
    setImages,
    resetForm,
  };
};
