import type {
  Customer,
  Site,
  Technician,
  WorkOrder,
  WorkOrderStatus,
  Priority,
  WorkOrderCategory,
  InventoryItem,
  StatusHistory,
  PartUsage,
  TimeLog,
  User,
} from '../types';

// ----------------------------------------------------------------------------
// Deterministic pseudo-random helper so the demo dataset is stable across
// reloads within a session but still looks organically varied.
// ----------------------------------------------------------------------------
let seed = 42;
function rand(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function uid(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, '0')}`;
}
function daysAgoIso(days: number, hourOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hourOffset);
  return d.toISOString();
}
function hoursFromNowIso(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

const AVATAR_COLORS = ['#4338ca', '#0891b2', '#b45309', '#be185d', '#15803d', '#7c3aed', '#c2410c', '#0f766e'];

// ----------------------------------------------------------------------------
// Customers
// ----------------------------------------------------------------------------

const CUSTOMER_NAMES = [
  'Harborview Medical Group', 'Cascade Retail Holdings', 'Northwind Logistics',
  'Silverline Office Partners', 'BrightPath Schools Trust', 'Meridian Tower Management',
  'Coastal Grocery Co-op', 'Union Square Residences', 'Vantage Data Centers',
  'Crestview Hospitality Group', 'Ashford Industrial Park', 'Pinnacle Fitness Clubs',
  'Lakeside Senior Living', 'Delta Manufacturing Corp', 'Riverside Banking Group',
  'Summit Auto Dealerships', 'Greenfield Agribusiness', 'Central Civic Center',
];

const managers = ['Dana Cho', 'Marcus Ibe', 'Priya Anand', 'Sofia Reyes', 'Tom Whitfield'];

export const customers: Customer[] = CUSTOMER_NAMES.map((name, i) => ({
  id: uid('CUST', i + 1),
  name,
  accountManager: pick(managers),
  tier: pick(['STANDARD', 'STANDARD', 'PRIORITY', 'ENTERPRISE'] as const),
  contactName: pick(['Alex Turner', 'Jamie Lin', 'Morgan Blake', 'Casey Nolan', 'Robin Cruz', 'Jordan Price']),
  contactEmail: `contact${i + 1}@${name.split(' ')[0].toLowerCase()}.com`,
  contactPhone: `(${randInt(200, 999)}) 555-${String(randInt(1000, 9999))}`,
  siteIds: [],
  createdAt: daysAgoIso(randInt(120, 900)),
}));

// ----------------------------------------------------------------------------
// Sites — at least 25, distributed across customers
// ----------------------------------------------------------------------------

const CITY_STATE = [
  ['Portland', 'OR'], ['Seattle', 'WA'], ['Denver', 'CO'], ['Austin', 'TX'],
  ['Raleigh', 'NC'], ['Columbus', 'OH'], ['Sacramento', 'CA'], ['Tampa', 'FL'],
  ['Nashville', 'TN'], ['Salt Lake City', 'UT'],
];
const SITE_TYPES: Site['siteType'][] = ['OFFICE', 'RETAIL', 'WAREHOUSE', 'RESIDENTIAL', 'INDUSTRIAL', 'HEALTHCARE'];
const SITE_LABELS = ['HQ Campus', 'North Branch', 'Distribution Hub', 'Downtown Location', 'Annex Building', 'Main Facility', 'West Wing', 'Service Center'];

export const sites: Site[] = [];
let siteCounter = 1;
customers.forEach((cust) => {
  const numSites = randInt(1, 2);
  for (let i = 0; i < numSites; i++) {
    const [city, state] = pick(CITY_STATE);
    const site: Site = {
      id: uid('SITE', siteCounter),
      customerId: cust.id,
      name: `${cust.name.split(' ')[0]} ${pick(SITE_LABELS)}`,
      addressLine: `${randInt(100, 9900)} ${pick(['Alder', 'Birch', 'Commerce', 'Industrial', 'Harbor', 'Grove', 'Century'])} ${pick(['St', 'Ave', 'Blvd', 'Way'])}`,
      city,
      state,
      postalCode: String(randInt(10000, 99999)),
      contactName: pick(['Sam Okafor', 'Lena Brooks', 'Devon Marsh', 'Ivy Chen', 'Owen Hart']),
      contactPhone: `(${randInt(200, 999)}) 555-${String(randInt(1000, 9999))}`,
      squareFootage: randInt(2000, 120000),
      siteType: pick(SITE_TYPES),
    };
    sites.push(site);
    cust.siteIds.push(site.id);
    siteCounter++;
  }
});
// Ensure at least 25 sites — top up if needed
while (sites.length < 25) {
  const cust = pick(customers);
  const [city, state] = pick(CITY_STATE);
  const site: Site = {
    id: uid('SITE', siteCounter),
    customerId: cust.id,
    name: `${cust.name.split(' ')[0]} ${pick(SITE_LABELS)}`,
    addressLine: `${randInt(100, 9900)} ${pick(['Alder', 'Birch', 'Commerce'])} St`,
    city, state,
    postalCode: String(randInt(10000, 99999)),
    contactName: pick(['Sam Okafor', 'Lena Brooks', 'Devon Marsh']),
    contactPhone: `(${randInt(200, 999)}) 555-${String(randInt(1000, 9999))}`,
    squareFootage: randInt(2000, 120000),
    siteType: pick(SITE_TYPES),
  };
  sites.push(site);
  cust.siteIds.push(site.id);
  siteCounter++;
}

// ----------------------------------------------------------------------------
// Technicians — exactly 10
// ----------------------------------------------------------------------------

const TECH_NAMES = [
  'Marcus Bell', 'Renee Osei', 'Kyle Fenwick', 'Anita Roy', 'Diego Salas',
  'Hannah Wu', 'Ty Jacobs', 'Fatima Noor', 'Cole Hendricks', 'Maya Petrov',
];
const SKILL_POOL: WorkOrderCategory[] = ['HVAC', 'ELECTRICAL', 'PLUMBING', 'GENERAL_MAINTENANCE', 'JANITORIAL', 'SECURITY_SYSTEMS', 'LANDSCAPING', 'PEST_CONTROL'];

export const technicians: Technician[] = TECH_NAMES.map((name, i) => ({
  id: uid('TECH', i + 1),
  name,
  avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  skills: Array.from(new Set([pick(SKILL_POOL), pick(SKILL_POOL), pick(SKILL_POOL)])),
  status: pick(['AVAILABLE', 'AVAILABLE', 'ON_JOB', 'ON_JOB', 'ON_BREAK', 'OFF_DUTY'] as const),
  phone: `(${randInt(200, 999)}) 555-${String(randInt(1000, 9999))}`,
  activeWorkOrderIds: [],
  rating: Math.round((3.5 + rand() * 1.5) * 10) / 10,
  region: pick(CITY_STATE)[0],
}));

// ----------------------------------------------------------------------------
// Inventory
// ----------------------------------------------------------------------------

export const inventory: InventoryItem[] = [
  { id: 'INV-001', name: 'HVAC Air Filter (20x25)', sku: 'HVAC-AF-2025', unitCost: 18.5, quantityOnHand: 140, category: 'HVAC' },
  { id: 'INV-002', name: 'Refrigerant R-410A (lb)', sku: 'HVAC-RF-410', unitCost: 32.0, quantityOnHand: 85, category: 'HVAC' },
  { id: 'INV-003', name: 'Circuit Breaker 20A', sku: 'ELEC-CB-20', unitCost: 14.25, quantityOnHand: 60, category: 'ELECTRICAL' },
  { id: 'INV-004', name: 'LED Panel Light 2x4', sku: 'ELEC-LED-24', unitCost: 42.0, quantityOnHand: 48, category: 'ELECTRICAL' },
  { id: 'INV-005', name: 'PVC Pipe 1in (10ft)', sku: 'PLMB-PVC-10', unitCost: 9.75, quantityOnHand: 210, category: 'PLUMBING' },
  { id: 'INV-006', name: 'Ball Valve 1in Brass', sku: 'PLMB-BV-01', unitCost: 21.5, quantityOnHand: 76, category: 'PLUMBING' },
  { id: 'INV-007', name: 'Caulk Sealant Tube', sku: 'GEN-CLK-01', unitCost: 6.4, quantityOnHand: 300, category: 'GENERAL_MAINTENANCE' },
  { id: 'INV-008', name: 'Commercial Floor Wax (gal)', sku: 'JAN-WAX-01', unitCost: 24.0, quantityOnHand: 55, category: 'JANITORIAL' },
  { id: 'INV-009', name: 'Door Access Reader', sku: 'SEC-ACR-01', unitCost: 165.0, quantityOnHand: 22, category: 'SECURITY_SYSTEMS' },
  { id: 'INV-010', name: 'CCTV Camera Dome', sku: 'SEC-CAM-01', unitCost: 210.0, quantityOnHand: 18, category: 'SECURITY_SYSTEMS' },
  { id: 'INV-011', name: 'Sprinkler Head Adjustable', sku: 'LAND-SPK-01', unitCost: 11.0, quantityOnHand: 130, category: 'LANDSCAPING' },
  { id: 'INV-012', name: 'Rodent Bait Station', sku: 'PEST-BAIT-01', unitCost: 15.75, quantityOnHand: 90, category: 'PEST_CONTROL' },
];

// ----------------------------------------------------------------------------
// Work Orders — 40+, spread across statuses / priorities
// ----------------------------------------------------------------------------

const STATUSES: WorkOrderStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED', 'CANCELLED'];
const PRIORITIES: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const CATEGORIES: WorkOrderCategory[] = SKILL_POOL;

export const SLA_TARGET_HOURS: Record<Priority, number> = {
  CRITICAL: 4,
  HIGH: 24,
  MEDIUM: 72,
  LOW: 168,
};

const TITLE_TEMPLATES: Record<WorkOrderCategory, string[]> = {
  HVAC: ['Rooftop unit not cooling', 'Thermostat calibration request', 'Air handler making loud noise', 'HVAC filter replacement overdue', 'Compressor short-cycling'],
  ELECTRICAL: ['Breaker tripping repeatedly', 'Flickering lights in lobby', 'Outlet not receiving power', 'Emergency lighting inspection', 'Panel upgrade assessment'],
  PLUMBING: ['Restroom sink leaking', 'Water heater no hot water', 'Clogged main drain line', 'Low water pressure complaint', 'Pipe burst in utility room'],
  GENERAL_MAINTENANCE: ['Ceiling tile water damage', 'Door closer malfunction', 'Parking lot pothole repair', 'Broken window latch', 'General facility walkthrough'],
  JANITORIAL: ['Deep clean requested post-event', 'Floor stripping and waxing', 'Restroom supply restock', 'Carpet stain treatment', 'Window washing exterior'],
  SECURITY_SYSTEMS: ['Access badge reader offline', 'CCTV camera feed down', 'Alarm panel false triggers', 'Door lock malfunction', 'Security system inspection'],
  LANDSCAPING: ['Irrigation system leak', 'Storm debris cleanup', 'Seasonal tree trimming', 'Sprinkler zone not activating', 'Lawn treatment request'],
  PEST_CONTROL: ['Rodent activity reported', 'Ant infestation in break room', 'Quarterly pest inspection', 'Wasp nest removal', 'Bait station service'],
};

function buildStatusHistory(createdAt: string, finalStatus: WorkOrderStatus, assignedTech?: Technician): StatusHistory[] {
  const history: StatusHistory[] = [];
  let t = new Date(createdAt).getTime();
  const push = (from: WorkOrderStatus | null, to: WorkOrderStatus, actor: string, role: StatusHistory['changedByRole'], notes?: string, hOffset = randInt(1, 8)) => {
    t += hOffset * 3600 * 1000;
    history.push({
      id: `SH-${history.length}-${Math.floor(t)}`,
      fromStatus: from,
      toStatus: to,
      changedBy: actor,
      changedByRole: role,
      timestamp: new Date(t).toISOString(),
      notes,
    });
  };

  push(null, 'NEW', 'System', 'CUSTOMER', 'Work request submitted.');
  if (finalStatus === 'CANCELLED' && rand() > 0.5) {
    push('NEW', 'CANCELLED', 'Priya Anand', 'DISPATCHER', 'Duplicate request — cancelled.');
    return history;
  }
  push('NEW', 'ASSIGNED', 'Priya Anand', 'DISPATCHER', assignedTech ? `Assigned to ${assignedTech.name}.` : 'Assigned to technician.');
  if (finalStatus === 'ASSIGNED') return history;
  if (finalStatus === 'CANCELLED') {
    push('ASSIGNED', 'CANCELLED', 'Priya Anand', 'DISPATCHER', 'Cancelled at customer request.');
    return history;
  }
  push('ASSIGNED', 'IN_PROGRESS', assignedTech?.name ?? 'Technician', 'TECHNICIAN', 'Started work on site.');
  if (finalStatus === 'IN_PROGRESS') return history;
  if (finalStatus === 'ON_HOLD') {
    push('IN_PROGRESS', 'ON_HOLD', assignedTech?.name ?? 'Technician', 'TECHNICIAN', 'Waiting on parts delivery.');
    return history;
  }
  push('IN_PROGRESS', 'COMPLETED', assignedTech?.name ?? 'Technician', 'TECHNICIAN', 'Job completed on site.');
  if (finalStatus === 'COMPLETED') return history;
  push('COMPLETED', 'CLOSED', 'Dana Cho', 'MANAGER', 'Verified and closed out.');
  return history;
}

export const workOrders: WorkOrder[] = [];
let woCounter = 1000;

// Ensure coverage: for each status x at least a few, then fill up to 42+
const forcedCombos: { status: WorkOrderStatus; priority: Priority }[] = [];
STATUSES.forEach((s) => PRIORITIES.forEach((p) => forcedCombos.push({ status: s, priority: p })));
// 28 forced combos already covers all 7 statuses x 4 priorities once each; add more variety after.

function makeWorkOrder(status: WorkOrderStatus, priority: Priority): WorkOrder {
  const category = pick(CATEGORIES);
  const customer = pick(customers);
  const customerSites = sites.filter((s) => s.customerId === customer.id);
  const site = customerSites.length ? pick(customerSites) : pick(sites);
  const createdDaysAgo = randInt(1, 45);
  const createdAt = daysAgoIso(createdDaysAgo);
  const needsTech = status !== 'NEW' && status !== 'CANCELLED';
  const assignedTech = needsTech || rand() > 0.4 ? pick(technicians) : undefined;
  const history = buildStatusHistory(createdAt, status, assignedTech);
  const lastEvent = history[history.length - 1];

  const targetHours = SLA_TARGET_HOURS[priority];
  const dueAt = new Date(new Date(createdAt).getTime() + targetHours * 3600 * 1000).toISOString();

  const parts: PartUsage[] = [];
  if (['IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED'].includes(status) && rand() > 0.35) {
    const numParts = randInt(1, 3);
    for (let i = 0; i < numParts; i++) {
      const item = pick(inventory.filter((it) => it.category === category)) ?? pick(inventory);
      parts.push({
        id: `PU-${woCounter}-${i}`,
        inventoryItemId: item.id,
        itemName: item.name,
        quantity: randInt(1, 4),
        unitCost: item.unitCost,
        loggedBy: assignedTech?.name ?? 'Technician',
        timestamp: lastEvent.timestamp,
      });
    }
  }

  const timeLogs: TimeLog[] = [];
  if (['IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED'].includes(status) && assignedTech) {
    const numLogs = randInt(1, 2);
    for (let i = 0; i < numLogs; i++) {
      timeLogs.push({
        id: `TL-${woCounter}-${i}`,
        technicianId: assignedTech.id,
        technicianName: assignedTech.name,
        minutes: randInt(20, 180),
        description: pick(['Diagnostics and inspection', 'Repair and part replacement', 'Testing and verification', 'Travel and setup', 'Final walkthrough with site contact']),
        timestamp: lastEvent.timestamp,
      });
    }
  }

  if (assignedTech && (status === 'ASSIGNED' || status === 'IN_PROGRESS' || status === 'ON_HOLD')) {
    assignedTech.activeWorkOrderIds.push(uid('WO', woCounter));
  }

  const wo: WorkOrder = {
    id: uid('WO', woCounter),
    code: `WO-${woCounter}`,
    title: pick(TITLE_TEMPLATES[category]),
    description: `${pick(['Site contact reports', 'Routine inspection flagged', 'Facilities team escalated', 'Tenant submitted request regarding'])} an issue related to ${category.toLowerCase().replace('_', ' ')} at ${site?.name ?? 'the site'}. ${pick(['Requires on-site diagnostics.', 'Parts may be needed to complete repair.', 'Please prioritize given site occupancy.', 'Follow standard safety protocol on arrival.'])}`,
    category,
    customerId: customer.id,
    siteId: site?.id ?? sites[0].id,
    status,
    priority,
    assignedTechnicianId: assignedTech?.id ?? null,
    createdAt,
    updatedAt: lastEvent.timestamp,
    dueAt,
    completedAt: ['COMPLETED', 'CLOSED'].includes(status) ? lastEvent.timestamp : undefined,
    closedAt: status === 'CLOSED' ? lastEvent.timestamp : undefined,
    statusHistory: history,
    partsUsed: parts,
    timeLogs,
    raisedBy: rand() > 0.5 ? site?.contactName ?? customer.contactName : customer.contactName,
    requestedByCustomer: rand() > 0.4,
  };
  woCounter++;
  return wo;
}

forcedCombos.forEach(({ status, priority }) => workOrders.push(makeWorkOrder(status, priority)));
// Top up to 46 total for a fuller board, biased toward active statuses
const ACTIVE_BIAS: WorkOrderStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED'];
while (workOrders.length < 46) {
  workOrders.push(makeWorkOrder(pick(ACTIVE_BIAS), pick(PRIORITIES)));
}

// ----------------------------------------------------------------------------
// Demo users — one per role, plus a directory of alternates for the switcher
// ----------------------------------------------------------------------------

export const demoUsers: User[] = [
  { id: 'USR-1', name: 'Dana Cho', email: 'dana.cho@meridianfm.com', role: 'MANAGER', avatarColor: '#4338ca' },
  { id: 'USR-2', name: 'Priya Anand', email: 'priya.anand@meridianfm.com', role: 'DISPATCHER', avatarColor: '#0891b2' },
  { id: 'USR-3', name: technicians[0].name, email: 'marcus.bell@meridianfm.com', role: 'TECHNICIAN', avatarColor: technicians[0].avatarColor, technicianId: technicians[0].id },
  { id: 'USR-4', name: customers[0].contactName, email: customers[0].contactEmail, role: 'CUSTOMER', avatarColor: '#be185d', customerId: customers[0].id },
];

export function getCustomer(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}
export function getSite(id: string): Site | undefined {
  return sites.find((s) => s.id === id);
}
export function getTechnician(id: string | null): Technician | undefined {
  if (!id) return undefined;
  return technicians.find((t) => t.id === id);
}
