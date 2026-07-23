import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../common/Modal';
import * as api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Priority, WorkOrderCategory } from '../../types';

const CATEGORIES: WorkOrderCategory[] = [
  'HVAC', 'ELECTRICAL', 'PLUMBING', 'GENERAL_MAINTENANCE', 'JANITORIAL', 'SECURITY_SYSTEMS', 'LANDSCAPING', 'PEST_CONTROL',
];
const PRIORITIES: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const schema = z.object({
  title: z.string().min(5, 'Give the job a short, specific title (5+ characters).'),
  description: z.string().min(15, 'Add a bit more detail (15+ characters) so a technician knows what to expect.'),
  category: z.enum(['HVAC', 'ELECTRICAL', 'PLUMBING', 'GENERAL_MAINTENANCE', 'JANITORIAL', 'SECURITY_SYSTEMS', 'LANDSCAPING', 'PEST_CONTROL']),
  customerId: z.string().min(1, 'Select a customer.'),
  siteId: z.string().min(1, 'Select a site.'),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Customer portal locks the customer to the signed-in account. */
  lockCustomer?: boolean;
}

export const WorkOrderFormModal: React.FC<Props> = ({ open, onClose, lockCustomer }) => {
  const { user } = useAuth();
  const customer = { id: user.customerId ?? '', name: user.name };
  const lockedCustomer = user.role === 'CUSTOMER' ? customer : null;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: 'GENERAL_MAINTENANCE',
      customerId: lockedCustomer?.id ?? '',
      siteId: '',
      priority: 'MEDIUM',
    },
  });

  const selectedCustomerId = watch('customerId');

  const { data: customerList = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: api.getCustomers,
  });

  const { data: siteList = [] } = useQuery({
    queryKey: ['all-sites'],
    queryFn: api.getAllSites,
  });

  const displayCustomers = useMemo(() => {
    if (customerList.length > 0) return customerList;
    return [{ id: '11111111-1111-1111-1111-111111111111', name: 'Acme Corp' }];
  }, [customerList]);

  const availableSites = useMemo(() => {
    const list = siteList.length > 0 ? siteList : [
      { id: '22222222-2222-2222-2222-222222222221', customerId: '11111111-1111-1111-1111-111111111111', name: 'Acme HQ', city: 'Metropolis' },
      { id: '22222222-2222-2222-2222-222222222222', customerId: '11111111-1111-1111-1111-111111111111', name: 'Acme Warehouse', city: 'Industrial Zone' }
    ];
    if (!selectedCustomerId) return list;
    return list.filter((s) => s.customerId === selectedCustomerId);
  }, [siteList, selectedCustomerId]);

  const siteId = watch('siteId');
  const site = useMemo(() => {
    return availableSites.find((s) => s.id === siteId);
  }, [availableSites, siteId]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      return api.createWorkOrder({
        ...values,
        raisedBy: lockedCustomer ? user.name : (site as any)?.contactName ?? user.name,
        requestedByCustomer: !!lockedCustomer,
        actorName: user.name,
        actorRole: user.role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      reset();
      onClose();
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <Modal open={open} onClose={onClose} title="Raise a new work order" subtitle="Describe the issue and we'll route it to the right technician." size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" className="input" placeholder="e.g. Rooftop HVAC unit not cooling" {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" className="input min-h-[90px] resize-y" placeholder="What's happening, where, and since when?" {...register('description')} />
          {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" className="input" {...register('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="priority">Priority</label>
            <select id="priority" className="input" {...register('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="customerId">Customer</label>
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <select
                  id="customerId"
                  className="input disabled:bg-slate-50 dark:disabled:bg-slate-800/60 disabled:text-slate-400"
                  disabled={!!lockedCustomer}
                  {...field}
                >
                  <option value="">Select customer…</option>
                  {displayCustomers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            />
            {errors.customerId && <p className="mt-1 text-xs text-rose-500">{errors.customerId.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="siteId">Site</label>
            <select id="siteId" className="input" disabled={!selectedCustomerId} {...register('siteId')}>
              <option value="">Select site…</option>
              {availableSites.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} — {s.city || 'Default'}</option>
              ))}
            </select>
            {errors.siteId && <p className="mt-1 text-xs text-rose-500">{errors.siteId.message}</p>}
          </div>
        </div>

        {mutation.isError && (
          <p className="rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
            {(mutation.error as Error).message}
          </p>
        )}

        <div className="mt-1 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? 'Submitting…' : 'Submit request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
