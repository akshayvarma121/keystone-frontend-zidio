import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Wrench, UserCheck, Building2, CheckCircle2, Clock, BarChart3, HelpCircle } from 'lucide-react';

export const GuideView: React.FC = () => {
  const [tab, setTab] = useState<'roles' | 'lifecycle' | 'dispatch' | 'tech' | 'customers'>('roles');

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="card p-6 border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/50 via-white to-sky-50/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-sky-950/20">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-3 text-white shadow-soft">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">Platform User Guide & Operations Manual</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Step-by-step instructions for managing field service operations, technician dispatches, and SLA workflows.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200/80 dark:border-slate-800 pt-4 text-xs font-medium">
          <button
            onClick={() => setTab('roles')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              tab === 'roles'
                ? 'bg-indigo-600 text-white font-semibold shadow-soft'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck size={14} /> Roles & Access
          </button>
          <button
            onClick={() => setTab('lifecycle')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              tab === 'lifecycle'
                ? 'bg-indigo-600 text-white font-semibold shadow-soft'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 size={14} /> Work Order Lifecycle
          </button>
          <button
            onClick={() => setTab('dispatch')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              tab === 'dispatch'
                ? 'bg-indigo-600 text-white font-semibold shadow-soft'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Wrench size={14} /> Dispatch & Matching
          </button>
          <button
            onClick={() => setTab('tech')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              tab === 'tech'
                ? 'bg-indigo-600 text-white font-semibold shadow-soft'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Clock size={14} /> Technician Logging
          </button>
          <button
            onClick={() => setTab('customers')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              tab === 'customers'
                ? 'bg-indigo-600 text-white font-semibold shadow-soft'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 size={14} /> Customers & Facilities
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="card p-6">
        {tab === 'roles' && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 mb-1">User Roles & Access Levels</h3>
              <p className="text-xs text-slate-500">Keystone strictly enforces role-based access control (RBAC) tied directly to backend database authorizations:</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-lg bg-indigo-100 dark:bg-indigo-900/40 p-2 text-indigo-600 dark:text-indigo-300"><ShieldCheck size={18} /></span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Manager / Admin</p>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-500 space-y-1.5 leading-relaxed">
                  <li>Full operational oversight across all sites and teams.</li>
                  <li>Can create, edit, reassign, and permanently close work orders.</li>
                  <li>Monitors live SLA compliance rates and overall system metrics.</li>
                  <li>Manages customer company accounts and site locations.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-lg bg-sky-100 dark:bg-sky-900/40 p-2 text-sky-600 dark:text-sky-300"><Wrench size={18} /></span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Dispatcher</p>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-500 space-y-1.5 leading-relaxed">
                  <li>Reviews open jobs and assigns technicians based on required skills.</li>
                  <li>Monitors technician availability statuses (Available, On Job, Off Duty).</li>
                  <li>Tracks upcoming SLA targets to prevent deadline breaches.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2 text-amber-600 dark:text-amber-300"><UserCheck size={18} /></span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Technician</p>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-500 space-y-1.5 leading-relaxed">
                  <li>Mobile-optimized view focusing strictly on assigned field jobs.</li>
                  <li>Can start jobs, put jobs on hold, or mark jobs complete.</li>
                  <li>Logs inventory parts used and labor time spent on site.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-lg bg-rose-100 dark:bg-rose-900/40 p-2 text-rose-600 dark:text-rose-300"><Building2 size={18} /></span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Customer</p>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-500 space-y-1.5 leading-relaxed">
                  <li>Client portal allowing property managers to raise service requests.</li>
                  <li>Restricted view showing only work orders for their mapped facilities.</li>
                  <li>Tracks real-time job progress from request creation to completion.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === 'lifecycle' && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 mb-1">Work Order Lifecycle & State Machine</h3>
              <p className="text-xs text-slate-500">Status transitions are validated by the backend service layer to ensure data integrity:</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 font-bold text-slate-700 dark:text-slate-200">NEW</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">1. Job Requested</p>
                    <p className="text-slate-500">Created by customer or manager. SLA countdown timer begins.</p>
                  </div>
                </div>
                <span className="text-slate-400 font-medium">Next: ASSIGNED</span>
              </div>

              <div className="rounded-xl border border-sky-200 dark:border-sky-900/50 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-sky-50/20 dark:bg-sky-950/10">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-sky-100 dark:bg-sky-900/40 px-3 py-1 font-bold text-sky-700 dark:text-sky-300">ASSIGNED</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">2. Technician Assigned</p>
                    <p className="text-slate-500">Dispatched to technician. Appears in technician's workspace.</p>
                  </div>
                </div>
                <span className="text-slate-400 font-medium">Next: IN_PROGRESS</span>
              </div>

              <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/50 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-indigo-50/20 dark:bg-indigo-950/10">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1 font-bold text-indigo-700 dark:text-indigo-300">IN_PROGRESS</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">3. Field Service Underway</p>
                    <p className="text-slate-500">Only assigned technician can start work and log parts/labor.</p>
                  </div>
                </div>
                <span className="text-slate-400 font-medium">Next: COMPLETED / ON_HOLD</span>
              </div>

              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-emerald-50/20 dark:bg-emerald-950/10">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 font-bold text-emerald-700 dark:text-emerald-300">COMPLETED</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">4. Work Finished</p>
                    <p className="text-slate-500">Field work complete. Awaits manager final review.</p>
                  </div>
                </div>
                <span className="text-slate-400 font-medium">Next: CLOSED</span>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-slate-200 dark:bg-slate-800 px-3 py-1 font-bold text-slate-600 dark:text-slate-400">CLOSED</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">5. Final Approval (Manager Only)</p>
                    <p className="text-slate-500">Manager approves work order costs and archives record.</p>
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terminal State</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'dispatch' && (
          <div className="flex flex-col gap-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 mb-1">Dispatching Technicians</h3>
            <ol className="list-decimal list-inside space-y-3">
              <li className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Open Dispatch View:</strong> Select <em>Dispatch & Scheduling</em> from the sidebar menu.
              </li>
              <li className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Review Unassigned Work Orders:</strong> The left panel displays open jobs requiring assignment, showing required skills and SLA targets.
              </li>
              <li className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Evaluate Technician Candidates:</strong> Click <em>Assign technician</em> on any job. The system queries candidate technicians matching required skills (HVAC, Electrical, Plumbing, etc.) and availability status.
              </li>
              <li className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Confirm Assignment:</strong> Select the technician and click submit. The work order transitions to <code>ASSIGNED</code> state immediately.
              </li>
            </ol>
          </div>
        )}

        {tab === 'tech' && (
          <div className="flex flex-col gap-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 mb-1">Technician Parts & Labour Logging</h3>
            <ul className="list-disc list-inside space-y-3">
              <li className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Open Work Order Details:</strong> Click on any assigned job card in your <em>My Jobs</em> view or Kanban board.
              </li>
              <li className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Log Inventory Parts:</strong> Select the <em>Parts used</em> tab, choose an inventory item from the database dropdown (e.g. Compressor Motor, Air Filter), specify quantity, and click <em>Log part</em>.
              </li>
              <li className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Record Labor Time:</strong> Select the <em>Time logs</em> tab, enter minutes spent working on site, add descriptive notes, and save.
              </li>
              <li className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Complete Job:</strong> Click <em>Mark complete</em> once work is finished. The work order is forwarded to management for closure.
              </li>
            </ul>
          </div>
        )}

        {tab === 'customers' && (
          <div className="flex flex-col gap-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 mb-1">Customer Accounts & Facility Mapping</h3>
            <ul className="list-disc list-inside space-y-3">
              <li className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Create Customer Profile:</strong> Click <em>New customer</em> in the <em>Customers & Sites</em> tab to register enterprise client accounts and tier levels (Standard, Priority, Enterprise).
              </li>
              <li className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Map Facility Sites:</strong> Click on any customer row to view building sites, add new site locations, address lines, and contact phone numbers.
              </li>
              <li className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Real-time Analytics:</strong> All metrics, bar charts, pie charts, and monthly trends on the Dashboard and Reports view are aggregated directly from live database records.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
