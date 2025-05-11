import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  isValidated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  checkValidatorStatus: () => Promise<boolean>;
  setValidated: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (token && isLoggedIn) {
        setIsAuthenticated(true);
        // Check if user is a validator
        const validatorStatus = localStorage.getItem('isValidator') === 'true';
        setIsValidated(validatorStatus);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Protect routes - redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && router.pathname !== '/' && router.pathname !== '/signup') {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://127.0.0.1:3001/user/signin', {
        username: '',
        email,
        password
      });

      if (response.data.status_code === 200 && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        setIsAuthenticated(true);
        
        // Check validator status after login
        await checkValidatorStatus();
        
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isValidator');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setIsValidated(false);
    // UPDATED: Now redirects to root (/) instead of /login
    router.push('/');
  };

  const checkValidatorStatus = async () => {
    // This would be a real API call in production
    // For now, we'll just check localStorage
    try {
      // In a real app, you would call your backend API to check
      // const response = await axios.get('http://127.0.0.1:3001/validator/status', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      // });
      // const isValidator = response.data.isValidator;
      
      const isValidator = localStorage.getItem('isValidator') === 'true';
      setIsValidated(isValidator);
      return isValidator;
    } catch (error) {
      console.error('Failed to check validator status:', error);
      return false;
    }
  };

  const setValidated = (status: boolean) => {
    localStorage.setItem('isValidator', status.toString());
    setIsValidated(status);
  };

  // Don't render children until we've checked authentication
  if (isLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isValidated,
      login, 
      logout,
      checkValidatorStatus,
      setValidated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};