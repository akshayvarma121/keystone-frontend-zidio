import React from 'react';
import type { WorkOrderStatus } from '../../types';

const STATUS_STYLES: Record<WorkOrderStatus, { label: string; bg: string; text: string; dot: string }> = {
  NEW: { label: 'New', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', dot: 'bg-slate-400' },
  ASSIGNED: { label: 'Assigned', bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-700 dark:text-sky-300', dot: 'bg-sky-500' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  ON_HOLD: { label: 'On Hold', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  CLOSED: { label: 'Closed', bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-200', dot: 'bg-slate-500' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-300', dot: 'bg-rose-400' },
};

/**
 * Status tags are rendered as a small trapezoidal "keystone" wedge — the
 * shape of the wedge-stone that locks an arch in place — echoing the
 * product name across every status touchpoint in the app.
 */
export const StatusBadge: React.FC<{ status: WorkOrderStatus; className?: string }> = ({ status, className = '' }) => {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`keystone-tag inline-flex items-center gap-1.5 px-2.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wide ${s.bg} ${s.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export function statusLabel(status: WorkOrderStatus): string {
  return STATUS_STYLES[status].label;
}
