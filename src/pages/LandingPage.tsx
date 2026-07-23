import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, ArrowRight, KanbanSquare, Wrench, MapPinned, Gauge, BarChart3, MessageSquareText,
  CheckCircle2, Mail,
} from 'lucide-react';

const KeystoneMark: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
    <rect width="100" height="100" rx="22" fill="#4338ca" />
    <path d="M30 70 L50 25 L70 70 M38 55 L62 55" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const FEATURES = [
  {
    icon: <KanbanSquare size={20} />,
    title: 'Work Order Management',
    desc: 'Track every job from request to close-out with a full status history and audit trail.',
  },
  {
    icon: <Wrench size={20} />,
    title: 'Dispatch & Assignment',
    desc: 'Match the right technician to the right job based on skills, region, and current load.',
  },
  {
    icon: <MapPinned size={20} />,
    title: 'Technician Tracking',
    desc: 'See who is on the clock, on the road, or on a break, and what they are working on.',
  },
  {
    icon: <Gauge size={20} />,
    title: 'SLA Monitoring',
    desc: 'Live countdowns and breach alerts keyed to job priority, so nothing slips quietly.',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Dashboard Analytics',
    desc: 'Compliance rates, technician load, and cost roll-ups in one operational view.',
  },
  {
    icon: <MessageSquareText size={20} />,
    title: 'Customer Self-Service',
    desc: 'Customers raise requests and track progress themselves, without a phone call.',
  },
];

const DashboardPreview: React.FC = () => (
  <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-softer sm:p-5">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
      </div>
      <span className="text-[11px] font-medium text-slate-400">keystone.meridianfm.com</span>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-3">
      {[
        { label: 'Open', value: '128', color: 'text-indigo-600' },
        { label: 'SLA Compliance', value: '91%', color: 'text-emerald-600' },
        { label: 'Avg. Resolution', value: '6.4h', color: 'text-slate-700' },
      ].map((s) => (
        <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
          <p className={`mt-1 font-display text-lg font-semibold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
    <div className="mt-3 flex gap-2">
      {['New', 'Assigned', 'In Progress', 'On Hold'].map((col, i) => (
        <div key={col} className="flex-1 rounded-lg bg-slate-50 border border-slate-100 p-2">
          <p className="text-[10px] font-semibold text-slate-400 mb-1.5">{col}</p>
          <div className={`h-10 rounded-md ${i === 2 ? 'bg-indigo-100' : 'bg-white border border-slate-100'} mb-1.5`} />
          <div className="h-10 rounded-md bg-white border border-slate-100" />
        </div>
      ))}
    </div>
  </div>
);

export const LandingPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="#home" className="flex items-center gap-2.5">
            <KeystoneMark />
            <div>
              <p className="font-display text-base font-bold leading-tight text-slate-900">Keystone</p>
              <p className="text-[11px] leading-tight text-slate-400">Meridian Facilities Management</p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="btn-secondary">Log in</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </div>

          <button onClick={() => setMenuOpen((o) => !o)} className="rounded-lg p-2 text-slate-600 md:hidden" aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <Link to="/login" className="btn-secondary flex-1 justify-center">Log in</Link>
                <Link to="/register" className="btn-primary flex-1 justify-center">Register</Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 to-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              Field Service Management, built for facilities teams
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Every work order, technician, and SLA — in one keystone view.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
              Keystone gives Meridian Facilities Management a single system to dispatch technicians, track jobs against SLA
              targets, and give customers visibility into their own requests — without another spreadsheet.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/login" className="btn-primary px-5 py-2.5 text-sm">
                Get Started <ArrowRight size={16} />
              </Link>
              <a href="#features" className="btn-secondary px-5 py-2.5 text-sm">
                Explore Features
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              {['Role-based access', 'Live SLA countdowns', 'Audit-ready history'].map((item) => (
                <span key={item} className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> {item}</span>
              ))}
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Everything dispatch needs, nothing it doesn't</h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Built around the day-to-day of a facilities team: raise it, assign it, work it, close it — with SLA visibility the whole way through.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <div className="inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600">{f.icon}</div>
              <h3 className="mt-3 font-display text-base font-semibold text-slate-800">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Built for Meridian's facilities teams</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Keystone was designed around four roles that actually run a facilities operation — managers who need the
              compliance picture, dispatchers who need to move fast, technicians who need a clean mobile view in the field,
              and customers who just want to know their request is being handled.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Customer sites managed', value: '25+' },
              { label: 'Active technicians', value: '10' },
              { label: 'Avg. SLA compliance', value: '90%+' },
              { label: 'Work order categories', value: '8' },
            ].map((stat) => (
              <div key={stat.label} className="card p-4">
                <p className="font-display text-2xl font-bold text-indigo-600">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="rounded-2xl bg-indigo-950 px-6 py-10 text-center sm:px-12 sm:py-14">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Ready to bring your field operations into one system?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-200 sm:text-base">
            Sign in to preview Keystone as a Manager, Dispatcher, Technician, or Customer — the whole workflow, end to end.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn-primary bg-white px-5 py-2.5 text-sm text-indigo-700 hover:bg-indigo-50">
              Create an account <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary border-indigo-700 bg-transparent px-5 py-2.5 text-sm text-white hover:bg-indigo-900">
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5">
                <KeystoneMark size={26} />
                <p className="font-display text-sm font-bold text-slate-900">Keystone</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Field Service Management for Meridian Facilities Management. Built to keep every work order, technician, and SLA in view.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Quick links</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-500">
                <li><a href="#home" className="hover:text-indigo-600">Home</a></li>
                <li><a href="#features" className="hover:text-indigo-600">Features</a></li>
                <li><a href="#about" className="hover:text-indigo-600">About</a></li>
                <li><Link to="/login" className="hover:text-indigo-600">Log in</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Legal</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                <Mail size={14} /> support@meridianfm.com
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Meridian Facilities Management. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
