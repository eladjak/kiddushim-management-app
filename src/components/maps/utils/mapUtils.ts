
import { safeEncodeHebrew, safeDecodeHebrew } from "@/integrations/supabase/setupStorage";

export const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNsdTI4M3FxajA0aW0ya2xnbzAydGl4enYifQ.ZNxOA1MFV-vZRH6oYYN3yQ';

// Geocode address to coordinates
export const geocodeAddress = async (
  searchAddress: string,
  onSuccess: (result: { lng: number; lat: number; address: string }) => void,
  onError: (errorMessage: string) => void,
  setLoading: (loading: boolean) => void
) => {
  if (!searchAddress) return;
  
  setLoading(true);
  
  try {
    const encodedAddress = encodeURIComponent(searchAddress);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&language=he-IL`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      const formattedAddress = data.features[0].place_name;
      
      onSuccess({ lng, lat, address: formattedAddress });
    } else {
      onError('לא נמצאו תוצאות עבור הכתובת שהוזנה');
    }
  } catch (err) {
    console.error('Geocoding error', err);
    onError('אירעה שגיאה בחיפוש הכתובת');
  } finally {
    setLoading(false);
  }
};

// Reverse geocode - get address from coordinates
export const reverseGeocode = async (
  lng: number, 
  lat: number,
  onChange?: (value: { lat: number; lng: number; address: string }) => void
) => {
  if (!onChange) return;
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=he-IL`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const formattedAddress = data.features[0].place_name;
      
      if (onChange) {
        onChange({ lng, lat, address: formattedAddress });
      }
      
      return formattedAddress;
    }
    
    return null;
  } catch (err) {
    console.error('Reverse geocoding error', err);
    return null;
  }
};

// Initialize map configuration options
export const getMapOptions = (coordinates: { lat: number; lng: number } | null): Omit<mapboxgl.MapOptions, 'container'> => {
  return {
    style: 'mapbox://styles/mapbox/streets-v12',
    center: coordinates ? [coordinates.lng, coordinates.lat] : [34.7818, 32.0853], // Default to Tel Aviv
    zoom: coordinates ? 15 : 10,
    language: 'he-IL',
  };
};
