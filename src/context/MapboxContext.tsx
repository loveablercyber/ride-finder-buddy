
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

type MapboxContextType = {
  token: string;
  setToken: (token: string) => void;
  isTokenSet: boolean;
  openInMapsApp: (lat: number, lng: number, label?: string) => void;
};

const MapboxContext = createContext<MapboxContextType>({
  token: '',
  setToken: () => {},
  isTokenSet: false,
  openInMapsApp: () => {},
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

  // Function to open coordinates in default navigation app
  const openInMapsApp = (lat: number, lng: number, label?: string) => {
    // Detect mobile operating system
    const userAgent = navigator.userAgent || navigator.vendor;
    
    let url = '';
    
    // iOS devices (Apple Maps)
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      url = `maps://maps.apple.com/?q=${lat},${lng}`;
      if (label) {
        url = `maps://maps.apple.com/?q=${encodeURIComponent(label)}&ll=${lat},${lng}`;
      }
    } 
    // Android devices (Google Maps)
    else if (/android/i.test(userAgent)) {
      url = `geo:${lat},${lng}`;
      if (label) {
        url = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`;
      }
    }
    // Desktop fallback (Google Maps in browser)
    else {
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      if (label) {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
      }
    }
    
    // Open the URL
    window.open(url, '_blank');
  };

  return (
    <MapboxContext.Provider value={{ token, setToken: handleSetToken, isTokenSet, openInMapsApp }}>
      {children}
    </MapboxContext.Provider>
  );
};
