
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Card } from '@/components/ui/card';
import { Location, Route } from '@/types';
import { toast } from 'sonner';

// Set Mapbox token
// In a real application, this would come from environment variables or Supabase secrets
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';

interface RideMapProps {
  onSelectPickup?: (location: Location) => void;
  onSelectDropoff?: (location: Location) => void;
  onCalculateRoute?: (route: Route) => void;
  pickupLocation?: Location;
  dropoffLocation?: Location;
  mapOnly?: boolean;
  routeGeometry?: any;
}

const RideMap: React.FC<RideMapProps> = ({
  onSelectPickup,
  onSelectDropoff,
  onCalculateRoute,
  pickupLocation,
  dropoffLocation,
  mapOnly = false,
  routeGeometry
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarker = useRef<mapboxgl.Marker | null>(null);
  const routeLine = useRef<mapboxgl.GeoJSONSource | null>(null);

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      // Check if token is set
      if (!mapboxgl.accessToken || mapboxgl.accessToken === 'YOUR_MAPBOX_TOKEN') {
        toast.warning("Please set your Mapbox token for full map functionality");
      }
      
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-46.6333, -23.5505], // São Paulo
        zoom: 12,
        attributionControl: false
      });

      // Add map controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      
      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Wait for map to load
      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add route source and layer
        map.current?.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });
        
        map.current?.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 6,
            'line-opacity': 0.75
          }
        });
        
        routeLine.current = map.current?.getSource('route') as mapboxgl.GeoJSONSource;
      });

      // Skip geocoder setup if in map-only mode
      if (!mapOnly) {
        // Add geocoder for pickup
        const pickupGeocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken as string,
          mapboxgl: mapboxgl as any,
          marker: false,
          placeholder: 'Enter pickup location'
        });
        
        // Add geocoder for dropoff
        const dropoffGeocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken as string,
          mapboxgl: mapboxgl as any,
          marker: false,
          placeholder: 'Enter destination'
        });
        
        // Add geocoder elements outside the map
        document.getElementById('pickup-geocoder')?.appendChild(pickupGeocoder.onAdd(map.current));
        document.getElementById('dropoff-geocoder')?.appendChild(dropoffGeocoder.onAdd(map.current));
        
        // Listen for results
        pickupGeocoder.on('result', (event) => {
          const [lng, lat] = event.result.center;
          if (pickupMarker.current) {
            pickupMarker.current.remove();
          }
          
          // Add marker
          pickupMarker.current = new mapboxgl.Marker({ color: '#3887be' })
            .setLngLat([lng, lat])
            .addTo(map.current!);
          
          // Save location
          const location: Location = {
            longitude: lng,
            latitude: lat,
            address: event.result.place_name
          };
          
          if (onSelectPickup) {
            onSelectPickup(location);
          }
          
          // Calculate route if both markers exist
          if (pickupMarker.current && dropoffMarker.current && onCalculateRoute) {
            calculateRoute();
          }
        });
        
        dropoffGeocoder.on('result', (event) => {
          const [lng, lat] = event.result.center;
          if (dropoffMarker.current) {
            dropoffMarker.current.remove();
          }
          
          // Add marker
          dropoffMarker.current = new mapboxgl.Marker({ color: '#f50057' })
            .setLngLat([lng, lat])
            .addTo(map.current!);
          
          // Save location
          const location: Location = {
            longitude: lng,
            latitude: lat,
            address: event.result.place_name
          };
          
          if (onSelectDropoff) {
            onSelectDropoff(location);
          }
          
          // Calculate route if both markers exist
          if (pickupMarker.current && dropoffMarker.current && onCalculateRoute) {
            calculateRoute();
          }
        });
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Update pickup marker
    if (pickupLocation) {
      if (pickupMarker.current) {
        pickupMarker.current.remove();
      }
      
      pickupMarker.current = new mapboxgl.Marker({ color: '#3887be' })
        .setLngLat([pickupLocation.longitude, pickupLocation.latitude])
        .addTo(map.current);
    }
    
    // Update dropoff marker
    if (dropoffLocation) {
      if (dropoffMarker.current) {
        dropoffMarker.current.remove();
      }
      
      dropoffMarker.current = new mapboxgl.Marker({ color: '#f50057' })
        .setLngLat([dropoffLocation.longitude, dropoffLocation.latitude])
        .addTo(map.current);
    }
    
    // If both markers exist, calculate route
    if (pickupLocation && dropoffLocation && onCalculateRoute) {
      calculateRoute();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupLocation, dropoffLocation, mapLoaded]);

  // Draw route if geometry is provided
  useEffect(() => {
    if (!map.current || !mapLoaded || !routeGeometry) return;
    
    if (routeLine.current) {
      routeLine.current.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeGeometry.coordinates
        }
      });
      
      // Fit bounds to route
      const bounds = new mapboxgl.LngLatBounds();
      routeGeometry.coordinates.forEach((coord: [number, number]) => {
        bounds.extend(coord);
      });
      
      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 15
      });
    }
  }, [routeGeometry, mapLoaded]);

  // Calculate route
  const calculateRoute = async () => {
    if (!pickupMarker.current || !dropoffMarker.current || !onCalculateRoute) return;
    
    try {
      const start = pickupMarker.current.getLngLat();
      const end = dropoffMarker.current.getLngLat();
      
      // For demo purposes, create a dummy route
      // In a real app, you would call the Mapbox Directions API
      const dummyCoords = [
        [start.lng, start.lat],
        [start.lng + (end.lng - start.lng) * 0.3, start.lat + (end.lat - start.lat) * 0.3],
        [start.lng + (end.lng - start.lng) * 0.6, start.lat + (end.lat - start.lat) * 0.6],
        [end.lng, end.lat]
      ];
      
      // Update route line
      if (routeLine.current) {
        routeLine.current.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: dummyCoords
          }
        });
      }
      
      // Fit bounds to route
      const bounds = new mapboxgl.LngLatBounds()
        .extend([start.lng, start.lat])
        .extend([end.lng, end.lat]);
      
      map.current?.fitBounds(bounds, {
        padding: 100,
        maxZoom: 15
      });
      
      // Calculate straight-line distance
      const R = 6371; // Earth's radius in km
      const dLat = (end.lat - start.lat) * Math.PI / 180;
      const dLon = (end.lng - start.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c * 1.3; // Add 30% to account for roads vs straight-line
      
      // Create route response
      const route: Route = {
        distance: parseFloat(distance.toFixed(2)),
        duration: Math.round(distance * 3 * 60), // Rough estimate: 3 min per km
        geometry: {
          coordinates: dummyCoords as [number, number][]
        }
      };
      
      onCalculateRoute(route);
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Failed to calculate route. Please try again.');
    }
  };

  return (
    <Card className="overflow-hidden bg-transparent border-none shadow-none">
      <div className="h-[400px] relative rounded-lg overflow-hidden shadow-soft">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
      
      {!mapOnly && (
        <div className="mt-4 space-y-2 animate-fade-in">
          <div id="pickup-geocoder" className="geocoder" />
          <div id="dropoff-geocoder" className="geocoder" />
        </div>
      )}
    </Card>
  );
};

export default RideMap;
