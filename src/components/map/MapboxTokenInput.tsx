
import React, { useState } from 'react';
import { useMapbox } from '@/context/MapboxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

const MapboxTokenInput: React.FC = () => {
  const { setToken, isTokenSet } = useMapbox();
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
        <CardTitle className="text-lg">Mapbox Access Token Required</CardTitle>
        <CardDescription>
          Please enter your Mapbox public access token to enable map functionality.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="pk.eyJ1Ijoi..."
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            required
          />
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
