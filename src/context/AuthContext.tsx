import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Role, User } from '../types';
import { demoUsers, technicians, customers } from '../mock/data';
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

const SESSION_KEY = 'keystone-session-role';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(demoUsers[0]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(SESSION_KEY) !== null;
  });

  // Restore the previewed role on reload so the session survives a refresh.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedRole = window.sessionStorage.getItem(SESSION_KEY) as Role | null;
    if (storedRole) {
      const match = demoUsers.find((u) => u.role === storedRole);
      if (match) setUser(match);
      setToken(`mock-jwt-${match?.id ?? 'restored'}`);
    }
  }, []);

  const switchRole = useCallback(async (role: Role) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email: '', role });
      setUser(res.user);
      setToken(res.token);
      setIsAuthenticated(true);
      window.sessionStorage.setItem(SESSION_KEY, role);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // Mock auth: match a demo account by email, else default to the
      // Manager account so the reviewer can sign in with any credentials.
      const matched = demoUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      const target = matched ?? demoUsers[0];
      if (!email.trim()) return { ok: false, error: 'Enter your work email to sign in.' };
      const res = await api.login({ email, role: target.role });
      setUser(res.user);
      setToken(res.token);
      setIsAuthenticated(true);
      window.sessionStorage.setItem(SESSION_KEY, target.role);
      return { ok: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; phone: string; password: string; role: Role }) => {
      setIsLoading(true);
      try {
        const res = await api.login({ email: input.email, role: input.role });
        const newUser: User = { ...res.user, name: input.name || res.user.name, email: input.email || res.user.email };
        setUser(newUser);
        setToken(res.token);
        setIsAuthenticated(true);
        window.sessionStorage.setItem(SESSION_KEY, input.role);
        return { ok: true };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setToken(null);
    window.sessionStorage.removeItem(SESSION_KEY);
  }, []);

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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

// Convenience lookups used by role-scoped views
export function currentTechnicianRecord(user: User) {
  return technicians.find((t) => t.id === user.technicianId);
}
export function currentCustomerRecord(user: User) {
  return customers.find((c) => c.id === user.customerId);
}
