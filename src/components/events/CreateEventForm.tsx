
import { Calendar } from "lucide-react";
import { useEventForm } from "./form-hooks/useEventForm";
import { EventBasicInfoSection } from "./form-sections/EventBasicInfoSection";
import { EventDetailsSection } from "./form-sections/EventDetailsSection";
import { EventFormActions } from "./form-actions/EventFormActions";

export const CreateEventForm = () => {
  const { 
    formData,
    posterUrl,
    eventNotes,
    isLoading,
    setPosterUrl,
    handleInputChange,
    handleEventSelect,
    handleSubmit,
    navigate
  } = useEventForm();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
        <Calendar className="h-6 w-6 text-primary ml-2" />
        <h2 className="text-2xl font-bold">יצירת אירוע חדש</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EventBasicInfoSection 
            formData={formData}
            eventNotes={eventNotes}
            onChange={handleInputChange}
            onEventSelect={handleEventSelect}
          />
          
          <EventDetailsSection 
            formData={formData}
            posterUrl={posterUrl}
            onChange={handleInputChange}
            onPosterChange={setPosterUrl}
          />
        </div>
        
        <EventFormActions 
          isLoading={isLoading}
          onCancel={() => navigate("/events")}
        />
      </form>
    </div>
  );
};
