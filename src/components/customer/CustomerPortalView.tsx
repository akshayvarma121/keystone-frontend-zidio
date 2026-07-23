import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, MapPin } from 'lucide-react';
import * as api from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLACountdownBadge } from '../common/SLACountdownBadge';
import { WorkOrderFormModal } from '../workorders/WorkOrderFormModal';
import { WorkOrderDetailModal } from '../workorders/WorkOrderDetailModal';
import { useAuth } from '../../context/AuthContext';
import type { WorkOrderStatus } from '../../types';

const TRACKER_STEPS: WorkOrderStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'];

const StatusTracker: React.FC<{ status: WorkOrderStatus }> = ({ status }) => {
  if (status === 'CANCELLED') {
    return <p className="text-xs font-medium text-rose-500">This request was cancelled.</p>;
  }
  const currentIdx = status === 'ON_HOLD' ? TRACKER_STEPS.indexOf('IN_PROGRESS') : TRACKER_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {TRACKER_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div
            className={`h-2 w-2 rounded-full ${
              i < currentIdx ? 'bg-indigo-500' : i === currentIdx ? 'bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900/40' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
          {i < TRACKER_STEPS.length - 1 && (
            <div className={`h-0.5 w-6 sm:w-10 ${i < currentIdx ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const CustomerPortalView: React.FC = () => {
  const { user } = useAuth();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'past'>('active');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['work-orders', 'customer', user.customerId],
    queryFn: () => api.getWorkOrders({ role: 'CUSTOMER', scopedUserId: user.customerId }),
    enabled: !!user.customerId,
  });

  const active = tickets.filter((t) => t.status !== 'CLOSED' && t.status !== 'CANCELLED');
  const past = tickets.filter((t) => t.status === 'CLOSED' || t.status === 'CANCELLED');
  const shown = tab === 'active' ? active : past;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">Service requests</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.name}</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary shrink-0">
          <Plus size={16} /> Raise a request
        </button>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 dark:bg-slate-900 p-1 w-fit">
        <button
          onClick={() => setTab('active')}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${tab === 'active' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Active ({active.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${tab === 'past' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Past ({past.length})
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading && Array.from({ length: 2 }).map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}
        {!isLoading && shown.length === 0 && (
          <div className="card py-12 text-center">
            <p className="text-sm text-slate-400">{tab === 'active' ? "No open requests. If something's wrong at your site, raise a request." : 'No past requests yet.'}</p>
          </div>
        )}
        {shown.map((wo) => {
          
          return (
            <div key={wo.id} onClick={() => setSelectedId(wo.id)} className="card cursor-pointer p-4 hover:shadow-softer transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[11px] text-slate-400">{wo.code}</span>
                  <h3 className="font-medium text-slate-800 dark:text-slate-100">{wo.title}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400"><MapPin size={11} /> {wo.siteName}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={wo.status} />
                  <PriorityBadge priority={wo.priority} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <StatusTracker status={wo.status} />
                <SLACountdownBadge dueAt={wo.dueAt} status={wo.status} completedAt={wo.completedAt} compact />
              </div>
            </div>
          );
        })}
      </div>

      <WorkOrderFormModal open={createOpen} onClose={() => setCreateOpen(false)} lockCustomer />
      {selectedId && <WorkOrderDetailModal workOrderId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
};
