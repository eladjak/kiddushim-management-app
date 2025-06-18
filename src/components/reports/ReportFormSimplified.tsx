
import { useReportForm } from "@/hooks/reports/useReportForm";
import { useReportFormState } from "@/hooks/reports/useReportFormState";
import { useReportFormSubmission } from "./form-hooks/useReportFormSubmission";
import { ReportFormHeader } from "./form-components/ReportFormHeader";
import { ReportFormContent } from "./form-components/ReportFormContent";
import { ReportFormActions } from "./form-components/ReportFormActions";

interface ReportFormSimplifiedProps {
  reportType: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportFormSimplified = ({ reportType, onClose, onSuccess }: ReportFormSimplifiedProps) => {
  const { events } = useReportForm();
  const { 
    formData, 
    images, 
    currentTab,
    setCurrentTab,
    handleFieldChange, 
    setImages, 
    resetForm,
    isFormValid 
  } = useReportFormState();
  
  const { isSubmitting, handleSubmit } = useReportFormSubmission({
    reportType,
    onClose,
    onSuccess
  });

  console.log("ReportFormSimplified - Form data:", formData);
  console.log("ReportFormSimplified - Events:", events);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      return;
    }

    await handleSubmit(formData, images);
    resetForm();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ReportFormHeader reportType={reportType} />

      <ReportFormContent
        events={events}
        formData={formData}
        images={images}
        currentTab={currentTab}
        reportType={reportType}
        onTabChange={setCurrentTab}
        onFieldChange={handleFieldChange}
        onImagesChange={setImages}
      />

      <ReportFormActions
        isSubmitting={isSubmitting}
        isFormValid={isFormValid()}
        onClose={onClose}
      />
    </form>
  );
};
