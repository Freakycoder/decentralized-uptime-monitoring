import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import AppLayout from '../../../components/AppLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { useValidatorNotifications } from '../../../hooks/useValidatorNotifications';
import { formatDate } from '../../../lib/utils';
import { 
  Bell, 
  Check, 
  CheckCircle, 
  XCircle, 
  Globe, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

const ValidatorNotifications = () => {
  const router = useRouter();
  const { isValidated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'monitoring'>('all');
  
  // Use the custom hook for all notification logic
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    handleNotificationAction,
    isNotificationRead
  } = useValidatorNotifications();

  useEffect(() => {
    setMounted(true);
    
    // Redirect non-validators
    if (mounted && !isValidated) {
      router.push('/home/user');
    }
  }, [mounted, isValidated, router]);

  const isMonitoringTask = (notification: any) => {
    return notification.notification_type === 'monitoring' || 
           notification.title.toLowerCase().includes('monitoring task') ||
           notification.message.toLowerCase().includes('website to monitor');
  };

  const getNotificationIcon = (notification: any) => {
    if (isMonitoringTask(notification)) {
      return <Globe size={20} className="text-blue-400" />;
    }
    
    if (notification.title.toLowerCase().includes('reward')) {
      return <TrendingUp size={20} className="text-emerald-400" />;
    }
    
    if (notification.title.toLowerCase().includes('streak')) {
      return <Award size={20} className="text-amber-400" />;
    }
    
    return <Bell size={20} className="text-white/60" />;
  };

  const getNotificationBgColor = (notification: any) => {
    if (notification.isNew) {
      return 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30';
    }
    
    if (isMonitoringTask(notification)) {
      return 'bg-white/5 border-white/10 hover:bg-white/10';
    }
    
    return 'bg-white/5 border-white/10 hover:bg-white/10';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !isNotificationRead(notification.id);
    if (filter === 'monitoring') return isMonitoringTask(notification);
    return true;
  });

  if (!mounted) {
    return (
      <AppLayout title="Notifications">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#e1e1e1] border-t-[#5E6AD2] rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white/60 text-[14px]">Loading notifications...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isValidated) {
    return null; // Will redirect
  }

  return (
    <AppLayout title="Validator Notifications">
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            
            <div>
              <h1 className="text-3xl font-bold text-white">Notifications</h1>
              <p className="text-white/60 text-sm">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={markAllAsRead}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark All Read</span>
            </motion.button>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-2 p-2 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 max-w-md"
        >
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'monitoring', label: 'Monitoring', count: notifications.filter(isMonitoringTask).length }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 flex items-center space-x-2 flex-1 relative overflow-hidden
                ${filter === tab.key 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {filter === tab.key && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                  layoutId="activeNotificationTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              {tab.count > 0 && (
                <span className="relative z-10 bg-white/20 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                <div className="text-white/60">Loading notifications...</div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Error Loading Notifications</h3>
              <p className="text-white/60">{error}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center p-12">
              <Bell className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'monitoring' ? 'No monitoring notifications' : 
                 'No notifications yet'}
              </h3>
              <p className="text-white/60">
                {filter === 'all' 
                  ? "You'll receive notifications here for monitoring tasks, rewards, and system updates."
                  : "Try switching to a different filter to see more notifications."
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  p-6 rounded-2xl border transition-all duration-300 cursor-pointer
                  ${getNotificationBgColor(notification)}
                  ${!isNotificationRead(notification.id) ? 'shadow-lg' : ''}
                `}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${!isNotificationRead(notification.id) ? 'text-white' : 'text-white/80'}`}>
                          {notification.title}
                        </h4>
                        <p className={`mt-1 text-sm ${!isNotificationRead(notification.id) ? 'text-white/90' : 'text-white/60'}`}>
                          {notification.message}
                        </p>
                        
                        {notification.website_url && (
                          <div className="mt-2 p-2 bg-white/5 rounded-lg border border-white/10">
                            <span className="text-xs text-white/60">Website: </span>
                            <span className="text-sm text-blue-400 font-mono">
                              {notification.website_url}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!isNotificationRead(notification.id) && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                        <span className="text-xs text-white/40 whitespace-nowrap">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons for monitoring tasks */}
                    {isMonitoringTask(notification) && !isNotificationRead(notification.id) && (
                      <div className="flex space-x-2 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(notification.id, 'accept');
                          }}
                          className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept Task</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(notification.id, 'reject');
                          }}
                          className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ValidatorNotifications;