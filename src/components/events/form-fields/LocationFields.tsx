
import { useState, lazy, Suspense } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Map as MapIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";

const LocationMap = lazy(() => import("@/components/maps/LocationMap"));

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
        <Label htmlFor="locationAddress">כתובת האירוע *</Label>
        <div className="flex gap-2">
          <Input 
            id="locationAddress" 
            name="locationAddress" 
            value={formData.locationAddress} 
            onChange={onChange} 
            required 
            placeholder=""
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={showOnMap}
            title="הצג על המפה"
            aria-label="הצג כתובת על המפה"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {formData.locationAddress && (
        <div className="pt-2">
          <div className="text-sm">
            <a 
              href={getGoogleMapsUrl(formData.locationAddress)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              קישור לגוגל מפות
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
            <Suspense fallback={
              <div className="flex items-center justify-center h-full" role="status" aria-live="polite">
                <p className="text-gray-500">טוען מפה...</p>
              </div>
            }>
              <LocationMap
                address={formData.locationAddress}
                onChange={handleLocationSelect}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
