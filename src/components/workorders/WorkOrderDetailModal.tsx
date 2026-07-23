import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { History, Package, Timer, FileText, MapPin, Building2, User2, CheckCircle2, XCircle, PlayCircle, PauseCircle, Lock } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Tabs } from '../common/Tabs';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLACountdownBadge } from '../common/SLACountdownBadge';
import * as api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { WorkOrderStatus } from '../../types';

interface Props {
  workOrderId: string;
  onClose: () => void;
}

const TRANSITION_ACTIONS: Partial<Record<WorkOrderStatus, { label: string; icon: React.ReactNode; className: string }>> = {
  ASSIGNED: { label: 'Confirm assignment', icon: <PlayCircle size={14} />, className: 'btn-secondary' },
  IN_PROGRESS: { label: 'Start job', icon: <PlayCircle size={14} />, className: 'btn-primary' },
  ON_HOLD: { label: 'Put on hold', icon: <PauseCircle size={14} />, className: 'btn-secondary' },
  COMPLETED: { label: 'Mark complete', icon: <CheckCircle2 size={14} />, className: 'btn-primary' },
  CLOSED: { label: 'Close work order', icon: <Lock size={14} />, className: 'btn-primary' },
  CANCELLED: { label: 'Cancel', icon: <XCircle size={14} />, className: 'btn-secondary text-rose-600 dark:text-rose-400' },
};

export const WorkOrderDetailModal: React.FC<Props> = ({ workOrderId, onClose }) => {
  const { user, permissions } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [partItem, setPartItem] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [timeMinutes, setTimeMinutes] = useState(30);
  const [timeDesc, setTimeDesc] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: wo, isLoading } = useQuery({
    queryKey: ['work-order', workOrderId],
    queryFn: () => api.getWorkOrder(workOrderId),
  });

  const { data: inventoryList = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: api.getInventory,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
    queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
  };

  const transitionMutation = useMutation({
    mutationFn: (status: WorkOrderStatus) => api.transitionStatus(workOrderId, status, user.name, user.role),
    onSuccess: invalidateAll,
    onError: (e: Error) => setActionError(e.message),
  });

  const partMutation = useMutation({
    mutationFn: () => api.logPartUsage(workOrderId, partItem, partQty, user.name),
    onSuccess: () => {
      invalidateAll();
      setPartItem('');
      setPartQty(1);
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const timeMutation = useMutation({
    mutationFn: () => {
      const techId = user.technicianId ?? wo?.assignedTechnicianId ?? '';
      const techName = wo?.assignedTechnicianName ?? user.name;
      return api.logTime(workOrderId, techId, techName, timeMinutes, timeDesc || 'Time logged on job');
    },
    onSuccess: () => {
      invalidateAll();
      setTimeDesc('');
      setTimeMinutes(30);
    },
    onError: (e: Error) => setActionError(e.message),
  });

  if (isLoading || !wo) {
    return (
      <Modal open onClose={onClose} title="Loading…" size="xl">
        <div className="h-64 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </Modal>
    );
  }

  
  
  
  const isTerminal = wo.status === 'CLOSED' || wo.status === 'CANCELLED';

  const allowedNext = api.VALID_TRANSITIONS[wo.status].filter((s) => {
    if (s === 'CLOSED' && !permissions.canCloseWorkOrder) return false;
    if (user.role === 'TECHNICIAN' && (s === 'CANCELLED' || s === 'CLOSED')) return false;
    if (user.role === 'CUSTOMER') return false;
    return true;
  });

  const partsCost = wo.partsUsed.reduce((sum, p) => sum + p.unitCost * p.quantity, 0);
  const totalMinutes = wo.timeLogs.reduce((sum, t) => sum + t.minutes, 0);

  return (
    <Modal
      open
      onClose={onClose}
      title={wo.title}
      subtitle={`${wo.code} · ${wo.category.replace('_', ' ')}`}
      size="xl"
      headerRight={<StatusBadge status={wo.status} />}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Building2 size={14} /> {wo?.customerName ?? '—'}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin size={14} /> {wo?.siteName ?? '—'}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <User2 size={14} /> {wo?.assignedTechnicianName ?? 'Unassigned'}
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={wo.priority} />
            <SLACountdownBadge dueAt={wo.dueAt} status={wo.status} completedAt={wo.completedAt} />
          </div>
        </div>

        {actionError && (
          <div className="flex items-center justify-between rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
            {actionError}
            <button onClick={() => setActionError(null)} className="text-xs font-semibold underline">Dismiss</button>
          </div>
        )}

        {!isTerminal && allowedNext.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 mr-1">Move to:</span>
            {allowedNext.map((status) => {
              const cfg = TRANSITION_ACTIONS[status];
              return (
                <button
                  key={status}
                  disabled={transitionMutation.isPending}
                  onClick={() => transitionMutation.mutate(status)}
                  className={cfg?.className ?? 'btn-secondary'}
                >
                  {cfg?.icon}
                  {cfg?.label ?? status}
                </button>
              );
            })}
          </div>
        )}
        {isTerminal && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
            <Lock size={13} /> This work order is in a terminal state and can no longer be modified.
          </div>
        )}

        <Tabs
          tabs={[
            { key: 'overview', label: 'Overview', icon: <FileText size={14} /> },
            { key: 'history', label: 'Status History', icon: <History size={14} />, badge: wo.statusHistory.length },
            { key: 'parts', label: 'Parts Usage', icon: <Package size={14} />, badge: wo.partsUsed.length },
            { key: 'time', label: 'Time Log', icon: <Timer size={14} />, badge: wo.timeLogs.length },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === 'overview' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{wo.description}</p>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <div><p className="text-slate-400">Raised by</p><p className="font-medium text-slate-700 dark:text-slate-200">{wo.raisedBy}</p></div>
              <div><p className="text-slate-400">Created</p><p className="font-medium text-slate-700 dark:text-slate-200">{new Date(wo.createdAt).toLocaleString()}</p></div>
              <div><p className="text-slate-400">SLA due</p><p className="font-medium text-slate-700 dark:text-slate-200">{new Date(wo.dueAt).toLocaleString()}</p></div>
              <div><p className="text-slate-400">Parts cost</p><p className="font-medium text-slate-700 dark:text-slate-200">${partsCost.toFixed(2)}</p></div>
              <div><p className="text-slate-400">Labor logged</p><p className="font-medium text-slate-700 dark:text-slate-200">{(totalMinutes / 60).toFixed(1)}h</p></div>
              <div><p className="text-slate-400">Source</p><p className="font-medium text-slate-700 dark:text-slate-200">{wo.requestedByCustomer ? 'Customer portal' : 'Dispatch'}</p></div>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <ol className="relative flex flex-col gap-5 border-l-2 border-slate-200 dark:border-slate-800 pl-5">
            {wo.statusHistory.map((h) => (
              <li key={h.id} className="relative">
                <span className="absolute -left-[1.62rem] top-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500" />
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={h.toStatus} />
                  <span className="text-xs text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{h.changedBy}</span> <span className="text-slate-400">({h.changedByRole.toLowerCase()})</span>
                  {h.notes && <> — {h.notes}</>}
                </p>
              </li>
            ))}
          </ol>
        )}

        {tab === 'parts' && (
          <div className="flex flex-col gap-4">
            <div className="card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-400">
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Unit cost</th>
                    <th className="px-3 py-2">Line total</th>
                    <th className="px-3 py-2">Logged by</th>
                  </tr>
                </thead>
                <tbody>
                  {wo.partsUsed.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800/70 last:border-0">
                      <td className="px-3 py-2">{p.itemName}</td>
                      <td className="px-3 py-2">{p.quantity}</td>
                      <td className="px-3 py-2">${p.unitCost.toFixed(2)}</td>
                      <td className="px-3 py-2 font-medium">${(p.unitCost * p.quantity).toFixed(2)}</td>
                      <td className="px-3 py-2 text-slate-500">{p.loggedBy}</td>
                    </tr>
                  ))}
                  {wo.partsUsed.length === 0 && (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">No parts logged yet.</td></tr>
                  )}
                </tbody>
                {wo.partsUsed.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-slate-200 dark:border-slate-800 font-semibold">
                      <td className="px-3 py-2" colSpan={3}>Total parts cost</td>
                      <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400">${partsCost.toFixed(2)}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {!isTerminal && user.role !== 'CUSTOMER' && (
              <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="label">Inventory item</label>
                  <select className="input" value={partItem} onChange={(e) => setPartItem(e.target.value)}>
                    <option value="">Select item…</option>
                    {(inventoryList.length > 0 ? inventoryList : [
                      { id: '44444444-4444-4444-4444-444444444441', name: 'Compressor Motor', unitCost: 250.0, quantityOnHand: 15 },
                      { id: '44444444-4444-4444-4444-444444444442', name: 'Air Filter', unitCost: 15.5, quantityOnHand: 100 },
                      { id: '44444444-4444-4444-4444-444444444443', name: 'Coolant 1Gal', unitCost: 25.0, quantityOnHand: 50 },
                      { id: '44444444-4444-4444-4444-444444444444', name: 'Thermostat', unitCost: 75.0, quantityOnHand: 30 }
                    ]).map((i: any) => (
                      <option key={i.id} value={i.id}>{i.name} (${(i.unitCost || 0).toFixed(2)}, {i.stockQty ?? i.quantityOnHand ?? 10} in stock)</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-24">
                  <label className="label">Qty</label>
                  <input type="number" min={1} className="input" value={partQty} onChange={(e) => setPartQty(Math.max(1, Number(e.target.value)))} />
                </div>
                <button className="btn-primary" disabled={!partItem || partMutation.isPending} onClick={() => partMutation.mutate()}>
                  Log part
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'time' && (
          <div className="flex flex-col gap-4">
            <div className="card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-400">
                    <th className="px-3 py-2">Technician</th>
                    <th className="px-3 py-2">Duration</th>
                    <th className="px-3 py-2">Notes</th>
                    <th className="px-3 py-2">Logged at</th>
                  </tr>
                </thead>
                <tbody>
                  {wo.timeLogs.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800/70 last:border-0">
                      <td className="px-3 py-2">{t.technicianName}</td>
                      <td className="px-3 py-2">{t.minutes} min</td>
                      <td className="px-3 py-2 text-slate-500">{t.description}</td>
                      <td className="px-3 py-2 text-slate-400">{new Date(t.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                  {wo.timeLogs.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-400">No time logged yet.</td></tr>
                  )}
                </tbody>
                {wo.timeLogs.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-slate-200 dark:border-slate-800 font-semibold">
                      <td className="px-3 py-2">Total</td>
                      <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400">{(totalMinutes / 60).toFixed(1)}h</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {!isTerminal && (user.role === 'TECHNICIAN' || user.role === 'MANAGER' || user.role === 'DISPATCHER') && (
              <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-3 sm:flex-row sm:items-end">
                <div className="w-full sm:w-28">
                  <label className="label">Minutes</label>
                  <input type="number" min={5} step={5} className="input" value={timeMinutes} onChange={(e) => setTimeMinutes(Math.max(5, Number(e.target.value)))} />
                </div>
                <div className="flex-1">
                  <label className="label">Notes</label>
                  <input className="input" placeholder="What did you work on?" value={timeDesc} onChange={(e) => setTimeDesc(e.target.value)} />
                </div>
                <button className="btn-primary" disabled={timeMutation.isPending} onClick={() => timeMutation.mutate()}>
                  Log time
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
