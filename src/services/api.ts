// ============================================================================
// KEYSTONE — API Service Layer
// Mirrors the target Spring Boot REST contract. Every function below is
// shaped like an HTTP call (method + path documented) and resolves against
// an in-memory mock store so the UI can be swapped to a real backend by
// replacing the function bodies with axios calls to the same paths.
// ============================================================================

import type {
  Customer,
  Site,
  Technician,
  WorkOrder,
  WorkOrderStatus,
  WorkOrderFilters,
  PartUsage,
  TimeLog,
  StatusHistory,
  ReportSummary,
  LoginRequest,
  LoginResponse,
  Role,
  InventoryItem,
  SLAMetric,
  Priority,
} from '../types';
import {
  customers as mockCustomers,
  sites as mockSites,
  technicians as mockTechnicians,
  workOrders as mockWorkOrders,
  inventory as mockInventory,
  demoUsers,
  SLA_TARGET_HOURS,
} from '../mock/data';

const LATENCY_MS = 260;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// In-memory mutable store (simulates the DB the Spring Boot service would own)
const store = {
  customers: mockCustomers,
  sites: mockSites,
  technicians: mockTechnicians,
  workOrders: mockWorkOrders,
  inventory: mockInventory,
};

// ----------------------------------------------------------------------------
// Valid transitions for the Work Order state machine — enforced server-side
// in the real backend; mirrored here so the mock rejects illegal moves too.
// ----------------------------------------------------------------------------
export const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED', 'NEW'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
  CANCELLED: [],
};

export function isTerminal(status: WorkOrderStatus): boolean {
  return status === 'CLOSED' || status === 'CANCELLED';
}

// ============================================================================
// POST /api/auth/login
// ============================================================================
export async function login(req: LoginRequest): Promise<LoginResponse> {
  const user = demoUsers.find((u) => u.role === req.role) ?? demoUsers[0];
  return delay({
    token: `mock-jwt-${user.id}-${Date.now()}`,
    user,
  });
}

// ============================================================================
// GET /api/customers
// POST /api/customers
// GET /api/customers/{id}/sites
// ============================================================================
export async function getCustomers(): Promise<Customer[]> {
  return delay([...store.customers]);
}

export async function createCustomer(payload: Omit<Customer, 'id' | 'siteIds' | 'createdAt'>): Promise<Customer> {
  const newCustomer: Customer = {
    ...payload,
    id: `CUST-${String(store.customers.length + 1).padStart(4, '0')}`,
    siteIds: [],
    createdAt: new Date().toISOString(),
  };
  store.customers = [newCustomer, ...store.customers];
  return delay(newCustomer);
}

export async function getSitesForCustomer(customerId: string): Promise<Site[]> {
  return delay(store.sites.filter((s) => s.customerId === customerId));
}

export async function getAllSites(): Promise<Site[]> {
  return delay([...store.sites]);
}

export async function createSite(payload: Omit<Site, 'id'>): Promise<Site> {
  const newSite: Site = { ...payload, id: `SITE-${String(store.sites.length + 1).padStart(4, '0')}` };
  store.sites = [newSite, ...store.sites];
  const cust = store.customers.find((c) => c.id === payload.customerId);
  if (cust) cust.siteIds.push(newSite.id);
  return delay(newSite);
}

// ============================================================================
// GET /api/work-orders  (supports search, status filter, role scoping)
// ============================================================================
export async function getWorkOrders(filters: WorkOrderFilters = {}): Promise<WorkOrder[]> {
  let results = [...store.workOrders];

  if (filters.role === 'TECHNICIAN' && filters.scopedUserId) {
    results = results.filter((wo) => wo.assignedTechnicianId === filters.scopedUserId);
  }
  if (filters.role === 'CUSTOMER' && filters.scopedUserId) {
    results = results.filter((wo) => wo.customerId === filters.scopedUserId);
  }
  if (filters.customerId) {
    results = results.filter((wo) => wo.customerId === filters.customerId);
  }
  if (filters.technicianId) {
    results = results.filter((wo) => wo.assignedTechnicianId === filters.technicianId);
  }
  if (filters.status && filters.status !== 'ALL') {
    results = results.filter((wo) => wo.status === filters.status);
  }
  if (filters.priority && filters.priority !== 'ALL') {
    results = results.filter((wo) => wo.priority === filters.priority);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (wo) =>
        wo.title.toLowerCase().includes(q) ||
        wo.code.toLowerCase().includes(q) ||
        wo.description.toLowerCase().includes(q)
    );
  }

  results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return delay(results);
}

// ============================================================================
// GET /api/work-orders/{id}
// PUT /api/work-orders/{id}
// ============================================================================
export async function getWorkOrder(id: string): Promise<WorkOrder> {
  const wo = store.workOrders.find((w) => w.id === id);
  if (!wo) throw new ApiError('Work order not found', 404);
  return delay(wo);
}

export async function updateWorkOrder(id: string, patch: Partial<WorkOrder>): Promise<WorkOrder> {
  const idx = store.workOrders.findIndex((w) => w.id === id);
  if (idx === -1) throw new ApiError('Work order not found', 404);
  if (isTerminal(store.workOrders[idx].status)) {
    throw new ApiError('Cannot modify a work order in a terminal state', 409);
  }
  const updated = { ...store.workOrders[idx], ...patch, updatedAt: new Date().toISOString() };
  store.workOrders[idx] = updated;
  return delay(updated);
}

export async function createWorkOrder(payload: {
  title: string;
  description: string;
  category: WorkOrder['category'];
  customerId: string;
  siteId: string;
  priority: Priority;
  raisedBy: string;
  requestedByCustomer: boolean;
  actorName: string;
  actorRole: Role;
}): Promise<WorkOrder> {
  const now = new Date().toISOString();
  const targetHours = SLA_TARGET_HOURS[payload.priority];
  const dueAt = new Date(Date.now() + targetHours * 3600 * 1000).toISOString();
  const history: StatusHistory[] = [
    {
      id: `SH-new-${Date.now()}`,
      fromStatus: null,
      toStatus: 'NEW',
      changedBy: payload.actorName,
      changedByRole: payload.actorRole,
      timestamp: now,
      notes: payload.requestedByCustomer ? 'Submitted via customer portal.' : 'Created by dispatch.',
    },
  ];
  const wo: WorkOrder = {
    id: `WO-${1000 + store.workOrders.length + 1}`,
    code: `WO-${1000 + store.workOrders.length + 1}`,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    customerId: payload.customerId,
    siteId: payload.siteId,
    status: 'NEW',
    priority: payload.priority,
    assignedTechnicianId: null,
    createdAt: now,
    updatedAt: now,
    dueAt,
    statusHistory: history,
    partsUsed: [],
    timeLogs: [],
    raisedBy: payload.raisedBy,
    requestedByCustomer: payload.requestedByCustomer,
  };
  store.workOrders = [wo, ...store.workOrders];
  return delay(wo);
}

// ============================================================================
// POST /api/work-orders/{id}/assign
// ============================================================================
export async function assignTechnician(
  workOrderId: string,
  technicianId: string,
  actorName: string
): Promise<WorkOrder> {
  const wo = store.workOrders.find((w) => w.id === workOrderId);
  if (!wo) throw new ApiError('Work order not found', 404);
  if (isTerminal(wo.status)) throw new ApiError('Cannot assign a closed or cancelled work order', 409);

  const tech = store.technicians.find((t) => t.id === technicianId);
  if (!tech) throw new ApiError('Technician not found', 404);

  const previousTechId = wo.assignedTechnicianId;
  wo.assignedTechnicianId = technicianId;
  const nextStatus: WorkOrderStatus = wo.status === 'NEW' ? 'ASSIGNED' : wo.status;
  const historyEntry: StatusHistory = {
    id: `SH-assign-${Date.now()}`,
    fromStatus: wo.status,
    toStatus: nextStatus,
    changedBy: actorName,
    changedByRole: 'DISPATCHER',
    timestamp: new Date().toISOString(),
    notes: `Reassigned to ${tech.name}.`,
  };
  wo.status = nextStatus;
  wo.statusHistory = [...wo.statusHistory, historyEntry];
  wo.updatedAt = historyEntry.timestamp;

  if (previousTechId) {
    const prevTech = store.technicians.find((t) => t.id === previousTechId);
    if (prevTech) prevTech.activeWorkOrderIds = prevTech.activeWorkOrderIds.filter((id) => id !== workOrderId);
  }
  if (!tech.activeWorkOrderIds.includes(workOrderId)) {
    tech.activeWorkOrderIds.push(workOrderId);
  }

  return delay(wo);
}

// ============================================================================
// POST /api/work-orders/{id}/status
// ============================================================================
export async function transitionStatus(
  workOrderId: string,
  toStatus: WorkOrderStatus,
  actorName: string,
  actorRole: Role,
  notes?: string
): Promise<WorkOrder> {
  const wo = store.workOrders.find((w) => w.id === workOrderId);
  if (!wo) throw new ApiError('Work order not found', 404);
  if (isTerminal(wo.status)) {
    throw new ApiError(`Work order ${wo.code} is in a terminal state and cannot be changed.`, 409);
  }
  const allowed = VALID_TRANSITIONS[wo.status];
  if (!allowed.includes(toStatus)) {
    throw new ApiError(`Cannot move from ${wo.status} to ${toStatus}.`, 422);
  }

  const now = new Date().toISOString();
  const historyEntry: StatusHistory = {
    id: `SH-${Date.now()}`,
    fromStatus: wo.status,
    toStatus,
    changedBy: actorName,
    changedByRole: actorRole,
    timestamp: now,
    notes,
  };

  wo.status = toStatus;
  wo.statusHistory = [...wo.statusHistory, historyEntry];
  wo.updatedAt = now;
  if (toStatus === 'COMPLETED') wo.completedAt = now;
  if (toStatus === 'CLOSED') wo.closedAt = now;

  if ((toStatus === 'CLOSED' || toStatus === 'CANCELLED') && wo.assignedTechnicianId) {
    const tech = store.technicians.find((t) => t.id === wo.assignedTechnicianId);
    if (tech) tech.activeWorkOrderIds = tech.activeWorkOrderIds.filter((id) => id !== workOrderId);
  }

  return delay(wo);
}

// ============================================================================
// POST /api/work-orders/{id}/parts   (transactional stock usage)
// ============================================================================
export async function logPartUsage(
  workOrderId: string,
  inventoryItemId: string,
  quantity: number,
  loggedBy: string
): Promise<WorkOrder> {
  const wo = store.workOrders.find((w) => w.id === workOrderId);
  if (!wo) throw new ApiError('Work order not found', 404);
  if (isTerminal(wo.status)) throw new ApiError('Cannot log parts on a closed or cancelled work order', 409);

  const item = store.inventory.find((i) => i.id === inventoryItemId);
  if (!item) throw new ApiError('Inventory item not found', 404);
  if (item.quantityOnHand < quantity) {
    throw new ApiError(`Insufficient stock for ${item.name}. Only ${item.quantityOnHand} on hand.`, 409);
  }

  // Transactional decrement
  item.quantityOnHand -= quantity;

  const usage: PartUsage = {
    id: `PU-${Date.now()}`,
    inventoryItemId: item.id,
    itemName: item.name,
    quantity,
    unitCost: item.unitCost,
    loggedBy,
    timestamp: new Date().toISOString(),
  };
  wo.partsUsed = [...wo.partsUsed, usage];
  wo.updatedAt = usage.timestamp;

  return delay(wo);
}

// ============================================================================
// POST /api/work-orders/{id}/time
// ============================================================================
export async function logTime(
  workOrderId: string,
  technicianId: string,
  technicianName: string,
  minutes: number,
  description: string
): Promise<WorkOrder> {
  const wo = store.workOrders.find((w) => w.id === workOrderId);
  if (!wo) throw new ApiError('Work order not found', 404);
  if (isTerminal(wo.status)) throw new ApiError('Cannot log time on a closed or cancelled work order', 409);

  const log: TimeLog = {
    id: `TL-${Date.now()}`,
    technicianId,
    technicianName,
    minutes,
    description,
    timestamp: new Date().toISOString(),
  };
  wo.timeLogs = [...wo.timeLogs, log];
  wo.updatedAt = log.timestamp;

  return delay(wo);
}

// ============================================================================
// Technicians (supporting dispatch view)
// ============================================================================
export async function getTechnicians(): Promise<Technician[]> {
  return delay([...store.technicians]);
}

export async function getInventory(): Promise<InventoryItem[]> {
  return delay([...store.inventory]);
}

// ============================================================================
// GET /api/reports/summary
// ============================================================================
export async function getReportSummary(): Promise<ReportSummary> {
  const wos = store.workOrders;
  const now = Date.now();

  const workOrdersByStatus = wos.reduce((acc, wo) => {
    acc[wo.status] = (acc[wo.status] ?? 0) + 1;
    return acc;
  }, {} as Record<WorkOrderStatus, number>);

  const workOrdersByPriority = wos.reduce((acc, wo) => {
    acc[wo.priority] = (acc[wo.priority] ?? 0) + 1;
    return acc;
  }, {} as Record<Priority, number>);

  const workOrdersByCategory = wos.reduce((acc, wo) => {
    acc[wo.category] = (acc[wo.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const closed = wos.filter((w) => w.status === 'CLOSED' && w.closedAt);
  const avgResolutionHours =
    closed.length > 0
      ? closed.reduce((sum, w) => sum + (new Date(w.closedAt!).getTime() - new Date(w.createdAt).getTime()) / 3600000, 0) /
        closed.length
      : 0;

  const totalPartsCost = wos.reduce(
    (sum, w) => sum + w.partsUsed.reduce((s, p) => s + p.unitCost * p.quantity, 0),
    0
  );
  const totalLaborMinutes = wos.reduce((sum, w) => sum + w.timeLogs.reduce((s, t) => s + t.minutes, 0), 0);

  const priorities: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const slaMetrics: SLAMetric[] = priorities.map((priority) => {
    const relevant = wos.filter((w) => w.priority === priority);
    let compliant = 0,
      breached = 0,
      atRisk = 0;
    relevant.forEach((w) => {
      const due = new Date(w.dueAt).getTime();
      if (w.status === 'CLOSED' || w.status === 'COMPLETED') {
        const finished = new Date(w.completedAt ?? w.updatedAt).getTime();
        if (finished <= due) compliant++;
        else breached++;
      } else if (w.status === 'CANCELLED') {
        // excluded from SLA counts
      } else {
        if (now > due) breached++;
        else if (due - now < SLA_TARGET_HOURS[priority] * 0.25 * 3600 * 1000) atRisk++;
        else compliant++;
      }
    });
    return { priority, targetHours: SLA_TARGET_HOURS[priority], compliantCount: compliant, breachedCount: breached, atRiskCount: atRisk };
  });

  const totalSlaTracked = slaMetrics.reduce((s, m) => s + m.compliantCount + m.breachedCount + m.atRiskCount, 0);
  const totalCompliant = slaMetrics.reduce((s, m) => s + m.compliantCount, 0);
  const slaComplianceRate = totalSlaTracked > 0 ? Math.round((totalCompliant / totalSlaTracked) * 100) : 100;

  const technicianLoad = store.technicians.map((t) => ({
    technicianId: t.id,
    technicianName: t.name,
    activeCount: wos.filter((w) => w.assignedTechnicianId === t.id && !isTerminal(w.status)).length,
    completedCount: wos.filter((w) => w.assignedTechnicianId === t.id && (w.status === 'CLOSED' || w.status === 'COMPLETED')).length,
  }));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrend = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = monthNames[d.getMonth()];
    const created = wos.filter((w) => {
      const c = new Date(w.createdAt);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    }).length;
    const closedCount = wos.filter((w) => {
      if (!w.closedAt) return false;
      const c = new Date(w.closedAt);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    }).length;
    return { month: label, created, closed: closedCount };
  });

  const summary: ReportSummary = {
    totalWorkOrders: wos.length,
    openWorkOrders: wos.filter((w) => !isTerminal(w.status)).length,
    closedThisMonth: wos.filter((w) => {
      if (!w.closedAt) return false;
      const c = new Date(w.closedAt);
      const n = new Date();
      return c.getMonth() === n.getMonth() && c.getFullYear() === n.getFullYear();
    }).length,
    avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
    slaComplianceRate,
    totalPartsCost: Math.round(totalPartsCost * 100) / 100,
    totalLaborMinutes,
    workOrdersByStatus,
    workOrdersByPriority,
    workOrdersByCategory,
    technicianLoad,
    slaMetrics,
    monthlyTrend,
  };

  return delay(summary);
}

export { ApiError };
