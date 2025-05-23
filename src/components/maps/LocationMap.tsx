import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MapDisplay from './map-components/MapDisplay';
import { MapSearchInput } from './map-components/MapSearchInput';
import { useMarkerManagement } from './hooks/useMarkerManagement';
import { logger } from '@/utils/logger';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationMapProps {
  initialLocation?: { lat: number; lng: number };
  onLocationChange?: (location: { lat: number; lng: number }) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ initialLocation, onLocationChange }) => {
  const log = logger.createLogger({ component: 'LocationMap' });
  const mapRef = useRef(null);
  const { marker, setMarker, handleLocationSelect, handleSearch } = useMarkerManagement(initialLocation, onLocationChange);

  useEffect(() => {
    if (initialLocation) {
      setMarker(initialLocation);
    }
  }, [initialLocation, setMarker]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex flex-col gap-2">
        <MapSearchInput onSelect={handleLocationSelect} />
      </div>

      <div className="flex-grow relative">
        <MapDisplay marker={marker} setMarker={setMarker} initialLocation={initialLocation} />
      </div>
    </div>
  );
};

export default LocationMap;
