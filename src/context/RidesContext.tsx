
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";
import { RideRequest, Location } from '@/types';
import { useAuth } from './AuthContext';

type RidesContextType = {
  rides: RideRequest[];
  availableRides: RideRequest[];
  userRides: RideRequest[];
  driverRides: RideRequest[];
  createRideRequest: (pickup: Location, dropoff: Location, distance: number) => Promise<void>;
  acceptRide: (rideId: string) => Promise<void>;
  completeRide: (rideId: string) => Promise<void>;
  cancelRide: (rideId: string) => Promise<void>;
};

// Sample ride data
const sampleRides: RideRequest[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    userPhone: '+55 11 99999-9999',
    pickup: {
      longitude: -46.6333,
      latitude: -23.5505,
      address: 'Av. Paulista, 1000 - São Paulo'
    },
    dropoff: {
      longitude: -46.6500,
      latitude: -23.5608,
      address: 'Rua Augusta, 500 - São Paulo'
    },
    distance: 2.5,
    price: 4.5,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '1',
    userName: 'John Doe',
    userPhone: '+55 11 99999-9999',
    pickup: {
      longitude: -46.6420,
      latitude: -23.5555,
      address: 'Rua Oscar Freire, 300 - São Paulo'
    },
    dropoff: {
      longitude: -46.6610,
      latitude: -23.5650,
      address: 'Av. Rebouças, 1200 - São Paulo'
    },
    distance: 3.2,
    price: 5.76,
    status: 'completed',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    acceptedBy: '2',
    acceptedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    userId: '1',
    userName: 'John Doe',
    userPhone: '+55 11 99999-9999',
    pickup: {
      longitude: -46.6333,
      latitude: -23.5505,
      address: 'Shopping Ibirapuera - São Paulo'
    },
    dropoff: {
      longitude: -46.6700,
      latitude: -23.5800,
      address: 'Aeroporto de Congonhas - São Paulo'
    },
    distance: 8.7,
    price: 15.66,
    status: 'accepted',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    acceptedBy: '2',
    acceptedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  }
];

const RidesContext = createContext<RidesContextType>({
  rides: [],
  availableRides: [],
  userRides: [],
  driverRides: [],
  createRideRequest: async () => {},
  acceptRide: async () => {},
  completeRide: async () => {},
  cancelRide: async () => {},
});

export const useRides = () => useContext(RidesContext);

export const RidesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rides, setRides] = useState<RideRequest[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Load rides from localStorage or use sample data
    const storedRides = localStorage.getItem('rides');
    if (storedRides) {
      setRides(JSON.parse(storedRides));
    } else {
      setRides(sampleRides);
      localStorage.setItem('rides', JSON.stringify(sampleRides));
    }
  }, []);

  // Filtered rides based on user role
  const availableRides = rides.filter(ride => ride.status === 'pending');
  
  const userRides = user && user.role === 'user'
    ? rides.filter(ride => ride.userId === user.id)
    : [];
    
  const driverRides = user && user.role === 'driver'
    ? rides.filter(ride => ride.acceptedBy === user.id)
    : [];

  const createRideRequest = async (pickup: Location, dropoff: Location, distance: number) => {
    if (!user) {
      toast.error("You must be logged in to request a ride");
      return;
    }

    try {
      // Calculate price based on R$1.8 per km
      const price = parseFloat((distance * 1.8).toFixed(2));
      
      const newRide: RideRequest = {
        id: Math.random().toString(36).substring(2, 9),
        userId: user.id,
        userName: user.name,
        userPhone: '+55 11 99999-9999', // Placeholder
        pickup,
        dropoff,
        distance,
        price,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      const updatedRides = [...rides, newRide];
      setRides(updatedRides);
      localStorage.setItem('rides', JSON.stringify(updatedRides));
      
      toast.success("Ride requested successfully!");
      return;
    } catch (error) {
      console.error('Error creating ride request:', error);
      toast.error("Failed to create ride request");
      throw error;
    }
  };

  const acceptRide = async (rideId: string) => {
    if (!user || user.role !== 'driver') {
      toast.error("Only drivers can accept rides");
      return;
    }

    try {
      const updatedRides = rides.map(ride => 
        ride.id === rideId
          ? {
              ...ride,
              status: 'accepted',
              acceptedBy: user.id,
              acceptedAt: new Date().toISOString()
            }
          : ride
      );
      
      setRides(updatedRides);
      localStorage.setItem('rides', JSON.stringify(updatedRides));
      
      toast.success("Ride accepted successfully!");
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error("Failed to accept ride");
      throw error;
    }
  };

  const completeRide = async (rideId: string) => {
    if (!user || user.role !== 'driver') {
      toast.error("Only drivers can complete rides");
      return;
    }

    try {
      const updatedRides = rides.map(ride => 
        ride.id === rideId
          ? {
              ...ride,
              status: 'completed',
              completedAt: new Date().toISOString()
            }
          : ride
      );
      
      setRides(updatedRides);
      localStorage.setItem('rides', JSON.stringify(updatedRides));
      
      toast.success("Ride completed successfully!");
    } catch (error) {
      console.error('Error completing ride:', error);
      toast.error("Failed to complete ride");
      throw error;
    }
  };

  const cancelRide = async (rideId: string) => {
    try {
      const updatedRides = rides.map(ride => 
        ride.id === rideId
          ? {
              ...ride,
              status: 'cancelled'
            }
          : ride
      );
      
      setRides(updatedRides);
      localStorage.setItem('rides', JSON.stringify(updatedRides));
      
      toast.success("Ride cancelled successfully!");
    } catch (error) {
      console.error('Error cancelling ride:', error);
      toast.error("Failed to cancel ride");
      throw error;
    }
  };

  return (
    <RidesContext.Provider 
      value={{ 
        rides, 
        availableRides, 
        userRides, 
        driverRides,
        createRideRequest, 
        acceptRide, 
        completeRide, 
        cancelRide 
      }}
    >
      {children}
    </RidesContext.Provider>
  );
};
