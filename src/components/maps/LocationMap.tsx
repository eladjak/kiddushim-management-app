
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import MapContainer from './map/MapContainer';
import { MAPBOX_TOKEN, geocodeAddress, reverseGeocode, getMapOptions } from './utils/mapUtils';
import { logger } from '@/utils/logger';

interface LocationMapProps {
  address?: string;
  value?: { lat: number; lng: number; address: string };
  onChange?: (value: { lat: number; lng: number; address: string }) => void;
  readOnly?: boolean;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  address, 
  value, 
  onChange,
  readOnly = false
}) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState(address || value?.address || '');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  );
  const log = logger.createLogger({ component: 'LocationMap' });

  // Add marker to map
  const addMarker = (lng: number, lat: number) => {
    if (!map.current) {
      log.warn("Cannot add marker: Map not initialized");
      return;
    }
    
    log.info("Adding marker to map", { lng, lat });
    
    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }
    
    try {
      // Create new marker
      marker.current = new mapboxgl.Marker({
        color: "#FF0000",
        draggable: !readOnly
      })
        .setLngLat([lng, lat])
        .addTo(map.current);
      
      // Update coordinates
      setCoordinates({ lng, lat });
      
      // If not readonly and onChange provided, call it
      if (!readOnly && onChange) {
        onChange({ 
          lng, 
          lat, 
          address: addressInput 
        });
      }
      
      // If draggable, add dragend event
      if (!readOnly && marker.current) {
        marker.current.on('dragend', () => {
          const lngLat = marker.current?.getLngLat();
          if (lngLat) {
            log.info("Marker dragged to new position", { lng: lngLat.lng, lat: lngLat.lat });
            reverseGeocode(lngLat.lng, lngLat.lat).then(address => {
              if (address) {
                setAddressInput(address);
                if (onChange) {
                  onChange({
                    lng: lngLat.lng,
                    lat: lngLat.lat,
                    address
                  });
                }
              }
            });
          }
        });
      }
      
      // Center map
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15
      });
    } catch (err) {
      log.error("Error adding marker", { error: err, lng, lat });
      setError('שגיאה בהוספת סמן למפה');
    }
  };

  // Initialize map when container is ready
  const initializeMap = (mapContainer: HTMLDivElement) => {
    try {
      log.info("Initializing map", { hasCoordinates: !!coordinates });
      setError(null);
      
      if (!MAPBOX_TOKEN) {
        setError('מפתח Mapbox חסר, לא ניתן לטעון את המפה');
        setLoading(false);
        return;
      }
      
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const mapOptions = { 
        container: mapContainer,
        ...getMapOptions(coordinates)
      };

      // Create new map instance
      map.current = new mapboxgl.Map(mapOptions);

      // Add error handler
      map.current.on('error', (e) => {
        log.error('Mapbox error:', { error: e });
        setError('אירעה שגיאה בטעינת המפה');
      });

      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }));

      // Set up map when loaded
      map.current.on('load', () => {
        log.info("Map loaded successfully");
        setLoading(false);
        
        if (!readOnly && map.current) {
          // Add click listener to set marker
          map.current.on('click', (e) => {
            log.info("Map clicked", { lng: e.lngLat.lng, lat: e.lngLat.lat });
            addMarker(e.lngLat.lng, e.lngLat.lat);
            reverseGeocode(e.lngLat.lng, e.lngLat.lat).then(address => {
              if (address) {
                setAddressInput(address);
                if (onChange) {
                  onChange({
                    lng: e.lngLat.lng,
                    lat: e.lngLat.lat,
                    address
                  });
                }
              }
            });
          });
        }
        
        // Initialize marker if we have coordinates
        if (coordinates) {
          log.info("Adding initial marker from coordinates", coordinates);
          addMarker(coordinates.lng, coordinates.lat);
        } 
        // Or geocode the address if provided
        else if (address) {
          log.info("Geocoding initial address", { address });
          handleAddressSearch();
        }
      });
    } catch (err) {
      log.error('Error initializing map:', { error: err });
      setError('אירעה שגיאה בטעינת המפה');
      setLoading(false);
    }
  };
  
  // Handle search form submission
  const handleAddressSearch = () => {
    geocodeAddress(
      addressInput,
      ({ lng, lat, address }) => {
        log.info("Address geocoded successfully", { lng, lat, address });
        addMarker(lng, lat);
        setAddressInput(address);
        if (!readOnly && onChange) {
          onChange({ lng, lat, address });
        }
      },
      (errorMessage) => {
        log.error("Geocoding error", { error: errorMessage, address: addressInput });
        setError(errorMessage);
      },
      setLoading
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {!readOnly && (
        <div className="mb-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="map-search" className="sr-only">חפש כתובת</Label>
              <Input
                id="map-search"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="הזן כתובת לחיפוש"
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddressSearch();
                  }
                }}
              />
            </div>
            <Button 
              type="button" 
              onClick={handleAddressSearch} 
              disabled={loading || !addressInput.trim()}
            >
              חפש
            </Button>
          </div>
        </div>
      )}
      
      <MapContainer 
        loading={loading} 
        error={error}
        onRetry={() => {
          setError(null);
          if (map.current) {
            map.current.remove();
            map.current = null;
          }
          setLoading(true);
          if (mapContainer.current) {
            initializeMap(mapContainer.current);
          }
        }}
        mapInitialized={initializeMap}
      />
      
      {!readOnly && (
        <p className="text-xs text-gray-500 mt-2 text-center">לחץ על המפה כדי לסמן מיקום, או הזן כתובת בשדה החיפוש</p>
      )}
    </div>
  );
};

export default LocationMap;
