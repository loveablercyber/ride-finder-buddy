
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRides } from '@/context/RidesContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Location, Route } from '@/types';
import RideMap from '@/components/map/RideMap';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, MapPin, Clock, DollarSign } from 'lucide-react';

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
  };
  
  const handleDropoffSelect = (location: Location) => {
    setDropoff(location);
  };
  
  // Handle route calculation
  const handleRouteCalculation = (calculatedRoute: Route) => {
    setRoute(calculatedRoute);
  };
  
  // Handle ride request
  const handleRequestRide = async () => {
    if (!user) {
      toast.error("You must be logged in to request a ride");
      navigate('/login');
      return;
    }
    
    if (!pickup || !dropoff || !route) {
      toast.error("Please select pickup and dropoff locations");
      return;
    }
    
    try {
      setIsProcessing(true);
      await createRideRequest(pickup, dropoff, route.distance);
      navigate('/user/rides');
    } catch (error) {
      console.error('Error requesting ride:', error);
    } finally {
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
          Back
        </Button>
        <h1 className="text-2xl font-bold">Request a Ride</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="glass-panel border-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Choose Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RideMap 
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
              <CardTitle>Ride Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Pickup</div>
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
                        <div className="text-sm text-muted-foreground">Select pickup location</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Destination</div>
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
                        <div className="text-sm text-muted-foreground">Select destination</div>
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
                        Estimated Time
                      </div>
                      <div className="text-lg font-medium">
                        {Math.round(route.duration / 60)} min
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Estimated Price
                      </div>
                      <div className="text-lg font-medium">
                        R$ {(route.distance * 1.8).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Distance: {route.distance.toFixed(1)} km
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Price calculated at R$1.80/km
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleRequestRide}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Request
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {!route && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  disabled={!pickup || !dropoff}
                >
                  Choose locations to continue
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
