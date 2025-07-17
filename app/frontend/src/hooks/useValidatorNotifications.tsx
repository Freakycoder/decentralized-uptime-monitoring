import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

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

interface UseValidatorNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  handleNotificationAction: (notificationId: string, action: 'accept' | 'reject') => Promise<void>;
  isNotificationRead: (notificationId: string) => boolean;
}

export const useValidatorNotifications = (): UseValidatorNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readStatus, setReadStatus] = useState(new Set<string>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validatorId = typeof window !== 'undefined' ? localStorage.getItem('validatorId') : null;

  // Load existing notifications from DB
  const loadExistingNotifications = useCallback(async () => {
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
  }, [validatorId]);

  // Load notifications on mount
  useEffect(() => {
    loadExistingNotifications();
  }, [loadExistingNotifications]);

  // Establish SSE connection for real-time updates
  useEffect(() => {
    if (!validatorId) return;

    console.log(`🔌 Establishing SSE connection for validator: ${validatorId}`);
    
    const eventSource = new EventSource(`http://localhost:3001/sse/validator-notification/${validatorId}`);
    
    eventSource.addEventListener('notification', (event) => {
      try {
        const serverMessage: ServerMessage = JSON.parse(event.data);
        console.log('📨 Received SSE notification:', serverMessage);
        
        // Create notification object (matches DB structure)
        const newNotification: Notification = {
          id: `temp_${Date.now()}`,
          title: 'New Website to Monitor',
          message: `Monitor ${serverMessage.url}`,
          website_url: serverMessage.url,
          website_id: serverMessage.id,
          notification_type: 'monitoring',
          created_at: new Date().toISOString(),
          read: false
        };
        
        // Add to notifications array
        setNotifications(prev => [newNotification, ...prev]);
        
        console.log('✅ Real-time notification added to UI');
      } catch (error) {
        console.error('❌ Error parsing SSE message:', error);
      }
    });
    
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

  // Mark individual notification as read
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

  // Mark all notifications as read
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

  // Handle notification actions (accept/reject for monitoring tasks)
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

  // Helper function to check if notification is read
  const isNotificationRead = useCallback((notificationId: string) => {
    return readStatus.has(notificationId);
  }, [readStatus]);

  // Calculate unread count efficiently
  const unreadCount = notifications.length - readStatus.size;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    handleNotificationAction,
    isNotificationRead
  };
};