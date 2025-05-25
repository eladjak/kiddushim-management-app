
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReporterNameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ReporterNameField = ({ value, onChange }: ReporterNameFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="reporter-name">שם המדווח *</Label>
      <Input
        id="reporter-name"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="הזן את שמך..."
        required
      />
    </div>
  );
};
