
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRides } from '@/context/RidesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  Search,
  Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UserRides = () => {
  const { userRides } = useRides();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter rides
  const filteredRides = userRides.filter(ride => {
    const matchesSearch = 
      ride.pickup.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.dropoff.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      ride.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group rides by status
  const pendingRides = userRides.filter(ride => ride.status === 'pending');
  const activeRides = userRides.filter(ride => ride.status === 'accepted');
  const completedRides = userRides.filter(ride => 
    ride.status === 'completed' || ride.status === 'cancelled'
  );

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
          <h1 className="text-2xl font-bold">My Rides</h1>
        </div>
        <Button onClick={() => navigate('/request-ride')}>
          <Plus className="h-4 w-4 mr-2" />
          New Ride
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <TabsList>
            <TabsTrigger value="all">
              All Rides ({userRides.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingRides.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeRides.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedRides.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rides..."
                className="pl-8 w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <RidesList rides={filteredRides} />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <RidesList rides={pendingRides} />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <RidesList rides={activeRides} />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <RidesList rides={completedRides} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const RidesList = ({ rides }) => {
  if (rides.length === 0) {
    return (
      <Card className="glass-panel border-none">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No rides found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rides.map((ride) => (
        <RideCard key={ride.id} ride={ride} />
      ))}
    </div>
  );
};

const RideCard = ({ ride }) => {
  return (
    <Card className="glass-panel border-none overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">
              {ride.pickup.address.split(',')[0]} to {ride.dropoff.address.split(',')[0]}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(ride.createdAt).toLocaleDateString()}
              <Clock className="h-3 w-3 ml-2 mr-1" />
              {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      <CardContent>
        <div className="space-y-3 mb-3">
          <div className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <div className="text-sm">{ride.pickup.address}</div>
          </div>
          <div className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
            </div>
            <div className="text-sm">{ride.dropoff.address}</div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <div
            className={`px-3 py-1 rounded-full text-xs
              ${
                ride.status === 'completed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                  : ride.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                  : ride.status === 'accepted'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
              }`}
          >
            {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
          </div>

          {ride.status === 'accepted' && (
            <div className="text-xs text-muted-foreground">
              Accepted at{' '}
              {new Date(ride.acceptedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRides;
