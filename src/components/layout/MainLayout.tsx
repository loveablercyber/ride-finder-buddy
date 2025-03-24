
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, User, LogOut, Menu, X, Car, Home, History } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [theme, setTheme] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Close menu on navigation
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: <Home className="h-5 w-5" />,
      roles: ['user', 'driver', 'admin']
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      roles: ['user', 'driver', 'admin']
    },
    {
      name: 'Available Rides',
      path: '/driver/rides',
      icon: <Car className="h-5 w-5" />,
      roles: ['driver']
    },
    {
      name: 'My Rides',
      path: '/user/rides',
      icon: <History className="h-5 w-5" />,
      roles: ['user']
    },
    {
      name: 'Admin Panel',
      path: '/admin',
      icon: <User className="h-5 w-5" />,
      roles: ['admin']
    }
  ];

  // Filter nav items based on user role
  const filteredNavItems = user
    ? navItems.filter(item => item.roles.includes(user.role))
    : navItems.filter(item => item.path === '/');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="glass-panel z-50 sticky top-0 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="mr-2"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          <h1 
            className="text-xl font-semibold tracking-tight cursor-pointer" 
            onClick={() => navigate('/')}
          >
            RideFinder
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 p-0 overflow-hidden"
                  onClick={() => navigate('/profile')}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="rounded-full"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => navigate('/login')} size="sm">
              Login
            </Button>
          )}
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-40 transform ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out`}
        >
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80%] h-full bg-background shadow-lg glass-panel">
            <div className="p-4">
              <div className="mb-6">
                {user ? (
                  <div className="flex flex-col items-center gap-3 py-5">
                    <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                          <User className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-5">
                    <Button onClick={() => navigate('/login')} className="w-full">
                      Login
                    </Button>
                  </div>
                )}
              </div>
              <nav className="space-y-1">
                {filteredNavItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={location.pathname === item.path ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="flex flex-1">
          <aside className="w-60 glass-panel hidden md:block p-4 sticky top-16 h-[calc(100vh-4rem)] self-start">
            <nav className="space-y-1">
              {filteredNavItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              ))}
            </nav>
          </aside>
          
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      )}

      {/* Mobile layout - no sidebar */}
      {isMobile && (
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      )}
    </div>
  );
};

export default MainLayout;
