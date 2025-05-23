
import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MapDisplay from './map-components/MapDisplay';
import MapSearchInput from './map-components/MapSearchInput';
import { logger } from '@/utils/logger';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationMapProps {
  initialLocation?: { lat: number; lng: number };
  address?: string;
  value?: { lat: number; lng: number; address: string };
  onChange?: (location: { lat: number; lng: number; address: string }) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  initialLocation, 
  address = '',
  value,
  onChange 
}) => {
  const log = logger.createLogger({ component: 'LocationMap' });
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState(address || '');
  
  useEffect(() => {
    if (address && address !== addressInput) {
      setAddressInput(address);
    }
  }, [address]);

  // Initialize map
  const handleMapInitialized = (container: HTMLDivElement) => {
    try {
      // Map initialization logic would go here
      log.info('Map initialized');
    } catch (error) {
      log.error('Error initializing map', { error });
      setError('Failed to initialize map');
    }
  };

  // Handle address search
  const handleAddressSearch = () => {
    if (!addressInput.trim()) return;
    
    setLoading(true);
    setError(null);
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const result = data[0];
          const location = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            address: result.display_name
          };
          
          if (onChange) {
            onChange(location);
          }
          
          log.info('Location found', { location });
        } else {
          setError('No locations found for this address');
          log.warn('No locations found', { address: addressInput });
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Error searching for location');
        log.error('Error searching for location', { error: err });
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex flex-col gap-2">
        <MapSearchInput
          addressInput={addressInput}
          setAddressInput={setAddressInput}
          handleAddressSearch={handleAddressSearch}
          loading={loading}
        />
      </div>

      <div className="flex-grow relative">
        <MapDisplay
          loading={loading}
          error={error}
          onRetry={handleAddressSearch}
          mapInitialized={handleMapInitialized}
        />
      </div>
    </div>
  );
};

export default LocationMap;
