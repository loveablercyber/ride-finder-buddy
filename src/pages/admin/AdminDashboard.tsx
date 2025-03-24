
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRides } from '@/context/RidesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Search,
  Car,
  Users,
  UserCheck,
  User,
  BarChart3,
  Calendar,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminDashboard = () => {
  const { rides } = useRides();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  
  // Mock user data for admin
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', rides: 5, status: 'active' },
    { id: '2', name: 'Jane Driver', email: 'jane@example.com', role: 'driver', rides: 8, status: 'active' },
    { id: '3', name: 'Mike Smith', email: 'mike@example.com', role: 'user', rides: 3, status: 'inactive' },
    { id: '4', name: 'Lisa Wong', email: 'lisa@example.com', role: 'driver', rides: 12, status: 'active' },
    { id: '5', name: 'David Chen', email: 'david@example.com', role: 'user', rides: 7, status: 'active' },
  ];

  // Calculate statistics
  const totalUsers = mockUsers.filter(user => user.role === 'user').length;
  const totalDrivers = mockUsers.filter(user => user.role === 'driver').length;
  const totalRides = rides.length;
  const completedRides = rides.filter(ride => ride.status === 'completed').length;
  const pendingRides = rides.filter(ride => ride.status === 'pending').length;
  
  // Calculate total revenue
  const totalRevenue = rides
    .filter(ride => ride.status === 'completed')
    .reduce((total, ride) => total + ride.price, 0);
  
  // Calculate average ride price
  const avgRidePrice = completedRides 
    ? (totalRevenue / completedRides).toFixed(2) 
    : '0.00';
  
  // Filter rides by time
  const getFilteredRides = () => {
    let filteredRides = [...rides];
    
    const now = new Date();
    if (timeFilter === 'today') {
      const startOfDay = new Date(now.setHours(0,0,0,0));
      filteredRides = filteredRides.filter(ride => new Date(ride.createdAt) >= startOfDay);
    } else if (timeFilter === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0,0,0,0);
      filteredRides = filteredRides.filter(ride => new Date(ride.createdAt) >= startOfWeek);
    } else if (timeFilter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredRides = filteredRides.filter(ride => new Date(ride.createdAt) >= startOfMonth);
    }
    
    // Apply search filter
    if (searchTerm) {
      filteredRides = filteredRides.filter(ride => 
        ride.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.pickup.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.dropoff.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredRides;
  };
  
  // Filter users
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-panel border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              <div className="text-2xl font-bold">{totalUsers}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-green-500" />
              <div className="text-2xl font-bold">{totalDrivers}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-red-500" />
              <div className="text-2xl font-bold">{totalRides}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-purple-500" />
              <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel border-none md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Ride Statistics
              </CardTitle>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Time Period</SelectLabel>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>Overview of ride activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Rides</div>
                <div className="text-2xl font-bold">{getFilteredRides().length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold">
                  {getFilteredRides().filter(ride => ride.status === 'completed').length}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold">
                  {getFilteredRides().filter(ride => ride.status === 'pending').length}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Average Price</div>
                <div className="text-2xl font-bold">
                  R$ {avgRidePrice}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Distance</div>
                <div className="text-2xl font-bold">
                  {getFilteredRides()
                    .reduce((total, ride) => total + ride.distance, 0)
                    .toFixed(1)} km
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
                <div className="text-2xl font-bold">
                  {getFilteredRides().length
                    ? (getFilteredRides().filter(ride => ride.status === 'completed').length / getFilteredRides().length * 100).toFixed(0)
                    : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Issues
            </CardTitle>
            <CardDescription>System alerts and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="px-4 py-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  High demand in central area
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                  5 pending rides in downtown
                </div>
              </div>
              
              <div className="px-4 py-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  New driver applications
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-500 mt-1">
                  3 new drivers awaiting approval
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                No critical issues reported
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="rides" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rides">Rides</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 w-full max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <TabsContent value="rides" className="space-y-4">
          <Card className="glass-panel border-none">
            <CardHeader>
              <CardTitle>Recent Rides</CardTitle>
              <CardDescription>
                Showing {getFilteredRides().length} ride{getFilteredRides().length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 bg-muted/50 p-3 text-sm font-medium">
                  <div>User</div>
                  <div className="col-span-2">Route</div>
                  <div>Price</div>
                  <div>Status</div>
                  <div>Date</div>
                  <div>Actions</div>
                </div>
                <div className="divide-y">
                  {getFilteredRides().slice(0, 10).map((ride) => (
                    <div key={ride.id} className="grid grid-cols-7 p-3 text-sm">
                      <div className="flex items-center">
                        <div className="font-medium">{ride.userName}</div>
                      </div>
                      <div className="col-span-2 truncate max-w-[250px]">
                        {ride.pickup.address.split(',')[0]} to {ride.dropoff.address.split(',')[0]}
                      </div>
                      <div>R$ {ride.price.toFixed(2)}</div>
                      <div>
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
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
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(ride.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Contact User</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Cancel Ride
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card className="glass-panel border-none">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 bg-muted/50 p-3 text-sm font-medium">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div>Rides</div>
                  <div>Actions</div>
                </div>
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-6 p-3 text-sm">
                      <div className="font-medium">{user.name}</div>
                      <div>{user.email}</div>
                      <div className="capitalize">{user.role}</div>
                      <div>
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400'
                            }`}
                        >
                          {user.status}
                        </div>
                      </div>
                      <div>{user.rides}</div>
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>View Rides</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              {user.status === 'active' ? 'Deactivate' : 'Activate'} User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
