
import React, { useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Loader2 } from 'lucide-react';

interface MapContainerProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  mapInitialized: (mapContainer: HTMLDivElement, map: mapboxgl.Map | null) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  loading,
  error,
  onRetry,
  mapInitialized
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (mapContainer.current) {
      mapInitialized(mapContainer.current, null);
    }
  }, [mapInitialized]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-100 rounded-md">
        <p className="text-red-500 mb-3">{error}</p>
        <button 
          className="bg-primary text-white px-4 py-2 rounded" 
          onClick={onRetry}
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-[300px] rounded-md overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center z-10">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapContainer;
