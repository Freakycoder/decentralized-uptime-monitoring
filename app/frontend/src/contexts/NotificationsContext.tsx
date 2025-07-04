import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Notification } from '../types';
import { notifications as initialNotifications } from '../lib/mockData';
import axios from 'axios';

// For simplicity in this demo, we'll create a simple UUID function instead of using a package
const generateId = () => Math.random().toString(36).substring(2, 11);

interface NotificationsContextType {
    notifications: Notification[];
    addNotification: (title: string, message: string, type: string, data?: any) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    unreadCount: number;
    handleNotificationAction: (id: string, action: 'accept' | 'reject') => void;
    loading : boolean;
    error : string | null
}

// Create the context with default values
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Provider component
export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Calculate unread count directly from notifications
    const unreadCount = notifications.filter(n => !n.read).length;

    const validatorId = localStorage.getItem('validatorId');
    const token = localStorage.getItem('authToken');

    const loadNotifications = async () => {
        if (!validatorId || !token) {
            console.log('❌ No validator ID or token available');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`http://localhost:3001/notifications/validator/${validatorId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.status_code === 200) {
                const convertedNotifications: Notification[] = response.data.notifications.map((notif: any) => ({
                    id: notif.id,
                    title: notif.title,
                    message: notif.message,
                    timestamp: notif.created_at,
                    read: notif.read,
                    type: notif.notification_type,
                    data: notif.data,
                    actionTaken: notif.action_taken,
                    isNew: false,
                }));
                setNotifications(convertedNotifications);
                console.log(`✅ Loaded ${convertedNotifications.length} notifications`);
            } else {
                setError(response.data.message || 'Failed to load notifications');
            }
        } catch (err: any) {
            console.error('Error loading notifications:', err);
            setError('Failed to load notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications()
    }, [validatorId, token]);

    // Add a new notification
    const addNotification = async (title: string, message: string, type: string, data?: any) => {
        const newNotification = {
            validator_id: validatorId,
            title,
            message,
            created_at: Date.now(),
            data: { url: data.url, website_id: data.website_id },
            read: false,
            notification_type: type,
        };

        let response = await axios.post("http://localhost:3001/", newNotification);
        setNotifications(response.data.notification);
    };

    // Handle notification actions (accept/reject for monitoring tasks)
    const handleNotificationAction = async (id: string, action: 'accept' | 'reject') => {
        const notification = notifications.find(n => n.id === id);

        if (action === 'accept' && notification?.notification_type === 'monitoring' && notification?.data) {
            // function to Send monitoring task to extension
            sendMonitoringTaskToExtension(notification.data.url, notification.data.website_id);

            console.log(`✅ Monitoring task accepted and sent to extension:`, {
                url: notification.data.url,
                website_id: notification.data.website_id
            });
        }
        try {
            const response = await axios.post(`http://localhost:3001/notification/${id}`, {
                read: true,
                action_taken: action
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.data.status_code === 200) {
                setNotifications(prevNotification =>
                    prevNotification.map(notif =>
                        notif.id === id
                            ? {
                                ...notif,
                                read: true,
                                actionTaken: action,
                            }
                            : notif
                    )
                );
                console.log(`✅ Notification ${id} ${action}ed and saved to database`);
            }
            else {
                setError('Failed to update notification');
            }
        } catch (e) {
            console.error('Error updating notification:', e);
            setError('Failed to update notification');
        }
    };

    // Function to communicate with extension
    const sendMonitoringTaskToExtension = (url: string, website_id: string) => {
        try {
            window.postMessage({
                type: 'START_MONITORING',
                url: url,
                websiteId: website_id,
                sessionId: generateId(),
                totalRuns: 8
            }, '*');

            console.log('📡 Sent monitoring task via window.postMessage');
        } catch (error) {
            console.error('❌ Failed to send via postMessage:', error);
        }
    };

    // Mark a notification as read
    const markAsRead = async (id: string) => {
        if (!token) {
            console.error('❌ No token available');
            return;
        }
        try {
            const response = await axios.patch(`http://localhost:3001/notifications/${id}`, {
                read: true
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.status_code === 200) {
                setNotifications((prevNotifications) =>
                    prevNotifications.map(notification =>
                        notification.id === id ? { ...notification, read: true } : notification
                    )
                );
                console.log(`✅ Marked notification ${id} as read`);
            } else {
                setError('Failed to mark notification as read');
            }
        } catch (err: any) {
            console.error('Error marking as read:', err);
            setError('Failed to mark notification as read');
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async() => {
        if (!validatorId || !token) {
            console.error('❌ No validator ID or token available');
            return;
        }

        try {
            const response = await axios.put('http://localhost:3001/notifications/mark-all-read', {
                validator_id: validatorId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.status_code === 200) {
                setNotifications((prevNotifications) =>
                    prevNotifications.map(notification => ({
                        ...notification,
                        read: true,
                    }))
                );
                console.log(`✅ Marked all notifications as read (${response.data.updated_count} updated)`);
            } else {
                setError('Failed to mark all notifications as read');
            }
        } catch (err: any) {
            console.error('Error marking all as read:', err);
            setError('Failed to mark all notifications as read');
        }
    };

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                addNotification,
                markAsRead,
                markAllAsRead,
                unreadCount,
                handleNotificationAction,
                loading,
                error
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};

// Custom hook to use the notifications context
export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};