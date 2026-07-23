import React from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
            {typeof tab.badge === 'number' && tab.badge > 0 && (
              <span className="ml-0.5 rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                {tab.badge}
              </span>
            )}
            {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
          </button>
        );
      })}
    </div>
  );
};
