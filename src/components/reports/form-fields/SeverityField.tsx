
import { Label } from "@/components/ui/label";
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
    <div className="space-y-2">
      <Label htmlFor="severity">חומרת התקלה</Label>
      <Select 
        value={value} 
        onValueChange={(value) => onValueChange(value)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">נמוכה</SelectItem>
          <SelectItem value="medium">בינונית</SelectItem>
          <SelectItem value="high">גבוהה</SelectItem>
          <SelectItem value="critical">קריטית</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
