
import { Location, Route } from '@/types';

// Interface para os resultados da API do Nominatim
export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  boundingbox: string[];
}

// Geocodificar endereço para coordenadas
export const geocodeAddress = async (query: string): Promise<Location | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'User-Agent': 'IndriveLovableApp/1.0',
        },
      }
    );

    const data: NominatimResult[] = await response.json();

    if (data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      longitude: parseFloat(result.lon),
      latitude: parseFloat(result.lat),
      address: result.display_name,
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Calcular a rota entre dois pontos
export const calculateRoute = (pickup: Location, dropoff: Location): Route => {
  // Calcular distância usando a fórmula de Haversine
  const R = 6371; // Raio da Terra em km
  const dLat = (dropoff.latitude - pickup.latitude) * Math.PI / 180;
  const dLon = (dropoff.longitude - pickup.longitude) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pickup.latitude * Math.PI / 180) * Math.cos(dropoff.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Adicionar 30% para considerar que rotas reais não são em linha reta
  const distance = R * c * 1.3;

  // Criar pontos intermediários para a linha da rota
  const steps = 4; // Número de pontos na rota
  const coordinates: [number, number][] = [];
  
  for (let i = 0; i < steps; i++) {
    const fraction = i / (steps - 1);
    const intermediatePoint: [number, number] = [
      pickup.longitude + fraction * (dropoff.longitude - pickup.longitude),
      pickup.latitude + fraction * (dropoff.latitude - pickup.latitude)
    ];
    coordinates.push(intermediatePoint);
  }

  return {
    distance: parseFloat(distance.toFixed(2)),
    duration: Math.round(distance * 3 * 60), // Estimativa: 3 min por km
    geometry: {
      coordinates: coordinates
    }
  };
};
