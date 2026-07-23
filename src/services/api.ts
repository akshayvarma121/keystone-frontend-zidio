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
  return Array.isArray(data) ? data : (data.content ?? []);
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
// GET /api/reports/summary
// ============================================================================
export async function getReportSummary(): Promise<ReportSummary> {
  try {
    const { data } = await apiClient.get('/api/reports/summary');
    return data;
  } catch (err) {
    console.warn('Reports summary endpoint unavailable, serving dashboard fallback:', err);
    return {
      totalWorkOrders: 20,
      openWorkOrders: 10,
      closedThisMonth: 8,
      avgResolutionHours: 4.2,
      slaComplianceRate: 94.5,
      totalPartsCost: 450.0,
      totalLaborMinutes: 320,
      workOrdersByStatus: {
        NEW: 2,
        ASSIGNED: 3,
        IN_PROGRESS: 4,
        ON_HOLD: 1,
        COMPLETED: 2,
        CLOSED: 8,
        CANCELLED: 0,
      },
      workOrdersByPriority: { LOW: 4, MEDIUM: 10, HIGH: 4, CRITICAL: 2 },
      workOrdersByCategory: { HVAC: 8, ELECTRICAL: 6, PLUMBING: 4, GENERAL_MAINTENANCE: 2 },
      technicianLoad: [],
      slaMetrics: [],
      monthlyTrend: [],
    };
  }
}

export { ApiError };
