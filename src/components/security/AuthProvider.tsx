import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

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

  const handleSession = useCallback((session: Session | null) => {
    if (session?.user) {
      const mappedUser = extractUserFromSession(session);
      setUser(mappedUser);
      const remaining = Math.max(mappedUser.sessionExpiry - Date.now(), 0);
      setSessionTimeRemaining(remaining);
    } else {
      setUser(null);
      setSessionTimeRemaining(0);
    }
  }, []);

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

        if (error) {
          console.error('MFA verification failed:', error);
          return {
            success: false,
            mfaRequired: true,
            error: error.message ?? 'Invalid authentication code.',
          };
        }

        setMfaChallenge(null);
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Failed to retrieve session after MFA verification:', sessionError);
          return {
            success: false,
            error: 'Authentication succeeded but session retrieval failed. Please try again.',
          };
        }

        handleSession(sessionData.session ?? null);
        return { success: true };
      }

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

          setMfaChallenge({
            factorId: factor.id,
            factorType,
            challengeId: challengeData.id,
          });

          return {
            success: false,
            mfaRequired: true,
            error: 'Multi-factor authentication required. Enter the verification code from your authenticator.',
          };
        }

        console.error('Sign-in failed:', error);
        return {
          success: false,
          error: errorMessage,
        };
      }

      handleSession(data.session ?? null);
      return { success: true };
    },
    [handleSession, mfaChallenge],
  );

  const refreshSession = useCallback(async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh failed:', error);
      await supabase.auth.signOut();
      handleSession(null);
      return;
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
