
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventContentFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const EventContentField = ({ value, onChange }: EventContentFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="eventContent">תוכן המפגש בהקשר לשבת (עבור צוות קידושישי בלבד, לא יתפרסם באתר) *</Label>
      <p className="text-sm text-gray-500">פרטו את תוכן המפגש בהקשר לשבת:</p>
      <p className="text-sm text-gray-500">אם יש טקס- פרטו את חלקיו ומשך הזמן, אם יש תוכן עיקרי פרטו כיצד עוסק בנושא וכו'</p>
      <Textarea
        id="eventContent"
        name="eventContent"
        value={value}
        onChange={onChange}
        placeholder=""
        className="min-h-[120px] resize-y"
        required
      />
    </div>
  );
};
