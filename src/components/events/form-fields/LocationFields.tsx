
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface LocationFieldsProps {
  formData: {
    locationName: string;
    locationAddress: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LocationFields = ({ formData, onChange }: LocationFieldsProps) => {
  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const getWazeUrl = (address: string) => {
    return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
  };

  const getMoovitUrl = (address: string) => {
    return `https://moovit.com/?to=${encodeURIComponent(address)}&tll=32.0853_34.7818&customerId=4908&metroId=1&lang=he`;
  };

  return (
    <div className="space-y-4">
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
      
      {formData.locationAddress && (
        <div className="pt-2">
          <div className="text-sm font-medium mb-2 flex items-center">
            <MapPin className="h-4 w-4 ml-1 text-primary" />
            ניווט למיקום
          </div>
          <div className="flex gap-2 flex-wrap">
            <a 
              href={getGoogleMapsUrl(formData.locationAddress)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
            >
              Google Maps
            </a>
            <a 
              href={getWazeUrl(formData.locationAddress)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-sky-500 text-white px-3 py-1 rounded-md text-sm hover:bg-sky-600"
            >
              Waze
            </a>
            <a 
              href={getMoovitUrl(formData.locationAddress)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-600"
            >
              Moovit
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
