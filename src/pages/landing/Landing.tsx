
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Car, Users, DollarSign, Shield, ArrowRight, MapPin, Clock } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const handleGetStarted = () => {
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col lg:flex-row items-center px-4 md:px-8 py-16 md:py-24 animate-fade-in">
        <div className="w-full lg:w-1/2 space-y-6 mb-8 lg:mb-0">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Your ride, <span className="text-primary">your way</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mt-4">
              Fast, reliable, and affordable ride-hailing service for everyone.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" onClick={handleGetStarted} className="animate-pulse-soft">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>
              Sign Up as a Driver
            </Button>
          </div>
          
          <div className="flex items-center gap-8 pt-4">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">Drivers</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">10k+</div>
              <div className="text-sm text-muted-foreground">Rides</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">15+</div>
              <div className="text-sm text-muted-foreground">Cities</div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              alt="City driving"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          
          <div className="glass-panel absolute bottom-4 left-4 right-4 md:bottom-8 md:right-auto md:left-8 md:w-60 p-4 rounded-lg animate-float">
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Current Ride</div>
                <div className="text-xs text-muted-foreground">São Paulo &rarr; Moema</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Clock className="h-3 w-3 inline mr-1" />
                12 min
              </div>
              <div className="text-sm font-medium">
                R$ 17.50
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RideFinder?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform offers exceptional experiences for both riders and drivers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Car className="h-12 w-12 text-primary/80" />}
              title="Fast Pickup"
              description="Get picked up within minutes of requesting a ride, no matter where you are."
            />
            <FeatureCard
              icon={<DollarSign className="h-12 w-12 text-primary/80" />}
              title="Affordable Rates"
              description="Enjoy transparent pricing with rates starting at just R$1.80 per kilometer."
            />
            <FeatureCard
              icon={<Shield className="h-12 w-12 text-primary/80" />}
              title="Safe & Secure"
              description="All drivers are verified and trips are monitored for your safety and peace of mind."
            />
            <FeatureCard
              icon={<Users className="h-12 w-12 text-primary/80" />}
              title="Excellent Support"
              description="Our customer support team is available 24/7 to assist with any issues."
            />
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting a ride has never been easier
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Request a Ride</h3>
              <p className="text-muted-foreground">
                Enter your pickup location and destination to request a ride from nearby drivers.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Matched</h3>
              <p className="text-muted-foreground">
                Our system quickly matches you with an available driver in your area.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Your Ride</h3>
              <p className="text-muted-foreground">
                Track your driver's arrival and enjoy a comfortable, safe journey to your destination.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to get started?</h2>
            <p className="text-lg opacity-90 max-w-lg">
              Join thousands of satisfied users who rely on RideFinder for their daily commutes.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={handleGetStarted}
              className="text-primary"
            >
              Request a Ride
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/signup')}
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Become a Driver
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 md:py-16 px-4 md:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="md:w-1/4">
              <h3 className="text-xl font-semibold mb-4">RideFinder</h3>
              <p className="text-muted-foreground">
                Your reliable ride-hailing service, connecting drivers and passengers seamlessly.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition">About Us</a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition">Careers</a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition">Press</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition">Help Center</a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition">Safety</a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition">Terms of Service</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-muted-foreground">support@ridefinder.com</li>
                <li className="text-muted-foreground">+55 (11) 3456-7890</li>
                <li className="text-muted-foreground">São Paulo, Brazil</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RideFinder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-background rounded-xl p-6 glass-panel border-none animate-blur-in">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Landing;
