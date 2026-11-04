import { useAppDispatch, useToast } from '@/store/hooks';
import { leadsSlice } from '@/store/slices/entities';
import { useForm } from '@/hooks/useForm';
import { validateLead } from '@/lib/validators';
import { todayISO, uid } from '@/lib/format';
import { LEAD_SOURCES, LEAD_STATUSES, type Lead } from '@/types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Fields';
import { ownerOptions, type FormProps } from './shared';

function Inner({ onClose, initial }: Omit<FormProps<Lead>, 'open'>) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { values: v, errors: e, set, handle } = useForm({
    name: initial?.name ?? '', company: initial?.company ?? '', email: initial?.email ?? '', phone: initial?.phone ?? '',
    source: initial?.source ?? 'Website', status: initial?.status ?? 'New', value: String(initial?.value ?? ''),
    owner: initial?.owner ?? 'u1', notes: initial?.notes ?? '',
  }, validateLead);

  const submit = handle((x) => {
    const lead: Lead = {
      id: initial?.id ?? uid(), createdAt: initial?.createdAt ?? todayISO(),
      name: x.name.trim(), company: x.company.trim(), email: x.email.trim(), phone: x.phone.trim(),
      source: x.source as Lead['source'], status: x.status as Lead['status'], value: Number(x.value), owner: x.owner, notes: x.notes.trim(),
    };
    dispatch(initial ? leadsSlice.actions.updated(lead) : leadsSlice.actions.added(lead));
    toast(initial ? `${lead.name} updated` : `${lead.name} added to leads`);
    onClose();
  });

  return (
    <Modal title={initial ? 'Edit lead' : 'New lead'} subtitle="Capture who they are and how likely they are to buy." onClose={onClose} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="lead-form">{initial ? 'Save changes' : 'Add lead'}</Button></>}>
      <form id="lead-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" value={v.name} onChange={set('name')} error={e.name} autoFocus />
        <Input label="Company" value={v.company} onChange={set('company')} error={e.company} />
        <Input label="Email" type="email" value={v.email} onChange={set('email')} error={e.email} />
        <Input label="Phone" value={v.phone} onChange={set('phone')} error={e.phone} placeholder="+1 555 0100" />
        <Select label="Source" value={v.source} onChange={set('source')} options={[...LEAD_SOURCES]} />
        <Select label="Status" value={v.status} onChange={set('status')} options={[...LEAD_STATUSES]} />
        <Input label="Estimated value (USD)" type="number" min="0" value={v.value} onChange={set('value')} error={e.value} />
        <Select label="Owner" value={v.owner} onChange={set('owner')} options={ownerOptions} />
        <Textarea label="Notes" className="sm:col-span-2" value={v.notes} onChange={set('notes')} />
      </form>
    </Modal>
  );
}
export default function LeadForm({ open, ...rest }: FormProps<Lead>) { return open ? <Inner key={rest.initial?.id ?? 'new'} {...rest} /> : null; }
