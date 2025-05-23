
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MapSearchInput from './map-components/MapSearchInput';
import MapContainer from './map/MapContainer';
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
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState(address || '');
  
  // Get Mapbox token from environment variables
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  
  useEffect(() => {
    if (address && address !== addressInput) {
      setAddressInput(address);
    }
  }, [address]);

  // Initialize map
  const handleMapInitialized = (container: HTMLDivElement) => {
    try {
      if (!mapboxToken) {
        throw new Error('Mapbox token is missing');
      }
      
      // Set the access token
      mapboxgl.accessToken = mapboxToken;
      
      // Create a new map instance
      const map = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: initialLocation ? [initialLocation.lng, initialLocation.lat] : [34.9, 32.3],
        zoom: 13
      });
      
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Save map instance
      setMapInstance(map);
      
      // Create initial marker if we have a location
      if (initialLocation) {
        const marker = new mapboxgl.Marker()
          .setLngLat([initialLocation.lng, initialLocation.lat])
          .addTo(map);
        
        markerRef.current = marker;
      }
      
      // Add click handler for setting marker
      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        
        // Update or create marker
        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else {
          const marker = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(map);
          markerRef.current = marker;
        }
        
        // Get address for the selected location
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.display_name) {
              const location = {
                lat,
                lng,
                address: data.display_name
              };
              
              if (onChange) {
                onChange(location);
              }
              
              setAddressInput(data.display_name);
            }
          })
          .catch(err => {
            console.error('Error fetching address:', err);
          });
      });
      
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
          
          // Update marker
          if (markerRef.current) {
            markerRef.current.setLngLat([location.lng, location.lat]);
          } else if (mapInstance) {
            const marker = new mapboxgl.Marker()
              .setLngLat([location.lng, location.lat])
              .addTo(mapInstance);
            markerRef.current = marker;
          }
          
          // Pan map to location
          if (mapInstance) {
            mapInstance.flyTo({
              center: [location.lng, location.lat],
              zoom: 14
            });
          }
          
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
        <MapContainer
          loading={loading}
          error={error}
          onRetry={handleAddressSearch}
          onMapInit={handleMapInitialized}
        />
      </div>
    </div>
  );
};

export default LocationMap;
