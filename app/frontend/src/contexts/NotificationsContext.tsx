import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Notification } from '../types';
import { notifications as initialNotifications } from '../lib/mockData';

// For simplicity in this demo, we'll create a simple UUID function instead of using a package
const generateId = () => Math.random().toString(36).substring(2, 11);

// Define the context interface
interface NotificationsContextType {
    notifications: Notification[];
    addNotification: (title: string, message: string, type?: string, data?: any) => void;
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
        setNotifications(initialNotifications);
    }, []);

    // Add a new notification (new ones go to the top)
    const addNotification = (title: string, message: string, type: string = 'general', data?: any) => {
        const newNotification: Notification = {
            id: `notif_${generateId()}`,
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false,
            type, // Add type field
            data, // Add data field for additional info
            isNew: true, // Mark as new for highlighting
        };
        
        // Add to the beginning of the array (top)
        setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
        
        // Remove the isNew flag after 5 seconds for visual effect
        setTimeout(() => {
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === newNotification.id 
                        ? { ...notif, isNew: false }
                        : notif
                )
            );
        }, 5000);
    };

    // Handle notification actions (accept/reject for monitoring tasks)
    const handleNotificationAction = (id: string, action: 'accept' | 'reject') => {
        const notification = notifications.find(n => n.id === id);
        
        if (action === 'accept' && notification?.type === 'monitoring' && notification?.data) {
            // Send monitoring task to extension
            sendMonitoringTaskToExtension(notification.data.url, notification.data.website_id);
            
            console.log(`✅ Monitoring task accepted and sent to extension:`, {
                url: notification.data.url,
                website_id: notification.data.website_id
            });
        }

        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id
                    ? { 
                        ...notif, 
                        read: true, 
                        actionTaken: action,
                        message: `${notif.message} - ${action === 'accept' ? 'Accepted' : 'Rejected'}`
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
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        setNotifications((prevNotifications) =>
            prevNotifications.map(notification => ({
                ...notification,
                read: true,
            }))
        );
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