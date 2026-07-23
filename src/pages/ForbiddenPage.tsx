import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Rendered whenever the signed-in user's role does not grant access to the
 * module they tried to reach — either a direct URL to a protected route, or
 * a stale view left active from a different role after switching accounts.
 */
export const ForbiddenPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-rose-50 dark:bg-rose-900/20 p-4 text-rose-500">
        <ShieldAlert size={28} />
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">403 — Access denied</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Your account ({user.role.charAt(0) + user.role.slice(1).toLowerCase()}) doesn't have permission to view this module.
          If you believe this is a mistake, contact your Keystone administrator.
        </p>
      </div>
      <Link to="/app" className="btn-primary">
        <ArrowLeft size={15} /> Back to my workspace
      </Link>
      <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
        Return to the homepage
      </Link>
    </div>
  );
};
