import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { useNotifications } from '../../contexts/NotificationsContext';
import Link from 'next/link';

const NotificationIndicator: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate the bell when there are new unread notifications
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  return (
    <Link href="/notifications" passHref>
      <Button variant="outline" size="icon" className="relative">
        <AnimatePresence>
          {isAnimating && (
            <motion.span
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0] }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Bell className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
        
        <Bell className={`h-5 w-5 ${isAnimating ? 'opacity-0' : 'opacity-100'}`} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary">
                {unreadCount > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
            </span>
          </span>
        )}
      </Button>
    </Link>
  );
};

export default NotificationIndicator;