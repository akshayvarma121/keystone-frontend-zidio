import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Bell, ShieldCheck, Palette } from 'lucide-react';
import { Topbar } from './components/common/Topbar';
import { Sidebar, isViewAllowed, defaultViewFor, type ViewKey } from './components/common/Sidebar';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { KanbanBoard } from './components/workorders/KanbanBoard';
import { DispatchView } from './components/dispatch/DispatchView';
import { TechnicianMobileView } from './components/technician/TechnicianMobileView';
import { CustomerPortalView } from './components/customer/CustomerPortalView';
import { CustomerSiteManager } from './components/customers/CustomerSiteManager';
import { ReportsView } from './components/reports/ReportsView';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { ProfilePage } from './pages/ProfilePage';
import { RequireAuth } from './routes/RequireAuth';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

const VIEW_TITLES: Record<ViewKey, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Live SLA compliance and operations overview' },
  kanban: { title: 'Work Orders', sub: 'Filter by status and drag jobs across the pipeline as they progress' },
  dispatch: { title: 'Dispatch', sub: 'Assign technicians to open work' },
  customers: { title: 'Customers & Sites', sub: 'Manage accounts and mapped facilities' },
  reports: { title: 'Reports', sub: 'Performance and cost analytics' },
  technician: { title: 'My Jobs', sub: 'Assigned work for today' },
  'customer-portal': { title: 'Service Requests', sub: 'Track and raise facility requests' },
  settings: { title: 'Settings', sub: 'Platform preferences' },
  profile: { title: 'Profile', sub: 'Your account details and access level' },
};

const SettingsView: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/30 p-2 text-indigo-600 dark:text-indigo-300"><Palette size={18} /></div>
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Appearance</p>
            <p className="text-xs text-slate-400">Toggle between light and dark mode.</p>
          </div>
        </div>
        <button onClick={toggleTheme} className="btn-secondary capitalize">{theme} mode</button>
      </div>
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-2 text-amber-600 dark:text-amber-300"><Bell size={18} /></div>
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">SLA breach alerts</p>
            <p className="text-xs text-slate-400">Notify managers when a work order crosses its SLA target.</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Enabled</span>
      </div>
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300"><ShieldCheck size={18} /></div>
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Role permissions</p>
            <p className="text-xs text-slate-400">Closure rights are limited to Manager / Admin accounts.</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Managed</span>
      </div>
    </div>
  );
};

/**
 * Everything a signed-in user sees: topbar, role-scoped sidebar, and the
 * active module. This is deliberately not split into per-module routes —
 * navigation is a fast in-app tab switch — but every module is still
 * checked against the role's allowed-view list before it renders, so a
 * stale tab left open across a role switch falls back to a 403 rather
 * than leaking a screen the new role shouldn't see.
 */
const AppShell: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<ViewKey>(defaultViewFor(user.role));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setView(defaultViewFor(user.role));
  }, [user.role]);

  const meta = VIEW_TITLES[view];
  const allowed = isViewAllowed(user.role, view);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Topbar onMenuClick={() => setSidebarOpen((o) => !o)} />
      <div className="flex">
        <Sidebar active={view} onNavigate={setView} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {allowed && (
              <div className="mb-5">
                <h1 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50 sm:text-2xl">{meta.title}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{meta.sub}</p>
              </div>
            )}

            {!allowed && <ForbiddenPage />}
            {allowed && view === 'dashboard' && <ManagerDashboard />}
            {allowed && view === 'kanban' && <KanbanBoard />}
            {allowed && view === 'dispatch' && <DispatchView />}
            {allowed && view === 'customers' && <CustomerSiteManager />}
            {allowed && view === 'reports' && <ReportsView />}
            {allowed && view === 'technician' && <TechnicianMobileView />}
            {allowed && view === 'customer-portal' && <CustomerPortalView />}
            {allowed && view === 'settings' && <SettingsView />}
            {allowed && view === 'profile' && <ProfilePage />}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
