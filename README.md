# Keystone — Field Service Management Platform

A portfolio-worthy enterprise SaaS frontend for **Meridian Facilities Management**, built with React 19, TypeScript, Vite, and TailwindCSS.

## Stack

- React 19 + TypeScript + Vite
- React Router 6 for routing (public landing/auth pages + protected app shell)
- TailwindCSS (Deep Indigo / Slate theme, dark & light mode)
- TanStack React Query for server-state, Context API for auth/theme
- HTML5 native drag-and-drop for the Kanban board
- Recharts for analytics
- React Hook Form + Zod for validated forms
- Lucide React icons

## Getting started

```bash
npm install
npm run dev
```

> Some libraries (e.g. Recharts) haven't published React 19 peer-dependency ranges yet. If `npm install` reports a peer conflict, rerun with `npm install --legacy-peer-deps`.

The app now opens on a public **landing page** at `/`. Sign in at `/login` with any of the demo emails listed on that page (any password works) to land in the app at `/app`, or register a new preview account at `/register` by picking a role. Once inside, use the role switcher in the top bar to preview the Dispatcher, Technician, and Customer experiences — all four roles run against the same in-memory mock dataset (`src/mock/data.ts`), so actions taken in one role (assigning a technician, raising a ticket, moving a card) are visible from the others.

## Routing

| Route      | Access                | Renders |
|------------|------------------------|---------|
| `/`        | Public                | `LandingPage` — navbar, hero, features, footer |
| `/login`   | Public                | `LoginPage` — email/password, remember me, forgot password |
| `/register`| Public                | `RegisterPage` — name, email, phone, password, role selection |
| `/app`     | Requires sign-in      | `AppShell` — topbar + role-scoped sidebar + active module |
| `*`        | —                     | Redirects to `/` |

`RequireAuth` guards `/app` and bounces anonymous visitors to `/login`, preserving the originally-requested path in navigation state. Inside `/app`, module switching is a fast in-app tab change (not a route change) — but every module is still checked against the signed-in role's allowed-view list (`isViewAllowed` in `Sidebar.tsx`) before it renders, falling back to an inline **403 — Access Denied** screen if a view isn't permitted for that role.

## Role-Based Access Control

Module visibility is enforced from one source of truth (`NAV_BY_ROLE` in `src/components/common/Sidebar.tsx`):

- **Manager / Admin** — full access: Dashboard, Work Orders, Dispatch, Customers & Sites, Reports, Settings, Profile.
- **Dispatcher** — Dashboard, Work Orders, Dispatch, Customers & Sites, Profile. No Reports, Settings, or user management.
- **Technician** — My Jobs (assigned work only), Profile. Mobile-first layout.
- **Customer** — Service Requests (their own work orders only), Profile.

Data scoping (a technician only sees jobs assigned to them, a customer only sees their own tickets) is enforced in the mock API layer via `getWorkOrders({ role, scopedUserId })`, not just hidden in the UI.

## Work Orders status tabs

The Work Orders view (`KanbanBoard.tsx`) now leads with a segmented `StatusTabs` bar — New, Assigned, In Progress, On Hold, Completed, Closed, Cancelled, each with a live count. Selecting **All** shows the existing multi-column Kanban board; selecting any other status filters the same list in place to a single-status card grid, with no route change and a soft fade transition.

## Architecture

All data flows through `src/services/api.ts`, a mock client shaped exactly like the target Spring Boot REST contract (`/api/auth/login`, `/api/work-orders`, `/api/work-orders/{id}/assign`, `/api/work-orders/{id}/status`, `/api/work-orders/{id}/parts`, `/api/work-orders/{id}/time`, `/api/reports/summary`, etc.). Swapping the mock for a real backend means replacing the function bodies in that one file with `axios` calls to the same paths — no component changes required.

The work order state machine (`NEW → ASSIGNED → IN_PROGRESS → COMPLETED → CLOSED`, with `ON_HOLD` and `CANCELLED` branches) is enforced centrally in `VALID_TRANSITIONS` inside `api.ts`, and re-checked in the UI before rendering transition buttons.

## Project structure

```
src/
  types/          Strict domain interfaces
  mock/           Deterministic mock data generator (15 customers, 27+ sites, 46 work orders, 10 technicians)
  services/       Mock API client (Spring Boot-shaped)
  context/        AuthContext (session, role/permissions) and ThemeContext (dark mode)
  routes/         RequireAuth route guard
  pages/          LandingPage, LoginPage, RegisterPage, ForbiddenPage, ProfilePage
  components/
    common/       Topbar, Sidebar (RBAC source of truth), badges, Modal, Tabs, StatCard, DataTable
    dashboard/    Manager analytics
    workorders/   Kanban board + status tabs + detail modal + create-request form
    dispatch/     Technician availability + assignment
    technician/   Mobile-first technician view
    customer/     Customer self-service portal
    customers/    Customer & site CRUD
    reports/      Filterable performance reports
```

