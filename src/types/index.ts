
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'driver';
  avatar?: string;
}

export interface Location {
  longitude: number;
  latitude: number;
  address: string;
}

export interface Route {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
}

export interface RideRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  pickup: Location;
  dropoff: Location;
  distance: number;
  price: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  acceptedBy?: string;
  acceptedAt?: string;
  completedAt?: string;
  route?: Route;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
