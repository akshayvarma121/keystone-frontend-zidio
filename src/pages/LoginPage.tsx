import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Radio, Wrench, Building2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const KeystoneMark: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 100 100" className="shrink-0">
    <rect width="100" height="100" rx="22" fill="#4338ca" />
    <path d="M30 24 V76 M30 50 L68 24 M42 40 L70 76" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError('Enter your password to continue.');
      return;
    }
    const res = await login(email, password);
    if (!res.ok) {
      setError(res.error ?? 'Could not sign in with those details.');
      return;
    }
    navigate(location.state?.from ?? '/app', { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <KeystoneMark />
          <div className="text-left">
            <p className="font-display text-base font-bold leading-tight text-slate-900 dark:text-slate-50">Keystone</p>
            <p className="text-[11px] leading-tight text-slate-400">Meridian Facilities Management</p>
          </div>
        </Link>

        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">Sign in to Keystone</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Access your workspace to manage facilities, dispatch technicians, and track active work orders.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className="input pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label mb-1.5" htmlFor="password">Password</label>
                <a href="#forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input pl-9 pr-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              Remember this device
            </label>

            {error && <p className="rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">{error}</p>}

            <button type="submit" className="btn-primary mt-1 w-full justify-center py-2.5" disabled={isLoading}>
              {isLoading ? 'Authenticating…' : 'Sign in'} <ArrowRight size={15} />
            </button>
            {isLoading && (
              <p className="mt-2 text-center text-xs text-amber-600 dark:text-amber-400 animate-pulse">
                Initializing live backend service connection…
              </p>
            )}
          </form>

          <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-900/20 p-4 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">Quick Access Accounts</p>
            <p className="mb-2 text-slate-500">Select any role below to pre-fill credentials:</p>
            <div className="space-y-2 font-medium">
              <div className="rounded border border-indigo-200/60 p-2 dark:border-indigo-800/40 bg-white/60 dark:bg-slate-900/40">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Seeded Database Users (Password: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">Password123!</code>)</p>
                <div className="grid grid-cols-1 gap-1 text-indigo-600 dark:text-indigo-400">
                  <button type="button" onClick={() => { setEmail('alice@keystone.local'); setPassword('Password123!'); }} className="text-left hover:underline flex items-center gap-1.5">
                    <ShieldCheck size={13} /> Manager: <strong>alice@keystone.local</strong>
                  </button>
                  <button type="button" onClick={() => { setEmail('bob@keystone.local'); setPassword('Password123!'); }} className="text-left hover:underline flex items-center gap-1.5">
                    <Radio size={13} /> Dispatcher: <strong>bob@keystone.local</strong>
                  </button>
                  <button type="button" onClick={() => { setEmail('charlie@keystone.local'); setPassword('Password123!'); }} className="text-left hover:underline flex items-center gap-1.5">
                    <Wrench size={13} /> Technician: <strong>charlie@keystone.local</strong>
                  </button>
                  <button type="button" onClick={() => { setEmail('dave@acmecorp.com'); setPassword('Password123!'); }} className="text-left hover:underline flex items-center gap-1.5">
                    <Building2 size={13} /> Customer: <strong>dave@acmecorp.com</strong>
                  </button>
                </div>
              </div>

              <div className="rounded border border-indigo-200/60 p-2 dark:border-indigo-800/40 bg-white/60 dark:bg-slate-900/40">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Admin / Standard Accounts (Password: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">password</code>)</p>
                <div className="grid grid-cols-1 gap-1 text-indigo-600 dark:text-indigo-400">
                  <button type="button" onClick={() => { setEmail('admin@keystone.com'); setPassword('password'); }} className="text-left hover:underline flex items-center gap-1.5">
                    <UserCheck size={13} /> Admin: <strong>admin@keystone.com</strong>
                  </button>
                  <button type="button" onClick={() => { setEmail('tech1@keystone.com'); setPassword('password'); }} className="text-left hover:underline flex items-center gap-1.5">
                    <Wrench size={13} /> Tech 1: <strong>tech1@keystone.com</strong>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
