
import { FormItem, FormLabel } from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface SeverityFieldProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const SeverityField = ({ value, onValueChange }: SeverityFieldProps) => {
  return (
    <FormItem className="space-y-2">
      <FormLabel>חומרת התקלה</FormLabel>
      <Select 
        value={value} 
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="בחר חומרת תקלה" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">נמוכה</SelectItem>
          <SelectItem value="medium">בינונית</SelectItem>
          <SelectItem value="high">גבוהה</SelectItem>
          <SelectItem value="critical">קריטית</SelectItem>
        </SelectContent>
      </Select>
    </FormItem>
  );
};
