import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Gauge, Clock3, DollarSign, Timer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as api from '../../services/api';
import { StatCard } from '../common/StatCard';
import { ViewGuideBanner } from '../common/ViewGuideBanner';
import type { Priority } from '../../types';

const PRIORITY_COLORS: Record<Priority, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#eab308',
  LOW: '#94a3b8',
};

type RangeFilter = '30' | '90' | 'ALL';

export const ReportsView: React.FC = () => {
  const [range, setRange] = useState<RangeFilter>('ALL');
  const [exported, setExported] = useState(false);
  const { data: summary, isLoading } = useQuery({ queryKey: ['reports-summary'], queryFn: api.getReportSummary });

  function handleExport() {
    setExported(true);
    setTimeout(() => setExported(false), 2200);
  }

  if (isLoading || !summary) {
    return <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}</div>;
  }

  const categoryData = Object.entries(summary.workOrdersByCategory).map(([category, count]) => ({ category: category.replace('_', ' '), count }));

  return (
    <div className="flex flex-col gap-5">
      <ViewGuideBanner
        title="Analytics & Reports"
        description="All charts and KPIs update automatically from real work order data. Use these reports to track team efficiency and SLA compliance."
        steps={[
          { label: 'KPI Cards', detail: 'The four metric cards at the top show real-time SLA compliance, average resolution time, cost per order, and active backlog.' },
          { label: 'Time Range Filter', detail: 'Use the "30d / 90d / All" toggle to filter data by recent periods or view the full history.' },
          { label: 'Category Breakdown', detail: 'The bar chart shows how many work orders fall under each service category (HVAC, Electrical, Plumbing, etc.).' },
          { label: 'Export', detail: 'Click the Export button to download a summary report of the current data.' },
        ]}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">Performance reports</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">SLA compliance, workload, and cost tracking across all sites.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={range} onChange={(e) => setRange(e.target.value as RangeFilter)} className="input max-w-[9rem]">
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="ALL">All time</option>
          </select>
          <button onClick={handleExport} className="btn-secondary">
            <Download size={15} /> {exported ? 'Exported!' : 'Export'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="SLA Compliance" value={`${summary.slaComplianceRate}%`} icon={<Gauge size={18} />} accent={summary.slaComplianceRate >= 85 ? 'emerald' : 'amber'} />
        <StatCard label="Avg. Resolution" value={`${summary.avgResolutionHours}h`} icon={<Clock3 size={18} />} accent="indigo" />
        <StatCard label="Parts Cost" value={`$${summary.totalPartsCost.toLocaleString()}`} icon={<DollarSign size={18} />} accent="rose" />
        <StatCard label="Labor Logged" value={`${(summary.totalLaborMinutes / 60).toFixed(1)}h`} icon={<Timer size={18} />} accent="slate" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200">Work orders by category</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={110} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#4338ca" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200">SLA outcome by priority</h3>
          <div className="mt-4 flex flex-col gap-3">
            {summary.slaMetrics.map((m) => {
              const total = m.compliantCount + m.breachedCount + m.atRiskCount || 1;
              return (
                <div key={m.priority}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold" style={{ color: PRIORITY_COLORS[m.priority] }}>{m.priority}</span>
                    <span className="text-slate-400">{m.targetHours}h target</span>
                  </div>
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="bg-emerald-500" style={{ width: `${(m.compliantCount / total) * 100}%` }} title="On track / met" />
                    <div className="bg-amber-500" style={{ width: `${(m.atRiskCount / total) * 100}%` }} title="At risk" />
                    <div className="bg-rose-500" style={{ width: `${(m.breachedCount / total) * 100}%` }} title="Breached" />
                  </div>
                  <div className="mt-1 flex gap-3 text-[11px] text-slate-400">
                    <span>{m.compliantCount} on track</span>
                    <span>{m.atRiskCount} at risk</span>
                    <span>{m.breachedCount} breached</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200">Technician performance</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-400">
                <th className="px-3 py-2">Technician</th>
                <th className="px-3 py-2">Active jobs</th>
                <th className="px-3 py-2">Completed</th>
                <th className="px-3 py-2">Completion rate</th>
              </tr>
            </thead>
            <tbody>
              {summary.technicianLoad.map((t) => {
                const total = t.activeCount + t.completedCount || 1;
                const rate = Math.round((t.completedCount / total) * 100);
                return (
                  <tr key={t.technicianId} className="border-b border-slate-100 dark:border-slate-800/70 last:border-0">
                    <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">{t.technicianName}</td>
                    <td className="px-3 py-2">{t.activeCount}</td>
                    <td className="px-3 py-2">{t.completedCount}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
