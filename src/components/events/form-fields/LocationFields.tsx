
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LocationFieldsProps {
  formData: {
    locationName: string;
    locationAddress: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LocationFields = ({ formData, onChange }: LocationFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="locationName">שם המיקום</Label>
        <Input 
          id="locationName" 
          name="locationName" 
          value={formData.locationName} 
          onChange={onChange} 
          required 
          placeholder="לדוגמה: בית הכנסת המרכזי"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="locationAddress">כתובת מלאה</Label>
        <Input 
          id="locationAddress" 
          name="locationAddress" 
          value={formData.locationAddress} 
          onChange={onChange} 
          required 
          placeholder="הזן כתובת מלאה"
        />
      </div>
    </>
  );
};
