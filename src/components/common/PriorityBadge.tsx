import React from 'react';
import { AlertTriangle, ArrowUp, Minus, ArrowDown } from 'lucide-react';
import type { Priority } from '../../types';

const PRIORITY_STYLES: Record<Priority, { label: string; bg: string; text: string; icon: React.ReactNode; pulse?: boolean }> = {
  CRITICAL: {
    label: 'Critical',
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
    icon: <AlertTriangle size={11} strokeWidth={2.5} />,
    pulse: true,
  },
  HIGH: {
    label: 'High',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    icon: <ArrowUp size={11} strokeWidth={2.5} />,
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: <Minus size={11} strokeWidth={2.5} />,
  },
  LOW: {
    label: 'Low',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-500 dark:text-slate-400',
    icon: <ArrowDown size={11} strokeWidth={2.5} />,
  },
};

export const PriorityBadge: React.FC<{ priority: Priority; className?: string }> = ({ priority, className = '' }) => {
  const p = PRIORITY_STYLES[priority];
  return (
    <span
      className={`relative inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${p.bg} ${p.text} ${className}`}
    >
      {p.pulse && <span className="absolute -left-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse-ring" />}
      {p.icon}
      {p.label}
    </span>
  );
};
