import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { notifications } from '../lib/mockData';
import { Notification } from '../types';
import { fadeIn, slideUp, staggerContainer } from '../lib/framer-variants';
import { formatDate } from '../lib/utils';
import { Bell, Check } from 'lucide-react';

const NotificationsPage = () => {
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state to handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get notifications data
  useEffect(() => {
    // In a real app, this would be an API call
    setUserNotifications(notifications);
    setLoading(false);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = () => {
    setUserNotifications(prevNotifications => 
      prevNotifications.map(notification => ({
        ...notification,
        read: true,
      }))
    );
  };

  // Mark a single notification as read
  const markAsRead = (id: string) => {
    setUserNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Only render on client-side to avoid hydration mismatch
  if (!mounted || loading) {
    return (
      <Layout title="Notifications">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  // Count unread notifications
  const unreadCount = userNotifications.filter(notification => !notification.read).length;

  return (
    <Layout title="Notifications">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header section */}
        <motion.div variants={fadeIn} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl text-primary">
                <Bell size={24} />
              </div>
              <h1 className="text-3xl font-bold">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                Mark all as read
              </Button>
            )}
          </div>
          
          <p className="text-muted-foreground max-w-3xl">
            Stay updated on your contributions, rewards, and system alerts.
          </p>
        </motion.div>

        {/* Notifications list */}
        <motion.div variants={slideUp}>
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {userNotifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {userNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      variants={fadeIn}
                      className={`p-4 flex items-start gap-4 relative ${
                        notification.read ? 'bg-card' : 'bg-secondary/20'
                      }`}
                    >
                      {!notification.read && (
                        <div className="absolute top-4 right-4">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse-opacity" />
                        </div>
                      )}
                      
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bell size={20} className="text-primary" />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="font-medium mb-1">{notification.title}</div>
                        <div className="text-muted-foreground text-sm mb-2">
                          {notification.message}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(notification.timestamp)}
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No notifications to display.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default NotificationsPage;