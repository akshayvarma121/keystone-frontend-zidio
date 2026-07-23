import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlayCircle, PauseCircle, CheckCircle2, MapPin, Building2, ClipboardCheck } from 'lucide-react';
import * as api from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLACountdownBadge } from '../common/SLACountdownBadge';
import { WorkOrderDetailModal } from '../workorders/WorkOrderDetailModal';
import { useAuth, currentTechnicianRecord } from '../../context/AuthContext';
import { getCustomer, getSite } from '../../mock/data';
import type { WorkOrderStatus } from '../../types';

export const TechnicianMobileView: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const techRecord = currentTechnicianRecord(user);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['work-orders', 'technician', techRecord?.id],
    queryFn: () => api.getWorkOrders({ role: 'TECHNICIAN', scopedUserId: techRecord?.id }),
    enabled: !!techRecord,
  });

  const activeJobs = jobs.filter((j) => j.status !== 'CLOSED' && j.status !== 'CANCELLED');
  const historyJobs = jobs.filter((j) => j.status === 'CLOSED' || j.status === 'CANCELLED');

  const transitionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkOrderStatus }) => api.transitionStatus(id, status, user.name, 'TECHNICIAN'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
    },
    onError: (e: Error) => setActionError(e.message),
  });

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 sm:max-w-2xl">
      <div className="card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Today</p>
        <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{activeJobs.length} active job{activeJobs.length === 1 ? '' : 's'}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as {user.name} · {techRecord?.region ?? '—'}</p>
      </div>

      {actionError && (
        <div className="flex items-center justify-between rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
          {actionError}
          <button onClick={() => setActionError(null)} className="text-xs font-semibold underline">Dismiss</button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-32 animate-pulse" />)}
        {!isLoading && activeJobs.length === 0 && (
          <div className="card flex flex-col items-center gap-2 py-10 text-center">
            <ClipboardCheck size={22} className="text-slate-300" />
            <p className="text-sm text-slate-400">No active jobs assigned. Check back soon.</p>
          </div>
        )}
        {activeJobs.map((wo) => {
          const customer = getCustomer(wo.customerId);
          const site = getSite(wo.siteId);
          return (
            <div key={wo.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[11px] text-slate-400">{wo.code}</span>
                  <h3 className="font-medium text-slate-800 dark:text-slate-100 leading-snug">{wo.title}</h3>
                </div>
                <StatusBadge status={wo.status} />
              </div>
              <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Building2 size={12} /> {customer?.name}</span>
                <span className="flex items-center gap-1.5"><MapPin size={12} /> {site?.addressLine}, {site?.city}, {site?.state}</span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <PriorityBadge priority={wo.priority} />
                <SLACountdownBadge dueAt={wo.dueAt} status={wo.status} completedAt={wo.completedAt} />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {wo.status === 'ASSIGNED' && (
                  <button
                    className="btn-primary col-span-3"
                    disabled={transitionMutation.isPending}
                    onClick={() => transitionMutation.mutate({ id: wo.id, status: 'IN_PROGRESS' })}
                  >
                    <PlayCircle size={14} /> Start job
                  </button>
                )}
                {wo.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      className="btn-secondary col-span-1"
                      disabled={transitionMutation.isPending}
                      onClick={() => transitionMutation.mutate({ id: wo.id, status: 'ON_HOLD' })}
                    >
                      <PauseCircle size={14} /> Hold
                    </button>
                    <button
                      className="btn-primary col-span-2"
                      disabled={transitionMutation.isPending}
                      onClick={() => transitionMutation.mutate({ id: wo.id, status: 'COMPLETED' })}
                    >
                      <CheckCircle2 size={14} /> Complete
                    </button>
                  </>
                )}
                {wo.status === 'ON_HOLD' && (
                  <button
                    className="btn-primary col-span-3"
                    disabled={transitionMutation.isPending}
                    onClick={() => transitionMutation.mutate({ id: wo.id, status: 'IN_PROGRESS' })}
                  >
                    <PlayCircle size={14} /> Resume job
                  </button>
                )}
                {wo.status === 'COMPLETED' && (
                  <span className="col-span-3 text-center text-xs text-slate-400 py-1.5">Awaiting manager close-out</span>
                )}
              </div>

              <button onClick={() => setSelectedId(wo.id)} className="btn-ghost mt-2 w-full justify-center border border-slate-200 dark:border-slate-800">
                Log parts / time · view details
              </button>
            </div>
          );
        })}
      </div>

      {historyJobs.length > 0 && (
        <div className="mt-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently finished</p>
          <div className="flex flex-col gap-2">
            {historyJobs.slice(0, 5).map((wo) => (
              <div key={wo.id} onClick={() => setSelectedId(wo.id)} className="card cursor-pointer p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{wo.title}</p>
                  <p className="text-xs text-slate-400">{wo.code}</p>
                </div>
                <StatusBadge status={wo.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedId && <WorkOrderDetailModal workOrderId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
};
