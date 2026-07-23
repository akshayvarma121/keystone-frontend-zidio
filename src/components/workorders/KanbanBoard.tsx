import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, GripVertical, User2 } from 'lucide-react';
import * as api from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLACountdownBadge } from '../common/SLACountdownBadge';
import { StatusTabs, type StatusTabKey } from './StatusTabs';
import { WorkOrderDetailModal } from './WorkOrderDetailModal';
import { WorkOrderFormModal } from './WorkOrderFormModal';
import { useAuth } from '../../context/AuthContext';
import { ViewGuideBanner } from '../common/ViewGuideBanner';
import type { WorkOrder, WorkOrderStatus, Priority } from '../../types';

const COLUMNS: { key: WorkOrderStatus; label: string }[] = [
  { key: 'NEW', label: 'New' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'ON_HOLD', label: 'On Hold' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CLOSED', label: 'Closed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const PRIORITY_FILTERS: (Priority | 'ALL')[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const KanbanBoard: React.FC = () => {
  const { user, permissions } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [statusTab, setStatusTab] = useState<StatusTabKey>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ['work-orders', { search, priorityFilter }],
    queryFn: () => api.getWorkOrders({ search: search || undefined, priority: priorityFilter }),
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkOrderStatus }) =>
      api.transitionStatus(id, status, user.name, user.role, 'Moved via Kanban board.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
    },
    onError: (err: Error) => setDragError(err.message),
  });

  const grouped = useMemo(() => {
    const map: Record<WorkOrderStatus, WorkOrder[]> = {
      NEW: [], ASSIGNED: [], IN_PROGRESS: [], ON_HOLD: [], COMPLETED: [], CLOSED: [], CANCELLED: [],
    };
    workOrders.forEach((wo) => map[wo.status].push(wo));
    return map;
  }, [workOrders]);

  // Tab counts reflect the currently active search/priority filters, so the
  // numbers next to each tab always match what a click on that tab reveals.
  const tabCounts = useMemo(() => {
    const counts: Partial<Record<StatusTabKey, number>> = { ALL: workOrders.length };
    COLUMNS.forEach((col) => {
      counts[col.key] = grouped[col.key].length;
    });
    return counts;
  }, [workOrders, grouped]);

  // Switching tabs filters the list in place — no route change, no reload.
  const filteredForTab = statusTab === 'ALL' ? workOrders : grouped[statusTab];

  function handleDrop(status: WorkOrderStatus) {
    if (!draggingId || !permissions.canEditKanban) return;
    const wo = workOrders.find((w) => w.id === draggingId);
    setDraggingId(null);
    if (!wo || wo.status === status) return;
    transitionMutation.mutate({ id: wo.id, status });
  }

  function renderCard(wo: WorkOrder) {
    
    
    
    return (
      <div
        key={wo.id}
        draggable={permissions.canEditKanban}
        onDragStart={() => setDraggingId(wo.id)}
        onDragEnd={() => setDraggingId(null)}
        onClick={() => setSelectedId(wo.id)}
        className={`group cursor-pointer rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm hover:shadow-soft transition-shadow ${
          draggingId === wo.id ? 'opacity-40' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[11px] font-medium text-slate-400">{wo.code}</span>
          {permissions.canEditKanban && <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100" />}
        </div>
        <p className="mt-1 text-sm font-medium leading-snug text-slate-800 dark:text-slate-100 line-clamp-2">{wo.title}</p>
        <p className="mt-1 text-xs text-slate-400 truncate">{wo.customerName} · {wo.siteName}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={wo.priority} />
          <SLACountdownBadge dueAt={wo.dueAt} status={wo.status} completedAt={wo.completedAt} compact />
        </div>
        {wo.assignedTechnicianName && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <User2 size={12} /> {wo.assignedTechnicianName}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ViewGuideBanner
        title="Work Order Management & Pipeline"
        description="Filter, inspect, drag, and update work orders through active lifecycle stages."
        steps={[
          { label: 'Filter & Search', detail: 'Use search bar and priority dropdown to filter jobs by title, customer, or urgency.' },
          { label: 'Drag & Drop Progression', detail: 'Drag cards between columns (NEW -> ASSIGNED -> IN_PROGRESS -> COMPLETED -> CLOSED) to transition status.' },
          { label: 'Click to Manage Details', detail: 'Click any work order card to open full details, log inventory parts, or record labor hours.' }
        ]}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search work orders…"
              className="input pl-8"
            />
          </div>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as Priority | 'ALL')} className="input max-w-[9.5rem]">
            {PRIORITY_FILTERS.map((p) => (
              <option key={p} value={p}>{p === 'ALL' ? 'All priorities' : p}</option>
            ))}
          </select>
        </div>
        {permissions.canCreateWorkOrder && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary shrink-0">
            <Plus size={16} /> New work order
          </button>
        )}
      </div>

      <StatusTabs active={statusTab} onChange={setStatusTab} counts={tabCounts} />

      {dragError && (
        <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-600 dark:text-rose-300 flex items-center justify-between">
          {dragError}
          <button onClick={() => setDragError(null)} className="text-xs font-semibold underline">Dismiss</button>
        </div>
      )}

      {statusTab === 'ALL' ? (
        <div key="board-all" className="flex gap-4 overflow-x-auto pb-2 animate-fade-in">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              onDragOver={(e) => permissions.canEditKanban && e.preventDefault()}
              onDrop={() => handleDrop(col.key)}
              className="flex w-72 shrink-0 flex-col rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800"
            >
              <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={col.key} />
                </div>
                <span className="text-xs font-semibold text-slate-400">{grouped[col.key].length}</span>
              </div>
              <div className="flex flex-col gap-2 px-2.5 pb-3 min-h-[6rem]">
                {isLoading && <div className="h-20 animate-pulse rounded-lg bg-white/60 dark:bg-slate-800/60" />}
                {!isLoading && grouped[col.key].length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-6 text-center text-xs text-slate-400">
                    Nothing here
                  </div>
                )}
                {grouped[col.key].map(renderCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          key={`board-${statusTab}`}
          onDragOver={(e) => permissions.canEditKanban && e.preventDefault()}
          onDrop={() => handleDrop(statusTab)}
          className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in"
        >
          {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
          {!isLoading && filteredForTab.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-10 text-center text-sm text-slate-400">
              No work orders in this status right now.
            </div>
          )}
          {!isLoading && filteredForTab.map(renderCard)}
        </div>
      )}

      {selectedId && <WorkOrderDetailModal workOrderId={selectedId} onClose={() => setSelectedId(null)} />}
      <WorkOrderFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
};
