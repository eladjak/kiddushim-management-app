
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Map as MapIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LocationMap from "@/components/maps/LocationMap";
import { logger } from "@/utils/logger";

interface LocationFieldsProps {
  formData: {
    locationName: string;
    locationAddress: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LocationFields = ({ formData, onChange }: LocationFieldsProps) => {
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number; address: string} | null>(null);
  const log = logger.createLogger({ component: 'LocationFields' });

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const getWazeUrl = (address: string) => {
    return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
  };

  const getMoovitUrl = (address: string) => {
    return `https://moovit.com/?to=${encodeURIComponent(address)}&tll=32.0853_34.7818&customerId=4908&metroId=1&lang=he`;
  };

  const showOnMap = () => {
    setMapDialogOpen(true);
  };

  const handleLocationSelect = (location: {lat: number; lng: number; address: string}) => {
    setSelectedLocation(location);
    log.info("Location selected", { location });
    
    // Create a synthetic event to update the parent form
    const event = {
      target: {
        name: 'locationAddress',
        value: location.address
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(event);
    setMapDialogOpen(false);
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
        <div className="flex gap-2">
          <Input 
            id="locationAddress" 
            name="locationAddress" 
            value={formData.locationAddress} 
            onChange={onChange} 
            required 
            placeholder="הזן כתובת מלאה"
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={showOnMap}
            title="הצג על המפה"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
        </div>
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

      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="sm:max-w-[800px] h-[80vh]">
          <DialogHeader>
            <DialogTitle>בחר מיקום במפה</DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full min-h-[400px]">
            <LocationMap 
              address={formData.locationAddress} 
              onChange={handleLocationSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
