// src/components/layout/SideBar.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { contributionMethods } from '../../lib/mockData';
import { cn, getContributionIcon } from '../../lib/utils';
import { X, Menu, Home, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const router = useRouter();
  const { logout, isValidated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const isActive = (path: string) => {
    if (path === '/home' && (router.pathname === '/home' || router.pathname.startsWith('/home/'))) return true;
    return router.pathname === path;
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  if (!mounted) return null;

  const sidebarContent = (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full bg-white border-r border-gray-100"
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded-sm transform rotate-45"></div>
        </div>
        <div className="font-bold text-xl text-gray-900">DataContrib</div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-8">
        {/* Main Navigation */}
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4 px-2">
            Dashboard
          </div>
          <nav className="space-y-1">
            <Link href={isValidated ? "/home/validator" : "/home/user"}>
              <motion.a
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive('/home')
                    ? "bg-black text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </motion.a>
            </Link>
          </nav>
        </div>

        {/* Contribution Methods - Only for Validators */}
        {isValidated && (
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4 px-2">
              Contribution Methods
            </div>
            <nav className="space-y-1">
              {contributionMethods.map((method) => {
                // Map old IDs to new route structure
                const getRoutePath = (id: string) => {
                  switch (id) {
                    case 'website-monitor':
                      return '/home/validator/website-monitor';
                    case 'network-metrics':
                      return '/home/validator/network-metrics';
                    case 'compute-resources':
                      return '/home/validator/computing-resources';
                    case 'geographic-data':
                      return '/home/validator/geographic-data';
                    case 'app-usage':
                      return '/home/validator/app-usage-metrics';
                    default:
                      return `/home/validator/${id}`;
                  }
                };
                
                const routePath = getRoutePath(method.id);
                
                return (
                  <Link key={method.id} href={routePath}>
                    <motion.a
                      whileHover={{ x: 4 }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                        isActive(routePath)
                          ? "bg-black text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <span className="text-lg">{getContributionIcon(method.icon)}</span>
                      <span className="text-sm">{method.name}</span>
                      {method.active && (
                        <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </motion.a>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Account Section */}
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4 px-2">
            Account
          </div>
          <nav className="space-y-1">
            <Link href="/notifications">
              <motion.a
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive('/notifications')
                    ? "bg-black text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </motion.a>
            </Link>
          </nav>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-100 p-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-600">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">John Doe</div>
            <div className="text-xs text-gray-500">52.37 SOL earned</div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ x: 4 }}
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-lg"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={isDesktop ? { x: 0 } : { x: "-100%" }}
        animate={{
          x: isDesktop || mobileOpen ? 0 : "-100%"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-72 z-50 lg:z-auto shadow-xl lg:shadow-none"
      >
        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 lg:hidden w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}
        
        {sidebarContent}
      </motion.aside>
    </>
  );
};

export default Sidebar;