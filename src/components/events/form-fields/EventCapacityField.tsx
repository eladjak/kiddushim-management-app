
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventCapacityFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const EventCapacityField = ({ value, onChange }: EventCapacityFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="capacity">תיגבול בלטת עד 4 מילים</Label>
      <p className="text-sm text-gray-500">למשל: אירוע ציין X, מיועד לנשים בלבד ומי</p>
      <Textarea
        id="capacity"
        name="capacity"
        value={value}
        onChange={onChange}
        placeholder=""
        className="min-h-[100px] resize-y"
      />
    </div>
  );
};
