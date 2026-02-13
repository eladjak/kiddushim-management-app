
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface UseMarkerManagementProps {
  initialPosition?: { lat: number; lng: number };
  onLocationChange?: (location: { lat: number; lng: number }) => void;
}

export const useMarkerManagement = ({ initialPosition, onLocationChange }: UseMarkerManagementProps = {}) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialPosition || null);
  const [address, setAddress] = useState<string | null>(null);
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useMarkerManagement' });

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
      log.info('Initial position set', { initialPosition });
    }
  }, [initialPosition, log]);

  // Effect for notifying parent component about location changes
  useEffect(() => {
    if (position && onLocationChange) {
      onLocationChange(position);
    }
  }, [position, onLocationChange]);

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
          log.error('Error fetching address', { error });
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
        log.error('Error searching address', { error });
        toast({
          title: "Error",
          description: "Could not search for this address.",
          variant: "destructive",
        });
        log.error('Error searching address', { error, addressInput: address });
      });
  }, [toast, log]);

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; address: string }) => {
    setPosition({ lat: location.lat, lng: location.lng });
    setAddress(location.address);
    log.info('Location manually selected', { location });
  }, [log]);

  return { 
    position, 
    address, 
    setPosition, 
    handleSearch,
    handleLocationSelect
  };
};
