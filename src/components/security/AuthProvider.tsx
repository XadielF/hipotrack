import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'homebuyer' | 'agent' | 'lender' | 'processor' | 'admin';
  permissions: string[];
  mfaEnabled: boolean;
  lastLogin?: string;
  sessionExpiry: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, mfaCode?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  sessionTimeRemaining: number;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);

  // Role-based permissions mapping
  const rolePermissions = {
    homebuyer: ['view_own_timeline', 'upload_documents', 'send_messages', 'view_own_costs'],
    agent: ['view_client_timelines', 'manage_listings', 'send_messages', 'view_client_documents'],
    lender: ['view_loan_applications', 'access_financial_documents', 'update_approval_status', 'send_messages'],
    processor: ['process_documents', 'update_timelines', 'manage_deadlines', 'send_messages'],
    admin: ['full_access', 'manage_users', 'view_audit_logs', 'system_settings']
  };

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = sessionStorage.getItem('hipotrack_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.sessionExpiry > Date.now()) {
        setUser(userData);
        setSessionTimeRemaining(userData.sessionExpiry - Date.now());
      } else {
        sessionStorage.removeItem('hipotrack_user');
      }
    }
  }, []);

  useEffect(() => {
    // Session countdown timer
    if (user && sessionTimeRemaining > 0) {
      const timer = setInterval(() => {
        setSessionTimeRemaining(prev => {
          if (prev <= 1000) {
            logout();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user, sessionTimeRemaining]);

  const login = async (email: string, password: string, mfaCode?: string): Promise<boolean> => {
    try {
      // Simulate API call with security checks
      console.log('Authenticating user:', email);
      
      // Mock user data - in real app, this comes from secure backend
      const mockUser: User = {
        id: '1',
        email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'homebuyer',
        permissions: rolePermissions.homebuyer,
        mfaEnabled: true,
        lastLogin: new Date().toISOString(),
        sessionExpiry: Date.now() + (30 * 60 * 1000) // 30 minutes
      };

      // Store in secure session storage (in production, use HTTP-only cookies)
      sessionStorage.setItem('hipotrack_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setSessionTimeRemaining(30 * 60 * 1000);

      // Log security event
      console.log('Security Event: User login successful', {
        userId: mockUser.id,
        timestamp: new Date().toISOString(),
        ip: 'xxx.xxx.xxx.xxx' // Would be actual IP
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    // Clear session data
    sessionStorage.removeItem('hipotrack_user');
    setUser(null);
    setSessionTimeRemaining(0);

    // Log security event
    console.log('Security Event: User logout', {
      timestamp: new Date().toISOString()
    });
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission) || user.permissions.includes('full_access');
  };

  const refreshSession = () => {
    if (user) {
      const updatedUser = {
        ...user,
        sessionExpiry: Date.now() + (30 * 60 * 1000)
      };
      sessionStorage.setItem('hipotrack_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSessionTimeRemaining(30 * 60 * 1000);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    sessionTimeRemaining,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;