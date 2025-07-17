// src/pages/notifications.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const NotificationsPage = () => {
  const router = useRouter();
  const { isValidated } = useAuth();

  useEffect(() => {
    // Redirect based on user type
    if (isValidated) {
      // Validators get in-app notifications
      router.replace('/home/validator/notifications');
    } else {
      // Regular users get email notifications, redirect to dashboard
      router.replace('/home/user');
    }
  }, [isValidated, router]);

  // Show loading while redirecting
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default NotificationsPage;