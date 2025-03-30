
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRides } from '@/context/RidesContext';
import { useMapbox } from '@/context/MapboxContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import RideMap from '@/components/map/RideMap';
import { toast } from 'sonner';
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
  Timer,
  Check,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DriverRides = () => {
  const { 
    availableRides, 
    driverRides, 
    acceptRide, 
    completeRide, 
    startNavigation, 
    arrivedAtPickup, 
    startRide,
    cancelRideWithFee 
  } = useRides();
  const { openInMapsApp } = useMapbox();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRideDetail, setShowRideDetail] = useState(null);
  const [processingRideId, setProcessingRideId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [waitingTimeLeft, setWaitingTimeLeft] = useState(180); // 3 minutes in seconds
  const [waitingTimerId, setWaitingTimerId] = useState<number | null>(null);
  const [showCancelWithFeeDialog, setShowCancelWithFeeDialog] = useState(false);
  
  // Filter available rides
  const filteredAvailableRides = availableRides.filter(ride => 
    ride.pickup.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.dropoff.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter driver rides by status
  const getDriverRidesByStatus = (status) => {
    return driverRides.filter(ride => ride.status === status);
  };
  
  const pendingRides = availableRides;
  const acceptedRides = getDriverRidesByStatus('accepted');
  const enRouteRides = getDriverRidesByStatus('en_route');
  const arrivedRides = getDriverRidesByStatus('arrived');
  const inProgressRides = getDriverRidesByStatus('in_progress');
  const activeRides = [...acceptedRides, ...enRouteRides, ...arrivedRides, ...inProgressRides];
  const completedRides = driverRides.filter(ride => 
    ride.status === 'completed' || ride.status === 'cancelled'
  );
  
  // Countdown timer for waiting time
  useEffect(() => {
    if (showRideDetail && showRideDetail.status === 'arrived' && waitingTimeLeft > 0) {
      const timerId = window.setInterval(() => {
        setWaitingTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            setShowCancelWithFeeDialog(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setWaitingTimerId(timerId);
      
      return () => {
        if (timerId) clearInterval(timerId);
      };
    }
  }, [showRideDetail]);
  
  // Clean up timer when dialog closes
  useEffect(() => {
    return () => {
      if (waitingTimerId) clearInterval(waitingTimerId);
    };
  }, [waitingTimerId]);
  
  // Reset timer when showing a new ride detail
  useEffect(() => {
    if (showRideDetail && showRideDetail.status === 'arrived') {
      setWaitingTimeLeft(180); // 3 minutes
    }
  }, [showRideDetail]);
  
  const formatWaitingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
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
  
  const handleStartNavigation = async (rideId) => {
    try {
      setProcessingRideId(rideId);
      await startNavigation(rideId);
      
      // Get ride details to navigate to pickup location
      const ride = driverRides.find(r => r.id === rideId);
      if (ride) {
        handleOpenNavigation(
          ride.pickup.latitude, 
          ride.pickup.longitude, 
          "Pickup: " + ride.pickup.address.split(',')[0]
        );
      }
    } catch (error) {
      console.error('Error starting navigation:', error);
    } finally {
      setProcessingRideId(null);
    }
  };
  
  const handleArrivedAtPickup = async (rideId) => {
    try {
      setProcessingRideId(rideId);
      await arrivedAtPickup(rideId);
      
      // Reset waiting time counter
      setWaitingTimeLeft(180);
    } catch (error) {
      console.error('Error marking arrival:', error);
    } finally {
      setProcessingRideId(null);
    }
  };
  
  const handleStartRide = async (rideId) => {
    try {
      setProcessingRideId(rideId);
      const success = await startRide(rideId, verificationCode);
      
      if (success) {
        toast.success('Ride started successfully!');
        setVerificationCode('');
        
        // Get ride details to navigate to dropoff location
        const ride = driverRides.find(r => r.id === rideId);
        if (ride) {
          handleOpenNavigation(
            ride.dropoff.latitude, 
            ride.dropoff.longitude, 
            "Dropoff: " + ride.dropoff.address.split(',')[0]
          );
        }
      }
    } catch (error) {
      console.error('Error starting ride:', error);
    } finally {
      setProcessingRideId(null);
    }
  };
  
  const handleCancelWithFee = async (rideId) => {
    try {
      setProcessingRideId(rideId);
      await cancelRideWithFee(rideId);
      setShowRideDetail(null);
      setShowCancelWithFeeDialog(false);
    } catch (error) {
      console.error('Error cancelling ride with fee:', error);
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
  
  // Get ride status badge
  const getRideStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <div className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400">Accepted</div>;
      case 'en_route':
        return <div className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400">En Route</div>;
      case 'arrived':
        return <div className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400">Arrived</div>;
      case 'in_progress':
        return <div className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-800/20 dark:text-indigo-400">In Progress</div>;
      case 'completed':
        return <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">Completed</div>;
      case 'cancelled':
        return <div className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400">Cancelled</div>;
      default:
        return <div className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">Pending</div>;
    }
  };
  
  // Render action buttons based on ride status
  const renderActionButtons = (ride) => {
    switch (ride.status) {
      case 'pending':
        return (
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
        );
      case 'accepted':
        return (
          <Button 
            size="sm"
            onClick={() => handleStartNavigation(ride.id)}
            disabled={processingRideId === ride.id}
          >
            {processingRideId === ride.id ? (
              'Processing...'
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Start Navigation
              </>
            )}
          </Button>
        );
      case 'en_route':
        return (
          <Button 
            size="sm"
            onClick={() => handleArrivedAtPickup(ride.id)}
            disabled={processingRideId === ride.id}
          >
            {processingRideId === ride.id ? (
              'Processing...'
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                I've Arrived
              </>
            )}
          </Button>
        );
      case 'arrived':
        return (
          <div className="flex gap-2">
            <Input
              className="max-w-[100px]"
              placeholder="Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={4}
            />
            <Button 
              size="sm"
              onClick={() => handleStartRide(ride.id)}
              disabled={processingRideId === ride.id || verificationCode.length !== 4}
            >
              {processingRideId === ride.id ? (
                'Processing...'
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Start Ride
                </>
              )}
            </Button>
          </div>
        );
      case 'in_progress':
        return (
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
        );
      default:
        return null;
    }
  };
  
  // Helper to format the address for display
  const formatAddress = (address) => {
    if (!address) return '';
    const parts = address.split(',');
    return parts[0];
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
              Available ({pendingRides.length})
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
                              {formatAddress(ride.pickup.address)} to {formatAddress(ride.dropoff.address)}
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
                                {formatAddress(ride.pickup.address)}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenNavigation(ride.pickup.latitude, ride.pickup.longitude, "Pickup: " + formatAddress(ride.pickup.address))}
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
                                {formatAddress(ride.dropoff.address)}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenNavigation(ride.dropoff.latitude, ride.dropoff.longitude, "Dropoff: " + formatAddress(ride.dropoff.address))}
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
                        {renderActionButtons(ride)}
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
                              {formatAddress(ride.pickup.address)} to {formatAddress(ride.dropoff.address)}
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
                            {getRideStatusBadge(ride.status)}
                            {ride.status === 'arrived' && (
                              <div className="flex items-center text-amber-500">
                                <Timer className="h-4 w-4 mr-1" />
                                <span>{formatWaitingTime(waitingTimeLeft)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                              </div>
                              <div className="text-sm truncate max-w-[150px]">
                                {formatAddress(ride.pickup.address)}
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenNavigation(ride.pickup.latitude, ride.pickup.longitude, "Pickup: " + formatAddress(ride.pickup.address))}
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
                                {formatAddress(ride.dropoff.address)}
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenNavigation(ride.dropoff.latitude, ride.dropoff.longitude, "Dropoff: " + formatAddress(ride.dropoff.address))}
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
                        {renderActionButtons(ride)}
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
                              {formatAddress(ride.pickup.address)} to {formatAddress(ride.dropoff.address)}
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
                              {ride.cancellationFee && (
                                <span className="ml-1 text-xs">(+R$ {ride.cancellationFee.toFixed(2)} fee)</span>
                              )}
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
                              {new Date(ride.completedAt || ride.cancelledAt || ride.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        {getRideStatusBadge(ride.status)}
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
                  <div className="flex items-center">
                    {getRideStatusBadge(showRideDetail.status)}
                    {showRideDetail.status === 'arrived' && (
                      <div className="flex items-center text-amber-500 ml-2">
                        <Timer className="h-4 w-4 mr-1" />
                        <span>{formatWaitingTime(waitingTimeLeft)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Verification code input for arrived status */}
              {showRideDetail.status === 'arrived' && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                  <h4 className="text-sm font-medium">Verification Code</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Ask the passenger for their 4-digit verification code to start the ride
                  </p>
                  <div className="flex gap-2">
                    <Input
                      className="max-w-[120px]"
                      placeholder="0000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                </div>
              )}
              
              {/* Ride details for completed rides */}
              {showRideDetail.status === 'completed' && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                  <h4 className="text-sm font-medium">Ride Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Started At</p>
                      <p>{new Date(showRideDetail.inProgressAt || showRideDetail.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Completed At</p>
                      <p>{new Date(showRideDetail.completedAt).toLocaleTimeString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Payment</p>
                      <p className="text-green-600 font-medium">R$ {showRideDetail.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Cancellation details for cancelled rides */}
              {showRideDetail.status === 'cancelled' && showRideDetail.cancellationFee && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                  <h4 className="text-sm font-medium">Cancellation Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Cancelled At</p>
                      <p>{new Date(showRideDetail.cancelledAt).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cancellation Fee</p>
                      <p className="text-amber-600 font-medium">R$ {showRideDetail.cancellationFee.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium mb-2">Navigation</h4>
                <div className="space-y-4">
                  {showRideDetail.pickup && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        </div>
                        <div className="text-sm">
                          {showRideDetail.pickup.address.split(',').slice(0, 2).join(',')}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openInMapsApp(
                          showRideDetail.pickup.latitude, 
                          showRideDetail.pickup.longitude, 
                          "Pickup location"
                        )}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                      </Button>
                    </div>
                  )}
                  
                  {showRideDetail.dropoff && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                        </div>
                        <div className="text-sm">
                          {showRideDetail.dropoff.address.split(',').slice(0, 2).join(',')}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openInMapsApp(
                          showRideDetail.dropoff.latitude, 
                          showRideDetail.dropoff.longitude, 
                          "Dropoff location"
                        )}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                      </Button>
                    </div>
                  )}
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
                  handleStartNavigation(showRideDetail.id);
                  setShowRideDetail(null);
                }}
                disabled={processingRideId === showRideDetail?.id}
              >
                {processingRideId === showRideDetail?.id ? (
                  'Processing...'
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Start Navigation
                  </>
                )}
              </Button>
            )}
            
            {showRideDetail?.status === 'en_route' && (
              <Button
                onClick={() => {
                  handleArrivedAtPickup(showRideDetail.id);
                  setShowRideDetail(null);
                }}
                disabled={processingRideId === showRideDetail?.id}
              >
                {processingRideId === showRideDetail?.id ? (
                  'Processing...'
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    I've Arrived
                  </>
                )}
              </Button>
            )}
            
            {showRideDetail?.status === 'arrived' && (
              <div className="flex gap-2 w-full justify-between">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowCancelWithFeeDialog(true);
                  }}
                  disabled={processingRideId === showRideDetail?.id}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel (Fee R$10)
                </Button>
                
                <Button
                  onClick={() => {
                    handleStartRide(showRideDetail.id);
                  }}
                  disabled={processingRideId === showRideDetail?.id || verificationCode.length !== 4}
                >
                  {processingRideId === showRideDetail?.id ? (
                    'Processing...'
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Start Ride
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {showRideDetail?.status === 'in_progress' && (
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
      
      {/* Cancel with Fee Confirmation Dialog */}
      <AlertDialog open={showCancelWithFeeDialog} onOpenChange={setShowCancelWithFeeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Ride with Fee</AlertDialogTitle>
            <AlertDialogDescription>
              The passenger hasn't shown up within the 3-minute waiting time. 
              Cancelling this ride will charge the passenger a R$10 fee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (showRideDetail) {
                  handleCancelWithFee(showRideDetail.id);
                }
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel and Charge Fee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DriverRides;
