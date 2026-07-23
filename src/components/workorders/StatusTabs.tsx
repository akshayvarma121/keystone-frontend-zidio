import React from 'react';
import type { WorkOrderStatus } from '../../types';

export type StatusTabKey = WorkOrderStatus | 'ALL';

const TAB_ORDER: { key: StatusTabKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'ON_HOLD', label: 'On Hold' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CLOSED', label: 'Closed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

interface Props {
  active: StatusTabKey;
  onChange: (key: StatusTabKey) => void;
  counts: Partial<Record<StatusTabKey, number>>;
}

/**
 * Enterprise-style segmented control for filtering the Work Orders view by
 * status in place — no route change, no reload. Selecting a tab swaps the
 * list below via a simple state update in the parent (KanbanBoard), with a
 * fade/slide transition on the content it controls.
 */
export const StatusTabs: React.FC<Props> = ({ active, onChange, counts }) => {
  return (
    <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-slate-100 dark:bg-slate-900 p-1.5" role="tablist" aria-label="Filter work orders by status">
      {TAB_ORDER.map((tab) => {
        const isActive = tab.key === active;
        const count = counts[tab.key] ?? 0;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
