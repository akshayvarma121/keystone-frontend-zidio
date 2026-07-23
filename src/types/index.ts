// ============================================================================
// KEYSTONE — Field Service Management Platform
// Domain model / strict TypeScript interfaces
// ============================================================================

export type Role = 'MANAGER' | 'DISPATCHER' | 'TECHNICIAN' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  phone?: string;
  // Present only when role === 'TECHNICIAN'
  technicianId?: string;
  // Present only when role === 'CUSTOMER'
  customerId?: string;
}

// ----------------------------------------------------------------------------
// Customers & Sites
// ----------------------------------------------------------------------------

export interface Customer {
  id: string;
  name: string;
  accountManager: string;
  tier: 'STANDARD' | 'PRIORITY' | 'ENTERPRISE';
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  siteIds: string[];
  createdAt: string;
}

export interface Site {
  id: string;
  customerId: string;
  name: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  contactName: string;
  contactPhone: string;
  squareFootage: number;
  siteType: 'OFFICE' | 'RETAIL' | 'WAREHOUSE' | 'RESIDENTIAL' | 'INDUSTRIAL' | 'HEALTHCARE';
}

// ----------------------------------------------------------------------------
// Technicians
// ----------------------------------------------------------------------------

export type TechnicianStatus = 'AVAILABLE' | 'ON_JOB' | 'OFF_DUTY' | 'ON_BREAK';

export interface Technician {
  id: string;
  name: string;
  avatarColor: string;
  skills: string[];
  status: TechnicianStatus;
  phone: string;
  activeWorkOrderIds: string[];
  rating: number; // 0-5
  region: string;
}

// ----------------------------------------------------------------------------
// Work Orders / State Machine
// ----------------------------------------------------------------------------

export type WorkOrderStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type WorkOrderCategory =
  | 'HVAC'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'GENERAL_MAINTENANCE'
  | 'JANITORIAL'
  | 'SECURITY_SYSTEMS'
  | 'LANDSCAPING'
  | 'PEST_CONTROL';

export interface StatusHistory {
  id: string;
  fromStatus: WorkOrderStatus | null;
  toStatus: WorkOrderStatus;
  changedBy: string; // user name
  changedByRole: Role;
  timestamp: string;
  notes?: string;
}

export interface PartUsage {
  id: string;
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  loggedBy: string;
  timestamp: string;
}

export interface TimeLog {
  id: string;
  technicianId: string;
  technicianName: string;
  minutes: number;
  description: string;
  timestamp: string;
}

export interface WorkOrder {
  id: string;
  code: string; // human friendly e.g. WO-1042
  title: string;
  description: string;
  category: WorkOrderCategory;
  customerId: string;
  siteId: string;
  status: WorkOrderStatus;
  priority: Priority;
  assignedTechnicianId: string | null;
  createdAt: string;
  updatedAt: string;
  dueAt: string; // SLA deadline
  completedAt?: string;
  closedAt?: string;
  statusHistory: StatusHistory[];
  partsUsed: PartUsage[];
  timeLogs: TimeLog[];
  raisedBy: string; // customer contact name or user name
  requestedByCustomer: boolean;
}

// ----------------------------------------------------------------------------
// Inventory (for parts logging)
// ----------------------------------------------------------------------------

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  unitCost: number;
  quantityOnHand: number;
  category: WorkOrderCategory;
}

// ----------------------------------------------------------------------------
// SLA
// ----------------------------------------------------------------------------

export interface SLAMetric {
  priority: Priority;
  targetHours: number;
  compliantCount: number;
  breachedCount: number;
  atRiskCount: number;
}

export type SLAState = 'ON_TRACK' | 'AT_RISK' | 'OVERDUE' | 'PAUSED' | 'MET' | 'NA';

// ----------------------------------------------------------------------------
// Reports
// ----------------------------------------------------------------------------

export interface ReportSummary {
  totalWorkOrders: number;
  openWorkOrders: number;
  closedThisMonth: number;
  avgResolutionHours: number;
  slaComplianceRate: number; // 0-100
  totalPartsCost: number;
  totalLaborMinutes: number;
  workOrdersByStatus: Record<WorkOrderStatus, number>;
  workOrdersByPriority: Record<Priority, number>;
  workOrdersByCategory: Record<string, number>;
  technicianLoad: { technicianId: string; technicianName: string; activeCount: number; completedCount: number }[];
  slaMetrics: SLAMetric[];
  monthlyTrend: { month: string; created: number; closed: number }[];
}

// ----------------------------------------------------------------------------
// API envelopes
// ----------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface WorkOrderFilters {
  search?: string;
  status?: WorkOrderStatus | 'ALL';
  priority?: Priority | 'ALL';
  customerId?: string;
  technicianId?: string;
  role?: Role;
  scopedUserId?: string;
}
