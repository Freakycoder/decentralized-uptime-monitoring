import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { useNotifications } from '../../contexts/NotificationsContext';
import Link from 'next/link';

const NotificationIndicator: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [showPulse, setShowPulse] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);

  useEffect(() => {
    if (unreadCount > previousCount) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 3000);
      return () => clearTimeout(timer);
    }
    setPreviousCount(unreadCount);
  }, [unreadCount, previousCount]);

  return (
    <Link href="/notifications" passHref>
      <Button
        variant="ghost"
        size="icon"
        className="relative w-9 h-9 rounded-lg hover:bg-accent"
      >
        <Bell size={18} className="text-muted-foreground" />
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute -top-1 -right-1"
            >
              <span className="relative flex h-5 w-5">
                {showPulse && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </Link>
  );
};

export default NotificationIndicator;