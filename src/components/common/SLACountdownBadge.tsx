import React, { useEffect, useState } from 'react';
import { Clock, PauseCircle, CheckCircle2, AlertOctagon } from 'lucide-react';
import type { WorkOrderStatus } from '../../types';

function formatDuration(ms: number): string {
  const abs = Math.abs(ms);
  const totalMinutes = Math.floor(abs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface Props {
  dueAt: string;
  status: WorkOrderStatus;
  completedAt?: string;
  compact?: boolean;
}

/**
 * Live SLA countdown. Ticks every 30s while a work order is active,
 * freezes at the completion timestamp once resolved, and reflects
 * ON_HOLD as a paused clock rather than a running breach.
 */
export const SLACountdownBadge: React.FC<Props> = ({ dueAt, status, completedAt, compact }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (status === 'CLOSED' || status === 'CANCELLED' || status === 'COMPLETED') return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [status]);

  if (status === 'CANCELLED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400">
        <Clock size={12} /> SLA N/A
      </span>
    );
  }

  if (status === 'ON_HOLD') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
        <PauseCircle size={12} /> Paused
      </span>
    );
  }

  const due = new Date(dueAt).getTime();
  const reference = status === 'COMPLETED' || status === 'CLOSED' ? new Date(completedAt ?? dueAt).getTime() : Date.now();
  const diff = due - reference;
  const isResolved = status === 'COMPLETED' || status === 'CLOSED';

  if (isResolved) {
    const met = diff >= 0;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
          met
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
        }`}
      >
        {met ? <CheckCircle2 size={12} /> : <AlertOctagon size={12} />}
        {met ? 'Met SLA' : `Breached by ${formatDuration(diff)}`}
      </span>
    );
  }

  const overdue = diff < 0;
  const atRisk = !overdue && diff < 2 * 3600 * 1000;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
        overdue
          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
          : atRisk
          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
      }`}
      title={new Date(dueAt).toLocaleString()}
    >
      {overdue ? <AlertOctagon size={12} /> : <Clock size={12} />}
      {overdue ? `Overdue ${formatDuration(diff)}` : compact ? formatDuration(diff) : `Due in ${formatDuration(diff)}`}
    </span>
  );
};
