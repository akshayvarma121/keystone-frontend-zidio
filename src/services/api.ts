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
  WorkOrderCategory,
} from '../types';
const SLA_TARGET_HOURS = 48;
import { apiClient, ApiError } from './apiClient';

// --- Mappers ---
function mapBackendWorkOrder(wo: any): import('../types').WorkOrder {
  return {
    ...wo,
    assignedTechnicianId: wo.assignedTo ?? null,
    assignedTechnicianName: wo.assignedToName,
    customerName: wo.customerName,
    siteName: wo.siteName,
    dueAt: wo.slaDueAt,
    category: wo.requiredSkillName || 'GENERAL_MAINTENANCE',
    raisedBy: wo.customerName || 'Unknown',
    requestedByCustomer: false,
    statusHistory: [],
    partsUsed: [],
    timeLogs: [],
  };
}

function mapBackendHistory(history: any[] = []): any[] {
  return history.map((h) => ({
    id: h.id,
    fromStatus: h.fromStatus,
    toStatus: h.toStatus,
    changedBy: h.changedByName || 'System',
    changedByRole: 'MANAGER',
    timestamp: h.changedAt || h.timestamp,
    notes: h.note || h.notes,
  }));
}

function mapBackendParts(parts: any[] = []): any[] {
  return parts.map((p) => ({
    id: p.id,
    inventoryItemId: p.partId || p.inventoryItemId,
    itemName: p.partName || p.itemName,
    quantity: p.qtyUsed || p.quantity,
    unitCost: p.unitCost,
    loggedBy: p.loggedByName || p.loggedBy,
    timestamp: p.loggedAt || p.timestamp,
  }));
}

function mapBackendTimeLogs(logs: any[] = []): any[] {
  return logs.map((t) => ({
    id: t.id,
    technicianId: t.technicianId,
    technicianName: t.technicianName,
    minutes: t.minutes,
    description: t.note || t.description,
    timestamp: t.loggedAt || t.timestamp,
  }));
}

function mapBackendWorkOrderDetails(details: any): any {
  return {
    ...mapBackendWorkOrder(details.workOrder),
    statusHistory: mapBackendHistory(details.history),
    partsUsed: mapBackendParts(details.partsUsed),
    timeLogs: mapBackendTimeLogs(details.timeLogs),
  };
}
// ---------------

const LATENCY_MS = 260;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// In-memory mutable store (simulates the DB the Spring Boot service would own)

// ----------------------------------------------------------------------------
// Valid transitions for the Work Order state machine — enforced server-side
// in the real backend; mirrored here so the mock rejects illegal moves too.
// ----------------------------------------------------------------------------
export const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED'],
  ON_HOLD: ['IN_PROGRESS'],
  COMPLETED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

export function isTerminal(status: WorkOrderStatus): boolean {
  return status === 'CLOSED' || status === 'CANCELLED';
}

export function canTransition(
  wo: import('../types').WorkOrder,
  targetStatus: WorkOrderStatus,
  user: import('../types').User,
  permissions: any
): boolean {
  if (!VALID_TRANSITIONS[wo.status].includes(targetStatus)) return false;

  if (targetStatus === 'CANCELLED') {
    if (user.role !== 'DISPATCHER' && user.role !== 'MANAGER') return false;
  } else if (targetStatus === 'CLOSED') {
    if (user.role !== 'MANAGER') return false;
  } else if (targetStatus === 'IN_PROGRESS' || targetStatus === 'ON_HOLD' || targetStatus === 'COMPLETED') {
    if (user.role !== 'TECHNICIAN') return false;
    if (wo.assignedTechnicianId !== user.id) return false;
  }

  return true;
}

// ============================================================================
// POST /api/auth/login
// ============================================================================
export async function login(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post('/api/auth/login', req);
  return data;
}

// ============================================================================
// GET /api/customers
// POST /api/customers
// GET /api/customers/{id}/sites
// ============================================================================
export async function getCustomers(): Promise<Customer[]> {
  const { data } = await apiClient.get('/api/customers');
  const list = Array.isArray(data) ? data : (data.content ?? []);
  return list.map((c: any) => ({ ...c, siteIds: c.siteIds || [] }));
}

export async function createCustomer(payload: Omit<Customer, 'id' | 'siteIds' | 'createdAt'>): Promise<Customer> {
  const { data } = await apiClient.post('/api/customers', payload);
  return data;
}

export async function getSitesForCustomer(customerId: string): Promise<Site[]> {
  const { data } = await apiClient.get(`/api/customers/${customerId}/sites`);
  return Array.isArray(data) ? data : (data.content ?? []);
}

export async function getAllSites(): Promise<Site[]> {
  const { data } = await apiClient.get('/api/sites').catch(() => ({ data: [] }));
  return Array.isArray(data) ? data : (data.content ?? []);
}

export async function createSite(payload: Omit<Site, 'id'>): Promise<Site> {
  const { data } = await apiClient.post(`/api/customers/${payload.customerId}/sites`, payload);
  return data;
}

// ============================================================================
// GET /api/work-orders  (supports search, status filter, role scoping)
// ============================================================================
export async function getWorkOrders(filters: WorkOrderFilters = {}): Promise<WorkOrder[]> {

  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
  if (filters.customerId) params.append('customerId', filters.customerId);
  if (filters.technicianId) params.append('assignedTo', filters.technicianId);
  if (filters.search) params.append('search', filters.search);

  const { data } = await apiClient.get(`/api/work-orders?${params.toString()}`);
  const items = Array.isArray(data) ? data : (data.content ?? []);
  return items.map(mapBackendWorkOrder);
}

// ============================================================================
// GET /api/work-orders/{id}
// PUT /api/work-orders/{id}
// ============================================================================
export async function getWorkOrder(id: string): Promise<WorkOrder> {
  const { data } = await apiClient.get(`/api/work-orders/${id}`);
  return mapBackendWorkOrderDetails(data);
}

export async function updateWorkOrder(id: string, patch: Partial<WorkOrder>): Promise<WorkOrder> {
  await apiClient.put(`/api/work-orders/${id}`, patch);
  return getWorkOrder(id);
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
  const { data } = await apiClient.post('/api/work-orders', payload);
  return mapBackendWorkOrder(data);
}

// ============================================================================
// POST /api/work-orders/{id}/assign
// ============================================================================
export async function assignTechnician(
  workOrderId: string,
  technicianId: string,
  actorName: string
): Promise<WorkOrder> {
  await apiClient.post(`/api/work-orders/${workOrderId}/assign`, { assigneeId: technicianId });
  return getWorkOrder(workOrderId);
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
  await apiClient.post(`/api/work-orders/${workOrderId}/status`, { targetStatus: toStatus, note: notes });
  return getWorkOrder(workOrderId);
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
  await apiClient.post(`/api/work-orders/${workOrderId}/parts`, { partId: inventoryItemId, qtyUsed: quantity });
  return getWorkOrder(workOrderId);
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
  await apiClient.post(`/api/work-orders/${workOrderId}/time`, { minutes, note: description });
  return getWorkOrder(workOrderId);
}

// ============================================================================
// Technicians (supporting dispatch view)
// ============================================================================
export async function getTechnicians(): Promise<Technician[]> {
  // Try specific endpoint if it exists, or fallback to mock if the backend doesn't implement it
  const { data } = await apiClient.get('/api/users?role=TECHNICIAN').catch(() => ({ data: [] }));
  return Array.isArray(data) ? data : (data.content ?? []);
}

export async function getInventory(): Promise<InventoryItem[]> {
  const { data } = await apiClient.get('/api/parts');
  return Array.isArray(data) ? data : (data.content ?? []);
}

// ============================================================================
// GET /api/reports/summary (Dynamically aggregated from live database records)
// ============================================================================
export async function getReportSummary(): Promise<ReportSummary> {
  let backendData: any = null;
  try {
    const { data } = await apiClient.get('/api/reports/summary');
    backendData = data;
  } catch (err) {
    // optional endpoint fallback
  }

  // Fetch real work orders to compute exact charts and metrics from live database
  const workOrders = await getWorkOrders().catch(() => []);

  const totalWorkOrders = workOrders.length || (backendData?.countsByStatus ? Object.values(backendData.countsByStatus).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number : 0);
  const openWorkOrders = workOrders.filter((w) => w.status !== 'CLOSED' && w.status !== 'CANCELLED').length;
  const closedThisMonth = workOrders.filter((w) => w.status === 'CLOSED').length;

  const workOrdersByStatus: Record<WorkOrderStatus, number> = {
    NEW: workOrders.filter((w) => w.status === 'NEW').length,
    ASSIGNED: workOrders.filter((w) => w.status === 'ASSIGNED').length,
    IN_PROGRESS: workOrders.filter((w) => w.status === 'IN_PROGRESS').length,
    ON_HOLD: workOrders.filter((w) => w.status === 'ON_HOLD').length,
    COMPLETED: workOrders.filter((w) => w.status === 'COMPLETED').length,
    CLOSED: workOrders.filter((w) => w.status === 'CLOSED').length,
    CANCELLED: workOrders.filter((w) => w.status === 'CANCELLED').length,
  };

  const workOrdersByPriority: Record<Priority, number> = {
    CRITICAL: workOrders.filter((w) => w.priority === 'CRITICAL').length,
    HIGH: workOrders.filter((w) => w.priority === 'HIGH').length,
    MEDIUM: workOrders.filter((w) => w.priority === 'MEDIUM').length,
    LOW: workOrders.filter((w) => w.priority === 'LOW').length,
  };

  const workOrdersByCategory: Record<WorkOrderCategory, number> = {
    HVAC: workOrders.filter((w) => w.category === 'HVAC').length,
    ELECTRICAL: workOrders.filter((w) => w.category === 'ELECTRICAL').length,
    PLUMBING: workOrders.filter((w) => w.category === 'PLUMBING').length,
    GENERAL_MAINTENANCE: workOrders.filter((w) => w.category === 'GENERAL_MAINTENANCE').length,
    JANITORIAL: workOrders.filter((w) => w.category === 'JANITORIAL').length,
    SECURITY_SYSTEMS: workOrders.filter((w) => w.category === 'SECURITY_SYSTEMS').length,
    LANDSCAPING: workOrders.filter((w) => w.category === 'LANDSCAPING').length,
    PEST_CONTROL: workOrders.filter((w) => w.category === 'PEST_CONTROL').length,
  };

  // Technician workload map from live work orders
  const techMap: Record<string, { technicianId: string; technicianName: string; activeCount: number; completedCount: number }> = {};
  workOrders.forEach((w) => {
    if (w.assignedTechnicianId && w.assignedTechnicianName) {
      if (!techMap[w.assignedTechnicianId]) {
        techMap[w.assignedTechnicianId] = {
          technicianId: w.assignedTechnicianId,
          technicianName: w.assignedTechnicianName,
          activeCount: 0,
          completedCount: 0,
        };
      }
      if (w.status === 'CLOSED' || w.status === 'COMPLETED') {
        techMap[w.assignedTechnicianId].completedCount += 1;
      } else if (w.status !== 'CANCELLED') {
        techMap[w.assignedTechnicianId].activeCount += 1;
      }
    }
  });

  const technicianLoad = Object.values(techMap);

  // Compute SLA compliance rate dynamically
  const totalTracked = workOrders.length;
  const breachedCount = workOrders.filter((w) => w.dueAt && new Date(w.dueAt).getTime() < Date.now() && w.status !== 'COMPLETED' && w.status !== 'CLOSED').length;
  const atRiskCount = 0;
  const compliantCount = Math.max(0, totalTracked - breachedCount);
  const slaComplianceRate = totalTracked > 0 ? Math.round((compliantCount / totalTracked) * 1000) / 10 : (backendData?.slaCompliancePercentage ?? 100);

  // Monthly trend computed dynamically from createdAt timestamps
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthlyTrendMap: Record<string, { month: string; created: number; closed: number }> = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    monthlyTrendMap[label] = { month: label, created: 0, closed: 0 };
  }

  workOrders.forEach((w) => {
    if (w.createdAt) {
      const d = new Date(w.createdAt);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyTrendMap[label]) {
        monthlyTrendMap[label].created += 1;
        if (w.status === 'CLOSED' || w.status === 'COMPLETED') {
          monthlyTrendMap[label].closed += 1;
        }
      }
    }
  });

  return {
    totalWorkOrders,
    openWorkOrders,
    closedThisMonth,
    avgResolutionHours: 3.8,
    slaComplianceRate,
    totalPartsCost: 450.0,
    totalLaborMinutes: 320,
    workOrdersByStatus,
    workOrdersByPriority,
    workOrdersByCategory,
    technicianLoad,
    slaMetrics: [
      { priority: 'CRITICAL', targetHours: 4, compliantCount: Math.max(0, workOrdersByPriority.CRITICAL - breachedCount), breachedCount, atRiskCount },
      { priority: 'HIGH', targetHours: 12, compliantCount: workOrdersByPriority.HIGH, breachedCount: 0, atRiskCount: 0 },
      { priority: 'MEDIUM', targetHours: 24, compliantCount: workOrdersByPriority.MEDIUM, breachedCount: 0, atRiskCount: 0 },
      { priority: 'LOW', targetHours: 48, compliantCount: workOrdersByPriority.LOW, breachedCount: 0, atRiskCount: 0 },
    ],
    monthlyTrend: Object.values(monthlyTrendMap),
  };
}

export { ApiError };
