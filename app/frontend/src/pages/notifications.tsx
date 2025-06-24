import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useNotifications } from '../contexts/NotificationsContext';
import { fadeIn, slideUp, staggerContainer } from '../lib/framer-variants';
import { formatDate } from '../lib/utils';
import { Bell, Check, CheckCircle, XCircle, Globe } from 'lucide-react';

const NotificationsPage = () => {
  const [mounted, setMounted] = useState(false);
  const { notifications, markAsRead, markAllAsRead, unreadCount, handleNotificationAction } = useNotifications();
  
  // Set mounted state to handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if notification is about website monitoring
  const isMonitoringTask = (notification: any) => {
    return notification.type === 'monitoring' || 
           notification.title.toLowerCase().includes('monitoring task') ||
           notification.message.toLowerCase().includes('website to monitor');
  };

  // Get icon based on notification type
  const getNotificationIcon = (notification: any) => {
    if (isMonitoringTask(notification)) {
      return <Globe size={20} className="text-blue-500" />;
    }
    return <Bell size={20} className="text-primary" />;
  };

  // Only render on client-side to avoid hydration mismatch
  if (!mounted) {
    return (
      <Layout title="Notifications">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

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
              <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
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
              {notifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      variants={fadeIn}
                      className={`p-4 flex items-start gap-4 relative transition-all duration-300 ${
                        notification.isNew
                          ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-l-4 border-l-primary shadow-md'
                          : notification.read 
                            ? 'bg-card hover:bg-secondary/30' 
                            : 'bg-secondary/20 hover:bg-secondary/40'
                      }`}
                    >
                      {/* New notification indicator */}
                      {notification.isNew && (
                        <div className="absolute top-2 right-2">
                          <div className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium animate-pulse">
                            NEW
                          </div>
                        </div>
                      )}
                      
                      {/* Unread indicator for non-new notifications */}
                      {!notification.read && !notification.isNew && (
                        <div className="absolute top-4 right-4">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      )}
                      
                      {/* Notification icon */}
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isMonitoringTask(notification) ? 'bg-blue-500/10' : 'bg-primary/10'
                      }`}>
                        {getNotificationIcon(notification)}
                      </div>
                      
                      {/* Notification content */}
                      <div className="flex-grow min-w-0">
                        <div className={`font-medium mb-1 ${notification.isNew ? 'text-primary' : ''}`}>
                          {notification.title}
                        </div>
                        <div className="text-muted-foreground text-sm mb-2">
                          {notification.message}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(notification.timestamp)}
                        </div>
                        
                        {/* Action buttons for monitoring tasks */}
                        {isMonitoringTask(notification) && !notification.actionTaken && !notification.read && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={() => handleNotificationAction(notification.id, 'accept')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleNotificationAction(notification.id, 'reject')}
                              size="sm"
                              variant="destructive"
                            >
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        
                        {/* Show action taken status */}
                        {notification.actionTaken && (
                          <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs ${
                            notification.actionTaken === 'accept' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {notification.actionTaken === 'accept' ? 
                              <CheckCircle size={12} /> : 
                              <XCircle size={12} />
                            }
                            {notification.actionTaken === 'accept' ? 'Accepted' : 'Rejected'}
                          </div>
                        )}
                      </div>
                      
                      {/* Mark as read button */}
                      {!notification.read && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 opacity-60 hover:opacity-100"
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
                  <Bell size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No notifications yet</p>
                  <p className="text-sm">New notifications will appear here when available.</p>
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