// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import SessionManager from '@/services/SessionManager';
import TokenManager from '@/services/TokenManager';
import api from '@/lib/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  isValidated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  setValidated: (validated: boolean) => void; // Add this to the interface
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Manual session check method
  // const checkSession = async (): Promise<boolean> => {
  //   const sessionStatus = await SessionManager.checkSessionStatus();

  //   if (sessionStatus?.isValid && sessionStatus.userId) {
  //     setIsAuthenticated(true);
  //     if (sessionStatus.validatorId) {
  //       setIsValidated(true);
  //     }
  //     SessionManager.setLocalAuthState(sessionStatus);
  //     return true;
  //   } else {
  //     setIsAuthenticated(false);
  //     setIsValidated(false);
  //     SessionManager.setLocalAuthState({
  //       isValid: false,
  //       userId: '',
  //       validatorId: null
  //     });
  //     return false;
  //   }
  // };

  // Initialize auth state from JWT token and localStorage
  useEffect(() => {
    const initializeAuth = () => {
      console.log('🚀 Initializing authentication state from JWT token...');

      const hasToken = TokenManager.hasToken();
      const localData = SessionManager.getLocalUserData();

      if (hasToken && localData.isLoggedIn === 'true' && localData.userId) {
        console.log('✅ Found JWT token and local session data');
        setIsAuthenticated(true);

        if (localData.validatorId) {
          setIsValidated(true);
          console.log('🎫 User is a validator');
        }
      } else {
        console.log('❌ No JWT token or local session data found');
        // Clear any stale data
        TokenManager.removeToken();
        setIsAuthenticated(false);
        setIsValidated(false);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/user/signin', { email, password });

      if (response.data.status_code === 200 && response.data.user_data && response.data.token) {
        console.log('✅ Login successful');

        // Store JWT token
        TokenManager.setToken(response.data.token);

        // Store user data in localStorage
        localStorage.setItem('userId', response.data.user_data.user_id);
        localStorage.setItem('isLoggedIn', 'true');

        if (response.data.user_data.validator_id) {
          localStorage.setItem('validatorId', response.data.user_data.validator_id);
          setIsValidated(true);
          console.log('🎫 User is a validator');
          router.push('/home/validator')
        } else {
          localStorage.removeItem('validatorId');
          setIsValidated(false);
          console.log('👤 User is not a validator');
          router.push('/home/user');
        }
        setIsAuthenticated(true);

        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.message || 'Authentication failed';
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user...');
    // Clear JWT token
    TokenManager.removeToken();
    
    // Clear localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('validatorId');
    
    // Reset auth state
    setIsAuthenticated(false);
    setIsValidated(false);
    
    // Redirect to login
    router.push('/login');
  };

  // Don't render children until we've checked localStorage
  if (isLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isValidated,
      login,
      logout,
      setValidated: setIsValidated,
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