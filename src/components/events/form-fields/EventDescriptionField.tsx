
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventDescriptionFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const EventDescriptionField = ({ value, onChange }: EventDescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">תיאור האירוע *</Label>
      <p className="text-sm text-gray-500 dark:text-gray-400">כתבו את כל הפרטים על האירוע באופן חוויתי ונעים, הקפידו על מרווח שורות בין קטע לקטע.</p>
      <Textarea
        id="description"
        name="description"
        value={value}
        onChange={onChange}
        placeholder=""
        className="min-h-[120px] resize-y"
        required
      />
    </div>
  );
};
