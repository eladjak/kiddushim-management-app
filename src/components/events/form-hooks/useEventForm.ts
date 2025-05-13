
import { useFormState, EventFormData } from "./useFormState";
import { useEventSelection } from "./useEventSelection";
import { useEventSubmission } from "./useEventSubmission";
import { PredefinedEvent } from "@/data/types/predefinedEvents";

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
    eventNotes,
    setEventNotes,
    handleInputChange
  } = useFormState();

  const { handleEventSelect } = useEventSelection(setFormData, setEventNotes);
  
  const { handleSubmit, navigate } = useEventSubmission(formData, posterUrl, setIsLoading);

  return {
    formData,
    posterUrl,
    eventNotes,
    isLoading,
    setPosterUrl,
    handleInputChange,
    handleEventSelect,
    handleSubmit,
    navigate
  };
};

export type { EventFormData };
