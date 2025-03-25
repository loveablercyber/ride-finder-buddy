
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRides } from '@/context/RidesContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Location, Route } from '@/types';
import OpenStreetMap from '@/components/map/OpenStreetMap';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, MapPin, Clock, DollarSign } from 'lucide-react';
import { calculateRoute } from '@/services/geocodingService'; // Import properly at the top

const RequestRide = () => {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { createRideRequest } = useRides();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Handle location selection
  const handlePickupSelect = (location: Location) => {
    setPickup(location);
    checkAndCalculateRoute(location, dropoff);
  };
  
  const handleDropoffSelect = (location: Location) => {
    setDropoff(location);
    checkAndCalculateRoute(pickup, location);
  };
  
  // Helper function to check and calculate route when both locations are set
  const checkAndCalculateRoute = (pickup: Location | null, dropoff: Location | null) => {
    if (pickup && dropoff) {
      // Use the imported function directly instead of requiring it
      const calculatedRoute = calculateRoute(pickup, dropoff);
      setRoute(calculatedRoute);
    }
  };
  
  // Handle route calculation from the map component
  const handleRouteCalculation = (calculatedRoute: Route) => {
    setRoute(calculatedRoute);
  };
  
  // Use effect to ensure route is calculated when both locations are set
  useEffect(() => {
    if (pickup && dropoff) {
      checkAndCalculateRoute(pickup, dropoff);
    }
  }, [pickup, dropoff]);
  
  // Handle ride request
  const handleRequestRide = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para solicitar uma corrida");
      navigate('/login');
      return;
    }
    
    if (!pickup || !dropoff || !route) {
      toast.error("Por favor, selecione os locais de partida e destino");
      return;
    }
    
    try {
      setIsProcessing(true);
      await createRideRequest(pickup, dropoff, route.distance);
      toast.success("Corrida solicitada com sucesso!");
      navigate('/user/rides');
    } catch (error) {
      console.error('Erro ao solicitar corrida:', error);
      toast.error("Falha ao solicitar corrida. Tente novamente.");
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Solicitar uma Corrida</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="glass-panel border-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Escolha os Locais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OpenStreetMap 
                onSelectPickup={handlePickupSelect}
                onSelectDropoff={handleDropoffSelect}
                onCalculateRoute={handleRouteCalculation}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="glass-panel border-none sticky top-24">
            <CardHeader className="pb-2">
              <CardTitle>Detalhes da Corrida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Local de Partida</div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div>
                      {pickup ? (
                        <div className="text-sm">
                          {pickup.address.split(',').slice(0, 2).join(',')}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Selecione o local de partida</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Destino</div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                    </div>
                    <div>
                      {dropoff ? (
                        <div className="text-sm">
                          {dropoff.address.split(',').slice(0, 2).join(',')}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Selecione o destino</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {route && (
                <div className="space-y-4 pt-4 border-t animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Tempo Estimado
                      </div>
                      <div className="text-lg font-medium">
                        {Math.round(route.duration / 60)} min
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Preço Estimado
                      </div>
                      <div className="text-lg font-medium">
                        R$ {(route.distance * 1.8).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Distância: {route.distance.toFixed(1)} km
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Preço calculado a R$1,80/km
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleRequestRide}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>Processando...</>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar Solicitação
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {!route && pickup && dropoff && (
                <div className="pt-4 border-t animate-fade-in">
                  <Button 
                    className="w-full mt-4"
                    onClick={() => checkAndCalculateRoute(pickup, dropoff)}
                  >
                    Calcular Rota
                  </Button>
                </div>
              )}
              
              {!route && (!pickup || !dropoff) && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  disabled
                >
                  Escolha os locais para continuar
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequestRide;
