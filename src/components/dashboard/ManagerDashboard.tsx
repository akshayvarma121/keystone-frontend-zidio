import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { ClipboardList, AlertOctagon, TimerReset, Gauge } from 'lucide-react';
import * as api from '../../services/api';
import { StatCard } from '../common/StatCard';
import type { Priority } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  NEW: '#94a3b8',
  ASSIGNED: '#0ea5e9',
  IN_PROGRESS: '#6366f1',
  ON_HOLD: '#f59e0b',
  COMPLETED: '#10b981',
  CLOSED: '#64748b',
  CANCELLED: '#fb7185',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#eab308',
  LOW: '#94a3b8',
};

import { ViewGuideBanner } from '../common/ViewGuideBanner';

export const ManagerDashboard: React.FC = () => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: api.getReportSummary,
  });

  if (isLoading || !summary) {
    return <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}</div>;
  }

  const statusData = Object.entries(summary.workOrdersByStatus).map(([status, count]) => ({ status, count }));
  const priorityData = (Object.keys(PRIORITY_COLORS) as Priority[]).map((p) => ({
    name: p,
    value: summary.workOrdersByPriority[p] ?? 0,
  }));
  const techLoad = summary.technicianLoad.slice(0, 10);

  const totalSlaTracked = summary.slaMetrics.reduce((s, m) => s + m.compliantCount + m.breachedCount + m.atRiskCount, 0);
  const totalBreached = summary.slaMetrics.reduce((s, m) => s + m.breachedCount, 0);
  const totalAtRisk = summary.slaMetrics.reduce((s, m) => s + m.atRiskCount, 0);

  return (
    <div className="flex flex-col gap-5">
      <ViewGuideBanner
        title="Dashboard & Metrics Overview"
        description="Monitor real-time SLA compliance, status counts, technician loads, and active alerts."
        steps={[
          { label: 'Top Metrics', detail: 'View open work orders, SLA percentage, breached targets, and monthly resolutions.' },
          { label: 'Status & Priority Mix', detail: 'Inspect the bar and pie charts to see workload distribution across NEW, IN_PROGRESS, and CLOSED states.' },
          { label: 'Active SLA Alerts', detail: 'Check bottom alert cards for jobs nearing SLA breach. Click Work Orders in sidebar to reassign or escalate.' }
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Work Orders" value={summary.openWorkOrders} icon={<ClipboardList size={18} />} accent="indigo" sub={`${summary.totalWorkOrders} total`} />
        <StatCard label="SLA Compliance" value={`${summary.slaComplianceRate}%`} icon={<Gauge size={18} />} accent={summary.slaComplianceRate >= 85 ? 'emerald' : 'amber'} sub={`${totalSlaTracked} tracked`} />
        <StatCard label="Breached SLAs" value={totalBreached} icon={<AlertOctagon size={18} />} accent="rose" sub={`${totalAtRisk} at risk now`} />
        <StatCard label="Avg. Resolution" value={`${summary.avgResolutionHours}h`} icon={<TimerReset size={18} />} accent="slate" sub={`${summary.closedThisMonth} closed this month`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200">Work orders by status</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} tickFormatter={(v) => v.replace('_', ' ')} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(value: number) => [value, 'Work orders']}
                  labelFormatter={(v) => String(v).replace('_', ' ')}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200">Priority mix</h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name as Priority]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200">Created vs. closed (6 months)</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.monthlyTrend} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="created" stroke="#4338ca" strokeWidth={2} dot={false} name="Created" />
                <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} dot={false} name="Closed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200">Technician load</h3>
          <div className="mt-3 flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
            {techLoad.map((t) => {
              const total = t.activeCount + t.completedCount || 1;
              const pct = Math.round((t.activeCount / total) * 100);
              return (
                <div key={t.technicianId}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{t.technicianName}</span>
                    <span className="text-slate-400">{t.activeCount} active</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(totalBreached > 0 || totalAtRisk > 0) && (
        <div className="card border-amber-200 dark:border-amber-900/50 p-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertOctagon size={16} />
            <h3 className="font-display text-sm font-semibold">Active alerts</h3>
          </div>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
            {totalBreached} work order{totalBreached === 1 ? ' has' : 's have'} breached its SLA target, and {totalAtRisk} more{' '}
            {totalAtRisk === 1 ? 'is' : 'are'} within the risk window. Review the Work Orders board to reassign or escalate.
          </p>
        </div>
      )}
    </div>
  );
};
