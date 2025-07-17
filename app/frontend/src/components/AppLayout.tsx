import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { BackgroundBeams } from './ui/background-beams';
import { SparklesCore } from './ui/sparkles';
import { 
  Home, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Zap,
  Activity,
  Bell,
  User
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

// Abstract minimalistic icons following modern design
const Icons = {
  home: () => <div className="w-2 h-2 bg-current rounded-full" />,
  websiteMonitor: () => <div className="w-2 h-2 bg-current rounded-sm" />,
  networkMetrics: () => <div className="w-2 h-2 bg-current rotate-45" />,
  computingResources: () => <div className="w-2 h-2 bg-current" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />,
  geographicData: () => <div className="w-2 h-2 bg-current rounded-full border border-current" />,
  appUsageMetrics: () => <div className="w-2 h-2 bg-current rounded-sm rotate-12" />,
  settings: () => <Settings className="w-4 h-4" />,
  logout: () => <LogOut className="w-4 h-4" />,
};

const AppLayout = ({ children, title }: AppLayoutProps) => {
  const router = useRouter();
  const { isValidated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  if (!mounted) return null;

  // Navigation items - flat structure
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: isValidated ? '/home/validator' : '/home/user',
        icon: Icons.home,
        active: router.pathname.startsWith('/home')
      }
    ];

    // Add validator-specific items at the same level
    if (isValidated) {
      baseItems.push(
        {
          name: 'Website Monitor',
          href: '/home/validator/website-monitor',
          icon: Icons.websiteMonitor,
          active: router.pathname === '/home/validator/website-monitor'
        },
        {
          name: 'Network Metrics',
          href: '/home/validator/network-metrics',
          icon: Icons.networkMetrics,
          active: router.pathname === '/home/validator/network-metrics'
        },
        {
          name: 'Computing',
          href: '/home/validator/computing-resources',
          icon: Icons.computingResources,
          active: router.pathname === '/home/validator/computing-resources'
        },
        {
          name: 'Geographic',
          href: '/home/validator/geographic-data',
          icon: Icons.geographicData,
          active: router.pathname === '/home/validator/geographic-data'
        },
        {
          name: 'App Usage',
          href: '/home/validator/app-usage-metrics',
          icon: Icons.appUsageMetrics,
          active: router.pathname === '/home/validator/app-usage-metrics'
        }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      
      <BackgroundBeams className="absolute inset-0" />

      {/* Glassmorphic Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 z-40">
        <div className="flex flex-col flex-grow backdrop-blur-xl bg-white/5 border-r border-white/10 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center h-20 flex-shrink-0 px-8 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl blur opacity-25"></div>
              </div>
              <div>
                <span className="text-[18px] font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                  DataContrib
                </span>
                <div className="text-[11px] text-white/60 font-medium tracking-wide">
                  DEPIN NETWORK
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-2">
            {navigationItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  group flex items-center w-full px-4 py-3 text-[14px] font-medium rounded-xl transition-all duration-300 relative overflow-hidden
                  ${item.active 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-white/20 shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.active && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`mr-4 flex-shrink-0 transition-colors duration-300 ${
                  item.active ? 'text-blue-400' : 'text-white/60 group-hover:text-white/80'
                }`}>
                  <item.icon />
                </div>
                <span className="relative z-10">{item.name}</span>
                {item.active && (
                  <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full shadow-glow"></div>
                )}
              </motion.button>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex-shrink-0 border-t border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-[12px] font-bold text-white">
                      {isValidated ? 'V' : 'U'}
                    </span>
                  </div>
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-full blur opacity-30"></div>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white leading-none">
                    {isValidated ? 'Validator' : 'User'}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-[11px] text-white/60">Online</span>
                  </div>
                </div>
              </div>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-white/60 hover:text-white transition-colors duration-300 rounded-lg hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
            >
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
            </motion.div>

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 backdrop-blur-xl bg-white/5 lg:hidden border-r border-white/10"
            >
              <div className="flex items-center justify-between h-20 px-8 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[18px] font-bold text-white tracking-tight">
                    DataContrib
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="px-6 py-8 space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`
                      group flex items-center w-full px-4 py-3 text-[14px] font-medium rounded-xl transition-all duration-300
                      ${item.active 
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-white/20' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <div className={`mr-4 flex-shrink-0 ${item.active ? 'text-blue-400' : 'text-white/60 group-hover:text-white/80'}`}>
                      <item.icon />
                    </div>
                    {item.name}
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1 relative z-10">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex-shrink-0 flex h-20 backdrop-blur-xl bg-black/20 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-6 border-r border-white/10 text-white/60 hover:text-white focus:outline-none lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1 px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {title && (
                <div>
                  <h1 className="text-[24px] font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                    {title}
                  </h1>
                  <div className="text-[12px] text-white/60 font-medium tracking-wide">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 px-3 py-2 rounded-full bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[13px] text-white/80 font-medium">Network Online</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/home/validator/notifications')}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <Bell className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;