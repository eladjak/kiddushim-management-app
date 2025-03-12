import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// For development purposes - should be moved to environment variables
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNsdTI4M3FxajA0aW0ya2xnbzAydGl4enYifQ.ZNxOA1MFV-vZRH6oYYN3yQ';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState(address || value?.address || '');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const mapOptions: mapboxgl.MapOptions = {
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coordinates ? [coordinates.lng, coordinates.lat] : [34.7818, 32.0853], // Default to Tel Aviv
        zoom: coordinates ? 15 : 10,
        language: 'he-IL',
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
            reverseGeocode(e.lngLat.lng, e.lngLat.lat);
          });
        }
        
        // Initialize marker if we have coordinates
        if (coordinates) {
          addMarker(coordinates.lng, coordinates.lat);
        } 
        // Or geocode the address if provided
        else if (address) {
          geocodeAddress(address);
        }
      });

      // Cleanup
      return () => {
        map.current?.remove();
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('אירעה שגיאה בטעינת המפה');
      setLoading(false);
    }
  }, []);

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
          reverseGeocode(lngLat.lng, lngLat.lat);
        }
      });
    }
    
    // Center map
    map.current.flyTo({
      center: [lng, lat],
      zoom: 15
    });
  };

  // Geocode address to coordinates
  const geocodeAddress = async (searchAddress: string) => {
    if (!searchAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const encodedAddress = encodeURIComponent(searchAddress);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&language=he-IL`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        addMarker(lng, lat);
        
        // Update address with formatted result
        const formattedAddress = data.features[0].place_name;
        setAddressInput(formattedAddress);
        
        if (!readOnly && onChange) {
          onChange({ lng, lat, address: formattedAddress });
        }
      } else {
        setError('לא נמצאו תוצאות עבור הכתובת שהוזנה');
      }
    } catch (err) {
      console.error('Geocoding error', err);
      setError('אירעה שגיאה בחיפוש הכתובת');
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocode - get address from coordinates
  const reverseGeocode = async (lng: number, lat: number) => {
    if (!onChange || readOnly) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=he-IL`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const formattedAddress = data.features[0].place_name;
        setAddressInput(formattedAddress);
        
        if (onChange) {
          onChange({ lng, lat, address: formattedAddress });
        }
      }
    } catch (err) {
      console.error('Reverse geocoding error', err);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    geocodeAddress(addressInput);
  };

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-100 rounded-md">
        <p className="text-red-500 mb-3">{error}</p>
        <Button onClick={() => setError(null)}>נסה שוב</Button>
      </div>
    );
  }

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
      
      <div className="relative flex-1 min-h-[300px] rounded-md overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center z-10">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
      </div>
      
      {!readOnly && (
        <p className="text-xs text-gray-500 mt-2 text-center">לחץ על המפה כדי לסמן מיקום, או הזן כתובת בשדה החיפוש</p>
      )}
    </div>
  );
};

export default LocationMap;
