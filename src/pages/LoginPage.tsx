import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const KeystoneMark: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 100 100" className="shrink-0">
    <rect width="100" height="100" rx="22" fill="#4338ca" />
    <path d="M30 70 L50 25 L70 70 M38 55 L62 55" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
          <h1 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to access your Keystone workspace.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@meridianfm.com"
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
              Remember me
            </label>

            {error && <p className="rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">{error}</p>}

            <button type="submit" className="btn-primary mt-1 w-full justify-center py-2.5" disabled={isLoading}>
              {isLoading ? 'Connecting to live server…' : 'Log in'} <ArrowRight size={15} />
            </button>
            {isLoading && (
              <p className="mt-2 text-center text-xs text-amber-600 dark:text-amber-400 animate-pulse">
                ⚡ Waking up live Render backend service… (Cold start takes ~45 seconds on first request)
              </p>
            )}
          </form>

          <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-900/20 p-4 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">Live Database Credentials</p>
            <p className="mb-2 text-slate-500">Click any user below to autofill email & password:</p>
            <div className="space-y-2 font-medium">
              <div className="rounded border border-indigo-200/60 p-2 dark:border-indigo-800/40 bg-white/60 dark:bg-slate-900/40">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Seeded Database Users (Password: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">Password123!</code>)</p>
                <div className="grid grid-cols-1 gap-1 text-indigo-600 dark:text-indigo-400">
                  <button type="button" onClick={() => { setEmail('alice@keystone.local'); setPassword('Password123!'); }} className="text-left hover:underline">
                    👔 Manager: <strong>alice@keystone.local</strong>
                  </button>
                  <button type="button" onClick={() => { setEmail('bob@keystone.local'); setPassword('Password123!'); }} className="text-left hover:underline">
                    📻 Dispatcher: <strong>bob@keystone.local</strong>
                  </button>
                  <button type="button" onClick={() => { setEmail('charlie@keystone.local'); setPassword('Password123!'); }} className="text-left hover:underline">
                    🔧 Technician: <strong>charlie@keystone.local</strong>
                  </button>
                  <button type="button" onClick={() => { setEmail('dave@acmecorp.com'); setPassword('Password123!'); }} className="text-left hover:underline">
                    🏢 Customer: <strong>dave@acmecorp.com</strong>
                  </button>
                </div>
              </div>

              <div className="rounded border border-indigo-200/60 p-2 dark:border-indigo-800/40 bg-white/60 dark:bg-slate-900/40">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Admin / Standard Accounts (Password: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">password</code>)</p>
                <div className="grid grid-cols-1 gap-1 text-indigo-600 dark:text-indigo-400">
                  <button type="button" onClick={() => { setEmail('admin@keystone.com'); setPassword('password'); }} className="text-left hover:underline">
                    👑 Admin: <strong>admin@keystone.com</strong>
                  </button>
                  <button type="button" onClick={() => { setEmail('tech1@keystone.com'); setPassword('password'); }} className="text-left hover:underline">
                    🛠️ Tech 1: <strong>tech1@keystone.com</strong>
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
