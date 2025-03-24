
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRides } from '@/context/RidesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Car, History, MapPin, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const { userRides, driverRides, availableRides } = useRides();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to RideFinder</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Please sign in to access your dashboard and start using the app.
        </p>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    );
  }

  const handleRequestRide = () => {
    navigate('/request-ride');
  };

  const handleViewRides = () => {
    if (user.role === 'user') {
      navigate('/user/rides');
    } else if (user.role === 'driver') {
      navigate('/driver/rides');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user.role === 'user' && (
          <Card className="glass-panel border-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Car className="mr-2 h-5 w-5" />
                Request a Ride
              </CardTitle>
              <CardDescription>Choose your pickup and destination</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleRequestRide} className="w-full">Request Now</Button>
            </CardContent>
          </Card>
        )}

        {user.role === 'driver' && (
          <Card className="glass-panel border-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Available Rides
              </CardTitle>
              <CardDescription>
                {availableRides.length} ride{availableRides.length !== 1 ? 's' : ''} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/driver/rides')} 
                className="w-full"
                variant={availableRides.length > 0 ? 'default' : 'outline'}
              >
                View Available Rides
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="glass-panel border-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Ride History
            </CardTitle>
            <CardDescription>
              {user.role === 'user' 
                ? `${userRides.length} ride${userRides.length !== 1 ? 's' : ''} taken`
                : `${driverRides.length} ride${driverRides.length !== 1 ? 's' : ''} completed`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleViewRides} variant="outline" className="w-full">
              View History
            </Button>
          </CardContent>
        </Card>

        {user.role === 'admin' && (
          <Card className="glass-panel border-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Admin Controls
              </CardTitle>
              <CardDescription>Manage users and system</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/admin')} className="w-full">Admin Panel</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mt-8">Recent Activity</h2>
        
        {(user.role === 'user' ? userRides : driverRides).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(user.role === 'user' ? userRides : driverRides)
              .slice(0, 4)
              .map(ride => (
                <Card key={ride.id} className="glass-panel border-none overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">
                          {ride.pickup.address.split(',')[0]} to {ride.dropoff.address.split(',')[0]}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(ride.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center text-sm font-medium">
                        R$ {ride.price.toFixed(2)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <div className={`capitalize px-2 py-1 rounded-full text-xs
                          ${ride.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                            : ride.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400' 
                            : ride.status === 'accepted'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                          }`}
                        >
                          {ride.status}
                        </div>
                      </div>
                      <div className="text-muted-foreground">
                        {ride.distance.toFixed(1)} km
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="glass-panel border-none">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No recent rides found</p>
              {user.role === 'user' && (
                <Button onClick={handleRequestRide} variant="outline" className="mt-4">
                  Request Your First Ride
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
