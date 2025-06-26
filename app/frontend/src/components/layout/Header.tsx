// src/components/layout/Header.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Moon, Sun, Settings } from 'lucide-react';
import NotificationIndicator from './NotificationIndicator';
import WalletButton from './WalletButton';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const themeToggle = mounted ? (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-gray-600" />
      ) : (
        <Sun className="h-5 w-5 text-gray-600" />
      )}
    </motion.button>
  ) : (
    <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse"></div>
  );

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div className="flex justify-between items-center px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="lg:hidden w-16"></div> {/* Spacer for mobile menu button */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Wallet Button */}
          {mounted && <WalletButton />}
          
          {/* Notifications */}
          {mounted && <NotificationIndicator />}
          
          {/* Settings Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </motion.button>
          
          {/* Theme Toggle */}
          {themeToggle}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;