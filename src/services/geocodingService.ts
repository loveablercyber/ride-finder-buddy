
import { Location, Route } from '@/types';

// Função para geocodificar um endereço (simulada)
export const geocodeAddress = async (address: string): Promise<Location | null> => {
  try {
    // Em uma implementação real, aqui seria feita uma chamada a uma API de geocodificação
    // como o Google Maps, Nominatim (OpenStreetMap), etc.
    
    // Simulação de geocodificação
    console.log(`Geocoding address: ${address}`);
    
    // Check if this is a city lookup
    const isCityLookup = address.split(',').length <= 2 && !address.match(/\d+/);
    
    // Base coordinates for known cities
    const cityCoordinates: Record<string, [number, number]> = {
      'São Paulo': [-23.5505, -46.6333],
      'Rio de Janeiro': [-22.9068, -43.1729],
      'Belo Horizonte': [-19.9167, -43.9345],
      'Salvador': [-12.9714, -38.5014],
      'Curitiba': [-25.4289, -49.2671],
      'Porto Alegre': [-30.0346, -51.2177],
      'Campinas': [-22.9071, -47.0625],
      'Santos': [-23.9619, -46.3322],
      'Guarulhos': [-23.4543, -46.5337],
      'Ribeirão Preto': [-21.1775, -47.8102],
    };
    
    // For city lookups, use fixed coordinates
    if (isCityLookup) {
      for (const city in cityCoordinates) {
        if (address.includes(city)) {
          const [lat, lng] = cityCoordinates[city];
          return {
            latitude: lat,
            longitude: lng,
            address: address,
          };
        }
      }
    }
    
    // Adicionando um pouco de aleatoriedade para simular diferentes localizações
    const randomLat = -23.55 + (Math.random() - 0.5) * 0.1;
    const randomLng = -46.63 + (Math.random() - 0.5) * 0.1;
    
    return {
      latitude: randomLat,
      longitude: randomLng,
      address: address, // Incluindo o endereço completo com número e cidade
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Calcular rota entre dois pontos (simulado)
export const calculateRoute = (origin: Location, destination: Location): Route => {
  // Em uma implementação real, aqui seria feita uma chamada a uma API de rotas
  // como o Google Directions, OSRM, etc.
  
  // Calcula a distância em linha reta (fórmula de Haversine)
  const R = 6371; // Raio da Terra em km
  const dLat = (destination.latitude - origin.latitude) * Math.PI / 180;
  const dLon = (destination.longitude - origin.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c * 1.3; // Multiplica por 1.3 para simular a distância real (não em linha reta)
  
  // Assume uma velocidade média de 30km/h para calcular o tempo
  const duration = (distance / 30) * 60 * 60; // Converte para segundos
  
  // Cria pontos intermediários para a rota
  const numPoints = 10;
  const coordinates: [number, number][] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const lat = origin.latitude + fraction * (destination.latitude - origin.latitude);
    const lng = origin.longitude + fraction * (destination.longitude - origin.longitude);
    coordinates.push([lng, lat]);
  }
  
  return {
    distance: parseFloat(distance.toFixed(2)),
    duration: Math.floor(duration),
    geometry: {
      coordinates: coordinates
    }
  };
};

// Helper function to create a complete address with number and city
export const formatCompleteAddress = (street: string, number: string, city: string): string => {
  return `${street}, ${number}, ${city}`;
};

// Função auxiliar para extrair a cidade do endereço completo
export const extractCityFromAddress = (address: string): string => {
  const parts = address.split(', ');
  return parts.length > 2 ? parts[2] : '';
};
