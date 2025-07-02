
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface MapboxTokenCheckProps {
  children: React.ReactNode;
}

export const MapboxTokenCheck: React.FC<MapboxTokenCheckProps> = ({ children }) => {
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [customToken, setCustomToken] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const mapboxToken = 'pk.eyJ1IjoiZWxhZGhpdGVjbGVhcm5pbmciLCJhIjoiY2x1Z2N3NmttMTJnYzJqcWg2ZGQ4eHpzNCJ9.ImnRI7WC8qVaRKcpxr9l8A';

  useEffect(() => {
    checkTokenValidity(mapboxToken);
  }, [mapboxToken]);

  const checkTokenValidity = async (token: string) => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch(`https://api.mapbox.com/tokens/v2?access_token=${token}`);
      setTokenValid(response.ok);
    } catch (error) {
      console.error('Error checking Mapbox token:', error);
      setTokenValid(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCustomTokenTest = () => {
    if (customToken.trim()) {
      checkTokenValidity(customToken.trim());
    }
  };

  if (tokenValid === null || isChecking) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin h-6 w-6 mr-2" />
        <span>בודק תקינות Mapbox token...</span>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="p-6 space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p>Mapbox access token לא תקין או חסר. כדי להציג מפות, נדרש token תקין.</p>
              
              <div className="space-y-2">
                <Label htmlFor="mapbox-token">הזן Mapbox access token</Label>
                <div className="flex gap-2">
                  <Input
                    id="mapbox-token"
                    type="text"
                    placeholder="pk.eyJ1..."
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button 
                    onClick={handleCustomTokenTest}
                    disabled={!customToken.trim() || isChecking}
                  >
                    בדוק
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                ניתן לקבל access token בחינם ב-
                <a 
                  href="https://account.mapbox.com/access-tokens/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mx-1"
                >
                  mapbox.com
                </a>
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
