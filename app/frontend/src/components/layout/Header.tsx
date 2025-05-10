// src/components/layout/Header.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import NotificationIndicator from './NotificationIndicator';
import { fadeIn } from '../../lib/framer-variants';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely access client-side APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Only render theme toggle on client-side to avoid hydration mismatch
  const themeToggle = mounted ? (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  ) : (
    <div className="h-10 w-10"></div> // Placeholder of same size
  );

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-10 h-16 bg-card border-b border-border shadow-sm flex justify-between items-center px-4 md:px-6"
    >
      <h1 className="text-xl font-semibold">{title}</h1>
      
      <div className="flex items-center gap-3">
        {/* Replace the old Bell button with our NotificationIndicator */}
        {mounted && <NotificationIndicator />}
        
        {themeToggle}
      </div>
    </motion.header>
  );
};

export default Header;