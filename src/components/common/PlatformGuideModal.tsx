import React, { useState } from 'react';
import { HelpCircle, BookOpen, Wrench, ShieldCheck, CheckCircle2, UserCheck, Building2, BarChart3, Clock, Lock } from 'lucide-react';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const PlatformGuideModal: React.FC<Props> = ({ open, onClose }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'lifecycle' | 'dispatch' | 'tech' | 'customers'>('overview');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Platform User Guide"
      subtitle="Comprehensive walkthrough of Keystone Field Service Management features and workflows"
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-medium">
          <button
            onClick={() => setActiveSection('overview')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              activeSection === 'overview'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen size={14} /> Getting Started
          </button>
          <button
            onClick={() => setActiveSection('lifecycle')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              activeSection === 'lifecycle'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 size={14} /> Work Order Lifecycle
          </button>
          <button
            onClick={() => setActiveSection('dispatch')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              activeSection === 'dispatch'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Wrench size={14} /> Dispatch & Scheduling
          </button>
          <button
            onClick={() => setActiveSection('tech')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              activeSection === 'tech'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock size={14} /> Technician Tools
          </button>
          <button
            onClick={() => setActiveSection('customers')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              activeSection === 'customers'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 size={14} /> Customers & Analytics
          </button>
        </div>

        {/* Content Section */}
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {activeSection === 'overview' && (
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">User Roles & Permissions</h4>
                <p className="text-xs text-slate-500 mb-3">Keystone features 4 strict role-based access levels:</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"><ShieldCheck size={14} /> Manager / Admin</p>
                    <p className="text-xs text-slate-500 mt-1">Full access to dashboard metrics, work order approvals, dispatching, customer setup, and closing completed orders.</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5"><Wrench size={14} /> Dispatcher</p>
                    <p className="text-xs text-slate-500 mt-1">Schedules open jobs, evaluates candidate technician availability, and monitors SLA deadlines across facilities.</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5"><UserCheck size={14} /> Technician</p>
                    <p className="text-xs text-slate-500 mt-1">Mobile-optimized interface to review assigned jobs, start/hold work, log inventory parts, and record time entries.</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5"><Building2 size={14} /> Customer</p>
                    <p className="text-xs text-slate-500 mt-1">Dedicated customer portal to submit new service requests for mapped building sites and track real-time resolution.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'lifecycle' && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">Work Order Status Progression</h4>
              <p className="text-xs text-slate-500">Every work order follows a strict, state-machine validated lifecycle:</p>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-bold text-slate-700 dark:text-slate-300">1. NEW</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Ticket Created</p>
                    <p className="text-slate-500">Raised by a manager or customer. SLA countdown timer starts automatically based on priority level.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <span className="rounded bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5 font-bold text-sky-700 dark:text-sky-300">2. ASSIGNED</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Technician Assigned</p>
                    <p className="text-slate-500">A qualified technician is assigned via the Dispatch board. Job appears in the technician's workspace.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <span className="rounded bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 font-bold text-indigo-700 dark:text-indigo-300">3. IN_PROGRESS</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Work Underway</p>
                    <p className="text-slate-500">Only the assigned technician can start the job. Technician logs inventory parts used and labor hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <span className="rounded bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 font-bold text-emerald-700 dark:text-emerald-300">4. COMPLETED</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Field Service Finished</p>
                    <p className="text-slate-500">Technician marks the job complete. Work order awaits manager verification.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <span className="rounded bg-slate-200 dark:bg-slate-800 px-2 py-0.5 font-bold text-slate-600 dark:text-slate-400">5. CLOSED</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Final Closure (Manager Only)</p>
                    <p className="text-slate-500">Manager reviews total cost, approves work order, and archives the record permanently.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'dispatch' && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">How to Dispatch Work Orders</h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>Navigate to the <strong>Dispatch & Scheduling</strong> tab from the sidebar.</li>
                <li>Review open work orders in the left panel or click on any technician card.</li>
                <li>Click <strong>Assign technician</strong> to open candidate matching.</li>
                <li>The system automatically highlights technicians matching the required skill (HVAC, Electrical, Plumbing, etc.) and availability status.</li>
                <li>Confirm the assignment. The work order immediately transitions to <code>ASSIGNED</code> state.</li>
              </ol>
            </div>
          )}

          {activeSection === 'tech' && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">Logging Parts & Labour Hours</h4>
              <p className="text-xs text-slate-500">Technicians can manage job execution directly from their mobile view or work order modal:</p>
              <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>Click on any assigned work order to open details.</li>
                <li>Switch to the <strong>Parts used</strong> tab to select inventory items (Compressor Motor, Air Filter, Coolant, etc.) and enter quantity.</li>
                <li>Switch to the <strong>Time logs</strong> tab to record hours spent on site along with work description notes.</li>
                <li>When finished, click <strong>Mark complete</strong> to send the job to management for final closure.</li>
              </ul>
            </div>
          )}

          {activeSection === 'customers' && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">Customer & Analytics Management</h4>
              <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <li><strong>Customers & Sites</strong>: Create enterprise client profiles and map individual facility site locations with addresses and contact details.</li>
                <li><strong>Analytics & Insights</strong>: Monitor SLA compliance percentages, overdue job counts, technician workload distribution, and monthly trend graphs.</li>
                <li><strong>CSV Export</strong>: Click <em>Export</em> in the Reports view to download complete SLA performance data for audits.</li>
              </ul>
            </div>
          )}
        </div>

        <div className="mt-2 flex justify-end border-t border-slate-200 dark:border-slate-800 pt-3">
          <button className="btn-primary text-xs px-4 py-1.5" onClick={onClose}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </Modal>
  );
};
