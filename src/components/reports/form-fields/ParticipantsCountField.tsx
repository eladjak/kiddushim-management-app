
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
      <Label className="text-base font-medium">תקהל באירוע</Label>
      <p className="text-sm text-gray-500">כמות משתתפים באירוע *</p>
      
      <div className="space-y-2">
        <Label htmlFor="participants-total">סה"כ משתתפים</Label>
        <Input
          id="participants-total"
          type="number"
          min="1"
          max="200"
          value={totalParticipants}
          onChange={(e) => onTotalChange(parseInt(e.target.value) || 0)}
          placeholder="50"
          className="text-right"
          required
        />
      </div>

      <div className="space-y-3">
        <Label>נסו לפצל את חלקת הקהל באחוזים:</Label>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="participants-adults">אחוז המבוגרים *</Label>
            <Input
              id="participants-adults"
              type="number"
              min="0"
              max="100"
              value={adultsCount}
              onChange={(e) => onAdultsChange(parseInt(e.target.value) || 0)}
              placeholder="80"
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
              value={kidsCount}
              onChange={(e) => onKidsChange(parseInt(e.target.value) || 0)}
              placeholder="20"
              className="text-right"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location-other">אחר - אחר</Label>
        <Input
          id="location-other"
          type="text"
          placeholder=""
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="participants-gained">
          מה להערכתך אותו המשתתפים שהיו על עצמן הקהקול? *
        </Label>
        <p className="text-sm text-gray-500">
          איזה פרטו האם יצירתם איתם קשר, כיצר לדעתכם הם השתלבו?
        </p>
        <textarea
          id="participants-gained"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="כאן תגיעו חייכות ותיאור החליל והקליך מהתרופות..."
        />
      </div>
    </div>
  );
};
