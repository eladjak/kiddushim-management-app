
import { FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name: string;
  label: string;
  placeholder?: string;
}

export const FeedbackField = ({ 
  value, 
  onChange, 
  name, 
  label, 
  placeholder 
}: FeedbackFieldProps) => {
  return (
    <FormItem className="space-y-2">
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Textarea 
        id={name} 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className="min-h-[100px] resize-y"
      />
    </FormItem>
  );
};
