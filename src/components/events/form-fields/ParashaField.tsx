
import { Label } from "@/components/ui/label";
import { PredefinedEvent } from "@/data/types/eventTypes";
import { ImprovedEventSelect } from "./ImprovedEventSelect";
import { SpecialDatesInfo } from "./SpecialDatesInfo";

interface ParashaFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEventSelect: (event: PredefinedEvent) => void;
}

export const ParashaField = ({ value, onChange, onEventSelect }: ParashaFieldProps) => {
  const handleEventSelect = (eventId: string) => {

    // Import the function locally to avoid circular imports
    import("@/data/events/predefinedEvents2025-2026").then(({ getKidushishiEventById }) => {
      const selectedEvent = getKidushishiEventById(eventId);
      
      if (selectedEvent) {
        // Create fake event for parasha field
        const parashaEvent = {
          target: {
            name: "parasha",
            value: selectedEvent.parasha
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        // Update parasha field
        onChange(parashaEvent);
        
        // Call the parent handler with the full event data
        onEventSelect(selectedEvent);
      }
    });
  };

  return (
    <div className="space-y-4">
      <ImprovedEventSelect 
        onEventSelect={handleEventSelect}
        onCustomEventCreate={() => {
          // Clear the parasha field to indicate custom event creation
          const clearEvent = {
            target: {
              name: "parasha",
              value: ""
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(clearEvent);
        }}
      />
      
      <div className="mt-4">
        <Label htmlFor="parasha">פרשת השבוע</Label>
        <input
          id="parasha"
          name="parasha"
          value={value}
          onChange={onChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="פרשת השבוע"
        />
      </div>
      
      <SpecialDatesInfo />
    </div>
  );
};
