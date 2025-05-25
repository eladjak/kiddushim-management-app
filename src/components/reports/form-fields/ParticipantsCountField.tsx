
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ParticipantsCountFieldProps {
  totalParticipants: number;
  kidsCount: number;
  adultsCount: number;
  onTotalChange: (value: number) => void;
  onKidsChange: (value: number) => void;
  onAdultsChange: (value: number) => void;
}

export const ParticipantsCountField = ({ 
  totalParticipants, 
  kidsCount, 
  adultsCount,
  onTotalChange, 
  onKidsChange, 
  onAdultsChange 
}: ParticipantsCountFieldProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">קהל באירוע</Label>
      <p className="text-sm text-gray-500">כמות משתתפים באירוע *</p>
      
      <div className="space-y-2">
        <Label htmlFor="participants-total">סה"כ משתתפים</Label>
        <Input
          id="participants-total"
          type="number"
          min="1"
          max="200"
          value={totalParticipants || ""}
          onChange={(e) => onTotalChange(parseInt(e.target.value) || 0)}
          placeholder="למשל: 50"
          className="text-right"
          required
        />
      </div>

      <div className="space-y-3">
        <Label>נסו לפצל את חלוק הקהל באחוזים:</Label>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="participants-adults">אחוז המבוגרים *</Label>
            <Input
              id="participants-adults"
              type="number"
              min="0"
              max="100"
              value={adultsCount || ""}
              onChange={(e) => onAdultsChange(parseInt(e.target.value) || 0)}
              placeholder="למשל: 80"
              className="text-right"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="participants-kids">אחוז הילדים *</Label>
            <Input
              id="participants-kids"
              type="number"
              min="0"
              max="100"
              value={kidsCount || ""}
              onChange={(e) => onKidsChange(parseInt(e.target.value) || 0)}
              placeholder="למשל: 20"
              className="text-right"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
