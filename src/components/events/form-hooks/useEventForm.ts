
import { useFormState, EventFormData } from "./useFormState";
import { useEventSelection } from "./useEventSelection";
import { useEventSubmission } from "./useEventSubmission";
import { PredefinedEvent } from "@/data/types/eventTypes";

/**
 * הוק משולב לניהול טופס האירוע
 */
export const useEventForm = () => {
  const {
    formData,
    setFormData,
    isLoading,
    setIsLoading,
    posterUrl,
    setPosterUrl,
    eventImages,
    setEventImages,
    eventNotes,
    setEventNotes,
    handleInputChange,
    handleSelectChange
  } = useFormState();

  const { handleEventSelect } = useEventSelection(setFormData, setEventNotes);
  
  const { handleSubmit, navigate } = useEventSubmission(formData, posterUrl, setIsLoading);

  return {
    formData,
    posterUrl,
    eventImages,
    eventNotes,
    isLoading,
    setPosterUrl,
    setEventImages,
    handleInputChange,
    handleSelectChange,
    handleEventSelect,
    handleSubmit,
    navigate
  };
};

export type { EventFormData };
