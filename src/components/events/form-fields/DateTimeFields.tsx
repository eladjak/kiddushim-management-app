
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateTimeFieldsProps {
  formData: {
    date: string;
    setupTime: string;
    mainTime: string;
    cleanupTime: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DateTimeFields = ({ formData, onChange }: DateTimeFieldsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium">תאריך ושעות האירוע</h3>
      
      <div className="space-y-2">
        <Label htmlFor="date">תאריך</Label>
        <Input 
          id="date" 
          name="date" 
          type="date" 
          value={formData.date} 
          onChange={onChange} 
          required 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="setupTime">שעת הכנות</Label>
          <Input 
            id="setupTime" 
            name="setupTime" 
            type="time" 
            value={formData.setupTime} 
            onChange={onChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mainTime">שעת התחלה</Label>
          <Input 
            id="mainTime" 
            name="mainTime" 
            type="time" 
            value={formData.mainTime} 
            onChange={onChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cleanupTime">שעת סיום</Label>
          <Input 
            id="cleanupTime" 
            name="cleanupTime" 
            type="time" 
            value={formData.cleanupTime} 
            onChange={onChange} 
            required 
          />
        </div>
      </div>
      
      {formData.date && (
        <div className="text-sm text-gray-500 mt-2">
          {formData.setupTime && formData.mainTime && formData.cleanupTime && (
            <div className="bg-secondary/10 p-2 rounded text-xs">
              <p>הכנות: {formData.setupTime}</p>
              <p>אירוע: {formData.mainTime} - {formData.cleanupTime}</p>
              <p>משך האירוע: {calculateDuration(formData.mainTime, formData.cleanupTime)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to calculate duration between two times
function calculateDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";
  
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  let hourDiff = endHour - startHour;
  let minuteDiff = endMinute - startMinute;
  
  if (minuteDiff < 0) {
    hourDiff -= 1;
    minuteDiff += 60;
  }
  
  if (hourDiff < 0) {
    hourDiff += 24; // Assume it's the next day
  }
  
  if (hourDiff === 0 && minuteDiff === 0) return "0 דקות";
  
  const parts = [];
  if (hourDiff > 0) {
    parts.push(`${hourDiff} שעות`);
  }
  
  if (minuteDiff > 0) {
    parts.push(`${minuteDiff} דקות`);
  }
  
  return parts.join(" ו-");
}
