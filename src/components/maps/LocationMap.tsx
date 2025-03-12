
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import MapContainer from './map/MapContainer';
import { MAPBOX_TOKEN, geocodeAddress, reverseGeocode, getMapOptions } from './utils/mapUtils';

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

  // Add marker to map
  const addMarker = (lng: number, lat: number) => {
    if (!map.current) return;
    
    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }
    
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
    if (!readOnly) {
      marker.current.on('dragend', () => {
        const lngLat = marker.current?.getLngLat();
        if (lngLat) {
          reverseGeocode(lngLat.lng, lngLat.lat, onChange).then(address => {
            if (address) setAddressInput(address);
          });
        }
      });
    }
    
    // Center map
    map.current.flyTo({
      center: [lng, lat],
      zoom: 15
    });
  };

  // Initialize map when container is ready
  const initializeMap = (mapContainer: HTMLDivElement, mapInstance: mapboxgl.Map | null) => {
    try {
      setError(null);
      
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const mapOptions = { 
        container: mapContainer,
        ...getMapOptions(coordinates)
      };

      map.current = new mapboxgl.Map(mapOptions);

      // Add error handler
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('אירעה שגיאה בטעינת המפה');
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }));

      map.current.on('load', () => {
        setLoading(false);
        
        if (!readOnly) {
          // Add click listener to set marker
          map.current?.on('click', (e) => {
            addMarker(e.lngLat.lng, e.lngLat.lat);
            reverseGeocode(e.lngLat.lng, e.lngLat.lat, onChange).then(address => {
              if (address) setAddressInput(address);
            });
          });
        }
        
        // Initialize marker if we have coordinates
        if (coordinates) {
          addMarker(coordinates.lng, coordinates.lat);
        } 
        // Or geocode the address if provided
        else if (address) {
          handleSearch({ preventDefault: () => {} } as React.FormEvent);
        }
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('אירעה שגיאה בטעינת המפה');
      setLoading(false);
    }
  };
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    geocodeAddress(
      addressInput,
      ({ lng, lat, address }) => {
        addMarker(lng, lat);
        setAddressInput(address);
        if (!readOnly && onChange) {
          onChange({ lng, lat, address });
        }
      },
      (errorMessage) => {
        setError(errorMessage);
      },
      setLoading
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {!readOnly && (
        <form onSubmit={handleSearch} className="mb-3 flex gap-2">
          <div className="flex-1">
            <Label htmlFor="map-search" className="sr-only">חפש כתובת</Label>
            <Input
              id="map-search"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="הזן כתובת לחיפוש"
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={loading}>חפש</Button>
        </form>
      )}
      
      <MapContainer 
        loading={loading} 
        error={error}
        onRetry={() => setError(null)}
        mapInitialized={initializeMap}
      />
      
      {!readOnly && (
        <p className="text-xs text-gray-500 mt-2 text-center">לחץ על המפה כדי לסמן מיקום, או הזן כתובת בשדה החיפוש</p>
      )}
    </div>
  );
};

export default LocationMap;
