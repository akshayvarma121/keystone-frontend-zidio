import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

const KeystoneMark: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 100 100" className="shrink-0">
    <rect width="100" height="100" rx="22" fill="#4338ca" />
    <path d="M30 70 L50 25 L70 70 M38 55 L62 55" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ROLE_OPTIONS: { value: Role; label: string; desc: string }[] = [
  { value: 'CUSTOMER', label: 'Customer', desc: 'Raise and track service requests for your sites' },
  { value: 'TECHNICIAN', label: 'Technician', desc: 'View and complete jobs assigned to you' },
  { value: 'DISPATCHER', label: 'Dispatcher', desc: 'Assign technicians and manage work orders' },
  { value: 'MANAGER', label: 'Manager / Admin', desc: 'Full access, reporting, and settings' },
];

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name.'),
    email: z.string().email('Enter a valid email address.'),
    phone: z.string().min(7, 'Enter a valid phone number.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
    role: z.enum(['MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'CUSTOMER' },
  });

  const selectedRole = watch('role');

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    const res = await registerUser(values);
    if (!res.ok) {
      setSubmitError(res.error ?? 'Could not create your account.');
      return;
    }
    navigate('/app', { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-lg">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <KeystoneMark />
          <div className="text-left">
            <p className="font-display text-base font-bold leading-tight text-slate-900 dark:text-slate-50">Keystone</p>
            <p className="text-[11px] leading-tight text-slate-400">Meridian Facilities Management</p>
          </div>
        </Link>

        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Set up access to the Keystone platform.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <div className="relative">
                <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="name" className="input pl-9" placeholder="Jordan Price" {...register('name')} />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="email" type="email" className="input pl-9" placeholder="you@meridianfm.com" {...register('email')} />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone number</label>
                <div className="relative">
                  <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="phone" className="input pl-9" placeholder="(555) 555-0100" {...register('phone')} />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="password" type="password" className="input pl-9" placeholder="••••••••" {...register('password')} />
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="confirmPassword">Confirm password</label>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="confirmPassword" type="password" className="input pl-9" placeholder="••••••••" {...register('confirmPassword')} />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">I am registering as a…</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setValue('role', opt.value, { shouldValidate: true })}
                    className={`rounded-lg border p-2.5 text-left transition-colors ${
                      selectedRole === opt.value
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{opt.label}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {submitError && <p className="rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">{submitError}</p>}

            <button type="submit" className="btn-primary mt-1 w-full justify-center py-2.5" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Register'} <ArrowRight size={15} />
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
