
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRides } from '@/context/RidesContext';
import { useMapbox } from '@/context/MapboxContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Search,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  Car,
  Info,
  Navigation,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import RideMap from '@/components/map/RideMap';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DriverRides = () => {
  const { availableRides, driverRides, acceptRide, completeRide } = useRides();
  const { isTokenSet, openInMapsApp } = useMapbox();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRideDetail, setShowRideDetail] = useState(null);
  const [processingRideId, setProcessingRideId] = useState(null);
  
  // Filter available rides
  const filteredAvailableRides = availableRides.filter(ride => 
    ride.pickup.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.dropoff.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter driver rides
  const activeRides = driverRides.filter(ride => ride.status === 'accepted');
  const completedRides = driverRides.filter(ride => 
    ride.status === 'completed' || ride.status === 'cancelled'
  );
  
  const handleAcceptRide = async (rideId) => {
    try {
      setProcessingRideId(rideId);
      await acceptRide(rideId);
      toast.success('Ride accepted successfully!');
    } catch (error) {
      console.error('Error accepting ride:', error);
    } finally {
      setProcessingRideId(null);
    }
  };
  
  const handleCompleteRide = async (rideId) => {
    try {
      setProcessingRideId(rideId);
      await completeRide(rideId);
      toast.success('Ride completed successfully!');
    } catch (error) {
      console.error('Error completing ride:', error);
    } finally {
      setProcessingRideId(null);
    }
  };

  const handleOpenNavigation = (latitude, longitude, label) => {
    openInMapsApp(latitude, longitude, label);
  };
  
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        </div>
      </div>
      
      <Tabs defaultValue="available" className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <TabsList>
            <TabsTrigger value="available">
              Available ({availableRides.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeRides.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedRides.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rides..."
              className="pl-8 w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="available" className="space-y-4">
          <Card className="glass-panel border-none">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Available Rides
              </CardTitle>
              <CardDescription>
                Select a ride to accept and start driving
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAvailableRides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAvailableRides.map((ride) => (
                    <Card key={ride.id} className="glass-panel border-[1px] overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {ride.pickup.address.split(',')[0]} to {ride.dropoff.address.split(',')[0]}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(ride.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm font-medium">
                              <DollarSign className="h-3 w-3 mr-1" />
                              R$ {ride.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {ride.distance.toFixed(1)} km
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                              </div>
                              <div className="text-sm truncate max-w-[150px]">
                                {ride.pickup.address.split(',')[0]}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenNavigation(ride.pickup.latitude, ride.pickup.longitude, "Pickup: " + ride.pickup.address.split(',')[0])}
                            >
                              <Navigation className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                              </div>
                              <div className="text-sm truncate max-w-[150px]">
                                {ride.dropoff.address.split(',')[0]}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenNavigation(ride.dropoff.latitude, ride.dropoff.longitude, "Dropoff: " + ride.dropoff.address.split(',')[0])}
                            >
                              <Navigation className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowRideDetail(ride)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptRide(ride.id)}
                          disabled={processingRideId === ride.id}
                        >
                          {processingRideId === ride.id ? (
                            'Processing...'
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">No available rides at the moment</p>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    New ride requests will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card className="glass-panel border-none">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Active Rides
              </CardTitle>
              <CardDescription>
                Rides you have accepted and are currently driving
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeRides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRides.map((ride) => (
                    <Card key={ride.id} className="glass-panel border-[1px] overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {ride.pickup.address.split(',')[0]} to {ride.dropoff.address.split(',')[0]}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <User className="h-3 w-3 mr-1" />
                              {ride.userName}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm font-medium">
                              <DollarSign className="h-3 w-3 mr-1" />
                              R$ {ride.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {ride.distance.toFixed(1)} km
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                              </div>
                              <div className="text-sm truncate max-w-[150px]">
                                {ride.pickup.address.split(',')[0]}
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenNavigation(ride.pickup.latitude, ride.pickup.longitude, "Pickup: " + ride.pickup.address.split(',')[0])}
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Navigate
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                              </div>
                              <div className="text-sm truncate max-w-[150px]">
                                {ride.dropoff.address.split(',')[0]}
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenNavigation(ride.dropoff.latitude, ride.dropoff.longitude, "Dropoff: " + ride.dropoff.address.split(',')[0])}
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Navigate
                            </Button>
                          </div>
                          {ride.userPhone && (
                            <div className="flex items-center mt-2">
                              <Phone className="h-3 w-3 mr-1" />
                              <div className="text-sm">
                                {ride.userPhone}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowRideDetail(ride)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleCompleteRide(ride.id)}
                          disabled={processingRideId === ride.id}
                        >
                          {processingRideId === ride.id ? (
                            'Processing...'
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete Ride
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Info className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">No active rides</p>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Rides you accept will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <Card className="glass-panel border-none">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Completed Rides
              </CardTitle>
              <CardDescription>
                History of rides you've completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedRides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedRides.map((ride) => (
                    <Card key={ride.id} className="glass-panel border-[1px] overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {ride.pickup.address.split(',')[0]} to {ride.dropoff.address.split(',')[0]}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(ride.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm font-medium">
                              <DollarSign className="h-3 w-3 mr-1" />
                              R$ {ride.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {ride.distance.toFixed(1)} km
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <div className="text-sm">
                              {ride.userName}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <div className="text-sm">
                              {new Date(ride.completedAt || ride.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div
                          className={`px-3 py-1 rounded-full text-xs
                            ${
                              ride.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                            }`}
                        >
                          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Info className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">No completed rides yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Ride Detail Dialog */}
      <Dialog open={!!showRideDetail} onOpenChange={() => setShowRideDetail(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ride Details</DialogTitle>
            <DialogDescription>
              {showRideDetail?.status === 'pending' 
                ? 'Review ride details before accepting'
                : 'Current ride information'
              }
            </DialogDescription>
          </DialogHeader>
          
          {showRideDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Passenger</h4>
                  <p className="text-sm">{showRideDetail.userName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Price</h4>
                  <p className="text-sm">R$ {showRideDetail.price.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Distance</h4>
                  <p className="text-sm">{showRideDetail.distance.toFixed(1)} km</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <p className="text-sm capitalize">{showRideDetail.status}</p>
                </div>
              </div>
              
              {isTokenSet ? (
                <div>
                  <h4 className="text-sm font-medium mb-2">Route</h4>
                  <RideMap
                    mapOnly={true}
                    pickupLocation={showRideDetail.pickup}
                    dropoffLocation={showRideDetail.dropoff}
                  />
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium mb-2">Navigation</h4>
                  <MapboxTokenInput 
                    pickup={showRideDetail.pickup}
                    dropoff={showRideDetail.dropoff}
                  />
                </div>
              )}
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Pickup</h4>
                <div className="flex items-center justify-between">
                  <p className="text-sm">{showRideDetail.pickup.address}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenNavigation(
                      showRideDetail.pickup.latitude, 
                      showRideDetail.pickup.longitude, 
                      "Pickup: " + showRideDetail.pickup.address.split(',')[0]
                    )}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Navigate
                  </Button>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Dropoff</h4>
                <div className="flex items-center justify-between">
                  <p className="text-sm">{showRideDetail.dropoff.address}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenNavigation(
                      showRideDetail.dropoff.latitude, 
                      showRideDetail.dropoff.longitude, 
                      "Dropoff: " + showRideDetail.dropoff.address.split(',')[0]
                    )}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Navigate
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {showRideDetail?.status === 'pending' && (
              <Button
                onClick={() => {
                  handleAcceptRide(showRideDetail.id);
                  setShowRideDetail(null);
                }}
                disabled={processingRideId === showRideDetail?.id}
              >
                {processingRideId === showRideDetail?.id ? (
                  'Processing...'
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Ride
                  </>
                )}
              </Button>
            )}
            
            {showRideDetail?.status === 'accepted' && (
              <Button
                onClick={() => {
                  handleCompleteRide(showRideDetail.id);
                  setShowRideDetail(null);
                }}
                disabled={processingRideId === showRideDetail?.id}
              >
                {processingRideId === showRideDetail?.id ? (
                  'Processing...'
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Ride
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverRides;
