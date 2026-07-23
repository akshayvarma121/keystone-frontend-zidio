import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Building2, MapPin, ChevronRight, Mail, Phone } from 'lucide-react';
import * as api from '../../services/api';
import { Modal } from '../common/Modal';
import { DataTable, type Column } from '../common/DataTable';
import type { Customer, Site } from '../../types';

const TIERS = ['STANDARD', 'PRIORITY', 'ENTERPRISE'] as const;
const SITE_TYPES = ['OFFICE', 'RETAIL', 'WAREHOUSE', 'RESIDENTIAL', 'INDUSTRIAL', 'HEALTHCARE'] as const;

const customerSchema = z.object({
  name: z.string().min(2, 'Enter a company name.'),
  tier: z.enum(TIERS),
  accountManager: z.string().min(2, 'Enter an account manager name.'),
  contactName: z.string().min(2, 'Enter a contact name.'),
  contactEmail: z.string().email('Enter a valid email.'),
  contactPhone: z.string().min(7, 'Enter a valid phone number.'),
});
type CustomerFormValues = z.infer<typeof customerSchema>;

const siteSchema = z.object({
  name: z.string().min(2, 'Enter a site name.'),
  addressLine: z.string().min(3, 'Enter a street address.'),
  city: z.string().min(2, 'Enter a city.'),
  state: z.string().min(2, 'Enter a state.'),
  postalCode: z.string().min(4, 'Enter a postal code.'),
  siteType: z.enum(SITE_TYPES),
  squareFootage: z.coerce.number().min(100, 'Enter square footage.'),
  contactName: z.string().min(2, 'Enter a site contact.'),
  contactPhone: z.string().min(7, 'Enter a valid phone number.'),
});
type SiteFormValues = z.infer<typeof siteSchema>;

export const CustomerSiteManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [newSiteOpen, setNewSiteOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery({ queryKey: ['customers'], queryFn: api.getCustomers });
  const { data: sites = [] } = useQuery({
    queryKey: ['sites', selectedCustomer?.id],
    queryFn: () => api.getSitesForCustomer(selectedCustomer!.id),
    enabled: !!selectedCustomer,
  });

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', tier: 'STANDARD', accountManager: '', contactName: '', contactEmail: '', contactPhone: '' },
  });
  const siteForm = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: { name: '', addressLine: '', city: '', state: '', postalCode: '', siteType: 'OFFICE', squareFootage: 5000, contactName: '', contactPhone: '' },
  });

  const createCustomerMutation = useMutation({
    mutationFn: (values: CustomerFormValues) => api.createCustomer(values),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      customerForm.reset();
      setNewCustomerOpen(false);
      setSelectedCustomer(created);
    },
  });

  const createSiteMutation = useMutation({
    mutationFn: (values: SiteFormValues) => api.createSite({ ...values, customerId: selectedCustomer!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', selectedCustomer?.id] });
      siteForm.reset();
      setNewSiteOpen(false);
    },
  });

  const customerColumns: Column<Customer>[] = [
    { key: 'name', header: 'Customer', render: (c) => <span className="font-medium text-slate-800 dark:text-slate-100">{c.name}</span> },
    { key: 'tier', header: 'Tier', render: (c) => (
      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${c.tier === 'ENTERPRISE' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : c.tier === 'PRIORITY' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{c.tier}</span>
    ) },
    { key: 'manager', header: 'Account Manager', render: (c) => c.accountManager },
    { key: 'sites', header: 'Sites', render: (c) => c.siteIds?.length ?? 0 },
    { key: 'contact', header: 'Contact', render: (c) => <span className="text-slate-500">{c.contactName}</span> },
    { key: 'action', header: '', render: () => <ChevronRight size={16} className="text-slate-300" /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">Customers & Sites</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{customers.length} customer accounts · {customers.reduce((s, c) => s + (c.siteIds?.length ?? 0), 0)} sites</p>
        </div>
        <button onClick={() => setNewCustomerOpen(true)} className="btn-primary">
          <Plus size={16} /> New customer
        </button>
      </div>

      <div className="card p-2">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 m-2" />
        ) : (
          <DataTable columns={customerColumns} rows={customers} keyExtractor={(c) => c.id} onRowClick={setSelectedCustomer} />
        )}
      </div>

      <Modal
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name ?? ''}
        subtitle="Mapped building sites for this account"
        size="lg"
        headerRight={
          <button onClick={() => setNewSiteOpen(true)} className="btn-secondary text-xs px-2.5 py-1.5">
            <Plus size={13} /> Add site
          </button>
        }
      >
        <div className="mb-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Mail size={12} /> {selectedCustomer?.contactEmail}</div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Phone size={12} /> {selectedCustomer?.contactPhone}</div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Building2 size={12} /> {selectedCustomer?.accountManager}</div>
        </div>
        <div className="flex flex-col gap-2">
          {sites.map((site: Site) => (
            <div key={site.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <div className="flex items-start justify-between">
                <p className="font-medium text-slate-800 dark:text-slate-100">{site.name}</p>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">{site.siteType}</span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><MapPin size={11} /> {site.addressLine}, {site.city}, {site.state} {site.postalCode}</p>
              <p className="mt-1 text-xs text-slate-400">{(site.squareFootage ?? 0).toLocaleString()} sq ft · Contact: {site.contactName}</p>
            </div>
          ))}
          {sites.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No sites mapped yet.</p>}
        </div>
      </Modal>

      <Modal open={newCustomerOpen} onClose={() => setNewCustomerOpen(false)} title="New customer account" size="md">
        <form onSubmit={customerForm.handleSubmit((v) => createCustomerMutation.mutate(v))} className="flex flex-col gap-3">
          <div>
            <label className="label">Company name</label>
            <input className="input" {...customerForm.register('name')} />
            {customerForm.formState.errors.name && <p className="mt-1 text-xs text-rose-500">{customerForm.formState.errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tier</label>
              <select className="input" {...customerForm.register('tier')}>
                {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Account manager</label>
              <input className="input" {...customerForm.register('accountManager')} />
            </div>
          </div>
          <div>
            <label className="label">Primary contact</label>
            <input className="input" {...customerForm.register('contactName')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Contact email</label>
              <input className="input" {...customerForm.register('contactEmail')} />
              {customerForm.formState.errors.contactEmail && <p className="mt-1 text-xs text-rose-500">{customerForm.formState.errors.contactEmail.message}</p>}
            </div>
            <div>
              <label className="label">Contact phone</label>
              <input className="input" {...customerForm.register('contactPhone')} />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
            <button type="button" className="btn-secondary" onClick={() => setNewCustomerOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={createCustomerMutation.isPending}>Create customer</button>
          </div>
        </form>
      </Modal>

      <Modal open={newSiteOpen} onClose={() => setNewSiteOpen(false)} title={`Add a site to ${selectedCustomer?.name ?? ''}`} size="md">
        <form onSubmit={siteForm.handleSubmit((v) => createSiteMutation.mutate(v))} className="flex flex-col gap-3">
          <div>
            <label className="label">Site name</label>
            <input className="input" {...siteForm.register('name')} />
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" {...siteForm.register('addressLine')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input className="input" placeholder="City" {...siteForm.register('city')} />
            <input className="input" placeholder="State" {...siteForm.register('state')} />
            <input className="input" placeholder="ZIP" {...siteForm.register('postalCode')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Site type</label>
              <select className="input" {...siteForm.register('siteType')}>
                {SITE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Square footage</label>
              <input type="number" className="input" {...siteForm.register('squareFootage')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Site contact" {...siteForm.register('contactName')} />
            <input className="input" placeholder="Contact phone" {...siteForm.register('contactPhone')} />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
            <button type="button" className="btn-secondary" onClick={() => setNewSiteOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={createSiteMutation.isPending}>Add site</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
