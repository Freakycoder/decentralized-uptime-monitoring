import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Notification } from '../types';
import { notifications as initialNotifications } from '../lib/mockData';
// For simplicity in this demo, we'll create a simple UUID function instead of using a package
const generateId = () => Math.random().toString(36).substring(2, 11);

// Define the context interface
interface NotificationsContextType {
    notifications: Notification[];
    addNotification: (title: string, message: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    unreadCount: number;
}

// Create the context with default values
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Provider component
export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize notifications from mock data
    useEffect(() => {
        setNotifications(initialNotifications);
        updateUnreadCount(initialNotifications);
    }, []);

    // Update unread count when notifications change
    const updateUnreadCount = (notificationsList: Notification[]) => {
        const count = notificationsList.filter(n => n.read == false).length;
        setUnreadCount(count);
    };

    // Add a new notification
    const addNotification = (title: string, message: string) => {
        const newNotification: Notification = {
            id: `notif_${generateId()}`,
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications((prevNotifications) => [...prevNotifications, newNotification]);
        updateUnreadCount(notifications); // updating the unread count after adding a new notification.
    };

    // Mark a notification as read
    const markAsRead = (id: string) => {
        const updatedNotifications = notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        );
        setNotifications(updatedNotifications);
        updateUnreadCount(updatedNotifications); // after marking as read again update the unread count
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        const updatedNotifications = notifications.map(notification => ({
            ...notification,
            read: true,
        }));
        setNotifications(updatedNotifications);
        updateUnreadCount(updatedNotifications);
    };

    return (
        <NotificationsContext.Provider
            value={{ notifications, addNotification, markAsRead, markAllAsRead, unreadCount }}
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