
import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { logger } from '@/utils/logger';

interface UseMarkerManagementProps {
  initialAddress: string;
  initialCoordinates: { lat: number; lng: number } | null;
  onChange?: (value: { lat: number; lng: number; address: string }) => void;
  onAddressChange?: (address: string) => void;
  readOnly?: boolean;
}

// Default center coordinates (Israel)
const DEFAULT_CENTER = { lat: 32.0853, lng: 34.7818 };

// Configure mapboxgl with token
// This token should be replaced with an environment variable or a secret in production
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 
  'pk.eyJ1Ijoia2lkdXNoaXNoaSIsImEiOiJjbHo1cDN5ejQwcTQ3MnFwODB0Y3VyYjVsIn0.Vc2GD8nzFzvZvfZ7Jzac9Q';

/**
 * Custom hook for marker management on maps
 */
const useMarkerManagement = ({
  initialAddress,
  initialCoordinates,
  onChange,
  onAddressChange,
  readOnly = false
}: UseMarkerManagementProps) => {
  const log = logger.createLogger({ component: 'useMarkerManagement' });
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(initialCoordinates);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  const handleMapInitialized = (mapContainer: HTMLDivElement) => {
    try {
      log.info("Initializing map");
      
      // Create map instance
      const mapInstance = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coordinates || DEFAULT_CENTER,
        zoom: 13
      });

      // Add navigation control
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Setup map event handlers
      mapInstance.on('load', () => {
        setLoading(false);
        log.info("Map loaded");
        
        // Add marker if we have coordinates
        if (coordinates) {
          addMarker(mapInstance, coordinates);
        } 
        // Search for initial address if provided
        else if (initialAddress && !readOnly) {
          handleAddressSearch(initialAddress);
        }
      });

      // Add click handler if not read-only
      if (!readOnly) {
        mapInstance.on('click', (e) => {
          const clickedCoordinates = {
            lat: e.lngLat.lat,
            lng: e.lngLat.lng
          };
          
          // Add marker at clicked location
          addMarker(mapInstance, clickedCoordinates);
          
          // Get address for clicked coordinates
          reverseGeocode(clickedCoordinates);
        });
      }

      // Handle errors
      mapInstance.on('error', (e) => {
        log.error("Mapbox error:", { error: e });
        setError('מפה לא זמינה. נא לנסות שוב מאוחר יותר.');
        setLoading(false);
      });

      // Set map
      setMap(mapInstance);
    } catch (error) {
      log.error("Error initializing map:", { error });
      setError('אירעה שגיאה בהצגת המפה. נא לנסות שוב מאוחר יותר.');
      setLoading(false);
    }
  };

  // Add/update marker
  const addMarker = (mapInstance: mapboxgl.Map, coords: { lat: number; lng: number }) => {
    // Remove existing marker
    if (marker) {
      marker.remove();
    }

    // Create new marker
    const newMarker = new mapboxgl.Marker()
      .setLngLat([coords.lng, coords.lat])
      .addTo(mapInstance);
    
    // Update state
    setMarker(newMarker);
    setCoordinates(coords);
    
    // Center map
    mapInstance.flyTo({
      center: [coords.lng, coords.lat],
      zoom: 14,
      essential: true
    });
  };

  // Search address and place marker
  const handleAddressSearch = async (address: string) => {
    if (!address.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      log.info("Searching for address:", { address });
      
      // Geocode using Mapbox API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?` +
        `access_token=${mapboxgl.accessToken}&country=il&language=he`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const result = data.features[0];
        const foundCoordinates = {
          lng: result.center[0],
          lat: result.center[1]
        };
        
        // Add marker on map
        if (map) {
          addMarker(map, foundCoordinates);
        }
        
        // Update the state and call onChange
        handleLocationSelected({
          lat: foundCoordinates.lat,
          lng: foundCoordinates.lng,
          address: result.place_name
        });

        log.info("Found location for address:", {
          address,
          location: foundCoordinates
        });
      } else {
        setError('לא נמצאה כתובת. נא לנסות שוב או לבחור במפה.');
        log.warn("No results found for address:", { address });
      }
    } catch (error) {
      log.error("Error searching for address:", { error });
      setError('אירעה שגיאה בחיפוש הכתובת. נא לנסות שוב.');
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocoding - get address from coordinates
  const reverseGeocode = async (coords: { lat: number; lng: number }) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?` +
        `access_token=${mapboxgl.accessToken}&language=he`
      );
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        
        // Update address and call callbacks
        handleLocationSelected({
          lat: coords.lat,
          lng: coords.lng,
          address
        });
        
        log.info("Reverse geocoded address:", { coords, address });
      }
    } catch (error) {
      log.error("Error reverse geocoding:", { error });
    }
  };

  // Handle location selection
  const handleLocationSelected = (location: { lat: number; lng: number; address: string }) => {
    // Update address if callback provided
    if (onAddressChange) {
      onAddressChange(location.address);
    }
    
    // Call onChange callback if provided
    if (onChange) {
      onChange(location);
    }
  };

  return {
    loading,
    error,
    coordinates,
    setError,
    setLoading,
    handleAddressSearch,
    handleMapInitialized,
    handleLocationSelected,
  };
};

export default useMarkerManagement;
