import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useNotifications } from '../contexts/NotificationsContext';
import { formatDate } from '../lib/utils';
import { Bell, Check, CheckCircle, XCircle, Globe, TrendingUp, Award, AlertTriangle} from 'lucide-react';

const NotificationsPage = () => {
  const [mounted, setMounted] = useState(false);
  const { notifications, markAsRead, markAllAsRead, unreadCount, handleNotificationAction } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'monitoring'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const isMonitoringTask = (notification: any) => {
    return notification.type === 'monitoring' || 
           notification.title.toLowerCase().includes('monitoring task') ||
           notification.message.toLowerCase().includes('website to monitor');
  };

  const getNotificationIcon = (notification: any) => {
    if (isMonitoringTask(notification)) {
      return <Globe size={20} className="text-blue-500" />;
    }
    
    if (notification.title.toLowerCase().includes('reward')) {
      return <TrendingUp size={20} className="text-emerald-500" />;
    }
    
    if (notification.title.toLowerCase().includes('streak')) {
      return <Award size={20} className="text-amber-500" />;
    }
    
    return <Bell size={20} className="text-gray-500" />;
  };

  const getNotificationBgColor = (notification: any) => {
    if (notification.isNew) {
      return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200';
    }
    if (!notification.read) {
      return 'bg-blue-50/50 border-blue-100';
    }
    return 'bg-white border-gray-200';
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'monitoring':
        return isMonitoringTask(notification);
      default:
        return true;
    }
  });

  if (!mounted) {
    return (
      <Layout title="Notifications">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">Loading notifications...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Notifications">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Bell className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
                <p className="text-lg text-gray-600 mt-2">
                  Stay updated on your contributions, rewards, and system alerts
                </p>
                {unreadCount > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-600 font-medium">
                      {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="bg-white text-gray-700 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
              >
                Mark all as read
              </motion.button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-2">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Notifications', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'monitoring', label: 'Monitoring Tasks', count: notifications.filter(isMonitoringTask).length }
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(tab.key as any)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    filter === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-6 transition-all duration-300 hover:bg-gray-50 ${getNotificationBgColor(notification)}`}
                >
                  {/* New notification badge */}
                  {notification.isNew && (
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium animate-pulse">
                        NEW
                      </div>
                    </div>
                  )}
                  
                  {/* Unread indicator for non-new notifications */}
                  {!notification.read && !notification.isNew && (
                    <div className="absolute top-6 right-6">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    {/* Notification icon */}
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notification)}
                    </div>
                    
                    {/* Notification content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className={`font-semibold mb-1 ${notification.isNew ? 'text-blue-900' : 'text-gray-900'}`}>
                            {notification.title}
                          </div>
                          <div className="text-gray-600 mb-3 leading-relaxed">
                            {notification.message}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(notification.timestamp)}
                          </div>
                        </div>

                        {/* Mark as read button */}
                        {!notification.read && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => markAsRead(notification.id)}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-gray-600" />
                          </motion.button>
                        )}
                      </div>
                      
                      {/* Action buttons for monitoring tasks */}
                      {isMonitoringTask(notification) && !notification.actionTaken && !notification.read && (
                        <div className="flex gap-3 mt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleNotificationAction(notification.id, 'accept')}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Accept
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleNotificationAction(notification.id, 'reject')}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                          >
                            <XCircle size={16} />
                            Reject
                          </motion.button>
                        </div>
                      )}
                      
                      {/* Show action taken status */}
                      {notification.actionTaken && (
                        <div className={`inline-flex items-center gap-2 mt-3 px-3 py-2 rounded-xl text-sm font-medium ${
                          notification.actionTaken === 'accept' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {notification.actionTaken === 'accept' ? 
                            <CheckCircle size={14} /> : 
                            <XCircle size={14} />
                          }
                          {notification.actionTaken === 'accept' ? 'Accepted' : 'Rejected'}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No notifications yet' : 
                 filter === 'unread' ? 'No unread notifications' : 
                 'No monitoring notifications'}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' ? 'New notifications will appear here when available.' :
                 filter === 'unread' ? 'All notifications have been read.' :
                 'Monitoring task notifications will appear here.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </Layout>
  );
};

export default NotificationsPage;