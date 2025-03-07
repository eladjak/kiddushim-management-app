
import { useFormContext } from "react-hook-form";
import { EventRatingField } from "../form-fields/EventRatingField";

export const EventRatingSection = () => {
  const form = useFormContext();

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <h3 className="font-medium text-gray-700">דירוג האירוע</h3>
      
      <EventRatingField 
        form={form} 
        name="overall_rating" 
        label="דירוג כללי" 
      />
      
      <EventRatingField 
        form={form} 
        name="audience_rating" 
        label="חווית הקהל" 
      />
      
      <EventRatingField 
        form={form} 
        name="organization_rating" 
        label="רמת הארגון" 
      />
      
      <EventRatingField 
        form={form} 
        name="logistics_rating" 
        label="לוגיסטיקה" 
      />
    </div>
  );
};
