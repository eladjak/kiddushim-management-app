
import { useFormContext } from "react-hook-form";
import { FeedbackField } from "../form-fields/FeedbackField";
import { EventImagesUploadField } from "../form-fields/EventImagesUploadField";

interface FeedbackSectionProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export const FeedbackSection = ({ images, onImagesChange }: FeedbackSectionProps) => {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <FeedbackField 
        name="what_was_good"
        label="מה היה טוב באירוע?"
        placeholder="ספר לנו על הדברים שעבדו היטב באירוע"
        value={form.watch("what_was_good") || ""}
        onChange={(e) => form.setValue("what_was_good", e.target.value)}
      />
      
      <FeedbackField 
        name="what_to_improve"
        label="מה ניתן לשפר להבא?"
        placeholder="ספר לנו על דברים שאפשר לשפר בפעם הבאה"
        value={form.watch("what_to_improve") || ""}
        onChange={(e) => form.setValue("what_to_improve", e.target.value)}
      />
      
      <EventImagesUploadField 
        images={images}
        onImagesChange={onImagesChange}
      />
    </div>
  );
};
