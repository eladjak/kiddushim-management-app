
import { Calendar } from "lucide-react";
import { useEventForm } from "./form-hooks/useEventForm";
import { EventBasicInfoSection } from "./form-sections/EventBasicInfoSection";
import { EventDetailsSection } from "./form-sections/EventDetailsSection";
import { EventFormActions } from "./form-actions/EventFormActions";
import { EventAutocomplete } from "./EventAutocomplete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CreateEventForm = () => {
  const { 
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
  } = useEventForm();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
        <Calendar className="h-6 w-6 text-primary me-2" />
        <h2 className="text-2xl font-bold">יצירת אירוע חדש</h2>
      </div>
      
      {/* Autocomplete Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">בחירת אירוע מהרשימה המוכנה</CardTitle>
        </CardHeader>
        <CardContent>
          <EventAutocomplete
            onSelect={handleEventSelect}
            placeholder="חפש אירוע מהרשימה המוכנה..."
            className="mb-4"
          />
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground text-right">
            או מלא את הפרטים ידנית למטה
          </p>
        </CardContent>
      </Card>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <ScrollArea className="max-h-[70vh] overflow-y-auto">
          <div className="space-y-6 pe-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <EventBasicInfoSection 
                  formData={formData}
                  eventNotes={eventNotes}
                  onChange={handleInputChange}
                  onSelectChange={handleSelectChange}
                  onEventSelect={handleEventSelect}
                />
              </div>
              
              <div className="space-y-6">
                <EventDetailsSection 
                  formData={formData}
                  posterUrl={posterUrl}
                  eventImages={eventImages}
                  onChange={handleInputChange}
                  onSelectChange={handleSelectChange}
                  onPosterChange={setPosterUrl}
                  onImagesChange={setEventImages}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="border-t pt-4 bg-white dark:bg-background sticky bottom-0">
          <EventFormActions 
            isLoading={isLoading}
            onCancel={() => navigate("/events")}
          />
        </div>
      </form>
    </div>
  );
};
