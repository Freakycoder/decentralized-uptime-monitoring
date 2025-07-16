import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

interface Notification {
  id: string;
  title: string;
  message: string;
  website_url: string;
  website_id: string;
  notification_type: string;
  created_at: string;
  read: boolean;
}

interface ServerMessage {
  url: string;
  id: string;
}

export default function ValidatorDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readStatus, setReadStatus] = useState(new Set<string>()); // Separate read state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validatorId = localStorage.getItem('validatorId');

  // 1. Load existing notifications from DB on page load
  useEffect(() => {
    const loadExistingNotifications = async () => {
      if (!validatorId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/notifications/validator?validator_id=${validatorId}`);

        if (response.data.status_code === 200) {
          const notifs = response.data.notifications;
          setNotifications(notifs);
          
          // Initialize read status from DB
          const readIds = new Set<string>(
            notifs.filter((n: Notification) => n.read).map((n: Notification) => n.id)
          );
          setReadStatus(readIds);
          
          console.log(`✅ Loaded ${notifs.length} notifications`);
        } else {
          setError('Failed to load notifications');
        }
      } catch (err: any) {
        console.error('Error loading notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    loadExistingNotifications();
  }, [validatorId]);

  // 2. Establish SSE connection for real-time updates
  useEffect(() => {
    if (!validatorId) return;

    console.log(`🔌 Establishing SSE connection for validator: ${validatorId}`);
    
    const eventSource = new EventSource(`http://localhost:3001/sse/validator-notification/${validatorId}`);
    
    eventSource.onmessage = (event) => {
      try {
        const serverMessage: ServerMessage = JSON.parse(event.data);
        console.log('📨 Received SSE notification:', serverMessage);
        
        // Create notification object (matches DB structure)
        const newNotification: Notification = {
          id: `temp_${Date.now()}`, // Temporary ID for UI
          title: 'New Website to Monitor',
          message: `Monitor ${serverMessage.url}`,
          website_url: serverMessage.url,
          website_id: serverMessage.id,
          notification_type: 'monitoring',
          created_at: new Date().toISOString(),
          read: false
        };
        
        // Add to notifications array (backend already saved to DB)
        setNotifications(prev => [newNotification, ...prev]);
        

        
        console.log('✅ Real-time notification added to UI');
      } catch (error) {
        console.error('❌ Error parsing SSE message:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
    };
    
    eventSource.onopen = () => {
      console.log('✅ SSE connection established');
    };
    
    return () => {
      console.log('🔌 Closing SSE connection');
      eventSource.close();
    };
  }, [validatorId]);

  // 3. Mark individual notification as read (optimized)
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!validatorId) return;
    
    try {
      // Optimistically update UI first
      setReadStatus(prev => new Set([...prev, notificationId]));
      
      // Then update database
      const response = await api.patch(`/notifications/${notificationId}`, {
        read: true
      });
      
      if (response.data.status_code !== 200) {
        // Revert on failure
        setReadStatus(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
        setError('Failed to mark notification as read');
      } else {
        console.log(`✅ Marked notification ${notificationId} as read`);
      }
    } catch (error) {
      // Revert on error
      setReadStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      console.error('Error marking as read:', error);
      setError('Failed to mark notification as read');
    }
  }, [validatorId]);

  // 4. Mark all notifications as read (optimized)
  const markAllAsRead = useCallback(async () => {
    if (!validatorId) return;
    
    try {
      // Optimistically update UI first
      const allNotificationIds = new Set(notifications.map(n => n.id));
      setReadStatus(allNotificationIds);
      
      // Then update database
      const response = await api.put('/notifications/mark-all-read', {
        validator_id: validatorId
      });
      
      if (response.data.status_code !== 200) {
        // Revert on failure - restore original read status
        const originalReadIds = new Set(
          notifications.filter(n => n.read).map(n => n.id)
        );
        setReadStatus(originalReadIds);
        setError('Failed to mark all notifications as read');
      } else {
        console.log(`✅ Marked all notifications as read (${response.data.updated_count} updated)`);
      }
    } catch (error) {
      // Revert on error
      const originalReadIds = new Set(
        notifications.filter(n => n.read).map(n => n.id)
      );
      setReadStatus(originalReadIds);
      console.error('Error marking all as read:', error);
      setError('Failed to mark all notifications as read');
    }
  }, [validatorId, notifications]);

  // 5. Handle notification actions (accept/reject for monitoring tasks)
  const handleNotificationAction = useCallback(async (notificationId: string, action: 'accept' | 'reject') => {
    if (!validatorId) return;
    
    const notification = notifications.find(n => n.id === notificationId);
    
    if (action === 'accept' && notification?.notification_type === 'monitoring') {
      // Send monitoring task to extension
      try {
        window.postMessage({
          type: 'START_MONITORING',
          url: notification.website_url,
          websiteId: notification.website_id,
          sessionId: `session_${Date.now()}`,
          totalRuns: 8
        }, '*');
        
        console.log('📡 Sent monitoring task to extension:', {
          url: notification.website_url,
          website_id: notification.website_id
        });
      } catch (error) {
        console.error('❌ Failed to send task to extension:', error);
      }
    }
    
    try {
      // Update notification with action
      const response = await api.patch(`/notifications/${notificationId}`, {
        read: true,
        action_taken: action
      });
      
      if (response.data.status_code === 200) {
        // Mark as read and update local state
        setReadStatus(prev => new Set([...prev, notificationId]));
        
        // You might want to update the notification with action_taken
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        
        console.log(`✅ Notification ${notificationId} ${action}ed and saved`);
      } else {
        setError('Failed to update notification');
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      setError('Failed to update notification');
    }
  }, [validatorId, notifications]);



  // 6. Helper function to check if notification is read
  const isNotificationRead = useCallback((notificationId: string) => {
    return readStatus.has(notificationId);
  }, [readStatus]);

  // 7. Calculate unread count efficiently
  const unreadCount = notifications.length - readStatus.size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your validator dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AnalyticsDashboard userType='validator' />
);
}