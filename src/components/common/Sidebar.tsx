import React from 'react';
import {
  LayoutDashboard,
  KanbanSquare,
  Users2,
  Building2,
  BarChart3,
  Wrench,
  ClipboardList,
  Settings,
  UserCircle,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

export type ViewKey =
  | 'dashboard'
  | 'kanban'
  | 'dispatch'
  | 'customers'
  | 'reports'
  | 'technician'
  | 'customer-portal'
  | 'guide'
  | 'settings'
  | 'profile';

interface NavItem {
  key: ViewKey;
  label: string;
  icon: React.ReactNode;
}

// Single source of truth for Role-Based Access Control: every module a role
// may see in the sidebar, in display order. `isViewAllowed` (below) reuses
// this exact list so any view reached outside of a sidebar click — e.g. a
// stale tab left open after a role switch — is checked against the same set.
const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  MANAGER: [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { key: 'kanban', label: 'Work Orders', icon: <KanbanSquare size={18} /> },
    { key: 'dispatch', label: 'Dispatch', icon: <Wrench size={18} /> },
    { key: 'customers', label: 'Customers & Sites', icon: <Building2 size={18} /> },
    { key: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
    { key: 'guide', label: 'User Guide', icon: <BookOpen size={18} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
    { key: 'profile', label: 'Profile', icon: <UserCircle size={18} /> },
  ],
  DISPATCHER: [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { key: 'kanban', label: 'Work Orders', icon: <KanbanSquare size={18} /> },
    { key: 'dispatch', label: 'Dispatch', icon: <Wrench size={18} /> },
    { key: 'customers', label: 'Customers & Sites', icon: <Building2 size={18} /> },
    { key: 'guide', label: 'User Guide', icon: <BookOpen size={18} /> },
    { key: 'profile', label: 'Profile', icon: <UserCircle size={18} /> },
  ],
  TECHNICIAN: [
    { key: 'technician', label: 'My Jobs', icon: <ClipboardList size={18} /> },
    { key: 'guide', label: 'User Guide', icon: <BookOpen size={18} /> },
    { key: 'profile', label: 'Profile', icon: <UserCircle size={18} /> },
  ],
  CUSTOMER: [
    { key: 'customer-portal', label: 'Service Requests', icon: <Users2 size={18} /> },
    { key: 'guide', label: 'User Guide', icon: <BookOpen size={18} /> },
    { key: 'profile', label: 'Profile', icon: <UserCircle size={18} /> },
  ],
};

/** RBAC guard: is this module visible/reachable for the given role? */
export function isViewAllowed(role: Role, view: ViewKey): boolean {
  return NAV_BY_ROLE[role].some((item) => item.key === view);
}

export function defaultViewFor(role: Role): ViewKey {
  return NAV_BY_ROLE[role][0].key;
}

interface SidebarProps {
  active: ViewKey;
  onNavigate: (key: ViewKey) => void;
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ active, onNavigate, open, onClose }) => {
  const { user } = useAuth();
  const items = NAV_BY_ROLE[user.role];

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-20 inset-y-0 left-0 w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pt-16 transition-transform lg:static lg:translate-x-0 lg:pt-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  onClose();
                }}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto p-3 pt-6 hidden lg:block">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Signed in as</p>
            <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </aside>
    </>
  );
};
