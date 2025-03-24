
import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Location, Route } from '@/types';
import { geocodeAddress, calculateRoute } from '@/services/geocodingService';
import { toast } from 'sonner';

// Fix para ícones do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente para ajustar a visualização do mapa
const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

interface OpenStreetMapProps {
  onSelectPickup?: (location: Location) => void;
  onSelectDropoff?: (location: Location) => void;
  onCalculateRoute?: (route: Route) => void;
  pickupLocation?: Location;
  dropoffLocation?: Location;
  mapOnly?: boolean;
  routeGeometry?: any;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  onSelectPickup,
  onSelectDropoff,
  onCalculateRoute,
  pickupLocation,
  dropoffLocation,
  mapOnly = false,
  routeGeometry
}) => {
  const [pickupSearch, setPickupSearch] = useState('');
  const [dropoffSearch, setDropoffSearch] = useState('');
  const [center, setCenter] = useState<[number, number]>([-23.5505, -46.6333]); // São Paulo
  const [zoom, setZoom] = useState(12);
  const [route, setRoute] = useState<Route | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Atualizar o centro do mapa quando as localizações mudarem
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      // Centralizar no meio do caminho entre origem e destino
      const centerLat = (pickupLocation.latitude + dropoffLocation.latitude) / 2;
      const centerLng = (pickupLocation.longitude + dropoffLocation.longitude) / 2;
      setCenter([centerLat, centerLng]);
      
      // Calcular a rota
      if (!mapOnly && onCalculateRoute) {
        const newRoute = calculateRoute(pickupLocation, dropoffLocation);
        setRoute(newRoute);
        onCalculateRoute(newRoute);
      }
    } else if (pickupLocation) {
      setCenter([pickupLocation.latitude, pickupLocation.longitude]);
    } else if (dropoffLocation) {
      setCenter([dropoffLocation.latitude, dropoffLocation.longitude]);
    }
  }, [pickupLocation, dropoffLocation, onCalculateRoute, mapOnly]);

  // Renderizar rota fornecida externamente
  useEffect(() => {
    if (routeGeometry && !route) {
      setRoute({
        distance: 0,
        duration: 0,
        geometry: routeGeometry
      });
    }
  }, [routeGeometry, route]);

  // Buscar localização por endereço
  const handleSearch = async (type: 'pickup' | 'dropoff') => {
    const query = type === 'pickup' ? pickupSearch : dropoffSearch;
    
    if (!query.trim()) {
      toast.error(`Por favor, digite um ${type === 'pickup' ? 'local de partida' : 'destino'}`);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const location = await geocodeAddress(query);
      
      if (!location) {
        toast.error(`Não foi possível encontrar o endereço: ${query}`);
        return;
      }
      
      if (type === 'pickup' && onSelectPickup) {
        onSelectPickup(location);
      } else if (type === 'dropoff' && onSelectDropoff) {
        onSelectDropoff(location);
      }
      
      setCenter([location.latitude, location.longitude]);
      setZoom(15);
    } catch (error) {
      console.error(`Error searching for ${type}:`, error);
      toast.error(`Erro ao buscar endereço`);
    } finally {
      setIsSearching(false);
    }
  };

  if (mapOnly) {
    return (
      <Card className="overflow-hidden bg-transparent border-none shadow-none">
        <div className="h-[400px] relative rounded-lg overflow-hidden shadow-soft">
          <MapContainer 
            center={center} 
            zoom={zoom} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <ChangeView center={center} zoom={zoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {pickupLocation && (
              <Marker position={[pickupLocation.latitude, pickupLocation.longitude]}>
                <Popup>Local de partida</Popup>
              </Marker>
            )}
            
            {dropoffLocation && (
              <Marker position={[dropoffLocation.latitude, dropoffLocation.longitude]}>
                <Popup>Destino</Popup>
              </Marker>
            )}
            
            {route && (
              <Polyline 
                positions={route.geometry.coordinates.map(coord => [coord[1], coord[0]])} 
                color="#3887be" 
                weight={6} 
                opacity={0.75}
              />
            )}
          </MapContainer>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-transparent border-none shadow-none">
      <div className="h-[400px] relative rounded-lg overflow-hidden shadow-soft">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={center} zoom={zoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {pickupLocation && (
            <Marker position={[pickupLocation.latitude, pickupLocation.longitude]}>
              <Popup>Local de partida</Popup>
            </Marker>
          )}
          
          {dropoffLocation && (
            <Marker position={[dropoffLocation.latitude, dropoffLocation.longitude]}>
              <Popup>Destino</Popup>
            </Marker>
          )}
          
          {route && (
            <Polyline 
              positions={route.geometry.coordinates.map(coord => [coord[1], coord[0]])} 
              color="#3887be" 
              weight={6} 
              opacity={0.75}
            />
          )}
        </MapContainer>
      </div>
      
      <div className="mt-4 space-y-2 animate-fade-in">
        <div className="flex gap-2">
          <Input
            placeholder="Digite o local de partida"
            value={pickupSearch}
            onChange={(e) => setPickupSearch(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch('pickup')}
          />
          <Button 
            onClick={() => handleSearch('pickup')}
            disabled={isSearching || !pickupSearch.trim()}
            size="sm"
          >
            Buscar
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Digite o destino"
            value={dropoffSearch}
            onChange={(e) => setDropoffSearch(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch('dropoff')}
          />
          <Button 
            onClick={() => handleSearch('dropoff')}
            disabled={isSearching || !dropoffSearch.trim()}
            size="sm"
          >
            Buscar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OpenStreetMap;
