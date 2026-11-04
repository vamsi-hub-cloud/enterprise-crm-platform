import { useAppDispatch, useAppSelector, useToast } from '@/store/hooks';
import { dealsSlice } from '@/store/slices/entities';
import { useForm } from '@/hooks/useForm';
import { validateDeal } from '@/lib/validators';
import { addDays, toISO, uid } from '@/lib/format';
import { stageProb } from '@/lib/meta';
import { DEAL_STAGES, type Deal } from '@/types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Select } from '../ui/Fields';
import { ownerOptions, type FormProps } from './shared';

function Inner({ onClose, initial, stage }: Omit<FormProps<Deal>, 'open'> & { stage?: Deal['stage'] }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const customers = useAppSelector((s) => s.customers.items);
  const { values: v, errors: er, set, handle } = useForm({
    title: initial?.title ?? '', company: initial?.company ?? '', customerId: initial?.customerId ?? '',
    stage: initial?.stage ?? stage ?? 'Prospecting', value: String(initial?.value ?? ''),
    closeDate: initial?.closeDate ?? toISO(addDays(new Date(), 30)), owner: initial?.owner ?? 'u1',
  }, validateDeal);

  const submit = handle((x) => {
    const st = x.stage as Deal['stage'];
    const d: Deal = {
      id: initial?.id ?? uid(), title: x.title.trim(), company: x.company.trim(), customerId: x.customerId || undefined,
      stage: st, value: Number(x.value), probability: st === initial?.stage ? initial.probability : stageProb[st],
      closeDate: x.closeDate, owner: x.owner,
    };
    dispatch(initial ? dealsSlice.actions.updated(d) : dealsSlice.actions.added(d));
    toast(initial ? 'Deal updated' : `${d.title} added to the pipeline`);
    onClose();
  });
  const pick = (e: React.ChangeEvent<HTMLSelectElement>) => {
    set('customerId')(e);
    const c = customers.find((x) => x.id === e.target.value);
    if (c && !v.company) set('company')({ target: { value: c.company } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Modal title={initial ? 'Edit deal' : 'New deal'} onClose={onClose} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="deal-form">{initial ? 'Save changes' : 'Add deal'}</Button></>}>
      <form id="deal-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="Deal name" className="sm:col-span-2" value={v.title} onChange={set('title')} error={er.title} autoFocus />
        <Select label="Customer (optional)" value={v.customerId} onChange={pick} options={[{ value: '', label: 'Not linked' }, ...customers.map((c) => ({ value: c.id, label: c.company }))]} />
        <Input label="Company" value={v.company} onChange={set('company')} error={er.company} />
        <Select label="Stage" value={v.stage} onChange={set('stage')} options={[...DEAL_STAGES]} />
        <Input label="Deal value (USD)" type="number" min="0" value={v.value} onChange={set('value')} error={er.value} />
        <Input label="Expected close date" type="date" value={v.closeDate} onChange={set('closeDate')} error={er.closeDate} />
        <Select label="Owner" value={v.owner} onChange={set('owner')} options={ownerOptions} />
      </form>
    </Modal>
  );
}
export default function DealForm({ open, stage, ...rest }: FormProps<Deal> & { stage?: Deal['stage'] }) { return open ? <Inner key={rest.initial?.id ?? 'new'} stage={stage} {...rest} /> : null; }
