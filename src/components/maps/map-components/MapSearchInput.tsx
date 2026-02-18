
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface MapSearchInputProps {
  addressInput: string;
  setAddressInput: (address: string) => void;
  handleAddressSearch: () => void;
  loading: boolean;
}

const MapSearchInput: React.FC<MapSearchInputProps> = ({
  addressInput,
  setAddressInput,
  handleAddressSearch,
  loading
}) => {
  return (
    <div className="mb-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Label htmlFor="map-search" className="sr-only">חפש כתובת</Label>
          <Input
            id="map-search"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="הזן כתובת לחיפוש"
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddressSearch();
              }
            }}
          />
        </div>
        <Button 
          type="button" 
          onClick={handleAddressSearch} 
          disabled={loading || !addressInput.trim()}
        >
          {loading ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : null}
          חפש
        </Button>
      </div>
    </div>
  );
};

export default MapSearchInput;
