
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { RidesProvider } from "@/context/RidesContext";
import MainLayout from "@/components/layout/MainLayout";
import Landing from "@/pages/landing/Landing";
import Login from "@/pages/login/Login";
import Signup from "@/pages/login/Signup";
import Dashboard from "@/pages/dashboard/Dashboard";
import RequestRide from "@/pages/user/RequestRide";
import UserRides from "@/pages/user/UserRides";
import DriverRides from "@/pages/driver/DriverRides";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RidesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Main Layout Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* User Routes */}
                <Route path="/request-ride" element={<RequestRide />} />
                <Route path="/user/rides" element={<UserRides />} />
                
                {/* Driver Routes */}
                <Route path="/driver/rides" element={<DriverRides />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RidesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
