
import React, { useState } from 'react';
import { useMapbox } from '@/context/MapboxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, MapPin } from 'lucide-react';

interface MapboxTokenInputProps {
  pickup?: { latitude: number; longitude: number; address: string };
  dropoff?: { latitude: number; longitude: number; address: string };
}

const MapboxTokenInput: React.FC<MapboxTokenInputProps> = ({ pickup, dropoff }) => {
  const { setToken, isTokenSet, openInMapsApp } = useMapbox();
  const [inputToken, setInputToken] = useState('');
  const [isEditing, setIsEditing] = useState(!isTokenSet);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToken(inputToken);
    setIsEditing(false);
  };

  if (isTokenSet && !isEditing) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mapbox Token</CardTitle>
          <CardDescription>Your Mapbox token is set</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
          >
            Change Token
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Map Navigation</CardTitle>
        <CardDescription>
          {pickup && dropoff ? (
            <>Open locations in your device's navigation app</>
          ) : (
            <>Set up map view or use direct navigation</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(pickup || dropoff) && (
          <div className="space-y-4 mb-4">
            {pickup && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="text-sm">
                    {pickup.address.split(',').slice(0, 2).join(',')}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openInMapsApp(pickup.latitude, pickup.longitude, "Pickup location")}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Navigate
                </Button>
              </div>
            )}
            
            {dropoff && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  </div>
                  <div className="text-sm">
                    {dropoff.address.split(',').slice(0, 2).join(',')}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openInMapsApp(dropoff.latitude, dropoff.longitude, "Dropoff location")}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Navigate
                </Button>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Configure map view (optional)</div>
            <Input
              placeholder="pk.eyJ1Ijoi..."
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a 
              href="https://docs.mapbox.com/help/getting-started/access-tokens/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              How to get a token <ExternalLink size={14} />
            </a>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!inputToken.trim()}>
          Save Token
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MapboxTokenInput;
