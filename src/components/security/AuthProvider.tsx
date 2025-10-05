import React, { createContext, useContext, useState, useEffect } from 'react';
import { logAuditEvent, type AuditEventInput } from '@/lib/audit';

export type Role =
  | 'homebuyer'
  | 'agent'
  | 'lender'
  | 'processor'
  | 'admin';

type FactorType = 'totp' | 'phone';

type RolePermissions = Record<Role, string[]>;

const ROLE_PERMISSIONS: RolePermissions = {
  homebuyer: ['view_own_timeline', 'upload_documents', 'send_messages', 'view_own_costs'],
  agent: ['view_client_timelines', 'manage_listings', 'send_messages', 'view_client_documents'],
  lender: ['view_loan_applications', 'access_financial_documents', 'update_approval_status', 'send_messages'],
  processor: ['process_documents', 'update_timelines', 'manage_deadlines', 'send_messages'],
  admin: ['full_access', 'manage_users', 'view_audit_logs', 'system_settings'],
};

const KNOWN_ROLES: Role[] = ['homebuyer', 'agent', 'lender', 'processor', 'admin'];

const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && (KNOWN_ROLES as string[]).includes(value);

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  permissions: string[];
  mfaEnabled: boolean;
  lastLogin?: string;
  sessionExpiry: number;
}

export interface LoginResult {
  success: boolean;
  mfaRequired?: boolean;
  error?: string;
}

interface MfaChallenge {
  factorId: string;
  factorType: FactorType;
  challengeId: string;
}

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string, mfaCode?: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  sessionTimeRemaining: number;
  refreshSession: () => Promise<void>;
  mfaRequired: boolean;
  resetMfa: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useOptionalAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

const extractUserFromSession = (session: Session): AppUser => {
  const { user, expires_at } = session;
  const metadata = user?.user_metadata ?? {};
  const roleFromMetadata = metadata.role ?? metadata.userRole ?? user?.role;
  const role: Role = isRole(roleFromMetadata) ? roleFromMetadata : 'homebuyer';

  const permissionsFromMetadata = Array.isArray(metadata.permissions)
    ? metadata.permissions.filter((permission: unknown): permission is string => typeof permission === 'string')
    : null;

  const expiresAtMs = (expires_at ?? Math.floor(Date.now() / 1000)) * 1000;

  return {
    id: user.id,
    email: user.email ?? metadata.email ?? '',
    firstName: metadata.firstName ?? metadata.first_name ?? '',
    lastName: metadata.lastName ?? metadata.last_name ?? '',
    role,
    permissions: permissionsFromMetadata?.length ? permissionsFromMetadata : ROLE_PERMISSIONS[role],
    mfaEnabled: Boolean(
      metadata.mfaEnabled ??
        metadata.mfa_enabled ??
        (Array.isArray((user as { factors?: Array<{ factor_type?: string }> }).factors)
          ? (user as { factors?: Array<{ factor_type?: string }> }).factors!.length > 0
          : false),
    ),
    lastLogin: user.last_sign_in_at ?? undefined,
    sessionExpiry: expiresAtMs,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallenge | null>(null);

  const defaultUserAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown-agent';
  const defaultLocation =
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined;

  const recordAudit = async (event: AuditEventInput) => {
    try {
      await logAuditEvent({
        userId: user?.id ?? event.userId,
        userName:
          user ? `${user.firstName} ${user.lastName}` : event.userName ?? 'Unknown User',
        userRole: user?.role ?? event.userRole ?? 'unknown',
        ipAddress: event.ipAddress ?? 'unknown',
        userAgent: event.userAgent ?? defaultUserAgent,
        location: event.location ?? defaultLocation,
        ...event,
      });
    } catch (auditError) {
      console.warn('[audit] Failed to record authentication event', auditError);
    }
  };

  // Role-based permissions mapping
  const rolePermissions = {
    homebuyer: ['view_own_timeline', 'upload_documents', 'send_messages', 'view_own_costs'],
    agent: ['view_client_timelines', 'manage_listings', 'send_messages', 'view_client_documents'],
    lender: ['view_loan_applications', 'access_financial_documents', 'update_approval_status', 'send_messages'],
    processor: ['process_documents', 'update_timelines', 'manage_deadlines', 'send_messages'],
    admin: ['full_access', 'manage_users', 'view_audit_logs', 'system_settings']
  };

  useEffect(() => {
    const initialiseSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Failed to retrieve session:', error);
        return;
      }
      handleSession(data.session ?? null);
    };

    void initialiseSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
      if (!session) {
        setMfaChallenge(null);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [handleSession]);

  useEffect(() => {
    if (!user?.sessionExpiry) {
      setSessionTimeRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(user.sessionExpiry - Date.now(), 0);
      setSessionTimeRemaining(remaining);
    };

    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [user?.sessionExpiry]);

  const login = useCallback(
    async (email: string, password: string, mfaCode?: string): Promise<LoginResult> => {
      if (mfaCode) {
        if (!mfaChallenge) {
          return {
            success: false,
            error: 'No MFA challenge is active. Please try signing in again.',
          };
        }

        const { error } = await supabase.auth.mfa.verify({
          factorId: mfaChallenge.factorId,
          challengeId: mfaChallenge.challengeId,
          code: mfaCode,
        });

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

      await recordAudit({
        action: 'login_attempt',
        resource: 'authentication',
        status: 'success',
        riskLevel: 'medium',
        userId: mockUser.id,
        userName: `${mockUser.firstName} ${mockUser.lastName}`,
        userRole: mockUser.role,
        details: mfaCode ? 'MFA challenge passed' : 'MFA challenge skipped in demo',
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      await recordAudit({
        action: 'login_attempt',
        resource: 'authentication',
        status: 'failed',
        riskLevel: 'high',
        userId: email,
        userName: email,
        userRole: 'unknown',
        details: 'Login attempt failed',
      });
      return false;
    }
  };

  const logout = () => {
    const currentUser = user;
    // Clear session data
    sessionStorage.removeItem('hipotrack_user');
    setUser(null);
    setSessionTimeRemaining(0);

    if (currentUser) {
      void recordAudit({
        action: 'logout',
        resource: 'authentication',
        status: 'success',
        riskLevel: 'low',
        userId: currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        userRole: currentUser.role,
        details: 'User initiated logout',
      });
    }
  };

      setMfaChallenge(null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const errorMessage = error.message ?? 'Unable to sign in. Please check your credentials.';
        const isMfaError = errorMessage.toLowerCase().includes('mfa');
        const factor =
          data?.user &&
          Array.isArray((data.user as { factors?: Array<{ id: string; factor_type: string }> }).factors)
            ? (data.user as { factors?: Array<{ id: string; factor_type: string }> }).factors!.find(
                ({ factor_type }) => factor_type === 'totp' || factor_type === 'phone',
              )
            : undefined;

        if (isMfaError && factor) {
          const factorType: FactorType = factor.factor_type === 'phone' ? 'phone' : 'totp';
          const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: factor.id,
            ...(factorType === 'phone' ? { channel: 'sms' as const } : {}),
          });

          if (challengeError || !challengeData) {
            console.error('MFA challenge creation failed:', challengeError);
            return {
              success: false,
              error: 'Unable to start multi-factor authentication. Please try again.',
            };
          }

  const refreshSession = () => {
    if (user) {
      const updatedUser = {
        ...user,
        sessionExpiry: Date.now() + (30 * 60 * 1000)
      };
      sessionStorage.setItem('hipotrack_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSessionTimeRemaining(30 * 60 * 1000);
      void recordAudit({
        action: 'session_refresh',
        resource: 'authentication',
        status: 'success',
        riskLevel: 'low',
        userId: updatedUser.id,
        userName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        userRole: updatedUser.role,
        details: 'Session extended by user',
      });
    }

    handleSession(data.session ?? null);
  }, [handleSession]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error);
    }
    setMfaChallenge(null);
    handleSession(null);
  }, [handleSession]);

  const resetMfa = useCallback(() => {
    setMfaChallenge(null);
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return user.permissions.includes(permission) || user.permissions.includes('full_access');
    },
    [user],
  );

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user,
      hasPermission,
      sessionTimeRemaining,
      refreshSession,
      mfaRequired: !!mfaChallenge,
      resetMfa,
    }),
    [hasPermission, login, logout, mfaChallenge, refreshSession, resetMfa, sessionTimeRemaining, user],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
