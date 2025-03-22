
import React, { useState } from 'react';
import { logger } from '@/utils/logger';
import MapSearchInput from './map-components/MapSearchInput';
import MapDisplay from './map-components/MapDisplay';
import useMarkerManagement from './hooks/useMarkerManagement';

interface LocationMapProps {
  address?: string;
  value?: { lat: number; lng: number; address: string };
  onChange?: (value: { lat: number; lng: number; address: string }) => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * A location map component that allows location selection and display
 */
const LocationMap: React.FC<LocationMapProps> = ({ 
  address, 
  value, 
  onChange,
  readOnly = false,
  className = ''
}) => {
  const log = logger.createLogger({ component: 'LocationMap' });
  const [addressInput, setAddressInput] = useState(address || value?.address || '');
  
  const {
    loading,
    error,
    coordinates,
    setError,
    setLoading,
    handleAddressSearch,
    handleMapInitialized,
    handleLocationSelected,
  } = useMarkerManagement({
    initialAddress: addressInput,
    initialCoordinates: value ? { lat: value.lat, lng: value.lng } : null,
    onChange,
    onAddressChange: setAddressInput,
    readOnly
  });

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {!readOnly && (
        <MapSearchInput
          addressInput={addressInput}
          setAddressInput={setAddressInput}
          handleAddressSearch={() => handleAddressSearch(addressInput)}
          loading={loading}
        />
      )}
      
      <MapDisplay 
        loading={loading} 
        error={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
        }}
        mapInitialized={handleMapInitialized}
      />
      
      {!readOnly && (
        <p className="text-xs text-gray-500 mt-2 text-center">לחץ על המפה כדי לסמן מיקום, או הזן כתובת בשדה החיפוש</p>
      )}
    </div>
  );
};

export default LocationMap;
