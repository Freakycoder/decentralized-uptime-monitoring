import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Notification } from '../types';
import { notifications as initialNotifications } from '../lib/mockData';
import axios from 'axios';

// For simplicity in this demo, we'll create a simple UUID function instead of using a package
const generateId = () => Math.random().toString(36).substring(2, 11);

// Define the context interface
interface NotificationsContextType {
    notifications: Notification[];
    addNotification: (title: string, message: string, type: string, data?: any) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    unreadCount: number;
    handleNotificationAction: (id: string, action: 'accept' | 'reject') => void;
}

// Create the context with default values
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Provider component
export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Calculate unread count directly from notifications
    const unreadCount = notifications.filter(n => !n.read).length;

    // Initialize notifications from mock data
    useEffect(() => {

        const getNotifications = async () => {
            const response = await axios.get('http://locahost:3001/notifications/validator/validator_id'); // for now just put
            setNotifications(response.data.notifications);
        }
        getNotifications()
    }, []);

    // Add a new notification (new ones go to the top)
    const addNotification = async (title: string, message: string, type: string, data?: any) => {
        const newNotification = {
            validator_id: "",
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
    const handleNotificationAction = (id: string, action: 'accept' | 'reject') => {
        const notification = notifications.find(n => n.id === id);

        if (action === 'accept' && notification?.notification_type === 'monitoring' && notification?.data) {
            // Send monitoring task to extension
            const response = axios.post(`http://localhost:3001/notification/${id}` , {
                read : true,
                action_taken : action
            })
            sendMonitoringTaskToExtension(notification.data.url, notification.data.website_id);

            console.log(`✅ Monitoring task accepted and sent to extension:`, {
                url: notification.data.url,
                website_id: notification.data.website_id
            });
        }

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

        console.log(`Notification ${id} ${action}ed`);
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
    const markAsRead = (id: string) => {
        setNotifications((prevNotifications) =>
            prevNotifications.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
        const response = axios.post(`http://localhost:3001/notification/${id}` , {
                read : true
        })
    };
    
    // Mark all notifications as read
    const markAllAsRead = () => {
        setNotifications((prevNotifications) =>
            prevNotifications.map(notification => ({
                ...notification,
                read: true,
            }))
        );
        const response = axios.put('http://localhost:3001/notification/mark-all-read/', {
            validator_id : ''
        })
    };

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                addNotification,
                markAsRead,
                markAllAsRead,
                unreadCount,
                handleNotificationAction
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