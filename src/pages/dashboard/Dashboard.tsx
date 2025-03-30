
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRides } from '@/context/RidesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Car, History, MapPin, Clock, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Dashboard = () => {
  const { user, addCredit, hasDebt } = useAuth();
  const { userRides, driverRides, availableRides } = useRides();
  const navigate = useNavigate();
  const [creditAmount, setCreditAmount] = useState('');
  const [isAddingCredit, setIsAddingCredit] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

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
    if (hasDebt()) {
      toast.error("You have outstanding debt. Please add credit to your account before requesting a ride.");
      return;
    }
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

  const handleAddCredit = () => {
    if (!creditAmount || isNaN(Number(creditAmount)) || Number(creditAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setIsAddingCredit(true);
    setShowPaymentMethods(true);
  };

  const handleProcessPayment = () => {
    // Validate card details (simple validation)
    if (!cardNumber || cardNumber.length < 16 || !cardName || !cardExpiry || !cardCVV) {
      toast.error("Please fill all card details correctly");
      return;
    }

    // Simulate payment processing
    setTimeout(() => {
      addCredit(Number(creditAmount));
      setCreditAmount('');
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCVV('');
      setIsAddingCredit(false);
      setShowPaymentMethods(false);
      toast.success(`Successfully added R$${creditAmount} to your account`);
    }, 1500);
  };

  const getAccountStatusColor = () => {
    if (!user.accountBalance) return "bg-gray-100 text-gray-800";
    if (user.accountBalance < 0) return "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400";
    if (user.accountBalance > 100) return "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
      </div>
      
      {/* Account Status Card */}
      <Card className="glass-panel border-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Account Balance
          </CardTitle>
          <CardDescription>
            Your current account balance and payment options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">
              R$ {user.accountBalance?.toFixed(2) || "0.00"}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs ${getAccountStatusColor()}`}>
              {user.accountBalance && user.accountBalance < 0 
                ? "Debt" 
                : user.accountBalance && user.accountBalance > 100 
                  ? "Good Standing" 
                  : "Low Balance"}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" className="flex-1">
                  Add Credit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Credit to Your Account</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to add to your account balance.
                  </DialogDescription>
                </DialogHeader>
                
                {!showPaymentMethods ? (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (R$)</Label>
                      <Input 
                        id="amount" 
                        placeholder="0.00" 
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        type="number"
                        min="1"
                      />
                    </div>
                    <Button 
                      onClick={handleAddCredit} 
                      className="w-full"
                      disabled={!creditAmount || isNaN(Number(creditAmount)) || Number(creditAmount) <= 0}
                    >
                      Continue
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input 
                        id="card-number" 
                        placeholder="4111 1111 1111 1111" 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-name">Cardholder Name</Label>
                      <Input 
                        id="card-name" 
                        placeholder="John Doe" 
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input 
                          id="expiry" 
                          placeholder="MM/YY" 
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input 
                          id="cvv" 
                          placeholder="123" 
                          value={cardCVV}
                          onChange={(e) => setCardCVV(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleProcessPayment} 
                      className="w-full"
                    >
                      Pay R$ {creditAmount}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {user.accountBalance && user.accountBalance < 0 && (
              <div className="flex items-center text-red-500">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">Payment required to request rides</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
              <Button 
                onClick={handleRequestRide} 
                className="w-full"
                disabled={hasDebt()}
              >
                Request Now
              </Button>
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
                    
                    {ride.verificationCode && user.role === 'user' && (
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Your verification code:</div>
                        <div className="font-mono text-center text-lg font-bold">{ride.verificationCode}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="glass-panel border-none">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No recent rides found</p>
              {user.role === 'user' && (
                <Button onClick={handleRequestRide} variant="outline" className="mt-4" disabled={hasDebt()}>
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
