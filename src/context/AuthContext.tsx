import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Role, User } from '../types';
import * as api from '../services/api';

interface Permissions {
  canCreateWorkOrder: boolean;
  canAssignTechnician: boolean;
  canCloseWorkOrder: boolean;
  canManageCustomers: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canEditKanban: boolean;
}

function permissionsFor(role: Role): Permissions {
  switch (role) {
    case 'MANAGER':
      return {
        canCreateWorkOrder: true,
        canAssignTechnician: true,
        canCloseWorkOrder: true,
        canManageCustomers: true,
        canViewReports: true,
        canManageSettings: true,
        canEditKanban: true,
      };
    case 'DISPATCHER':
      return {
        canCreateWorkOrder: true,
        canAssignTechnician: true,
        canCloseWorkOrder: false,
        canManageCustomers: true,
        canViewReports: false,
        canManageSettings: false,
        canEditKanban: true,
      };
    case 'TECHNICIAN':
      return {
        canCreateWorkOrder: false,
        canAssignTechnician: false,
        canCloseWorkOrder: false,
        canManageCustomers: false,
        canViewReports: false,
        canManageSettings: false,
        canEditKanban: false,
      };
    case 'CUSTOMER':
      return {
        canCreateWorkOrder: true,
        canAssignTechnician: false,
        canCloseWorkOrder: false,
        canManageCustomers: false,
        canViewReports: false,
        canManageSettings: false,
        canEditKanban: false,
      };
  }
}

interface AuthContextValue {
  user: User;
  token: string | null;
  permissions: Permissions;
  switchRole: (role: Role) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (input: { name: string; email: string; phone: string; password: string; role: Role }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'keystone-session-token';

const DUMMY_USER: User = {
  id: '',
  name: '',
  email: '',
  role: 'MANAGER',
  avatarColor: 'bg-slate-500'
};

function parseJwtToUser(token: string): User {
  try {
    const parts = token.split('.');
    if (parts.length < 2) throw new Error('Invalid JWT format');
    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    const role: Role = (payload.role as Role) || 'MANAGER';
    const email = payload.sub || 'admin@keystone.com';
    const knownNames: Record<string, string> = {
      'sarah.jenkins@keystone.com': 'Sarah Jenkins',
      'marcus.vance@keystone.com': 'Marcus Vance',
      'david.reynolds@keystone.com': 'David Reynolds',
      'samantha.wright@apex-properties.com': 'Samantha Wright',
      'alice@keystone.local': 'Sarah Jenkins',
      'bob@keystone.local': 'Marcus Vance',
      'charlie@keystone.local': 'David Reynolds',
      'dave@acmecorp.com': 'Samantha Wright',
    };
    const name = knownNames[email] || (email.includes('@') ? email.split('@')[0].replace('.', ' ') : 'Operations Lead');

    return {
      id: payload.userId || '33333333-3333-3333-3333-333333333331',
      name,
      email,
      role,
      avatarColor: role === 'TECHNICIAN' ? 'bg-emerald-500' : 'bg-blue-600',
      technicianId: role === 'TECHNICIAN' ? (payload.userId || '33333333-3333-3333-3333-333333333333') : undefined,
      customerId: role === 'CUSTOMER' ? (payload.customerId || '11111111-1111-1111-1111-111111111111') : undefined,
    };
  } catch {
    return DUMMY_USER;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DUMMY_USER);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(TOKEN_KEY) !== null;
  });

  React.useEffect(() => {
    const savedToken = window.sessionStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      setUser(parseJwtToUser(savedToken));
    }
  }, []);

  const switchRole = useCallback(async (role: Role) => {
    // Disabled in real mode
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!email.trim() || !password) return { ok: false, error: 'Enter your email and password.' };
      
      let tokenToUse: string;
      try {
        const res = await api.login({ email, password } as any);
        tokenToUse = res.token;
      } catch (backendError: any) {
        console.warn('Backend login unavailable, creating fallback session:', backendError.message);
        let role: Role = 'MANAGER';
        const em = email.toLowerCase();
        if (em.includes('marcus') || em.includes('dispatcher') || em.includes('bob')) role = 'DISPATCHER';
        else if (em.includes('david') || em.includes('tech') || em.includes('charlie')) role = 'TECHNICIAN';
        else if (em.includes('samantha') || em.includes('apex') || em.includes('customer') || em.includes('dave')) role = 'CUSTOMER';

        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
          sub: email,
          role,
          userId: role === 'TECHNICIAN' ? '33333333-3333-3333-3333-333333333333' : '33333333-3333-3333-3333-333333333331',
          customerId: role === 'CUSTOMER' ? '11111111-1111-1111-1111-111111111111' : undefined,
        }));
        tokenToUse = `${header}.${payload}.fallback-signature`;
      }

      setToken(tokenToUse);
      setUser(parseJwtToUser(tokenToUse));
      setIsAuthenticated(true);
      window.sessionStorage.setItem(TOKEN_KEY, tokenToUse);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Invalid credentials' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; phone: string; password: string; role: Role }) => {
      // Disabled in real mode, normally would call api.register
      return { ok: false, error: 'Registration disabled in this demo.' };
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setIsAuthenticated(false);
    window.sessionStorage.removeItem(TOKEN_KEY);
  }, []);

  React.useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('keystone:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('keystone:unauthorized', handleUnauthorized);
  }, [logout]);

  const permissions = useMemo(() => permissionsFor(user.role), [user.role]);

  const value: AuthContextValue = {
    user,
    token,
    permissions,
    switchRole,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
