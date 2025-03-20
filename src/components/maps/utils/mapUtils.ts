
import { logger } from '@/utils/logger';

// Use a working public token for Mapbox
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWxhZGhpdGVjbGVhcm5pbmciLCJhIjoiY2x1Z2N3NmttMTJnYzJqcWg2ZGQ4eHpzNCJ9.ImnRI7WC8qVaRKcpxr9l8A';

// Default map options for Israel
export const getMapOptions = (coordinates?: { lat: number; lng: number } | null) => {
  const defaultOptions = {
    style: 'mapbox://styles/mapbox/streets-v12',
    center: coordinates 
      ? [coordinates.lng, coordinates.lat] as [number, number]
      : [35.217018, 32.722756] as [number, number], // Israel center
    zoom: coordinates ? 15 : 7,
    minZoom: 3,
    maxZoom: 19
  };
  
  return defaultOptions;
};

// Geocode an address to get coordinates
export const geocodeAddress = async (
  address: string,
  onSuccess: (result: { lng: number; lat: number; address: string }) => void,
  onError: (message: string) => void,
  setLoading: (loading: boolean) => void
) => {
  try {
    setLoading(true);
    
    if (!address.trim()) {
      onError('יש להזין כתובת לחיפוש');
      setLoading(false);
      return;
    }
    
    // Add Israel as a bias if not specified in the address
    let searchTerm = address;
    if (!address.includes('ישראל') && !address.includes('Israel')) {
      searchTerm = `${address}, Israel`;
    }
    
    const encodedAddress = encodeURIComponent(searchTerm);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&country=il&language=he&limit=1`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      onError('הכתובת לא נמצאה');
      setLoading(false);
      return;
    }
    
    const feature = data.features[0];
    const [lng, lat] = feature.center;
    const placeName = feature.place_name;
    
    onSuccess({
      lng,
      lat,
      address: placeName
    });
  } catch (error) {
    logger.error('Error geocoding address:', { error, address });
    onError('אירעה שגיאה בחיפוש הכתובת');
  } finally {
    setLoading(false);
  }
};

// Reverse geocode coordinates to get an address
export const reverseGeocode = async (
  lng: number,
  lat: number,
  onChange?: (result: { lng: number; lat: number; address: string }) => void
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=he`
    );
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return null;
    }
    
    const address = data.features[0].place_name;
    
    // Call onChange if provided
    if (onChange) {
      onChange({
        lng,
        lat,
        address
      });
    }
    
    return address;
  } catch (error) {
    logger.error('Error reverse geocoding:', { error, coordinates: { lng, lat } });
    return null;
  }
};
