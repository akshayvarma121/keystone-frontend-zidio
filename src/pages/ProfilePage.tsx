import React from 'react';
import { Mail, Phone, ShieldCheck, Wrench, Building2 } from 'lucide-react';
import { useAuth, currentTechnicianRecord, currentCustomerRecord } from '../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  MANAGER: 'Manager / Admin',
  DISPATCHER: 'Dispatcher',
  TECHNICIAN: 'Technician',
  CUSTOMER: 'Customer',
};

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const techRecord = currentTechnicianRecord(user);
  const customerRecord = currentCustomerRecord(user);

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="card p-5 flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ backgroundColor: user.avatarColor }}
        >
          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">{user.name}</p>
          <span className="mt-1 inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            {ROLE_LABELS[user.role]}
          </span>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200">Contact details</h2>
        <div className="mt-3 flex flex-col gap-2.5 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Mail size={14} className="text-slate-400" /> {user.email}</div>
          {(user.phone || techRecord?.phone) && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Phone size={14} className="text-slate-400" /> {user.phone ?? techRecord?.phone}</div>
          )}
        </div>
      </div>

      {techRecord && (
        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><Wrench size={14} /> Technician details</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {techRecord.skills.map((skill) => (
              <span key={skill} className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {skill.replace('_', ' ')}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">Region: {techRecord.region} · Rating: {techRecord.rating.toFixed(1)} / 5</p>
        </div>
      )}

      {customerRecord && (
        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><Building2 size={14} /> Account details</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{customerRecord.name}</p>
          <p className="mt-1 text-xs text-slate-400">Tier: {customerRecord.tier} · {customerRecord.siteIds.length} site(s) on file</p>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><ShieldCheck size={14} /> Access level</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your account is scoped to the {ROLE_LABELS[user.role]} role. Module visibility and data access are enforced automatically based on this role.
        </p>
      </div>
    </div>
  );
};
