import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Menu, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { Role } from '../../types';

const ROLE_LABELS: Record<Role, string> = {
  MANAGER: 'Manager / Admin',
  DISPATCHER: 'Dispatcher',
  TECHNICIAN: 'Technician',
  CUSTOMER: 'Customer',
};

const ROLE_BADGE_STYLES: Record<Role, string> = {
  MANAGER: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  DISPATCHER: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  TECHNICIAN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  CUSTOMER: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const KeystoneMark: React.FC = () => (
  <svg width="30" height="30" viewBox="0 0 100 100" className="shrink-0">
    <rect width="100" height="100" rx="22" fill="#4338ca" />
    <path d="M30 24 V76 M30 50 L68 24 M42 40 L70 76" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const Topbar: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" aria-label="Toggle navigation">
          <Menu size={20} />
        </button>
        <KeystoneMark />
        <div className="hidden sm:block">
          <p className="font-display text-base font-bold leading-tight text-slate-900 dark:text-slate-50">Keystone</p>
          <p className="text-[11px] leading-tight text-slate-400">Meridian Facilities Management</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle light or dark mode"
          title="Switch theme"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={14} className="text-amber-500" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={14} className="text-indigo-600" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-softer animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-2.5">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notifications</p>
              </div>
              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">A critical-priority work order is approaching its SLA deadline.</div>
                <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">A technician was just reassigned to a new job.</div>
                <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">Weekly performance report is ready to view.</div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shrink-0"
            style={{ backgroundColor: user.avatarColor }}
            title={user.name}
          >
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
            <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${ROLE_BADGE_STYLES[user.role]}`}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="flex items-center gap-1.5 rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-900/20 dark:hover:text-rose-300 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
