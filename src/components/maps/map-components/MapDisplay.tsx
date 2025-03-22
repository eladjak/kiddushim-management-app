
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

interface MapDisplayProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  mapInitialized: (mapContainer: HTMLDivElement) => void;
  className?: string;
}

/**
 * Display component for maps that handles loading states, error states,
 * and map initialization
 */
const MapDisplay: React.FC<MapDisplayProps> = ({
  loading,
  error,
  onRetry,
  mapInitialized,
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const log = logger.createLogger({ component: 'MapDisplay' });

  useEffect(() => {
    if (!mapContainer.current) {
      log.warn("Map container ref is not available");
      return;
    }
    
    try {
      log.info("Initializing map display");
      mapInitialized(mapContainer.current);
    } catch (err) {
      log.error("Error initializing map display", { error: err });
    }
    
    // Only needed at component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-100 rounded-md">
        <p className="text-red-500 mb-3 text-center">{error}</p>
        <Button 
          variant="secondary"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          נסה שוב
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative flex-1 min-h-[300px] rounded-md overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-gray-600">טוען מפה...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapDisplay;
