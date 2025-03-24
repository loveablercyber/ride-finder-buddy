
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

type MapboxContextType = {
  token: string;
  setToken: (token: string) => void;
  isTokenSet: boolean;
};

const MapboxContext = createContext<MapboxContextType>({
  token: '',
  setToken: () => {},
  isTokenSet: false,
});

export const useMapbox = () => useContext(MapboxContext);

export const MapboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string>('');
  const [isTokenSet, setIsTokenSet] = useState<boolean>(false);

  // Load token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      setToken(storedToken);
      setIsTokenSet(true);
    }
  }, []);

  // Update localStorage when token changes
  const handleSetToken = (newToken: string) => {
    if (!newToken.trim()) {
      toast.error("Please enter a valid Mapbox token");
      return;
    }
    
    localStorage.setItem('mapbox_token', newToken);
    setToken(newToken);
    setIsTokenSet(true);
    toast.success("Mapbox token saved successfully!");
  };

  return (
    <MapboxContext.Provider value={{ token, setToken: handleSetToken, isTokenSet }}>
      {children}
    </MapboxContext.Provider>
  );
};
