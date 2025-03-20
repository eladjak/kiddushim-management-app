
import { useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { logger } from '@/utils/logger';
import { MAPBOX_TOKEN, geocodeAddress, reverseGeocode, getMapOptions } from '../utils/mapUtils';

interface UseMarkerManagementProps {
  initialAddress: string;
  initialCoordinates: { lat: number; lng: number } | null;
  onChange?: (value: { lat: number; lng: number; address: string }) => void;
  onAddressChange: (address: string) => void;
  readOnly: boolean;
}

const useMarkerManagement = ({
  initialAddress,
  initialCoordinates,
  onChange,
  onAddressChange,
  readOnly
}: UseMarkerManagementProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(initialCoordinates);
  
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const log = logger.createLogger({ component: 'useMarkerManagement' });

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
          address: initialAddress 
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
                onAddressChange(address);
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

  // Handle address search
  const handleAddressSearch = (searchAddress: string) => {
    geocodeAddress(
      searchAddress,
      ({ lng, lat, address }) => {
        log.info("Address geocoded successfully", { lng, lat, address });
        addMarker(lng, lat);
        onAddressChange(address);
        if (!readOnly && onChange) {
          onChange({ lng, lat, address });
        }
      },
      (errorMessage) => {
        log.error("Geocoding error", { error: errorMessage, address: searchAddress });
        setError(errorMessage);
      },
      setLoading
    );
  };

  // Initialize map when container is ready
  const handleMapInitialized = (mapContainer: HTMLDivElement) => {
    try {
      log.info("Initializing map", { hasCoordinates: !!coordinates });
      setError(null);
      
      if (!MAPBOX_TOKEN) {
        setError('מפתח Mapbox חסר, לא ניתן לטעון את המפה');
        setLoading(false);
        return;
      }
      
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const options = getMapOptions(coordinates);
      const mapOptions = { 
        container: mapContainer,
        style: options.style,
        center: coordinates ? [coordinates.lng, coordinates.lat] as [number, number] : options.center as [number, number],
        zoom: options.zoom,
        minZoom: options.minZoom,
        maxZoom: options.maxZoom
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
                onAddressChange(address);
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
        else if (initialAddress) {
          log.info("Geocoding initial address", { address: initialAddress });
          handleAddressSearch(initialAddress);
        }
      });
    } catch (err) {
      log.error('Error initializing map:', { error: err });
      setError('אירעה שגיאה בטעינת המפה');
      setLoading(false);
    }
  };

  const handleLocationSelected = (location: {lat: number; lng: number; address: string}) => {
    addMarker(location.lng, location.lat);
    onAddressChange(location.address);
  };

  return {
    loading,
    error,
    coordinates,
    setError,
    setLoading,
    handleAddressSearch,
    handleMapInitialized,
    handleLocationSelected
  };
};

export default useMarkerManagement;
