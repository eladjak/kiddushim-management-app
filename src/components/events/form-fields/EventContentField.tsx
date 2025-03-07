
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventContentFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
  name: string;
  placeholder: string;
}

export const EventContentField = ({ 
  value, 
  onChange, 
  label, 
  name, 
  placeholder 
}: EventContentFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-24 resize-y"
      />
    </div>
  );
};
