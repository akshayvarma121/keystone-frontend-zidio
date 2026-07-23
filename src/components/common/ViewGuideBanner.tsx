import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  steps: { label: string; detail: string }[];
}

export const ViewGuideBanner: React.FC<Props> = ({ title, description, steps }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/30 dark:border-indigo-900/40 dark:from-indigo-950/20 dark:via-slate-900 dark:to-indigo-950/10 p-4 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-indigo-600 p-1.5 text-white shadow-soft">
            <Lightbulb size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              Quick Guide: {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1.5 rounded-lg border border-indigo-200/80 dark:border-indigo-800/60 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <HelpCircle size={13} />
          <span>{expanded ? 'Hide tips' : 'How to use'}</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3.5 border-t border-indigo-100/80 dark:border-indigo-900/40 pt-3 animate-fade-in">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-2.5 text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1 mb-1">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    {idx + 1}
                  </span>
                  {step.label}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
