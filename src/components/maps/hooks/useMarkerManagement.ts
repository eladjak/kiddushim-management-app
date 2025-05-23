import { useState, useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface UseMarkerManagementProps {
  initialPosition?: { lat: number; lng: number };
}

export const useMarkerManagement = ({ initialPosition }: UseMarkerManagementProps = {}) => {
  const [position, setPosition] = useState(initialPosition);
  const [address, setAddress] = useState<string | null>(null);
  const map = useMap();
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useMarkerManagement' });

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
      log.info('Initial position set', { initialPosition });
    }
  }, [initialPosition, log]);

  useEffect(() => {
    if (position && map) {
      log.info('Setting marker at position', { position });
      
      // Fly to the location
      map.flyTo([position.lat, position.lng], map.getZoom(), {
        animate: true,
      });

      // Add marker if it doesn't exist
      let marker = map.getLayers().find(layer => (layer as any).options?.isMarker);
      if (!marker) {
        marker = L.marker([position.lat, position.lng], {
          icon: L.icon({
            iconUrl: '/marker-icon.png',
            iconRetinaUrl: '/marker-icon-2x.png',
            shadowUrl: '/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          }),
          zIndexOffset: 1000,
          isMarker: true,
        }).addTo(map);
      } else {
        (marker as L.Marker).setLatLng([position.lat, position.lng]);
      }
    }
  }, [position, map, log]);

  useEffect(() => {
    if (position) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.lat}&lon=${position.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setAddress(data.display_name);
            log.info('Address found for position', { position, address: data.display_name });
          } else {
            setAddress(null);
            log.warn('No address found for position', { position });
          }
        })
        .catch(error => {
          console.error("Error fetching address:", error);
          setAddress(null);
          toast({
            title: "Error",
            description: "Could not fetch address for this location.",
            variant: "destructive",
          });
        });
    }
  }, [position, toast, log]);

  const handleSearch = useCallback((address: string) => {
    log.info('Searching for address', { address });

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const firstResult = data[0];
          const newPosition = { lat: parseFloat(firstResult.lat), lng: parseFloat(firstResult.lon) };
          setPosition(newPosition);
          log.info('Address found, setting new position', { address, newPosition });
        } else {
          toast({
            title: "No results",
            description: "Could not find this address.",
            variant: "destructive",
          });
          log.warn('No results found for address', { address });
        }
      })
      .catch(error => {
        console.error("Error searching address:", error);
        toast({
          title: "Error",
          description: "Could not search for this address.",
          variant: "destructive",
        });
        log.error('Error searching address', { address, error });
      });
  }, [map, toast, log]);

  return { position, address, setPosition, handleSearch };
};
