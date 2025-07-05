import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import SessionManager from '@/services/SessionManager';

interface AuthContextType {
  isAuthenticated: boolean;
  isValidated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

interface UserProfile {
  userId: string,
  validatorId: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const validateCurrentSession = async (): Promise<boolean> => {
    const sessionStatus = await SessionManager.checkSessionStatus();

    if (sessionStatus?.isValid && sessionStatus.userId) {
      setIsAuthenticated(true); // autheticated means the user has a user_id, means registered and the cookie session is valid.
      if (sessionStatus.validatorId) {
        setIsValidated(true);
      }

      // const profile : UserProfile = {
      //   userId : sessionStatus.userId,
      //   validatorId : sessionStatus.validatorId
      // }

      // can create a state variable and name it as userProfile to store the info and access it anywhere in the app using useHook.
      // for now we're not using it since we're storing the userProfile data in localstorage.

      SessionManager.setLocalAuthState(sessionStatus);
      console.log('Session validation succesfull');
      return true
    }
    else {
      console.log('Session validation failed');
      setIsAuthenticated(false);
      setIsValidated(false);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      if (sessionStatus?.validatorId) {
        localStorage.removeItem('validatorId');
      }
      return false
    }
  }

  // Check if user is authenticated on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      console.log('🚀 Initializing authentication state...');

      const isValidSession = await validateCurrentSession();

      if (isValidSession) { // here we know user is having a valid session so redirect him to dashboard if he's on other routes.
        if (router.pathname === '/login' || router.pathname === "/signup") {
          const localData = SessionManager.getLocalUserData();
          if (localData.validatorId) {
            console.log('Authenticated validator - redirecting to vlaidator dashboard...');
            router.push('/home?view=validator')
          } else {
            console.log('Authenticated user - showing validator registration option');
            router.push('/home?view=user');
          }
        }
      } else { // we enter else when user has no valid session.
        if (router.pathname !== '/login' && router.pathname !== "/signup") { // if a user is present on any route other than login or signup than bring him to login. since he's having invalid session
          router.push('/login');
        }
      }
      setIsLoading(false);
    }
    initializeAuth()
  }, []);


  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://127.0.0.1:3001/user/signin', {
        email,
        password
      }, { withCredentials: true });

      if (response.data.status_code === 200 && response.data.user_data) {
        localStorage.setItem('userId', response.data.user_data.user_id);
        localStorage.setItem('isLoggedIn', 'true');
        if (response.data.user_data.validatorId){
          localStorage.setItem('validator_id', response.data.user_data.user_id);
          setIsValidated(true)
        }
        setIsAuthenticated(true);

        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error) { // ask gpt about wallet connection after login.
      console.error('Login error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('validatorId');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setIsValidated(false);
    router.push('/login');
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