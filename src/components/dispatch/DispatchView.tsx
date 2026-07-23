import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Phone, Wrench, ChevronRight } from 'lucide-react';
import * as api from '../../services/api';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLACountdownBadge } from '../common/SLACountdownBadge';
import { useAuth } from '../../context/AuthContext';
import { ViewGuideBanner } from '../common/ViewGuideBanner';
import type { Technician, TechnicianStatus, WorkOrder } from '../../types';

const STATUS_STYLES: Record<TechnicianStatus, { label: string; dot: string; text: string }> = {
  AVAILABLE: { label: 'Available', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  ON_JOB: { label: 'On job', dot: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
  ON_BREAK: { label: 'On break', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  OFF_DUTY: { label: 'Off duty', dot: 'bg-slate-400', text: 'text-slate-500 dark:text-slate-400' },
};

export const DispatchView: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [assignTarget, setAssignTarget] = useState<Technician | null>(null);
  const [selectedWoId, setSelectedWoId] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);

  const { data: technicians = [] } = useQuery({ queryKey: ['technicians'], queryFn: api.getTechnicians });
  const { data: workOrders = [] } = useQuery({ queryKey: ['work-orders', 'dispatch'], queryFn: () => api.getWorkOrders({}) });

  const unassigned = workOrders.filter((wo) => wo.status === 'NEW' || (wo.status === 'ASSIGNED' && !wo.assignedTechnicianId));

  const assignMutation = useMutation({
    mutationFn: ({ woId, techId }: { woId: string; techId: string }) => api.assignTechnician(woId, techId, user.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      setAssignTarget(null);
      setSelectedWoId('');
    },
    onError: (e: Error) => setAssignError(e.message),
  });

  function activeJobsFor(tech: Technician): WorkOrder[] {
    return workOrders.filter((wo) => wo.assignedTechnicianId === tech.id && wo.status !== 'CLOSED' && wo.status !== 'CANCELLED');
  }

  return (
    <div className="flex flex-col gap-5">
      <ViewGuideBanner
        title="Dispatching & Technician Scheduling"
        description="Match open work orders with available technicians based on skill certifications."
        steps={[
          { label: 'Unassigned Jobs', detail: 'Open work orders in NEW or ASSIGNED status are flagged for dispatching.' },
          { label: 'Skill Matching', detail: 'Click Assign technician to see qualified candidates matched by skills (HVAC, Electrical, Plumbing).' },
          { label: 'Confirm & Notify', detail: 'Assigning a technician transitions the job state and delivers it to their workspace.' }
        ]}
      />
      <div>
        <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">Technician availability</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Assign or reassign technicians to open work orders across all sites.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {technicians.map((tech) => {
          const jobs = activeJobsFor(tech);
          const style = STATUS_STYLES[tech.status];
          return (
            <div key={tech.id} className="card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: tech.avatarColor }}
                  >
                    {tech.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{tech.name}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Star size={11} className="fill-amber-400 text-amber-400" /> {tech.rating.toFixed(1)} · {tech.region}
                    </div>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${style.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} /> {style.label}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {tech.skills.map((skill) => (
                  <span key={skill} className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {skill.replace('_', ' ')}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Wrench size={12} /> {jobs.length} active job{jobs.length === 1 ? '' : 's'}</span>
                <span className="flex items-center gap-1"><Phone size={12} /> {tech.phone}</span>
              </div>

              {jobs.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                  {jobs.slice(0, 2).map((j) => (
                    <div key={j.id} className="flex items-center justify-between text-xs">
                      <span className="truncate text-slate-500 dark:text-slate-400">{j.code} · {j.title}</span>
                      <PriorityBadge priority={j.priority} />
                    </div>
                  ))}
                  {jobs.length > 2 && <p className="text-[11px] text-slate-400">+{jobs.length - 2} more</p>}
                </div>
              )}

              <button
                onClick={() => {
                  setAssignTarget(tech);
                  setAssignError(null);
                }}
                className="btn-secondary mt-1 w-full justify-between"
              >
                Assign a job <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title={`Assign a job to ${assignTarget?.name ?? ''}`}
        subtitle="Choose from unassigned or newly submitted work orders."
        size="md"
      >
        <div className="flex flex-col gap-3">
          {assignError && <p className="rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">{assignError}</p>}
          <div className="max-h-72 overflow-y-auto flex flex-col gap-2">
            {unassigned.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No unassigned work orders right now.</p>}
            {unassigned.map((wo) => {
              
              
              return (
                <label
                  key={wo.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition-colors ${
                    selectedWoId === wo.id
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <input type="radio" name="wo-select" className="mt-1" checked={selectedWoId === wo.id} onChange={() => setSelectedWoId(wo.id)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-700 dark:text-slate-200">{wo.title}</span>
                      <PriorityBadge priority={wo.priority} />
                    </div>
                    <p className="text-xs text-slate-400">{wo.code} · {wo.customerName} · {wo.siteName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge status={wo.status} />
                      <SLACountdownBadge dueAt={wo.dueAt} status={wo.status} compact />
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
            <button className="btn-secondary" onClick={() => setAssignTarget(null)}>Cancel</button>
            <button
              className="btn-primary"
              disabled={!selectedWoId || assignMutation.isPending}
              onClick={() => assignTarget && assignMutation.mutate({ woId: selectedWoId, techId: assignTarget.id })}
            >
              Confirm assignment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
