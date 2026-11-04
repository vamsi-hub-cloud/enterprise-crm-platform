import { useAppDispatch, useToast } from '@/store/hooks';
import { customersSlice } from '@/store/slices/entities';
import { useForm } from '@/hooks/useForm';
import { validateCustomer } from '@/lib/validators';
import { todayISO, uid } from '@/lib/format';
import { TIERS, type Customer } from '@/types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Fields';
import { ownerOptions, type FormProps } from './shared';

function Inner({ onClose, initial }: Omit<FormProps<Customer>, 'open'>) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { values: v, errors: e, set, handle } = useForm({
    name: initial?.name ?? '', company: initial?.company ?? '', email: initial?.email ?? '', phone: initial?.phone ?? '',
    industry: initial?.industry ?? '', city: initial?.city ?? '', tier: initial?.tier ?? 'Growth',
    revenue: String(initial?.revenue ?? 0), owner: initial?.owner ?? 'u1', notes: initial?.notes ?? '',
  }, validateCustomer);

  const submit = handle((x) => {
    const c: Customer = {
      id: initial?.id ?? uid(), since: initial?.since ?? todayISO(),
      name: x.name.trim(), company: x.company.trim(), email: x.email.trim(), phone: x.phone.trim(),
      industry: x.industry.trim() || 'General', city: x.city.trim(), tier: x.tier as Customer['tier'],
      revenue: Number(x.revenue), owner: x.owner, notes: x.notes.trim(),
    };
    dispatch(initial ? customersSlice.actions.updated(c) : customersSlice.actions.added(c));
    toast(initial ? `${c.company} updated` : `${c.company} added to customers`);
    onClose();
  });

  return (
    <Modal title={initial ? 'Edit customer' : 'New customer'} onClose={onClose} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="customer-form">{initial ? 'Save changes' : 'Add customer'}</Button></>}>
      <form id="customer-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="Contact name" value={v.name} onChange={set('name')} error={e.name} autoFocus />
        <Input label="Company" value={v.company} onChange={set('company')} error={e.company} />
        <Input label="Email" type="email" value={v.email} onChange={set('email')} error={e.email} />
        <Input label="Phone" value={v.phone} onChange={set('phone')} error={e.phone} />
        <Input label="Industry" value={v.industry} onChange={set('industry')} />
        <Input label="City" value={v.city} onChange={set('city')} error={e.city} />
        <Select label="Tier" value={v.tier} onChange={set('tier')} options={[...TIERS]} />
        <Input label="Lifetime revenue (USD)" type="number" min="0" value={v.revenue} onChange={set('revenue')} error={e.revenue} />
        <Select label="Account owner" value={v.owner} onChange={set('owner')} options={ownerOptions} className="sm:col-span-2" />
        <Textarea label="Notes" className="sm:col-span-2" value={v.notes} onChange={set('notes')} />
      </form>
    </Modal>
  );
}
export default function CustomerForm({ open, ...rest }: FormProps<Customer>) { return open ? <Inner key={rest.initial?.id ?? 'new'} {...rest} /> : null; }
