import React from 'react';
import { Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
}

export function DataTable<T>({ columns, rows, keyExtractor, onRowClick, emptyLabel = 'No records found' }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 text-slate-400">
          <Inbox size={20} />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {columns.map((col) => (
              <th key={col.key} className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-slate-100 dark:border-slate-800/70 last:border-0 ${
                onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60' : ''
              } transition-colors`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-3 py-3 align-middle ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
