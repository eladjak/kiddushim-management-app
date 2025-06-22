
import { useReportFormData } from "./state/useReportFormData";
import { useReportFormFieldValidation } from "./state/useReportFormValidation";

export type { ReportFormData } from "./state/useReportFormData";

export const useReportFormState = () => {
  const {
    formData,
    images,
    currentTab,
    setCurrentTab,
    handleFieldChange,
    setImages,
    resetForm,
  } = useReportFormData();

  const { isFormValid: validateForm } = useReportFormFieldValidation();

  const isFormValid = (): boolean => {
    return validateForm(formData);
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
