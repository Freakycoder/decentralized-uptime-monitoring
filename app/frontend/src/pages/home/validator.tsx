import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useValidatorNotifications } from '@/hooks/useValidatorNotifications';
import { formatDate } from '@/lib/utils';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Globe, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  RefreshCw,
  Users,
  DollarSign,
  ChevronRight
} from 'lucide-react';

export default function ValidatorDashboard() {
  const router = useRouter();
  const { isValidated } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Use the custom hook for all notification logic
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    handleNotificationAction,
    isNotificationRead
  } = useValidatorNotifications();

  useEffect(() => {
    setMounted(true);
    
    // Redirect non-validators to user dashboard
    if (mounted && !isValidated) {
      router.push('/home/user');
      return;
    }
  }, [mounted, isValidated, router]);

  const getNotificationIcon = (notification: any) => {
    if (notification.notification_type === 'monitoring') {
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

  if (!mounted) {
    return (
      <AppLayout title="Validator Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isValidated) {
    return null; // Will redirect
  }

  return (
    <AppLayout title="Validator Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, Validator!</h1>
                <p className="text-blue-600 font-medium">Network Status: Active & Earning</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-700 font-medium text-sm">Live</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Today's Earnings</h3>
                <p className="text-2xl font-bold text-gray-900">0.24 SOL</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">+12% from yesterday</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sites Monitored</h3>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Active monitoring tasks</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Validator Rank</h3>
                <p className="text-2xl font-bold text-gray-900">#247</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Out of 12,847 validators</p>
          </motion.div>
        </div>

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        >
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-orange-600">{unreadCount} unread</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => router.push('/home/validator/notifications')}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                <span className="ml-2 text-gray-600">Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      isNotificationRead(notification.id)
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                          {!isNotificationRead(notification.id) && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                Mark read
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Action buttons for monitoring tasks */}
                        {notification.notification_type === 'monitoring' && !isNotificationRead(notification.id) && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleNotificationAction(notification.id, 'accept')}
                              className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleNotificationAction(notification.id, 'reject')}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/home/validator/website-monitor')}
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Globe className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Website Monitor</div>
                <div className="text-sm text-gray-600">Add websites to monitor</div>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/home/validator/notifications')}
              className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Bell className="w-6 h-6 text-orange-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">View Notifications</div>
                <div className="text-sm text-gray-600">Check all notifications</div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}