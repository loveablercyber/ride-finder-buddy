
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";
import { User } from '@/types';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
};

const defaultUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
};

const driverUser: User = {
  id: '2',
  name: 'Jane Driver',
  email: 'jane@example.com',
  role: 'driver',
  avatar: 'https://ui-avatars.com/api/?name=Jane+Driver&background=random'
};

const adminUser: User = {
  id: '3',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random'
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string) => {
    setLoading(true);
    
    try {
      // Simulate login API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let loggedInUser: User;
      
      // Simulate different user roles for demo
      if (role === 'admin') {
        loggedInUser = adminUser;
      } else if (role === 'driver') {
        loggedInUser = driverUser;
      } else {
        loggedInUser = defaultUser;
      }
      
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      toast.success("Logged in successfully!");
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Failed to login. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info("Logged out successfully");
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    setLoading(true);
    
    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        role: role as 'admin' | 'user' | 'driver',
        avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      toast.success("Registered successfully!");
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Failed to register. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
